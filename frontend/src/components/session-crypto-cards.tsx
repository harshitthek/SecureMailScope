"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import { Key, ShieldCheck, AlertCircle, Lock, Unlock, Copy, Check } from "lucide-react";

interface SessionCryptoCardsProps {
  session: Session;
}

export function SessionCryptoCards({ session }: SessionCryptoCardsProps) {
  const [copied, setCopied] = useState(false);
  const { scoring_breakdown } = session;

  const copyJa3 = () => {
    if (session.ja3_hash) {
      navigator.clipboard.writeText(session.ja3_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs font-mono">
      {/* Handshake & Key Exchange */}
      <div className="p-3.5 rounded-lg border border-soc-border bg-soc-bg/90 space-y-2.5">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold border-b border-soc-border/60 pb-1.5">
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span>Handshake Cryptography</span>
        </div>
        <div className="space-y-1.5 text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Cipher Suite</span>
            <span className="text-slate-200 font-semibold break-all text-[11px]">
              {session.cipher_suite_name || "None (Cleartext Transmission)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Hex Code:</span>
            <span className="text-slate-300 font-bold">{session.cipher_suite_hex || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Key Exchange:</span>
            <span className="text-slate-300">{session.key_exchange || "None"}</span>
          </div>
          <div className="pt-1">
            {session.has_forward_secrecy ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] font-bold">
                <Lock className="w-3 h-3" /> Ephemeral PFS (ECDHE)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30 text-[10px] font-bold">
                <Unlock className="w-3 h-3" /> Static Key / Historical Decrypt Risk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* JA3 Client Threat Fingerprint */}
      <div className="p-3.5 rounded-lg border border-soc-border bg-soc-bg/90 space-y-2.5">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold border-b border-soc-border/60 pb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>JA3 Client Fingerprint</span>
        </div>
        <div className="space-y-1.5 text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Identified Client</span>
            <span className="text-slate-200 font-semibold text-[11px]">
              {session.ja3_client_name || "Unknown Client / Plaintext"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">JA3 MD5 Hash</span>
            <div className="mt-1 flex items-center justify-between gap-1 p-1.5 bg-soc-card rounded border border-soc-border text-[10px] text-slate-300">
              <span className="truncate">{session.ja3_hash || "No TLS Client Hello"}</span>
              {session.ja3_hash && (
                <button
                  onClick={copyJa3}
                  className="p-1 hover:text-cyan-400 transition-colors focus-visible:ring-1 focus-visible:ring-cyan-400"
                  title="Copy JA3 Hash"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500">Threat Intel Registry:</span>
            <span className={session.ja3_is_known ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {session.ja3_is_known ? "Known Legitimate" : "Unmapped Signature"}
            </span>
          </div>
        </div>
      </div>

      {/* Cryptographic Penalty Ledger */}
      <div className="p-3.5 rounded-lg border border-soc-border bg-soc-bg/90 space-y-2.5">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold border-b border-soc-border/60 pb-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Cryptographic Deductions</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Protocol Penalty:</span>
            <span className={scoring_breakdown.protocol_penalty < 0 ? "text-rose-400 font-bold" : "text-slate-500"}>
              {scoring_breakdown.protocol_penalty} pts
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Cipher Suite Flaw:</span>
            <span className={scoring_breakdown.cipher_penalty < 0 ? "text-rose-400 font-bold" : "text-slate-500"}>
              {scoring_breakdown.cipher_penalty} pts
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>PFS Deficiency:</span>
            <span className={scoring_breakdown.pfs_penalty < 0 ? "text-rose-400 font-bold" : "text-slate-500"}>
              {scoring_breakdown.pfs_penalty} pts
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>X.509 Trust Issues:</span>
            <span className={scoring_breakdown.cert_penalty < 0 ? "text-rose-400 font-bold" : "text-slate-500"}>
              {scoring_breakdown.cert_penalty} pts
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-soc-border/60 font-bold text-slate-200">
            <span>Computed Stream Score:</span>
            <span className={session.session_score >= 80 ? "text-emerald-400" : "text-rose-400"}>
              {scoring_breakdown.final_score} / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
