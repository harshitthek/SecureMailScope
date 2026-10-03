"use client";

import { Session } from "@/lib/types";
import { DissectorMode } from "@/hooks/use-workstation";
import { DissectorModeA } from "./dissector-mode-a";
import { DissectorModeB } from "./dissector-mode-b";
import { X, Cpu } from "lucide-react";

interface DissectorDrawerProps {
  session: Session | null;
  mode: DissectorMode;
  onModeChange: (m: DissectorMode) => void;
  onClose: () => void;
}

export function DissectorDrawer({ session, mode, onModeChange, onClose }: DissectorDrawerProps) {
  if (!session) return null;

  return (
    <div className="w-full border border-tactical-border bg-tactical-surface p-3 font-mono text-xs space-y-3 shadow-2xl">
      {/* Top Navigation & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-tactical-border gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-phosphor-cyan" />
          <span className="font-bold text-tactical-text text-[11px] uppercase">
            DEEP STREAM DISSECTOR // FLOW #{session.session_id} ({session.protocol})
          </span>
          <span className="text-[10px] text-tactical-dim hidden sm:inline">
            [{session.src_ip}:{session.src_port} &rarr; {session.dst_ip}:{session.dst_port}]
          </span>
        </div>

        {/* Tab Controls & Close */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-tactical-border bg-tactical-surface p-0.5">
            <button
              onClick={() => onModeChange("AUDIT")}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold transition-colors ${
                mode === "AUDIT"
                  ? "bg-phosphor-cyan text-black"
                  : "text-tactical-dim hover:text-tactical-text"
              }`}
            >
              [ MODE A: CRYPTANALYSIS &amp; AUDIT ]
            </button>
            <button
              onClick={() => onModeChange("RAW_STREAM")}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold transition-colors ${
                mode === "RAW_STREAM"
                  ? "bg-phosphor-green text-black"
                  : "text-tactical-dim hover:text-tactical-text"
              }`}
            >
              [ MODE B: RAW STREAM &amp; PROTOCOL STATE ]
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-tactical-border hover:border-phosphor-hazard hover:text-phosphor-hazard text-tactical-dim transition-colors"
            title="Close Dissector Drawer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dissector Body */}
      {mode === "AUDIT" ? (
        <DissectorModeA session={session} />
      ) : (
        <DissectorModeB session={session} />
      )}
    </div>
  );
}
