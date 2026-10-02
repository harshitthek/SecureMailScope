"use client";

import { Shield, Terminal, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { ExportButtons } from "@/components/export-button";
import { useRef } from "react";

interface TopHeaderProps {
  activeCase: EvidenceCase;
  bpfFilter: string;
  onFilterChange: (newFilter: string) => void;
  matchCount: number;
  isAnalyzing: boolean;
  onFileUpload: (file: File) => void;
}

const PRESETS = [
  { label: "ALL EMAIL", filter: "tcp and (port 25 or 587 or 465 or 143 or 993 or 110 or 995)" },
  { label: "SMTP: 25/587", filter: "tcp and (port 25 or port 587)" },
  { label: "SMTPS: 465", filter: "tcp and port 465" },
  { label: "IMAP: 143/993", filter: "tcp and (port 143 or port 993)" },
  { label: "POP3: 110/995", filter: "tcp and (port 110 or port 995)" },
];

export function TopHeader({
  activeCase,
  bpfFilter,
  onFilterChange,
  matchCount,
  isAnalyzing,
  onFileUpload,
}: TopHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { packet_count, stream_count, data } = activeCase;
  const isDegraded = activeCase.posture_score < 60 || activeCase.posture_grade === "F";

  return (
    <header className="w-full border-b border-tactical-border bg-tactical-surface text-tactical-text flex-shrink-0 z-30 select-none">
      {/* 1. Classification & Sensor Ribbon */}
      <div className="w-full border-b border-tactical-border/80 bg-black/60 px-4 py-1 flex items-center justify-between text-[11px] font-mono tracking-widest text-tactical-dim uppercase">
        <div className="flex items-center gap-2">
          <span className="text-phosphor-cyan font-bold tracking-wider">SECUREMAILSCOPE</span>
          <span className="text-tactical-muted">{"//"}</span>
          <span>SIH26159</span>
          <span className="text-tactical-muted">{"//"}</span>
          <span className="text-tactical-text hidden sm:inline">PASSIVE CRYPTOGRAPHIC POSTURE ANALYZER</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-tactical-muted">SENSOR:</span>
            <span className="text-phosphor-green font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-phosphor-green animate-pulse" />
              TAP-01 (ACTIVE)
            </span>
          </div>
          <span className="text-tactical-muted">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-tactical-muted">MODE:</span>
            <span className="text-phosphor-amber font-bold">DEMO / SIMULATED CAPTURE</span>
          </div>
        </div>
      </div>

      {/* 2. Main Instrumentation & Action Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Sensor & Target Information */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 border border-phosphor-cyan/40 bg-phosphor-cyan/10 flex items-center justify-center text-phosphor-cyan flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider">
              <span className="text-white uppercase">{activeCase.name}</span>
              <span className="text-tactical-muted">{"//"}</span>
              <span className="text-tactical-dim text-[11px]">
                TARGET: <strong className="text-tactical-text font-mono">{activeCase.target_host}</strong>
              </span>
            </div>
            <div className="text-[11px] font-mono text-tactical-dim flex items-center gap-2 mt-0.5">
              <span className="tabular-nums text-tactical-text font-bold">{stream_count}</span>
              <span>STREAMS</span>
              <span className="text-tactical-muted">•</span>
              <span className="tabular-nums text-phosphor-cyan font-bold">{packet_count}</span>
              <span>WIRE PACKETS</span>
              <span className="text-tactical-muted">•</span>
              <span>DISSECTED IN <strong className="text-tactical-text tabular-nums">{data.processing_time_ms}ms</strong></span>
            </div>
          </div>
        </div>

        {/* Status Indicators & Control Actions */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {/* Engine Status */}
          <div className="border border-tactical-border bg-black/40 px-3 py-1.5 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-tactical-dim">ENGINE:</span>
            {isAnalyzing ? (
              <span className="text-phosphor-amber font-bold text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-phosphor-amber animate-pulse" />
                ANALYZING PCAP...
              </span>
            ) : (
              <span className="text-phosphor-green font-bold text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-phosphor-green" />
                READY (0.0% DROP)
              </span>
            )}
          </div>

          {/* Analysis Posture */}
          <div
            className={`border px-3 py-1.5 flex items-center gap-2 ${
              isDegraded
                ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 text-phosphor-hazard"
                : "border-phosphor-green/60 bg-phosphor-green/10 text-phosphor-green"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">POSTURE:</span>
            <span className="font-bold text-[11px] flex items-center gap-1.5">
              {isDegraded ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-phosphor-hazard inline" />
                  <span>DEGRADED (GRADE {activeCase.posture_grade})</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-phosphor-green inline" />
                  <span>COMPLIANT (GRADE {activeCase.posture_grade})</span>
                </>
              )}
            </span>
          </div>

          {/* Upload Button */}
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
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-phosphor-cyan/60 bg-phosphor-cyan/10 hover:bg-phosphor-cyan/20 active:translate-y-[1px] text-phosphor-cyan text-xs font-bold transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD PCAP</span>
          </button>

          {/* Export JSON / PDF Actions */}
          <ExportButtons analysisId={data.analysis_id || "mock-001"} data={data} />
        </div>
      </div>

      {/* 3. Tactical BPF Filter Ribbon */}
      <div className="w-full border-t border-tactical-border/70 bg-tactical-bg px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="flex items-center gap-1 text-phosphor-green font-bold flex-shrink-0 text-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>BPF &gt;&gt;</span>
          </div>
          <input
            type="text"
            value={bpfFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="flex-1 bg-tactical-surface border border-tactical-border px-2.5 py-1 text-phosphor-cyan text-xs font-mono focus:outline-none focus:border-phosphor-cyan transition-colors"
            placeholder="tcp and (port 25 or 587 or 465 or 143 or 993 or 110 or 995)"
          />
          <span className="text-[10px] text-tactical-dim uppercase hidden xl:inline flex-shrink-0">
            MATCHES: <strong className="text-phosphor-green tabular-nums font-bold">{matchCount}</strong> STREAMS
          </span>
        </div>

        {/* PRD Email Port Presets */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-tactical-dim mr-1">PRESETS:</span>
          {PRESETS.map((p) => {
            const isActive = bpfFilter === p.filter;
            return (
              <button
                key={p.label}
                onClick={() => onFilterChange(p.filter)}
                className={`px-2 py-0.5 text-[10px] uppercase font-bold border transition-colors ${
                  isActive
                    ? "border-phosphor-green bg-phosphor-green/15 text-phosphor-green"
                    : "border-tactical-border bg-tactical-surface text-tactical-dim hover:text-white hover:border-tactical-borderHighlight"
                }`}
              >
                [{p.label}]
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
