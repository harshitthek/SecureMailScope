"use client";

import React from "react";
import { TapAlert } from "@/hooks/useLiveTap";
import { ShieldAlert, X, Trash2, ArrowUpRight, Flame } from "lucide-react";

interface WireThreatFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: TapAlert[];
  onClear: () => void;
}

export function WireThreatFeedDrawer({ isOpen, onClose, alerts, onClear }: WireThreatFeedDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm select-none font-sans" onClick={onClose}>
      <aside
        className="w-full max-w-md h-full bg-[#08080a] border-l border-[#1c1d22] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1c1d22] bg-[#0c0d10]">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block font-bold">
                TELEMETRY SENSOR FEED
              </span>
              <h2 className="text-sm font-mono font-bold text-white tracking-tight">
                IN-FLIGHT WIRE THREAT FEED
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 rounded text-[#9194a1] hover:text-white hover:bg-[#121317] border border-[#1c1d22]"
                title="Clear alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[#9194a1] hover:text-white hover:bg-[#121317] border border-[#1c1d22]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#777a88] font-mono text-xs">
              <ShieldAlert className="w-8 h-8 text-[#2e3038] mb-2" />
              <p>NO IN-FLIGHT THREAT EVENTS DETECTED.</p>
              <p className="text-[11px] text-[#555866] mt-1">
                Passive wire sniffer is actively listening for anomalous SMTP/IMAP/POP3 patterns.
              </p>
            </div>
          ) : (
            alerts.map((alert, idx) => {
              const isCrit = alert.severity === "critical";
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-sm border font-mono transition-all ${
                    isCrit ? "bg-rose-950/20 border-rose-900/50" : "bg-amber-950/20 border-amber-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isCrit ? "bg-rose-900/50 text-rose-300 border-rose-700" : "bg-amber-900/50 text-amber-300 border-amber-700"
                      }`}
                    >
                      {alert.mitre_id || "MITRE"}
                    </span>
                    <span className="text-[10px] text-[#777a88]">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : "--:--:--"}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1 font-sans">
                    {alert.title}
                  </h3>

                  <div className="text-[11px] text-[#cc9166] flex items-center gap-1 mb-1.5">
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">{alert.vector}</span>
                  </div>

                  <p className="text-xs text-[#9194a1] leading-relaxed font-sans">
                    {alert.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
