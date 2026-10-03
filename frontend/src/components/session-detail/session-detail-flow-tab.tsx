"use client";

import { Session } from "@/lib/types";

interface SessionDetailFlowTabProps {
  session: Session;
}

export function SessionDetailFlowTab({ session }: SessionDetailFlowTabProps) {
  const inspection = session.forensic_inspection;

  return (
    <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs">
        <span className="font-bold text-tactical-text uppercase">RECONSTRUCTED PROTOCOL STATE MACHINE</span>
        <span className="text-tactical-dim">SEQUENTIAL FORENSIC TIMELINE</span>
      </div>

      {/* Vertical State Timeline */}
      <div className="space-y-3 relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-tactical-border">
        {inspection?.state_timeline && inspection.state_timeline.length > 0 ? (
          inspection.state_timeline.map((step) => {
            const isDowngrade = step.status === "downgrade" || step.status === "compromised";
            const isSecure = step.status === "secure";
            return (
              <div key={step.step} className="relative group">
                <div
                  className={`absolute -left-6 top-2 w-3.5 h-3.5 border-2 ${
                    isDowngrade
                      ? "bg-phosphor-hazard border-tactical-border"
                      : isSecure
                      ? "bg-phosphor-green border-tactical-border"
                      : "bg-tactical-borderHighlight border-tactical-border"
                  }`}
                />
                <div
                  className={`border p-3.5 ${
                    isDowngrade
                      ? "border-phosphor-hazard/60 bg-phosphor-hazard/10"
                      : isSecure
                      ? "border-phosphor-green/40 bg-phosphor-green/5"
                      : "border-tactical-border bg-tactical-surface"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] px-1.5 py-0.2 border border-tactical-border bg-tactical-elevated text-tactical-dim">
                        STEP {step.step}
                      </span>
                      <span className="font-bold text-tactical-text tracking-wide">{step.phase}</span>
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
            Standard TCP handshake completed. Reconstructed stream payload contains {session.protocol} exchange.
          </div>
        )}
      </div>
    </div>
  );
}
