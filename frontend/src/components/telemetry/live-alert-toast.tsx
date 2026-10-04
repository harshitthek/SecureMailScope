"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { TapAlert } from "@/hooks/useLiveTap";

interface LiveAlertToastProps {
  alert: TapAlert | null;
  onDismiss: () => void;
}

export function LiveAlertToast({ alert, onDismiss }: LiveAlertToastProps) {
  if (!alert) return null;

  const isCritical = alert.severity === "critical";

  return (
    <div
      role="alert"
      className={`w-full py-2 px-4 border-b flex items-center justify-between gap-3 text-xs font-mono transition-all animate-in slide-in-from-top-2 duration-200 ${
        isCritical
          ? "bg-rose-950/80 border-rose-600/50 text-rose-200"
          : "bg-amber-950/80 border-amber-600/50 text-amber-200"
      }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <AlertTriangle
          className={`w-4 h-4 shrink-0 ${
            isCritical ? "text-rose-400" : "text-amber-400"
          }`}
        />
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isCritical
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          }`}
        >
          {alert.mitre_id}
        </span>
        <span className="font-semibold text-white truncate">{alert.title}</span>
        <span className="text-muted-foreground hidden md:inline">·</span>
        <span className="text-muted-foreground truncate hidden md:inline">
          {alert.vector}: {alert.description}
        </span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors shrink-0"
        aria-label="Dismiss Alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
