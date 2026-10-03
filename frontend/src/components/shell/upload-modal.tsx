"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  X, 
  AlertCircle, 
  Loader2, 
  FileCheck2, 
  Cpu, 
  Binary, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";
import { uploadPcap, getAnalysis } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (analysis: AnalysisResult) => void;
}

type PipelineStep = 
  | "UPLOADING"
  | "PARSING"
  | "INSPECTING"
  | "ANALYZING"
  | "GENERATING"
  | "COMPLETED";

const STEPS: { key: PipelineStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "UPLOADING", label: "Uploading PCAP Stream", icon: UploadCloud },
  { key: "PARSING", label: "Reassembling TCP Frames", icon: Binary },
  { key: "INSPECTING", label: "Inspecting Mail Protocols (SMTP/IMAP/POP3)", icon: Cpu },
  { key: "ANALYZING", label: "Cryptographic Posture & NIST Scoring", icon: ShieldCheck },
  { key: "GENERATING", label: "Generating Forensic Dossier", icon: FileCheck2 },
  { key: "COMPLETED", label: "Analysis Completed", icon: CheckCircle2 },
];

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStep>("UPLOADING");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      const stepKeys: PipelineStep[] = ["UPLOADING", "PARSING", "INSPECTING", "ANALYZING", "GENERATING", "COMPLETED"];
      let idx = 0;
      interval = setInterval(() => {
        if (idx < stepKeys.length - 2) {
          idx += 1;
          setCurrentStep(stepKeys[idx]);
        }
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.match(/\.(pcap|pcapng|cap)$/i)) {
      setError("Invalid file format. Please upload a network capture (.pcap, .pcapng, .cap)");
      return;
    }

    setIsUploading(true);
    setCurrentStep("UPLOADING");
    setError(null);
    setFileName(file.name);

    try {
      const analysisId = await uploadPcap(file);
      setCurrentStep("GENERATING");
      const analysis = await getAnalysis(analysisId);
      setCurrentStep("COMPLETED");
      setTimeout(() => {
        onUploadSuccess(analysis);
        onClose();
        setIsUploading(false);
      }, 400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze PCAP file";
      setError(message);
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-[10px] border border-[#1c1d22] bg-[#040406] overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#1c1d22] bg-[#08080a]">
          <div>
            <span className="text-[11px] font-semibold tracking-wide uppercase text-[#cc9166] block font-mono">
              PASSIVE EMAIL TRAFFIC DECONSTRUCTION
            </span>
            <h2 className="text-base font-serif font-normal text-white mt-0.5">
              Ingest Network Capture Dossier
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1c1d22] hover:border-[#2e3038] bg-[#121317] hover:bg-[#1c1d22] flex items-center justify-center text-[#9194a1] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isUploading ? (
            /* Multi-Step Pipeline Indicator */
            <div className="py-6 px-4 bg-[#08080a] rounded-[10px] border border-[#1c1d22]">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center mx-auto mb-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <h3 className="font-serif font-normal text-white text-base">
                  Forensic Ingestion In Progress
                </h3>
                <span className="text-xs font-mono text-[#9194a1]">
                  {fileName}
                </span>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-2 max-w-sm mx-auto">
                {STEPS.map((step, idx) => {
                  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 px-3 py-2 rounded-full text-xs font-mono transition-colors ${
                        isCurrent
                          ? "bg-[#121317] text-white font-semibold border border-[#cc9166]/50"
                          : isDone
                          ? "text-[#10b981] font-semibold"
                          : "text-[#9194a1] opacity-50"
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cc9166]" />
                        ) : (
                          <Icon className="w-3.5 h-3.5 text-[#9194a1]" />
                        )}
                      </div>
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Drag & Drop Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                isDragging
                  ? "border-[#cc9166] bg-[#121317]"
                  : "border-[#1c1d22] hover:border-[#2e3038] bg-[#08080a] hover:bg-[#121317]/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pcap,.pcapng,.cap"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" strokeWidth={1.8} />
              </div>

              <div className="text-sm font-medium text-white mb-1">
                Drag &amp; drop PCAP capture or <span className="text-[#cc9166] underline underline-offset-4">browse files</span>
              </div>

              <p className="text-xs text-[#9194a1] max-w-sm mb-4 leading-relaxed">
                Upload raw packet capture for automated stream reassembly, TLS inspection, and NIST SP 800-52r2 compliance auditing.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono text-[#e2e3e9]">
                <span className="px-2.5 py-0.5 rounded-full bg-[#121317] border border-[#1c1d22]">.pcap</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#121317] border border-[#1c1d22]">.pcapng</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#121317] border border-[#1c1d22]">.cap</span>
                <span className="text-[#2e3038]">•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#121317] border border-[#1c1d22]">SMTP (25/587)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#121317] border border-[#1c1d22]">SMTPS (465)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#121317] border border-[#1c1d22]">IMAPS (993)</span>
              </div>
            </div>
          )}

          {/* Quick-Load Sample Attack Capture for Evaluators */}
          {!isUploading && (
            <div className="mt-4 p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-white block">Evaluating without a local PCAP?</span>
                <span className="text-[11px] text-[#9194a1]">Instantly dispatch a real synthetic attack capture through the live backend engine.</span>
              </div>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const resp = await fetch("/samples/02_striptls_mitm_attack.pcap");
                    if (!resp.ok) throw new Error("Sample file not found on server");
                    const blob = await resp.blob();
                    const file = new File([blob], "02_striptls_mitm_attack.pcap", { type: "application/vnd.tcpdump.pcap" });
                    handleFileProcess(file);
                  } catch (err) {
                    setError("Failed to load sample capture file: " + (err instanceof Error ? err.message : String(err)));
                  }
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#121317] border border-[#2e3038] hover:border-[#cc9166] text-[#cc9166] font-mono text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 justify-center"
              >
                <span>Run STRIPTLS Sample PCAP</span>
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3.5 rounded-[10px] border border-[#f87171]/40 bg-[#7f1d1d]/20 flex items-start gap-3 text-xs text-[#f87171] font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <span className="font-bold">Ingestion Failure: </span>
                {error}
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-[#1c1d22] pt-4 flex items-center justify-between text-xs text-[#9194a1] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              OFFLINE PASSIVE FORENSICS
            </span>
            <span className="text-[#cc9166]">ZERO CLOUD TELEMETRY // AIR-GAPPED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
