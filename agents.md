# AGENTS.md — Antigravity Assistant Instructions for SecureMailScope

## Project Identity & Problem Statement

- **Project**: SecureMailScope (SIH26159)
- **Sponsor**: National Technical Research Organisation (NTRO), Government of India
- **Core Mission**: Passive email network forensics for cryptographic security posture assessment across SMTP, SMTPS, IMAP, IMAPS, POP3, and POP3S.
- **Forensic Pipeline**:
  `PCAP Ingestion` → `TCP Stream Reassembly` → `Email Protocol Parser` → `TLS / STARTTLS Boundary Detection` → `X.509 Certificate Validation` → `Cryptographic Posture Scoring (0-100)` → `Wire Evidence Extraction` → `Forensic Report Generation`

---

## Workspace Structure & Services

```
SecureMailScope/
├── backend/                  # Python 3.10+ FastAPI backend
│   ├── app/
│   │   ├── main.py           # Application entry point with CORS
│   │   ├── api/routes.py     # Endpoints: /api/upload, /api/analysis/{id}, /api/report/...
│   │   └── core/             # Parsers: scapy, cryptography, JA3 engine, scorer
│   └── requirements.txt
├── frontend/                 # Next.js 14 App Router (TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/              # layout.tsx, page.tsx, globals.css
│   │   ├── components/
│   │   │   ├── shell/        # Top header, telemetry banner, case selector, tab navigation
│   │   │   └── overview/     # Posture hero, protocol divergence tracks, flow ledger preview
│   │   └── lib/
│   │       ├── api.ts        # Backend fetch wrapper
│   │       ├── types.ts      # TypeScript interfaces for AnalysisResult, Session, etc.
│   │       └── mock-data.ts  # 4 preset offline forensic cases (CASE-01 to CASE-04)
│   ├── API_AND_DATA_CONTRACTS.md
│   └── package.json
├── AGENTS.md                 # This file (authoritative Antigravity instructions)
├── DESIGN_HANDBOOK.md        # Complete visual specifications and component reference
└── README.md
```

### Development Commands

- **Backend Daemon**:
  ```powershell
  & "backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Frontend Development Server**:
  ```powershell
  cd frontend
  npm run dev
  ```
- **Frontend Production Build & Linter**:
  ```powershell
  cd frontend
  npm run lint
  npm run build
  ```

---

## Design System & Theme Rules

The UI operates with two intentional visual themes:
1. **Light Theme — "Arctic Forensics"**: Daylight forensic workstation. Cool, tinted slate canvas (`#F1F5F8`), crisp white surfaces (`#FFFFFF`), dark slate typography (`#0B1724`), deep teal accents (`#007C91` / `#006273`), 1px borders (`#D4DFE6`).
2. **Dark Theme — "Night Operations"**: Security operations center console. Deep obsidian canvas (`#0A0D10`), charcoal surfaces (`#101418`), neutral text (`#F2F4F5`), teal telemetry accents (`#00A3BF`), subtle borders (`#1B2228`).

### Color Token Mapping (`frontend/src/app/globals.css`)

Always use the semantic Tailwind tokens rather than hardcoded hex values:

| Semantic Token | Light Theme ("Arctic") | Dark Theme ("Night") | Usage |
| :--- | :--- | :--- | :--- |
| `sms-canvas` | `#F1F5F8` | `#0A0D10` | App background |
| `sms-surface` | `#FFFFFF` | `#101418` | Primary surface |
| `sms-surface-secondary` | `#E8EEF3` | `#141A20` | Secondary wells, headers |
| `sms-surface-hover` | `#DEE8EE` | `#1A222A` | Interactive hover states |
| `sms-surface-selected` | `#E3F2F4` | `#16262E` | Active selection rows |
| `sms-border` | `#D4DFE6` | `#1B2228` | Structural 1px borders |
| `sms-border-subtle` | `#E2EAF0` | `#161C22` | Internal dividers |
| `sms-text-primary` | `#0B1724` | `#F2F4F5` | Main headings, scores |
| `sms-text-secondary` | `#405366` | `#A8B3BC` | Flow labels, explanations |
| `sms-text-muted` | `#6D7E8E` | `#707D88` | Metadata, timestamps, ports |
| `sms-cyan` | `#007C91` | `#00A3BF` | Brand accent, expected rails |
| `sms-red` | `#C52F3C` | `#EF4444` | Critical findings, downgrade rails |
| `sms-amber` | `#A65B00` | `#F59E0B` | Medium / high severity warnings |
| `sms-green` | `#18794E` | `#10B981` | Hardened / secure indicators |

### Typography Guidelines

- **Primary Interface**: Geist Sans (`font-sans`)
- **Technical & Wire Data**: JetBrains Mono (`font-mono`) for IP addresses, port numbers, hex dumps, cipher suite strings, JA3 hashes, timestamps, and packet counts.
- **Numbers**: Always enforce tabular numbers (`tabular-nums`) on all scores, measurements, and table values.
- **Minimum Text Size**: Never use UI text below `12px` (`text-xs`).

### Anti-Slop Rules

- **Zero Marketing Fluff**: No generic landing page cards, promotional banners, or empty drag-and-drop boxes taking over the screen.
- **Zero Decorative AI Slop**: No neon cyan drop-shadows, blurred glowing blobs, or glassmorphism.
- **Evidence-Based Phrasing**: Use precise wire-grounded terms (`STARTTLS Capability Absent from Observed Response`, `Plaintext Auth Observed`, `TLS Record Layer Boundary 0x16 0x03`). Avoid speculative accusations (`Compromised`, `Hacked`).
- **Micro-Component Architecture**: Split complex views into discrete files under 150 lines of code.

---

## View Routing & Architecture

The application layout consists of:
1. **Persistent Chrome** (`frontend/src/components/shell/`):
   - Top Header: Product badge `SECUREMAILSCOPE [SIH26159]`, sensor indicator `NTRO SENSOR`, case selector dropdown, Upload PCAP button, Export button, and Theme Toggle.
   - Secondary Tab Bar: `OVERVIEW`, `FLOWS 4`, `FINDINGS 4`, `CERTIFICATES`, `DISSECTOR`, `STANDARDS`, `REPORT`.
   - Metadata Strip: PCAP file name, packet count, reconstructed stream count, SHA-256 hash, capture timestamp, and Scope toggle.
2. **View Routing** (`frontend/src/app/page.tsx`):
   - Controlled by the `activeTab` state (`overview`, `flows`, `findings`, `certificates`, `dissector`, `standards`, `report`).
   - Active case state is synchronized with URL query parameter (`?case=CASE-04`).

### Specifications for Views to Implement

1. **`FLOWS` Tab**:
   - Dense interactive table of all reconstructed TCP streams.
   - Columns: Stream ID, Protocol (:port), Source endpoint, Destination endpoint, TLS version, Negotiated cipher suite, PFS indicator, JA3 client match, Posture score, Severity badge.
   - Filter bar: Protocol filter (SMTP, SMTPS, IMAP, etc.), Encryption status (Encrypted, Cleartext, Downgraded), Severity filter.
   - Clicking a row transitions to the `DISSECTOR` tab with that stream selected.

2. **`FINDINGS` Tab**:
   - Comprehensive inventory of identified vulnerabilities across all streams.
   - Grouping: Critical (STRIPTLS downgrades, cleartext passwords), High (Deprecated TLS 1.0, 3DES, expired certs), Medium (CBC ciphers, SHA-1 signatures), Low (non-AEAD TLS 1.2).
   - Card/Row layout showing Affected Vector, Wire Evidence snippet, NIST SP 800-52r2 clause reference, and recommended remediation.

3. **`CERTIFICATES` Tab**:
   - X.509 leaf certificate inspector and trust chain viewer.
   - Detailed inspection card for each detected certificate: Subject Common Name (CN), Issuer CN, Serial Number, Validity Window (Not Before - Not After, Days Remaining), Public Key Algorithm and Bit Length, Signature Algorithm and Digest, Subject Alternative Names (SANs).
   - Visual alerts for expired certificates, weak keys (< 2048-bit RSA), and self-signed certificates.

4. **`DISSECTOR` Tab**:
   - Deep inspection workbench with two selectable modes:
     - **Mode A (Cryptanalysis & Audit)**: Parsed TLS handshake tree (Client Hello extensions, cipher list, Server Hello negotiated parameters, JA3 fingerprint calculation, scoring deduction ledger).
     - **Mode B (Raw Stream & Protocol State Machine)**: Dual-pane monospaced ASCII and Hex stream dump highlighting the exact byte offset of the STARTTLS downgrade (`250-STARTTLS` stripped) or the TLS record boundary (`0x16 0x03`).

5. **`STANDARDS` Tab**:
   - Compliance matrices for NIST SP 800-52r2 and RFC 8314.
   - Itemized checklist with Pass / Warn / Fail status per requirement.

6. **`REPORT` Tab**:
   - Official executive forensic audit summary ready for printing or export.
   - Download actions wired to `/api/report/{id}/pdf` (ReportLab PDF) and `/api/report/{id}/json`.

---

## Data Integration & Contracts

- **Mock Data**: Use `frontend/src/lib/mock-data.ts` to render cases offline (`CASE-01` to `CASE-04`).
- **Live API**: Use `frontend/src/lib/api.ts` to communicate with the FastAPI backend:
  - `uploadPcap(file: File)`: POST `/api/upload` -> `{ analysis_id }`
  - `getAnalysis(id: string)`: GET `/api/analysis/{id}` -> `AnalysisResult`
  - `downloadPdf(id: string)`: GET `/api/report/{id}/pdf` -> triggers file download
  - `downloadJson(id: string)`: GET `/api/report/{id}/json` -> triggers file download
- See `frontend/API_AND_DATA_CONTRACTS.md` for full TypeScript schema definitions.

---

## Verification Checklist

Before finishing any task, run:
1. `npm run lint` in `frontend/` — ensure 0 warnings, 0 errors.
2. `npm run build` in `frontend/` — ensure clean production compilation.
3. Test both Light and Dark themes to ensure all text and borders maintain sufficient contrast.
