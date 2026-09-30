# SecureMailScope — Agent Task Delegation Guide

## Purpose
This file defines how to split work across AI coding agents (or team members) for maximum parallelism. Each agent has a clear scope, inputs, outputs, and zero overlap with other agents.

---

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR (You / Lead)                   │
│  Reads: prd.md, memory.md, phases.md                            │
│  Delegates tasks to agents below                                │
│  Integrates outputs, resolves API contract mismatches            │
└──────────────┬──────────────┬──────────────┬────────────────────┘
               │              │              │
    ┌──────────▼──────┐ ┌─────▼───────┐ ┌───▼────────────────┐
    │  AGENT 1:       │ │  AGENT 2:   │ │  AGENT 3:          │
    │  Backend Core   │ │  Frontend   │ │  Data & Reports    │
    │  (Packet Engine)│ │  (Dashboard)│ │  (PCAPs + PDF)     │
    └─────────────────┘ └─────────────┘ └────────────────────┘
```

---

## Agent 1: Backend Core Engine

### Role
Build the entire Python FastAPI backend that ingests PCAP files, parses packets, extracts TLS metadata, validates certificates, computes scores, and serves JSON results.

### Input Context Files
- `prd.md` — Feature requirements (MUST-have items 1–10)
- `memory.md` — Monorepo structure, API contract, scoring formula, naming conventions
- `SIH26159_SecureMailScope_Master_Dossier.md` — Domain knowledge (TLS versions, cipher classifications, X.509 rules, STARTTLS state machine, JA3 spec)

### Deliverables
1. `backend/app/main.py` — FastAPI app with CORS, file upload endpoint
2. `backend/app/api/routes.py` — `/api/upload`, `/api/analysis/{id}`, `/api/report/{id}/json`, `/api/report/{id}/pdf`
3. `backend/app/core/pcap_parser.py` — Read PCAP with scapy, filter email ports, reassemble TCP streams
4. `backend/app/core/tls_analyzer.py` — Parse TLS Client Hello / Server Hello, extract version, cipher suite, extensions, key exchange
5. `backend/app/core/cert_validator.py` — Extract X.509 DER cert from TLS Certificate message, decode with `cryptography` library, check expiry, key length, sig algo, self-signed
6. `backend/app/core/starttls_detector.py` — Track EHLO → 250-STARTTLS → STARTTLS command → 220 Ready → TLS transition. Flag if STARTTLS advertised but never upgraded.
7. `backend/app/core/ja3_engine.py` — Compute JA3 hash from Client Hello fields. Lookup against `ja3_known.json`.
8. `backend/app/core/scorer.py` — Implement the weighted scoring formula from memory.md exactly.
9. `backend/app/core/anomaly.py` — Isolation Forest on feature vector [tls_version_int, cipher_strength, key_length, pfs_bool, cert_days_remaining, ja3_known_bool]
10. `backend/app/data/cipher_db.json` — Comprehensive IANA cipher suite hex code → {name, severity, category, pfs, aead} mapping
11. `backend/app/data/ja3_known.json` — 10-15 known-good JA3 hashes for common email clients
12. `backend/app/data/nist_rules.json` — NIST SP 800-52r2 compliance checklist items
13. `backend/requirements.txt` — fastapi, uvicorn, scapy, dpkt, cryptography, scikit-learn, reportlab, python-multipart

### Key Technical Notes for This Agent
- Use `scapy` for PCAP reading (`rdpcap()` or `PcapReader` for streaming).
- Use `dpkt` as fallback for faster raw byte parsing of TLS records if scapy is too slow.
- For X.509 parsing, use `cryptography.x509.load_der_x509_certificate()`.
- JA3 hash: `md5(f"{version},{cipher_list},{ext_list},{curves},{point_formats}")`.
- Store results in a global `dict[str, AnalysisResult]` keyed by UUID. No database.
- CORS: Allow `http://localhost:3000` origin.

---

## Agent 2: Frontend Dashboard

### Role
Build the Next.js 14 frontend with a single-page dashboard that looks polished enough for a prototype demo video. Uses shadcn/ui components and Recharts for charts.

### Input Context Files
- `prd.md` — UI requirements (items 9, 10)
- `memory.md` — Component list, API contract, TypeScript interfaces
- `design.md` — Visual design spec, color palette, layout, component details

### Deliverables
1. `frontend/src/app/layout.tsx` — Root layout with dark SOC theme
2. `frontend/src/app/page.tsx` — Main page orchestrating upload → analysis → dashboard flow
3. `frontend/src/lib/types.ts` — TypeScript interfaces matching backend API response
4. `frontend/src/lib/api.ts` — Fetch wrapper functions (`uploadPcap`, `getAnalysis`, `downloadReport`)
5. `frontend/src/hooks/use-analysis.ts` — React state hook managing upload/loading/result states
6. `frontend/src/components/upload-zone.tsx` — Drag-and-drop PCAP file uploader with file icon
7. `frontend/src/components/score-gauge.tsx` — Large circular gauge (0–100) with color gradient
8. `frontend/src/components/grade-badge.tsx` — Letter grade badge (A+ green, B yellow, F red)
9. `frontend/src/components/session-table.tsx` — Data table of analyzed sessions (columns: #, Server, Protocol, TLS Version, Cipher, PFS, Score, Severity)
10. `frontend/src/components/session-detail.tsx` — Expandable panel showing full session metadata + certificate info
11. `frontend/src/components/protocol-chart.tsx` — Recharts PieChart of TLS version distribution
12. `frontend/src/components/cipher-chart.tsx` — Recharts BarChart of cipher suites by severity
13. `frontend/src/components/vulnerability-list.tsx` — Sorted list of findings with severity badges
14. `frontend/src/components/alert-banner.tsx` — Full-width red banner for CRITICAL findings (STRIPTLS)
15. `frontend/src/components/export-button.tsx` — Buttons to trigger PDF and JSON download
16. `frontend/src/components/compliance-checklist.tsx` — NIST checklist with pass/fail/warn icons

### Key Technical Notes for This Agent
- Backend runs on `http://localhost:8000`. Use Next.js `rewrites` or direct fetch.
- Use `shadcn/ui` Card, Table, Badge, Button, Progress, Alert components.
- Use `recharts` for PieChart and BarChart. Keep chart configs minimal.
- The page has two states: (a) Upload state — centered upload zone, (b) Dashboard state — full analysis view.
- No routing needed. Single page only.
- No auth. No dark mode toggle. No settings page.

---

## Agent 3: Data Generation & Report Templates

### Role
Create the synthetic test PCAP files for the demo, the PDF report generator, and the static data files.

### Input Context Files
- `memory.md` — PCAP scenario matrix, scoring formula
- `SIH26159_SecureMailScope_Master_Dossier.md` — Cipher suite classifications, cert rules

### Deliverables
1. `backend/test_pcaps/generate_test_pcaps.py` — Python script that creates 4 synthetic PCAPs using scapy packet crafting:
   - `hardened_tls13.pcap` — TLS 1.3, AES-256-GCM, valid cert
   - `legacy_tls10.pcap` — TLS 1.0, 3DES, SHA-1 cert, 1024-bit RSA
   - `striptls_attack.pcap` — SMTP session where STARTTLS is stripped, cleartext auth visible
   - `rogue_client.pcap` — TLS 1.2, valid cipher but anomalous client cipher ordering
2. `backend/app/reports/pdf_exporter.py` — ReportLab PDF generator that takes an AnalysisResult dict and produces a formatted multi-page forensic report with:
   - Cover page with enterprise grade
   - Executive summary
   - Session detail table
   - Vulnerability findings
   - NIST compliance checklist
   - Remediation recommendations
3. `backend/app/reports/json_exporter.py` — Simple JSON formatter with pretty-printing and metadata headers
4. `backend/app/data/cipher_db.json` — Complete mapping of ~40 common cipher suite hex codes to security metadata
5. `backend/app/data/ja3_known.json` — Known JA3 hashes for legitimate email clients
6. `backend/app/data/nist_rules.json` — Structured NIST compliance rules

### Key Technical Notes for This Agent
- For PCAP generation, use `scapy` to craft raw TCP + TLS packets. The TLS handshake doesn't need to be cryptographically valid — it just needs the correct byte structure for our parser to extract metadata.
- The STRIPTLS PCAP should show a plaintext SMTP exchange: EHLO → 250 (without STARTTLS) → AUTH PLAIN → cleartext credentials.
- For the PDF, use ReportLab with the same styling approach as the dossier PDF (Segoe UI font, navy/blue color scheme).

---

## Parallel Execution Strategy

```
Time ─────────────────────────────────────────────────────▶

Agent 1 (Backend):   [pcap_parser] → [tls_analyzer] → [scorer] → [API routes]
                                                                        │
Agent 2 (Frontend):  [layout + upload] → [dashboard skeleton] ─────────▶ [wire to API]
                                                                        │
Agent 3 (Data):      [cipher_db.json] → [generate PCAPs] → [pdf_exporter] ─▶ [test]
```

- Agents 1, 2, and 3 can start simultaneously.
- Agent 2 can build the entire UI using mock/hardcoded data first, then swap in real API calls at the end.
- Agent 3's PCAPs are needed for Agent 1's testing, but Agent 1 can use any publicly available PCAP (e.g., Wireshark samples) during development.
