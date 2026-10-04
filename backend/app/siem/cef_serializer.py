"""
ArcSight Common Event Format (CEF v0) serializer for cryptographic security events.
Conforms to Micro Focus ArcSight CEF specification with CRLF injection sanitization.
"""

from __future__ import annotations

import re
import time
from typing import Any

CEF_PREFIX = "CEF:0|NTRO|SecureMailScope|1.0.0"

EVENT_CLASS_MAP: dict[str, tuple[str, str, int]] = {
    "STRIPTLS_DOWNGRADE": ("STRIPTLS_DOWNGRADE", "Opportunistic STARTTLS Stripped by MitM Adversary", 10),
    "CLEARTEXT_AUTH": ("CLEARTEXT_AUTH", "Plaintext Mail Credentials Exposed on Wire", 10),
    "CLEARTEXT_TRANSMISSION": ("CLEARTEXT_TRANSMISSION", "Unencrypted Cleartext Email Protocol Transmission", 9),
    "DEPRECATED_PROTOCOL": ("DEPRECATED_PROTOCOL", "Insecure Deprecated Protocol Fallback (SSL/TLS 1.0/1.1)", 8),
    "WEAK_CIPHER_SUITE": ("WEAK_CIPHER_SUITE", "Weak Cryptographic Cipher Suite Negotiated", 7),
    "EXPIRED_CERTIFICATE": ("EXPIRED_CERTIFICATE", "Expired X.509 Certificate Detected", 7),
    "SELF_SIGNED_CERTIFICATE": ("SELF_SIGNED_CERTIFICATE", "Untrusted Self-Signed Certificate Detected", 6),
    "UNKNOWN_JA3_CLIENT": ("UNKNOWN_JA3_CLIENT", "Unrecognized Anomalous TLS Client Fingerprint", 5),
    "POSTURE_ASSESSMENT": ("POSTURE_ASSESSMENT", "Email Cryptographic Security Posture Assessment", 4),
}


def _sanitize_header(val: str) -> str:
    """Sanitize header string by removing newlines and escaping delimiter pipes."""
    cleaned = re.sub(r"[\r\n]+", " ", str(val)).strip()
    return cleaned.replace("\\", "\\\\").replace("|", "\\|")


def _sanitize_extension_val(val: Any) -> str:
    """Sanitize extension values by removing newlines and escaping equals signs."""
    cleaned = re.sub(r"[\r\n]+", " ", str(val)).strip()
    return cleaned.replace("\\", "\\\\").replace("=", "\\=")


def serialize_cef(
    event_class_id: str,
    event_name: str,
    severity: int,
    extensions: dict[str, Any] | None = None,
) -> str:
    """Format a standard ArcSight CEF log string."""
    sev = max(0, min(10, int(severity)))
    hdr = f"{CEF_PREFIX}|{_sanitize_header(event_class_id)}|{_sanitize_header(event_name)}|{sev}"

    ext_parts: list[str] = []
    if extensions:
        for k, v in extensions.items():
            if v is not None and v != "":
                k_clean = re.sub(r"[^a-zA-Z0-9_]", "", str(k))
                if k_clean:
                    ext_parts.append(f"{k_clean}={_sanitize_extension_val(v)}")

    return f"{hdr}|{' '.join(ext_parts)}" if ext_parts else f"{hdr}|"


def format_finding_cef(finding: dict[str, Any], context: dict[str, Any] | None = None) -> str:
    """Serialize a single security finding or wire alert into an ArcSight CEF event."""
    ctx = context or {}
    mitre_id = str(finding.get("mitre_attack_id") or finding.get("mitre_id") or "")
    title = str(finding.get("title") or "")
    sev_raw = str(finding.get("severity") or "medium").lower()

    # Determine event class ID: prioritize MITRE taxonomy and specific cert issues
    event_class = "POSTURE_ASSESSMENT"
    if "T1557.002" in mitre_id:
        event_class = "STRIPTLS_DOWNGRADE"
    elif "T1552.001" in mitre_id:
        event_class = "CLEARTEXT_AUTH"
    elif "T1600.001" in mitre_id:
        event_class = "DEPRECATED_PROTOCOL"
    elif "T1600.002" in mitre_id:
        event_class = "WEAK_CIPHER_SUITE"
    elif "expired" in title.lower():
        event_class = "EXPIRED_CERTIFICATE"
    elif "self-signed" in title.lower():
        event_class = "SELF_SIGNED_CERTIFICATE"
    elif "striptls" in title.lower():
        event_class = "STRIPTLS_DOWNGRADE"
    elif any(k in title.lower() for k in ("cleartext auth", "auth plain", "auth login", "plaintext credential")):
        event_class = "CLEARTEXT_AUTH"
    elif any(p in title.lower() for p in ("ssl 2.0", "ssl 3.0", "tls 1.0", "tls 1.1")):
        event_class = "DEPRECATED_PROTOCOL"
    elif any(c in title.lower() for c in ("3des", "rc4", "sweet32", "weak cipher")):
        event_class = "WEAK_CIPHER_SUITE"

    cls_id, default_name, def_sev = EVENT_CLASS_MAP.get(event_class, ("SECURITY_EVENT", title, 5))
    name = title or default_name

    sev_weights = {"critical": 10, "high": 8, "medium": 5, "low": 3, "secure": 1}
    severity = sev_weights.get(sev_raw, def_sev)

    case_id_val = ctx.get("case_code") or ctx.get("case_id") or finding.get("case_code") or finding.get("case_id")
    exts: dict[str, Any] = {
        "src": ctx.get("src_ip") or finding.get("src_ip"),
        "spt": ctx.get("src_port") or finding.get("src_port"),
        "dst": ctx.get("dst_ip") or finding.get("dst_ip"),
        "dpt": ctx.get("dst_port") or finding.get("dst_port"),
        "proto": ctx.get("protocol") or finding.get("protocol"),
        "msg": finding.get("description") or title,
        "cs1": mitre_id,
        "cs1Label": "mitre_attack_id" if mitre_id else None,
        "cs2": finding.get("mitre_d3fend_id"),
        "cs2Label": "mitre_d3fend_id" if finding.get("mitre_d3fend_id") else None,
        "cs3": finding.get("nist_ref"),
        "cs3Label": "nist_reference" if finding.get("nist_ref") else None,
        "cs4": case_id_val,
        "cs4Label": "case_id" if case_id_val else None,
        "rt": int(time.time() * 1000),
    }

    return serialize_cef(cls_id, name, severity, exts)
