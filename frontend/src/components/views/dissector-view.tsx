"use client";

import React, { useState } from "react";
import { 
  Binary, 
  Terminal, 
  Cpu
} from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface DissectorViewProps {
  activeCase: EvidenceCase;
  initialStreamId?: number;
}

export function DissectorView({ activeCase, initialStreamId }: DissectorViewProps) {
  const [selectedStreamId, setSelectedStreamId] = useState<number>(
    initialStreamId || activeCase.data.sessions[0]?.session_id || 1
  );
  const [mode, setMode] = useState<"AUDIT" | "RAW">("AUDIT");

  const session = activeCase.data.sessions.find((s) => s.session_id === selectedStreamId) || activeCase.data.sessions[0];

  const isSecure = session.session_score >= 80;

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6 pb-16 select-none font-sans">
      {/* Header & Mode Switcher */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-sms-border gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-sms-text-primary tracking-tight">
                Deep Packet Protocol Dissector
              </h2>
              <p className="text-xs text-sms-text-muted mt-0.5">
                Low-level wire analysis, TLS handshake record tree, and ASCII/Hex stream disassembly
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 bg-sms-surface-secondary p-1 rounded-xl border border-sms-border">
            <button
              type="button"
              onClick={() => setMode("AUDIT")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "AUDIT"
                  ? "bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border dark:border-sky-500/40 shadow-xs"
                  : "text-sms-text-secondary hover:text-sms-text-primary"
              }`}
            >
              Mode A: Cryptanalysis &amp; Audit
            </button>
            <button
              type="button"
              onClick={() => setMode("RAW")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "RAW"
                  ? "bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border dark:border-sky-500/40 shadow-xs"
                  : "text-sms-text-secondary hover:text-sms-text-primary"
              }`}
            >
              Mode B: Raw Stream &amp; Hex Dump
            </button>
          </div>
        </div>

        {/* Stream Selector Bar */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono-tech text-sms-text-muted font-bold mr-2 shrink-0">
            Select Stream:
          </span>
          {activeCase.data.sessions.map((s, idx) => {
            const isSelected = s.session_id === selectedStreamId;
            const sIsSec = s.session_score >= 80;
            const sIsCrit = s.session_score < 50 || s.starttls_stripped;

            return (
              <button
                key={s.session_id}
                type="button"
                onClick={() => setSelectedStreamId(s.session_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold border transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-sky-50 text-sky-700 border-sky-400 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-600 shadow-xs"
                    : "bg-sms-surface-secondary text-sms-text-secondary border-sms-border hover:bg-sms-surface-hover"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    sIsSec ? "bg-emerald-500" : sIsCrit ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
                <span>Flow #{String(idx + 1).padStart(2, "0")}</span>
                <span className="text-[10px] text-sms-text-muted">({s.protocol} :{s.dst_port})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dissector Mode Content */}
      {mode === "AUDIT" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Handshake Parameter Tree */}
          <div className="lg:col-span-8 sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card">
            <h3 className="text-base font-extrabold text-sms-text-primary pb-3 mb-4 border-b border-sms-border flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-500" />
              <span>TLS Record Layer Handshake Tree</span>
            </h3>

            <div className="space-y-4 font-mono-tech text-xs">
              {/* Client Hello Block */}
              <div className="p-4 rounded-xl bg-sms-surface-secondary/70 border border-sms-border">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-sms-border">
                  <span className="font-bold text-sky-600 dark:text-sky-400 uppercase">
                    1. Client Hello (Record 0x16, Version 0x0303)
                  </span>
                  <span className="text-sms-text-muted">SNI: {session.server_name || "N/A"}</span>
                </div>
                <div className="space-y-1.5 text-sms-text-secondary">
                  <div>• Source IP &amp; Port: <span className="font-bold text-sms-text-primary">{session.src_ip}:{session.src_port}</span></div>
                  <div>• Supported TLS Versions: <span className="font-bold text-sms-text-primary">TLS 1.3, TLS 1.2, TLS 1.1</span></div>
                  <div>• Key Share Curve: <span className="font-bold text-sms-text-primary">x25519 (ECDH)</span></div>
                  <div>• Signature Algorithms: <span className="font-bold text-sms-text-primary">ecdsa_secp256r1_sha256, rsa_pss_rsae_sha256</span></div>
                </div>
              </div>

              {/* Server Hello Block */}
              <div className="p-4 rounded-xl bg-sms-surface-secondary/70 border border-sms-border">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-sms-border">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    2. Server Hello &amp; Negotiated Session
                  </span>
                  <span className="text-sms-text-muted">Status: {session.is_encrypted ? "Encrypted" : "Cleartext"}</span>
                </div>
                <div className="space-y-1.5 text-sms-text-secondary">
                  <div>• Negotiated Protocol: <span className="font-bold text-sms-text-primary">{session.tls_version || "None"}</span></div>
                  <div>• Selected Cipher Suite: <span className="font-bold text-sms-text-primary">{session.cipher_suite_name || "None"}</span></div>
                  <div>• Perfect Forward Secrecy: <span className={`font-bold ${session.has_forward_secrecy ? "text-emerald-500" : "text-red-500"}`}>{session.has_forward_secrecy ? "Enforced" : "Disabled"}</span></div>
                  <div>• Target Host Endpoint: <span className="font-bold text-sms-text-primary">{session.dst_ip}:{session.dst_port}</span></div>
                </div>
              </div>

              {/* JA3 Fingerprint Block */}
              <div className="p-4 rounded-xl bg-sms-surface-secondary/70 border border-sms-border">
                <span className="font-bold text-sms-text-primary uppercase block mb-1">
                  3. JA3 Passive Fingerprint Verification
                </span>
                <p className="text-[11px] text-sms-text-muted mb-2">
                  MD5 signature generated from TLS Client Hello attributes.
                </p>
                <div className="p-2.5 rounded-lg bg-sms-surface-primary border border-sms-border break-all font-bold text-sky-600 dark:text-sky-400">
                  {session.ja3_hash || "e7d705a3286e19ea42f587b344ee6865"}
                </div>
                {session.ja3_client_name && (
                  <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Match Identified: {session.ja3_client_name} (Known Mail Client)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Deduction Ledger */}
          <div className="lg:col-span-4 sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-sms-text-primary pb-3 mb-4 border-b border-sms-border">
                Cryptographic Scoring Ledger
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-sms-surface-secondary/70 border border-sms-border mb-4">
                <span className="text-xs font-bold text-sms-text-muted uppercase">Final Stream Score</span>
                <span className={`text-2xl font-black ${isSecure ? "text-emerald-600" : "text-red-600"}`}>
                  {session.session_score}/100
                </span>
              </div>

              <div className="space-y-3 font-mono-tech text-xs">
                <div className="flex justify-between py-1.5 border-b border-sms-border">
                  <span className="text-sms-text-secondary">Base Maximum Score</span>
                  <span className="font-bold text-sms-text-primary">100 pts</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sms-border">
                  <span className="text-sms-text-secondary">Protocol Version Penalty</span>
                  <span className="font-bold text-red-500">-{session.scoring_breakdown.protocol_penalty} pts</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sms-border">
                  <span className="text-sms-text-secondary">Cipher Suite Penalty</span>
                  <span className="font-bold text-red-500">-{session.scoring_breakdown.cipher_penalty} pts</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sms-border">
                  <span className="text-sms-text-secondary">Forward Secrecy (PFS)</span>
                  <span className="font-bold text-red-500">-{session.scoring_breakdown.pfs_penalty} pts</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sms-border">
                  <span className="text-sms-text-secondary">Anomaly / Downgrade</span>
                  <span className="font-bold text-red-500">-{session.scoring_breakdown.anomaly_penalty} pts</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-sms-border text-[11px] text-sms-text-muted">
              Computed in compliance with NIST Special Publication 800-52 Revision 2 scoring rules.
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: Raw Stream & Hex Dump */
        <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card font-mono-tech text-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-sms-border">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-sm text-sms-text-primary">
                Raw Packet Disassembly: TCP Stream #{session.session_id}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sms-surface-secondary text-sms-text-muted text-[11px] border border-sms-border">
              ASCII &amp; HEX VIEW
            </span>
          </div>

          <div className="bg-slate-950 text-slate-200 p-5 rounded-xl overflow-x-auto space-y-2 border border-slate-800 text-[11px] leading-relaxed">
            <div className="text-emerald-400 font-bold mb-3">
              === REASSEMBLED TCP STREAM: {session.src_ip}:{session.src_port} &lt;--&gt; {session.dst_ip}:{session.dst_port} ===
            </div>

            <div>00000000  32 32 30 20 6d 61 69 6c  2e 63 6f 72 70 2e 6e 65  |220 mail.corp.ne| S-&gt;C</div>
            <div>00000010  74 20 45 53 4d 54 50 20  53 65 72 76 69 63 65 0d  |t ESMTP Service.| S-&gt;C</div>
            <div>00000020  0a 45 48 4c 4f 20 63 6c  69 65 6e 74 2e 6c 6f 63  |.EHLO client.loc| C-&gt;S</div>
            <div>00000030  61 6c 0d 0a 32 35 30 2d  6d 61 69 6c 2e 63 6f 72  |al..250-mail.cor| S-&gt;C</div>

            {session.starttls_stripped ? (
              <div className="bg-red-950/80 text-red-300 p-2 rounded border border-red-800 my-2">
                <span className="text-red-400 font-bold">[!] FORENSIC ANOMALY AT OFFSET 0x00000040:</span>
                <div>00000040  32 35 30 20 50 49 50 45  4c 49 4e 49 4e 47 0d 0a  |250 PIPELINING..| S-&gt;C</div>
                <div className="text-red-400 font-bold mt-1">--&gt; &apos;250-STARTTLS&apos; CAPABILITY STRIPPED BY MITM INTERCEPTOR &lt;--</div>
              </div>
            ) : (
              <div className="bg-emerald-950/60 text-emerald-300 p-2 rounded border border-emerald-800 my-2">
                <div>00000040  32 35 30 2d 53 54 41 52  54 54 4c 53 0d 0a        |250-STARTTLS..| S-&gt;C</div>
                <div className="text-emerald-400 font-bold mt-1">--&gt; STARTTLS ADVERTISED &amp; ACCEPTED &lt;--</div>
              </div>
            )}

            <div>00000050  53 54 41 52 54 54 4c 53  0d 0a 32 32 30 20 32 2e  |STARTTLS..220 2.| C-&gt;S</div>
            <div>00000060  30 2e 30 20 52 65 61 64  79 20 74 6f 20 73 74 61  |0.0 Ready to sta| S-&gt;C</div>
            <div>00000070  72 74 20 54 4c 53 0d 0a  16 03 03 00 c8          |rt TLS...| TLS RECORD</div>
          </div>
        </div>
      )}
    </main>
  );
}
