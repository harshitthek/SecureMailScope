"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, ChevronRight, ChevronLeft } from "lucide-react";
import { Vulnerability } from "@/lib/types";

interface AlertBannerProps {
  vulnerabilities: Vulnerability[];
}

export function AlertBanner({ vulnerabilities }: AlertBannerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical");

  if (criticalVulns.length === 0) {
    return null;
  }

  const current = criticalVulns[selectedIndex] || criticalVulns[0];

  return (
    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 shadow-danger-glow overflow-hidden">
      {/* Left decorative warning bar */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-rose-500" />

      <div className="flex items-start gap-3 pl-2">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 mt-0.5 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/25 border border-rose-500/50 text-rose-200">
              PRIORITY 1 THREAT ({selectedIndex + 1} OF {criticalVulns.length})
            </span>
            {current.nist_reference && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/40 border border-rose-500/30 text-rose-300">
                {current.nist_reference}
              </span>
            )}
            <span className="text-[11px] font-mono text-rose-400/90">
              Impacted Streams: {current.affected_sessions.map((s) => `#${s}`).join(", ")}
            </span>
          </div>
          <h4 className="text-sm font-bold text-rose-100 tracking-tight mt-1">
            {current.title}
          </h4>
          <p className="mt-0.5 text-xs text-rose-200/80 leading-relaxed max-w-3xl font-sans">
            {current.description}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 pl-2 md:pl-0 flex items-center gap-2 self-end md:self-center">
        {criticalVulns.length > 1 && (
          <div className="flex items-center gap-1 bg-rose-900/30 border border-rose-500/30 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : criticalVulns.length - 1))}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-300 hover:text-white transition-colors"
              title="Previous Alert"
              aria-label="Previous Critical Alert"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[10px] text-rose-300 font-bold tabular-nums">
              {selectedIndex + 1}/{criticalVulns.length}
            </span>
            <button
              onClick={() => setSelectedIndex((prev) => (prev < criticalVulns.length - 1 ? prev + 1 : 0))}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-300 hover:text-white transition-colors"
              title="Next Alert"
              aria-label="Next Critical Alert"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-900/40 text-rose-200 text-[11px] font-mono font-medium shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Remediation Required</span>
        </div>
      </div>
    </div>
  );
}
