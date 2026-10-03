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
        className="h-[38px] px-3 rounded-btn border border-sms-border hover:border-sms-border-strong bg-sms-surface-primary hover:bg-sms-surface-hover text-sms-text-primary text-ui flex items-center gap-1.5 transition-fast"
        aria-expanded={open}
      >
        <Download className="w-3.5 h-3.5 text-sms-text-secondary" strokeWidth={1.5} />
        <span>EXPORT</span>
        <ChevronDown className="w-3.5 h-3.5 text-sms-text-muted" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-btn border border-sms-border-strong bg-sms-surface-primary shadow-modal z-50 py-1 text-ui">
          <div className="px-3 py-1.5 text-meta uppercase tracking-wider text-sms-text-muted border-b border-sms-border">
            Forensic Reports
          </div>
          <button
            type="button"
            onClick={() => handleDownload("json")}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-sms-surface-hover text-sms-text-primary transition-fast"
          >
            <FileJson className="w-4 h-4 text-sms-cyan" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="font-medium text-ui">Forensic JSON</span>
              <span className="text-[11px] text-sms-text-muted font-mono-tech">Structured Evidence</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-sms-surface-hover text-sms-text-primary transition-fast"
          >
            <FileText className="w-4 h-4 text-sms-amber" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="font-medium text-ui">Audit Dossier (PDF)</span>
              <span className="text-[11px] text-sms-text-muted font-mono-tech">Executive & Technical</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
