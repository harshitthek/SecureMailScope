# SecureMailScope — Frontend Build Prompt (Self-Contained)

> **Give this entire file to Gemini Flash 3.8 High as a single prompt.**
> It contains everything needed: design spec, types, mock data, component list, and constraints.

---

## Your Job

Build a Next.js 14 (App Router) single-page dashboard for "SecureMailScope" — a cybersecurity tool that analyzes email traffic PCAPs. The page has two states: **Upload** (user drops a .pcap file) and **Dashboard** (shows analysis results).

**This is a hackathon prototype.** Ship it fast, make it look professional on camera, skip everything else.

---

## Hard Rules — Read These First

1. **NO placeholder comments** like `// Add more features here` or `// TODO: implement`. Every line you write must be functional.
2. **NO lorem ipsum, sample text, or filler content.** Every string must be realistic cybersecurity terminology.
3. **NO gratuitous animations.** Only the score gauge ring gets an animation (CSS transition on stroke-dashoffset). Nothing else animates.
4. **NO loading skeletons, suspense boundaries, or error boundaries.** Use a simple spinner div during loading.
5. **NO dark mode toggle.** The app is always dark theme.
6. **NO authentication, login, or settings pages.**
7. **NO responsive design.** Design for 1440px desktop viewport only.
8. **NO custom CSS files.** Tailwind utility classes only.
9. **NO "Powered by" or "Built with" or tech stack badges in the UI.**
10. **NO hero sections, marketing copy, taglines, or decorative illustrations.**
11. **NO `console.log` statements in production code.**
12. **DO use `"use client"` directive on every component that uses React hooks or browser APIs.**
13. **DO use TypeScript strict types everywhere. No `any`.**
14. **DO keep each component file under 150 lines.**

---

## Setup Commands (run these first)

```bash
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd frontend
npx shadcn@latest init
# When prompted: Style=Default, Base Color=Slate, CSS Variables=Yes
npx shadcn@latest add card table badge button alert separator
npm install recharts lucide-react
```

---

## File Structure to Create

```
frontend/src/
├── app/
│   ├── layout.tsx              # Root layout, dark theme, Inter font
│   ├── page.tsx                # Main page: upload state ↔ dashboard state
│   └── globals.css             # Tailwind base (already from create-next-app)
├── components/
│   ├── upload-zone.tsx         # Drag-and-drop PCAP uploader
│   ├── score-gauge.tsx         # SVG circular score ring
│   ├── grade-badge.tsx         # Letter grade colored badge
│   ├── stat-card.tsx           # Single stat card (score, sessions, etc.)
│   ├── alert-banner.tsx        # Red critical alert banner
│   ├── session-table.tsx       # Main analysis table
│   ├── session-detail.tsx      # Expandable row detail panel
│   ├── protocol-chart.tsx      # PieChart of TLS version distribution
│   ├── cipher-chart.tsx        # BarChart of cipher suites
│   ├── vulnerability-list.tsx  # Sorted vulnerability findings
│   ├── compliance-checklist.tsx# NIST pass/fail grid
│   └── export-button.tsx       # PDF/JSON download buttons
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── mock-data.ts            # Hardcoded mock data (use until backend wired)
│   └── api.ts                  # Fetch wrappers
└── hooks/
    └── use-analysis.ts         # Upload + analysis state management
```

---

## Color Palette (Use these exact Tailwind classes)

### Base (Dark SOC Theme)
- Page background: `bg-slate-950` (use 950, not 900 — it's darker and more SOC-like)
- Card background: `bg-slate-900`
- Card border: `border-slate-800`
- Primary text: `text-slate-50`
- Secondary text: `text-slate-400`
- Muted text: `text-slate-500`

### Severity Colors
| Level | Background | Text | Dot |
|-------|-----------|------|-----|
| Critical | `bg-red-500/15` | `text-red-400` | `bg-red-500` |
| High | `bg-orange-500/15` | `text-orange-400` | `bg-orange-500` |
| Medium | `bg-yellow-500/15` | `text-yellow-400` | `bg-yellow-500` |
| Low | `bg-blue-500/15` | `text-blue-400` | `bg-blue-500` |
| Secure | `bg-emerald-500/15` | `text-emerald-400` | `bg-emerald-500` |

### Grade Colors
| Grade | Badge classes |
|-------|--------------|
| A+ / A | `bg-emerald-500/20 text-emerald-400` |
| B | `bg-blue-500/20 text-blue-400` |
| C | `bg-yellow-500/20 text-yellow-400` |
| D | `bg-orange-500/20 text-orange-400` |
| F | `bg-red-500/20 text-red-400` |

---

## Page Layout

### State A: Upload Screen
Centered on page. Dark background. No sidebar, no navbar.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│          Shield icon (lucide: Shield)            │
│          SecureMailScope                         │
│          Cryptographic Posture Assessment        │
│                                                 │
│     ┌─────────────────────────────────────┐     │
│     │  border-dashed border-2             │     │
│     │  border-slate-700                   │     │
│     │                                     │     │
│     │  Upload icon (lucide: Upload)       │     │
│     │  Drop .pcap file here               │     │
│     │  or click to browse                 │     │
│     │                                     │     │
│     │  .pcap and .pcapng up to 200MB      │     │
│     └─────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

On hover: border changes to `border-blue-500`, background to `bg-slate-800/50`.
After file drop: show filename + size, then an "Analyze" button.
While analyzing: show a simple spinner + "Analyzing 1,247 packets..."

### State B: Dashboard
Full-width layout, max-w-7xl centered, py-6 px-6.

```
HEADER:  Shield + "SecureMailScope"  ·····  [Upload New] [Export PDF] [Export JSON]

ROW 1 (4 cards):
  [Score: 42/100 Grade F]  [Sessions: 4]  [Protocols: 3]  [Vulnerabilities: 4]

ROW 2 (conditional alert):
  ⚠ CRITICAL: Cleartext credentials detected — possible STRIPTLS attack

ROW 3 (2 charts side by side):
  [PieChart: TLS Version Distribution]  [BarChart: Cipher Suite Analysis]

ROW 4 (full-width table):
  Session Analysis Table with all columns

ROW 5 (2 panels side by side):
  [Vulnerability Findings]  [NIST Compliance Checklist]
```

---

## Component Specs

### `score-gauge.tsx`
SVG circle, 160x160px. Ring stroke animates from 0 to score% over 1s.
- Ring color: emerald-500 if score>=80, blue-500 if >=60, yellow-500 if >=40, red-500 if <40.
- Center: score number in text-3xl font-bold. Below it: grade in text-sm.
- Implementation: Two `<circle>` elements — background ring (slate-800) and foreground ring with `stroke-dasharray` and `stroke-dashoffset`.

### `stat-card.tsx`
Props: `{ label: string, value: string | number, subtitle?: string, icon: LucideIcon }`.
Card with bg-slate-900, border-slate-800, p-5, rounded-xl. Icon top-right in slate-600.

### `session-table.tsx`
Columns: #, Server, Protocol, TLS Version, Cipher, PFS (Lock/Unlock icon), Score, Severity (colored dot).
- Cipher column in `font-mono text-xs`.
- Rows are clickable → expand to show `session-detail.tsx` inline below the row.
- Hover: `hover:bg-slate-800/50`.

### `session-detail.tsx`
Shows when a table row is clicked. Contains: certificate info card, JA3 hash, scoring breakdown, full cipher suite name.

### `protocol-chart.tsx`
Recharts `PieChart` with `Pie` + `Cell` components. Colors from the data's `color` field. Legend below the chart.

### `cipher-chart.tsx`
Recharts `BarChart` with horizontal bars. Each bar colored by severity. Label on the left, count on the right.

### `vulnerability-list.tsx`
Vertical list of cards. Each card: severity badge (uppercase, 10px, colored bg) + title (font-medium) + description (text-sm text-slate-400) + remediation (text-xs text-slate-500, prefixed with "Fix:").

### `compliance-checklist.tsx`
Grid of items, 2 columns. Each item: status icon (CheckCircle2 green / XCircle red / AlertCircle yellow) + requirement text.

### `alert-banner.tsx`
Only renders when `vulnerabilities.some(v => v.severity === "critical")`.
Full-width, `bg-red-500/10 border border-red-500/30 rounded-lg p-3`.
AlertTriangle icon with `animate-pulse`. Text in `text-red-400`.

---

## TypeScript Interfaces (`lib/types.ts`)

```typescript
export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";
export type Severity = "critical" | "high" | "medium" | "low" | "secure";
export type TLSVersion = "SSL 2.0" | "SSL 3.0" | "TLS 1.0" | "TLS 1.1" | "TLS 1.2" | "TLS 1.3" | "None (Cleartext)";

export interface AnalysisResult {
  analysis_id: string;
  filename: string;
  file_size_bytes: number;
  analyzed_at: string;
  processing_time_ms: number;
  enterprise_score: number;
  enterprise_grade: Grade;
  total_sessions: number;
  total_packets: number;
  protocols_detected: string[];
  sessions: Session[];
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];
  protocol_distribution: DistributionItem[];
  cipher_distribution: CipherDistributionItem[];
  certificate_summary: CertSummary[];
}

export interface Session {
  session_id: number;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  server_name: string;
  protocol: string;
  timestamp: string;
  is_encrypted: boolean;
  starttls_detected: boolean;
  starttls_stripped: boolean;
  tls_version: TLSVersion | null;
  cipher_suite_hex: string | null;
  cipher_suite_name: string | null;
  cipher_severity: Severity | null;
  key_exchange: string | null;
  has_forward_secrecy: boolean;
  ja3_hash: string | null;
  ja3_client_name: string | null;
  ja3_is_known: boolean;
  certificate: CertificateInfo | null;
  session_score: number;
  session_grade: Grade;
  session_severity: Severity;
  scoring_breakdown: {
    protocol_penalty: number;
    cipher_penalty: number;
    pfs_penalty: number;
    cert_penalty: number;
    anomaly_penalty: number;
    raw_score: number;
    final_score: number;
  };
}

export interface CertificateInfo {
  subject_cn: string;
  issuer_cn: string;
  serial_number: string;
  not_before: string;
  not_after: string;
  is_expired: boolean;
  is_not_yet_valid: boolean;
  is_self_signed: boolean;
  validity_days: number;
  days_remaining: number;
  signature_algorithm: string;
  signature_hash: string;
  is_weak_signature: boolean;
  public_key_type: string;
  public_key_bits: number;
  is_weak_key: boolean;
  san_entries: string[];
}

export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  affected_sessions: number[];
  cve_references: string[];
  nist_reference: string | null;
  remediation: string;
}

export interface ComplianceCheck {
  id: string;
  standard: string;
  section: string;
  requirement: string;
  status: "pass" | "fail" | "warn";
  details: string;
}

export interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface CipherDistributionItem {
  name: string;
  count: number;
  severity: Severity;
  color: string;
}

export interface CertSummary {
  server_name: string;
  subject_cn: string;
  is_expired: boolean;
  is_self_signed: boolean;
  is_weak_signature: boolean;
  is_weak_key: boolean;
  days_remaining: number;
  overall_status: Severity;
}
```

---

## Mock Data (`lib/mock-data.ts`)

Use this exact data to build the UI. Export it as `MOCK_RESULT`:

```typescript
import { AnalysisResult } from "./types";

export const MOCK_RESULT: AnalysisResult = {
  analysis_id: "mock-001",
  filename: "enterprise_mail_capture.pcap",
  file_size_bytes: 2458624,
  analyzed_at: "2026-09-30T15:00:00Z",
  processing_time_ms: 1250,
  enterprise_score: 42,
  enterprise_grade: "F",
  total_sessions: 4,
  total_packets: 847,
  protocols_detected: ["SMTP", "SMTPS", "IMAPS"],
  sessions: [
    {
      session_id: 1,
      src_ip: "192.168.1.100", src_port: 49152, dst_ip: "10.0.0.5", dst_port: 465,
      server_name: "mail.secure-gov.in", protocol: "SMTPS", timestamp: "2026-09-30T14:55:01Z",
      is_encrypted: true, starttls_detected: false, starttls_stripped: false,
      tls_version: "TLS 1.3", cipher_suite_hex: "0x1301",
      cipher_suite_name: "TLS_AES_256_GCM_SHA384", cipher_severity: "secure",
      key_exchange: "ECDHE", has_forward_secrecy: true,
      ja3_hash: "a0e9f5d64349fb13191bc781f81f42e1",
      ja3_client_name: "Mozilla Thunderbird", ja3_is_known: true,
      certificate: {
        subject_cn: "mail.secure-gov.in", issuer_cn: "Let's Encrypt Authority X3",
        serial_number: "03:A1:B2:C3:D4", not_before: "2026-06-01T00:00:00Z",
        not_after: "2026-12-01T00:00:00Z", is_expired: false, is_not_yet_valid: false,
        is_self_signed: false, validity_days: 183, days_remaining: 62,
        signature_algorithm: "sha256WithRSAEncryption", signature_hash: "SHA-256",
        is_weak_signature: false, public_key_type: "RSA", public_key_bits: 2048,
        is_weak_key: false, san_entries: ["mail.secure-gov.in", "smtp.secure-gov.in"],
      },
      session_score: 98, session_grade: "A+", session_severity: "secure",
      scoring_breakdown: { protocol_penalty: 0, cipher_penalty: 0, pfs_penalty: 0, cert_penalty: 0, anomaly_penalty: 0, raw_score: 100, final_score: 98 },
    },
    {
      session_id: 2,
      src_ip: "192.168.1.101", src_port: 49200, dst_ip: "10.0.0.10", dst_port: 25,
      server_name: "legacy-mail.corp.in", protocol: "SMTP", timestamp: "2026-09-30T14:55:12Z",
      is_encrypted: true, starttls_detected: true, starttls_stripped: false,
      tls_version: "TLS 1.0", cipher_suite_hex: "0x000A",
      cipher_suite_name: "TLS_RSA_WITH_3DES_EDE_CBC_SHA", cipher_severity: "high",
      key_exchange: "RSA", has_forward_secrecy: false,
      ja3_hash: "b38454238e55e098a73b94a08f7db061",
      ja3_client_name: null, ja3_is_known: false,
      certificate: {
        subject_cn: "legacy-mail.corp.in", issuer_cn: "legacy-mail.corp.in",
        serial_number: "01:00:00:01", not_before: "2020-01-01T00:00:00Z",
        not_after: "2025-01-01T00:00:00Z", is_expired: true, is_not_yet_valid: false,
        is_self_signed: true, validity_days: 1826, days_remaining: -637,
        signature_algorithm: "sha1WithRSAEncryption", signature_hash: "SHA-1",
        is_weak_signature: true, public_key_type: "RSA", public_key_bits: 1024,
        is_weak_key: true, san_entries: [],
      },
      session_score: 0, session_grade: "F", session_severity: "critical",
      scoring_breakdown: { protocol_penalty: -25, cipher_penalty: -30, pfs_penalty: -20, cert_penalty: -30, anomaly_penalty: -15, raw_score: -20, final_score: 0 },
    },
    {
      session_id: 3,
      src_ip: "192.168.1.102", src_port: 49300, dst_ip: "10.0.0.15", dst_port: 587,
      server_name: "10.0.0.15", protocol: "SMTP", timestamp: "2026-09-30T14:55:30Z",
      is_encrypted: false, starttls_detected: false, starttls_stripped: true,
      tls_version: null, cipher_suite_hex: null, cipher_suite_name: null, cipher_severity: null,
      key_exchange: null, has_forward_secrecy: false,
      ja3_hash: null, ja3_client_name: null, ja3_is_known: false, certificate: null,
      session_score: 0, session_grade: "F", session_severity: "critical",
      scoring_breakdown: { protocol_penalty: -40, cipher_penalty: -30, pfs_penalty: -20, cert_penalty: 0, anomaly_penalty: -15, raw_score: -5, final_score: 0 },
    },
    {
      session_id: 4,
      src_ip: "192.168.1.103", src_port: 49400, dst_ip: "10.0.0.20", dst_port: 993,
      server_name: "imap.department.gov.in", protocol: "IMAPS", timestamp: "2026-09-30T14:56:05Z",
      is_encrypted: true, starttls_detected: false, starttls_stripped: false,
      tls_version: "TLS 1.2", cipher_suite_hex: "0xC02F",
      cipher_suite_name: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256", cipher_severity: "secure",
      key_exchange: "ECDHE", has_forward_secrecy: true,
      ja3_hash: "c12f54a1b2c3d4e5f6789012abcd3456",
      ja3_client_name: "Microsoft Outlook", ja3_is_known: true,
      certificate: {
        subject_cn: "imap.department.gov.in", issuer_cn: "DigiCert Global Root G2",
        serial_number: "0A:B1:C2:D3:E4", not_before: "2026-03-15T00:00:00Z",
        not_after: "2027-03-15T00:00:00Z", is_expired: false, is_not_yet_valid: false,
        is_self_signed: false, validity_days: 365, days_remaining: 166,
        signature_algorithm: "sha256WithRSAEncryption", signature_hash: "SHA-256",
        is_weak_signature: false, public_key_type: "RSA", public_key_bits: 4096,
        is_weak_key: false, san_entries: ["imap.department.gov.in", "mail.department.gov.in"],
      },
      session_score: 92, session_grade: "A+", session_severity: "secure",
      scoring_breakdown: { protocol_penalty: 0, cipher_penalty: 0, pfs_penalty: 0, cert_penalty: 0, anomaly_penalty: 0, raw_score: 100, final_score: 92 },
    },
  ],
  vulnerabilities: [
    { id: "VULN-001", severity: "critical", title: "STRIPTLS Downgrade Attack Detected",
      description: "Session #3: cleartext SMTP on port 587 without STARTTLS negotiation. Credentials transmitted in plaintext, consistent with active STRIPTLS MitM attack.",
      affected_sessions: [3], cve_references: [], nist_reference: "NIST SP 800-52r2 §3.1",
      remediation: "Deploy MTA-STS (RFC 8461) and DANE/TLSA DNS records. Reject plaintext fallback on submission ports." },
    { id: "VULN-002", severity: "critical", title: "Expired Self-Signed Certificate (1024-bit RSA)",
      description: "Session #2: self-signed certificate expired 637 days ago, SHA-1 signature, 1024-bit RSA key vulnerable to offline factoring.",
      affected_sessions: [2], cve_references: [], nist_reference: "NIST SP 800-52r2 §3.4",
      remediation: "Replace with CA-signed certificate using SHA-256 and minimum 2048-bit RSA key." },
    { id: "VULN-003", severity: "high", title: "Deprecated TLS 1.0 with 3DES Cipher",
      description: "Session #2: TLS 1.0 with TLS_RSA_WITH_3DES_EDE_CBC_SHA. Vulnerable to BEAST (CVE-2011-3389) and Sweet32 (CVE-2016-2183) attacks.",
      affected_sessions: [2], cve_references: ["CVE-2016-2183", "CVE-2011-3389"], nist_reference: "NIST SP 800-52r2 §3.2.1",
      remediation: "Upgrade to TLS 1.2+ with AES-GCM cipher suites. Disable TLS 1.0 and 3DES." },
    { id: "VULN-004", severity: "high", title: "No Forward Secrecy (Static RSA Key Exchange)",
      description: "Session #2: static RSA key exchange. Historical sessions decryptable if server private key is compromised.",
      affected_sessions: [2], cve_references: ["CVE-2017-13099"], nist_reference: "NIST SP 800-52r2 §3.3.1",
      remediation: "Configure server to prefer ECDHE key exchange. Disable static RSA cipher suites." },
  ],
  compliance: [
    { id: "NIST-3.1", standard: "NIST SP 800-52r2", section: "§3.1", requirement: "TLS 1.2 or higher enforced", status: "fail", details: "TLS 1.0 in session #2" },
    { id: "NIST-3.2.1", standard: "NIST SP 800-52r2", section: "§3.2.1", requirement: "No deprecated protocols", status: "fail", details: "TLS 1.0 detected" },
    { id: "NIST-3.3.1", standard: "NIST SP 800-52r2", section: "§3.3.1", requirement: "Forward secrecy (ECDHE/DHE)", status: "fail", details: "Static RSA in session #2" },
    { id: "NIST-3.3.2", standard: "NIST SP 800-52r2", section: "§3.3.2", requirement: "AEAD cipher modes required", status: "fail", details: "3DES-CBC in session #2" },
    { id: "NIST-3.4", standard: "NIST SP 800-52r2", section: "§3.4", requirement: "Valid CA-signed certificates", status: "fail", details: "Self-signed expired cert" },
    { id: "NIST-3.5", standard: "NIST SP 800-52r2", section: "§3.5", requirement: "RSA keys ≥ 2048 bits", status: "fail", details: "1024-bit key in session #2" },
    { id: "RFC-8314", standard: "RFC 8314", section: "§3", requirement: "Implicit TLS preferred", status: "pass", details: "SMTPS and IMAPS detected" },
    { id: "RFC-8996", standard: "RFC 8996", section: "Full", requirement: "TLS 1.0/1.1 prohibited", status: "fail", details: "TLS 1.0 in session #2" },
  ],
  protocol_distribution: [
    { name: "TLS 1.3", value: 1, color: "#22C55E" },
    { name: "TLS 1.2", value: 1, color: "#3B82F6" },
    { name: "TLS 1.0", value: 1, color: "#F97316" },
    { name: "Cleartext", value: 1, color: "#EF4444" },
  ],
  cipher_distribution: [
    { name: "AES-256-GCM", count: 1, severity: "secure", color: "#22C55E" },
    { name: "AES-128-GCM", count: 1, severity: "secure", color: "#22C55E" },
    { name: "3DES-CBC", count: 1, severity: "high", color: "#F97316" },
    { name: "None (Cleartext)", count: 1, severity: "critical", color: "#EF4444" },
  ],
  certificate_summary: [
    { server_name: "mail.secure-gov.in", subject_cn: "mail.secure-gov.in", is_expired: false, is_self_signed: false, is_weak_signature: false, is_weak_key: false, days_remaining: 62, overall_status: "secure" },
    { server_name: "legacy-mail.corp.in", subject_cn: "legacy-mail.corp.in", is_expired: true, is_self_signed: true, is_weak_signature: true, is_weak_key: true, days_remaining: -637, overall_status: "critical" },
    { server_name: "imap.department.gov.in", subject_cn: "imap.department.gov.in", is_expired: false, is_self_signed: false, is_weak_signature: false, is_weak_key: false, days_remaining: 166, overall_status: "secure" },
  ],
};
```

---

## API Integration (`lib/api.ts`)

For now, import and return `MOCK_RESULT` directly. When backend is ready, swap to real fetch calls.

```typescript
const API_BASE = "http://localhost:8000";

export async function uploadPcap(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
  const data = await res.json();
  return data.analysis_id;
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analysis/${id}`);
  return res.json();
}

export function getReportUrl(id: string, format: "pdf" | "json"): string {
  return `${API_BASE}/api/report/${id}/${format}`;
}
```

---

## `use-analysis.ts` Hook

```typescript
type State = "idle" | "uploading" | "analyzing" | "done" | "error";

// Manages: file selection → upload → poll result → done
// For mock mode: skip upload, return MOCK_RESULT after 1.5s fake delay
```

---

## Lucide Icons to Use

`Shield`, `Upload`, `FileSearch`, `AlertTriangle`, `CheckCircle2`, `XCircle`, `AlertCircle`, `Download`, `Lock`, `Unlock`, `ChevronDown`, `ChevronUp`, `Activity`, `Server`, `ShieldCheck`, `ShieldX`

---

## What the Demo Video Will Show

The dashboard must look impressive with the mock data above. When rendered, it should show:
- A big **42** score with grade **F** in red — immediately alarming
- 4 stat cards with real numbers
- A red alert banner about STRIPTLS attack
- A pie chart showing the protocol mix (1 green slice, 1 blue, 1 orange, 1 red)
- A bar chart showing cipher distribution
- A table with 4 rows — 2 green (secure), 2 red (critical)
- 4 vulnerability cards sorted by severity
- 8 compliance items, mostly failing (red X icons)

This is what impresses NTRO judges: dense, real data, immediate visual severity communication.

---

## Final Checklist Before Submitting Code

- [ ] Does every component file have `"use client"` if it uses hooks/browser APIs?
- [ ] Are all color classes exactly as specified above (not inventing new ones)?
- [ ] Is every string realistic? No "Lorem ipsum", no "Example Corp", no "John Doe"?
- [ ] Does the score gauge SVG ring actually animate?
- [ ] Does clicking a session table row expand to show certificate details?
- [ ] Is the alert banner conditionally rendered (only when critical vulns exist)?
- [ ] Are vulnerability cards sorted: critical first, then high, medium, low?
- [ ] Is the compliance checklist showing CheckCircle2 (green) for pass and XCircle (red) for fail?
- [ ] Is the page styled with `bg-slate-950` (NOT white, NOT light theme)?
- [ ] Are there zero `console.log` statements?
- [ ] Are there zero placeholder comments?
