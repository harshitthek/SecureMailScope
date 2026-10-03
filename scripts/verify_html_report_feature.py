import os
import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\user\.gemini\antigravity\brain\3b2907a4-36d5-4db1-a876-bbe86a182082"
BASE_URL = "http://localhost:3000"

def test_html_feature():
    print("[*] 1. Verifying Backend HTML Report Endpoint across all cases...")
    for case_id in ["CASE-01", "CASE-02", "CASE-03", "CASE-04"]:
        html_url = f"http://127.0.0.1:8000/api/report/{case_id}/html"
        with urllib.request.urlopen(html_url) as res:
            assert res.status == 200, f"Expected 200 for {html_url}"
            data = res.read().decode("utf-8")
            assert "<!DOCTYPE html>" in data, f"Missing DOCTYPE in {case_id}"
            assert "SecureMailScope Forensic Audit Dossier" in data, f"Missing title in {case_id}"
            assert "NIST SP 800-52r2" in data, f"Missing NIST section in {case_id}"
            print(f"  [+] {case_id} HTML Verified ({len(data)} characters)")

    print("\n[*] 2. Launching Playwright E2E UI Verification with Chrome...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        page = context.new_page()

        # Navigate to REPORT Deck
        print("[*] Navigating to Report Deck (Deck 7)...")
        page.goto(f"{BASE_URL}/?tab=REPORT", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Verify Export HTML button is visible
        export_html_btn = page.locator("button:has-text('Export HTML')")
        assert export_html_btn.is_visible(), "Export HTML button not visible in Report view"
        print("  [+] 'Export HTML' button is rendered and visible!")

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_report_view_html_export_button.png"), full_page=False)
        print("  [+] Captured test_report_view_html_export_button.png")

        # Test Shortcut HUD Modal ('?')
        print("[*] Testing Shortcut HUD Modal ('?') with HTML keybind...")
        page.keyboard.press("?")
        page.wait_for_timeout(500)

        hud_html_text = page.locator("text=Export HTML Dossier")
        assert hud_html_text.is_visible(), "Export HTML Dossier not visible in HUD modal"
        print("  [+] 'Export HTML Dossier [H]' verified in tactical HUD modal!")

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "test_shortcut_hud_with_html.png"), full_page=False)
        print("  [+] Captured test_shortcut_hud_with_html.png")

        page.keyboard.press("Escape")
        page.wait_for_timeout(400)

        browser.close()
        print("\n[SUCCESS] All HTML report end-to-end verifications passed 100%!")

if __name__ == "__main__":
    test_html_feature()
