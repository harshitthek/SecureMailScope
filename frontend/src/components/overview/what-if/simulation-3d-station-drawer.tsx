"use client";

import React from "react";
import { X, ShieldAlert, Cpu, Eye, Lock, FileSearch } from "lucide-react";

interface Simulation3DStationDrawerProps {
  station: "NONE" | "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT";
  onClose: () => void;
  currentStage: number;
  clientIp: string;
  serverIp: string;
  port: number;
  enforceTls13: boolean;
  enforcePfs: boolean;
  enforceAead: boolean;
  renewCerts: boolean;
  onOpenDissector: () => void;
}

export function Simulation3DStationDrawer({
  station,
  onClose,
  currentStage,
  clientIp,
  serverIp,
  port,
  enforceTls13,
  enforcePfs,
  enforceAead,
  renewCerts,
  onOpenDissector,
}: Simulation3DStationDrawerProps) {
  if (station === "NONE") return null;

  return (
    <aside
      aria-label="Station Telemetry Drawer"
      className="absolute top-0 right-0 bottom-0 w-72 sm:w-80 bg-card/95 border-l border-border/80 backdrop-blur-md p-4 z-20 flex flex-col justify-between font-mono text-[11px] shadow-2xl transition-transform duration-200 animate-in slide-in-from-right"
    >
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            {station === "CLIENT" && <Eye className="w-4 h-4 text-sky-400" />}
            {station === "ADVERSARY" && <ShieldAlert className="w-4 h-4 text-red-400" />}
            {station === "GATEWAY" && <Cpu className="w-4 h-4 text-emerald-400" />}
            {station === "VAULT" && <Lock className="w-4 h-4 text-sky-400" />}
            <span className="font-bold text-foreground text-xs">{station} NODE TELEMETRY</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close station telemetry drawer"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Station Body */}
        {station === "CLIENT" && (
          <div className="space-y-3">
            <div className="p-2.5 rounded bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] text-muted-foreground">SOCKET COORDINATES</div>
              <div className="text-foreground font-semibold">{clientIp}:49300</div>
              <div className="text-[9px] text-muted-foreground">Target MTA: {serverIp}:{port}</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold">CLIENT HELLO NEGOTIATION</div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Protocol:</span>
                <span className="text-foreground font-semibold">{currentStage >= 3 ? "TLSv1.3 (RFC 8446)" : "SSLv3.0 / TLS 1.0"}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">PQC Extension:</span>
                <span className={currentStage >= 3 ? "text-purple-400 font-semibold" : "text-muted-foreground"}>
                  {currentStage >= 3 ? "0x11ec (ML-KEM-768)" : "None"}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Posture State:</span>
                <span className={currentStage >= 3 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {currentStage >= 3 ? "IMMUNIZED" : "CLEAR-TEXT EXPOSURE"}
                </span>
              </div>
            </div>
          </div>
        )}

        {station === "ADVERSARY" && (
          <div className="space-y-3">
            <div className="p-2.5 rounded bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] text-muted-foreground">INTRUDER IDENTIFIER</div>
              <div className="text-red-400 font-semibold">10.0.0.99 (ROGUE PROXY)</div>
              <div className="text-[9px] text-muted-foreground">Attack: STRIPTLS Tampering</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold">ATTACK MITIGATION STATUS</div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Eavesdropping:</span>
                <span className={currentStage >= 2 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {currentStage >= 2 ? "DEFLECTED" : "UNENCRYPTED STREAM"}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Downgrade Injection:</span>
                <span className={currentStage >= 2 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {currentStage >= 2 ? "BLOCKED (SSL ALERT 70)" : "SUCCESSFUL INJECTION"}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Quarantine Cage:</span>
                <span className={currentStage >= 3 ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                  {currentStage >= 3 ? "ENCLOSED & ISOLATED" : "INACTIVE"}
                </span>
              </div>
            </div>
          </div>
        )}

        {station === "GATEWAY" && (
          <div className="space-y-3">
            <div className="p-2.5 rounded bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] text-muted-foreground">DEFENSE ENGINE</div>
              <div className="text-emerald-400 font-semibold">SECUREMAILSCOPE SENSOR TAP-01</div>
              <div className="text-[9px] text-muted-foreground">MTA Filter: Mandatory Encryption</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold">ACTIVE DEFENSE POLICIES</div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className={`p-1.5 rounded border ${enforceTls13 || currentStage >= 3 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 text-muted-foreground"}`}>
                  TLS 1.3 §3.1
                </div>
                <div className={`p-1.5 rounded border ${enforcePfs || currentStage >= 3 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 text-muted-foreground"}`}>
                  ECDHE PFS §3.3
                </div>
                <div className={`p-1.5 rounded border ${enforceAead || currentStage >= 3 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 text-muted-foreground"}`}>
                  AEAD Ciphers
                </div>
                <div className={`p-1.5 rounded border ${renewCerts || currentStage >= 3 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 text-muted-foreground"}`}>
                  3072b Root CA
                </div>
              </div>
            </div>
          </div>
        )}

        {station === "VAULT" && (
          <div className="space-y-3">
            <div className="p-2.5 rounded bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] text-muted-foreground">HARDENED SPOOL CITADEL</div>
              <div className="text-sky-400 font-semibold">DOVECOT / POSTFIX VAULT ({serverIp})</div>
              <div className="text-[9px] text-muted-foreground">Storage Spool: TLS-Only Ingestion</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold">CRYPTOGRAPHIC INTEGRITY</div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">At-Rest Protection:</span>
                <span className={currentStage >= 3 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {currentStage >= 3 ? "AES-256-GCM SEALED" : "UNENCRYPTED PLAINTEXT"}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Residual Leakage:</span>
                <span className={currentStage >= 3 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {currentStage >= 3 ? "0.0% (ZERO LEAK)" : "CREDENTIAL LEAK OBSERVED"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Action */}
      <div className="pt-3 border-t border-border/60 space-y-2">
        <button
          type="button"
          onClick={onOpenDissector}
          className="w-full py-1.5 px-3 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>INSPECT IN-FLIGHT FRAME</span>
        </button>
      </div>
    </aside>
  );
}
