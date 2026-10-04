"""
RFC 5424 Syslog message formatter and asynchronous network forwarder (UDP/TCP).
Transmits security events and CEF records directly to SIEM log collectors.
"""

from __future__ import annotations

import asyncio
import logging
import os
import socket
from datetime import datetime, timezone

from app.config import settings

logger = logging.getLogger("securemailscope.syslog")


class SyslogForwarder:
    """Asynchronous RFC 5424 Syslog forwarder supporting UDP and TCP transports."""

    def __init__(self) -> None:
        self.sent_count: int = 0
        self.fail_count: int = 0
        self.last_sent_at: str | None = None
        self._hostname: str = socket.gethostname() or "localhost"
        self._pid: str = str(os.getpid())

    def format_rfc5424(self, message: str, severity: int = 4, msg_id: str = "SEC-ALERT") -> str:
        """Format payload into an RFC 5424 compliant syslog frame."""
        facility = settings.siem_syslog_facility
        syslog_sev = max(0, min(7, int(severity)))
        pri = (facility * 8) + syslog_sev
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        clean_msg = message.replace("\r", "").replace("\n", " ")
        return f"<{pri}>1 {timestamp} {self._hostname} SecureMailScope {self._pid} {msg_id} - {clean_msg}\n"

    async def forward_message(
        self,
        message: str,
        severity: int = 4,
        msg_id: str = "SEC-ALERT",
    ) -> bool:
        """Forward a syslog frame asynchronously to the configured destination."""
        if not settings.siem_enabled:
            return False

        payload = self.format_rfc5424(message, severity=severity, msg_id=msg_id)
        host = settings.siem_syslog_host
        port = settings.siem_syslog_port
        proto = settings.siem_syslog_protocol

        try:
            if proto == "tcp":
                await self._send_tcp(host, port, payload)
            else:
                await self._send_udp(host, port, payload)

            self.sent_count += 1
            self.last_sent_at = datetime.now(timezone.utc).isoformat()
            return True

        except Exception as exc:
            self.fail_count += 1
            logger.warning("Syslog forward failed to %s:%d/%s: %s", host, port, proto, exc)
            return False

    async def _send_udp(self, host: str, port: int, payload: str) -> None:
        """Dispatch syslog packet via non-blocking UDP."""

        def _sync_udp() -> None:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                sock.sendto(payload.encode("utf-8"), (host, port))
            finally:
                sock.close()

        await asyncio.to_thread(_sync_udp)

    async def _send_tcp(self, host: str, port: int, payload: str, timeout: float = 2.0) -> None:
        """Dispatch syslog frame over TCP connection with strict timeout."""
        reader, writer = await asyncio.wait_for(asyncio.open_connection(host, port), timeout=timeout)
        try:
            writer.write(payload.encode("utf-8"))
            await asyncio.wait_for(writer.drain(), timeout=timeout)
        finally:
            writer.close()
            await writer.wait_closed()

    def get_stats(self) -> dict[str, object]:
        """Return operational forwarding metrics."""
        return {
            "enabled": settings.siem_enabled,
            "host": settings.siem_syslog_host,
            "port": settings.siem_syslog_port,
            "protocol": settings.siem_syslog_protocol,
            "facility": settings.siem_syslog_facility,
            "sent_count": self.sent_count,
            "fail_count": self.fail_count,
            "last_sent_at": self.last_sent_at,
        }


syslog_forwarder = SyslogForwarder()
