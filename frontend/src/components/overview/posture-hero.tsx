"use client";

import React from "react";
import { ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
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
  let evidenceDetail = "STARTTLS Capability Absent from Observed Response (Plaintext Fallback)";
  let targetFlowId = 3;

  if (isCase02) {
    primaryFindingTitle = "STRIPTLS MITM ATTACK DETECTED";
    affectedVector = "FLOW 01 · SMTP :587";
    endpoints = "192.168.10.45:54120 → 198.51.100.25:587";
    evidenceDetail = "STARTTLS Capability Omitted · Cleartext Credentials Transmitted";
    targetFlowId = 1;
  } else if (isCase03) {
    primaryFindingTitle = "OBSOLETE TLS 1.0 & 3DES DETECTED";
    affectedVector = "FLOW 01 · SMTP :25";
    endpoints = "192.168.1.101:49200 → 10.0.1.20:25";
    evidenceDetail = "Sweet32 Vulnerable 3DES-CBC Cipher & Expired X.509 Certificate";
    targetFlowId = 1;
  } else if (isCase01) {
    primaryFindingTitle = "CRYPTOGRAPHIC POSTURE VERIFIED HARDENED";
    affectedVector = "FLOW 01 · SMTPS :465";
    endpoints = "10.14.20.101:52410 → 10.0.1.25:465";
    evidenceDetail = "TLS 1.3 · AES-256-GCM · Enforced Forward Secrecy Verified";
    targetFlowId = 1;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
      {/* ----------------------------------------------------
          CARD 1: CRYPTOGRAPHIC POSTURE MEASUREMENT (5 Cols)
          ---------------------------------------------------- */}
      <div className="lg:col-span-5 sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-card hover:shadow-cardHover transition-smooth relative overflow-hidden">
        {/* Subtle decorative top accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isFail ? "bg-sms-status-red" : "bg-sms-status-green"
          }`}
        />

        <div>
          {/* Header & Subtitle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isFail
                    ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                }`}
              >
                {isFail ? (
                  <ShieldAlert className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-sms-text-primary">
                  Cryptographic Posture
                </span>
                <span className="text-[11px] font-mono-tech text-sms-text-muted">
                  NIST SP 800-52r2 Baseline
                </span>
              </div>
            </div>

            {/* Severity Pill Badge */}
            <div
              className={`px-3 py-1 rounded-full font-mono-tech font-bold text-xs inline-flex items-center gap-2 border ${
                isFail
                  ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFail ? "bg-sms-status-red animate-pulse" : "bg-sms-status-green"
                }`}
              />
              <span>GRADE {activeCase.posture_grade}</span>
            </div>
          </div>

          {/* Large Hero Score & Grade Display */}
          <div className="flex items-baseline gap-3 my-3">
            <div className="flex items-baseline">
              <span
                className={`text-[80px] sm:text-[90px] font-black tracking-tighter leading-none tnum font-sans ${
                  isFail ? "text-sms-status-red" : "text-sms-status-green"
                }`}
              >
                {score}
              </span>
              <span className="text-2xl text-sms-text-muted font-bold ml-1 font-sans">
                /100
              </span>
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-sm font-bold text-sms-text-primary uppercase tracking-wide">
                {isFail ? "Non-Compliant Posture" : "Hardened Posture"}
              </span>
              <span className="text-xs text-sms-text-muted mt-0.5">
                {isFail ? "Immediate remediation required" : "All policies enforced"}
              </span>
            </div>
          </div>

          {/* Horizontal Precision Measurement Instrument */}
          <div className="w-full my-4 bg-sms-surface-secondary/60 p-3.5 rounded-xl border border-sms-border">
            <div className="flex justify-between text-[11px] font-mono-tech text-sms-text-muted font-bold uppercase mb-2">
              <span className="text-red-600 dark:text-red-400">0 CRITICAL</span>
              <span className="text-sms-text-secondary">80 NIST PASS REQUIREMENT</span>
              <span className="text-emerald-600 dark:text-emerald-400">100 OPTIMAL</span>
            </div>

            {/* Scale Track */}
            <div className="relative h-3 w-full bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
              {/* NIST Baseline Marker line at 80% */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-slate-900 dark:bg-white z-10 opacity-70"
                style={{ left: "80%" }}
                title="80 NIST Baseline"
              />

              {/* Filled score bar */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFail ? "bg-sms-status-red" : "bg-sms-status-green"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
              />
            </div>
          </div>

          {/* Aligned Supporting Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-sms-border">
            <div className="bg-sms-surface-secondary/50 p-3 rounded-xl border border-sms-border">
              <span className="text-[11px] font-mono-tech text-sms-text-muted uppercase font-semibold block">
                Degraded Email Flows
              </span>
              <div className="text-lg font-bold text-sms-text-primary mt-1 tnum flex items-baseline gap-1">
                <span className={degradedFlowsCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                  {degradedFlowsCount}
                </span>
                <span className="text-xs text-sms-text-muted font-normal">
                  / {activeCase.data.total_sessions} total
                </span>
              </div>
            </div>

            <div className="bg-sms-surface-secondary/50 p-3 rounded-xl border border-sms-border">
              <span className="text-[11px] font-mono-tech text-sms-text-muted uppercase font-semibold block">
                Compliance Deficit
              </span>
              <div className={`text-lg font-bold mt-1 tnum ${isFail ? "text-sms-status-red" : "text-sms-status-green"}`}>
                {deficit > 0 ? `-${deficit} pts` : "0 pts (Pass)"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          CARD 2: PRIMARY FORENSIC FINDING & WIRE VECTOR (7 Cols)
          ---------------------------------------------------- */}
      <div className="lg:col-span-7 sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-card hover:shadow-cardHover transition-smooth relative overflow-hidden">
        {/* Subtle decorative top accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isFail ? "bg-sms-status-red" : "bg-sms-status-green"
          }`}
        />

        <div>
          {/* Finding Category Banner */}
          <div className="flex items-center justify-between mb-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase tracking-wider ${
                isFail
                  ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
              }`}
            >
              {isFail ? (
                <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              <span>{isFail ? "Critical Threat Vector Detected" : "Cryptographic Assessment Passed"}</span>
            </div>

            <span className="text-xs font-mono-tech text-sms-text-muted">
              Vector Ref: #{String(targetFlowId).padStart(2, "0")}
            </span>
          </div>

          {/* Dominant Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sms-text-primary tracking-tight leading-tight mt-1 mb-2">
            {primaryFindingTitle}
          </h2>

          <p className="text-sm text-sms-text-secondary leading-relaxed mb-4">
            {activeCase.data.total_sessions} reconstructed mail streams inspected across network boundaries.{" "}
            {degradedFlowsCount > 0 ? (
              <>
                <strong className="text-red-600 dark:text-red-400 font-semibold">
                  {degradedFlowsCount} flows fail compliance
                </strong>{" "}
                with NIST SP 800-52r2 and RFC 8314 mandatory encryption standards.
              </>
            ) : (
              "All flows enforce forward secrecy (ECDHE), TLS 1.3 encryption, and robust X.509 certificate chains."
            )}
          </p>

          {/* Clean, Focused Flow Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="bg-sms-surface-secondary/70 p-3 rounded-xl border border-sms-border">
              <span className="text-[11px] font-mono-tech text-sms-text-muted uppercase font-semibold block">
                Affected Vector
              </span>
              <span className={`font-mono-tech font-bold text-xs mt-1 block truncate ${isFail ? "text-sms-status-red" : "text-sms-status-green"}`}>
                {affectedVector}
              </span>
            </div>

            <div className="bg-sms-surface-secondary/70 p-3 rounded-xl border border-sms-border">
              <span className="text-[11px] font-mono-tech text-sms-text-muted uppercase font-semibold block">
                Wire Endpoints
              </span>
              <span className="font-mono-tech text-xs text-sms-text-primary font-bold mt-1 block truncate" title={endpoints}>
                {endpoints}
              </span>
            </div>

            <div className="bg-sms-surface-secondary/70 p-3 rounded-xl border border-sms-border">
              <span className="text-[11px] font-mono-tech text-sms-text-muted uppercase font-semibold block">
                Forensic Evidence
              </span>
              <span className="text-xs text-sms-text-secondary font-medium mt-1 block truncate" title={evidenceDetail}>
                {evidenceDetail}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button CTA */}
        <div className="pt-3 border-t border-sms-border flex items-center justify-between">
          <span className="text-xs font-mono-tech text-sms-text-muted hidden sm:inline">
            Directly dissect stream packets &amp; TLS handshake records
          </span>
          <button
            type="button"
            onClick={() => onInspectFlow(targetFlowId)}
            className={`ml-auto h-10 px-5 rounded-xl font-bold text-xs font-mono-tech flex items-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5 ${
              isFail
                ? "bg-red-600 hover:bg-red-500 text-white dark:bg-red-500 dark:hover:bg-red-400"
                : "bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400"
            }`}
          >
            <span>INSPECT FLOW #{String(targetFlowId).padStart(2, "0")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
