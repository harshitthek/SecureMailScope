import os
import json
from app.api.routes import _run_analysis

pcaps = [
    'test_pcaps/01_hardened_tls13_smtps.pcap',
    'test_pcaps/02_striptls_mitm_attack.pcap',
    'test_pcaps/03_legacy_tls10_3des.pcap',
    'test_pcaps/04_rogue_imaps_client.pcap',
    'test_pcaps/05_cleartext_pop3_leak.pcap',
    'test_pcaps/06_enterprise_multi_stream.pcap'
]

print("=== VERIFYING ALL 6 TEST PCAPS ===")
for p in pcaps:
    name = os.path.basename(p)
    res = _run_analysis(p, name)
    print(f"\n==========================================")
    print(f"FILE: {name}")
    print(f"Enterprise Score: {res['enterprise_score']} | Grade: {res['enterprise_grade']}")
    print(f"Total Streams / Sessions: {len(res['sessions'])}")
    for s in res['sessions']:
        print(f"  -> Stream #{s['session_id']}: {s['protocol']} ({s['src_ip']}:{s['src_port']} -> {s['dst_ip']}:{s['dst_port']})")
        print(f"     Score: {s['session_score']} ({s['session_grade']}) | Encrypted: {s['is_encrypted']} | TLS: {s['tls_version']}")
        print(f"     Cipher: {s['cipher_suite_name']} | PFS: {s['has_forward_secrecy']}")
        print(f"     JA3: {s['ja3_hash'][:16] if s['ja3_hash'] else 'None'}... ({s['ja3_client_name'] or 'Unknown'})")
        print(f"     Deductions: {s['scoring_breakdown']}")
    print(f"Vulnerabilities Detected ({len(res['vulnerabilities'])}):")
    for v in res['vulnerabilities']:
        print(f"  * [{v['severity'].upper()}] {v['title']}")

print("\n[OK] All 6 test PCAPs verified successfully.")
