"""
Unit test suite for autonomous PCAP spool watcher daemon and API routes.
"""

from __future__ import annotations

import asyncio
import shutil
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import settings
from app.daemon.file_locker import FileLockVerifier, ReadinessStatus
from app.daemon.spool_daemon import SpoolDaemon
from app.main import app


class TestSpoolDaemon(unittest.IsolatedAsyncioTestCase):
    """Test suite for FileLockVerifier, SpoolDaemon, and Spool API endpoints."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.mkdtemp(prefix="securemailscope_test_spool_")
        self.spool_path = Path(self.temp_dir)

        # Override settings for isolated test execution
        self.orig_incoming = settings.spool_incoming_dir
        self.orig_processed = settings.spool_processed_dir
        self.orig_failed = settings.spool_failed_dir
        self.orig_max_size = settings.max_file_size_bytes
        self.orig_operator_key = settings.operator_api_key

        settings.spool_incoming_dir = self.spool_path / "incoming"
        settings.spool_processed_dir = self.spool_path / "processed"
        settings.spool_failed_dir = self.spool_path / "failed"
        settings.spool_stability_threshold = 0.05
        settings.ensure_directories()

        self.daemon = SpoolDaemon()
        self.client = TestClient(app)

        # Locate sample PCAP
        repo_root = Path(__file__).resolve().parent.parent.parent
        self.sample_pcap = repo_root / "frontend" / "public" / "samples" / "02_striptls_mitm_attack.pcap"

    def tearDown(self) -> None:
        self.daemon.stop()
        settings.spool_incoming_dir = self.orig_incoming
        settings.spool_processed_dir = self.orig_processed
        settings.spool_failed_dir = self.orig_failed
        settings.max_file_size_bytes = self.orig_max_size
        settings.operator_api_key = self.orig_operator_key
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_file_lock_verifier_extensions(self) -> None:
        """Verify extension validation logic."""
        self.assertTrue(FileLockVerifier.is_valid_pcap_extension(Path("capture.pcap")))
        self.assertTrue(FileLockVerifier.is_valid_pcap_extension(Path("capture.pcapng")))
        self.assertTrue(FileLockVerifier.is_valid_pcap_extension(Path("traffic.CAP")))
        self.assertFalse(FileLockVerifier.is_valid_pcap_extension(Path("payload.txt")))
        self.assertFalse(FileLockVerifier.is_valid_pcap_extension(Path("report.pdf")))

    async def test_file_lock_verifier_readiness(self) -> None:
        """Verify readiness detection on real PCAP and non-PCAP files."""
        if not self.sample_pcap.exists():
            self.skipTest("Sample PCAP not found")

        dest_file = settings.spool_incoming_dir / "test_sample.pcap"
        shutil.copyfile(str(self.sample_pcap), str(dest_file))

        status = await FileLockVerifier.check_readiness(dest_file, stability_window=0.05)
        self.assertEqual(status, ReadinessStatus.READY)
        self.assertTrue(await FileLockVerifier.is_file_ready(dest_file, stability_window=0.05))

        # In-flight temporary file
        tmp_file = settings.spool_incoming_dir / "test_stream.pcap.tmp"
        tmp_file.write_bytes(b"\xa1\xb2\xc3\xd4\x00\x00")
        status_tmp = await FileLockVerifier.check_readiness(tmp_file, stability_window=0.05)
        self.assertEqual(status_tmp, ReadinessStatus.STILL_WRITING)

        # Non-PCAP invalid file
        dummy_file = settings.spool_incoming_dir / "dummy.pcap"
        dummy_file.write_text("not a real pcap")
        status_dummy = await FileLockVerifier.check_readiness(dummy_file, stability_window=0.05)
        self.assertEqual(status_dummy, ReadinessStatus.PERMANENT_INVALID)

    async def test_daemon_sweep_and_ingestion(self) -> None:
        """Verify autonomous pickup, analysis, and archiving of dropped PCAP."""
        if not self.sample_pcap.exists():
            self.skipTest("Sample PCAP not found")

        dest_file = settings.spool_incoming_dir / "dropped_striptls.pcap"
        shutil.copyfile(str(self.sample_pcap), str(dest_file))

        # Initial queue depth check (excluding .gitkeep)
        gitkeep = settings.spool_incoming_dir / ".gitkeep"
        gitkeep.touch()
        status_before = self.daemon.get_status()
        self.assertEqual(status_before["queue_depth"], 1)

        # Trigger sweep
        ingested = await self.daemon.sweep_once()
        self.assertEqual(len(ingested), 1)

        result = ingested[0]
        self.assertEqual(result["filename"], "dropped_striptls.pcap")
        self.assertIn("AUTO-", result["case_code"])
        self.assertEqual(result["enterprise_grade"], "F")

        # Verify file was moved from incoming to processed
        self.assertFalse(dest_file.exists())
        processed_files = list(settings.spool_processed_dir.glob("*_dropped_striptls.pcap"))
        self.assertEqual(len(processed_files), 1)

        # Post-sweep queue depth check
        status_after = self.daemon.get_status()
        self.assertEqual(status_after["queue_depth"], 0)
        self.assertEqual(status_after["processed_count"], 1)

    async def test_quarantine_permanent_invalid_file(self) -> None:
        """Verify stable file with corrupt/invalid magic header moves to failed."""
        corrupt_file = settings.spool_incoming_dir / "corrupted_capture.pcap"
        corrupt_file.write_text("INVALID_HEADER_GARBAGE_PAYLOAD")

        ingested = await self.daemon.sweep_once()
        self.assertEqual(len(ingested), 0)
        self.assertFalse(corrupt_file.exists())

        failed_files = list(settings.spool_failed_dir.glob("*_corrupted_capture.pcap"))
        self.assertEqual(len(failed_files), 1)
        self.assertEqual(self.daemon.failed_count, 1)

    async def test_reject_oversized_file(self) -> None:
        """Verify files exceeding max_file_size_bytes are moved to failed."""
        if not self.sample_pcap.exists():
            self.skipTest("Sample PCAP not found")

        # Set artificially small max size
        settings.max_file_size_bytes = 100
        oversized = settings.spool_incoming_dir / "oversized.pcap"
        shutil.copyfile(str(self.sample_pcap), str(oversized))

        ingested = await self.daemon.sweep_once()
        self.assertEqual(len(ingested), 0)
        self.assertFalse(oversized.exists())

        failed_files = list(settings.spool_failed_dir.glob("*_oversized.pcap"))
        self.assertEqual(len(failed_files), 1)
        self.assertEqual(self.daemon.failed_count, 1)

    async def test_concurrent_sweep_serialization(self) -> None:
        """Verify concurrent calls to sweep_once do not collide or double-process."""
        if not self.sample_pcap.exists():
            self.skipTest("Sample PCAP not found")

        dest = settings.spool_incoming_dir / "race_test.pcap"
        shutil.copyfile(str(self.sample_pcap), str(dest))

        # Launch two sweeps concurrently
        results = await asyncio.gather(self.daemon.sweep_once(), self.daemon.sweep_once())
        total_ingested = len(results[0]) + len(results[1])
        self.assertEqual(total_ingested, 1)
        self.assertEqual(self.daemon.processed_count, 1)

    def test_spool_api_endpoints_and_auth(self) -> None:
        """Verify REST API endpoints and operator authorization."""
        # 1. GET /api/spool/status
        resp = self.client.get("/api/spool/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")

        # 2. GET /api/spool/history
        resp = self.client.get("/api/spool/history")
        self.assertEqual(resp.status_code, 200)

        # 3. POST /api/spool/process-now
        resp = self.client.post("/api/spool/process-now")
        self.assertEqual(resp.status_code, 200)

        # 4. POST /api/spool/toggle without auth configured (should succeed)
        resp_toggle = self.client.post("/api/spool/toggle", json={"action": "stop"})
        self.assertEqual(resp_toggle.status_code, 200)

        # 5. POST /api/spool/toggle with operator auth configured
        settings.operator_api_key = "secret-soc-key-123"

        # Missing auth header -> 401
        resp_unauth = self.client.post("/api/spool/toggle", json={"action": "start"})
        self.assertEqual(resp_unauth.status_code, 401)

        # Valid X-API-Key header -> 200
        resp_auth = self.client.post(
            "/api/spool/toggle",
            json={"action": "start"},
            headers={"X-API-Key": "secret-soc-key-123"},
        )
        self.assertEqual(resp_auth.status_code, 200)


if __name__ == "__main__":
    unittest.main()
