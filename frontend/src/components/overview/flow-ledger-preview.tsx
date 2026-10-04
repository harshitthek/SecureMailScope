"use client";

import React from "react";
import { Lock, Unlock, KeyRound, ArrowRight } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface FlowLedgerPreviewProps {
  activeCase: EvidenceCase;
  selectedFlowId: number;
  onSelectFlow: (flowId: number) => void;
}

export function FlowLedgerPreview({
  activeCase,
  selectedFlowId,
  onSelectFlow,
}: FlowLedgerPreviewProps) {
  const sessions = activeCase.data.sessions;

  return (
    <section className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 select-none font-sans">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c1d22] gap-3">
        <div>
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
            Reconstructed Email Streams
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em] mt-0.5">
            Forensic Flow Ledger
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#9194a1]">
            Showing {sessions.length} streams
          </span>
          <span className="text-[#2e3038]">•</span>
          <span className="text-xs font-mono text-[#cc9166]">
            Passive Capture
          </span>
        </div>
      </div>

      {/* Slash Data Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left font-sans border-collapse">
          <thead>
            <tr className="border-b border-[#1c1d22] text-[#9194a1] text-xs font-medium">
              <th className="py-3 px-3 font-mono">FLOW</th>
              <th className="py-3 px-3">PROTOCOL</th>
              <th className="py-3 px-3 font-mono">FLOW VECTOR (SRC → DST)</th>
              <th className="py-3 px-3">ENCRYPTION</th>
              <th className="py-3 px-3 font-mono">CIPHER SUITE</th>
              <th className="py-3 px-3">CLIENT IDENTITY</th>
              <th className="py-3 px-3 text-right">SCORE</th>
              <th className="py-3 px-3 text-right">INSPECT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1d22] text-xs">
            {sessions.map((s, idx) => {
              const isSelected = s.session_id === selectedFlowId;
              const isSecure = s.session_score >= 80;
              const isCrit = s.session_score < 50 || Boolean(s.starttls_stripped);
              const cipherShort = s.cipher_suite_name
                ? s.cipher_suite_name.replace("TLS_", "").replace("_WITH_", " ")
                : "None (Cleartext)";
              const tlsVer = s.tls_version || (s.is_encrypted ? "Encrypted" : "Cleartext");

              return (
                <tr
                  key={s.session_id}
                  className={`transition-colors ${
                    isSelected
                      ? "bg-[#121317]"
                      : "hover:bg-[#08080a]"
                  }`}
                >
                  {/* Flow ID */}
                  <td className="py-3 px-3 font-mono font-medium text-white">
                    #{String(idx + 1).padStart(2, "0")}
                  </td>

                  {/* Protocol Pill */}
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#1c1d22] text-[11px] font-mono">
                      {s.protocol} :{s.dst_port}
                    </span>
                  </td>

                  {/* Flow Vector */}
                  <td className="py-3 px-3 font-mono text-[#e2e3e9]">
                    <span className="text-[#9194a1]">{s.src_ip}</span>
                    <span className="text-[#cc9166] mx-1.5">→</span>
                    <span className="text-white font-medium">{s.dst_ip}:{s.dst_port}</span>
                  </td>

                  {/* Encryption Status Pill */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono ${
                        s.is_encrypted
                          ? "bg-[#064e3b]/20 text-[#10b981] border border-[#10b981]/30"
                          : "bg-[#7f1d1d]/20 text-[#f87171] border border-[#f87171]/30"
                      }`}
                    >
                      {s.is_encrypted ? (
                        <Lock className="w-3 h-3 text-[#10b981]" />
                      ) : (
                        <Unlock className="w-3 h-3 text-[#f87171]" />
                      )}
                      <span>{tlsVer}</span>
                    </span>
                  </td>

                  {/* Cipher Suite */}
                  <td className="py-3 px-3 font-mono text-[11px] text-[#acafb9] truncate max-w-[180px]" title={s.cipher_suite_name ?? undefined}>
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{cipherShort}</span>
                      {s.has_forward_secrecy && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 text-[9px] flex items-center gap-0.5 font-medium shrink-0">
                          <KeyRound className="w-2.5 h-2.5" />
                          <span>PFS</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Client Fingerprint / Identity */}
                  <td className="py-3 px-3 text-[#9194a1] truncate max-w-[130px]">
                    {s.ja3_client_name || (s.ja3_hash ? `JA3: ${s.ja3_hash.slice(0, 8)}...` : "Cleartext Stream")}
                  </td>

                  {/* Posture Score in Didone Serif */}
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-serif text-base ${
                        isSecure
                          ? "text-[#10b981]"
                          : isCrit
                          ? "text-[#f87171]"
                          : "text-[#cc9166]"
                      }`}
                    >
                      {s.session_score}
                      <span className="text-[11px] text-[#9194a1] font-sans ml-0.5">/100</span>
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectFlow(s.session_id)}
                      className="px-2.5 py-1 rounded-full text-xs font-sans text-white hover:text-[#cc9166] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Dissect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
