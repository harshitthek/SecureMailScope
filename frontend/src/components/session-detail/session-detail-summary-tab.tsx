"use client";

import { Session } from "@/lib/types";
import { AlertTriangle, Unlock } from "lucide-react";

interface SessionDetailSummaryTabProps {
  session: Session;
  isCritical: boolean;
}

export function SessionDetailSummaryTab({
  session,
  isCritical,
}: SessionDetailSummaryTabProps) {
  const { scoring_breakdown } = session;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Findings & Evidence */}
        <div className="border border-tactical-border bg-tactical-bg p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs font-bold text-tactical-text">
            <span>FORENSIC FINDING SUMMARY</span>
            <span
              className={`px-2 py-0.5 border text-[10px] ${
                isCritical
                  ? "border-phosphor-hazard text-phosphor-hazard"
                  : "border-phosphor-green text-phosphor-green"
              }`}
            >
              {session.session_severity.toUpperCase()}
            </span>
          </div>

          {session.starttls_stripped && (
            <div className="border border-phosphor-hazard/40 bg-phosphor-hazard/10 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-phosphor-hazard text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>STRIPTLS / Cleartext Fallback Detected</span>
              </div>
              <p className="text-xs font-sans text-tactical-text leading-relaxed">
                Potential STARTTLS downgrade / cleartext fallback detected. Server greeting omitted 
                STARTTLS capability on submission port 587, resulting in unencrypted client credentials.
              </p>
            </div>
          )}

          {!session.is_encrypted && !session.starttls_stripped && (
            <div className="border border-phosphor-hazard/40 bg-phosphor-hazard/10 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-phosphor-hazard text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>Cleartext Wire Transmission</span>
              </div>
              <p className="text-xs font-sans text-tactical-text leading-relaxed">
                Session transmitted completely unencrypted on port {session.dst_port} ({session.protocol}).
                Sensitive email envelopes and credentials observed in cleartext.
              </p>
            </div>
          )}

          {session.is_encrypted && (
            <div className="border border-tactical-border bg-tactical-surface p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-tactical-dim">Negotiated Protocol:</span>
                <span className="text-tactical-text font-bold">{session.tls_version || "TLS 1.2"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tactical-dim">Cipher Suite:</span>
                <span className="text-tactical-text font-bold">{session.cipher_suite_name || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tactical-dim">Forward Secrecy:</span>
                <span className={session.has_forward_secrecy ? "text-phosphor-green font-bold" : "text-phosphor-hazard font-bold"}>
                  {session.has_forward_secrecy ? "ENABLED (ECDHE)" : "DISABLED (Static RSA)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mathematical Posture Scoring Deductions */}
        <div className="border border-tactical-border bg-tactical-bg p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs font-bold text-tactical-text">
            <span>SCORING PENALTY DEDUCTION LEDGER</span>
            <span className="text-xs text-tactical-dim">NIST FORMULA</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
              <span className="text-tactical-dim">Protocol Penalty (V_proto):</span>
              <span className={`font-bold tabular-nums ${scoring_breakdown.protocol_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                -{scoring_breakdown.protocol_penalty} pts
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
              <span className="text-tactical-dim">Cipher Penalty (V_cipher):</span>
              <span className={`font-bold tabular-nums ${scoring_breakdown.cipher_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                -{scoring_breakdown.cipher_penalty} pts
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
              <span className="text-tactical-dim">Forward Secrecy Penalty (V_pfs):</span>
              <span className={`font-bold tabular-nums ${scoring_breakdown.pfs_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                -{scoring_breakdown.pfs_penalty} pts
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
              <span className="text-tactical-dim">Certificate Penalty (V_cert):</span>
              <span className={`font-bold tabular-nums ${scoring_breakdown.cert_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                -{scoring_breakdown.cert_penalty} pts
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
              <span className="text-tactical-dim">Anomaly / JA3 Penalty (V_anom):</span>
              <span className={`font-bold tabular-nums ${scoring_breakdown.anomaly_penalty > 0 ? "text-phosphor-amber" : "text-tactical-dim"}`}>
                -{scoring_breakdown.anomaly_penalty} pts
              </span>
            </div>
            <div className="flex items-center justify-between pt-2.5 text-sm font-bold">
              <span className="text-tactical-text">FINAL SESSION SCORE:</span>
              <span className={`tabular-nums ${isCritical ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                {session.session_score} / 100 ({session.session_grade})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
