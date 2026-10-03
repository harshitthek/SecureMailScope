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
    <div className="flex flex-col h-full p-4 border border-tactical-border bg-tactical-surface">
      <div className="flex items-center justify-between pb-3 border-b border-tactical-border">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-phosphor-cyan" />
            TLS Version Distribution
          </h3>
          <p className="text-[11px] text-tactical-dim font-mono mt-0.5">
            Active encryption protocols across wire streams
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-tactical-surfaceHover text-phosphor-cyan border border-tactical-border">
          {total} ACTIVE FLOWS
        </span>
      </div>

      <div className="relative flex-1 w-full min-h-[170px] flex items-center justify-center py-2">
        {mounted ? (
          <>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="var(--background)"
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
                        <div className="p-2 border border-tactical-border bg-tactical-surface text-xs font-mono shadow-xl">
                          <div className="flex items-center gap-1.5 font-bold text-tactical-text">
                            <span className="w-2 h-2" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <div className="mt-1 text-tactical-dim text-[11px]">
                            {item.value} stream{item.value > 1 ? "s" : ""} ({pct}% share)
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
              <span className="text-xl font-bold font-mono tracking-tight text-tactical-text tabular-nums">
                {total}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-tactical-dim">
                STREAMS
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-40 bg-tactical-border/20 animate-pulse" />
        )}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-tactical-border text-xs font-mono">
        {data.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={item.name} className="flex items-center justify-between p-1.5 bg-tactical-surfaceHover border border-tactical-border">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-tactical-text truncate text-[11px] font-bold">{item.name}</span>
              </div>
              <div className="font-bold tabular-nums text-tactical-text text-[11px] ml-2 flex items-center gap-1">
                <span>{item.value}</span>
                <span className="text-[9px] text-tactical-dim font-normal">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
