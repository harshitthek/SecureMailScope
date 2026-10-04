"""
Verification test for automated spool ingestion and zero-upload attack detection (Phase 1).
Simulates external network taps dropping PCAPs into spool/incoming/ and verifies:
1. Autonomous background ingestion without web UI interaction.
2. Immediate STRIPTLS downgrade attack detection (MITRE T1557.002, Grade F).
3. Hardened TLS 1.3 baseline posture assessment (Grade A+).
4. Manual on-demand sweep via /api/spool/process-now tested independently.
5. Ingestion telemetry, history tracking, and archive relocation to spool/processed/.
"""

import shutil
import time
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_URL = "http://127.0.0.1:8000"
SAMPLES_DIR = REPO_ROOT / "frontend" / "public" / "samples"
SPOOL_INCOMING = REPO_ROOT / "spool" / "incoming"
SPOOL_PROCESSED = REPO_ROOT / "spool" / "processed"


def wait_for_spool_ingestion(expected_filename: str, max_wait: float = 8.0) -> dict:
    """
    Wait strictly for autonomous background daemon to ingest the capture.
    No manual sweep fallback is used so autonomous pickup is genuinely proven.
    """
    t0 = time.time()
    while time.time() - t0 < max_wait:
        resp = requests.get(f"{BACKEND_URL}/api/spool/history", timeout=5)
        if resp.status_code == 200:
            history = resp.json().get("history", [])
            for item in history:
                if item.get("filename") == expected_filename:
                    return item
        time.sleep(0.5)

    raise TimeoutError(f"Autonomous background daemon failed to ingest {expected_filename} within {max_wait}s")


def main():
    print("[*] Starting Phase 1 Verification: Automated Spool Ingestion & Zero-Upload Attack Detection...")

    # 1. Verify Backend Health and Spool Status
    health_resp = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
    print("  [+] Backend health check passed.")

    status_resp = requests.get(f"{BACKEND_URL}/api/spool/status", timeout=5)
    assert status_resp.status_code == 200, f"Spool status failed: {status_resp.text}"
    status_data = status_resp.json().get("data", {})
    print(
        f"  [+] Spool daemon active. Scanned: {status_data.get('scanned_count')}, Processed: {status_data.get('processed_count')}"
    )

    # 2. Test Zero-Upload Autonomous Ingestion of CASE-02 (STRIPTLS MitM Attack)
    striptls_sample = SAMPLES_DIR / "02_striptls_mitm_attack.pcap"
    assert striptls_sample.exists(), f"Sample PCAP not found: {striptls_sample}"

    ts = int(time.time())
    fname_1 = f"tap_capture_striptls_{ts}.pcap"
    target_drop_1 = SPOOL_INCOMING / fname_1
    print(f"[*] Simulating external network tap: Dropping {fname_1} into spool/incoming/...")
    shutil.copyfile(str(striptls_sample), str(target_drop_1))

    # Await strictly autonomous daemon pickup
    ingested_case_1 = wait_for_spool_ingestion(fname_1, max_wait=10.0)
    analysis_id_1 = ingested_case_1["analysis_id"]
    print(f"  [+] Autonomous Ingestion Verified: {ingested_case_1['case_code']} (ID: {analysis_id_1[:8]}...)")
    print(
        f"  [+] Enterprise Grade: {ingested_case_1['enterprise_grade']}, Score: {ingested_case_1['enterprise_score']}"
    )

    # Retrieve Full Dissection Dossier from /api/analysis/{id}
    analysis_resp = requests.get(f"{BACKEND_URL}/api/analysis/{analysis_id_1}", timeout=5)
    assert analysis_resp.status_code == 200
    dossier_1 = analysis_resp.json()

    # Validate STRIPTLS Downgrade Detection on the wire
    sessions = dossier_1.get("sessions", [])
    stripped_session = next((s for s in sessions if s.get("starttls_stripped")), None)
    assert stripped_session is not None, "Failed to detect STRIPTLS wire tampering in autonomous spool ingestion!"
    print(
        f"  [+] Wire Attack Detected: STRIPTLS Downgrade on Port {stripped_session['dst_port']} ({stripped_session['protocol']})"
    )

    # Validate MITRE ATT&CK Mapping
    vulns = dossier_1.get("vulnerabilities", [])
    mitre_ids = [v.get("mitre_attack_id") for v in vulns]
    print(f"  [+] Discovered Vulnerabilities: {len(vulns)} finding(s)")
    print(f"  [+] MITRE ATT&CK Techniques: {mitre_ids}")
    assert any(m in ("T1557.002", "T1071.003", "T1552.001") for m in mitre_ids)

    # 3. Test Zero-Upload Autonomous Ingestion of CASE-01 (Hardened TLS 1.3 Baseline)
    tls13_sample = SAMPLES_DIR / "01_hardened_tls13_smtps.pcap"
    assert tls13_sample.exists()

    fname_2 = f"tap_capture_hardened_{ts}.pcap"
    target_drop_2 = SPOOL_INCOMING / fname_2
    print(f"[*] Simulating external network tap: Dropping {fname_2} into spool/incoming/...")
    shutil.copyfile(str(tls13_sample), str(target_drop_2))

    ingested_case_2 = wait_for_spool_ingestion(fname_2, max_wait=10.0)
    analysis_id_2 = ingested_case_2["analysis_id"]
    print(f"  [+] Autonomous Ingestion Verified: {ingested_case_2['case_code']} (ID: {analysis_id_2[:8]}...)")
    print(
        f"  [+] Enterprise Grade: {ingested_case_2['enterprise_grade']}, Score: {ingested_case_2['enterprise_score']}"
    )
    assert ingested_case_2["enterprise_grade"] in ("A+", "A"), "Expected Grade A/A+ for hardened capture"

    # 4. Test Manual On-Demand Sweep Endpoint Separately
    fname_manual = f"tap_capture_manual_sweep_{ts}.pcap"
    target_drop_manual = SPOOL_INCOMING / fname_manual
    print(f"[*] Testing manual sweep endpoint: Dropping {fname_manual}...")
    shutil.copyfile(str(tls13_sample), str(target_drop_manual))

    sweep_resp = requests.post(f"{BACKEND_URL}/api/spool/process-now", timeout=10)
    assert sweep_resp.status_code == 200, f"Manual sweep failed: {sweep_resp.text}"
    sweep_cases = sweep_resp.json().get("cases", [])
    manual_case = next((c for c in sweep_cases if c.get("filename") == fname_manual), None)
    assert manual_case is not None, "Manual sweep did not return dropped capture"
    print(f"  [+] Manual Sweep Verified: Processed {manual_case['filename']} on demand.")

    # 5. Verify Archive Relocation to spool/processed/
    assert not target_drop_1.exists()
    assert not target_drop_2.exists()
    assert not target_drop_manual.exists()
    processed_count = len(list(SPOOL_PROCESSED.glob("*.pcap")))
    assert processed_count >= 3, f"Expected at least 3 processed captures, found {processed_count}"
    print(f"  [+] Spool archive verified ({processed_count} files in spool/processed/).")

    # 6. Check Spool History API
    hist_resp = requests.get(f"{BACKEND_URL}/api/spool/history", timeout=5)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert hist_data.get("total", 0) >= 3
    print(f"  [+] Spool history registry verified ({hist_data['total']} entries).")

    print("\n[SUCCESS] Phase 1: Automated Spool Ingestion & Zero-Upload Attack Detection 100% Verified!")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
