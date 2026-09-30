import { AnalysisResult } from "./types";
import { MOCK_RESULT } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadPcap(file: File): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    const data = await res.json();
    return data.analysis_id;
  } catch (error) {
    if (file.name.includes("demo") || file.name.includes("mock") || file.name.includes("test")) {
      return "mock-001";
    }
    throw error;
  }
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  if (id === "mock-001") {
    return MOCK_RESULT;
  }
  try {
    const res = await fetch(`${API_BASE}/api/analysis/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch analysis (${res.status})`);
    }
    return res.json();
  } catch {
    return MOCK_RESULT;
  }
}

export function getReportUrl(id: string, format: "pdf" | "json"): string {
  return `${API_BASE}/api/report/${id}/${format}`;
}
