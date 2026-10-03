"use client";

import { Vulnerability } from "@/lib/types";
import { AlertOctagon, Wrench, ShieldCheck } from "lucide-react";

interface ThreatRadarProps {
  vulnerabilities: Vulnerability[];
}

export function ThreatRadar({ vulnerabilities }: ThreatRadarProps) {
  return (
    <div className="border border-tactical-border bg-tactical-surface p-3 font-mono text-xs space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/70 text-[10px] text-tactical-dim uppercase">
        <div className="flex items-center gap-1.5 text-tactical-text font-bold">
          <AlertOctagon className="w-3.5 h-3.5 text-phosphor-hazard" />
          <span>CRYPTOGRAPHIC THREAT FINDINGS &amp; REMEDIATION ({vulnerabilities.length})</span>
        </div>
        <span>PRIORITIZED DEFENSE RADAR</span>
      </div>

      {vulnerabilities.length === 0 ? (
        <div className="py-6 text-center text-phosphor-green flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold">ALL CRYPTOGRAPHIC INTEGRITY AUDITS PASSED // ZERO DEFICIENCIES</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {vulnerabilities.map((v) => {
            const isCritical = v.severity === "critical";

            return (
              <div
                key={v.id}
                className="p-2 border border-tactical-border/80 bg-tactical-surfaceHover space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 border ${
                        isCritical
                          ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                          : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                      }`}
                    >
                      {v.severity}
                    </span>
                    <span className="font-bold text-tactical-text text-[11px]">{v.title}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[9px]">
                    {v.nist_reference && (
                      <span className="px-1 py-0.2 border border-tactical-border text-tactical-dim">
                        {v.nist_reference}
                      </span>
                    )}
                    {v.cve_references?.map((cve) => (
                      <span key={cve} className="px-1 py-0.2 border border-phosphor-hazard/40 text-phosphor-hazard">
                        {cve}
                      </span>
                    ))}
                    <span className="text-tactical-dim">
                      Streams: {v.affected_sessions.map((s) => `#${s}`).join(", ")}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-tactical-dim leading-snug">
                  {v.description}
                </p>

                {v.remediation && (
                  <div className="pt-1 border-t border-tactical-border/40 text-[10px] text-phosphor-cyan flex items-start gap-1">
                    <Wrench className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-tactical-text uppercase">REMEDIATION: </strong>
                      {v.remediation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
