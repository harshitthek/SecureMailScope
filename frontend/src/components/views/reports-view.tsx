"use client";

import { AnalysisResult } from "@/lib/types";
import { ExportButtons } from "@/components/export-button";
import { FileText } from "lucide-react";

interface ReportsViewProps {
  data: AnalysisResult;
}

export function ReportsView({ data }: ReportsViewProps) {
  const isCritical = data.enterprise_score < 50 || data.enterprise_grade === "F";

  return (
    <div className="p-4 lg:p-6 space-y-6 font-mono max-w-[1400px] mx-auto w-full">
      {/* Header and Quick Download Hero */}
      <div className="p-6 border border-tactical-border bg-tactical-surface space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-phosphor-cyan uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>FORENSIC AUDIT EXPORT &amp; REPORTING CENTER</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cryptographic Posture Assessment Report
            </h2>
            <p className="text-xs text-tactical-dim mt-1">
              Generate standardized PDF audit certificates and structured JSON forensic archives for evidentiary records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ExportButtons analysisId={data.analysis_id || "mock-001"} data={data} />
          </div>
        </div>

        {/* Forensic Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-tactical-border/70 text-xs">
          <div className="p-3 border border-tactical-border bg-black/40">
            <span className="text-[10px] uppercase text-tactical-dim block">Analysis ID</span>
            <span className="text-xs font-bold text-white break-all">{data.analysis_id}</span>
          </div>

          <div className="p-3 border border-tactical-border bg-black/40">
            <span className="text-[10px] uppercase text-tactical-dim block">Capture File</span>
            <span className="text-xs font-bold text-white truncate block">{data.filename}</span>
          </div>

          <div className="p-3 border border-tactical-border bg-black/40">
            <span className="text-[10px] uppercase text-tactical-dim block">Analyzed Timestamp</span>
            <span className="text-xs font-bold text-tactical-text">{data.analyzed_at?.slice(0, 19)}</span>
          </div>

          <div className="p-3 border border-tactical-border bg-black/40">
            <span className="text-[10px] uppercase text-tactical-dim block">Dissect Latency</span>
            <span className="text-xs font-bold text-phosphor-cyan tabular-nums">{data.processing_time_ms} ms</span>
          </div>
        </div>
      </div>

      {/* Audit Report Preview Document */}
      <div className="border border-tactical-border bg-tactical-surface p-6 space-y-6 shadow-2xl">
        <div className="border-b border-tactical-border pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              EXECUTIVE COMPLIANCE MEMORANDUM // SIH26159
            </h3>
            <span className="text-[11px] text-tactical-dim">
              AUTOMATED STATUTORY CRYPTOGRAPHIC POSTURE REVIEW
            </span>
          </div>
          <div
            className={`px-3 py-1 border font-bold text-xs ${
              isCritical
                ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                : "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
            }`}
          >
            VERDICT: GRADE {data.enterprise_grade} ({data.enterprise_score}/100)
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="space-y-3 text-xs leading-relaxed text-tactical-text">
          <p>
            This cryptographic assessment report documents passive forensic deep packet inspection conducted across
            the network capture <strong>{data.filename}</strong>. An aggregate cryptographic posture score of{" "}
            <strong>{data.enterprise_score} / 100 ({data.enterprise_grade})</strong> was calculated using the statutory
            penalty deduction formula referencing NIST SP 800-52r2, RFC 8314, and RFC 8996.
          </p>

          <p>
            A total of <strong>{data.total_sessions} email protocol streams</strong> ({data.total_packets} wire packets)
            were reconstructed, spanning ports 25, 587, 465, 143, 993, 110, and 995. The analysis detected{" "}
            <strong className={isCritical ? "text-phosphor-hazard" : "text-phosphor-green"}>
              {data.vulnerabilities.length} security vulnerabilities
            </strong>{" "}
            requiring triage and remediation.
          </p>
        </div>

        {/* Executive Highlights Table */}
        <div className="border border-tactical-border bg-black/40 p-4 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            CRYPTOGRAPHIC COMPLIANCE SUMMARY
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 border border-tactical-border bg-tactical-surface">
              <span className="text-[10px] text-tactical-dim uppercase block">TLS 1.2+ Adoption</span>
              <span className="text-sm font-bold text-white">
                {data.sessions.filter(s => s.tls_version === "TLS 1.3" || s.tls_version === "TLS 1.2").length} / {data.total_sessions} Streams
              </span>
            </div>
            <div className="p-2.5 border border-tactical-border bg-tactical-surface">
              <span className="text-[10px] text-tactical-dim uppercase block">PFS Forward Secrecy</span>
              <span className="text-sm font-bold text-white">
                {data.sessions.filter(s => s.has_forward_secrecy).length} / {data.total_sessions} Streams
              </span>
            </div>
            <div className="p-2.5 border border-tactical-border bg-tactical-surface">
              <span className="text-[10px] text-tactical-dim uppercase block">Critical Downgrades</span>
              <span className={`text-sm font-bold ${data.sessions.some(s => s.starttls_stripped) ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                {data.sessions.filter(s => s.starttls_stripped).length} Detected
              </span>
            </div>
          </div>
        </div>

        {/* Sign-off Footnote */}
        <div className="pt-4 border-t border-tactical-border/70 flex flex-wrap items-center justify-between gap-3 text-[10px] text-tactical-dim">
          <span>SECUREMAILSCOPE // PASSIVE FORENSIC PROTOCOL DISSECTOR</span>
          <span>REPORT LAB PDF ENGINE READY • GENERATED LOCALLY</span>
        </div>
      </div>
    </div>
  );
}
