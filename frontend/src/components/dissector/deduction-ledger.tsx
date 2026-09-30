"use client";

import { ScoringBreakdown } from "@/lib/types";
import { AlertCircle } from "lucide-react";

interface DeductionLedgerProps {
  scoring: ScoringBreakdown;
  sessionScore: number;
}

export function DeductionLedger({ scoring, sessionScore }: DeductionLedgerProps) {
  return (
    <div className="border border-tactical-border bg-black/40 p-3 space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/70 text-white font-bold">
        <div className="flex items-center gap-1.5 text-phosphor-hazard">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>DEDUCTION BREAKDOWN</span>
        </div>
        <span className="text-[9px] uppercase px-1 py-0.2 border border-tactical-border text-tactical-dim">
          AUDIT
        </span>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between text-tactical-dim">
          <span>Protocol Penalty:</span>
          <span className={scoring.protocol_penalty < 0 ? "text-phosphor-hazard font-bold" : "text-tactical-muted"}>
            {scoring.protocol_penalty} pts
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>Cipher Suite Flaw:</span>
          <span className={scoring.cipher_penalty < 0 ? "text-phosphor-hazard font-bold" : "text-tactical-muted"}>
            {scoring.cipher_penalty} pts
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>PFS Deficiency:</span>
          <span className={scoring.pfs_penalty < 0 ? "text-phosphor-hazard font-bold" : "text-tactical-muted"}>
            {scoring.pfs_penalty} pts
          </span>
        </div>
        <div className="flex justify-between text-tactical-dim">
          <span>Cert / Trust Penalty:</span>
          <span className={scoring.cert_penalty < 0 ? "text-phosphor-hazard font-bold" : "text-tactical-muted"}>
            {scoring.cert_penalty} pts
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-tactical-border font-bold text-white">
          <span>Evaluated Stream Score:</span>
          <span className={sessionScore >= 80 ? "text-phosphor-green" : "text-phosphor-hazard"}>
            {scoring.final_score} / 100
          </span>
        </div>
      </div>
    </div>
  );
}
