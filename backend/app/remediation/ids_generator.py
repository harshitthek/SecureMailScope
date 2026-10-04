"""
Dynamic Intrusion Detection System (IDS/IPS) signature generator for Suricata and Snort 3.
Emits tailored network inspection rules targeting mail protocol tampering and downgrade attacks.
"""

from __future__ import annotations

from typing import Any

SID_BASE = 2615900


def generate_suricata_rules(case_data: dict[str, Any]) -> str:
    """Generate Suricata rules file (.rules) targeting detected mail attack vectors."""
    case_code = case_data.get("case_code") or case_data.get("analysis_id", "CASE-UNKNOWN")
    vulns = case_data.get("vulnerabilities", [])
    titles = [str(v.get("title", "")).lower() for v in vulns]
    mitres = [str(v.get("mitre_attack_id", "")) for v in vulns]

    rules: list[str] = [
        f"# SecureMailScope Suricata Detection Rules for {case_code}",
        "# SIH26159 NTRO Passive Email Cryptographic Defense Engine",
        "# Applicable Ports: 25 (SMTP), 587 (Submission), 465 (SMTPS), 143/993 (IMAP/S), 110/995 (POP3/S)",
        "",
    ]

    sid = SID_BASE + 1
    # Rule 1: STRIPTLS Downgrade Detection
    if any("t1557.002" in m for m in mitres) or any("striptls" in t for t in titles) or not vulns:
        rules.append(
            f'alert tcp $EXTERNAL_NET any -> $HOME_NET [25,587] (msg:"SECUREMAILSCOPE [T1557.002] Adversary-in-the-Middle STRIPTLS Downgrade Attempt"; '
            f'flow:established,to_server; content:"STARTTLS"; nocase; classtype:attempted-admin; '
            f"reference:mitre-attack,T1557.002; sid:{sid}; rev:1;)"
        )
        sid += 1

    # Rule 2: Plaintext Credentials on Wire
    if any("t1552.001" in m for m in mitres) or any("auth" in t or "credential" in t for t in titles) or not vulns:
        rules.append(
            f'alert tcp $EXTERNAL_NET any -> $HOME_NET [25,110,143,587] (msg:"SECUREMAILSCOPE [T1552.001] Cleartext Authentication Credentials on Insecure Channel"; '
            f'flow:established,to_server; content:"AUTH PLAIN"; nocase; classtype:credential-theft; '
            f"reference:mitre-attack,T1552.001; sid:{sid}; rev:1;)"
        )
        sid += 1

    # Rule 3: Deprecated SSL 3.0 / TLS 1.0 Handshake Offer
    if any("t1600.001" in m for m in mitres) or any("ssl" in t or "tls 1.0" in t for t in titles) or not vulns:
        rules.append(
            f'alert tcp $EXTERNAL_NET any -> $HOME_NET [25,465,587,993,995] (msg:"SECUREMAILSCOPE [T1600.001] Deprecated SSL 3.0 / TLS 1.0 Handshake Offered"; '
            f'flow:established,to_server; content:"|16 03|"; depth:2; content:"|00|"; distance:0; within:1; classtype:policy-violation; '
            f"reference:mitre-attack,T1600.001; sid:{sid}; rev:1;)"
        )
        sid += 1

    # Rule 4: Weak 3DES / Sweet32 Cipher Suite
    if (
        any("t1600.002" in m for m in mitres)
        or any("3des" in t or "rc4" in t or "cipher" in t for t in titles)
        or not vulns
    ):
        rules.append(
            f'alert tcp $EXTERNAL_NET any -> $HOME_NET [25,465,587,993,995] (msg:"SECUREMAILSCOPE [T1600.002] Insecure 3DES-EDE-CBC Cipher Suite Offered (Sweet32)"; '
            f'flow:established,to_server; content:"|00 0a|"; classtype:policy-violation; '
            f"reference:mitre-attack,T1600.002; sid:{sid}; rev:1;)"
        )
        sid += 1

    rules.append("")
    return "\n".join(rules)


def generate_snort_rules(case_data: dict[str, Any]) -> str:
    """Generate Snort 3 rules file (.rules) targeting detected mail attack vectors."""
    suricata_rules = generate_suricata_rules(case_data)
    # Convert header and format markers to Snort 3 format conventions
    header = [
        f"# SecureMailScope Snort 3 Detection Rules for {case_data.get('case_code', 'CASE-UNKNOWN')}",
        "# SIH26159 NTRO Mail Defense Signature Ruleset",
        "",
    ]
    body = [line for line in suricata_rules.splitlines() if line and not line.startswith("#")]
    return "\n".join(header + body) + "\n"
