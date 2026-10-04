"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EVIDENCE_CASES } from "@/lib/mock-data";
import { EvidenceCase, AnalysisResult } from "@/lib/types";
import { ApplicationHeader } from "@/components/shell/header";
import { NavStrip, ShellNavTab } from "@/components/shell/nav-strip";
import { CaseContextStrip } from "@/components/shell/case-context-strip";
import { OverviewView } from "@/components/overview/overview-view";
import { UploadModal } from "@/components/shell/upload-modal";
import { ShortcutHudModal } from "@/components/shell/shortcut-hud-modal";
import { ToastProvider, useToast } from "@/components/shell/toast";
import { FlowsView } from "@/components/views/flows-view";
import { FindingsView } from "@/components/views/findings-view";
import { CertificatesView } from "@/components/views/certificates-view";
import { DissectorView } from "@/components/views/dissector-view";
import { StandardsView } from "@/components/views/standards-view";
import { RemediationView } from "@/components/views/remediation/remediation-view";
import { ReportView } from "@/components/views/report-view";
import { ApplicationFooter } from "@/components/shell/footer";
import { getReportUrl, getAnalysis } from "@/lib/api";
import { useLiveTap } from "@/hooks/useLiveTap";
import { TapStatusBar } from "@/components/telemetry/tap-status-bar";
import { LiveAlertToast } from "@/components/telemetry/live-alert-toast";
import { SiemTelemetryModal } from "@/components/telemetry/siem-telemetry-modal";
import { WireThreatFeedDrawer } from "@/components/telemetry/wire-threat-feed-drawer";

function ForensicWorkstationInner() {
  const searchParams = useSearchParams();
  const caseParam = searchParams.get("case");
  const tabParam = searchParams.get("tab")?.toUpperCase();
  const { showToast } = useToast();

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
    (tabParam && ["OVERVIEW", "FLOWS", "FINDINGS", "CERTIFICATES", "DISSECTOR", "STANDARDS", "REMEDIATION", "REPORT"].includes(tabParam))
      ? (tabParam as ShellNavTab)
      : "OVERVIEW"
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [isSiemOpen, setIsSiemOpen] = useState(false);
  const [isThreatsOpen, setIsThreatsOpen] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<number>(
    resolvedCase.data.sessions[0]?.session_id || 1
  );
  const [selectedFlowIdForFlows, setSelectedFlowIdForFlows] = useState<number | null>(null);
  const { tapState, activeAlert, alertHistory, isConnected, dismissAlert, clearAlerts } = useLiveTap();

  // Synchronize state, fetch live backend analysis data, and guarantee URL consistency
  useEffect(() => {
    setActiveCase(resolvedCase);
    setSelectedStreamId(resolvedCase.data.sessions[0]?.session_id || 1);
    const currentUrlParam = new URLSearchParams(window.location.search).get("case");
    if (currentUrlParam !== resolvedCase.case_code) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("case", resolvedCase.case_code);
      window.history.replaceState(null, "", newUrl.toString());
    }

    // Sync live forensic data from backend if available
    const controller = new AbortController();
    getAnalysis(resolvedCase.case_code, controller.signal)
      .then((liveData: AnalysisResult | null) => {
        if (liveData) {
          setActiveCase((prev) => {
            if (prev.case_code !== resolvedCase.case_code) {
              return prev;
            }
            return {
              ...prev,
              data: {
                ...prev.data,
                ...liveData,
                sessions: liveData.sessions && liveData.sessions.length > 0 ? liveData.sessions : prev.data.sessions,
                vulnerabilities: liveData.vulnerabilities && liveData.vulnerabilities.length > 0 ? liveData.vulnerabilities : prev.data.vulnerabilities,
              },
            };
          });
        }
      })
      .catch((err) => {
        if (err && err.name === "AbortError") return;
        // Fallback safely to pre-bundled local data
      });

    return () => controller.abort();
  }, [resolvedCase]);

  // When user switches case via the header dropdown
  const handleSelectCase = useCallback((c: EvidenceCase) => {
    setActiveCase(c);
    setSelectedStreamId(c.data.sessions[0]?.session_id || 1);
    setSelectedFlowIdForFlows(null);
    showToast(`Loaded Evidence Profile: ${c.label}`, "info");
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("case", c.case_code);
    window.history.pushState(null, "", newUrl.toString());
  }, [showToast]);

  const handleSelectTab = useCallback((tab: ShellNavTab) => {
    setActiveTab(tab);
    if (tab !== "FLOWS") {
      setSelectedFlowIdForFlows(null);
    }
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.pushState(null, "", newUrl.toString());
  }, []);

  const handleExport = useCallback((format: "pdf" | "json" | "html") => {
    const url = getReportUrl(activeCase.data.analysis_id, format);
    showToast(`Generating ${format.toUpperCase()} Forensic Dossier...`, "success");
    window.open(url, "_blank");
  }, [activeCase, showToast]);

  // SOC Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggers when modifier keys are held or when modals/drawers are open
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (isUploadOpen || isHudOpen || (activeTab === "FLOWS" && selectedFlowIdForFlows !== null)) {
        return;
      }

      // Ignore shortcut triggers when user is focused inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      // Hotkey: 1 to 7 tab navigation
      const tabMap: Record<string, ShellNavTab> = {
        "1": "OVERVIEW",
        "2": "FLOWS",
        "3": "FINDINGS",
        "4": "CERTIFICATES",
        "5": "DISSECTOR",
        "6": "STANDARDS",
        "7": "REMEDIATION",
        "8": "REPORT",
      };

      if (tabMap[e.key]) {
        e.preventDefault();
        handleSelectTab(tabMap[e.key]);
        showToast(`Jumped to ${tabMap[e.key]} Deck [${e.key}]`, "info");
        return;
      }

      // Hotkey: ? -> toggle shortcut cheat sheet
      if (e.key === "?") {
        e.preventDefault();
        setIsHudOpen((prev) => !prev);
        return;
      }

      // Hotkey: / -> focus flow search input
      if (e.key === "/") {
        e.preventDefault();
        if (activeTab !== "FLOWS") {
          handleSelectTab("FLOWS");
        }
        setTimeout(() => {
          const input = document.getElementById("flows-search-input");
          if (input) {
            input.focus();
          }
        }, 50);
        return;
      }

      // Hotkey: U -> open PCAP upload modal
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        setIsUploadOpen(true);
        return;
      }

      // Hotkey: D -> download PDF dossier
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleExport("pdf");
        return;
      }

      // Hotkey: H -> download HTML dossier
      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        handleExport("html");
        return;
      }

      // Hotkey: J -> download JSON report
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleExport("json");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handleExport, handleSelectTab, showToast, isUploadOpen, isHudOpen, selectedFlowIdForFlows]);

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
    setSelectedStreamId(analysis.sessions[0]?.session_id || 1);
    setSelectedFlowIdForFlows(null);
    showToast(`Successfully analyzed PCAP: ${analysis.filename}`, "success");
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("case", "USER-CAP");
    window.history.pushState(null, "", newUrl.toString());
  };

  const handleSnapshotSuccess = (analysis: AnalysisResult) => {
    const tapCase: EvidenceCase = {
      id: analysis.analysis_id,
      case_code: analysis.case_code || "TAP-CAP",
      name: analysis.filename.replace(/\.pcapng?$/i, "").toUpperCase(),
      label: `[TAP: ${analysis.filename}]`,
      target_host: analysis.sessions[0]?.server_name || "Live Wire Sensor",
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
      bpf_filter: "tcp and (port 25 or 587 or 465 or 993 or 110)",
      description: `Passive network TAP wire capture (${analysis.total_packets} packets, ${analysis.total_sessions} email streams).`,
      data: analysis,
    };
    setActiveCase(tapCase);
    setSelectedStreamId(analysis.sessions[0]?.session_id || 1);
    setSelectedFlowIdForFlows(null);
    showToast(`Engaged live TAP capture dossier: ${analysis.filename}`, "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-sms-canvas text-sms-text-primary selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-400 antialiased">
      {/* 0. Live In-flight Wire Alert Banner */}
      <LiveAlertToast alert={activeAlert} onDismiss={dismissAlert} />

      {/* 1. Global Application Header Hero Banner */}
      <ApplicationHeader
        activeCase={activeCase}
        onSelectCase={handleSelectCase}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* 1.5. Live Passive Network TAP Telemetry & Control Bar */}
      <TapStatusBar
        tapState={tapState}
        isConnected={isConnected}
        threatCount={alertHistory.length}
        onOpenSiem={() => setIsSiemOpen(true)}
        onOpenThreats={() => setIsThreatsOpen(true)}
        onSnapshotSuccess={handleSnapshotSuccess}
        onToast={showToast}
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
          onNavigateToFlow={(flowId: number) => {
            setSelectedStreamId(flowId);
            setSelectedFlowIdForFlows(flowId);
            handleSelectTab("DISSECTOR");
          }}
        />
      )}

      {activeTab === "FLOWS" && (
        <FlowsView
          activeCase={activeCase}
          initialFlowId={selectedFlowIdForFlows}
          onInspectFlowInDissector={(flowId: number) => {
            setSelectedStreamId(flowId);
            setSelectedFlowIdForFlows(null);
            handleSelectTab("DISSECTOR");
          }}
        />
      )}

      {activeTab === "FINDINGS" && (
        <FindingsView
          activeCase={activeCase}
          onNavigateToFlow={(flowId: number) => {
            setSelectedFlowIdForFlows(flowId);
            setSelectedStreamId(flowId);
            handleSelectTab("FLOWS");
          }}
        />
      )}

      {activeTab === "CERTIFICATES" && (
        <CertificatesView activeCase={activeCase} />
      )}

      {activeTab === "DISSECTOR" && (
        <DissectorView
          activeCase={activeCase}
          initialStreamId={selectedStreamId}
        />
      )}

      {activeTab === "STANDARDS" && (
        <StandardsView activeCase={activeCase} />
      )}

      {activeTab === "REMEDIATION" && (
        <RemediationView activeCase={activeCase} />
      )}

      {activeTab === "REPORT" && (
        <ReportView activeCase={activeCase} />
      )}

      {/* 5. Slash Editorial Footer */}
      <ApplicationFooter />

      {/* Upload PCAP Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Keyboard Shortcuts & Command HUD Modal */}
      <ShortcutHudModal
        isOpen={isHudOpen}
        onClose={() => setIsHudOpen(false)}
        onSelectTab={handleSelectTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportPdf={() => handleExport("pdf")}
        onExportHtml={() => handleExport("html")}
        onExportJson={() => handleExport("json")}
      />

      {/* Enterprise SIEM & SOC Telemetry Modal */}
      <SiemTelemetryModal
        isOpen={isSiemOpen}
        onClose={() => setIsSiemOpen(false)}
      />

      {/* In-Flight Wire Threat Event Drawer */}
      <WireThreatFeedDrawer
        isOpen={isThreatsOpen}
        onClose={() => setIsThreatsOpen(false)}
        alerts={alertHistory}
        onClear={clearAlerts}
      />
    </div>
  );
}

export default function ForensicWorkstationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sms-canvas" />}>
      <ToastProvider>
        <ForensicWorkstationInner />
      </ToastProvider>
    </Suspense>
  );
}
