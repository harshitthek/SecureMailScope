"use client";

import React, { useState, useEffect } from "react";
import { getRemediationUrl } from "@/lib/api";
import { Copy, Check, Download, Terminal, Shield, FileCode2 } from "lucide-react";

interface PlaybookRuleInspectorProps {
  analysisId: string;
}

type TabKey = "ansible" | "suricata" | "snort";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; filename: string }[] = [
  { key: "ansible", label: "Ansible Hardening Playbook", icon: Terminal, filename: "mail_hardening.yml" },
  { key: "suricata", label: "Suricata IDS Rules", icon: Shield, filename: "suricata_mail_rules.rules" },
  { key: "snort", label: "Snort 3 Signatures", icon: FileCode2, filename: "snort3_mail_rules.lua" },
];

export function PlaybookRuleInspector({ analysisId }: PlaybookRuleInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("ansible");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    const url = getRemediationUrl(analysisId, activeTab);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rule payload");
        return res.text();
      })
      .then((text) => {
        if (!isCancelled) {
          setCode(text);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setCode(`# Error fetching remediation payload: ${err.message}\n# Endpoint: ${url}`);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [analysisId, activeTab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];
  const downloadUrl = getRemediationUrl(analysisId, activeTab);

  return (
    <div className="border border-[#1c1d22] bg-[#08080a] rounded-sm overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-[#1c1d22] bg-[#0c0d10] gap-2">
        <div className="flex items-center gap-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-[#16171d] text-white border border-[#2e3038] font-semibold"
                    : "text-[#9194a1] hover:text-white hover:bg-[#121317]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#cc9166]" : "text-[#777a88]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading}
            className="px-2.5 py-1 text-xs font-mono text-[#e2e3e9] bg-[#121317] hover:bg-[#1c1d22] border border-[#2e3038] rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#cc9166]" />}
            <span>{copied ? "COPIED" : "COPY"}</span>
          </button>
          <a
            href={downloadUrl}
            download={currentTab.filename}
            className="px-2.5 py-1 text-xs font-mono text-white bg-[#cc9166]/20 hover:bg-[#cc9166]/30 border border-[#cc9166]/50 rounded-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#cc9166]" />
            <span>DOWNLOAD</span>
          </a>
        </div>
      </div>

      <div className="relative p-4 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed bg-[#050507]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#777a88]">
            <span className="animate-pulse">SYNTHESIZING REMEDIATION ARTIFACT...</span>
          </div>
        ) : (
          <pre className="text-[#c5c7d3] whitespace-pre selection:bg-[#cc9166]/30">
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}
