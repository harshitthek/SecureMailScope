# SecureMailScope — Project Memory & Context

## What Is This File?
This file is the single source of truth for any AI agent or developer working on this project. Read this FIRST before writing any code. It contains project decisions, constraints, naming conventions, and domain knowledge that must be respected at all times.

---

## 1. Project Identity
- **Project Name:** SecureMailScope
- **Tagline:** AI-Assisted Cryptographic Security Posture Assessment for Secure Email Communications
- **SIH Problem Statement:** SIH26159
- **Sponsoring Agency:** National Technical Research Organisation (NTRO), Government of India
- **Hackathon:** Smart India Hackathon 2026

---

## 2. Critical Constraints
- **TIME:** This is a rapid prototype. We have ~48 hours. Every decision must favor speed over perfection.
- **FRONTEND PURPOSE:** The frontend exists ONLY for the prototype demo video. It must look polished on screen but does NOT need production hardening, auth, error boundaries, or edge-case handling.
- **BACKEND PURPOSE:** The backend must actually work — it parses real PCAP files and produces real analysis. This is the core IP.
- **NO ACTIVE SCANNING:** The tool is PASSIVE ONLY. It reads pre-captured `.pcap` / `.pcapng` files. It never connects to any external mail server. This is a hard requirement from NTRO.
- **NO EMAIL CONTENT:** We never read, decrypt, or display email message bodies. We only analyze the cryptographic handshake metadata and session parameters.
- **OFFLINE-ONLY:** No API calls to external services. All analysis happens locally on the server.

---

## 3. Monorepo Structure

```
SecureMailScope/
├── backend/                    # Python FastAPI server
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── api/
│   │   │   └── routes.py       # API endpoints (/upload, /analyze, /report)
│   │   ├── core/
│   │   │   ├── pcap_parser.py  # PCAP ingestion, TCP stream reassembly
│   │   │   ├── tls_analyzer.py # TLS handshake parsing, cipher extraction
│   │   │   ├── cert_validator.py # X.509 certificate validation
│   │   │   ├── starttls_detector.py # STARTTLS state machine
│   │   │   ├── ja3_engine.py   # JA3 fingerprint computation
│   │   │   ├── scorer.py       # Cryptographic posture scoring formula
│   │   │   └── anomaly.py      # Isolation Forest anomaly detection
│   │   ├── reports/
│   │   │   ├── json_exporter.py
│   │   │   └── pdf_exporter.py
│   │   └── data/
│   │       ├── cipher_db.json  # IANA cipher suite → security classification
│   │       ├── ja3_known.json  # Known-good JA3 hashes (Thunderbird, Outlook, etc.)
│   │       └── nist_rules.json # NIST SP 800-52r2 compliance rules
│   ├── test_pcaps/             # Synthetic test PCAP files for demo
│   │   ├── hardened_tls13.pcap
│   │   ├── legacy_tls10.pcap
│   │   ├── striptls_attack.pcap
│   │   └── rogue_client.pcap
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Main dashboard page
│   │   ├── components/
│   │   │   ├── upload-zone.tsx         # PCAP drag-and-drop uploader
│   │   │   ├── score-gauge.tsx         # Large circular posture score
│   │   │   ├── grade-badge.tsx         # Letter grade badge (A+ to F)
│   │   │   ├── session-table.tsx       # Analyzed sessions data table
│   │   │   ├── session-detail.tsx      # Expandable session detail panel
│   │   │   ├── protocol-chart.tsx      # TLS version distribution pie chart
│   │   │   ├── cipher-chart.tsx        # Cipher suite bar chart
│   │   │   ├── cert-panel.tsx          # Certificate details card
│   │   │   ├── vulnerability-list.tsx  # Prioritized vulnerability findings
│   │   │   ├── compliance-checklist.tsx # NIST compliance pass/fail grid
│   │   │   ├── alert-banner.tsx        # Critical alert banner (STRIPTLS)
│   │   │   └── export-button.tsx       # PDF/JSON export trigger
│   │   ├── lib/
│   │   │   ├── api.ts          # Fetch wrapper for backend calls
│   │   │   └── types.ts        # TypeScript interfaces for API responses
│   │   └── hooks/
│   │       └── use-analysis.ts # React hook for upload + analysis state
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── Dockerfile
├── docker-compose.yml
├── prd.md
├── memory.md                  # THIS FILE
├── agents.md
├── design.md
├── phases.md
└── README.md
```

---

## 4. API Contract

### POST `/api/upload`
Upload a PCAP file for analysis.
- **Request:** `multipart/form-data` with field `file` (`.pcap` or `.pcapng`)
- **Response:** `{ "analysis_id": "uuid-string" }`

### GET `/api/analysis/{analysis_id}`
Get complete analysis results.
- **Response:** See `types.ts` — `AnalysisResult` interface containing:
  - `enterprise_score: number` (0–100)
  - `enterprise_grade: string` (A+, A, B, C, D, F)
  - `total_sessions: number`
  - `protocols_detected: string[]`
  - `sessions: Session[]` (array of per-session details)
  - `vulnerabilities: Vulnerability[]` (prioritized findings)
  - `compliance: ComplianceCheck[]` (NIST pass/fail items)
  - `certificate_summary: CertSummary[]`
  - `protocol_distribution: { version: string, count: number }[]`
  - `cipher_distribution: { cipher: string, count: number, severity: string }[]`

### GET `/api/report/{analysis_id}/pdf`
Download PDF forensic report.

### GET `/api/report/{analysis_id}/json`
Download machine-readable JSON report.

---

## 5. Scoring Formula

```
Score = 100 - (V_proto + V_cipher + V_pfs + V_cert + V_anomaly)

V_proto:
  SSL 2.0 / SSL 3.0    → -40
  TLS 1.0 / TLS 1.1    → -25
  TLS 1.2 (non-AEAD)   → -5
  TLS 1.2 (AEAD)       → 0
  TLS 1.3              → 0

V_cipher:
  RC4, 3DES, NULL, EXP → -30
  CBC mode             → -15
  AES-GCM, ChaCha20    → 0

V_pfs:
  Static RSA           → -20
  ECDHE / DHE          → 0

V_cert:
  Expired              → -25
  Self-signed          → -30
  SHA-1/MD5 signature  → -20
  RSA key < 2048 bits  → -25

V_anomaly:
  Unknown JA3 hash     → -15
  ML outlier detected  → -15

Enterprise Score = average(all session scores), clamped to [0, 100]
Grade mapping: 90–100 = A+, 80–89 = A, 70–79 = B, 60–69 = C, 50–59 = D, <50 = F
```

---

## 6. Naming Conventions
- **Python:** snake_case for files, functions, variables. PascalCase for classes.
- **TypeScript/React:** PascalCase for components. camelCase for functions/variables. kebab-case for file names.
- **API routes:** lowercase, hyphen-separated paths.
- **CSS:** Tailwind utility classes only. No custom CSS files.

---

## 7. Key Domain Terms
- **PCAP:** Packet Capture file format (.pcap / .pcapng) — raw network traffic dump.
- **STARTTLS:** In-band protocol command that upgrades a plaintext connection to TLS.
- **Implicit TLS:** Connection starts encrypted from the first byte (dedicated ports: 465, 993, 995).
- **JA3:** MD5 hash fingerprint of a TLS Client Hello's parameters. Identifies client software.
- **Forward Secrecy (PFS):** Property ensuring session keys cannot be recovered even if long-term private key is compromised. Requires ephemeral key exchange (ECDHE/DHE).
- **AEAD:** Authenticated Encryption with Associated Data — modern cipher mode (GCM, ChaCha20-Poly1305).
- **CBC:** Cipher Block Chaining — legacy cipher mode vulnerable to padding oracle attacks.
- **STRIPTLS Attack:** MitM strips the STARTTLS capability from server response, forcing cleartext.
- **X.509:** Standard format for public key certificates used in TLS.

---

## 8. Test PCAP Scenarios
We need 4 synthetic PCAPs for the demo. Generate them using Python scripts that simulate mail handshakes:

| ID | Name | TLS | Cipher | Cert | Expected Score |
|---|---|---|---|---|---|
| PCAP-01 | Hardened Modern | TLS 1.3 | AES-256-GCM | Valid Let's Encrypt, RSA-2048 | 98 (A+) |
| PCAP-02 | Legacy Vulnerable | TLS 1.0 | 3DES-CBC | SHA-1 signed, RSA-1024 | 25 (F) |
| PCAP-03 | STRIPTLS Attack | None (cleartext) | None | N/A | 0 (CRITICAL) |
| PCAP-04 | Rogue Client | TLS 1.2 | AES-128-GCM | Valid, but unknown JA3 | 55 (D) |

---

## 9. What NOT To Do
- Do NOT build authentication or login.
- Do NOT add dark mode toggle (waste of time; pick one theme and ship).
- Do NOT over-engineer error handling. A toast notification for upload errors is sufficient.
- Do NOT add loading skeletons or suspense boundaries. A simple spinner is fine.
- Do NOT write unit tests (prototype sprint — we test manually with the 4 PCAPs).
- Do NOT use a SQL/NoSQL database. Store analysis results in-memory (Python dict keyed by analysis_id).
- Do NOT add WebSocket streaming. Simple request-response is fine for <50MB files.
