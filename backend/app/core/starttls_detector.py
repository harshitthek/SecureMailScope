import re
from dataclasses import dataclass

from .pcap_parser import StreamData


@dataclass
class StarttlsResult:
    is_implicit_tls: bool
    starttls_advertised: bool
    starttls_initiated: bool
    starttls_accepted: bool
    tls_offset: int | None
    is_cleartext_only: bool
    starttls_stripped: bool
    cleartext_auth_detected: bool
    server_banner: str | None


def _find_tls_offset(payload: bytes) -> int | None:
    """Find the byte offset where TLS Record Layer (Handshake 0x16 0x03 0x00..0x04) begins."""
    if not payload:
        return None
    for i in range(len(payload) - 3):
        if payload[i] == 0x16 and payload[i + 1] == 0x03 and payload[i + 2] in (0x00, 0x01, 0x02, 0x03, 0x04):
            return i
    return None


def detect_starttls(stream: StreamData) -> StarttlsResult:
    """
    Forensic protocol state machine for detecting explicit STARTTLS / STLS negotiation,
    downgrade attacks (STRIPTLS), and unencrypted credential transmission across
    SMTP, IMAP, and POP3.
    """
    if stream.is_implicit_tls:
        return StarttlsResult(
            is_implicit_tls=True,
            starttls_advertised=False,
            starttls_initiated=False,
            starttls_accepted=False,
            tls_offset=0,
            is_cleartext_only=False,
            starttls_stripped=False,
            cleartext_auth_detected=False,
            server_banner=None,
        )

    server_pl = stream.server_payload or b""
    client_pl = stream.client_payload or b""
    server_pl_upper = server_pl.upper()
    client_pl_upper = client_pl.upper()

    server_port = stream.dst_port
    proto = stream.protocol

    # Extract initial service banner
    server_banner = None
    if server_pl:
        first_line = server_pl.split(b"\r\n")[0] if b"\r\n" in server_pl else server_pl.split(b"\n")[0]
        if first_line:
            server_banner = first_line.decode("utf-8", errors="ignore").strip()

    starttls_advertised = False
    starttls_initiated = False
    starttls_accepted = False

    # 1. Protocol-specific STARTTLS negotiation detection
    if proto == "SMTP":
        # RFC 3207: Server advertises 250-STARTTLS or 250 STARTTLS
        starttls_advertised = bool(re.search(rb"250[- ]STARTTLS", server_pl_upper) or b"STARTTLS" in server_pl_upper)
        # Client initiates STARTTLS\r\n
        starttls_initiated = bool(re.search(rb"\bSTARTTLS\b", client_pl_upper))
        # Server accepts with 220
        if starttls_initiated:
            # Look for 220 response following STARTTLS command
            cmd_pos = client_pl_upper.find(b"STARTTLS")
            if cmd_pos != -1:
                starttls_accepted = bool(re.search(rb"\b220\b", server_pl))
            else:
                starttls_accepted = b"220 " in server_pl or b"220-" in server_pl
        else:
            starttls_accepted = False

    elif proto == "IMAP":
        # RFC 2595 / RFC 9051: Capability list includes STARTTLS
        starttls_advertised = b"STARTTLS" in server_pl_upper
        # Client sends tagged STARTTLS: e.g. "a01 STARTTLS" or "STARTTLS"
        starttls_initiated = bool(re.search(rb"\bSTARTTLS\b", client_pl_upper))
        # Server accepts with tagged OK or status OK
        if starttls_initiated:
            starttls_accepted = bool(re.search(rb"\bOK\b", server_pl_upper))
        else:
            starttls_accepted = False

    elif proto == "POP3":
        # RFC 2595: Capability list response to CAPA includes STLS
        starttls_advertised = bool(b"STLS" in server_pl_upper)
        # Client sends STLS command
        starttls_initiated = bool(re.search(rb"\bSTLS\b", client_pl_upper))
        # Server responds +OK
        if starttls_initiated:
            starttls_accepted = bool(re.search(rb"\+OK", server_pl))
        else:
            starttls_accepted = False

    else:
        # Generic heuristic
        starttls_advertised = b"STARTTLS" in server_pl_upper or b"STLS" in server_pl_upper
        starttls_initiated = b"STARTTLS" in client_pl_upper or b"STLS" in client_pl_upper
        starttls_accepted = b"220" in server_pl or b"+OK" in server_pl or b" OK " in server_pl_upper

    # 2. Precise TLS Handshake start offset in client stream
    tls_offset = _find_tls_offset(client_pl)
    is_cleartext = tls_offset is None

    # 3. Detect STRIPTLS downgrade attack
    # Submission port 587 RFC 6409 requires TLS; if STARTTLS is not offered or stripped, flag attack
    starttls_stripped = False
    if server_port == 587 and not starttls_advertised:
        starttls_stripped = True
    elif starttls_initiated and not starttls_accepted and is_cleartext:
        starttls_stripped = True

    # 4. Cleartext Authentication Credentials Detection
    # Inspect payloads occurring before encryption was established
    pre_tls_client = client_pl[:tls_offset] if tls_offset is not None else client_pl
    pre_tls_upper = pre_tls_client.upper()

    cleartext_auth = bool(
        # SMTP AUTH PLAIN / LOGIN / CRAM-MD5 at line start
        re.search(rb"(?:^|\r\n|\n)AUTH\s+(PLAIN|LOGIN|CRAM-MD5)", pre_tls_upper)
        or
        # IMAP LOGIN username password or tagged LOGIN
        re.search(rb"(?:^|\r\n|\n)(?:[A-Z0-9]+\s+)?LOGIN\s+[^\r\n]+\s+[^\r\n]+", pre_tls_upper)
        or
        # POP3 USER / PASS sequence
        (re.search(rb"(?:^|\r\n|\n)USER\s+", pre_tls_upper) and re.search(rb"(?:^|\r\n|\n)PASS\s+", pre_tls_upper))
    )

    return StarttlsResult(
        is_implicit_tls=False,
        starttls_advertised=starttls_advertised,
        starttls_initiated=starttls_initiated,
        starttls_accepted=starttls_accepted,
        tls_offset=tls_offset,
        is_cleartext_only=is_cleartext,
        starttls_stripped=starttls_stripped,
        cleartext_auth_detected=cleartext_auth,
        server_banner=server_banner,
    )
