"use client";

import { useState } from "react";
import { ComplianceCheck, Session } from "@/lib/types";
import { FileCheck, CheckCircle2, XCircle, AlertCircle, Award } from "lucide-react";

interface StandardsViewProps {
  compliance: ComplianceCheck[];
  sessions: Session[];
}

export function StandardsView({ compliance, sessions }: StandardsViewProps) {
  const [filter, setFilter] = useState<"ALL" | "FAIL" | "PASS">("ALL");

  const passCount = compliance.filter((c) => c.status === "pass").length;
  const failCount = compliance.filter((c) => c.status === "fail").length;
  const passRate = compliance.length > 0 ? Math.round((passCount / compliance.length) * 100) : 0;

  const filtered = compliance.filter((c) => {
    if (filter === "PASS") return c.status === "pass";
    if (filter === "FAIL") return c.status === "fail";
    return true;
  });

  return (
    <div className="p-4 lg:p-6 space-y-4 font-mono max-w-[1500px] mx-auto w-full">
      {/* Header and Compliance Scorecard */}
      <div className="p-4 border border-tactical-border bg-tactical-surface space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-phosphor-cyan" />
              STATUTORY STANDARDS &amp; COMPLIANCE AUDIT MATRIX
            </h2>
            <p className="text-xs text-tactical-dim mt-0.5">
              Automated verification against NIST SP 800-52r2, RFC 8314 (Implicit TLS), and RFC 8996 across {sessions.length} sessions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase text-tactical-dim block">Overall Pass Rate</span>
              <span className={`text-xl font-bold tabular-nums ${passRate >= 80 ? "text-phosphor-green" : "text-phosphor-hazard"}`}>
                {passRate}% COMPLIANT
              </span>
            </div>
            <div className="w-10 h-10 border border-tactical-border bg-black/50 flex items-center justify-center">
              <Award className={`w-5 h-5 ${passRate >= 80 ? "text-phosphor-green" : "text-phosphor-hazard"}`} />
            </div>
          </div>
        </div>

        {/* Filters and Counters */}
        <div className="flex items-center justify-between pt-2 border-t border-tactical-border/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-tactical-dim">AUDIT STATUS:</span>
            <span className="text-phosphor-green font-bold tabular-nums">{passCount} PASS</span>
            <span>•</span>
            <span className="text-phosphor-hazard font-bold tabular-nums">{failCount} NON-COMPLIANT</span>
          </div>

          <div className="flex items-center gap-1">
            {(["ALL", "FAIL", "PASS"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                  filter === status
                    ? status === "FAIL"
                      ? "border-phosphor-hazard bg-phosphor-hazard/20 text-phosphor-hazard"
                      : "border-phosphor-cyan bg-phosphor-cyan/20 text-white"
                    : "border-tactical-border bg-tactical-bg text-tactical-dim hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Rules Table */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isPass = item.status === "pass";
          const isWarn = item.status === "warn";
          return (
            <div
              key={item.id}
              className={`p-4 border transition-all ${
                isPass
                  ? "border-tactical-border bg-tactical-surface"
                  : "border-phosphor-hazard/60 bg-tactical-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  {isPass ? (
                    <CheckCircle2 className="w-4 h-4 text-phosphor-green flex-shrink-0" />
                  ) : isWarn ? (
                    <AlertCircle className="w-4 h-4 text-phosphor-amber flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-phosphor-hazard flex-shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {item.standard} {item.section}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 border border-tactical-border bg-black/40 text-tactical-dim font-bold">
                        {item.id}
                      </span>
                    </div>
                    <p className="text-xs text-tactical-text mt-0.5">{item.requirement}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 border text-xs font-bold uppercase ${
                    isPass
                      ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                      : isWarn
                      ? "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                      : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-tactical-border/60 text-xs text-tactical-dim flex items-center justify-between">
                <div>
                  OBSERVED EVIDENCE: <strong className="text-white">{item.details}</strong>
                </div>
                <div className="text-[10px] text-tactical-muted">
                  STATUTORY FEDERAL MANDATE
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
