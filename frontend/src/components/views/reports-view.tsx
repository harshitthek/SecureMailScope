"use client";

import { useMemo } from "react";
import { AnalysisResult } from "@/lib/types";
import { ExportButtons } from "@/components/export-button";
import { FileText } from "lucide-react";

interface ReportsViewProps {
  data: AnalysisResult;
}

export function ReportsView({ data }: ReportsViewProps) {
  const {
    enterprise_score,
    enterprise_grade,
    filename,
    analyzed_at,
    vulnerabilities,
    sessions,
  } = data;

  const critCount = useMemo(
    () => vulnerabilities.filter((v) => v.severity === "critical").length,
    [vulnerabilities]
  );
  const highCount = useMemo(
    () => vulnerabilities.filter((v) => v.severity === "high").length,
    [vulnerabilities]
  );

  const certStats = useMemo(() => {
    let dissected = 0;
    let expired = 0;
    for (const s of sessions) {
      if (s.certificate) {
        dissected++;
        if (s.certificate.is_expired) expired++;
      }
    }
    return { dissected, expired };
  }, [sessions]);

  const affectedFlows = useMemo(() => {
    const list: string[] = [];
    sessions.forEach((s, idx) => {
      if (s.session_score < 70) {
        list.push(`F0${idx + 1}`);
      }
    });
    return list;
  }, [sessions]);

  return (
    <div className="px-6 py-5 lg:px-8 lg:py-6 max-w-[1000px] mx-auto w-full select-none font-mono space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-tactical-border/70 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-phosphor-cyan" />
            <h2 className="text-[20px] sm:text-[22px] font-sans font-bold text-tactical-text uppercase tracking-wider">
              FORENSIC CASE REPORT PREVIEW
            </h2>
          </div>
          <p className="text-[13px] text-tactical-dim mt-0.5">
            Pre-export verification of cryptographic audit findings and evidentiary records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButtons analysisId={data.analysis_id || "mock-001"} data={data} />
        </div>
      </div>

      {/* 2. Clean Report Preview Document (Clean, Editorial, Report-like) */}
      <div className="p-6 sm:p-7 bg-tactical-surface/60 border border-tactical-border/80 space-y-5 text-[14px] text-tactical-text">
        <div className="border-b border-tactical-border/60 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[12px] uppercase tracking-widest text-tactical-dim block font-bold">
              OFFICIAL AUDIT MEMORANDUM // SIH26159
            </span>
            <h3 className="text-[20px] font-sans font-bold text-tactical-text uppercase mt-0.5">
              CASE SUMMARY: {filename || "enterprise_mail_capture.pcap"}
            </h3>
          </div>
          <span className="text-[13px] text-tactical-dim">
            {analyzed_at?.slice(0, 19) || new Date().toISOString().slice(0, 19)}
          </span>
        </div>

        {/* Posture Block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-3 border-b border-tactical-border/40">
          <div>
            <span className="text-[12px] text-tactical-dim uppercase block font-bold">CRYPTOGRAPHIC POSTURE</span>
            <span className="text-[28px] font-sans font-bold text-tactical-text">{enterprise_score} / 100</span>
            <span className="text-[14px] text-phosphor-hazard font-bold ml-2">GRADE {enterprise_grade}</span>
          </div>

          <div>
            <span className="text-[12px] text-tactical-dim uppercase block font-bold">VULNERABILITY FINDINGS</span>
            <span className="text-[16px] font-bold text-phosphor-hazard">{critCount} Critical</span>
            <span className="text-tactical-muted"> · </span>
            <span className="text-[16px] font-bold text-phosphor-amber">{highCount} High</span>
          </div>

          <div>
            <span className="text-[12px] text-tactical-dim uppercase block font-bold">AFFECTED FLOWS</span>
            <span className="text-[16px] font-bold text-tactical-text">
              {affectedFlows.length > 0 ? affectedFlows.join(", ") : "None"}
            </span>
          </div>
        </div>

        {/* Certificates Health */}
        <div className="space-y-2 border-b border-tactical-border/40 pb-4">
          <span className="text-[12px] text-tactical-dim uppercase tracking-wider block font-bold">
            X.509 CERTIFICATE TELEMETRY
          </span>
          <p className="text-[14px] font-sans leading-relaxed">
            {certStats.dissected} leaf certificates dissected across capture streams. {certStats.expired} certificate is currently expired, failing NIST trust validation.
          </p>
        </div>

        {/* Remediation Priorities */}
        <div className="space-y-3">
          <span className="text-[12px] text-tactical-dim uppercase tracking-wider block font-bold">
            REMEDIATION ACTION PLAN
          </span>
          <div className="space-y-2.5 font-sans text-[14px]">
            <div className="p-3.5 bg-tactical-elevated/40 border border-tactical-border/60">
              <span className="text-tactical-text font-bold block mb-1">1. Enforce Mandatory STARTTLS / Reject Plaintext Fallback</span>
              <p className="text-tactical-dim text-[13px] leading-relaxed">
                Configure mail transfer agents (MTAs) to reject unencrypted AUTH requests on submission port 587. Transition legacy clients to implicit TLS (Port 465).
              </p>
            </div>
            <div className="p-3.5 bg-tactical-elevated/40 border border-tactical-border/60">
              <span className="text-tactical-text font-bold block mb-1">2. Deprecate TLS 1.0/1.1 and 3DES Cipher Suites</span>
              <p className="text-tactical-dim text-[13px] leading-relaxed">
                Disable CBC ciphers and legacy protocol versions per RFC 8996. Require TLS 1.2+ with AEAD suites (AES-GCM / ChaCha20-Poly1305).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
