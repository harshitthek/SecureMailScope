# SecureMailScope — API Contracts & Data Models Reference (SIH26159)

Passive Network Forensic Framework for Cryptographic Security Posture Assessment of Encrypted Email Communications.  
Designed for Smart India Hackathon (SIH 2026) Problem Statement **SIH26159** (National Technical Research Organisation — NTRO).

---

## 1. Service Topology & Environment Configuration

- **Backend Base URL**: `http://127.0.0.1:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- **WebSocket Endpoint**: `ws://127.0.0.1:8000/api/ws/telemetry`
- **Backend Architecture**: FastAPI, Python 3.11+, Scapy, Cryptography, Async SQLAlchemy 2.0 (SQLite), Uvicorn
- **Frontend Architecture**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React

---

## 2. API Endpoint Matrix

### 2.1 Ingestion & Core Forensics
| Method | Endpoint | Description | Request Format | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Ingest and dissect raw packet capture | `multipart/form-data` (`file`) | `{ analysis_id: string }` |
| `GET` | `/api/analysis/{id}` | Retrieve complete forensic analysis dossier | Path param `id` | `AnalysisResult` (JSON) |
| `GET` | `/api/report/{id}/json` | Export structured analysis report | Path param `id` | `application/json` stream |
| `GET` | `/api/report/{id}/pdf` | Generate official ReportLab audit PDF | Path param `id` | `application/pdf` stream |
| `GET` | `/api/certificate/{id}/{session_id}/{format}` | Download leaf certificate (PEM/DER) | `format`: `pem` \| `der` | File attachment |
| `GET` | `/api/health` | Service health status | None | `{ status: "healthy" }` |

### 2.2 Live Network Wire TAP & Telemetry
| Method | Endpoint | Description | Request Format | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tap/status` | Read sensor operational state and buffer metrics | None | `TapState` (JSON) |
| `POST` | `/api/tap/start` | Engage live passive network TAP sniffer | `{ interface?: string }` | `{ status: "started", interface: string }` |
| `POST` | `/api/tap/stop` | Disengage network TAP sniffer | None | `{ status: "stopped", total_captured: number }` |
| `POST` | `/api/tap/start-replay`| Stream simulated attack PCAP replay at PPS rate | `{ pcap_name?: string, speed_pps?: number }` | `{ status: "replaying", pcap: string }` |
| `POST` | `/api/tap/snapshot` | Snapshot ring buffer into forensic analysis dossier | `{ label?: string }` | `{ success: true, run_id: string, ... }` |
| `WS` | `/api/ws/telemetry` | Real-time sensor telemetry and threat event alerts | WebSocket connection | JSON frames (`INITIAL_STATE`, `HEARTBEAT`, `SECURITY_ALERT`) |

### 2.3 Relational Case Persistence (SQLite)
| Method | Endpoint | Description | Request Format | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/cases` | List all persisted capture cases with pagination | Query `limit`, `offset` | `{ total: number, cases: StoredCaseItem[] }` |
| `GET` | `/api/cases/{id}` | Fetch full persisted dossier by identifier | Path param `id` | `AnalysisResult` |
| `DELETE` | `/api/cases/{id}` | Delete stored case and associated relational records | Path param `id` | `{ success: true, deleted_id: string }` |

### 2.4 Enterprise SIEM & SOC Alerting
| Method | Endpoint | Description | Request Format | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/siem/status` | Status of Syslog (:514 UDP) & Webhook dispatchers | None | `SiemStatusResponse` |
| `GET` | `/api/siem/history` | Audit log of dispatched SIEM alert records | None | `SiemAlertRecord[]` |
| `POST` | `/api/siem/test` | Trigger simulated manual SOC alert dispatch | `{ title?: string, severity?: string, ... }` | `{ success: true, cef_payload: string }` |

### 2.5 Automated Spool Ingestion Daemon
| Method | Endpoint | Description | Request Format | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/spool/status` | Status of `spool/incoming/` watch daemon | None | `SpoolStatusResponse` |
| `POST` | `/api/spool/scan` | Trigger on-demand sweep of spool directory | None | `SpoolStatusResponse` |
| `GET` | `/api/spool/history` | List archived capture processing history | None | `SpoolHistoryItem[]` |

### 2.6 Automated Remediation & MITRE D3FEND
| Method | Endpoint | Description | Request Format | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/remediation/{id}/summary` | MITRE D3FEND mapped defensive action matrix | Path param `id` | `RemediationSummary` |
| `GET` | `/api/remediation/{id}/ansible` | Download Ansible hardening playbook (.yml) | Path param `id` | `text/yaml` stream |
| `GET` | `/api/remediation/{id}/suricata`| Download Suricata IDS detection rules (.rules)| Path param `id` | `text/plain` stream |
| `GET` | `/api/remediation/{id}/snort` | Download Snort 3 detection signatures (.lua) | Path param `id` | `text/plain` stream |

---

## 3. Core TypeScript Interface Definitions (`frontend/src/lib/types.ts`)

```typescript
export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";
export type Severity = "critical" | "high" | "medium" | "low" | "secure";
export type TLSVersion = "SSL 2.0" | "SSL 3.0" | "TLS 1.0" | "TLS 1.1" | "TLS 1.2" | "TLS 1.3" | "None (Cleartext)";

export interface AnalysisResult {
  analysis_id: string;
  case_code?: string;
  filename: string;
  file_size_bytes: number;
  analyzed_at: string;
  processing_time_ms: number;
  enterprise_score: number;
  enterprise_grade: Grade;
  total_sessions: number;
  total_packets: number;
  protocols_detected: string[];
  sessions: Session[];
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];
  protocol_distribution: DistributionItem[];
  cipher_distribution: CipherDistributionItem[];
  certificate_summary: CertSummary[];
}

export interface Session {
  session_id: number;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  server_name: string;
  protocol: string;
  timestamp: string;
  is_encrypted: boolean;
  starttls_detected: boolean;
  starttls_stripped: boolean;
  tls_version: TLSVersion | null;
  cipher_suite_hex: string | null;
  cipher_suite_name: string | null;
  cipher_severity: Severity | null;
  key_exchange: string | null;
  has_forward_secrecy: boolean;
  ja3_hash: string | null;
  ja3_client_name: string | null;
  ja3_is_known: boolean;
  certificate: CertificateInfo | null;
  session_score: number;
  session_grade: Grade;
  session_severity: Severity;
  scoring_breakdown: ScoringBreakdown;
  forensic_inspection?: StreamForensicInspection;
  pqc_status?: "PQC_RESISTANT" | "CLASSICAL_TRANSITIONAL" | "CRQC_HARVEST_CRITICAL" | "UNENCRYPTED_EXPOSED" | "UNKNOWN";
  pqc_group_name?: string;
  pqc_hndl_risk?: "NONE" | "MODERATE" | "CRITICAL";
  pqc_negotiated_group_hex?: string | null;
}

export interface D3fendTechnique {
  technique_id: string;
  name: string;
  status: "CRITICAL" | "HIGH" | "COMPLIANT";
  rationale: string;
  actions: string[];
}

export interface RemediationSummary {
  case_code: string;
  analysis_id: string;
  target_host: string;
  action_items_count: number;
  d3fend_matrix: D3fendTechnique[];
  playbook_available: boolean;
  ids_rules_available: boolean;
  download_endpoints: {
    ansible: string;
    suricata: string;
    snort: string;
  };
}

export interface SiemStatusResponse {
  syslog: SiemStats;
  webhook: SiemStats;
  total_recorded_alerts: number;
}

export interface SiemAlertRecord {
  timestamp: string;
  source: string;
  case_id?: string;
  title: string;
  severity: Severity;
  mitre_attack_id?: string;
  syslog_forwarded: boolean;
  webhook_dispatched: boolean;
  cef_payload: string;
}

export interface SpoolStatusResponse {
  status: string;
  incoming_count: number;
  processed_count: number;
  failed_count: number;
  poll_interval: number;
  incoming_dir: string;
}

export interface TapAlert {
  severity: Severity;
  title: string;
  mitre_id: string;
  vector: string;
  description: string;
  timestamp: string;
}

export interface TapState {
  state: "IDLE" | "SNIFFING" | "REPLAYING" | "ERROR";
  pps: number;
  buffer_count: number;
  buffer_capacity: number;
  total_packets_captured: number;
  active_interface: string | null;
  error_message?: string | null;
}
```

---

## 4. Preserved Defense Benchmark Cases

| Case Code | Dataset File | Score / Grade | Architecture Profile |
| :--- | :--- | :--- | :--- |
| `CASE-01` | `ntro_hardened_tls13.pcap` | **98 / 100 (A+)** | Hardened SMTPS (:465) & IMAPS (:993) with TLS 1.3, AES-256-GCM, ECDHE X25519, valid X.509 certs. |
| `CASE-02` | `striptls_mitm_attack.pcap` | **12 / 100 (F)** | Active inline AiTM STRIPTLS downgrade on port 587, plaintext credential wire exposure. |
| `CASE-03` | `legacy_enterprise_3des.pcap` | **24 / 100 (F)** | Deprecated TLS 1.0, 3DES-EDE-CBC ciphers (Sweet32), static RSA (no Forward Secrecy), expired SHA-1 cert. |
| `CASE-04` | `enterprise_mail_capture.pcap` | **42 / 100 (F)** | Mixed enterprise capture: compliant SMTPS alongside cleartext SMTP fallback and legacy ciphers. |
