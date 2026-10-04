"""
Security validation tests for live TAP endpoints: operator authentication and path traversal protection.
"""

from __future__ import annotations

import httpx
import pytest

from app.config import settings
from app.daemon.live_tap_daemon import LiveTapDaemon
from app.main import app


@pytest.mark.asyncio
async def test_replay_path_traversal_protection():
    """Verify that path traversal attempts in replay PCAP name are rejected."""
    daemon = LiveTapDaemon()
    daemon.stop()
    result = await daemon.start_replay(pcap_name="../../outside.pcap")
    assert result is False
    assert "Replay PCAP not found" in (daemon.error_message or "")


@pytest.mark.asyncio
async def test_tap_operator_auth_enforcement():
    """Verify mutating TAP routes reject unauthenticated requests when operator key is set."""
    old_key = settings.operator_api_key
    try:
        settings.operator_api_key = "secure-operator-key-123"
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            # Unauthorized request should receive 401
            resp_unauth = await client.post("/api/tap/stop")
            assert resp_unauth.status_code == 401

            # Authorized request with X-API-Key should succeed
            resp_auth = await client.post("/api/tap/stop", headers={"X-API-Key": "secure-operator-key-123"})
            assert resp_auth.status_code == 200
    finally:
        settings.operator_api_key = old_key
