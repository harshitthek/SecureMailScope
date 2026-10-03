"use client";

import React, { useState } from "react";
import { EvidenceCase } from "@/lib/types";
import { PostureHero } from "./posture-hero";
import { ProtocolDivergenceStrip } from "./protocol-divergence-strip";
import { FlowLedgerPreview } from "./flow-ledger-preview";

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
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-8 pb-20 select-none">
      {/* 1. Slash Hero Split Composition */}
      <PostureHero activeCase={activeCase} onInspectFlow={handleInspect} />

      {/* 2. Expected vs Observed Protocol Divergence Strip */}
      <ProtocolDivergenceStrip activeCase={activeCase} />

      {/* 3. Reconstructed Flow Ledger Table */}
      <FlowLedgerPreview
        activeCase={activeCase}
        selectedFlowId={selectedFlowId}
        onSelectFlow={handleInspect}
      />
    </main>
  );
}
