"use client";

import { useState, useMemo } from "react";
import { Session } from "@/lib/types";
import { KeyRound, ArrowRight } from "lucide-react";
import { CertificatesListPane } from "./certificates-list-pane";
import { CertificateMetadataLedger } from "./certificate-metadata-ledger";

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
      <div className="border-b border-tactical-border/80 bg-tactical-surface px-6 py-3 min-h-[54px] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-4 h-4 text-phosphor-cyan" />
          <span className="text-[15px] font-sans font-bold text-tactical-text uppercase tracking-wider">
            X.509 CERTIFICATE WORKSPACE
          </span>
          <span className="text-[13px] text-tactical-dim font-mono">
            {"// "}{certItems.length} LEAF CERTIFICATES DISSECTED
          </span>
        </div>
        <div className="text-[12px] text-tactical-dim">
          * Leaf cryptographic properties verified. Chain-of-trust not asserted without local PKI bundle.
        </div>
      </div>

      {/* 2. Split Workspace (Left: Certificate List | Right: Deep X.509 Metadata) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Certificate List */}
        <CertificatesListPane
          certItems={certItems}
          selectedIdx={selectedIdx}
          onSelectIdx={setSelectedIdx}
        />

        {/* Right: Selected Certificate Deep Metadata */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-5 bg-tactical-bg">
          {activeItem ? (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-start justify-between border-b border-tactical-border/70 pb-4">
                <div>
                  <span className="text-[12px] uppercase tracking-widest text-tactical-dim font-bold block">
                    LEAF CERTIFICATE PROPERTIES
                  </span>
                  <h3 className="text-[22px] font-sans font-bold text-tactical-text mt-1">
                    {activeItem.cert.subject_cn}
                  </h3>
                  <div className="text-[13px] text-tactical-dim font-mono mt-0.5">
                    Inspected on Flow #{activeItem.sessionId} ({activeItem.protocol})
                  </div>
                </div>

                <button
                  onClick={() => onOpenSessionDetail(activeItem.sessionId)}
                  className="px-4 py-2 border border-tactical-border bg-tactical-elevated hover:border-phosphor-cyan text-tactical-text text-[13px] font-bold uppercase inline-flex items-center gap-2 transition-colors"
                >
                  <span>INSPECT FLOW</span>
                  <ArrowRight className="w-3.5 h-3.5 text-phosphor-cyan" />
                </button>
              </div>

              {/* High-Density Forensic Properties Ledger (Zero Cards) */}
              <CertificateMetadataLedger cert={activeItem.cert} />
            </div>
          ) : (
            <div className="text-[14px] text-tactical-dim py-12 text-center">
              No X.509 certificate selected.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
