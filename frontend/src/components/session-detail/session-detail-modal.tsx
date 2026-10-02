"use client";

import { Session, SessionDetailTab } from "@/lib/types";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  Binary,
  Layers,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

interface SessionDetailModalProps {
  session: Session | null;
  isOpen: boolean;
  activeTab: SessionDetailTab;
  onTabChange: (tab: SessionDetailTab) => void;
  onClose: () => void;
  onNavigateToDissector?: (streamId: number) => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  onNavigateToDissector,
}: SessionDetailModalProps) {
  if (!isOpen || !session) return null;

  const isCritical = session.session_score < 50 || session.session_severity === "critical";
  const cert = session.certificate;
  const inspection = session.forensic_inspection;

  const tabs: { id: SessionDetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "SUMMARY", label: "SUMMARY", icon: Layers },
    { id: "PROTOCOL_FLOW", label: "PROTOCOL FLOW", icon: ArrowRight },
    { id: "TLS", label: "TLS", icon: Lock },
    { id: "CERTIFICATE", label: "CERTIFICATE", icon: KeyRound },
    { id: "RAW_STREAM", label: "RAW STREAM", icon: Binary },
    { id: "STANDARDS", label: "STANDARDS", icon: FileCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-5xl h-[88vh] max-h-[840px] bg-tactical-surface border border-tactical-borderHighlight flex flex-col shadow-2xl text-tactical-text relative">
        {/* 1. Modal Header */}
        <div className="px-5 py-4 border-b border-tactical-border bg-black/60 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-10 h-10 border flex items-center justify-center flex-shrink-0 ${
                isCritical
                  ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 text-phosphor-hazard"
                  : "border-phosphor-green/60 bg-phosphor-green/10 text-phosphor-green"
              }`}
            >
              {isCritical ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-sans font-bold text-white tracking-wide truncate">
                  {session.server_name || "TARGET HOST"}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 border border-tactical-border bg-tactical-elevated text-phosphor-cyan font-bold">
                  {session.protocol}
                </span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 border font-bold ${
                    isCritical
                      ? "border-phosphor-hazard/50 bg-phosphor-hazard/15 text-phosphor-hazard"
                      : "border-phosphor-green/50 bg-phosphor-green/15 text-phosphor-green"
                  }`}
                >
                  SCORE: {session.session_score} ({session.session_grade})
                </span>
              </div>
              <div className="text-xs font-mono text-tactical-dim flex items-center gap-2 mt-1">
                <span>FLOW VECTOR:</span>
                <span className="text-tactical-text font-bold">
                  {session.src_ip}:{session.src_port} &rarr; {session.dst_ip}:{session.dst_port}
                </span>
                <span>•</span>
                <span>TIME: {session.timestamp?.slice(11, 19) || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {onNavigateToDissector && (
              <button
                onClick={() => onNavigateToDissector(session.session_id)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-phosphor-cyan/60 bg-phosphor-cyan/10 hover:bg-phosphor-cyan/20 active:translate-y-[1px] text-phosphor-cyan text-xs font-bold transition-all"
              >
                <Binary className="w-3.5 h-3.5" />
                <span>FULL DISSECTOR</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 border border-tactical-border hover:border-white text-tactical-dim hover:text-white bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center border-b border-tactical-border bg-black/30 px-3 overflow-x-auto flex-shrink-0 font-mono">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-phosphor-cyan text-white bg-tactical-elevated/50"
                    : "border-transparent text-tactical-dim hover:text-white hover:bg-tactical-surfaceHover"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-phosphor-cyan" : "text-tactical-dim"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: SUMMARY */}
          {activeTab === "SUMMARY" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Findings & Evidence */}
                <div className="border border-tactical-border bg-tactical-bg p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs font-bold text-white">
                    <span>FORENSIC FINDING SUMMARY</span>
                    <span className={`px-2 py-0.5 border text-[10px] ${
                      isCritical ? "border-phosphor-hazard text-phosphor-hazard" : "border-phosphor-green text-phosphor-green"
                    }`}>
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
                    <div className="border border-tactical-border bg-black/40 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-tactical-dim">Negotiated Protocol:</span>
                        <span className="text-white font-bold">{session.tls_version || "TLS 1.2"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-tactical-dim">Cipher Suite:</span>
                        <span className="text-white font-bold">{session.cipher_suite_name || "N/A"}</span>
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
                  <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs font-bold text-white">
                    <span>SCORING PENALTY DEDUCTION LEDGER</span>
                    <span className="text-xs text-tactical-dim">NIST FORMULA</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
                      <span className="text-tactical-dim">Protocol Penalty (V_proto):</span>
                      <span className={`font-bold tabular-nums ${session.scoring_breakdown.protocol_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                        -{session.scoring_breakdown.protocol_penalty} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
                      <span className="text-tactical-dim">Cipher Penalty (V_cipher):</span>
                      <span className={`font-bold tabular-nums ${session.scoring_breakdown.cipher_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                        -{session.scoring_breakdown.cipher_penalty} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
                      <span className="text-tactical-dim">Forward Secrecy Penalty (V_pfs):</span>
                      <span className={`font-bold tabular-nums ${session.scoring_breakdown.pfs_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                        -{session.scoring_breakdown.pfs_penalty} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
                      <span className="text-tactical-dim">Certificate Penalty (V_cert):</span>
                      <span className={`font-bold tabular-nums ${session.scoring_breakdown.cert_penalty > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                        -{session.scoring_breakdown.cert_penalty} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-tactical-border/50">
                      <span className="text-tactical-dim">Anomaly / JA3 Penalty (V_anom):</span>
                      <span className={`font-bold tabular-nums ${session.scoring_breakdown.anomaly_penalty > 0 ? "text-phosphor-amber" : "text-tactical-dim"}`}>
                        -{session.scoring_breakdown.anomaly_penalty} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 text-sm font-bold">
                      <span className="text-white">FINAL SESSION SCORE:</span>
                      <span className={`tabular-nums ${isCritical ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                        {session.session_score} / 100 ({session.session_grade})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROTOCOL FLOW */}
          {activeTab === "PROTOCOL_FLOW" && (
            <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs">
                <span className="font-bold text-white uppercase">RECONSTRUCTED PROTOCOL STATE MACHINE</span>
                <span className="text-tactical-dim">SEQUENTIAL FORENSIC TIMELINE</span>
              </div>

              {/* Vertical State Timeline */}
              <div className="space-y-3 relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-tactical-border">
                {inspection?.state_timeline && inspection.state_timeline.length > 0 ? (
                  inspection.state_timeline.map((step) => {
                    const isDowngrade = step.status === "downgrade" || step.status === "compromised";
                    const isSecure = step.status === "secure";
                    return (
                      <div key={step.step} className="relative group">
                        {/* Square mechanical indicator on timeline */}
                        <div
                          className={`absolute -left-6 top-2 w-3.5 h-3.5 border-2 ${
                            isDowngrade
                              ? "bg-phosphor-hazard border-black"
                              : isSecure
                              ? "bg-phosphor-green border-black"
                              : "bg-tactical-borderHighlight border-black"
                          }`}
                        />
                        <div
                          className={`border p-3.5 ${
                            isDowngrade
                              ? "border-phosphor-hazard/60 bg-phosphor-hazard/10"
                              : isSecure
                              ? "border-phosphor-green/40 bg-phosphor-green/5"
                              : "border-tactical-border bg-black/40"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[10px] px-1.5 py-0.2 border border-tactical-border bg-tactical-elevated text-tactical-dim">
                                STEP {step.step}
                              </span>
                              <span className="font-bold text-white tracking-wide">{step.phase}</span>
                              <span className="text-[10px] text-tactical-dim">[{step.direction}]</span>
                            </div>
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 border ${
                                isDowngrade
                                  ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/20"
                                  : isSecure
                                  ? "border-phosphor-green text-phosphor-green bg-phosphor-green/20"
                                  : "border-tactical-border text-tactical-dim"
                              }`}
                            >
                              {step.status}
                            </span>
                          </div>
                          <p className="text-xs text-tactical-text mt-1">{step.summary}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-tactical-dim py-4">
                    Standard TCP handshake completed. Reconstructed stream payload contains {session.protocol} exchange.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TLS */}
          {activeTab === "TLS" && (
            <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
              <div className="border-b border-tactical-border pb-2 text-xs font-bold text-white uppercase">
                CRYPTOGRAPHIC PARAMETERS &amp; HANDSHAKE DISSECTION
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="p-3 border border-tactical-border bg-black/40 space-y-1.5">
                    <span className="text-[10px] uppercase text-tactical-dim font-bold block">Protocol Version</span>
                    <div className="text-sm font-bold text-white">{session.tls_version || "None (Plaintext)"}</div>
                    <div className="text-xs text-tactical-dim">
                      {session.tls_version === "TLS 1.3"
                        ? "RFC 8446 Hardened modern standard"
                        : session.tls_version === "TLS 1.2"
                        ? "NIST SP 800-52r2 baseline compliant"
                        : "RFC 8996 Prohibited / Insecure"}
                    </div>
                  </div>

                  <div className="p-3 border border-tactical-border bg-black/40 space-y-1.5">
                    <span className="text-[10px] uppercase text-tactical-dim font-bold block">Negotiated Cipher Suite</span>
                    <div className="text-sm font-bold text-phosphor-cyan break-all">
                      {session.cipher_suite_name || "None (Cleartext Fallback)"}
                    </div>
                    <div className="text-xs text-tactical-dim">
                      IANA Hex ID: <span className="text-tactical-text font-bold">{session.cipher_suite_hex || "0x0000"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border border-tactical-border bg-black/40 space-y-1.5">
                    <span className="text-[10px] uppercase text-tactical-dim font-bold block">Key Exchange &amp; PFS</span>
                    <div className="text-sm font-bold text-white">{session.key_exchange || "None"}</div>
                    <div className={session.has_forward_secrecy ? "text-phosphor-green font-bold text-xs" : "text-phosphor-hazard font-bold text-xs"}>
                      {session.has_forward_secrecy ? "✓ Ephemeral Key Exchange (PFS Enforced)" : "✗ Static Key Exchange (No Forward Secrecy)"}
                    </div>
                  </div>

                  <div className="p-3 border border-tactical-border bg-black/40 space-y-1.5">
                    <span className="text-[10px] uppercase text-tactical-dim font-bold block">JA3 Client Fingerprint</span>
                    <div className="text-xs font-mono text-tactical-text truncate" title={session.ja3_hash || ""}>
                      {session.ja3_hash || "No ClientHello JA3 Available"}
                    </div>
                    <div className="text-xs text-tactical-dim">
                      Signature Profile:{" "}
                      <span className={session.ja3_is_known ? "text-phosphor-green font-bold" : "text-phosphor-amber font-bold"}>
                        {session.ja3_client_name || "Unknown / Unregistered Client"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFICATE */}
          {activeTab === "CERTIFICATE" && (
            <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs">
                <span className="font-bold text-white uppercase">X.509 SERVER CERTIFICATE INSPECTION</span>
                <span className="text-[10px] text-tactical-dim italic">
                  Cryptographic properties verified from leaf certificate. CA trust chain not asserted.
                </span>
              </div>

              {cert ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div className="p-3 border border-tactical-border bg-black/40 space-y-1">
                      <span className="text-[10px] uppercase text-tactical-dim font-bold block">Subject Common Name (CN)</span>
                      <div className="text-sm font-bold text-white break-all">{cert.subject_cn}</div>
                    </div>

                    <div className="p-3 border border-tactical-border bg-black/40 space-y-1">
                      <span className="text-[10px] uppercase text-tactical-dim font-bold block">Issuer Common Name (CA)</span>
                      <div className="text-xs font-bold text-tactical-text break-all">{cert.issuer_cn}</div>
                    </div>

                    <div className="p-3 border border-tactical-border bg-black/40 space-y-1">
                      <span className="text-[10px] uppercase text-tactical-dim font-bold block">Validity Window</span>
                      <div className="text-xs text-tactical-text">
                        <div>Not Before: {cert.not_before}</div>
                        <div>Not After: {cert.not_after}</div>
                        <div className={`mt-1 font-bold ${cert.is_expired ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                          {cert.is_expired ? `EXPIRED (${cert.days_remaining} days)` : `VALID (${cert.days_remaining} days remaining)`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border border-tactical-border bg-black/40 space-y-1">
                      <span className="text-[10px] uppercase text-tactical-dim font-bold block">Public Key &amp; Size</span>
                      <div className="text-sm font-bold text-white">
                        {cert.public_key_type} {cert.public_key_bits}-bit
                      </div>
                      <div className={cert.is_weak_key ? "text-phosphor-hazard font-bold text-xs" : "text-phosphor-green font-bold text-xs"}>
                        {cert.is_weak_key ? "✗ WEAK KEY: Below 2048-bit minimum requirements" : "✓ Meets NIST minimum key length"}
                      </div>
                    </div>

                    <div className="p-3 border border-tactical-border bg-black/40 space-y-1">
                      <span className="text-[10px] uppercase text-tactical-dim font-bold block">Signature Algorithm</span>
                      <div className="text-xs font-bold text-tactical-text">{cert.signature_algorithm}</div>
                      <div className={cert.is_weak_signature ? "text-phosphor-hazard font-bold text-xs" : "text-phosphor-green font-bold text-xs"}>
                        {cert.is_weak_signature ? "✗ DEPRECATED HASH (MD5/SHA-1)" : `✓ Secure Hash (${cert.signature_hash})`}
                      </div>
                    </div>

                    <div className="p-3 border border-tactical-border bg-black/40 space-y-1">
                      <span className="text-[10px] uppercase text-tactical-dim font-bold block">Self-Signed Status</span>
                      <div className={cert.is_self_signed ? "text-phosphor-hazard font-bold text-xs" : "text-phosphor-green font-bold text-xs"}>
                        {cert.is_self_signed ? "✗ Self-signed leaf certificate" : "✓ Third-party issued certificate"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-tactical-dim border border-tactical-border">
                  No X.509 certificate was negotiated in this session (unencrypted or incomplete handshake).
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RAW STREAM */}
          {activeTab === "RAW_STREAM" && (
            <div className="border border-tactical-border bg-tactical-bg p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs">
                <span className="font-bold text-white uppercase">DISSECTED WIRE STREAM (HEX / ASCII)</span>
                <span className="text-[10px] text-tactical-dim">RECORD LAYER BYTE BOUNDARIES</span>
              </div>

              {inspection?.raw_chunks && inspection.raw_chunks.length > 0 ? (
                <div className="space-y-2 overflow-x-auto">
                  {inspection.raw_chunks.map((chunk, idx) => {
                    const isHazard = chunk.highlight_type === "danger";
                    const isSecure = chunk.highlight_type === "secure";
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 border font-mono text-xs ${
                          isHazard
                            ? "border-phosphor-hazard/50 bg-phosphor-hazard/10"
                            : isSecure
                            ? "border-phosphor-green/40 bg-phosphor-green/5"
                            : "border-tactical-border bg-black/40"
                        }`}
                      >
                        {chunk.highlight_label && (
                          <div
                            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                              isHazard ? "text-phosphor-hazard" : isSecure ? "text-phosphor-green" : "text-phosphor-cyan"
                            }`}
                          >
                            &gt;&gt;&gt; {chunk.highlight_label}
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <span className="text-phosphor-cyan text-[11px] font-bold select-none">{chunk.offset}</span>
                          <span className="text-white text-xs select-all flex-1 tracking-wider">{chunk.hex}</span>
                          <span className="text-tactical-dim text-xs select-all font-mono border-l border-tactical-border pl-3">
                            {chunk.ascii}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-tactical-dim py-4">
                  Raw packet disassembly buffer empty for this stream.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STANDARDS */}
          {activeTab === "STANDARDS" && (
            <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
              <div className="border-b border-tactical-border pb-2 text-xs font-bold text-white uppercase">
                STATUTORY COMPLIANCE AUDIT MAPPING
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Rule 1: NIST SP 800-52r2 TLS Version */}
                <div className="p-3 border border-tactical-border bg-black/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">NIST SP 800-52r2 Section 3.2.1: TLS Protocol Version</span>
                    <span className="text-tactical-dim text-[11px]">Minimum TLS 1.2 required. TLS 1.0/1.1 and SSL prohibited.</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 border text-xs ${
                      session.tls_version === "TLS 1.3" || session.tls_version === "TLS 1.2"
                        ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                    }`}
                  >
                    {session.tls_version === "TLS 1.3" || session.tls_version === "TLS 1.2" ? "PASS" : "FAIL"}
                  </span>
                </div>

                {/* Rule 2: Ephemeral Forward Secrecy */}
                <div className="p-3 border border-tactical-border bg-black/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">NIST SP 800-52r2 Section 3.3.1: Perfect Forward Secrecy</span>
                    <span className="text-tactical-dim text-[11px]">ECDHE or DHE key exchange mandatory. Static RSA prohibited.</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 border text-xs ${
                      session.has_forward_secrecy
                        ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                    }`}
                  >
                    {session.has_forward_secrecy ? "PASS" : "FAIL"}
                  </span>
                </div>

                {/* Rule 3: RFC 8314 Implicit TLS */}
                <div className="p-3 border border-tactical-border bg-black/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">RFC 8314 Section 3: Implicit TLS Mandate</span>
                    <span className="text-tactical-dim text-[11px]">Opportunistic STARTTLS discouraged; dedicated ports (465/993/995) required.</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 border text-xs ${
                      [465, 993, 995].includes(session.dst_port)
                        ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                    }`}
                  >
                    {[465, 993, 995].includes(session.dst_port) ? "PASS" : "WARN (EXPLICIT)"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
