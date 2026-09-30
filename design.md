# SecureMailScope — UI/UX Design Specification

## Purpose
This document defines the exact visual design for the prototype demo video. Follow these specs precisely — no creative interpretation. The goal is a polished, professional SOC (Security Operations Center) aesthetic that impresses NTRO judges in a 3-minute video.

---

## 1. Design Philosophy
- **SOC Terminal Aesthetic:** Dark background with high-contrast data elements. Think Splunk, Elastic SIEM, or CrowdStrike Falcon dashboards.
- **Data-Dense but Readable:** Show lots of information without clutter. Use cards with clear spacing.
- **Color-Coded Severity:** Every data point maps to a severity color. Judges should understand risk at a glance.
- **Zero Chrome:** No decorative illustrations, gradients, hero sections, or marketing copy. Pure functional data UI.

---

## 2. Color Palette

### Base Colors (Dark Theme)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0F172A` | Page background (slate-900) |
| `bg-card` | `#1E293B` | Card backgrounds (slate-800) |
| `bg-card-hover` | `#334155` | Card hover state (slate-700) |
| `border` | `#334155` | Card borders (slate-700) |
| `text-primary` | `#F8FAFC` | Primary text (slate-50) |
| `text-secondary` | `#94A3B8` | Secondary/muted text (slate-400) |
| `text-muted` | `#64748B` | Labels, captions (slate-500) |

### Severity Colors
| Severity | Hex | Tailwind | Usage |
|----------|-----|----------|-------|
| Critical | `#EF4444` | `red-500` | STRIPTLS attacks, score 0, expired certs |
| High | `#F97316` | `orange-500` | SSL 2/3, RC4, 3DES, key < 1024 |
| Medium | `#EAB308` | `yellow-500` | TLS 1.0/1.1, CBC mode, SHA-1 |
| Low | `#3B82F6` | `blue-500` | Minor config issues, TLS 1.2 non-AEAD |
| Secure | `#22C55E` | `green-500` | TLS 1.3, AEAD, PFS, valid cert |

### Grade Colors
| Grade | Background | Text |
|-------|-----------|------|
| A+ / A | `bg-green-500/20` | `text-green-400` |
| B | `bg-blue-500/20` | `text-blue-400` |
| C | `bg-yellow-500/20` | `text-yellow-400` |
| D | `bg-orange-500/20` | `text-orange-400` |
| F | `bg-red-500/20` | `text-red-400` |

---

## 3. Typography
- **Font Family:** `Inter` (via Google Fonts / Next.js built-in) or system `ui-sans-serif`.
- **Monospace (for hex values, ciphers, JA3 hashes):** `JetBrains Mono` or `ui-monospace`.

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page title | 24px | Bold (700) | 32px |
| Section header | 16px | Semibold (600) | 24px |
| Card title | 14px | Semibold (600) | 20px |
| Body text | 13px | Regular (400) | 20px |
| Table cell | 13px | Regular (400) | 18px |
| Badge text | 11px | Medium (500) | 14px |
| Caption / label | 11px | Regular (400) | 14px |
| Monospace data | 12px | Regular (400) | 18px |

---

## 4. Page Layout

### State A: Upload Screen (Initial)
```
┌─────────────────────────────────────────────────────────────────┐
│ bg-primary full-screen                                          │
│                                                                 │
│                                                                 │
│         ┌─────────────────────────────────────┐                 │
│         │  🛡️ SecureMailScope                 │                 │
│         │  AI-Assisted Cryptographic Posture   │                 │
│         │  Assessment                          │                 │
│         │                                      │                 │
│         │  ┌──────────────────────────────┐    │                 │
│         │  │                              │    │                 │
│         │  │   📁 Drag & drop .pcap file  │    │                 │
│         │  │      or click to browse      │    │                 │
│         │  │                              │    │                 │
│         │  └──────────────────────────────┘    │                 │
│         │                                      │                 │
│         │  Accepts .pcap and .pcapng files      │                 │
│         │  up to 200MB                          │                 │
│         └─────────────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
- Centered vertically and horizontally.
- Upload zone: dashed border (`border-dashed border-2 border-slate-600`), rounded-xl.
- On hover: border turns `blue-500`, subtle bg change.
- On file drop: show filename + file size, then "Analyze" button.

### State B: Dashboard (After Analysis)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER BAR (h-14, bg-card, border-b)                                    │
│  🛡️ SecureMailScope          [Upload New]  [Export PDF]  [Export JSON]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ SCORE    │  │ SESSIONS │  │ PROTOCOLS│  │ VULNS    │               │
│  │   87     │  │    12    │  │  3 types │  │  4 found │               │
│  │  Grade A │  │ analyzed │  │ detected │  │ 1 crit   │               │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘               │
│                                                                         │
│  ┌── ALERT BANNER (only if critical) ──────────────────────────────┐   │
│  │  ⚠️ CRITICAL: Cleartext credentials detected — STRIPTLS attack │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────┐  ┌────────────────────────────────┐   │
│  │  TLS Version Distribution   │  │  Cipher Suite Analysis         │   │
│  │  [Pie Chart]                │  │  [Bar Chart]                   │   │
│  └─────────────────────────────┘  └────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Session Analysis Table                                         │   │
│  │  ┌───┬────────────┬──────┬───────┬────────┬─────┬──────┬──────┐│   │
│  │  │ # │ Server     │ Proto│ TLS   │ Cipher │ PFS │Score │ Sev  ││   │
│  │  ├───┼────────────┼──────┼───────┼────────┼─────┼──────┼──────┤│   │
│  │  │ 1 │ mail.gov.in│ SMTP │ TLS1.3│ AES256 │ ✓   │ 98   │ 🟢  ││   │
│  │  │ 2 │ legacy.co  │ IMAP │ TLS1.0│ 3DES   │ ✗   │ 25   │ 🔴  ││   │
│  │  └───┴────────────┴──────┴───────┴────────┴─────┴──────┴──────┘│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────┐  ┌───────────────────────────────────┐   │
│  │  Vulnerability Findings  │  │  NIST SP 800-52r2 Compliance      │   │
│  │  • [CRIT] STRIPTLS ...   │  │  ✓ TLS 1.2+ enforced             │   │
│  │  • [HIGH] 3DES cipher... │  │  ✗ No deprecated protocols       │   │
│  │  • [MED] TLS 1.0 ...     │  │  ✓ Forward secrecy enabled       │   │
│  └──────────────────────────┘  └───────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 Score Gauge (`score-gauge.tsx`)
- **Type:** Circular donut/ring gauge.
- **Size:** 160px × 160px.
- **Center text:** Score number (e.g., "87") in 36px bold.
- **Below center:** Grade letter (e.g., "Grade A") in 14px.
- **Ring color:** Follows severity color (green for 90+, blue for 70-89, yellow for 50-69, red for <50).
- **Implementation:** SVG circle with `stroke-dasharray` and `stroke-dashoffset` animation. OR use a simple div with conic-gradient.

### 5.2 Summary Stat Cards
- **Layout:** 4 cards in a row, equal width.
- **Each card:** bg-card, rounded-lg, p-4, border border-slate-700.
- **Content:** Label (text-muted, 11px) + Value (text-primary, 24px bold) + Subtitle (text-secondary, 12px).

### 5.3 Alert Banner (`alert-banner.tsx`)
- **Condition:** Only rendered when there are CRITICAL severity findings.
- **Style:** Full-width, `bg-red-500/10`, `border border-red-500/30`, rounded-lg, p-3.
- **Icon:** ⚠️ or AlertTriangle from Lucide.
- **Text:** `text-red-400`, font-medium, 13px.
- **Animation:** Subtle pulse (`animate-pulse`) on the icon only. Not the whole banner.

### 5.4 Session Table (`session-table.tsx`)
- **Columns:** #, Server (SNI/IP), Protocol (SMTP/IMAP/POP3), TLS Version, Cipher Suite, PFS (✓/✗), Score, Severity (colored dot).
- **Rows:** Hover `bg-card-hover`. Clickable to expand session-detail.
- **Cipher column:** Render in monospace font.
- **Severity dot:** 8px circle, color-coded (green/yellow/orange/red).

### 5.5 Charts
- **Pie Chart (Protocol Distribution):** Segments for TLS 1.3, TLS 1.2, TLS 1.0, Cleartext. Use severity colors.
- **Bar Chart (Cipher Suites):** Horizontal bars. Each bar labeled with cipher name. Bar color = severity.
- **Chart background:** Transparent (inherits card bg).
- **Chart size:** ~300px height.

### 5.6 Vulnerability List (`vulnerability-list.tsx`)
- **Layout:** Vertical stack of finding cards.
- **Each finding:** severity badge (colored, uppercase, 10px) + title + description.
- **Sorted:** Critical first, then High, Medium, Low.
- **Badge colors:** Use severity color palette above.

### 5.7 Compliance Checklist (`compliance-checklist.tsx`)
- **Layout:** 2-column grid of check items.
- **Each item:** Icon (✓ green / ✗ red / ⚠ yellow) + NIST section reference + description.
- **Example items:**
  - ✓ "3.1: TLS 1.2 or higher enforced"
  - ✗ "3.2.1: Deprecated protocols (TLS 1.0) detected"
  - ✓ "3.3.1: Forward secrecy (ECDHE) supported"

### 5.8 Export Buttons (`export-button.tsx`)
- **Two buttons:** "Export PDF" (primary blue) and "Export JSON" (secondary/outline).
- **Behavior:** Trigger download via `window.open(url)` or `fetch` + `blob` + `URL.createObjectURL`.

---

## 6. Responsive Behavior
- **Not needed.** This is for a demo video recorded on a laptop/desktop screen.
- Design for 1440px wide viewport.
- Use a max-width container of 1280px, centered.

---

## 7. Animations & Transitions
- **Score gauge ring:** Animate from 0 to final score over 1.5 seconds on mount (CSS transition on `stroke-dashoffset`).
- **Cards:** `transition-colors duration-200` on hover.
- **Alert banner icon:** `animate-pulse` (Tailwind built-in).
- **Page transition:** Upload zone fades out, dashboard fades in. Use simple CSS `opacity` + `transition-opacity duration-500`.
- **NO complex animations.** No Framer Motion, no spring physics. Keep it simple and fast to implement.

---

## 8. Icons
Use **Lucide React** icons (included with shadcn/ui):
- `Shield` — Logo/branding
- `Upload` — Upload zone
- `FileSearch` — Analysis in progress
- `AlertTriangle` — Critical findings
- `CheckCircle2` — Passed compliance checks
- `XCircle` — Failed compliance checks
- `AlertCircle` — Warning compliance checks
- `Download` — Export buttons
- `Lock` — PFS enabled
- `Unlock` — PFS disabled
- `ChevronDown` — Expandable rows
