"""
Unit and integration tests for ArcSight CEF serialization, RFC 5424 Syslog forwarding,
webhook incident dispatching, and SIEM REST endpoints.
"""

from __future__ import annotations

import os
from unittest.mock import patch

import httpx
import pytest

from app.config import AppSettings, settings
from app.main import app
from app.siem.cef_serializer import format_finding_cef, serialize_cef
from app.siem.syslog_forwarder import syslog_forwarder
from app.siem.webhook_dispatcher import webhook_dispatcher


def test_cef_serializer_and_crlf_sanitization():
    """Verify standard ArcSight CEF header structure and log injection prevention."""
    cef = serialize_cef(
        event_class_id="TEST_CLASS|INJECT",
        event_name="Evil\nName\r\nExploit",
        severity=10,
        extensions={"src": "192.168.1.5", "msg": "Test\nMessage=Bad"},
    )
    assert cef.startswith("CEF:0|NTRO|SecureMailScope|1.0.0|")
    assert "TEST_CLASS\\|INJECT" in cef
    assert "Evil Name Exploit" in cef
    assert "\n" not in cef
    assert "\r" not in cef
    assert "src=192.168.1.5" in cef
    assert "msg=Test Message\\=Bad" in cef


def test_finding_to_cef_mitre_mapping():
    """Verify security findings are mapped to MITRE ATT&CK techniques and cs4 case labels."""
    striptls_finding = {
        "title": "STRIPTLS Active Downgrade Attack",
        "severity": "critical",
        "mitre_attack_id": "T1557.002",
        "description": "Adversary in the Middle stripped 250-STARTTLS",
    }
    ctx = {"src_ip": "10.0.0.5", "dst_ip": "10.0.0.1", "case_code": "CASE-99"}
    cef_out = format_finding_cef(striptls_finding, context=ctx)
    assert "STRIPTLS_DOWNGRADE" in cef_out
    assert "|10|" in cef_out
    assert "cs1=T1557.002" in cef_out
    assert "cs4=CASE-99" in cef_out
    assert "cs4Label=case_id" in cef_out
    assert "src=10.0.0.5" in cef_out


def test_rfc5424_syslog_formatting():
    """Verify RFC 5424 syslog priority and header syntax."""
    frame = syslog_forwarder.format_rfc5424("CEF:Test Payload", severity=2, msg_id="WIRE-ALERT")
    assert frame.startswith(f"<{(settings.siem_syslog_facility * 8) + 2}>1 ")
    assert "SecureMailScope" in frame
    assert "WIRE-ALERT" in frame
    assert "CEF:Test Payload" in frame
    assert frame.endswith("\n")


def test_siem_config_validation():
    """Verify fail-fast validation for syslog protocol and facility codes."""
    with pytest.raises(ValueError, match="Invalid SIEM_SYSLOG_PROTOCOL"):
        with patch.dict(os.environ, {"SIEM_SYSLOG_PROTOCOL": "invalid_proto"}):
            AppSettings()

    with pytest.raises(ValueError, match="Invalid SIEM_SYSLOG_FACILITY"):
        with patch.dict(os.environ, {"SIEM_SYSLOG_FACILITY": "99"}):
            AppSettings()


@pytest.mark.asyncio
async def test_webhook_payload_generation(monkeypatch):
    """Verify Generic, Slack, and MS Teams webhook formatting and async dispatch."""
    event = {
        "title": "Plaintext Credentials Captured",
        "severity": "critical",
        "mitre_attack_id": "T1552.001",
        "description": "AUTH PLAIN credentials exposed on wire",
    }
    generic = webhook_dispatcher.build_generic_payload(event)
    assert generic["source"] == "SecureMailScope"
    assert generic["mitre_attack_id"] == "T1552.001"

    slack = webhook_dispatcher.build_slack_payload(event)
    assert len(slack["attachments"]) == 1
    assert slack["attachments"][0]["color"] == "#ef4444"

    teams = webhook_dispatcher.build_teams_payload(event)
    assert teams["@type"] == "MessageCard"

    async def mock_post(*args, **kwargs):
        class MockResp:
            def raise_for_status(self):
                pass

        return MockResp()

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    dispatched = await webhook_dispatcher.dispatch_event(event, webhook_url="https://mock.webhook.local/alert")
    assert dispatched is True


@pytest.mark.asyncio
async def test_siem_rest_api_and_auth_enforcement():
    """Verify /api/siem REST endpoints, status reporting, and operator key protection."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res_status = await client.get("/api/siem/status")
        assert res_status.status_code == 200
        assert "syslog" in res_status.json()

        old_key = settings.operator_api_key
        old_enabled = settings.siem_enabled
        old_webhook = settings.siem_webhook_url
        try:
            settings.siem_enabled = False
            settings.siem_webhook_url = None
            settings.operator_api_key = "op-secret-key-999"

            # Unauthenticated requests blocked
            res_unauth = await client.post("/api/siem/test", json={"title": "Test Alert"})
            assert res_unauth.status_code == 401
            assert (await client.get("/api/siem/history")).status_code == 401

            # Authenticated dispatch
            res_auth = await client.post(
                "/api/siem/test",
                headers={"X-API-Key": "op-secret-key-999"},
                json={"title": "Manual SOC Test", "severity": "high", "mitre_attack_id": "T1600.001"},
            )
            assert res_auth.status_code == 200
            assert res_auth.json()["status"] == "dispatched"

            # Authenticated history
            res_hist = await client.get("/api/siem/history", headers={"X-API-Key": "op-secret-key-999"})
            assert res_hist.status_code == 200
            assert any(h["title"] == "Manual SOC Test" for h in res_hist.json())
        finally:
            settings.operator_api_key = old_key
            settings.siem_enabled = old_enabled
            settings.siem_webhook_url = old_webhook
