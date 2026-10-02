"use client";

import { ScoringBreakdown } from "@/lib/types";
import { AlertCircle } from "lucide-react";

interface DeductionLedgerProps {
  scoring: ScoringBreakdown;
  sessionScore: number;
}

export function DeductionLedger({ scoring, sessionScore }: DeductionLedgerProps) {
  const isCritical = sessionScore < 50;

  return (
    <div className="border border-tactical-border bg-black/40 p-3 space-y-2 font-mono">
      <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/70 text-white font-bold text-xs">
        <div className="flex items-center gap-1.5 text-phosphor-hazard">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>DEDUCTION BREAKDOWN</span>
        </div>
        <span className="text-[9px] uppercase px-1 py-0.2 border border-tactical-border text-tactical-dim font-bold">
          AUDIT
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between text-tactical-dim">
          <span>Protocol Penalty (V_proto):</span>
          <span className={scoring.protocol_penalty > 0 ? "text-phosphor-hazard font-bold tabular-nums" : "text-tactical-muted"}>
            {scoring.protocol_penalty > 0 ? `-${scoring.protocol_penalty} pts` : "0 pts"}
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>Cipher Suite Penalty (V_cipher):</span>
          <span className={scoring.cipher_penalty > 0 ? "text-phosphor-hazard font-bold tabular-nums" : "text-tactical-muted"}>
            {scoring.cipher_penalty > 0 ? `-${scoring.cipher_penalty} pts` : "0 pts"}
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>PFS Deficiency (V_pfs):</span>
          <span className={scoring.pfs_penalty > 0 ? "text-phosphor-hazard font-bold tabular-nums" : "text-tactical-muted"}>
            {scoring.pfs_penalty > 0 ? `-${scoring.pfs_penalty} pts` : "0 pts"}
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>Cert / Trust Penalty (V_cert):</span>
          <span className={scoring.cert_penalty > 0 ? "text-phosphor-hazard font-bold tabular-nums" : "text-tactical-muted"}>
            {scoring.cert_penalty > 0 ? `-${scoring.cert_penalty} pts` : "0 pts"}
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>Anomaly / JA3 Penalty (V_anom):</span>
          <span className={scoring.anomaly_penalty > 0 ? "text-phosphor-amber font-bold tabular-nums" : "text-tactical-muted"}>
            {scoring.anomaly_penalty > 0 ? `-${scoring.anomaly_penalty} pts` : "0 pts"}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-tactical-border font-bold text-xs text-white">
          <span>Evaluated Stream Score:</span>
          <span className={isCritical ? "text-phosphor-hazard tabular-nums" : "text-phosphor-green tabular-nums"}>
            {sessionScore} / 100
          </span>
        </div>
      </div>
    </div>
  );
}
