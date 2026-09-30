"use client";

import { useEffect, useState } from "react";
import { Grade } from "@/lib/types";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  grade: Grade;
}

export function ScoreGauge({ score, grade }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 120);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(animatedScore, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isCritical = score < 50 || grade === "F" || grade === "D";

  const getRingColor = (val: number, g: Grade) => {
    if (g === "F" || g === "D" || val < 50) return "#f43f5e"; // rose/red
    if (val >= 80) return "#10b981"; // emerald
    if (val >= 60) return "#0ea5e9"; // cyan
    return "#f59e0b"; // amber
  };

  const getVerdict = (g: Grade) => {
    switch (g) {
      case "A+":
      case "A":
        return { text: "HARDENED POSTURE", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
      case "B":
        return { text: "ACCEPTABLE ASSURANCE", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" };
      case "C":
        return { text: "DEGRADED COMPLIANCE", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
      case "D":
      case "F":
      default:
        return { text: "CRITICAL COMPROMISE", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
    }
  };

  const ringColor = getRingColor(score, grade);
  const verdict = getVerdict(grade);

  return (
    <div className="relative flex flex-col justify-between h-full p-4 rounded-xl border border-soc-border bg-soc-card shadow-tactical-sm transition-all hover:border-soc-borderHighlight group overflow-hidden">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-80 transition-opacity"
        style={{ backgroundColor: ringColor }}
      />

      <div className="flex items-center justify-between pb-1 border-b border-soc-border/50">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
          Cryptographic Posture
        </span>
        <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded bg-soc-border text-slate-400">
          INDEX
        </span>
      </div>

      <div className="relative flex items-center justify-center py-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Subtle glow */}
          <div
            className="absolute inset-2 rounded-full blur-xl opacity-20 transition-colors pointer-events-none"
            style={{ backgroundColor: ringColor }}
          />

          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Outer tick guide */}
            <circle
              cx="70"
              cy="70"
              r="63"
              fill="transparent"
              stroke="#16233b"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            {/* Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#0a1222"
              strokeWidth={strokeWidth}
            />
            {/* Progress Arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-100">
              {animatedScore}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 -mt-0.5">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-soc-border/50 flex items-center justify-between gap-1 text-[10px] font-mono">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${verdict.bg}`}>
          {isCritical ? <ShieldAlert className="w-3 h-3 text-rose-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
          <span className={`font-bold tracking-wider ${verdict.color}`}>{verdict.text}</span>
        </div>
        <span className="text-slate-400 font-bold uppercase">GRADE {grade}</span>
      </div>
    </div>
  );
}
