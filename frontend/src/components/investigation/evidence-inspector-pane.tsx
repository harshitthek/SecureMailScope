"use client";

import { Session, ProtocolStateStep } from "@/lib/types";

interface EvidenceInspectorPaneProps {
  session: Session;
  selectedStep: ProtocolStateStep | null;
}

export function EvidenceInspectorPane({
  session,
  selectedStep,
}: EvidenceInspectorPaneProps) {
  const isDowngrade = session.starttls_stripped || !session.is_encrypted;
  const findingTitle = isDowngrade
    ? "STARTTLS DOWNGRADE DETECTED"
    : session.tls_version === "TLS 1.0"
    ? "DEPRECATED TLS 1.0 NEGOTIATION"
    : "SECURE CIPHER NEGOTIATION";

  const cert = session.certificate;

  return (
    <aside className="w-96 min-w-[320px] max-w-[380px] bg-tactical-surface flex flex-col overflow-y-auto select-none font-mono">
      <div className="px-4 py-3 border-b border-tactical-border/70 text-[10px] uppercase tracking-widest text-tactical-dim font-bold flex items-center justify-between">
        <span>EVIDENCE INSPECTOR</span>
        <span className="text-phosphor-cyan font-bold">
          {selectedStep ? `PHASE ${selectedStep.step}` : "OVERVIEW"}
        </span>
      </div>

      <div className="p-5 space-y-5 text-xs">
        {/* Finding Headline */}
        <div>
          <span className="text-[10px] text-tactical-dim uppercase tracking-wider block">
            CRYPTOGRAPHIC FINDING
          </span>
          <h4 className="text-sm font-sans font-bold text-white uppercase mt-0.5">
            {findingTitle}
          </h4>
        </div>

        {/* Technical Wire Parameters */}
        <div className="space-y-2.5 border-t border-tactical-border/50 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-tactical-dim">Protocol:</span>
            <span className="text-white font-bold">{session.protocol}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-tactical-dim">Target Port:</span>
            <span className="text-white font-bold">:{session.dst_port}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-tactical-dim">TLS Version:</span>
            <span
              className={`font-bold ${
                !session.is_encrypted
                  ? "text-phosphor-hazard"
                  : session.tls_version === "TLS 1.3"
                  ? "text-phosphor-green"
                  : "text-phosphor-amber"
              }`}
            >
              {session.tls_version || "CLEAR"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-tactical-dim">Cipher Suite:</span>
            <span className="text-white font-bold truncate max-w-[200px]" title={session.cipher_suite_name || "NONE"}>
              {session.cipher_suite_name || "NONE"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-tactical-dim">Forward Secrecy:</span>
            <span
              className={`font-bold ${
                session.has_forward_secrecy
                  ? "text-phosphor-green"
                  : "text-phosphor-hazard"
              }`}
            >
              {session.has_forward_secrecy ? "ECDHE / DHE" : "NONE"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-tactical-dim">JA3 Fingerprint:</span>
            <span className="text-phosphor-cyan font-bold truncate max-w-[190px]" title={session.ja3_hash || "N/A"}>
              {session.ja3_hash ? session.ja3_hash.slice(0, 16) + "..." : "NONE (CLEARTEXT)"}
            </span>
          </div>
        </div>

        {/* Dynamic Event Context when Step is Selected */}
        {selectedStep && (
          <div className="p-3 bg-black/40 border border-tactical-border/70 space-y-1.5">
            <div className="text-[10px] uppercase text-tactical-dim font-bold flex items-center justify-between">
              <span>SELECTED EVENT</span>
              <span className="text-phosphor-cyan">PHASE {selectedStep.step}</span>
            </div>
            <div className="font-sans font-bold text-white uppercase text-xs">
              {selectedStep.phase}
            </div>
            <p className="text-[11px] text-tactical-text leading-relaxed">
              {selectedStep.summary}
            </p>
          </div>
        )}

        {/* Wire Evidence Excerpt */}
        <div className="space-y-2 border-t border-tactical-border/50 pt-3">
          <span className="text-[10px] text-tactical-dim uppercase tracking-wider block font-bold">
            WIRE PROOF EXCERPT
          </span>
          <div className="p-3 bg-black/50 border border-tactical-border/60 text-[11px] text-tactical-text leading-relaxed">
            {!session.is_encrypted
              ? "STARTTLS command was not issued following EHLO. Cleartext client credentials detected in payload prior to any cryptographic record handshake."
              : `Handshake established using ${session.tls_version} with cipher ${session.cipher_suite_name}.`}
          </div>
        </div>

        {/* X.509 Certificate Evidence if available */}
        {cert && (
          <div className="space-y-2 border-t border-tactical-border/50 pt-3">
            <span className="text-[10px] text-tactical-dim uppercase tracking-wider block font-bold">
              X.509 LEAF CERTIFICATE
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="truncate"><span className="text-tactical-dim">Subject:</span> <span className="text-white">{cert.subject_cn}</span></div>
              <div className="truncate"><span className="text-tactical-dim">Issuer:</span> <span className="text-white">{cert.issuer_cn}</span></div>
              <div>
                <span className="text-tactical-dim">Expiry Status:</span>{" "}
                <span className={cert.is_expired ? "text-phosphor-hazard font-bold" : "text-phosphor-green font-bold"}>
                  {cert.is_expired ? "EXPIRED" : "VALID"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
