# SecureMailScope — Frontend Design & Implementation Handbook (SIH26159)

This handbook provides the complete architectural, visual, and component specification for SecureMailScope, built for the National Technical Research Organisation (NTRO) under Problem Statement SIH26159 (Smart India Hackathon 2026).

It is specifically designed for frontend engineers and AI pair-programming assistants (such as Google Antigravity) to build and refine the interface without loss of technical context or backend contracts.

---

## 1. Executive Summary & Forensic Domain

SecureMailScope is an out-of-band passive network forensics tool for assessing the cryptographic posture of email traffic (SMTP, SMTPS, IMAP, IMAPS, POP3, POP3S).

### The Forensic Problem
- Mail servers frequently negotiate TLS opportunistically using the `STARTTLS` command.
- Active network attackers (or compromised middleboxes) can perform **STRIPTLS attacks**: removing `250-STARTTLS` from the server's EHLO response, forcing email clients into unencrypted cleartext transmission.
- Outdated ciphers (RC4, 3DES), deprecated protocol versions (SSL 3.0, TLS 1.0/1.1), weak RSA keys (< 2048-bit), and expired certificates often persist unmonitored.

### The System Pipeline
```
[ Raw PCAP File ]
       │
       ▼ (Scapy / DPkt)
[ TCP Stream Reassembly ]
       │
       ▼ (STARTTLS State Machine)
[ Protocol & TLS Detection ]
       │
       ├── Encrypted? Yes ──► [ TLS Dissector (Record Layer / Extensions / JA3) ]
       │                             │
       └── Encrypted? No  ──► [ Cleartext Credential / STRIPTLS Scan ]
                                     │
                                     ▼
                      [ X.509 Certificate Validation ]
                                     │
                                     ▼
                      [ Mathematical Scorer (0-100) ]
                                     │
                                     ▼
                     [ Next.js SOC Forensic Workstation ]
```

---

## 2. Design System: Dual-Theme Architecture

The application implements two distinct visual themes. Neither theme is a naive color inversion.

### Theme A: "Arctic Forensics" (Light Theme)
- **Concept**: Forensic lab workstation in daylight. High clarity, technical precision, cool slate-tinted canvas with deep teal accents.
- **Canvas**: `#F1F5F8`
- **Surface**: `#FFFFFF`
- **Secondary Surface**: `#E8EEF3`
- **Border**: `#D4DFE6` (Dividers: `#E2EAF0`)
- **Primary Text**: `#0B1724`
- **Secondary Text**: `#405366`
- **Muted Text**: `#6D7E8E`
- **Brand Accent**: `#007C91` (Active/Rail: `#006273`)

### Theme B: "Night Operations" (Dark Theme)
- **Concept**: Security operations center console. Obsidian background, charcoal panels, low glare, crisp telemetry indicators.
- **Canvas**: `#0A0D10`
- **Surface**: `#101418`
- **Secondary Surface**: `#141A20`
- **Border**: `#1B2228` (Dividers: `#161C22`)
- **Primary Text**: `#F2F4F5`
- **Secondary Text**: `#A8B3BC`
- **Muted Text**: `#707D88`
- **Brand Accent**: `#00A3BF`

### Semantic Severity Tokens
Both themes share consistent semantic cues:
- **Critical / Failure**: Light `#C52F3C` / Dark `#EF4444` (used for STRIPTLS, score 0, expired certificates).
- **High / Medium Warning**: Light `#A65B00` / Dark `#F59E0B` (used for TLS 1.0, 3DES, weak keys).
- **Secure / Baseline**: Light `#18794E` / Dark `#10B981` (used for TLS 1.3, AES-GCM, valid CA certs).

### Typography Scale
- **Sans Font**: Geist Sans (`font-sans`) — used for headers, labels, and analytical prose.
- **Mono Font**: JetBrains Mono (`font-mono`) — mandatory for all technical identifiers, IP:port vectors, hex strings, cipher suites, and timestamps.
- **Tabular Figures**: `tabular-nums` must be applied to all numerical readings, scores, and table cells.
- **Scale Reference**:
  - Hero Metric: `40px`–`48px` font-bold
  - Primary Finding Headline: `44px` font-semibold
  - Section Headings: `20px`–`24px` font-semibold
  - Body Text: `14px`–`16px` font-normal
  - Table & Data Cells: `13px`–`14px` font-mono
  - Sub-labels & Metadata: `12px` font-mono uppercase tracking-wider
  - *Absolute constraint*: No UI text below `12px`.

---

## 3. Application Layout & Component Tree

```
frontend/src/
├── app/
│   ├── layout.tsx                # Sets HTML font classes and dark mode root
│   ├── page.tsx                  # Master state: activeCase, activeTab, pcapData
│   └── globals.css               # CSS variables for Arctic & Night themes
└── components/
    ├── shell/
    │   ├── top-header.tsx        # Logo, Sensor status, Case Selector, Upload, Export, Theme Toggle
    │   ├── tab-navigation.tsx    # Horizontal tab bar (Overview, Flows, Findings, etc.)
    │   ├── case-context-strip.tsx# PCAP filename, packet count, hash, timestamp, scope
    │   └── upload-modal.tsx      # Modal for dropping new PCAP files to /api/upload
    ├── overview/                 # Phase 1 Vertical Slice (COMPLETED)
    │   ├── overview-view.tsx     # Overview page layout container
    │   ├── posture-hero.tsx      # Unified score meter (42/100) + Primary Finding headline
    │   ├── protocol-divergence-strip.tsx # Expected vs Observed rails + Key metric counts
    │   └── flow-ledger-preview.tsx # High-density 4-row flow ledger
    ├── flows/                    # Flow Investigation View (Phase 2)
    │   ├── flows-view.tsx        # Filterable stream grid
    │   ├── flow-filter-bar.tsx   # Protocol, Encryption, and Severity quick filters
    │   └── flow-table-row.tsx    # Interactive stream row component
    ├── findings/                 # Findings & Vulnerabilities View
    │   ├── findings-view.tsx     # Categorized vulnerability catalog
    │   └── finding-card.tsx      # Detailed finding with RFC evidence & remediation
    ├── certificates/             # X.509 Certificate Chain Inspector
    │   ├── certificates-view.tsx # Leaf cert inspection ledger
    │   └── cert-detail-panel.tsx # Validity, SANs, key length, and signature digest
    ├── dissector/                # Deep Dissector View (Modes A & B)
    │   ├── dissector-view.tsx    # Dissector container with mode switcher
    │   ├── dissector-mode-a.tsx  # Cryptanalysis & Handshake Record Tree
    │   └── dissector-mode-b.tsx  # Raw Byte Stream Dump & ASCII/Hex State Machine
    ├── standards/                # Standards Compliance View
    │   └── standards-view.tsx    # NIST SP 800-52r2 & RFC 8314 checklist
    └── report/                   # Forensic Report View
        └── report-view.tsx       # Printable executive summary with PDF export
```

---

## 4. View-by-View Specifications

### 4.1 Overview View (Phase 1 Baseline)
- Presents the executive cryptographic posture.
- Shows the overall posture score (0-100) against the NIST baseline (80).
- Identifies the primary active threat (e.g., `STARTTLS DOWNGRADE OBSERVED`).
- Displays protocol divergence comparing expected RFC 8314 flow against observed wire trace.
- Renders the 4 most critical flow signatures with active vector highlighting.

### 4.2 Flows View (`FLOWS 4`)
- **Purpose**: Full forensic inventory of all reconstructed TCP connections.
- **Columns**:
  1. `Status`: Dot indicator (Green = Secure, Crimson = Degraded/Bypassed).
  2. `ID`: E.g., `F01`, `F02`.
  3. `Protocol & Port`: E.g., `SMTPS :465`, `SMTP :587`.
  4. `Endpoints`: E.g., `192.168.1.102:49300 → 10.0.0.15:587`.
  5. `Server Name`: SNI or reverse DNS.
  6. `TLS Version`: E.g., `TLS 1.3`, `TLS 1.0`, or `CLEAR`.
  7. `Cipher Suite`: E.g., `TLS_AES_256_GCM_SHA384` or `None`.
  8. `PFS`: Perfect Forward Secrecy indicator (`ECDHE`, `DHE`, or `None`).
  9. `Score & Grade`: Numerical score badge (e.g., `98 A+` or `0 F`).
  10. `Action`: Inspect icon linking to the Dissector view.
- **Controls**: Filter pills for `All`, `SMTP`, `IMAP`, `POP3`, `Critical Threats`, and `Cleartext Only`.

### 4.3 Findings View (`FINDINGS 4`)
- **Purpose**: Actionable vulnerability management for security officers.
- **Item Fields**:
  - Severity level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - Finding Title (e.g., `STRIPTLS Downgrade Attack Detected`).
  - Affected Session & Endpoints (`Flow 03 · 10.0.0.15:587`).
  - Standard Violation (`NIST SP 800-52r2 §3.1`, `RFC 8314 §4`).
  - Wire Evidence Snippet: Exact ASCII string showing missing `250-STARTTLS` or cleartext authentication.
  - Recommended Mitigation: E.g., `Enforce strict TLS on port 465 (SMTPS) and reject plaintext connections.`

### 4.4 Certificates View (`CERTIFICATES`)
- **Purpose**: Trust chain and cryptographic validity analysis of observed X.509 certificates.
- **Metrics**:
  - Subject CN & Issuer CN.
  - Expiry status: Days remaining badge (positive = valid green, negative = expired red).
  - Public Key Strength: Type (RSA/EC) and bit length (flag keys < 2048-bit).
  - Signature Algorithm: Flag weak digests (SHA-1, MD5).
  - SAN Entries: List of all valid DNS hostnames.
  - Self-Signed Flag: Highlight unverified internal certificates.

### 4.5 Dissector View (`DISSECTOR`)
- **Purpose**: Deep forensic packet inspection for network analysts.
- **Mode A — Cryptanalysis & Audit**:
  - Parsed TLS Record Layer: Record Version, Content Type (`0x16 Handshake`).
  - Client Hello Dissection: Offered Cipher Suites, SNI, Supported Groups, JA3 Fingerprint Hash (`32-byte MD5`) matched against known client database.
  - Server Hello Dissection: Selected Cipher Suite, Negotiated Version.
  - Scoring Deduction Ledger: Clear breakdown of points deducted (e.g., `-40 protocol penalty`, `-30 cipher penalty`).
- **Mode B — Raw Stream & Protocol State Machine**:
  - Monospaced split-pane or unified hex + ASCII dump.
  - Highlighted byte ranges:
    - Yellow: Plaintext SMTP exchange (`EHLO`, `250 OK`).
    - Red: Stripped capability boundary or plaintext `AUTH PLAIN`.
    - Teal: TLS record header boundary (`0x16 0x03`).

### 4.6 Standards View (`STANDARDS`)
- **Purpose**: Direct audit against national and international regulatory baselines.
- **Frameworks**:
  1. **NIST SP 800-52r2**: Guidelines for the Selection, Configuration, and Use of TLS Implementations.
  2. **RFC 8314**: Cleartext Considered Obsolete: Use of Transport Layer Security (TLS) for Email Submission and Access.
- **Display**: Matrix table showing Standard Clause, Requirement, Observed Status (Pass / Fail), and Applicable Flows.

### 4.7 Report View (`REPORT`)
- **Purpose**: Executive summary generation and export.
- **Elements**:
  - Official NTRO Forensic Audit Header with classification badges.
  - Executive Risk Statement and Overall Posture Score.
  - Summary of Identified Vulnerabilities.
  - Direct download buttons:
    - `Export Official PDF`: Calls backend `/api/report/{id}/pdf` (ReportLab formatted).
    - `Export Structured JSON`: Calls backend `/api/report/{id}/json`.

---

## 5. Backend Data Contracts & Preserved Cases

The frontend integrates seamlessly with the FastAPI backend through `frontend/src/lib/api.ts` and `frontend/src/lib/types.ts`.

### Preset Offline Cases (`frontend/src/lib/mock-data.ts`)
The application includes 4 comprehensive pre-analyzed captures for immediate offline demonstration:
1. `CASE-01`: `ntro_hardened_tls13.pcap` (Score: 98/100, Grade A+) — Fully compliant modern TLS 1.3 infrastructure.
2. `CASE-02`: `striptls_mitm_attack.pcap` (Score: 12/100, Grade F) — Adversary intercepted port 587, stripped STARTTLS, captured credentials.
3. `CASE-03`: `legacy_enterprise_3des.pcap` (Score: 34/100, Grade F) — Deprecated TLS 1.0, 3DES ciphers, static RSA keys.
4. `CASE-04`: `enterprise_mail_capture.pcap` (Score: 42/100, Grade F) — Mixed real-world capture with 4 distinct protocols.

### Live API Endpoints
When connected to the active backend on `http://127.0.0.1:8000`:
- `POST /api/upload`: Uploads raw PCAP file, returns `{ "analysis_id": "<uuid>" }`.
- `GET /api/analysis/{id}`: Returns complete `AnalysisResult` JSON object.
- `GET /api/report/{id}/pdf`: Returns generated PDF stream.
- `GET /api/report/{id}/json`: Returns structured JSON stream.

---

## 6. Antigravity Prompting Recipes for Your Friend

When opening this workspace in Google Antigravity, use these structured prompt templates to implement each remaining view:

### Recipe 1: Building the Flows View (Phase 2)
> "Read AGENTS.md and DESIGN_HANDBOOK.md. Implement the Flows view in `frontend/src/components/flows/` with micro-components under 150 LOC. Render an interactive, filterable data grid for all reconstructed email streams from `mockCases[activeCase].sessions`. Include protocol filtering, search, and row click selection to navigate to the Dissector. Ensure `npm run lint` and `npm run build` pass with 0 errors."

### Recipe 2: Building the Deep Dissector View (Phase 3)
> "Read AGENTS.md and DESIGN_HANDBOOK.md. Implement the dual-mode Dissector view in `frontend/src/components/dissector/`. Mode A must render the parsed TLS handshake record tree, JA3 client fingerprint lookup, and score deduction ledger. Mode B must render the monospaced ASCII and hex stream dump showing the exact byte offset where STARTTLS was stripped. Maintain strict light and dark theme token usage."

### Recipe 3: Building the Findings & Certificates Views (Phase 4)
> "Read AGENTS.md and DESIGN_HANDBOOK.md. Build the Findings view (`frontend/src/components/findings/`) and Certificates view (`frontend/src/components/certificates/`). The Findings view must group vulnerabilities by severity with wire evidence snippets. The Certificates view must inspect X.509 leaf certificates, checking days remaining, RSA bit strength, and SAN entries. Verify with `npm run build`."

### Recipe 4: Verifying Builds and Themes
> "Run `npm run lint` and `npm run build` in the frontend directory. Check both Arctic Forensics (light) and Night Operations (dark) themes to confirm full contrast and zero layout shift."
