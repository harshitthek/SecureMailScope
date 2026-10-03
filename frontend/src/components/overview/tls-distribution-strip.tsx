"use client";

interface TlsDistributionStripProps {
  stats: Record<string, number>;
  totalFlows: number;
}

export function TlsDistributionStrip({ stats, totalFlows }: TlsDistributionStripProps) {
  return (
    <div className="space-y-3 font-mono text-[14px]">
      <div className="border-b border-tactical-border/70 pb-2 text-[12px] uppercase tracking-widest text-tactical-dim font-bold">
        TLS VERSION DISTRIBUTION
      </div>
      <div className="space-y-3">
        {Object.entries(stats).map(([ver, count]) => {
          const pct = totalFlows > 0 ? (count / totalFlows) * 100 : 0;
          const isCrit = ver === "CLEARTEXT" || ver.includes("1.0");
          const isSecure = ver === "TLS 1.3";

          return (
            <div key={ver} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className={
                    isSecure
                      ? "text-phosphor-green font-bold"
                      : isCrit && count > 0
                      ? "text-phosphor-hazard font-bold"
                      : "text-tactical-text font-medium"
                  }
                >
                  {ver}
                </span>
                <span className="text-tactical-dim tabular-nums font-bold">
                  {count} flow{count !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 bg-tactical-elevated border border-tactical-border/60">
                <div
                  className={`h-full ${
                    isSecure
                      ? "bg-phosphor-green"
                      : isCrit && count > 0
                      ? "bg-phosphor-hazard"
                      : "bg-phosphor-amber"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
