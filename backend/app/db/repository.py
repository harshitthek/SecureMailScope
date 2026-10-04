"""
Data access object (DAO) repository for forensic capture cases and relational evidence.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import desc, func, select

from app.db.models import CaptureCaseModel
from app.db.serializers import (
    build_capture_case,
    build_cert_evidence,
    build_finding_model,
    build_flow_session,
)
from app.db.session import async_session_factory

logger = logging.getLogger("securemailscope.repository")


class CaseRepository:
    """Async repository managing database persistence for forensic capture cases."""

    @classmethod
    async def save_case(cls, case_data: dict[str, Any], source: str = "manual_upload") -> str:
        """Persist or update a capture case with normalized relational sessions and findings."""
        case_id = case_data.get("analysis_id") or f"CASE-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        case_data["analysis_id"] = case_id
        now_iso = datetime.now(timezone.utc).isoformat()
        timestamp = case_data.get("analysis_timestamp") or case_data.get("analyzed_at") or now_iso

        async with async_session_factory() as session:
            async with session.begin():
                existing = await session.get(CaptureCaseModel, case_id)
                if existing:
                    await session.delete(existing)
                    await session.flush()

                capture = build_capture_case(case_id, case_data, timestamp, source, now_iso)
                session.add(capture)

                # Persist flow sessions and cert evidence
                for s in case_data.get("sessions", []):
                    flow = build_flow_session(case_id, s)
                    session.add(flow)
                    await session.flush()

                    cert = s.get("certificate")
                    if cert and isinstance(cert, dict):
                        session.add(build_cert_evidence(flow.id, cert))

                # Persist security findings
                for v in case_data.get("vulnerabilities", []):
                    session.add(build_finding_model(case_id, v))

        logger.info("Successfully persisted case dossier %s into database", case_id)
        return case_id

    @staticmethod
    async def get_case_by_id(case_id: str) -> dict[str, Any] | None:
        """Fetch full case dossier by identifier."""
        async with async_session_factory() as session:
            stmt = select(CaptureCaseModel.raw_document).where(CaptureCaseModel.id == case_id)
            result = await session.execute(stmt)
            raw = result.scalar_one_or_none()
            if raw:
                try:
                    return json.loads(raw)
                except Exception:
                    pass
            return None

    @staticmethod
    async def list_cases(limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
        """List summary records of all persisted capture cases."""
        async with async_session_factory() as session:
            stmt = (
                select(
                    CaptureCaseModel.id,
                    CaptureCaseModel.filename,
                    CaptureCaseModel.analysis_timestamp,
                    CaptureCaseModel.composite_grade,
                    CaptureCaseModel.composite_score,
                    CaptureCaseModel.composite_severity,
                    CaptureCaseModel.overall_status,
                    CaptureCaseModel.total_streams,
                    CaptureCaseModel.total_vulnerabilities,
                    CaptureCaseModel.critical_vulnerabilities,
                    CaptureCaseModel.source,
                )
                .order_by(desc(CaptureCaseModel.analysis_timestamp))
                .limit(limit)
                .offset(offset)
            )
            res = await session.execute(stmt)
            return [
                {
                    "id": r.id,
                    "filename": r.filename,
                    "analysis_timestamp": r.analysis_timestamp,
                    "composite_grade": r.composite_grade,
                    "composite_score": r.composite_score,
                    "composite_severity": r.composite_severity,
                    "overall_status": r.overall_status,
                    "total_streams": r.total_streams,
                    "total_vulnerabilities": r.total_vulnerabilities,
                    "critical_vulnerabilities": r.critical_vulnerabilities,
                    "source": r.source,
                }
                for r in res.all()
            ]

    @staticmethod
    async def count_cases() -> int:
        """Count total stored capture cases."""
        async with async_session_factory() as session:
            stmt = select(func.count(CaptureCaseModel.id))
            res = await session.execute(stmt)
            return int(res.scalar_one() or 0)

    @staticmethod
    async def delete_case(case_id: str) -> bool:
        """Delete case and cascade-delete all related sessions, findings, and certs."""
        async with async_session_factory() as session:
            async with session.begin():
                record = await session.get(CaptureCaseModel, case_id)
                if record:
                    await session.delete(record)
                    return True
                return False
