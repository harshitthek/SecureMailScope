"use client";

import { Session } from "@/lib/types";

interface DissectorPacketMatrixProps {
  session: Session;
  selectedStepIndex: number;
  onSelectStepIndex: (index: number) => void;
}

export function DissectorPacketMatrix({
  session,
  selectedStepIndex,
  onSelectStepIndex,
}: DissectorPacketMatrixProps) {
  const steps = session.forensic_inspection?.state_timeline || [];

  return (
    <div className="w-5/12 min-w-[380px] max-w-[560px] border-r border-tactical-border/80 flex flex-col bg-tactical-bg select-none font-mono text-[13px] overflow-hidden">
      {/* Table Header */}
      <div className="px-4 py-2.5 border-b border-tactical-border/80 bg-tactical-surface/80 flex items-center justify-between text-[12px] uppercase tracking-widest text-tactical-dim font-bold flex-shrink-0">
        <span>PACKET &amp; FRAME MATRIX</span>
        <span className="text-phosphor-cyan text-[13px]">{steps.length} FRAMES</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-3 py-2 border-b border-tactical-border/60 bg-black/40 text-[11px] uppercase tracking-wider text-tactical-dim font-bold flex-shrink-0">
        <span className="col-span-1 text-center">#</span>
        <span className="col-span-2">DIR</span>
        <span className="col-span-2">PROTO</span>
        <span className="col-span-2">OFFSET</span>
        <span className="col-span-5">FRAME SUMMARY</span>
      </div>

      {/* Frame Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-tactical-border/30">
        {steps.map((step, idx) => {
          const isSelected = selectedStepIndex === idx;
          const isHazard = step.status === "downgrade" || step.status === "compromised";
          const isSecure = step.status === "secure";
          const dirArrow = step.direction === "C->S" ? "→" : "←";
          const protoTag = step.phase.includes("TLS") ? "TLS" : session.protocol;

          return (
            <div
              key={step.step}
              onClick={() => onSelectStepIndex(idx)}
              className={`grid grid-cols-12 px-3 py-2.5 cursor-pointer transition-colors items-center text-[13px] border-l-2 ${
                isSelected
                  ? "bg-tactical-elevated border-phosphor-cyan text-tactical-text shadow-[inset_2px_0_6px_rgba(0,216,246,0.15)]"
                  : isHazard
                  ? "border-phosphor-hazard/50 bg-phosphor-hazard/5 text-tactical-text hover:bg-tactical-surfaceHover"
                  : "border-transparent text-tactical-text hover:bg-tactical-surfaceHover"
              }`}
            >
              <span className="col-span-1 text-center text-tactical-dim font-bold">
                {step.step < 10 ? `0${step.step}` : step.step}
              </span>
              <span className={`col-span-2 font-bold ${step.direction === "C->S" ? "text-phosphor-cyan" : "text-tactical-text"}`}>
                {dirArrow} {step.direction}
              </span>
              <span className="col-span-2 text-tactical-text font-semibold">
                {protoTag}
              </span>
              <span className="col-span-2 text-tactical-dim text-[12px]">
                {step.packet_offset || "0x0000"}
              </span>
              <div className="col-span-5 flex items-center justify-between gap-1 overflow-hidden">
                <span className={`truncate font-medium ${isHazard ? "text-phosphor-hazard font-bold" : isSecure ? "text-phosphor-green" : "text-tactical-text"}`} title={step.phase}>
                  {step.phase}
                </span>
                {isHazard && (
                  <span className="flex-shrink-0 text-[10px] bg-phosphor-hazard text-black font-black px-1.5 py-0.2 uppercase tracking-tighter">
                    THREAT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
