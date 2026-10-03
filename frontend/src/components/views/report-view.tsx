"use client";

import React from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  Printer
} from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { getReportUrl } from "@/lib/api";

interface ReportViewProps {
  activeCase: EvidenceCase;
}

export function ReportView({ activeCase }: ReportViewProps) {
  const isFail = activeCase.posture_grade === "F" || activeCase.posture_score < 50;

  const handleDownload = (format: "pdf" | "json") => {
    const url = getReportUrl(activeCase.data.analysis_id, format);
    window.open(url, "_blank");
  };

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6 pb-16 select-none font-sans">
      {/* Header & Quick Actions Card */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-sms-border gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-sms-text-primary tracking-tight">
                Forensic Audit Dossier &amp; Executive Summary
              </h2>
              <p className="text-xs text-sms-text-muted mt-0.5">
                Official SIH26159 compliance report ready for export and archival
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              className="h-10 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs font-mono-tech flex items-center gap-2 shadow-xs transition-all hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload("json")}
              className="h-10 px-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold text-xs font-mono-tech flex items-center gap-2 shadow-xs transition-all hover:-translate-y-0.5"
            >
              <FileJson className="w-4 h-4" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-xs font-mono-tech flex items-center gap-2 shadow-xs transition-all hover:-translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Executive Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 font-mono-tech text-xs">
          <div>
            <span className="text-[10px] text-sms-text-muted uppercase block font-semibold">Dossier ID</span>
            <span className="font-bold text-sms-text-primary block mt-0.5">{activeCase.data.analysis_id}</span>
          </div>
          <div>
            <span className="text-[10px] text-sms-text-muted uppercase block font-semibold">Analyzed File</span>
            <span className="font-bold text-sms-text-primary block mt-0.5">{activeCase.data.filename}</span>
          </div>
          <div>
            <span className="text-[10px] text-sms-text-muted uppercase block font-semibold">Assessment Date</span>
            <span className="font-bold text-sms-text-primary block mt-0.5">
              {new Date(activeCase.data.analyzed_at).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-sms-text-muted uppercase block font-semibold">Compliance Rating</span>
            <span className={`font-bold block mt-0.5 ${isFail ? "text-red-600" : "text-emerald-600"}`}>
              {activeCase.posture_score}/100 (Grade {activeCase.posture_grade})
            </span>
          </div>
        </div>
      </div>

      {/* Report Document Mock Preview */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-8 sm:p-10 shadow-card max-w-4xl mx-auto w-full font-serif space-y-6">
        <div className="border-b-2 border-slate-900 dark:border-white pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-sms-text-primary font-sans">
              NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO)
            </h1>
            <p className="text-xs font-sans text-sms-text-muted uppercase tracking-wider font-semibold mt-1">
              Passive Cryptographic Traffic Forensics &amp; Posture Assessment Dossier
            </p>
          </div>
          <span className="text-xs font-mono-tech font-bold px-2.5 py-1 bg-sms-surface-secondary border border-sms-border rounded">
            SIH26159
          </span>
        </div>

        {/* Executive Overview */}
        <section className="font-sans text-sm space-y-3">
          <h3 className="font-bold text-base text-sms-text-primary uppercase tracking-wide border-b border-sms-border pb-1">
            1. Executive Assessment
          </h3>
          <p className="text-sms-text-secondary leading-relaxed">
            Passive deep packet analysis was conducted on network capture{" "}
            <code className="font-mono-tech font-bold text-sms-text-primary">{activeCase.data.filename}</code>{" "}
            containing <strong className="text-sms-text-primary">{activeCase.data.total_packets.toLocaleString()}</strong> packets
            and <strong className="text-sms-text-primary">{activeCase.data.total_sessions}</strong> reassembled email transport streams.
            The evaluation measured conformance against NIST Special Publication 800-52 Revision 2 and IETF RFC 8314.
          </p>
          <div className="p-4 rounded-xl bg-sms-surface-secondary/70 border border-sms-border flex items-center justify-between font-mono-tech">
            <div>
              <span className="text-xs text-sms-text-muted uppercase block">Enterprise Cryptographic Grade</span>
              <span className={`text-2xl font-black ${isFail ? "text-red-600" : "text-emerald-600"}`}>
                GRADE {activeCase.posture_grade} ({activeCase.posture_score}/100)
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isFail ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
              {isFail ? "NON-COMPLIANT" : "HARDENED"}
            </span>
          </div>
        </section>

        {/* Stream Inventory Summary */}
        <section className="font-sans text-sm space-y-3">
          <h3 className="font-bold text-base text-sms-text-primary uppercase tracking-wide border-b border-sms-border pb-1">
            2. Stream Findings &amp; Risk Posture
          </h3>
          <div className="space-y-2 font-mono-tech text-xs">
            {activeCase.data.sessions.map((s, idx) => (
              <div key={s.session_id} className="p-3 rounded-lg bg-sms-surface-secondary/40 border border-sms-border flex justify-between items-center">
                <div>
                  <span className="font-bold text-sms-text-primary">Flow #{idx + 1}: {s.protocol} :{s.dst_port}</span>
                  <span className="text-sms-text-muted ml-2">({s.server_name || s.dst_ip})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={s.is_encrypted ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                    {s.tls_version || "Cleartext"}
                  </span>
                  <span className="font-bold">{s.session_score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Official Certification Footer */}
        <div className="pt-8 border-t border-sms-border font-sans text-xs text-sms-text-muted flex justify-between items-end">
          <div>
            <div>Automated Signature: SECUREMAILSCOPE-ENGINE-V1.4</div>
            <div>Sensor ID: NTRO-PASSIVE-MIRROR-01</div>
          </div>
          <div className="text-right">
            <div>Verification Status: OFFICIAL EVIDENCE ARTIFACT</div>
            <div>Air-Gapped Forensic Pipeline</div>
          </div>
        </div>
      </div>
    </main>
  );
}
