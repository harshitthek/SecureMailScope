"use client";

import { useState, useMemo } from "react";
import { Session } from "@/lib/types";
import { SessionFilters } from "./session-filters";
import { SessionRow } from "./session-row";
import { Network } from "lucide-react";

interface SessionTableProps {
  sessions: Session[];
}

export function SessionTable({ sessions }: SessionTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [sortByScore, setSortByScore] = useState(false);

  const protocols = useMemo(() => {
    return Array.from(new Set(sessions.map((s) => s.protocol)));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let result = sessions.filter((s) => {
      const matchProto = selectedProtocol === "ALL" || s.protocol === selectedProtocol;
      const matchSev =
        selectedSeverity === "ALL" ||
        s.session_severity.toUpperCase() === selectedSeverity.toUpperCase();
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        s.server_name.toLowerCase().includes(term) ||
        s.dst_ip.includes(term) ||
        s.src_ip.includes(term) ||
        (s.cipher_suite_name && s.cipher_suite_name.toLowerCase().includes(term));
      return matchProto && matchSev && matchSearch;
    });

    if (sortByScore) {
      result = [...result].sort((a, b) => a.session_score - b.session_score);
    }

    return result;
  }, [sessions, selectedProtocol, selectedSeverity, searchTerm, sortByScore]);

  return (
    <div className="w-full rounded-xl border border-soc-border bg-soc-card shadow-tactical-sm overflow-hidden">
      {/* Table Title Bar */}
      <div className="p-4 border-b border-soc-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Reconstructed Email Streams ({sessions.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Click stream for deep cryptographic handshake dossier
        </span>
      </div>

      {/* Filter and Search Bar */}
      <SessionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedProtocol={selectedProtocol}
        onProtocolChange={setSelectedProtocol}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        sortByScore={sortByScore}
        onToggleSort={() => setSortByScore(!sortByScore)}
        protocols={protocols}
      />

      {/* Semantic Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-soc-border bg-soc-bg text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[200px]">Server & Flow Vector</th>
              <th className="py-2.5 px-3 w-20">Protocol</th>
              <th className="py-2.5 px-3 w-28">TLS Version</th>
              <th className="py-2.5 px-3">Negotiated Cipher Suite</th>
              <th className="py-2.5 px-3 w-24 text-center">Forward Sec</th>
              <th className="py-2.5 px-3 w-16 text-center">Score</th>
              <th className="py-2.5 px-3 w-24 text-center">Risk State</th>
              <th className="py-2.5 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs font-mono text-slate-500">
                  No matching communication streams found for current filter criteria.
                </td>
              </tr>
            ) : (
              filteredSessions.map((s) => (
                <SessionRow
                  key={s.session_id}
                  session={s}
                  isExpanded={expandedId === s.session_id}
                  onToggle={() => setExpandedId(expandedId === s.session_id ? null : s.session_id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
