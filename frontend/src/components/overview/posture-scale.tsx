"use client";

interface PostureScaleProps {
  score: number;
  semanticColor: string;
}

export function PostureScale({ score, semanticColor }: PostureScaleProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  // Ensure the CURRENT label doesn't overlap 0 FAIL on left or 80 NIST on right
  const labelLeftPercent = Math.min(Math.max(clampedScore, 18), 62);

  return (
    <div className="w-full max-w-md pt-1 font-mono">
      {/* Horizontal Instrument Bar */}
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

      {/* Measurement Ticks & Scale Labels */}
      <div className="relative w-full h-5 mt-1.5 text-[10px] text-tactical-dim select-none">
        <span className="absolute left-0">0 FAIL</span>

        {/* Dynamic Current Marker */}
        <span
          className="absolute font-bold whitespace-nowrap -translate-x-1/2 flex items-center gap-1"
          style={{
            left: `${labelLeftPercent}%`,
            color: semanticColor,
          }}
        >
          <span>{score}</span>
          <span>●</span>
          <span>CURRENT ↑</span>
        </span>

        {/* 80 NIST Baseline Marker */}
        <span className="absolute right-12 text-phosphor-green font-semibold">
          80 NIST BASELINE
        </span>

        <span className="absolute right-0">100</span>
      </div>
    </div>
  );
}
