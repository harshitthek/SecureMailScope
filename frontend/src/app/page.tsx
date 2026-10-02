"use client";

import { useState } from "react";
import { useWorkstation } from "@/hooks/use-workstation";
import { TopHeader } from "@/components/layout/top-header";
import { OverviewView } from "@/components/views/overview-view";
import { SessionsView } from "@/components/views/sessions-view";
import { FindingsView } from "@/components/views/findings-view";
import { CertificatesView } from "@/components/views/certificates-view";
import { DissectorView } from "@/components/views/dissector-view";
import { StandardsView } from "@/components/views/standards-view";
import { ReportsView } from "@/components/views/reports-view";
import { SessionDetailModal } from "@/components/session-detail/session-detail-modal";
import { UploadModal } from "@/components/overview/upload-modal";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    activeView,
    setActiveView,

    cases,
    activeCaseId,
    activeCase,
    selectCase,

    bpfFilter,
    setBpfFilter,
    filteredSessions,
    matchCount,

    activeSession,
    isDetailOpen,
    detailTab,
    openSessionDetail,
    closeSessionDetail,
    setDetailTab,

    selectedStreamId,
    setSelectedStreamId,
    navigateToDissector,

    isAnalyzing,
    uploadError,
    clearUploadError,
    handleFileUpload,
  } = useWorkstation();

  return (
    <div className="min-h-screen bg-tactical-bg text-tactical-text flex flex-col bg-tactical-grid selection:bg-phosphor-cyan/20 selection:text-white relative">
      {/* 1. Full-Width Forensic Instrument Control Surface Header */}
      <TopHeader
        cases={cases}
        activeCaseId={activeCaseId}
        onSelectCase={selectCase}
        activeCase={activeCase}
        activeView={activeView}
        onSelectView={setActiveView}
        bpfFilter={bpfFilter}
        onFilterChange={setBpfFilter}
        matchCount={matchCount}
        isAnalyzing={isAnalyzing}
        onFileUpload={handleFileUpload}
        onOpenUploadModal={() => setIsUploadOpen(true)}
      />

      {/* Upload Error Banner if any */}
      {uploadError && (
        <div className="w-full bg-phosphor-hazard/10 border-b border-phosphor-hazard/40 px-4 py-1.5 flex items-center justify-between text-xs text-phosphor-hazard z-30 font-mono">
          <span>{uploadError}</span>
          <button
            onClick={clearUploadError}
            className="text-[10px] font-bold uppercase underline hover:text-white"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 2. Full-Width Forensic Evidence Viewport (No Generic SaaS Sidebar) */}
      <div className="flex-1 flex w-full min-h-0 relative z-10 overflow-hidden">
        <main className="flex-1 w-full min-w-0 overflow-y-auto bg-tactical-bg/80">
          {activeView === "OVERVIEW" && (
            <OverviewView
              data={activeCase.data}
              caseCode={activeCase.id}
              onNavigate={setActiveView}
              onOpenSessionDetail={(sessionId) => {
                setSelectedStreamId(sessionId);
                setActiveView("SESSIONS");
              }}
              onNavigateToDissector={navigateToDissector}
            />
          )}

          {activeView === "SESSIONS" && (
            <SessionsView
              sessions={filteredSessions}
              selectedStreamId={selectedStreamId}
              onOpenSessionDetail={openSessionDetail}
              onNavigateToDissector={navigateToDissector}
            />
          )}

          {activeView === "FINDINGS" && (
            <FindingsView
              vulnerabilities={activeCase.data.vulnerabilities}
              onOpenSessionDetail={openSessionDetail}
              onNavigateToDissector={navigateToDissector}
            />
          )}

          {activeView === "CERTIFICATES" && (
            <CertificatesView
              sessions={activeCase.data.sessions}
              onOpenSessionDetail={openSessionDetail}
            />
          )}

          {activeView === "DISSECTOR" && (
            <DissectorView
              sessions={activeCase.data.sessions}
              selectedStreamId={selectedStreamId}
              onSelectStream={setSelectedStreamId}
            />
          )}

          {activeView === "STANDARDS" && (
            <StandardsView
              compliance={activeCase.data.compliance}
              sessions={activeCase.data.sessions}
            />
          )}

          {activeView === "REPORTS" && (
            <ReportsView data={activeCase.data} />
          )}
        </main>
      </div>

      {/* 3. Deep Session Detail Slide-over / Modal (Available on demand) */}
      <SessionDetailModal
        session={activeSession}
        isOpen={isDetailOpen}
        activeTab={detailTab}
        onTabChange={setDetailTab}
        onClose={closeSessionDetail}
        onNavigateToDissector={navigateToDissector}
      />

      {/* 4. Forensic PCAP Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileUpload={(file) => {
          setIsUploadOpen(false);
          handleFileUpload(file);
        }}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}
