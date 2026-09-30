import os
import json
from app.api.routes import _run_analysis

pcaps = [
    'test_pcaps/hardened_tls13.pcap',
    'test_pcaps/striptls_attack.pcap',
    'test_pcaps/legacy_tls10.pcap',
    'test_pcaps/rogue_client.pcap'
]

for p in pcaps:
    name = os.path.basename(p)
    res = _run_analysis(p, name)
    print(f"=== {name} ===")
    print(f"Score: {res['enterprise_score']} | Grade: {res['enterprise_grade']}")
    print(f"Total Sessions: {len(res['sessions'])}")
    if res['sessions']:
        s = res['sessions'][0]
        print(f"  TLS Version: {s.get('tls_version')}")
        print(f"  Cipher Suite: {s.get('cipher_suite_name')}")
        print(f"  Forward Secrecy: {s.get('has_forward_secrecy')}")
        print(f"  JA3 Hash: {s.get('ja3_hash')}")
        print(f"  JA3 Client: {s.get('ja3_client_name')} (Known: {s.get('ja3_is_known')})")
        print(f"  Deduction breakdown: {s.get('scoring_breakdown')}")
    print(f"  Vulnerabilities ({len(res['vulnerabilities'])}): {[v['title'] for v in res['vulnerabilities']]}")
    print("-" * 50)
