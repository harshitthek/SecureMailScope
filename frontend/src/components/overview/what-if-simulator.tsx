"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Sliders, 
  Sparkles, 
  Copy, 
  Check, 
  Terminal, 
  RotateCcw,
  TrendingUp,
  Download,
  Activity,
  ShieldAlert,
  Table,
  Box
} from "lucide-react";
import { EvidenceCase, Grade } from "@/lib/types";
import { SimulationPlaybackControls } from "./what-if/simulation-playback-controls";
import { SimulationWirePipeline } from "./what-if/simulation-wire-pipeline";
import { Simulation3DPipeline } from "./what-if/simulation-3d-pipeline";
import { SimulationCrtTicker } from "./what-if/simulation-crt-ticker";
import { SimulationThreatMatrix } from "./what-if/simulation-threat-matrix";
import { SimulationStreamLedger } from "./what-if/simulation-stream-ledger";

interface WhatIfSimulatorProps {
  activeCase: EvidenceCase;
}

export function WhatIfSimulator({ activeCase }: WhatIfSimulatorProps) {
  const [enforceTls13, setEnforceTls13] = useState(false);
  const [enforcePfs, setEnforcePfs] = useState(false);
  const [enforceAead, setEnforceAead] = useState(false);
  const [renewCerts, setRenewCerts] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);
  const [viewTab, setViewTab] = useState<"SIMULATION" | "CONFIG">("SIMULATION");
  const [simVisualTab, setSimVisualTab] = useState<"PIPELINE" | "TERMINAL" | "THREATS" | "LEDGER">("PIPELINE");
  const [pipelineMode, setPipelineMode] = useState<"3D" | "2D">("3D");

  // Live simulation playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [speed, setSpeed] = useState<1 | 2>(1);

  // Playback loop effect
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = speed === 1 ? 1400 : 700;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= 4) {
          setIsPlaying(false);
          return 4;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStage >= 4) {
        setCurrentStage(0);
      }
      setIsPlaying(true);
    }
  };

  const stepForward = () => {
    if (currentStage < 4) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStage(0);
  };

  const toggleSpeed = () => {
    setSpeed((s) => (s === 1 ? 2 : 1));
  };

  const hasRemediation = useMemo(() => {
    return Boolean(enforceTls13 || enforcePfs || enforceAead || renewCerts || activeCase.id === "CASE-01");
  }, [enforceTls13, enforcePfs, enforceAead, renewCerts, activeCase.id]);

  const effectiveStage = hasRemediation ? currentStage : 0;

  const simulatedResults = useMemo(() => {
    const sessions = activeCase.data.sessions;
    if (!sessions || sessions.length === 0) {
      return {
        score: activeCase.data.enterprise_score,
        grade: activeCase.data.enterprise_grade,
        delta: 0,
        compliantStreams: 0,
      };
    }

    const simScores = sessions.map((s) => {
      let protoPen = Math.abs(s.scoring_breakdown?.protocol_penalty ?? 0);
      let cipherPen = Math.abs(s.scoring_breakdown?.cipher_penalty ?? 0);
      let pfsPen = Math.abs(s.scoring_breakdown?.pfs_penalty ?? 0);
      let certPen = Math.abs(s.scoring_breakdown?.cert_penalty ?? 0);
      const anomPen = Math.abs(s.scoring_breakdown?.anomaly_penalty ?? 0);

      if (enforceTls13) protoPen = 0;
      if (enforceAead) cipherPen = 0;
      if (enforcePfs) pfsPen = 0;
      if (renewCerts) certPen = 0;

      const raw = 100 - (protoPen + cipherPen + pfsPen + certPen + anomPen);
      return Math.max(0, Math.min(100, raw));
    });

    const avg = Math.round(simScores.reduce((a, b) => a + b, 0) / simScores.length);
    let grade: Grade = "F";
    if (avg >= 90) grade = "A+";
    else if (avg >= 80) grade = "A";
    else if (avg >= 70) grade = "B";
    else if (avg >= 60) grade = "C";
    else if (avg >= 50) grade = "D";

    const compliant = simScores.filter((sc) => sc >= 80).length;

    return {
      score: avg,
      grade,
      delta: avg - activeCase.data.enterprise_score,
      compliantStreams: compliant,
    };
  }, [activeCase, enforceTls13, enforcePfs, enforceAead, renewCerts]);

  const activeTogglesCount = [enforceTls13, enforcePfs, enforceAead, renewCerts].filter(Boolean).length;

  const resetPolicies = () => {
    setEnforceTls13(false);
    setEnforcePfs(false);
    setEnforceAead(false);
    setRenewCerts(false);
    resetSimulation();
  };

  const applyAllPolicies = () => {
    setEnforceTls13(true);
    setEnforcePfs(true);
    setEnforceAead(true);
    setRenewCerts(true);
    setCurrentStage(0);
    setIsPlaying(true);
  };

  const generatedConfig = useMemo(() => {
    const lines = [
      "# ===========================================================================",
      "# SECUREMAILSCOPE POLICY HARDENING PATCH — GENERATED FOR POSTFIX & DOVECOT",
      `# Case Reference: ${activeCase.id} | Target Posture: Grade A+ (NIST SP 800-52r2)`,
      "# ===========================================================================",
      "",
      "# --- Postfix MTA Main Configuration (/etc/postfix/main.cf) ---",
      "# Opportunistic TLS on public MX port 25 to receive peer mail without dropping connections",
      "smtpd_tls_security_level = may",
      "smtp_tls_security_level = dane",
      "smtp_dns_support_level = dnssec",
    ];

    if (enforceTls13) {
      lines.push("smtpd_tls_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1, !TLSv1.2");
      lines.push("smtpd_tls_mandatory_protocols = >=TLSv1.3");
      lines.push("smtp_tls_mandatory_protocols = >=TLSv1.3");
    } else {
      lines.push("smtpd_tls_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1");
      lines.push("smtpd_tls_mandatory_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1");
    }

    if (enforcePfs || enforceAead) {
      lines.push("smtpd_tls_ciphers = high");
      lines.push("smtpd_tls_mandatory_ciphers = high");
      lines.push("tls_high_cipherlist = ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM");
      lines.push("tls_preempt_cipherlist = yes");
      lines.push("smtpd_tls_eecdh_grade = ultra");
      lines.push("smtpd_tls_exclude_ciphers = aNULL, eNULL, EXPORT, DES, RC4, MD5, PSK, aECDH, 3DES");
    }

    if (renewCerts) {
      lines.push("smtpd_tls_cert_file = /etc/letsencrypt/live/mail.defense.gov.in/fullchain.pem");
      lines.push("smtpd_tls_key_file = /etc/letsencrypt/live/mail.defense.gov.in/privkey.pem");
      lines.push("smtpd_tls_CAfile = /etc/ssl/certs/ca-certificates.crt");
    }

    lines.push("");
    lines.push("# --- Postfix Submission Listeners (/etc/postfix/master.cf) ---");
    lines.push("# Enforce mandatory TLS encryption on non-MX submission ports (587 / 465)");
    lines.push("submission inet n       -       y       -       -       smtpd");
    lines.push("  -o smtpd_tls_security_level=encrypt");
    lines.push("  -o smtpd_sasl_auth_enable=yes");
    lines.push("smtps     inet  n       -       y       -       -       smtpd");
    lines.push("  -o smtpd_tls_security_level=encrypt");
    lines.push("  -o smtpd_tls_wrappermode=yes");
    lines.push("  -o smtpd_sasl_auth_enable=yes");

    lines.push("");
    lines.push("# --- Dovecot IMAP/POP3 Configuration (/etc/dovecot/conf.d/10-ssl.conf) ---");
    lines.push("ssl = required");
    if (enforceTls13) {
      lines.push("ssl_min_protocol = TLSv1.3");
    } else {
      lines.push("ssl_min_protocol = TLSv1.2");
    }
    if (enforceAead) {
      lines.push("ssl_cipher_list = ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:CHACHA20-POLY1305");
      lines.push("ssl_prefer_server_ciphers = yes");
    }

    return lines.join("\n");
  }, [activeCase, enforceTls13, enforcePfs, enforceAead, renewCerts]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([generatedConfig], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hardening_${activeCase.case_code.toLowerCase()}_directives.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1c1d22] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
                Interactive Hardening Sandbox
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#121317] text-[#34d399] border border-[#34d399]/30">
                WHAT-IF ENGINE (LIVE)
              </span>
            </div>
            <h3 className="text-xl font-serif font-normal text-white tracking-[0.01em]">
              Real-Time Posture Elevation &amp; Threat Remediation Simulator
            </h3>
            <p className="text-xs text-[#9194a1] mt-0.5">
              Simulate cryptographic hardening policies across intercepted wire streams with live packet interception telemetry
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center rounded-full bg-[#121317] border border-[#2e3038] p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewTab("SIMULATION")}
              className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                viewTab === "SIMULATION" ? "bg-white text-black font-semibold" : "text-[#9194a1] hover:text-white"
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Simulator Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("CONFIG")}
              className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                viewTab === "CONFIG" ? "bg-white text-black font-semibold" : "text-[#9194a1] hover:text-white"
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Remediation Patch</span>
            </button>
          </div>
        </div>
      </div>

      {viewTab === "SIMULATION" ? (
        <div className="flex flex-col gap-5">
          {/* Top Row: 4 Policy Switches (Left) + Projected Delta Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: 4 Policy Switches */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] text-[#9194a1] uppercase tracking-wider font-semibold">
                  Defense Policy Levers ({activeTogglesCount}/4 ACTIVE)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetPolicies}
                    className="text-[11px] text-[#9194a1] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <span className="text-[#2e3038]">•</span>
                  <button
                    type="button"
                    onClick={applyAllPolicies}
                    className="text-[11px] text-[#cc9166] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Max Hardening</span>
                  </button>
                </div>
              </div>

              {/* Switch 1: Mandate TLS 1.3 */}
              <label className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                enforceTls13 ? "bg-[#121317] border-[#cc9166]/60 text-white" : "bg-[#08080a] border-[#1c1d22] text-[#9194a1] hover:border-[#2e3038]"
              }`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">1. Mandate TLS 1.3 (RFC 8446)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#1c1d22] text-[#cc9166]">NIST §3.1</span>
                  </div>
                  <p className="text-[11px] text-[#9194a1] font-sans">
                    Eliminates legacy TLS 1.0/1.1 and POODLE/Lucky13 fallback vectors. Immunizes against submission downgrade.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceTls13}
                  onChange={(e) => {
                    setEnforceTls13(e.target.checked);
                    if (e.target.checked) setCurrentStage(1);
                  }}
                  className="mt-1 w-4 h-4 accent-[#cc9166] cursor-pointer"
                />
              </label>

              {/* Switch 2: Enforce Ephemeral PFS */}
              <label className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                enforcePfs ? "bg-[#121317] border-[#cc9166]/60 text-white" : "bg-[#08080a] border-[#1c1d22] text-[#9194a1] hover:border-[#2e3038]"
              }`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">2. Enforce Ephemeral Forward Secrecy (ECDHE)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#1c1d22] text-[#cc9166]">NIST §3.3.1</span>
                  </div>
                  <p className="text-[11px] text-[#9194a1] font-sans">
                    Prohibits static RSA key exchange. Defends against retrospective decryption if MTA private key is compromised.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enforcePfs}
                  onChange={(e) => {
                    setEnforcePfs(e.target.checked);
                    if (e.target.checked) setCurrentStage(2);
                  }}
                  className="mt-1 w-4 h-4 accent-[#cc9166] cursor-pointer"
                />
              </label>

              {/* Switch 3: AEAD Only */}
              <label className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                enforceAead ? "bg-[#121317] border-[#cc9166]/60 text-white" : "bg-[#08080a] border-[#1c1d22] text-[#9194a1] hover:border-[#2e3038]"
              }`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">3. Mandate Authenticated AEAD Ciphers</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#1c1d22] text-[#cc9166]">NIST §3.3.2</span>
                  </div>
                  <p className="text-[11px] text-[#9194a1] font-sans">
                    Restricts ciphers to AES-GCM and ChaCha20-Poly1305. Purges 3DES Sweet32 and CBC padding oracles.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceAead}
                  onChange={(e) => {
                    setEnforceAead(e.target.checked);
                    if (e.target.checked) setCurrentStage(3);
                  }}
                  className="mt-1 w-4 h-4 accent-[#cc9166] cursor-pointer"
                />
              </label>

              {/* Switch 4: Renew & CA-Sign Certs */}
              <label className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                renewCerts ? "bg-[#121317] border-[#cc9166]/60 text-white" : "bg-[#08080a] border-[#1c1d22] text-[#9194a1] hover:border-[#2e3038]"
              }`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">4. CA Trust Anchor &amp; 3072-bit Key Renewal</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#1c1d22] text-[#cc9166]">NIST §3.4</span>
                  </div>
                  <p className="text-[11px] text-[#9194a1] font-sans">
                    Replaces self-signed certificates and weak 1024-bit RSA keys with verified root authority certificates.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={renewCerts}
                  onChange={(e) => {
                    setRenewCerts(e.target.checked);
                    if (e.target.checked) setCurrentStage(4);
                  }}
                  className="mt-1 w-4 h-4 accent-[#cc9166] cursor-pointer"
                />
              </label>
            </div>

            {/* Right: Projected Score Impact Card */}
            <div className="lg:col-span-5 bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1c1d22]">
                  <span className="text-xs font-mono text-[#9194a1] uppercase font-semibold">
                    Projected Posture Delta
                  </span>
                  <span className="text-xs font-mono text-[#cc9166] flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{simulatedResults.delta > 0 ? `+${simulatedResults.delta}` : simulatedResults.delta} PTS</span>
                  </span>
                </div>

                {/* Score Split Card */}
                <div className="grid grid-cols-2 gap-3 py-4 text-center">
                  <div className="p-3.5 rounded-[8px] bg-[#121317] border border-[#1c1d22]">
                    <span className="text-[10px] font-mono text-[#777a88] uppercase block mb-1">
                      Current Capture
                    </span>
                    <span className="text-3xl font-serif text-white block">
                      {activeCase.data.enterprise_score}
                    </span>
                    <span className="text-xs font-mono text-[#9194a1] mt-0.5 block">
                      Grade {activeCase.data.enterprise_grade}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[#121317] border border-[#34d399]/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-[#34d399]/10 rounded-bl-full" />
                    <span className="text-[10px] font-mono text-[#34d399] uppercase block mb-1 font-semibold">
                      Simulated Projected
                    </span>
                    <span className="text-3xl font-serif text-[#34d399] block">
                      {simulatedResults.score}
                    </span>
                    <span className="text-xs font-mono text-[#34d399] mt-0.5 block font-semibold">
                      Grade {simulatedResults.grade}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 py-2 font-mono text-xs">
                  <div className="flex justify-between text-[11px] text-[#9194a1]">
                    <span>Posture Index Elevation</span>
                    <span>{simulatedResults.score} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-[#121317] rounded-full overflow-hidden border border-[#1c1d22]">
                    <div
                      className="h-full bg-gradient-to-r from-[#cc9166] to-[#34d399] transition-all duration-300"
                      style={{ width: `${simulatedResults.score}%` }}
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2 pt-3 text-xs font-mono text-[#acafb9]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9194a1]">• Compliant Wire Streams:</span>
                    <span className="text-white font-medium">{simulatedResults.compliantStreams} / {activeCase.data.total_sessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9194a1]">• Cryptographic Headroom:</span>
                    <span className="text-[#34d399] font-medium">
                      {100 - simulatedResults.score === 0 ? "Zero Residual Vulnerability" : `${100 - simulatedResults.score} pts remaining`}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewTab("CONFIG")}
                className="mt-4 w-full py-2.5 rounded-full bg-[#121317] hover:bg-[#1c1d22] border border-[#2e3038] hover:border-[#cc9166] text-[#cc9166] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Inspect Generated Configuration Directives</span>
              </button>
            </div>
          </div>

          {/* Middle Row: Playback Controls HUD */}
          <SimulationPlaybackControls
            isPlaying={isPlaying}
            currentStage={currentStage}
            speed={speed}
            onTogglePlay={togglePlay}
            onStepForward={stepForward}
            onReset={resetSimulation}
            onToggleSpeed={toggleSpeed}
            onSelectStage={(st) => setCurrentStage(st)}
          />

          {/* Interactive Visual Deck Subtabs */}
          <div className="flex items-center justify-between border-b border-[#1c1d22] pb-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSimVisualTab("PIPELINE")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                  simVisualTab === "PIPELINE"
                    ? "bg-[#cc9166] text-black font-semibold"
                    : "bg-[#121317] text-[#9194a1] hover:text-white border border-[#2e3038]"
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Wire Topology Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => setSimVisualTab("TERMINAL")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                  simVisualTab === "TERMINAL"
                    ? "bg-[#34d399] text-black font-semibold"
                    : "bg-[#121317] text-[#9194a1] hover:text-white border border-[#2e3038]"
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Forensic CRT Ticker</span>
              </button>

              <button
                type="button"
                onClick={() => setSimVisualTab("THREATS")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                  simVisualTab === "THREATS"
                    ? "bg-white text-black font-semibold"
                    : "bg-[#121317] text-[#9194a1] hover:text-white border border-[#2e3038]"
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>MITRE Threat Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => setSimVisualTab("LEDGER")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                  simVisualTab === "LEDGER"
                    ? "bg-white text-black font-semibold"
                    : "bg-[#121317] text-[#9194a1] hover:text-white border border-[#2e3038]"
                }`}
              >
                <Table className="w-3 h-3" />
                <span>Stream Diff Ledger</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {simVisualTab === "PIPELINE" && (
                <div className="flex items-center gap-1 bg-[#121317] p-0.5 rounded-full border border-[#2e3038] text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPipelineMode("3D")}
                    className={`px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                      pipelineMode === "3D"
                        ? "bg-[#34d399] text-black font-semibold"
                        : "text-[#9194a1] hover:text-white"
                    }`}
                  >
                    <Box className="w-2.5 h-2.5" />
                    <span>3D HOLOGRAPHIC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPipelineMode("2D")}
                    className={`px-2 py-0.5 rounded-full transition-colors ${
                      pipelineMode === "2D"
                        ? "bg-white text-black font-semibold"
                        : "text-[#9194a1] hover:text-white"
                    }`}
                  >
                    <span>2D SCHEMATIC</span>
                  </button>
                </div>
              )}

              <span className="text-[10px] text-[#777a88] hidden sm:inline">
                STAGE: {effectiveStage} / 4 ACTIVE
              </span>
            </div>
          </div>

          {/* Active Visual Subdeck Display */}
          {simVisualTab === "PIPELINE" && (
            pipelineMode === "3D" ? (
              <Simulation3DPipeline
                currentStage={effectiveStage}
                activeCase={activeCase}
                enforceTls13={enforceTls13}
                enforcePfs={enforcePfs}
                enforceAead={enforceAead}
                renewCerts={renewCerts}
                onSetStage={setCurrentStage}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
              />
            ) : (
              <SimulationWirePipeline
                currentStage={effectiveStage}
                activeCase={activeCase}
                enforceTls13={enforceTls13}
                enforcePfs={enforcePfs}
                enforceAead={enforceAead}
                renewCerts={renewCerts}
              />
            )
          )}

          {simVisualTab === "TERMINAL" && (
            <SimulationCrtTicker
              currentStage={effectiveStage}
              activeCase={activeCase}
            />
          )}

          {simVisualTab === "THREATS" && (
            <SimulationThreatMatrix
              currentStage={effectiveStage}
              activeCase={activeCase}
              enforceTls13={enforceTls13}
              enforcePfs={enforcePfs}
              enforceAead={enforceAead}
              renewCerts={renewCerts}
            />
          )}

          {simVisualTab === "LEDGER" && (
            <SimulationStreamLedger
              currentStage={effectiveStage}
              activeCase={activeCase}
              enforceTls13={enforceTls13}
              enforcePfs={enforcePfs}
              enforceAead={enforceAead}
              renewCerts={renewCerts}
            />
          )}
        </div>
      ) : (
        /* Configuration Patch View */
        <div className="flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9194a1] flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#cc9166]" />
              <span>Ready-to-Deploy Server Directives (NIST SP 800-52r2 Enforced)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadConfig}
                className="px-3.5 py-1 rounded-full bg-[#121317] hover:bg-[#1c1d22] border border-[#2e3038] hover:border-[#cc9166] text-[#cc9166] text-xs transition-colors flex items-center gap-1.5"
                title="Download directives as .conf file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .conf</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1 rounded-full bg-[#121317] hover:bg-[#1c1d22] border border-[#2e3038] hover:border-[#cc9166] text-[#e2e3e9] hover:text-white text-xs transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-[10px] bg-[#08080a] border border-[#1c1d22] text-[#e2e3e9] text-xs overflow-x-auto leading-relaxed max-h-80 select-text">
            {generatedConfig}
          </pre>
        </div>
      )}
    </div>
  );
}
