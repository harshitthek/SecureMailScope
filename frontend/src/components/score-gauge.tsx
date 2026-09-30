"use client";

import { useEffect, useState } from "react";
import { Grade } from "@/lib/types";

interface ScoreGaugeProps {
  score: number;
  grade: Grade;
}

export function ScoreGauge({ score, grade }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 62;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(animatedScore, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getRingColor = (val: number) => {
    if (val >= 80) return "#10b981"; // emerald-500
    if (val >= 60) return "#3b82f6"; // blue-500
    if (val >= 40) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getGradeColor = (g: Grade) => {
    switch (g) {
      case "A+":
      case "A":
        return "text-emerald-400";
      case "B":
        return "text-blue-400";
      case "C":
        return "text-yellow-400";
      case "D":
        return "text-orange-400";
      case "F":
      default:
        return "text-red-400";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke={getRingColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tight text-slate-50">
          {score}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${getGradeColor(grade)}`}>
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
