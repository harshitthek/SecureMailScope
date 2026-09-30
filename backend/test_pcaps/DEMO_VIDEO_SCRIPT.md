# SecureMailScope — 3-Minute Demonstration Video Script

**Target Duration:** 2 minutes 45 seconds to 3 minutes  
**Format:** 1080p Screen Recording (OBS Studio / ShareX)  
**Audio:** Clear, professional, technical voiceover  
**Target Audience:** Smart India Hackathon 2026 Judges (NTRO — National Technical Research Organisation)

---

## Pre-Recording Checklist
- [x] Backend running on `http://127.0.0.1:8000` (FastAPI Swagger verified at `/docs`)
- [x] Frontend running on `http://localhost:3000` (Tactical Defense Workstation)
- [x] 4 Synthetic test PCAPs ready in `backend/test_pcaps/`:
  - `hardened_tls13.pcap`
  - `striptls_attack.pcap`
  - `legacy_tls10.pcap`
  - `rogue_client.pcap`
- [x] Browser zoomed to 100% or 110% on 1920x1080 resolution.

---

## Video Timeline & Spoken Script

### 0:00 - 0:20 (20s) | Introduction & Architecture Overview
* **Visual:** Open browser on `http://localhost:3000`. Show the Tactical Header (`NTRO SECUREMAILSCOPE // SENSOR: TAP-01`), the BPF filter bar, and the 3-pane console.
* **Voiceover:**
  > "Hello everyone. This is SecureMailScope, built for Smart India Hackathon 2026 Problem Statement SIH26159 by the National Technical Research Organisation.
  > SecureMailScope is a 100% passive, zero-packet-injection network forensic analyzer for email cryptographic posture assessment. It ingests raw PCAP captures, reconstructs TCP streams for SMTP, IMAP, and POP3, dissects binary TLS records, audits certificates, fingerprints clients via JA3, and computes standards-based compliance against NIST SP 800-52r2."

---

### 0:20 - 0:55 (35s) | Scenario 1: Modern Hardened Email Relay
* **Visual:** Select `[CASE-01: HARDENED_TLS13]` or drag-and-drop `hardened_tls13.pcap`. Show the Posture Gauge animate to 100 (Grade A+, green ring). Expand the Stream Matrix.
* **Voiceover:**
  > "First, we ingest a hardened defense email relay capture. In just 13 milliseconds, the engine reconstructs the stream on port 465.
  > As you can see, the enterprise posture score is 100 with an A+ grade. The session negotiates TLS 1.3 with AES-256-GCM and ephemeral key exchange for Perfect Forward Secrecy. 
  > The JA3 client fingerprint is automatically matched against our known database as Mozilla Thunderbird. All 12 NIST SP 800-52r2 and RFC 8314 controls pass with zero vulnerabilities."

---

### 0:55 - 1:35 (40s) | Scenario 2: Active STRIPTLS Downgrade Attack
* **Visual:** Select `[CASE-02: STRIPTLS_MITM]` or upload `striptls_attack.pcap`. Instantly show the Hazard Red Alert Banner flashing: `CRITICAL // ACTIVE DOWNGRADE ATTACK DETECTED`. Posture drops to 0 (Grade F). Switch Dissector to Mode B (Raw Stream Dump).
* **Voiceover:**
  > "Now, we examine an active adversary scenario: an in-band STRIPTLS downgrade attack on SMTP port 587.
  > Notice the immediate hazard alert lock. The MitM interceptor stripped the STARTTLS capability from the server greeting. The unsuspecting client fell back to cleartext, sending plaintext AUTH credentials across the wire.
  > In our dual-mode dissector Drawer, Mode B reveals the exact raw byte stream where the downgrade occurred, providing undeniable forensic proof for incident response."

---

### 1:35 - 2:05 (30s) | Scenario 3: Legacy Cryptographic Decay
* **Visual:** Select `[CASE-03: LEGACY_3DES_RSA]` or upload `legacy_tls10.pcap`. Show the multi-vulnerability ledger (TLS 1.0, 3DES, Static RSA, Expired 1024-bit Cert).
* **Voiceover:**
  > "Next, we analyze legacy infrastructure on port 25. The server negotiates deprecated TLS 1.0 with a 3DES cipher vulnerable to the Sweet32 attack, uses static RSA without forward secrecy, and presents an expired 1024-bit RSA certificate.
  > The deduction ledger shows exact mathematical penalties: minus 25 for protocol decay, minus 30 for weak cipher, and minus 25 for certificate expiration, driving the score to 0."

---

### 2:05 - 2:30 (25s) | Scenario 4: Rogue Client & JA3 Anomaly
* **Visual:** Select `[CASE-04: ENTERPRISE_MIXED]` or upload `rogue_client.pcap`. Highlight the JA3 fingerprint card showing `UNKNOWN CLIENT HASH` with an Isolation Forest anomaly flag.
* **Voiceover:**
  > "In scenario four, we demonstrate our client vetting engine. An IMAPS session on port 993 uses an unknown Client Hello configuration.
  > Our JA3 engine computes the MD5 fingerprint hash, detects that it does not match authorized email clients, and flags it as a potential unauthorized script or bot, docking posture to Grade C."

---

### 2:30 - 2:55 (25s) | PDF Forensic Report Export & Conclusion
* **Visual:** Click `EXPORT PDF AUDIT`. Open the generated 2-page ReportLab PDF showing the executive summary, session table, vulnerability findings, and NIST compliance grid.
* **Voiceover:**
  > "With a single click, analysts can export an official, cryptographically sound forensic audit report in PDF or structured JSON for SIEM integration.
  > SecureMailScope operates entirely offline, preserving sovereign defense data with sub-15ms forensic precision. Thank you."

---
*(Total Duration: 2 minutes 55 seconds)*
