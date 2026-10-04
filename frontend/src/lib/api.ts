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

export function getCertificateUrl(id: string, sessionId: number, format: "pem" | "der"): string {
  return `${API_BASE}/api/certificate/${id}/${sessionId}/${format}`;
}


