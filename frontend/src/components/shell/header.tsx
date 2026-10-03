"use client";

import React, { useState, useRef, useEffect } from "react";
import { Shield, ChevronDown, Check, UploadCloud, FileText } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { EVIDENCE_CASES } from "@/lib/mock-data";
import { getReportUrl } from "@/lib/api";
import { ThemeToggle } from "./theme-toggle";
import { ExportMenu } from "./export-menu";

interface ApplicationHeaderProps {
  activeCase: EvidenceCase;
  onSelectCase: (c: EvidenceCase) => void;
  onOpenUpload: () => void;
}

export function ApplicationHeader({
  activeCase,
  onSelectCase,
  onOpenUpload,
}: ApplicationHeaderProps) {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCaseMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDirectPdfDownload = () => {
    const url = getReportUrl(activeCase.data.analysis_id, "pdf");
    window.open(url, "_blank");
  };

  const isHardened = activeCase.posture_grade === "A+" || activeCase.posture_grade === "A";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-1">
      <header className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl shadow-header p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 select-none transition-smooth">
        {/* LEFT: Identity, Title, Badges & Professional Subtitle */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
            <Shield className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="font-black text-2xl sm:text-[26px] tracking-tight text-sms-text-primary leading-tight font-sans">
                SecureMailScope
              </span>
              <span className="px-2 py-0.5 text-xs font-mono-tech font-bold rounded-md border border-sms-border-strong bg-sms-surface-secondary text-sms-text-secondary">
                SIH26159
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono-tech font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NTRO SENSOR ACTIVE
              </span>
            </div>

            <p className="text-xs sm:text-sm text-sms-text-muted font-medium mt-1 leading-snug">
              Enterprise Passive Email Cryptographic Forensics &amp; Wire Analysis (RFC 8314 / NIST SP 800-52r2)
            </p>
          </div>
        </div>

        {/* CENTER / CASE SELECTOR */}
        <div className="flex items-center gap-3">
          <div className="relative w-full lg:w-auto" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCaseMenuOpen(!caseMenuOpen)}
              className="w-full lg:w-auto h-11 px-4 rounded-xl border border-sms-border hover:border-sms-border-strong bg-sms-surface-secondary hover:bg-sms-surface-hover text-sms-text-primary text-sm flex items-center justify-between gap-3 transition-all duration-150 shadow-sm"
              aria-expanded={caseMenuOpen}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isHardened ? "bg-sms-status-green ring-2 ring-emerald-500/20" : "bg-sms-status-red ring-2 ring-red-500/20"
                  }`}
                />
                <span className="font-bold font-mono-tech tracking-tight text-sms-text-primary">
                  {activeCase.case_code}
                </span>
                <span className="text-sms-text-muted hidden sm:inline">·</span>
                <span className="text-sms-text-secondary font-medium hidden sm:inline truncate max-w-[130px]">
                  {activeCase.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono-tech font-bold px-2 py-0.5 rounded-md ${
                    isHardened
                      ? "text-sms-status-green bg-sms-status-green/10"
                      : "text-sms-status-red bg-sms-status-red/10"
                  }`}
                >
                  {activeCase.posture_score}/100 ({activeCase.posture_grade})
                </span>
                <ChevronDown className="w-4 h-4 text-sms-text-muted" strokeWidth={1.8} />
              </div>
            </button>

            {caseMenuOpen && (
              <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 mt-2 w-full lg:w-[420px] rounded-2xl border border-sms-border-strong bg-sms-surface-primary shadow-modal z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sms-text-muted border-b border-sms-border flex items-center justify-between font-mono-tech">
                  <span>Forensic Case Dossiers</span>
                  <span>4 Preset Captures</span>
                </div>
                <div className="divide-y divide-sms-border/50 mt-1">
                  {EVIDENCE_CASES.map((c) => {
                    const isSelected = c.id === activeCase.id;
                    const cIsHardened = c.posture_grade === "A+" || c.posture_grade === "A";
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCase(c);
                          setCaseMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between hover:bg-sms-surface-hover transition-all duration-150 ${
                          isSelected ? "bg-sms-surface-secondary border border-sms-border" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-tech font-bold text-sm text-sms-text-primary">
                              {c.case_code} · {c.name}
                            </span>
                            <span
                              className={`text-[11px] font-mono-tech font-bold px-1.5 py-0.5 rounded-md ${
                                cIsHardened
                                  ? "text-sms-status-green bg-sms-status-green/10"
                                  : "text-sms-status-red bg-sms-status-red/10"
                              }`}
                            >
                              {c.posture_score}/100 ({c.posture_grade})
                            </span>
                          </div>
                          <span className="text-xs text-sms-text-secondary line-clamp-1">
                            {c.description}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" strokeWidth={2} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Prominent PDF Button, Upload PCAP, Export & Theme Toggle */}
        <div className="flex items-center flex-wrap gap-2.5 justify-end">
          {/* Prominent PDF Button (Requirement 2) */}
          <button
            type="button"
            onClick={handleDirectPdfDownload}
            title="Download Forensic Audit Dossier (PDF)"
            className="h-10 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 hover:bg-red-100/90 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-semibold text-sm flex items-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4 text-red-500 dark:text-red-400" strokeWidth={2} />
            <span className="font-semibold tracking-tight">Export PDF</span>
          </button>

          {/* Export Menu for additional formats */}
          <ExportMenu analysisId={activeCase.data.analysis_id} />

          {/* Upload PCAP Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-semibold text-sm flex items-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5"
          >
            <UploadCloud className="w-4 h-4" strokeWidth={2} />
            <span>Upload PCAP</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>
    </div>
  );
}
