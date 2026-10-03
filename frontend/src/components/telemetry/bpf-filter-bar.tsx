"use client";

import { Terminal } from "lucide-react";

interface BpfFilterBarProps {
  filter: string;
  onFilterChange: (newFilter: string) => void;
  matchCount: number;
}

const PRESETS = [
  { label: "ALL EMAIL", filter: "tcp and (port 25 or 587 or 465 or 993 or 110)" },
  { label: "SMTP:25", filter: "tcp and port 25" },
  { label: "SUBMIT:587", filter: "tcp and port 587" },
  { label: "SMTPS:465", filter: "tcp and port 465" },
  { label: "IMAPS:993", filter: "tcp and port 993" },
];

export function BpfFilterBar({ filter, onFilterChange, matchCount }: BpfFilterBarProps) {
  return (
    <div className="w-full border-b border-tactical-border bg-tactical-bg px-4 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
      {/* Input container */}
      <div className="flex items-center gap-2 flex-1 min-w-[280px]">
        <div className="flex items-center gap-1.5 text-phosphor-green font-bold flex-shrink-0">
          <Terminal className="w-3.5 h-3.5" />
          <span>BPF //</span>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full bg-tactical-surface border border-tactical-border px-2.5 py-1 text-phosphor-cyan text-xs font-mono focus-visible:outline-none focus-visible:border-phosphor-cyan"
            placeholder="tcp and (port 25 or 587 or 465 or 993 or 110)"
          />
        </div>
        <span className="text-[10px] text-tactical-dim uppercase hidden lg:inline flex-shrink-0">
          MATCHES: <strong className="text-phosphor-green tabular-nums">{matchCount}</strong> STREAMS
        </span>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[9px] uppercase tracking-wider text-tactical-dim mr-1">PRESETS:</span>
        {PRESETS.map((p) => {
          const isActive = filter === p.filter;
          return (
            <button
              key={p.label}
              onClick={() => onFilterChange(p.filter)}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold border transition-colors ${
                isActive
                  ? "border-phosphor-green bg-phosphor-green/10 text-phosphor-green"
                  : "border-tactical-border bg-tactical-surface text-tactical-dim hover:text-tactical-text hover:border-tactical-highlight"
              }`}
            >
              [{p.label}]
            </button>
          );
        })}
      </div>
    </div>
  );
}
