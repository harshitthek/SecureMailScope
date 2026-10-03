"use client";

import { useState, useRef } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { EvidenceCase, NavView } from "@/lib/types";
import { ExportButtons } from "@/components/export-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface TopHeaderProps {
  cases: EvidenceCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
  activeCase: EvidenceCase;
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  isAnalyzing: boolean;
  onFileUpload: (file: File) => void;
  onOpenUploadModal?: () => void;
}

const NAV_ITEMS: { id: NavView; label: string }[] = [
  { id: "OVERVIEW", label: "OVERVIEW" }, { id: "SESSIONS", label: "INVESTIGATE" },
  { id: "FINDINGS", label: "FINDINGS" }, { id: "CERTIFICATES", label: "CERTS" },
  { id: "DISSECTOR", label: "DISSECTOR" }, { id: "STANDARDS", label: "STANDARDS" },
  { id: "REPORTS", label: "REPORT" },
];

export function TopHeader({
  cases, activeCaseId, onSelectCase, activeCase,
  activeView, onSelectView, isAnalyzing, onFileUpload, onOpenUploadModal,
}: TopHeaderProps) {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCritical = activeCase.posture_score < 50;

  return (
    <header className="w-full h-[60px] border-b border-tactical-border/80 bg-tactical-surface text-tactical-text px-3 lg:px-5 flex items-center justify-between flex-shrink-0 z-40 select-none font-mono min-w-0">
      {/* Left: Brand Identity & Case Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-phosphor-cyan animate-pulse" />
          <span className="text-[15px] sm:text-[16px] font-sans font-black tracking-tight text-tactical-text uppercase">
            SECUREMAILSCOPE
          </span>
          <span className="text-[11px] text-tactical-muted font-mono hidden xl:inline">
            SIH26159
          </span>
        </div>

        {/* Case Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCaseMenuOpen(!caseMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 text-[12px] sm:text-[13px] bg-tactical-surfaceHover border border-tactical-border hover:border-tactical-borderHighlight text-tactical-text transition-colors"
          >
            <span className="text-tactical-dim font-bold">CASE</span>
            <span className="font-semibold text-tactical-text">{activeCase.id.replace("CASE-", "")}</span>
            <span
              className={`text-[11px] sm:text-[12px] px-1.5 py-0.2 font-bold ${
                isCritical ? "text-phosphor-hazard bg-phosphor-hazard/10" : "text-phosphor-green bg-phosphor-green/10"
              }`}
            >
              {activeCase.posture_score}
            </span>
            <ChevronDown className="w-3 h-3 text-tactical-dim" />
          </button>

          {caseMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-72 bg-tactical-surface border border-tactical-border shadow-xl z-50 divide-y divide-tactical-border/30">
              {cases.map((c) => {
                const isSelected = c.id === activeCaseId;
                const crit = c.posture_score < 50;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      setCaseMenuOpen(false);
                    }}
                    className={`p-3 text-[14px] hover:bg-tactical-elevated cursor-pointer flex items-center justify-between ${
                      isSelected ? "border-l-2 border-phosphor-cyan bg-tactical-surfaceHover" : ""
                    }`}
                  >
                    <div>
                      <div className="text-tactical-text font-bold">{c.name}</div>
                      <div className="text-[12px] text-tactical-dim font-mono">
                        {c.packet_count} packets · {c.stream_count} flows
                      </div>
                    </div>
                    <span
                      className={`text-[14px] font-bold font-mono ${
                        crit ? "text-phosphor-hazard" : "text-phosphor-green"
                      }`}
                    >
                      {c.posture_score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Center: Linear-style View Switcher */}
      <nav className="flex items-center gap-0.5 sm:gap-1 font-sans text-[12px] sm:text-[13px] font-bold uppercase tracking-wider flex-shrink-0">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`px-1.5 sm:px-2 py-1 sm:py-1.5 transition-all border-b-2 text-[12px] sm:text-[13px] ${
              activeView === item.id
                ? "border-phosphor-cyan text-phosphor-cyan bg-tactical-elevated/60"
                : "border-transparent text-tactical-dim hover:text-tactical-text hover:bg-tactical-surfaceHover"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: Actions & Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          accept=".pcap,.pcapng,.cap"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
        />
        <button
          onClick={() => (onOpenUploadModal ? onOpenUploadModal() : fileInputRef.current?.click())}
          className="h-[32px] sm:h-[34px] px-2.5 sm:px-3 bg-phosphor-cyan/10 hover:bg-phosphor-cyan/20 border border-phosphor-cyan/60 text-phosphor-cyan text-[11px] sm:text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all flex-shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? "ANALYZING..." : "UPLOAD PCAP"}</span>
        </button>
        <ThemeToggle />
        <ExportButtons analysisId={activeCase.data.analysis_id} data={activeCase.data} />
      </div>
    </header>
  );
}
