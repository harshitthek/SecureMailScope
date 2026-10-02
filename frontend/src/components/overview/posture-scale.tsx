"use client";

interface PostureScaleProps {
  score: number;
  semanticColor: string;
}

export function PostureScale({ score, semanticColor }: PostureScaleProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="w-full max-w-md pt-1 space-y-1.5 font-mono">
      <div className="relative w-full h-2 bg-black/60 border border-tactical-border/80">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: semanticColor,
          }}
        />
        {/* Score indicator needle / marker at score */}
        <div
          className="absolute -top-1 w-1 h-4 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ left: `calc(${clampedScore}% - 2px)` }}
          title={`Current Score: ${score}`}
        />
        {/* NIST Baseline Marker at 80 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-phosphor-green/80"
          style={{ left: "80%" }}
          title="80% NIST Baseline"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-tactical-dim">
        <span>0 FAIL</span>
        <span>50 DEGRADED</span>
        <span className="text-phosphor-green font-semibold">80 NIST BASELINE</span>
        <span>100</span>
      </div>
    </div>
  );
}
