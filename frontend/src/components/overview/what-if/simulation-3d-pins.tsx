"use client";

import React from "react";

export interface ProjectedPos {
  x: number;
  y: number;
  visible: boolean;
}

interface Simulation3DPinsProps {
  clientPos: ProjectedPos;
  adversaryPos: ProjectedPos;
  gatewayPos: ProjectedPos;
  vaultPos: ProjectedPos;
  currentStage: number;
  clientIp: string;
  serverIp: string;
  selectedStation: "NONE" | "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT";
  onSelectStation: (station: "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT") => void;
}

export function Simulation3DPins({
  clientPos,
  adversaryPos,
  gatewayPos,
  vaultPos,
  currentStage,
  clientIp,
  serverIp,
  selectedStation,
  onSelectStation,
}: Simulation3DPinsProps) {
  const stations = [
    {
      id: "CLIENT" as const,
      pos: clientPos,
      label: "CLIENT",
      ip: clientIp,
      status: currentStage >= 3 ? "PQC TLS 1.3" : "VULNERABLE",
      dotClass: currentStage >= 3 ? "bg-emerald-400" : "bg-sky-400",
      activeRing: "ring-sky-400 border-sky-400",
    },
    {
      id: "ADVERSARY" as const,
      pos: adversaryPos,
      label: "MITM TAP",
      ip: "10.0.0.99",
      status: currentStage >= 3 ? "QUARANTINED" : currentStage === 2 ? "DEFLECTED" : "ACTIVE TAP",
      dotClass: currentStage >= 3 ? "bg-emerald-400" : "bg-red-400 animate-ping",
      activeRing: "ring-red-500 border-red-500",
    },
    {
      id: "GATEWAY" as const,
      pos: gatewayPos,
      label: "QUANTUM MTA",
      ip: "TAP-01 SENSOR",
      status: currentStage >= 3 ? "LATTICE ENFORCED" : "INSPECTING",
      dotClass: "bg-emerald-400",
      activeRing: "ring-emerald-400 border-emerald-400",
    },
    {
      id: "VAULT" as const,
      pos: vaultPos,
      label: "MAIL VAULT",
      ip: serverIp,
      status: currentStage >= 3 ? "ZERO LEAK" : "INSECURE SPOOL",
      dotClass: currentStage >= 3 ? "bg-emerald-400" : "bg-sky-400",
      activeRing: "ring-sky-400 border-sky-400",
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-mono text-[11px]">
      {stations.map(
        (st) =>
          st.pos.visible && (
            <div
              key={st.id}
              style={{
                transform: `translate3d(${st.pos.x}px, ${st.pos.y}px, 0) translate(-50%, -100%) translateY(-48px)`,
              }}
              className="absolute pointer-events-auto transition-transform duration-75 flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => onSelectStation(st.id)}
                aria-label={`Inspect ${st.label} station`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedStation === st.id
                    ? `bg-[#0a0c14] ${st.activeRing} ring-2 text-foreground`
                    : "bg-[#05060b]/90 border-border/80 hover:border-foreground/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${st.dotClass} shrink-0`} />
                <span className="font-bold text-foreground tracking-tight">{st.label}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">{st.ip}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/80 text-foreground font-semibold">
                  {st.status}
                </span>
              </button>
              {/* Sleek vertical leader line down to the 3D entity */}
              <div className="w-[1px] h-5 bg-gradient-to-b from-border/90 to-transparent" />
            </div>
          )
      )}
    </div>
  );
}
