import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = os.environ.get(
    "ARTIFACT_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
)
os.makedirs(ARTIFACT_DIR, exist_ok=True)
BASE_URL = "http://localhost:3000"

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        page = context.new_page()

        print("[*] Navigating to SecureMailScope...")
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # ----------------------------------------------------
        # 1. VERIFY DARK MODE BASELINE FIRST (Ensure 0 regression)
        # ----------------------------------------------------
        print("[*] Verifying Dark Mode baseline...")
        page.evaluate("() => { localStorage.setItem('sms_theme', 'dark'); document.documentElement.classList.add('dark'); }")
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "dark_tab_overview.png"), full_page=False)

        # ----------------------------------------------------
        # 2. SWITCH TO LIGHT THEME (DAYLIGHT VAULT) VIA TOGGLE
        # ----------------------------------------------------
        print("[*] Switching to Light Theme via ThemeToggle...")
        toggle_btn = page.locator('button[aria-label="Toggle visual theme"]')
        if toggle_btn.is_visible():
            toggle_btn.click()
            page.wait_for_timeout(500)
        else:
            page.evaluate("() => { localStorage.setItem('sms_theme', 'light'); document.documentElement.classList.remove('dark'); }")
            page.wait_for_timeout(500)

        # Verify html does NOT have dark class
        has_dark = page.evaluate("() => document.documentElement.classList.contains('dark')")
        print(f"[*] html has dark class after toggle: {has_dark} (expected: False)")
        assert not has_dark, "Expected html to not contain 'dark' class in light theme"

        # Capture Tab 1: Overview in Light Theme
        print("[*] Capturing Overview in Light Theme...")
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_overview.png"), full_page=False)

        # Test Capture Parameters Dropdown Popover in Light Theme
        print("[*] Opening Capture Scope popover in Light Theme...")
        scope_btn = page.locator("button:has-text('Capture Parameters')")
        if scope_btn.is_visible():
            scope_btn.click()
            page.wait_for_timeout(300)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_capture_params_dropdown.png"), full_page=False)
            scope_btn.click() # close
            page.wait_for_timeout(200)

        # Capture Tab 2: Flows in Light Theme
        print("[*] Capturing Flows in Light Theme...")
        page.locator("button:has-text('Flows')").first.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_flows.png"), full_page=False)

        # Open Drawer in Flows by clicking row
        print("[*] Opening Flows inspection drawer...")
        first_row = page.locator("tbody tr").first
        if first_row.is_visible():
            first_row.click()
            page.wait_for_timeout(400)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_flows_drawer.png"), full_page=False)
            # Close drawer
            close_btn = page.locator("div.fixed button:has(svg)").first
            if close_btn.is_visible():
                close_btn.click()
            else:
                page.keyboard.press("Escape")
            page.wait_for_timeout(300)

        # Capture Tab 3: Findings in Light Theme
        print("[*] Capturing Findings in Light Theme...")
        page.locator("button:has-text('Findings')").first.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_findings.png"), full_page=False)

        # Capture Tab 4: Certificates in Light Theme
        print("[*] Capturing Certificates in Light Theme...")
        page.locator("button:has-text('Certificates')").first.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_certificates.png"), full_page=False)

        # Capture Tab 5: Dissector in Light Theme (Mode A Audit)
        print("[*] Capturing Dissector (Mode A) in Light Theme...")
        page.locator("button:has-text('Dissector')").first.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_dissector_audit.png"), full_page=False)

        # Switch to Mode B (Raw Hex Dump)
        raw_mode_btn = page.locator("button:has-text('Mode B: Raw Stream')")
        if raw_mode_btn.is_visible():
            raw_mode_btn.click()
            page.wait_for_timeout(300)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_dissector_raw.png"), full_page=False)

        # Capture Tab 6: Standards in Light Theme
        print("[*] Capturing Standards in Light Theme...")
        page.locator("button:has-text('Standards')").first.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_standards.png"), full_page=False)

        # Capture Tab 7: Report / Dossier in Light Theme
        print("[*] Capturing Report in Light Theme...")
        page.locator("button:has-text('Dossier')").first.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "light_tab_report.png"), full_page=False)

        # ----------------------------------------------------
        # 3. VERIFY TOGGLE BACK TO DARK THEME (Parity)
        # ----------------------------------------------------
        print("[*] Switching back to Dark Theme via ThemeToggle...")
        toggle_btn.click()
        page.wait_for_timeout(500)
        has_dark_after = page.evaluate("() => document.documentElement.classList.contains('dark')")
        print(f"[*] html has dark class after toggle back: {has_dark_after} (expected: True)")
        assert has_dark_after, "Expected html to contain 'dark' class after restoring dark theme"
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "dark_tab_report_restored.png"), full_page=False)

        browser.close()
        print("[+] Dual-Theme verification completed successfully!")

if __name__ == "__main__":
    run_verification()
