"use client";

import { Session } from "@/lib/types";
import { StreamTableHeader } from "./stream-table-header";
import { StreamRow } from "./stream-row";
import { Filter } from "lucide-react";

interface StreamMatrixProps {
  sessions: Session[];
  selectedStreamId: number | null;
  onSelectStream: (id: number) => void;
  onResetFilter?: () => void;
}

export function StreamMatrix({
  sessions,
  selectedStreamId,
  onSelectStream,
  onResetFilter,
}: StreamMatrixProps) {
  return (
    <div className="w-full border border-tactical-border bg-tactical-surface font-mono text-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-2.5 border-b border-tactical-border flex items-center justify-between bg-tactical-bg">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase text-[11px]">
            RECONSTRUCTED EMAIL STREAM MATRIX ({sessions.length})
          </span>
          <span className="text-[10px] text-tactical-dim uppercase hidden sm:inline">
            {"//"} PASSIVE WIRE RECONSTRUCTION
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-tactical-dim">
          CLICK ROW TO OPEN DUAL-MODE DEEP DISSECTOR
        </span>
      </div>

      {/* Table view or Empty Filter State */}
      {sessions.length === 0 ? (
        <div className="py-12 px-4 text-center space-y-3 bg-black/40">
          <div className="flex items-center justify-center text-phosphor-amber gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">
              [!] ZERO WIRE STREAMS MATCH ACTIVE BPF / QUEUE FILTER CRITERIA
            </span>
          </div>
          <p className="text-[11px] text-tactical-dim max-w-md mx-auto">
            The active BPF filter or severity constraint excluded all sessions in this capture.
            Clear the expression or select [ALL EMAIL] preset.
          </p>
          {onResetFilter && (
            <button
              onClick={onResetFilter}
              className="px-3 py-1 border border-phosphor-cyan text-phosphor-cyan bg-phosphor-cyan/10 hover:bg-phosphor-cyan hover:text-black transition-colors font-bold uppercase text-[10px]"
            >
              [RESET BPF FILTER TO ALL EMAIL]
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Reconstructed Email Flows">
            <StreamTableHeader />
            <tbody>
              {sessions.map((s) => (
                <StreamRow
                  key={s.session_id}
                  session={s}
                  isSelected={selectedStreamId === s.session_id}
                  onSelect={onSelectStream}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
