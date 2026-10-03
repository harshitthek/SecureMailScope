"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  initialFlowId?: number | null;
  onInspectFlowInDissector?: (flowId: number) => void;
}

const formatPenalty = (val: number | undefined) => {
  const absVal = Math.abs(val || 0);
  if (absVal === 0) {
    return { text: "0 pts", color: "text-[#9194a1]" };
  }
  return { text: `-${absVal} pts`, color: "text-[#f87171]" };
};

export function FlowsView({ activeCase, initialFlowId, onInspectFlowInDissector }: FlowsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SECURE" | "CRITICAL" | "WARNING">("ALL");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (initialFlowId) {
      const match = activeCase.data.sessions.find((s) => s.session_id === initialFlowId);
      if (match) {
        setSelectedSession(match);
      }
    }
  }, [initialFlowId, activeCase]);

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
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-6 pb-20 select-none">
      {/* Header & Controls Card */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1c1d22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
                Reconstructed Stream Inventory
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em]">
                Active Flow Dissection Ledger
              </h2>
              <p className="text-xs text-[#9194a1] mt-0.5">
                {activeCase.data.total_sessions} TCP flows reassembled from {activeCase.data.total_packets.toLocaleString()} packets
              </p>
            </div>
          </div>

          {/* Quick Filters (Pill controls with tactile dots) */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-sans font-medium">
            {(["ALL", "SECURE", "CRITICAL", "WARNING"] as const).map((filter) => {
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3.5 py-1 rounded-full border transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-black border-white"
                      : "bg-[#121317] text-[#9194a1] border-[#2e3038] hover:text-white hover:border-[#777a88]"
                  }`}
                >
                  {filter === "ALL" && (
                    <>
                      <span>All Streams</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? "bg-black/10 text-black" : "bg-[#040406] text-[#777a88]"}`}>
                        {activeCase.data.total_sessions}
                      </span>
                    </>
                  )}
                  {filter === "SECURE" && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      <span>Secure (≥80)</span>
                    </>
                  )}
                  {filter === "CRITICAL" && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                      <span>Critical (&lt;50)</span>
                    </>
                  )}
                  {filter === "WARNING" && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                      <span>Warning (50-79)</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input bar */}
        <div className="pt-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777a88]" />
            <input
              id="flows-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IP, port, protocol, server name, cipher suite, or JA3... (Press '/' to focus)"
              className="w-full h-9 pl-9 pr-4 rounded-full bg-[#121317] border border-[#2e3038] text-xs text-[#e2e3e9] placeholder:text-[#5e616e] focus:outline-none focus:border-[#cc9166] font-mono"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777a88] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs font-mono text-[#9194a1] shrink-0">
            Showing {filteredSessions.length} of {activeCase.data.total_sessions} flows
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#08080a] border-b border-[#1c1d22] text-[#9194a1] uppercase tracking-wider text-[11px] font-medium">
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
            <tbody className="divide-y divide-[#1c1d22]">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#121317] border border-[#2e3038] flex items-center justify-center text-[#cc9166]">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-sans font-medium text-white">No Matching Email Streams Found</span>
                      <p className="text-xs text-[#9194a1] max-w-sm">
                        No reconstructed TCP flows match your current search query or status filter.
                      </p>
                      {(searchTerm || statusFilter !== "ALL") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("ALL");
                          }}
                          className="mt-2 px-3 py-1 rounded-full bg-[#121317] border border-[#2e3038] hover:border-[#cc9166] text-[#cc9166] text-xs font-mono transition-colors"
                        >
                          Clear Active Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, idx) => {
                  const isSecure = s.session_score >= 80;
                  const isCritical = s.session_score < 50 || s.starttls_stripped;
                  const flowTag = `F${String(idx + 1).padStart(2, "0")}`;

                  return (
                    <tr
                      key={s.session_id}
                      onClick={() => setSelectedSession(s)}
                    className="hover:bg-[#121317] cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {flowTag}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${
                          isSecure
                            ? "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]"
                            : isCritical
                            ? "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]"
                            : "border-[#cc9166]/30 bg-[#cc9166]/10 text-[#cc9166]"
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

                    <td className="py-3.5 px-4 font-medium text-white">
                      {s.protocol} :{s.dst_port}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white truncate max-w-[180px]">
                          {s.server_name || s.dst_ip}
                        </span>
                        <span className="text-[10px] text-[#777a88]">
                          {s.src_ip}:{s.src_port} → {s.dst_ip}:{s.dst_port}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          s.is_encrypted ? "text-white" : "text-[#f87171]"
                        }`}
                      >
                        {s.is_encrypted ? <Lock className="w-3 h-3 text-[#34d399]" /> : <Unlock className="w-3 h-3 text-[#f87171]" />}
                        <span>{s.tls_version || "Cleartext"}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#e2e3e9] truncate max-w-[160px]" title={s.cipher_suite_name || "None"}>
                      {s.cipher_suite_name ? s.cipher_suite_name.replace("TLS_", "").replace("_WITH_", "-") : "NONE"}
                    </td>

                    <td className="py-3.5 px-4">
                      {s.has_forward_secrecy ? (
                        <span className="text-[#34d399] font-medium inline-flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> YES
                        </span>
                      ) : (
                        <span className="text-[#5e616e]">NO</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#9194a1] truncate max-w-[130px]" title={s.ja3_client_name || s.ja3_hash || "Unknown"}>
                      {s.ja3_client_name || (s.ja3_hash ? s.ja3_hash.slice(0, 10) + "..." : "N/A")}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-baseline gap-1">
                        <span
                          className={`font-serif text-sm ${
                            isSecure
                              ? "text-[#34d399]"
                              : isCritical
                              ? "text-[#f87171]"
                              : "text-[#cc9166]"
                          }`}
                        >
                          {s.session_score}
                        </span>
                        <span className="text-[10px] text-[#777a88]">({s.session_grade})</span>
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
                        className="p-1.5 rounded-full border border-[#2e3038] hover:border-[#cc9166] bg-[#121317] hover:bg-[#1c1d22] text-[#9194a1] hover:text-[#cc9166] transition-colors inline-flex items-center justify-center"
                        title="Inspect stream"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stream Detail Drawer / Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-[10px] border border-[#2e3038] bg-[#040406] shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-[#1c1d22]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#cc9166] uppercase font-semibold tracking-wider block">
                    Forensic Stream Dissection
                  </span>
                  <h3 className="font-serif text-lg text-white font-normal mt-0.5">
                    Stream #{selectedSession.session_id} · {selectedSession.protocol} :{selectedSession.dst_port}
                  </h3>
                  <span className="text-[11px] font-mono text-[#9194a1] block mt-0.5">
                    Target: {selectedSession.server_name || selectedSession.dst_ip}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#777a88] hover:text-white hover:bg-[#121317] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
                  <span className="text-[11px] text-[#9194a1] uppercase block font-sans">Cryptographic Posture</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-serif font-normal text-white">
                      {selectedSession.session_score}
                    </span>
                    <span className="text-sm font-serif text-[#9194a1]">/100</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ml-auto border ${
                      selectedSession.session_score >= 80
                        ? "bg-[#064e3b]/20 text-[#10b981] border-[#10b981]/30"
                        : selectedSession.session_score < 50
                        ? "bg-[#7f1d1d]/20 text-[#f87171] border-[#f87171]/30"
                        : "bg-[#78350f]/20 text-[#fbbf24] border-[#fbbf24]/30"
                    }`}>
                      GRADE {selectedSession.session_grade}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
                  <span className="text-[11px] text-[#9194a1] uppercase block font-sans">STARTTLS Status</span>
                  <div className={`text-xs font-semibold mt-2.5 ${selectedSession.starttls_stripped ? "text-[#f87171]" : "text-[#10b981]"}`}>
                    {selectedSession.starttls_stripped ? "STRIPPED (MITM Downgrade)" : selectedSession.starttls_detected ? "Negotiated & Enforced" : "Implicit TLS (No STARTTLS)"}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#121317] border border-[#1c1d22] space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#9194a1]">Cipher Suite:</span>
                  <span className="font-medium text-white">{selectedSession.cipher_suite_name || "None (Cleartext)"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9194a1]">TLS Protocol Version:</span>
                  <span className="font-medium text-white">{selectedSession.tls_version || "Cleartext"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9194a1]">Key Exchange &amp; PFS:</span>
                  <span className="font-medium text-white">{selectedSession.key_exchange || "None"} ({selectedSession.has_forward_secrecy ? "PFS Active" : "No PFS"})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9194a1]">JA3 Fingerprint Hash:</span>
                  <span className="font-medium text-white break-all">{selectedSession.ja3_hash || "N/A"}</span>
                </div>
                {selectedSession.ja3_client_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#9194a1]">JA3 Client Identity:</span>
                    <span className="font-medium text-[#cc9166]">{selectedSession.ja3_client_name}</span>
                  </div>
                )}
              </div>

              {/* Scoring Penalty Breakdown */}
              {(() => {
                const protoP = formatPenalty(selectedSession.scoring_breakdown.protocol_penalty);
                const cipherP = formatPenalty(selectedSession.scoring_breakdown.cipher_penalty);
                const pfsP = formatPenalty(selectedSession.scoring_breakdown.pfs_penalty);
                const certP = formatPenalty(selectedSession.scoring_breakdown.cert_penalty);
                const anomalyP = formatPenalty(selectedSession.scoring_breakdown.anomaly_penalty);

                return (
                  <div className="p-4 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
                    <span className="font-medium uppercase text-[11px] text-[#cc9166] block mb-2 font-mono">
                      Scoring Deductions (NIST SP 800-52r2)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2 rounded bg-[#040406] border border-[#1c1d22]">
                        <span className="text-[10px] text-[#777a88] block">Protocol</span>
                        <span className={`font-serif text-xs ${protoP.color}`}>{protoP.text}</span>
                      </div>
                      <div className="p-2 rounded bg-[#040406] border border-[#1c1d22]">
                        <span className="text-[10px] text-[#777a88] block">Cipher</span>
                        <span className={`font-serif text-xs ${cipherP.color}`}>{cipherP.text}</span>
                      </div>
                      <div className="p-2 rounded bg-[#040406] border border-[#1c1d22]">
                        <span className="text-[10px] text-[#777a88] block">PFS</span>
                        <span className={`font-serif text-xs ${pfsP.color}`}>{pfsP.text}</span>
                      </div>
                      <div className="p-2 rounded bg-[#040406] border border-[#1c1d22]">
                        <span className="text-[10px] text-[#777a88] block">Certificate</span>
                        <span className={`font-serif text-xs ${certP.color}`}>{certP.text}</span>
                      </div>
                      <div className="p-2 rounded bg-[#040406] border border-[#1c1d22]">
                        <span className="text-[10px] text-[#777a88] block">Anomaly</span>
                        <span className={`font-serif text-xs ${anomalyP.color}`}>{anomalyP.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-5 pt-3 border-t border-[#1c1d22] flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  if (onInspectFlowInDissector) {
                    onInspectFlowInDissector(selectedSession.session_id);
                  }
                  setSelectedSession(null);
                }}
                className="h-9 px-4 rounded-full bg-white hover:bg-white/90 text-black font-sans font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Open in Full Dissector</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
