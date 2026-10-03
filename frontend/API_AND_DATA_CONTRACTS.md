# SecureMailScope — Preserved Connections & Data Contracts Reference (SIH26159)

This document records all preserved backend connections, API endpoints, data models, and preset forensic cases preserved in `frontend/src/lib/`.

---

## 1. Backend Service & Connection Configuration

- **Backend Base URL**: `http://127.0.0.1:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- **Backend Framework**: FastAPI with Python 3.10+
- **Network Engine**: Scapy (PCAP reading & TCP reconstruction) + Cryptography (X.509 DER parser)

### API Endpoints (`frontend/src/lib/api.ts`)

| Method | Endpoint | Description | Request Payload | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Ingests `.pcap`, `.pcapng`, or `.cap` file for forensic analysis | `multipart/form-data` with `file: File` | `{ "analysis_id": "<uuid>" }` |
| `GET` | `/api/analysis/{id}` | Fetches full forensic posture analysis result | URL parameter `id: string` | `AnalysisResult` (JSON) |
| `GET` | `/api/report/{id}/json` | Direct download of complete structured JSON analysis | URL parameters | `application/json` file stream |
| `GET` | `/api/report/{id}/pdf` | Generates and downloads official ReportLab forensic audit PDF | URL parameters | `application/pdf` file stream |
| `GET` | `/api/health` | Health check endpoint | None | `{ "status": "healthy" }` |

---

## 2. Core Forensic Data Contracts (`frontend/src/lib/types.ts`)

### `AnalysisResult`
The top-level forensic report returned for each analyzed PCAP:
```typescript
interface AnalysisResult {
  analysis_id: string;
  filename: string;
  file_size_bytes: number;
  analyzed_at: string;            // ISO 8601 timestamp
  processing_time_ms: number;
  enterprise_score: number;       // 0 - 100 mathematical posture score
  enterprise_grade: Grade;        // "A+" | "A" | "B" | "C" | "D" | "F"
  total_sessions: number;
  total_packets: number;
  protocols_detected: string[];   // ["SMTP", "SMTPS", "IMAP", "IMAPS", "POP3", "POP3S"]
  sessions: Session[];
  vulnerabilities: Vulnerability[];
  compliance_matrix: ComplianceItem[];
}
```

### `Session`
Represents an individual reconstructed TCP email flow:
```typescript
interface Session {
  session_id: number;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;               // 25, 587, 465, 143, 993, 110, 995
  protocol: string;               // SMTP, SMTPS, IMAP, IMAPS, POP3, POP3S
  server_name?: string;           // SNI or reverse domain
  timestamp: string;
  is_encrypted: boolean;
  starttls_detected: boolean;
  starttls_stripped: boolean;     // True if MitM downgrade / STRIPTLS detected
  tls_version?: string;           // TLS 1.3, TLS 1.2, TLS 1.0, etc.
  cipher_suite_hex?: string;      // e.g. "0x1301", "0x000A"
  cipher_suite_name?: string;     // e.g. "TLS_AES_256_GCM_SHA384"
  cipher_severity: Severity;
  key_exchange?: string;          // ECDHE, DHE, Static RSA, None
  has_forward_secrecy: boolean;
  ja3_hash?: string;              // MD5 hash of TLS ClientHello parameters
  ja3_client_name?: string;       // Fingerprinted mail client (e.g. Thunderbird)
  ja3_is_known: boolean;
  certificate?: CertificateInfo;
  session_score: number;          // 0 - 100
  session_grade: Grade;
  session_severity: Severity;
  scoring_breakdown: ScoringBreakdown;
  forensic_inspection?: StreamForensicInspection;
}
```

### `CertificateInfo`
Extracted leaf certificate X.509 metadata:
```typescript
interface CertificateInfo {
  subject_cn: string;
  issuer_cn: string;
  serial_number: string;
  not_before: string;
  not_after: string;
  is_expired: boolean;
  days_remaining: number;
  validity_days: number;
  signature_algorithm: string;
  signature_hash: string;         // SHA-256, SHA-1, MD5
  is_weak_signature: boolean;     // True if SHA-1 or MD5
  public_key_type: string;        // RSA, EC, DSA
  public_key_bits: number;        // e.g. 1024, 2048, 4096
  is_weak_key: boolean;           // True if RSA < 2048 or EC < 256
  is_self_signed: boolean;
  san_entries: string[];
}
```

---

## 3. Preserved Forensic Evidence Cases (`frontend/src/lib/mock-data.ts`)

1. **`CASE-01`**: `ntro_hardened_tls13.pcap`
   - Score: **98 / 100 (A+)**
   - Profiles: Modern hardened SMTPS (:465) & IMAPS (:993) with TLS 1.3, AES-256-GCM, ECDHE (X25519), and valid CA-signed certificates.
2. **`CASE-02`**: `striptls_mitm_attack.pcap`
   - Score: **12 / 100 (F)**
   - Profiles: Active inline STRIPTLS downgrade on port 587. STARTTLS stripped by adversary, exposing cleartext authentication credentials.
3. **`CASE-03`**: `legacy_enterprise_3des.pcap`
   - Score: **34 / 100 (F)**
   - Profiles: Deprecated TLS 1.0 with 3DES-EDE-CBC cipher suites and static RSA key exchange (no Perfect Forward Secrecy).
4. **`CASE-04`**: `enterprise_mail_capture.pcap`
   - Score: **42 / 100 (F)**
   - Profiles: Mixed 4-flow corporate capture demonstrating compliant SMTPS alongside expired certificates, legacy ciphers, and unencrypted cleartext SMTP fallback.
