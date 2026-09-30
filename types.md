# SecureMailScope — TypeScript API Types & Data Contracts

## Purpose
This file defines the exact TypeScript interfaces that BOTH the backend and frontend must conform to. Backend returns JSON matching these shapes. Frontend consumes them. No ambiguity.

---

## Core Response: `AnalysisResult`

```typescript
// === TOP LEVEL ===
interface AnalysisResult {
  analysis_id: string;                    // UUID
  filename: string;                       // Original uploaded filename
  file_size_bytes: number;                // Size of the PCAP file
  analyzed_at: string;                    // ISO 8601 timestamp
  processing_time_ms: number;             // How long analysis took

  // Aggregate Scores
  enterprise_score: number;               // 0-100, average of all session scores
  enterprise_grade: Grade;                // "A+" | "A" | "B" | "C" | "D" | "F"

  // Summary Counts
  total_sessions: number;
  total_packets: number;
  protocols_detected: ProtocolType[];     // ["SMTP", "IMAP", "POP3"]

  // Detailed Data
  sessions: Session[];
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];

  // Chart Data (pre-aggregated for frontend convenience)
  protocol_distribution: DistributionItem[];
  cipher_distribution: CipherDistributionItem[];
  certificate_summary: CertSummary[];
}

type Grade = "A+" | "A" | "B" | "C" | "D" | "F";
type ProtocolType = "SMTP" | "SMTPS" | "IMAP" | "IMAPS" | "POP3" | "POP3S";
type Severity = "critical" | "high" | "medium" | "low" | "secure";
type TLSVersion = "SSL 2.0" | "SSL 3.0" | "TLS 1.0" | "TLS 1.1" | "TLS 1.2" | "TLS 1.3" | "None (Cleartext)";

// === SESSION ===
interface Session {
  session_id: number;                     // Sequential index (1, 2, 3...)
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  server_name: string;                    // SNI from Client Hello, or dst_ip if no SNI
  protocol: ProtocolType;
  timestamp: string;                      // ISO 8601

  // Encryption Status
  is_encrypted: boolean;                  // false = fully cleartext session
  starttls_detected: boolean;             // true if STARTTLS upgrade observed
  starttls_stripped: boolean;             // true if STARTTLS was advertised but client never upgraded (potential attack)

  // TLS Parameters (null if cleartext)
  tls_version: TLSVersion | null;
  cipher_suite_hex: string | null;        // e.g., "0x1301"
  cipher_suite_name: string | null;       // e.g., "TLS_AES_256_GCM_SHA384"
  cipher_severity: Severity | null;
  key_exchange: string | null;            // "ECDHE" | "DHE" | "RSA" | null
  has_forward_secrecy: boolean;

  // JA3 Fingerprint
  ja3_hash: string | null;               // MD5 hex string
  ja3_client_name: string | null;        // "Mozilla Thunderbird" | "Microsoft Outlook" | "Unknown"
  ja3_is_known: boolean;

  // Certificate (null if no cert in handshake)
  certificate: CertificateInfo | null;

  // Scoring
  session_score: number;                  // 0-100
  session_grade: Grade;
  session_severity: Severity;

  // Breakdown of scoring penalties applied
  scoring_breakdown: ScoringBreakdown;
}

interface ScoringBreakdown {
  protocol_penalty: number;               // 0 to -40
  cipher_penalty: number;                 // 0 to -30
  pfs_penalty: number;                    // 0 to -20
  cert_penalty: number;                   // 0 to -30 (worst single cert penalty)
  anomaly_penalty: number;                // 0 to -15
  raw_score: number;                      // Before clamping
  final_score: number;                    // After clamping to [0, 100]
}

// === CERTIFICATE ===
interface CertificateInfo {
  subject_cn: string;                     // Common Name
  issuer_cn: string;
  serial_number: string;                  // Hex string
  not_before: string;                     // ISO 8601
  not_after: string;                      // ISO 8601
  is_expired: boolean;
  is_not_yet_valid: boolean;
  is_self_signed: boolean;
  validity_days: number;                  // Total validity period in days
  days_remaining: number;                 // Negative if expired

  signature_algorithm: string;            // e.g., "sha256WithRSAEncryption"
  signature_hash: string;                 // "SHA-256" | "SHA-1" | "MD5"
  is_weak_signature: boolean;             // true if SHA-1 or MD5

  public_key_type: "RSA" | "EC" | "DSA"; // Key algorithm
  public_key_bits: number;                // e.g., 2048, 4096, 256
  is_weak_key: boolean;                   // true if RSA < 2048 or EC < 256

  san_entries: string[];                  // Subject Alternative Names
}

// === VULNERABILITY ===
interface Vulnerability {
  id: string;                             // e.g., "VULN-001"
  severity: Severity;
  title: string;                          // e.g., "Deprecated TLS 1.0 Protocol Detected"
  description: string;                    // Detailed explanation
  affected_sessions: number[];            // Session IDs affected
  cve_references: string[];              // e.g., ["CVE-2016-2183", "CVE-2013-0169"]
  nist_reference: string | null;          // e.g., "NIST SP 800-52r2 Section 3.2.1"
  remediation: string;                    // Actionable fix
}

// === COMPLIANCE ===
interface ComplianceCheck {
  id: string;                             // e.g., "NIST-3.1"
  standard: string;                       // "NIST SP 800-52r2"
  section: string;                        // "Section 3.1"
  requirement: string;                    // Human-readable requirement
  status: "pass" | "fail" | "warn";
  details: string;                        // Evidence or explanation
}

// === CHART DATA ===
interface DistributionItem {
  name: string;                           // e.g., "TLS 1.3"
  value: number;                          // Count of sessions
  color: string;                          // Hex color for chart segment
}

interface CipherDistributionItem {
  name: string;                           // Cipher suite short name
  count: number;
  severity: Severity;
  color: string;                          // Hex color for bar
}

interface CertSummary {
  server_name: string;
  subject_cn: string;
  is_expired: boolean;
  is_self_signed: boolean;
  is_weak_signature: boolean;
  is_weak_key: boolean;
  days_remaining: number;
  overall_status: Severity;
}
```

---

## Example Mock Data (For Frontend Development)

Use this hardcoded mock while the backend is being built:

```typescript
const MOCK_RESULT: AnalysisResult = {
  analysis_id: "mock-001",
  filename: "enterprise_mail_capture.pcap",
  file_size_bytes: 2458624,
  analyzed_at: "2026-09-30T15:00:00Z",
  processing_time_ms: 1250,
  enterprise_score: 42,
  enterprise_grade: "F",
  total_sessions: 4,
  total_packets: 847,
  protocols_detected: ["SMTP", "IMAPS"],
  sessions: [
    {
      session_id: 1,
      src_ip: "192.168.1.100",
      src_port: 49152,
      dst_ip: "10.0.0.5",
      dst_port: 465,
      server_name: "mail.secure-gov.in",
      protocol: "SMTPS",
      timestamp: "2026-09-30T14:55:01Z",
      is_encrypted: true,
      starttls_detected: false,
      starttls_stripped: false,
      tls_version: "TLS 1.3",
      cipher_suite_hex: "0x1301",
      cipher_suite_name: "TLS_AES_256_GCM_SHA384",
      cipher_severity: "secure",
      key_exchange: "ECDHE",
      has_forward_secrecy: true,
      ja3_hash: "a0e9f5d64349fb13191bc781f81f42e1",
      ja3_client_name: "Mozilla Thunderbird",
      ja3_is_known: true,
      certificate: {
        subject_cn: "mail.secure-gov.in",
        issuer_cn: "Let's Encrypt Authority X3",
        serial_number: "03:A1:B2:C3:D4",
        not_before: "2026-06-01T00:00:00Z",
        not_after: "2026-12-01T00:00:00Z",
        is_expired: false,
        is_not_yet_valid: false,
        is_self_signed: false,
        validity_days: 183,
        days_remaining: 62,
        signature_algorithm: "sha256WithRSAEncryption",
        signature_hash: "SHA-256",
        is_weak_signature: false,
        public_key_type: "RSA",
        public_key_bits: 2048,
        is_weak_key: false,
        san_entries: ["mail.secure-gov.in", "smtp.secure-gov.in"],
      },
      session_score: 98,
      session_grade: "A+",
      session_severity: "secure",
      scoring_breakdown: {
        protocol_penalty: 0,
        cipher_penalty: 0,
        pfs_penalty: 0,
        cert_penalty: 0,
        anomaly_penalty: 0,
        raw_score: 100,
        final_score: 98,
      },
    },
    {
      session_id: 2,
      src_ip: "192.168.1.101",
      src_port: 49200,
      dst_ip: "10.0.0.10",
      dst_port: 25,
      server_name: "legacy-mail.corp.in",
      protocol: "SMTP",
      timestamp: "2026-09-30T14:55:12Z",
      is_encrypted: true,
      starttls_detected: true,
      starttls_stripped: false,
      tls_version: "TLS 1.0",
      cipher_suite_hex: "0x000A",
      cipher_suite_name: "TLS_RSA_WITH_3DES_EDE_CBC_SHA",
      cipher_severity: "high",
      key_exchange: "RSA",
      has_forward_secrecy: false,
      ja3_hash: "b38454238e55e098a73b94a08f7db061",
      ja3_client_name: "Unknown",
      ja3_is_known: false,
      certificate: {
        subject_cn: "legacy-mail.corp.in",
        issuer_cn: "legacy-mail.corp.in",
        serial_number: "01:00:00:01",
        not_before: "2020-01-01T00:00:00Z",
        not_after: "2025-01-01T00:00:00Z",
        is_expired: true,
        is_not_yet_valid: false,
        is_self_signed: true,
        validity_days: 1826,
        days_remaining: -637,
        signature_algorithm: "sha1WithRSAEncryption",
        signature_hash: "SHA-1",
        is_weak_signature: true,
        public_key_type: "RSA",
        public_key_bits: 1024,
        is_weak_key: true,
        san_entries: [],
      },
      session_score: 0,
      session_grade: "F",
      session_severity: "critical",
      scoring_breakdown: {
        protocol_penalty: -25,
        cipher_penalty: -30,
        pfs_penalty: -20,
        cert_penalty: -30,
        anomaly_penalty: -15,
        raw_score: -20,
        final_score: 0,
      },
    },
    {
      session_id: 3,
      src_ip: "192.168.1.102",
      src_port: 49300,
      dst_ip: "10.0.0.15",
      dst_port: 587,
      server_name: "10.0.0.15",
      protocol: "SMTP",
      timestamp: "2026-09-30T14:55:30Z",
      is_encrypted: false,
      starttls_detected: false,
      starttls_stripped: true,
      tls_version: null,
      cipher_suite_hex: null,
      cipher_suite_name: null,
      cipher_severity: null,
      key_exchange: null,
      has_forward_secrecy: false,
      ja3_hash: null,
      ja3_client_name: null,
      ja3_is_known: false,
      certificate: null,
      session_score: 0,
      session_grade: "F",
      session_severity: "critical",
      scoring_breakdown: {
        protocol_penalty: -40,
        cipher_penalty: -30,
        pfs_penalty: -20,
        cert_penalty: 0,
        anomaly_penalty: -15,
        raw_score: -5,
        final_score: 0,
      },
    },
    {
      session_id: 4,
      src_ip: "192.168.1.103",
      src_port: 49400,
      dst_ip: "10.0.0.20",
      dst_port: 993,
      server_name: "imap.department.gov.in",
      protocol: "IMAPS",
      timestamp: "2026-09-30T14:56:05Z",
      is_encrypted: true,
      starttls_detected: false,
      starttls_stripped: false,
      tls_version: "TLS 1.2",
      cipher_suite_hex: "0xC02F",
      cipher_suite_name: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      cipher_severity: "secure",
      key_exchange: "ECDHE",
      has_forward_secrecy: true,
      ja3_hash: "c12f54a1b2c3d4e5f6789012abcd3456",
      ja3_client_name: "Microsoft Outlook",
      ja3_is_known: true,
      certificate: {
        subject_cn: "imap.department.gov.in",
        issuer_cn: "DigiCert Global Root G2",
        serial_number: "0A:B1:C2:D3:E4",
        not_before: "2026-03-15T00:00:00Z",
        not_after: "2027-03-15T00:00:00Z",
        is_expired: false,
        is_not_yet_valid: false,
        is_self_signed: false,
        validity_days: 365,
        days_remaining: 166,
        signature_algorithm: "sha256WithRSAEncryption",
        signature_hash: "SHA-256",
        is_weak_signature: false,
        public_key_type: "RSA",
        public_key_bits: 4096,
        is_weak_key: false,
        san_entries: ["imap.department.gov.in", "mail.department.gov.in"],
      },
      session_score: 92,
      session_grade: "A+",
      session_severity: "secure",
      scoring_breakdown: {
        protocol_penalty: 0,
        cipher_penalty: 0,
        pfs_penalty: 0,
        cert_penalty: 0,
        anomaly_penalty: 0,
        raw_score: 100,
        final_score: 92,
      },
    },
  ],
  vulnerabilities: [
    {
      id: "VULN-001",
      severity: "critical",
      title: "STRIPTLS Downgrade Attack Detected",
      description: "Session #3 shows a cleartext SMTP exchange on port 587 where STARTTLS capability was expected but never negotiated. Credentials may have been transmitted in plaintext. This pattern is consistent with an active Man-in-the-Middle STRIPTLS attack.",
      affected_sessions: [3],
      cve_references: [],
      nist_reference: "NIST SP 800-52r2 Section 3.1",
      remediation: "Enforce mandatory TLS (MTA-STS) and deploy DANE/TLSA DNS records. Configure MTA to reject plaintext fallback.",
    },
    {
      id: "VULN-002",
      severity: "critical",
      title: "Expired Self-Signed Certificate with Weak Key",
      description: "Session #2 presents a self-signed certificate expired since January 2025, using SHA-1 signature and 1024-bit RSA key. This certificate provides no trust assurance and is vulnerable to offline factoring.",
      affected_sessions: [2],
      cve_references: [],
      nist_reference: "NIST SP 800-52r2 Section 3.4",
      remediation: "Replace with a CA-signed certificate using SHA-256 and minimum 2048-bit RSA key.",
    },
    {
      id: "VULN-003",
      severity: "high",
      title: "Deprecated TLS 1.0 Protocol with 3DES Cipher",
      description: "Session #2 negotiated TLS 1.0 with TLS_RSA_WITH_3DES_EDE_CBC_SHA. TLS 1.0 is deprecated (RFC 8996). 3DES is vulnerable to Sweet32 birthday attack (CVE-2016-2183).",
      affected_sessions: [2],
      cve_references: ["CVE-2016-2183", "CVE-2011-3389"],
      nist_reference: "NIST SP 800-52r2 Section 3.2.1",
      remediation: "Upgrade mail server to support TLS 1.2+ with AES-GCM cipher suites. Disable TLS 1.0 and 3DES.",
    },
    {
      id: "VULN-004",
      severity: "high",
      title: "No Forward Secrecy (Static RSA Key Exchange)",
      description: "Session #2 uses static RSA key exchange. If the server's private key is ever compromised, all previously captured sessions can be retroactively decrypted.",
      affected_sessions: [2],
      cve_references: ["CVE-2017-13099"],
      nist_reference: "NIST SP 800-52r2 Section 3.3.1",
      remediation: "Configure server to prefer ECDHE key exchange. Disable static RSA cipher suites.",
    },
  ],
  compliance: [
    { id: "NIST-3.1", standard: "NIST SP 800-52r2", section: "Section 3.1", requirement: "TLS 1.2 or higher must be enforced for all connections", status: "fail", details: "1 session uses TLS 1.0" },
    { id: "NIST-3.2.1", standard: "NIST SP 800-52r2", section: "Section 3.2.1", requirement: "SSL 2.0, SSL 3.0, TLS 1.0, and TLS 1.1 must be disabled", status: "fail", details: "TLS 1.0 detected in session #2" },
    { id: "NIST-3.3.1", standard: "NIST SP 800-52r2", section: "Section 3.3.1", requirement: "Cipher suites must support ephemeral Diffie-Hellman (ECDHE/DHE)", status: "fail", details: "Static RSA key exchange in session #2" },
    { id: "NIST-3.3.2", standard: "NIST SP 800-52r2", section: "Section 3.3.2", requirement: "AES-GCM or ChaCha20-Poly1305 (AEAD) cipher modes preferred", status: "fail", details: "3DES-CBC detected in session #2" },
    { id: "NIST-3.4", standard: "NIST SP 800-52r2", section: "Section 3.4", requirement: "Server certificates must be valid and signed by a trusted CA", status: "fail", details: "Self-signed expired certificate in session #2" },
    { id: "NIST-3.5", standard: "NIST SP 800-52r2", section: "Section 3.5", requirement: "RSA keys must be at least 2048 bits", status: "fail", details: "1024-bit RSA key in session #2" },
    { id: "RFC-8314", standard: "RFC 8314", section: "Section 3", requirement: "Implicit TLS preferred over STARTTLS for email submission", status: "pass", details: "SMTPS (port 465) and IMAPS (port 993) sessions detected" },
    { id: "RFC-8996", standard: "RFC 8996", section: "Full", requirement: "TLS 1.0 and TLS 1.1 must not be used", status: "fail", details: "TLS 1.0 in session #2" },
  ],
  protocol_distribution: [
    { name: "TLS 1.3", value: 1, color: "#22C55E" },
    { name: "TLS 1.2", value: 1, color: "#3B82F6" },
    { name: "TLS 1.0", value: 1, color: "#F97316" },
    { name: "Cleartext", value: 1, color: "#EF4444" },
  ],
  cipher_distribution: [
    { name: "AES-256-GCM", count: 1, severity: "secure", color: "#22C55E" },
    { name: "AES-128-GCM", count: 1, severity: "secure", color: "#22C55E" },
    { name: "3DES-CBC", count: 1, severity: "high", color: "#F97316" },
    { name: "None (Cleartext)", count: 1, severity: "critical", color: "#EF4444" },
  ],
  certificate_summary: [
    { server_name: "mail.secure-gov.in", subject_cn: "mail.secure-gov.in", is_expired: false, is_self_signed: false, is_weak_signature: false, is_weak_key: false, days_remaining: 62, overall_status: "secure" },
    { server_name: "legacy-mail.corp.in", subject_cn: "legacy-mail.corp.in", is_expired: true, is_self_signed: true, is_weak_signature: true, is_weak_key: true, days_remaining: -637, overall_status: "critical" },
    { server_name: "imap.department.gov.in", subject_cn: "imap.department.gov.in", is_expired: false, is_self_signed: false, is_weak_signature: false, is_weak_key: false, days_remaining: 166, overall_status: "secure" },
  ],
};
```
