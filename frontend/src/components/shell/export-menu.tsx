"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileJson, FileText } from "lucide-react";
import { getReportUrl } from "@/lib/api";

interface ExportMenuProps {
  analysisId: string;
}

export function ExportMenu({ analysisId }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = (format: "json" | "pdf") => {
    const url = getReportUrl(analysisId, format);
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-9 px-4 rounded-full border border-[#1c1d22] hover:border-[#2e3038] bg-[#121317] hover:bg-[#1c1d22] text-[#e2e3e9] text-xs font-mono-tech font-medium flex items-center gap-2 transition-colors"
        aria-expanded={open}
      >
        <Download className="w-3.5 h-3.5 text-[#cc9166]" strokeWidth={1.8} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className="w-3 h-3 text-[#9194a1]" strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-[10px] border border-[#1c1d22] bg-[#040406] z-50 p-1.5 text-xs font-mono-tech">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#cc9166] border-b border-[#1c1d22] mb-1">
            Forensic Dossiers
          </div>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className="w-full text-left px-3 py-2.5 rounded-[8px] flex items-center gap-3 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#f87171]">
              <FileText className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#f87171] transition-colors">Executive Audit (PDF)</span>
              <span className="text-[10px] text-[#9194a1]">Official Forensics &amp; Scores</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("json")}
            className="w-full text-left px-3 py-2.5 rounded-[8px] flex items-center gap-3 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#cc9166]">
              <FileJson className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#cc9166] transition-colors">Forensic JSON Evidence</span>
              <span className="text-[10px] text-[#9194a1]">Machine-Readable Artifact</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
