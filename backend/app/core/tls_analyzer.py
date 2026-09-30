"""
TLS Handshake Analyzer — Parses Client Hello, Server Hello, and Certificate
messages from raw bytes to extract cryptographic metadata.
"""
from __future__ import annotations

import json
import os
import struct
from dataclasses import dataclass, field


@dataclass
class TlsAnalysis:
    """Parsed TLS handshake metadata."""
    record_version: str
    negotiated_version: str
    client_cipher_suites: list[str]
    selected_cipher_hex: str
    selected_cipher_name: str
    cipher_severity: str
    cipher_is_aead: bool
    key_exchange: str
    has_forward_secrecy: bool
    sni: str | None
    certificate_der: bytes | None
    ja3_version: int
    ja3_ciphers: list[int]
    ja3_extensions: list[int]
    ja3_curves: list[int]
    ja3_point_formats: list[int]


# Load cipher database once at module level
_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "cipher_db.json")
_CIPHER_DB: dict = {}
if os.path.exists(_DB_PATH):
    with open(_DB_PATH, "r") as _f:
        _CIPHER_DB = json.load(_f)


_VERSION_MAP = {
    (3, 0): "SSL 3.0",
    (3, 1): "TLS 1.0",
    (3, 2): "TLS 1.1",
    (3, 3): "TLS 1.2",
    (3, 4): "TLS 1.3",
}


def _ver_str(major: int, minor: int) -> str:
    return _VERSION_MAP.get((major, minor), f"Unknown ({major}.{minor})")


def _cipher_hex(code: int) -> str:
    return f"0x{code:04X}"


def _find_tls_record(data: bytes, start: int) -> int:
    """Find the first TLS handshake record (content type 0x16) starting from `start`."""
    for i in range(start, len(data) - 5):
        if data[i] == 0x16 and data[i + 1] == 0x03 and data[i + 2] in (0, 1, 2, 3, 4):
            return i
    return -1


def analyze_tls(payload: bytes, offset: int = 0) -> TlsAnalysis | None:
    """
    Parse TLS handshake messages from raw bytes.

    Scans for Client Hello, Server Hello, and Certificate messages
    in the payload starting from `offset`.
    """
    if not payload or len(payload) < offset + 10:
        return None

    try:
        # State we'll accumulate across multiple TLS records
        client_hello_parsed = False
        server_hello_parsed = False

        record_version = "TLS 1.2"
        negotiated_version = "TLS 1.2"
        client_ciphers_hex: list[str] = []
        selected_cipher_code = 0
        sni: str | None = None
        cert_der: bytes | None = None

        # JA3 components
        ja3_version = 0x0303
        ja3_ciphers: list[int] = []
        ja3_extensions: list[int] = []
        ja3_curves: list[int] = []
        ja3_point_formats: list[int] = []

        # Supported versions (for TLS 1.3 detection)
        sv_ext_version: int | None = None

        pos = _find_tls_record(payload, offset)
        if pos < 0:
            return None

        # Parse up to 10 TLS records (Client Hello, Server Hello, Cert, etc.)
        records_parsed = 0
        while pos >= 0 and pos + 5 < len(payload) and records_parsed < 10:
            content_type = payload[pos]
            if content_type != 0x16:  # Only parse Handshake records
                # Try to find the next record
                rec_len = struct.unpack("!H", payload[pos + 3:pos + 5])[0] if pos + 5 <= len(payload) else 0
                pos = _find_tls_record(payload, pos + 5 + rec_len)
                records_parsed += 1
                continue

            v_maj, v_min = payload[pos + 1], payload[pos + 2]
            rec_len = struct.unpack("!H", payload[pos + 3:pos + 5])[0]

            if records_parsed == 0:
                record_version = _ver_str(v_maj, v_min)

            rec_data = payload[pos + 5:pos + 5 + rec_len]
            if len(rec_data) < 4:
                break

            # Parse handshake message header
            hs_type = rec_data[0]
            hs_len = struct.unpack("!I", b'\x00' + rec_data[1:4])[0]
            hs_body = rec_data[4:4 + hs_len]

            if hs_type == 0x01 and not client_hello_parsed:
                # === CLIENT HELLO ===
                client_hello_parsed = True
                if len(hs_body) < 38:
                    break
                ch_major, ch_minor = hs_body[0], hs_body[1]
                ja3_version = (ch_major << 8) | ch_minor
                # Random: 32 bytes (skip)
                idx = 34
                # Session ID
                if idx >= len(hs_body):
                    break
                sid_len = hs_body[idx]
                idx += 1 + sid_len
                # Cipher suites
                if idx + 2 > len(hs_body):
                    break
                cs_len = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                idx += 2
                cs_end = idx + cs_len
                while idx + 1 < cs_end and idx + 1 < len(hs_body):
                    c = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                    ja3_ciphers.append(c)
                    client_ciphers_hex.append(_cipher_hex(c))
                    idx += 2
                idx = cs_end
                # Compression methods
                if idx >= len(hs_body):
                    break
                comp_len = hs_body[idx]
                idx += 1 + comp_len
                # Extensions
                if idx + 2 <= len(hs_body):
                    ext_total_len = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                    idx += 2
                    ext_end = idx + ext_total_len
                    while idx + 4 <= ext_end and idx + 4 <= len(hs_body):
                        ext_type = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                        ext_len = struct.unpack("!H", hs_body[idx + 2:idx + 4])[0]
                        ext_data = hs_body[idx + 4:idx + 4 + ext_len]
                        ja3_extensions.append(ext_type)

                        if ext_type == 0x0000 and len(ext_data) >= 5:
                            # SNI extension
                            sni_list_len = struct.unpack("!H", ext_data[0:2])[0]
                            sni_type = ext_data[2]
                            sni_name_len = struct.unpack("!H", ext_data[3:5])[0]
                            if sni_type == 0 and 5 + sni_name_len <= len(ext_data):
                                sni = ext_data[5:5 + sni_name_len].decode("ascii", errors="replace")

                        elif ext_type == 0x000A and len(ext_data) >= 2:
                            # Supported Groups / Elliptic Curves
                            curves_len = struct.unpack("!H", ext_data[0:2])[0]
                            ci = 2
                            while ci + 1 < 2 + curves_len and ci + 1 < len(ext_data):
                                ja3_curves.append(struct.unpack("!H", ext_data[ci:ci + 2])[0])
                                ci += 2

                        elif ext_type == 0x000B and len(ext_data) >= 1:
                            # EC Point Formats
                            pf_len = ext_data[0]
                            for pi in range(1, 1 + pf_len):
                                if pi < len(ext_data):
                                    ja3_point_formats.append(ext_data[pi])

                        elif ext_type == 0x002B and len(ext_data) >= 3:
                            # Supported Versions (Client Hello variant: list)
                            sv_list_len = ext_data[0]
                            si = 1
                            while si + 1 < 1 + sv_list_len and si + 1 < len(ext_data):
                                v = struct.unpack("!H", ext_data[si:si + 2])[0]
                                if v == 0x0304:  # TLS 1.3
                                    sv_ext_version = 0x0304
                                si += 2

                        idx += 4 + ext_len

            elif hs_type == 0x02 and not server_hello_parsed:
                # === SERVER HELLO ===
                server_hello_parsed = True
                if len(hs_body) < 38:
                    break
                sh_major, sh_minor = hs_body[0], hs_body[1]
                negotiated_version = _ver_str(sh_major, sh_minor)
                # Random: 32 bytes (skip)
                idx = 34
                # Session ID
                if idx >= len(hs_body):
                    break
                sid_len = hs_body[idx]
                idx += 1 + sid_len
                # Selected cipher suite
                if idx + 2 > len(hs_body):
                    break
                selected_cipher_code = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                idx += 2
                # Compression method
                idx += 1
                # Extensions
                if idx + 2 <= len(hs_body):
                    sh_ext_len = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                    idx += 2
                    sh_ext_end = idx + sh_ext_len
                    while idx + 4 <= sh_ext_end and idx + 4 <= len(hs_body):
                        ext_type = struct.unpack("!H", hs_body[idx:idx + 2])[0]
                        ext_len = struct.unpack("!H", hs_body[idx + 2:idx + 4])[0]
                        ext_data = hs_body[idx + 4:idx + 4 + ext_len]

                        if ext_type == 0x002B and len(ext_data) >= 2:
                            # Supported Versions (Server Hello variant: single value)
                            v = struct.unpack("!H", ext_data[0:2])[0]
                            if v == 0x0304:
                                negotiated_version = "TLS 1.3"

                        idx += 4 + ext_len

            elif hs_type == 0x0B and cert_der is None:
                # === CERTIFICATE MESSAGE ===
                if len(hs_body) < 6:
                    pass
                else:
                    certs_total_len = struct.unpack("!I", b'\x00' + hs_body[0:3])[0]
                    if len(hs_body) >= 6:
                        first_cert_len = struct.unpack("!I", b'\x00' + hs_body[3:6])[0]
                        if 6 + first_cert_len <= len(hs_body):
                            cert_der = bytes(hs_body[6:6 + first_cert_len])

            # Move to next TLS record
            pos = _find_tls_record(payload, pos + 5 + rec_len)
            records_parsed += 1

        # If we also detected TLS 1.3 via client hello supported versions
        if sv_ext_version == 0x0304 and negotiated_version != "TLS 1.3":
            # Only upgrade if server also confirmed via its supported_versions ext
            pass  # Keep server's actual choice

        # Resolve cipher info
        sel_hex = _cipher_hex(selected_cipher_code)
        cipher_entry = _CIPHER_DB.get(sel_hex, {})
        sel_name = cipher_entry.get("name", f"Unknown ({sel_hex})")
        severity = cipher_entry.get("severity", "medium")
        is_aead = cipher_entry.get("aead", False)
        pfs = cipher_entry.get("pfs", False)

        # Determine key exchange from cipher name
        if "ECDHE" in sel_name:
            kx = "ECDHE"
        elif "DHE" in sel_name:
            kx = "DHE"
        else:
            kx = "RSA"

        return TlsAnalysis(
            record_version=record_version,
            negotiated_version=negotiated_version,
            client_cipher_suites=client_ciphers_hex,
            selected_cipher_hex=sel_hex,
            selected_cipher_name=sel_name,
            cipher_severity=severity,
            cipher_is_aead=is_aead,
            key_exchange=kx,
            has_forward_secrecy=pfs or kx in ("ECDHE", "DHE"),
            sni=sni,
            certificate_der=cert_der,
            ja3_version=ja3_version,
            ja3_ciphers=ja3_ciphers,
            ja3_extensions=ja3_extensions,
            ja3_curves=ja3_curves,
            ja3_point_formats=ja3_point_formats,
        )

    except Exception as e:
        print(f"TLS analysis error: {e}")
        return None
