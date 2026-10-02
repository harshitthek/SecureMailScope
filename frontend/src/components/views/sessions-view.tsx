"use client";

import { useState, useMemo } from "react";
import { Session, ProtocolStateStep } from "@/lib/types";
import { FlowIndexPane } from "@/components/investigation/flow-index-pane";
import { ProtocolTimelinePane } from "@/components/investigation/protocol-timeline-pane";
import { EvidenceInspectorPane } from "@/components/investigation/evidence-inspector-pane";
import { RawStreamDrawer } from "@/components/investigation/raw-stream-drawer";
import { Binary, Network } from "lucide-react";

interface SessionsViewProps {
  sessions: Session[];
  selectedStreamId?: number | null;
  onOpenSessionDetail?: (sessionId: number) => void;
  onNavigateToDissector: (streamId: number) => void;
}

export function SessionsView({
  sessions,
  selectedStreamId,
  onNavigateToDissector,
}: SessionsViewProps) {
  const [activeSessionId, setActiveSessionId] = useState<number>(
    selectedStreamId ?? (sessions[0]?.session_id ?? 1)
  );

  const [selectedStep, setSelectedStep] = useState<ProtocolStateStep | null>(null);

  const currentSession = useMemo(() => {
    return (
      sessions.find((s) => s.session_id === activeSessionId) ||
      sessions[0] ||
      null
    );
  }, [sessions, activeSessionId]);

  if (!currentSession) {
    return (
      <div className="p-12 text-center text-xs font-mono text-tactical-dim">
        No active email streams recorded in this PCAP evidence.
      </div>
    );
  }

  const isCrit =
    currentSession.session_score < 50 || currentSession.session_severity === "critical";
  const isDeg =
    currentSession.session_score >= 50 && currentSession.session_score < 80;

  return (
    <div className="h-full flex flex-col font-mono select-none overflow-hidden bg-tactical-bg">
      {/* 1. Top Investigation Ribbon */}
      <div className="border-b border-tactical-border/80 bg-tactical-surface px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Network className="w-4 h-4 text-phosphor-cyan" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                FLOW INVESTIGATION WORKSPACE
              </span>
              <span className="text-xs text-tactical-dim font-mono">
                {"// "}{currentSession.server_name || currentSession.dst_ip}
              </span>
            </div>
            <div className="text-[11px] text-tactical-dim flex items-center gap-2 mt-0.5">
              <span>FLOW #{currentSession.session_id < 10 ? `0${currentSession.session_id}` : currentSession.session_id}</span>
              <span className="text-tactical-muted">•</span>
              <span className="text-white font-mono">
                {currentSession.src_ip}:{currentSession.src_port} &rarr; {currentSession.dst_ip}:{currentSession.dst_port}
              </span>
              <span className="text-tactical-muted">•</span>
              <span className="text-phosphor-cyan font-bold">{currentSession.protocol}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-tactical-dim block">
              POSTURE
            </span>
            <span
              className={`text-xs font-bold tabular-nums px-2 py-0.5 border ${
                isCrit
                  ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 text-phosphor-hazard"
                  : isDeg
                  ? "border-phosphor-amber/60 bg-phosphor-amber/10 text-phosphor-amber"
                  : "border-phosphor-green/60 bg-phosphor-green/10 text-phosphor-green"
              }`}
            >
              {currentSession.session_score} / 100 ({currentSession.session_grade})
            </span>
          </div>

          <button
            onClick={() => onNavigateToDissector(currentSession.session_id)}
            className="px-3 py-1.5 border border-phosphor-cyan/60 bg-tactical-elevated hover:bg-tactical-surfaceHover text-phosphor-cyan text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all active:translate-y-[1px]"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>DISSECT</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Pane Layout (Left: Flow Index | Center: Protocol Timeline | Right: Evidence Inspector) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <FlowIndexPane
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setSelectedStep(null);
          }}
        />

        <ProtocolTimelinePane
          session={currentSession}
          selectedStep={selectedStep}
          onSelectStep={setSelectedStep}
        />

        <EvidenceInspectorPane
          session={currentSession}
          selectedStep={selectedStep}
        />
      </div>

      {/* 3. Bottom Raw Wire Stream Drawer */}
      <RawStreamDrawer
        chunks={currentSession.forensic_inspection?.raw_chunks || []}
        streamId={currentSession.session_id}
      />
    </div>
  );
}
