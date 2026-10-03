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
        className="h-10 px-3.5 rounded-xl border border-sms-border hover:border-sms-border-strong bg-sms-surface-primary hover:bg-sms-surface-hover text-sms-text-primary text-sm font-medium flex items-center gap-2 transition-all duration-150 shadow-sm hover:shadow"
        aria-expanded={open}
      >
        <Download className="w-4 h-4 text-sms-text-secondary" strokeWidth={1.8} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className="w-3.5 h-3.5 text-sms-text-muted" strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-sms-border-strong bg-sms-surface-primary shadow-modal z-50 p-1.5 text-sm animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sms-text-muted border-b border-sms-border mb-1">
            Forensic Dossiers
          </div>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-950/30 text-sms-text-primary transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <FileText className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sms-text-primary group-hover:text-red-600 dark:group-hover:text-red-400">Executive Audit (PDF)</span>
              <span className="text-[11px] text-sms-text-muted font-mono-tech">Official Forensics & Scores</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("json")}
            className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-sky-50 dark:hover:bg-sky-950/30 text-sms-text-primary transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FileJson className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sms-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400">Forensic JSON Evidence</span>
              <span className="text-[11px] text-sms-text-muted font-mono-tech">Machine-Readable Artifact</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
