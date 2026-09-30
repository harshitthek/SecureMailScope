# SecureMailScope — Prompt Templates for AI Agents

## Purpose
Pre-written prompts you can copy-paste into Gemini Flash 3.8 High (or any AI coding agent) to get working code for each component. Each prompt is self-contained and references the relevant context files.

---

## Prompt 1: Backend — Full FastAPI Server

```
You are building the Python backend for "SecureMailScope", a passive network forensic tool that analyzes PCAP files containing email protocol traffic (SMTP, IMAP, POP3) and audits their cryptographic security posture.

Read these context files carefully before writing any code:
- prd.md (product requirements — focus on MUST-have items 1-10)
- memory.md (project structure, API contract, scoring formula, constraints)
- types.md (exact data shapes the API must return)
- stack.md (Python dependencies and versions)

Build the complete backend with these files:
1. backend/app/main.py — FastAPI app with CORS middleware
2. backend/app/api/routes.py — All 4 API endpoints from memory.md
3. backend/app/core/pcap_parser.py — PCAP ingestion, TCP stream reassembly using scapy
4. backend/app/core/tls_analyzer.py — TLS Client Hello / Server Hello parsing (extract version, cipher, SNI, key exchange)
5. backend/app/core/cert_validator.py — X.509 certificate extraction and validation using cryptography library
6. backend/app/core/starttls_detector.py — STARTTLS state machine detection
7. backend/app/core/ja3_engine.py — JA3 fingerprint computation
8. backend/app/core/scorer.py — Scoring formula from memory.md
9. backend/app/core/anomaly.py — Isolation Forest anomaly detection
10. backend/app/reports/pdf_exporter.py — ReportLab PDF forensic report generator
11. backend/app/reports/json_exporter.py — JSON report formatter
12. backend/app/data/cipher_db.json — IANA cipher suite security classifications
13. backend/app/data/ja3_known.json — Known-good JA3 hashes
14. backend/app/data/nist_rules.json — NIST compliance rules
15. backend/requirements.txt

The API response must EXACTLY match the TypeScript interfaces in types.md. The frontend team is building against those types.

Key constraints:
- PASSIVE ONLY. Never connect to external servers.
- In-memory storage (dict keyed by UUID). No database.
- CORS allow origin: http://localhost:3000
- The scoring formula must be implemented EXACTLY as defined in memory.md.
```

---

## Prompt 2: Frontend — Complete Dashboard

```
You are building the Next.js 14 frontend dashboard for "SecureMailScope", a cryptographic security posture assessment tool.

Read these context files carefully before writing any code:
- prd.md (UI requirements — items 9, 10)
- memory.md (component list, API contract, project structure)
- design.md (EXACT visual design spec — colors, layout, typography, component details)
- types.md (TypeScript interfaces AND mock data to use during development)
- stack.md (Next.js setup, dependencies)

Build the complete frontend with these files:
1. frontend/src/app/layout.tsx — Root layout, dark SOC theme, Inter font
2. frontend/src/app/page.tsx — Main page with two states (Upload vs Dashboard)
3. frontend/src/lib/types.ts — TypeScript interfaces (copy from types.md)
4. frontend/src/lib/api.ts — Fetch wrappers for backend API
5. frontend/src/lib/mock-data.ts — Hardcoded mock data from types.md (for dev)
6. frontend/src/hooks/use-analysis.ts — State management hook
7. All components listed in design.md section 5

Visual requirements (from design.md):
- Dark theme: bg-slate-900 page, bg-slate-800 cards, slate-700 borders
- Severity colors: red-500 (critical), orange-500 (high), yellow-500 (medium), blue-500 (low), green-500 (secure)
- Score gauge: SVG circular ring, animated on mount
- Charts: Recharts PieChart and BarChart with severity colors
- Session table: Hoverable rows, monospace cipher names, expandable detail
- Alert banner: Only shows for CRITICAL findings, red background, pulse icon
- No auth, no dark mode toggle, no responsive design. Desktop 1440px only.

START with mock data hardcoded. The API will be wired later.
```

---

## Prompt 3: Test PCAP Generator

```
You are creating synthetic test PCAP files for "SecureMailScope", a tool that analyzes email protocol traffic.

Read memory.md section 8 for the exact 4 PCAP scenarios needed.

Create a Python script `backend/test_pcaps/generate_test_pcaps.py` that uses scapy to craft 4 PCAP files:

1. hardened_tls13.pcap — SMTP session on port 465 (implicit TLS):
   - Craft a TCP 3-way handshake
   - Craft a TLS 1.3 Client Hello with cipher suites [0x1301, 0x1302, 0x1303], extensions [SNI="mail.secure-gov.in", supported_versions=[0x0304]], elliptic curves [0x001d, 0x0017]
   - Craft a TLS 1.3 Server Hello selecting cipher 0x1301
   - Include a valid-looking X.509 certificate (can be self-generated for testing)
   - Expected analysis score: ~98/100

2. legacy_tls10.pcap — SMTP session on port 25 with STARTTLS:
   - TCP handshake, then plaintext EHLO/250-STARTTLS exchange
   - STARTTLS command and 220 response
   - TLS 1.0 Client Hello with weak ciphers [0x000A (3DES)]
   - Server Hello selecting TLS 1.0, cipher 0x000A, static RSA key exchange
   - Certificate with SHA-1 signature, 1024-bit RSA key, expired dates
   - Expected analysis score: ~25/100

3. striptls_attack.pcap — SMTP on port 587, cleartext only:
   - TCP handshake
   - Server banner: 220 mail.compromised.in ESMTP
   - Client: EHLO attacker
   - Server: 250 OK (NO STARTTLS in capabilities)
   - Client: AUTH PLAIN dXNlcm5hbWUAcGFzc3dvcmQ=  (base64 of "username\0password")
   - No TLS at all. Fully cleartext credentials visible.
   - Expected analysis score: 0/100

4. rogue_client.pcap — IMAP on port 993 (implicit TLS):
   - TLS 1.2 Client Hello with unusual/rare cipher ordering and extensions
   - Server Hello with TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
   - Valid certificate
   - The JA3 hash should NOT match any known client
   - Expected analysis score: ~55/100

The PCAPs don't need to complete full cryptographic handshakes. They just need enough structure for our parser to extract: TLS version, cipher suite, key exchange, certificate bytes, and STARTTLS tokens.
```

---

## Prompt 4: PDF Report Generator

```
You are building the PDF forensic report generator for "SecureMailScope".

Read memory.md for the scoring formula and types.md for the data structure.

Create backend/app/reports/pdf_exporter.py using ReportLab that:
1. Takes an AnalysisResult dict as input
2. Generates a multi-page PDF with:
   - Cover page: "SecureMailScope Forensic Report", date, filename, enterprise grade (large)
   - Executive Summary: Score, grade, total sessions, protocols detected, critical findings count
   - Session Details Table: All sessions with TLS version, cipher, PFS, score, severity
   - Vulnerability Findings: Each vulnerability with severity badge, title, description, remediation
   - Certificate Analysis: Table of all certificates with expiry, key size, signature algorithm
   - NIST Compliance Checklist: Pass/fail/warn grid
   - Remediation Recommendations: Configuration snippets for Postfix/Dovecot
3. Uses dark blue (#0F172A) and navy (#1E3A8A) color scheme
4. Uses Segoe UI font (with Helvetica fallback)
5. Includes page numbers and headers
6. Returns PDF as bytes (for FastAPI StreamingResponse)
```

---

## How to Use These Prompts
1. Open a NEW Gemini Flash 3.8 chat.
2. Upload/paste the relevant context files (prd.md, memory.md, etc.) into the chat first.
3. Then paste the prompt.
4. Let it generate all the code.
5. Copy the code into your project folder structure.
6. Repeat for each prompt (backend, frontend, PCAPs, PDF).
