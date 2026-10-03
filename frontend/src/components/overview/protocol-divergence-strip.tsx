"use client";

import React from "react";
import { Check, X, ArrowRight } from "lucide-react";
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
  const observedFlowTag = activeCase.case_code === "CASE-04" ? "FLOW 03" : "FLOW 01";

  return (
    <section className="pt-2.5 pb-2.5 border-t border-b border-sms-border select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ----------------------------------------------------
            LEFT (65%): PROTOCOL TRACKS (STRICTLY NOT GENERIC CARDS)
            ---------------------------------------------------- */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          {/* Subordinate Section Header */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono-tech tracking-wider text-sms-text-muted uppercase">
              Protocol Divergence Analysis
            </span>
            <span className="text-sms-border font-mono-tech">/</span>
            <span className="text-[12px] font-mono-tech text-sms-text-muted uppercase">
              RFC 8314 Baseline vs Wire Traces
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* TRACK 1: EXPECTED PROTOCOL TRACK (Teal Vertical Rail) */}
            <div className="border-l-4 border-l-sms-cyan pl-3 py-0.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-sms-cyan" strokeWidth={2} />
                <span className="text-[12px] font-mono-tech font-bold text-sms-cyan uppercase tracking-wider">
                  Expected Protocol Path
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-1.5 text-ui font-mono-tech">
                <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-text-primary border border-sms-border">
                  EHLO
                </span>
                <ArrowRight className="w-3 h-3 text-sms-cyan shrink-0" strokeWidth={1.5} />
                <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-text-primary border border-sms-border">
                  STARTTLS
                </span>
                <ArrowRight className="w-3 h-3 text-sms-cyan shrink-0" strokeWidth={1.5} />
                <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-text-primary border border-sms-border">
                  TLS HANDSHAKE
                </span>
                <ArrowRight className="w-3 h-3 text-sms-cyan shrink-0" strokeWidth={1.5} />
                <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary border border-sms-cyan/30 text-sms-cyan font-semibold">
                  ENCRYPTED DATA
                </span>
              </div>
            </div>

            {/* TRACK 2: OBSERVED WIRE TRACE (Crimson Vertical Rail) */}
            <div
              className={`border-l-4 pl-3 py-0.5 flex flex-col gap-1.5 ${
                isHardened ? "border-l-sms-green" : "border-l-sms-red"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isHardened ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-sms-green" strokeWidth={2} />
                    <span className="text-[12px] font-mono-tech font-bold text-sms-green uppercase tracking-wider">
                      Observed Wire Path ({observedFlowTag}) · Compliant
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 text-sms-red" strokeWidth={2} />
                    <span className="text-[12px] font-mono-tech font-bold text-sms-red uppercase tracking-wider">
                      Observed Wire Path ({observedFlowTag}) · Divergence
                    </span>
                  </>
                )}
              </div>

              {isHardened ? (
                <div className="flex items-center flex-wrap gap-1.5 text-ui font-mono-tech">
                  <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-text-primary border border-sms-border">
                    TCP 465
                  </span>
                  <ArrowRight className="w-3 h-3 text-sms-green shrink-0" strokeWidth={1.5} />
                  <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-green border border-sms-green/30 font-semibold">
                    TLS 1.3 RECORD
                  </span>
                  <ArrowRight className="w-3 h-3 text-sms-green shrink-0" strokeWidth={1.5} />
                  <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-green border border-sms-green/30 font-semibold">
                    AES-256-GCM
                  </span>
                </div>
              ) : (
                <div className="flex items-center flex-wrap gap-1.5 text-ui font-mono-tech">
                  <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary text-sms-text-primary border border-sms-border">
                    EHLO
                  </span>
                  <ArrowRight className="w-3 h-3 text-sms-text-muted shrink-0" strokeWidth={1.5} />
                  <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary border border-sms-red/35 text-sms-red font-semibold">
                    STARTTLS BYPASSED
                  </span>
                  <span className="text-sms-red font-bold text-body-s">×</span>
                  <span className="px-2 py-0.5 rounded-tag bg-sms-surface-secondary border border-sms-red/50 text-sms-red font-bold">
                    PLAINTEXT AUTH OBSERVED
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            RIGHT (35%): SUPPORTING FACTS (ALIGNED STRIP, NO CARDS)
            ---------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col justify-center pl-0 lg:pl-6 border-l-0 lg:border-l border-sms-border font-mono-tech">
          <div className="text-[12px] text-sms-text-muted tracking-wider uppercase mb-2">
            Forensic Inventory
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-[32px] sm:text-[34px] font-bold text-sms-red leading-none tnum">
                {String(criticalFindings || 2).padStart(2, "0")}
              </div>
              <span className="text-[11px] sm:text-[12px] text-sms-text-muted uppercase tracking-wider block mt-1">
                Critical
              </span>
            </div>

            <div>
              <div className="text-[32px] sm:text-[34px] font-bold text-sms-amber leading-none tnum">
                {String(highFindings || 2).padStart(2, "0")}
              </div>
              <span className="text-[11px] sm:text-[12px] text-sms-text-muted uppercase tracking-wider block mt-1">
                High
              </span>
            </div>

            <div>
              <div className="text-[32px] sm:text-[34px] font-bold text-sms-text-primary leading-none tnum">
                {String(expiredCerts || 1).padStart(2, "0")}
              </div>
              <span className="text-[11px] sm:text-[12px] text-sms-text-muted uppercase tracking-wider block mt-1">
                Expired Cert
              </span>
            </div>

            <div>
              <div className="text-[32px] sm:text-[34px] font-bold text-sms-text-primary leading-none tnum">
                {String(totalFlows || 4).padStart(2, "0")}
              </div>
              <span className="text-[11px] sm:text-[12px] text-sms-text-muted uppercase tracking-wider block mt-1">
                Flows
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
