"""
File lock, write-completion, and atomic-rename verification for asynchronous spool ingestion.
"""

from __future__ import annotations

import asyncio
from enum import Enum
from pathlib import Path

# Temporary suffixes commonly used by capture producers before atomic rename
IN_FLIGHT_SUFFIXES = (".tmp", ".part", ".writing", ".uploading", ".crdownload")

# Common PCAP magic bytes: 0xa1b2c3d4, 0xd4c3b2a1, 0xa1b23c4d, 0x4d3cb2a1, 0x0a0d0d0a (pcapng)
PCAP_MAGICS = (
    b"\xa1\xb2\xc3\xd4",
    b"\xd4\xc3\xb2\xa1",
    b"\xa1\xb2\x3c\x4d",
    b"\x4d\x3c\xb2\xa1",
    b"\x0a\x0d\x0d\x0a",
)


class ReadinessStatus(str, Enum):
    """Classification of capture file ingestion readiness."""

    READY = "READY"
    STILL_WRITING = "STILL_WRITING"
    PERMANENT_INVALID = "PERMANENT_INVALID"


class FileLockVerifier:
    """Verifies that an incoming capture file is completely written, stable, and safe to parse."""

    @staticmethod
    def is_valid_pcap_extension(file_path: Path) -> bool:
        """Verify file ends with supported network capture extensions."""
        suffix = file_path.suffix.lower()
        return suffix in (".pcap", ".pcapng", ".cap")

    @classmethod
    async def check_readiness(cls, file_path: Path, stability_window: float = 0.5) -> ReadinessStatus:
        """
        Evaluate file readiness with multi-stage verification:
        1. In-flight temporary naming protocol check.
        2. Size stability over time.
        3. File handle availability.
        4. PCAP magic header validation.
        """
        if not file_path.is_file():
            return ReadinessStatus.STILL_WRITING

        # Ignore dotfiles like .gitkeep
        if file_path.name.startswith("."):
            return ReadinessStatus.STILL_WRITING

        # 1. In-flight temporary file protocol check
        name_lower = file_path.name.lower()
        if any(name_lower.endswith(sfx) for sfx in IN_FLIGHT_SUFFIXES):
            return ReadinessStatus.STILL_WRITING

        # If file does not end in a supported capture extension, it cannot be parsed
        if not cls.is_valid_pcap_extension(file_path):
            return ReadinessStatus.PERMANENT_INVALID

        try:
            initial_size = file_path.stat().st_size
            if initial_size == 0:
                # Newly created file may still be waiting for first stream flush
                return ReadinessStatus.STILL_WRITING

            # Wait brief window to detect active in-flight stream writes
            await asyncio.sleep(stability_window)

            current_size = file_path.stat().st_size
            if initial_size != current_size:
                return ReadinessStatus.STILL_WRITING

            # Check for explicit completion marker if producer generated one (<name>.ready)
            # Both atomic rename to .pcap and presence of .ready marker denote completion.
            marker_ready = file_path.with_suffix(file_path.suffix + ".ready")
            marker_done = file_path.with_suffix(file_path.suffix + ".done")
            if marker_ready.exists():
                try:
                    marker_ready.unlink()
                except OSError:
                    pass
            elif marker_done.exists():
                try:
                    marker_done.unlink()
                except OSError:
                    pass

            # Attempt non-blocking binary read handle
            with open(file_path, "rb") as f:
                header = f.read(4)
                if len(header) < 4:
                    return ReadinessStatus.PERMANENT_INVALID

                if not any(header.startswith(m) for m in PCAP_MAGICS):
                    # File is stable and fully written, but magic header is corrupted or not a PCAP
                    return ReadinessStatus.PERMANENT_INVALID

            return ReadinessStatus.READY

        except (PermissionError, OSError):
            # File is locked by an active external writer process
            return ReadinessStatus.STILL_WRITING

    @classmethod
    async def is_file_ready(cls, file_path: Path, stability_window: float = 0.5) -> bool:
        """Backward-compatible helper returning True only when file is fully ready."""
        status = await cls.check_readiness(file_path, stability_window)
        return status == ReadinessStatus.READY
