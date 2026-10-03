"use client";

import React from "react";
import { 
  Activity, 
  LayoutDashboard, 
  Layers, 
  ShieldAlert, 
  Award, 
  Binary, 
  CheckSquare, 
  FileSpreadsheet 
} from "lucide-react";

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

const TABS: { 
  id: ShellNavTab; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  badge?: (flows: number, findings: number) => number | null 
}[] = [
  { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
  { id: "FLOWS", label: "Flows", icon: Layers, badge: (flows) => flows },
  { id: "FINDINGS", label: "Findings", icon: ShieldAlert, badge: (_, findings) => findings },
  { id: "CERTIFICATES", label: "Certificates", icon: Award },
  { id: "DISSECTOR", label: "Dissector", icon: Binary },
  { id: "STANDARDS", label: "Standards", icon: CheckSquare },
  { id: "REPORT", label: "Audit Report", icon: FileSpreadsheet },
];

export function NavStrip({
  activeTab,
  onSelectTab,
  flowCount,
  findingCount,
}: NavStripProps) {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 my-2">
      <div className="bg-sms-surface-primary border border-sms-border rounded-xl px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm select-none">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1" aria-label="Forensic Workstation Views">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.badge ? tab.badge(flowCount, findingCount) : null;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`h-9 px-3.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border dark:border-sky-500/30 shadow-sm"
                    : "text-sms-text-secondary hover:text-sms-text-primary hover:bg-sms-surface-hover"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400 dark:text-sky-300" : "text-sms-text-muted"}`} />
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-mono-tech rounded-md font-bold ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-sky-400/20 dark:text-sky-200"
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

        {/* Live Sensor Telemetry */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono-tech text-sms-text-muted shrink-0">
          <div className="flex items-center gap-2 bg-sms-surface-secondary px-3 py-1.5 rounded-lg border border-sms-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sms-text-secondary font-semibold">TAP-01 MIRROR READY</span>
            <span className="text-sms-border-strong">|</span>
            <Activity className="w-3.5 h-3.5 text-sky-500" strokeWidth={2} />
            <span>0 PACKET LOSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
