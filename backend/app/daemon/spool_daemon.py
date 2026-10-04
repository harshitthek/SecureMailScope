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
from app.daemon.file_locker import FileLockVerifier, ReadinessStatus

logger = logging.getLogger("securemailscope.spool")


class SpoolDaemon:
    """Monitors incoming spool directory and automatically ingests completed PCAP captures."""

    def __init__(self) -> None:
        self.is_running: bool = False
        self._task: asyncio.Task | None = None
        self._sweep_lock = asyncio.Lock()
        self.scanned_count: int = 0
        self.processed_count: int = 0
        self.failed_count: int = 0
        self.last_run_timestamp: str | None = None
        self.ingested_history: list[dict[str, Any]] = []

    def get_status(self) -> dict[str, Any]:
        """Return real-time operational telemetry for the spool daemon."""
        incoming_files = []
        if settings.spool_incoming_dir.exists():
            incoming_files = [
                f.name
                for f in settings.spool_incoming_dir.glob("*")
                if f.is_file() and not f.name.startswith(".") and f.name != ".gitkeep"
            ]

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
        """
        Perform a serialized sweep over incoming spool directory and ingest ready captures.
        Guarded by _sweep_lock so concurrent sweeps cannot process the same capture.
        """
        from app.api.routes import _results, _run_analysis

        settings.ensure_directories()
        newly_ingested: list[dict[str, Any]] = []

        async with self._sweep_lock:
            self.last_run_timestamp = datetime.now(timezone.utc).isoformat()

            if not settings.spool_incoming_dir.exists():
                return newly_ingested

            for file_path in sorted(settings.spool_incoming_dir.iterdir()):
                if not file_path.is_file() or file_path.name.startswith(".") or file_path.name == ".gitkeep":
                    continue

                self.scanned_count += 1
                target_filename = file_path.name
                timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
                unique_suffix = uuid.uuid4().hex[:6]

                # 1. Multi-stage readiness verification
                readiness = await FileLockVerifier.check_readiness(
                    file_path, stability_window=settings.spool_stability_threshold
                )

                if readiness == ReadinessStatus.STILL_WRITING:
                    # Capture is actively in-flight or held by producer; leave for subsequent sweep
                    continue

                if readiness == ReadinessStatus.PERMANENT_INVALID:
                    # File is fully written but corrupt or non-PCAP; quarantine to failed
                    self.failed_count += 1
                    dest_path = settings.spool_failed_dir / f"{timestamp_str}_{unique_suffix}_{target_filename}"
                    logger.warning("Quarantining invalid capture %s to %s", target_filename, dest_path)
                    try:
                        shutil.move(str(file_path), str(dest_path))
                    except OSError as err:
                        logger.error("Failed to move invalid file %s: %s", target_filename, err)
                    continue

                # 2. Maximum file size check
                try:
                    file_size = file_path.stat().st_size
                except OSError:
                    continue

                if file_size > settings.max_file_size_bytes:
                    self.failed_count += 1
                    dest_path = settings.spool_failed_dir / f"{timestamp_str}_{unique_suffix}_{target_filename}"
                    logger.warning(
                        "File %s (%d bytes) exceeds size limit (%d bytes); moving to failed",
                        target_filename,
                        file_size,
                        settings.max_file_size_bytes,
                    )
                    try:
                        shutil.move(str(file_path), str(dest_path))
                    except OSError as err:
                        logger.error("Failed to quarantine oversized file %s: %s", target_filename, err)
                    continue

                # 3. Ingestion and analysis
                analysis_id = str(uuid.uuid4())
                case_code = f"AUTO-{timestamp_str[-6:]}"

                try:
                    # Offload CPU-bound analysis to worker thread
                    analysis_data = await asyncio.to_thread(_run_analysis, str(file_path), target_filename)
                    analysis_data["analysis_id"] = analysis_id
                    analysis_data["case_code"] = case_code
                    analysis_data["is_automated_spool"] = True
                    analysis_data["source"] = "DAEMON_SPOOL"

                    # Archive file to unique destination before publishing in-memory results
                    dest_path = settings.spool_processed_dir / f"{timestamp_str}_{unique_suffix}_{target_filename}"
                    shutil.move(str(file_path), str(dest_path))

                    # Publish results only after successful archive
                    _results[analysis_id] = analysis_data

                    try:
                        from app.db.repository import CaseRepository

                        await CaseRepository.save_case(analysis_data, source="spool")
                    except Exception as db_err:
                        logger.warning("Failed to persist spool capture to database: %s", db_err)

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

                    # Maintain bounded history
                    self.ingested_history.insert(0, summary)
                    if len(self.ingested_history) > settings.spool_max_history:
                        self.ingested_history = self.ingested_history[: settings.spool_max_history]

                    self.processed_count += 1
                    newly_ingested.append(summary)
                    logger.info(
                        "Spool ingested: %s as case %s (Score: %d)",
                        target_filename,
                        case_code,
                        summary["enterprise_score"],
                    )

                except Exception as exc:
                    self.failed_count += 1
                    dest_path = settings.spool_failed_dir / f"{timestamp_str}_{unique_suffix}_{target_filename}"
                    logger.error("Spool processing failed for %s: %s", target_filename, exc)
                    if file_path.exists():
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
