"use client";

import React, { useState, useEffect } from "react";
import { getSpoolStatus, triggerSpoolScan } from "@/lib/api";
import { SpoolStatusResponse, AnalysisResult } from "@/lib/types";
import { FolderGit2, RefreshCw } from "lucide-react";

interface SpoolIngestionCardProps {
  onCaseLoaded?: (analysis: AnalysisResult) => void;
  onToast?: (msg: string, type?: "info" | "success" | "warning") => void;
}

export function SpoolIngestionCard({ onToast }: SpoolIngestionCardProps) {
  const [spool, setSpool] = useState<SpoolStatusResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await getSpoolStatus();
      setSpool(data);
    } catch {
      // Backend daemon status fallback
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleScan = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScanning(true);
    try {
      const res = await triggerSpoolScan();
      setSpool(res);
      if (onToast) onToast(`Spool scan complete: ${res.processed_count} processed`, "success");
    } catch {
      if (onToast) onToast("Spool directory scan failed", "warning");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="mt-4 p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center shrink-0">
          <FolderGit2 className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white font-sans">Automated Spool Daemon</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800">
              ACTIVE
            </span>
          </div>
          <span className="text-[11px] text-[#9194a1] block">
            WATCH: <span className="text-[#e2e3e9]">spool/incoming/</span> · INCOMING:{" "}
            <span className="text-[#cc9166] font-bold">{spool?.incoming_count ?? 0}</span> · PROCESSED:{" "}
            <span className="text-emerald-400">{spool?.processed_count ?? 0}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleScan}
        disabled={isScanning}
        className="px-3.5 py-1.5 rounded-full bg-[#121317] border border-[#2e3038] hover:border-[#cc9166] text-[#cc9166] text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 justify-center disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-[#cc9166]" : ""}`} />
        <span>{isScanning ? "SCANNING..." : "SCAN SPOOL NOW"}</span>
      </button>
    </div>
  );
}
