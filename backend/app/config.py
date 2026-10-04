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
        self.operator_api_key: str | None = os.getenv("OPERATOR_API_KEY")
        self.spool_max_history: int = int(os.getenv("SPOOL_MAX_HISTORY", "100"))

        # Live TAP and real-time wire telemetry configuration
        self.tap_bpf_filter: str = os.getenv("TAP_BPF_FILTER", "tcp and (port 25 or 587 or 465 or 993 or 110)")
        self.tap_buffer_max_packets: int = int(os.getenv("TAP_BUFFER_MAX_PACKETS", "2000"))
        self.test_pcaps_dir: Path = (PROJECT_ROOT / "backend" / "test_pcaps").resolve()

        # Database persistence configuration (SQLAlchemy 2.0 Async + SQLite WAL / PostgreSQL)
        default_db_path = (PROJECT_ROOT / "backend" / "securemailscope.db").resolve()
        self.database_url: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{default_db_path.as_posix()}")
        self.database_echo: bool = os.getenv("DATABASE_ECHO", "false").lower() in ("1", "true", "yes")
        self.database_wal_mode: bool = os.getenv("DATABASE_WAL_MODE", "true").lower() in ("1", "true", "yes")

        # SIEM Alerting (ArcSight CEF / RFC 5424 Syslog) and Webhook configuration
        self.siem_enabled: bool = os.getenv("SIEM_ENABLED", "false").lower() in ("1", "true", "yes")
        self.siem_syslog_host: str = os.getenv("SIEM_SYSLOG_HOST", "127.0.0.1")
        self.siem_syslog_port: int = int(os.getenv("SIEM_SYSLOG_PORT", "514"))
        proto = os.getenv("SIEM_SYSLOG_PROTOCOL", "udp").lower()
        if proto not in ("udp", "tcp"):
            raise ValueError(f"Invalid SIEM_SYSLOG_PROTOCOL '{proto}'. Must be 'udp' or 'tcp'.")
        self.siem_syslog_protocol: str = proto

        facility = int(os.getenv("SIEM_SYSLOG_FACILITY", "16"))  # local0
        if not (0 <= facility <= 23):
            raise ValueError(f"Invalid SIEM_SYSLOG_FACILITY '{facility}'. Must be between 0 and 23.")
        self.siem_syslog_facility: int = facility
        self.siem_webhook_url: str | None = os.getenv("SIEM_WEBHOOK_URL")
        self.siem_webhook_format: str = os.getenv("SIEM_WEBHOOK_FORMAT", "generic").lower()

    def ensure_directories(self) -> None:
        """Ensure all required spool subdirectories exist with defensive permissions."""
        self.spool_incoming_dir.mkdir(parents=True, exist_ok=True)
        self.spool_processed_dir.mkdir(parents=True, exist_ok=True)
        self.spool_failed_dir.mkdir(parents=True, exist_ok=True)


settings = AppSettings()
