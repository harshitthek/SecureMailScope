"use client";

import { Session } from "@/lib/types";

interface FlowIndexPaneProps {
  sessions: Session[];
  activeSessionId: number;
  onSelectSession: (sessionId: number) => void;
}

export function FlowIndexPane({
  sessions,
  activeSessionId,
  onSelectSession,
}: FlowIndexPaneProps) {
  return (
    <aside className="w-72 min-w-[240px] max-w-[288px] border-r border-tactical-border/70 bg-tactical-surface/50 flex flex-col overflow-y-auto select-none font-mono">
      <div className="px-4 py-3 border-b border-tactical-border/70 text-[12px] uppercase tracking-widest text-tactical-dim font-bold flex items-center justify-between">
        <span>FLOW INDEX</span>
        <span className="text-phosphor-cyan font-bold text-[13px]">{sessions.length} FLOWS</span>
      </div>

      <div className="divide-y divide-tactical-border/30">
        {sessions.map((s, idx) => {
          const isSelected = s.session_id === activeSessionId;
          const isCrit = s.session_score < 50 || s.session_severity === "critical";
          const isDegraded = s.session_score >= 50 && s.session_score < 80;

          const dotColor = isCrit
            ? "bg-phosphor-hazard"
            : isDegraded
            ? "bg-phosphor-amber"
            : "bg-phosphor-green";

          const flowCode = `F0${idx + 1}`;

          return (
            <button
              key={s.session_id}
              onClick={() => onSelectSession(s.session_id)}
              className={`w-full p-3 text-left transition-colors flex items-center justify-between border-l-2 ${
                isSelected
                  ? "bg-tactical-elevated border-phosphor-cyan text-tactical-text shadow-[inset_2px_0_6px_rgba(0,216,246,0.15)]"
                  : "border-transparent text-tactical-text hover:bg-tactical-surfaceHover"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[13px] text-tactical-text">{flowCode}</span>
                    <span className="text-[12px] text-tactical-dim">
                      {s.protocol} :{s.dst_port}
                    </span>
                  </div>
                  <div className="text-[12px] text-tactical-dim truncate max-w-[130px]">
                    {s.server_name || s.dst_ip}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end flex-shrink-0">
                <span
                  className={`text-[13px] font-bold tabular-nums px-2 py-0.5 border ${
                    isCrit
                      ? "border-phosphor-hazard/60 text-phosphor-hazard bg-phosphor-hazard/10"
                      : isDegraded
                      ? "border-phosphor-amber/60 text-phosphor-amber bg-phosphor-amber/10"
                      : "border-phosphor-green/60 text-phosphor-green bg-phosphor-green/10"
                  }`}
                >
                  {s.session_score} {s.session_grade}
                </span>
                {isSelected && (
                  <span className="text-[11px] text-phosphor-cyan font-bold tracking-wider uppercase mt-1">
                    SELECTED
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
