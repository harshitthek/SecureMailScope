"use client";

import React from "react";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface SimulationStreamLedgerProps {
  currentStage: number;
  activeCase: EvidenceCase;
}

export function SimulationStreamLedger({
  currentStage,
  activeCase,
}: SimulationStreamLedgerProps) {
  const sessions = activeCase.data.sessions || [];

  return (
    <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-4 flex flex-col gap-3 font-mono text-xs select-none overflow-x-auto">
      <div className="flex items-center justify-between pb-2 border-b border-[#1c1d22]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
          <span className="text-white text-[11px] font-semibold uppercase">
            Stream Remediated Cryptographic Diff Ledger
          </span>
        </div>
        <span className="text-[10px] text-[#9194a1]">
          {sessions.length} TOTAL RECONSTRUCTED WIRE SESSIONS
        </span>
      </div>

      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-[#1c1d22] text-[10px] text-[#777a88] uppercase">
            <th className="py-1.5 px-2">Flow</th>
            <th className="py-1.5 px-2">Protocol</th>
            <th className="py-1.5 px-2">Original State</th>
            <th className="py-1.5 px-2 text-center">Transform</th>
            <th className="py-1.5 px-2">Simulated Enforced State</th>
            <th className="py-1.5 px-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1c1d22] text-[11px]">
          {sessions.map((s, idx) => {
            const isStreamElevated = currentStage >= 3 || activeCase.id === "CASE-01";
            const origTls = s.tls_version || (s.is_encrypted ? "TLS 1.2" : "Cleartext");
            const origCipher = s.cipher_suite_name ? s.cipher_suite_name.replace("TLS_", "").slice(0, 18) : "None (Plaintext)";

            return (
              <tr key={s.session_id || idx} className="hover:bg-[#121317]/50 transition-colors">
                <td className="py-2 px-2 text-white font-semibold">
                  #{s.session_id}
                </td>
                <td className="py-2 px-2">
                  <span className="px-1.5 py-0.2 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[10px]">
                    {s.protocol} ({s.dst_port})
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="text-[#ef4444] font-medium">{origTls}</div>
                  <div className="text-[10px] text-[#777a88]">{origCipher}</div>
                </td>
                <td className="py-2 px-2 text-center text-[#777a88]">
                  <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                </td>
                <td className="py-2 px-2">
                  <div className={isStreamElevated ? "text-[#34d399] font-medium" : "text-[#9194a1]"}>
                    {isStreamElevated ? "TLS 1.3 (RFC 8446)" : origTls}
                  </div>
                  <div className="text-[10px] text-[#34d399]/80">
                    {isStreamElevated ? "AES-256-GCM + ML-KEM768" : origCipher}
                  </div>
                </td>
                <td className="py-2 px-2 text-right">
                  {isStreamElevated ? (
                    <span className="px-2 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 text-[9px] font-semibold inline-flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>REMEDIATED</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#121317] text-[#777a88] border border-[#2e3038] text-[9px]">
                      PENDING
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
