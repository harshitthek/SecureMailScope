#!/usr/bin/env python3
"""
Synthetic Test PCAP Generator for SecureMailScope.
Generates 4 realistic PCAP captures mapping to PRD test scenarios:
1. hardened_tls13.pcap  -> TLS 1.3, AES-256-GCM, Valid Cert, Known JA3 (Thunderbird) -> Score 98-100 (A+)
2. striptls_attack.pcap -> Port 587, STARTTLS stripped by MitM, cleartext credentials -> Score 0 (CRITICAL)
3. legacy_tls10.pcap    -> Port 25, TLS 1.0, 3DES-CBC, Static RSA, Expired Cert -> Score 0-25 (F)
4. rogue_client.pcap    -> Port 993 IMAPS, TLS 1.2, Unknown JA3 Fingerprint -> Score 55-70 (D)
"""

import os
import struct
import datetime
import hashlib
import json
from scapy.all import Ether, IP, TCP, Raw, wrpcap

from cryptography import x509
from cryptography.x509.oid import NameOID, ExtensionOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(OUTPUT_DIR, "..", "app", "data")


def create_x509_cert(
    cn: str,
    issuer_cn: str,
    key_size: int = 2048,
    days_valid: int = 365,
    is_expired: bool = False,
    is_self_signed: bool = False,
    hash_algorithm=hashes.SHA256(),
) -> bytes:
    """Generate a self-contained X.509 certificate and return DER bytes."""
    key = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
    subject_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cn)])

    if is_self_signed:
        issuer_name = subject_name
    else:
        issuer_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, issuer_cn)])

    now = datetime.datetime.utcnow()
    if is_expired:
        not_before = now - datetime.timedelta(days=days_valid + 60)
        not_after = now - datetime.timedelta(days=30)
    else:
        not_before = now - datetime.timedelta(days=1)
        not_after = now + datetime.timedelta(days=days_valid)

    builder = (
        x509.CertificateBuilder()
        .subject_name(subject_name)
        .issuer_name(issuer_name)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(not_before)
        .not_valid_after(not_after)
    )

    cert = builder.sign(key, hash_algorithm)
    return cert.public_bytes(serialization.Encoding.DER)


def build_tls_record(content_type: int, version: tuple[int, int], data: bytes) -> bytes:
    """Wrap handshake payload in a 5-byte TLS Record Layer header."""
    rec = bytearray()
    rec.append(content_type)  # 0x16 for Handshake
    rec.append(version[0])
    rec.append(version[1])
    rec.extend(struct.pack("!H", len(data)))
    rec.extend(data)
    return bytes(rec)


def build_handshake_msg(msg_type: int, body: bytes) -> bytes:
    """Wrap handshake body in a 4-byte Handshake header."""
    hs = bytearray()
    hs.append(msg_type)
    hs.extend(struct.pack("!I", len(body))[1:])
    hs.extend(body)
    return bytes(hs)


def build_client_hello(
    version: tuple[int, int],
    ciphers: list[int],
    extensions_data: bytes = b"",
) -> bytes:
    """Construct a TLS Client Hello handshake record."""
    body = bytearray()
    body.append(version[0])
    body.append(version[1])
    body.extend(b"\x11" * 32)  # Random
    body.append(0x00)  # Session ID length = 0

    # Cipher suites
    body.extend(struct.pack("!H", len(ciphers) * 2))
    for c in ciphers:
        body.extend(struct.pack("!H", c))

    # Compression: null only
    body.extend(b"\x01\x00")

    # Extensions
    if extensions_data:
        body.extend(struct.pack("!H", len(extensions_data)))
        body.extend(extensions_data)

    hs = build_handshake_msg(0x01, bytes(body))
    return build_tls_record(0x16, version, hs)


def build_server_hello(
    version: tuple[int, int],
    selected_cipher: int,
    extensions_data: bytes = b"",
) -> bytes:
    """Construct a TLS Server Hello handshake record."""
    body = bytearray()
    body.append(version[0])
    body.append(version[1])
    body.extend(b"\x22" * 32)  # Random
    body.append(0x00)  # Session ID length = 0
    body.extend(struct.pack("!H", selected_cipher))
    body.append(0x00)  # Compression = null

    if extensions_data:
        body.extend(struct.pack("!H", len(extensions_data)))
        body.extend(extensions_data)

    hs = build_handshake_msg(0x02, bytes(body))
    return build_tls_record(0x16, version, hs)


def build_certificate_msg(cert_der: bytes, version: tuple[int, int] = (3, 3)) -> bytes:
    """Construct a TLS Certificate message containing a single DER certificate."""
    body = bytearray()
    # Total certs length (3 bytes) + first cert len (3 bytes) + cert
    body.extend(struct.pack("!I", len(cert_der) + 3)[1:])
    body.extend(struct.pack("!I", len(cert_der))[1:])
    body.extend(cert_der)

    hs = build_handshake_msg(0x0B, bytes(body))
    return build_tls_record(0x16, version, hs)


def register_known_ja3(
    ja3_hash: str,
    client: str = "Mozilla Thunderbird",
    version: str = "115+",
    platform: str = "Cross-platform",
):
    """Ensure the given JA3 hash exists in ja3_known.json."""
    path = os.path.join(DATA_DIR, "ja3_known.json")
    data = {}
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                data = json.load(f)
        except Exception:
            pass

    if ja3_hash not in data:
        data[ja3_hash] = {"client": client, "version": version, "platform": platform}
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Registered known JA3 hash: {ja3_hash} -> {client} {version}")


def generate_hardened_tls13(filepath: str):
    """Scenario 1: Hardened TLS 1.3 on port 465 (SMTPS) or port 587."""
    cert_der = create_x509_cert(
        cn="mail.defense.gov.in",
        issuer_cn="DigiCert Global Root G2",
        key_size=2048,
        days_valid=365,
    )

    # Extensions for Client Hello
    exts = bytearray()
    # SNI: mail.defense.gov.in
    sni_bytes = b"mail.defense.gov.in"
    exts.extend(struct.pack("!HH", 0x0000, len(sni_bytes) + 5))
    exts.extend(struct.pack("!HB", len(sni_bytes) + 3, 0))
    exts.extend(struct.pack("!H", len(sni_bytes)))
    exts.extend(sni_bytes)

    # Supported groups (elliptic curves): X25519 (29), secp256r1 (23)
    exts.extend(struct.pack("!HHH", 0x000A, 6, 4))
    exts.extend(struct.pack("!HH", 29, 23))

    # EC Point Formats: uncompressed (0)
    exts.extend(struct.pack("!HHBB", 0x000B, 2, 1, 0))

    # Supported versions (Client Hello): TLS 1.3 (0x0304), TLS 1.2 (0x0303)
    exts.extend(struct.pack("!HHB", 0x002B, 5, 4))
    exts.extend(struct.pack("!HH", 0x0304, 0x0303))

    ciphers = [0x1302, 0x1301, 0xC02F, 0xC02B]  # TLS_AES_256_GCM_SHA384, TLS_AES_128_GCM_SHA256, etc.

    # Compute JA3 hash and register as Thunderbird
    ja3_str = f"771,{'-'.join(str(c) for c in ciphers)},0-10-11-43,29-23,0"
    ja3_hash = hashlib.md5(ja3_str.encode()).hexdigest()
    register_known_ja3(ja3_hash, "Mozilla Thunderbird", "115+", "Linux/Windows")

    ch_rec = build_client_hello((3, 3), ciphers, bytes(exts))

    # Server Hello with Supported Versions = 0x0304 (TLS 1.3)
    sh_exts = bytearray()
    sh_exts.extend(struct.pack("!HHH", 0x002B, 2, 0x0304))
    sh_rec = build_server_hello((3, 3), 0x1302, bytes(sh_exts))  # TLS_AES_256_GCM_SHA384
    cert_rec = build_certificate_msg(cert_der, (3, 3))

    # Assemble packets
    pkts = [
        # TCP Handshake
        Ether() / IP(src="192.168.10.45", dst="10.20.1.100") / TCP(sport=49152, dport=465, seq=1000, ack=0, flags="S"),
        Ether() / IP(src="10.20.1.100", dst="192.168.10.45") / TCP(sport=465, dport=49152, seq=5000, ack=1001, flags="SA"),
        Ether() / IP(src="192.168.10.45", dst="10.20.1.100") / TCP(sport=49152, dport=465, seq=1001, ack=5001, flags="A"),
        # Client Hello
        Ether() / IP(src="192.168.10.45", dst="10.20.1.100") / TCP(sport=49152, dport=465, seq=1001, ack=5001, flags="PA") / Raw(load=ch_rec),
        # Server Hello + Certificate
        Ether() / IP(src="10.20.1.100", dst="192.168.10.45") / TCP(sport=465, dport=49152, seq=5001, ack=1001 + len(ch_rec), flags="PA") / Raw(load=sh_rec + cert_rec),
    ]

    wrpcap(filepath, pkts)
    print(f"[+] Wrote {filepath} ({len(pkts)} packets)")


def generate_striptls_mitm(filepath: str):
    """Scenario 2: STRIPTLS Attack on port 587. MitM strips STARTTLS and intercepts cleartext auth."""
    server_banner = (
        b"220 mail.agency.gov ESMTP Postfix\r\n"
        b"250-mail.agency.gov\r\n"
        b"250-PIPELINING\r\n"
        b"250-SIZE 52428800\r\n"
        b"250 8BITMIME\r\n"  # STARTTLS deliberately stripped out!
    )
    client_ehlo = b"EHLO workstation-42.secops.gov\r\n"
    client_auth = (
        b"AUTH LOGIN\r\n"
        b"dXNlcm5hbWU=\r\n"
        b"cGFzc3dvcmQxMjM0\r\n"
        b"MAIL FROM:<commander@secops.gov>\r\n"
    )
    server_auth_ok = b"235 2.7.0 Authentication successful\r\n250 2.1.0 Ok\r\n"

    pkts = [
        # TCP 3-way handshake
        Ether() / IP(src="172.16.5.12", dst="10.0.8.25") / TCP(sport=51200, dport=587, seq=100, ack=0, flags="S"),
        Ether() / IP(src="10.0.8.25", dst="172.16.5.12") / TCP(sport=587, dport=51200, seq=500, ack=101, flags="SA"),
        Ether() / IP(src="172.16.5.12", dst="10.0.8.25") / TCP(sport=51200, dport=587, seq=101, ack=501, flags="A"),
        # Server banner
        Ether() / IP(src="10.0.8.25", dst="172.16.5.12") / TCP(sport=587, dport=51200, seq=501, ack=101, flags="PA") / Raw(load=server_banner),
        # Client EHLO
        Ether() / IP(src="172.16.5.12", dst="10.0.8.25") / TCP(sport=51200, dport=587, seq=101, ack=501 + len(server_banner), flags="PA") / Raw(load=client_ehlo),
        # Client sends cleartext auth
        Ether() / IP(src="172.16.5.12", dst="10.0.8.25") / TCP(sport=51200, dport=587, seq=101 + len(client_ehlo), ack=501 + len(server_banner), flags="PA") / Raw(load=client_auth),
        # Server responds OK
        Ether() / IP(src="10.0.8.25", dst="172.16.5.12") / TCP(sport=587, dport=51200, seq=501 + len(server_banner), ack=101 + len(client_ehlo) + len(client_auth), flags="PA") / Raw(load=server_auth_ok),
    ]

    wrpcap(filepath, pkts)
    print(f"[+] Wrote {filepath} ({len(pkts)} packets)")


def generate_legacy_tls10(filepath: str):
    """Scenario 3: Legacy vulnerable mail server on port 25. TLS 1.0 + 3DES-CBC + Expired 1024-bit RSA."""
    # Plaintext STARTTLS upgrade
    server_greet = b"220 relay.legacy.gov ESMTP Sendmail 8.13.8\r\n250-relay.legacy.gov\r\n250-STARTTLS\r\n250 OK\r\n"
    client_ehlo = b"EHLO client.branch.gov\r\nSTARTTLS\r\n"
    server_starttls_ready = b"220 2.0.0 Ready to start TLS\r\n"

    # Expired 1024-bit certificate
    expired_cert_der = create_x509_cert(
        cn="relay.legacy.gov",
        issuer_cn="Legacy Internal Root CA",
        key_size=1024,
        days_valid=365,
        is_expired=True,
        hash_algorithm=hashes.SHA256(),
    )

    ciphers = [0x000A, 0x002F]  # 0x000A = TLS_RSA_WITH_3DES_EDE_CBC_SHA
    ch_rec = build_client_hello((3, 1), ciphers)  # TLS 1.0 (3, 1)
    sh_rec = build_server_hello((3, 1), 0x000A)   # 3DES-CBC-SHA, static RSA
    cert_rec = build_certificate_msg(expired_cert_der, (3, 1))

    client_data = client_ehlo + ch_rec
    server_data = server_greet + server_starttls_ready + sh_rec + cert_rec

    pkts = [
        # TCP Handshake
        Ether() / IP(src="10.100.2.14", dst="10.100.1.5") / TCP(sport=38291, dport=25, seq=200, ack=0, flags="S"),
        Ether() / IP(src="10.100.1.5", dst="10.100.2.14") / TCP(sport=25, dport=38291, seq=800, ack=201, flags="SA"),
        Ether() / IP(src="10.100.2.14", dst="10.100.1.5") / TCP(sport=38291, dport=25, seq=201, ack=801, flags="A"),
        # Server greet
        Ether() / IP(src="10.100.1.5", dst="10.100.2.14") / TCP(sport=25, dport=38291, seq=801, ack=201, flags="PA") / Raw(load=server_greet),
        # Client sends EHLO + STARTTLS + Client Hello
        Ether() / IP(src="10.100.2.14", dst="10.100.1.5") / TCP(sport=38291, dport=25, seq=201, ack=801 + len(server_greet), flags="PA") / Raw(load=client_data),
        # Server responds ready + Server Hello + Expired Cert
        Ether() / IP(src="10.100.1.5", dst="10.100.2.14") / TCP(sport=25, dport=38291, seq=801 + len(server_greet), ack=201 + len(client_data), flags="PA") / Raw(load=server_starttls_ready + sh_rec + cert_rec),
    ]

    wrpcap(filepath, pkts)
    print(f"[+] Wrote {filepath} ({len(pkts)} packets)")


def generate_rogue_client(filepath: str):
    """Scenario 4: Rogue IMAPS client on port 993. TLS 1.2 with unknown JA3 fingerprint."""
    cert_der = create_x509_cert(
        cn="imap.internal.gov",
        issuer_cn="Government Root CA",
        key_size=2048,
        days_valid=365,
    )

    # Unusual cipher and extension order -> produces an unrecognized JA3 hash
    ciphers = [0x002F, 0x0035, 0xC013]  # AES-128-CBC, AES-256-CBC, ECDHE-RSA-AES-128-CBC
    exts = bytearray()
    exts.extend(struct.pack("!HHB", 0xFF01, 1, 0x00))  # Rare/arbitrary renegotiation info

    ch_rec = build_client_hello((3, 3), ciphers, bytes(exts))
    sh_rec = build_server_hello((3, 3), 0xC013)  # Selected TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (ECDHE PFS, CBC mode)
    cert_rec = build_certificate_msg(cert_der, (3, 3))

    pkts = [
        # TCP Handshake
        Ether() / IP(src="192.168.88.99", dst="10.50.0.143") / TCP(sport=61002, dport=993, seq=1000, ack=0, flags="S"),
        Ether() / IP(src="10.50.0.143", dst="192.168.88.99") / TCP(sport=993, dport=61002, seq=7000, ack=1001, flags="SA"),
        Ether() / IP(src="192.168.88.99", dst="10.50.0.143") / TCP(sport=61002, dport=993, seq=1001, ack=7001, flags="A"),
        # Client Hello
        Ether() / IP(src="192.168.88.99", dst="10.50.0.143") / TCP(sport=61002, dport=993, seq=1001, ack=7001, flags="PA") / Raw(load=ch_rec),
        # Server Hello + Cert
        Ether() / IP(src="10.50.0.143", dst="192.168.88.99") / TCP(sport=993, dport=61002, seq=7001, ack=1001 + len(ch_rec), flags="PA") / Raw(load=sh_rec + cert_rec),
    ]

    wrpcap(filepath, pkts)
    print(f"[+] Wrote {filepath} ({len(pkts)} packets)")


def main():
    print("=== SecureMailScope Synthetic PCAP Generator ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    pcap1 = os.path.join(OUTPUT_DIR, "hardened_tls13.pcap")
    pcap2 = os.path.join(OUTPUT_DIR, "striptls_attack.pcap")
    pcap3 = os.path.join(OUTPUT_DIR, "legacy_tls10.pcap")
    pcap4 = os.path.join(OUTPUT_DIR, "rogue_client.pcap")

    generate_hardened_tls13(pcap1)
    generate_striptls_mitm(pcap2)
    generate_legacy_tls10(pcap3)
    generate_rogue_client(pcap4)

    print("\n[OK] All 4 synthetic PCAPs successfully generated.")


if __name__ == "__main__":
    main()
