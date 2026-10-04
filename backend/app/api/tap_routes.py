"""
REST API endpoints for network TAP interface discovery, live capture control, and snapshotting.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from scapy.all import IFACES

from app.api.spool_routes import _verify_operator_auth
from app.config import settings
from app.daemon.live_tap_daemon import live_tap_daemon

logger = logging.getLogger("securemailscope.tap")

tap_router = APIRouter(prefix="/tap", tags=["Live TAP Telemetry"])


class TapStartRequest(BaseModel):
    interface: str | None = Field(default=None, description="Network interface name or ID")
    bpf_filter: str | None = Field(default=None, description="Custom BPF filter expression")


class ReplayStartRequest(BaseModel):
    pcap_name: str = Field(default="02_striptls_mitm_attack.pcap", description="PCAP file to replay")
    speed_pps: float = Field(default=8.0, ge=0.5, le=100.0, description="Packets per second")


class SnapshotRequest(BaseModel):
    label: str = Field(default="Live TAP Wire Capture", description="Audit label for snapshot run")


@tap_router.get("/status")
async def get_tap_status() -> dict[str, Any]:
    """Return real-time state, packet counters, and PPS for the TAP sensor."""
    return live_tap_daemon.get_status()


@tap_router.get("/interfaces")
async def list_interfaces() -> list[dict[str, Any]]:
    """List available network interfaces on the host/container."""
    interfaces = []
    try:
        for iface_key, iface_obj in IFACES.items():
            name = getattr(iface_obj, "name", str(iface_key))
            desc = getattr(iface_obj, "description", "")
            ip = getattr(iface_obj, "ip", None) or "0.0.0.0"
            mac = getattr(iface_obj, "mac", None)
            interfaces.append(
                {
                    "id": str(iface_key),
                    "name": name,
                    "description": desc,
                    "ip": str(ip) if ip else None,
                    "mac": str(mac) if mac else None,
                }
            )
    except Exception as e:
        logger.warning(f"Error enumerating interfaces: {e}")

    # Ensure a fallback entry exists
    if not interfaces:
        interfaces.append({"id": "default", "name": "Default Network Interface", "description": "System Default"})

    return interfaces


@tap_router.get("/replays")
async def list_available_replays() -> list[dict[str, Any]]:
    """List available PCAP attack scenarios for simulated wire replay."""
    replays = []
    pcaps_dir = settings.test_pcaps_dir
    if pcaps_dir.exists():
        for p in pcaps_dir.glob("*.pcap"):
            replays.append(
                {
                    "filename": p.name,
                    "size_bytes": p.stat().st_size,
                }
            )
    return sorted(replays, key=lambda x: x["filename"])


@tap_router.post("/start")
async def start_live_tap(req: TapStartRequest, _auth: None = Depends(_verify_operator_auth)) -> dict[str, Any]:
    """Start passive wire capture on the specified interface."""
    success = live_tap_daemon.start_sniff(interface=req.interface, bpf_filter=req.bpf_filter)
    if not success:
        raise HTTPException(
            status_code=500,
            detail=live_tap_daemon.error_message or "Failed to start live TAP sniffer.",
        )
    return {
        "status": "started",
        "telemetry": live_tap_daemon.get_status(),
    }


@tap_router.post("/start-replay")
async def start_simulated_replay(
    req: ReplayStartRequest, _auth: None = Depends(_verify_operator_auth)
) -> dict[str, Any]:
    """Start simulated packet replay from a reference PCAP to test wire detection."""
    success = await live_tap_daemon.start_replay(pcap_name=req.pcap_name, speed_pps=req.speed_pps)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=live_tap_daemon.error_message or f"Failed to replay PCAP: {req.pcap_name}",
        )
    return {
        "status": "replaying",
        "scenario": req.pcap_name,
        "speed_pps": req.speed_pps,
        "telemetry": live_tap_daemon.get_status(),
    }


@tap_router.post("/stop")
async def stop_live_tap(_auth: None = Depends(_verify_operator_auth)) -> dict[str, Any]:
    """Stop active sniffing or replay."""
    await asyncio.to_thread(live_tap_daemon.stop)
    return {
        "status": "stopped",
        "telemetry": live_tap_daemon.get_status(),
    }


@tap_router.post("/snapshot")
async def snapshot_buffer(req: SnapshotRequest, _auth: None = Depends(_verify_operator_auth)) -> dict[str, Any]:
    """Snapshot the buffered wire packets and run immediate deep forensic analysis."""
    result = await asyncio.to_thread(live_tap_daemon.snapshot, label=req.label)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Snapshot failed."))
    return result
