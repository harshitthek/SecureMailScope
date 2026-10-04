"use client";

import React from "react";
import { D3fendTechnique } from "@/lib/types";
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";

interface D3fendMatrixGridProps {
  techniques: D3fendTechnique[];
}

export function D3fendMatrixGrid({ techniques }: D3fendMatrixGridProps) {
  if (!techniques || techniques.length === 0) {
    return (
      <div className="p-8 text-center border border-[#1c1d22] bg-[#0c0d10] rounded-sm text-sm text-[#777a88] font-mono">
        NO MITRE D3FEND DEFENSIVE TECHNIQUES CATALOGED FOR THIS EVIDENCE CASE.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#9194a1] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc9166]" />
          MITRE D3FEND Matrix — Cryptographic Hardening Posture
        </h2>
        <span className="text-[11px] font-mono text-[#777a88]">
          DEFENSIVE MAPPING // {techniques.length} TECHNIQUES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {techniques.map((tech) => {
          const isCritical = tech.status === "CRITICAL";
          const isHigh = tech.status === "HIGH";
          const isCompliant = tech.status === "COMPLIANT";

          return (
            <div
              key={tech.technique_id}
              className={`p-4 rounded-sm border transition-all ${
                isCritical
                  ? "bg-[#180e0e]/40 border-rose-900/50 hover:border-rose-700/60"
                  : isHigh
                  ? "bg-[#161208]/40 border-amber-900/50 hover:border-amber-700/60"
                  : "bg-[#0b1411]/40 border-emerald-900/50 hover:border-emerald-700/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-tight text-white bg-[#121317] px-2 py-0.5 rounded border border-[#1c1d22]">
                    {tech.technique_id}
                  </span>
                  <span className="text-xs font-sans font-medium text-[#e2e3e9]">
                    {tech.name}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isCritical
                      ? "bg-rose-950/60 text-rose-300 border-rose-800/80"
                      : isHigh
                      ? "bg-amber-950/60 text-amber-300 border-amber-800/80"
                      : "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
                  }`}
                >
                  {isCritical && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                  {isHigh && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  {isCompliant && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                  {tech.status}
                </span>
              </div>

              <p className="text-xs text-[#9194a1] leading-relaxed mb-3 font-sans">
                {tech.rationale}
              </p>

              {tech.actions && tech.actions.length > 0 && (
                <div className="border-t border-[#1c1d22]/60 pt-2.5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#777a88] block">
                    Prescribed Hardening Actions:
                  </span>
                  <ul className="space-y-1">
                    {tech.actions.map((act, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] font-mono text-[#c5c7d3] flex items-start gap-1.5"
                      >
                        <ArrowRight className="w-3 h-3 text-[#cc9166] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
