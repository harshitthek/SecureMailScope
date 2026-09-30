from dataclasses import dataclass
from typing import Optional
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

def detect_starttls(stream: StreamData) -> StarttlsResult:
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
            server_banner=None
        )

    server_pl = stream.server_payload
    client_pl = stream.client_payload

    starttls_advertised = b"250-STARTTLS" in server_pl or b"250 STARTTLS" in server_pl or b"STARTTLS" in server_pl
    starttls_initiated = b"STARTTLS\r\n" in client_pl
    
    # Very basic check, in reality should parse responses based on protocol
    starttls_accepted = b"220" in server_pl.split(b"STARTTLS")[-1] if b"STARTTLS" in server_pl else (b"220 " in server_pl or b"OK" in server_pl)

    # Find offset
    tls_offset = None
    combined = server_pl + client_pl # naive way to search for offset in this simplified model
    
    # Better: look for 0x16 0x03 in client payload since client starts TLS handshake
    c_idx = client_pl.find(b"\x16\x03")
    if c_idx != -1:
        tls_offset = c_idx

    is_cleartext = tls_offset is None
    
    starttls_stripped = (stream.dst_port == 587 and not starttls_advertised)

    # Auth check before TLS
    pre_tls_client = client_pl[:tls_offset] if tls_offset is not None else client_pl
    auth_detected = b"AUTH PLAIN" in pre_tls_client or b"AUTH LOGIN" in pre_tls_client

    server_banner = None
    first_line = server_pl.split(b"\r\n")[0] if b"\r\n" in server_pl else server_pl
    if first_line:
        server_banner = first_line.decode('utf-8', errors='ignore')

    return StarttlsResult(
        is_implicit_tls=False,
        starttls_advertised=starttls_advertised,
        starttls_initiated=starttls_initiated,
        starttls_accepted=starttls_accepted,
        tls_offset=tls_offset,
        is_cleartext_only=is_cleartext,
        starttls_stripped=starttls_stripped,
        cleartext_auth_detected=auth_detected,
        server_banner=server_banner
    )
