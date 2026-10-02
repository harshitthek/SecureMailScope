"use client";

import { useRef } from "react";
import { Upload, Binary, Network, LayoutDashboard, FileCheck, FileText, KeyRound, ShieldAlert } from "lucide-react";
import { EvidenceCase, NavView } from "@/lib/types";
import { ExportButtons } from "@/components/export-button";

interface TopHeaderProps {
  cases: EvidenceCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
  activeCase: EvidenceCase;
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  bpfFilter: string;
  onFilterChange: (newFilter: string) => void;
  matchCount: number;
  isAnalyzing: boolean;
  onFileUpload: (file: File) => void;
  onOpenUploadModal?: () => void;
}

export function TopHeader({
  cases,
  activeCaseId,
  onSelectCase,
  activeCase,
  activeView,
  onSelectView,
  isAnalyzing,
  onFileUpload,
  onOpenUploadModal,
}: TopHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { packet_count, stream_count } = activeCase;

  const navItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "OVERVIEW", label: "OVERVIEW", icon: LayoutDashboard },
    { id: "SESSIONS", label: "FLOWS", icon: Network },
    { id: "FINDINGS", label: "FINDINGS", icon: ShieldAlert },
    { id: "CERTIFICATES", label: "CERTIFICATES", icon: KeyRound },
    { id: "DISSECTOR", label: "DISSECTOR", icon: Binary },
    { id: "STANDARDS", label: "STANDARDS", icon: FileCheck },
    { id: "REPORTS", label: "REPORT", icon: FileText },
  ];

  return (
    <header className="w-full border-b border-tactical-border/80 bg-tactical-surface text-tactical-text flex-shrink-0 z-30 select-none font-mono">
      {/* 1. Authentic Passive Forensics Ribbon */}
      <div className="w-full border-b border-tactical-border/50 bg-black/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono tracking-widest text-tactical-dim uppercase gap-2">
        <div className="flex items-center gap-2">
          <span className="text-phosphor-cyan font-bold tracking-wider">SECUREMAILSCOPE</span>
          <span className="text-tactical-muted">{"//"}</span>
          <span>SIH26159</span>
          <span className="text-tactical-muted">{"//"}</span>
          <span className="text-tactical-text">PASSIVE FORENSIC ANALYSIS</span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-white font-bold">CASE {activeCase.id.toUpperCase()}</span>
          <span className="text-tactical-muted">·</span>
          <span>{activeCase.name}</span>
          <span className="text-tactical-muted">·</span>
          <span>{packet_count} PACKETS</span>
          <span className="text-tactical-muted">·</span>
          <span className="text-phosphor-cyan">{stream_count} FLOWS</span>
          <span className="text-tactical-muted">·</span>
          <span className="text-tactical-dim">PASSIVE PCAP</span>
        </div>
      </div>

      {/* 2. Control Bar: Case Switcher + Primary Navigation + Actions */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-4">
        {/* Case Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-tactical-dim font-bold hidden sm:inline">CASE:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {cases.map((c) => {
              const isSelected = c.id === activeCaseId;
              const isCrit = c.posture_score < 50;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`px-2 py-0.5 text-xs font-bold border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? "border-phosphor-cyan bg-tactical-elevated text-white shadow-[0_0_6px_rgba(0,216,246,0.15)]"
                      : "border-tactical-border/70 bg-black/30 text-tactical-dim hover:text-white hover:border-tactical-borderHighlight"
                  }`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 border ${
                      isCrit
                        ? "border-phosphor-hazard/50 text-phosphor-hazard bg-phosphor-hazard/10"
                        : "border-phosphor-green/50 text-phosphor-green bg-phosphor-green/10"
                    }`}
                  >
                    {c.posture_score}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`px-2.5 py-1 font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                  isSelected
                    ? "border-phosphor-cyan text-white bg-tactical-elevated/60"
                    : "border-transparent text-tactical-dim hover:text-white hover:bg-tactical-surfaceHover"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-phosphor-cyan" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Compact Action Area */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pcap,.pcapng,.cap"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
          />

          <button
            onClick={() => (onOpenUploadModal ? onOpenUploadModal() : fileInputRef.current?.click())}
            className="px-2.5 py-1 border border-dashed border-phosphor-cyan/60 hover:border-phosphor-cyan bg-tactical-elevated text-phosphor-cyan text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? "ANALYZING..." : "UPLOAD PCAP"}</span>
          </button>

          <ExportButtons analysisId={activeCase.data.analysis_id} data={activeCase.data} />
        </div>
      </div>
    </header>
  );
}
