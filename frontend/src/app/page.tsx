"use client";

import { useWorkstation } from "@/hooks/use-workstation";
import { TopTelemetryHeader } from "@/components/telemetry/top-telemetry-header";
import { BpfFilterBar } from "@/components/telemetry/bpf-filter-bar";
import { EvidencePane } from "@/components/evidence-pane/evidence-pane";
import { ForensicsDeck } from "@/components/forensics-deck/forensics-deck";

export default function Home() {
  const {
    cases,
    activeCaseId,
    activeCase,
    bpfFilter,
    quickFilter,
    selectedStreamId,
    filteredSessions,
    matchCount,
    dissectorMode,
    isAnalyzing,
    uploadError,
    selectCase,
    setBpfFilter,
    setQuickFilter,
    setSelectedStreamId,
    setDissectorMode,
    clearUploadError,
    handleFileUpload,
  } = useWorkstation();

  return (
    <div className="min-h-screen bg-tactical-bg text-tactical-text font-mono flex flex-col bg-tactical-grid selection:bg-phosphor-cyan/20 selection:text-white relative">
      {/* Non-interactive CRT Scanline Atmospheric Overlay */}
      <div
        className="crt-scanlines fixed inset-0 pointer-events-none z-50 opacity-40"
        aria-hidden="true"
      />

      {/* 1. Top Telemetry & Sensor Header */}
      <TopTelemetryHeader activeCase={activeCase} />

      {/* 2. Active BPF Filter Bar */}
      <BpfFilterBar
        filter={bpfFilter}
        onFilterChange={setBpfFilter}
        matchCount={matchCount}
      />

      {/* 3. 3-Pane Operational Forensics Workstation Body */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0 border-t border-tactical-border">
        {/* Left Pane — Evidence & Capture Queue */}
        <div className="w-full lg:w-80 lg:min-w-[320px] lg:max-w-[340px] flex-shrink-0">
          <EvidencePane
            cases={cases}
            activeCaseId={activeCaseId}
            activeCase={activeCase}
            quickFilter={quickFilter}
            isAnalyzing={isAnalyzing}
            uploadError={uploadError}
            onClearError={clearUploadError}
            onSelectCase={selectCase}
            onFilterChange={setQuickFilter}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Center / Right — Main Forensics Deck */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ForensicsDeck
            activeCase={activeCase}
            filteredSessions={filteredSessions}
            selectedStreamId={selectedStreamId}
            dissectorMode={dissectorMode}
            onSelectStream={setSelectedStreamId}
            onDissectorModeChange={setDissectorMode}
            onResetFilter={() =>
              setBpfFilter("tcp and (port 25 or 587 or 465 or 993 or 110)")
            }
          />
        </div>
      </div>
    </div>
  );
}
