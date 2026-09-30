"use client";

import { useState, useRef } from "react";
import { Shield, Upload, FileCode2, Play, Loader2, ArrowRight } from "lucide-react";
import { UploadCapabilities } from "./upload-capabilities";

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
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };
  const formatSize = (b: number) =>
    b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-4xl mx-auto px-4 py-8 relative">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-[11px] font-mono mb-4 tracking-wider uppercase shadow-[0_0_12px_rgba(14,165,233,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        NTRO CYBER INTELLIGENCE DEFENSE AUDIT // SIH26159
      </div>

      <div className="flex flex-col items-center text-center mb-8 space-y-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-tactical-glow">
          <Shield className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          SecureMailScope
        </h1>
        <p className="text-xs text-slate-400 max-w-lg font-sans">
          Passive Forensic Cryptographic Posture Assessment & Vulnerability Inspection for Defense Email Communications
        </p>
      </div>

      {/* Main Tactical Drop HUD */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        className={`hud-corner relative flex flex-col items-center justify-center w-full max-w-2xl p-8 rounded-2xl border transition-all cursor-pointer ${
          dragActive
            ? "border-cyan-400 bg-soc-cardHover shadow-tactical-glow scale-[1.01]"
            : "border-soc-border bg-soc-card/90 hover:border-soc-borderHighlight hover:bg-soc-cardHover shadow-tactical-sm"
        } ${isAnalyzing ? "pointer-events-none opacity-90" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pcap,.pcapng,.cap"
          onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
          className="hidden"
          disabled={isAnalyzing}
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-40" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight font-sans">
                Executing Forensic Stream Dissection...
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Reassembling TCP flows • Decapsulating Handshakes • Auditing NIST 800-52r2
              </p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center text-center space-y-4 py-4 w-full">
            <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100 font-mono">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {formatSize(selectedFile.size)} • Network Packet Capture Ready
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(selectedFile);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-tactical-glow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>Initiate Cryptographic Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3 py-6">
            <div className="w-12 h-12 rounded-xl bg-soc-border/60 border border-soc-border flex items-center justify-center text-slate-300">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drop Raw Network Capture (<span className="font-mono text-cyan-400">.pcap</span> / <span className="font-mono text-cyan-400">.pcapng</span>)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag and drop stream capture or click to browse local storage
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Supports SMTP, IMAP, and POP3 packet captures up to 200MB
            </span>
          </div>
        )}
      </div>

      {/* Forensic Demo Action */}
      {!isAnalyzing && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onLoadDemo}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-soc-borderHighlight bg-soc-card hover:bg-soc-cardHover text-slate-200 text-xs font-mono font-medium transition-all shadow-tactical-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Load Sample Multi-Vector Defense Evidence PCAP</span>
          </button>
        </div>
      )}

      {/* Capabilities Matrix */}
      <UploadCapabilities />
    </div>
  );
}
