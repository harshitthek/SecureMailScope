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
          bg: "#080a0e",
          surface: "#0d1117",
          surfaceHover: "#131822",
          elevated: "#18202d",
          border: "#1b2330",
          borderHighlight: "#2c384e",
          text: "#e8edf2",
          dim: "#8290a2",
          muted: "#465365",
        },
        phosphor: {
          green: "#22c55e",
          hazard: "#ff3333",
          amber: "#f59e0b",
          cyan: "#00d8f6",
        },
        soc: {
          bg: "#080a0e",
          card: "#0d1117",
          cardHover: "#131822",
          cardElevated: "#18202d",
          border: "#1b2330",
          borderHighlight: "#2c384e",
          cyan: "#00d8f6",
          emerald: "#22c55e",
          rose: "#ff3333",
          amber: "#f59e0b",
          muted: "#8290a2",
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
