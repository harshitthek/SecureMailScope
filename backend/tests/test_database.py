"""
Unit and integration tests for SQLAlchemy 2.0 Async database persistence,
case repositories, and REST endpoints.
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.routes import _results
from app.config import settings
from app.db import CaseRepository, init_db, seed_reference_cases_if_needed
from app.main import app


@pytest.mark.asyncio
async def test_database_init_and_seed():
    """Verify schema initialization and idempotent seeding of benchmark cases in isolated DB."""
    assert "test" in settings.database_url or "sms_" in settings.database_url
    await init_db()
    seeded = await seed_reference_cases_if_needed()
    assert seeded >= 0
    assert await CaseRepository.count_cases() >= 4
    assert await seed_reference_cases_if_needed() == 0


@pytest.mark.asyncio
async def test_case_repository_save_and_retrieve():
    """Verify persisting a case dossier and retrieving all relational entities."""
    sample_case = {
        "analysis_id": "TEST-DB-PERSIST-01",
        "filename": "test_evidence.pcap",
        "duration_seconds": 1.25,
        "enterprise_score": {"composite_score": 92, "composite_grade": "A", "overall_status": "COMPLIANT"},
        "sessions": [
            {
                "stream_id": 101,
                "src_ip": "192.168.1.10",
                "src_port": 54321,
                "dst_ip": "10.0.0.1",
                "dst_port": 465,
                "protocol": "SMTPS",
                "is_encrypted": True,
                "score": 95,
                "certificate": {
                    "subject_cn": "mail.test.gov",
                    "issuer_cn": "Test Root CA",
                    "serial_number": "999888",
                    "is_expired": False,
                },
            }
        ],
        "vulnerabilities": [{"stream_id": 101, "title": "Minor Mismatch", "severity": "low"}],
    }

    cid = await CaseRepository.save_case(sample_case, source="pytest")
    assert cid == "TEST-DB-PERSIST-01"

    fetched = await CaseRepository.get_case_by_id(cid)
    assert fetched is not None and fetched["filename"] == "test_evidence.pcap"
    assert len(fetched["sessions"]) == 1
    assert fetched["sessions"][0]["certificate"]["subject_cn"] == "mail.test.gov"

    assert await CaseRepository.delete_case(cid) is True
    assert await CaseRepository.get_case_by_id(cid) is None


@pytest.mark.asyncio
async def test_cases_rest_api_and_read_through_cache():
    """Verify /api/cases listing, pagination limits, auth, and read-through caching."""
    await init_db()
    await seed_reference_cases_if_needed()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Pagination bound validation
        res_overflow = await client.get("/api/cases?limit=500")
        assert res_overflow.status_code == 422
        res_neg = await client.get("/api/cases?offset=-1")
        assert res_neg.status_code == 422

        # Operator auth enforcement and authenticated operations
        test_key = "op-db-secret"
        auth_headers = {"X-API-Key": test_key}
        old_key = settings.operator_api_key
        try:
            settings.operator_api_key = test_key

            # Unauthenticated requests rejected
            unauth = await client.get("/api/cases")
            assert unauth.status_code == 401

            # Valid authenticated listing
            res = await client.get("/api/cases?limit=10", headers=auth_headers)
            assert res.status_code == 200 and res.json()["total"] >= 4

            # Read-through cache from DB
            _results.pop("CASE-01", None)
            res_case = await client.get("/api/analysis/CASE-01")
            assert res_case.status_code == 200 and "CASE-01" in _results

            # Authenticated case deletion
            temp = {"analysis_id": "TEST-TO-DEL", "filename": "del.pcap", "sessions": [], "vulnerabilities": []}
            await CaseRepository.save_case(temp)
            _results["TEST-TO-DEL"] = temp

            unauth_del = await client.delete("/api/cases/TEST-TO-DEL")
            assert unauth_del.status_code == 401

            del_res = await client.delete("/api/cases/TEST-TO-DEL", headers=auth_headers)
            assert del_res.status_code == 200 and "TEST-TO-DEL" not in _results
            assert (await client.get("/api/analysis/TEST-TO-DEL")).status_code == 404
        finally:
            settings.operator_api_key = old_key
