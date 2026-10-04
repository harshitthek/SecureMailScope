"use client";

import React from "react";
import { Play, Pause, SkipForward, RotateCcw, FastForward } from "lucide-react";

interface SimulationPlaybackControlsProps {
  isPlaying: boolean;
  currentStage: number;
  speed: 1 | 2;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onToggleSpeed: () => void;
  onSelectStage: (stage: number) => void;
}

const STAGES = [
  { id: 0, label: "0. BASELINE", desc: "Unprotected Socket" },
  { id: 1, label: "1. DIRECTIVES", desc: "MTA Patch Injected" },
  { id: 2, label: "2. QUARANTINE", desc: "MitM Downgrades Blocked" },
  { id: 3, label: "3. PQC UPGRADE", desc: "ML-KEM / AEAD Negotiated" },
  { id: 4, label: "4. CONVERGED", desc: "NIST SP 800-52r2 Verified" },
];

export function SimulationPlaybackControls({
  isPlaying,
  currentStage,
  speed,
  onTogglePlay,
  onStepForward,
  onReset,
  onToggleSpeed,
  onSelectStage,
}: SimulationPlaybackControlsProps) {
  return (
    <div className="bg-[#08080a] border border-[#1c1d22] rounded-[8px] p-3 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs select-none">
      {/* Playback action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold transition-all ${
            isPlaying
              ? "bg-[#cc9166] text-black shadow-[0_0_12px_rgba(204,145,102,0.4)]"
              : "bg-white text-black hover:bg-[#e2e3e9]"
          }`}
          title={isPlaying ? "Pause Simulation" : "Run Live Simulation"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? "PAUSE" : "RUN SIMULATION"}</span>
        </button>

        <button
          type="button"
          onClick={onStepForward}
          disabled={isPlaying}
          className="p-1.5 rounded-full bg-[#121317] border border-[#2e3038] text-[#9194a1] hover:text-white hover:border-[#cc9166] transition-colors disabled:opacity-40"
          title="Step Forward to Next Stage"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-full bg-[#121317] border border-[#2e3038] text-[#9194a1] hover:text-white hover:border-[#cc9166] transition-colors"
          title="Reset Simulation to Baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="text-[#2e3038] mx-1">|</span>

        <button
          type="button"
          onClick={onToggleSpeed}
          className="px-2 py-1 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] hover:text-white flex items-center gap-1 text-[11px]"
          title="Toggle Simulation Speed"
        >
          <FastForward className="w-3 h-3" />
          <span>{speed}x SPEED</span>
        </button>
      </div>

      {/* Stage timeline progression pills */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {STAGES.map((st) => {
          const isActive = currentStage === st.id;
          const isPassed = currentStage > st.id;

          let badgeColor = "bg-[#121317] text-[#777a88] border-[#1c1d22]";
          if (isActive) {
            badgeColor = "bg-[#cc9166]/20 text-[#cc9166] border-[#cc9166] shadow-[0_0_8px_rgba(204,145,102,0.3)]";
          } else if (isPassed) {
            badgeColor = "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/40";
          }

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStage(st.id)}
              className={`px-2 py-1 rounded border text-[10px] transition-all flex flex-col text-left ${badgeColor}`}
            >
              <span className="font-semibold">{st.label}</span>
              <span className="text-[9px] opacity-75 hidden sm:inline">{st.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
