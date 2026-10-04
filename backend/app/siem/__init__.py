"""
Enterprise SIEM integration, ArcSight CEF serialization, Syslog RFC 5424 forwarder,
and webhook incident alerting for SecureMailScope.
"""

from __future__ import annotations

from app.siem.cef_serializer import format_finding_cef, serialize_cef
from app.siem.dispatcher import alert_dispatcher
from app.siem.syslog_forwarder import syslog_forwarder
from app.siem.webhook_dispatcher import webhook_dispatcher

__all__ = [
    "alert_dispatcher",
    "format_finding_cef",
    "serialize_cef",
    "syslog_forwarder",
    "webhook_dispatcher",
]
