"use client";

import React from "react";
import { Activity } from "lucide-react";

export type ShellNavTab =
  | "OVERVIEW"
  | "FLOWS"
  | "FINDINGS"
  | "CERTIFICATES"
  | "DISSECTOR"
  | "STANDARDS"
  | "REPORT";

interface NavStripProps {
  activeTab: ShellNavTab;
  onSelectTab: (tab: ShellNavTab) => void;
  flowCount: number;
  findingCount: number;
}

const TABS: { id: ShellNavTab; label: string; badge?: (flows: number, findings: number) => number | null }[] = [
  { id: "OVERVIEW", label: "OVERVIEW" },
  { id: "FLOWS", label: "FLOWS", badge: (flows) => flows },
  { id: "FINDINGS", label: "FINDINGS", badge: (_, findings) => findings },
  { id: "CERTIFICATES", label: "CERTIFICATES" },
  { id: "DISSECTOR", label: "DISSECTOR" },
  { id: "STANDARDS", label: "STANDARDS" },
  { id: "REPORT", label: "REPORT" },
];

export function NavStrip({
  activeTab,
  onSelectTab,
  flowCount,
  findingCount,
}: NavStripProps) {
  return (
    <div className="h-[40px] border-b border-sms-border bg-sms-surface-primary/70 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 select-none">
      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 h-full" aria-label="Forensic Workstation Views">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.badge ? tab.badge(flowCount, findingCount) : null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`h-full px-3.5 flex items-center gap-2 text-ui transition-fast relative border-b-2 ${
                isActive
                  ? "border-sms-cyan text-sms-text-primary dark:text-sms-cyan font-semibold"
                  : "border-transparent text-sms-text-secondary hover:text-sms-text-primary hover:bg-sms-surface-hover"
              }`}
            >
              <span>{tab.label}</span>
              {count !== null && count > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[11px] font-mono-tech rounded-tag font-semibold ${
                    isActive
                      ? "bg-sms-cyan-dim text-sms-cyan"
                      : "bg-sms-surface-secondary text-sms-text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Live Sensor Telemetry */}
      <div className="flex items-center gap-3 text-meta font-mono-tech text-sms-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sms-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sms-green" />
          </span>
          <span className="text-sms-text-secondary">TAP-01 ONLINE</span>
        </div>
        <span className="text-sms-border-strong">/</span>
        <div className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-sms-cyan" strokeWidth={1.5} />
          <span>PASSIVE BUFFER READY</span>
        </div>
      </div>
    </div>
  );
}
