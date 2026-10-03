"use client";

import { useState } from "react";
import { Session, ProtocolStateStep } from "@/lib/types";
import { ChevronRight, ChevronDown } from "lucide-react";

interface DissectorProtocolTreeProps {
  session: Session;
  currentStep?: ProtocolStateStep;
}

export function DissectorProtocolTree({
  session,
  currentStep,
}: DissectorProtocolTreeProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tcp: true,
    proto: true,
    crypto: true,
  });

  const toggle = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isVuln = session.session_score < 70 || session.starttls_stripped;
  const isDowngrade = session.starttls_stripped || !session.is_encrypted;

  return (
    <div className="h-56 min-h-[200px] max-h-[260px] flex flex-col bg-tactical-surface font-mono text-[13px] select-none overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-tactical-border/70 bg-tactical-elevated/40 flex items-center justify-between text-[12px] uppercase tracking-widest text-tactical-dim font-bold flex-shrink-0">
        <span>DISSECTED PROTOCOL STRUCT TREE</span>
        <span className={isVuln ? "text-phosphor-hazard font-bold" : "text-phosphor-green font-bold"}>
          {isVuln ? "VULNERABILITY DETECTED" : "NOMINAL STRUCT"}
        </span>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2 text-[13px]">
        {/* TCP Layer */}
        <div>
          <div
            onClick={() => toggle("tcp")}
            className="flex items-center gap-2 cursor-pointer text-tactical-text font-bold hover:text-phosphor-cyan py-0.5"
          >
            {openSections.tcp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>▾ Transmission Control Protocol, Src: {session.src_port}, Dst: {session.dst_port}</span>
          </div>
          {openSections.tcp && (
            <div className="pl-7 text-tactical-dim space-y-1 text-[12px]">
              <div>Source IP: {session.src_ip}</div>
              <div>Destination IP: {session.dst_ip}</div>
              <div>Destination Port: {session.dst_port} ({session.protocol})</div>
              <div>Stream Flags: [ACK, PSH] Nominal Transmission</div>
            </div>
          )}
        </div>

        {/* Application Protocol Layer */}
        <div>
          <div
            onClick={() => toggle("proto")}
            className="flex items-center gap-2 cursor-pointer text-tactical-text font-bold hover:text-phosphor-cyan py-0.5"
          >
            {openSections.proto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>▾ {session.protocol} Protocol Layer (Port {session.dst_port})</span>
          </div>
          {openSections.proto && (
            <div className="pl-7 space-y-1 text-[12px]">
              <div className="text-tactical-dim">Server Domain: {session.server_name || session.dst_ip}</div>
              {currentStep && (
                <div className="text-tactical-text">Active Step: [{currentStep.direction}] {currentStep.phase}</div>
              )}
              {isDowngrade ? (
                <div className="text-phosphor-hazard font-bold">
                  ▸ Warning: STARTTLS handshake was bypassed. Wire payload transmitted in cleartext.
                </div>
              ) : (
                <div className="text-phosphor-green">
                  ▸ TLS upgrade completed before application data transit.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cryptographic Security Layer */}
        <div>
          <div
            onClick={() => toggle("crypto")}
            className="flex items-center gap-2 cursor-pointer text-tactical-text font-bold hover:text-phosphor-cyan py-0.5"
          >
            {openSections.crypto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>▾ Cryptographic Posture &amp; Cipher Audit</span>
          </div>
          {openSections.crypto && (
            <div className="pl-7 space-y-1 text-[12px] text-tactical-dim">
              <div>Negotiated Version: <span className="text-tactical-text font-bold">{session.tls_version || "CLEARTEXT (NONE)"}</span></div>
              <div>Cipher Suite: <span className="text-tactical-text">{session.cipher_suite_name || "NONE"}</span></div>
              <div>Key Exchange: <span className={session.has_forward_secrecy ? "text-phosphor-green" : "text-phosphor-hazard"}>{session.key_exchange || "STATIC RSA (NO PFS)"}</span></div>
              <div>JA3 Client: <span className="text-phosphor-cyan">{session.ja3_client_name || session.ja3_hash || "N/A"}</span></div>
              {session.certificate?.is_expired && (
                <div className="text-phosphor-hazard font-bold">
                  ▸ Critical: Leaf certificate expired {Math.abs(session.certificate.days_remaining)} days ago.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
