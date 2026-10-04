"""
Unit test suite for autonomous PCAP spool watcher daemon and API routes.
"""

from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import settings
from app.daemon.file_locker import FileLockVerifier
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

        is_ready = await FileLockVerifier.is_file_ready(dest_file, stability_window=0.05)
        self.assertTrue(is_ready)

        # Non-PCAP dummy file
        dummy_file = settings.spool_incoming_dir / "dummy.txt"
        dummy_file.write_text("not a pcap")
        self.assertFalse(await FileLockVerifier.is_file_ready(dummy_file, stability_window=0.05))

    async def test_daemon_sweep_and_ingestion(self) -> None:
        """Verify autonomous pickup, analysis, and archiving of dropped PCAP."""
        if not self.sample_pcap.exists():
            self.skipTest("Sample PCAP not found")

        dest_file = settings.spool_incoming_dir / "dropped_striptls.pcap"
        shutil.copyfile(str(self.sample_pcap), str(dest_file))

        # Initial queue depth check
        status_before = self.daemon.get_status()
        self.assertEqual(status_before["queue_depth"], 1)

        # Trigger sweep
        ingested = await self.daemon.sweep_once()
        self.assertEqual(len(ingested), 1)

        result = ingested[0]
        self.assertEqual(result["filename"], "dropped_striptls.pcap")
        self.assertIn("AUTO-", result["case_code"])
        self.assertEqual(result["enterprise_grade"], "F")  # STRIPTLS is critical downgrade

        # Verify file was moved from incoming to processed
        self.assertFalse(dest_file.exists())
        processed_files = list(settings.spool_processed_dir.glob("*dropped_striptls.pcap"))
        self.assertEqual(len(processed_files), 1)

        # Post-sweep queue depth check
        status_after = self.daemon.get_status()
        self.assertEqual(status_after["queue_depth"], 0)
        self.assertEqual(status_after["processed_count"], 1)

    def test_spool_api_endpoints(self) -> None:
        """Verify REST API endpoints for spool telemetry."""
        # 1. GET /api/spool/status
        resp = self.client.get("/api/spool/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("queue_depth", data["data"])

        # 2. GET /api/spool/history
        resp = self.client.get("/api/spool/history")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIsInstance(data["history"], list)

        # 3. POST /api/spool/process-now
        resp = self.client.post("/api/spool/process-now")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")


if __name__ == "__main__":
    unittest.main()
