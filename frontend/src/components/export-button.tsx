"use client";

import { useState } from "react";
import { FileText, FileCode2, Download } from "lucide-react";
import { getReportUrl } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";

interface ExportButtonsProps {
  analysisId: string;
  data?: AnalysisResult;
}

export function ExportButtons({ analysisId, data }: ExportButtonsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExportJson = () => {
    try {
      const payload = data || { analysis_id: analysisId };
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `securemailscope_forensic_${analysisId.slice(0, 8)}.json`;
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
    <div className="flex items-center gap-1.5 font-mono">
      <button
        onClick={handleExportJson}
        className="inline-flex items-center gap-1 h-[32px] px-2.5 border border-tactical-border bg-tactical-surface hover:border-phosphor-cyan text-tactical-text hover:text-tactical-text text-[12px] uppercase font-bold tracking-wider transition-colors"
        title="Download complete structured forensic JSON analysis"
      >
        <FileCode2 className="w-3 h-3 text-phosphor-cyan" />
        <span>[JSON]</span>
      </button>

      <button
        onClick={handleExportPdf}
        disabled={downloading}
        className="inline-flex items-center gap-1 h-[32px] px-2.5 border border-phosphor-green/40 bg-phosphor-green/15 hover:bg-phosphor-green hover:text-black text-phosphor-green text-[12px] uppercase font-bold tracking-wider transition-all disabled:opacity-50"
        title="Generate official ReportLab forensic audit PDF"
      >
        {downloading ? (
          <Download className="w-3 h-3 animate-bounce" />
        ) : (
          <FileText className="w-3 h-3" />
        )}
        <span>[AUDIT PDF]</span>
      </button>
    </div>
  );
}
