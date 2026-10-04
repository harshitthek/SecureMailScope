# SecureMailScope — Product Requirements Document (PRD)

## Meta
- **Project:** SecureMailScope
- **PS ID:** SIH26159
- **Agency:** National Technical Research Organisation (NTRO), Government of India
- **Theme:** Blockchain & Cybersecurity
- **Scope:** Complete Enterprise Platform (Passive Core + Live TAP Sensor + Spool Daemon + Relational DB + SIEM + Automated Remediation + 8-Deck SOC Workstation)
- **Status:** Complete & Production-Ready

---

## 1. Product Vision
An end-to-end passive network forensic framework for email cryptographic security posture assessment that:
1. Reconstructs email protocol sessions (SMTP, SMTPS, IMAP, IMAPS, POP3, POP3S) out-of-band without traffic injection or mail body decryption.
2. Dissects TLS handshakes across SSL 2.0 through TLS 1.3, flags protocol downgrades (e.g. AiTM STRIPTLS), and audits X.509 certificate chains.
3. Classifies Post-Quantum Cryptography (PQC) readiness and identifies Harvest-Now-Decrypt-Later (HNDL) exposure.
4. Sniffs live wire network traffic via passive TAP sensors with in-flight threat heuristics and WebSocket telemetry.
5. Ingests captures continuously through an automated file spool watcher.
6. Persists normalized evidence into an async relational database.
7. Emits real-time ArcSight CEF logs, RFC 5424 Syslog (:514 UDP), and SOAR webhooks.
8. Automatically synthesizes Ansible hardening playbooks, Suricata rules, Snort 3 signatures, and MITRE D3FEND defensive countermeasures.
9. Renders an interactive 8-deck industrial brutalist SOC workstation with dual-mode packet dissectors and cryptographic posture diffing.

---

## 2. Personas & Stakeholders

| Persona | Role | Enterprise Workflow |
| :--- | :--- | :--- |
| **SOC / CERT Analyst** | Tactical Threat Monitor | Observes live TAP telemetry, receives in-flight threat alerts, triggers SIEM test dispatches. |
| **Forensic Investigator** | Incident Post-Mortem | Uses dual-mode protocol dissector to inspect raw hex/ASCII state machines and verify downgrade transitions. |
| **System Administrator** | Mail Server Hardening | Downloads synthesized Ansible playbooks and IDS signatures to remediate configuration gaps. |
| **NTRO Evaluator** | Government Compliance | Evaluates mathematical posture scoring against NIST SP 800-52r2, RFC 8314, and BSI TR-02102-2. |

---

## 3. Delivered Feature Capabilities Matrix

### 3.1 Passive Forensic Core & Dissection (Complete ✅)
- Multi-format ingestion: `.pcap`, `.pcapng`, `.cap`.
- Complete TCP stream reassembly handling sequence wraparounds and deduplication.
- Opportunistic STARTTLS detection and AiTM downgrade / STRIPTLS alert generation.
- TLS 1.0–1.3 dissection: Client Hello, Server Hello, Key Exchange, SNI, Supported Groups, Point Formats.
- X.509 certificate validation: signature digests (SHA-1/MD5), public keys (RSA < 2048), expiration, self-signed status.
- MD5 JA3 client fingerprinting with GREASE value filtering and signature lookup.
- Mathematical composite scoring formula (0–100) and enterprise grades (A+ to F).
- Formal multi-page ReportLab PDF, JSON, and interactive HTML audit dossier exports.

### 3.2 Live Wire TAP Sensor & WebSocket Telemetry (Complete ✅)
- Passive sniffing on physical/virtual interfaces under BPF filter: `tcp and (port 25 or 587 or 465 or 993 or 110)`.
- In-flight heuristics detecting STRIPTLS downgrades, cleartext authentication, and deprecated SSLv3.
- Thread-safe circular ring buffer (2,000 packet capacity) with one-click snapshotting to forensic dossiers.
- Configurable synthetic attack replay streaming at variable packet rates (e.g. 12 PPS).
- Bi-directional WebSocket (`/api/ws/telemetry`) streaming sensor health, buffer capacity, and real-time alerts.

### 3.3 Automated Spool Directory Daemon (Complete ✅)
- Continuous directory monitoring: `spool/incoming/` -> `spool/processed/` / `spool/quarantine/`.
- File lock detection to prevent ingesting partially transferred or active writes.
- Maximum file size safety threshold (50 MB) and extension validation.
- Background worker with on-demand sweep trigger (`POST /api/spool/scan`).

### 3.4 Async SQLite Relational Persistence (Complete ✅)
- Normalized SQLAlchemy 2.0 schema: `CaptureCaseModel`, `FlowSessionModel`, `FindingModel`, `CertEvidenceModel`.
- Read-through high-speed memory caching.
- Seeded defense benchmark profiles (`CASE-01` through `CASE-04`) with PQC classification.
- Paginated REST APIs for listing, retrieving, and deleting capture cases.

### 3.5 Enterprise SIEM & SOC Alerting (Complete ✅)
- ArcSight Common Event Format (CEF:0) serialization with CRLF injection sanitization.
- RFC 5424 UDP Syslog dispatcher transmitting to port 514 UDP.
- Webhook dispatcher for JSON dispatch to SOAR platforms (Splunk, Elastic, Slack, Teams).
- In-memory alert audit trail and test alert dispatch API.

### 3.6 Automated Remediation & MITRE D3FEND (Complete ✅)
- Dynamic Ansible playbook generator (`mail_hardening.yml`) for Postfix and Dovecot.
- Suricata IDS detection rules (`suricata_mail_rules.rules`) with custom SIDs 2615901–2615905.
- Snort 3 Lua rules (`snort3_mail_rules.lua`).
- MITRE D3FEND defensive matrix mapping: `D3-OTP`, `D3-CSD`, `D3-PFS`, `D3-CTA`, `D3-EAC`, `D3-PA`, `D3-CV`, `D3-CSM`.

### 3.7 Industrial Brutalist 3-Pane SOC Workstation (Complete ✅)
- 8 Specialized Operational Decks: Overview, Flows, Findings, Certificates, Dissector, Standards, Remediation, Dossier.
- Forensic Posture Diff Modal benchmarking against `CASE-01` hardened baseline.
- Real-time SIEM Telemetry Modal with Syslog status and test dispatch.
- In-flight Wire Threat Feed Drawer.
- Spool Ingestion Card embedded in upload modal.
- Dynamic Case Selector with in-UI case deletion.
- Micro-components strictly under 150 LOC, WCAG 2.1 AA accessible, 0 lint/build errors.
