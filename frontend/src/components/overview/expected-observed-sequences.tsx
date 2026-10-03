"use client";

import { Session } from "@/lib/types";

interface ExpectedObservedSequencesProps {
  session: Session;
  isHardened: boolean;
  isClear: boolean;
}

export function ExpectedObservedSequences({
  session,
  isHardened,
  isClear,
}: ExpectedObservedSequencesProps) {
  return (
    <div className="lg:col-span-6 space-y-3.5 lg:border-l border-tactical-border/40 lg:pl-8">
      {/* Expected sequence */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-tactical-dim font-bold">
          <span className="text-phosphor-green font-bold">✓</span>
          <span>EXPECTED ON THE WIRE</span>
        </div>
        <div className="py-2.5 px-3.5 bg-tactical-surface border-l-2 border-phosphor-green text-[15px] font-mono flex items-center gap-2 flex-wrap text-tactical-text">
          <span className="text-tactical-text font-bold">EHLO</span>
          <span className="text-tactical-muted">&rarr;</span>
          <span className="text-tactical-text font-bold">STARTTLS</span>
          <span className="text-tactical-muted">&rarr;</span>
          <span className="text-tactical-text font-bold">TLS HANDSHAKE</span>
          <span className="text-tactical-muted">&rarr;</span>
          <span className="text-phosphor-green font-bold text-[16px]">ENCRYPTED DATA</span>
        </div>
      </div>

      {/* Observed sequence */}
      <div className="space-y-1">
        <div className={`flex items-center gap-2 text-[13px] uppercase tracking-widest font-bold ${isHardened ? "text-phosphor-green" : "text-phosphor-hazard"}`}>
          <span>{isHardened ? "✓" : "✕"}</span>
          <span>OBSERVED ON THE WIRE</span>
        </div>
        <div className={`py-2.5 px-3.5 bg-tactical-surface border-l-2 text-[15px] font-mono flex items-center gap-2 flex-wrap ${isHardened ? "border-phosphor-green" : "border-phosphor-hazard"}`}>
          <span className="text-tactical-text font-bold">EHLO</span>
          <span className="text-tactical-muted">&rarr;</span>
          {isHardened ? (
            <>
              <span className="text-phosphor-green font-bold text-[16px]">TLS 1.3 HANDSHAKE ✓</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-phosphor-green font-bold text-[16px]">AES-256-GCM ENCRYPTED</span>
            </>
          ) : isClear ? (
            <>
              <span className="text-phosphor-hazard font-bold text-[16px]">STARTTLS BYPASSED ✕</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-phosphor-hazard font-bold text-[16px] underline">PLAINTEXT AUTH</span>
            </>
          ) : (
            <>
              <span className="text-phosphor-amber font-bold text-[16px]">TLS 1.0 (0x0301) ✕</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-phosphor-hazard font-bold text-[16px]">3DES-EDE-CBC ✕</span>
            </>
          )}
        </div>
      </div>

      {/* Wire evidence footer */}
      <div className="text-[13px] text-tactical-dim pt-1 flex items-center justify-between border-t border-tactical-border/40">
        <span>PACKET WIRE EVIDENCE: OFFSET 0x00000000</span>
        <span className={isHardened ? "text-phosphor-green font-semibold" : "text-phosphor-cyan font-semibold"}>
          {isHardened ? "CIPHER: TLS_AES_256_GCM_SHA384" : session.is_encrypted ? "LEGACY TLS RECORD (0x16 0x0301)" : "ZERO TLS RECORD HEADERS (0x16 0x03)"}
        </span>
      </div>
    </div>
  );
}
