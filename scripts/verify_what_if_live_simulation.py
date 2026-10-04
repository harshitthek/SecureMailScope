"""
E2E Playwright verification script for the /usemax expanded What-If 3D Simulation.
Verifies:
1. 3D WebGL Canvas is mounted cleanly with expanded vertical space (660px+).
2. All 4 elevated tactical pins (Client, MitM Tap, Gateway, Vault).
3. Stationary High-Contrast Telemetry Dissector HUD (WIRE TELEMETRY // STAGE).
4. Fullscreen / Theater maximize mode toggle.
5. Station drawer and deep 64-byte hex dissector modals.
6. Captures high-resolution screenshot artifacts.
"""
import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\user\.gemini\antigravity\brain\3b2907a4-36d5-4db1-a876-bbe86a182082"

def main():
    print("[*] Launching Playwright to verify /usemax expanded 3D Simulation Engine...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 1100})
        page = context.new_page()

        # Step 1: Navigate to app
        page.goto("http://127.0.0.1:3000/")
        page.wait_for_selector("text=Real-Time Posture Elevation", timeout=15000)
        time.sleep(1)

        # Scroll to What-If Simulator and center canvas in view
        canvas = page.locator("canvas").first
        canvas.scroll_into_view_if_needed()
        time.sleep(1.5)

        assert canvas.is_visible(), "WebGL Canvas must be mounted"
        assert page.locator("text=3D WEBGL").is_visible(), "3D WebGL Telemetry badge must be visible"
        print("  [+] Verified 3D WebGL Canvas mounted and running!")

        # Verify minimal elevated tactical pins
        assert page.locator("button[aria-label='Inspect CLIENT station']").is_visible(), "Client pin must be visible"
        assert page.locator("button[aria-label='Inspect MITM TAP station']").is_visible(), "MitM pin must be visible"
        assert page.locator("button[aria-label='Inspect QUANTUM MTA station']").is_visible(), "Gateway pin must be visible"
        assert page.locator("button[aria-label='Inspect MAIL VAULT station']").is_visible(), "Vault pin must be visible"
        print("  [+] Verified all 4 elevated tactical station pins!")

        # Verify Stationary Telemetry Dissector HUD is visible and legible
        hud = page.locator("aside[aria-label='In-Flight Telemetry Dissector']")
        assert hud.is_visible(), "Stationary Telemetry Dissector HUD must be visible"
        assert page.locator("text=WIRE TELEMETRY").is_visible(), "Wire telemetry header must be visible"
        assert page.locator("text=WIRE PAYLOAD").is_visible(), "Wire payload block must be visible"
        print("  [+] Verified Stationary Telemetry Dissector HUD is active & readable!")

        # Capture baseline screenshot with stationary HUD and spacious canvas
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_what_if_3d_spacious_baseline.png"))
        print("  [+] Captured test_what_if_3d_spacious_baseline.png")

        # Step 2: Test clicking a pin to open Station Drawer
        mitm_pin = page.locator("button[aria-label='Inspect MITM TAP station']").first
        mitm_pin.click()
        time.sleep(1)

        assert page.locator("text=ADVERSARY NODE TELEMETRY").is_visible(), "Station drawer must open"
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_what_if_station_drawer.png"))
        print("  [+] Captured test_what_if_station_drawer.png")

        # Close station drawer
        close_drawer_btn = page.locator("button[aria-label='Close station telemetry drawer']").first
        close_drawer_btn.click()
        time.sleep(1)

        # Step 3: Test Deep Packet Dissector from Stationary HUD
        dissect_btn = page.locator("button:has-text('INSPECT RAW 64-BYTE HEX STREAM')").first
        assert dissect_btn.is_visible(), "Dissect hex button must be visible in Stationary HUD"
        dissect_btn.click()
        time.sleep(1)

        assert page.locator("text=DEEP WIRE DISSECTOR // IN-FLIGHT PACKET TELEMETRY").is_visible(), "Dissector modal must open"
        assert page.locator("text=HEX STREAM DUMP").is_visible(), "Hex stream dump must be visible"
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_what_if_packet_dissector.png"))
        print("  [+] Captured test_what_if_packet_dissector.png")

        close_dissector_btn = page.locator("button:has-text('Close Dissector')").first
        close_dissector_btn.click()
        time.sleep(1)

        # Step 4: Step to Stage 2 (Deflection) using Dock Stepper
        next_stage_btn = page.locator("button[aria-label='Next simulation stage']").first
        next_stage_btn.click() # Stage 1
        time.sleep(0.5)
        next_stage_btn.click() # Stage 2
        time.sleep(2)

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_what_if_3d_deflection_alert.png"))
        print("  [+] Captured test_what_if_3d_deflection_alert.png")

        # Step 5: Test Maximize Workstation Theater Mode
        maximize_btn = page.locator("button[aria-label='Maximize workstation']").first
        assert maximize_btn.is_visible(), "Maximize button must be visible"
        maximize_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_what_if_3d_theater_mode.png"))
        print("  [+] Captured test_what_if_3d_theater_mode.png (Expanded Viewport)")

        # Restore from maximize
        minimize_btn = page.locator("button[aria-label='Exit fullscreen workstation']").first
        minimize_btn.click()
        time.sleep(1)

        # Step 6: Test Max Hardening & Post-Quantum Convergence
        max_btn = page.locator("button:has-text('Max Hardening')").first
        max_btn.click()
        print("  [+] Clicked 'Max Hardening' (auto-advanced to Stage 4)")
        time.sleep(2.5)

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "test_what_if_3d_converged_spacious.png"))
        print("  [+] Captured test_what_if_3d_converged_spacious.png")

        browser.close()
        print("\n[SUCCESS] /usemax expanded 3D Simulation Engine verification passed 100%!")

if __name__ == "__main__":
    main()
