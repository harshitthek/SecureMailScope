"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import { DissectorToolbar } from "@/components/dissector/dissector-toolbar";
import { DissectorPacketMatrix } from "@/components/dissector/dissector-packet-matrix";
import { DissectorHexDump } from "@/components/dissector/dissector-hex-dump";
import { DissectorProtocolTree } from "@/components/dissector/dissector-protocol-tree";

interface DissectorViewProps {
  sessions: Session[];
  selectedStreamId: number | null;
  onSelectStream: (id: number) => void;
}

export function DissectorView({
  sessions,
  selectedStreamId,
  onSelectStream,
}: DissectorViewProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  const currentStream =
    sessions.find((s) => s.session_id === selectedStreamId) || sessions[0] || null;

  if (!currentStream) {
    return (
      <div className="p-8 text-center text-xs text-tactical-dim font-mono">
        No active network streams available to dissect.
      </div>
    );
  }

  const steps = currentStream.forensic_inspection?.state_timeline || [];
  const currentStep = steps[selectedStepIndex] || steps[0];
  const chunks = currentStream.forensic_inspection?.raw_chunks || [];

  return (
    <div className="h-full flex flex-col font-mono select-none overflow-hidden bg-tactical-bg">
      {/* 1. Top Forensic Toolbar */}
      <DissectorToolbar
        sessions={sessions}
        currentStream={currentStream}
        onSelectStream={(id) => {
          onSelectStream(id);
          setSelectedStepIndex(0);
        }}
      />

      {/* 2. Dual-Pane Disassembly Workspace (Left: Frame Matrix | Right: Hex Dump & Protocol Tree) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Pane (40% width): Reconstructed Packet Frame Matrix */}
        <DissectorPacketMatrix
          session={currentStream}
          selectedStepIndex={selectedStepIndex}
          onSelectStepIndex={setSelectedStepIndex}
        />

        {/* Right Pane (60% width): Synchronized Hex & ASCII Dissector + Protocol Struct Tree */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <DissectorHexDump
            chunks={chunks}
            selectedOffset={currentStep?.packet_offset}
          />

          <DissectorProtocolTree
            session={currentStream}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
