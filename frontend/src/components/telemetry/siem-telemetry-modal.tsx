"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getSiemStatus, getSiemHistory, sendSiemTestAlert } from "@/lib/api";
import { SiemStatusResponse, SiemAlertRecord } from "@/lib/types";
import { Radio, X, Send, ShieldAlert, RefreshCw } from "lucide-react";

interface SiemTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiemTelemetryModal({ isOpen, onClose }: SiemTelemetryModalProps) {
  const [status, setStatus] = useState<SiemStatusResponse | null>(null);
  const [history, setHistory] = useState<SiemAlertRecord[]>([]);
  const [isSending, setIsSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([getSiemStatus(), getSiemHistory()]);
      setStatus(s);
      setHistory(h || []);
    } catch {
      // Fallback empty if backend unreachable
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, loadData]);

  const handleTestAlert = async () => {
    setIsSending(true);
    try {
      await sendSiemTestAlert({
        title: "SIMULATED_TEST_ALERT",
        severity: "medium",
        mitre_attack_id: "T1557.002",
        description: "Manual SOC test ping from SecureMailScope workstation.",
      });
      await loadData();
    } catch {
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans" onClick={onClose}>
      <div className="relative w-full max-w-3xl rounded-[10px] border border-[#2e3038] bg-[#07080a] shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-[#1c1d22]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#cc9166] uppercase font-mono">SOC Integration // RFC 5424 &amp; CEF</span>
              <h2 className="text-lg font-mono font-bold text-white">ENTERPRISE SIEM &amp; WEBHOOK TELEMETRY</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full border border-[#2e3038] text-[#9194a1] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
          <div className="p-3 rounded bg-[#0c0d10] border border-[#1c1d22]">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-white font-bold">RFC 5424 / CEF SYSLOG</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800">PORT 514 UDP</span>
            </div>
            <div className="text-[11px] font-mono text-[#9194a1] space-y-0.5">
              <div>HOST: <span className="text-[#e2e3e9]">{status?.syslog.host || "127.0.0.1"}</span></div>
              <div>DISPATCHED: <span className="text-emerald-400 font-bold">{status?.syslog.sent_count ?? 0}</span> | FAILED: <span className="text-rose-400">{status?.syslog.fail_count ?? 0}</span></div>
            </div>
          </div>

          <div className="p-3 rounded bg-[#0c0d10] border border-[#1c1d22]">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-white font-bold">WEBHOOK DISPATCHER</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#121317] text-[#cc9166] border border-[#2e3038]">HTTPS POST</span>
            </div>
            <div className="text-[11px] font-mono text-[#9194a1] space-y-0.5">
              <div>TARGET: <span className="text-[#e2e3e9]">SOAR / SLACK / TEAMS</span></div>
              <div>DISPATCHED: <span className="text-emerald-400 font-bold">{status?.webhook.sent_count ?? 0}</span> | FAILED: <span className="text-rose-400">{status?.webhook.fail_count ?? 0}</span></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 border-t border-[#1c1d22] pt-3 pr-1 min-h-[160px]">
          <span className="text-[11px] font-mono uppercase text-[#777a88] block">Dispatched Alert Audit Trail ({history.length})</span>
          {history.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#777a88]">NO SIEM ALERTS DISPATCHED IN CURRENT SESSION.</div>
          ) : (
            history.map((alert, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#0c0d10] border border-[#1c1d22] font-mono text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {alert.title}
                  </span>
                  <span className="text-[10px] text-[#777a88]">{alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : "--:--:--"}</span>
                </div>
                <div className="text-[11px] text-[#9194a1] break-all">CEF: {alert.cef_payload || "CEF:0|SecureMailScope|PassiveTAP|2.0|..."}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#1c1d22] mt-3">
          <button type="button" onClick={handleTestAlert} disabled={isSending} className="px-3 py-1.5 rounded bg-[#121317] hover:bg-[#1a1c22] border border-[#2e3038] text-xs font-mono text-white flex items-center gap-2 disabled:opacity-50">
            {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#cc9166]" /> : <Send className="w-3.5 h-3.5 text-[#cc9166]" />}
            <span>SEND SIEM TEST ALERT</span>
          </button>
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded bg-[#cc9166] text-black text-xs font-mono font-semibold hover:bg-[#d89f75]">CLOSE</button>
        </div>
      </div>
    </div>
  );
}
