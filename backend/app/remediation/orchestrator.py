"""
Central remediation orchestrator mapping cryptographic posture findings to MITRE D3FEND matrix.
Coordinates dynamic Ansible, Suricata, and Snort remediation artifacts.
"""

from __future__ import annotations

from typing import Any


def build_remediation_summary(case_data: dict[str, Any]) -> dict[str, Any]:
    """Generate structured executive remediation plan mapped to MITRE D3FEND techniques."""
    case_code = case_data.get("case_code") or case_data.get("analysis_id", "CASE-UNKNOWN")
    case_id = case_data.get("analysis_id", case_code)
    target_host = case_data.get("filename", "mail-gateway.defense.gov.in")
    vulns = case_data.get("vulnerabilities", [])

    titles = [str(v.get("title", "")).lower() for v in vulns]
    mitres = [str(v.get("mitre_attack_id", "")) for v in vulns]

    has_striptls = any("t1557.002" in m for m in mitres) or any("striptls" in t for t in titles)
    has_auth_exposure = any("t1552.001" in m for m in mitres) or any("auth" in t or "credential" in t for t in titles)
    has_proto_weak = any("t1600.001" in m for m in mitres) or any("ssl" in t or "tls 1.0" in t for t in titles)
    has_cipher_weak = any("t1600.002" in m for m in mitres) or any(
        "3des" in t or "rc4" in t or "cipher" in t for t in titles
    )
    has_cert_weak = any(any(k in t for k in ("expired", "self-signed", "signature", "key")) for t in titles)

    d3fend_techniques: list[dict[str, Any]] = [
        {
            "technique_id": "D3-EAC",
            "name": "Encrypted Authenticated Channel",
            "status": "CRITICAL" if has_striptls else "COMPLIANT",
            "rationale": "Mandates TLS encryption on email transport to defeat STRIPTLS / AiTM attacks.",
            "actions": [
                "Configure 'smtpd_tls_security_level = may' in Postfix main.cf",
                "Deploy Suricata SID 2615901 for real-time AiTM STARTTLS tampering detection",
            ]
            if has_striptls
            else ["Encryption requirement active across ingress ports."],
        },
        {
            "technique_id": "D3-PA",
            "name": "Protocol Authentication",
            "status": "HIGH" if has_auth_exposure else "COMPLIANT",
            "rationale": "Prohibits credential negotiation prior to cryptographic session establishment.",
            "actions": [
                "Set 'smtpd_tls_auth_only = yes' in Postfix main.cf",
                "Deploy Suricata SID 2615902 to detect cleartext AUTH PLAIN/LOGIN attempts",
            ]
            if has_auth_exposure
            else ["Cleartext authentication disabled."],
        },
        {
            "technique_id": "D3-CV",
            "name": "Cryptographic Verification & Cipher Suite Hardening",
            "status": "HIGH" if (has_proto_weak or has_cipher_weak) else "COMPLIANT",
            "rationale": "Enforces TLS 1.2+ minimum protocol version and AEAD forward-secret cipher suites.",
            "actions": [
                "Disable SSLv2, SSLv3, TLS 1.0, TLS 1.1 in smtpd_tls_mandatory_protocols",
                "Restrict tls_high_cipherlist to HIGH:!aNULL:!kRSA:!3DES:!RC4:!MD5:!PSK",
                "Deploy Suricata SIDs 2615903-2615904 for deprecated handshake detection",
            ]
            if (has_proto_weak or has_cipher_weak)
            else ["Ciphers conform to NIST SP 800-52r2."],
        },
        {
            "technique_id": "D3-CSM",
            "name": "Certificate State Monitoring",
            "status": "HIGH" if has_cert_weak else "COMPLIANT",
            "rationale": "Validates X.509 certificate expiry, root authority trust, and signature algorithms.",
            "actions": [
                "Rotate expiring/expired X.509 leaf certificates with SHA-256+ signatures",
                "Ensure CA trust anchors exist in /etc/ssl/certs with 0644 permissions",
            ]
            if has_cert_weak
            else ["Certificates active and cryptographically sound."],
        },
    ]

    total_actions = sum(len(t["actions"]) for t in d3fend_techniques if t["status"] != "COMPLIANT")

    return {
        "case_code": case_code,
        "analysis_id": case_id,
        "target_host": target_host,
        "action_items_count": max(1, total_actions),
        "d3fend_matrix": d3fend_techniques,
        "playbook_available": True,
        "ids_rules_available": True,
        "download_endpoints": {
            "ansible": f"/api/remediation/{case_id}/ansible",
            "suricata": f"/api/remediation/{case_id}/suricata",
            "snort": f"/api/remediation/{case_id}/snort",
        },
    }
