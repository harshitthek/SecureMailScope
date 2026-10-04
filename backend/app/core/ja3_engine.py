import hashlib
import json
import os
from dataclasses import dataclass

@dataclass
class Ja3Result:
    ja3_string: str
    ja3_hash: str
    client_name: str | None
    client_version: str | None
    is_known: bool

# TLS GREASE values that should be filtered out
GREASE_VALUES = {
    0x0a0a, 0x1a1a, 0x2a2a, 0x3a3a, 0x4a4a, 0x5a5a, 0x6a6a, 0x7a7a,
    0x8a8a, 0x9a9a, 0xaaaa, 0xbaba, 0xcaca, 0xdada, 0xeaea, 0xfafa
}

def filter_grease(values: list[int]) -> list[int]:
    """Remove GREASE values from a list of identifiers."""
    return [v for v in values if v not in GREASE_VALUES]

_KNOWN_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'ja3_known.json')
_KNOWN_DATA_CACHE: dict | None = None

def _get_known_ja3() -> dict:
    global _KNOWN_DATA_CACHE
    if _KNOWN_DATA_CACHE is None:
        try:
            with open(_KNOWN_PATH, 'r', encoding='utf-8') as f:
                _KNOWN_DATA_CACHE = json.load(f)
        except Exception:
            _KNOWN_DATA_CACHE = {}
    return _KNOWN_DATA_CACHE

def compute_ja3(version: int, ciphers: list[int], extensions: list[int], curves: list[int], point_formats: list[int]) -> Ja3Result:
    """Compute JA3 fingerprint hash from TLS Client Hello parameters."""
    ciphers_filtered = filter_grease(ciphers)
    extensions_filtered = filter_grease(extensions)
    curves_filtered = filter_grease(curves)
    point_formats_filtered = filter_grease(point_formats)

    ja3_string = f"{version},{'-'.join(str(c) for c in ciphers_filtered)},{'-'.join(str(e) for e in extensions_filtered)},{'-'.join(str(c) for c in curves_filtered)},{'-'.join(str(p) for p in point_formats_filtered)}"
    ja3_hash = hashlib.md5(ja3_string.encode()).hexdigest()

    known_data = _get_known_ja3()
    client_name = None
    client_version = None
    is_known = False

    if ja3_hash in known_data:
        entry = known_data[ja3_hash]
        client_name = entry.get('client')       # ja3_known.json key
        client_version = entry.get('version')   # ja3_known.json key
        is_known = True

    return Ja3Result(
        ja3_string=ja3_string,
        ja3_hash=ja3_hash,
        client_name=client_name,
        client_version=client_version,
        is_known=is_known
    )

@dataclass
class Ja3sResult:
    ja3s_string: str
    ja3s_hash: str

def compute_ja3s(version: int, cipher: int, extensions: list[int]) -> Ja3sResult:
    """Compute JA3S server fingerprint hash from TLS Server Hello parameters."""
    exts_filtered = filter_grease(extensions)
    ja3s_string = f"{version},{cipher},{'-'.join(str(e) for e in exts_filtered)}"
    ja3s_hash = hashlib.md5(ja3s_string.encode()).hexdigest()
    return Ja3sResult(
        ja3s_string=ja3s_string,
        ja3s_hash=ja3s_hash
    )

