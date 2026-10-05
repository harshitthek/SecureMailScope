"""
Unit and integration tests for dynamic remediation orchestration (Ansible, Suricata, Snort).
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.api.routes import _results
from app.main import app
from app.remediation import (
    build_remediation_summary,
    generate_ansible_playbook,
    generate_snort_rules,
    generate_suricata_rules,
)

SAMPLE_CASE = {
    "analysis_id": "TEST-REMED-01",
    "case_code": "CASE-TEST-01",
    "filename": "mail.gateway.gov.in",
    "protocols_detected": ["SMTP", "IMAP"],
    "vulnerabilities": [
        {
            "title": "STRIPTLS Downgrade Detected",
            "mitre_attack_id": "T1557.002",
            "severity": "critical",
        },
        {
            "title": "Cleartext Authentication Credentials Over Wire",
            "mitre_attack_id": "T1552.001",
            "severity": "critical",
        },
        {
            "title": "Deprecated SSL 3.0 / TLS 1.0 Handshake Negotiated",
            "mitre_attack_id": "T1600.001",
            "severity": "high",
        },
        {
            "title": "Insecure 3DES / Sweet32 Cipher Suite Offered",
            "mitre_attack_id": "T1600.002",
            "severity": "high",
        },
        {
            "title": "Expired X.509 Certificate",
            "mitre_attack_id": "T1556",
            "severity": "high",
        },
    ],
}


def test_ansible_playbook_generation():
    playbook = generate_ansible_playbook(SAMPLE_CASE)
    assert "-o smtpd_tls_security_level=encrypt" in playbook
    assert "postfix_master_cf" in playbook
    assert "smtpd_tls_auth_only = yes" in playbook
    assert "ssl = required" in playbook
    assert "Restart Postfix" in playbook
    assert "Restart Dovecot" in playbook
    assert "flush_handlers" in playbook
    assert "fail:" in playbook


def test_suricata_and_snort_rule_generation():
    suricata = generate_suricata_rules(SAMPLE_CASE)
    assert "sid:2615901" in suricata
    assert "AUTH PLAIN" in suricata
    assert "Deprecated SSL 3.0 Handshake" in suricata
    assert "Deprecated TLS 1.0 Handshake" in suricata
    assert "STARTTLS" not in suricata

    snort = generate_snort_rules(SAMPLE_CASE)
    assert "Snort 3 Detection Rules" in snort
    assert "sid:2615901" in snort


def test_remediation_summary_d3fend_mapping():
    summary = build_remediation_summary(SAMPLE_CASE)
    assert summary["case_code"] == "CASE-TEST-01"
    assert summary["action_items_count"] >= 3

    tech_ids = [t["technique_id"] for t in summary["d3fend_matrix"]]
    assert "D3-EAC" in tech_ids
    assert "D3-PA" in tech_ids
    assert "D3-CV" in tech_ids
    assert "D3-CSM" in tech_ids

    eac = next(t for t in summary["d3fend_matrix"] if t["technique_id"] == "D3-EAC")
    assert eac["status"] == "CRITICAL"
    assert any("master.cf" in a and "smtpd_tls_security_level=encrypt" in a for a in eac["actions"])


def test_remediation_summary_zero_actions_for_compliant_case():
    compliant_case = {
        "analysis_id": "TEST-COMPLIANT-01",
        "case_code": "CASE-COMPLIANT-01",
        "filename": "compliant.gateway.gov.in",
        "protocols_detected": ["SMTPS"],
        "vulnerabilities": [],
    }
    summary = build_remediation_summary(compliant_case)
    assert summary["action_items_count"] == 0


@pytest.fixture(autouse=True)
def setup_test_case():
    _results["TEST-REMED-01"] = SAMPLE_CASE
    yield
    _results.pop("TEST-REMED-01", None)


def test_remediation_api_endpoints():
    client = TestClient(app)

    # 1. Summary
    res = client.get("/api/remediation/TEST-REMED-01/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["case_code"] == "CASE-TEST-01"

    # 2. Ansible Playbook
    res_ansible = client.get("/api/remediation/TEST-REMED-01/ansible")
    assert res_ansible.status_code == 200
    assert "smtpd_tls_security_level" in res_ansible.text
    assert "attachment; filename=" in res_ansible.headers.get("content-disposition", "")

    # 3. Suricata
    res_suricata = client.get("/api/remediation/TEST-REMED-01/suricata")
    assert res_suricata.status_code == 200
    assert "sid:2615901" in res_suricata.text

    # 4. Snort
    res_snort = client.get("/api/remediation/TEST-REMED-01/snort")
    assert res_snort.status_code == 200
    assert "Snort 3 Detection Rules" in res_snort.text

    # 5. Non-existent case
    res_404 = client.get("/api/remediation/NON-EXISTENT-CASE/summary")
    assert res_404.status_code == 404
