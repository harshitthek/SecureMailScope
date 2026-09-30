"use client";

import { useState, useRef } from "react";
import { Shield, Upload, FileArchive, ArrowRight, Play, Loader2 } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onLoadDemo: () => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onFileSelect, onLoadDemo, isAnalyzing }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleStart = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-2xl mx-auto px-4">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8 space-y-2">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          SecureMailScope
        </h1>
        <p className="text-xs text-slate-400 max-w-md">
          Passive Forensic Cryptographic Posture Assessment for SMTP, IMAP, and POP3 Network Captures
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-slate-800/60"
            : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
        } ${isAnalyzing ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pcap,.pcapng,.cap"
          onChange={handleChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center text-center space-y-3 py-6">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            <h3 className="text-sm font-semibold text-slate-200">
              Reconstructing Handshakes & Stream Cryptography...
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Extracting X.509 certs, evaluating forward secrecy, computing JA3
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center text-center space-y-4 py-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {formatFileSize(selectedFile.size)} • Ready for forensic parsing
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <span>Analyze Capture</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-200">
                Drop your email .pcap / .pcapng file here
              </p>
              <p className="text-xs text-slate-500">
                or click to browse your local filesystem
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              Supports .pcap, .pcapng up to 200MB
            </span>
          </div>
        )}
      </div>

      {/* Demo Action */}
      {!isAnalyzing && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onLoadDemo}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Sample Enterprise Audit PCAP</span>
          </button>
        </div>
      )}
    </div>
  );
}
