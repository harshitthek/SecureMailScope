"""
API routes for monitoring and controlling the automated PCAP spool ingestion daemon.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.daemon.spool_daemon import spool_daemon

spool_router = APIRouter(prefix="/spool", tags=["Automated Spool Engine"])


class SpoolToggleRequest(BaseModel):
    action: str  # "start" or "stop"


@spool_router.get("/status")
async def get_spool_status() -> dict[str, Any]:
    """Retrieve operational telemetry, queue depth, and path metadata for the spool daemon."""
    return {
        "status": "success",
        "data": spool_daemon.get_status(),
    }


@spool_router.post("/process-now")
async def trigger_spool_sweep() -> dict[str, Any]:
    """Manually trigger an immediate sweep of the incoming capture spool directory."""
    newly_ingested = await spool_daemon.sweep_once()
    return {
        "status": "success",
        "ingested_count": len(newly_ingested),
        "cases": newly_ingested,
    }


@spool_router.get("/history")
async def get_spool_history() -> dict[str, Any]:
    """Retrieve chronologically ordered registry of autonomously ingested PCAP captures."""
    return {
        "status": "success",
        "total": len(spool_daemon.ingested_history),
        "history": spool_daemon.ingested_history,
    }


@spool_router.post("/toggle")
async def toggle_spool_daemon(req: SpoolToggleRequest) -> dict[str, Any]:
    """Start or stop the background spool watcher service."""
    if req.action == "start":
        spool_daemon.start()
        msg = "Spool daemon started"
    elif req.action == "stop":
        spool_daemon.stop()
        msg = "Spool daemon stopped"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'start' or 'stop'.")

    return {
        "status": "success",
        "message": msg,
        "is_running": spool_daemon.is_running,
    }
