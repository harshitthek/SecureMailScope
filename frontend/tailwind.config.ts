import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        soc: {
          bg: "#030712",
          card: "#080e1b",
          cardHover: "#0e172a",
          cardElevated: "#121d33",
          border: "#16233b",
          borderHighlight: "#243759",
          cyan: "#0ea5e9",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b",
          muted: "#64748b",
        },
      },
      boxShadow: {
        "tactical-sm": "0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px -1px rgba(0, 0, 0, 0.6)",
        "tactical-glow": "0 0 24px -4px rgba(14, 165, 233, 0.25)",
        "danger-glow": "0 0 24px -4px rgba(244, 63, 94, 0.3)",
        "success-glow": "0 0 24px -4px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
