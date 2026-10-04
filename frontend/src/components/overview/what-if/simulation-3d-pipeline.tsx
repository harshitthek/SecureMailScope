"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { useSimulation3D } from "./use-simulation-3d";
import { Simulation3DPins } from "./simulation-3d-pins";
import { Simulation3DDock } from "./simulation-3d-dock";
import { Simulation3DStationDrawer } from "./simulation-3d-station-drawer";
import { Simulation3DPacketInspector } from "./simulation-3d-packet-inspector";
import { Simulation3DInterceptionOverlay } from "./simulation-3d-interception-overlay";

interface Simulation3DPipelineProps {
  currentStage: number;
  activeCase: EvidenceCase;
  enforceTls13: boolean;
  enforcePfs: boolean;
  enforceAead: boolean;
  renewCerts: boolean;
  onSetStage?: (stage: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export function Simulation3DPipeline({
  currentStage,
  activeCase,
  enforceTls13,
  enforcePfs,
  enforceAead,
  renewCerts,
  onSetStage = () => {},
  isPlaying = true,
  onTogglePlay = () => {},
}: Simulation3DPipelineProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedStation, setSelectedStation] = useState<"NONE" | "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT">("NONE");
  const [isDissectorOpen, setIsDissectorOpen] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const {
    fps,
    clientPos,
    adversaryPos,
    gatewayPos,
    vaultPos,
    activePacket,
    deflectionImpact,
    liveCycleProgress,
    liveEventLog,
    setCameraTarget,
  } = useSimulation3D({
    containerRef: mountRef,
    currentStage,
    enforceTls13,
    enforcePfs,
    enforceAead,
    renewCerts,
  });

  const clientIp = activeCase.data.sessions[0]?.src_ip || "192.168.1.100";
  const serverIp = activeCase.data.sessions[0]?.dst_ip || "10.0.0.5";
  const protocol = activeCase.data.sessions[0]?.protocol || "SMTP";
  const port = activeCase.data.sessions[0]?.dst_port || 25;

  const handleSelectStation = useCallback(
    (station: "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT") => {
      setSelectedStation(station);
      setCameraTarget(station);
    },
    [setCameraTarget]
  );

  const handleResetCamera = useCallback(() => {
    setSelectedStation("NONE");
    setCameraTarget("OVERVIEW");
  }, [setCameraTarget]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMaximized]);

  return (
    <section
      aria-label="3D Cryptographic Wire Simulation"
      className={`relative w-full bg-[#020308] border border-border/80 select-none font-mono flex flex-col justify-between transition-all duration-300 ${
        isMaximized
          ? "fixed inset-2 z-50 h-[calc(100vh-16px)] w-[calc(100vw-16px)] rounded-xl border-primary/50 shadow-2xl"
          : "h-[660px] lg:h-[720px] rounded-lg overflow-hidden"
      }`}
    >
      {/* 3D WebGL Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Screen-Projected Minimal Elevated Tactical Station Pins */}
      <Simulation3DPins
        clientPos={clientPos}
        adversaryPos={adversaryPos}
        gatewayPos={gatewayPos}
        vaultPos={vaultPos}
        currentStage={currentStage}
        clientIp={clientIp}
        serverIp={serverIp}
        selectedStation={selectedStation}
        onSelectStation={handleSelectStation}
        enforceTls13={enforceTls13}
        enforcePfs={enforcePfs}
        enforceAead={enforceAead}
        renewCerts={renewCerts}
      />

      {/* Real-Time In-Flight Transaction Packet & Interception Impact Overlay */}
      <Simulation3DInterceptionOverlay
        activePacket={activePacket}
        deflectionImpact={deflectionImpact}
        onOpenDissector={() => setIsDissectorOpen(true)}
      />

      {/* Top Telemetry Header & Workstation Controls */}
      <header className="relative top-2.5 px-3 flex items-center justify-between gap-2 pointer-events-none z-10 text-[10px]">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-2.5 py-1 rounded bg-[#05060b]/90 border border-border/80 text-emerald-400 font-bold flex items-center gap-1.5 shadow-xs backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>3D WEBGL ({fps} FPS)</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#05060b]/90 border border-border/80 text-muted-foreground backdrop-blur-md hidden sm:inline">
            PORT: {port} ({protocol})
          </span>
        </div>

        {/* Simplified Header Controls: Reset View & Theater Mode */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {selectedStation !== "NONE" && (
            <button
              type="button"
              onClick={handleResetCamera}
              aria-label="Reset to battlefield overview"
              className="px-2.5 py-1 rounded-full bg-[#05060b]/90 border border-primary/40 text-primary hover:bg-primary/10 transition-colors text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET VIEW</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            aria-label={isMaximized ? "Exit fullscreen workstation" : "Maximize workstation"}
            className="px-2.5 py-1 rounded-full bg-[#05060b]/90 border border-border/80 text-muted-foreground hover:text-foreground backdrop-blur-md text-[10px] font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3 text-amber-400" /> : <Maximize2 className="w-3 h-3" />}
            <span className="hidden sm:inline">{isMaximized ? "RESTORE" : "THEATER MODE"}</span>
          </button>
        </div>
      </header>

      {/* Slide-over Deep Station Cryptanalysis Drawer */}
      <Simulation3DStationDrawer
        station={selectedStation}
        onClose={() => setSelectedStation("NONE")}
        currentStage={currentStage}
        clientIp={clientIp}
        serverIp={serverIp}
        port={port}
        enforceTls13={enforceTls13}
        enforcePfs={enforcePfs}
        enforceAead={enforceAead}
        renewCerts={renewCerts}
        onOpenDissector={() => setIsDissectorOpen(true)}
      />

      {/* Deep In-Flight Packet Inspector Modal */}
      <Simulation3DPacketInspector
        isOpen={isDissectorOpen}
        onClose={() => setIsDissectorOpen(false)}
        currentStage={currentStage}
        clientIp={clientIp}
        serverIp={serverIp}
        port={port}
        enforceTls13={enforceTls13}
        enforcePfs={enforcePfs}
        enforceAead={enforceAead}
        renewCerts={renewCerts}
      />

      {/* Unified Low-Profile Bottom Simulation Dock with Real-Time Progress & Event Ticker */}
      <Simulation3DDock
        currentStage={currentStage}
        onSetStage={onSetStage}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onOpenDissector={() => setIsDissectorOpen(true)}
        onResetCamera={handleResetCamera}
        selectedStation={selectedStation}
        liveCycleProgress={liveCycleProgress}
        liveEventLog={liveEventLog}
      />
    </section>
  );
}
