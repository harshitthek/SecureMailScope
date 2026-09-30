"use client";

import { Session } from "@/lib/types";
import { SessionDetail } from "./session-detail";
import { Lock, Unlock, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface SessionRowProps {
  session: Session;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SessionRow({ session: s, isExpanded, onToggle }: SessionRowProps) {
  const getProtocolStyle = (proto: string) => {
    switch (proto.toUpperCase()) {
      case "SMTPS":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "IMAPS":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    }
  };

  const getTlsStyle = (tls: string | null) => {
    if (tls === "TLS 1.3") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (tls === "TLS 1.2") return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (tls === "TLS 1.0") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/40 font-bold";
  };

  const getRiskPill = (sev: string) => {
    switch (sev) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            CRITICAL
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-300 border border-orange-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            SECURE
          </span>
        );
    }
  };

  return (
    <>
      <tr
        onClick={onToggle}
        className="group cursor-pointer border-b border-soc-border hover:bg-soc-cardHover/80 transition-colors text-xs font-mono"
      >
        <td className="py-3 px-3 text-center text-slate-500 font-bold">{s.session_id}</td>
        <td className="py-3 px-3">
          <span className="font-bold text-slate-100 block truncate max-w-[200px]">
            {s.server_name}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
            <span>{s.src_ip}:{s.src_port}</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
            <span>{s.dst_ip}:{s.dst_port}</span>
          </div>
        </td>
        <td className="py-3 px-3">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getProtocolStyle(s.protocol)}`}>
            {s.protocol}
          </span>
        </td>
        <td className="py-3 px-3">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${getTlsStyle(s.tls_version)}`}>
            {s.tls_version || "Cleartext"}
          </span>
        </td>
        <td className="py-3 px-3 max-w-[220px]">
          <span className="truncate block text-slate-300 text-[11px] font-mono">
            {s.cipher_suite_name || "None (Plaintext Fallback)"}
          </span>
          {s.cipher_suite_hex && (
            <span className="text-[10px] text-slate-500 font-mono">{s.cipher_suite_hex}</span>
          )}
        </td>
        <td className="py-3 px-3 text-center">
          {s.has_forward_secrecy ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <Lock className="w-3 h-3" /> PFS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold">
              <Unlock className="w-3 h-3" /> NO PFS
            </span>
          )}
        </td>
        <td className="py-3 px-3 text-center font-bold tabular-nums">
          <span className={s.session_score >= 80 ? "text-emerald-400" : s.session_score >= 50 ? "text-amber-400" : "text-rose-400"}>
            {s.session_score}
          </span>
        </td>
        <td className="py-3 px-3 text-center">{getRiskPill(s.session_severity)}</td>
        <td className="py-3 px-3 text-center text-slate-500 group-hover:text-cyan-400">
          {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-soc-bg/95 border-b border-soc-border">
          <td colSpan={9} className="p-3">
            <SessionDetail session={s} />
          </td>
        </tr>
      )}
    </>
  );
}
