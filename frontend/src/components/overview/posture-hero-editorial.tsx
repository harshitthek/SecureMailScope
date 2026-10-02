"use client";

import { useMemo } from "react";
import { Session, Vulnerability } from "@/lib/types";
import { PostureScale } from "./posture-scale";

interface PostureHeroEditorialProps {
  score: number;
  grade: string;
  sessions: Session[];
  vulnerabilities: Vulnerability[];
}

export function PostureHeroEditorial({
  score,
  grade,
  sessions,
  vulnerabilities,
}: PostureHeroEditorialProps) {
  const criticalCount = useMemo(() => vulnerabilities.filter((v) => v.severity === "critical").length, [vulnerabilities]);
  const highCount = useMemo(() => vulnerabilities.filter((v) => v.severity === "high").length, [vulnerabilities]);
  const expiredCertCount = useMemo(() => sessions.filter((s) => s.certificate?.is_expired).length, [sessions]);
  const failedFlowsCount = useMemo(() => sessions.filter((s) => s.session_score < 70).length, [sessions]);

  const isCritical = score < 50;
  const isDegraded = score >= 50 && score < 80;
  const semanticColor = isCritical ? "#ff3333" : isDegraded ? "#f59e0b" : "#22c55e";

  return (
    <section className="w-full py-12 border-b border-tactical-border/40 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT (lg:col-span-5): Dominant Posture Hero & Custom Scale */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-tactical-dim font-bold block">
            CRYPTOGRAPHIC POSTURE
          </span>

          <div className="flex items-baseline gap-3">
            <span className="text-8xl sm:text-9xl font-sans font-black tracking-tighter text-white leading-none tabular-nums">
              {score}
            </span>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-sans font-bold text-tactical-dim leading-none">
                /100
              </span>
              <span
                className={`mt-2 text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 border ${
                  isCritical
                    ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 text-phosphor-hazard"
                    : isDegraded
                    ? "border-phosphor-amber/60 bg-phosphor-amber/10 text-phosphor-amber"
                    : "border-phosphor-green/60 bg-phosphor-green/10 text-phosphor-green"
                }`}
              >
                GRADE {grade}
              </span>
            </div>
          </div>

          <PostureScale score={score} semanticColor={semanticColor} />
        </div>

        {/* CENTER (lg:col-span-4): Posture Interpretation */}
        <div className="lg:col-span-4 space-y-3 lg:border-l border-tactical-border/40 lg:pl-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-tactical-dim font-bold block">
            EVALUATION
          </span>

          <h3
            className={`text-2xl sm:text-3xl font-sans font-black tracking-tight uppercase leading-tight ${
              isCritical
                ? "text-phosphor-hazard"
                : isDegraded
                ? "text-phosphor-amber"
                : "text-phosphor-green"
            }`}
          >
            {isCritical
              ? "CRITICAL POSTURE DEGRADATION"
              : isDegraded
              ? "DEGRADED SECURITY POSTURE"
              : "HARDENED CRYPTOGRAPHIC POSTURE"}
          </h3>

          <p className="text-sm font-sans text-tactical-text leading-relaxed">
            {sessions.length} reconstructed email flows analyzed. {failedFlowsCount} flows fail the configured cryptographic baseline due to deprecated TLS versions or unencrypted authentication.
          </p>

          <p className="text-xs font-sans text-tactical-dim leading-relaxed">
            Passive inspection verifies compliance against <strong className="text-tactical-text font-mono font-normal">NIST SP 800-52r2</strong> and <strong className="text-tactical-text font-mono font-normal">RFC 8314</strong>.
          </p>
        </div>

        {/* RIGHT (lg:col-span-3): Aligned Supporting Facts (NOT CARDS) */}
        <div className="lg:col-span-3 space-y-3 lg:border-l border-tactical-border/40 lg:pl-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-tactical-dim font-bold block">
            SUPPORTING FACTS
          </span>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-baseline justify-between border-b border-tactical-border/30 pb-2">
              <span className="text-tactical-dim">CRITICAL FINDINGS</span>
              <span className="text-base font-bold text-phosphor-hazard tabular-nums">
                {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-tactical-border/30 pb-2">
              <span className="text-tactical-dim">HIGH-RISK FINDINGS</span>
              <span className="text-base font-bold text-phosphor-amber tabular-nums">
                {highCount < 10 ? `0${highCount}` : highCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-tactical-border/30 pb-2">
              <span className="text-tactical-dim">EXPIRED CERTIFICATES</span>
              <span className="text-base font-bold text-phosphor-hazard tabular-nums">
                {expiredCertCount < 10 ? `0${expiredCertCount}` : expiredCertCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-tactical-border/30 pb-2">
              <span className="text-tactical-dim">RECONSTRUCTED FLOWS</span>
              <span className="text-base font-bold text-white tabular-nums">
                {sessions.length < 10 ? `0${sessions.length}` : sessions.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
