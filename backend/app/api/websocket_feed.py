"""
WebSocket telemetry gateway streaming real-time network packets, alerts, and tap controls.
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.api.spool_routes import _verify_operator_auth
from app.daemon.live_tap_daemon import live_tap_daemon

logger = logging.getLogger("securemailscope.ws")

ws_router = APIRouter()


class TelemetryConnectionManager:
    """Manages active WebSocket client connections and broadcasts live telemetry frames."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []
        self._heartbeat_task: asyncio.Task | None = None
        self._loop: asyncio.AbstractEventLoop | None = None

        # Wire live tap daemon listener
        live_tap_daemon.register_listener(self._on_tap_event)

    def set_event_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        """Store the running event loop for thread-safe event dispatching."""
        self._loop = loop
        if self._heartbeat_task is None or self._heartbeat_task.done():
            self._heartbeat_task = loop.create_task(self._heartbeat_loop())

    async def connect(self, websocket: WebSocket) -> None:
        """Accept new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

        # Send initial status snapshot immediately
        status = live_tap_daemon.get_status()
        await websocket.send_json(
            {
                "type": "INITIAL_STATE",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data": status,
            }
        )

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove disconnected client."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Remaining clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast payload to all connected clients."""
        if not self.active_connections:
            return

        dead_connections: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

    def _on_tap_event(self, event_type: str, data: dict[str, Any]) -> None:
        """Callback invoked by LiveTapDaemon when packets or alerts occur."""
        if not self.active_connections:
            return

        message = {
            "type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        # Schedule async broadcast safely across threads
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self._loop)

    async def _heartbeat_loop(self) -> None:
        """Periodic 1Hz telemetry status broadcast."""
        while True:
            try:
                await asyncio.sleep(1.0)
                if self.active_connections:
                    status = live_tap_daemon.get_status()
                    await self.broadcast(
                        {
                            "type": "HEARTBEAT",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "data": status,
                        }
                    )
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"Heartbeat loop error: {e}")


ws_manager = TelemetryConnectionManager()


@ws_router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket, _auth: None = Depends(_verify_operator_auth)) -> None:
    """WebSocket endpoint streaming live packet activity, security alerts, and handling tap commands."""
    loop = asyncio.get_running_loop()
    ws_manager.set_event_loop(loop)
    await ws_manager.connect(websocket)

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
            except Exception:
                continue

            if not isinstance(msg, dict):
                continue

            action_raw = msg.get("action")
            if not isinstance(action_raw, str):
                continue
            action = action_raw.lower()

            if action == "ping":
                await websocket.send_json({"type": "PONG", "timestamp": datetime.now(timezone.utc).isoformat()})

            elif action == "start_tap":
                interface = msg.get("interface")
                success = live_tap_daemon.start_sniff(interface=interface)
                await websocket.send_json(
                    {
                        "type": "COMMAND_RESULT",
                        "command": "start_tap",
                        "success": success,
                        "status": live_tap_daemon.get_status(),
                    }
                )

            elif action == "start_replay":
                pcap_name = str(msg.get("pcap_name") or "02_striptls_mitm_attack.pcap")
                try:
                    speed = float(msg.get("speed", 8.0))
                    speed = max(0.5, min(100.0, speed))
                except (ValueError, TypeError):
                    speed = 8.0
                success = await live_tap_daemon.start_replay(pcap_name=pcap_name, speed_pps=speed)
                await websocket.send_json(
                    {
                        "type": "COMMAND_RESULT",
                        "command": "start_replay",
                        "success": success,
                        "status": live_tap_daemon.get_status(),
                    }
                )

            elif action == "stop_tap":
                await asyncio.to_thread(live_tap_daemon.stop)
                await websocket.send_json(
                    {
                        "type": "COMMAND_RESULT",
                        "command": "stop_tap",
                        "success": True,
                        "status": live_tap_daemon.get_status(),
                    }
                )

            elif action == "snapshot":
                label = str(msg.get("label") or "Live TAP Capture")
                result = await asyncio.to_thread(live_tap_daemon.snapshot, label=label)
                if result.get("success") and result.get("run_id"):
                    try:
                        from app.api.routes import _results
                        from app.db.repository import CaseRepository

                        analysis = _results.get(result["run_id"])
                        if analysis:
                            await CaseRepository.save_case(analysis, source="tap_snapshot")
                    except Exception as db_err:
                        logger.warning("Failed to persist TAP snapshot to database: %s", db_err)
                await websocket.send_json(
                    {
                        "type": "SNAPSHOT_RESULT",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "data": result,
                    }
                )

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.debug(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)
