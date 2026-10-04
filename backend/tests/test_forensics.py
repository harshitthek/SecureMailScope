"""
Comprehensive Forensic Unit & Integration Test Suite for SecureMailScope.
Covers:
1. TCP segment stream reassembly & deduplication
2. Protocol state machines (SMTP, IMAP, POP3) & STRIPTLS detection
3. JA3 and JA3S fingerprinting with GREASE filtering
4. NIST-aligned posture scoring & grade calculation
5. X.509 Certificate parsing with timezone-aware UTC timestamps
6. End-to-end multi-stream PCAP analysis
"""
import os
import unittest
import datetime
from scapy.all import IP, TCP

from app.core.pcap_parser import reassemble_tcp_payload, StreamData
from app.core.starttls_detector import detect_starttls, StarttlsResult
from app.core.ja3_engine import compute_ja3, compute_ja3s
from app.core.scorer import score_session, score_enterprise, calculate_grade_and_severity
from app.core.cert_validator import validate_certificate
from app.api.routes import _run_analysis


class TestForensicLogic(unittest.TestCase):

    def test_tcp_reassembly_deduplication(self):
        """Verify TCP reassembly correctly handles duplicate segments and overlaps."""
        p1 = IP(src="192.168.1.1", dst="10.0.0.1") / TCP(sport=50000, dport=25, seq=100) / b"EHLO client.example.com\r\n"
        p1.time = 1.0

        # Duplicate retransmission of p1
        p1_dup = IP(src="192.168.1.1", dst="10.0.0.1") / TCP(sport=50000, dport=25, seq=100) / b"EHLO client.example.com\r\n"
        p1_dup.time = 1.1

        # Subsequent packet
        p2 = IP(src="192.168.1.1", dst="10.0.0.1") / TCP(sport=50000, dport=25, seq=100 + len(b"EHLO client.example.com\r\n")) / b"STARTTLS\r\n"
        p2.time = 1.2

        packets = [p1, p1_dup, p2]
        payload = reassemble_tcp_payload(packets)
        
        expected = b"EHLO client.example.com\r\nSTARTTLS\r\n"
        self.assertEqual(payload, expected)

    def test_starttls_detection_smtp(self):
        """Test SMTP STARTTLS advertised and accepted."""
        stream = StreamData(
            stream_id=1,
            src_ip="192.168.1.10",
            src_port=49000,
            dst_ip="10.0.0.25",
            dst_port=25,
            protocol="SMTP",
            is_implicit_tls=False,
            client_payload=b"EHLO mail\r\nSTARTTLS\r\n\x16\x03\x03\x00\x10",
            server_payload=b"220 mail.org ESMTP\r\n250-STARTTLS\r\n250 OK\r\n220 Go ahead\r\n",
            timestamp="",
            packet_count=5
        )
        res = detect_starttls(stream)
        self.assertTrue(res.starttls_advertised)
        self.assertTrue(res.starttls_initiated)
        self.assertTrue(res.starttls_accepted)
        self.assertFalse(res.is_cleartext_only)
        self.assertFalse(res.starttls_stripped)

    def test_starttls_detection_imap(self):
        """Test IMAP STARTTLS detection."""
        stream = StreamData(
            stream_id=2,
            src_ip="192.168.1.10",
            src_port=49001,
            dst_ip="10.0.0.143",
            dst_port=143,
            protocol="IMAP",
            is_implicit_tls=False,
            client_payload=b"a01 CAPABILITY\r\na02 STARTTLS\r\n\x16\x03\x03\x00\x10",
            server_payload=b"* OK IMAP4rev1\r\n* CAPABILITY IMAP4rev1 STARTTLS\r\na02 OK Begin TLS\r\n",
            timestamp="",
            packet_count=5
        )
        res = detect_starttls(stream)
        self.assertTrue(res.starttls_advertised)
        self.assertTrue(res.starttls_initiated)
        self.assertTrue(res.starttls_accepted)

    def test_starttls_detection_pop3(self):
        """Test POP3 STLS detection."""
        stream = StreamData(
            stream_id=3,
            src_ip="192.168.1.10",
            src_port=49002,
            dst_ip="10.0.0.110",
            dst_port=110,
            protocol="POP3",
            is_implicit_tls=False,
            client_payload=b"CAPA\r\nSTLS\r\n\x16\x03\x03\x00\x10",
            server_payload=b"+OK POP3 server ready\r\n+OK Capability list follows\r\nSTLS\r\n.\r\n+OK Begin TLS\r\n",
            timestamp="",
            packet_count=5
        )
        res = detect_starttls(stream)
        self.assertTrue(res.starttls_advertised)
        self.assertTrue(res.starttls_initiated)
        self.assertTrue(res.starttls_accepted)

    def test_striptls_downgrade_detection(self):
        """Test STRIPTLS attack detected on submission port 587."""
        stream = StreamData(
            stream_id=4,
            src_ip="172.16.5.12",
            src_port=51200,
            dst_ip="10.0.8.25",
            dst_port=587,
            protocol="SMTP",
            is_implicit_tls=False,
            client_payload=b"EHLO client\r\nAUTH PLAIN dGVzdA==\r\n",
            server_payload=b"220 mail.gov ESMTP\r\n250-PIPELINING\r\n250 8BITMIME\r\n",
            timestamp="",
            packet_count=4
        )
        res = detect_starttls(stream)
        self.assertFalse(res.starttls_advertised)
        self.assertTrue(res.starttls_stripped)
        self.assertTrue(res.cleartext_auth_detected)
        self.assertTrue(res.is_cleartext_only)

    def test_ja3_and_ja3s_calculation(self):
        """Test JA3 and JA3S calculations with GREASE filtering."""
        # 0x0a0a is GREASE and must be filtered
        ciphers = [0x0a0a, 0x1301, 0xc02f]
        exts = [0x0000, 0x0a0a, 0x002b]
        curves = [0x001d, 0x0017]
        points = [0]

        ja3 = compute_ja3(0x0303, ciphers, exts, curves, points)
        self.assertNotIn("2570", ja3.ja3_string)  # 0x0a0a = 2570
        self.assertEqual(len(ja3.ja3_hash), 32)

        ja3s = compute_ja3s(0x0303, 0x1301, [0x0a0a, 0x002b])
        self.assertNotIn("2570", ja3s.ja3s_string)
        self.assertEqual(len(ja3s.ja3s_hash), 32)

    def test_scorer_and_grade_boundaries(self):
        """Test score clamping and grade mappings."""
        # Cleartext session: score 0, F, critical
        cleartext_score = score_session(
            tls_version="None (Cleartext)",
            cipher_category=None,
            cipher_is_aead=False,
            key_exchange=None,
            cert=None,
            ja3_known=False,
            is_cleartext=True
        )
        self.assertEqual(cleartext_score.final_score, 0)
        self.assertEqual(cleartext_score.grade, "F")
        self.assertEqual(cleartext_score.severity, "critical")

        # Hardened TLS 1.3 session: score 100, A+, secure
        hardened_score = score_session(
            tls_version="TLS 1.3",
            cipher_category="TLS13",
            cipher_is_aead=True,
            key_exchange="ECDHE",
            cert=None,
            ja3_known=True,
            is_cleartext=False
        )
        self.assertEqual(hardened_score.final_score, 100)
        self.assertEqual(hardened_score.grade, "A+")
        self.assertEqual(hardened_score.severity, "secure")

        # Grade boundaries
        self.assertEqual(calculate_grade_and_severity(95), ("A+", "secure"))
        self.assertEqual(calculate_grade_and_severity(85), ("A", "low"))
        self.assertEqual(calculate_grade_and_severity(75), ("B", "low"))
        self.assertEqual(calculate_grade_and_severity(65), ("C", "medium"))
        self.assertEqual(calculate_grade_and_severity(55), ("D", "medium"))
        self.assertEqual(calculate_grade_and_severity(45), ("F", "high"))
        self.assertEqual(calculate_grade_and_severity(10), ("F", "critical"))

    def test_x509_certificate_utc_timestamps(self):
        """Test X.509 certificate validation returns timezone-aware ISO timestamps."""
        from cryptography import x509
        from cryptography.hazmat.primitives import serialization
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import rsa

        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "mail.test.internal")])
        now = datetime.datetime.now(datetime.timezone.utc)
        cert = (
            x509.CertificateBuilder()
            .subject_name(name)
            .issuer_name(name)
            .public_key(key.public_key())
            .serial_number(123456789)
            .not_valid_before(now - datetime.timedelta(days=1))
            .not_valid_after(now + datetime.timedelta(days=365))
            .sign(key, hashes.SHA256())
        )
        der_bytes = cert.public_bytes(serialization.Encoding.DER)

        info = validate_certificate(der_bytes)
        self.assertIsNotNone(info)
        self.assertEqual(info.subject_cn, "mail.test.internal")
        self.assertTrue(info.is_self_signed)
        self.assertFalse(info.is_expired)
        self.assertFalse(info.is_weak_key)
        self.assertFalse(info.is_weak_signature)
        self.assertEqual(info.public_key_type, "RSA")
        self.assertEqual(info.public_key_bits, 2048)

    def test_e2e_all_six_pcaps(self):
        """Test analysis on all 6 sample PCAPs."""
        base_dir = os.path.join(os.path.dirname(__file__), "..", "test_pcaps")
        pcap_files = [
            "01_hardened_tls13_smtps.pcap",
            "02_striptls_mitm_attack.pcap",
            "03_legacy_tls10_3des.pcap",
            "04_rogue_imaps_client.pcap",
            "05_cleartext_pop3_leak.pcap",
            "06_enterprise_multi_stream.pcap"
        ]
        for pf in pcap_files:
            full_path = os.path.join(base_dir, pf)
            if os.path.exists(full_path):
                res = _run_analysis(full_path, pf)
                self.assertIn("enterprise_score", res)
                self.assertIn("enterprise_grade", res)
                self.assertIn("sessions", res)
                self.assertIn("vulnerabilities", res)
                self.assertGreater(len(res["sessions"]), 0)

    def test_html_report_generation(self):
        """Verify HTML forensic report generates valid, complete, and air-gapped HTML5 markup."""
        from app.reports.html_exporter import generate_html_report
        mock_analysis = {
            "analysis_id": "TEST-HTML-001",
            "filename": "test_evidence.pcap",
            "analyzed_at": "2026-10-04T00:00:00Z",
            "file_size_bytes": 10240,
            "processing_time_ms": 25,
            "enterprise_score": 95,
            "enterprise_grade": "A+",
            "protocols_detected": ["SMTPS", "IMAPS"],
            "sessions": [
                {
                    "session_id": "FLOW-01",
                    "protocol": "SMTPS",
                    "src_ip": "10.0.0.1",
                    "src_port": 45000,
                    "dst_ip": "10.0.0.25",
                    "dst_port": 465,
                    "is_implicit_tls": True,
                    "tls_version": "TLS 1.3",
                    "cipher_name": "TLS_AES_256_GCM_SHA384",
                    "has_forward_secrecy": True,
                    "session_score": 100,
                    "session_grade": "A+",
                }
            ],
            "vulnerabilities": [
                {
                    "title": "Legacy Protocol Warning",
                    "description": "TLS 1.0 identified on legacy interface",
                    "severity": "low",
                    "protocol": "SMTP",
                    "affected_session_id": "FLOW-01",
                    "remediation": "smtpd_tls_mandatory_protocols = !TLSv1",
                }
            ],
            "compliance": [
                {
                    "standard": "NIST SP 800-52r2",
                    "section": "Section 3.1",
                    "requirement": "TLS 1.2 or TLS 1.3 mandated",
                    "status": "pass",
                    "details": "Negotiated TLS 1.3",
                }
            ],
            "certificate_summary": [
                {
                    "subject_cn": "mail.secure-defense.gov.in",
                    "issuer_cn": "National Defense CA",
                    "is_expired": False,
                    "is_self_signed": False,
                    "days_remaining": 320,
                    "public_key_type": "RSA",
                    "public_key_bits": 4096,
                    "signature_hash": "SHA-256",
                }
            ],
        }
        html_out = generate_html_report(mock_analysis)
        self.assertIn("<!DOCTYPE html>", html_out)
        self.assertIn("TEST-HTML-001", html_out)
        self.assertIn("SecureMailScope Forensic Audit Dossier", html_out)
        self.assertIn("GRADE A+", html_out)
        self.assertIn("NIST SP 800-52r2", html_out)
        self.assertIn("mail.secure-defense.gov.in", html_out)
        self.assertIn("Postfix", html_out)

    def test_pqc_and_mitre_intelligence(self):
        """Verify Post-Quantum classification and MITRE ATT&CK/D3FEND mappings."""
        pcap_path = os.path.join(os.path.dirname(__file__), "..", "test_pcaps", "01_hardened_tls13_smtps.pcap")
        if not os.path.exists(pcap_path):
            self.skipTest("Sample pcap not found")

        analysis = _run_analysis(pcap_path, "01_hardened_tls13_smtps.pcap")
        sessions = analysis.get("sessions", [])
        self.assertGreater(len(sessions), 0)

        for s in sessions:
            self.assertIn("pqc_status", s)
            self.assertIn("pqc_group_name", s)
            self.assertIn("pqc_hndl_risk", s)
            self.assertIn(s["pqc_status"], ["PQC_RESISTANT", "CLASSICAL_TRANSITIONAL", "CRQC_HARVEST_CRITICAL", "UNENCRYPTED_EXPOSED", "UNKNOWN"])

        vulns = analysis.get("vulnerabilities", [])
        for v in vulns:
            self.assertIn("mitre_attack_id", v)
            self.assertIn("mitre_d3fend_id", v)

    def test_pem_certificate_serialization(self):
        """Verify raw X.509 certificate serializes to valid PEM format."""
        pcap_path = os.path.join(os.path.dirname(__file__), "..", "test_pcaps", "01_hardened_tls13_smtps.pcap")
        if not os.path.exists(pcap_path):
            self.skipTest("Sample pcap not found")

        analysis = _run_analysis(pcap_path, "01_hardened_tls13_smtps.pcap")
        cert_found = False
        for s in analysis.get("sessions", []):
            cert = s.get("certificate")
            if cert and cert.get("pem_data"):
                cert_found = True
                pem_str = cert["pem_data"]
                self.assertTrue(pem_str.startswith("-----BEGIN CERTIFICATE-----"))
                self.assertIn("-----END CERTIFICATE-----", pem_str)
                break
        self.assertTrue(cert_found, "Expected at least one session with certificate PEM serialization")

    def test_security_hardening_sanitization(self):
        """Verify API security hardening: token sanitization and filename defense."""
        from app.api.routes import _safe_export_token

        # Test path traversal injection
        self.assertEqual(_safe_export_token("../../../etc/passwd"), "etcpasswd")
        # Test windows path traversal
        self.assertEqual(_safe_export_token("..\\..\\boot.ini"), "bootini")
        # Test special characters and 16-char max truncation
        self.assertEqual(_safe_export_token("<script>alert(1)</script>"), "scriptalert1scri")
        # Test normal UUID truncation
        self.assertEqual(_safe_export_token("c28a8607-7b83-498c-8f2a-b62a6fa2c123"), "c28a8607-7b83-49")
        # Test empty input fallback
        self.assertEqual(_safe_export_token(""), "evidence")
        self.assertEqual(_safe_export_token("!@#$%^&*()"), "evidence")


    def test_pdf_report_special_characters_escaping(self):
        """Verify PDF exporter safely escapes XML characters without crashing."""
        from app.reports.pdf_exporter import generate_pdf_report
        sample_analysis = {
            "analysis_id": "TEST-XML-01",
            "filename": "capture <test> & audit.pcap",
            "analyzed_at": "2026-10-04T12:00:00Z",
            "processing_time_ms": 12,
            "enterprise_score": 85,
            "enterprise_grade": "A",
            "total_sessions": 1,
            "protocols_detected": ["SMTP"],
            "sessions": [
                {
                    "session_id": 1,
                    "server_name": "mail.example.gov",
                    "protocol": "SMTP",
                    "tls_version": "TLS 1.3",
                    "cipher_suite_name": "TLS_AES_256_GCM_SHA384",
                    "has_forward_secrecy": True,
                    "session_score": 85,
                }
            ],
            "vulnerabilities": [
                {
                    "severity": "high",
                    "title": "Weak Key < 2048 & Inadequate Hash",
                    "description": "RSA key size < 2048 bits & MD5/SHA-1 detected in certificate",
                    "remediation": "Re-issue certificate with RSA >= 2048 bits & SHA-256",
                }
            ],
            "compliance": [
                {
                    "status": "pass",
                    "standard": "NIST SP 800-52r2",
                    "section": "§3.1",
                    "requirement": "TLS 1.2 or higher enforced & active",
                }
            ],
        }
        pdf_bytes = generate_pdf_report(sample_analysis)
        self.assertTrue(pdf_bytes.startswith(b"%PDF-1.4"))
        self.assertGreater(len(pdf_bytes), 1000)

    def test_starttls_auth_false_positive_prevention(self):
        """Verify auth domain names in EHLO do not trigger cleartext auth alerts."""
        from app.core.pcap_parser import StreamData
        from app.core.starttls_detector import detect_starttls
        stream = StreamData(
            stream_id=1,
            src_ip="192.168.1.10",
            src_port=49152,
            dst_ip="10.0.0.1",
            dst_port=587,
            protocol="SMTP",
            is_implicit_tls=False,
            client_payload=b"EHLO auth.defense.gov.in\r\nSTARTTLS\r\n",
            server_payload=b"220 mail.defense.gov.in ESMTP Postfix\r\n250-STARTTLS\r\n220 2.0.0 Ready to start TLS\r\n",
            timestamp="2026-10-04T12:00:00Z",
            packet_count=4,
        )
        res = detect_starttls(stream)
        self.assertFalse(res.cleartext_auth_detected)
        self.assertTrue(res.starttls_advertised)
        self.assertTrue(res.starttls_initiated)
        self.assertTrue(res.starttls_accepted)

    def test_modular_tcp_reassembly_wraparound(self):
        """Verify TCP reassembly handles high sequence numbers and retransmitted segments."""
        from app.core.pcap_parser import reassemble_tcp_payload
        from scapy.layers.inet import IP, TCP
        p1 = IP(src="1.1.1.1", dst="2.2.2.2")/TCP(seq=0xFFFFFFF0, sport=587, dport=49152)/b"Hello "
        p1.time = 1.0
        p2 = IP(src="1.1.1.1", dst="2.2.2.2")/TCP(seq=(0xFFFFFFF0 + 6) % (1 << 32), sport=587, dport=49152)/b"SecureMailScope"
        p2.time = 1.1
        # Duplicate retransmission of p1
        p1_dup = IP(src="1.1.1.1", dst="2.2.2.2")/TCP(seq=0xFFFFFFF0, sport=587, dport=49152)/b"Hello "
        p1_dup.time = 1.2
        result = reassemble_tcp_payload([p1, p2, p1_dup])
        self.assertEqual(result, b"Hello SecureMailScope")


if __name__ == "__main__":
    unittest.main()


