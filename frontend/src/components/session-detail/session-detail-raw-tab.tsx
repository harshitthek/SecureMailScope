"use client";

import { Session } from "@/lib/types";

interface SessionDetailRawTabProps {
  session: Session;
}

export function SessionDetailRawTab({ session }: SessionDetailRawTabProps) {
  const inspection = session.forensic_inspection;

  return (
    <div className="border border-tactical-border bg-tactical-bg p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs">
        <span className="font-bold text-tactical-text uppercase">DISSECTED WIRE STREAM (HEX / ASCII)</span>
        <span className="text-[10px] text-tactical-dim">RECORD LAYER BYTE BOUNDARIES</span>
      </div>

      {inspection?.raw_chunks && inspection.raw_chunks.length > 0 ? (
        <div className="space-y-2 overflow-x-auto">
          {inspection.raw_chunks.map((chunk, idx) => {
            const isHazard = chunk.highlight_type === "danger";
            const isSecure = chunk.highlight_type === "secure";
            return (
              <div
                key={idx}
                className={`p-2.5 border font-mono text-xs ${
                  isHazard
                    ? "border-phosphor-hazard/50 bg-phosphor-hazard/10"
                    : isSecure
                    ? "border-phosphor-green/40 bg-phosphor-green/5"
                    : "border-tactical-border bg-tactical-surface"
                }`}
              >
                {chunk.highlight_label && (
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      isHazard ? "text-phosphor-hazard" : isSecure ? "text-phosphor-green" : "text-phosphor-cyan"
                    }`}
                  >
                    &gt;&gt;&gt; {chunk.highlight_label}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <span className="text-phosphor-cyan text-[11px] font-bold select-none">{chunk.offset}</span>
                  <span className="text-tactical-text text-xs select-all flex-1 tracking-wider">{chunk.hex}</span>
                  <span className="text-tactical-dim text-xs select-all font-mono border-l border-tactical-border pl-3">
                    {chunk.ascii}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-tactical-dim py-4">
          Raw packet disassembly buffer empty for this stream.
        </div>
      )}
    </div>
  );
}
