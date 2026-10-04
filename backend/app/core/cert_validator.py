import datetime
from dataclasses import dataclass
from typing import Optional
from cryptography import x509
from cryptography.x509 import load_der_x509_certificate
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa, ed25519, ed448
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
    pem_data: str = ""
    raw_der_hex: str = ""

def validate_certificate(der_bytes: bytes) -> CertificateInfo | None:
    """Parse X.509 DER certificates and validate cryptographic properties."""
    if not der_bytes:
        return None
    try:
        cert = load_der_x509_certificate(der_bytes)
        now = datetime.datetime.now(datetime.timezone.utc)

        # Subject and Issuer Common Names
        subject_cns = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)
        subject_cn = str(subject_cns[0].value) if subject_cns else ""

        issuer_cns = cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)
        issuer_cn = str(issuer_cns[0].value) if issuer_cns else ""

        serial_number = str(hex(cert.serial_number)[2:].upper())

        # Timezone-aware UTC datetimes (eliminating CryptographyDeprecationWarning)
        try:
            not_before = cert.not_valid_before_utc
            not_after = cert.not_valid_after_utc
        except AttributeError:
            # Fallback for older cryptography versions if needed
            not_before = cert.not_valid_before.replace(tzinfo=datetime.timezone.utc)
            not_after = cert.not_valid_after.replace(tzinfo=datetime.timezone.utc)

        is_expired = now > not_after
        is_not_yet_valid = now < not_before
        
        validity_days = max(0, (not_after - not_before).days)
        days_remaining = (not_after - now).days

        is_self_signed = (cert.subject == cert.issuer)

        signature_algorithm = getattr(cert.signature_algorithm_oid, "_name", str(cert.signature_algorithm_oid.dotted_string))
        signature_hash = ""
        if cert.signature_hash_algorithm:
            signature_hash = cert.signature_hash_algorithm.name.upper()
        
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
            if public_key_bits < 2048:
                is_weak_key = True
        elif isinstance(public_key, ed25519.Ed25519PublicKey):
            public_key_type = "Ed25519"
            public_key_bits = 256
        elif isinstance(public_key, ed448.Ed448PublicKey):
            public_key_type = "Ed448"
            public_key_bits = 448

        san_entries = []
        try:
            ext = cert.extensions.get_extension_for_oid(ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            if ext and ext.value:
                san_entries = [str(name.value) for name in ext.value]
        except (x509.ExtensionNotFound, Exception):
            san_entries = []

        # Export PEM string and DER hex representation for forensic evidence portability
        try:
            pem_str = cert.public_bytes(serialization.Encoding.PEM).decode("utf-8")
        except Exception:
            pem_str = ""
        der_hex = der_bytes.hex()

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
            san_entries=san_entries,
            pem_data=pem_str,
            raw_der_hex=der_hex,
        )
    except Exception:
        return None
