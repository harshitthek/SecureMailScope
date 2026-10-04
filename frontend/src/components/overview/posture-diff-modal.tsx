"use client";

import React from "react";
import { EvidenceCase } from "@/lib/types";
import { EVIDENCE_CASES } from "@/lib/mock-data";
import { GitCompare, X } from "lucide-react";

interface PostureDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: EvidenceCase;
}

export function PostureDiffModal({ isOpen, onClose, activeCase }: PostureDiffModalProps) {
  if (!isOpen) return null;

  const baseline = EVIDENCE_CASES[0];
  const scoreDelta = activeCase.posture_score - baseline.posture_score;
  const isOptimal = scoreDelta === 0;

  const diffMetrics = [
    {
      label: "Composite Posture Score",
      baseline: `${baseline.posture_score}/100 (${baseline.posture_grade})`,
      current: `${activeCase.posture_score}/100 (${activeCase.posture_grade})`,
      delta: `${scoreDelta >= 0 ? "+" : ""}${scoreDelta} pts`,
      status: scoreDelta >= 0 ? "optimal" : scoreDelta > -30 ? "warning" : "critical",
    },
    {
      label: "Mandatory TLS Enforcement",
      baseline: "Enforced (RFC 8314 / TLS 1.3)",
      current: activeCase.data.sessions.some((s) => !s.is_encrypted) ? "Cleartext Fallback (Vulnerable)" : "Enforced (STARTTLS / Implicit)",
      delta: activeCase.data.sessions.some((s) => !s.is_encrypted) ? "Cleartext Risk" : "Compliant",
      status: activeCase.data.sessions.some((s) => !s.is_encrypted) ? "critical" : "optimal",
    },
    {
      label: "Ephemeral Key Exchange (PFS)",
      baseline: "100% ECDHE (X25519 / secp256r1)",
      current: activeCase.data.sessions.some((s) => s.is_encrypted && !s.has_forward_secrecy) ? "Static RSA (No PFS)" : "ECDHE Forward Secrecy",
      delta: activeCase.data.sessions.some((s) => s.is_encrypted && !s.has_forward_secrecy) ? "Decryption Risk" : "PFS Preserved",
      status: activeCase.data.sessions.some((s) => s.is_encrypted && !s.has_forward_secrecy) ? "critical" : "optimal",
    },
    {
      label: "Modern AEAD Ciphers",
      baseline: "AES-GCM / ChaCha20-Poly1305",
      current: activeCase.data.sessions.some((s) => s.cipher_severity === "critical" || s.cipher_severity === "high") ? "Legacy 3DES / CBC" : "Modern AEAD",
      delta: activeCase.data.sessions.some((s) => s.cipher_severity === "critical" || s.cipher_severity === "high") ? "Vulnerable Cipher" : "Compliant",
      status: activeCase.data.sessions.some((s) => s.cipher_severity === "critical" || s.cipher_severity === "high") ? "critical" : "optimal",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-[10px] border border-[#2e3038] bg-[#07080a] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-[#1c1d22]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#cc9166] uppercase font-mono">Divergence Engine // NIST SP 800-52r2</span>
              <h2 className="text-lg font-mono font-bold text-white">CRYPTOGRAPHIC POSTURE DELTA &amp; DIFF</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full border border-[#2e3038] text-[#9194a1] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#777a88] border-b border-[#1c1d22] pb-2">
            <span>PARAMETER</span>
            <div className="flex items-center gap-12 sm:gap-20">
              <span className="text-[#34d399]">BASELINE: CASE-01</span>
              <span className="text-[#cc9166]">CURRENT: {activeCase.case_code}</span>
            </div>
          </div>

          {diffMetrics.map((m, idx) => (
            <div key={idx} className="p-3 rounded bg-[#0c0d10] border border-[#1c1d22] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#e2e3e9] font-bold">{m.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  m.status === "optimal" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" :
                  m.status === "warning" ? "bg-amber-950/60 text-amber-300 border-amber-800" :
                  "bg-rose-950/60 text-rose-300 border-rose-800"
                }`}>
                  {m.delta}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#1c1d22]/50">
                <div className="text-emerald-400 truncate">{m.baseline}</div>
                <div className={m.status === "optimal" ? "text-emerald-400 truncate" : "text-rose-400 truncate"}>{m.current}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#1c1d22] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#777a88]">
            {isOptimal ? "EVIDENCE PROFILE MATCHES HARDENED BASELINE" : "REMEDIATION REQUIRED FOR NIST SP 800-52r2 COMPLIANCE"}
          </span>
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded bg-[#cc9166] text-black text-xs font-mono font-semibold hover:bg-[#d89f75]">
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
