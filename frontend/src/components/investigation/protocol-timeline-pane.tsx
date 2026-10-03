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
    <section className="flex-1 min-w-0 flex flex-col border-r border-tactical-border/70 overflow-hidden bg-tactical-bg select-none font-mono text-[14px]">
      {/* Pane Header */}
      <div className="px-6 py-3 border-b border-tactical-border/70 bg-tactical-surface/70 flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[12px] uppercase tracking-widest text-tactical-dim font-bold block">
            PROTOCOL WIRE TIMELINE
          </span>
          <h3 className="text-[15px] sm:text-[16px] font-sans font-bold text-tactical-text uppercase tracking-wider mt-0.5">
            FLOW #{session.session_id < 10 ? `0${session.session_id}` : session.session_id} · {session.protocol} :{session.dst_port} STATE TRANSITIONS
          </h3>
        </div>
        <span className="text-[13px] text-tactical-dim font-bold">
          {steps.length} EVENTS RECORDED
        </span>
      </div>

      {/* High-Density Linear State Transitions (Wireshark/DevTools Style) */}
      <div className="flex-1 overflow-y-auto divide-y divide-tactical-border/40 p-4 space-y-2.5">
        {steps.map((step) => {
          const isBreak =
            step.status === "downgrade" ||
            step.status === "compromised" ||
            step.phase.includes("BYPASS") ||
            step.phase.includes("STRIPPED");
          const isOk = step.status === "secure";
          const isCurrentSelected = selectedStep?.step === step.step;
          const dirArrow = step.direction === "C->S" ? "→" : "←";

          return (
            <div
              key={step.step}
              onClick={() => onSelectStep(step)}
              className={`p-3.5 transition-colors cursor-pointer border-l-2 ${
                isCurrentSelected
                  ? "border-phosphor-cyan bg-tactical-elevated text-tactical-text shadow-[inset_2px_0_6px_rgba(0,216,246,0.15)]"
                  : isBreak
                  ? "border-phosphor-hazard bg-phosphor-hazard/10 hover:bg-phosphor-hazard/15"
                  : "border-transparent bg-tactical-surface/30 hover:bg-tactical-surfaceHover"
              }`}
            >
              {/* Event Header Row */}
              <div className="flex items-center justify-between text-[13px] mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-none flex items-center justify-center text-[11px] font-bold ${
                      isBreak
                        ? "bg-phosphor-hazard text-black font-black"
                        : isOk
                        ? "bg-phosphor-green text-black font-bold"
                        : "bg-tactical-border text-tactical-dim font-bold"
                    }`}
                  >
                    {isBreak ? "✕" : step.step}
                  </span>

                  <span className="text-tactical-dim text-[12px] font-bold">
                    {dirArrow} [{step.direction}]
                  </span>

                  <span
                    className={`font-sans font-bold uppercase tracking-wide text-[14px] ${
                      isBreak ? "text-phosphor-hazard" : "text-tactical-text"
                    }`}
                  >
                    {step.phase}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] text-tactical-dim">
                    {step.packet_offset || "0x0000"}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 border ${
                      isBreak
                        ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/20"
                        : isOk
                        ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        : "border-tactical-border text-tactical-dim"
                    }`}
                  >
                    {isBreak ? "THREAT" : step.status}
                  </span>
                </div>
              </div>

              {/* Wire Summary */}
              <p className="text-[13px] text-tactical-text pl-7.5 leading-relaxed font-mono">
                {step.summary}
              </p>

              {/* Threat Narrative if Downgrade */}
              {isBreak && (
                <div className="mt-2 ml-7.5 p-2.5 bg-tactical-surface border-l-2 border-phosphor-hazard text-[12px] text-phosphor-hazard">
                  <span className="font-bold">FORENSIC ALERT:</span> Wire transition omitted mandatory TLS handshake. Plaintext payload exposed.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
