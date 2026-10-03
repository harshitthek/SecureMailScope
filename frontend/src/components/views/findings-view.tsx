"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  BookOpen,
  ShieldCheck
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
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-6 pb-20 select-none font-sans">
      {/* Header & Metric Summary Bar */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1c1d22] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#f87171] flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
                Forensic Analysis Ledger
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em]">
                Vulnerability &amp; Compliance Findings
              </h2>
              <p className="text-xs text-[#9194a1] mt-0.5">
                {vulnerabilities.length} security vectors identified across reconstructed TCP email streams
              </p>
            </div>
          </div>

          {/* Severity Filter Tabs (Pill controls) */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterSeverity("all")}
              className={`px-3.5 py-1 rounded-full border transition-all ${
                filterSeverity === "all"
                  ? "bg-white text-black border-white"
                  : "bg-[#121317] text-[#9194a1] border-[#2e3038] hover:text-white"
              }`}
            >
              All ({vulnerabilities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity("critical")}
              className={`px-3.5 py-1 rounded-full border transition-all ${
                filterSeverity === "critical"
                  ? "bg-white text-black border-white"
                  : "bg-[#121317] text-[#f87171] border-[#f87171]/40"
              }`}
            >
              Critical ({counts.critical})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity("high")}
              className={`px-3.5 py-1 rounded-full border transition-all ${
                filterSeverity === "high"
                  ? "bg-white text-black border-white"
                  : "bg-[#121317] text-[#cc9166] border-[#cc9166]/40"
              }`}
            >
              High ({counts.high})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity("medium")}
              className={`px-3.5 py-1 rounded-full border transition-all ${
                filterSeverity === "medium"
                  ? "bg-white text-black border-white"
                  : "bg-[#121317] text-[#9194a1] border-[#2e3038]"
              }`}
            >
              Medium ({counts.medium})
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono">
          <div className="p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
            <span className="text-[11px] font-medium text-[#f87171] uppercase tracking-wider block">
              Critical Exploits
            </span>
            <span className="text-3xl font-serif text-[#f87171] mt-1 block">
              {counts.critical}
            </span>
            <span className="text-[10px] text-[#777a88]">MITM downgrades / plain auth</span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
            <span className="text-[11px] font-medium text-[#cc9166] uppercase tracking-wider block">
              High Severity
            </span>
            <span className="text-3xl font-serif text-[#cc9166] mt-1 block">
              {counts.high}
            </span>
            <span className="text-[10px] text-[#777a88]">Legacy TLS / weak ciphers</span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
            <span className="text-[11px] font-medium text-[#9194a1] uppercase tracking-wider block">
              Medium Severity
            </span>
            <span className="text-3xl font-serif text-white mt-1 block">
              {counts.medium}
            </span>
            <span className="text-[10px] text-[#777a88]">CBC mode / non-AEAD suites</span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
            <span className="text-[11px] font-medium text-[#777a88] uppercase tracking-wider block">
              Low Severity
            </span>
            <span className="text-3xl font-serif text-white mt-1 block">
              {counts.low}
            </span>
            <span className="text-[10px] text-[#777a88]">Informational findings</span>
          </div>
        </div>
      </div>

      {/* Vulnerability Items List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#064e3b]/20 border border-[#10b981]/40 text-[#10b981] flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-normal text-white text-lg">
              {vulnerabilities.length === 0 ? "No Cryptographic Vulnerabilities Detected" : "No Findings Matching Active Filter"}
            </h3>
            <p className="text-xs text-[#9194a1] mt-1 max-w-md mx-auto leading-relaxed">
              {vulnerabilities.length === 0
                ? "All inspected email transport streams satisfy strict NIST SP 800-52r2 and RFC 8314 cryptographic requirements. Transport security posture verified."
                : "Select another severity filter or view all findings to inspect logged security events."}
            </p>
          </div>
        ) : (
          filtered.map((vuln) => {
            const isCrit = vuln.severity === "critical";
          const isHigh = vuln.severity === "high";

          return (
            <div
              key={vuln.id}
              className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-5 transition-smooth"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c1d22] gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-mono font-medium uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                      isCrit
                        ? "border-[#f87171]/40 bg-[#f87171]/10 text-[#f87171]"
                        : isHigh
                        ? "border-[#cc9166]/40 bg-[#cc9166]/10 text-[#cc9166]"
                        : "border-[#2e3038] bg-[#121317] text-[#9194a1]"
                    }`}
                  >
                    {isCrit ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{vuln.severity}</span>
                  </span>

                  <h3 className="font-serif text-base sm:text-lg text-white font-normal">
                    {vuln.title}
                  </h3>
                </div>

                <span className="text-xs font-mono text-[#777a88]">
                  ID: {vuln.id}
                </span>
              </div>

              <div className="py-3 text-sm text-[#e2e3e9] leading-relaxed">
                {vuln.description}
              </div>

              {/* Badges: Affected Streams, CVEs, NIST Reference */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#9194a1]">
                  <Layers className="w-3.5 h-3.5 text-[#777a88]" />
                  <span>Affected Flows:</span>
                </div>
                {vuln.affected_sessions.map((sid) => (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => onNavigateToFlow && onNavigateToFlow(sid)}
                    className="px-2.5 py-0.5 rounded-full bg-[#121317] hover:bg-[#1c1d22] text-[#cc9166] border border-[#2e3038] font-medium transition-colors"
                  >
                    Flow #{String(sid).padStart(2, "0")}
                  </button>
                ))}

                {vuln.nist_reference && (
                  <span className="px-3 py-0.5 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#1c1d22] inline-flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#cc9166]" />
                    <span>{vuln.nist_reference}</span>
                  </span>
                )}

                {vuln.cve_references && vuln.cve_references.map((cve) => (
                  <span
                    key={cve}
                    className="px-3 py-0.5 rounded-full bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30 font-medium"
                  >
                    {cve}
                  </span>
                ))}
              </div>

              {/* Remediation Highlight Card */}
              {vuln.remediation && (
                <div className="mt-3.5 p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22] flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#cc9166] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block mb-0.5">
                      Recommended Remediation:
                    </span>
                    <span className="text-[#acafb9] leading-relaxed">
                      {vuln.remediation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
    </main>
  );
}
