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
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-6 pb-20 select-none font-sans">
      {/* Header & Quick Actions Card */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#1c1d22] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
                Archival Export &amp; Attestation
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em]">
                Forensic Audit Dossier &amp; Executive Summary
              </h2>
              <p className="text-xs text-[#9194a1] mt-0.5">
                Official SIH26159 compliance report ready for export and archival
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              className="h-9 px-4 rounded-full border border-[#f87171]/40 bg-[#7f1d1d]/20 hover:bg-[#7f1d1d]/30 text-[#f87171] font-medium text-xs font-mono-tech flex items-center gap-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload("json")}
              className="h-9 px-4 rounded-full border border-[#cc9166]/40 bg-[#121317] hover:bg-[#1c1d22] text-[#cc9166] font-medium text-xs font-mono-tech flex items-center gap-2 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 px-4 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-xs font-mono-tech flex items-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Executive Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 font-mono-tech text-xs">
          <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[10px] text-[#9194a1] uppercase block font-medium">Dossier ID</span>
            <span className="font-semibold text-white block mt-0.5">{activeCase.data.analysis_id}</span>
          </div>
          <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[10px] text-[#9194a1] uppercase block font-medium">Analyzed File</span>
            <span className="font-semibold text-white block mt-0.5">{activeCase.data.filename}</span>
          </div>
          <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[10px] text-[#9194a1] uppercase block font-medium">Assessment Date</span>
            <span className="font-semibold text-white block mt-0.5">
              {new Date(activeCase.data.analyzed_at).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[10px] text-[#9194a1] uppercase block font-medium">Compliance Rating</span>
            <span className={`font-semibold block mt-0.5 ${isFail ? "text-[#f87171]" : "text-[#10b981]"}`}>
              {activeCase.posture_score}/100 (Grade {activeCase.posture_grade})
            </span>
          </div>
        </div>
      </div>

      {/* Report Document Mock Preview */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-8 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
        <div className="border-b border-[#1c1d22] pb-5 flex justify-between items-end">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-white">
              NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO)
            </h1>
            <p className="text-xs font-sans text-[#cc9166] uppercase tracking-wider font-semibold mt-1">
              Passive Cryptographic Traffic Forensics &amp; Posture Assessment Dossier
            </p>
          </div>
          <span className="text-xs font-mono-tech font-semibold px-3 py-1 bg-[#121317] border border-[#1c1d22] rounded-full text-[#cc9166]">
            SIH26159
          </span>
        </div>

        {/* Executive Overview */}
        <section className="font-sans text-sm space-y-3">
          <h3 className="font-serif font-normal text-lg text-white uppercase tracking-wide border-b border-[#1c1d22] pb-2">
            1. Executive Assessment
          </h3>
          <p className="text-[#e2e3e9] leading-relaxed">
            Passive deep packet analysis was conducted on network capture{" "}
            <code className="font-mono-tech font-semibold text-[#cc9166]">{activeCase.data.filename}</code>{" "}
            containing <strong className="text-white">{activeCase.data.total_packets.toLocaleString()}</strong> packets
            and <strong className="text-white">{activeCase.data.total_sessions}</strong> reassembled email transport streams.
            The evaluation measured conformance against NIST Special Publication 800-52 Revision 2 and IETF RFC 8314.
          </p>
          <div className="p-4 rounded-[10px] bg-[#08080a] border border-[#1c1d22] flex items-center justify-between font-mono-tech">
            <div>
              <span className="text-xs text-[#9194a1] uppercase block">Enterprise Cryptographic Grade</span>
              <span className={`text-2xl sm:text-3xl font-serif font-normal ${isFail ? "text-[#f87171]" : "text-[#10b981]"}`}>
                GRADE {activeCase.posture_grade} ({activeCase.posture_score}/100)
              </span>
            </div>
            <span className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase ${isFail ? "bg-[#7f1d1d]/20 text-[#f87171] border border-[#f87171]/40" : "bg-[#064e3b]/20 text-[#10b981] border border-[#10b981]/40"}`}>
              {isFail ? "NON-COMPLIANT" : "HARDENED"}
            </span>
          </div>
        </section>

        {/* Stream Inventory Summary */}
        <section className="font-sans text-sm space-y-3">
          <h3 className="font-serif font-normal text-lg text-white uppercase tracking-wide border-b border-[#1c1d22] pb-2">
            2. Stream Findings &amp; Risk Posture
          </h3>
          <div className="space-y-2 font-mono-tech text-xs">
            {activeCase.data.sessions.map((s, idx) => (
              <div key={s.session_id} className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22] flex justify-between items-center">
                <div>
                  <span className="font-semibold text-white">Flow #{idx + 1}: {s.protocol} :{s.dst_port}</span>
                  <span className="text-[#9194a1] ml-2">({s.server_name || s.dst_ip})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={s.is_encrypted ? "text-[#10b981] font-semibold" : "text-[#f87171] font-semibold"}>
                    {s.tls_version || "Cleartext"}
                  </span>
                  <span className="font-semibold text-white">{s.session_score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Official Certification Footer */}
        <div className="pt-8 border-t border-[#1c1d22] font-mono-tech text-xs text-[#9194a1] flex justify-between items-end">
          <div>
            <div>Automated Signature: SECUREMAILSCOPE-ENGINE-V1.4</div>
            <div>Sensor ID: NTRO-PASSIVE-MIRROR-01</div>
          </div>
          <div className="text-right">
            <div className="text-[#cc9166]">Verification Status: OFFICIAL EVIDENCE ARTIFACT</div>
            <div>Air-Gapped Forensic Pipeline</div>
          </div>
        </div>
      </div>
    </main>
  );
}
