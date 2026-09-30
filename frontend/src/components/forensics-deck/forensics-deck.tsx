"use client";

import { EvidenceCase, Session } from "@/lib/types";
import { DissectorMode } from "@/hooks/use-workstation";
import { PostureDial } from "./posture-dial";
import { TelemetryStrip } from "./telemetry-strip";
import { StreamMatrix } from "./stream-matrix";
import { ThreatRadar } from "./threat-radar";
import { DissectorDrawer } from "@/components/dissector/dissector-drawer";

interface ForensicsDeckProps {
  activeCase: EvidenceCase;
  filteredSessions: Session[];
  selectedStreamId: number | null;
  dissectorMode: DissectorMode;
  onSelectStream: (id: number | null) => void;
  onDissectorModeChange: (m: DissectorMode) => void;
  onResetFilter?: () => void;
}

export function ForensicsDeck({
  activeCase,
  filteredSessions,
  selectedStreamId,
  dissectorMode,
  onSelectStream,
  onDissectorModeChange,
  onResetFilter,
}: ForensicsDeckProps) {
  const { data } = activeCase;
  const selectedSession =
    filteredSessions.find((s) => s.session_id === selectedStreamId) ||
    filteredSessions[0] ||
    null;

  return (
    <main className="w-full flex-1 p-3 space-y-3 font-mono text-xs overflow-y-auto">
      {/* 1. Top Section: Posture Dial + Key Forensics Telemetry */}
      <section aria-label="Executive Posture & Telemetry" className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4">
          <PostureDial
            score={data.enterprise_score}
            grade={data.enterprise_grade}
            caseCode={activeCase.case_code}
          />
        </div>
        <div className="lg:col-span-8 flex flex-col justify-between gap-3">
          <TelemetryStrip
            sessions={data.sessions}
            vulnerabilities={data.vulnerabilities}
          />
          <ThreatRadar vulnerabilities={data.vulnerabilities} />
        </div>
      </section>

      {/* 2. Middle Section: Reconstructed Email Stream Matrix */}
      <section aria-label="Reconstructed Stream Matrix">
        <StreamMatrix
          sessions={filteredSessions}
          selectedStreamId={selectedStreamId}
          onSelectStream={(id) => onSelectStream(id)}
          onResetFilter={onResetFilter}
        />
      </section>

      {/* 3. Deep Stream Dissector Drawer */}
      {selectedSession && (
        <section aria-label="Deep Dissector Drawer">
          <DissectorDrawer
            session={selectedSession}
            mode={dissectorMode}
            onModeChange={onDissectorModeChange}
            onClose={() => onSelectStream(null)}
          />
        </section>
      )}
    </main>
  );
}
