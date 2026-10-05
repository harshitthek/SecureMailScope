"use client";

import React, { useState } from "react";
import { Play, Square, FastForward, Camera, Loader2, Radio, Flame } from "lucide-react";
import { TapState } from "@/hooks/useLiveTap";
import { TapStatusBadge } from "./tap-status-badge";
import { startTapCapture, stopTapCapture, startTapReplay, snapshotTapBuffer, getAnalysis } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";

interface TapStatusBarProps {
  tapState: TapState;
  isConnected: boolean;
  threatCount?: number;
  onOpenSiem?: () => void;
  onOpenThreats?: () => void;
  onSnapshotSuccess: (analysis: AnalysisResult) => void;
  onToast: (msg: string, type?: "info" | "success" | "warning") => void;
  onReplaySuccess?: (analysis: AnalysisResult, caseCode: string) => void;
}

export function TapStatusBar({
  tapState,
  isConnected,
  threatCount,
  onOpenSiem,
  onOpenThreats,
  onSnapshotSuccess,
  onToast,
  onReplaySuccess,
}: TapStatusBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isActive = tapState.state === "SNIFFING" || tapState.state === "REPLAYING";

  const handleToggleTap = async () => {
    setIsProcessing(true);
    try {
      if (isActive) {
        await stopTapCapture();
        onToast("Passive network TAP sniffer stopped.", "info");
      } else {
        await startTapCapture();
        onToast("Live passive network TAP capture engaged.", "success");
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : "TAP failed", "warning");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplaySimulated = async () => {
    setIsProcessing(true);
    try {
      const data = await startTapReplay("02_striptls_mitm_attack.pcap", 12.0);
      onToast("Demo AiTM STRIPTLS attack engaged! Replaying attack packets on port 587...", "warning");
      if (data?.analysis && onReplaySuccess) {
        onReplaySuccess(data.analysis, data.case_code || "CASE-02");
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Replay failed", "warning");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnapshot = async () => {
    if (tapState.buffer_count === 0) {
      onToast("Packet buffer is empty. Capture packets first.", "warning");
      return;
    }
    setIsProcessing(true);
    try {
      const snap = await snapshotTapBuffer("Live Wire Snapshot");
      if (snap?.success && snap?.run_id) {
        const fullAnalysis = await getAnalysis(snap.run_id);
        onSnapshotSuccess(fullAnalysis);
        onToast(`Snapshot analyzed! Score: ${snap.overall_score}/100 (${snap.overall_grade})`, "success");
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Snapshot failed", "warning");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-card/40 border-b border-border px-4 lg:px-6 py-2 flex items-center justify-between gap-3 text-xs select-none overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-3 shrink-0">
        <TapStatusBadge tapState={tapState} isConnected={isConnected} />
        <span className="text-muted-foreground hidden xl:inline font-mono text-[11px]" title="tcp and (port 25 or 587 or 465 or 993 or 110)">
          BPF: <span className="hidden 2xl:inline">tcp and (port 25 or 587 or 465 or 993 or 110)</span><span className="2xl:hidden">mail ports</span>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleToggleTap}
          disabled={isProcessing}
          className={`h-7 px-3 rounded-full font-mono text-[11px] font-medium flex items-center gap-1.5 transition-colors border ${
            isActive ? "bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
          }`}
        >
          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : isActive ? <Square className="w-3 h-3 fill-rose-300" /> : <Play className="w-3 h-3 fill-emerald-300" />}
          <span>{isActive ? "STOP TAP" : "START TAP"}</span>
        </button>

        <button
          type="button"
          onClick={handleReplaySimulated}
          disabled={isProcessing || isActive}
          className="h-7 px-3 rounded-full border border-border hover:border-amber-500/50 bg-secondary/60 hover:bg-secondary text-foreground font-mono text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <FastForward className="w-3 h-3 text-amber-400" />
          <span>REPLAY ATTACK</span>
        </button>

        <button
          type="button"
          onClick={handleSnapshot}
          disabled={isProcessing || tapState.buffer_count === 0}
          className="h-7 px-3 rounded-full border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 font-mono text-[11px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Camera className="w-3 h-3 text-sky-400" />
          <span>SNAPSHOT ({tapState.buffer_count})</span>
        </button>

        {onOpenSiem && (
          <button type="button" onClick={onOpenSiem} className="h-7 px-2.5 rounded-full border border-[#2e3038] hover:border-[#cc9166]/50 bg-[#121317] hover:bg-[#1a1c22] text-[#e2e3e9] font-mono text-[11px] flex items-center gap-1.5 transition-colors">
            <Radio className="w-3 h-3 text-[#cc9166]" />
            <span>SIEM :514</span>
          </button>
        )}

        {onOpenThreats && (
          <button type="button" onClick={onOpenThreats} className={`h-7 px-2.5 rounded-full font-mono text-[11px] flex items-center gap-1.5 transition-colors border ${
            (threatCount ?? 0) > 0 ? "bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25" : "bg-[#121317] text-[#9194a1] border-[#2e3038] hover:text-white"
          }`}>
            <Flame className="w-3 h-3 text-rose-400" />
            <span>THREATS ({threatCount ?? 0})</span>
          </button>
        )}
      </div>
    </div>
  );
}
