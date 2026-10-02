# SecureMailScope — Low-Fidelity Visual Wireframes & Composition Specs

Target Desktop Resolution: **1440 × 900 px**
Visual Baseline: Source of Truth from `DESIGN_AUDIT.md` (Neutral graphite `#07090C`, `#0D1117`, `#111720`, cyan `#22D3EE` selection rail, off-white text, semantic red/green/amber).

---

## Screen 1: Case Overview (Storytelling Canvas)

### Above-The-Fold Budget (1440 × 900)
- **Top Application Chrome**: ~52px (Fixed)
- **Case Context Strip**: ~34px
- **Hero Region (3 Asymmetric Zones)**: ~220px
- **Primary Forensic Finding (Protocol Divergence)**: ~240px
- **Reconstructed Flows Ledger (Top 2 records visible)**: ~200px
- **Total Height**: ~746px $\le 900\text{px}$ (Zero scroll required to grasp what failed).

### Visual Layout Diagram
```text
+----------------------------------------------------------------------------------------------------+ [52px]
| NTRO // SECUREMAILSCOPE | SIH26159 | PASSIVE PCAP        [OVERVIEW] [FLOWS] [FINDINGS] [DISSECTOR] |
| Active Case: CASE 04 (ENTERPRISE_MIXED) · 847 PKTS · 4 FLOWS            [UPLOAD PCAP] [EXPORT PDF] |
+----------------------------------------------------------------------------------------------------+
| CASE 04 · enterprise_mail_capture.pcap · 847 packets · 4 reconstructed flows   SENSOR: TAP-01 LIVE | [34px]
+----------------------------------------------------------------------------------------------------+ [220px]
| ZONE A: POSTURE (35%)          | ZONE B: INTERPRETATION (40%)           | ZONE C: FACTS (25%)      |
|                                |                                        |                          |
| 42 /100        GRADE F         | CRITICAL POSTURE DEGRADATION           | CRITICAL FINDINGS    02  |
|                                | 4 reconstructed email flows analyzed.  | HIGH-RISK FINDINGS   02  |
| 0 FAIL ───●────── 80 NIST ──100| 2 flows fail cryptographic baseline.   | EXPIRED CERTIFICATE  01  |
|          42 CURRENT ↑          | DEGRADED FLOWS   SCORE DEFICIT         | RECONSTRUCTED FLOWS  04  |
|                                | 2 / 4            -58 pts               | (Aligned, no cards)      |
+----------------------------------------------------------------------------------------------------+ [240px]
| PRIMARY FORENSIC FINDING                                                                           |
|                                                                                                    |
| STARTTLS DOWNGRADE DETECTED      | EXPECTED ON THE WIRE                                            |
| FLOW 03 · SMTP :587              | EHLO → STARTTLS → TLS HANDSHAKE → ENCRYPTED DATA (Green)        |
| 192.168.1.102:49300 → 10.0.0.15  |                                                                 |
| TLS upgrade not observed before  | OBSERVED ON THE WIRE                                            |
| cleartext authentication.        | EHLO → STARTTLS BYPASSED ✕ → PLAINTEXT AUTH (Red / Underline)  |
|                                  |                                                                 |
| [ INSPECT FLOW 03 → ]            | WIRE EVIDENCE: OFFSET 0x00000000 · ZERO TLS RECORD (0x16 0x03)  |
+----------------------------------------------------------------------------------------------------+ [220px]
| RECONSTRUCTED EMAIL FLOWS (Forensic Ledger Records, Cyan Hover/Selected Rail)                      |
|                                                                                                    |
| 01  mail.secure-gov.in:465 .............................................................. 98 A+   |
|     SMTPS · TLS 1.3 · AES-256-GCM · ECDHE                                           [INSPECT →]   |
| ────────────────────────────────────────────────────────────────────────────────────────────────── |
| 02  legacy-mail.corp.in:25 ............................................................... 25 F    |
|     SMTP · TLS 1.0 · 3DES · RSA                                                     [INSPECT →]   |
| ────────────────────────────────────────────────────────────────────────────────────────────────── |
| 03  10.0.0.15:587 ........................................................................ 0 F     |
|     SMTP · CLEAR · NONE · NONE                                                      [INSPECT →]   |
| ────────────────────────────────────────────────────────────────────────────────────────────────── |
| 04  imap.department.gov.in:993 .......................................................... 92 A+   |
|     IMAPS · TLS 1.2 · AES-128-GCM · ECDHE                                           [INSPECT →]   |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 2: Flow Investigation Workbench (DevTools Master-Detail)

### Mental Model & Proportions
- **Left (22% width)**: Flow Navigator (Active Flow Index with status indicator and score).
- **Center (53% width)**: Protocol Timeline (Interactive state machine showing expected vs observed wire transitions).
- **Right (25% width)**: Dynamic Evidence Inspector (Contextual inspector updating on selected event: Handshake, Cert, Auth).
- **Bottom (Collapsible, ~180px)**: Raw Stream Drawer (Synchronized ASCII/Hex stream with packet offset highlights).

### Visual Layout Diagram
```text
+----------------------------------------------------------------------------------------------------+
| ← RETURN TO OVERVIEW | INVESTIGATION WORKSPACE // FLOW 03 · SMTP :587 · 10.0.0.15                  |
+----------------------+-----------------------------------------------+-----------------------------+
| FLOW INDEX (22%)     | PROTOCOL WIRE TIMELINE (53%)                  | EVIDENCE INSPECTOR (25%)    |
|                      |                                               |                             |
| F01 SMTPS:465  98 A+ | T+0.000s PKT #01  TCP CONNECT (:49300 -> :587)| EVENT: PLAINTEXT AUTH       |
|     TLS 1.3 · ECDHE  |                   TCP 3-way handshake nominal | Protocol: SMTP              |
|                      |                                               | Stream Offset: 0x00000042   |
| F02 SMTP:25    25 F  | T+0.012s PKT #04  SERVER BANNER               | Encryption: CLEARTEXT       |
|     TLS 1.0 · 3DES   |                   220 mail.compromised.in     | Credential State: EXPOSED   |
|                      |                                               |                             |
| F03 SMTP:587    0 F  | T+0.018s PKT #06  CLIENT EHLO                 | WIRE TELEMETRY              |
| ┃   STRIPTLS DOWNGR. |                   EHLO attacker.victim.com    | • Command: AUTH PLAIN       |
| (Cyan rail selected) |                                               | • Credential: user:password |
|                      | T+0.024s PKT #07  CAPABILITY OMISSION         | • Base64: dXNlcm5hbWUAcGFz  |
| F04 IMAPS:993  92 A+ |                   250-STARTTLS OMITTED [✕]    |                             |
|     TLS 1.2 · ECDHE  |                                               | STANDARDS VIOLATION         |
|                      | T+0.035s PKT #09  PLAINTEXT AUTH [SELECTED]   | • RFC 8314 Section 3        |
|                      |                   AUTH PLAIN (Credentials)   | • NIST SP 800-52r2          |
+----------------------+-----------------------------------------------+-----------------------------+
| RAW RECONSTRUCTED WIRE STREAM // ASCII & HEX VIEWER                               [ASCII] [HEX] [DECODED] |
| 00000000  32 32 30 20 6d 61 69 6c  2e 63 6f 6d 70 72 6f 6d  |220 mail.compromised.in ESMTP Postfix|
| 00000020  45 48 4c 4f 20 61 74 74  61 63 6b 65 72 0d 0a     |EHLO attacker..                      |
| 00000040  41 55 54 48 20 50 4c 41  49 4e 20 64 58 4e 6c 72  |AUTH PLAIN dXNlcm5hbWUAcGFzc3dvcmQ=  |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 3: Raw Evidence / Dissection (Deep Inspection Mode)

### Mental Model & Proportions
- High-density forensic disassembly workstation modeled after Wireshark packet bytes and Chrome DevTools source inspector.
- Dual-pane layout:
  - **Left (40% width)**: Reconstructed Packet & Stream Segment Table (Packet #, Frame Delta, Direction, Protocol Layer, Offset, Event Summary).
  - **Right (60% width)**: Synchronized Hex + ASCII Dissector with interactive byte range selection and decoded protocol struct tree.

### Visual Layout Diagram
```text
+----------------------------------------------------------------------------------------------------+
| DEEP DISSECTOR // RECONSTRUCTED PACKET & FRAME DISASSEMBLY (CASE 04)          STREAM: [F03 :587 v] |
+-------------------------------------------+--------------------------------------------------------+
| PACKET FRAME MATRIX (40%)                 | SYNCHRONIZED HEX & ASCII DISSECTOR (60%)               |
| #    TIME    DIR  PROTO  LEN  EVENT       |                                                        |
| 01   +0.000  →    TCP    74   SYN         | OFFSET   00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ASCII            |
| 02   +0.002  ←    TCP    74   SYN-ACK     | 00000000 32 32 30 20 6d 61 69 6c 2e 63 6f 6d 70 72 6f 6d  220 mail.comprom |
| 03   +0.003  →    TCP    66   ACK         | 00000010 69 73 65 64 2e 69 6e 20 45 53 4d 54 50 0d 0a 45  ised.in ESMTP..E |
| 04   +0.012  ←    SMTP   128  220 BANNER  | 00000020 48 4c 4f 20 61 74 74 61 63 6b 65 72 0d 0a 32 35  HLO attacker..25 |
| 05   +0.014  →    TCP    66   ACK         | 00000030 30 2d 50 49 50 45 4c 49 4e 49 4e 47 0d 0a 32 35  0-PIPELINING..25 |
| 06   +0.018  →    SMTP   84   EHLO        | 00000040 41 55 54 48 20 50 4c 41 49 4e 20 64 58 4e 6c 72  AUTH PLAIN dXNlr |
| 07   +0.024  ←    SMTP   190  250 PIPELINE| 00000050 6e 61 6d 65 41 63 47 46 7a 63 33 64 76 63 6d 51  nameAcGFzc3dvcmQ |
| 08   +0.028  →    TCP    66   ACK         |                                                        |
| 09   +0.035  →    SMTP   112  AUTH PLAIN  | DISSECTED PROTOCOL STRUCT                              |
|                                           | ▾ Transmission Control Protocol, Src: 49300, Dst: 587  |
| (Clicking row locks dissector to offset)  | ▾ Simple Mail Transfer Protocol                        |
|                                           |   ▸ Command: AUTH PLAIN (Length: 38 bytes)             |
|                                           |   ▸ Parameter: dXNlcm5hbWUAcGFzc3dvcmQ= (Cleartext)    |
|                                           |   ▸ Decoded: username\x00password [VULNERABILITY]      |
+-------------------------------------------+--------------------------------------------------------+
```
