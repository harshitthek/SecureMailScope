"""
Unit and integration tests for the real-time passive network TAP sniffer and telemetry engine.
"""

from __future__ import annotations

import asyncio

import httpx
import pytest
from scapy.all import IP, TCP, Raw

from app.daemon.live_tap_daemon import LiveTapDaemon
from app.main import app


@pytest.fixture
def fresh_daemon() -> LiveTapDaemon:
    """Fixture providing a clean, isolated LiveTapDaemon instance."""
    daemon = LiveTapDaemon()
    daemon.stop()
    return daemon


def test_tap_status_idle(fresh_daemon: LiveTapDaemon):
    status = fresh_daemon.get_status()
    assert status["state"] == "IDLE"
    assert status["pps"] == 0.0
    assert status["buffer_count"] == 0
    assert status["total_packets_captured"] == 0


def test_tap_packet_handling_and_buffer(fresh_daemon: LiveTapDaemon):
    # Construct a synthetic SMTP packet
    pkt = (
        IP(src="192.168.1.100", dst="192.168.1.10")
        / TCP(sport=54321, dport=25, flags="PA")
        / Raw(load=b"HELO client.example.com\r\n")
    )

    fresh_daemon._handle_packet(pkt)

    status = fresh_daemon.get_status()
    assert status["buffer_count"] == 1
    assert status["total_packets_captured"] == 1
    assert fresh_daemon.total_bytes_captured == len(pkt)


def test_wire_security_heuristics_cleartext_auth(fresh_daemon: LiveTapDaemon):
    alerts = []
    fresh_daemon.register_listener(lambda ev, data: alerts.append((ev, data)) if ev == "SECURITY_ALERT" else None)

    # Packet containing cleartext AUTH PLAIN
    pkt = (
        IP(src="192.168.1.50", dst="192.168.1.10")
        / TCP(sport=49152, dport=25)
        / Raw(load=b"AUTH PLAIN AGhhaGFoAGZvbw==\r\n")
    )
    fresh_daemon._handle_packet(pkt)

    assert len(alerts) >= 1
    ev_type, data = alerts[0]
    assert ev_type == "SECURITY_ALERT"
    assert data["mitre_id"] == "T1552.001"
    assert data["severity"] == "critical"
    assert "Cleartext Authentication" in data["title"]


def test_wire_security_heuristics_striptls(fresh_daemon: LiveTapDaemon):
    alerts = []
    fresh_daemon.register_listener(lambda ev, data: alerts.append((ev, data)) if ev == "SECURITY_ALERT" else None)

    # Server rejecting STARTTLS on submission port 587
    pkt = (
        IP(src="192.168.1.10", dst="192.168.1.50")
        / TCP(sport=587, dport=49152)
        / Raw(load=b"500 STARTTLS not recognized\r\n")
    )
    fresh_daemon._handle_packet(pkt)

    assert len(alerts) >= 1
    assert alerts[0][1]["mitre_id"] == "T1557.002"
    assert alerts[0][1]["severity"] == "critical"


def test_wire_security_heuristics_deprecated_sslv3(fresh_daemon: LiveTapDaemon):
    alerts = []
    fresh_daemon.register_listener(lambda ev, data: alerts.append((ev, data)) if ev == "SECURITY_ALERT" else None)

    # SSL 3.0 Handshake Record
    pkt = (
        IP(src="192.168.1.50", dst="192.168.1.10")
        / TCP(sport=49152, dport=465)
        / Raw(load=b"\x16\x03\x00\x00\x40ClientHello")
    )
    fresh_daemon._handle_packet(pkt)

    assert len(alerts) >= 1
    assert alerts[0][1]["mitre_id"] == "T1600.001"
    assert "SSL 3.0" in alerts[0][1]["title"]


@pytest.mark.asyncio
async def test_simulated_replay_and_snapshot(fresh_daemon: LiveTapDaemon):
    # Start simulated replay of attack PCAP
    started = await fresh_daemon.start_replay(pcap_name="02_striptls_mitm_attack.pcap", speed_pps=50.0)
    assert started is True
    assert fresh_daemon.state == "REPLAYING"

    # Allow replay loop to ingest packets
    await asyncio.sleep(0.3)
    status = fresh_daemon.get_status()
    assert status["total_packets_captured"] > 0
    fresh_daemon.stop()
    assert fresh_daemon.state == "IDLE"

    # Take snapshot and verify analysis run creation
    res = fresh_daemon.snapshot(label="Integration Test Snapshot")
    assert res["success"] is True
    assert "run_id" in res
    assert res["packet_count"] > 0
    assert res["overall_grade"] is not None


@pytest.mark.asyncio
async def test_tap_rest_endpoints():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Status
        resp = await client.get("/api/tap/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "state" in data
        assert "pps" in data
        assert "buffer_capacity" in data

        # Interfaces
        resp_ifaces = await client.get("/api/tap/interfaces")
        assert resp_ifaces.status_code == 200
        assert isinstance(resp_ifaces.json(), list)
        assert len(resp_ifaces.json()) >= 1

        # Replays
        resp_replays = await client.get("/api/tap/replays")
        assert resp_replays.status_code == 200
        replays = resp_replays.json()
        assert isinstance(replays, list)
        assert any("02_striptls" in r["filename"] for r in replays)
