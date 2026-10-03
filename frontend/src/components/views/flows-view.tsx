"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Layers, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  ArrowUpRight,
  X
} from "lucide-react";
import { EvidenceCase, Session } from "@/lib/types";

interface FlowsViewProps {
  activeCase: EvidenceCase;
  onInspectFlowInDissector?: (flowId: number) => void;
}

export function FlowsView({ activeCase, onInspectFlowInDissector }: FlowsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SECURE" | "CRITICAL" | "WARNING">("ALL");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const filteredSessions = useMemo(() => {
    return activeCase.data.sessions.filter((s) => {
      // Status filter
      if (statusFilter === "SECURE" && s.session_score < 80) return false;
      if (statusFilter === "CRITICAL" && !(s.session_score < 50 || s.starttls_stripped)) return false;
      if (statusFilter === "WARNING" && (s.session_score >= 80 || s.session_score < 50 || s.starttls_stripped)) return false;

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const haystack = [
        s.protocol,
        s.server_name,
        s.src_ip,
        s.dst_ip,
        String(s.src_port),
        String(s.dst_port),
        s.tls_version || "",
        s.cipher_suite_name || "",
        s.ja3_client_name || "",
      ].join(" ").toLowerCase();

      return haystack.includes(term);
    });
  }, [activeCase, statusFilter, searchTerm]);

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5 pb-16 select-none">
      {/* Header & Controls Card */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-5 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sms-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-sms-text-primary tracking-tight">
                Reconstructed Stream Inventory
              </h2>
              <p className="text-xs text-sms-text-muted mt-0.5">
                {activeCase.data.total_sessions} TCP flows reassembled from {activeCase.data.total_packets.toLocaleString()} packets
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            {(["ALL", "SECURE", "CRITICAL", "WARNING"] as const).map((filter) => {
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40 shadow-xs"
                      : "bg-sms-surface-secondary text-sms-text-secondary border-sms-border hover:bg-sms-surface-hover"
                  }`}
                >
                  {filter === "ALL" && "All Streams"}
                  {filter === "SECURE" && "🟢 Secure (≥80)"}
                  {filter === "CRITICAL" && "🔴 Critical (<50)"}
                  {filter === "WARNING" && "🟠 Warning (50-79)"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input bar */}
        <div className="pt-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sms-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IP, port, protocol, server name, cipher suite, or JA3..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-sms-surface-secondary/70 border border-sms-border text-xs text-sms-text-primary placeholder:text-sms-text-muted focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono-tech"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sms-text-muted hover:text-sms-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs font-mono-tech text-sms-text-muted shrink-0">
            Showing {filteredSessions.length} of {activeCase.data.total_sessions} flows
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech border-collapse">
            <thead>
              <tr className="bg-sms-surface-secondary/80 border-b border-sms-border text-sms-text-muted uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Stream ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Protocol &amp; Port</th>
                <th className="py-3 px-4">Target Host / Endpoints</th>
                <th className="py-3 px-4">TLS Version</th>
                <th className="py-3 px-4">Cipher Suite</th>
                <th className="py-3 px-4">PFS</th>
                <th className="py-3 px-4">JA3 Match</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sms-border">
              {filteredSessions.map((s, idx) => {
                const isSecure = s.session_score >= 80;
                const isCritical = s.session_score < 50 || s.starttls_stripped;
                const flowTag = `F${String(idx + 1).padStart(2, "0")}`;

                return (
                  <tr
                    key={s.session_id}
                    onClick={() => setSelectedSession(s)}
                    className="hover:bg-sky-50/40 dark:hover:bg-sky-950/20 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4 font-bold text-sms-text-primary">
                      {flowTag}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isSecure
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : isCritical
                            ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}
                      >
                        {isSecure ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isCritical ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{isSecure ? "Secure" : isCritical ? "Critical" : "Warning"}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sms-text-primary">
                      {s.protocol} :{s.dst_port}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sms-text-primary truncate max-w-[180px]">
                          {s.server_name || s.dst_ip}
                        </span>
                        <span className="text-[10px] text-sms-text-muted">
                          {s.src_ip}:{s.src_port} → {s.dst_ip}:{s.dst_port}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          s.is_encrypted ? "text-sms-text-primary" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {s.is_encrypted ? <Lock className="w-3 h-3 text-emerald-500" /> : <Unlock className="w-3 h-3 text-red-500" />}
                        <span>{s.tls_version || "Cleartext"}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-sms-text-secondary truncate max-w-[160px]" title={s.cipher_suite_name || "None"}>
                      {s.cipher_suite_name ? s.cipher_suite_name.replace("TLS_", "").replace("_WITH_", "-") : "NONE"}
                    </td>

                    <td className="py-3.5 px-4">
                      {s.has_forward_secrecy ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> YES
                        </span>
                      ) : (
                        <span className="text-sms-text-muted">NO</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-sms-text-muted truncate max-w-[130px]" title={s.ja3_client_name || s.ja3_hash || "Unknown"}>
                      {s.ja3_client_name || (s.ja3_hash ? s.ja3_hash.slice(0, 10) + "..." : "N/A")}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-baseline gap-1">
                        <span
                          className={`font-black text-sm ${
                            isSecure
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isCritical
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {s.session_score}
                        </span>
                        <span className="text-[10px] text-sms-text-muted">({s.session_grade})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onInspectFlowInDissector) {
                            onInspectFlowInDissector(s.session_id);
                          } else {
                            setSelectedSession(s);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-sms-border hover:border-sky-400 bg-sms-surface-secondary hover:bg-sky-50 text-sms-text-muted hover:text-sky-600 dark:hover:bg-sky-950/40 dark:hover:text-sky-400 transition-colors inline-flex items-center justify-center shadow-2xs"
                        title="Inspect stream"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stream Detail Drawer / Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-2xl border border-sms-border-strong bg-sms-surface-primary shadow-modal p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-sms-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-sms-text-primary">
                    Stream Forensic Inspection: {selectedSession.protocol} :{selectedSession.dst_port}
                  </h3>
                  <span className="text-xs font-mono-tech text-sms-text-muted">
                    Session ID: #{selectedSession.session_id} · {selectedSession.server_name || selectedSession.dst_ip}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sms-text-muted hover:text-sms-text-primary hover:bg-sms-surface-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 font-mono-tech text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-sms-surface-secondary border border-sms-border">
                  <span className="text-[11px] text-sms-text-muted uppercase block">Cryptographic Posture</span>
                  <div className="text-lg font-bold text-sms-text-primary mt-1">
                    {selectedSession.session_score}/100 (Grade {selectedSession.session_grade})
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sms-surface-secondary border border-sms-border">
                  <span className="text-[11px] text-sms-text-muted uppercase block">STARTTLS Status</span>
                  <div className={`text-sm font-bold mt-1 ${selectedSession.starttls_stripped ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {selectedSession.starttls_stripped ? "STRIPPED (MITM Downgrade)" : selectedSession.starttls_detected ? "Negotiated & Enforced" : "Implicit TLS (No STARTTLS)"}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sms-surface-secondary/60 border border-sms-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-sms-text-muted">Cipher Suite:</span>
                  <span className="font-bold text-sms-text-primary">{selectedSession.cipher_suite_name || "None (Cleartext)"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sms-text-muted">TLS Protocol Version:</span>
                  <span className="font-bold text-sms-text-primary">{selectedSession.tls_version || "Cleartext"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sms-text-muted">Key Exchange &amp; PFS:</span>
                  <span className="font-bold text-sms-text-primary">{selectedSession.key_exchange || "None"} ({selectedSession.has_forward_secrecy ? "PFS Active" : "No PFS"})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sms-text-muted">JA3 Fingerprint Hash:</span>
                  <span className="font-bold text-sms-text-primary break-all">{selectedSession.ja3_hash || "N/A"}</span>
                </div>
                {selectedSession.ja3_client_name && (
                  <div className="flex justify-between">
                    <span className="text-sms-text-muted">JA3 Client Identity:</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">{selectedSession.ja3_client_name}</span>
                  </div>
                )}
              </div>

              {/* Scoring Penalty Breakdown */}
              <div className="p-4 rounded-xl bg-sms-surface-secondary/40 border border-sms-border">
                <span className="font-bold uppercase text-[11px] text-sms-text-muted block mb-2">Scoring Deductions</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-sms-surface-primary border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted block">Protocol Penalty</span>
                    <span className="font-bold text-red-500">-{selectedSession.scoring_breakdown.protocol_penalty} pts</span>
                  </div>
                  <div className="p-2 rounded bg-sms-surface-primary border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted block">Cipher Penalty</span>
                    <span className="font-bold text-red-500">-{selectedSession.scoring_breakdown.cipher_penalty} pts</span>
                  </div>
                  <div className="p-2 rounded bg-sms-surface-primary border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted block">PFS Penalty</span>
                    <span className="font-bold text-red-500">-{selectedSession.scoring_breakdown.pfs_penalty} pts</span>
                  </div>
                  <div className="p-2 rounded bg-sms-surface-primary border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted block">Anomaly Penalty</span>
                    <span className="font-bold text-red-500">-{selectedSession.scoring_breakdown.anomaly_penalty} pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-sms-border flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  if (onInspectFlowInDissector) {
                    onInspectFlowInDissector(selectedSession.session_id);
                  }
                  setSelectedSession(null);
                }}
                className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs font-mono-tech flex items-center gap-2 shadow-sm"
              >
                <span>Open in Full Dissector</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
