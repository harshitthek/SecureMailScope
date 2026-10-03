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
  const semanticColor = isCritical ? "rgb(var(--phosphor-hazard))" : isDegraded ? "rgb(var(--phosphor-amber))" : "rgb(var(--phosphor-green))";
  const scoreDeficit = score - 100;

  return (
    <section className="w-full py-3 border-b border-tactical-border/40 select-none font-mono">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ZONE A (lg:col-span-4): Posture Score & Instrument Scale */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[12px] uppercase tracking-widest text-tactical-dim font-bold block">
            CRYPTOGRAPHIC POSTURE
          </span>

          <div className="flex items-baseline gap-2.5">
            <span className="text-[68px] sm:text-[72px] font-sans font-black tracking-tighter text-tactical-text leading-none tabular-nums">
              {score}
            </span>
            <div className="flex flex-col">
              <span className="text-[20px] font-sans font-bold text-tactical-dim leading-none">
                /100
              </span>
              <span
                className={`mt-1.5 text-[13px] font-mono font-bold tracking-wider px-2 py-0.5 border ${
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

        {/* ZONE B (lg:col-span-5): Posture Interpretation & Metrics */}
        <div className="lg:col-span-5 space-y-2.5 lg:border-l border-tactical-border/40 lg:pl-6">
          <span className="text-[12px] uppercase tracking-widest text-tactical-dim font-bold block">
            POSTURE INTERPRETATION
          </span>

          <h3
            className={`text-[22px] sm:text-[24px] font-sans font-black tracking-tight uppercase leading-tight ${
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

          <p className="text-[14px] sm:text-[15px] font-sans text-tactical-text leading-relaxed">
            {sessions.length} reconstructed email flows analyzed. {failedFlowsCount} flows fail the configured cryptographic baseline.
          </p>

          {/* Aligned Metrics: DEGRADED FLOWS & SCORE DEFICIT */}
          <div className="flex items-center gap-8 pt-0.5 text-sm font-mono">
            <div>
              <span className="text-[12px] text-tactical-dim uppercase block font-medium">DEGRADED FLOWS</span>
              <span className="text-[18px] font-bold text-tactical-text tabular-nums">
                {failedFlowsCount} / {sessions.length}
              </span>
            </div>
            <div>
              <span className="text-[12px] text-tactical-dim uppercase block font-medium">SCORE DEFICIT</span>
              <span className="text-[18px] font-bold text-phosphor-hazard tabular-nums">
                {scoreDeficit} pts
              </span>
            </div>
          </div>
        </div>

        {/* ZONE C (lg:col-span-3): Supporting Facts (Clean Numbers, Aligned Layout) */}
        <div className="lg:col-span-3 space-y-2.5 lg:border-l border-tactical-border/40 lg:pl-6 font-mono">
          <span className="text-[12px] uppercase tracking-widest text-tactical-dim font-bold block">
            SUPPORTING FACTS
          </span>

          <div className="space-y-1.5 divide-y divide-tactical-border/20">
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-tactical-text text-[13px] font-medium">CRITICAL FINDINGS</span>
              <span className="text-[22px] font-black text-phosphor-hazard tabular-nums leading-none">
                {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-tactical-text text-[13px] font-medium">HIGH-RISK FINDINGS</span>
              <span className="text-[22px] font-black text-phosphor-amber tabular-nums leading-none">
                {highCount < 10 ? `0${highCount}` : highCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-tactical-text text-[13px] font-medium">EXPIRED CERTIFICATE</span>
              <span className="text-[22px] font-black text-phosphor-hazard tabular-nums leading-none">
                {expiredCertCount < 10 ? `0${expiredCertCount}` : expiredCertCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-tactical-text text-[13px] font-medium">FLOWS ANALYZED</span>
              <span className="text-[22px] font-black text-tactical-text tabular-nums leading-none">
                {sessions.length < 10 ? `0${sessions.length}` : sessions.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
