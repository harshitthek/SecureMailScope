"use client";

import { useAnalysis } from "@/hooks/use-analysis";
import { UploadZone } from "@/components/upload-zone";
import { ScoreGauge } from "@/components/score-gauge";
import { GradeBadge } from "@/components/grade-badge";
import { StatCard } from "@/components/stat-card";
import { AlertBanner } from "@/components/alert-banner";
import { ProtocolChart } from "@/components/protocol-chart";
import { CipherChart } from "@/components/cipher-chart";
import { SessionTable } from "@/components/session-table";
import { VulnerabilityList } from "@/components/vulnerability-list";
import { ComplianceChecklist } from "@/components/compliance-checklist";
import { ExportButtons } from "@/components/export-button";
import { Shield, Upload, Activity, Network, AlertTriangle } from "lucide-react";

export default function Home() {
  const { state, result, error, startAnalysis, loadDemoData, reset } = useAnalysis();

  if (state === "idle" || state === "uploading" || (state === "analyzing" && !result)) {
    return (
      <main className="min-h-screen bg-soc-bg bg-soc-grid bg-soc-radial flex flex-col justify-center py-6">
        <UploadZone
          onFileSelect={startAnalysis}
          onLoadDemo={loadDemoData}
          isAnalyzing={state === "analyzing" || state === "uploading"}
        />
        {error && (
          <div className="max-w-md mx-auto mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs text-center shadow-tactical-sm">
            {error}
          </div>
        )}
      </main>
    );
  }

  if (!result) return null;

  const critCount = result.vulnerabilities.filter((v) => v.severity === "critical").length;

  return (
    <main className="min-h-screen bg-soc-bg bg-soc-grid text-slate-100 pb-16 font-sans">
      {/* Classification Banner */}
      <div className="w-full bg-soc-bg border-b border-soc-border py-1 px-4 text-center">
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          NTRO CYBER INTELLIGENCE DEFENSE WORKSTATION // CLASSIFICATION: OFFICIAL USE ONLY // SIH26159
        </span>
      </div>

      {/* Top SOC Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-soc-border bg-soc-bg/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-tactical-glow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight font-sans text-slate-100">
                  SecureMailScope
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SENSOR ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm sm:max-w-md">
                EVIDENCE: {result.filename} ({result.total_packets} packets • {result.processing_time_ms}ms)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-soc-border bg-soc-card hover:bg-soc-cardHover hover:border-soc-borderHighlight text-slate-200 text-xs font-mono transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEW CAPTURE</span>
            </button>
            <ExportButtons analysisId={result.analysis_id || "mock-001"} />
          </div>
        </div>
      </header>

      {/* Main SOC Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-5">
        {/* Row 1: Executive KPI Stat Cards */}
        <section aria-label="Executive Overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreGauge score={result.enterprise_score} grade={result.enterprise_grade} />

          <StatCard
            label="Inspected Sessions"
            value={result.total_sessions}
            subtitle={`${result.total_packets} packets reconstructed in ${result.processing_time_ms}ms`}
            icon={Activity}
            indicatorColor="#0ea5e9"
            tag="STREAMS"
          />

          <StatCard
            label="Discovered Protocols"
            value={result.protocols_detected.length}
            subtitle={result.protocols_detected.join(" • ")}
            icon={Network}
            indicatorColor="#10b981"
            tag="TRAFFIC"
          />

          <StatCard
            label="Security Findings"
            value={result.vulnerabilities.length}
            subtitle={`${critCount} marked CRITICAL risk severity`}
            icon={AlertTriangle}
            badge={<GradeBadge grade={result.enterprise_grade} size="sm" />}
            indicatorColor="#f43f5e"
            tag="RISK"
          />
        </section>

        {/* Row 2: Threat Alert Banner */}
        <section aria-label="Threat Alert">
          <AlertBanner vulnerabilities={result.vulnerabilities} />
        </section>

        {/* Row 3: Visual Cryptographic Distribution Charts */}
        <section aria-label="Cryptographic Telemetry" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ProtocolChart data={result.protocol_distribution} />
          <CipherChart data={result.cipher_distribution} />
        </section>

        {/* Row 4: Reconstructed Sessions Table */}
        <section aria-label="Inspected Streams">
          <SessionTable sessions={result.sessions} />
        </section>

        {/* Row 5: Deep Forensic Findings & Regulatory Checks */}
        <section aria-label="Compliance and Findings" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <VulnerabilityList vulnerabilities={result.vulnerabilities} />
          <ComplianceChecklist compliance={result.compliance} />
        </section>
      </div>
    </main>
  );
}
