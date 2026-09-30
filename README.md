# SecureMailScope

Passive Network Forensic Framework for Cryptographic Security Posture Assessment of Encrypted Email Communications.

Designed for Smart India Hackathon (SIH 2026) Problem Statement **SIH26159**, sponsored by the **National Technical Research Organisation (NTRO)**, Government of India.

---

## Overview

SecureMailScope is an offline, non-intrusive forensic analysis platform that ingests raw packet captures (`.pcap`, `.pcapng`), reconstructs TCP streams for email protocols (SMTP, SMTPS, IMAP, IMAPS, POP3, POP3S), extracts cryptographic handshake parameters, evaluates certificate trust chains, flags protocol downgrades (such as STRIPTLS attacks), and computes risk scores aligned with NIST SP 800-52r2 and BSI TR-02102-2 guidelines.

The framework functions entirely out-of-band on network tap data without injecting traffic, reading email payload contents, or communicating with external verification authorities.

---

## Architectural Pipeline

The system operates across four discrete layers:

1. **Ingestion & Stream Reconstruction Layer**:
   - Parses PCAP files via `scapy` and stream assembly modules.
   - Demultiplexes client/server traffic on ports 25, 110, 143, 465, 587, 993, and 995.
   - Detects implicit TLS vs opportunistic STARTTLS negotiation transitions (`0x16 0x03` TLS record boundaries).

2. **Cryptographic Extraction Layer**:
   - Dissects TLS Client Hello and Server Hello messages using low-level binary parsers.
   - Extracts offered and negotiated cipher suites, TLS version (SSL 2.0 through TLS 1.3), Server Name Indication (SNI), Supported Groups, and EC Point Formats.
   - Evaluates Forward Secrecy mechanisms (ECDHE/DHE vs static RSA).
   - Extracts and parses X.509 DER certificates via `cryptography`, assessing key lengths, signature digests, validity periods, and self-signed attributes.

3. **AI & Anomaly Analysis Layer**:
   - Computes MD5-based JA3 client fingerprints with GREASE value filtering and correlates against a client registry.
   - Executes Isolation Forest anomaly detection on normalized session feature vectors (protocol version, cipher severity, key length, forward secrecy, validity delta, JA3 match).
   - Computes weighted session scores (0-100) and enterprise security grades (A+ to F).

4. **Forensic SOC Dashboard & Export Layer**:
   - Web interface built on Next.js 14 App Router, Tailwind CSS, and Recharts.
   - Renders posture gauges, cipher distribution charts, stream breakdown tables, and expandable handshake drawers.
   - Generates downloadable compliance reports in JSON and PDF formats via ReportLab.

---

## Directory Structure

```
SecureMailScope/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── api/
│   │   │   └── routes.py            # API routing for upload, analysis, and report generation
│   │   ├── core/
│   │   │   ├── pcap_parser.py       # PCAP ingestion and TCP stream reassembly
│   │   │   ├── starttls_detector.py # STARTTLS state machine and downgrade detector
│   │   │   ├── tls_analyzer.py      # TLS handshake parser (ClientHello, ServerHello, Cert)
│   │   │   ├── cert_validator.py    # X.509 DER certificate validation
│   │   │   ├── ja3_engine.py        # JA3 client fingerprint generation
│   │   │   ├── scorer.py            # Mathematical posture scoring formula
│   │   │   └── anomaly.py           # Isolation Forest anomaly detection
│   │   ├── reports/
│   │   │   ├── json_exporter.py     # JSON forensic report generator
│   │   │   └── pdf_exporter.py      # Multi-page ReportLab PDF report generator
│   │   └── data/
│   │       ├── cipher_db.json       # IANA cipher suite classification database
│   │       ├── ja3_known.json       # Known email client fingerprint signatures
│   │       └── nist_rules.json      # Compliance rules definition
│   ├── requirements.txt
│   └── test_pcaps/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Dark SOC layout
│   │   │   ├── page.tsx             # Primary dashboard interface
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── upload-zone.tsx      # Drag-and-drop PCAP uploader
│   │   │   ├── score-gauge.tsx      # Animated SVG circular posture gauge
│   │   │   ├── stat-card.tsx        # KPI metrics card
│   │   │   ├── alert-banner.tsx     # Critical severity alert banner
│   │   │   ├── session-table.tsx    # Reconstructed session grid
│   │   │   ├── session-detail.tsx   # Expandable handshake detail drawer
│   │   │   ├── protocol-chart.tsx   # Protocol distribution pie chart
│   │   │   ├── cipher-chart.tsx     # Cipher suite bar chart
│   │   │   ├── vulnerability-list.tsx# Prioritized findings list
│   │   │   ├── compliance-checklist.tsx # NIST SP 800-52r2 checklist
│   │   │   └── export-button.tsx    # PDF and JSON export triggers
│   │   ├── lib/
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   ├── api.ts               # API fetch client
│   │   │   └── mock-data.ts         # Offline fallback dataset
│   │   └── hooks/
│   │       └── use-analysis.ts      # Pipeline state management hook
│   ├── package.json
│   └── tsconfig.json
├── prd.md
├── memory.md
├── design.md
├── phases.md
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 20+ and npm 10+

### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API docs will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
Dashboard will be accessible at `http://localhost:3000`.

---

## Regulatory Standards Compliance Mapping

| Identifier | Standard Reference | Description | Evaluation Rule |
| :--- | :--- | :--- | :--- |
| `NIST-3.1` | NIST SP 800-52r2 §3.1 | TLS 1.2 or higher enforced across all endpoints | Fails if TLS 1.0, 1.1, SSL 2.0/3.0, or cleartext present |
| `NIST-3.2.1` | NIST SP 800-52r2 §3.2.1 | Deprecated protocols disabled | Flags deprecated protocol sessions |
| `NIST-3.3.1` | NIST SP 800-52r2 §3.3.1 | Forward Secrecy support | Requires ECDHE or DHE key exchange |
| `NIST-3.3.2` | NIST SP 800-52r2 §3.3.2 | AEAD cipher modes preferred | Requires AES-GCM or ChaCha20-Poly1305 |
| `NIST-3.4` | NIST SP 800-52r2 §3.4 | Certificate validation and trust | Flags expired, self-signed, or invalid certificates |
| `NIST-3.5` | NIST SP 800-52r2 §3.5 | Minimum public key length | Requires RSA >= 2048 bits, EC >= 256 bits |
| `NIST-3.6` | NIST SP 800-52r2 §3.6 | Secure certificate signature digests | Flags MD5 and SHA-1 signatures |
| `RFC-7465` | RFC 7465 | RC4 cipher suites prohibited | Disallows RC4 negotiation |
| `RFC-8314` | RFC 8314 §3 | Implicit TLS preferred over opportunistic STARTTLS | Encourages direct TLS on ports 465/993/995 |
| `RFC-8996` | RFC 8996 | Prohibits use of TLS 1.0 and TLS 1.1 | Flags legacy protocol versions |

---

## License

Developed under Smart India Hackathon (SIH 2026) for NTRO problem statement SIH26159.
