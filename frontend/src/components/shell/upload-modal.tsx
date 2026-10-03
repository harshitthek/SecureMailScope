"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, AlertCircle, Loader2 } from "lucide-react";
import { uploadPcap, getAnalysis } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (analysis: AnalysisResult) => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.match(/\.(pcap|pcapng|cap)$/i)) {
      setError("Invalid file format. Please upload a network capture (.pcap, .pcapng, .cap)");
      return;
    }

    setIsUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const analysisId = await uploadPcap(file);
      const analysis = await getAnalysis(analysisId);
      onUploadSuccess(analysis);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze PCAP file";
      setError(message);
    } finally {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-modal border border-sms-border-strong bg-sms-surface-primary shadow-modal overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sms-border bg-sms-surface-secondary/40">
          <div>
            <h2 className="text-body-p font-semibold text-sms-text-primary tracking-tight">
              Ingest Network Capture
            </h2>
            <p className="text-meta text-sms-text-muted font-mono-tech mt-0.5">
              PASSIVE EMAIL TRAFFIC DECONSTRUCTION
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-btn flex items-center justify-center text-sms-text-muted hover:text-sms-text-primary hover:bg-sms-surface-hover transition-fast"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-surface p-8 text-center cursor-pointer transition-fast flex flex-col items-center justify-center ${
              isDragging
                ? "border-sms-cyan bg-sms-cyan-dim"
                : "border-sms-border hover:border-sms-border-strong bg-sms-surface-secondary/30 hover:bg-sms-surface-secondary/60"
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

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-sms-cyan animate-spin" strokeWidth={1.5} />
                <span className="text-ui font-medium text-sms-text-primary">
                  Reassembling TCP Streams...
                </span>
                <span className="text-meta text-sms-text-muted font-mono-tech">
                  {fileName}
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-surface bg-sms-surface-secondary flex items-center justify-center text-sms-text-secondary mb-3 border border-sms-border">
                  <UploadCloud className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="text-body-s font-medium text-sms-text-primary mb-1">
                  Drag &amp; drop PCAP capture or <span className="text-sms-cyan underline underline-offset-2">browse</span>
                </div>
                <div className="text-meta text-sms-text-muted font-mono-tech">
                  Supported: .pcap, .pcapng, .cap · Ports: 25, 587, 465, 110, 143, 993, 995
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-surface border border-sms-red/40 bg-sms-red-dim flex items-start gap-2.5 text-ui text-sms-red">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <span className="font-semibold">Ingestion Failure: </span>
                {error}
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-sms-border pt-4 flex items-center justify-between text-meta text-sms-text-muted font-mono-tech">
            <span>OFFLINE PASSIVE FORENSICS</span>
            <span>ZERO CLOUD TELEMETRY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
