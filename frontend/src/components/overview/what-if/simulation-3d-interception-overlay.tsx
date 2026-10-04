"use client";

import React, { useState } from "react";
import { 
  AlertOctagon, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Terminal, 
  ShieldAlert, 
  Radio,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface ActivePacketInfo {
  x: number;
  y: number;
  visible: boolean;
  phase: number;
  label: string;
  sublabel: string;
  type: "CLIENT_HELLO" | "ATTACK_INJECTION" | "DEFLECTION" | "PQC_KEY" | "VAULT_STREAM";
  flowVector: string;
  protocol: string;
  payloadSnippet: string;
  statusNotice: string;
  cipherInfo: string;
  complianceNotice: string;
}

export interface DeflectionImpactInfo {
  x: number;
  y: number;
  visible: boolean;
  intensity: number;
}

interface Simulation3DInterceptionOverlayProps {
  activePacket: ActivePacketInfo;
  deflectionImpact: DeflectionImpactInfo;
  onOpenDissector?: () => void;
}

export function Simulation3DInterceptionOverlay({
  activePacket,
  deflectionImpact,
  onOpenDissector = () => {},
}: Simulation3DInterceptionOverlayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAttack = activePacket.type === "ATTACK_INJECTION";
  const isDeflected = activePacket.type === "DEFLECTION";
  const isPqc = activePacket.type === "PQC_KEY";
  const isVault = activePacket.type === "VAULT_STREAM";

  const statusBadgeClass = isAttack
    ? "bg-red-950/90 text-red-300 border-red-500/80 animate-pulse"
    : isDeflected
    ? "bg-amber-950/90 text-amber-300 border-amber-400"
    : isPqc
    ? "bg-purple-950/90 text-purple-300 border-purple-400"
    : isVault
    ? "bg-emerald-950/90 text-emerald-300 border-emerald-400"
    : "bg-sky-950/90 text-sky-300 border-sky-400";

  const reticleColor = isAttack
    ? "border-red-500 text-red-400 bg-red-950/90"
    : isDeflected
    ? "border-amber-400 text-amber-300 bg-amber-950/90"
    : isPqc
    ? "border-purple-400 text-purple-300 bg-purple-950/90"
    : isVault
    ? "border-emerald-400 text-emerald-300 bg-emerald-950/90"
    : "border-sky-400 text-sky-300 bg-sky-950/90";

  const reticleTag = isAttack ? "ATTACK" : isDeflected ? "DEFLECT" : isPqc ? "PQC KEM" : isVault ? "SPOOL" : "PKT";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 font-mono">
      {/* 1. Stationary High-Contrast Telemetry Dissector HUD (Fixed Top-Right) */}
      <aside
        aria-label="In-Flight Telemetry Dissector"
        className="absolute top-12 right-3 w-72 sm:w-80 pointer-events-auto bg-[#05060b]/95 border border-border/90 rounded-lg p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-2 transition-all"
      >
        <div className="flex items-center justify-between border-b border-border/70 pb-1.5">
          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>WIRE TELEMETRY // STAGE {activePacket.phase + 1}/5</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${statusBadgeClass}`}>
              {activePacket.label}
            </span>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand HUD" : "Collapse HUD"}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between text-[11px] text-foreground font-semibold">
              <span className="truncate">{activePacket.flowVector}</span>
            </div>

            <div className="bg-black/85 rounded border border-border/70 p-2 text-[10px] leading-relaxed flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground border-b border-border/40 pb-1">
                <span>WIRE PAYLOAD</span>
                <span className="text-primary font-semibold truncate max-w-[150px]">{activePacket.protocol}</span>
              </div>
              <pre className="text-emerald-400 whitespace-pre-wrap font-mono text-[10px] overflow-x-auto py-0.5">
                {activePacket.payloadSnippet}
              </pre>
            </div>

            <div className="flex flex-col gap-1 text-[10px]">
              <div className="flex items-start gap-1.5 text-muted-foreground leading-snug">
                <span className="text-foreground font-bold shrink-0">ACTION:</span>
                <span className="text-foreground/90">{activePacket.statusNotice}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/40">
                <span className="truncate max-w-[150px]">{activePacket.cipherInfo}</span>
                <span className="text-emerald-400 font-bold shrink-0">{activePacket.complianceNotice}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenDissector}
              className="w-full py-1.5 rounded bg-muted/60 hover:bg-muted text-foreground text-[10px] font-bold border border-border flex items-center justify-center gap-1.5 transition-colors active:scale-98 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Terminal className="w-3 h-3 text-muted-foreground" />
              <span>INSPECT RAW 64-BYTE HEX STREAM</span>
            </button>
          </>
        )}
      </aside>

      {/* 2. Tactical In-Flight Locator Reticle on 3D Wire (No overlapping multiline text) */}
      {activePacket.visible && (
        <div
          style={{
            transform: `translate3d(${activePacket.x}px, ${activePacket.y}px, 0) translate(-50%, -50%)`,
          }}
          className="absolute transition-transform duration-75 flex items-center justify-center pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <span className={`absolute w-7 h-7 rounded-full border animate-ping opacity-35 ${reticleColor}`} />
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-md backdrop-blur-xs text-[9px] font-bold ${reticleColor}`}>
              {isAttack && <AlertOctagon className="w-2.5 h-2.5 shrink-0" />}
              {isDeflected && <ShieldCheck className="w-2.5 h-2.5 shrink-0" />}
              {isPqc && <Zap className="w-2.5 h-2.5 shrink-0" />}
              {isVault && <Lock className="w-2.5 h-2.5 shrink-0" />}
              {!isAttack && !isDeflected && !isPqc && !isVault && <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />}
              <span>{reticleTag}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Stationary Deflection Alert Banner (Fixed Top-Center during Deflection) */}
      {deflectionImpact.visible && (
        <div
          style={{ opacity: deflectionImpact.intensity }}
          className="absolute top-12 left-1/2 -translate-x-1/2 transition-opacity duration-100 flex flex-col items-center pointer-events-none z-30 text-center max-w-lg"
        >
          <div className="px-4 py-2 rounded-lg bg-red-950/95 border-2 border-red-500 text-white font-bold text-[12px] shadow-[0_0_35px_rgba(239,68,68,0.8)] backdrop-blur-md flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
            <span>INTERCEPTED: STRIPTLS DOWNGRADE ATTACK DEFLECTED (ALERT 70)</span>
          </div>
          <div className="text-[10px] text-amber-300 font-bold mt-1 tracking-wider bg-black/90 px-2.5 py-0.5 rounded border border-amber-500/50">
            NIST SP 800-52r2 MANDATORY TLS 1.3 ENFORCED // CLEARTEXT TRANSMISSION BLOCKED
          </div>
        </div>
      )}
    </div>
  );
}
