"""
SQLAlchemy 2.0 relational schema models for forensic capture cases, flow sessions,
security findings, and X.509 certificate evidence.
"""

from __future__ import annotations

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CaptureCaseModel(Base):
    """Normalized relational record for an ingested or analyzed network capture case."""

    __tablename__ = "captures"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    analysis_timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    total_streams: Mapped[int] = mapped_column(Integer, default=0)
    encrypted_streams: Mapped[int] = mapped_column(Integer, default=0)
    cleartext_streams: Mapped[int] = mapped_column(Integer, default=0)
    composite_score: Mapped[int] = mapped_column(Integer, default=0)
    composite_grade: Mapped[str] = mapped_column(String(8), default="F")
    composite_severity: Mapped[str] = mapped_column(String(32), default="critical")
    overall_status: Mapped[str] = mapped_column(String(32), default="DEFICIENT")
    total_vulnerabilities: Mapped[int] = mapped_column(Integer, default=0)
    critical_vulnerabilities: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str] = mapped_column(String(32), default="manual_upload")
    created_at: Mapped[str] = mapped_column(String(64), nullable=False)
    raw_document: Mapped[str] = mapped_column(Text, nullable=False)

    sessions: Mapped[list[FlowSessionModel]] = relationship(
        back_populates="capture", cascade="all, delete-orphan", lazy="selectin"
    )
    findings: Mapped[list[SecurityFindingModel]] = relationship(
        back_populates="capture", cascade="all, delete-orphan", lazy="selectin"
    )


class FlowSessionModel(Base):
    """Reconstructed bidirectional email flow session within a capture case."""

    __tablename__ = "flow_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("captures.id", ondelete="CASCADE"), index=True)
    stream_id: Mapped[int] = mapped_column(Integer)
    src_ip: Mapped[str] = mapped_column(String(64))
    src_port: Mapped[int] = mapped_column(Integer)
    dst_ip: Mapped[str] = mapped_column(String(64))
    dst_port: Mapped[int] = mapped_column(Integer)
    protocol: Mapped[str] = mapped_column(String(16))
    is_encrypted: Mapped[bool] = mapped_column(Boolean, default=False)
    is_implicit_tls: Mapped[bool] = mapped_column(Boolean, default=False)
    tls_version: Mapped[str | None] = mapped_column(String(32), nullable=True)
    cipher_suite: Mapped[str | None] = mapped_column(String(128), nullable=True)
    key_exchange: Mapped[str | None] = mapped_column(String(32), nullable=True)
    has_forward_secrecy: Mapped[bool] = mapped_column(Boolean, default=False)
    score: Mapped[int] = mapped_column(Integer, default=0)
    grade: Mapped[str] = mapped_column(String(8), default="F")
    severity: Mapped[str] = mapped_column(String(32), default="critical")
    ja3_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    ja3_client_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    pqc_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    raw_session_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    capture: Mapped[CaptureCaseModel] = relationship(back_populates="sessions")
    certificates: Mapped[list[CertificateEvidenceModel]] = relationship(
        back_populates="session", cascade="all, delete-orphan", lazy="selectin"
    )


class SecurityFindingModel(Base):
    """Cryptographic vulnerability or protocol violation finding tagged with MITRE ATT&CK/D3FEND."""

    __tablename__ = "security_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("captures.id", ondelete="CASCADE"), index=True)
    stream_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    severity: Mapped[str] = mapped_column(String(32))
    mitre_attack_id: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    mitre_attack_technique: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mitre_d3fend_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    nist_ref: Mapped[str | None] = mapped_column(String(64), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    remediation: Mapped[str | None] = mapped_column(Text, nullable=True)

    capture: Mapped[CaptureCaseModel] = relationship(back_populates="findings")


class CertificateEvidenceModel(Base):
    """Leaf and chain X.509 certificate evidence extracted from TLS handshakes."""

    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("flow_sessions.id", ondelete="CASCADE"), index=True)
    subject_cn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issuer_cn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    serial_number: Mapped[str | None] = mapped_column(String(128), nullable=True)
    not_before: Mapped[str | None] = mapped_column(String(64), nullable=True)
    not_after: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_expired: Mapped[bool] = mapped_column(Boolean, default=False)
    is_self_signed: Mapped[bool] = mapped_column(Boolean, default=False)
    signature_hash: Mapped[str | None] = mapped_column(String(32), nullable=True)
    is_weak_signature: Mapped[bool] = mapped_column(Boolean, default=False)
    public_key_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    public_key_bits: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_weak_key: Mapped[bool] = mapped_column(Boolean, default=False)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)
    pem_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_der_hex: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped[FlowSessionModel] = relationship(back_populates="certificates")
