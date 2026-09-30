"use client";

import { EvidenceCase } from "@/lib/types";
import { QuickFilter } from "@/hooks/use-workstation";

interface CaseSelectorProps {
  cases: EvidenceCase[];
  activeCaseId: string;
  quickFilter: QuickFilter;
  onSelectCase: (id: string) => void;
}

export function CaseSelector({ cases, activeCaseId, quickFilter, onSelectCase }: CaseSelectorProps) {
  const filteredCases = cases.filter((c) => {
    if (quickFilter === "CRITICAL") return c.severity === "critical";
    if (quickFilter === "HARDENED") return c.severity === "secure" || c.posture_grade.startsWith("A");
    return true;
  });

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-tactical-dim pb-1 border-b border-tactical-border/60">
        <span>Active Evidence Queue ({filteredCases.length})</span>
        <span>PCAP DOSSIERS</span>
      </div>

      <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
        {filteredCases.map((c) => {
          const isActive = c.id === activeCaseId;
          const isCritical = c.severity === "critical";

          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className={`w-full text-left p-2.5 border transition-all relative flex flex-col gap-1 ${
                isActive
                  ? "border-phosphor-cyan bg-tactical-elevated text-white"
                  : "border-tactical-border bg-tactical-surface text-tactical-dim hover:border-tactical-highlight hover:text-tactical-text"
              }`}
            >
              {/* Left active indicator line */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-phosphor-cyan" />
              )}

              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-[11px] text-tactical-text truncate">
                  {c.label}
                </span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 font-bold border ${
                    isCritical
                      ? "border-phosphor-hazard/60 text-phosphor-hazard bg-phosphor-hazard/10"
                      : "border-phosphor-green/60 text-phosphor-green bg-phosphor-green/10"
                  }`}
                >
                  {c.posture_grade} ({c.posture_score})
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-tactical-dim">
                <span className="truncate max-w-[130px]">{c.target_host}</span>
                <span className="tabular-nums">{c.packet_count} pkts • {c.stream_count} fl</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
