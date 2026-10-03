"use client";

import { useState } from "react";
import { RawStreamChunk } from "@/lib/types";
import { Binary, ChevronDown, ChevronUp } from "lucide-react";

interface RawStreamDrawerProps {
  streamId: number;
  chunks: RawStreamChunk[];
}

export function RawStreamDrawer({ streamId, chunks }: RawStreamDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [streamTab, setStreamTab] = useState<"DECODED" | "HEX" | "ASCII">("DECODED");

  return (
    <div className="border-t border-tactical-border/80 bg-tactical-surface flex-shrink-0 select-none font-mono">
      {/* Drawer Header Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2.5 bg-tactical-surface flex items-center justify-between cursor-pointer hover:bg-tactical-surfaceHover text-xs border-b border-tactical-border/50"
      >
        <div className="flex items-center gap-2.5 text-tactical-text font-bold">
          <Binary className="w-3.5 h-3.5 text-phosphor-cyan" />
          <span>RAW STREAM // FLOW #{streamId}</span>
          <span className="text-tactical-dim font-normal">({chunks.length} RECORD CHUNKS)</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Tabs for DECODED / HEX / ASCII */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {(["DECODED", "HEX", "ASCII"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStreamTab(tab)}
                className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                  streamTab === tab
                    ? "border-phosphor-cyan text-tactical-text bg-tactical-elevated"
                    : "border-transparent text-tactical-dim hover:text-tactical-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="text-tactical-dim hover:text-tactical-text">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="max-h-56 overflow-y-auto p-4 bg-tactical-bg text-xs space-y-2">
          {chunks.length > 0 ? (
            chunks.map((chunk, idx) => {
              const isHazard = chunk.highlight_type === "danger";
              const isSecure = chunk.highlight_type === "secure";

              return (
                <div
                  key={idx}
                  className={`p-2 border ${
                    isHazard
                      ? "border-phosphor-hazard/60 bg-phosphor-hazard/10"
                      : isSecure
                      ? "border-phosphor-green/40 bg-phosphor-green/5"
                      : "border-tactical-border/70 bg-tactical-surface"
                  }`}
                >
                  {chunk.highlight_label && (
                    <div
                      className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
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

                  {streamTab === "DECODED" && (
                    <div className="flex items-start gap-4 text-xs">
                      <span className="text-phosphor-cyan font-bold select-none">{chunk.offset}</span>
                      <span className="text-tactical-text select-all flex-1 tracking-wider">{chunk.hex}</span>
                      <span className="text-tactical-dim select-all border-l border-tactical-border pl-3">
                        {chunk.ascii}
                      </span>
                    </div>
                  )}

                  {streamTab === "HEX" && (
                    <div className="flex items-start gap-4 text-xs">
                      <span className="text-phosphor-cyan font-bold select-none">{chunk.offset}</span>
                      <span className="text-tactical-text select-all flex-1 tracking-wider font-mono">
                        {chunk.hex}
                      </span>
                    </div>
                  )}

                  {streamTab === "ASCII" && (
                    <div className="flex items-start gap-4 text-xs">
                      <span className="text-phosphor-cyan font-bold select-none">{chunk.offset}</span>
                      <span className="text-tactical-text select-all flex-1 font-mono">
                        {chunk.ascii}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-tactical-dim py-4 text-center">
              No wire stream packet payloads recorded for this flow.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
