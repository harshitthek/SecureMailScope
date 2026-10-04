"""
End-to-end verification script for Phase 2: Live Passive Network TAP & WebSocket Telemetry.
Validates:
1. REST API status & discovery endpoints (/api/tap/status, /api/tap/replays).
2. WebSocket telemetry feed (/api/ws/telemetry).
3. Streaming packet events and real-time security alert triggers (STRIPTLS MitM T1557.002).
4. Live packet buffer snapshotting into an active forensic case dossier (/api/analysis/{id}).
"""

import asyncio
import json
import sys
import websockets
import httpx

API_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/api/ws/telemetry"


async def main():
    print("=" * 70)
    print("SECUREMAILSCOPE PHASE 2: LIVE TAP & TELEMETRY VERIFICATION")
    print("=" * 70)

    # 1. Verify REST Endpoints
    print("\n[STEP 1] Probing REST endpoints...")
    async with httpx.AsyncClient(base_url=API_URL, timeout=10.0) as client:
        health_resp = await client.get("/api/health")
        assert health_resp.status_code == 200, f"Health check failed: {health_resp.status_code}"
        print("  -> Backend health check OK (200)")

        status_resp = await client.get("/api/tap/status")
        assert status_resp.status_code == 200, f"TAP status probe failed: {status_resp.status_code}"
        tap_status = status_resp.json()
        print(f"  -> TAP Initial State: {tap_status['state']} | Buffer Capacity: {tap_status['buffer_capacity']}")

        replays_resp = await client.get("/api/tap/replays")
        assert replays_resp.status_code == 200, f"Replay list failed: {replays_resp.status_code}"
        replays = replays_resp.json()
        print(f"  -> Available attack replays found: {len(replays)}")
        assert any("02_striptls" in r["filename"] for r in replays), "Missing 02_striptls replay PCAP"

    # 2. Connect WebSocket
    print("\n[STEP 2] Connecting to WebSocket feed at /api/ws/telemetry...")
    async with websockets.connect(WS_URL) as ws:
        init_frame = await ws.recv()
        init_data = json.loads(init_frame)
        assert init_data.get("type") == "INITIAL_STATE", f"Expected INITIAL_STATE, got {init_data.get('type')}"
        print(f"  -> WebSocket established! Initial state: {init_data['data']['state']}")

        # 3. Trigger simulated attack wire replay
        print("\n[STEP 3] Triggering simulated wire replay (02_striptls_mitm_attack.pcap at 25 PPS)...")
        await ws.send(json.dumps({
            "action": "start_replay",
            "pcap_name": "02_striptls_mitm_attack.pcap",
            "speed": 25.0,
        }))

        packets_received = 0
        alerts_received = []

        print("  -> Listening for streaming wire frames...")
        for _ in range(40):
            try:
                frame_text = await asyncio.wait_for(ws.recv(), timeout=3.0)
                frame = json.loads(frame_text)
                ftype = frame.get("type")

                if ftype == "PACKET":
                    packets_received += 1
                elif ftype == "SECURITY_ALERT":
                    alerts_received.append(frame.get("data"))
                    alert_info = frame.get("data", {})
                    print(f"     [ALERT TRIGGERED] {alert_info.get('title')} ({alert_info.get('mitre_id')}) on {alert_info.get('vector')}")
                elif ftype == "HEARTBEAT":
                    pass

                # Once we've caught multiple packets and at least one alert, we can snapshot
                if packets_received >= 10 and len(alerts_received) >= 1:
                    break
            except asyncio.TimeoutError:
                break

        print(f"  -> Captured {packets_received} streaming packets and {len(alerts_received)} security alert(s)")
        assert packets_received > 0, "No packet frames streamed over WebSocket"
        assert len(alerts_received) > 0, "No security alerts detected on simulated attack wire"

        # 4. Trigger snapshot of buffered wire packets
        print("\n[STEP 4] Executing snapshot of live wire buffer...")
        await ws.send(json.dumps({
            "action": "snapshot",
            "label": "Automated Wire Forensic Snapshot",
        }))

        snapshot_res = None
        deadline = asyncio.get_running_loop().time() + 10.0
        while asyncio.get_running_loop().time() < deadline:
            remaining = max(0.1, deadline - asyncio.get_running_loop().time())
            try:
                frame_text = await asyncio.wait_for(ws.recv(), timeout=remaining)
                parsed = json.loads(frame_text)
                if parsed.get("type") == "SNAPSHOT_RESULT":
                    snapshot_res = parsed
                    break
            except asyncio.TimeoutError:
                break

        assert snapshot_res is not None and snapshot_res.get("type") == "SNAPSHOT_RESULT", (
            f"Expected SNAPSHOT_RESULT, got {snapshot_res}"
        )
        snap_data = snapshot_res.get("data", {})
        assert snap_data.get("success") is True, f"Snapshot failed: {snap_data}"

        run_id = snap_data.get("run_id")
        print(f"  -> Snapshot SUCCESS! Case Code: {snap_data.get('case_code')} | Run ID: {run_id}")
        print(f"  -> Overall Posture Score: {snap_data.get('overall_score')}/100 ({snap_data.get('overall_grade')})")

        # 5. Stop tap
        await ws.send(json.dumps({"action": "stop_tap"}))
        print("  -> Wire tap sensor stopped cleanly")

    # 6. Verify snapshot exists and is fully queryable in the REST analysis engine
    print("\n[STEP 5] Verifying snapshot dossier in /api/analysis/{id}...")
    async with httpx.AsyncClient(base_url=API_URL, timeout=10.0) as client:
        analysis_resp = await client.get(f"/api/analysis/{run_id}")
        assert analysis_resp.status_code == 200, f"Failed to retrieve snapshot analysis: {analysis_resp.status_code}"
        dossier = analysis_resp.json()
        assert dossier["source"] == "LIVE_TAP", f"Unexpected source: {dossier.get('source')}"
        assert len(dossier["sessions"]) > 0, "No email sessions found in snapshot dossier"
        print(f"  -> Dossier verified! Total streams: {len(dossier['sessions'])}, Total vulns: {len(dossier['vulnerabilities'])}")

    print("\n" + "=" * 70)
    print(">>> ALL PHASE 2 LIVE TAP & TELEMETRY CHECKS PASSED SUCCESSFULLY! <<<")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
