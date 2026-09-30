import { Grade } from "@/lib/types";

interface GradeBadgeProps {
  grade: Grade;
  size?: "sm" | "md" | "lg";
}

export function GradeBadge({ grade, size = "md" }: GradeBadgeProps) {
  const getColors = (g: Grade) => {
    switch (g) {
      case "A+":
      case "A":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
      case "B":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(14,165,233,0.2)]";
      case "C":
        return "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
      case "D":
        return "bg-orange-500/10 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]";
      case "F":
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]";
    }
  };

  const getSizeClasses = (s: "sm" | "md" | "lg") => {
    switch (s) {
      case "sm":
        return "px-1.5 py-0.5 text-[10px] font-semibold";
      case "lg":
        return "px-3 py-1 text-sm font-bold tracking-wider";
      case "md":
      default:
        return "px-2 py-0.5 text-xs font-bold tracking-wide";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded border font-mono uppercase tracking-wider ${getColors(
        grade
      )} ${getSizeClasses(size)}`}
    >
      Grade {grade}
    </span>
  );
}
