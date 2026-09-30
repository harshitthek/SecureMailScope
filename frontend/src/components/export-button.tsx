"use client";

import { FileText, FileCode } from "lucide-react";
import { getReportUrl } from "@/lib/api";

interface ExportButtonsProps {
  analysisId: string;
}

export function ExportButtons({ analysisId }: ExportButtonsProps) {
  const handleExport = (format: "pdf" | "json") => {
    const url = getReportUrl(analysisId, format);
    window.open(url, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport("json")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium transition-colors"
      >
        <FileCode className="w-3.5 h-3.5 text-blue-400" />
        <span>Export JSON</span>
      </button>

      <button
        onClick={() => handleExport("pdf")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Export PDF Report</span>
      </button>
    </div>
  );
}
