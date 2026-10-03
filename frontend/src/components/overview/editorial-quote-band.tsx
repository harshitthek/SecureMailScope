"use client";

import React from "react";
import { EvidenceCase } from "@/lib/types";

interface EditorialQuoteBandProps {
  activeCase: EvidenceCase;
}

export function EditorialQuoteBand({ activeCase }: EditorialQuoteBandProps) {
  return (
    <section className="w-full my-2 select-none font-sans">
      {/* 1. Large Didone Italic Pull Quote (Video Frame 00:12 Archetype) */}
      <div className="py-3 sm:py-4 text-center max-w-3xl mx-auto px-4">
        <blockquote className="font-serif italic font-normal text-lg sm:text-xl text-[#e2e3e9] leading-relaxed tracking-[0.01em]">
          &ldquo;Passive deep packet forensics enables total cryptographic visibility at the wire level &mdash; without disrupting production mail flow or requiring endpoint agents.&rdquo;
        </blockquote>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono">
          <span className="text-[#cc9166] uppercase font-semibold">NTRO CYBER DEFENSE DIRECTORATE</span>
          <span className="text-[#5e616e]">&middot;</span>
          <span className="text-[#9194a1]">ELECTRONIC INTELLIGENCE DIVISION</span>
        </div>
      </div>

      {/* 2. Full-Bleed 4-Column Big Stat Band (Video Frame 00:12) */}
      <div className="border-y border-[#1c1d22] py-4 sm:py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-white tracking-[0.01em] block">
              {activeCase.data.total_packets.toLocaleString()}
            </span>
            <span className="text-xs sm:text-[13px] text-[#9194a1] mt-1 block">
              Packets Ingested &amp; Analyzed
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-white tracking-[0.01em] block">
              {activeCase.data.total_sessions}
            </span>
            <span className="text-xs sm:text-[13px] text-[#9194a1] mt-1 block">
              Reassembled Transport Streams
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#cc9166] tracking-[0.01em] block">
              100%
            </span>
            <span className="text-xs sm:text-[13px] text-[#9194a1] mt-1 block">
              Wire Baseline Conformance
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#10b981] tracking-[0.01em] block">
              0
            </span>
            <span className="text-xs sm:text-[13px] text-[#9194a1] mt-1 block">
              External Egress (Air-Gapped)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
