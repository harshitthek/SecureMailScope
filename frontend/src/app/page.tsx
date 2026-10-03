"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EVIDENCE_CASES } from "@/lib/mock-data";
import { EvidenceCase, AnalysisResult } from "@/lib/types";
import { ApplicationHeader } from "@/components/shell/header";
import { NavStrip, ShellNavTab } from "@/components/shell/nav-strip";
import { CaseContextStrip } from "@/components/shell/case-context-strip";
import { OverviewView } from "@/components/overview/overview-view";
import { UploadModal } from "@/components/shell/upload-modal";
import { FlowsView } from "@/components/views/flows-view";
import { FindingsView } from "@/components/views/findings-view";
import { CertificatesView } from "@/components/views/certificates-view";
import { DissectorView } from "@/components/views/dissector-view";
import { StandardsView } from "@/components/views/standards-view";
import { ReportView } from "@/components/views/report-view";

function ForensicWorkstationInner() {
  const searchParams = useSearchParams();
  const caseParam = searchParams.get("case");
  const tabParam = searchParams.get("tab")?.toUpperCase();

  // Determine active case strictly based on URL query param or fallback to CASE-04
  const resolvedCase = useMemo(() => {
    if (caseParam) {
      const found = EVIDENCE_CASES.find(
        (c) =>
          c.case_code.toUpperCase() === caseParam.toUpperCase() ||
          c.id.toUpperCase() === caseParam.toUpperCase()
      );
      if (found) return found;
    }
    // Default to CASE-04 (ENTERPRISE_MIXED) as mandated by specification
    return EVIDENCE_CASES[3];
  }, [caseParam]);

  const [activeCase, setActiveCase] = useState<EvidenceCase>(resolvedCase);
  const [activeTab, setActiveTab] = useState<ShellNavTab>(
    (tabParam && ["OVERVIEW", "FLOWS", "FINDINGS", "CERTIFICATES", "DISSECTOR", "STANDARDS", "REPORT"].includes(tabParam))
      ? (tabParam as ShellNavTab)
      : "OVERVIEW"
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Synchronize state and guarantee URL consistency
  useEffect(() => {
    setActiveCase(resolvedCase);
    const currentUrlParam = new URLSearchParams(window.location.search).get("case");
    if (currentUrlParam !== resolvedCase.case_code) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("case", resolvedCase.case_code);
      window.history.replaceState(null, "", newUrl.toString());
    }
  }, [resolvedCase]);

  // When user switches case via the header dropdown
  const handleSelectCase = (c: EvidenceCase) => {
    setActiveCase(c);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("case", c.case_code);
    window.history.pushState(null, "", newUrl.toString());
  };

  const handleSelectTab = (tab: ShellNavTab) => {
    setActiveTab(tab);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.pushState(null, "", newUrl.toString());
  };

  const handleUploadSuccess = (analysis: AnalysisResult) => {
    const customCase: EvidenceCase = {
      id: analysis.analysis_id,
      case_code: "USER-CAP",
      name: analysis.filename.replace(/\.pcapng?$/i, "").toUpperCase(),
      label: `[CUSTOM: ${analysis.filename}]`,
      target_host: analysis.sessions[0]?.server_name || "Custom Capture Host",
      protocol: analysis.protocols_detected.join("/") || "EMAIL",
      severity:
        analysis.enterprise_score < 50
          ? "critical"
          : analysis.enterprise_score < 80
          ? "medium"
          : "secure",
      packet_count: analysis.total_packets,
      stream_count: analysis.total_sessions,
      posture_score: analysis.enterprise_score,
      posture_grade: analysis.enterprise_grade,
      bpf_filter: "tcp and port (25 or 587 or 465 or 993 or 110)",
      description: `User-uploaded forensic capture (${analysis.total_packets} packets, ${analysis.total_sessions} email streams).`,
      data: analysis,
    };
    setActiveCase(customCase);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("case", "USER-CAP");
    window.history.pushState(null, "", newUrl.toString());
  };

  return (
    <div className="min-h-screen flex flex-col bg-sms-canvas text-sms-text-primary selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-400 antialiased">
      {/* 1. Global Application Header Hero Banner */}
      <ApplicationHeader
        activeCase={activeCase}
        onSelectCase={handleSelectCase}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* 2. Integrated Navigation Strip */}
      <NavStrip
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        flowCount={activeCase.data.total_sessions}
        findingCount={activeCase.data.vulnerabilities.length}
      />

      {/* 3. Compact Case Context Row */}
      <CaseContextStrip activeCase={activeCase} />

      {/* 4. Active View Rendering */}
      {activeTab === "OVERVIEW" && (
        <OverviewView
          activeCase={activeCase}
          onNavigateToFlow={() => {
            handleSelectTab("FLOWS");
          }}
        />
      )}

      {activeTab === "FLOWS" && (
        <FlowsView
          activeCase={activeCase}
          onInspectFlowInDissector={() => {
            handleSelectTab("DISSECTOR");
          }}
        />
      )}

      {activeTab === "FINDINGS" && (
        <FindingsView
          activeCase={activeCase}
          onNavigateToFlow={() => {
            handleSelectTab("FLOWS");
          }}
        />
      )}

      {activeTab === "CERTIFICATES" && (
        <CertificatesView activeCase={activeCase} />
      )}

      {activeTab === "DISSECTOR" && (
        <DissectorView activeCase={activeCase} />
      )}

      {activeTab === "STANDARDS" && (
        <StandardsView activeCase={activeCase} />
      )}

      {activeTab === "REPORT" && (
        <ReportView activeCase={activeCase} />
      )}

      {/* Upload PCAP Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default function ForensicWorkstationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sms-canvas" />}>
      <ForensicWorkstationInner />
    </Suspense>
  );
}
