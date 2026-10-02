"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, Shield, CheckCircle2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const STAGES = [
  "INGESTING PCAP BUFFER",
  "REASSEMBLING TCP STREAMS",
  "IDENTIFYING EMAIL PROTOCOLS",
  "DISSECTING TLS HANDSHAKES",
  "AUDITING CRYPTOGRAPHY & X.509",
  "BUILDING FORENSIC EVIDENCE",
];

export function UploadModal({
  isOpen,
  onClose,
  onFileUpload,
  isAnalyzing,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStage(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isOpen && !isAnalyzing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono select-none">
      <div className="w-full max-w-xl bg-tactical-surface border border-tactical-border/90 shadow-2xl p-6 space-y-6 relative">
        {!isAnalyzing && (
          <button onClick={onClose} className="absolute top-4 right-4 text-tactical-dim hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="border-b border-tactical-border/70 pb-3 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-phosphor-cyan" />
          <div>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
              PASSIVE EMAIL FORENSIC INGESTION
            </h3>
            <span className="text-[11px] text-tactical-dim">
              Local PCAP packet dissection · Zero external telemetry
            </span>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="py-6 space-y-4">
            <span className="text-xs text-white font-bold uppercase tracking-wider block">
              ANALYZING PACKET WIRE STREAM...
            </span>
            <div className="space-y-2">
              {STAGES.map((stage, idx) => (
                <div key={stage} className={`flex items-center gap-3 text-xs ${idx <= currentStage ? "opacity-100" : "opacity-30"}`}>
                  {idx < currentStage ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-phosphor-green" />
                  ) : idx === currentStage ? (
                    <span className="w-3.5 h-3.5 border-2 border-phosphor-cyan border-t-transparent animate-spin rounded-full inline-block" />
                  ) : (
                    <span className="w-3.5 h-3.5 border border-tactical-border inline-block" />
                  )}
                  <span className={idx === currentStage ? "text-phosphor-cyan font-bold" : idx < currentStage ? "text-white" : "text-tactical-dim"}>
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) onFileUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-tactical-border hover:border-phosphor-cyan/70 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-black/30 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pcap,.pcapng,.cap"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onFileUpload(e.target.files[0]);
              }}
            />
            <Upload className="w-8 h-8 text-tactical-dim group-hover:text-phosphor-cyan mb-2 transition-colors" />
            <span className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              DROP PCAP / PCAPNG EVIDENCE FILE HERE
            </span>
            <span className="text-xs text-tactical-dim mt-0.5">
              or click to browse local capture archive (Max 200 MB)
            </span>
            <div className="mt-4 pt-3 border-t border-tactical-border/40 text-[10px] text-tactical-muted flex items-center gap-3">
              <span>SUPPORTED: PCAP · PCAPNG</span>
              <span>•</span>
              <span>PORTS: 25, 465, 587, 110, 995, 143, 993</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
