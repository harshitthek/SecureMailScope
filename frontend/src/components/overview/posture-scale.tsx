"use client";

interface PostureScaleProps {
  score: number;
  semanticColor: string;
}

export function PostureScale({ score, semanticColor }: PostureScaleProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="w-full max-w-md pt-2 font-mono">
      {/* Horizontal Instrument Bar */}
      <div className="relative w-full h-3 bg-tactical-elevated border border-tactical-border/80">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: semanticColor,
          }}
        />
        {/* Score indicator needle / marker at score */}
        <div
          className="absolute -top-1 w-1.5 h-5 bg-tactical-text shadow-sm pointer-events-none"
          style={{ left: `calc(${clampedScore}% - 3px)` }}
          title={`Current Score: ${score}`}
        />
        {/* NIST Baseline Marker at 80% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-phosphor-green shadow-[0_0_4px_rgba(34,197,94,0.8)]"
          style={{ left: "80%" }}
          title="80% NIST Baseline"
        />
      </div>

      {/* Measurement Ticks & Scale Labels */}
      <div className="relative w-full h-5 mt-1.5 text-[12px] font-mono text-tactical-dim select-none flex items-center justify-between">
        <span className="font-medium">0 FAIL</span>
        <span className="pl-24 text-phosphor-green font-bold tracking-wider">
          ▲ 80 NIST BASELINE
        </span>
        <span className="font-medium">100</span>
      </div>
    </div>
  );
}
