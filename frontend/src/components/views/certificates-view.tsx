"use client";

import { useState, useMemo } from "react";
import { Session } from "@/lib/types";
import { KeyRound, ArrowRight } from "lucide-react";

interface CertificatesViewProps {
  sessions: Session[];
  onOpenSessionDetail: (sessionId: number) => void;
}

export function CertificatesView({
  sessions,
  onOpenSessionDetail,
}: CertificatesViewProps) {
  const certItems = useMemo(() => {
    const list = [];
    for (const s of sessions) {
      if (s.certificate) {
        list.push({
          sessionId: s.session_id,
          serverName: s.server_name,
          protocol: s.protocol,
          cert: s.certificate,
        });
      }
    }
    return list;
  }, [sessions]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeItem = certItems[selectedIdx] || certItems[0] || null;

  return (
    <div className="h-full flex flex-col font-mono select-none overflow-hidden bg-tactical-bg">
      {/* 1. Header Ribbon */}
      <div className="border-b border-tactical-border/80 bg-tactical-surface px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-4 h-4 text-phosphor-cyan" />
          <span className="text-sm font-sans font-bold text-white uppercase tracking-wider">
            X.509 CERTIFICATE WORKSPACE
          </span>
          <span className="text-xs text-tactical-dim font-mono">
            {"// "}{certItems.length} LEAF CERTIFICATES DISSECTED
          </span>
        </div>
        <div className="text-[11px] text-tactical-dim">
          * Leaf cryptographic properties verified. Chain-of-trust not asserted without local PKI bundle.
        </div>
      </div>

      {/* 2. Split Workspace (Left: Certificate List | Right: Deep X.509 Metadata) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Certificate List */}
        <aside className="w-80 min-w-[280px] max-w-[340px] border-r border-tactical-border/70 bg-tactical-surface/40 flex flex-col overflow-y-auto">
          <div className="px-4 py-2.5 border-b border-tactical-border/70 text-[10px] uppercase tracking-widest text-tactical-dim font-bold flex items-center justify-between">
            <span>EXTRACTED CERTIFICATES</span>
            <span className="text-phosphor-cyan font-bold">{certItems.length} CERTS</span>
          </div>

          <div className="divide-y divide-tactical-border/30">
            {certItems.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              const { cert } = item;
              const hasIssues = cert.is_expired || cert.is_weak_key || cert.is_weak_signature;

              return (
                <button
                  key={item.sessionId}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full p-4 text-left transition-colors border-l-2 ${
                    isSelected
                      ? "bg-tactical-elevated border-phosphor-cyan text-white shadow-[inset_2px_0_6px_rgba(0,216,246,0.15)]"
                      : "border-transparent text-tactical-text hover:bg-tactical-surfaceHover"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-white font-mono">
                      FLOW #{item.sessionId < 10 ? `0${item.sessionId}` : item.sessionId} ({item.protocol})
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                        hasIssues
                          ? "border-phosphor-hazard/60 text-phosphor-hazard bg-phosphor-hazard/10"
                          : "border-phosphor-green/60 text-phosphor-green bg-phosphor-green/10"
                      }`}
                    >
                      {hasIssues ? "DEFICIENT" : "VALID"}
                    </span>
                  </div>

                  <div className="font-sans font-bold text-xs text-white truncate" title={cert.subject_cn}>
                    {cert.subject_cn}
                  </div>
                  <div className="text-[10px] text-tactical-dim truncate mt-0.5" title={cert.issuer_cn}>
                    Issuer: {cert.issuer_cn}
                  </div>

                  {cert.is_expired && (
                    <span className="text-[9px] text-phosphor-hazard font-bold mt-1.5 block">
                      ⚠ EXPIRED ({Math.abs(cert.days_remaining)} DAYS AGO)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Selected Certificate Deep Metadata */}
        <section className="flex-1 overflow-y-auto p-8 space-y-6 bg-black/30">
          {activeItem ? (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-start justify-between border-b border-tactical-border/70 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-tactical-dim font-bold block">
                    LEAF CERTIFICATE PROPERTIES
                  </span>
                  <h3 className="text-xl font-sans font-bold text-white mt-1">
                    {activeItem.cert.subject_cn}
                  </h3>
                  <div className="text-xs text-tactical-dim font-mono mt-0.5">
                    Inspected on Flow #{activeItem.sessionId} ({activeItem.protocol})
                  </div>
                </div>

                <button
                  onClick={() => onOpenSessionDetail(activeItem.sessionId)}
                  className="px-3.5 py-1.5 border border-tactical-border bg-tactical-elevated hover:border-phosphor-cyan text-white text-xs font-bold uppercase inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>INSPECT FLOW</span>
                  <ArrowRight className="w-3.5 h-3.5 text-phosphor-cyan" />
                </button>
              </div>

              {/* Exact Metadata Grid Required by Spec */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">SUBJECT</span>
                  <span className="text-white font-bold select-all break-all">{activeItem.cert.subject_cn}</span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">ISSUER</span>
                  <span className="text-white font-bold select-all break-all">{activeItem.cert.issuer_cn}</span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">VALID FROM</span>
                  <span className="text-tactical-text">{activeItem.cert.not_before || "N/A"}</span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">VALID TO</span>
                  <span className="text-tactical-text">{activeItem.cert.not_after || "N/A"}</span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">EXPIRED</span>
                  <span className={activeItem.cert.is_expired ? "text-phosphor-hazard font-bold" : "text-phosphor-green font-bold"}>
                    {activeItem.cert.is_expired ? `YES (${activeItem.cert.days_remaining}d remaining)` : "NO (VALID)"}
                  </span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">SIGNATURE ALGORITHM</span>
                  <span className={activeItem.cert.is_weak_signature ? "text-phosphor-hazard font-bold" : "text-white"}>
                    {activeItem.cert.signature_algorithm || activeItem.cert.signature_hash}
                    {activeItem.cert.is_weak_signature && " (WEAK)"}
                  </span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">PUBLIC KEY TYPE &amp; SIZE</span>
                  <span className={activeItem.cert.is_weak_key ? "text-phosphor-hazard font-bold" : "text-white"}>
                    {activeItem.cert.public_key_type} {activeItem.cert.public_key_bits} bits
                    {activeItem.cert.is_weak_key && " (WEAK < 2048b)"}
                  </span>
                </div>

                <div className="p-3.5 bg-tactical-surface border border-tactical-border/70 space-y-1">
                  <span className="text-[10px] text-tactical-dim uppercase block">SELF-SIGNED STATUS</span>
                  <span className={activeItem.cert.is_self_signed ? "text-phosphor-amber font-bold" : "text-tactical-text"}>
                    {activeItem.cert.is_self_signed ? "YES (SELF-SIGNED LEAF)" : "NO (CA ISSUED)"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-tactical-dim py-12 text-center">
              No X.509 certificate selected.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
