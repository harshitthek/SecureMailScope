"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface PostureHeroProps {
  activeCase: EvidenceCase;
  onInspectFlow: (flowId: number) => void;
}

export function PostureHero({ activeCase, onInspectFlow }: PostureHeroProps) {
  const isFail = activeCase.posture_grade === "F" || activeCase.posture_score < 50;
  const score = activeCase.posture_score;
  const degradedFlowsCount = activeCase.data.sessions.filter(
    (s) => s.session_score < 70 || !s.is_encrypted || s.starttls_stripped
  ).length;

  const isCase02 = activeCase.case_code === "CASE-02";
  const isCase03 = activeCase.case_code === "CASE-03";
  const isCase01 = activeCase.case_code === "CASE-01";

  let primaryFindingTitle = "STARTTLS Downgrade Detected";
  let affectedVector = "Flow 03 · SMTP :587";
  let endpoints = "192.168.1.102:49300 → 10.0.0.15:587";
  let evidenceDetail = "Cleartext 250-STARTTLS capability stripped by intermediate proxy. Session transmitted unencrypted.";
  let targetFlowId = 3;

  if (isCase02) {
    primaryFindingTitle = "StripTLS MITM Attack Detected";
    affectedVector = "Flow 01 · SMTP :587";
    endpoints = "192.168.10.45:54120 → 198.51.100.25:587";
    evidenceDetail = "STARTTLS verb suppressed from server response. Cleartext AUTH PLAIN credentials captured on wire.";
    targetFlowId = 1;
  } else if (isCase03) {
    primaryFindingTitle = "Obsolete TLS 1.0 & 3DES Detected";
    affectedVector = "Flow 01 · SMTP :25";
    endpoints = "192.168.1.101:49200 → 10.0.1.20:25";
    evidenceDetail = "Sweet32 vulnerable 3DES-CBC cipher negotiated with expired RSA-1024 certificate.";
    targetFlowId = 1;
  } else if (isCase01) {
    primaryFindingTitle = "Cryptographic Baseline Hardened";
    affectedVector = "Flow 01 · SMTPS :465";
    endpoints = "10.14.20.101:52410 → 10.0.1.25:465";
    evidenceDetail = "TLS 1.3 negotiated with AES-256-GCM AEAD and ephemeral ECDHE forward secrecy.";
    targetFlowId = 1;
  }

  // Generate SVG points for the gilded chart line based on sessions
  const sessions = activeCase.data.sessions;
  const chartPoints = sessions.map((s, idx) => {
    const x = 30 + (idx / Math.max(1, sessions.length - 1)) * 340;
    const y = 140 - (s.session_score / 100) * 110;
    return `${x},${y}`;
  });
  const pathD = chartPoints.length > 0 ? `M ${chartPoints.join(" L ")}` : "M 30,100 L 370,100";
  const areaD = chartPoints.length > 0
    ? `M 30,140 L ${chartPoints.join(" L ")} L 370,140 Z`
    : "M 30,140 L 370,140 Z";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none font-sans pt-2">
      {/* ----------------------------------------------------
          LEFT COLUMN: DIDONE HEADLINE & FORENSIC EVIDENCE (7 COLS)
          ---------------------------------------------------- */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
        <div>
          {/* Category Eyebrow in Copper */}
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block mb-3 font-sans">
            Forensic Integrity Assessment
          </span>

          {/* High-Contrast Display Headline in Didone Serif */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-normal text-white leading-[1.13] tracking-[0.01em]">
            {primaryFindingTitle}
          </h1>

          {/* Editorial Body Copy (16px Inter, 1.5 line height, Bone #e2e3e9) */}
          <p className="text-base text-[#e2e3e9] leading-[1.5] mt-4 max-w-xl">
            {evidenceDetail} Passive traffic inspection validated against NIST SP 800-52r2 and IETF RFC 8314 requirements.
          </p>

          {/* Wire Vector Callout Box */}
          <div className="mt-6 p-4 rounded-[10px] bg-[#040406] border border-[#1c1d22] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-white">
                  {affectedVector}
                </span>
                <span className="text-[#5e616e]">·</span>
                <span className="text-xs font-mono text-[#9194a1]">
                  {endpoints}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#9194a1] block">
                Wire Transition Vector: {activeCase.data.filename}
              </span>
            </div>

            {/* Ghost Outline Button (Slash Secondary Action) */}
            <button
              type="button"
              onClick={() => onInspectFlow(targetFlowId)}
              className="h-9 px-4 rounded-full border border-white hover:bg-white/10 text-white font-sans text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto"
            >
              <span>Inspect Wire Vector</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#cc9166]" />
            </button>
          </div>
        </div>

        {/* Stat Proof Points (28–32px Didone Serif Numerals with 13px Inter Caption) */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1c1d22]">
          <div>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-[0.01em] block">
              {activeCase.data.total_packets.toLocaleString()}
            </span>
            <span className="text-[13px] text-[#9194a1] mt-0.5 block font-sans">
              Packets Ingested
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-[0.01em] block">
              {activeCase.data.total_sessions}
            </span>
            <span className="text-[13px] text-[#9194a1] mt-0.5 block font-sans">
              Reconstructed Flows
            </span>
          </div>

          <div>
            <span className={`text-2xl sm:text-3xl font-serif font-normal tracking-[0.01em] block ${isFail ? "text-[#f87171]" : "text-[#10b981]"}`}>
              {degradedFlowsCount}
            </span>
            <span className="text-[13px] text-[#9194a1] mt-0.5 block font-sans">
              Degraded Vectors
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          RIGHT COLUMN: HERO CHART CARD (5 COLS)
          ---------------------------------------------------- */}
      <div className="lg:col-span-5 bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 flex flex-col justify-between">
        <div>
          {/* Balance/Score Header & Filter Pill */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1d22]">
            <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase">
              Posture Proof Point
            </span>

            <span className="px-3 py-0.5 rounded-full font-mono text-xs text-[#e2e3e9] bg-[#121317] border border-[#2e3038]">
              {activeCase.case_code}
            </span>
          </div>

          {/* Large Numerical Proof Point in 88px Didone Serif */}
          <div className="flex items-baseline justify-between mt-4">
            <div className="flex items-baseline">
              <span className="text-[72px] sm:text-[84px] font-serif font-normal text-white tracking-[0.01em] leading-none">
                {score}
              </span>
              <span className="text-2xl font-serif text-[#9194a1] ml-2">
                /100
              </span>
            </div>

            {/* Status Pill Badge */}
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-semibold uppercase tracking-wider ${
                isFail
                  ? "bg-[#7f1d1d]/20 text-[#f87171] border border-[#f87171]/40"
                  : "bg-[#064e3b]/20 text-[#10b981] border border-[#10b981]/40"
              }`}
            >
              GRADE {activeCase.posture_grade}
            </span>
          </div>

          <span className="text-xs font-sans text-[#9194a1] block mt-1">
            {isFail ? "Non-compliant email transport posture" : "Optimal cryptographic defense posture"}
          </span>

          {/* Golden Gradient Line Chart Visualization */}
          <div className="mt-5 w-full bg-[#08080a] border border-[#1c1d22] rounded-[8px] p-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#9194a1] mb-2 uppercase">
              <span>Flow Posture Trajectory</span>
              <span className="text-[#cc9166]">Gilded Ledger</span>
            </div>

            <svg viewBox="0 0 400 150" className="w-full h-28 overflow-visible" preserveAspectRatio="none">
              <defs>
                {/* Slash Gilded Gradient definition */}
                <linearGradient id="gilded-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(174, 147, 87)" />
                  <stop offset="40%" stopColor="rgb(255, 240, 204)" />
                  <stop offset="70%" stopColor="rgb(174, 147, 87)" />
                  <stop offset="100%" stopColor="rgba(189, 157, 79, 0.4)" />
                </linearGradient>
                <linearGradient id="gilded-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 240, 204, 0.15)" />
                  <stop offset="100%" stopColor="rgba(174, 147, 87, 0.0)" />
                </linearGradient>
              </defs>

              {/* Baseline reference line at 80 */}
              <line x1="20" y1="52" x2="380" y2="52" stroke="#2e3038" strokeDasharray="3 3" strokeWidth="1" />
              <text x="382" y="55" fill="#777a88" fontSize="8" fontFamily="monospace">80</text>

              {/* Area under curve */}
              <path d={areaD} fill="url(#gilded-area-grad)" />

              {/* Gilded chart line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#gilded-line-grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Point dots */}
              {sessions.map((s, idx) => {
                const x = 30 + (idx / Math.max(1, sessions.length - 1)) * 340;
                const y = 140 - (s.session_score / 100) * 110;
                const ptIsFail = s.session_score < 50;
                return (
                  <circle
                    key={s.session_id}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill={ptIsFail ? "#f87171" : "#ffffff"}
                    stroke="#040406"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Input/Parameter Pill Field */}
        <div className="mt-4 p-2.5 rounded-full bg-[#121317] border border-[#1c1d22] flex items-center justify-between text-xs font-mono text-[#9194a1] px-4">
          <span className="text-[#e2e3e9]">NIST SP 800-52r2</span>
          <span className="text-[#5e616e]">·</span>
          <span>Deduction: -{100 - score} pts</span>
          <span className="text-[#5e616e]">·</span>
          <span className="text-[#cc9166]">Verified Wire</span>
        </div>
      </div>
    </section>
  );
}
