"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";

interface CompactDropStripProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function CompactDropStrip({
  onFileSelect,
  isAnalyzing,
  error,
  onClearError,
}: CompactDropStripProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragOver(true);
    else if (e.type === "dragleave") setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="font-mono text-xs">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Ingest PCAP packet capture file"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        className={`w-full p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phosphor-cyan ${
          isDragOver
            ? "border-phosphor-cyan bg-phosphor-cyan/10"
            : "border-tactical-border bg-tactical-surface hover:border-tactical-highlight hover:bg-tactical-surfaceHover"
        } ${isAnalyzing ? "opacity-75 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pcap,.pcapng,.cap"
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          className="hidden"
          disabled={isAnalyzing}
        />

        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 text-phosphor-cyan animate-spin flex-shrink-0" />
          ) : (
            <Upload className="w-4 h-4 text-phosphor-green flex-shrink-0" />
          )}
          <div>
            <span className="font-bold text-[11px] text-white block">
              {isAnalyzing ? "DISSECTING PCAP STREAM..." : "[+] INGEST PCAP / PCAPNG"}
            </span>
            <span className="text-[9px] text-tactical-dim block uppercase">
              {isAnalyzing ? "Reassembling TCP & Handshakes" : "Drag drop or click to ingest"}
            </span>
          </div>
        </div>

        <span className="text-[9px] px-1.5 py-0.5 border border-tactical-border text-tactical-dim uppercase hidden sm:inline">
          RAW TAP
        </span>
      </div>

      {error && (
        <div className="mt-1.5 p-1.5 border border-phosphor-hazard/50 bg-phosphor-hazard/10 text-phosphor-hazard text-[10px] flex items-start justify-between gap-2">
          <span className="leading-snug">{error}</span>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-tactical-dim hover:text-white flex-shrink-0"
              title="Dismiss error"
              aria-label="Dismiss error"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
