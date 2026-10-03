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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-sms-border-strong bg-sms-surface-primary shadow-modal overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-sms-border bg-sms-surface-secondary/50">
          <div>
            <h2 className="text-base font-bold text-sms-text-primary tracking-tight">
              Ingest Network Capture Dossier
            </h2>
            <p className="text-xs text-sms-text-muted font-mono-tech mt-0.5">
              PASSIVE EMAIL TRAFFIC DECONSTRUCTION &amp; CRYPTOGRAPHIC AUDIT
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sms-text-muted hover:text-sms-text-primary hover:bg-sms-surface-hover transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isUploading ? (
            /* Multi-Step Pipeline Indicator */
            <div className="py-6 px-4 bg-sms-surface-secondary/40 rounded-xl border border-sms-border">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2 border border-sky-300 dark:border-sky-800">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="font-bold text-sms-text-primary text-sm">
                  Forensic Ingestion In Progress
                </h3>
                <span className="text-xs font-mono-tech text-sms-text-muted">
                  {fileName}
                </span>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-2.5 max-w-sm mx-auto">
                {STEPS.map((step, idx) => {
                  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 p-2 rounded-lg text-xs font-mono-tech transition-colors ${
                        isCurrent
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800"
                          : isDone
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-sms-text-muted opacity-60"
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                        ) : (
                          <Icon className="w-4 h-4 text-sms-text-muted" />
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                isDragging
                  ? "border-sky-500 bg-sky-50/60 dark:bg-sky-950/20"
                  : "border-sms-border hover:border-sky-400 bg-sms-surface-secondary/30 hover:bg-sms-surface-secondary/60"
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

              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 border border-sky-300 dark:border-sky-800 shadow-sm">
                <UploadCloud className="w-7 h-7" strokeWidth={1.8} />
              </div>

              <div className="text-sm font-bold text-sms-text-primary mb-1">
                Drag &amp; drop PCAP capture or <span className="text-sky-600 dark:text-sky-400 underline underline-offset-4">browse files</span>
              </div>

              <p className="text-xs text-sms-text-muted max-w-sm mb-3">
                Upload raw packet capture for automated stream reassembly, TLS inspection, and NIST SP 800-52r2 compliance auditing.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono-tech text-sms-text-secondary">
                <span className="px-2 py-0.5 rounded bg-sms-surface-primary border border-sms-border">.pcap</span>
                <span className="px-2 py-0.5 rounded bg-sms-surface-primary border border-sms-border">.pcapng</span>
                <span className="px-2 py-0.5 rounded bg-sms-surface-primary border border-sms-border">.cap</span>
                <span className="text-sms-border-strong">•</span>
                <span className="px-2 py-0.5 rounded bg-sms-surface-primary border border-sms-border">SMTP (25/587)</span>
                <span className="px-2 py-0.5 rounded bg-sms-surface-primary border border-sms-border">SMTPS (465)</span>
                <span className="px-2 py-0.5 rounded bg-sms-surface-primary border border-sms-border">IMAPS (993)</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3.5 rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" strokeWidth={2} />
              <div>
                <span className="font-bold">Ingestion Failure: </span>
                {error}
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-sms-border pt-4 flex items-center justify-between text-xs text-sms-text-muted font-mono-tech">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              OFFLINE PASSIVE FORENSICS
            </span>
            <span>ZERO CLOUD TELEMETRY // AIR-GAPPED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
