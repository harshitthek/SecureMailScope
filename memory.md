# SecureMailScope — Project Memory & Architecture Context

## 1. Project Identity
- **Project Name:** SecureMailScope
- **Tagline:** Enterprise Passive Network Forensic Framework for Cryptographic Security Posture Assessment of Encrypted Email Communications
- **SIH Problem Statement:** SIH26159
- **Sponsoring Agency:** National Technical Research Organisation (NTRO), Government of India
- **Theme:** Blockchain & Cybersecurity
- **Status:** Complete Enterprise Grade Platform

---

## 2. Core Architectural Principles
- **STRICTLY PASSIVE:** The platform functions out-of-band on network tap data or pre-captured packet files (`.pcap`, `.pcapng`). Zero active scanning or packet injection into production mail pathways.
- **ZERO PAYLOAD DECRYPTION:** The system never reads, decrypts, stores, or inspects email message bodies. Forensics are confined exclusively to cryptographic handshake metadata, protocol state machines, and transport security envelopes.
- **AIR-GAPPED COMPLIANCE:** Analysis runs entirely on-premises without calling external verification authorities or cloud endpoints.
- **DEFENSE-GRADE UI STANDARDS:** Adheres to `/usemax` micro-components ($< 150\text{ LOC}$ per component), WCAG 2.1 AA accessibility, and an industrial brutalist SOC design system (high density, 1px structural grid lines, monospace telemetry, zero marketing gradients).

---

## 3. Monorepo Directory Topology

```
SecureMailScope/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point, CORS, startup lifespan, routes
│   │   ├── api/                     # REST and WebSocket route definitions
│   │   │   ├── routes.py            # Core upload and dossier retrieval
│   │   │   ├── tap_routes.py        # Live network TAP control endpoints
│   │   │   ├── ws_telemetry.py      # Telemetry & alert WebSocket endpoint
│   │   │   ├── case_routes.py       # Relational SQLite case management
│   │   │   ├── siem_routes.py       # ArcSight CEF, Syslog, Webhooks
│   │   │   ├── spool_routes.py      # Automated spool daemon endpoints
│   │   │   └── remediation_routes.py # Ansible, Suricata, Snort, MITRE D3FEND
│   │   ├── core/                    # Core forensic analysis pipeline
│   │   │   ├── pcap_parser.py       # Stream demultiplexing & TCP reassembly
│   │   │   ├── starttls_detector.py # STARTTLS transitions & STRIPTLS detection
│   │   │   ├── tls_analyzer.py      # TLS 1.0–1.3 handshake dissecting & JA3
│   │   │   ├── cert_validator.py    # X.509 DER certificate cryptanalysis
│   │   │   ├── ja3_engine.py        # MD5 JA3 fingerprinting & GREASE filtering
│   │   │   ├── scorer.py            # Posture scoring & enterprise grading
│   │   │   └── anomaly.py           # Isolation Forest anomaly engine
│   │   ├── tap/                     # Live wire network sensor
│   │   │   ├── live_wire_sniffer.py # Scapy AsyncSniffer on physical/virtual NICs
│   │   │   ├── ring_buffer.py       # Thread-safe packet circular buffer
│   │   │   ├── threat_heuristics.py # In-flight wire threat detection
│   │   │   └── replay_engine.py     # Configurable PCAP replay streaming
│   │   ├── spool/                   # Ingestion daemon
│   │   │   ├── watcher.py           # Directory watcher with file lock checks
│   │   │   └── daemon.py            # Background sweeper worker
│   │   ├── db/                      # Relational persistence
│   │   │   ├── base.py              # DeclarativeBase metadata
│   │   │   ├── models.py            # Relational SQLAlchemy 2.0 models
│   │   │   ├── session.py           # Async SQLite engine & sessionmaker
│   │   │   ├── repository.py        # Read-through cached case repository
│   │   │   ├── serializers.py       # Model <-> DTO translation
│   │   │   └── seed.py              # Benchmark cases pre-seed with PQC tagging
│   │   ├── siem/                    # Enterprise SIEM forwarders
│   │   │   ├── cef_serializer.py    # ArcSight CEF format with CRLF sanitization
│   │   │   ├── syslog_dispatcher.py # RFC 5424 UDP Syslog (:514 UDP)
│   │   │   └── webhook_dispatcher.py# JSON Webhook dispatcher for SOAR
│   │   ├── remediation/             # Automated countermeasure orchestration
│   │   │   ├── orchestrator.py      # MITRE D3FEND mapping & action items
│   │   │   ├── ansible_generator.py # Dynamic Postfix/Dovecot playbooks (.yml)
│   │   │   └── ids_generator.py     # Suricata (.rules) & Snort 3 (.lua) rules
│   │   ├── reports/                 # Formal reporting engines
│   │   │   ├── pdf_exporter.py      # ReportLab multi-page audit PDF
│   │   │   ├── json_exporter.py     # Structured JSON report exporter
│   │   │   └── html_exporter.py     # Standalone HTML forensic dossier
│   │   └── data/                    # Reference catalogs
│   │       ├── cipher_db.json       # IANA cipher security registry
│   │       ├── ja3_known.json       # Known client JA3 signatures
│   │       └── demo_cases.json      # Built-in defense benchmark captures
│   ├── tests/                       # Pytest test suite (45/45 tests passing)
│   └── requirements.txt
├── frontend/                        # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                     # Page route and layout
│   │   ├── components/
│   │   │   ├── shell/               # Header, NavStrip, CaseSelector, Modals
│   │   │   ├── overview/            # PostureHero, WhatIfSimulator, PostureDiff
│   │   │   ├── telemetry/           # TapStatusBar, SiemModal, ThreatFeedDrawer
│   │   │   └── views/               # Flows, Findings, Certs, Dissector, Standards, Remediation, Report
│   │   ├── hooks/                   # Custom React hooks (useLiveTap, etc.)
│   │   └── lib/                     # Types, API client, mock data
│   └── package.json
└── README.md
```

---

## 4. Cryptographic Scoring & Penalty Formula

$$\text{Score} = \max\left(0, \min\left(100, 100 - (V_{\text{proto}} + V_{\text{cipher}} + V_{\text{pfs}} + V_{\text{cert}} + V_{\text{anomaly}})\right)\right)$$

### Penalty Deductions:
- **$V_{\text{proto}}$ (Protocol Version)**:
  - Cleartext (None) / SSL 2.0 / SSL 3.0: 40 pts
  - TLS 1.0 / TLS 1.1: 25 pts
  - TLS 1.2 (non-AEAD): 5 pts
  - TLS 1.2 (AEAD) / TLS 1.3: 0 pts
- **$V_{\text{cipher}}$ (Cipher Suite)**:
  - Cleartext (None) / RC4 / 3DES / NULL / EXPORT: 30 pts
  - CBC mode: 15 pts
  - AES-GCM / ChaCha20-Poly1305: 0 pts
- **$V_{\text{pfs}}$ (Forward Secrecy)**:
  - Static RSA / Cleartext: 20 pts
  - ECDHE / DHE: 0 pts
- **$V_{\text{cert}}$ (X.509 Certificate)**:
  - Takes maximum penalty among certificate issues:
    - Self-signed: 30 pts
    - Expired / RSA key < 2048: 25 pts
    - Weak signature (SHA-1 / MD5): 20 pts
- **$V_{\text{anomaly}}$ (Client Fingerprint & Outliers)**:
  - Unknown JA3 client fingerprint: 15 pts
  - Isolation Forest anomaly flag: 15 pts

### Enterprise Grade Boundaries:
- `90 – 100`: **A+** (Secure, NIST compliant)
- `80 – 89`: **A** (Low risk)
- `70 – 79`: **B** (Moderate risk)
- `60 – 69`: **C** (Degraded)
- `50 – 59`: **D** (High risk)
- `< 50`: **F** (Critical vulnerability)

---

## 5. Defense Benchmark Profiles
1. **`CASE-01: HARDENED_TLS13`**: Score 98 (A+). Enforced TLS 1.3, AES-256-GCM, ECDHE X25519, valid X.509 certs.
2. **`CASE-02: STRIPTLS_MITM`**: Score 12 (F). Active AiTM downgrade on port 587, plaintext credentials exposed.
3. **`CASE-03: LEGACY_3DES_RSA`**: Score 24 (F). Deprecated TLS 1.0 with 3DES-CBC (Sweet32), static RSA, expired SHA-1 cert.
4. **`CASE-04: ENTERPRISE_MIXED`**: Score 42 (F). Multi-stream enterprise mailflow showing compliant SMTPS alongside unencrypted cleartext SMTP and legacy ciphers.
