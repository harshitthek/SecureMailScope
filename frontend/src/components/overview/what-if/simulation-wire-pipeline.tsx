"use client";

import React from "react";
import { Shield, ShieldAlert, ShieldCheck, Server, Laptop, Lock, AlertTriangle } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface SimulationWirePipelineProps {
  currentStage: number;
  activeCase: EvidenceCase;
  enforceTls13: boolean;
  enforcePfs: boolean;
  enforceAead: boolean;
  renewCerts: boolean;
}

export function SimulationWirePipeline({
  currentStage,
  activeCase,
  enforceTls13,
  enforcePfs,
  enforceAead,
  renewCerts,
}: SimulationWirePipelineProps) {
  const isVulnerable = currentStage === 0;
  const isQuarantining = currentStage === 2;
  const isUpgraded = currentStage >= 3;
  const isConverged = currentStage === 4;

  const clientIp = activeCase.data.sessions[0]?.src_ip || "192.168.1.45";
  const serverIp = activeCase.data.sessions[0]?.dst_ip || "10.0.0.25";
  const protocol = activeCase.data.sessions[0]?.protocol || "SMTP";
  const port = activeCase.data.sessions[0]?.dst_port || 25;

  return (
    <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-4 flex flex-col gap-4 font-mono select-none overflow-hidden relative">
      {/* Background cyber grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1d22_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Header telemetry readout */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1c1d22] relative z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#cc9166] animate-pulse" />
          <span className="text-[#9194a1] uppercase font-semibold text-[11px]">
            Active Socket Topology &amp; Wire Quarantine Pipeline
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#9194a1]">
            PORT: {port} ({protocol})
          </span>
          <span className={`px-2 py-0.5 rounded border font-semibold ${
            isConverged
              ? "bg-[#34d399]/10 border-[#34d399]/40 text-[#34d399]"
              : isVulnerable
              ? "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]"
              : "bg-[#cc9166]/10 border-[#cc9166]/40 text-[#cc9166]"
          }`}>
            {isConverged ? "IMMUNIZED" : isVulnerable ? "VULNERABLE" : "HARDENING..."}
          </span>
        </div>
      </div>

      {/* 3-Node Topology Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative z-10 py-2">
        {/* Node 1: Client / Ingress Probe */}
        <div className="md:col-span-3 bg-[#121317] border border-[#2e3038] rounded-[8px] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#777a88] uppercase">INGRESS PROBE</span>
            <Laptop className="w-3.5 h-3.5 text-[#9194a1]" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">{clientIp}</div>
            <div className="text-[10px] text-[#9194a1]">Ephemeral SPort: 51234</div>
          </div>
          <div className="text-[10px] pt-1 border-t border-[#1c1d22] flex items-center justify-between">
            <span className="text-[#777a88]">Offered:</span>
            <span className={isUpgraded && (enforceTls13 || activeCase.id === "CASE-01") ? "text-[#34d399]" : isUpgraded ? "text-[#cc9166]" : "text-[#ef4444]"}>
              {isUpgraded && (enforceTls13 || activeCase.id === "CASE-01")
                ? "TLS 1.3 / ML-KEM"
                : isUpgraded
                ? (renewCerts ? "CA Validated Trust" : "Policy Hardened")
                : "SSLv3 / RC4 / Clear"}
            </span>
          </div>
        </div>

        {/* Wire 1: Ingress Channel with Animated Packets */}
        <div className="md:col-span-2 flex flex-col items-center justify-center relative py-2">
          <div className={`h-0.5 w-full relative ${
            isVulnerable ? "bg-[#ef4444]/60" : "bg-gradient-to-r from-[#ef4444]/60 to-[#cc9166]"
          }`}>
            {/* Animated packet dot */}
            <div
              className={`absolute -top-1 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-all duration-700 ${
                isVulnerable ? "bg-[#ef4444] text-[#ef4444] animate-ping" : "bg-[#cc9166] text-[#cc9166] left-1/2"
              }`}
            />
          </div>
          <span className="text-[9px] text-[#777a88] mt-1 text-center">
            {isVulnerable ? "⚠ Cleartext Probe" : "Intercepted"}
          </span>
        </div>

        {/* Node 2: Defense Gateway / Sensor Tap */}
        <div className={`md:col-span-4 rounded-[8px] p-3 border transition-all flex flex-col gap-2 ${
          isConverged
            ? "bg-[#121317] border-[#34d399]/60 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
            : isQuarantining
            ? "bg-[#121317] border-[#cc9166] shadow-[0_0_15px_rgba(204,145,102,0.2)]"
            : "bg-[#121317] border-[#2e3038]"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isConverged ? (
                <ShieldCheck className="w-4 h-4 text-[#34d399]" />
              ) : isQuarantining ? (
                <ShieldAlert className="w-4 h-4 text-[#cc9166]" />
              ) : (
                <Shield className="w-4 h-4 text-[#777a88]" />
              )}
              <span className="text-[10px] text-white font-semibold">SECUREMAILSCOPE GATEWAY</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#08080a] text-[#cc9166] border border-[#2e3038]">
              TAP-01
            </span>
          </div>

          {/* Active quarantine status tags */}
          <div className="flex flex-col gap-1 text-[10px]">
            {currentStage === 0 && (
              <div className="text-[#ef4444] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Passive Inspection: 0 Policies Enforced</span>
              </div>
            )}
            {currentStage === 1 && (
              <div className="text-[#cc9166]">
                Directives Compiling: Postfix + Dovecot Rules Loaded
              </div>
            )}
            {currentStage === 2 && (
              <div className="text-[#cc9166] flex items-center gap-1 font-semibold animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>QUARANTINE: STRIPTLS Intercepted &amp; Blocked</span>
              </div>
            )}
            {currentStage >= 3 && (
              <div className="text-[#34d399] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>
                  {activeCase.id === "CASE-01" || enforceTls13
                    ? "Hybrid Post-Quantum TLS 1.3 Active"
                    : renewCerts
                    ? "CA Trust Anchor Validated"
                    : "Remediated Crypto Policy Active"}
                </span>
              </div>
            )}
          </div>

          <div className="text-[9px] text-[#777a88] pt-1 border-t border-[#1c1d22] flex justify-between">
            <span>TLS: {enforceTls13 ? "1.3" : "ALL"}</span>
            <span>PFS: {enforcePfs ? "ON" : "OFF"}</span>
            <span>AEAD: {enforceAead ? "ON" : "OFF"}</span>
            <span>PKI: {renewCerts ? "CA" : "SELF"}</span>
          </div>
        </div>

        {/* Wire 2: Hardened Core Pipe */}
        <div className="md:col-span-1 flex flex-col items-center justify-center relative py-2">
          <div className={`h-0.5 w-full ${
            isUpgraded ? "bg-[#34d399] shadow-[0_0_8px_#34d399]" : "bg-[#1c1d22]"
          }`} />
          <span className="text-[9px] text-[#777a88] mt-1 text-center">
            {isUpgraded ? "🔒 Protected" : "Open"}
          </span>
        </div>

        {/* Node 3: Hardened Mail Spool */}
        <div className="md:col-span-2 bg-[#121317] border border-[#2e3038] rounded-[8px] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#777a88] uppercase">MAIL CORE</span>
            <Server className="w-3.5 h-3.5 text-[#9194a1]" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">{serverIp}</div>
            <div className="text-[10px] text-[#9194a1]">Dovecot Spool</div>
          </div>
          <div className="text-[10px] pt-1 border-t border-[#1c1d22] flex items-center justify-between">
            <span className="text-[#777a88]">Status:</span>
            <span className={isConverged ? "text-[#34d399]" : "text-[#777a88]"}>
              {isConverged ? "ZERO LEAK" : "INSECURE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
