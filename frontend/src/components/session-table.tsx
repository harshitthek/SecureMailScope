"use client";

import { useState } from "react";
import { Session, Severity } from "@/lib/types";
import { SessionDetail } from "./session-detail";
import { Lock, Unlock, ChevronDown, ChevronUp } from "lucide-react";

interface SessionTableProps {
  sessions: Session[];
}

export function SessionTable({ sessions }: SessionTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getSeverityDot = (sev: Severity) => {
    switch (sev) {
      case "critical":
        return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
      case "high":
        return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      case "secure":
      default:
        return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100">
          Email Communication Streams ({sessions.length})
        </h3>
        <p className="text-xs text-slate-500">
          Reconstructed TCP email flows inspected for cryptographic posture
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Server / Host</th>
              <th className="py-3 px-4">Protocol</th>
              <th className="py-3 px-4">TLS Version</th>
              <th className="py-3 px-4">Cipher Suite</th>
              <th className="py-3 px-4 text-center">PFS</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-center">Severity</th>
              <th className="py-3 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sessions.map((s) => {
              const isExpanded = expandedId === s.session_id;
              return (
                <tr
                  key={s.session_id}
                  className="group cursor-pointer transition-colors hover:bg-slate-800/50"
                  onClick={() => toggleRow(s.session_id)}
                >
                  <td colSpan={9} className="p-0">
                    <div className="flex items-center text-slate-300 py-3.5 px-4">
                      <div className="w-12 text-center font-mono text-slate-500">
                        {s.session_id}
                      </div>
                      <div className="flex-1 min-w-[160px] pr-4">
                        <span className="font-semibold text-slate-100 block truncate">
                          {s.server_name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {s.dst_ip}:{s.dst_port}
                        </span>
                      </div>
                      <div className="w-24 pr-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {s.protocol}
                        </span>
                      </div>
                      <div className="w-28 pr-4">
                        <span
                          className={`font-semibold ${
                            s.tls_version === "TLS 1.3"
                              ? "text-emerald-400"
                              : s.tls_version === "TLS 1.2"
                              ? "text-blue-400"
                              : "text-red-400"
                          }`}
                        >
                          {s.tls_version || "Cleartext"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-[200px] pr-4 font-mono text-[11px] truncate text-slate-400">
                        {s.cipher_suite_name || "None"}
                      </div>
                      <div className="w-16 pr-4 text-center">
                        {s.has_forward_secrecy ? (
                          <Lock className="w-3.5 h-3.5 text-emerald-400 inline" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-orange-400 inline" />
                        )}
                      </div>
                      <div className="w-20 pr-4 text-center font-bold">
                        <span
                          className={
                            s.session_score >= 80
                              ? "text-emerald-400"
                              : s.session_score >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }
                        >
                          {s.session_score}
                        </span>
                      </div>
                      <div className="w-20 pr-4 flex justify-center items-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${getSeverityDot(
                            s.session_severity
                          )}`}
                        />
                      </div>
                      <div className="w-10 text-right text-slate-500 group-hover:text-slate-300">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-slate-950/40">
                        <SessionDetail session={s} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
