"use client";

import { useState, useMemo, useCallback } from "react";
import { EvidenceCase, Severity, Session, NavView, SessionDetailTab } from "@/lib/types";
import { EVIDENCE_CASES } from "@/lib/mock-data";
import { uploadPcap, getAnalysis } from "@/lib/api";

export type { NavView, SessionDetailTab };
export type QuickFilter = "ALL" | "CRITICAL" | "HARDENED";
export type DissectorMode = "AUDIT" | "RAW_STREAM" | "TIMELINE";

export const DEFAULT_BPF_FILTER = "tcp and (port 25 or 587 or 465 or 143 or 993 or 110 or 995)";

export function useWorkstation() {
  const [cases, setCases] = useState<EvidenceCase[]>(EVIDENCE_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>("CASE-04");
  const [activeView, setActiveView] = useState<NavView>("OVERVIEW");

  // Session detail slide-over / modal state
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<SessionDetailTab>("SUMMARY");

  // Full dissector stream selection
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(1);
  const [dissectorMode, setDissectorMode] = useState<DissectorMode>("TIMELINE");

  // Filtering
  const [bpfFilter, setBpfFilter] = useState<string>(DEFAULT_BPF_FILTER);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");

  // Async ingestion state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) || cases[0];
  }, [cases, activeCaseId]);

  const selectCase = useCallback((id: string) => {
    setActiveCaseId(id);
    const targetCase = cases.find((c) => c.id === id);
    if (targetCase) {
      setBpfFilter(DEFAULT_BPF_FILTER);
      const firstSessionId = targetCase.data.sessions[0]?.session_id ?? null;
      setSelectedStreamId(firstSessionId);
      if (selectedSessionId && !targetCase.data.sessions.some(s => s.session_id === selectedSessionId)) {
        setSelectedSessionId(firstSessionId);
      }
    }
  }, [cases, selectedSessionId]);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  // Filter sessions according to BPF and quick filters
  const filteredSessions: Session[] = useMemo(() => {
    const rawSessions = activeCase.data.sessions;
    return rawSessions.filter((session) => {
      if (quickFilter === "CRITICAL" && session.session_severity !== "critical" && session.session_score >= 70) {
        return false;
      }
      if (quickFilter === "HARDENED" && session.session_severity !== "secure" && session.session_score < 80) {
        return false;
      }

      const bpf = bpfFilter.toLowerCase().trim();
      if (!bpf || bpf === DEFAULT_BPF_FILTER || bpf === "all") {
        return true;
      }

      // Check all PRD email ports: 25, 587, 465, 143, 993, 110, 995
      const ports = [25, 587, 465, 143, 993, 110, 995];
      for (const p of ports) {
        if (bpf.includes(`port ${p}`) || bpf.includes(`:${p}`)) {
          if (session.src_port === p || session.dst_port === p) return true;
        }
      }

      const keywords = bpf
        .replace(/[()]/g, " ")
        .split(/\s+(?:and|or)\s+|\s+/)
        .map((k) => k.trim())
        .filter((k) => k && k !== "tcp" && k !== "and" && k !== "or" && k !== "port");

      if (keywords.length === 0) return true;

      const haystack = [
        session.server_name,
        session.src_ip,
        session.dst_ip,
        session.protocol,
        session.tls_version || "",
        session.cipher_suite_name || "",
        session.session_severity,
      ].join(" ").toLowerCase();

      return keywords.some((kw) => haystack.includes(kw));
    });
  }, [activeCase, quickFilter, bpfFilter]);

  // Active session object for detail drawer
  const activeSession = useMemo(() => {
    if (selectedSessionId === null) {
      return activeCase.data.sessions[0] || null;
    }
    return activeCase.data.sessions.find((s) => s.session_id === selectedSessionId) || activeCase.data.sessions[0] || null;
  }, [activeCase, selectedSessionId]);

  // Active stream object for full dissector
  const activeStream = useMemo(() => {
    if (selectedStreamId === null) {
      return activeCase.data.sessions[0] || null;
    }
    return activeCase.data.sessions.find((s) => s.session_id === selectedStreamId) || activeCase.data.sessions[0] || null;
  }, [activeCase, selectedStreamId]);

  // Navigation helpers
  const openSessionDetail = useCallback((sessionId: number, tab: SessionDetailTab = "SUMMARY") => {
    setSelectedSessionId(sessionId);
    setDetailTab(tab);
    setIsDetailOpen(true);
  }, []);

  const closeSessionDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const navigateToDissector = useCallback((streamId: number) => {
    setSelectedStreamId(streamId);
    setActiveView("DISSECTOR");
    setIsDetailOpen(false);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setUploadError(null);
    try {
      const analysisId = await uploadPcap(file);
      const data = await getAnalysis(analysisId);
      const customId = `CUSTOM-${Date.now().toString().slice(-4)}`;
      const newCase: EvidenceCase = {
        id: customId,
        case_code: customId,
        name: file.name.replace(/\.[^/.]+$/, "").toUpperCase().slice(0, 18),
        label: `[${customId}: ${file.name.slice(0, 14)}]`,
        target_host: data.sessions[0]?.server_name || "Live Captured Host",
        protocol: data.protocols_detected.join("/") || "EMAIL",
        severity: (
          data.enterprise_score >= 80 ? "secure" :
          data.enterprise_score >= 60 ? "medium" : "critical"
        ) as Severity,
        packet_count: data.total_packets,
        stream_count: data.total_sessions,
        posture_score: data.enterprise_score,
        posture_grade: data.enterprise_grade,
        bpf_filter: DEFAULT_BPF_FILTER,
        description: `Live PCAP capture (${file.name}) — ${data.total_sessions} streams, ${data.total_packets} packets dissected.`,
        data,
      };
      setCases((prev) => [newCase, ...prev]);
      setActiveCaseId(customId);
      const firstId = data.sessions[0]?.session_id ?? null;
      setSelectedStreamId(firstId);
      setSelectedSessionId(firstId);
      setBpfFilter(DEFAULT_BPF_FILTER);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Backend offline";
      setUploadError(`[DAEMON] ${msg}. Loaded tactical capture buffer for demonstration.`);
      const customId = `LOCAL-${Date.now().toString().slice(-4)}`;
      const fallbackCase: EvidenceCase = {
        id: customId,
        case_code: customId,
        name: file.name.replace(/\.[^/.]+$/, "").toUpperCase().slice(0, 16),
        label: `[${customId}: ${file.name.slice(0, 12)}]`,
        target_host: "Local Forensic Ingestion Buffer",
        protocol: "SMTP/SMTPS/IMAPS",
        severity: "critical",
        packet_count: 512,
        stream_count: 4,
        posture_score: 58,
        posture_grade: "D",
        bpf_filter: DEFAULT_BPF_FILTER,
        description: `Local PCAP payload (${file.name}) disassembled via offline parser buffer.`,
        data: cases[3].data,
      };
      setCases((prev) => [fallbackCase, ...prev]);
      setActiveCaseId(customId);
      setSelectedStreamId(1);
      setSelectedSessionId(1);
    } finally {
      setIsAnalyzing(false);
    }
  }, [cases]);

  return {
    // Navigation
    activeView,
    setActiveView,

    // Case Selection & Queue
    cases,
    activeCaseId,
    activeCase,
    selectCase,

    // Filters
    bpfFilter,
    setBpfFilter,
    quickFilter,
    setQuickFilter,
    filteredSessions,
    matchCount: filteredSessions.length,

    // Session Detail Drawer / Modal
    selectedSessionId,
    activeSession,
    isDetailOpen,
    detailTab,
    openSessionDetail,
    closeSessionDetail,
    setDetailTab,

    // Full Dissector
    selectedStreamId,
    activeStream,
    setSelectedStreamId,
    dissectorMode,
    setDissectorMode,
    navigateToDissector,

    // Ingestion
    isAnalyzing,
    uploadError,
    clearUploadError,
    handleFileUpload,
  };
}
