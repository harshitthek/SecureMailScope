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
    <section className="w-full py-3 border-b border-tactical-border/40 select-none">
      <div className="flex items-center justify-between pb-2">
        <div>
          <span className="text-[12px] font-mono tracking-widest text-tactical-dim uppercase block">
            WIRE RECONSTRUCTION
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-sans font-black text-tactical-text uppercase tracking-tight mt-0.5">
            RECONSTRUCTED EMAIL FLOWS
          </h3>
        </div>
        <div className="text-[13px] font-mono text-tactical-dim">
          <span>{sessions.length} RECORDED TCP FLOWS</span>
        </div>
      </div>

      {/* Forensic Ledger Header */}
      <div className="w-full flex items-center justify-between pb-2.5 border-b border-tactical-border/80 text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-tactical-dim px-4">
        <span>FLOW // ENDPOINT &amp; TELEMETRY</span>
        <span>POSTURE SCORE</span>
      </div>

      {/* Data Rows */}
      <div className="divide-y divide-tactical-border/30 font-mono text-[14px]">
        {sessions.map((s, idx) => (
          <FlowInventoryRow
            key={s.session_id}
            index={idx}
            session={s}
            onSelect={onSelectFlow}
          />
        ))}
      </div>
    </section>
  );
}
