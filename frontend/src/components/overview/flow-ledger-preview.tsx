"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
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
    <section className="pt-2 pb-4 select-none">
      {/* Subordinate Section Header */}
      <div className="flex items-center justify-between mb-1.5 font-mono-tech">
        <div className="flex items-center gap-2">
          <span className="text-[12px] tracking-wider text-sms-text-muted uppercase">
            Reconstructed Flow Signatures
          </span>
          <span className="text-sms-border">/</span>
          <span className="text-[12px] text-sms-text-muted uppercase">
            {sessions.length} Forensic Data Records
          </span>
        </div>

        <span className="text-[12px] text-sms-text-muted uppercase hidden sm:inline">
          Click row to inspect vector in detail
        </span>
      </div>

      {/* Forensic Ledger Records (Flat data rows, strictly NOT cards) */}
      <div className="divide-y divide-sms-border border-t border-b border-sms-border font-mono-tech text-ui">
        {sessions.map((s, idx) => {
          const isSelected = s.session_id === selectedFlowId;
          const isSecure = s.session_score >= 80;
          const isCritical = s.session_score < 50 || s.starttls_stripped;
          const flowTag = `F${String(idx + 1).padStart(2, "0")}`;

          // Format clean cryptographic parameter tokens
          const cipherShort = s.cipher_suite_name
            ? s.cipher_suite_name
                .replace("TLS_", "")
                .replace("_WITH_", "-")
                .replace("_GCM_SHA256", "-GCM")
                .replace("_GCM_SHA384", "-GCM")
            : "NONE";
          const tlsVer = s.tls_version || (s.is_encrypted ? "TLS" : "CLEAR");
          const kx = s.key_exchange?.replace(" (X25519)", "") || "NONE";

          return (
            <div
              key={s.session_id}
              onClick={() => onSelectFlow(s.session_id)}
              className={`py-1.5 sm:py-2 px-3 sm:px-4 flex items-center justify-between cursor-pointer transition-fast relative group ${
                isSelected
                  ? "bg-sms-surface-selected border-l-4 border-l-sms-border-selectedRail pl-2.5 sm:pl-3"
                  : "bg-sms-surface-primary hover:bg-sms-surface-hover border-l-4 border-l-transparent"
              }`}
            >
              {/* Left Column: Flow Tag, Protocol, Target, Parameters */}
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                {/* Status Dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSecure ? "bg-sms-green" : isCritical ? "bg-sms-red" : "bg-sms-amber"
                  }`}
                />

                <span className="text-meta font-bold text-sms-text-muted group-hover:text-sms-cyan transition-fast shrink-0">
                  {flowTag}
                </span>

                {/* Target & Protocol */}
                <span className="font-semibold text-sms-text-primary whitespace-nowrap shrink-0">
                  {s.protocol} :{s.dst_port}
                </span>

                <span className="text-meta text-sms-text-secondary truncate hidden md:inline">
                  {s.server_name || `${s.dst_ip}`}
                </span>

                <span className="text-sms-border hidden md:inline">·</span>

                {/* Crypto Parameters */}
                <div className="items-center gap-2 text-meta text-sms-text-secondary hidden sm:flex truncate">
                  <span className={s.is_encrypted ? "text-sms-text-primary" : "text-sms-red font-semibold"}>
                    {tlsVer}
                  </span>
                  <span>·</span>
                  <span>{cipherShort}</span>
                  <span>·</span>
                  <span>{kx}</span>
                </div>
              </div>

              {/* Right Column: Score, Grade & Affordance */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div className="text-right flex items-center gap-2">
                  <span
                    className={`font-bold text-body-s tnum ${
                      isSecure ? "text-sms-green" : isCritical ? "text-sms-red" : "text-sms-amber"
                    }`}
                  >
                    {s.session_score}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.2 rounded-tag ${
                      isSecure
                        ? "bg-sms-green-dim text-sms-green"
                        : isCritical
                        ? "bg-sms-red-dim text-sms-red"
                        : "bg-sms-amber-dim text-sms-amber"
                    }`}
                  >
                    {s.session_grade}
                  </span>
                  <span className="text-meta text-sms-text-muted hidden lg:inline ml-1 uppercase">
                    {s.starttls_stripped
                      ? "STRIPTLS"
                      : isSecure
                      ? "SECURE"
                      : "DOWNGRADE"}
                  </span>
                </div>

                <div className="w-6 h-6 rounded-tag flex items-center justify-center text-sms-text-muted group-hover:text-sms-cyan transition-fast">
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
