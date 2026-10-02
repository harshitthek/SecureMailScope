"use client";

import { Session, ProtocolStateStep } from "@/lib/types";

interface ProtocolTimelinePaneProps {
  session: Session;
  selectedStep: ProtocolStateStep | null;
  onSelectStep: (step: ProtocolStateStep) => void;
}

export function ProtocolTimelinePane({
  session,
  selectedStep,
  onSelectStep,
}: ProtocolTimelinePaneProps) {
  const steps = session.forensic_inspection?.state_timeline || [];

  return (
    <section className="flex-1 min-w-0 flex flex-col border-r border-tactical-border/70 overflow-y-auto bg-black/40 p-6 space-y-6 select-none font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-tactical-border/60">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-tactical-dim block">
            PROTOCOL TIMELINE
          </span>
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider mt-0.5">
            FLOW {session.session_id < 10 ? `0${session.session_id}` : session.session_id} · {session.protocol} :{session.dst_port}
          </h3>
        </div>
        <span className="text-xs text-tactical-dim">
          STATE MACHINE AUDIT
        </span>
      </div>

      {/* Vertical Event Sequence */}
      <div className="space-y-4 pl-4 relative before:absolute before:top-3 before:bottom-3 before:left-1 before:w-0.5 before:bg-tactical-borderHighlight">
        {steps.map((step) => {
          const isBreak =
            step.status === "downgrade" ||
            step.status === "compromised" ||
            step.phase.includes("BYPASS") ||
            step.phase.includes("STRIPPED");
          const isOk = step.status === "secure";
          const isCurrentSelected = selectedStep?.step === step.step;

          return (
            <div
              key={step.step}
              onClick={() => onSelectStep(step)}
              className="relative pl-6 group cursor-pointer"
            >
              {/* Event Marker */}
              <div
                className={`absolute left-0 top-3 -translate-x-1/2 w-4 h-4 border flex items-center justify-center text-[9px] font-bold ${
                  isBreak
                    ? "bg-phosphor-hazard border-black text-white"
                    : isOk
                    ? "bg-phosphor-green border-black text-black"
                    : "bg-tactical-borderHighlight border-black text-white"
                }`}
              >
                {isBreak ? "✕" : step.step}
              </div>

              {/* Event Content Card */}
              <div
                className={`p-3.5 border transition-all ${
                  isCurrentSelected
                    ? "border-phosphor-cyan bg-tactical-elevated shadow-[0_0_8px_rgba(0,216,246,0.15)]"
                    : isBreak
                    ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 hover:border-phosphor-hazard"
                    : isOk
                    ? "border-phosphor-green/40 bg-phosphor-green/5 hover:border-phosphor-green/60"
                    : "border-tactical-border/70 bg-tactical-surface/40 hover:border-tactical-borderHighlight"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-tactical-dim font-bold">
                      [{step.direction}]
                    </span>
                    <span
                      className={`font-sans font-bold uppercase tracking-wide ${
                        isBreak ? "text-phosphor-hazard" : "text-white"
                      }`}
                    >
                      {step.phase}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${
                      isBreak
                        ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/20"
                        : isOk
                        ? "border-phosphor-green text-phosphor-green bg-phosphor-green/20"
                        : "border-tactical-border text-tactical-dim"
                    }`}
                  >
                    {isBreak ? "VULNERABILITY DETECTED" : step.status}
                  </span>
                </div>

                <p className="text-xs text-tactical-text mt-1 leading-relaxed">
                  {step.summary}
                </p>

                {isBreak && (
                  <div className="mt-2 pt-2 border-t border-phosphor-hazard/30 text-[11px] text-phosphor-hazard flex items-center gap-1.5">
                    <span className="font-bold">✕ WIRE BREAK:</span>
                    <span>Expected TLS handshake negotiation was bypassed. Cleartext authentication observed.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
