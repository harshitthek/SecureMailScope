"""
Centralized SIEM & Incident Alert Dispatcher orchestrating CEF serialization,
Syslog forwarding, webhook delivery, and dispatch audit history.
"""

from __future__ import annotations

import asyncio
import collections
import logging
from datetime import datetime, timezone
from typing import Any

from app.siem.cef_serializer import format_finding_cef
from app.siem.syslog_forwarder import syslog_forwarder
from app.siem.webhook_dispatcher import webhook_dispatcher

logger = logging.getLogger("securemailscope.siem")


class SiemAlertDispatcher:
    """Coordinates real-time transmission of security incidents to external SOC tooling."""

    def __init__(self, max_history: int = 100) -> None:
        self._history: collections.deque[dict[str, Any]] = collections.deque(maxlen=max_history)

    async def dispatch_wire_alert(self, alert: dict[str, Any]) -> dict[str, Any]:
        """Dispatch a real-time wire security alert detected by passive tap inspection."""
        finding = {
            "title": alert.get("title") or alert.get("type", "Wire Security Alert"),
            "severity": alert.get("severity", "critical"),
            "mitre_attack_id": alert.get("mitre_attack_id") or alert.get("mitre_id"),
            "description": alert.get("description") or alert.get("msg", ""),
            "src_ip": alert.get("src_ip"),
            "src_port": alert.get("src_port"),
            "dst_ip": alert.get("dst_ip"),
            "dst_port": alert.get("dst_port"),
            "protocol": alert.get("protocol"),
        }

        cef_line = format_finding_cef(finding, context=alert)
        syslog_task = syslog_forwarder.forward_message(cef_line, severity=2, msg_id="WIRE-ALERT")
        webhook_task = webhook_dispatcher.dispatch_event(finding)
        syslog_ok, webhook_ok = await asyncio.gather(syslog_task, webhook_task)

        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "live_tap",
            "title": finding["title"],
            "severity": finding["severity"],
            "mitre_attack_id": finding["mitre_attack_id"],
            "syslog_forwarded": syslog_ok,
            "webhook_dispatched": webhook_ok,
            "cef_payload": cef_line,
        }
        self._history.append(entry)
        logger.info("Dispatched wire alert '%s' (Syslog: %s, Webhook: %s)", finding["title"], syslog_ok, webhook_ok)
        return entry

    async def dispatch_case_findings(self, case_data: dict[str, Any]) -> list[dict[str, Any]]:
        """Dispatch high and critical severity findings discovered during forensic case analysis."""
        dispatched: list[dict[str, Any]] = []
        vulns = case_data.get("vulnerabilities", [])
        case_id = case_data.get("analysis_id", "UNKNOWN-CASE")

        for v in vulns:
            sev = str(v.get("severity", "medium")).lower()
            if sev not in ("critical", "high"):
                continue

            cef_line = format_finding_cef(v, context={"case_id": case_id})
            syslog_task = syslog_forwarder.forward_message(cef_line, severity=3, msg_id="CASE-FINDING")
            webhook_task = webhook_dispatcher.dispatch_event(v)
            syslog_ok, webhook_ok = await asyncio.gather(syslog_task, webhook_task)

            record = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": "case_analysis",
                "case_id": case_id,
                "title": v.get("title", "Forensic Finding"),
                "severity": sev,
                "mitre_attack_id": v.get("mitre_attack_id"),
                "syslog_forwarded": syslog_ok,
                "webhook_dispatched": webhook_ok,
                "cef_payload": cef_line,
            }
            self._history.append(record)
            dispatched.append(record)

        return dispatched

    def get_history(self) -> list[dict[str, Any]]:
        """Return rolling history of recently dispatched security alerts."""
        return list(reversed(self._history))

    def get_status(self) -> dict[str, Any]:
        """Return combined operational status of alerting subsystems."""
        return {
            "syslog": syslog_forwarder.get_stats(),
            "webhook": webhook_dispatcher.get_stats(),
            "total_recorded_alerts": len(self._history),
        }


alert_dispatcher = SiemAlertDispatcher()
