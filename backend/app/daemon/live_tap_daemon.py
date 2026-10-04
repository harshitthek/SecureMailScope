"""
Real-time passive network TAP sniffer daemon for live email protocol inspection.
Supports live NIC capture via Scapy AsyncSniffer and simulated wire replay.
"""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import threading
import time
import uuid
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from scapy.all import IP, TCP, AsyncSniffer, IPv6, Raw, rdpcap, wrpcap

from app.config import settings

logger = logging.getLogger("securemailscope.tap")

EMAIL_PORTS = {
    25: "SMTP",
    587: "SMTP",
    465: "SMTPS",
    143: "IMAP",
    993: "IMAPS",
    110: "POP3",
    995: "POP3S",
}


class LiveTapDaemon:
    """Manages real-time wire sniffing, simulated replays, rolling buffers, and security alerts."""

    def __init__(self) -> None:
        self.state: str = "IDLE"  # IDLE, SNIFFING, REPLAYING, ERROR
        self.active_interface: str | None = None
        self.bpf_filter: str = settings.tap_bpf_filter
        self.error_message: str | None = None

        # Thread-safe packet buffer
        self._packet_buffer: deque[Any] = deque(maxlen=settings.tap_buffer_max_packets)
        self._lock = threading.Lock()

        # Telemetry metrics
        self._packet_timestamps: deque[float] = deque(maxlen=500)
        self.total_packets_captured: int = 0
        self.total_bytes_captured: int = 0
        self.started_at: str | None = None

        # Scapy AsyncSniffer handle & Replay thread/task
        self._sniffer: AsyncSniffer | None = None
        self._replay_task: asyncio.Task | None = None
        self._stop_requested: bool = False

        # Broadcast listener callbacks: callable(event_type: str, payload: dict) -> None
        self._listeners: list[Callable[[str, dict[str, Any]], Any]] = []

    def get_status(self) -> dict[str, Any]:
        """Return operational telemetry for the live TAP sensor."""
        now = time.time()
        with self._lock:
            # Calculate PPS over the last 5 seconds
            recent_stamps = [ts for ts in self._packet_timestamps if now - ts <= 5.0]
            pps = round(len(recent_stamps) / 5.0, 1) if recent_stamps else 0.0
            buffer_count = len(self._packet_buffer)

        return {
            "state": self.state,
            "active_interface": self.active_interface,
            "bpf_filter": self.bpf_filter,
            "pps": pps,
            "buffer_count": buffer_count,
            "buffer_capacity": settings.tap_buffer_max_packets,
            "total_packets_captured": self.total_packets_captured,
            "total_bytes_captured": self.total_bytes_captured,
            "started_at": self.started_at,
            "error_message": self.error_message,
        }

    def register_listener(self, callback: Callable[[str, dict[str, Any]], Any]) -> None:
        """Register an async-safe callback to receive live stream events."""
        if callback not in self._listeners:
            self._listeners.append(callback)

    def unregister_listener(self, callback: Callable[[str, dict[str, Any]], Any]) -> None:
        """Remove a previously registered listener."""
        if callback in self._listeners:
            self._listeners.remove(callback)

    def _broadcast(self, event_type: str, data: dict[str, Any]) -> None:
        """Notify all listeners of a telemetry, packet, or alert event."""
        for cb in list(self._listeners):
            try:
                cb(event_type, data)
            except Exception as e:
                logger.debug(f"Broadcast listener failed: {e}")

    def _handle_packet(self, packet: Any) -> None:
        """Process an individual packet from either the live sniffer or replay stream."""
        if not (packet.haslayer(TCP) and (packet.haslayer(IP) or packet.haslayer(IPv6))):
            return

        now = time.time()
        ip_layer = packet[IP] if packet.haslayer(IP) else packet[IPv6]
        tcp_layer = packet[TCP]

        src_ip = ip_layer.src
        dst_ip = ip_layer.dst
        sport = tcp_layer.sport
        dport = tcp_layer.dport

        # Check if traffic targets or originates from an email port
        protocol = EMAIL_PORTS.get(dport) or EMAIL_PORTS.get(sport) or "TCP"
        pkt_len = len(packet)

        with self._lock:
            self._packet_buffer.append(packet)
            self._packet_timestamps.append(now)
            self.total_packets_captured += 1
            self.total_bytes_captured += pkt_len

        # Extract flags
        flags_int = int(tcp_layer.flags)
        flag_names = []
        if flags_int & 0x02:
            flag_names.append("SYN")
        if flags_int & 0x10:
            flag_names.append("ACK")
        if flags_int & 0x08:
            flag_names.append("PSH")
        if flags_int & 0x01:
            flag_names.append("FIN")
        if flags_int & 0x04:
            flag_names.append("RST")
        flags_str = " ".join(flag_names) or "NONE"

        payload_bytes = bytes(packet[Raw].load) if packet.haslayer(Raw) else b""
        preview = ""
        if payload_bytes:
            clean = "".join(chr(b) if 32 <= b <= 126 else "." for b in payload_bytes[:32])
            preview = clean

        packet_event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "src": f"{src_ip}:{sport}",
            "dst": f"{dst_ip}:{dport}",
            "protocol": protocol,
            "length": pkt_len,
            "flags": flags_str,
            "preview": preview,
        }

        self._broadcast("PACKET", packet_event)

        # Wire security heuristics
        self._inspect_wire_security(src_ip, sport, dst_ip, dport, protocol, payload_bytes)

    def _inspect_wire_security(
        self, src_ip: str, sport: int, dst_ip: str, dport: int, protocol: str, payload: bytes
    ) -> None:
        """Inspect in-flight payloads for instant wire attacks and posture deficiencies."""
        if not payload:
            return

        # 1. Cleartext Authentication
        if b"AUTH PLAIN" in payload or b"AUTH LOGIN" in payload:
            self._broadcast(
                "SECURITY_ALERT",
                {
                    "severity": "critical",
                    "title": "Cleartext Authentication in Transport",
                    "mitre_id": "T1552.001",
                    "vector": f"{src_ip}:{sport} -> {dst_ip}:{dport}",
                    "description": f"Plaintext authentication command observed on unencrypted {protocol} port.",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        # 2. POP3 / IMAP plaintext credentials
        if payload.startswith(b"PASS ") or payload.startswith(b"USER "):
            self._broadcast(
                "SECURITY_ALERT",
                {
                    "severity": "high",
                    "title": "Plaintext Mailbox Credentials Leaked",
                    "mitre_id": "T1552.001",
                    "vector": f"{src_ip}:{sport} -> {dst_ip}:{dport}",
                    "description": f"Plaintext mailbox login credentials exposed on wire ({protocol}).",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        # 3. STRIPTLS Downgrade Indication
        if b"STARTTLS" in payload and (dport == 587 or sport == 587):
            if b"500 " in payload or b"502 " in payload or b"454 " in payload:
                self._broadcast(
                    "SECURITY_ALERT",
                    {
                        "severity": "critical",
                        "title": "STRIPTLS Active Downgrade Attack",
                        "mitre_id": "T1557.002",
                        "vector": f"{src_ip}:{sport} -> {dst_ip}:{dport}",
                        "description": "STARTTLS negotiation failed or rejected by intermediate gateway on submission port 587.",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )

        # 4. Deprecated SSLv3 / TLS 1.0 record headers
        if payload.startswith(b"\x16\x03\x00") or payload.startswith(b"\x16\x03\x01"):
            ver_name = "SSL 3.0" if payload[2] == 0 else "TLS 1.0"
            self._broadcast(
                "SECURITY_ALERT",
                {
                    "severity": "high",
                    "title": f"Deprecated Handshake Version: {ver_name}",
                    "mitre_id": "T1600.001",
                    "vector": f"{src_ip}:{sport} -> {dst_ip}:{dport}",
                    "description": f"Connection uses prohibited legacy protocol {ver_name} violating NIST SP 800-52r2.",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

    def start_sniff(self, interface: str | None = None, bpf_filter: str | None = None) -> bool:
        """Start Scapy AsyncSniffer on the specified interface with BPF filtering."""
        if self.state in ("SNIFFING", "REPLAYING"):
            return True

        self.error_message = None
        filter_str = bpf_filter or self.bpf_filter

        try:
            sniffer_kwargs: dict[str, Any] = {
                "filter": filter_str,
                "prn": self._handle_packet,
                "store": False,
            }
            if interface and interface != "default":
                sniffer_kwargs["iface"] = interface

            self._sniffer = AsyncSniffer(**sniffer_kwargs)
            self._sniffer.start()

            self.state = "SNIFFING"
            self.active_interface = interface or "default"
            self.bpf_filter = filter_str
            self.started_at = datetime.now(timezone.utc).isoformat()
            logger.info(f"Live TAP sniffer started on interface: {self.active_interface} with filter: {filter_str}")
            return True
        except Exception as e:
            self.state = "ERROR"
            self.error_message = f"Failed to start sniffer: {e}"
            logger.error(self.error_message)
            return False

    async def start_replay(self, pcap_name: str = "02_striptls_mitm_attack.pcap", speed_pps: float = 8.0) -> bool:
        """Replay packets from a reference PCAP to simulate active wire traffic."""
        if self.state in ("SNIFFING", "REPLAYING"):
            self.stop()

        pcap_path = settings.test_pcaps_dir / pcap_name
        if not pcap_path.exists():
            # Fallback check in backend/test_pcaps relative to current working dir
            alt_path = Path("backend/test_pcaps") / pcap_name
            if alt_path.exists():
                pcap_path = alt_path
            else:
                self.error_message = f"Replay PCAP not found: {pcap_name}"
                return False

        try:
            packets = rdpcap(str(pcap_path))
        except Exception as e:
            self.error_message = f"Could not read replay PCAP: {e}"
            return False

        self.state = "REPLAYING"
        self.active_interface = f"SIMULATED://{pcap_name}"
        self.started_at = datetime.now(timezone.utc).isoformat()
        self._stop_requested = False

        async def _replay_loop() -> None:
            delay = 1.0 / max(speed_pps, 1.0)
            try:
                for pkt in packets:
                    if self._stop_requested:
                        break
                    self._handle_packet(pkt)
                    await asyncio.sleep(delay)
            except asyncio.CancelledError:
                pass
            finally:
                if self.state == "REPLAYING":
                    self.state = "IDLE"

        self._replay_task = asyncio.create_task(_replay_loop())
        logger.info(f"Simulated wire replay started with {len(packets)} packets at {speed_pps} PPS")
        return True

    def stop(self) -> None:
        """Stop either the active sniffer or simulated replay."""
        self._stop_requested = True
        if self._sniffer and self._sniffer.running:
            try:
                self._sniffer.stop()
            except Exception as e:
                logger.debug(f"Sniffer stop error: {e}")
            self._sniffer = None

        if self._replay_task and not self._replay_task.done():
            self._replay_task.cancel()
            self._replay_task = None

        self.state = "IDLE"
        self.active_interface = None
        logger.info("Live TAP capture stopped")

    def snapshot(self, label: str = "Live TAP Capture") -> dict[str, Any]:
        """
        Snapshot the current packet buffer into a forensic analysis case.
        Serializes buffered packets into a PCAP and executes the full forensic pipeline.
        """
        from app.api.routes import _results, _run_analysis

        with self._lock:
            packets_to_write = list(self._packet_buffer)

        if not packets_to_write:
            return {
                "success": False,
                "error": "Packet buffer is empty. Capture packets before snapshotting.",
            }

        # Write packets to a temporary PCAP file
        with tempfile.NamedTemporaryFile(suffix=".pcap", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            wrpcap(tmp_path, packets_to_write)
            timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp_str}_live_tap_snapshot.pcap"

            analysis = _run_analysis(tmp_path, filename)
            run_id = str(uuid.uuid4())
            case_code = f"CASE-TAP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

            analysis["analysis_id"] = run_id
            analysis["id"] = run_id
            analysis["case_code"] = case_code
            analysis["source"] = "LIVE_TAP"
            analysis["capture_label"] = label

            _results[run_id] = analysis

            return {
                "success": True,
                "run_id": run_id,
                "case_code": case_code,
                "filename": filename,
                "packet_count": len(packets_to_write),
                "sessions_count": len(analysis.get("sessions", [])),
                "overall_score": analysis.get("enterprise_score", 0),
                "overall_grade": analysis.get("enterprise_grade", "F"),
            }
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass


# Singleton live tap daemon instance
live_tap_daemon = LiveTapDaemon()
