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
    <div className="p-6 lg:p-12 max-w-[1000px] mx-auto w-full select-none font-mono space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-tactical-border/70 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-phosphor-cyan" />
            <h2 className="text-xl font-sans font-bold text-white uppercase tracking-wider">
              FORENSIC CASE REPORT PREVIEW
            </h2>
          </div>
          <p className="text-xs text-tactical-dim mt-1">
            Pre-export verification of cryptographic audit findings and evidentiary records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButtons analysisId={data.analysis_id || "mock-001"} data={data} />
        </div>
      </div>

      {/* 2. Clean Report Preview Document (Clean, Editorial, Report-like) */}
      <div className="p-8 bg-tactical-surface/60 border border-tactical-border/80 space-y-6 text-xs text-tactical-text">
        <div className="border-b border-tactical-border/60 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-tactical-dim block">
              OFFICIAL AUDIT MEMORANDUM // SIH26159
            </span>
            <h3 className="text-lg font-sans font-bold text-white uppercase mt-0.5">
              CASE SUMMARY: {filename || "enterprise_mail_capture.pcap"}
            </h3>
          </div>
          <span className="text-[11px] text-tactical-dim">
            {analyzed_at?.slice(0, 19) || new Date().toISOString().slice(0, 19)}
          </span>
        </div>

        {/* Posture Block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2 border-b border-tactical-border/40">
          <div>
            <span className="text-[10px] text-tactical-dim uppercase block">CRYPTOGRAPHIC POSTURE</span>
            <span className="text-2xl font-sans font-bold text-white">{enterprise_score} / 100</span>
            <span className="text-xs text-phosphor-hazard font-bold ml-2">GRADE {enterprise_grade}</span>
          </div>

          <div>
            <span className="text-[10px] text-tactical-dim uppercase block">VULNERABILITY FINDINGS</span>
            <span className="text-sm font-bold text-phosphor-hazard">{critCount} Critical</span>
            <span className="text-tactical-muted"> · </span>
            <span className="text-sm font-bold text-phosphor-amber">{highCount} High</span>
          </div>

          <div>
            <span className="text-[10px] text-tactical-dim uppercase block">AFFECTED FLOWS</span>
            <span className="text-sm font-bold text-white">
              {affectedFlows.length > 0 ? affectedFlows.join(", ") : "None"}
            </span>
          </div>
        </div>

        {/* Certificates Health */}
        <div className="space-y-2 border-b border-tactical-border/40 pb-4">
          <span className="text-[10px] text-tactical-dim uppercase tracking-wider block font-bold">
            X.509 CERTIFICATE TELEMETRY
          </span>
          <p className="text-xs font-sans leading-relaxed">
            {certStats.dissected} leaf certificates dissected across capture streams. {certStats.expired} certificate is currently expired, failing NIST trust validation.
          </p>
        </div>

        {/* Remediation Priorities */}
        <div className="space-y-3">
          <span className="text-[10px] text-tactical-dim uppercase tracking-wider block font-bold">
            REMEDIATION ACTION PLAN
          </span>
          <div className="space-y-2 font-sans text-xs">
            <div className="p-3 bg-black/40 border border-tactical-border/60">
              <span className="text-white font-bold block mb-1">1. Enforce Mandatory STARTTLS / Reject Plaintext Fallback</span>
              <p className="text-tactical-dim text-[11px] leading-relaxed">
                Configure mail transfer agents (MTAs) to reject unencrypted AUTH requests on submission port 587. Transition legacy clients to implicit TLS (Port 465).
              </p>
            </div>
            <div className="p-3 bg-black/40 border border-tactical-border/60">
              <span className="text-white font-bold block mb-1">2. Deprecate TLS 1.0/1.1 and 3DES Cipher Suites</span>
              <p className="text-tactical-dim text-[11px] leading-relaxed">
                Disable CBC ciphers and legacy protocol versions per RFC 8996. Require TLS 1.2+ with AEAD suites (AES-GCM / ChaCha20-Poly1305).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
