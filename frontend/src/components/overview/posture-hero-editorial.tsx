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
  const semanticColor = isCritical ? "#ef3340" : isDegraded ? "#f59e0b" : "#22c55e";
  const scoreDeficit = score - 100;

  return (
    <section className="w-full py-6 border-b border-tactical-border/40 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ZONE A (lg:col-span-4): Posture Score & Instrument Scale */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-tactical-dim font-bold block">
            CRYPTOGRAPHIC POSTURE
          </span>

          <div className="flex items-baseline gap-3">
            <span className="text-7xl sm:text-8xl font-sans font-black tracking-tighter text-white leading-none tabular-nums">
              {score}
            </span>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-sans font-bold text-tactical-dim leading-none">
                /100
              </span>
              <span
                className={`mt-2 text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 border ${
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
        <div className="lg:col-span-5 space-y-3 lg:border-l border-tactical-border/40 lg:pl-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-tactical-dim font-bold block">
            POSTURE INTERPRETATION
          </span>

          <h3
            className={`text-xl sm:text-2xl font-sans font-black tracking-tight uppercase leading-tight ${
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

          <p className="text-xs font-sans text-tactical-text leading-relaxed">
            {sessions.length} reconstructed email flows analyzed. {failedFlowsCount} flows fail the configured cryptographic baseline.
          </p>

          {/* Aligned Metrics: DEGRADED FLOWS & SCORE DEFICIT */}
          <div className="flex items-center gap-8 pt-1 text-xs font-mono">
            <div>
              <span className="text-[10px] text-tactical-dim uppercase block">DEGRADED FLOWS</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {failedFlowsCount} / {sessions.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-tactical-dim uppercase block">SCORE DEFICIT</span>
              <span className="text-sm font-bold text-phosphor-hazard tabular-nums">
                {scoreDeficit} pts
              </span>
            </div>
          </div>
        </div>

        {/* ZONE C (lg:col-span-3): Supporting Facts (Aligned Strip, NO BOXES) */}
        <div className="lg:col-span-3 space-y-2.5 lg:border-l border-tactical-border/40 lg:pl-6 font-mono text-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-tactical-dim font-bold block">
            SUPPORTING FACTS
          </span>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim text-[11px]">CRITICAL FINDINGS</span>
              <span className="text-sm font-bold text-phosphor-hazard tabular-nums">
                {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim text-[11px]">HIGH-RISK FINDINGS</span>
              <span className="text-sm font-bold text-phosphor-amber tabular-nums">
                {highCount < 10 ? `0${highCount}` : highCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim text-[11px]">EXPIRED CERTIFICATE</span>
              <span className="text-sm font-bold text-phosphor-hazard tabular-nums">
                {expiredCertCount < 10 ? `0${expiredCertCount}` : expiredCertCount}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim text-[11px]">FLOWS ANALYZED</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {sessions.length < 10 ? `0${sessions.length}` : sessions.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
