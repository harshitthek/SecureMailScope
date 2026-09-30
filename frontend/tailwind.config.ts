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
        sans: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tactical: {
          bg: "#0a0c10",
          surface: "#0e1117",
          surfaceHover: "#151922",
          elevated: "#1a202c",
          border: "#1f2633",
          borderHighlight: "#2e394d",
          text: "#e6edf3",
          dim: "#8b949e",
          muted: "#484f58",
        },
        phosphor: {
          green: "#22c55e",
          hazard: "#ef4444",
          amber: "#f59e0b",
          cyan: "#38bdf8",
        },
        soc: {
          bg: "#0a0c10",
          card: "#0e1117",
          cardHover: "#151922",
          cardElevated: "#1a202c",
          border: "#1f2633",
          borderHighlight: "#2e394d",
          cyan: "#38bdf8",
          emerald: "#22c55e",
          rose: "#ef4444",
          amber: "#f59e0b",
          muted: "#8b949e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
