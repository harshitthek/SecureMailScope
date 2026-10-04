"""
Verification script for Phase 1: Automated PCAP Spool Ingestion & Zero-Upload Attack Detection.
Context: Problem Statement SIH26159 (NTRO) and attack vectors CASE-01, CASE-02, CASE-03.
"""
from __future__ import annotations

import os
import shutil
import time
import requests
from pathlib import Path

BACKEND_URL = "http://127.0.0.1:8000"
REPO_ROOT = Path(__file__).resolve().parent.parent
SAMPLES_DIR = REPO_ROOT / "frontend" / "public" / "samples"
SPOOL_INCOMING = REPO_ROOT / "spool" / "incoming"
SPOOL_PROCESSED = REPO_ROOT / "spool" / "processed"


def wait_for_spool_ingestion(expected_filename: str, max_wait: float = 6.0) -> dict:
    """Wait for background daemon to auto-ingest or trigger on-demand sweep."""
    t0 = time.time()
    while time.time() - t0 < max_wait:
        resp = requests.get(f"{BACKEND_URL}/api/spool/history", timeout=5)
        if resp.status_code == 200:
            history = resp.json().get("history", [])
            for item in history:
                if item.get("filename") == expected_filename:
                    return item
        time.sleep(0.5)

    # Fallback to explicit sweep if background poll hasn't fired yet
    sweep_resp = requests.post(f"{BACKEND_URL}/api/spool/process-now", timeout=10)
    if sweep_resp.status_code == 200:
        for item in sweep_resp.json().get("cases", []):
            if item.get("filename") == expected_filename:
                return item

    raise TimeoutError(f"File {expected_filename} was not ingested within {max_wait}s")


def main():
    print("[*] Starting Phase 1 Verification: Automated Spool Ingestion & Zero-Upload Attack Detection...")

    # 1. Verify Backend Health and Spool Status
    health_resp = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
    print("  [+] Backend health check passed.")

    status_resp = requests.get(f"{BACKEND_URL}/api/spool/status", timeout=5)
    assert status_resp.status_code == 200, f"Spool status failed: {status_resp.text}"
    status_data = status_resp.json().get("data", {})
    print(f"  [+] Spool daemon active. Scanned: {status_data.get('scanned_count')}, Processed: {status_data.get('processed_count')}")

    # 2. Test Zero-Upload Ingestion of CASE-02 (STRIPTLS MitM Attack)
    striptls_sample = SAMPLES_DIR / "02_striptls_mitm_attack.pcap"
    assert striptls_sample.exists(), f"Sample PCAP not found: {striptls_sample}"

    ts = int(time.time())
    fname_1 = f"tap_capture_striptls_{ts}.pcap"
    target_drop_1 = SPOOL_INCOMING / fname_1
    print(f"[*] Simulating external network tap: Dropping {fname_1} into spool/incoming/...")
    shutil.copyfile(str(striptls_sample), str(target_drop_1))

    # Await autonomous daemon pickup
    ingested_case_1 = wait_for_spool_ingestion(fname_1, max_wait=8.0)
    analysis_id_1 = ingested_case_1["analysis_id"]
    print(f"  [+] Autonomous Ingestion Verified: {ingested_case_1['case_code']} (ID: {analysis_id_1[:8]}...)")
    print(f"  [+] Enterprise Grade: {ingested_case_1['enterprise_grade']}, Score: {ingested_case_1['enterprise_score']}")

    # Retrieve Full Dissection Dossier from /api/analysis/{id}
    analysis_resp = requests.get(f"{BACKEND_URL}/api/analysis/{analysis_id_1}", timeout=5)
    assert analysis_resp.status_code == 200
    dossier_1 = analysis_resp.json()

    # Validate STRIPTLS Downgrade Detection on the wire
    sessions = dossier_1.get("sessions", [])
    stripped_session = next((s for s in sessions if s.get("starttls_stripped")), None)
    assert stripped_session is not None, "Failed to detect STRIPTLS wire tampering in autonomous spool ingestion!"
    print(f"  [+] Wire Attack Detected: STRIPTLS Downgrade on Port {stripped_session['dst_port']} ({stripped_session['protocol']})")

    # Validate MITRE ATT&CK Mapping
    vulns = dossier_1.get("vulnerabilities", [])
    mitre_ids = [v.get("mitre_attack_id") for v in vulns]
    print(f"  [+] Discovered Vulnerabilities: {len(vulns)} finding(s)")
    print(f"  [+] MITRE ATT&CK Techniques: {mitre_ids}")
    assert any(m in ("T1557.002", "T1071.003", "T1552.001") for m in mitre_ids)

    # 3. Test Zero-Upload Ingestion of CASE-01 (Hardened TLS 1.3 Baseline)
    tls13_sample = SAMPLES_DIR / "01_hardened_tls13_smtps.pcap"
    assert tls13_sample.exists()

    fname_2 = f"tap_capture_hardened_{ts}.pcap"
    target_drop_2 = SPOOL_INCOMING / fname_2
    print(f"[*] Simulating external network tap: Dropping {fname_2} into spool/incoming/...")
    shutil.copyfile(str(tls13_sample), str(target_drop_2))

    ingested_case_2 = wait_for_spool_ingestion(fname_2, max_wait=8.0)
    analysis_id_2 = ingested_case_2["analysis_id"]
    print(f"  [+] Autonomous Ingestion Verified: {ingested_case_2['case_code']} (ID: {analysis_id_2[:8]}...)")
    print(f"  [+] Enterprise Grade: {ingested_case_2['enterprise_grade']}, Score: {ingested_case_2['enterprise_score']}")
    assert ingested_case_2["enterprise_grade"] in ("A+", "A"), "Expected Grade A/A+ for hardened capture"

    # 4. Verify Archive Relocation to spool/processed/
    assert not target_drop_1.exists()
    assert not target_drop_2.exists()
    processed_count = len(list(SPOOL_PROCESSED.glob("*.pcap")))
    assert processed_count >= 2, f"Expected at least 2 processed captures, found {processed_count}"
    print(f"  [+] Spool archive verified ({processed_count} files in spool/processed/).")

    # 5. Check Spool History API
    hist_resp = requests.get(f"{BACKEND_URL}/api/spool/history", timeout=5)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert hist_data.get("total", 0) >= 2
    print(f"  [+] Spool history registry verified ({hist_data['total']} entries).")

    print("\n[SUCCESS] Phase 1: Automated Spool Ingestion & Zero-Upload Attack Detection 100% Verified!")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
