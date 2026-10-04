"use client";

import React from "react";
import { ArrowRight, Lock, Unlock } from "lucide-react";
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
  let evidenceDetail = "Cleartext 250-STARTTLS capability stripped by intermediate proxy. Session transmitted unencrypted.";
  let targetFlowId = 3;

  let policyBadge = "RFC 8314 §3: MIXED CONFORMANCE";
  let diagnosticDetail = "Plaintext fallback observed on port 25 & 587";

  if (isCase02) {
    primaryFindingTitle = "StripTLS MITM Attack Detected";
    affectedVector = "Flow 01 · SMTP :587";
    evidenceDetail = "STARTTLS verb suppressed from server response. Cleartext AUTH PLAIN credentials captured on wire.";
    policyBadge = "RFC 8314 §3: EXPLICIT TLS COMPROMISED";
    diagnosticDetail = "STARTTLS stripped at byte 0x0040 · Plaintext credentials";
    targetFlowId = 1;
  } else if (isCase03) {
    primaryFindingTitle = "Obsolete TLS 1.0 & 3DES Detected";
    affectedVector = "Flow 01 · SMTP :25";
    evidenceDetail = "Sweet32 vulnerable 3DES-CBC cipher negotiated with expired RSA-1024 certificate.";
    policyBadge = "NIST SP 800-52r2: DISALLOWED PROTOCOL";
    diagnosticDetail = "TLS 1.0 Sweet32 vulnerability · Expired 1024-bit RSA cert";
    targetFlowId = 1;
  } else if (isCase01) {
    primaryFindingTitle = "Cryptographic Baseline Hardened";
    affectedVector = "Flow 01 · SMTPS :465";
    evidenceDetail = "TLS 1.3 negotiated with AES-256-GCM AEAD and ephemeral ECDHE forward secrecy.";
    policyBadge = "NIST SP 800-52r2 & RFC 8314: COMPLIANT";
    diagnosticDetail = "Zero cleartext leakage · Ephemeral ECDHE · AES-256-GCM AEAD";
    targetFlowId = 1;
  }

  const targetSession = activeCase.data.sessions.find(s => s.session_id === targetFlowId) || activeCase.data.sessions[0];
  const endpoints = targetSession ? `${targetSession.src_ip}:${targetSession.src_port} → ${targetSession.dst_ip}:${targetSession.dst_port}` : "";

  // Generate SVG points for the gilded chart line based on sessions
  const sessions = activeCase.data.sessions;
  const chartPoints = sessions.map((s, idx) => {
    const x = 30 + (idx / Math.max(1, sessions.length - 1)) * 340;
    const y = 140 - (s.session_score / 100) * 110;
    return `${x},${y}`;
  });

  let pathD = "";
  let areaD = "";
  if (sessions.length === 1) {
    const y = 140 - (sessions[0].session_score / 100) * 110;
    pathD = `M 30,${y} L 370,${y}`;
    areaD = `M 30,140 L 30,${y} L 370,${y} L 370,140 Z`;
  } else if (sessions.length > 1) {
    pathD = `M ${chartPoints.join(" L ")}`;
    areaD = `M 30,140 L ${chartPoints.join(" L ")} L 370,140 Z`;
  } else {
    pathD = "M 30,100 L 370,100";
    areaD = "M 30,140 L 30,100 L 370,100 L 370,140 Z";
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start select-none font-sans pt-1">
      {/* ----------------------------------------------------
          LEFT COLUMN: DIDONE HEADLINE & FORENSIC EVIDENCE (7 COLS)
          ---------------------------------------------------- */}
      <div className="lg:col-span-7 flex flex-col gap-4 pt-3">
        <div>
          {/* Category Eyebrow in Copper */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-mono font-semibold tracking-wider text-[#cc9166] uppercase">
              Forensic Integrity Assessment
            </span>
            <span className="text-[#5e616e]">/</span>
            <span className="text-[11px] font-mono text-[#9194a1] uppercase">
              Passive Wire Inspection
            </span>
          </div>

          {/* High-Contrast Display Headline in Didone Serif */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-normal text-white leading-[1.12] tracking-[0.01em]">
            {primaryFindingTitle}
          </h1>

          {/* Editorial Body Copy (15px Inter, 1.55 line height, Bone #e2e3e9) */}
          <p className="text-[14px] sm:text-[15px] text-[#e2e3e9] leading-[1.55] mt-2.5 max-w-xl font-sans">
            {evidenceDetail} Passive traffic inspection validated against NIST SP 800-52r2 and IETF RFC 8314 requirements.
          </p>
        </div>

        {/* Wire Vector Callout Box */}
        <div className="p-3.5 rounded-[10px] bg-[#040406] border border-[#1c1d22] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#9194a1]">
              <span>Capture: {activeCase.data.filename}</span>
              <span className="text-[#5e616e]">·</span>
              <span className="text-[#cc9166] font-medium">Sensor: TAP-01 (ACTIVE)</span>
            </div>
          </div>

          {/* Ghost Outline Button (Slash Secondary Action) */}
          <button
            type="button"
            onClick={() => onInspectFlow(targetFlowId)}
            className="h-8 px-3.5 rounded-full border border-[#777a88] hover:border-white hover:bg-white/10 text-white font-sans text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>Inspect Wire Vector</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#cc9166]" />
          </button>
        </div>

        {/* Forensic Policy & Threat Callout Banner */}
        <div className="p-3 rounded-[10px] bg-[#08080a] border border-[#1c1d22] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${isFail ? "bg-[#f87171] animate-pulse" : "bg-[#10b981]"}`} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
              <span className="text-white font-medium shrink-0">{policyBadge}</span>
              <span className="text-[#5e616e] hidden sm:inline">·</span>
              <span className="text-[#9194a1] text-[11px] truncate">{diagnosticDetail}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
            isFail
              ? "bg-[#7f1d1d]/20 text-[#f87171] border border-[#f87171]/30"
              : "bg-[#064e3b]/20 text-[#10b981] border border-[#10b981]/30"
          }`}>
            {isFail ? "NON-COMPLIANT" : "VERIFIED"}
          </span>
        </div>

        {/* Telemetry Stat Strip (Border-contained, Clean Badges, No Truncation) */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-[10px] bg-[#040406] border border-[#1c1d22]">
          <div>
            <span className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em] block">
              {activeCase.data.processing_time_ms}
              <span className="text-xs font-sans text-[#9194a1] ml-1">ms</span>
            </span>
            <span className="text-[12px] text-[#9194a1] mt-0.5 block font-sans">
              Analysis Latency
            </span>
          </div>

          <div>
            <div className="flex flex-wrap gap-1 items-center min-h-[28px]">
              {activeCase.data.protocols_detected.map((proto) => (
                <span
                  key={proto}
                  className="px-1.5 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[10px] font-mono font-medium text-[#cc9166]"
                >
                  {proto}
                </span>
              ))}
            </div>
            <span className="text-[12px] text-[#9194a1] mt-0.5 block font-sans">
              Active Wire Protocols
            </span>
          </div>

          <div>
            <span className={`text-xl sm:text-2xl font-serif font-normal tracking-[0.01em] block ${isFail ? "text-[#f87171]" : "text-[#10b981]"}`}>
              {degradedFlowsCount}
              <span className="text-xs font-sans text-[#9194a1] ml-1">/ {activeCase.data.total_sessions}</span>
            </span>
            <span className="text-[12px] text-[#9194a1] mt-0.5 block font-sans">
              Degraded Vectors
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          RIGHT COLUMN: HERO CHART CARD & TRANSACTION LEDGER (5 COLS)
          ---------------------------------------------------- */}
      <div className="lg:col-span-5 bg-[#040406] border border-[#1c1d22] rounded-[10px] p-4 sm:p-5 flex flex-col gap-3">
        <div>
          {/* Balance/Score Header & Filter Pill */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1c1d22]">
            <span className="text-[12px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase">
              Posture Proof Point
            </span>

            <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] text-[#e2e3e9] bg-[#121317] border border-[#2e3038]">
              {activeCase.case_code}
            </span>
          </div>

          {/* Large Numerical Proof Point in Didone Serif */}
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline">
              <span className="text-[64px] sm:text-[76px] font-serif font-normal text-white tracking-[0.01em] leading-none">
                {score}
              </span>
              <span className="text-xl font-serif text-[#9194a1] ml-2">
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

          <span className="text-xs font-sans text-[#9194a1] block mt-0.5">
            {isFail ? "Non-compliant email transport posture" : "Optimal cryptographic defense posture"}
          </span>

          {/* Golden Gradient Line Chart Visualization */}
          <div className="mt-3 w-full bg-[#08080a] border border-[#1c1d22] rounded-[8px] p-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#9194a1] mb-1 uppercase">
              <span>Flow Posture Trajectory</span>
              <span className="text-[#cc9166]">Gilded Ledger</span>
            </div>

            <svg viewBox="0 0 400 150" className="w-full h-20 overflow-visible" preserveAspectRatio="none">
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
              {sessions.length === 1 ? (
                <>
                  <circle
                    cx={30}
                    cy={140 - (sessions[0].session_score / 100) * 110}
                    r="3.5"
                    fill={sessions[0].session_score < 50 ? "#f87171" : "#ffffff"}
                    stroke="#040406"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={370}
                    cy={140 - (sessions[0].session_score / 100) * 110}
                    r="3.5"
                    fill={sessions[0].session_score < 50 ? "#f87171" : "#ffffff"}
                    stroke="#040406"
                    strokeWidth="1.5"
                  />
                </>
              ) : (
                sessions.map((s, idx) => {
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
                })
              )}
            </svg>
          </div>

          {/* Integrated Mini-Stream Ledger (Slash Frame 00:01 Transaction Archetype) */}
          <div className="mt-3.5 divide-y divide-[#1c1d22] border-t border-[#1c1d22] pt-1">
            {sessions.slice(0, 4).map((s) => {
              const sIsSec = s.session_score >= 80;
              const sIsCrit = s.session_score < 50 || s.starttls_stripped;
              const hostLabel = s.server_name || s.dst_ip;
              return (
                <button
                  type="button"
                  key={s.session_id}
                  onClick={() => onInspectFlow(s.session_id)}
                  className="w-full py-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-[#121317] px-2 rounded-[6px] transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#121317] border border-[#2e3038] flex items-center justify-center shrink-0">
                      {s.is_encrypted ? (
                        <Lock className="w-2.5 h-2.5 text-[#10b981]" />
                      ) : (
                        <Unlock className="w-2.5 h-2.5 text-[#f87171]" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-white text-[11px] font-medium leading-none">
                        {s.protocol} :{s.dst_port}
                      </span>
                      <span className="text-[10px] text-[#9194a1] truncate max-w-[190px] font-mono mt-0.5" title={hostLabel}>
                        {hostLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-serif text-xs ${sIsSec ? "text-[#10b981]" : sIsCrit ? "text-[#f87171]" : "text-[#cc9166]"}`}>
                      {s.session_score}/100
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium uppercase border ${
                        sIsSec
                          ? "bg-[#064e3b]/20 text-[#10b981] border-[#10b981]/30"
                          : sIsCrit
                          ? "bg-[#7f1d1d]/20 text-[#f87171] border-[#f87171]/30"
                          : "bg-[#78350f]/20 text-[#fbbf24] border-[#fbbf24]/30"
                      }`}
                    >
                      {sIsSec ? "PASS" : sIsCrit ? "DOWNGRADE" : "WARN"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input/Parameter Pill Field */}
        <div className="mt-3.5 p-2 rounded-full bg-[#121317] border border-[#1c1d22] flex items-center justify-between text-[11px] font-mono text-[#9194a1] px-4">
          <span className="text-[#e2e3e9]">NIST SP 800-52r2</span>
          <span className="text-[#5e616e]">·</span>
          <span>Deduction: {100 - score === 0 ? "0 pts" : `-${100 - score} pts`}</span>
          <span className="text-[#5e616e]">·</span>
          <span className="text-[#cc9166]">Verified Wire</span>
        </div>
      </div>
    </section>
  );
}
