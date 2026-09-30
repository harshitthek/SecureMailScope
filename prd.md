# SecureMailScope — Product Requirements Document (PRD)

## Meta
- **Project:** SecureMailScope
- **PS ID:** SIH26159
- **Agency:** National Technical Research Organisation (NTRO)
- **Theme:** Blockchain & Cybersecurity
- **Sprint Goal:** Working prototype with demo video in ≤48 hours
- **Date:** 2026-09-30

---

## 1. Product Vision (One-Liner)
A passive network forensic tool that ingests raw PCAP files, reconstructs email protocol sessions (SMTP/IMAP/POP3), dissects TLS handshakes, audits cryptographic posture against NIST/RFC standards, fingerprints clients via JA3, flags anomalies using ML, and outputs an interactive security dashboard + exportable forensic reports.

---

## 2. Users & Personas

| Persona | Role | Primary Need |
|---------|------|-------------|
| **SOC Analyst** | Security Operations Center operator | Upload PCAP → get prioritized vulnerability list in <30 seconds |
| **Digital Forensics Investigator** | Post-incident response | Reconstruct email sessions, extract certificates, verify chain of custody |
| **Enterprise IT Admin** | Mail server administrator | Identify misconfigured mail servers and get remediation config snippets |
| **NTRO Evaluator** | SIH Judge | See all PS deliverables working end-to-end in a 3-minute demo |

---

## 3. Core Feature Requirements (MoSCoW)

### MUST Have (MVP — Prototype Video Scope)
1. **PCAP File Upload:** Drag-and-drop `.pcap` / `.pcapng` file upload via web UI.
2. **Protocol Auto-Detection:** Automatically identify SMTP (25, 587, 465), IMAP (143, 993), POP3 (110, 995) sessions from the capture.
3. **TCP Stream Reassembly:** Reconstruct complete TCP communication streams from raw packets.
4. **STARTTLS Detection:** Detect plaintext-to-TLS upgrade transitions; flag sessions that never upgrade (cleartext fallback).
5. **TLS Handshake Parsing:** Extract from Client Hello & Server Hello:
   - Negotiated TLS version
   - Selected cipher suite
   - Key exchange mechanism (static RSA vs ECDHE)
   - SNI (Server Name Indication)
6. **X.509 Certificate Extraction & Validation:**
   - Subject, Issuer, Validity dates (expired check)
   - Signature algorithm (flag SHA-1 / MD5)
   - Public key type & length (flag RSA < 2048)
   - Self-signed detection
7. **Cryptographic Posture Scoring:** Weighted formula producing a 0–100 score per session and an aggregate enterprise grade (A+ through F).
8. **Vulnerability Flagging:** Flag deprecated protocols (SSL 2/3, TLS 1.0/1.1), weak ciphers (RC4, 3DES, EXPORT, NULL), missing forward secrecy, CBC-mode ciphers.
9. **Interactive Dashboard:** Single-page web dashboard showing:
   - Overall enterprise posture score (large gauge/donut)
   - Session table with per-session scores and severity badges
   - Protocol version distribution (pie/bar chart)
   - Cipher suite breakdown
   - Certificate health summary
10. **Report Export:** Generate downloadable forensic report in JSON and PDF formats.

### SHOULD Have (If Time Permits)
11. **JA3 Fingerprinting:** Compute JA3 hashes from Client Hello; compare against known-good client database (Thunderbird, Outlook, Apple Mail); flag unknown fingerprints.
12. **Anomaly Detection:** Isolation Forest or simple statistical outlier detection on TLS feature vectors to flag suspicious sessions.
13. **NIST SP 800-52r2 Compliance Checklist:** Explicit pass/fail checklist mapped to standard sections.
14. **Remediation Snippets:** Auto-generate Postfix `main.cf` / Dovecot config patches that fix detected issues.

### COULD Have (Post-Hackathon)
15. **Real-time streaming PCAP analysis** (live capture mode).
16. **Certificate chain validation** against Mozilla CA bundle.
17. **JA4 fingerprinting** (server-side).
18. **SIEM/SOAR integration** (Splunk HEC, Elastic webhook).

### WON'T Have (Out of Scope)
- Active port scanning or probing of live mail servers.
- Email content decryption or reading.
- User authentication / multi-tenant SaaS features.
- Mobile native app.

---

## 4. Functional Flow

```
[User uploads .pcap file]
        │
        ▼
[Backend: Parse packets with scapy/dpkt]
        │
        ▼
[Filter TCP streams on email ports (25, 110, 143, 465, 587, 993, 995)]
        │
        ▼
[Reassemble TCP streams → detect protocol type]
        │
        ├─── Implicit TLS (465, 993, 995): Jump straight to TLS parsing
        │
        └─── STARTTLS (25, 587, 143, 110): Track plaintext phase → detect
             STARTTLS command → mark TLS transition offset
        │
        ▼
[Parse TLS Record Layer → extract Client Hello, Server Hello, Certificate]
        │
        ▼
[Extract features: TLS version, cipher, key exchange, cert metadata, JA3]
        │
        ▼
[Apply scoring formula + vulnerability rules + anomaly detection]
        │
        ▼
[Return structured JSON result to frontend]
        │
        ▼
[Frontend renders dashboard: score gauge, session table, charts, alerts]
        │
        ▼
[User clicks Export → generates PDF/JSON forensic report]
```

---

## 5. Non-Functional Requirements
- **Performance:** Process a 50MB PCAP (≈500 email sessions) in under 30 seconds.
- **File Size Limit:** Accept PCAPs up to 200MB.
- **Browser Support:** Chrome 90+, Firefox 90+, Edge 90+ (demo video only).
- **No External Network Calls:** All analysis is local/server-side. No data leaves the machine (NTRO security requirement).
- **Single Deployment:** Everything runs from `docker compose up` or `python app.py` + `npm run dev`.

---

## 6. Acceptance Criteria for Demo Video
The prototype video must demonstrate these 5 scenarios in sequence:
1. **Upload PCAP-01 (Hardened Server):** Show Grade A+, score 98/100, all green.
2. **Upload PCAP-02 (Legacy Server):** Show Grade F, score 25/100, red flags for TLS 1.0, 3DES, SHA-1, 1024-bit RSA.
3. **Upload PCAP-03 (STRIPTLS Attack):** Show CRITICAL alert, score 0/100, flashing red banner "Cleartext Credentials Detected — Active Downgrade Attack."
4. **Show Dashboard:** Demonstrate charts, session drill-down, certificate details panel.
5. **Export Report:** Click export, show generated PDF with vulnerability table and compliance checklist.

---

## 7. Tech Stack (Locked)
- **Backend:** Python 3.11, FastAPI
- **Packet Parsing:** scapy + dpkt + cryptography (for X.509)
- **AI/ML:** scikit-learn (Isolation Forest), hashlib (JA3)
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Recharts
- **PDF Generation:** reportlab (server-side)
- **Containerization:** Docker + docker-compose (optional for demo)
