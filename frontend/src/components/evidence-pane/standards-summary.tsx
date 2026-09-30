"use client";

import { ComplianceCheck } from "@/lib/types";
import { CheckSquare, AlertOctagon } from "lucide-react";

interface StandardsSummaryProps {
  compliance: ComplianceCheck[];
}

export function StandardsSummary({ compliance }: StandardsSummaryProps) {
  const passes = compliance.filter((c) => c.status === "pass").length;
  const fails = compliance.filter((c) => c.status === "fail").length;

  return (
    <div className="border border-tactical-border bg-tactical-surface p-2.5 font-mono text-xs space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-tactical-border/60">
        <span className="text-[10px] uppercase tracking-wider text-tactical-dim font-bold">
          STANDARDS AUDIT
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-phosphor-green font-bold">{passes} PASS</span>
          <span className="text-phosphor-hazard font-bold">{fails} FAIL</span>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        {/* NIST SP 800-52r2 */}
        <div className="flex items-center justify-between p-1 bg-black/40 border border-tactical-border/50">
          <div>
            <span className="text-tactical-text font-bold block">NIST SP 800-52r2</span>
            <span className="text-[9px] text-tactical-dim block">Fed TLS Guidelines</span>
          </div>
          {fails === 0 ? (
            <span className="inline-flex items-center gap-1 text-[9px] text-phosphor-green border border-phosphor-green/40 bg-phosphor-green/10 px-1.5 py-0.2">
              <CheckSquare className="w-3 h-3" /> PASS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] text-phosphor-hazard border border-phosphor-hazard/40 bg-phosphor-hazard/10 px-1.5 py-0.2">
              <AlertOctagon className="w-3 h-3" /> DEFICIENT
            </span>
          )}
        </div>

        {/* RFC 8314 */}
        <div className="flex items-center justify-between p-1 bg-black/40 border border-tactical-border/50">
          <div>
            <span className="text-tactical-text font-bold block">RFC 8314</span>
            <span className="text-[9px] text-tactical-dim block">Implicit TLS Mandate</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] text-phosphor-cyan border border-phosphor-cyan/40 bg-phosphor-cyan/10 px-1.5 py-0.2">
            AUDITED
          </span>
        </div>

        {/* RFC 8996 */}
        <div className="flex items-center justify-between p-1 bg-black/40 border border-tactical-border/50">
          <div>
            <span className="text-tactical-text font-bold block">RFC 8996</span>
            <span className="text-[9px] text-tactical-dim block">TLS 1.0/1.1 Deprecation</span>
          </div>
          {compliance.some((c) => c.standard === "RFC 8996" && c.status === "fail") ? (
            <span className="inline-flex items-center gap-1 text-[9px] text-phosphor-hazard border border-phosphor-hazard/40 bg-phosphor-hazard/10 px-1.5 py-0.2">
              <AlertOctagon className="w-3 h-3" /> NON-COMPLIANT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] text-phosphor-green border border-phosphor-green/40 bg-phosphor-green/10 px-1.5 py-0.2">
              <CheckSquare className="w-3 h-3" /> ENFORCED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
