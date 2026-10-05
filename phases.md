# SecureMailScope — Implementation Roadmap & Execution Record

Passive Network Forensic Framework for Cryptographic Security Posture Assessment of Encrypted Email Communications.  
Smart India Hackathon (SIH 2026), Problem Statement **SIH26159** (National Technical Research Organisation — NTRO).

---

## Architecture Milestone Matrix

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 0    │ ──> │   Phase 1    │ ──> │   Phase 2    │ ──> │   Phase 3    │
│  Scaffolding │     │  Core Engine │     │  Wire TAP &  │     │ Spool Daemon │
│   [DONE ✅]  │     │   [DONE ✅]  │     │  WS [DONE ✅]│     │   [DONE ✅]  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 4    │ ──> │   Phase 5    │ ──> │   Phase 6    │ ──> │   Phase 7    │
│ SQLite Async │     │  SIEM Alert  │     │ Remediation  │     │   Frontend   │
│ Persistence  │     │  Syslog/CEF  │     │ MITRE D3FEND │     │  Workstation │
│   [DONE ✅]  │     │   [DONE ✅]  │     │   [DONE ✅]  │     │   [DONE ✅]  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Phase 0: Scaffolding & Monorepo Architecture [DONE ✅]
- [x] Monorepo workspace configuration (FastAPI backend + Next.js 14 frontend).
- [x] Scapy, Cryptography, SQLAlchemy, Pydantic, and ReportLab environment configured.
- [x] Next.js 14 App Router with TypeScript, Tailwind CSS, and Lucide React.
- [x] IANA cipher suite classification database (`cipher_db.json`) with AEAD and Forward Secrecy metadata.
- [x] Known client JA3 fingerprint signatures database (`ja3_known.json`).

---

## Phase 1: Core Cryptographic & Forensic Analysis Engine [DONE ✅]
- [x] **PCAP Ingestion & TCP Stream Reassembly** (`pcap_parser.py`):
  - Stream demultiplexing on email ports: `{25, 110, 143, 465, 587, 993, 995}`.
  - Directional payload reassembly with TCP sequence wraparound and deduplication handling.
- [x] **STARTTLS State Machine & Downgrade Detection** (`starttls_detector.py`):
  - Advertised vs negotiated STARTTLS verification.
  - Active detection of inline AiTM STRIPTLS downgrade attacks.
  - Wire cleartext credential exposure detection (`AUTH PLAIN` / `AUTH LOGIN`).
- [x] **TLS Handshake Dissection** (`tls_analyzer.py`):
  - Binary parsing of Client Hello, Server Hello, and Server Key Exchange records.
  - Cipher suite resolution, TLS 1.0–1.3 version extraction, SNI, Supported Groups, and Point Formats.
  - Ephemeral Forward Secrecy evaluation (ECDHE/DHE vs static RSA).
- [x] **X.509 Certificate Cryptanalysis** (`cert_validator.py`):
  - DER certificate parsing via `cryptography`.
  - Signature digest algorithm verification (flagging SHA-1 / MD5).
  - Public key type and length verification (flagging RSA < 2048, EC < 256).
  - Self-signed, validity duration, and expiration status analysis.
- [x] **JA3 Fingerprinting & Scoring Engine** (`ja3_engine.py`, `scorer.py`):
  - MD5 JA3 hash generation with GREASE value filtering.
  - Posture scoring formula computing composite session score (0–100) and enterprise grade (A+ to F).
- [x] **Dossier Reporting** (`pdf_exporter.py`, `json_exporter.py`):
  - Multi-page ReportLab PDF forensic audit report generation with tabular summaries.
  - Structured JSON export with complete cryptographic metadata.

---

## Phase 2: Live Wire TAP Sniffer & WebSocket Telemetry [DONE ✅]
- [x] **Asynchronous Network Sniffer** (`app/tap/live_wire_sniffer.py`):
  - Scapy `AsyncSniffer` capturing live frames across physical or virtual adapters.
  - In-flight packet parsing under BPF: `tcp and (port 25 or 587 or 465 or 993 or 110)`.
- [x] **In-Flight Threat Heuristics** (`app/tap/threat_heuristics.py`):
  - Real-time detection of STRIPTLS downgrades, cleartext authentication, and deprecated SSLv3.
- [x] **Ring Buffer & Snapshotting** (`app/tap/ring_buffer.py`):
  - Thread-safe circular ring buffer (default capacity: 2,000 packets).
  - `/api/tap/snapshot`: Converts buffered packets into an instant forensic dossier.
- [x] **Simulated Attack Replay** (`app/tap/replay_engine.py`):
  - Out-of-band PCAP stream replay at configurable packet rates (e.g., 12 PPS).
- [x] **Real-Time WebSocket Stream** (`app/api/ws_telemetry.py`):
  - `ws://127.0.0.1:8000/api/ws/telemetry`: Streams continuous PPS, buffer metrics, and instant alert frames.

---

## Phase 3: Automated Spool Ingestion Daemon [DONE ✅]
- [x] **Folder Watch Architecture** (`app/spool/watcher.py`):
  - Multi-directory lifecycle: `spool/incoming/` -> `spool/processed/` / `spool/quarantine/`.
  - File lock verification (handles in-progress writes and partial transfers).
  - Safety caps: maximum file size (50 MB) and allowed extensions (`.pcap`, `.pcapng`, `.cap`).
- [x] **Daemon Sweeper & REST Endpoints** (`app/spool/daemon.py`, `app/api/spool_routes.py`):
  - Background task worker with configurable polling intervals.
  - Manual on-demand sweep trigger `/api/spool/scan` and status reporting `/api/spool/status`.

---

## Phase 4: Async SQLAlchemy 2.0 SQLite Relational Persistence [DONE ✅]
- [x] **Relational Schema** (`app/db/models.py`):
  - `CaptureCaseModel`: Master case table with composite score, grade, severity, and raw JSON document.
  - `FlowSessionModel`: Normalized session records with foreign key relationship and cascade deletion.
  - `FindingModel`: Normalized security findings with MITRE ATT&CK / D3FEND mappings.
  - `CertEvidenceModel`: Leaf certificate cryptographic attributes.
- [x] **Read-Through Repository** (`app/db/repository.py`):
  - High-speed in-memory caching layered over async SQLite queries.
- [x] **Benchmark Seed Utility** (`app/db/seed.py`):
  - Automatically loads and enriches `CASE-01` through `CASE-04` with Post-Quantum Cryptography (PQC) classifications.
- [x] **Case Management REST API** (`app/api/case_routes.py`):
  - Paginated case listing `/api/cases`, single case retrieval, and relational deletion `/api/cases/{id}`.

---

## Phase 5: ArcSight CEF, RFC 5424 Syslog, and Webhooks [DONE ✅]
- [x] **ArcSight CEF Serializer** (`app/siem/cef_serializer.py`):
  - Implements Common Event Format (`CEF:0|SecureMailScope|PassiveTAP|2.0|...`).
  - CRLF injection sanitization and RFC-compliant field escaping.
- [x] **RFC 5424 UDP Syslog Dispatcher** (`app/siem/syslog_dispatcher.py`):
  - UDP socket transmission to `:514 UDP` with facility (Local4) and severity calculation.
- [x] **SOAR Webhook Dispatcher** (`app/siem/webhook_dispatcher.py`):
  - JSON webhook delivery to external SIEM/SOAR platforms (Splunk, Elastic, Slack, MS Teams).
- [x] **SIEM Configuration & Audit API** (`app/api/siem_routes.py`):
  - Endpoints: `/api/siem/status`, `/api/siem/history`, and simulated dispatch trigger `/api/siem/test`.

---

## Phase 6: Automated Remediation Orchestration & MITRE D3FEND [DONE ✅]
- [x] **Dynamic Ansible Playbook Generator** (`app/remediation/ansible_generator.py`):
  - Synthesizes targeted Postfix `main.cf` and Dovecot `conf.d` hardening playbooks (`mail_hardening.yml`).
  - Emits idempotent tasks enforcing `smtpd_tls_security_level = may/encrypt`, cipherlists, and PFS curves.
- [x] **Suricata & Snort 3 Rule Generator** (`app/remediation/ids_generator.py`):
  - Generates custom IDS signatures (`suricata_mail_rules.rules`, `snort3_mail_rules.lua`) with custom SIDs (2615901–2615905).
  - Detects plaintext credential leakage, SSLv3 negotiation, and STARTTLS stripping.
- [x] **MITRE D3FEND Mapping Orchestrator** (`app/remediation/orchestrator.py`):
  - Maps cryptographic findings to defensive controls:
    - `D3-OTP`: Opportunistic Inbound TLS Verification (RFC 7817)
    - `D3-CSD`: Cipher Suite Deprecation Enforcement (NIST SP 800-52r2)
    - `D3-PFS`: Ephemeral Key Exchange Mandate (ECDHE)
    - `D3-CTA`: Certificate Trust & Signature Audit (X.509 RFC 5280)
- [x] **Remediation REST API** (`app/api/remediation_routes.py`):
  - Endpoints: `/api/remediation/{id}/summary`, `/api/remediation/{id}/ansible`, `/api/remediation/{id}/suricata`, `/api/remediation/{id}/snort`.

---

## Phase 7: Frontend Enterprise Workstation Transformation [DONE ✅]
- [x] **8 Operational Decks**:
  - `Overview`: Posture dial, hero telemetry, What-If sandbox, baseline diff trigger.
  - `Flows`: Reconstructed stream matrix with direction vectors and cipher severity badges.
  - `Findings`: Prioritized vulnerability ledger with MITRE ATT&CK technique IDs.
  - `Certificates`: X.509 certificate hierarchy tree and download buttons.
  - `Dissector`: Dual-mode deep inspector (Cryptanalysis vs Monospaced raw ASCII/Hex state machine).
  - `Standards`: NIST SP 800-52r2, RFC 8314, and BSI TR-02102-2 compliance checklists.
  - `Remediation`: D3FEND matrix grid + Ansible / Suricata / Snort rule inspector.
  - `Dossier`: Archival executive report generator with PDF/JSON/HTML downloads.
- [x] **Real-Time SOC Telemetry & Modals**:
  - SIEM Telemetry Modal with Syslog (:514 UDP) and Webhook statistics.
  - In-flight Wire Threat Feed Drawer connected to live WebSocket alerts.
  - Spool Ingestion Card embedded in the upload modal.
  - Dynamic SQLite case selector dropdown with deletion capabilities.
  - Forensic Posture Diff Modal benchmarking against `CASE-01` baseline.
- [x] **Code & Architecture Constraints**:
  - Every component strictly under 150 LOC.
  - Zero ESLint warnings or errors.
  - Next.js production build cleanly compiles all 5 static routes.
  - Full keyboard accessibility (hotkeys `1`–`8`, `/`, `?`, `P`, `H`, `J`).
