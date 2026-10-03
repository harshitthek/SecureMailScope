"use client";

import React from "react";
import { 
  ArrowUpRight, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Unlock,
  KeyRound
} from "lucide-react";
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
    <section className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-cardHover transition-smooth select-none">
      {/* ----------------------------------------------------
          DIFFERENTIATED "OVERVIEW FLOW" SECTION HEADER
          - Prominent distinct accent color (Blue/Sky #0284C7 / #38BDF8)
          - Higher font size (text-xl sm:text-2xl) & font-black
          - Vertical accent gradient bar & extra bottom spacing
          ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-sms-border gap-4">
        <div className="flex items-center gap-3">
          {/* Prominent Colored Accent Bar */}
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-600 shrink-0" />

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-sky-600 dark:text-sky-400 font-sans">
                Overview Flow
              </h2>
              <span className="text-sms-border-strong text-lg font-light">/</span>
              <span className="text-base sm:text-lg font-bold text-sms-text-primary tracking-tight">
                Reconstructed Email Stream Ledger
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono-tech font-bold rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                {sessions.length} Flows Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-sms-text-muted font-medium mt-1">
              Select any mail session below to inspect full TCP reassembly, TLS cryptographic negotiation, and wire bytes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-tech text-sms-text-muted self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sms-surface-secondary border border-sms-border">
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span>INTERACTIVE FORENSIC LEDGER</span>
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------
          FORENSIC LEDGER ITEMS (ELEVATED INTERACTIVE CARDS)
          ---------------------------------------------------- */}
      <div className="space-y-3 font-mono-tech text-xs">
        {sessions.map((s, idx) => {
          const isSelected = s.session_id === selectedFlowId;
          const isSecure = s.session_score >= 80;
          const isCritical = s.session_score < 50 || s.starttls_stripped;
          const flowTag = `FLOW #${String(idx + 1).padStart(2, "0")}`;
          const cipherShort = s.cipher_suite_name
            ? s.cipher_suite_name
                .replace("TLS_", "")
                .replace("_WITH_", "-")
                .replace("_GCM_SHA256", "-GCM")
                .replace("_GCM_SHA384", "-GCM")
                .replace("_CBC_SHA", "-CBC")
            : "NONE (CLEARTEXT)";

          const tlsVer = s.tls_version || (s.is_encrypted ? "TLS" : "CLEARTEXT");

          return (
            <div
              key={s.session_id}
              onClick={() => onSelectFlow(s.session_id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative group flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isSelected
                  ? "bg-sky-50/50 dark:bg-sky-950/20 border-sky-400 dark:border-sky-600 shadow-md ring-1 ring-sky-400/30"
                  : "bg-sms-surface-secondary/40 hover:bg-sms-surface-hover/80 border-sms-border hover:border-sms-border-strong hover:shadow-sm"
              }`}
            >
              {/* Left Column: Status Badge, Flow Tag, Protocol, Target, Parameters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 overflow-hidden">
                {/* Status Indicator Pill */}
                <div
                  className={`px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center gap-1.5 shrink-0 ${
                    isSecure
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : isCritical
                      ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isSecure ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isCritical ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>
                    {isSecure ? "Secure" : isCritical ? "Critical" : "Warning"}
                  </span>
                </div>

                {/* Flow Tag */}
                <span className="font-bold text-sms-text-primary text-sm shrink-0">
                  {flowTag}
                </span>

                {/* Protocol & Port Chip */}
                <span className="px-2 py-0.5 rounded-md bg-sms-surface-primary text-sms-text-primary font-bold border border-sms-border shadow-2xs shrink-0">
                  {s.protocol} :{s.dst_port}
                </span>

                {/* Target Host or IP Endpoints */}
                <div className="flex items-center gap-2 text-xs truncate">
                  <span className="font-semibold text-sms-text-primary truncate">
                    {s.server_name || `${s.dst_ip}`}
                  </span>
                  <span className="text-sms-text-muted hidden lg:inline">
                    ({s.src_ip}:{s.src_port} → {s.dst_ip}:{s.dst_port})
                  </span>
                </div>
              </div>

              {/* Middle/Crypto Attributes */}
              <div className="flex items-center flex-wrap gap-2 text-[11px]">
                {/* TLS Version Chip */}
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${
                    s.is_encrypted
                      ? "bg-sms-surface-primary text-sms-text-primary border-sms-border"
                      : "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-300 dark:border-red-900"
                  }`}
                >
                  {s.is_encrypted ? (
                    <Lock className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Unlock className="w-3 h-3 text-red-500" />
                  )}
                  <span>{tlsVer}</span>
                </span>

                {/* Cipher Suite Chip */}
                <span className="px-2 py-0.5 rounded-md bg-sms-surface-primary text-sms-text-secondary border border-sms-border truncate max-w-[150px] lg:max-w-none">
                  {cipherShort}
                </span>

                {/* PFS Badge */}
                {s.has_forward_secrecy ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-emerald-500" />
                    <span>PFS</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-sms-surface-primary text-sms-text-muted border border-sms-border">
                    NO PFS
                  </span>
                )}
              </div>

              {/* Right Column: Score, Grade & Inspect CTA */}
              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <div className="text-right flex items-center gap-2">
                  <span
                    className={`font-black text-base tnum font-sans ${
                      isSecure
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isCritical
                        ? "text-red-600 dark:text-red-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {s.session_score}
                  </span>
                  <span className="text-xs text-sms-text-muted font-normal">/100</span>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isSecure
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : isCritical
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    }`}
                  >
                    {s.session_grade}
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all duration-150 ${
                    isSelected
                      ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                      : "bg-sms-surface-primary group-hover:bg-sky-50 dark:group-hover:bg-sky-950/40 text-sms-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-300 border-sms-border group-hover:border-sky-300"
                  }`}
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
