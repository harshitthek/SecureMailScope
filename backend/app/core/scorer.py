from dataclasses import dataclass
from .cert_validator import CertificateInfo

@dataclass
class ScoringResult:
    protocol_penalty: int
    cipher_penalty: int
    pfs_penalty: int
    cert_penalty: int
    anomaly_penalty: int
    raw_score: int
    final_score: int
    grade: str
    severity: str

def calculate_grade_and_severity(score: int) -> tuple[str, str]:
    """Map a 0-100 score to letter grade and risk severity."""
    score_clamped = max(0, min(100, score))
    if score_clamped >= 90:
        return 'A+', 'secure'
    elif score_clamped >= 80:
        return 'A', 'low'
    elif score_clamped >= 70:
        return 'B', 'low'
    elif score_clamped >= 60:
        return 'C', 'medium'
    elif score_clamped >= 50:
        return 'D', 'medium'
    else:
        return 'F', ('critical' if score_clamped < 25 else 'high')

def score_session(tls_version: str | None, cipher_category: str | None, cipher_is_aead: bool, key_exchange: str | None, cert: CertificateInfo | None, ja3_known: bool, is_cleartext: bool) -> ScoringResult:
    """Compute cryptographic posture score for a single TLS session."""
    if is_cleartext:
        # No encryption at all — maximum penalty across the board
        v_proto = 40
        v_cipher = 30
        v_pfs = 20
        v_cert = 0
        v_anomaly = 15  # Force score to 100 - 105 = -5 → clamped to 0
    else:
        # V_proto
        v_proto = 0
        if tls_version in ['SSL 2.0', 'SSL 3.0']:
            v_proto = 40
        elif tls_version in ['TLS 1.0', 'TLS 1.1']:
            v_proto = 25
        elif tls_version == 'TLS 1.2':
            v_proto = 0 if cipher_is_aead else 5
        elif tls_version == 'TLS 1.3':
            v_proto = 0

        # V_cipher — cipher_db.json uses categories: RC4, 3DES, NULL, EXPORT, CBC, AEAD, TLS13
        v_cipher = 0
        if cipher_category in ['RC4', '3DES', 'NULL', 'EXPORT']:
            v_cipher = 30
        elif cipher_category == 'CBC':
            v_cipher = 15
        elif cipher_category in ['AEAD', 'TLS13']:
            v_cipher = 0

        # V_pfs — tls_analyzer outputs 'RSA', 'ECDHE', or 'DHE'
        v_pfs = 0
        if key_exchange == 'RSA':
            v_pfs = 20
        elif key_exchange in ['ECDHE', 'DHE']:
            v_pfs = 0

        # V_cert
        v_cert = 0
        if cert:
            penalties = []
            if cert.is_self_signed:
                penalties.append(30)
            if cert.is_expired:
                penalties.append(25)
            if cert.is_weak_key:
                penalties.append(25)
            if cert.is_weak_signature:
                penalties.append(20)
            if penalties:
                v_cert = max(penalties)

        # V_anomaly
        v_anomaly = 0 if ja3_known else 15

    raw_score = 100 - (v_proto + v_cipher + v_pfs + v_cert + v_anomaly)
    final_score = max(0, min(100, raw_score))
    grade, severity = calculate_grade_and_severity(final_score)



    return ScoringResult(
        protocol_penalty=v_proto,
        cipher_penalty=v_cipher,
        pfs_penalty=v_pfs,
        cert_penalty=v_cert,
        anomaly_penalty=v_anomaly,
        raw_score=raw_score,
        final_score=final_score,
        grade=grade,
        severity=severity
    )

def score_enterprise(session_scores: list[int]) -> tuple[int, str]:
    """Compute enterprise aggregate score and grade."""
    if not session_scores:
        return 0, 'F'
        
    avg_score = sum(session_scores) // len(session_scores)
    avg_score = max(0, min(100, avg_score))

    if avg_score >= 90:
        grade = 'A+'
    elif avg_score >= 80:
        grade = 'A'
    elif avg_score >= 70:
        grade = 'B'
    elif avg_score >= 60:
        grade = 'C'
    elif avg_score >= 50:
        grade = 'D'
    else:
        grade = 'F'

    return avg_score, grade
