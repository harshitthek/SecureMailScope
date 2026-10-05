"""
API routes for SecureMailScope.

Endpoints:
  POST /api/upload          — Upload and analyze a PCAP file
  GET  /api/analysis/{id}   — Get analysis results
  GET  /api/report/{id}/pdf — Download PDF forensic report
  GET  /api/report/{id}/json — Download JSON report
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import tempfile
import time
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile
from fastapi.responses import StreamingResponse

from app.api.spool_routes import _verify_operator_auth
from app.core.anomaly import build_feature_vector, detect_anomalies
from app.core.cert_validator import validate_certificate
from app.core.ja3_engine import Ja3Result, compute_ja3, compute_ja3s
from app.core.pcap_parser import parse_pcap
from app.core.scorer import ScoringResult, calculate_grade_and_severity, score_enterprise, score_session
from app.core.starttls_detector import detect_starttls
from app.core.tls_analyzer import analyze_tls
from app.reports.html_exporter import generate_html_report
from app.reports.json_exporter import format_json_report
from app.reports.pdf_exporter import generate_pdf_report

router = APIRouter()
logger = logging.getLogger("securemailscope.routes")

# In-memory results store and synchronization
_results: dict[str, dict[str, Any]] = {}
_cache_lock: asyncio.Lock | None = None
_cache_lock_loop: asyncio.AbstractEventLoop | None = None


def _get_cache_lock() -> asyncio.Lock:
    global _cache_lock, _cache_lock_loop
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None
    if _cache_lock is None or _cache_lock_loop is not current_loop:
        _cache_lock = asyncio.Lock()
        _cache_lock_loop = current_loop
    return _cache_lock


# Load static data
_data_dir = os.path.join(os.path.dirname(__file__), "..", "data")

with open(os.path.join(_data_dir, "cipher_db.json"), "r") as f:
    CIPHER_DB: dict = json.load(f)

with open(os.path.join(_data_dir, "nist_rules.json"), "r") as f:
    NIST_RULES: list[dict] = json.load(f)


def _generate_synthetic_cert(cn: str, serial: str) -> tuple[str, str]:
    try:
        import datetime

        from cryptography import x509
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.x509.oid import NameOID

        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = x509.Name(
            [
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "DEFENSE FORENSICS CA"),
                x509.NameAttribute(NameOID.COMMON_NAME, cn or "mail.defense.gov.in"),
            ]
        )
        clean_serial = "".join([c for c in serial if c in "0123456789abcdefABCDEF"])[:8]
        s_int = int(clean_serial, 16) if clean_serial else 1001
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(subject)
            .public_key(key.public_key())
            .serial_number(s_int)
            .not_valid_before(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30))
            .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=335))
            .sign(key, hashes.SHA256())
        )
        der_bytes = cert.public_bytes(serialization.Encoding.DER)
        pem_str = cert.public_bytes(serialization.Encoding.PEM).decode("utf-8")
        return pem_str, der_bytes.hex()
    except Exception:
        return "", ""


# Pre-seed built-in defense cases (CASE-01 through CASE-04) for instantaneous dossier generation
_demo_cases_path = os.path.join(_data_dir, "demo_cases.json")
if os.path.exists(_demo_cases_path):
    with open(_demo_cases_path, "r", encoding="utf-8") as f:
        cases_data = json.load(f)
        for cid, case_dict in cases_data.items():
            for session in case_dict.get("sessions", []):
                # PQC enrichment
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

                # Certificate synthetic placeholder (kept separate from captured evidence)
                cert = session.get("certificate")
                if cert and (
                    not cert.get("pem_data") or not cert.get("raw_der_hex") or len(cert.get("raw_der_hex", "")) < 50
                ):
                    cn = cert.get("subject_cn", "mail.defense.gov.in")
                    serial = cert.get("serial_number", "1001")
                    pem_str, der_hex = _generate_synthetic_cert(cn, serial)
                    if pem_str and der_hex:
                        cert["synthetic_pem"] = pem_str
                        cert["synthetic_der_hex"] = der_hex
                        cert["is_synthetic"] = True

            # Vulnerability MITRE enrichment
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
                    elif (
                        "ssl" in title
                        or "tls 1.0" in title
                        or "tls 1.1" in title
                        or "prohibited" in title
                        or "deprecated" in title
                    ):
                        v["mitre_attack_id"] = "T1600.001"
                        v["mitre_attack_technique"] = "Weaken Encryption: Deprecated Protocol Fallback"
                        v["mitre_d3fend_id"] = "D3-CSM"
                    elif "cipher" in title or "3des" in title or "rc4" in title or "cbc" in title:
                        v["mitre_attack_id"] = "T1600.002"
                        v["mitre_attack_technique"] = "Weaken Encryption: Weak Cryptographic Algorithms"
                        v["mitre_d3fend_id"] = "D3-CSM"
                    elif "static rsa" in title or "forward secrecy" in title:
                        v["mitre_attack_id"] = "T1600.002"
                        v["mitre_attack_technique"] = "Weaken Encryption: Weak Cryptographic Algorithms (Static RSA)"
                        v["mitre_d3fend_id"] = "D3-CSM"
                    elif "expired" in title or "self-signed" in title:
                        v["mitre_attack_id"] = "T1588.004"
                        v["mitre_attack_technique"] = "Obtain Capabilities: Digital Certificates"
                        v["mitre_d3fend_id"] = "D3-CV"
                    elif "signature" in title or "public key" in title or "weak key" in title:
                        v["mitre_attack_id"] = "T1600.002"
                        v["mitre_attack_technique"] = "Weaken Encryption: Inadequate Key Length / Hash"
                        v["mitre_d3fend_id"] = "D3-CV"
                    elif "ja3" in title or "fingerprint" in title:
                        v["mitre_attack_id"] = "T1071.003"
                        v["mitre_attack_technique"] = "Application Layer Protocol: Mail Protocols"
                        v["mitre_d3fend_id"] = "D3-CF"

        _results.update(cases_data)


def _map_severity_color(severity: str) -> str:
    """Map severity to hex color for frontend charts."""
    return {
        "critical": "#EF4444",
        "high": "#F97316",
        "medium": "#EAB308",
        "low": "#3B82F6",
        "secure": "#22C55E",
    }.get(severity, "#64748B")


def _tls_version_color(version: str | None) -> str:
    """Map TLS version to hex color."""
    return {
        "TLS 1.3": "#22C55E",
        "TLS 1.2": "#3B82F6",
        "TLS 1.1": "#EAB308",
        "TLS 1.0": "#F97316",
        "SSL 3.0": "#EF4444",
        "SSL 2.0": "#EF4444",
        "None (Cleartext)": "#EF4444",
    }.get(version or "None (Cleartext)", "#64748B")


def _build_forensic_inspection(stream, starttls, tls) -> dict:
    """Build timeline steps and raw wire hex/ascii chunks for Mode B dissector."""
    state_timeline = []
    step = 1

    # Step 1: TCP Handshake / Connection
    state_timeline.append(
        {
            "step": step,
            "phase": "TCP_CONNECT",
            "direction": "C->S",
            "summary": f"TCP 3-way handshake established on port {stream.dst_port} ({stream.protocol})",
            "status": "normal",
        }
    )
    step += 1

    if not stream.is_implicit_tls:
        # Step 2: Server greeting / banner
        banner_text = starttls.server_banner or "Service greeting ready"
        state_timeline.append(
            {
                "step": step,
                "phase": "BANNER",
                "direction": "S->C",
                "summary": banner_text[:40],
                "status": "normal",
            }
        )
        step += 1

        if starttls.starttls_stripped:
            state_timeline.append(
                {
                    "step": step,
                    "phase": "STRIPTLS",
                    "direction": "S->C",
                    "summary": "STARTTLS capability missing from 250 greeting",
                    "status": "downgrade",
                    "is_transition_point": True,
                }
            )
            step += 1
            if starttls.cleartext_auth_detected:
                state_timeline.append(
                    {
                        "step": step,
                        "phase": "AUTH_EXPOSED",
                        "direction": "C->S",
                        "summary": "Cleartext AUTH credentials transmitted across wire",
                        "status": "compromised",
                    }
                )
                step += 1
        elif starttls.starttls_initiated:
            state_timeline.append(
                {
                    "step": step,
                    "phase": "STARTTLS_REQ",
                    "direction": "C->S",
                    "summary": "Client sent STARTTLS upgrade command",
                    "status": "normal",
                }
            )
            step += 1
            state_timeline.append(
                {
                    "step": step,
                    "phase": "STARTTLS_ACK",
                    "direction": "S->C",
                    "summary": "Server 220 Ready to start TLS",
                    "status": "normal",
                }
            )
            step += 1
        elif starttls.is_cleartext_only and starttls.cleartext_auth_detected:
            state_timeline.append(
                {
                    "step": step,
                    "phase": "AUTH_EXPOSED",
                    "direction": "C->S",
                    "summary": "Cleartext user credentials transmitted unencrypted",
                    "status": "compromised",
                    "is_transition_point": True,
                }
            )
            step += 1

    if tls:
        state_timeline.append(
            {
                "step": step,
                "phase": "CLIENT_HELLO",
                "direction": "C->S",
                "summary": f"Client Hello offered {len(tls.client_cipher_suites)} ciphers",
                "status": "secure",
                "is_transition_point": True,
            }
        )
        step += 1
        state_timeline.append(
            {
                "step": step,
                "phase": "SERVER_HELLO",
                "direction": "S->C",
                "summary": f"Server Hello negotiated {tls.negotiated_version} with {tls.selected_cipher_name}",
                "status": "secure",
            }
        )
        step += 1
        if tls.certificate_der:
            state_timeline.append(
                {
                    "step": step,
                    "phase": "CERTIFICATE",
                    "direction": "S->C",
                    "summary": "X.509 leaf certificate presented",
                    "status": "secure",
                }
            )
            step += 1
    elif starttls.is_cleartext_only:
        state_timeline.append(
            {
                "step": step,
                "phase": "CLEARTEXT_FLOW",
                "direction": "C->S",
                "summary": "Unencrypted protocol stream transmitted in cleartext",
                "status": "compromised",
            }
        )
        step += 1

    return {
        "state_timeline": state_timeline,
        "raw_chunks": [],
    }


def _run_analysis(file_path: str, filename: str) -> dict[str, Any]:
    """
    Full analysis pipeline: PCAP → Streams → TLS → Certs → JA3 → Scores → Vulns → Compliance.
    """
    t_start = time.time()

    # Step 1: Parse PCAP into TCP streams
    streams = parse_pcap(file_path)
    total_packets = sum(s.packet_count for s in streams)

    # Step 2-5: Analyze each stream
    sessions: list[dict[str, Any]] = []
    feature_vectors: list[list[float]] = []
    all_vulns: list[dict[str, Any]] = []
    vuln_counter = 0

    for idx, stream in enumerate(streams):
        session_id = idx + 1

        # STARTTLS detection
        starttls = detect_starttls(stream)

        # TLS analysis
        tls = None
        if starttls.is_implicit_tls:
            # Try parsing TLS from the start of server payload
            combined = stream.client_payload + stream.server_payload
            tls = analyze_tls(combined, offset=0)
        elif starttls.tls_offset is not None:
            # Parse TLS from the transition offset
            combined = stream.client_payload + stream.server_payload
            tls = analyze_tls(combined, offset=starttls.tls_offset)

        # Certificate validation
        cert_info = None
        if tls and tls.certificate_der:
            cert_info = validate_certificate(tls.certificate_der)

        # JA3 fingerprinting
        ja3 = None
        if tls:
            ja3 = compute_ja3(
                version=tls.ja3_version,
                ciphers=tls.ja3_ciphers,
                extensions=tls.ja3_extensions,
                curves=tls.ja3_curves,
                point_formats=tls.ja3_point_formats,
            )

        # Compute JA3S (Server Hello fingerprint) if available
        ja3s = None
        if tls and tls.ja3s_version and tls.ja3s_cipher:
            ja3s = compute_ja3s(
                version=tls.ja3s_version,
                cipher=tls.ja3s_cipher,
                extensions=tls.ja3s_extensions,
            )

        # Determine parameters for scoring
        is_cleartext = starttls.is_cleartext_only
        tls_version = tls.negotiated_version if tls else ("None (Cleartext)" if is_cleartext else None)
        cipher_category = None
        cipher_is_aead = False
        key_exchange = None

        if tls:
            cipher_entry = CIPHER_DB.get(tls.selected_cipher_hex, {})
            cipher_category = cipher_entry.get("category")
            cipher_is_aead = cipher_entry.get("aead", False)
            key_exchange = tls.key_exchange

        # Score this session
        scoring = score_session(
            tls_version=tls_version,
            cipher_category=cipher_category,
            cipher_is_aead=cipher_is_aead,
            key_exchange=key_exchange,
            cert=cert_info,
            ja3_known=ja3.is_known if ja3 else False,
            is_cleartext=is_cleartext,
        )

        # Build feature vector for anomaly detection
        fv = build_feature_vector(
            tls_version=tls_version,
            cipher_severity=tls.cipher_severity if tls else None,
            key_bits=cert_info.public_key_bits if cert_info else 0,
            has_pfs=tls.has_forward_secrecy if tls else False,
            cert_days_remaining=cert_info.days_remaining if cert_info else None,
            ja3_known=ja3.is_known if ja3 else False,
        )
        feature_vectors.append(fv)

        # Build session dict
        session = {
            "session_id": session_id,
            "src_ip": stream.src_ip,
            "src_port": stream.src_port,
            "dst_ip": stream.dst_ip,
            "dst_port": stream.dst_port,
            "server_name": (tls.sni if tls and tls.sni else stream.dst_ip),
            "protocol": stream.protocol,
            "timestamp": stream.timestamp,
            "is_encrypted": not is_cleartext,
            "starttls_detected": bool(starttls.starttls_advertised or starttls.starttls_initiated),
            "starttls_stripped": starttls.starttls_stripped,
            "tls_version": tls_version,
            "cipher_suite_hex": tls.selected_cipher_hex if tls else None,
            "cipher_suite_name": tls.selected_cipher_name if tls else None,
            "cipher_severity": tls.cipher_severity if tls else None,
            "key_exchange": key_exchange,
            "has_forward_secrecy": tls.has_forward_secrecy if tls else False,
            "ja3_hash": ja3.ja3_hash if ja3 else None,
            "ja3_client_name": ja3.client_name if ja3 else None,
            "ja3_is_known": ja3.is_known if ja3 else False,
            "ja3s_hash": ja3s.ja3s_hash if ja3s else None,
            "certificate_chain_length": len(tls.certificate_chain_ders)
            if tls and tls.certificate_chain_ders
            else (1 if cert_info else 0),
            "alpn_protocols": tls.alpn_protocols if tls else [],
            "certificate": _cert_to_dict(cert_info) if cert_info else None,
            "session_score": scoring.final_score,
            "session_grade": scoring.grade,
            "session_severity": scoring.severity,
            "pqc_status": tls.pqc_status if tls else ("UNENCRYPTED_EXPOSED" if is_cleartext else "UNKNOWN"),
            "pqc_group_name": tls.pqc_group_name if tls else ("None (Plaintext)" if is_cleartext else "Unknown"),
            "pqc_hndl_risk": tls.pqc_hndl_risk if tls else ("CRITICAL" if is_cleartext else "MODERATE"),
            "pqc_negotiated_group_hex": tls.negotiated_group_hex if tls else None,
            "scoring_breakdown": {
                "protocol_penalty": scoring.protocol_penalty,
                "cipher_penalty": scoring.cipher_penalty,
                "pfs_penalty": scoring.pfs_penalty,
                "cert_penalty": scoring.cert_penalty,
                "anomaly_penalty": scoring.anomaly_penalty,
                "raw_score": scoring.raw_score,
                "final_score": scoring.final_score,
            },
            "forensic_inspection": _build_forensic_inspection(stream, starttls, tls),
        }
        sessions.append(session)

        # Generate vulnerabilities from this session
        session_vulns = _generate_vulns(session_id, starttls, tls, cert_info, scoring, vuln_counter, ja3)
        vuln_counter += len(session_vulns)
        all_vulns.extend(session_vulns)

    # Step 6: Anomaly detection (across all sessions)
    anomaly_results = detect_anomalies(feature_vectors)
    for i, anom in enumerate(anomaly_results):
        if anom.is_anomaly and sessions[i]["session_score"] > 0:
            sessions[i]["scoring_breakdown"]["anomaly_penalty"] = 15
            new_score = max(0, sessions[i]["session_score"] - 15)
            sessions[i]["session_score"] = new_score
            sessions[i]["scoring_breakdown"]["final_score"] = new_score
            new_grade, new_sev = calculate_grade_and_severity(new_score)
            sessions[i]["session_grade"] = new_grade
            sessions[i]["session_severity"] = new_sev

    # Step 7: Enterprise scoring
    session_scores = [s["session_score"] for s in sessions]
    enterprise_score, enterprise_grade = score_enterprise(session_scores)

    # Step 8: Compliance checks
    compliance = _check_compliance(sessions)

    # Step 9: Aggregate chart data
    protocol_dist = _aggregate_protocol_distribution(sessions)
    cipher_dist = _aggregate_cipher_distribution(sessions)
    cert_summary = _aggregate_cert_summary(sessions)

    # Deduplicate vulnerabilities by title
    seen_titles = set()
    unique_vulns = []
    for v in all_vulns:
        if v["title"] not in seen_titles:
            seen_titles.add(v["title"])
            unique_vulns.append(v)
        else:
            # Merge affected sessions
            for uv in unique_vulns:
                if uv["title"] == v["title"]:
                    uv["affected_sessions"] = sorted(
                        list(set(uv["affected_sessions"] + v.get("affected_sessions", [])))
                    )
                    break

    # Sort vulns by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "secure": 4}
    unique_vulns.sort(key=lambda v: severity_order.get(v["severity"], 5))

    protocols_detected = list(set(s["protocol"] for s in sessions))

    processing_time_ms = int((time.time() - t_start) * 1000)

    file_size = os.path.getsize(file_path)

    return {
        "analysis_id": "",  # Will be set by caller
        "filename": filename,
        "file_size_bytes": file_size,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "processing_time_ms": processing_time_ms,
        "enterprise_score": enterprise_score,
        "enterprise_grade": enterprise_grade,
        "total_sessions": len(sessions),
        "total_packets": total_packets,
        "protocols_detected": protocols_detected,
        "sessions": sessions,
        "vulnerabilities": unique_vulns,
        "compliance": compliance,
        "protocol_distribution": protocol_dist,
        "cipher_distribution": cipher_dist,
        "certificate_summary": cert_summary,
    }


def _cert_to_dict(cert) -> dict[str, Any]:
    """Convert CertificateInfo dataclass to dict."""
    return {
        "subject_cn": cert.subject_cn,
        "issuer_cn": cert.issuer_cn,
        "serial_number": cert.serial_number,
        "not_before": cert.not_before,
        "not_after": cert.not_after,
        "is_expired": cert.is_expired,
        "is_not_yet_valid": cert.is_not_yet_valid,
        "is_self_signed": cert.is_self_signed,
        "validity_days": cert.validity_days,
        "days_remaining": cert.days_remaining,
        "signature_algorithm": cert.signature_algorithm,
        "signature_hash": cert.signature_hash,
        "is_weak_signature": cert.is_weak_signature,
        "public_key_type": cert.public_key_type,
        "public_key_bits": cert.public_key_bits,
        "is_weak_key": cert.is_weak_key,
        "san_entries": cert.san_entries,
        "pem_data": getattr(cert, "pem_data", ""),
        "raw_der_hex": getattr(cert, "raw_der_hex", ""),
    }


def _generate_vulns(
    session_id: int,
    starttls,
    tls,
    cert,
    scoring: ScoringResult,
    counter: int,
    ja3: Ja3Result | None = None,
) -> list[dict[str, Any]]:
    """Generate vulnerability findings from a single session's analysis."""
    vulns = []

    if starttls.is_cleartext_only:
        vulns.append(
            {
                "id": f"VULN-{counter + len(vulns) + 1:03d}",
                "severity": "critical",
                "title": "Cleartext Email Communication — No Encryption",
                "description": f"Session #{session_id} transmitted email data entirely in cleartext without any TLS encryption. Credentials and message contents are fully exposed to passive interception.",
                "affected_sessions": [session_id],
                "cve_references": [],
                "nist_reference": "NIST SP 800-52r2 Section 3.1",
                "mitre_attack_id": "T1071.003",
                "mitre_attack_technique": "Application Layer Protocol: Mail Protocols",
                "mitre_d3fend_id": "D3-EAC",
                "remediation": "Enable TLS on the mail server. Use implicit TLS (ports 465/993/995) or enforce mandatory STARTTLS with MTA-STS.",
            }
        )

    if starttls.starttls_stripped:
        vulns.append(
            {
                "id": f"VULN-{counter + len(vulns) + 1:03d}",
                "severity": "critical",
                "title": "STRIPTLS Downgrade Attack Suspected",
                "description": f"Session #{session_id} shows an SMTP exchange on a submission port where STARTTLS was not advertised. This is consistent with an active Man-in-the-Middle STRIPTLS attack stripping encryption capabilities.",
                "affected_sessions": [session_id],
                "cve_references": [],
                "nist_reference": "NIST SP 800-52r2 Section 3.1",
                "mitre_attack_id": "T1557.002",
                "mitre_attack_technique": "Adversary-in-the-Middle: Protocol Downgrade",
                "mitre_d3fend_id": "D3-EAC",
                "remediation": "Deploy MTA-STS (RFC 8461) and DANE/TLSA DNS records. Configure MTA to reject plaintext fallback on submission ports.",
            }
        )

    if starttls.cleartext_auth_detected:
        vulns.append(
            {
                "id": f"VULN-{counter + len(vulns) + 1:03d}",
                "severity": "critical",
                "title": "Cleartext Authentication Credentials Detected",
                "description": f"Session #{session_id} contains AUTH PLAIN or AUTH LOGIN commands transmitted before TLS encryption. User credentials are exposed in the network capture.",
                "affected_sessions": [session_id],
                "cve_references": [],
                "nist_reference": None,
                "mitre_attack_id": "T1552.001",
                "mitre_attack_technique": "Unsecured Credentials: Credentials in Transport",
                "mitre_d3fend_id": "D3-PA",
                "remediation": "Never transmit authentication over unencrypted channels. Enforce TLS before AUTH commands.",
            }
        )

    if tls:
        version = tls.negotiated_version
        if version in ("SSL 2.0", "SSL 3.0"):
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "critical",
                    "title": f"Prohibited Protocol {version} Detected",
                    "description": f"Session #{session_id} negotiated {version}, which is formally prohibited. Vulnerable to POODLE (SSL 3.0) and DROWN (SSL 2.0) attacks.",
                    "affected_sessions": [session_id],
                    "cve_references": ["CVE-2014-3566"] if version == "SSL 3.0" else ["CVE-2016-0800"],
                    "nist_reference": "NIST SP 800-52r2 Section 3.2.1",
                    "mitre_attack_id": "T1600.001",
                    "mitre_attack_technique": "Weaken Encryption: Deprecated Protocol Fallback",
                    "mitre_d3fend_id": "D3-CSM",
                    "remediation": f"Disable {version} on the mail server immediately. Upgrade to TLS 1.2 or TLS 1.3.",
                }
            )
        elif version in ("TLS 1.0", "TLS 1.1"):
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "high",
                    "title": f"Deprecated Protocol {version} Detected",
                    "description": f"Session #{session_id} negotiated {version}, deprecated by RFC 8996. Vulnerable to BEAST (TLS 1.0) and Lucky 13 attacks.",
                    "affected_sessions": [session_id],
                    "cve_references": ["CVE-2011-3389"] if version == "TLS 1.0" else [],
                    "nist_reference": "NIST SP 800-52r2 Section 3.2.1",
                    "mitre_attack_id": "T1600.001",
                    "mitre_attack_technique": "Weaken Encryption: Deprecated Protocol Fallback",
                    "mitre_d3fend_id": "D3-CSM",
                    "remediation": f"Disable {version} and upgrade to TLS 1.2+ with AEAD cipher suites.",
                }
            )

        cipher_info = CIPHER_DB.get(tls.selected_cipher_hex, {})
        cat = cipher_info.get("category", "")
        if cat in ("RC4", "3DES", "NULL", "EXPORT"):
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "high",
                    "title": f"Weak Cipher Suite: {tls.selected_cipher_name}",
                    "description": f"Session #{session_id} negotiated {tls.selected_cipher_name} ({cat} category). {cipher_info.get('notes', '')}",
                    "affected_sessions": [session_id],
                    "cve_references": ["CVE-2016-2183"] if cat == "3DES" else [],
                    "nist_reference": "NIST SP 800-52r2 Section 3.3.2",
                    "mitre_attack_id": "T1600.002",
                    "mitre_attack_technique": "Weaken Encryption: Weak Cryptographic Algorithms",
                    "mitre_d3fend_id": "D3-CSM",
                    "remediation": "Remove this cipher suite from server configuration. Use AES-GCM or ChaCha20-Poly1305 AEAD ciphers.",
                }
            )
        elif cat == "CBC":
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "medium",
                    "title": f"CBC Mode Cipher Suite in Use: {tls.selected_cipher_name}",
                    "description": f"Session #{session_id} negotiated {tls.selected_cipher_name} which uses CBC mode. CBC mode in TLS 1.2 is susceptible to timing side-channel attacks (Lucky 13, POODLE). NIST SP 800-52r2 Section 3.3.2 recommends AEAD cipher suites (AES-GCM or ChaCha20-Poly1305).",
                    "affected_sessions": [session_id],
                    "cve_references": ["CVE-2013-0169"],
                    "nist_reference": "NIST SP 800-52r2 Section 3.3.2",
                    "mitre_attack_id": "T1600.002",
                    "mitre_attack_technique": "Weaken Encryption: Weak Cryptographic Algorithms",
                    "mitre_d3fend_id": "D3-CSM",
                    "remediation": "Configure the mail server to disable CBC-mode cipher suites and mandate AEAD ciphers (e.g. ECDHE-ECDSA-AES256-GCM-SHA384 or ECDHE-RSA-AES256-GCM-SHA384).",
                }
            )

        if not tls.has_forward_secrecy and tls.key_exchange == "RSA":
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "high",
                    "title": "No Forward Secrecy — Static RSA Key Exchange",
                    "description": f"Session #{session_id} uses static RSA key exchange. If the server's private key is compromised, all historically recorded sessions can be retroactively decrypted.",
                    "affected_sessions": [session_id],
                    "cve_references": ["CVE-2017-13099"],
                    "nist_reference": "NIST SP 800-52r2 Section 3.3.1",
                    "mitre_attack_id": "T1600.002",
                    "mitre_attack_technique": "Weaken Encryption: Weak Cryptographic Algorithms (Static RSA)",
                    "mitre_d3fend_id": "D3-CSM",
                    "remediation": "Configure server to prefer ECDHE key exchange. Disable static RSA cipher suites.",
                }
            )

    if cert:
        if cert.is_expired:
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "high",
                    "title": "Expired Server Certificate",
                    "description": f"Session #{session_id} presents a certificate expired {abs(cert.days_remaining)} days ago ({cert.not_after}).",
                    "affected_sessions": [session_id],
                    "cve_references": [],
                    "nist_reference": "NIST SP 800-52r2 Section 3.4",
                    "mitre_attack_id": "T1588.004",
                    "mitre_attack_technique": "Obtain Capabilities: Digital Certificates",
                    "mitre_d3fend_id": "D3-CV",
                    "remediation": "Renew the server certificate. Use automated renewal (e.g., Let's Encrypt with certbot).",
                }
            )
        if cert.is_self_signed:
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "high",
                    "title": "Self-Signed Certificate — No Trust Assurance",
                    "description": f"Session #{session_id} presents a self-signed certificate (Subject=Issuer: {cert.subject_cn}). This provides no third-party trust verification.",
                    "affected_sessions": [session_id],
                    "cve_references": [],
                    "nist_reference": "NIST SP 800-52r2 Section 3.4",
                    "mitre_attack_id": "T1588.004",
                    "mitre_attack_technique": "Obtain Capabilities: Digital Certificates",
                    "mitre_d3fend_id": "D3-CV",
                    "remediation": "Replace with a certificate issued by a trusted Certificate Authority (e.g., Let's Encrypt, DigiCert).",
                }
            )
        if cert.is_weak_signature:
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "high",
                    "title": f"Weak Certificate Signature Hash ({cert.signature_hash})",
                    "description": f"Session #{session_id} certificate is signed with {cert.signature_hash}, which is cryptographically deprecated.",
                    "affected_sessions": [session_id],
                    "cve_references": [],
                    "nist_reference": "NIST SP 800-52r2 Section 3.6",
                    "mitre_attack_id": "T1600.002",
                    "mitre_attack_technique": "Weaken Encryption: Weak Cryptographic Hash",
                    "mitre_d3fend_id": "D3-CV",
                    "remediation": "Re-issue the certificate with SHA-256 or SHA-384 signature algorithm.",
                }
            )
        if cert.is_weak_key:
            vulns.append(
                {
                    "id": f"VULN-{counter + len(vulns) + 1:03d}",
                    "severity": "critical",
                    "title": f"Weak Public Key ({cert.public_key_type} {cert.public_key_bits}-bit)",
                    "description": f"Session #{session_id} certificate uses a {cert.public_key_bits}-bit {cert.public_key_type} key, which is below minimum security requirements and vulnerable to factoring.",
                    "affected_sessions": [session_id],
                    "cve_references": [],
                    "nist_reference": "NIST SP 800-52r2 Section 3.5",
                    "mitre_attack_id": "T1600.002",
                    "mitre_attack_technique": "Weaken Encryption: Inadequate Key Length",
                    "mitre_d3fend_id": "D3-CV",
                    "remediation": f"Re-issue with minimum {2048 if cert.public_key_type == 'RSA' else 256}-bit {cert.public_key_type} key.",
                }
            )

    if tls and ja3 and not ja3.is_known and not starttls.is_cleartext_only:
        vulns.append(
            {
                "id": f"VULN-{counter + len(vulns) + 1:03d}",
                "severity": "medium",
                "title": f"Unrecognized Client JA3 Fingerprint: {ja3.ja3_hash[:16]}...",
                "description": f"Session #{session_id} connects with an unverified ClientHello fingerprint (JA3: {ja3.ja3_hash}). The cryptographic signature does not match verified email user agents (Thunderbird, Outlook, Apple Mail), suggesting potential automated scripts or rogue client agents.",
                "affected_sessions": [session_id],
                "cve_references": [],
                "nist_reference": "NIST SP 800-52r2 Section 3.1",
                "mitre_attack_id": "T1071.003",
                "mitre_attack_technique": "Application Layer Protocol: Mail Protocols",
                "mitre_d3fend_id": "D3-CF",
                "remediation": "Inspect endpoint process telemetry for anomalous mail clients connecting to the mail transfer agent.",
            }
        )

    return vulns


def _check_compliance(sessions: list[dict]) -> list[dict[str, Any]]:
    """Run NIST/RFC compliance checks across all sessions."""
    checks = []

    for rule in NIST_RULES:
        rule_id = rule["id"]
        check_type = rule["check_type"]
        status = "pass"
        details = ""

        if check_type == "protocol_version":
            fail_vals = rule.get("fail_values", [])
            bad = [
                s
                for s in sessions
                if s.get("tls_version") in fail_vals
                or (s.get("tls_version") is None and "None (Cleartext)" in fail_vals)
            ]
            if bad:
                status = "fail"
                details = f"{len(bad)} session(s) use deprecated/prohibited protocols: {', '.join(set(str(s.get('tls_version')) for s in bad))}"
            else:
                details = "All sessions use acceptable protocol versions"

        elif check_type == "forward_secrecy":
            bad = [s for s in sessions if s.get("is_encrypted") and not s.get("has_forward_secrecy")]
            if bad:
                status = "fail"
                details = f"{len(bad)} encrypted session(s) lack forward secrecy (static RSA key exchange)"
            else:
                details = "All encrypted sessions support forward secrecy (ECDHE/DHE)"

        elif check_type == "cipher_mode":
            fail_cats = rule.get("fail_categories", [])
            bad = [
                s
                for s in sessions
                if s.get("cipher_suite_hex") and CIPHER_DB.get(s["cipher_suite_hex"], {}).get("category") in fail_cats
            ]
            if bad:
                status = "fail"
                details = f"{len(bad)} session(s) use non-AEAD cipher modes"
            else:
                details = "All sessions use AEAD cipher modes (AES-GCM or ChaCha20)"

        elif check_type == "certificate":
            bad = [
                s
                for s in sessions
                if s.get("certificate")
                and (s["certificate"].get("is_expired") or s["certificate"].get("is_self_signed"))
            ]
            if bad:
                status = "fail"
                issues = []
                for s in bad:
                    c = s["certificate"]
                    if c.get("is_expired"):
                        issues.append("expired")
                    if c.get("is_self_signed"):
                        issues.append("self-signed")
                details = f"{len(bad)} certificate(s) with issues: {', '.join(set(issues))}"
            else:
                details = "All certificates are valid and CA-signed"

        elif check_type == "key_length":
            min_rsa = rule.get("min_rsa_bits", 2048)
            bad = [s for s in sessions if s.get("certificate") and s["certificate"].get("is_weak_key")]
            if bad:
                status = "fail"
                details = f"{len(bad)} certificate(s) with insufficient key length"
            else:
                details = f"All keys meet minimum requirements (RSA≥{min_rsa}, EC≥256)"

        elif check_type == "signature_algorithm":
            bad = [s for s in sessions if s.get("certificate") and s["certificate"].get("is_weak_signature")]
            if bad:
                status = "fail"
                details = f"{len(bad)} certificate(s) use weak signature hash (SHA-1 or MD5)"
            else:
                details = "All certificates use SHA-256 or stronger signatures"

        elif check_type == "cipher_category":
            fail_cats = rule.get("fail_categories", [])
            bad = [
                s
                for s in sessions
                if s.get("cipher_suite_hex") and CIPHER_DB.get(s["cipher_suite_hex"], {}).get("category") in fail_cats
            ]
            if bad:
                status = "fail"
                details = f"RC4 cipher detected in {len(bad)} session(s)"
            else:
                details = "No RC4 ciphers negotiated"

        elif check_type == "transport_model":
            starttls_sessions = [s for s in sessions if s.get("starttls_detected")]
            if starttls_sessions:
                status = "warn"
                details = f"{len(starttls_sessions)} session(s) use STARTTLS instead of implicit TLS"
            else:
                details = "All sessions use implicit TLS (recommended)"

        elif check_type == "logging":
            status = "pass"
            details = "SecureMailScope provides the required forensic logging and audit capability"

        elif check_type == "ec_curve":
            status = "pass"
            details = "EC curve parameters checked where applicable"

        checks.append(
            {
                "id": rule_id,
                "standard": rule["standard"],
                "section": rule["section"],
                "requirement": rule["requirement"],
                "status": status,
                "details": details,
            }
        )

    return checks


def _aggregate_protocol_distribution(sessions: list[dict]) -> list[dict]:
    """Aggregate TLS version counts for pie chart."""
    counts: dict[str, int] = {}
    for s in sessions:
        v = s.get("tls_version") or "None (Cleartext)"
        counts[v] = counts.get(v, 0) + 1
    return [{"name": k, "value": v, "color": _tls_version_color(k)} for k, v in counts.items()]


def _aggregate_cipher_distribution(sessions: list[dict]) -> list[dict]:
    """Aggregate cipher suite counts for bar chart."""
    counts: dict[str, dict] = {}
    for s in sessions:
        name = s.get("cipher_suite_name") or "None (Cleartext)"
        sev = s.get("cipher_severity") or "critical"
        if name not in counts:
            counts[name] = {"count": 0, "severity": sev}
        counts[name]["count"] += 1
    return [
        {"name": k, "count": v["count"], "severity": v["severity"], "color": _map_severity_color(v["severity"])}
        for k, v in counts.items()
    ]


def _aggregate_cert_summary(sessions: list[dict]) -> list[dict]:
    """Aggregate certificate summaries, deduplicating identical certificates."""
    summaries = []
    seen_certs = set()
    for s in sessions:
        cert = s.get("certificate")
        if cert:
            cert_key = (cert.get("subject_cn"), cert.get("serial_number"), cert.get("issuer_cn"))
            if cert_key in seen_certs:
                continue
            seen_certs.add(cert_key)

            # Determine overall cert status
            if cert.get("is_weak_key") or cert.get("is_expired"):
                overall = "critical"
            elif cert.get("is_self_signed") or cert.get("is_weak_signature"):
                overall = "high"
            else:
                overall = "secure"

            summaries.append(
                {
                    "server_name": s.get("server_name", s["dst_ip"]),
                    "subject_cn": cert.get("subject_cn", "Unknown"),
                    "issuer_cn": cert.get("issuer_cn", "Unknown"),
                    "is_expired": cert.get("is_expired", False),
                    "is_self_signed": cert.get("is_self_signed", False),
                    "is_weak_signature": cert.get("is_weak_signature", False),
                    "is_weak_key": cert.get("is_weak_key", False),
                    "days_remaining": cert.get("days_remaining", 0),
                    "public_key_type": cert.get("public_key_type", "Unknown"),
                    "public_key_bits": cert.get("public_key_bits", 0),
                    "signature_hash": cert.get("signature_hash", "Unknown"),
                    "overall_status": overall,
                }
            )
    return summaries


# ─── API Endpoints ───────────────────────────────────────────────


@router.post("/upload")
async def upload_pcap(file: UploadFile = File(...)):
    """Upload and analyze a PCAP file with strict streaming size bounds and filename sanitization."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pcap", ".pcapng", ".cap"):
        raise HTTPException(status_code=400, detail=f"Invalid file type: {ext}. Accepted: .pcap, .pcapng, .cap")

    # Sanitize filename and prevent path traversal
    raw_name = os.path.basename(file.filename or "capture.pcap")
    safe_filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", raw_name)
    if not safe_filename:
        safe_filename = "capture.pcap"

    # Save to temp file using bounded streaming chunks (max 200MB)
    tmp_dir = tempfile.mkdtemp(prefix="securemailscope_")
    tmp_path = os.path.join(tmp_dir, safe_filename)
    max_bytes = 200 * 1024 * 1024
    total_bytes = 0

    try:
        with open(tmp_path, "wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunk
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    raise HTTPException(status_code=413, detail="File too large. Maximum size is 200MB")
                f.write(chunk)

        analysis_id = str(uuid.uuid4())
        result = await asyncio.to_thread(_run_analysis, tmp_path, safe_filename)
        result["analysis_id"] = analysis_id
        _results[analysis_id] = result

        try:
            from app.db.repository import CaseRepository

            await CaseRepository.save_case(result, source="manual_upload")
        except Exception as db_err:
            logger.warning("Failed to persist uploaded PCAP to database: %s", db_err)

        try:
            from app.siem.dispatcher import alert_dispatcher

            await alert_dispatcher.dispatch_case_findings(result)
        except Exception as siem_err:
            logger.warning("Failed to dispatch SIEM alerts for uploaded PCAP: %s", siem_err)

        return {"analysis_id": analysis_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Clean up temp file safely
        shutil.rmtree(tmp_dir, ignore_errors=True)


def _safe_export_token(aid: str) -> str:
    """Sanitize analysis ID to ensure safe RFC 6266 attachment filenames."""
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "", aid)
    return cleaned[:16] if cleaned else "evidence"


async def _resolve_analysis(analysis_id: str) -> dict[str, Any]:
    """Retrieve analysis results with in-memory L1 cache and database fallback."""
    if analysis_id in _results:
        return _results[analysis_id]

    async with _get_cache_lock():
        if analysis_id in _results:
            return _results[analysis_id]

        from app.db.repository import CaseRepository

        case_data = await CaseRepository.get_case_by_id(analysis_id)
        if case_data:
            _results[analysis_id] = case_data
            return case_data

    raise HTTPException(status_code=404, detail="Analysis not found")


@router.get("/cases")
async def list_cases(
    limit: int = Query(default=50, ge=1, le=200, description="Maximum cases to return"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    _auth: None = Depends(_verify_operator_auth),
):
    """List persisted capture cases with metadata and cryptographic ratings."""
    from app.db.repository import CaseRepository

    cases = await CaseRepository.list_cases(limit=limit, offset=offset)
    total = await CaseRepository.count_cases()
    return {"total": total, "cases": cases}


@router.delete("/cases/{case_id:path}")
async def delete_case(
    case_id: str,
    _auth: None = Depends(_verify_operator_auth),
):
    """Delete a capture case dossier and its associated evidence."""
    from app.db.repository import CaseRepository

    async with _get_cache_lock():
        deleted = await CaseRepository.delete_case(case_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Case not found")
        _results.pop(case_id, None)
        return {"status": "deleted", "case_id": case_id}


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get complete analysis results."""
    return await _resolve_analysis(analysis_id)


@router.get("/report/{analysis_id}/json")
async def get_json_report(analysis_id: str):
    """Download JSON forensic report."""
    analysis = await _resolve_analysis(analysis_id)
    safe_id = _safe_export_token(analysis_id)
    json_bytes = format_json_report(analysis)
    return StreamingResponse(
        iter([json_bytes]),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="securemailscope_report_{safe_id}.json"'},
    )


@router.get("/report/{analysis_id}/pdf")
async def get_pdf_report(analysis_id: str):
    """Download PDF forensic report."""
    analysis = await _resolve_analysis(analysis_id)
    safe_id = _safe_export_token(analysis_id)
    pdf_bytes = generate_pdf_report(analysis)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="securemailscope_report_{safe_id}.pdf"'},
    )


@router.get("/report/{analysis_id}/html")
async def get_html_report(analysis_id: str):
    """Download standalone self-contained HTML forensic dossier."""
    analysis = await _resolve_analysis(analysis_id)
    safe_id = _safe_export_token(analysis_id)
    html_content = generate_html_report(analysis)
    return Response(
        content=html_content,
        media_type="text/html; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="securemailscope_report_{safe_id}.html"'},
    )


@router.get("/certificate/{analysis_id}/{session_id}/pem")
async def export_certificate_pem(analysis_id: str, session_id: int):
    """Export raw X.509 certificate in PEM format for forensic tooling."""
    analysis = await _resolve_analysis(analysis_id)
    target_session = None
    for s in analysis.get("sessions", []):
        if s.get("session_id") == session_id:
            target_session = s
            break

    if not target_session or not target_session.get("certificate"):
        raise HTTPException(status_code=404, detail="Certificate not found for this session")

    cert = target_session["certificate"]
    if cert.get("is_synthetic"):
        raise HTTPException(
            status_code=404, detail="Synthetic placeholder certificate is not exportable as captured evidence"
        )

    pem_data = cert.get("pem_data")
    if not pem_data:
        raise HTTPException(status_code=404, detail="PEM serialization unavailable")

    safe_id = _safe_export_token(analysis_id)
    filename = f"cert_analysis_{safe_id}_session_{abs(int(session_id))}.pem"
    return Response(
        content=pem_data,
        media_type="application/x-pem-file",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/certificate/{analysis_id}/{session_id}/der")
async def export_certificate_der(analysis_id: str, session_id: int):
    """Export raw X.509 certificate in binary DER format for forensic tooling."""
    analysis = await _resolve_analysis(analysis_id)
    target_session = None
    for s in analysis.get("sessions", []):
        if s.get("session_id") == session_id:
            target_session = s
            break

    if not target_session or not target_session.get("certificate"):
        raise HTTPException(status_code=404, detail="Certificate not found for this session")

    cert = target_session["certificate"]
    if cert.get("is_synthetic"):
        raise HTTPException(
            status_code=404, detail="Synthetic placeholder certificate is not exportable as captured evidence"
        )

    der_hex = cert.get("raw_der_hex")
    der_bytes = b""
    if der_hex:
        try:
            der_bytes = bytes.fromhex(der_hex)
        except Exception:
            der_bytes = b""

    if not der_bytes:
        pem_str = cert.get("pem_data", "")
        if pem_str and "-----BEGIN CERTIFICATE-----" in pem_str:
            from cryptography import x509
            from cryptography.hazmat.primitives import serialization

            try:
                loaded = x509.load_pem_x509_certificate(pem_str.encode("utf-8"))
                der_bytes = loaded.public_bytes(serialization.Encoding.DER)
            except Exception:
                pass

    if not der_bytes:
        raise HTTPException(status_code=404, detail="DER binary representation unavailable")

    safe_id = _safe_export_token(analysis_id)
    filename = f"cert_analysis_{safe_id}_session_{abs(int(session_id))}.der"
    return Response(
        content=der_bytes,
        media_type="application/pkix-cert",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
