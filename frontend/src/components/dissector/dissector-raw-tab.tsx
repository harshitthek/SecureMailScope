"use client";

import { Session } from "@/lib/types";

interface DissectorRawTabProps {
  currentStream: Session;
}

export function DissectorRawTab({ currentStream }: DissectorRawTabProps) {
  const chunks = currentStream.forensic_inspection?.raw_chunks;

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs">
        <span className="font-bold text-white uppercase">Wire Stream Hex &amp; ASCII Inspection</span>
        <span className="text-tactical-dim">RECORD LAYER BYTE BOUNDARIES</span>
      </div>

      {chunks && chunks.length > 0 ? (
        <div className="space-y-2 overflow-x-auto">
          {chunks.map((chunk, idx) => {
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
                    : "border-tactical-border bg-black/40"
                }`}
              >
                {chunk.highlight_label && (
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      isHazard
                        ? "text-phosphor-hazard"
                        : isSecure
                        ? "text-phosphor-green"
                        : "text-phosphor-cyan"
                    }`}
                  >
                    &gt;&gt;&gt; {chunk.highlight_label}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <span className="text-phosphor-cyan text-[11px] font-bold select-none">{chunk.offset}</span>
                  <span className="text-white text-xs select-all flex-1 tracking-wider">{chunk.hex}</span>
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
          No raw packet hex captured for this stream.
        </div>
      )}
    </div>
  );
}
