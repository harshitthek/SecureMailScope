"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DistributionItem } from "@/lib/types";

interface ProtocolChartProps {
  data: DistributionItem[];
}

export function ProtocolChart({ data }: ProtocolChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col h-full p-4 rounded-xl border border-soc-border bg-soc-card shadow-tactical-sm">
      <div className="flex items-center justify-between pb-3 border-b border-soc-border/60">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Transport & Protocol Telemetry
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            TLS encryption version distribution across inspected streams
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-border text-cyan-300 border border-soc-borderHighlight">
          {total} Active Flows
        </span>
      </div>

      <div className="relative flex-1 w-full min-h-[200px] flex items-center justify-center py-2">
        {mounted ? (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#080e1b"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as DistributionItem;
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
                      return (
                        <div className="p-2.5 rounded-lg border border-soc-borderHighlight bg-soc-bg/95 backdrop-blur-md shadow-tactical-sm text-xs font-mono">
                          <div className="flex items-center gap-1.5 font-bold text-slate-100">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <div className="mt-1 text-slate-400 text-[11px]">
                            {item.value} session{item.value > 1 ? "s" : ""} ({pct}% share)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Donut Telemetry Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
                {total}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                STREAMS
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-44 bg-soc-border/20 rounded-lg animate-pulse" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-soc-border/60 text-xs font-mono">
        {data.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={item.name} className="flex items-center justify-between p-2 rounded bg-soc-bg/70 border border-soc-border/60">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate text-[11px] font-medium">{item.name}</span>
              </div>
              <span className="font-bold tabular-nums text-slate-200 text-[11px] ml-2 flex items-center gap-1">
                <span>{item.value}</span>
                <span className="text-[9px] text-slate-500 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
