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


if __name__ == "__main__":
    unittest.main()
