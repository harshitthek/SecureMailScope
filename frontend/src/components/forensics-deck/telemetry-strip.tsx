"use client";

import { Session, Vulnerability } from "@/lib/types";
import { Lock, Unlock, AlertOctagon, Terminal } from "lucide-react";

interface TelemetryStripProps {
  sessions: Session[];
  vulnerabilities: Vulnerability[];
}

export function TelemetryStrip({ sessions, vulnerabilities }: TelemetryStripProps) {
  const total = sessions.length;
  const encryptedCount = sessions.filter((s) => s.is_encrypted).length;
  const pfsCount = sessions.filter((s) => s.has_forward_secrecy).length;
  const encPercent = total > 0 ? Math.round((encryptedCount / total) * 100) : 0;
  const pfsPercent = total > 0 ? Math.round((pfsCount / total) * 100) : 0;
  const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
      {/* 1. TLS Encryption Ratio */}
      <div className="border border-tactical-border bg-tactical-surface p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-tactical-dim uppercase">
          <span>Encryption Ratio</span>
          {encPercent >= 80 ? (
            <Lock className="w-3 h-3 text-phosphor-green" />
          ) : (
            <Unlock className="w-3 h-3 text-phosphor-hazard" />
          )}
        </div>
        <div className="my-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-white tabular-nums">{encPercent}%</span>
          <span className="text-[10px] text-tactical-dim">({encryptedCount}/{total})</span>
        </div>
        <div className="w-full h-1 bg-black border border-tactical-border/60">
          <div
            className={`h-full ${encPercent >= 80 ? "bg-phosphor-green" : "bg-phosphor-hazard"}`}
            style={{ width: `${encPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Perfect Forward Secrecy */}
      <div className="border border-tactical-border bg-tactical-surface p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-tactical-dim uppercase">
          <span>PFS Enforcement</span>
          <span className="text-[9px] text-tactical-dim">ECDHE/DHE</span>
        </div>
        <div className="my-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-white tabular-nums">{pfsPercent}%</span>
          <span className="text-[10px] text-tactical-dim">({pfsCount}/{total})</span>
        </div>
        <div className="w-full h-1 bg-black border border-tactical-border/60">
          <div
            className={`h-full ${pfsPercent >= 80 ? "bg-phosphor-green" : "bg-phosphor-amber"}`}
            style={{ width: `${pfsPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Threat Findings */}
      <div className="border border-tactical-border bg-tactical-surface p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-tactical-dim uppercase">
          <span>Threat Vectors</span>
          <AlertOctagon className="w-3 h-3 text-phosphor-hazard" />
        </div>
        <div className="my-1 flex items-baseline gap-1">
          <span className={`text-xl font-bold tabular-nums ${vulnerabilities.length > 0 ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
            {vulnerabilities.length}
          </span>
          <span className="text-[10px] text-tactical-dim">({criticalVulns} CRITICAL)</span>
        </div>
        <span className="text-[9px] text-tactical-dim uppercase">
          {criticalVulns > 0 ? "ACTIVE EXPLOITATION RISK" : "CLEAN CRYPTOGRAPHIC ASSURANCE"}
        </span>
      </div>

      {/* 4. Dissection Engine */}
      <div className="border border-tactical-border bg-tactical-surface p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-tactical-dim uppercase">
          <span>Active Vectors</span>
          <Terminal className="w-3 h-3 text-phosphor-cyan" />
        </div>
        <div className="my-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-phosphor-cyan tabular-nums">{total}</span>
          <span className="text-[10px] text-tactical-dim">RECONSTRUCTED</span>
        </div>
        <span className="text-[9px] text-tactical-dim uppercase truncate">
          PASSIVE DEEP PACKET INSPECTION
        </span>
      </div>
    </div>
  );
}
