"""
Configuration settings and fail-fast environment validation for SecureMailScope.
"""

from __future__ import annotations

import os
from pathlib import Path

# Base project path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_SPOOL_DIR = PROJECT_ROOT / "spool"


class AppSettings:
    """Core application settings with defensive defaults."""

    def __init__(self) -> None:
        self.spool_base_dir: Path = Path(os.getenv("SPOOL_BASE_DIR", str(DEFAULT_SPOOL_DIR))).resolve()
        self.spool_incoming_dir: Path = self.spool_base_dir / "incoming"
        self.spool_processed_dir: Path = self.spool_base_dir / "processed"
        self.spool_failed_dir: Path = self.spool_base_dir / "failed"

        self.spool_poll_interval: float = float(os.getenv("SPOOL_POLL_INTERVAL", "2.0"))
        self.spool_stability_threshold: float = float(os.getenv("SPOOL_STABILITY_THRESHOLD", "1.0"))
        self.max_file_size_bytes: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(100 * 1024 * 1024)))  # 100MB
        self.auto_start_daemon: bool = os.getenv("AUTO_START_SPOOL_DAEMON", "true").lower() in ("1", "true", "yes")

    def ensure_directories(self) -> None:
        """Ensure all required spool subdirectories exist with defensive permissions."""
        self.spool_incoming_dir.mkdir(parents=True, exist_ok=True)
        self.spool_processed_dir.mkdir(parents=True, exist_ok=True)
        self.spool_failed_dir.mkdir(parents=True, exist_ok=True)


settings = AppSettings()
