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
  const deficit = 100 - score;
  const degradedFlowsCount = activeCase.data.sessions.filter(
    (s) => s.session_score < 70 || !s.is_encrypted || s.starttls_stripped
  ).length;

  // Case-specific evidence-based finding parameters
  const isCase02 = activeCase.case_code === "CASE-02";
  const isCase03 = activeCase.case_code === "CASE-03";
  const isCase01 = activeCase.case_code === "CASE-01";

  let primaryFindingTitle = "STARTTLS DOWNGRADE OBSERVED";
  let affectedVector = "FLOW 03 · SMTP :587";
  let endpoints = "192.168.1.102:49300 → 10.0.0.15:587";
  let evidenceDetail = "STARTTLS Capability Absent from Observed Response";
  let targetFlowId = 3;

  if (isCase02) {
    primaryFindingTitle = "STARTTLS DOWNGRADE OBSERVED";
    affectedVector = "FLOW 01 · SMTP :587";
    endpoints = "192.168.10.45:54120 → 198.51.100.25:587";
    evidenceDetail = "STARTTLS Capability Omitted · Plaintext Auth Observed";
    targetFlowId = 1;
  } else if (isCase03) {
    primaryFindingTitle = "OBSOLETE TLS 1.0 & 3DES OBSERVED";
    affectedVector = "FLOW 01 · SMTP :25";
    endpoints = "192.168.1.101:49200 → 10.0.1.20:25";
    evidenceDetail = "Sweet32 Vulnerable 3DES-CBC Cipher & Expired Certificate";
    targetFlowId = 1;
  } else if (isCase01) {
    primaryFindingTitle = "CRYPTOGRAPHIC POSTURE VERIFIED HARDENED";
    affectedVector = "FLOW 01 · SMTPS :465";
    endpoints = "10.14.20.101:52410 → 10.0.1.25:465";
    evidenceDetail = "TLS 1.3 · AES-256-GCM · Forward Secrecy Enforced";
    targetFlowId = 1;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start select-none">
      {/* ----------------------------------------------------
          LEFT REGION (42%): CRYPTOGRAPHIC POSTURE MEASUREMENT
          ---------------------------------------------------- */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
          {/* Subordinate Metadata Label */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] font-mono-tech tracking-wider text-sms-text-muted uppercase">
              Cryptographic Posture
            </span>
            <span className="text-sms-border font-mono-tech">/</span>
            <span className="text-[12px] font-mono-tech text-sms-text-muted uppercase">
              NIST SP 800-52r2 Baseline
            </span>
          </div>

          {/* Large Hero Score & Grade (Unified neutral score + severity grade) */}
          <div className="flex items-baseline gap-4 mb-2.5">
            <div className="flex items-baseline">
              <span className="text-[92px] sm:text-[98px] font-semibold tracking-tight text-sms-text-primary leading-none font-sans tnum">
                {score}
              </span>
              <span className="text-[24px] text-sms-text-muted font-normal ml-1 font-sans">
                /100
              </span>
            </div>

            <div className="flex flex-col ml-1">
              <div
                className={`px-2.5 py-1 rounded-tag font-mono-tech font-bold text-body-s tracking-wide uppercase inline-flex items-center gap-1.5 ${
                  isFail
                    ? "bg-sms-red-dim text-sms-red border border-sms-red/25"
                    : "bg-sms-green-dim text-sms-green border border-sms-green/25"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFail ? "bg-sms-red animate-pulse" : "bg-sms-green"
                  }`}
                />
                <span>GRADE {activeCase.posture_grade}</span>
              </div>
              <span className="text-[12px] font-mono-tech text-sms-text-muted mt-1 uppercase">
                {isFail ? "Non-Compliant" : "Hardened"}
              </span>
            </div>
          </div>

          {/* Horizontal Precision Measurement Instrument */}
          <div className="w-full mb-3">
            <div className="flex justify-between text-[11px] font-mono-tech text-sms-text-muted uppercase mb-1">
              <span>0 FAIL</span>
              <span className="text-sms-text-secondary">80 NIST BASELINE</span>
              <span>100</span>
            </div>

            {/* Scale Track */}
            <div className="relative h-2 w-full bg-sms-surface-secondary rounded-full overflow-visible border border-sms-border">
              {/* NIST Baseline Marker line at 80% */}
              <div
                className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-sms-text-muted/60 z-10"
                style={{ left: "80%" }}
                title="80 NIST Baseline"
              />

              {/* Filled score bar */}
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFail ? "bg-sms-red" : "bg-sms-green"
                }`}
                style={{ width: `${Math.min(100, Math.max(4, score))}%` }}
              />

              {/* Marker pin on score */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-sms-surface-primary shadow-sm z-20 ${
                  isFail ? "bg-sms-red" : "bg-sms-green"
                }`}
                style={{ left: `calc(${Math.min(98, Math.max(2, score))}% - 8px)` }}
              />
            </div>
          </div>

          {/* Aligned Supporting Metrics (Strictly typographically aligned, not cards) */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sms-border font-mono-tech">
            <div>
              <span className="text-[12px] text-sms-text-muted uppercase tracking-wider block">
                Degraded Flows
              </span>
              <div className="text-[18px] font-semibold text-sms-text-primary mt-0.5 tnum">
                {degradedFlowsCount} <span className="text-body-s text-sms-text-muted font-normal">/ {activeCase.data.total_sessions}</span>
              </div>
            </div>

            <div>
              <span className="text-[12px] text-sms-text-muted uppercase tracking-wider block">
                Score Deficit
              </span>
              <div className="text-[18px] font-semibold text-sms-red mt-0.5 tnum">
                -{deficit} pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          RIGHT REGION (58%): SEAMLESS INTERPRETATION & DOMINANT FINDING
          (Unified continuous composition — no hard vertical border line)
          ---------------------------------------------------- */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        <div>
          {/* Posture Interpretation Heading */}
          <div className="mb-2">
            <h2 className="text-[26px] sm:text-[30px] font-semibold text-sms-text-primary tracking-tight leading-tight">
              {isFail ? "CRITICAL POSTURE DEGRADATION" : "HARDENED CRYPTOGRAPHIC POSTURE"}
            </h2>
            <p className="text-body-p text-sms-text-secondary mt-1 leading-relaxed max-w-2xl">
              {activeCase.data.total_sessions} reconstructed email flows analyzed across network boundaries.{" "}
              {degradedFlowsCount > 0 ? (
                <>
                  <strong className="text-sms-text-primary font-medium">
                    {degradedFlowsCount} flows fail
                  </strong>{" "}
                  the configured cryptographic compliance baseline (NIST SP 800-52r2 / RFC 8314).
                </>
              ) : (
                "All flows enforce forward secrecy and TLS 1.3 standards."
              )}
            </p>
          </div>

          {/* Primary Forensic Finding Block */}
          <div className="mt-3 pt-2.5 border-t border-sms-border">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`flex h-2 w-2 rounded-full ${isFail ? "bg-sms-red" : "bg-sms-green"}`} />
              <span className={`text-[12px] font-mono-tech font-semibold tracking-wider uppercase ${isFail ? "text-sms-red" : "text-sms-green"}`}>
                Primary Finding · Evidence-Based
              </span>
            </div>

            {/* Dominant Headline (40-46px display hierarchy) */}
            <h3 className="text-[36px] sm:text-[44px] font-bold text-sms-text-primary tracking-tight leading-[1.05] mb-2.5">
              {primaryFindingTitle}
            </h3>

            {/* Clean, Focused Flow Metadata (14-15px) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-ui font-mono-tech mb-3">
              <div>
                <span className="text-sms-text-muted uppercase text-[12px] block">Affected Vector</span>
                <span className={`font-semibold ${isFail ? "text-sms-red" : "text-sms-green"}`}>
                  {affectedVector}
                </span>
              </div>

              <div>
                <span className="text-sms-text-muted uppercase text-[12px] block">Wire Endpoints</span>
                <span className="text-sms-text-primary">{endpoints}</span>
              </div>

              <div>
                <span className="text-sms-text-muted uppercase text-[12px] block">Observed Evidence</span>
                <span className="text-sms-text-secondary">{evidenceDetail}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => onInspectFlow(targetFlowId)}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-btn border border-sms-border hover:border-sms-border-strong bg-sms-surface-primary hover:bg-sms-surface-hover text-sms-text-primary text-ui font-medium transition-fast focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sms-cyan"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFail ? "bg-sms-red" : "bg-sms-green"}`} />
              <span>INSPECT FLOW {String(targetFlowId).padStart(2, "0")}</span>
              <ArrowRight className="w-4 h-4 text-sms-text-muted" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
