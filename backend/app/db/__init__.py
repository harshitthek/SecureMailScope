"""
Database persistence layer for SecureMailScope.
"""

from app.db.base import Base
from app.db.models import (
    CaptureCaseModel,
    CertificateEvidenceModel,
    FlowSessionModel,
    SecurityFindingModel,
)
from app.db.repository import CaseRepository
from app.db.seed import seed_reference_cases_if_needed
from app.db.session import close_db, engine, get_db, init_db

__all__ = [
    "Base",
    "CaptureCaseModel",
    "CertificateEvidenceModel",
    "FlowSessionModel",
    "SecurityFindingModel",
    "CaseRepository",
    "seed_reference_cases_if_needed",
    "close_db",
    "engine",
    "get_db",
    "init_db",
]
