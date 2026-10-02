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
  const strokeColor = isCritical ? "#ff3333" : score >= 80 ? "#22c55e" : "#f59e0b";

  // Pre-generate radial tick marks around dial circumference (60 ticks)
  const ticks = useMemo(() => {
    const list = [];
    const count = 60;
    const center = 80;
    const rInner = 64;
    const rOuter = 72;

    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count - 90;
      const rad = (angle * Math.PI) / 180;
      const x1 = center + rInner * Math.cos(rad);
      const y1 = center + rInner * Math.sin(rad);
      const x2 = center + rOuter * Math.cos(rad);
      const y2 = center + rOuter * Math.sin(rad);
      const isMajor = i % 5 === 0;
      const tickScore = (i / count) * 100;
      const isLit = tickScore <= score;

      list.push({ x1, y1, x2, y2, isMajor, isLit });
    }
    return list;
  }, [score]);

  return (
    <div className="border border-tactical-border bg-tactical-surface p-4 flex flex-col justify-between h-full relative select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs font-mono uppercase">
        <span className="font-bold text-white tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 bg-phosphor-cyan" />
          CRYPTOGRAPHIC POSTURE INDEX
        </span>
        <span className="text-tactical-dim font-bold">{caseCode}</span>
      </div>

      {/* Radial Tactile Dial & Massive Macro-Score */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle cx="80" cy="80" r="54" fill="none" stroke="#121822" strokeWidth="6" />

            {/* Tactile tick marks */}
            {ticks.map((t, idx) => (
              <line
                key={idx}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isLit ? strokeColor : "#1b2330"}
                strokeWidth={t.isMajor ? "1.75" : "0.75"}
              />
            ))}

            {/* Score Arc */}
            <circle
              cx="80"
              cy="80"
              r="54"
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
              strokeLinecap="butt"
              transform="rotate(-90 80 80)"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Telemetry readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-mono font-black tracking-tight tabular-nums text-white">
              {score}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-tactical-dim mt-0.5">
              INDEX / 100
            </span>
          </div>
        </div>
      </div>

      {/* Alarm / Verdict Status Banner */}
      <div className="pt-3 border-t border-tactical-border flex items-center justify-between gap-2 text-xs font-mono">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 border font-bold uppercase tracking-wider text-[11px] ${
            isCritical
              ? "border-phosphor-hazard/50 bg-phosphor-hazard/10 text-phosphor-hazard"
              : "border-phosphor-green/50 bg-phosphor-green/10 text-phosphor-green"
          }`}
        >
          {isCritical ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-phosphor-hazard" />
              <span>DEFENSE ALARM: DEGRADED</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-phosphor-green" />
              <span>POSTURE: HARDENED</span>
            </>
          )}
        </div>

        <span className="font-bold text-white uppercase px-2 py-1 border border-tactical-border bg-black/40 text-xs">
          GRADE {grade}
        </span>
      </div>
    </div>
  );
}
