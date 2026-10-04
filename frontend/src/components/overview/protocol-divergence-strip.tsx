"use client";

import React from "react";
import { Check, X, ArrowRight, ShieldAlert, AlertTriangle, Award, Layers } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface ProtocolDivergenceStripProps {
  activeCase: EvidenceCase;
}

export function ProtocolDivergenceStrip({ activeCase }: ProtocolDivergenceStripProps) {
  const criticalFindings = activeCase.data.vulnerabilities.filter(
    (v) => v.severity === "critical"
  ).length;
  const highFindings = activeCase.data.vulnerabilities.filter(
    (v) => v.severity === "high"
  ).length;
  const expiredCerts = activeCase.data.certificate_summary.filter(
    (c) => c.is_expired
  ).length;
  const totalFlows = activeCase.data.total_sessions;

  const isHardened = activeCase.case_code === "CASE-01";
  const isCase03 = activeCase.case_code === "CASE-03";
  const observedFlowTag = activeCase.case_code === "CASE-04" ? "FLOW 03" : "FLOW 01";

  return (
    <section className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 select-none font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1c1d22]">
        <div>
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
            Compliance Verification
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em] mt-0.5">
            Expected Protocol Baseline vs Observed Wire Traces
          </h2>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#121317] text-[#9194a1] border border-[#2e3038] hidden sm:inline-block">
          RFC 8314 AUDIT
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT: PROTOCOL TRACKS (EXPECTED VS OBSERVED) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* TRACK 1: EXPECTED PROTOCOL TRACK */}
          <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-mono font-medium text-[#34d399] uppercase tracking-wider">
                  RFC 8314 Expected Security Baseline
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#9194a1] hidden sm:inline">
                ENFORCED ENCRYPTION
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs font-mono pt-1">
              <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                EHLO GREETING
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
              <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                STARTTLS NEGOTIATION
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
              <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                TLS 1.3 HANDSHAKE
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
              <span className="px-3 py-1 rounded-full bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 font-medium">
                ENCRYPTED PAYLOAD
              </span>
            </div>
          </div>

          {/* TRACK 2: OBSERVED WIRE TRACE */}
          <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isHardened
                      ? "bg-[#34d399]/20 text-[#34d399]"
                      : isCase03
                      ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                      : "bg-[#f87171]/20 text-[#f87171]"
                  }`}
                >
                  {isHardened ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                  ) : (
                    <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                  )}
                </div>
                <span
                  className={`text-xs font-mono font-medium uppercase tracking-wider ${
                    isHardened
                      ? "text-[#34d399]"
                      : isCase03
                      ? "text-[#fbbf24]"
                      : "text-[#f87171]"
                  }`}
                >
                  Observed Wire Trace ({observedFlowTag})
                </span>
              </div>
              <span
                className={`text-[11px] font-mono hidden sm:inline ${
                  isHardened
                    ? "text-[#34d399]"
                    : isCase03
                    ? "text-[#fbbf24]"
                    : "text-[#f87171]"
                }`}
              >
                {isHardened
                  ? "VERIFIED CONFORMANT"
                  : isCase03
                  ? "OBSOLETE CRYPTOGRAPHY"
                  : "WIRE DIVERGENCE DETECTED"}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs font-mono pt-1">
              <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                EHLO GREETING
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
              {isHardened ? (
                <>
                  <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                    STARTTLS ANNOUNCED
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
                  <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                    TLS 1.3 NEGOTIATED
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
                  <span className="px-3 py-1 rounded-full bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 font-medium">
                    AEAD CIPHER ACTIVE
                  </span>
                </>
              ) : isCase03 ? (
                <>
                  <span className="px-3 py-1 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#2e3038] font-medium">
                    STARTTLS NEGOTIATED
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
                  <span className="px-3 py-1 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/30 font-medium">
                    TLS 1.0 (DEPRECATED)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#f87171] shrink-0" strokeWidth={1.75} />
                  <span className="px-3 py-1 rounded-full bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/40 font-medium">
                    3DES-CBC (SWEET32)
                  </span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 rounded-full bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30 font-medium">
                    STARTTLS OMITTED / BYPASSED
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#f87171] shrink-0" strokeWidth={1.75} />
                  <span className="px-3 py-1 rounded-full bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/40 font-medium">
                    PLAINTEXT AUTH EXPOSURE
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: KEY DIVERGENCE PROOF POINTS (Stat Displays) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          {/* Critical */}
          <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-3.5 flex flex-col justify-between">
            <div className={`flex items-center justify-between ${criticalFindings === 0 ? "text-[#9194a1]" : "text-[#f87171]"}`}>
              <span className="text-[11px] font-mono uppercase font-semibold">Critical</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className={`text-3xl font-serif font-normal my-1 ${criticalFindings === 0 ? "text-[#9194a1]" : "text-[#f87171]"}`}>
              {String(criticalFindings).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-[#9194a1] font-mono">
              {criticalFindings === 0
                ? "Zero Criticals"
                : isCase03
                ? "Expired / Sweet32"
                : "MITM / Plaintext"}
            </span>
          </div>

          {/* High */}
          <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-3.5 flex flex-col justify-between">
            <div className={`flex items-center justify-between ${highFindings === 0 ? "text-[#9194a1]" : "text-[#cc9166]"}`}>
              <span className="text-[11px] font-mono uppercase font-semibold">High Risk</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className={`text-3xl font-serif font-normal my-1 ${highFindings === 0 ? "text-white" : "text-[#cc9166]"}`}>
              {String(highFindings).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-[#9194a1] font-mono">
              {highFindings === 0 ? "Zero High Risk" : "Weak Ciphers"}
            </span>
          </div>

          {/* Expired Certs */}
          <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-3.5 flex flex-col justify-between">
            <div className={`flex items-center justify-between ${expiredCerts === 0 ? "text-[#9194a1]" : "text-[#f87171]"}`}>
              <span className="text-[11px] font-mono uppercase font-semibold">Expired Cert</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className={`text-3xl font-serif font-normal my-1 ${expiredCerts === 0 ? "text-white" : "text-[#f87171]"}`}>
              {String(expiredCerts).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-[#9194a1] font-mono">
              {expiredCerts === 0 ? "All Certs Valid" : "X.509 Trust Chain"}
            </span>
          </div>

          {/* Total Flows */}
          <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#9194a1]">
              <span className="text-[11px] font-mono uppercase font-semibold">Total Flows</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="text-3xl font-serif font-normal text-white my-1">
              {String(totalFlows).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-[#9194a1] font-mono">Reassembled TCP</span>
          </div>
        </div>
      </div>
    </section>
  );
}

