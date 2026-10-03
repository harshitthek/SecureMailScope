"use client";

import { RawStreamChunk } from "@/lib/types";

interface DissectorHexDumpProps {
  chunks: RawStreamChunk[];
  selectedOffset?: string;
}

export function DissectorHexDump({ chunks, selectedOffset }: DissectorHexDumpProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-tactical-raw font-mono text-[13px] overflow-hidden select-none border-b border-tactical-border/80">
      {/* Hex Dump Header */}
      <div className="px-4 py-2.5 border-b border-tactical-border/60 bg-tactical-surface/60 flex items-center justify-between text-[12px] uppercase tracking-widest text-tactical-dim font-bold flex-shrink-0">
        <span>SYNCHRONIZED HEX &amp; ASCII DISSECTOR</span>
        <span className="text-phosphor-cyan text-[12px]">16 BYTES / LINE</span>
      </div>

      {/* Hex Column Guide */}
      <div className="px-4 py-2 border-b border-tactical-border/40 bg-tactical-bg text-[12px] text-tactical-dim flex items-center gap-4 flex-shrink-0">
        <span className="w-18 font-bold">OFFSET</span>
        <span className="flex-1 tracking-[0.25em] text-tactical-dim">
          00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F
        </span>
        <span className="w-40 text-right pr-2">ASCII</span>
      </div>

      {/* Byte Stream Rows */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-tactical-raw">
        {chunks.length === 0 ? (
          <div className="text-tactical-dim text-[13px] py-8 text-center">
            No raw byte stream chunks available for this session.
          </div>
        ) : (
          chunks.map((chunk, idx) => {
            const isHazard = chunk.highlight_type === "danger";
            const isSecure = chunk.highlight_type === "secure";
            const isOffsetMatch = selectedOffset && chunk.offset.startsWith(selectedOffset.slice(0, 6));

            return (
              <div
                key={idx}
                className={`py-1.5 px-2.5 border transition-all ${
                  isHazard
                    ? "border-phosphor-hazard/60 bg-phosphor-hazard/10"
                    : isOffsetMatch
                    ? "border-phosphor-cyan/80 bg-phosphor-cyan/10"
                    : isSecure
                    ? "border-phosphor-green/40 bg-phosphor-green/5"
                    : "border-tactical-border/30 bg-tactical-surface hover:border-tactical-borderHighlight"
                }`}
              >
                {chunk.highlight_label && (
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5 ${
                      isHazard ? "text-phosphor-hazard" : isSecure ? "text-phosphor-green" : "text-phosphor-cyan"
                    }`}
                  >
                    <span>&gt;&gt;&gt;</span>
                    <span>{chunk.highlight_label}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-[13px]">
                  <span className="w-18 text-phosphor-cyan font-bold select-none text-[12px]">
                    {chunk.offset}
                  </span>
                  <span className="flex-1 text-tactical-text font-mono tracking-wider select-all text-[12px] sm:text-[13px]">
                    {chunk.hex}
                  </span>
                  <span className="w-40 text-right pr-2 text-tactical-text font-mono select-all border-l border-tactical-border/60 pl-3 text-[12px] sm:text-[13px] truncate">
                    {chunk.ascii}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
