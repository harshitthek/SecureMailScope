"""
Async database engine, session factory, and connection lifecycle management.
Supports SQLite WAL (Write-Ahead Logging) and PostgreSQL drivers seamlessly.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings
from app.db.base import Base

logger = logging.getLogger("securemailscope.db")

# Create asynchronous engine
engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.database_echo,
    future=True,
)

# Apply SQLite WAL and concurrency PRAGMAs if running on SQLite
if "sqlite" in settings.database_url and settings.database_wal_mode:

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA busy_timeout=5000;")
        cursor.close()


async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency generator yielding an active async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Initialize schema tables defensively."""
    # Ensure all models are imported and registered on Base.metadata
    from app.db import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully at %s", settings.database_url)


async def close_db() -> None:
    """Safely dispose of connection pool upon application shutdown."""
    await engine.dispose()
    logger.info("Database connection pool cleanly disposed.")
