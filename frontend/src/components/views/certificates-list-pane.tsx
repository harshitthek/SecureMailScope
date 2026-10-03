"use client";

import { CertificateInfo } from "@/lib/types";

export interface CertItem {
  sessionId: number;
  serverName?: string;
  protocol: string;
  cert: CertificateInfo;
}

interface CertificatesListPaneProps {
  certItems: CertItem[];
  selectedIdx: number;
  onSelectIdx: (idx: number) => void;
}

export function CertificatesListPane({
  certItems,
  selectedIdx,
  onSelectIdx,
}: CertificatesListPaneProps) {
  return (
    <aside className="w-80 min-w-[260px] max-w-[320px] border-r border-tactical-border/70 bg-tactical-surface/40 flex flex-col overflow-y-auto">
      <div className="px-4 py-2.5 border-b border-tactical-border/70 text-[12px] uppercase tracking-widest text-tactical-dim font-bold flex items-center justify-between">
        <span>EXTRACTED CERTIFICATES</span>
        <span className="text-phosphor-cyan font-bold text-[13px]">{certItems.length} CERTS</span>
      </div>

      <div className="divide-y divide-tactical-border/30">
        {certItems.map((item, idx) => {
          const isSelected = idx === selectedIdx;
          const { cert } = item;
          const hasIssues = cert.is_expired || cert.is_weak_key || cert.is_weak_signature;

          return (
            <button
              key={item.sessionId}
              onClick={() => onSelectIdx(idx)}
              className={`w-full p-4 text-left transition-colors border-l-2 ${
                isSelected
                  ? "bg-tactical-elevated border-phosphor-cyan text-tactical-text shadow-[inset_2px_0_6px_rgba(0,216,246,0.15)]"
                  : "border-transparent text-tactical-text hover:bg-tactical-surfaceHover"
              }`}
            >
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-[14px] font-bold text-tactical-text font-mono">
                  FLOW #{item.sessionId < 10 ? `0${item.sessionId}` : item.sessionId} ({item.protocol})
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 border ${
                    hasIssues
                      ? "border-phosphor-hazard/60 text-phosphor-hazard bg-phosphor-hazard/10"
                      : "border-phosphor-green/60 text-phosphor-green bg-phosphor-green/10"
                  }`}
                >
                  {hasIssues ? "DEFICIENT" : "VALID"}
                </span>
              </div>

              <div className="font-sans font-bold text-[14px] text-tactical-text truncate" title={cert.subject_cn}>
                {cert.subject_cn}
              </div>
              <div className="text-[12px] text-tactical-dim truncate mt-0.5" title={cert.issuer_cn}>
                Issuer: {cert.issuer_cn}
              </div>

              {cert.is_expired && (
                <span className="text-[11px] text-phosphor-hazard font-bold mt-1.5 block">
                  ⚠ EXPIRED ({Math.abs(cert.days_remaining)} DAYS AGO)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
