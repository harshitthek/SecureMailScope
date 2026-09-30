"use client";

import { useMemo } from "react";
import { Grade } from "@/lib/types";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface PostureDialProps {
  score: number;
  grade: Grade;
  caseCode: string;
}

export function PostureDial({ score, grade, caseCode }: PostureDialProps) {
  const isCritical = score < 60 || grade === "F" || grade === "D";
  const strokeColor = isCritical ? "#ef4444" : score >= 80 ? "#22c55e" : "#f59e0b";

  // Pre-generate radial tick marks around dial circumference
  const ticks = useMemo(() => {
    const list = [];
    const count = 48;
    const center = 70;
    const rInner = 56;
    const rOuter = 63;

    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count - 90;
      const rad = (angle * Math.PI) / 180;
      const x1 = center + rInner * Math.cos(rad);
      const y1 = center + rInner * Math.sin(rad);
      const x2 = center + rOuter * Math.cos(rad);
      const y2 = center + rOuter * Math.sin(rad);
      const isMajor = i % 4 === 0;
      const tickScore = (i / count) * 100;
      const isLit = tickScore <= score;

      list.push({ x1, y1, x2, y2, isMajor, isLit });
    }
    return list;
  }, [score]);

  return (
    <div className="border border-tactical-border bg-tactical-surface p-3 font-mono text-xs flex flex-col justify-between h-full relative">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/70 text-[10px] text-tactical-dim uppercase">
        <span className="font-bold text-tactical-text">CRYPTOGRAPHIC POSTURE INDEX</span>
        <span className="text-tactical-dim">{caseCode}</span>
      </div>

      {/* Radial Tactile Dial */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle cx="70" cy="70" r="48" fill="none" stroke="#161b24" strokeWidth="6" />

            {/* Tactile tick marks */}
            {ticks.map((t, idx) => (
              <line
                key={idx}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isLit ? strokeColor : "#1e2633"}
                strokeWidth={t.isMajor ? "1.5" : "0.75"}
              />
            ))}

            {/* Score Arc */}
            <circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - score / 100)}`}
              strokeLinecap="butt"
              transform="rotate(-90 70 70)"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Telemetry readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums text-white">
              {score}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-tactical-dim -mt-1">
              / 100 PTS
            </span>
          </div>
        </div>
      </div>

      {/* Alarm / Verdict Status Banner */}
      <div className="pt-2 border-t border-tactical-border/70 flex items-center justify-between gap-1 text-[10px]">
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 border font-bold uppercase tracking-wider ${
            isCritical
              ? "border-phosphor-hazard/50 bg-phosphor-hazard/10 text-phosphor-hazard"
              : "border-phosphor-green/50 bg-phosphor-green/10 text-phosphor-green"
          }`}
        >
          {isCritical ? (
            <>
              <AlertTriangle className="w-3 h-3 text-phosphor-hazard" />
              <span>DEFENSE ALARM: DEGRADED</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3 h-3 text-phosphor-green" />
              <span>POSTURE: HARDENED</span>
            </>
          )}
        </div>

        <span className="font-bold text-white uppercase px-1.5 py-0.5 border border-tactical-border bg-black/40">
          GRADE {grade}
        </span>
      </div>
    </div>
  );
}
