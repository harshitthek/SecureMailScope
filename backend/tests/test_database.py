"""
Unit and integration tests for SQLAlchemy 2.0 Async database persistence,
case repositories, and REST endpoints.
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.routes import _results
from app.db import CaseRepository, init_db, seed_reference_cases_if_needed
from app.main import app


@pytest.mark.asyncio
async def test_database_init_and_seed():
    """Verify schema initialization and idempotent seeding of benchmark cases."""
    await init_db()
    seeded = await seed_reference_cases_if_needed()
    assert seeded >= 0

    count = await CaseRepository.count_cases()
    assert count >= 4

    # Idempotent verification
    seeded_again = await seed_reference_cases_if_needed()
    assert seeded_again == 0


@pytest.mark.asyncio
async def test_case_repository_save_and_retrieve():
    """Verify persisting a case dossier and retrieving all relational entities."""
    sample_case = {
        "analysis_id": "TEST-DB-PERSIST-01",
        "filename": "test_evidence.pcap",
        "duration_seconds": 1.25,
        "enterprise_score": {
            "composite_score": 92,
            "composite_grade": "A",
            "composite_severity": "secure",
            "overall_status": "COMPLIANT",
        },
        "sessions": [
            {
                "stream_id": 101,
                "src_ip": "192.168.1.10",
                "src_port": 54321,
                "dst_ip": "10.0.0.1",
                "dst_port": 465,
                "protocol": "SMTPS",
                "is_encrypted": True,
                "is_implicit_tls": True,
                "tls_version": "TLS 1.3",
                "cipher_suite": "TLS_AES_256_GCM_SHA384",
                "key_exchange": "ECDHE",
                "has_forward_secrecy": True,
                "score": 95,
                "grade": "A+",
                "severity": "secure",
                "certificate": {
                    "subject_cn": "mail.test.gov",
                    "issuer_cn": "Test Root CA",
                    "serial_number": "999888",
                    "is_expired": False,
                    "is_self_signed": False,
                    "signature_hash": "SHA-256",
                    "public_key_type": "RSA",
                    "public_key_bits": 3072,
                },
            }
        ],
        "vulnerabilities": [
            {
                "stream_id": 101,
                "title": "Minor Cipher Mismatch",
                "severity": "low",
                "mitre_attack_id": "T1600.002",
                "description": "Noticeable preference for older suite",
            }
        ],
    }

    cid = await CaseRepository.save_case(sample_case, source="pytest")
    assert cid == "TEST-DB-PERSIST-01"

    fetched = await CaseRepository.get_case_by_id(cid)
    assert fetched is not None
    assert fetched["filename"] == "test_evidence.pcap"
    assert len(fetched["sessions"]) == 1
    assert fetched["sessions"][0]["stream_id"] == 101
    assert fetched["sessions"][0]["certificate"]["subject_cn"] == "mail.test.gov"
    assert len(fetched["vulnerabilities"]) == 1

    # Cleanup
    deleted = await CaseRepository.delete_case(cid)
    assert deleted is True
    assert await CaseRepository.get_case_by_id(cid) is None


@pytest.mark.asyncio
async def test_cases_rest_api_and_read_through_cache():
    """Verify /api/cases listing and DB read-through cache on /api/analysis/{id}."""
    await init_db()
    await seed_reference_cases_if_needed()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Test GET /api/cases
        res = await client.get("/api/cases")
        assert res.status_code == 200
        data = res.json()
        assert "total" in data
        assert data["total"] >= 4
        assert len(data["cases"]) >= 4

        # Evict CASE-01 from in-memory cache to force DB read-through
        _results.pop("CASE-01", None)

        res_case = await client.get("/api/analysis/CASE-01")
        assert res_case.status_code == 200
        case_data = res_case.json()
        assert case_data["analysis_id"] == "CASE-01"
        assert len(case_data["sessions"]) >= 1

        # Check in-memory cache is repopulated
        assert "CASE-01" in _results

        # Test DELETE /api/cases/{case_id}
        temp_case = {
            "analysis_id": "TEST-TO-DELETE",
            "filename": "delete_me.pcap",
            "enterprise_score": 50,
            "sessions": [],
            "vulnerabilities": [],
        }
        await CaseRepository.save_case(temp_case)

        del_res = await client.delete("/api/cases/TEST-TO-DELETE")
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "deleted"

        # Check it is truly gone
        not_found_res = await client.get("/api/analysis/TEST-TO-DELETE")
        assert not_found_res.status_code == 404
