# SecureMailScope — Tech Stack, Dependencies & Setup Guide

## Purpose
Exact dependency versions, installation commands, and configuration for reproducible setup.

---

## 1. Backend (Python)

### Runtime
- **Python:** 3.11+

### Dependencies (`requirements.txt`)
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.20
scapy==2.6.1
dpkt==1.9.8
cryptography==44.0.0
scikit-learn==1.6.1
reportlab==4.3.1
```

### Setup Commands
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Key Library Roles
| Library | Purpose |
|---------|---------|
| `fastapi` | REST API framework, automatic OpenAPI docs |
| `uvicorn` | ASGI server to run FastAPI |
| `python-multipart` | Required for `UploadFile` in FastAPI |
| `scapy` | PCAP reading, packet parsing, TCP stream reassembly |
| `dpkt` | Low-level fast binary packet parsing (fallback/supplement to scapy) |
| `cryptography` | X.509 certificate parsing, DER decoding |
| `scikit-learn` | Isolation Forest for TLS anomaly detection |
| `reportlab` | PDF forensic report generation |

### Backend Config
- **CORS Origins:** `["http://localhost:3000"]`
- **Upload temp dir:** System temp (`tempfile.mkdtemp()`)
- **Max upload size:** 200MB (configure in FastAPI/uvicorn)
- **In-memory storage:** `dict[str, AnalysisResult]` — no database

---

## 2. Frontend (Next.js)

### Runtime
- **Node.js:** 20 LTS+
- **Package Manager:** npm or pnpm

### Setup Commands
```bash
cd frontend
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias

# Install shadcn/ui
npx shadcn@latest init
# When prompted: Style=Default, Base Color=Slate, CSS Variables=Yes

# Add shadcn components
npx shadcn@latest add card table badge button alert progress separator

# Install chart library and icons
npm install recharts lucide-react

# Run dev server
npm run dev
```

### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.x | React framework with App Router |
| `react` | 18.x | UI library |
| `typescript` | 5.x | Type safety |
| `tailwindcss` | 3.x | Utility-first CSS |
| `@shadcn/ui` | latest | Pre-built accessible components |
| `recharts` | 2.x | Charts (PieChart, BarChart) |
| `lucide-react` | latest | Icon library |

### Frontend Config
- **API Base URL:** `http://localhost:8000` (hardcoded in `lib/api.ts`)
- **Viewport target:** 1440px wide (desktop only, no responsive needed)

### Tailwind Config Overrides
In `tailwind.config.ts`, extend the theme:
```typescript
theme: {
  extend: {
    colors: {
      'soc-bg': '#0F172A',
      'soc-card': '#1E293B',
      'soc-border': '#334155',
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
  },
}
```

---

## 3. Running Both Together

### Option A: Two Terminals
```bash
# Terminal 1 — Backend
cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Option B: Docker Compose (Optional)
```yaml
# docker-compose.yml
version: "3.9"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
```

---

## 4. Environment Variables
None required for the prototype. Everything is hardcoded for speed.

---

## 5. Windows-Specific Notes
- `scapy` on Windows requires **Npcap** (not WinPcap). Install from: https://npcap.com/#download
  - During install, check "Install Npcap in WinPcap API-compatible Mode"
  - This is only needed if reading live captures. For `.pcap` file analysis, scapy works without Npcap.
- If `scapy` import fails, try: `pip install scapy[basic]`
- Python `venv` activation on PowerShell: `.venv\Scripts\Activate.ps1`
