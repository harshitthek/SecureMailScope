"""
Startup database seed utility for reference defense benchmark cases (CASE-01 through CASE-04).
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from app.db.repository import CaseRepository

logger = logging.getLogger("securemailscope.seed")


def enrich_case_data(case_dict: dict[str, Any]) -> dict[str, Any]:
    """Enrich demo benchmark case with PQC risk vectors and MITRE ATT&CK taxonomy."""
    for session in case_dict.get("sessions", []):
        if "pqc_status" not in session:
            tls_ver = session.get("tls_version")
            if tls_ver == "TLS 1.3":
                session["pqc_status"] = "CLASSICAL_TRANSITIONAL"
                session["pqc_group_name"] = "x25519 (Classical Ephemeral)"
                session["pqc_hndl_risk"] = "MODERATE"
                session["pqc_negotiated_group_hex"] = "0x001D"
            elif session.get("is_encrypted"):
                if session.get("has_forward_secrecy"):
                    session["pqc_status"] = "CLASSICAL_TRANSITIONAL"
                    session["pqc_group_name"] = "ECDHE (secp256r1 / Classical)"
                    session["pqc_hndl_risk"] = "MODERATE"
                    session["pqc_negotiated_group_hex"] = "0x0017"
                else:
                    session["pqc_status"] = "CRQC_HARVEST_CRITICAL"
                    session["pqc_group_name"] = "Static RSA (No Forward Secrecy)"
                    session["pqc_hndl_risk"] = "CRITICAL"
                    session["pqc_negotiated_group_hex"] = None
            else:
                session["pqc_status"] = "UNENCRYPTED_EXPOSED"
                session["pqc_group_name"] = "None (Plaintext)"
                session["pqc_hndl_risk"] = "CRITICAL"
                session["pqc_negotiated_group_hex"] = None

    for v in case_dict.get("vulnerabilities", []):
        title = v.get("title", "").lower()
        if not v.get("mitre_attack_id"):
            if "cleartext" in title or "unencrypted" in title:
                v["mitre_attack_id"] = "T1071.003"
                v["mitre_attack_technique"] = "Application Layer Protocol: Mail Protocols"
                v["mitre_d3fend_id"] = "D3-EAC"
            elif "striptls" in title or "downgrade" in title:
                v["mitre_attack_id"] = "T1557.002"
                v["mitre_attack_technique"] = "Adversary-in-the-Middle: Protocol Downgrade"
                v["mitre_d3fend_id"] = "D3-EAC"
            elif "auth" in title or "credential" in title:
                v["mitre_attack_id"] = "T1552.001"
                v["mitre_attack_technique"] = "Unsecured Credentials: Credentials in Transport"
                v["mitre_d3fend_id"] = "D3-PA"
            elif any(k in title for k in ("ssl", "tls 1.0", "tls 1.1", "prohibited", "deprecated")):
                v["mitre_attack_id"] = "T1600.001"
                v["mitre_attack_technique"] = "Weaken Encryption: Deprecated Protocol Fallback"
                v["mitre_d3fend_id"] = "D3-CSM"
            elif any(k in title for k in ("cipher", "3des", "rc4", "cbc", "static rsa", "forward secrecy")):
                v["mitre_attack_id"] = "T1600.002"
                v["mitre_attack_technique"] = "Weaken Encryption: Weak Cryptographic Algorithms"
                v["mitre_d3fend_id"] = "D3-CSM"
            elif any(k in title for k in ("expired", "self-signed")):
                v["mitre_attack_id"] = "T1588.004"
                v["mitre_attack_technique"] = "Obtain Capabilities: Digital Certificates"
                v["mitre_d3fend_id"] = "D3-CV"
            elif any(k in title for k in ("signature", "public key", "weak key")):
                v["mitre_attack_id"] = "T1600.002"
                v["mitre_attack_technique"] = "Weaken Encryption: Inadequate Key Length / Hash"
                v["mitre_d3fend_id"] = "D3-CV"
            elif "ja3" in title or "fingerprint" in title:
                v["mitre_attack_id"] = "T1071.003"
                v["mitre_attack_technique"] = "Application Layer Protocol: Mail Protocols"
                v["mitre_d3fend_id"] = "D3-CF"

    return case_dict


async def seed_reference_cases_if_needed() -> int:
    """Ensure benchmark reference dossiers (CASE-01 through CASE-04) exist in database."""
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    demo_cases_path = os.path.join(data_dir, "demo_cases.json")
    if not os.path.exists(demo_cases_path):
        return 0

    with open(demo_cases_path, "r", encoding="utf-8") as f:
        cases_data: dict[str, Any] = json.load(f)

    seeded = 0
    for cid, raw_case in cases_data.items():
        existing = await CaseRepository.get_case_by_id(cid)
        if not existing:
            enriched = enrich_case_data(raw_case)
            enriched["analysis_id"] = cid
            await CaseRepository.save_case(enriched, source="reference_demo")
            seeded += 1

    if seeded > 0:
        logger.info("Successfully seeded %d reference defense cases into database", seeded)
    return seeded
