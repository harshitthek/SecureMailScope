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
    <div className="flex flex-col h-full p-4 border border-tactical-border bg-tactical-surface">
      <div className="flex items-center justify-between pb-3 border-b border-tactical-border">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-phosphor-cyan" />
            Cipher Suite Breakdown
          </h3>
          <p className="text-[11px] text-tactical-dim font-mono mt-0.5">
            Cryptographic primitives vs NIST SP 800-52r2
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-black/40 text-phosphor-cyan border border-tactical-border">
          {data.length} DISTINCT CIPHERS
        </span>
      </div>

      <div className="flex-1 w-full min-h-[170px] flex items-center justify-center py-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height={170}>
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
                tick={{ fill: "#8290a2", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CipherDistributionItem;
                    const pct = totalCiphers > 0 ? ((item.count / totalCiphers) * 100).toFixed(0) : "0";
                    return (
                      <div className="p-2 border border-tactical-border bg-black/95 text-xs font-mono shadow-xl">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-tactical-dim text-[11px]">
                          <span>{item.count} stream{item.count > 1 ? "s" : ""} ({pct}%)</span>
                          <span
                            className="uppercase text-[9px] font-bold px-1.5 py-0.2 border"
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
              <Bar dataKey="count">
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-40 bg-tactical-border/20 animate-pulse" />
        )}
      </div>

      {/* Legend Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-tactical-border text-[11px] font-mono text-tactical-dim">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-phosphor-green" />
          <span className="text-tactical-text">AEAD Modern (GCM/ChaCha)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-phosphor-amber" />
          <span className="text-tactical-text">CBC Mode (Legacy)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-phosphor-hazard" />
          <span className="text-tactical-text">Cleartext / Fallback</span>
        </span>
      </div>
    </div>
  );
}
