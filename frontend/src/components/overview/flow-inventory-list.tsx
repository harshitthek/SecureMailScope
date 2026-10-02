"use client";

import { Session } from "@/lib/types";
import { FlowInventoryRow } from "./flow-inventory-row";

interface FlowInventoryListProps {
  sessions: Session[];
  onSelectFlow: (sessionId: number) => void;
}

export function FlowInventoryList({
  sessions,
  onSelectFlow,
}: FlowInventoryListProps) {
  return (
    <section className="w-full py-12 border-b border-tactical-border/40 select-none">
      <div className="flex items-center justify-between pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-tactical-dim uppercase block">
            WIRE RECONSTRUCTION
          </span>
          <h3 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight mt-0.5">
            RECONSTRUCTED EMAIL FLOWS
          </h3>
        </div>
        <div className="text-xs font-mono text-tactical-dim">
          <span>{sessions.length} RECORDED TCP FLOWS</span>
        </div>
      </div>

      {/* Aligned Column Header */}
      <div className="w-full grid grid-cols-12 gap-3 pb-3 border-b border-tactical-border/80 text-[10px] font-mono uppercase tracking-widest text-tactical-dim px-4">
        <div className="col-span-1">FLOW</div>
        <div className="col-span-3">ENDPOINT</div>
        <div className="col-span-1">PROTOCOL</div>
        <div className="col-span-2">TLS VERSION</div>
        <div className="col-span-2">CIPHER SUITE</div>
        <div className="col-span-1">KEX / PFS</div>
        <div className="col-span-1 text-right">POSTURE</div>
        <div className="col-span-1 text-right">ACTION</div>
      </div>

      {/* Data Rows */}
      <div className="divide-y divide-tactical-border/30 font-mono text-xs">
        {sessions.map((s, idx) => (
          <FlowInventoryRow
            key={s.session_id}
            session={s}
            index={idx}
            onSelect={onSelectFlow}
          />
        ))}
      </div>
    </section>
  );
}
