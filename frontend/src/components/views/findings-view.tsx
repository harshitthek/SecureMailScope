"use client";

import { useState } from "react";
import { Vulnerability } from "@/lib/types";
import { ShieldAlert, ArrowRight } from "lucide-react";

interface FindingsViewProps {
  vulnerabilities: Vulnerability[];
  onOpenSessionDetail: (sessionId: number) => void;
  onNavigateToDissector: (streamId: number) => void;
}

export function FindingsView({
  vulnerabilities,
  onOpenSessionDetail,
}: FindingsViewProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const getCategory = (v: Vulnerability): string => {
    const text = `${v.title} ${v.description}`.toLowerCase();
    if (text.includes("starttls") || text.includes("cleartext auth")) return "STARTTLS";
    if (text.includes("cert") || text.includes("x.509")) return "CERTIFICATE";
    if (text.includes("cipher") || text.includes("3des")) return "CIPHER";
    if (text.includes("tls") || text.includes("ssl")) return "TLS";
    return "PROTOCOL";
  };

  const filtered = vulnerabilities.filter((v) => {
    if (severityFilter !== "ALL" && v.severity.toUpperCase() !== severityFilter) return false;
    return categoryFilter === "ALL" || getCategory(v) === categoryFilter;
  });

  return (
    <div className="p-6 lg:p-12 max-w-[1360px] mx-auto w-full select-none font-mono space-y-6">
      {/* 1. Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-tactical-border/70 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-phosphor-hazard" />
            <h2 className="text-xl font-sans font-bold text-white uppercase tracking-wider">
              CRYPTOGRAPHIC FINDINGS ({vulnerabilities.length})
            </h2>
          </div>
          <p className="text-xs text-tactical-dim mt-1">
            Prioritized forensic audit records with evidence citations and remediation guidance
          </p>
        </div>

        {/* Severity & Category Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1 border border-tactical-border/80 p-0.5 bg-black/40">
            {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${severityFilter === sev ? "bg-tactical-elevated text-white border border-phosphor-cyan" : "text-tactical-dim hover:text-white"}`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-tactical-border/80 p-0.5 bg-black/40">
            {(["ALL", "TLS", "STARTTLS", "CERTIFICATE", "CIPHER", "PROTOCOL"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${categoryFilter === cat ? "bg-tactical-elevated text-white border border-phosphor-cyan" : "text-tactical-dim hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Compact Forensic Records List (NOT GIANT CARDS) */}
      <div className="divide-y divide-tactical-border/40 text-xs">
        {filtered.length > 0 ? (
          filtered.map((v) => {
            const isCrit = v.severity === "critical";
            const isHigh = v.severity === "high";
            const firstAffectedSession = v.affected_sessions?.[0] ?? 1;

            return (
              <div
                key={v.id}
                className="py-4 hover:bg-tactical-surfaceHover/50 transition-colors border-l-2 border-transparent hover:border-phosphor-cyan pl-4 space-y-2 group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${
                        isCrit
                          ? "border-phosphor-hazard/60 text-phosphor-hazard bg-phosphor-hazard/10"
                          : isHigh
                          ? "border-phosphor-amber/60 text-phosphor-amber bg-phosphor-amber/10"
                          : "border-tactical-border text-tactical-dim"
                      }`}
                    >
                      {v.severity}
                    </span>

                    <h4 className="font-sans font-bold text-sm text-white uppercase group-hover:text-phosphor-cyan transition-colors">
                      {v.title}
                    </h4>

                    <span className="text-[10px] text-tactical-dim uppercase px-1.5 py-0.2 bg-black/40 border border-tactical-border/60">
                      FLOW #{firstAffectedSession < 10 ? `0${firstAffectedSession}` : firstAffectedSession}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenSessionDetail(firstAffectedSession)}
                    className="text-tactical-dim group-hover:text-phosphor-cyan text-[11px] font-bold uppercase inline-flex items-center gap-1 transition-colors"
                  >
                    <span>INSPECT FLOW →</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-tactical-text text-xs font-sans leading-relaxed">
                  {v.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-[11px] text-tactical-dim pt-1">
                  <div>
                    <span className="text-tactical-muted">STANDARD: </span>
                    <span className="text-tactical-text font-bold">{v.nist_reference || "NIST SP 800-52r2"}</span>
                  </div>
                  <div>
                    <span className="text-tactical-muted">REMEDIATION: </span>
                    <span className="text-tactical-text">{v.remediation}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-tactical-dim text-xs">
            No forensic findings match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
