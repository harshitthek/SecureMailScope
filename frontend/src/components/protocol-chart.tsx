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

  return (
    <div className="flex flex-col h-full p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Protocol & TLS Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Session transport encryption profile
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px] flex items-center justify-center pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-48 bg-slate-800/20 rounded-lg animate-pulse" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 truncate">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-400 ml-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
