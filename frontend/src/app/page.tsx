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
import { Shield, Upload, Activity, Layers, AlertTriangle } from "lucide-react";

export default function Home() {
  const { state, result, error, startAnalysis, loadDemoData, reset } = useAnalysis();

  if (state === "idle" || state === "uploading" || (state === "analyzing" && !result)) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col justify-center py-12">
        <UploadZone
          onFileSelect={startAnalysis}
          onLoadDemo={loadDemoData}
          isAnalyzing={state === "analyzing" || state === "uploading"}
        />
        {error && (
          <div className="max-w-md mx-auto mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
            {error}
          </div>
        )}
      </main>
    );
  }

  if (!result) return null;

  const critCount = result.vulnerabilities.filter((v) => v.severity === "critical").length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 pb-16">
      {/* Top SOC Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-2">
                SecureMailScope
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  NTRO SIH26159
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm">
                Target: {result.filename} ({result.total_packets} packets • {result.processing_time_ms}ms)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Analyze Another Capture</span>
            </button>
            <ExportButtons analysisId={result.analysis_id || "mock-001"} />
          </div>
        </div>
      </header>

      {/* Main SOC Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Row 1: Executive KPI Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-sm flex items-center justify-around">
            <ScoreGauge score={result.enterprise_score} grade={result.enterprise_grade} />
          </div>

          <StatCard
            label="Total Sessions Inspected"
            value={result.total_sessions}
            subtitle={`${result.total_packets} packets processed in ${result.processing_time_ms}ms`}
            icon={Activity}
          />

          <StatCard
            label="Protocols Discovered"
            value={result.protocols_detected.length}
            subtitle={result.protocols_detected.join(", ")}
            icon={Layers}
          />

          <StatCard
            label="Vulnerability Findings"
            value={result.vulnerabilities.length}
            subtitle={`${critCount} marked CRITICAL risk severity`}
            icon={AlertTriangle}
            badge={<GradeBadge grade={result.enterprise_grade} size="sm" />}
          />
        </div>

        {/* Row 2: Threat Alert Banner */}
        <AlertBanner vulnerabilities={result.vulnerabilities} />

        {/* Row 3: Visual Cryptographic Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProtocolChart data={result.protocol_distribution} />
          <CipherChart data={result.cipher_distribution} />
        </div>

        {/* Row 4: Reconstructed Sessions Table */}
        <SessionTable sessions={result.sessions} />

        {/* Row 5: Deep Forensic Findings & Regulatory Checks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VulnerabilityList vulnerabilities={result.vulnerabilities} />
          <ComplianceChecklist compliance={result.compliance} />
        </div>
      </div>
    </main>
  );
}
