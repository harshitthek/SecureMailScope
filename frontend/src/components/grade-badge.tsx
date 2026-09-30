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
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "B":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "C":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "D":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "F":
      default:
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const getSizeClasses = (s: "sm" | "md" | "lg") => {
    switch (s) {
      case "sm":
        return "px-1.5 py-0.5 text-xs font-semibold";
      case "lg":
        return "px-3 py-1.5 text-base font-bold";
      case "md":
      default:
        return "px-2 py-1 text-xs font-bold";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border uppercase tracking-wider ${getColors(
        grade
      )} ${getSizeClasses(size)}`}
    >
      Grade {grade}
    </span>
  );
}
