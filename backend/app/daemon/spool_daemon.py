"""
Asynchronous filesystem spool watcher daemon for autonomous zero-upload PCAP ingestion.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
import uuid
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.daemon.file_locker import FileLockVerifier

logger = logging.getLogger("securemailscope.spool")


class SpoolDaemon:
    """Monitors incoming spool directory and automatically ingests completed PCAP captures."""

    def __init__(self) -> None:
        self.is_running: bool = False
        self._task: asyncio.Task | None = None
        self.scanned_count: int = 0
        self.processed_count: int = 0
        self.failed_count: int = 0
        self.last_run_timestamp: str | None = None
        self.ingested_history: list[dict[str, Any]] = []

    def get_status(self) -> dict[str, Any]:
        """Return real-time operational telemetry for the spool daemon."""
        incoming_files = []
        if settings.spool_incoming_dir.exists():
            incoming_files = [f.name for f in settings.spool_incoming_dir.glob("*") if f.is_file()]

        return {
            "is_running": self.is_running,
            "spool_incoming_dir": str(settings.spool_incoming_dir),
            "spool_processed_dir": str(settings.spool_processed_dir),
            "spool_failed_dir": str(settings.spool_failed_dir),
            "queue_depth": len(incoming_files),
            "pending_files": incoming_files,
            "scanned_count": self.scanned_count,
            "processed_count": self.processed_count,
            "failed_count": self.failed_count,
            "last_run_timestamp": self.last_run_timestamp,
            "total_ingested_cases": len(self.ingested_history),
        }

    async def sweep_once(self) -> list[dict[str, Any]]:
        """Perform a single pass over the incoming directory and ingest ready captures."""
        from app.api.routes import _results, _run_analysis

        settings.ensure_directories()
        self.last_run_timestamp = datetime.now(timezone.utc).isoformat()
        newly_ingested: list[dict[str, Any]] = []

        if not settings.spool_incoming_dir.exists():
            return newly_ingested

        for file_path in sorted(settings.spool_incoming_dir.iterdir()):
            if not file_path.is_file() or not FileLockVerifier.is_valid_pcap_extension(file_path):
                continue

            self.scanned_count += 1
            is_ready = await FileLockVerifier.is_file_ready(
                file_path, stability_window=settings.spool_stability_threshold
            )
            if not is_ready:
                continue

            target_filename = file_path.name
            analysis_id = str(uuid.uuid4())
            timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            case_code = f"AUTO-{timestamp_str[-6:]}"

            try:
                # Execute full forensic and cryptanalysis pipeline
                analysis_data = _run_analysis(str(file_path), target_filename)
                analysis_data["analysis_id"] = analysis_id
                analysis_data["case_code"] = case_code
                analysis_data["is_automated_spool"] = True
                analysis_data["source"] = "DAEMON_SPOOL"

                _results[analysis_id] = analysis_data

                # Archive successfully processed capture
                dest_path = settings.spool_processed_dir / f"{timestamp_str}_{target_filename}"
                shutil.move(str(file_path), str(dest_path))

                summary = {
                    "analysis_id": analysis_id,
                    "case_code": case_code,
                    "filename": target_filename,
                    "archived_path": str(dest_path),
                    "enterprise_score": analysis_data.get("enterprise_score", 0),
                    "enterprise_grade": analysis_data.get("enterprise_grade", "F"),
                    "total_sessions": analysis_data.get("total_sessions", 0),
                    "vulnerabilities_count": len(analysis_data.get("vulnerabilities", [])),
                    "ingested_at": self.last_run_timestamp,
                }
                self.ingested_history.insert(0, summary)
                newly_ingested.append(summary)
                self.processed_count += 1
                logger.info(
                    "Spool ingested: %s as case %s (Score: %d)", target_filename, case_code, summary["enterprise_score"]
                )

            except Exception as exc:
                self.failed_count += 1
                dest_path = settings.spool_failed_dir / f"{timestamp_str}_{target_filename}"
                logger.error("Spool processing failed for %s: %s", target_filename, exc)
                try:
                    shutil.move(str(file_path), str(dest_path))
                except OSError:
                    pass

        return newly_ingested

    async def _run_loop(self) -> None:
        """Background continuous worker loop."""
        while self.is_running:
            try:
                await self.sweep_once()
            except Exception as e:
                logger.warning("Spool loop error: %s", e)
            await asyncio.sleep(settings.spool_poll_interval)

    def start(self) -> None:
        """Start daemon in active event loop."""
        if self.is_running:
            return
        self.is_running = True
        settings.ensure_directories()
        self._task = asyncio.create_task(self._run_loop())
        logger.info("SecureMailScope Spool Daemon started on %s", settings.spool_incoming_dir)

    def stop(self) -> None:
        """Stop background daemon gracefully."""
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("SecureMailScope Spool Daemon stopped.")


spool_daemon = SpoolDaemon()
