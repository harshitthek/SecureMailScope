"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import { DissectorModeA } from "@/components/dissector/dissector-mode-a";
import {
  Binary,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Lock,
} from "lucide-react";

interface DissectorViewProps {
  sessions: Session[];
  selectedStreamId: number | null;
  onSelectStream: (id: number) => void;
}

export function DissectorView({
  sessions,
  selectedStreamId,
  onSelectStream,
}: DissectorViewProps) {
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "CRYPTANALYSIS" | "RAW_STREAM">("TIMELINE");

  const currentStream =
    sessions.find((s) => s.session_id === selectedStreamId) || sessions[0] || null;

  if (!currentStream) {
    return (
      <div className="p-8 text-center text-xs text-tactical-dim font-mono">
        No active network streams available to dissect.
      </div>
    );
  }

  const isCritical = currentStream.session_score < 50 || currentStream.session_severity === "critical";

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1680px] mx-auto w-full select-none font-mono">
      {/* 1. Stream Selector Bar */}
      <div className="p-4 border border-tactical-border bg-tactical-surface space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Binary className="w-4 h-4 text-phosphor-cyan" />
              DEEP PROTOCOL DISSECTOR &amp; WIRE INSPECTOR
            </h2>
            <p className="text-xs text-tactical-dim font-mono mt-0.5">
              Select an email flow to inspect reassembled TCP streams, cryptographic handshakes, and wire frames
            </p>
          </div>
          <span className="text-[10px] text-tactical-dim font-bold">
            {sessions.length} ACTIVE FLOWS IN CAPTURE
          </span>
        </div>

        {/* Stream Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sessions.map((s) => {
            const isSelected = s.session_id === currentStream.session_id;
            const isCrit = s.session_score < 50 || s.session_severity === "critical";
            return (
              <button
                key={s.session_id}
                onClick={() => onSelectStream(s.session_id)}
                className={`px-3 py-1.5 border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? "border-phosphor-cyan bg-tactical-elevated text-white shadow-[0_0_8px_rgba(0,216,246,0.2)]"
                    : "border-tactical-border bg-black/40 text-tactical-dim hover:text-white hover:border-tactical-borderHighlight"
                }`}
              >
                <span>STREAM #{s.session_id}</span>
                <span className="text-[10px] px-1 py-0.2 border border-tactical-border bg-tactical-bg text-tactical-text">
                  {s.protocol}:{s.dst_port}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isCrit ? "text-phosphor-hazard" : "text-phosphor-green"
                  }`}
                >
                  {s.session_score} ({s.session_grade})
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stream Summary Banner */}
        <div className="p-3 border border-tactical-border bg-black/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 border flex items-center justify-center flex-shrink-0 ${
                isCritical
                  ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                  : "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
              }`}
            >
              {isCritical ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-white font-sans font-bold text-sm tracking-tight">
                {currentStream.server_name}
              </div>
              <div className="text-[11px] text-tactical-dim font-mono">
                {currentStream.src_ip}:{currentStream.src_port} &rarr; {currentStream.dst_ip}:{currentStream.dst_port} ({currentStream.protocol})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase text-tactical-dim block">Protocol Version</span>
              <span className="text-white font-bold">{currentStream.tls_version || "Plaintext"}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-tactical-dim block">Forward Secrecy</span>
              <span className={currentStream.has_forward_secrecy ? "text-phosphor-green font-bold" : "text-phosphor-hazard font-bold"}>
                {currentStream.has_forward_secrecy ? "ECDHE" : "NONE"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-tactical-dim block">Posture Score</span>
              <span className={`font-bold tabular-nums ${isCritical ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                {currentStream.session_score} ({currentStream.session_grade})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dissector Mode Tabs */}
      <div className="flex items-center border-b border-tactical-border bg-tactical-surface px-3">
        <button
          onClick={() => setActiveTab("TIMELINE")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TIMELINE"
              ? "border-phosphor-cyan text-white bg-tactical-elevated/40"
              : "border-transparent text-tactical-dim hover:text-white"
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>1. PROTOCOL STATE TIMELINE</span>
        </button>

        <button
          onClick={() => setActiveTab("CRYPTANALYSIS")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "CRYPTANALYSIS"
              ? "border-phosphor-cyan text-white bg-tactical-elevated/40"
              : "border-transparent text-tactical-dim hover:text-white"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>2. TLS RECORDS &amp; CRYPTANALYSIS</span>
        </button>

        <button
          onClick={() => setActiveTab("RAW_STREAM")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "RAW_STREAM"
              ? "border-phosphor-cyan text-white bg-tactical-elevated/40"
              : "border-transparent text-tactical-dim hover:text-white"
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>3. RAW WIRE STREAM (HEX / ASCII)</span>
        </button>
      </div>

      {/* 3. Mode View Body */}
      <div className="border border-tactical-border bg-tactical-surface p-4">
        {activeTab === "TIMELINE" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs">
              <span className="font-bold text-white uppercase">Reassembled Protocol State Machine Transitions</span>
              <span className="text-tactical-dim">FLOW #{currentStream.session_id}</span>
            </div>

            {/* Vertical Flow Diagram */}
            <div className="space-y-3 relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-tactical-border">
              {currentStream.forensic_inspection?.state_timeline &&
              currentStream.forensic_inspection.state_timeline.length > 0 ? (
                currentStream.forensic_inspection.state_timeline.map((step) => {
                  const isDowngrade = step.status === "downgrade" || step.status === "compromised";
                  const isSecure = step.status === "secure";
                  return (
                    <div key={step.step} className="relative group">
                      <div
                        className={`absolute -left-6 top-2 w-3.5 h-3.5 border-2 ${
                          isDowngrade
                            ? "bg-phosphor-hazard border-black"
                            : isSecure
                            ? "bg-phosphor-green border-black"
                            : "bg-tactical-borderHighlight border-black"
                        }`}
                      />
                      <div
                        className={`border p-3.5 ${
                          isDowngrade
                            ? "border-phosphor-hazard/60 bg-phosphor-hazard/10"
                            : isSecure
                            ? "border-phosphor-green/40 bg-phosphor-green/5"
                            : "border-tactical-border bg-black/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[10px] px-1.5 py-0.2 border border-tactical-border bg-tactical-elevated text-tactical-dim">
                              STEP {step.step}
                            </span>
                            <span className="font-bold text-white tracking-wide">{step.phase}</span>
                            <span className="text-[10px] text-tactical-dim">[{step.direction}]</span>
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.2 border ${
                              isDowngrade
                                ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/20"
                                : isSecure
                                ? "border-phosphor-green text-phosphor-green bg-phosphor-green/20"
                                : "border-tactical-border text-tactical-dim"
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                        <p className="text-xs text-tactical-text mt-1">{step.summary}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-tactical-dim py-4">
                  Standard TCP handshake completed. Reassembled stream payload contains {currentStream.protocol} exchange.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "CRYPTANALYSIS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs">
              <span className="font-bold text-white uppercase">X.509 Certs, JA3 Fingerprints &amp; Scoring Ledger</span>
              <span className="text-tactical-dim">FLOW #{currentStream.session_id}</span>
            </div>
            <DissectorModeA session={currentStream} />
          </div>
        )}

        {activeTab === "RAW_STREAM" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs">
              <span className="font-bold text-white uppercase">Wire Stream Hex &amp; ASCII Inspection</span>
              <span className="text-tactical-dim">RECORD LAYER BYTE BOUNDARIES</span>
            </div>
            {currentStream.forensic_inspection?.raw_chunks &&
            currentStream.forensic_inspection.raw_chunks.length > 0 ? (
              <div className="space-y-2 overflow-x-auto">
                {currentStream.forensic_inspection.raw_chunks.map((chunk, idx) => {
                  const isHazard = chunk.highlight_type === "danger";
                  const isSecure = chunk.highlight_type === "secure";
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 border font-mono text-xs ${
                        isHazard
                          ? "border-phosphor-hazard/50 bg-phosphor-hazard/10"
                          : isSecure
                          ? "border-phosphor-green/40 bg-phosphor-green/5"
                          : "border-tactical-border bg-black/40"
                      }`}
                    >
                      {chunk.highlight_label && (
                        <div
                          className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            isHazard ? "text-phosphor-hazard" : isSecure ? "text-phosphor-green" : "text-phosphor-cyan"
                          }`}
                        >
                          &gt;&gt;&gt; {chunk.highlight_label}
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <span className="text-phosphor-cyan text-[11px] font-bold select-none">{chunk.offset}</span>
                        <span className="text-white text-xs select-all flex-1 tracking-wider">{chunk.hex}</span>
                        <span className="text-tactical-dim text-xs select-all font-mono border-l border-tactical-border pl-3">
                          {chunk.ascii}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-tactical-dim py-4">
                No raw packet hex captured for this stream.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
