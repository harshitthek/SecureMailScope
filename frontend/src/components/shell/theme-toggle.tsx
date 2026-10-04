"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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
        className="w-9 h-9 rounded-full border border-[#1c1d22] bg-[#121317]"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Day Forensic Mode (Light)" : "Switch to Midnight Vault Mode (Dark)"}
      className="w-9 h-9 rounded-full border border-[#1c1d22] hover:border-[#2e3038] bg-[#121317] hover:bg-[#1c1d22] text-[#e2e3e9] flex items-center justify-center transition-colors"
      aria-label="Toggle visual theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-[#cc9166] hover:rotate-45 transition-transform duration-200" strokeWidth={1.8} />
      ) : (
        <Moon className="w-4 h-4 text-[#9194a1] hover:-rotate-12 transition-transform duration-200" strokeWidth={1.8} />
      )}
    </button>
  );
}
