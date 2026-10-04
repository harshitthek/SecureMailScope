"""
Pytest global test configuration and fixtures.
Configures an isolated temporary SQLite database for test suites to prevent modifying production state.
"""

from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

_test_tmp_dir = tempfile.mkdtemp(prefix="sms_test_db_")
_test_db_file = Path(_test_tmp_dir) / "test_isolated.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_test_db_file.as_posix()}"


def pytest_unconfigure(config):  # noqa: ARG001
    """Clean up temporary test database directory after test run completes."""
    shutil.rmtree(_test_tmp_dir, ignore_errors=True)
