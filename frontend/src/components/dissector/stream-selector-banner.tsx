"use client";

import { Session } from "@/lib/types";
import { Binary, ShieldAlert, ShieldCheck } from "lucide-react";

interface StreamSelectorBannerProps {
  sessions: Session[];
  currentStream: Session;
  onSelectStream: (id: number) => void;
}

export function StreamSelectorBanner({
  sessions,
  currentStream,
  onSelectStream,
}: StreamSelectorBannerProps) {
  const isCritical =
    currentStream.session_score < 50 || currentStream.session_severity === "critical";

  return (
    <div className="p-4 border border-tactical-border bg-tactical-surface space-y-3 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-sans font-bold text-tactical-text uppercase tracking-wider flex items-center gap-2">
            <Binary className="w-4 h-4 text-phosphor-cyan" />
            DEEP PROTOCOL DISSECTOR &amp; WIRE INSPECTOR
          </h2>
          <p className="text-xs text-tactical-dim font-mono mt-0.5">
            Select an email flow to inspect reassembled TCP streams, cryptographic handshakes, and wire frames
          </p>
        </div>
        <span className="text-[10px] text-tactical-dim font-bold">
          {sessions.length} ACTIVE FLOWS IN CAPTURE
        </span>
      </div>

      {/* Stream Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sessions.map((s) => {
          const isSelected = s.session_id === currentStream.session_id;
          const isCrit = s.session_score < 50 || s.session_severity === "critical";
          return (
            <button
              key={s.session_id}
              onClick={() => onSelectStream(s.session_id)}
              className={`px-3 py-1.5 border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "border-phosphor-cyan bg-tactical-elevated text-tactical-text shadow-[0_0_8px_rgba(0,216,246,0.2)]"
                  : "border-tactical-border bg-tactical-surface text-tactical-dim hover:text-tactical-text hover:border-tactical-borderHighlight"
              }`}
            >
              <span>STREAM #{s.session_id}</span>
              <span className="text-[10px] px-1 py-0.2 border border-tactical-border bg-tactical-bg text-tactical-text">
                {s.protocol}:{s.dst_port}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  isCrit ? "text-phosphor-hazard" : "text-phosphor-green"
                }`}
              >
                {s.session_score} ({s.session_grade})
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stream Summary Banner */}
      <div className="p-3 border border-tactical-border bg-tactical-surface flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 border flex items-center justify-center flex-shrink-0 ${
              isCritical
                ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                : "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
            }`}
          >
            {isCritical ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-tactical-text font-sans font-bold text-sm tracking-tight">
              {currentStream.server_name || currentStream.dst_ip}
            </div>
            <div className="text-[11px] text-tactical-dim font-mono">
              {currentStream.src_ip}:{currentStream.src_port} &rarr; {currentStream.dst_ip}:{currentStream.dst_port} ({currentStream.protocol})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono">
          <div>
            <span className="text-[9px] uppercase text-tactical-dim block">Protocol Version</span>
            <span className="text-tactical-text font-bold">{currentStream.tls_version || "Plaintext"}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-tactical-dim block">Forward Secrecy</span>
            <span className={currentStream.has_forward_secrecy ? "text-phosphor-green font-bold" : "text-phosphor-hazard font-bold"}>
              {currentStream.has_forward_secrecy ? "ECDHE" : "NONE"}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-tactical-dim block">Posture Score</span>
            <span className={`font-bold tabular-nums ${isCritical ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
              {currentStream.session_score} ({currentStream.session_grade})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
