"""
File lock and write-completion verification for asynchronous spool ingestion.
"""

from __future__ import annotations

import asyncio
from pathlib import Path


class FileLockVerifier:
    """Verifies that an incoming capture file is completely written and safe to parse."""

    @staticmethod
    def is_valid_pcap_extension(file_path: Path) -> bool:
        """Verify file ends with supported network capture extensions."""
        suffix = file_path.suffix.lower()
        return suffix in (".pcap", ".pcapng", ".cap")

    @classmethod
    async def is_file_ready(cls, file_path: Path, stability_window: float = 0.5) -> bool:
        """
        Check if file is ready for ingestion.
        Returns True only if file exists, is non-empty, size is stable, and handle can be opened.
        """
        if not file_path.is_file():
            return False

        if not cls.is_valid_pcap_extension(file_path):
            return False

        try:
            initial_size = file_path.stat().st_size
            if initial_size == 0:
                return False

            # Wait brief window to detect active in-flight stream writes
            await asyncio.sleep(stability_window)

            current_size = file_path.stat().st_size
            if initial_size != current_size:
                return False

            # Attempt non-blocking binary read handle
            with open(file_path, "rb") as f:
                # Read initial 4 bytes to check PCAP magic header
                header = f.read(4)
                if len(header) < 4:
                    return False
                # Common PCAP magic bytes: 0xa1b2c3d4, 0xd4c3b2a1, 0x0a0d0d0a (pcapng)
                pcap_magics = (
                    b"\xa1\xb2\xc3\xd4",
                    b"\xd4\xc3\xb2\xa1",
                    b"\xa1\xb2\x3c\x4d",
                    b"\x4d\x3c\xb2\xa1",
                    b"\x0a\x0d\x0d\x0a",
                )
                if not any(header.startswith(m) for m in pcap_magics):
                    return False

            return True

        except (PermissionError, OSError):
            # File is locked by an active external writer process
            return False
