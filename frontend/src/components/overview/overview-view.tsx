"use client";

import React, { useState } from "react";
import { EvidenceCase } from "@/lib/types";
import { PostureHero } from "./posture-hero";
import { EditorialQuoteBand } from "./editorial-quote-band";
import { ProtocolDivergenceStrip } from "./protocol-divergence-strip";
import { FlowLedgerPreview } from "./flow-ledger-preview";
import { SecurityTopology } from "./security-topology";

interface OverviewViewProps {
  activeCase: EvidenceCase;
  onNavigateToFlow?: (flowId: number) => void;
}

export function OverviewView({ activeCase, onNavigateToFlow }: OverviewViewProps) {
  // Default to selecting Flow 3 if in CASE-04 (where STARTTLS downgrade occurs)
  const defaultFlowId = activeCase.data.sessions[2]?.session_id || activeCase.data.sessions[0]?.session_id || 1;
  const [selectedFlowId, setSelectedFlowId] = useState<number>(defaultFlowId);

  const handleInspect = (flowId: number) => {
    setSelectedFlowId(flowId);
    if (onNavigateToFlow) {
      onNavigateToFlow(flowId);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-3 flex flex-col gap-6 pb-14 select-none">
      {/* 1. Slash Hero Split Composition with Gilded Line Chart & Mini Ledger */}
      <PostureHero activeCase={activeCase} onInspectFlow={handleInspect} />

      {/* 2. Full-Bleed 4-Column Proof Stat Band & Didone Pull Quote (Video Frame 00:12) */}
      <EditorialQuoteBand activeCase={activeCase} />

      {/* 3. Expected vs Observed Protocol Divergence Strip */}
      <ProtocolDivergenceStrip activeCase={activeCase} />

      {/* 4. Reconstructed Flow Ledger Table (Slash Data Table Archetype) */}
      <FlowLedgerPreview
        activeCase={activeCase}
        selectedFlowId={selectedFlowId}
        onSelectFlow={handleInspect}
      />

      {/* 5. Node Graph Security Topology & Defense Pillars (Video Frame 00:16) */}
      <SecurityTopology />
    </main>
  );
}
