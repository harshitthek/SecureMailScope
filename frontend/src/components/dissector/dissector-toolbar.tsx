"use client";

import { Session } from "@/lib/types";
import { Binary } from "lucide-react";

interface DissectorToolbarProps {
  sessions: Session[];
  currentStream: Session;
  onSelectStream: (id: number) => void;
}

export function DissectorToolbar({
  sessions,
  currentStream,
  onSelectStream,
}: DissectorToolbarProps) {
  const isCrit = currentStream.session_score < 50 || currentStream.session_severity === "critical";
  const isDeg = currentStream.session_score >= 50 && currentStream.session_score < 80;

  return (
    <div className="border-b border-tactical-border/80 bg-tactical-surface px-4 lg:px-6 py-2.5 min-h-[50px] flex items-center justify-between flex-shrink-0 select-none font-mono">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-phosphor-cyan" />
          <span className="text-[14px] font-sans font-bold text-tactical-text uppercase tracking-wider">
            DEEP WIRE DISSECTOR
          </span>
          <span className="text-[12px] text-tactical-dim hidden xl:inline">
            {"//"} FRAME &amp; BYTE LEVEL INSPECTION
          </span>
        </div>

        {/* Stream Selector Dropdown */}
        <div className="flex items-center gap-2 border-l border-tactical-border/60 pl-3">
          <span className="text-[11px] text-tactical-dim uppercase font-bold">STREAM:</span>
          <select
            value={currentStream.session_id}
            onChange={(e) => onSelectStream(Number(e.target.value))}
            aria-label="Select stream"
            className="bg-tactical-elevated border border-tactical-border text-tactical-text text-[12px] px-2 py-1 font-mono focus:outline-none focus:border-phosphor-cyan max-w-[210px] truncate"
          >
            {sessions.map((s, idx) => (
              <option key={s.session_id} value={s.session_id}>
                FLOW #{idx < 9 ? `0${idx + 1}` : idx + 1}: {s.protocol} :{s.dst_port} ({s.server_name || s.dst_ip}) — {s.session_score} pts
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stream Quick Telemetry */}
      <div className="flex items-center gap-3 text-[12px] sm:text-[13px] whitespace-nowrap">
        <div className="text-tactical-dim flex items-center gap-2">
          <span className="text-tactical-text font-bold">
            {currentStream.src_ip}:{currentStream.src_port} &rarr; {currentStream.dst_ip}:{currentStream.dst_port}
          </span>
          <span>·</span>
          <span className="text-phosphor-cyan font-bold">{currentStream.protocol}</span>
          <span>·</span>
          <span className={!currentStream.is_encrypted ? "text-phosphor-hazard font-bold" : "text-tactical-text font-medium"}>
            {currentStream.tls_version || "CLEARTEXT"}
          </span>
        </div>

        <span
          className={`text-[13px] font-bold tabular-nums px-2.5 py-0.5 border ${
            isCrit
              ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 text-phosphor-hazard"
              : isDeg
              ? "border-phosphor-amber/60 bg-phosphor-amber/10 text-phosphor-amber"
              : "border-phosphor-green/60 bg-phosphor-green/10 text-phosphor-green"
          }`}
        >
          {currentStream.session_score} / 100 ({currentStream.session_grade})
        </span>
      </div>
    </div>
  );
}
