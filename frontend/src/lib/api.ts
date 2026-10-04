import { AnalysisResult } from "./types";
import { MOCK_RESULT } from "./mock-data";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadPcap(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.analysis_id;
}

export async function getAnalysis(id: string, signal?: AbortSignal): Promise<AnalysisResult> {
  if (id === "mock-001") {
    return MOCK_RESULT;
  }
  const res = await fetch(`${API_BASE}/api/analysis/${id}`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch analysis (${res.status})`);
  }
  return res.json();
}

export function getReportUrl(id: string, format: "pdf" | "json" | "html"): string {
  return `${API_BASE}/api/report/${id}/${format}`;
}

export function getRemediationUrl(id: string, format: "ansible" | "suricata" | "snort" | "summary"): string {
  return `${API_BASE}/api/remediation/${encodeURIComponent(id)}/${format}`;
}

export function getCertificateUrl(id: string, sessionId: number, format: "pem" | "der"): string {
  return `${API_BASE}/api/certificate/${id}/${sessionId}/${format}`;
}

export async function getTapStatus() {
  const res = await fetch(`${API_BASE}/api/tap/status`);
  if (!res.ok) throw new Error("Failed to fetch TAP status");
  return res.json();
}

export async function startTapCapture(iface?: string) {
  const res = await fetch(`${API_BASE}/api/tap/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interface: iface }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to start TAP" }));
    throw new Error(err.detail || "Failed to start TAP");
  }
  return res.json();
}

export async function stopTapCapture() {
  const res = await fetch(`${API_BASE}/api/tap/stop`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to stop TAP");
  return res.json();
}

export async function startTapReplay(pcapName: string = "02_striptls_mitm_attack.pcap", speedPps: number = 8.0) {
  const res = await fetch(`${API_BASE}/api/tap/start-replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pcap_name: pcapName, speed_pps: speedPps }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to start replay" }));
    throw new Error(err.detail || "Failed to start replay");
  }
  return res.json();
}

export async function snapshotTapBuffer(label: string = "Live Wire Capture") {
  const res = await fetch(`${API_BASE}/api/tap/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Snapshot failed" }));
    throw new Error(err.detail || "Snapshot failed");
  }
  return res.json();
}

export async function getSiemStatus() {
  const res = await fetch(`${API_BASE}/api/siem/status`);
  if (!res.ok) throw new Error("Failed to fetch SIEM status");
  return res.json();
}

export async function getSiemHistory() {
  const res = await fetch(`${API_BASE}/api/siem/history`);
  if (!res.ok) throw new Error("Failed to fetch SIEM history");
  return res.json();
}

export async function sendSiemTestAlert(payload: { title?: string; severity?: string; mitre_attack_id?: string; description?: string }) {
  const res = await fetch(`${API_BASE}/api/siem/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to send SIEM test alert" }));
    throw new Error(err.detail || "Failed to send SIEM test alert");
  }
  return res.json();
}



