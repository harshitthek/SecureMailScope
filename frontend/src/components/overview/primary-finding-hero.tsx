"use client";

import { useMemo } from "react";
import { Session, Vulnerability } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { ExpectedObservedSequences } from "./expected-observed-sequences";

interface PrimaryFindingHeroProps {
  vulnerabilities: Vulnerability[];
  sessions: Session[];
  onInspectFlow: (sessionId: number) => void;
}

function getFindingMeta(s: Session, topVuln: Vulnerability | null) {
  const isHardened = !topVuln && s.session_score >= 80;
  const isClear = s.starttls_stripped || !s.is_encrypted;
  const is3Des = s.cipher_suite_name?.includes("3DES") || s.tls_version === "TLS 1.0";
  const title = isHardened ? "CRYPTOGRAPHIC BASELINE ENFORCED"
    : isClear ? "STARTTLS DOWNGRADE DETECTED"
    : is3Des ? "DEPRECATED 3DES CIPHER & RSA"
    : s.certificate?.is_expired ? "EXPIRED X.509 CERTIFICATE"
    : (topVuln?.title || "PROTOCOL ANOMALY DETECTED");

  const narrative = isHardened
    ? "All reconstructed sessions enforce TLS 1.3/1.2 AEAD encryption and perfect forward secrecy. Zero unencrypted credentials detected on wire."
    : isClear
    ? "STARTTLS capability was omitted/stripped before authentication. The mail client transmitted plaintext credentials without TLS encryption."
    : is3Des
    ? "Session negotiated deprecated TLS 1.0 with 3DES cipher suite. Vulnerable to Sweet32 attack (CVE-2016-2183) and lacks forward secrecy."
    : s.certificate?.is_expired
    ? `Target server certificate expired ${Math.abs(s.certificate?.days_remaining || 0)} days ago. Subject: ${s.certificate?.subject_cn}.`
    : (topVuln?.description || "Cryptographic baseline violation recorded in session wire stream.");

  return { isHardened, isClear, title, narrative };
}

export function PrimaryFindingHero({
  vulnerabilities,
  sessions,
  onInspectFlow,
}: PrimaryFindingHeroProps) {
  const topCriticalVuln = useMemo(() => {
    return vulnerabilities.find((v) => v.severity === "critical") || vulnerabilities.find((v) => v.severity === "high") || null;
  }, [vulnerabilities]);

  const affectedSession = useMemo(() => {
    if (!topCriticalVuln || !topCriticalVuln.affected_sessions?.length) {
      return sessions.find((s) => s.session_score === 0 || s.starttls_stripped) || sessions.find((s) => s.session_score < 70) || sessions[0] || null;
    }
    const sessId = topCriticalVuln.affected_sessions[0];
    return sessions.find((s) => s.session_id === sessId) || sessions[0] || null;
  }, [topCriticalVuln, sessions]);

  if (!affectedSession) return null;

  const { isHardened, isClear, title, narrative } = getFindingMeta(affectedSession, topCriticalVuln);
  const flowIdStr = affectedSession.session_id < 10 ? `0${affectedSession.session_id}` : `${affectedSession.session_id}`;

  return (
    <section className="w-full py-3 border-b border-tactical-border/40 select-none font-mono">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2.5 h-2.5 ${isHardened ? "bg-phosphor-green" : "bg-phosphor-hazard"}`} />
        <span className={`text-[12px] tracking-widest font-bold uppercase ${isHardened ? "text-phosphor-green" : "text-phosphor-hazard"}`}>
          {isHardened ? "VERIFIED CRYPTOGRAPHIC BASELINE" : "PRIMARY FORENSIC FINDING"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Headline & Wire Coordinates */}
        <div className="lg:col-span-6 space-y-2.5">
          <div>
            <h2 className="text-[clamp(24px,2.4vw,32px)] font-sans font-black text-tactical-text tracking-tight uppercase leading-none">
              {title}
            </h2>
            <div className="mt-1.5 pt-1.5 border-t border-tactical-border/40 text-[13px] text-tactical-dim flex items-center gap-2.5">
              <span className="text-tactical-text font-bold">FLOW {flowIdStr}</span>
              <span className="text-tactical-muted">·</span>
              <span className="text-phosphor-cyan font-bold">{affectedSession.protocol} :{affectedSession.dst_port}</span>
              <span className="text-tactical-muted">·</span>
              <span className="text-tactical-text">{affectedSession.src_ip}:{affectedSession.src_port} &rarr; {affectedSession.dst_ip}:{affectedSession.dst_port}</span>
            </div>
          </div>

          <p className="text-[14px] font-sans text-tactical-text leading-relaxed">
            {narrative}
          </p>

          <div className="pt-0.5">
            <button
              onClick={() => onInspectFlow(affectedSession.session_id)}
              className={`h-[36px] px-4 font-sans font-bold text-[13px] tracking-wider uppercase flex items-center gap-2 transition-all active:translate-y-[1px] ${
                isHardened ? "bg-phosphor-green hover:bg-emerald-400 text-black" : "bg-phosphor-hazard hover:bg-red-600 text-black"
              }`}
            >
              <span>INSPECT FLOW {flowIdStr}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Protocol Divergence Sequences */}
        <ExpectedObservedSequences
          session={affectedSession}
          isHardened={isHardened}
          isClear={isClear}
        />
      </div>
    </section>
  );
}
