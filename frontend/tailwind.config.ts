import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
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
          bg: "rgb(var(--tactical-bg) / <alpha-value>)",
          surface: "rgb(var(--tactical-surface) / <alpha-value>)",
          surfaceHover: "rgb(var(--tactical-surface-hover) / <alpha-value>)",
          elevated: "rgb(var(--tactical-elevated) / <alpha-value>)",
          raw: "rgb(var(--tactical-raw) / <alpha-value>)",
          recessed: "rgb(var(--tactical-recessed) / <alpha-value>)",
          border: "rgb(var(--tactical-border) / <alpha-value>)",
          borderHighlight: "rgb(var(--tactical-border-highlight) / <alpha-value>)",
          highlight: "rgb(var(--tactical-border-highlight) / <alpha-value>)",
          text: "rgb(var(--tactical-text) / <alpha-value>)",
          primary: "rgb(var(--tactical-text) / <alpha-value>)",
          dim: "rgb(var(--tactical-dim) / <alpha-value>)",
          muted: "rgb(var(--tactical-muted) / <alpha-value>)",
          selected: "rgb(var(--tactical-selected) / <alpha-value>)",
          rail: "rgb(var(--tactical-rail) / <alpha-value>)",
        },
        phosphor: {
          green: "rgb(var(--phosphor-green) / <alpha-value>)",
          hazard: "rgb(var(--phosphor-hazard) / <alpha-value>)",
          amber: "rgb(var(--phosphor-amber) / <alpha-value>)",
          cyan: "rgb(var(--phosphor-cyan) / <alpha-value>)",
          cyanActive: "rgb(var(--phosphor-cyan-active) / <alpha-value>)",
        },
      },
      boxShadow: {
        "tactical-sm": "var(--tactical-shadow)",
        "tactical-cyan": "0 0 12px -2px rgba(8, 126, 159, 0.25)",
        "tactical-hazard": "0 0 12px -2px rgba(198, 40, 53, 0.25)",
        "tactical-green": "0 0 12px -2px rgba(22, 122, 69, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
