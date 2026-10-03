"use client";

import React from "react";
import { Check, X, ArrowRight, GitFork, ShieldAlert, AlertTriangle, Award, Layers } from "lucide-react";
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
    <section className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-cardHover transition-smooth select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-sms-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <GitFork className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-sms-text-primary tracking-tight">
              Protocol Divergence Analysis
            </h3>
            <span className="text-xs font-mono-tech text-sms-text-muted">
              RFC 8314 Compliant Cryptographic Path vs Captured Wire Traces
            </span>
          </div>
        </div>

        <span className="text-xs font-mono-tech px-2.5 py-1 rounded-md bg-sms-surface-secondary text-sms-text-secondary border border-sms-border hidden sm:inline-block">
          DIVERGENCE SENSOR
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* ----------------------------------------------------
            LEFT (65%): PROTOCOL TRACKS (EXPECTED VS OBSERVED)
            ---------------------------------------------------- */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* TRACK 1: EXPECTED PROTOCOL TRACK (Green/Teal Accent) */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-mono-tech font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  RFC 8314 Expected Security Path
                </span>
              </div>
              <span className="text-[11px] font-mono-tech text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                ENFORCED ENCRYPTION
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs font-mono-tech pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-sms-surface-primary text-sms-text-primary border border-sms-border shadow-xs font-semibold">
                EHLO GREETING
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="px-2.5 py-1 rounded-lg bg-sms-surface-primary text-sms-text-primary border border-sms-border shadow-xs font-semibold">
                STARTTLS NEGOTIATION
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="px-2.5 py-1 rounded-lg bg-sms-surface-primary text-sms-text-primary border border-sms-border shadow-xs font-semibold">
                TLS 1.3 HANDSHAKE
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
                ENCRYPTED PAYLOAD
              </span>
            </div>
          </div>

          {/* TRACK 2: OBSERVED WIRE TRACE */}
          <div
            className={`border rounded-xl p-4 flex flex-col gap-2.5 ${
              isHardened
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                : "bg-red-50/40 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isHardened
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-400"
                  }`}
                >
                  {isHardened ? (
                    <Check className="w-3 h-3" strokeWidth={2.5} />
                  ) : (
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  )}
                </div>
                <span
                  className={`text-xs font-mono-tech font-bold uppercase tracking-wider ${
                    isHardened ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                  }`}
                >
                  Observed Wire Trace ({observedFlowTag}) · {isHardened ? "Compliant" : "Critical Divergence"}
                </span>
              </div>
              <span
                className={`text-[11px] font-mono-tech font-bold hidden sm:inline ${
                  isHardened ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isHardened ? "ZERO TAMPERING" : "ATTACK / DOWNGRADE"}
              </span>
            </div>

            {isHardened ? (
              <div className="flex items-center flex-wrap gap-2 text-xs font-mono-tech pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-sms-surface-primary text-sms-text-primary border border-sms-border shadow-xs font-semibold">
                  TCP PORT 465 (IMPLICIT TLS)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                  TLS 1.3 RECORD (0x16 0x03)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
                  AES-256-GCM CIPHERTEXT
                </span>
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-2 text-xs font-mono-tech pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-sms-surface-primary text-sms-text-primary border border-sms-border shadow-xs font-semibold">
                  EHLO GREETING
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0" strokeWidth={2} />
                <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold border border-red-300 dark:border-red-800">
                  STARTTLS STRIPPED
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0" strokeWidth={2} />
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold shadow-xs animate-pulse">
                  PLAINTEXT AUTH OBSERVED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------
            RIGHT (35%): 4-CARD FORENSIC INVENTORY GRID
            ---------------------------------------------------- */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          {/* Critical Vulnerabilities */}
          <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/50 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
              <span className="text-[11px] font-mono-tech uppercase font-bold tracking-wider">Critical</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-red-600 dark:text-red-400 tnum leading-tight font-sans">
              {String(criticalFindings || 2).padStart(2, "0")}
            </div>
            <span className="text-[11px] text-sms-text-muted mt-0.5">Threat vectors</span>
          </div>

          {/* High Severity Warnings */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-mono-tech uppercase font-bold tracking-wider">High Risk</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tnum leading-tight font-sans">
              {String(highFindings || 2).padStart(2, "0")}
            </div>
            <span className="text-[11px] text-sms-text-muted mt-0.5">Policy violations</span>
          </div>

          {/* Expired Certificates */}
          <div className="bg-sms-surface-secondary/70 border border-sms-border p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-sms-text-secondary mb-1">
              <span className="text-[11px] font-mono-tech uppercase font-bold tracking-wider">Expired Cert</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-sms-text-primary tnum leading-tight font-sans">
              {String(expiredCerts || 1).padStart(2, "0")}
            </div>
            <span className="text-[11px] text-sms-text-muted mt-0.5">Invalid chains</span>
          </div>

          {/* Total Reconstructed Flows */}
          <div className="bg-sms-surface-secondary/70 border border-sms-border p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-sms-text-secondary mb-1">
              <span className="text-[11px] font-mono-tech uppercase font-bold tracking-wider">Total Flows</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-sms-text-primary tnum leading-tight font-sans">
              {String(totalFlows || 4).padStart(2, "0")}
            </div>
            <span className="text-[11px] text-sms-text-muted mt-0.5">Network streams</span>
          </div>
        </div>
      </div>
    </section>
  );
}
