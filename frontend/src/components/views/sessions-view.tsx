"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import {
  Network,
  Search,
  Binary,
  Layers,
} from "lucide-react";

interface SessionsViewProps {
  sessions: Session[];
  onOpenSessionDetail: (sessionId: number) => void;
  onNavigateToDissector: (streamId: number) => void;
}

export function SessionsView({
  sessions,
  onOpenSessionDetail,
  onNavigateToDissector,
}: SessionsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const filtered = sessions.filter((s) => {
    if (protocolFilter !== "ALL" && s.protocol !== protocolFilter) return false;
    if (riskFilter === "CRITICAL" && s.session_score >= 50) return false;
    if (riskFilter === "SECURE" && s.session_score < 80) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const haystack = [
      s.session_id.toString(),
      s.server_name,
      s.src_ip,
      s.dst_ip,
      s.src_port.toString(),
      s.dst_port.toString(),
      s.protocol,
      s.tls_version || "",
      s.cipher_suite_name || "",
    ].join(" ").toLowerCase();

    return haystack.includes(term);
  });

  const protocols = Array.from(new Set(sessions.map((s) => s.protocol)));

  return (
    <div className="p-4 lg:p-6 space-y-4 font-mono max-w-[1700px] mx-auto w-full">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border border-tactical-border bg-tactical-surface">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-phosphor-cyan" />
            RECONSTRUCTED EMAIL STREAM MATRIX ({sessions.length} TOTAL STREAMS)
          </h2>
          <p className="text-xs text-tactical-dim mt-0.5">
            Full-width forensic wire flows with protocol parameters and cryptographic risk scores
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-tactical-dim absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IP, port, cipher..."
              className="w-full bg-tactical-bg border border-tactical-border pl-8 pr-3 py-1.5 text-xs text-phosphor-cyan font-mono focus-visible:outline-none focus-visible:border-phosphor-cyan"
            />
          </div>

          {/* Protocol Filter */}
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="bg-tactical-bg border border-tactical-border px-2.5 py-1.5 text-xs text-tactical-text font-mono focus-visible:outline-none"
          >
            <option value="ALL">ALL PROTOCOLS</option>
            {protocols.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-tactical-bg border border-tactical-border px-2.5 py-1.5 text-xs text-tactical-text font-mono focus-visible:outline-none"
          >
            <option value="ALL">ALL RISK LEVELS</option>
            <option value="CRITICAL">CRITICAL / GRADE F</option>
            <option value="SECURE">HARDENED / GRADE A+</option>
          </select>
        </div>
      </div>

      {/* Main Full-Width Sessions Table */}
      <div className="border border-tactical-border bg-tactical-surface overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-tactical-border text-[10px] text-tactical-dim uppercase bg-black/50">
              <th className="py-3 px-3 w-12 text-center">SESSION</th>
              <th className="py-3 px-4 min-w-[260px]">SOURCE &rarr; DESTINATION</th>
              <th className="py-3 px-3">PROTOCOL</th>
              <th className="py-3 px-3">TLS VERSION</th>
              <th className="py-3 px-4 min-w-[240px]">CIPHER SUITE</th>
              <th className="py-3 px-3">KEY EXCHANGE / PFS</th>
              <th className="py-3 px-3 min-w-[180px]">SNI / HOST</th>
              <th className="py-3 px-3 text-right">SCORE</th>
              <th className="py-3 px-3 text-center">RISK</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tactical-border/60">
            {filtered.length > 0 ? (
              filtered.map((s) => {
                const isCrit = s.session_score < 50 || s.session_severity === "critical";
                const isSecure = s.session_score >= 80 && s.session_severity === "secure";
                return (
                  <tr
                    key={s.session_id}
                    onClick={() => onOpenSessionDetail(s.session_id)}
                    className="hover:bg-tactical-surfaceHover transition-colors cursor-pointer group"
                  >
                    {/* Session ID */}
                    <td className="py-3 px-3 text-center font-bold text-tactical-dim">
                      #{s.session_id}
                    </td>

                    {/* Source -> Destination */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs tracking-tight">
                        {s.src_ip}:{s.src_port} &rarr; {s.dst_ip}:{s.dst_port}
                      </div>
                      <div className="text-[10px] text-tactical-dim mt-0.5">
                        {s.timestamp?.slice(11, 19) || "CAPTURE TIME"}
                      </div>
                    </td>

                    {/* Protocol */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 border border-tactical-border bg-tactical-elevated font-bold text-[10px] text-phosphor-cyan">
                        {s.protocol}
                      </span>
                    </td>

                    {/* TLS Version */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 border text-[10px] font-bold ${
                          s.tls_version === "TLS 1.3"
                            ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                            : s.tls_version === "TLS 1.2"
                            ? "border-phosphor-cyan text-phosphor-cyan bg-phosphor-cyan/10"
                            : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                        }`}
                      >
                        {s.tls_version || "PLAINTEXT"}
                      </span>
                    </td>

                    {/* Cipher Suite */}
                    <td className="py-3 px-4">
                      <div className="text-xs text-white font-bold truncate max-w-[280px]">
                        {s.cipher_suite_name || "None (Plaintext Fallback)"}
                      </div>
                      <div className="text-[10px] text-tactical-dim">
                        HEX: {s.cipher_suite_hex || "0x0000"}
                      </div>
                    </td>

                    {/* Key Exchange / PFS */}
                    <td className="py-3 px-3">
                      {s.has_forward_secrecy ? (
                        <div className="text-phosphor-green font-bold text-xs">
                          {s.key_exchange || "ECDHE"}
                          <span className="text-[9px] block text-phosphor-green/70">PFS ENFORCED</span>
                        </div>
                      ) : (
                        <div className="text-phosphor-hazard font-bold text-xs">
                          {s.key_exchange || "RSA"}
                          <span className="text-[9px] block text-phosphor-hazard/70">NO FORWARD SECRECY</span>
                        </div>
                      )}
                    </td>

                    {/* SNI / Host */}
                    <td className="py-3 px-3 text-xs text-tactical-text font-bold truncate max-w-[200px]">
                      {s.server_name || "N/A"}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      <span
                        className={`px-2 py-0.5 border text-xs ${
                          isCrit
                            ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/15"
                            : isSecure
                            ? "border-phosphor-green text-phosphor-green bg-phosphor-green/15"
                            : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/15"
                        }`}
                      >
                        {s.session_score}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 border ${
                          isCrit
                            ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                            : isSecure
                            ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                            : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                        }`}
                      >
                        {s.session_severity}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSessionDetail(s.session_id);
                          }}
                          className="px-2 py-1 border border-tactical-border bg-tactical-elevated hover:border-phosphor-cyan text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3 text-phosphor-cyan" />
                          <span>DETAIL</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToDissector(s.session_id);
                          }}
                          className="px-2 py-1 border border-tactical-border bg-tactical-elevated hover:border-phosphor-green text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                        >
                          <Binary className="w-3 h-3 text-phosphor-green" />
                          <span>DISSECT</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-8 text-center text-xs text-tactical-dim">
                  No email streams match the current search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
