"use client";

import React, { useState } from "react";
import { EvidenceCase } from "@/lib/types";
import { PostureHero } from "./posture-hero";
import { EditorialQuoteBand } from "./editorial-quote-band";
import { ProtocolDivergenceStrip } from "./protocol-divergence-strip";
import { FlowLedgerPreview } from "./flow-ledger-preview";
import { SecurityTopology } from "./security-topology";
import { WhatIfSimulator } from "./what-if-simulator";
import { PostureDiffModal } from "./posture-diff-modal";
import { GitCompare } from "lucide-react";

interface OverviewViewProps {
  activeCase: EvidenceCase;
  onNavigateToFlow?: (flowId: number) => void;
}

export function OverviewView({ activeCase, onNavigateToFlow }: OverviewViewProps) {
  // Default to selecting Flow 3 if in CASE-04 (where STARTTLS downgrade occurs)
  const defaultFlowId = activeCase.data.sessions[2]?.session_id || activeCase.data.sessions[0]?.session_id || 1;
  const [selectedFlowId, setSelectedFlowId] = useState<number>(defaultFlowId);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const handleInspect = (flowId: number) => {
    setSelectedFlowId(flowId);
    if (onNavigateToFlow) {
      onNavigateToFlow(flowId);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-3 flex flex-col gap-6 pb-14 select-none">
      {/* 0. Baseline Comparison Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#08080a] border border-[#1c1d22] px-4 py-2.5 rounded-sm gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#9194a1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc9166]" />
          <span>FORENSIC BENCHMARK // NIST SP 800-52r2 CRYPTOGRAPHIC PROFILE</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDiffOpen(true)}
          className="px-3 py-1.5 text-xs font-mono text-[#e2e3e9] bg-[#121317] hover:bg-[#1c1d22] border border-[#2e3038] hover:border-[#cc9166]/50 rounded-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <GitCompare className="w-3.5 h-3.5 text-[#cc9166]" />
          <span>COMPARE WITH HARDENED BASELINE</span>
        </button>
      </div>

      {/* 1. Slash Hero Split Composition with Gilded Line Chart & Mini Ledger */}
      <PostureHero activeCase={activeCase} onInspectFlow={handleInspect} />

      {/* 2. Full-Bleed 4-Column Proof Stat Band & Didone Pull Quote (Video Frame 00:12) */}
      <EditorialQuoteBand activeCase={activeCase} />

      {/* 3. Interactive Hardening Sandbox & Real-Time Posture Elevation */}
      <WhatIfSimulator activeCase={activeCase} />

      {/* 4. Expected vs Observed Protocol Divergence Strip */}
      <ProtocolDivergenceStrip activeCase={activeCase} />

      {/* 5. Reconstructed Flow Ledger Table (Slash Data Table Archetype) */}
      <FlowLedgerPreview
        activeCase={activeCase}
        selectedFlowId={selectedFlowId}
        onSelectFlow={handleInspect}
      />

      {/* 6. Node Graph Security Topology & Defense Pillars (Video Frame 00:16) */}
      <SecurityTopology />

      {/* Forensic Posture Diff Modal */}
      <PostureDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        activeCase={activeCase}
      />
    </main>
  );
}
