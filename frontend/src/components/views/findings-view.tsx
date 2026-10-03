"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  BookOpen
} from "lucide-react";
import { EvidenceCase, Severity } from "@/lib/types";

interface FindingsViewProps {
  activeCase: EvidenceCase;
  onNavigateToFlow?: (flowId: number) => void;
}

export function FindingsView({ activeCase, onNavigateToFlow }: FindingsViewProps) {
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");

  const vulnerabilities = activeCase.data.vulnerabilities;

  const counts = useMemo(() => {
    return {
      critical: vulnerabilities.filter((v) => v.severity === "critical").length,
      high: vulnerabilities.filter((v) => v.severity === "high").length,
      medium: vulnerabilities.filter((v) => v.severity === "medium").length,
      low: vulnerabilities.filter((v) => v.severity === "low").length,
    };
  }, [vulnerabilities]);

  const filtered = useMemo(() => {
    if (filterSeverity === "all") return vulnerabilities;
    return vulnerabilities.filter((v) => v.severity === filterSeverity);
  }, [vulnerabilities, filterSeverity]);

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6 pb-16 select-none">
      {/* Header & Metric Summary Bar */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-sms-border gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-sms-text-primary tracking-tight">
                Vulnerability &amp; Compliance Findings
              </h2>
              <p className="text-xs text-sms-text-muted mt-0.5">
                {vulnerabilities.length} security vectors identified across reconstructed TCP email streams
              </p>
            </div>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterSeverity("all")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterSeverity === "all"
                  ? "bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40"
                  : "bg-sms-surface-secondary text-sms-text-secondary border-sms-border hover:bg-sms-surface-hover"
              }`}
            >
              All ({vulnerabilities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity("critical")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterSeverity === "critical"
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900/50"
              }`}
            >
              Critical ({counts.critical})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity("high")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterSeverity === "high"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
              }`}
            >
              High ({counts.high})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity("medium")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterSeverity === "medium"
                  ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-900/50"
              }`}
            >
              Medium ({counts.medium})
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 font-mono-tech">
          <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
              Critical Exploits
            </span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
              {counts.critical}
            </span>
            <span className="text-[10px] text-sms-text-muted">MITM downgrades / plain auth</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              High Severity
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {counts.high}
            </span>
            <span className="text-[10px] text-sms-text-muted">Legacy TLS / weak ciphers</span>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50">
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              Medium Severity
            </span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
              {counts.medium}
            </span>
            <span className="text-[10px] text-sms-text-muted">CBC mode / non-AEAD suites</span>
          </div>

          <div className="p-3 rounded-xl bg-sms-surface-secondary border border-sms-border">
            <span className="text-[11px] font-bold text-sms-text-muted uppercase tracking-wider block">
              Low Severity
            </span>
            <span className="text-2xl font-black text-sms-text-primary mt-1 block">
              {counts.low}
            </span>
            <span className="text-[10px] text-sms-text-muted">Informational findings</span>
          </div>
        </div>
      </div>

      {/* Vulnerability Items List */}
      <div className="space-y-4">
        {filtered.map((vuln) => {
          const isCrit = vuln.severity === "critical";
          const isHigh = vuln.severity === "high";

          return (
            <div
              key={vuln.id}
              className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-smooth"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sms-border gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-mono-tech font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      isCrit
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800"
                        : isHigh
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-300 dark:border-sky-800"
                    }`}
                  >
                    {isCrit ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{vuln.severity}</span>
                  </span>

                  <h3 className="font-extrabold text-base sm:text-lg text-sms-text-primary">
                    {vuln.title}
                  </h3>
                </div>

                <span className="text-xs font-mono-tech text-sms-text-muted">
                  ID: {vuln.id}
                </span>
              </div>

              <div className="py-4 text-sm text-sms-text-secondary leading-relaxed">
                {vuln.description}
              </div>

              {/* Badges: Affected Streams, CVEs, NIST Reference */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono-tech">
                <div className="flex items-center gap-1.5 text-sms-text-muted">
                  <Layers className="w-3.5 h-3.5 text-sms-text-muted" />
                  <span>Affected Flows:</span>
                </div>
                {vuln.affected_sessions.map((sid) => (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => onNavigateToFlow && onNavigateToFlow(sid)}
                    className="px-2 py-0.5 rounded-md bg-sms-surface-secondary hover:bg-sky-100 text-sky-600 dark:text-sky-400 border border-sms-border hover:border-sky-300 font-bold transition-colors"
                  >
                    Flow #{String(sid).padStart(2, "0")}
                  </button>
                ))}

                {vuln.nist_reference && (
                  <span className="px-2.5 py-0.5 rounded-md bg-sms-surface-secondary text-sms-text-secondary border border-sms-border inline-flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-sky-500" />
                    <span>{vuln.nist_reference}</span>
                  </span>
                )}

                {vuln.cve_references && vuln.cve_references.map((cve) => (
                  <span
                    key={cve}
                    className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 font-bold"
                  >
                    {cve}
                  </span>
                ))}
              </div>

              {/* Remediation Highlight Card */}
              {vuln.remediation && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      Recommended Remediation:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 leading-relaxed font-sans">
                      {vuln.remediation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
