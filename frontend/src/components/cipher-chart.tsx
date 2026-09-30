"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CipherDistributionItem } from "@/lib/types";

interface CipherChartProps {
  data: CipherDistributionItem[];
}

export function CipherChart({ data }: CipherChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCiphers = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="flex flex-col h-full p-4 rounded-xl border border-soc-border bg-soc-card shadow-tactical-sm">
      <div className="flex items-center justify-between pb-3 border-b border-soc-border/60">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Cipher Suite Cryptanalysis
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Negotiated stream ciphers evaluated against NIST SP 800-52r2
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-border text-cyan-300 border border-soc-borderHighlight">
          {data.length} Distinct Ciphers
        </span>
      </div>

      <div className="flex-1 w-full min-h-[200px] flex items-center justify-center py-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 6, right: 20, left: 10, bottom: 6 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fill: "#94a3b8", fontSize: 10.5, fontFamily: "var(--font-geist-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(30, 41, 59, 0.4)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CipherDistributionItem;
                    const pct = totalCiphers > 0 ? ((item.count / totalCiphers) * 100).toFixed(0) : "0";
                    return (
                      <div className="p-2.5 rounded-lg border border-soc-borderHighlight bg-soc-bg/95 backdrop-blur-md shadow-tactical-sm text-xs font-mono">
                        <div className="font-bold text-slate-100">{item.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>{item.count} flow{item.count > 1 ? "s" : ""} ({pct}%)</span>
                          <span
                            className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded border"
                            style={{ borderColor: item.color, color: item.color }}
                          >
                            {item.severity}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-44 bg-soc-border/20 rounded-lg animate-pulse" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-soc-border/60 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="text-slate-300">AEAD Modern (GCM/ChaCha)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-slate-300">CBC Mode (Legacy)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
          <span className="text-slate-300">Cleartext (Unencrypted)</span>
        </span>
      </div>
    </div>
  );
}
