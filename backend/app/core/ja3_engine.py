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

def compute_ja3(version: int, ciphers: list[int], extensions: list[int], curves: list[int], point_formats: list[int]) -> Ja3Result:
    """Compute JA3 fingerprint hash from TLS Client Hello parameters."""
    ciphers_filtered = filter_grease(ciphers)
    extensions_filtered = filter_grease(extensions)
    curves_filtered = filter_grease(curves)
    point_formats_filtered = filter_grease(point_formats)

    ja3_string = f"{version},{'-'.join(str(c) for c in ciphers_filtered)},{'-'.join(str(e) for e in extensions_filtered)},{'-'.join(str(c) for c in curves_filtered)},{'-'.join(str(p) for p in point_formats_filtered)}"
    ja3_hash = hashlib.md5(ja3_string.encode()).hexdigest()

    known_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ja3_known.json')
    client_name = None
    client_version = None
    is_known = False

    try:
        with open(known_path, 'r') as f:
            known_data = json.load(f)
        if ja3_hash in known_data:
            entry = known_data[ja3_hash]
            client_name = entry.get('client')       # ja3_known.json key
            client_version = entry.get('version')   # ja3_known.json key
            is_known = True
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    return Ja3Result(
        ja3_string=ja3_string,
        ja3_hash=ja3_hash,
        client_name=client_name,
        client_version=client_version,
        is_known=is_known
    )
