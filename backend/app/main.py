"""
FastAPI application entry point for SecureMailScope.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.spool_routes import spool_router
from app.config import settings
from app.daemon.spool_daemon import spool_daemon


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event manager for background daemons and persistence."""
    settings.ensure_directories()
    if settings.auto_start_daemon:
        spool_daemon.start()
    yield
    spool_daemon.stop()


app = FastAPI(
    title="SecureMailScope",
    description="AI-Assisted Cryptographic Security Posture Assessment for Secure Email Communications",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(spool_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "SecureMailScope",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "engine": "nominal",
        "version": "1.0.0",
        "service": "SecureMailScope Passive Forensic Engine",
    }
