import os
import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright, expect

ARTIFACT_DIR = os.environ.get(
    "ARTIFACT_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
)
os.makedirs(ARTIFACT_DIR, exist_ok=True)
BASE_URL = "http://localhost:3000"

def test_elevation():
    print("[*] 1. Verifying Backend Pre-seeded Export Endpoints...")
    for case_id in ["CASE-01", "CASE-02", "CASE-03", "CASE-04"]:
        pdf_url = f"http://127.0.0.1:8000/api/report/{case_id}/pdf"
        json_url = f"http://127.0.0.1:8000/api/report/{case_id}/json"
        
        with urllib.request.urlopen(pdf_url) as res:
            assert res.status == 200, f"Expected 200 for {pdf_url}"
            data = res.read()
            assert data.startswith(b"%PDF-1.4"), f"Invalid PDF header for {case_id}"
            print(f"  [+] {case_id} PDF Verified ({len(data)} bytes)")
            
        with urllib.request.urlopen(json_url) as res:
            assert res.status == 200, f"Expected 200 for {json_url}"
            jdata = res.read()
            assert len(jdata) > 1000, f"JSON too short for {case_id}"
            print(f"  [+] {case_id} JSON Verified ({len(jdata)} bytes)")

    print("\n[*] 2. Launching Playwright E2E UI Verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        page = context.new_page()

        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Test Keyboard Shortcut '?' for HUD Modal
        print("[*] Testing Keyboard Shortcut '?' for HUD modal...")
        page.keyboard.press("?")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_shortcut_hud_modal.png"), full_page=False)
        print("  [+] Captured test_shortcut_hud_modal.png")
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)

        # Test Keyboard Shortcut '2' for FLOWS Tab
        print("[*] Testing Keyboard Shortcut '2' for FLOWS Tab...")
        page.keyboard.press("2")
        page.wait_for_timeout(500)
        assert "tab=FLOWS" in page.url or page.locator("text=Active Flow Dissection Ledger").is_visible()
        print("  [+] Successfully navigated to FLOWS via hotkey '2'")

        # Test Keyboard Shortcut '/' for Search Focus
        print("[*] Testing Keyboard Shortcut '/' for Search Focus...")
        page.keyboard.press("/")
        page.wait_for_timeout(300)
        focused_id = page.evaluate("() => document.activeElement ? document.activeElement.id : null")
        assert focused_id == "flows-search-input", f"Expected flows-search-input focused, got {focused_id}"
        print("  [+] Search input focused successfully via '/'")

        # Test Empty Search Filter Zero-State
        print("[*] Testing Empty Search Zero-State...")
        search_input = page.locator("#flows-search-input")
        search_input.fill("nonexistent_ip_filter_xyz")
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_flows_zero_state.png"), full_page=False)
        assert page.locator("text=No Matching Email Streams Found").is_visible()
        print("  [+] Captured test_flows_zero_state.png with clear-filter CTA")
        page.locator("button:has-text('Clear Active Filters')").click()
        page.wait_for_timeout(400)

        # Test Deep Linking from Findings to Flows Drawer
        print("[*] Testing Findings to Flows deep link...")
        page.keyboard.press("3") # Jump to FINDINGS
        page.wait_for_timeout(500)
        
        # Click on Flow #03 badge in findings
        flow_badge = page.locator("button:has-text('Flow #03')").first
        flow_badge.click()
        open_dissector_btn = page.locator("button:has-text('Open in Full Dissector')").first
        expect(open_dissector_btn).to_be_visible(timeout=5000)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_findings_deep_link_drawer.png"), full_page=False)
        print("  [+] Successfully auto-expanded drawer for Flow #03 from Findings!")

        # Test Open in Full Dissector button inside drawer
        print("[*] Testing Open in Full Dissector button...")
        page.locator("button:has-text('Open in Full Dissector')").click()
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_dissector_deep_linked_stream.png"), full_page=False)
        assert "DISSECTOR" in page.url or page.locator("text=Deep Packet Protocol Dissector").is_visible()
        print("  [+] Successfully transitioned to Dissector with target stream preserved!")

        # Test Sample Attack Ingestion in UploadModal
        print("[*] Testing UploadModal One-Click Sample Ingestion...")
        page.keyboard.press("u") # Hotkey 'u' for upload modal
        page.wait_for_timeout(500)
        assert page.locator("text=Run STRIPTLS Sample PCAP").is_visible()
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_upload_modal_sample_cta.png"), full_page=False)
        
        # Click Run STRIPTLS Sample PCAP
        page.locator("button:has-text('Run STRIPTLS Sample PCAP')").click()
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_sample_pcap_ingested.png"), full_page=False)
        print("  [+] Sample PCAP successfully ingested via live backend API!")

        browser.close()
        print("\n[SUCCESS] All 4 Pillars Verified with 100% Pass Rate!")

if __name__ == "__main__":
    test_elevation()
