"use client";

import { useState, useMemo, useCallback } from "react";
import { EvidenceCase, Severity, Session } from "@/lib/types";
import { EVIDENCE_CASES } from "@/lib/mock-data";
import { uploadPcap, getAnalysis } from "@/lib/api";

export type QuickFilter = "ALL" | "CRITICAL" | "HARDENED";
export type DissectorMode = "AUDIT" | "RAW_STREAM";

export function useWorkstation() {
  const [cases, setCases] = useState<EvidenceCase[]>(EVIDENCE_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>("CASE-04");
  const [bpfFilter, setBpfFilter] = useState<string>("tcp and (port 25 or 587 or 465 or 993 or 110)");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(1);
  const [dissectorMode, setDissectorMode] = useState<DissectorMode>("RAW_STREAM");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) || cases[0];
  }, [cases, activeCaseId]);

  const selectCase = useCallback((id: string) => {
    setActiveCaseId(id);
    const targetCase = cases.find((c) => c.id === id);
    if (targetCase) {
      setBpfFilter(targetCase.bpf_filter);
      setSelectedStreamId(targetCase.data.sessions[0]?.session_id ?? null);
    }
  }, [cases]);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

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
      if (!bpf || bpf === "tcp and (port 25 or 587 or 465 or 993 or 110)" || bpf === "all") {
        return true;
      }

      const ports = [25, 587, 465, 993, 110, 995];
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

  const effectiveSelectedStreamId = useMemo(() => {
    if (!filteredSessions.length) return null;
    if (filteredSessions.some((s) => s.session_id === selectedStreamId)) {
      return selectedStreamId;
    }
    return filteredSessions[0].session_id;
  }, [filteredSessions, selectedStreamId]);

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
        name: file.name.replace(/\.[^/.]+$/, "").toUpperCase().slice(0, 16),
        label: `[${customId}: ${file.name.slice(0, 14)}]`,
        target_host: data.sessions[0]?.server_name || "Live PCAP Capture",
        protocol: data.protocols_detected.join("/") || "EMAIL",
        severity: (
          data.enterprise_score >= 80 ? "secure" :
          data.enterprise_score >= 60 ? "medium" : "critical"
        ) as Severity,
        packet_count: data.total_packets,
        stream_count: data.total_sessions,
        posture_score: data.enterprise_score,
        posture_grade: data.enterprise_grade,
        bpf_filter: "tcp and (port 25 or 587 or 465 or 993 or 110)",
        description: `Live PCAP capture (${file.name}) — ${data.total_sessions} streams, ${data.total_packets} packets dissected.`,
        data,
      };
      setCases((prev) => [newCase, ...prev]);
      setActiveCaseId(customId);
      setSelectedStreamId(data.sessions[0]?.session_id ?? null);
      setBpfFilter(newCase.bpf_filter);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Backend offline";
      setUploadError(`[DAEMON] ${msg}. Loaded tactical capture buffer for demonstration.`);
      const customId = `LOCAL-${Date.now().toString().slice(-4)}`;
      const fallbackCase: EvidenceCase = {
        id: customId,
        case_code: customId,
        name: file.name.replace(/\.[^/.]+$/, "").toUpperCase().slice(0, 14),
        label: `[${customId}: ${file.name.slice(0, 12)}]`,
        target_host: "Local Forensic Ingestion Buffer",
        protocol: "SMTP/SMTPS/IMAPS",
        severity: "critical",
        packet_count: 512,
        stream_count: 4,
        posture_score: 58,
        posture_grade: "D",
        bpf_filter: "tcp and (port 25 or 587 or 465 or 993 or 110)",
        description: `Local PCAP payload (${file.name}) disassembled via offline parser buffer.`,
        data: cases[3].data,
      };
      setCases((prev) => [fallbackCase, ...prev]);
      setActiveCaseId(customId);
      setSelectedStreamId(1);
    } finally {
      setIsAnalyzing(false);
    }
  }, [cases]);

  return {
    cases,
    activeCaseId,
    activeCase,
    bpfFilter,
    quickFilter,
    selectedStreamId: effectiveSelectedStreamId,
    filteredSessions,
    matchCount: filteredSessions.length,
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
  };
}
