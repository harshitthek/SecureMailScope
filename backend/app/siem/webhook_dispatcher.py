"""
Asynchronous HTTP Webhook Dispatcher for SOC incidents (Generic JSON, Slack, MS Teams).
Notifies external incident response platforms upon high-severity posture discoveries.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger("securemailscope.webhook")


class WebhookDispatcher:
    """Dispatches formatted incident notifications to configured webhook URLs."""

    def __init__(self) -> None:
        self.sent_count: int = 0
        self.fail_count: int = 0
        self.last_sent_at: str | None = None

    def build_generic_payload(self, event: dict[str, Any]) -> dict[str, Any]:
        """Construct standard SOC incident JSON payload."""
        return {
            "source": "SecureMailScope",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event.get("event_type", "SECURITY_ALERT"),
            "severity": event.get("severity", "medium"),
            "title": event.get("title", "Email Cryptographic Security Alert"),
            "description": event.get("description", ""),
            "mitre_attack_id": event.get("mitre_attack_id"),
            "mitre_attack_technique": event.get("mitre_attack_technique"),
            "mitre_d3fend_id": event.get("mitre_d3fend_id"),
            "details": event.get("details", {}),
        }

    def build_slack_payload(self, event: dict[str, Any]) -> dict[str, Any]:
        """Construct Slack Incoming Webhook Block Kit payload."""
        title = event.get("title", "Security Alert")
        sev = str(event.get("severity", "medium")).upper()
        mitre = event.get("mitre_attack_id") or "N/A"
        desc = event.get("description", "No details provided.")

        color = "#ef4444" if sev in ("CRITICAL", "HIGH") else "#f59e0b"
        return {
            "attachments": [
                {
                    "color": color,
                    "title": f"[{sev}] SecureMailScope Alert: {title}",
                    "text": desc,
                    "fields": [
                        {"title": "MITRE ATT&CK", "value": mitre, "short": True},
                        {"title": "Severity", "value": sev, "short": True},
                        {
                            "title": "Timestamp",
                            "value": datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
                            "short": True,
                        },
                    ],
                    "footer": "NTRO SecureMailScope Forensic Engine",
                }
            ]
        }

    def build_teams_payload(self, event: dict[str, Any]) -> dict[str, Any]:
        """Construct Microsoft Teams MessageCard payload."""
        title = event.get("title", "Security Alert")
        sev = str(event.get("severity", "medium")).upper()
        return {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": f"SecureMailScope Alert: {title}",
            "themeColor": "D9383A" if sev in ("CRITICAL", "HIGH") else "EAA300",
            "title": f"SecureMailScope Incident [{sev}]: {title}",
            "sections": [
                {
                    "text": event.get("description", ""),
                    "facts": [
                        {"name": "MITRE ATT&CK:", "value": event.get("mitre_attack_id") or "N/A"},
                        {"name": "Severity:", "value": sev},
                        {"name": "Detection:", "value": "Passive Cryptographic Wire Analysis"},
                    ],
                }
            ],
        }

    async def dispatch_event(self, event: dict[str, Any], webhook_url: str | None = None) -> bool:
        """Post structured alert payload to webhook endpoint with safety bounds."""
        target_url = webhook_url or settings.siem_webhook_url
        if not target_url:
            return False

        fmt = settings.siem_webhook_format
        if fmt == "slack":
            payload = self.build_slack_payload(event)
        elif fmt == "teams":
            payload = self.build_teams_payload(event)
        else:
            payload = self.build_generic_payload(event)

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(target_url, json=payload)
                res.raise_for_status()

            self.sent_count += 1
            self.last_sent_at = datetime.now(timezone.utc).isoformat()
            return True

        except Exception as exc:
            self.fail_count += 1
            logger.warning("Webhook dispatch failed to %s: %s", target_url, exc)
            return False

    def get_stats(self) -> dict[str, object]:
        """Return operational webhook metrics."""
        return {
            "configured": bool(settings.siem_webhook_url),
            "format": settings.siem_webhook_format,
            "sent_count": self.sent_count,
            "fail_count": self.fail_count,
            "last_sent_at": self.last_sent_at,
        }


webhook_dispatcher = WebhookDispatcher()
