"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Activity } from "lucide-react";

interface Simulation3DDockProps {
  currentStage: number;
  onSetStage: (stage: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenDissector?: () => void;
  onResetCamera?: () => void;
  selectedStation: "NONE" | "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT";
  liveCycleProgress?: number;
  liveEventLog?: string;
}

const STAGE_CONFIGS = [
  {
    id: 0,
    title: "STAGE 0: UNENCRYPTED EXPOSURE",
    tagClass: "bg-red-500/10 text-red-400 border-red-500/30",
    summary: "Adversary drone taps cleartext SMTP socket at port 25/587. Cleartext credentials leaking.",
  },
  {
    id: 1,
    title: "STAGE 1: MTA DIRECTIVES",
    tagClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    summary: "NIST SP 800-52r2 compliance policies compiled. Postfix & Dovecot 4 pillars active.",
  },
  {
    id: 2,
    title: "STAGE 2: STRIPTLS DEFLECTION",
    tagClass: "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse",
    summary: "Rogue MitM injects stripped 250-STARTTLS. Mandatory encryption shield repels attack with SSL Alert 70.",
  },
  {
    id: 3,
    title: "STAGE 3: PQC UPGRADE",
    tagClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    summary: "Dual-layer hybrid lattice (ML-KEM-768 + X25519) negotiates ephemeral keys. Quantum safe.",
  },
  {
    id: 4,
    title: "STAGE 4: CONVERGED VAULT",
    tagClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    summary: "Enterprise transport converged. Zero plaintext leakage. Grade A+ cryptographic posture.",
  },
];

export function Simulation3DDock({
  currentStage,
  onSetStage,
  isPlaying,
  onTogglePlay,
  liveCycleProgress = 0,
  liveEventLog,
}: Simulation3DDockProps) {
  const stage = STAGE_CONFIGS[currentStage] || STAGE_CONFIGS[0];

  return (
    <footer
      aria-label="Simulation Playback Dock"
      className="relative bottom-2 px-3 z-10 font-mono text-[11px]"
    >
      <div className="bg-[#05060b]/90 border border-border/80 rounded-lg backdrop-blur-md shadow-lg flex flex-col overflow-hidden">
        {/* Real-time 5-Phase Transaction Kinematic Timeline Bar */}
        <div className="w-full h-1 bg-muted/40 relative overflow-hidden">
          <div
            style={{ width: `${liveCycleProgress}%` }}
            className="h-full bg-gradient-to-r from-sky-400 via-red-400 via-amber-400 via-purple-400 to-emerald-400 transition-all duration-75"
          />
        </div>

        <div className="p-2 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Stage Stepper & Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded border border-border/60">
              <button
                type="button"
                disabled={currentStage <= 0}
                onClick={() => onSetStage(Math.max(0, currentStage - 1))}
                aria-label="Previous simulation stage"
                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-foreground font-bold px-1 tabular-nums">
                {currentStage + 1} / {STAGE_CONFIGS.length}
              </span>
              <button
                type="button"
                disabled={currentStage >= STAGE_CONFIGS.length - 1}
                onClick={() => onSetStage(Math.min(STAGE_CONFIGS.length - 1, currentStage + 1))}
                aria-label="Next simulation stage"
                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
              className="p-1.5 rounded bg-muted/60 border border-border text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>

            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${stage.tagClass}`}>
              {stage.title}
            </span>
          </div>

          {/* Center: Live Real-Time Forensic Event Ticker */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 max-w-xl truncate px-2 text-[10px] text-foreground/90">
            <Activity className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate text-muted-foreground font-mono">
              {liveEventLog || stage.summary}
            </span>
          </div>

          {/* Right: Operational Sensor Status Badge (Replaced redundant action buttons) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground hidden sm:inline">SENSOR:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              TAP-01 (ACTIVE)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
