"""
REST API endpoints for monitoring SIEM status, reviewing alert history,
and sending test notifications to external SOC destinations.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.spool_routes import _verify_operator_auth
from app.siem.dispatcher import alert_dispatcher

siem_router = APIRouter(prefix="/api/siem", tags=["siem"])


class SiemTestRequest(BaseModel):
    """Payload to trigger synthetic incident alert verification."""

    title: str = Field(default="Test Security Incident", description="Alert headline")
    severity: str = Field(default="critical", description="Incident severity level")
    mitre_attack_id: str = Field(default="T1557.002", description="ATT&CK technique identifier")
    description: str = Field(
        default="Synthetic validation of ArcSight CEF and Syslog delivery pipeline.",
        description="Detailed incident narrative",
    )


@siem_router.get("/status")
async def get_siem_status() -> dict[str, Any]:
    """Return operational configuration and forwarding metrics for SIEM subsystems."""
    return alert_dispatcher.get_status()


@siem_router.get("/history")
async def get_siem_history() -> list[dict[str, Any]]:
    """Return rolling audit log of recent security alert dispatches."""
    return alert_dispatcher.get_history()


@siem_router.post("/test")
async def send_test_alert(
    req: SiemTestRequest,
    _auth: None = Depends(_verify_operator_auth),
) -> dict[str, Any]:
    """Dispatch synthetic test alert across all active SIEM channels for SOC verification."""
    synthetic_alert = {
        "title": req.title,
        "severity": req.severity,
        "mitre_attack_id": req.mitre_attack_id,
        "description": req.description,
        "src_ip": "10.0.0.99",
        "src_port": 587,
        "dst_ip": "10.0.0.1",
        "dst_port": 25,
        "protocol": "SMTP",
    }
    result = await alert_dispatcher.dispatch_wire_alert(synthetic_alert)
    return {
        "status": "dispatched",
        "alert": result,
    }
