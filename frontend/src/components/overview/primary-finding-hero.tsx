"use client";

import { useMemo } from "react";
import { Session, Vulnerability } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface PrimaryFindingHeroProps {
  vulnerabilities: Vulnerability[];
  sessions: Session[];
  onInspectFlow: (sessionId: number) => void;
}

export function PrimaryFindingHero({
  vulnerabilities,
  sessions,
  onInspectFlow,
}: PrimaryFindingHeroProps) {
  const topCriticalVuln = useMemo(() => {
    return (
      vulnerabilities.find((v) => v.severity === "critical") ||
      vulnerabilities[0] ||
      null
    );
  }, [vulnerabilities]);

  const affectedSession = useMemo(() => {
    if (!topCriticalVuln || !topCriticalVuln.affected_sessions?.length) {
      return (
        sessions.find((s) => s.session_score === 0 || s.starttls_stripped) ||
        sessions[0] ||
        null
      );
    }
    const sessId = topCriticalVuln.affected_sessions[0];
    return sessions.find((s) => s.session_id === sessId) || sessions[0] || null;
  }, [topCriticalVuln, sessions]);

  if (!topCriticalVuln || !affectedSession) {
    return null;
  }

  const flowIdStr =
    affectedSession.session_id < 10
      ? `0${affectedSession.session_id}`
      : `${affectedSession.session_id}`;

  return (
    <section className="w-full py-12 border-b border-tactical-border/40 select-none">
      {/* Category Marker */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-phosphor-hazard inline-block" />
        <span className="text-[11px] font-mono tracking-widest text-phosphor-hazard font-bold uppercase">
          PRIMARY FORENSIC FINDING
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (lg:col-span-6): Headline & Technical Wire Coordinates */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <h2 className="text-4xl sm:text-5xl font-sans font-black text-white tracking-tight uppercase leading-none">
              STARTTLS<br />
              DOWNGRADE<br />
              DETECTED
            </h2>

            <div className="mt-4 pt-3 border-t border-tactical-border/40 text-xs font-mono text-tactical-dim flex flex-wrap items-center gap-2">
              <span className="text-white font-bold">FLOW {flowIdStr}</span>
              <span className="text-tactical-muted">·</span>
              <span className="text-phosphor-cyan font-bold">
                {affectedSession.protocol} :{affectedSession.dst_port}
              </span>
              <span className="text-tactical-muted">·</span>
              <span className="text-tactical-text font-mono">
                {affectedSession.src_ip}:{affectedSession.src_port} &rarr; {affectedSession.dst_ip}:{affectedSession.dst_port}
              </span>
            </div>
          </div>

          <p className="text-sm font-sans text-tactical-text leading-relaxed">
            STARTTLS capability / TLS upgrade was not observed before plaintext authentication. The mail client proceeded with cleartext credential transmission over the wire.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onInspectFlow(affectedSession.session_id)}
              className="px-5 py-2.5 bg-phosphor-hazard hover:bg-red-600 text-black font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition-all active:translate-y-[1px]"
            >
              <span>INSPECT FLOW {flowIdStr} &rarr;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (lg:col-span-6): The Two Protocol Sequences As Visual Focus */}
        <div className="lg:col-span-6 space-y-5 lg:border-l border-tactical-border/40 lg:pl-10">
          {/* Expected Sequence */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-tactical-dim font-bold">
              <span className="text-phosphor-green">✓</span>
              <span>EXPECTED ON THE WIRE</span>
            </div>
            <div className="py-2.5 px-3.5 bg-black/40 border-l-2 border-phosphor-green font-mono text-xs flex items-center gap-2 flex-wrap text-tactical-text">
              <span className="text-white font-bold">EHLO</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-white font-bold">STARTTLS</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-white font-bold">TLS HANDSHAKE</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-phosphor-green font-bold">ENCRYPTED DATA</span>
            </div>
          </div>

          {/* Observed Sequence */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-phosphor-hazard font-bold">
              <span className="text-phosphor-hazard">✕</span>
              <span>OBSERVED ON THE WIRE</span>
            </div>
            <div className="py-2.5 px-3.5 bg-black/40 border-l-2 border-phosphor-hazard font-mono text-xs flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">EHLO</span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-phosphor-hazard font-bold">
                STARTTLS BYPASSED ✕
              </span>
              <span className="text-tactical-muted">&rarr;</span>
              <span className="text-phosphor-hazard font-bold underline">
                PLAINTEXT AUTH
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-tactical-dim pt-1 flex items-center justify-between border-t border-tactical-border/40">
            <span>PACKET WIRE EVIDENCE: OFFSET 0x00000000</span>
            <span className="text-phosphor-cyan">ZERO TLS RECORD HEADERS (0x16 0x03)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
