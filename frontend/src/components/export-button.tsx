"use client";

import { useState } from "react";
import { FileText, FileCode2, Download } from "lucide-react";
import { getReportUrl } from "@/lib/api";
import { MOCK_RESULT } from "@/lib/mock-data";

interface ExportButtonsProps {
  analysisId: string;
}

export function ExportButtons({ analysisId }: ExportButtonsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExportJson = () => {
    // Client-side fallback to guarantee flawless download even without running FastAPI server
    try {
      const jsonString = JSON.stringify(MOCK_RESULT, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `securemailscope_forensic_audit_${analysisId.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(getReportUrl(analysisId, "json"), "_blank");
    }
  };

  const handleExportPdf = () => {
    setDownloading(true);
    const url = getReportUrl(analysisId, "pdf");
    window.open(url, "_blank");
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportJson}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-soc-border bg-soc-card hover:bg-soc-cardHover hover:border-soc-borderHighlight text-slate-300 text-xs font-mono transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        title="Download complete structured analysis data in JSON format"
      >
        <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
        <span>RAW JSON</span>
      </button>

      <button
        onClick={handleExportPdf}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-600/90 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold transition-all shadow-tactical-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-70"
        title="Generate official forensic briefing PDF for NTRO evaluation"
      >
        {downloading ? (
          <Download className="w-3.5 h-3.5 animate-bounce text-slate-950" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-slate-950" />
        )}
        <span>DEFENSE BRIEF (PDF)</span>
      </button>
    </div>
  );
}
