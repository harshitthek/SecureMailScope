"use client";

import React from "react";
import { Activity, Radio } from "lucide-react";
import { TapState } from "@/hooks/useLiveTap";

interface TapStatusBadgeProps {
  tapState: TapState;
  isConnected: boolean;
}

export function TapStatusBadge({ tapState, isConnected }: TapStatusBadgeProps) {
  const isLive = tapState.state === "SNIFFING";
  const isReplay = tapState.state === "REPLAYING";

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-card/60 text-xs font-mono select-none shrink-0">
      <div className="flex items-center gap-1.5">
        <Radio
          className={`w-3.5 h-3.5 ${
            isLive
              ? "text-emerald-500 animate-pulse"
              : isReplay
              ? "text-amber-500 animate-pulse"
              : isConnected
              ? "text-muted-foreground"
              : "text-rose-500"
          }`}
        />
        <span className="font-semibold text-foreground text-[11px] tracking-tight">
          SENSOR: TAP-01
        </span>
      </div>

      <span className="text-muted-foreground">·</span>

      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          isLive
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
            : isReplay
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {tapState.state}
      </span>

      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Activity className="w-3 h-3 text-sky-400" />
        <span className="tabular-nums font-semibold text-foreground">
          {tapState.pps.toFixed(1)}
        </span>
        <span className="text-[10px]">PPS</span>
      </div>

      <span className="text-muted-foreground">·</span>

      <span className="text-[11px] text-muted-foreground tabular-nums">
        {tapState.buffer_count}/{tapState.buffer_capacity} PKTS
      </span>
    </div>
  );
}
