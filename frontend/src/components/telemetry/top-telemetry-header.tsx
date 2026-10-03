"use client";

import { Activity, Shield } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { ExportButtons } from "@/components/export-button";

interface TopTelemetryHeaderProps {
  activeCase: EvidenceCase;
  bufferPercent?: number;
}

export function TopTelemetryHeader({ activeCase, bufferPercent = 74 }: TopTelemetryHeaderProps) {
  const { packet_count, stream_count, data } = activeCase;

  return (
    <header className="w-full border-b border-tactical-border bg-tactical-surface text-tactical-text font-mono">
      {/* Classification Ribbon */}
      <div className="w-full border-b border-tactical-border/70 bg-tactical-surface px-4 py-0.5 flex items-center justify-between text-[10px] tracking-widest text-tactical-dim uppercase">
        <div className="flex items-center gap-2">
          <span className="text-phosphor-hazard font-bold">NTRO RESTRICTED</span>
          <span>{"//"}</span>
          <span>NATIONAL TECHNICAL RESEARCH ORGANISATION</span>
          <span>{"//"}</span>
          <span>SIH26159</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>FORENSIC PROTOCOL DISSECTOR</span>
          <span>{"//"}</span>
          <span className="text-phosphor-green">SYSTEM STATUS: NOMINAL</span>
        </div>
      </div>

      {/* Main Console Top Bar */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Sensor & Agency ID */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-phosphor-green/40 bg-phosphor-green/10 flex items-center justify-center text-phosphor-green">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="text-tactical-text font-bold">NTRO SECUREMAILSCOPE</span>
              <span className="text-tactical-muted">{"//"}</span>
              <span className="text-phosphor-green flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-none bg-phosphor-green animate-pulse" />
                SENSOR: TAP-01 (ACTIVE)
              </span>
            </div>
            <div className="text-[11px] text-tactical-dim flex items-center gap-2 mt-0.5">
              <span>TARGET: <span className="text-tactical-text">{activeCase.target_host}</span></span>
              <span>•</span>
              <span>CAPTURED: <span className="text-tactical-text">{data.analyzed_at.slice(0, 19)}</span></span>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="flex items-center gap-4 text-xs">
          {/* Buffer Ring Meter */}
          <div className="hidden md:flex flex-col items-end border-l border-tactical-border/80 pl-3">
            <span className="text-[9px] uppercase tracking-wider text-tactical-dim">Packet Ring Buffer</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-24 h-2 border border-tactical-border bg-tactical-elevated">
                <div
                  className="h-full bg-phosphor-cyan transition-all"
                  style={{ width: `${bufferPercent}%` }}
                />
              </div>
              <span className="text-[10px] tabular-nums font-bold text-tactical-text">{bufferPercent}%</span>
            </div>
          </div>

          {/* Stream & Packet Counter */}
          <div className="flex items-center gap-3 border-l border-tactical-border/80 pl-3">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-tactical-dim block">Streams</span>
              <span className="text-xs font-bold text-phosphor-green tabular-nums">{stream_count} Active</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-tactical-dim block">Packets</span>
              <span className="text-xs font-bold text-tactical-text tabular-nums">{packet_count} Pkts</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-tactical-dim block">Dissect Latency</span>
              <span className="text-xs font-bold text-phosphor-amber tabular-nums flex items-center gap-1">
                <Activity className="w-3 h-3 text-phosphor-amber inline" />
                {data.processing_time_ms}ms
              </span>
            </div>
          </div>

          {/* Export Actions */}
          <div className="hidden sm:block border-l border-tactical-border/80 pl-3">
            <ExportButtons analysisId={data.analysis_id || "mock-001"} data={data} />
          </div>
        </div>
      </div>
    </header>
  );
}
