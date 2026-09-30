"use client";

import { Session } from "@/lib/types";
import { ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

interface DissectorModeBProps {
  session: Session;
}

export function DissectorModeB({ session }: DissectorModeBProps) {
  const inspection = session.forensic_inspection;

  if (!inspection) {
    return (
      <div className="p-6 text-center font-mono text-tactical-muted text-xs border border-tactical-border bg-black/40">
        No raw wire dissection chunks captured for this flow.
      </div>
    );
  }

  const { state_timeline, raw_chunks } = inspection;

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* 1. Protocol State Machine Progression */}
      <div className="border border-tactical-border bg-black/40 p-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/60 text-[10px] text-tactical-dim uppercase">
          <span className="font-bold text-white">PROTOCOL STATE MACHINE TRANSITIONS</span>
          <span>DISSECTED TCP REASSEMBLY</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-2">
          {state_timeline.map((step, idx) => {
            const isHazard = step.status === "compromised" || step.status === "downgrade";
            const isSecure = step.status === "secure";

            return (
              <div key={step.step} className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className={`p-1.5 border text-[10px] max-w-[210px] ${
                    isHazard
                      ? "border-phosphor-hazard/60 bg-phosphor-hazard/15 text-phosphor-hazard"
                      : isSecure
                      ? "border-phosphor-green/60 bg-phosphor-green/15 text-phosphor-green"
                      : "border-tactical-border bg-tactical-surface text-tactical-dim"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 font-bold">
                    <span>STEP {step.step}: {step.phase}</span>
                    <span className="text-[9px] opacity-75">{step.direction}</span>
                  </div>
                  <p className="text-[9px] mt-0.5 text-tactical-text leading-tight truncate">
                    {step.summary}
                  </p>
                </div>
                {idx < state_timeline.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-tactical-muted flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Raw ASCII / Hex Wire Stream Dump */}
      <div className="border border-tactical-border bg-black/60 p-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-tactical-border/70 text-[10px] text-tactical-dim uppercase">
          <span className="font-bold text-phosphor-cyan">
            RAW WIRE STREAM HEX & ASCII INSPECTION
          </span>
          <span className="text-[9px] text-tactical-dim">
            STREAM #{session.session_id} {"//"} RECORD LAYER BYTE BOUNDARIES
          </span>
        </div>

        {/* Column Guides */}
        <div className="py-1 text-[10px] text-tactical-muted border-b border-tactical-border/40 grid grid-cols-12 gap-1 uppercase">
          <span className="col-span-2">OFFSET</span>
          <span className="col-span-7">HEX RAW BYTES (00 - 0F)</span>
          <span className="col-span-3 text-right">ASCII VALUE</span>
        </div>

        {/* Raw byte chunks */}
        <div className="space-y-1.5 pt-2 max-h-[320px] overflow-y-auto">
          {raw_chunks.map((chunk, idx) => {
            const isDanger = chunk.highlight_type === "danger";
            const isSecure = chunk.highlight_type === "secure";
            const isWarning = chunk.highlight_type === "warning";

            return (
              <div key={idx} className="space-y-0.5">
                <div
                  className={`grid grid-cols-12 gap-1 p-1 text-[11px] items-center border ${
                    isDanger
                      ? "border-phosphor-hazard/60 bg-phosphor-hazard/20 text-white font-bold"
                      : isSecure
                      ? "border-phosphor-green/60 bg-phosphor-green/15 text-white font-bold"
                      : isWarning
                      ? "border-phosphor-amber/60 bg-phosphor-amber/15 text-white"
                      : "border-transparent text-tactical-dim hover:bg-tactical-surface"
                  }`}
                >
                  <span className="col-span-2 text-tactical-muted tabular-nums">
                    {chunk.offset}
                  </span>
                  <span className="col-span-7 tracking-wider text-tactical-text font-bold">
                    {chunk.hex}
                  </span>
                  <span className="col-span-3 text-right text-phosphor-cyan truncate">
                    {chunk.ascii}
                  </span>
                </div>

                {chunk.highlight_label && (
                  <div
                    className={`text-[10px] px-2 py-0.5 flex items-center gap-1.5 uppercase font-bold border-l-2 ${
                      isDanger
                        ? "border-phosphor-hazard bg-phosphor-hazard/10 text-phosphor-hazard"
                        : "border-phosphor-green bg-phosphor-green/10 text-phosphor-green"
                    }`}
                  >
                    {isDanger ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    <span>&gt;&gt;&gt; {chunk.highlight_label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
