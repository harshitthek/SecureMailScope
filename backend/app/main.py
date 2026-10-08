"""
FastAPI application entry point for SecureMailScope.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.remediation_routes import router as remediation_router
from app.api.routes import router
from app.api.siem_routes import siem_router
from app.api.spool_routes import spool_router
from app.api.tap_routes import tap_router
from app.api.websocket_feed import ws_manager, ws_router
from app.config import settings
from app.daemon.live_tap_daemon import live_tap_daemon
from app.daemon.spool_daemon import spool_daemon
from app.db import close_db, init_db, seed_reference_cases_if_needed
from app.siem.dispatcher import alert_dispatcher


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event manager for database persistence, daemons, and WebSocket gateway."""
    settings.ensure_directories()
    await init_db()
    await seed_reference_cases_if_needed()

    loop = asyncio.get_running_loop()
    ws_manager.set_event_loop(loop)
    dispatch_futures: set[Any] = set()

    def _siem_tap_listener(event_type: str, data: dict):
        if event_type == "SECURITY_ALERT" and loop and loop.is_running():
            payload = dict(data)
            if "mitre_id" in payload and "mitre_attack_id" not in payload:
                payload["mitre_attack_id"] = payload["mitre_id"]
            future = asyncio.run_coroutine_threadsafe(alert_dispatcher.dispatch_wire_alert(payload), loop)
            dispatch_futures.add(future)
            future.add_done_callback(dispatch_futures.discard)

    live_tap_daemon.register_listener(_siem_tap_listener)

    if settings.auto_start_daemon:
        spool_daemon.start()
    yield
    live_tap_daemon.unregister_listener(_siem_tap_listener)
    await asyncio.to_thread(live_tap_daemon.stop)
    spool_daemon.stop()
    for fut in list(dispatch_futures):
        if not fut.done():
            fut.cancel()
    await close_db()


app = FastAPI(
    title="SecureMailScope",
    description="AI-Assisted Cryptographic Security Posture Assessment for Secure Email Communications",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server and production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://harshitthek.is-a.dev",
        "http://harshitthek.is-a.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(spool_router, prefix="/api")
app.include_router(tap_router, prefix="/api")
app.include_router(ws_router, prefix="/api")
app.include_router(siem_router)
app.include_router(remediation_router)


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
