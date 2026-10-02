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
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tactical: {
          bg: "#07090c",
          surface: "#0d1117",
          surfaceHover: "#111720",
          elevated: "#161d28",
          border: "#1e2633",
          borderHighlight: "#2e3a4e",
          text: "#f2f4f5",
          dim: "#8b98a7",
          muted: "#4e5d70",
        },
        phosphor: {
          green: "#22c55e",
          hazard: "#ef3340",
          amber: "#f59e0b",
          cyan: "#22d3ee",
        },
      },
      boxShadow: {
        "tactical-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.6)",
        "tactical-cyan": "0 0 12px -2px rgba(0, 216, 246, 0.25)",
        "tactical-hazard": "0 0 12px -2px rgba(255, 51, 51, 0.25)",
        "tactical-green": "0 0 12px -2px rgba(34, 197, 94, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
