"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // Fallback for sandboxed environments
      }
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // Fallback for sandboxed environments
      }
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "Daylight Forensic (Light)" : "Night-time SOC (Dark)"} mode`}
      title={`Current: ${theme.toUpperCase()} mode. Click to switch.`}
      className={`w-[32px] sm:w-[34px] h-[32px] sm:h-[34px] p-0 flex items-center justify-center flex-shrink-0 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phosphor-cyan ${
        mounted && theme === "light"
          ? "bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 border border-amber-600/70 text-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.45)] hover:brightness-105 active:scale-95"
          : "bg-tactical-surface border border-tactical-border hover:border-amber-400/60 text-tactical-dim hover:text-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.25)] active:scale-95"
      }`}
    >
      {mounted && theme === "light" ? (
        <Sun className="w-4 h-4 text-amber-950 fill-amber-950/20" />
      ) : (
        <Moon className="w-4 h-4 text-phosphor-cyan" />
      )}
    </button>
  );
}
