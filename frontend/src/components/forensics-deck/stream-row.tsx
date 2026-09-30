"use client";

import { Session } from "@/lib/types";
import { ArrowRight, Lock, Unlock, Eye } from "lucide-react";

interface StreamRowProps {
  session: Session;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function StreamRow({ session: s, isSelected, onSelect }: StreamRowProps) {
  const isCritical = s.session_severity === "critical";

  return (
    <tr
      onClick={() => onSelect(s.session_id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(s.session_id)}
      tabIndex={0}
      aria-selected={isSelected}
      className={`border-b border-tactical-border/70 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phosphor-cyan ${
        isSelected
          ? "bg-tactical-elevated text-white"
          : "hover:bg-tactical-surfaceHover text-tactical-text"
      }`}
    >
      <td className="py-2.5 px-2.5 text-center font-bold text-tactical-dim tabular-nums">
        {s.session_id}
      </td>

      <td className="py-2.5 px-2.5">
        <span className="font-bold text-white block truncate max-w-[220px]">
          {s.server_name}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-tactical-dim mt-0.5 tabular-nums">
          <span>{s.src_ip}:{s.src_port}</span>
          <ArrowRight className="w-2.5 h-2.5 text-tactical-muted" />
          <span>{s.dst_ip}:{s.dst_port}</span>
        </div>
      </td>

      <td className="py-2.5 px-2.5">
        <span className="px-1.5 py-0.5 border border-tactical-border bg-black/40 text-[10px] font-bold uppercase">
          {s.protocol}
        </span>
      </td>

      <td className="py-2.5 px-2.5">
        <span
          className={`px-1.5 py-0.5 border text-[10px] font-bold ${
            s.tls_version === "TLS 1.3"
              ? "border-phosphor-green/50 text-phosphor-green bg-phosphor-green/10"
              : s.tls_version === "TLS 1.2"
              ? "border-phosphor-cyan/50 text-phosphor-cyan bg-phosphor-cyan/10"
              : "border-phosphor-hazard/50 text-phosphor-hazard bg-phosphor-hazard/10"
          }`}
        >
          {s.tls_version || "Cleartext"}
        </span>
      </td>

      <td className="py-2.5 px-2.5 max-w-[200px]">
        <span className="truncate block text-tactical-text text-[11px]">
          {s.cipher_suite_name || "None (Plaintext Fallback)"}
        </span>
        {s.cipher_suite_hex && (
          <span className="text-[10px] text-tactical-dim font-mono">{s.cipher_suite_hex}</span>
        )}
      </td>

      <td className="py-2.5 px-2.5 text-center">
        {s.has_forward_secrecy ? (
          <span className="inline-flex items-center gap-1 text-phosphor-green text-[10px]">
            <Lock className="w-3 h-3" /> ECDHE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-phosphor-hazard text-[10px]">
            <Unlock className="w-3 h-3" /> NO PFS
          </span>
        )}
      </td>

      <td className="py-2.5 px-2.5 text-center font-bold tabular-nums">
        <span className={s.session_score >= 80 ? "text-phosphor-green" : "text-phosphor-hazard"}>
          {s.session_score}
        </span>
      </td>

      <td className="py-2.5 px-2.5 text-center">
        <span
          className={`px-1.5 py-0.5 text-[9px] uppercase font-bold border ${
            isCritical
              ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/15"
              : "border-phosphor-green text-phosphor-green bg-phosphor-green/15"
          }`}
        >
          {s.session_severity}
        </span>
      </td>

      <td className="py-2.5 px-2.5 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(s.session_id);
          }}
          className={`px-2 py-0.5 border text-[10px] uppercase font-bold transition-colors inline-flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-phosphor-cyan ${
            isSelected
              ? "border-phosphor-cyan bg-phosphor-cyan text-black"
              : "border-tactical-border bg-tactical-bg hover:border-phosphor-cyan text-tactical-dim hover:text-white"
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>{isSelected ? "OPEN" : "INSPECT"}</span>
        </button>
      </td>
    </tr>
  );
}
