"""
Dynamic Ansible Playbook generator for Postfix and Dovecot mail infrastructure hardening.
Generates idempotent, production-grade playbooks directly from discovered cryptographic posture findings.
"""

from __future__ import annotations

from typing import Any


def generate_ansible_playbook(case_data: dict[str, Any]) -> str:
    """Generate an idempotent Ansible playbook tailored to discovered cryptographic weaknesses."""
    case_code = case_data.get("case_code") or case_data.get("analysis_id", "CASE-UNKNOWN")
    target_host = case_data.get("filename", "mail-gateway.defense.gov.in")
    vulns = case_data.get("vulnerabilities", [])
    protocols = [str(p).upper() for p in case_data.get("protocols_detected", [])]
    is_dovecot = any(p in protocols for p in ("IMAP", "IMAPS", "POP3", "POP3S"))

    titles = [str(v.get("title", "")).lower() for v in vulns]
    mitres = [str(v.get("mitre_attack_id", "")) for v in vulns]

    has_striptls = any("t1557.002" in m for m in mitres) or any("striptls" in t for t in titles)
    has_auth_exposure = any("t1552.001" in m for m in mitres) or any("auth" in t or "credential" in t for t in titles)
    has_proto_weak = any("t1600.001" in m for m in mitres) or any("ssl" in t or "tls 1.0" in t for t in titles)
    has_cipher_weak = any("t1600.002" in m for m in mitres) or any(
        "3des" in t or "rc4" in t or "cipher" in t for t in titles
    )
    has_cert_weak = any(any(k in t for k in ("expired", "self-signed", "signature", "key")) for t in titles)

    lines: list[str] = [
        "---",
        f"# SecureMailScope Dynamic Remediation Playbook for {case_code}",
        f"# Target Artifact: {target_host} | NIST SP 800-52r2 Compliance",
        f"- name: Harden Mail Server Cryptographic Configuration ({case_code})",
        "  hosts: mail_servers",
        "  become: true",
        "  vars:",
        "    postfix_main_cf: /etc/postfix/main.cf",
        "    dovecot_ssl_conf: /etc/dovecot/conf.d/10-ssl.conf",
        "  tasks:",
    ]

    # Task: Base Postfix STARTTLS Mandate
    if has_striptls:
        lines.extend(
            [
                "    - name: Mitigate STRIPTLS (T1557.002) - Mandate encryption on submission port",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ postfix_main_cf }}"',
                "        regexp: '^smtpd_tls_security_level\\s*='",
                "        line: 'smtpd_tls_security_level = may'",
                "      notify: Restart Postfix",
            ]
        )

    # Task: Prevent Cleartext Auth
    if has_auth_exposure or has_striptls:
        lines.extend(
            [
                "    - name: Mitigate Credential Exposure (T1552.001) - Disallow plaintext authentication over cleartext",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ postfix_main_cf }}"',
                "        regexp: '^smtpd_tls_auth_only\\s*='",
                "        line: 'smtpd_tls_auth_only = yes'",
                "      notify: Restart Postfix",
            ]
        )

    # Task: Deprecated Protocol Rejection
    if has_proto_weak or not vulns:
        lines.extend(
            [
                "    - name: Mitigate Deprecated Protocols (T1600.001) - Enforce TLS 1.2+ minimum",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ postfix_main_cf }}"',
                "        regexp: '^smtpd_tls_mandatory_protocols\\s*='",
                "        line: 'smtpd_tls_mandatory_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1'",
                "      notify: Restart Postfix",
                "    - name: Enforce opportunistic TLS 1.2+ minimum for general transport",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ postfix_main_cf }}"',
                "        regexp: '^smtpd_tls_protocols\\s*='",
                "        line: 'smtpd_tls_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1'",
                "      notify: Restart Postfix",
            ]
        )

    # Task: Cipher Suite Hardening
    if has_cipher_weak or not vulns:
        lines.extend(
            [
                "    - name: Mitigate Weak Ciphers (T1600.002) - Enforce High AEAD forward-secret ciphers",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ postfix_main_cf }}"',
                "        regexp: '^tls_high_cipherlist\\s*='",
                "        line: 'tls_high_cipherlist = HIGH:!aNULL:!kRSA:!3DES:!RC4:!MD5:!PSK'",
                "      notify: Restart Postfix",
                "    - name: Enforce mandatory high cipher suite grade",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ postfix_main_cf }}"',
                "        regexp: '^smtpd_tls_mandatory_ciphers\\s*='",
                "        line: 'smtpd_tls_mandatory_ciphers = high'",
                "      notify: Restart Postfix",
            ]
        )

    # Task: Certificate Hardening
    if has_cert_weak:
        lines.extend(
            [
                "    - name: Ensure X.509 certificate and private key paths exist and have restrictive permissions",
                "      ansible.builtin.file:",
                "        path: /etc/ssl/certs/mailserver.pem",
                "        owner: root",
                "        group: root",
                "        mode: '0644'",
            ]
        )

    # Task: Dovecot IMAP/POP3 Hardening
    if is_dovecot:
        lines.extend(
            [
                "    - name: Enforce Dovecot SSL mandatory requirement and TLS 1.2+",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ dovecot_ssl_conf }}"',
                "        regexp: '^ssl\\s*='",
                "        line: 'ssl = required'",
                "      notify: Restart Dovecot",
                "    - name: Set Dovecot minimum protocol version",
                "      ansible.builtin.lineinfile:",
                '        path: "{{ dovecot_ssl_conf }}"',
                "        regexp: '^ssl_min_protocol\\s*='",
                "        line: 'ssl_min_protocol = TLSv1.2'",
                "      notify: Restart Dovecot",
            ]
        )

    lines.extend(
        [
            "  handlers:",
            "    - name: Restart Postfix",
            "      ansible.builtin.service:",
            "        name: postfix",
            "        state: restarted",
            "    - name: Restart Dovecot",
            "      ansible.builtin.service:",
            "        name: dovecot",
            "        state: restarted",
            "",
        ]
    )

    return "\n".join(lines)
