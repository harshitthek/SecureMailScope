"use client";

import React, { useState } from "react";
import { Cpu, Activity } from "lucide-react";

const PILLARS = [
  {
    id: "tap",
    title: "Zero-Latency Optical Tapping",
    desc: "Passive hardware taps mirror raw network frames at line rate. Zero inline latency is introduced, and production mail delivery is never interrupted.",
    metric: "0.0ms Inline Latency",
  },
  {
    id: "airgap",
    title: "Air-Gapped In-Memory Cryptanalysis",
    desc: "Complete TCP stream reassembly, cipher auditing, and X.509 certificate parsing execute strictly within local system memory with zero external cloud egress.",
    metric: "100% Air-Gapped",
  },
  {
    id: "nist",
    title: "Deterministic NIST SP 800-52r2 Scoring",
    desc: "Mathematical penalty scoring strictly evaluates wire compliance against federal baselines, immediately flagging SSL 3.0, CBC mode ciphers, and weak RSA keys.",
    metric: "Automated Audit",
  },
  {
    id: "dossier",
    title: "Tamper-Evident Forensic Dossiers",
    desc: "Generates verifiable evidence dossiers and machine-readable JSON artifacts containing packet-level wire transitions and JA3 hashes for legal forensic archival.",
    metric: "Official SIH26159",
  },
];

export function SecurityTopology() {
  const [activePillar, setActivePillar] = useState<string>("tap");

  return (
    <section className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 sm:p-8 select-none font-sans my-4">
      {/* Section Header */}
      <div className="pb-6 border-b border-[#1c1d22]">
        <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block font-sans">
          Security Topology &amp; Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-white tracking-[0.01em] mt-1">
          Passive Forensics by Design
        </h2>
        <p className="text-sm text-[#9194a1] mt-1.5 max-w-2xl leading-relaxed">
          Bank on uncompromising intelligence: passive optical TAP mirroring captures email protocol streams at line rate without inline latency, certificate MITM, or mail routing disruption.
        </p>
      </div>

      {/* Split Content: Node Diagram Left, Pillars Right (Video Frame 00:16 Archetype) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* LEFT: Node Topology Diagram */}
        <div className="lg:col-span-6 bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
          {/* Top Sensor Node */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121317] border border-[#2e3038] flex items-center justify-center text-[#cc9166]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-medium text-white block">
                  NTRO SENSOR TAP-01
                </span>
                <span className="text-[10px] font-mono text-[#10b981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                  MIRRORING ACTIVE // LINE-RATE
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-[#121317] text-[#cc9166] border border-[#cc9166]/30 text-[10px] font-mono">
              BPF INGESTION
            </span>
          </div>

          {/* SVG Connecting Flow Lines */}
          <div className="my-4 relative">
            <svg viewBox="0 0 360 120" className="w-full h-24" preserveAspectRatio="none">
              {/* Central vertical trunk */}
              <line x1="180" y1="0" x2="180" y2="40" stroke="#2e3038" strokeWidth="1.5" />
              {/* Horizontal distribution bar */}
              <line x1="45" y1="40" x2="315" y2="40" stroke="#2e3038" strokeWidth="1.5" />
              {/* Dropdown branches */}
              <line x1="45" y1="40" x2="45" y2="100" stroke="#cc9166" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="135" y1="40" x2="135" y2="100" stroke="#10b981" strokeWidth="1.5" />
              <line x1="225" y1="40" x2="225" y2="100" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="315" y1="40" x2="315" y2="100" stroke="#c084fc" strokeWidth="1.5" />
            </svg>

            {/* 4 Inspection Target Nodes */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-[8px] bg-[#121317] border border-[#1c1d22]">
                <span className="text-[10px] text-[#cc9166] font-medium block">SMTP :587</span>
                <span className="text-[9px] text-[#9194a1] block mt-0.5">StripTLS</span>
              </div>

              <div className="p-2 rounded-[8px] bg-[#121317] border border-[#1c1d22]">
                <span className="text-[10px] text-[#10b981] font-medium block">SMTPS :465</span>
                <span className="text-[9px] text-[#9194a1] block mt-0.5">TLS 1.3 AEAD</span>
              </div>

              <div className="p-2 rounded-[8px] bg-[#121317] border border-[#1c1d22]">
                <span className="text-[10px] text-[#38bdf8] font-medium block">IMAPS :993</span>
                <span className="text-[9px] text-[#9194a1] block mt-0.5">X.509 Chain</span>
              </div>

              <div className="p-2 rounded-[8px] bg-[#121317] border border-[#1c1d22]">
                <span className="text-[10px] text-[#c084fc] font-medium block">DOSSIER</span>
                <span className="text-[9px] text-[#9194a1] block mt-0.5">Air-Gapped</span>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Status Pill */}
          <div className="pt-3 border-t border-[#1c1d22] flex items-center justify-between text-[11px] font-mono text-[#9194a1]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#cc9166]" />
              <span>Full TCP Reassembly</span>
            </span>
            <span className="text-white font-medium">ZERO CLOUD EXFILTRATION</span>
          </div>
        </div>

        {/* RIGHT: Defense Pillars List (Video Frame 00:16 Interactive Pillar Pattern) */}
        <div className="lg:col-span-6 space-y-3">
          {PILLARS.map((p) => {
            const isSelected = activePillar === p.id;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                aria-pressed={isSelected}
                className={`w-full text-left p-4 rounded-[10px] border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#08080a] border-[#cc9166]/50"
                    : "bg-[#08080a]/50 border-[#1c1d22] hover:border-[#2e3038]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white font-sans flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cc9166]" />
                    {p.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121317] text-[#9194a1] border border-[#1c1d22]">
                    {p.metric}
                  </span>
                </div>
                <p className="text-xs text-[#9194a1] leading-relaxed mt-2 pl-3.5">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
