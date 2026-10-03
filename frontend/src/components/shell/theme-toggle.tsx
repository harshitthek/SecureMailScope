"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("sms_theme", nextTheme);
    } catch {
      // ignore storage errors
    }

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div
        className="w-10 h-10 rounded-xl border border-sms-border bg-sms-surface-primary"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Day Forensic Mode (Light)" : "Switch to Night Operations Mode (Dark)"}
      className="w-10 h-10 rounded-xl border border-sms-border hover:border-sms-border-strong bg-sms-surface-primary hover:bg-sms-surface-hover text-sms-text-secondary hover:text-sms-text-primary flex items-center justify-center transition-all duration-150 shadow-sm hover:shadow"
      aria-label="Toggle visual theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" strokeWidth={1.8} />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-200" strokeWidth={1.8} />
      )}
    </button>
  );
}
