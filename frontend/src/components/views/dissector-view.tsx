"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import { StreamSelectorBanner } from "@/components/dissector/stream-selector-banner";
import { DissectorTimelineTab } from "@/components/dissector/dissector-timeline-tab";
import { DissectorModeA } from "@/components/dissector/dissector-mode-a";
import { DissectorRawTab } from "@/components/dissector/dissector-raw-tab";
import { ArrowRight, Binary, Lock } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "CRYPTANALYSIS" | "RAW_STREAM">("TIMELINE");

  const currentStream =
    sessions.find((s) => s.session_id === selectedStreamId) || sessions[0] || null;

  if (!currentStream) {
    return (
      <div className="p-8 text-center text-xs text-tactical-dim font-mono">
        No active network streams available to dissect.
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1680px] mx-auto w-full select-none font-mono">
      {/* 1. Stream Selector Bar */}
      <StreamSelectorBanner
        sessions={sessions}
        currentStream={currentStream}
        onSelectStream={onSelectStream}
      />

      {/* 2. Dissector Mode Tabs */}
      <div className="flex items-center border-b border-tactical-border bg-tactical-surface px-3">
        <button
          onClick={() => setActiveTab("TIMELINE")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TIMELINE"
              ? "border-phosphor-cyan text-white bg-tactical-elevated/40"
              : "border-transparent text-tactical-dim hover:text-white"
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>1. PROTOCOL STATE TIMELINE</span>
        </button>

        <button
          onClick={() => setActiveTab("CRYPTANALYSIS")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "CRYPTANALYSIS"
              ? "border-phosphor-cyan text-white bg-tactical-elevated/40"
              : "border-transparent text-tactical-dim hover:text-white"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>2. TLS RECORDS &amp; CRYPTANALYSIS</span>
        </button>

        <button
          onClick={() => setActiveTab("RAW_STREAM")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "RAW_STREAM"
              ? "border-phosphor-cyan text-white bg-tactical-elevated/40"
              : "border-transparent text-tactical-dim hover:text-white"
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>3. RAW WIRE STREAM (HEX / ASCII)</span>
        </button>
      </div>

      {/* 3. Mode View Body */}
      <div className="border border-tactical-border bg-tactical-surface p-4">
        {activeTab === "TIMELINE" && (
          <DissectorTimelineTab currentStream={currentStream} />
        )}

        {activeTab === "CRYPTANALYSIS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs">
              <span className="font-bold text-white uppercase">X.509 Certs, JA3 Fingerprints &amp; Scoring Ledger</span>
              <span className="text-tactical-dim">FLOW #{currentStream.session_id}</span>
            </div>
            <DissectorModeA session={currentStream} />
          </div>
        )}

        {activeTab === "RAW_STREAM" && (
          <DissectorRawTab currentStream={currentStream} />
        )}
      </div>
    </div>
  );
}
