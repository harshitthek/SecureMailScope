import datetime
from dataclasses import dataclass
from cryptography import x509
from cryptography.x509 import load_der_x509_certificate
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa
from cryptography.x509.oid import NameOID, ExtensionOID

@dataclass
class CertificateInfo:
    subject_cn: str
    issuer_cn: str
    serial_number: str
    not_before: str        # ISO 8601
    not_after: str         # ISO 8601
    is_expired: bool
    is_not_yet_valid: bool
    is_self_signed: bool
    validity_days: int
    days_remaining: int
    signature_algorithm: str
    signature_hash: str    # 'SHA-256', 'SHA-1', 'MD5'
    is_weak_signature: bool
    public_key_type: str   # 'RSA', 'EC', 'DSA'
    public_key_bits: int
    is_weak_key: bool
    san_entries: list[str]

def validate_certificate(der_bytes: bytes) -> CertificateInfo | None:
    """Parse X.509 DER certificates and validate cryptographic properties."""
    try:
        cert = load_der_x509_certificate(der_bytes)
        now = datetime.datetime.utcnow()

        # Subject and Issuer CN
        subject_cns = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)
        subject_cn = subject_cns[0].value if subject_cns else ""

        issuer_cns = cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)
        issuer_cn = issuer_cns[0].value if issuer_cns else ""

        serial_number = str(cert.serial_number)

        not_before = cert.not_valid_before
        not_after = cert.not_valid_after
        is_expired = now > not_after
        is_not_yet_valid = now < not_before
        
        validity_days = (not_after - not_before).days
        days_remaining = (not_after - now).days

        is_self_signed = (cert.subject == cert.issuer)

        signature_algorithm = cert.signature_algorithm_oid._name
        signature_hash = cert.signature_hash_algorithm.name.upper() if cert.signature_hash_algorithm else ""
        
        is_weak_signature = signature_hash in ["MD5", "SHA-1", "SHA1"]

        public_key = cert.public_key()
        public_key_type = "UNKNOWN"
        public_key_bits = 0
        is_weak_key = False

        if isinstance(public_key, rsa.RSAPublicKey):
            public_key_type = "RSA"
            public_key_bits = public_key.key_size
            if public_key_bits < 2048:
                is_weak_key = True
        elif isinstance(public_key, ec.EllipticCurvePublicKey):
            public_key_type = "EC"
            public_key_bits = public_key.curve.key_size
            if public_key_bits < 256:
                is_weak_key = True
        elif isinstance(public_key, dsa.DSAPublicKey):
            public_key_type = "DSA"
            public_key_bits = public_key.key_size

        san_entries = []
        try:
            ext = cert.extensions.get_extension_for_oid(ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            san_entries = [name.value for name in ext.value] if ext else []
        except x509.ExtensionNotFound:
            pass

        return CertificateInfo(
            subject_cn=subject_cn,
            issuer_cn=issuer_cn,
            serial_number=serial_number,
            not_before=not_before.isoformat(),
            not_after=not_after.isoformat(),
            is_expired=is_expired,
            is_not_yet_valid=is_not_yet_valid,
            is_self_signed=is_self_signed,
            validity_days=validity_days,
            days_remaining=days_remaining,
            signature_algorithm=signature_algorithm,
            signature_hash=signature_hash,
            is_weak_signature=is_weak_signature,
            public_key_type=public_key_type,
            public_key_bits=public_key_bits,
            is_weak_key=is_weak_key,
            san_entries=san_entries
        )
    except Exception:
        return None
