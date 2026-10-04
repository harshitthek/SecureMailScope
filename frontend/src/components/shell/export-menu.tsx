"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileJson, FileText, FileCode, ShieldAlert, Terminal } from "lucide-react";
import { getReportUrl, getRemediationUrl } from "@/lib/api";

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

  const handleDownload = (format: "json" | "pdf" | "html") => {
    const url = getReportUrl(analysisId, format);
    window.open(url, "_blank");
    setOpen(false);
  };

  const handleRemediation = (format: "ansible" | "suricata" | "snort") => {
    const url = getRemediationUrl(analysisId, format);
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
        <div className="absolute right-0 mt-2 w-72 rounded-[10px] border border-[#1c1d22] bg-[#040406] z-50 p-1.5 text-xs font-mono-tech shadow-xl">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#cc9166] border-b border-[#1c1d22] mb-1">
            Forensic Dossiers
          </div>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center gap-2.5 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#f87171]">
              <FileText className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#f87171] transition-colors text-[11px]">Executive Audit (PDF)</span>
              <span className="text-[9px] text-[#9194a1]">Official Forensics &amp; Scores</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("html")}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center gap-2.5 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#38bdf8]">
              <FileCode className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#38bdf8] transition-colors text-[11px]">Standalone HTML Dossier</span>
              <span className="text-[9px] text-[#9194a1]">Air-Gapped Interactive Report</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("json")}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center gap-2.5 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#cc9166]">
              <FileJson className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#cc9166] transition-colors text-[11px]">Forensic JSON Evidence</span>
              <span className="text-[9px] text-[#9194a1]">Machine-Readable Artifact</span>
            </div>
          </button>

          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#4ade80] border-y border-[#1c1d22] my-1">
            Remediation &amp; Countermeasures
          </div>
          <button
            type="button"
            onClick={() => handleRemediation("ansible")}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center gap-2.5 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#4ade80]">
              <Terminal className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#4ade80] transition-colors text-[11px]">Ansible Hardening Playbook</span>
              <span className="text-[9px] text-[#9194a1]">Postfix &amp; Dovecot Config</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleRemediation("suricata")}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center gap-2.5 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#fb923c]">
              <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#fb923c] transition-colors text-[11px]">Suricata IDS Rules (.rules)</span>
              <span className="text-[9px] text-[#9194a1]">STRIPTLS / Downgrade SIDs</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleRemediation("snort")}
            className="w-full text-left px-2.5 py-1.5 rounded-[6px] flex items-center gap-2.5 hover:bg-[#121317] text-[#e2e3e9] transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-[#121317] border border-[#1c1d22] flex items-center justify-center text-[#a78bfa]">
              <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white group-hover:text-[#a78bfa] transition-colors text-[11px]">Snort 3 Signatures (.rules)</span>
              <span className="text-[9px] text-[#9194a1]">Mail Protocol Threat Signatures</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
