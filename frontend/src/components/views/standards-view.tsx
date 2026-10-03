"use client";

import { useState } from "react";
import { ComplianceCheck, Session } from "@/lib/types";
import { FileCheck } from "lucide-react";

interface StandardsViewProps {
  compliance: ComplianceCheck[];
  sessions: Session[];
}

export function StandardsView({ compliance, sessions }: StandardsViewProps) {
  const [filter, setFilter] = useState<"ALL" | "FAIL" | "PASS">("ALL");

  const passCount = compliance.filter((c) => c.status === "pass").length;
  const failCount = compliance.filter((c) => c.status === "fail").length;

  const filtered = compliance.filter((c) => {
    if (filter === "PASS") return c.status === "pass";
    if (filter === "FAIL") return c.status === "fail";
    return true;
  });

  return (
    <div className="px-6 py-5 lg:px-8 lg:py-6 max-w-[1360px] mx-auto w-full select-none font-mono space-y-5">
      {/* 1. Header & Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-tactical-border/70 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-phosphor-cyan" />
            <h2 className="text-[20px] sm:text-[22px] font-sans font-bold text-tactical-text uppercase tracking-wider">
              STANDARDS COMPLIANCE MATRIX
            </h2>
          </div>
          <p className="text-[13px] text-tactical-dim mt-0.5">
            Automated verification against NIST SP 800-52r2 and RFC 8314 across {sessions.length} reconstructed flows
          </p>
        </div>

        <div className="flex items-center gap-4 text-[13px] sm:text-[14px]">
          <div className="flex items-center gap-2.5">
            <span className="text-tactical-dim font-bold">AUDIT STATUS:</span>
            <span className="text-phosphor-green font-bold">{passCount} PASS</span>
            <span className="text-tactical-muted">·</span>
            <span className="text-phosphor-hazard font-bold">{failCount} FAIL</span>
          </div>

          <div className="flex items-center gap-1 border border-tactical-border/80 p-1 bg-tactical-surface">
            {(["ALL", "FAIL", "PASS"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 text-[12px] font-bold transition-colors ${
                  filter === s
                    ? "bg-tactical-elevated text-tactical-text border border-phosphor-cyan"
                    : "text-tactical-dim hover:text-tactical-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Technical Evidence Table (NO GAUGES) */}
      <div className="border border-tactical-border/70 bg-tactical-surface/50 overflow-x-auto">
        <table className="w-full text-left text-[14px] border-collapse">
          <thead>
            <tr className="border-b border-tactical-border/80 text-[12px] text-tactical-dim uppercase tracking-wider bg-tactical-surface">
              <th className="py-3 px-4 font-bold">CONTROL / CHECK</th>
              <th className="py-3 px-3 w-28 text-center font-bold">STATUS</th>
              <th className="py-3 px-4 font-bold">EVIDENCE ON WIRE</th>
              <th className="py-3 px-4 font-bold">REGULATORY SOURCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tactical-border/40">
            {filtered.map((item) => {
              const isPass = item.status === "pass";

              return (
                <tr key={item.id} className="hover:bg-tactical-surfaceHover/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-tactical-text font-sans text-[15px]">
                    {item.requirement}
                  </td>

                  <td className="py-4 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold border inline-block ${
                        isPass
                          ? "border-phosphor-green/60 text-phosphor-green bg-phosphor-green/10"
                          : "border-phosphor-hazard/60 text-phosphor-hazard bg-phosphor-hazard/10"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-tactical-text font-mono text-[13px] sm:text-[14px]">
                    {item.details}
                  </td>

                  <td className="py-4 px-4 text-tactical-dim font-mono text-[13px] sm:text-[14px]">
                    {item.standard} {item.section}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
