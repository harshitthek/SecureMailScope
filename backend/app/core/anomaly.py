"""
Anomaly detection engine using Isolation Forest on TLS session feature vectors.
"""
from __future__ import annotations

import numpy as np
from dataclasses import dataclass


@dataclass
class AnomalyResult:
    """Result of anomaly detection for a single session."""
    is_anomaly: bool
    anomaly_score: float  # -1 (most anomalous) to +1 (most normal)


# TLS version to numeric encoding for feature vector
TLS_VERSION_MAP: dict[str | None, int] = {
    None: 0,
    "None (Cleartext)": 0,
    "SSL 2.0": 1,
    "SSL 3.0": 2,
    "TLS 1.0": 3,
    "TLS 1.1": 4,
    "TLS 1.2": 5,
    "TLS 1.3": 6,
}

# Cipher severity to numeric encoding
SEVERITY_MAP: dict[str | None, int] = {
    None: 0,
    "critical": 1,
    "high": 2,
    "medium": 3,
    "low": 4,
    "secure": 5,
}


def build_feature_vector(
    tls_version: str | None,
    cipher_severity: str | None,
    key_bits: int,
    has_pfs: bool,
    cert_days_remaining: int | None,
    ja3_known: bool,
) -> list[float]:
    """
    Build a numeric feature vector from session TLS metadata.
    
    Features:
    [0] tls_version_int      (0-6)
    [1] cipher_severity_int  (0-5)
    [2] key_bits_normalized  (0-1, divided by 4096)
    [3] pfs_bool             (0 or 1)
    [4] cert_days_remaining  (normalized, 0 if no cert)
    [5] ja3_known_bool       (0 or 1)
    """
    return [
        float(TLS_VERSION_MAP.get(tls_version, 0)),
        float(SEVERITY_MAP.get(cipher_severity, 0)),
        min(float(key_bits) / 4096.0, 1.0) if key_bits > 0 else 0.0,
        1.0 if has_pfs else 0.0,
        min(max(float(cert_days_remaining or 0) / 365.0, -1.0), 1.0),
        1.0 if ja3_known else 0.0,
    ]


def detect_anomalies(feature_vectors: list[list[float]]) -> list[AnomalyResult]:
    """
    Run Isolation Forest anomaly detection on a batch of session feature vectors.
    
    Args:
        feature_vectors: List of feature vectors, one per session.
        
    Returns:
        List of AnomalyResult, one per session.
    """
    if len(feature_vectors) < 2:
        # Not enough data for meaningful anomaly detection
        return [AnomalyResult(is_anomaly=False, anomaly_score=0.0) for _ in feature_vectors]

    try:
        from sklearn.ensemble import IsolationForest

        X = np.array(feature_vectors)

        # Contamination: expect ~10% of sessions to be anomalous
        contamination = min(0.3, max(0.05, 1.0 / len(feature_vectors)))

        model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
        )
        model.fit(X)

        predictions = model.predict(X)         # +1 = normal, -1 = anomaly
        scores = model.decision_function(X)    # higher = more normal

        results = []
        for pred, score in zip(predictions, scores):
            results.append(AnomalyResult(
                is_anomaly=bool(pred == -1),
                anomaly_score=float(score),
            ))
        return results

    except Exception:
        # Fallback: no anomalies if sklearn fails
        return [AnomalyResult(is_anomaly=False, anomaly_score=0.0) for _ in feature_vectors]
