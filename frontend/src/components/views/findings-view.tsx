"use client";

import { useState } from "react";
import { Vulnerability } from "@/lib/types";
import {
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronRight,
  Wrench,
  FileCheck,
  Network,
} from "lucide-react";

interface FindingsViewProps {
  vulnerabilities: Vulnerability[];
  onOpenSessionDetail: (sessionId: number) => void;
  onNavigateToDissector: (streamId: number) => void;
}

export function FindingsView({
  vulnerabilities,
  onOpenSessionDetail,
  onNavigateToDissector,
}: FindingsViewProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [vulnerabilities[0]?.id || ""]: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategory = (v: Vulnerability): string => {
    const text = (v.title + " " + v.description).toLowerCase();
    if (text.includes("starttls") || text.includes("striptls") || text.includes("cleartext auth")) return "STARTTLS";
    if (text.includes("cert") || text.includes("x.509") || text.includes("signature")) return "Certificate";
    if (text.includes("cipher") || text.includes("3des") || text.includes("rc4") || text.includes("aead")) return "Cipher";
    if (text.includes("tls 1.0") || text.includes("tls 1.1") || text.includes("ssl")) return "TLS";
    return "Protocol";
  };

  const filtered = vulnerabilities.filter((v) => {
    if (severityFilter !== "ALL" && v.severity.toUpperCase() !== severityFilter) return false;
    const cat = getCategory(v);
    if (categoryFilter !== "ALL" && cat.toUpperCase() !== categoryFilter) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      (v.nist_reference && v.nist_reference.toLowerCase().includes(q)) ||
      v.remediation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1540px] mx-auto w-full select-none">
      {/* 1. Header & Filter Toolbar */}
      <div className="p-4 border border-tactical-border bg-tactical-surface space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-phosphor-hazard" />
              SECURITY VULNERABILITY FINDINGS &amp; REMEDIATION ({vulnerabilities.length})
            </h2>
            <p className="text-xs text-tactical-dim font-mono mt-0.5">
              Prioritized cryptographic audit checklist with evidence forensics and configuration guidance
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] font-mono">
            <Search className="w-3.5 h-3.5 text-tactical-dim absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, CVEs, NIST..."
              className="w-full bg-tactical-bg border border-tactical-border pl-8 pr-3 py-1.5 text-xs text-phosphor-cyan font-mono focus:outline-none focus:border-phosphor-cyan transition-colors"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-tactical-border/70 text-xs font-mono">
          {/* Severity Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase text-tactical-dim font-bold mr-1">SEVERITY:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
              const isActive = severityFilter === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                    isActive
                      ? sev === "CRITICAL"
                        ? "border-phosphor-hazard bg-phosphor-hazard/20 text-phosphor-hazard"
                        : "border-phosphor-cyan bg-phosphor-cyan/20 text-white"
                      : "border-tactical-border bg-tactical-bg text-tactical-dim hover:text-white"
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase text-tactical-dim font-bold mr-1">CATEGORY:</span>
            {["ALL", "TLS", "CERTIFICATE", "STARTTLS", "CIPHER", "PROTOCOL"].map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                    isActive
                      ? "border-phosphor-green bg-phosphor-green/20 text-phosphor-green"
                      : "border-tactical-border bg-tactical-bg text-tactical-dim hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Findings List */}
      <div className="space-y-3 font-mono">
        {filtered.length > 0 ? (
          filtered.map((v) => {
            const isExpanded = !!expandedIds[v.id];
            const isCrit = v.severity === "critical";
            const isHigh = v.severity === "high";
            const category = getCategory(v);

            return (
              <div
                key={v.id}
                className={`border transition-all ${
                  isCrit
                    ? "border-phosphor-hazard/60 bg-tactical-surface"
                    : isHigh
                    ? "border-phosphor-amber/60 bg-tactical-surface"
                    : "border-tactical-border bg-tactical-surface"
                }`}
              >
                {/* Finding Header (Clickable) */}
                <div
                  onClick={() => toggleExpand(v.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-tactical-surfaceHover transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-tactical-dim hover:text-white">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${
                          isCrit
                            ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                            : isHigh
                            ? "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                            : "border-phosphor-cyan text-phosphor-cyan bg-phosphor-cyan/10"
                        }`}
                      >
                        {v.severity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 border border-tactical-border bg-black/40 text-tactical-dim font-bold">
                        {category}
                      </span>
                      <span className="text-sm font-sans font-bold text-white tracking-tight">
                        {v.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <span className="text-[11px] text-tactical-dim hidden sm:inline">
                      AFFECTS: {v.affected_sessions.map((sid) => `#${sid}`).join(", ")}
                    </span>
                    <span className="text-[10px] text-tactical-muted font-bold">{v.id}</span>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-tactical-border/70 bg-black/40 space-y-4 text-xs">
                    {/* Description */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-tactical-dim font-bold block mb-1">
                        FORENSIC DESCRIPTION &amp; THREAT VECTOR
                      </span>
                      <p className="text-xs font-sans text-tactical-text leading-relaxed bg-tactical-bg p-3 border border-tactical-border">
                        {v.description}
                      </p>
                    </div>

                    {/* Affected Sessions with Direct Jump Actions */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-tactical-dim font-bold block mb-1">
                        AFFECTED EMAIL STREAMS
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {v.affected_sessions.map((sid) => (
                          <div
                            key={sid}
                            className="flex items-center gap-2 p-1.5 border border-tactical-border bg-tactical-surface text-xs"
                          >
                            <Network className="w-3.5 h-3.5 text-phosphor-cyan" />
                            <span className="text-white font-bold">Stream #{sid}</span>
                            <button
                              onClick={() => onOpenSessionDetail(sid)}
                              className="ml-1 text-[10px] text-phosphor-cyan hover:underline font-bold"
                            >
                              [INSPECT]
                            </button>
                            <button
                              onClick={() => onNavigateToDissector(sid)}
                              className="text-[10px] text-phosphor-green hover:underline font-bold"
                            >
                              [DISSECT]
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Standard Reference & Citations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border border-tactical-border bg-tactical-bg">
                        <span className="text-[10px] uppercase tracking-wider text-tactical-dim font-bold block mb-1">
                          STANDARDS COMPLIANCE MAPPING
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-phosphor-cyan font-bold">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{v.nist_reference || "NIST SP 800-52r2 Guidelines"}</span>
                        </div>
                      </div>

                      <div className="p-3 border border-tactical-border bg-tactical-bg">
                        <span className="text-[10px] uppercase tracking-wider text-tactical-dim font-bold block mb-1">
                          CVE REFERENCES
                        </span>
                        <div className="text-xs text-white">
                          {v.cve_references && v.cve_references.length > 0
                            ? v.cve_references.join(", ")
                            : "No public CVE directly associated (Configuration Weakness)"}
                        </div>
                      </div>
                    </div>

                    {/* Actionable Remediation Guidance */}
                    <div className="p-3.5 border border-phosphor-green/40 bg-phosphor-green/5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-phosphor-green text-xs font-bold uppercase tracking-wider">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>ACTIONABLE REMEDIATION GUIDANCE</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed font-sans">
                        {v.remediation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-tactical-dim border border-tactical-border bg-tactical-surface">
            No vulnerabilities match the current filter selection.
          </div>
        )}
      </div>
    </div>
  );
}
