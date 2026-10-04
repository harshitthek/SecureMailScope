import os
import sys
import time
import urllib.request
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = os.environ.get(
    "ARTIFACT_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
)
os.makedirs(ARTIFACT_DIR, exist_ok=True)
BASE_URL = "http://localhost:3000"

def test_pqc_and_whatif():
    print("[*] 1. Verifying Backend PQC, MITRE, and Raw PEM/DER Endpoints...")
    
    # Check CASE-01 Certificate PEM
    pem_url = "http://127.0.0.1:8000/api/certificate/CASE-01/1/pem"
    with urllib.request.urlopen(pem_url) as res:
        assert res.status == 200, f"Expected 200 for {pem_url}"
        content_type = res.headers.get("Content-Type", "")
        body = res.read().decode("utf-8")
        assert "-----BEGIN CERTIFICATE-----" in body, "Expected PEM header"
        assert "-----END CERTIFICATE-----" in body, "Expected PEM footer"
        print(f"  [+] CASE-01 PEM Endpoint Verified ({len(body)} chars, Content-Type: {content_type})")

    # Check CASE-01 Certificate DER
    der_url = "http://127.0.0.1:8000/api/certificate/CASE-01/1/der"
    with urllib.request.urlopen(der_url) as res:
        assert res.status == 200, f"Expected 200 for {der_url}"
        der_bytes = res.read()
        assert len(der_bytes) > 100, "Expected valid DER bytes"
        print(f"  [+] CASE-01 DER Endpoint Verified ({len(der_bytes)} bytes)")

    # Check Analysis Data for PQC & MITRE fields
    analysis_url = "http://127.0.0.1:8000/api/analysis/CASE-01"
    with urllib.request.urlopen(analysis_url) as res:
        assert res.status == 200
        analysis = json.loads(res.read().decode("utf-8"))
        sessions = analysis.get("sessions", [])
        assert len(sessions) > 0, "No sessions found in CASE-01"
        has_pqc = any("pqc_status" in s for s in sessions)
        assert has_pqc, "Missing PQC status in sessions"
        print(f"  [+] CASE-01 PQC Posture Verified ({len(sessions)} sessions, status: {sessions[0].get('pqc_status')})")

    # Verify MITRE in findings on CASE-02 / CASE-04
    for case_id in ["CASE-02", "CASE-03", "CASE-04"]:
        with urllib.request.urlopen(f"http://127.0.0.1:8000/api/analysis/{case_id}") as res:
            cdata = json.loads(res.read().decode("utf-8"))
            findings = cdata.get("vulnerabilities", [])
            assert len(findings) > 0, f"No findings found in {case_id}"
            has_mitre = any("mitre_attack_id" in f and f["mitre_attack_id"] for f in findings)
            assert has_mitre, f"Missing MITRE ATT&CK annotations in {case_id}"
            print(f"  [+] {case_id} MITRE Annotations Verified ({len(findings)} findings, e.g. {findings[0].get('mitre_attack_id')})")

    print("\n[*] 2. Launching Playwright E2E UI Verification for Phase 1-3...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 1050})
        page = context.new_page()

        # Load page
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # 1. Overview Tab & What-If Simulator
        print("[*] Testing What-If Simulator in Overview...")
        what_if_header = page.locator("text=Real-Time Posture Elevation").first
        assert what_if_header.is_visible(), "What-If Simulator not visible on Overview"
        
        # Scroll to What-If simulator
        what_if_header.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_what_if_simulator_initial.png"), full_page=False)
        print("  [+] Captured test_what_if_simulator_initial.png")

        # Click Max Hardening to simulate enterprise policy hardening
        max_btn = page.locator("button:has-text('Max Hardening')")
        assert max_btn.is_visible(), "Max Hardening button not found"
        max_btn.click()
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_what_if_simulator_hardened.png"), full_page=False)
        print("  [+] Clicked 'Max Hardening' and captured test_what_if_simulator_hardened.png")

        # 2. Flows View - PQC Column
        print("[*] Testing Flows View PQC Column...")
        page.keyboard.press("2") # Tab 2 = Flows
        page.wait_for_timeout(600)
        pqc_col_header = page.locator("th:has-text('PQC Risk')")
        assert pqc_col_header.is_visible(), "PQC Risk column header not found in Flows table"
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_flows_pqc_column.png"), full_page=False)
        print("  [+] Captured test_flows_pqc_column.png")

        # 3. Findings View - MITRE ATT&CK & D3FEND
        print("[*] Testing Findings View MITRE Badges...")
        page.keyboard.press("3") # Tab 3 = Findings
        page.wait_for_timeout(600)
        mitre_badge = page.locator("text=MITRE ATT&CK:").first
        assert mitre_badge.is_visible(), "MITRE ATT&CK badge not found in Findings view"
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_findings_mitre_badges.png"), full_page=False)
        print("  [+] Captured test_findings_mitre_badges.png")

        # 4. Certificates View - Download PEM / DER Actions
        print("[*] Testing Certificates View Raw Exports...")
        page.keyboard.press("4") # Tab 4 = Certificates
        page.wait_for_timeout(600)
        pem_btn = page.locator("a:has-text('.PEM')").first
        der_btn = page.locator("a:has-text('.DER')").first
        assert pem_btn.is_visible(), "Download .PEM button not visible"
        assert der_btn.is_visible(), "Download .DER button not visible"
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_certificates_pem_actions.png"), full_page=False)
        print("  [+] Captured test_certificates_pem_actions.png")

        # 5. Dissector View - PQC & HNDL Card
        print("[*] Testing Dissector View PQC Card...")
        page.keyboard.press("5") # Tab 5 = Dissector
        page.wait_for_timeout(600)
        pqc_audit_card = page.locator("text=Post-Quantum Cryptography").first
        assert pqc_audit_card.is_visible(), "PQC card not visible in Dissector Audit mode"
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_dissector_pqc_card.png"), full_page=False)
        print("  [+] Captured test_dissector_pqc_card.png")

        browser.close()
        print("\n[SUCCESS] Elite Defense Elevation Phases 1, 2, and 3 Verified 100%!")

if __name__ == "__main__":
    test_pqc_and_whatif()
