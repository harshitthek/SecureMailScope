# SecureMailScope — Implementation Phases & Sprint Plan

## Constraints
- **Total Time Budget:** ~24 working hours (1 intense day)
- **Goal:** Working prototype that can record a 3-minute demo video
- **Team:** 1-2 developers + AI agents working in parallel

---

## Phase Overview

```
Phase 0          Phase 1           Phase 2           Phase 3           Phase 4
[DONE ✅]   →   [DONE ✅]     →   [DONE ✅]     →   [DONE ✅]     →   [DONE ✅]
30 min          ~1 hour           ~40 min           2-3 hours         2-3 hours
```

---

## Phase 0: Project Scaffolding (30 minutes)

### Tasks
- [x] Create monorepo folder structure as defined in `memory.md`
- [x] Initialize Python virtual environment, install dependencies from `requirements.txt`
- [x] Initialize Next.js 14 app with TypeScript, Tailwind, shadcn/ui
- [x] Install shadcn/ui components: `card`, `table`, `badge`, `button`, `alert`, `progress`
- [x] Install `recharts` and `lucide-react`
- [x] Verify both servers start: `uvicorn` on `:8000`, `next dev` on `:3000`
- [x] Create `backend/app/data/cipher_db.json` with 30+ cipher suite entries

### Exit Criteria
- `http://localhost:8000/docs` shows FastAPI Swagger UI
- `http://localhost:3000` shows Next.js default page
- Both can run simultaneously without port conflicts

---

## Phase 1: Backend Core Engine (6–8 hours)

This is the critical path. The backend must actually parse real PCAP files.

### Task 1.1: PCAP Parser & TCP Reassembly (2 hours)
- [x] `pcap_parser.py`: Read `.pcap` / `.pcapng` files using `scapy.rdpcap()` or `scapy.PcapReader()`
- [x] Filter packets by destination/source ports: `{25, 110, 143, 465, 587, 993, 995}`
- [x] Group packets into TCP streams by `(src_ip, src_port, dst_ip, dst_port)` tuple
- [x] Reassemble stream payload by sorting on TCP sequence numbers
- [x] Return list of `StreamData` objects with reassembled bytes, metadata, timestamps

### Task 1.2: STARTTLS Detection (45 minutes)
- [x] `starttls_detector.py`: Scan plaintext portion of reassembled streams
- [x] Detect server capability: regex `250[- ]STARTTLS` in server response
- [x] Detect client command: `STARTTLS\r\n`
- [x] Detect server acceptance: `220 ` response after STARTTLS
- [x] Detect the transition byte offset where TLS Record Layer begins (`0x16`)
- [x] Flag sessions where STARTTLS was advertised but never initiated (potential strip)
- [x] Flag sessions where no STARTTLS and no implicit TLS (fully cleartext — CRITICAL)

### Task 1.3: TLS Handshake Analyzer (2 hours)
- [x] `tls_analyzer.py`: Parse TLS Record Layer starting from transition offset
- [x] Parse **Client Hello** (handshake type `0x01`):
  - Protocol version (2 bytes after record header)
  - Cipher suites list (2-byte IANA codes)
  - Extensions: SNI, Supported Versions (for TLS 1.3 detection), Elliptic Curves, Point Formats
- [x] Parse **Server Hello** (handshake type `0x02`):
  - Selected protocol version
  - Selected cipher suite (2 bytes)
  - Selected extensions
- [x] Parse **Certificate** message (handshake type `0x0B`, TLS 1.2 only):
  - Extract raw DER-encoded certificate bytes
  - Pass to cert_validator.py
- [x] Parse **Server Key Exchange** (handshake type `0x0C`):
  - Identify key exchange algorithm (ECDHE params, DHE params, or absent = static RSA)
- [x] Lookup cipher suite hex code in `cipher_db.json` for human-readable name + security metadata

### Task 1.4: Certificate Validator (1 hour)
- [x] `cert_validator.py`: Accept raw DER bytes
- [x] Use `cryptography.x509.load_der_x509_certificate(der_bytes)`
- [x] Extract: Subject CN, Issuer CN, Not Before, Not After, Serial Number
- [x] Extract: Signature Algorithm OID → map to name (sha256WithRSA, sha1WithRSA, md5WithRSA)
- [x] Extract: Public Key type (RSA/EC) and key size in bits
- [x] Extract: Subject Alternative Names (SAN) extension
- [x] Checks:
  - Expired: `not_after < now` → flag HIGH
  - Not yet valid: `not_before > now` → flag MEDIUM
  - Self-signed: `subject == issuer` → flag HIGH
  - Weak hash: SHA-1 or MD5 → flag HIGH
  - Short key: RSA < 2048 → flag CRITICAL
  - Long validity: > 398 days → flag LOW

### Task 1.5: JA3 Fingerprinting (30 minutes)
- [x] `ja3_engine.py`: From parsed Client Hello, construct JA3 string:
  `{version},{cipher_list},{extension_list},{elliptic_curves},{point_formats}`
- [x] Compute MD5 hash of the JA3 string
- [x] Lookup hash in `ja3_known.json`
- [x] Return: `{ hash, known_client_name | "Unknown", is_known: bool }`

### Task 1.6: Scoring & Anomaly Detection (1 hour)
- [x] `scorer.py`: Implement formula from `memory.md` exactly
- [x] Accept session metadata → compute V_proto, V_cipher, V_pfs, V_cert, V_anomaly → return score 0-100
- [x] Compute enterprise aggregate: `mean(all_session_scores)`, clamped `[0, 100]`
- [x] Map score to grade: `90-100=A+, 80-89=A, 70-79=B, 60-69=C, 50-59=D, <50=F`
- [x] `anomaly.py`: Feature vector per session → fit Isolation Forest → flag outliers with contamination=0.1
- [x] Generate sorted vulnerability list with severity, title, description, affected sessions

### Task 1.7: API Routes (1 hour)
- [x] `routes.py`: Wire up FastAPI endpoints
- [x] `POST /api/upload`: Accept multipart file, save to temp dir, run full analysis pipeline, store result in-memory dict, return `{ analysis_id }`
- [x] `GET /api/analysis/{id}`: Return complete analysis JSON
- [x] `GET /api/report/{id}/pdf`: Generate PDF on the fly, return as `application/pdf` stream
- [x] `GET /api/report/{id}/json`: Return formatted JSON download
- [x] Add CORS middleware for `http://localhost:3000`

### Exit Criteria (Phase 1)
- [x] Upload any SMTP/TLS PCAP via Swagger UI → get back structured JSON with scores, vulns, certs
- [x] Test with at least one real-world Wireshark sample PCAP

---

## Phase 2: Frontend Dashboard (4–5 hours)

Can run in parallel with Phase 1 using hardcoded mock data.

### Task 2.1: Layout & Upload Screen (1 hour)
- [x] Dark theme layout (`bg-slate-950`, `text-slate-50`)
- [x] Header bar with logo, title, and action buttons
- [x] Centered upload zone with drag-and-drop, file validation (`.pcap` / `.pcapng`)
- [x] Loading spinner state during analysis

### Task 2.2: Dashboard — Stats & Score (1 hour)
- [x] Score gauge component (SVG ring with CSS animation)
- [x] 4 summary stat cards (Score, Sessions, Protocols, Vulnerabilities)
- [x] Alert banner (conditional, for CRITICAL findings)

### Task 2.3: Dashboard — Charts (1 hour)
- [x] Protocol distribution PieChart (Recharts)
- [x] Cipher suite BarChart (Recharts)
- [x] Color-coded by severity

### Task 2.4: Dashboard — Tables & Lists (1 hour)
- [x] Session analysis table with all columns
- [x] Expandable row showing certificate details, JA3 hash, full cipher name
- [x] Vulnerability findings list sorted by severity
- [x] NIST compliance checklist with pass/fail/warn icons

### Task 2.5: Export & Polish (30 minutes)
- [x] Export PDF and JSON buttons (trigger backend download endpoints)
- [x] Score gauge ring animation on mount
- [x] Upload → dashboard transition

### Exit Criteria (Phase 2)
- [x] Full dashboard renders with mock data
- [x] All components visually match `design.md` specifications
- [x] No layout overflow or text clipping at 1440px viewport

---

## Phase 3: Integration & Wiring (2–3 hours)

### Tasks
- [x] `api.ts`: Implement `uploadPcap()`, `getAnalysis()`, `downloadReport()` functions
- [x] `use-analysis.ts`: Hook managing state transitions (idle → uploading → analyzing → done → error)
- [x] Wire upload-zone to `POST /api/upload`
- [x] Wire dashboard to `GET /api/analysis/{id}`
- [x] Wire export buttons to `/api/report/{id}/pdf` and `/api/report/{id}/json`
- [x] Test end-to-end: upload PCAP on frontend → see real analysis results on dashboard
- [x] Fix any data shape mismatches between backend response and frontend TypeScript types

### Exit Criteria (Phase 3)
- [x] Complete end-to-end flow works: upload real PCAP → see real scores and findings on dashboard
- [x] Export PDF downloads successfully
- [x] No console errors

---

## Phase 4: Demo PCAPs & Video Recording (2–3 hours)

### Task 4.1: Generate Test PCAPs (1 hour)
- [x] Run `generate_test_pcaps.py` to create 4 synthetic PCAPs
- [x] Verify each PCAP produces expected scores when uploaded
- [x] Adjust PCAP contents or scoring weights if needed to hit target scores

### Task 4.2: Record Demo Video (1–2 hours)
- [x] Screen record at 1080p using OBS Studio or similar
- [x] Demo script written and verified (`DEMO_VIDEO_SCRIPT.md`):
  1. Show upload screen (5 seconds)
  2. Upload `hardened_tls13.pcap` → show A+ grade, all green (30 seconds)
  3. Upload `legacy_tls10.pcap` → show F grade, red flags everywhere (30 seconds)
  4. Upload `striptls_attack.pcap` → show CRITICAL banner, 0 score (30 seconds)
  5. Walk through session table, click to expand one session (30 seconds)
  6. Show charts (protocol distribution, cipher breakdown) (20 seconds)
  7. Show compliance checklist (15 seconds)
  8. Click Export PDF → show downloaded report (15 seconds)
  9. Brief architecture/tech stack slide (optional, 30 seconds)
- [x] Total video: 2.5–3 minutes
- [x] Add simple title cards between sections (can use any video editor or PowerPoint export)

### Exit Criteria (Phase 4)
- [x] 4 test PCAPs produce correct, visually distinct results
- [x] Demo video script recorded, clean, under 3 minutes
- [x] Video clearly demonstrates all MUST-have features from PRD

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| scapy PCAP parsing is too slow for large files | Use `PcapReader` (streaming) instead of `rdpcap` (loads all in memory). Or use `dpkt` for raw byte parsing. |
| TLS handshake parsing fails on edge cases | Start with the simplest case (TLS 1.2 SMTP). Get that working first. Add TLS 1.3 and IMAP/POP3 only after core works. |
| Synthetic PCAP generation is tricky | Fallback: use real Wireshark sample captures from their public wiki. Or manually capture from a test Postfix instance. |
| Frontend charts don't render | Recharts is well-documented. Fallback: replace charts with simple colored progress bars or text stats. |
| Integration data shape mismatches | Define TypeScript types FIRST (in `types.ts`), share with backend dev. Backend must match exactly. |
