"use client";

import React, { useState, useRef, useEffect } from "react";
import { Shield, ChevronDown, Check, UploadCloud } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { EVIDENCE_CASES } from "@/lib/mock-data";
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

  return (
    <header className="h-[60px] border-b border-sms-border bg-sms-surface-primary px-6 flex items-center justify-between shrink-0 select-none">
      {/* LEFT: Identity & Agency Sensor */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-btn bg-sms-surface-secondary border border-sms-border flex items-center justify-center text-sms-cyan">
            <Shield className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[16px] tracking-wide text-sms-text-primary uppercase leading-tight font-sans">
                SECUREMAILSCOPE
              </span>
              <span className="px-1.5 py-0.5 text-[11px] font-mono-tech font-medium rounded-tag border border-sms-border-strong bg-sms-surface-secondary text-sms-text-secondary leading-none">
                SIH26159
              </span>
            </div>
            <span className="text-meta font-mono-tech text-sms-text-muted uppercase tracking-wider leading-none mt-0.5">
              PASSIVE FORENSIC ANALYSIS // NTRO SENSOR
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: Active Case Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setCaseMenuOpen(!caseMenuOpen)}
          className="h-[38px] px-3.5 rounded-btn border border-sms-border hover:border-sms-border-strong bg-sms-surface-secondary hover:bg-sms-surface-hover text-sms-text-primary text-ui flex items-center gap-2.5 transition-fast"
          aria-expanded={caseMenuOpen}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              activeCase.posture_grade === "A+" || activeCase.posture_grade === "A"
                ? "bg-sms-green"
                : activeCase.posture_grade === "B" || activeCase.posture_grade === "C"
                ? "bg-sms-amber"
                : "bg-sms-red"
            }`}
          />
          <span className="font-semibold font-mono-tech text-body-s tracking-tight text-sms-text-primary">
            {activeCase.case_code} · {activeCase.name}
          </span>
          <span className="text-meta font-mono-tech text-sms-text-muted">
            ({activeCase.posture_score}/100 · {activeCase.posture_grade})
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-sms-text-muted ml-0.5" strokeWidth={1.5} />
        </button>

        {caseMenuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-[380px] rounded-btn border border-sms-border-strong bg-sms-surface-primary shadow-modal z-50 py-1.5">
            <div className="px-3.5 py-1.5 text-meta uppercase tracking-wider text-sms-text-muted border-b border-sms-border flex items-center justify-between font-mono-tech">
              <span>Select Forensic Dossier</span>
              <span>4 Preset Cases</span>
            </div>
            <div className="divide-y divide-sms-border/50">
              {EVIDENCE_CASES.map((c) => {
                const isSelected = c.id === activeCase.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectCase(c);
                      setCaseMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-sms-surface-hover transition-fast ${
                      isSelected ? "bg-sms-surface-secondary/70" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tech font-bold text-ui text-sms-text-primary">
                          {c.case_code} · {c.name}
                        </span>
                        <span
                          className={`text-meta font-mono-tech px-1.5 py-0.2 rounded-tag ${
                            c.posture_grade === "A+" || c.posture_grade === "A"
                              ? "text-sms-green bg-sms-green/10"
                              : "text-sms-red bg-sms-red/10"
                          }`}
                        >
                          {c.posture_score}/100 ({c.posture_grade})
                        </span>
                      </div>
                      <span className="text-[12px] text-sms-text-secondary line-clamp-1">
                        {c.description}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-sms-cyan shrink-0 ml-2" strokeWidth={1.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Actions & Theme */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenUpload}
          className="h-[38px] px-3.5 rounded-btn border border-sms-btnPrimary-border bg-sms-btnPrimary-bg hover:bg-sms-btnPrimary-hover text-sms-btnPrimary-text font-medium text-ui flex items-center gap-2 transition-fast shadow-sm dark:shadow-none"
        >
          <UploadCloud className="w-4 h-4" strokeWidth={1.5} />
          <span>UPLOAD PCAP</span>
        </button>

        <ExportMenu analysisId={activeCase.data.analysis_id} />

        <ThemeToggle />
      </div>
    </header>
  );
}
