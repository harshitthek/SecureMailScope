"""
Serialization and mapping helpers converting between raw dictionary dossiers
and SQLAlchemy 2.0 ORM relational entity instances.
"""

from __future__ import annotations

import json
from typing import Any

from app.db.models import (
    CaptureCaseModel,
    CertificateEvidenceModel,
    FlowSessionModel,
    SecurityFindingModel,
)


def build_capture_case(
    case_id: str, case_data: dict[str, Any], timestamp: str, source: str, now_iso: str
) -> CaptureCaseModel:
    """Build CaptureCaseModel root entity from analysis dictionary."""
    c_score, c_grade, c_sev, c_stat = extract_score_fields(case_data)
    vulns = case_data.get("vulnerabilities", [])
    crit_count = sum(1 for v in vulns if v.get("severity", "").lower() == "critical")
    sessions_list = case_data.get("sessions", [])
    enc_count = sum(1 for s in sessions_list if s.get("is_encrypted"))

    return CaptureCaseModel(
        id=case_id,
        filename=case_data.get("filename", "unknown.pcap"),
        analysis_timestamp=timestamp,
        duration_seconds=float(case_data.get("duration_seconds") or (case_data.get("processing_time_ms", 0) / 1000.0)),
        total_streams=len(sessions_list),
        encrypted_streams=enc_count,
        cleartext_streams=len(sessions_list) - enc_count,
        composite_score=c_score,
        composite_grade=c_grade,
        composite_severity=c_sev,
        overall_status=c_stat,
        total_vulnerabilities=len(vulns),
        critical_vulnerabilities=crit_count,
        source=source,
        created_at=now_iso,
        raw_document=json.dumps(case_data),
    )


def extract_score_fields(case_data: dict[str, Any]) -> tuple[int, str, str, str]:
    """Extract composite score, letter grade, severity, and status defensively."""
    score_val = case_data.get("enterprise_score")
    if isinstance(score_val, dict):
        c_score = int(score_val.get("composite_score", 0))
        c_grade = str(score_val.get("composite_grade", "F"))
        c_sev = str(score_val.get("composite_severity", "critical"))
        c_stat = str(score_val.get("overall_status", "DEFICIENT"))
        return c_score, c_grade, c_sev, c_stat

    if isinstance(score_val, (int, float)):
        c_score = int(score_val)
        c_grade = str(case_data.get("enterprise_grade") or "F")
        if c_score >= 90:
            return c_score, c_grade, "secure", "COMPLIANT"
        if c_score >= 70:
            return c_score, c_grade, "low", "ACCEPTABLE"
        if c_score >= 50:
            return c_score, c_grade, "medium", "DEFICIENT"
        if c_score >= 25:
            return c_score, c_grade, "high", "WARNING"
        return c_score, c_grade, "critical", "TAMPERED"

    return 0, "F", "critical", "DEFICIENT"


def build_flow_session(case_id: str, s: dict[str, Any]) -> FlowSessionModel:
    """Build a FlowSessionModel instance from raw stream dictionary."""
    return FlowSessionModel(
        case_id=case_id,
        stream_id=int(s.get("stream_id") or s.get("session_id") or 0),
        src_ip=str(s.get("src_ip", "")),
        src_port=int(s.get("src_port", 0)),
        dst_ip=str(s.get("dst_ip", "")),
        dst_port=int(s.get("dst_port", 0)),
        protocol=str(s.get("protocol", "SMTP")),
        is_encrypted=bool(s.get("is_encrypted", False)),
        is_implicit_tls=bool(s.get("is_implicit_tls", False)),
        tls_version=s.get("tls_version"),
        cipher_suite=s.get("cipher_suite") or s.get("cipher_suite_name"),
        key_exchange=s.get("key_exchange"),
        has_forward_secrecy=bool(s.get("has_forward_secrecy", False)),
        score=int(s.get("score") or s.get("session_score") or 0),
        grade=str(s.get("grade") or "F"),
        severity=str(s.get("severity") or s.get("cipher_severity") or "critical"),
        ja3_hash=s.get("ja3_hash"),
        ja3_client_name=s.get("ja3_client_name"),
        pqc_status=s.get("pqc_status"),
        raw_session_json=json.dumps(s),
    )


def build_cert_evidence(session_id: int, cert: dict[str, Any]) -> CertificateEvidenceModel:
    """Build CertificateEvidenceModel from certificate dictionary."""
    return CertificateEvidenceModel(
        session_id=session_id,
        subject_cn=cert.get("subject_cn"),
        issuer_cn=cert.get("issuer_cn"),
        serial_number=str(cert.get("serial_number", "")) or None,
        not_before=cert.get("not_before"),
        not_after=cert.get("not_after"),
        is_expired=bool(cert.get("is_expired", False)),
        is_self_signed=bool(cert.get("is_self_signed", False)),
        signature_hash=cert.get("signature_hash"),
        is_weak_signature=bool(cert.get("is_weak_signature", False)),
        public_key_type=cert.get("public_key_type"),
        public_key_bits=cert.get("public_key_bits"),
        is_weak_key=bool(cert.get("is_weak_key", False)),
        is_synthetic=bool(cert.get("is_synthetic", False)),
        pem_data=cert.get("pem_data") or cert.get("synthetic_pem"),
        raw_der_hex=cert.get("raw_der_hex") or cert.get("synthetic_der_hex"),
    )


def build_finding_model(case_id: str, v: dict[str, Any]) -> SecurityFindingModel:
    """Build SecurityFindingModel from vulnerability dictionary."""
    return SecurityFindingModel(
        case_id=case_id,
        stream_id=v.get("stream_id") or v.get("session_id"),
        title=str(v.get("title", "")),
        severity=str(v.get("severity", "medium")),
        mitre_attack_id=v.get("mitre_attack_id"),
        mitre_attack_technique=v.get("mitre_attack_technique"),
        mitre_d3fend_id=v.get("mitre_d3fend_id"),
        nist_ref=v.get("nist_ref"),
        description=v.get("description"),
        remediation=v.get("remediation"),
    )
