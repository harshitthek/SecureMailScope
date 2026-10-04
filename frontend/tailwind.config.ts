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
        serif: ["var(--font-serif)", "Playfair Display", "Ivy Presto", "DM Serif Display", "Didot", "Bodoni MT", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "SF Mono", "Cascadia Code", "Consolas", "monospace"],
      },
      colors: {
        // Direct Slash Style Reference Palette
        obsidian: "#08080a",
        onyx: "#040406",
        carbon: "#121317",
        graphite: "#1c1d22",
        slate: "#2e3038",
        smoke: "#464853",
        ash: "#5e616e",
        steel: "#777a88",
        fog: "#9194a1",
        mist: "#acafb9",
        silver: "#c7c9d1",
        bone: "#e2e3e9",
        paper: "#ffffff",
        copper: {
          DEFAULT: "#cc9166",
          dim: "rgba(204, 145, 102, 0.12)",
          border: "rgba(204, 145, 102, 0.35)",
        },
        gilded: "#ae9357",
        // Semantic SMS mapping
        sms: {
          canvas: "var(--sms-canvas)",
          surface: {
            primary: "var(--sms-surface-primary)",
            secondary: "var(--sms-surface-secondary)",
            hover: "var(--sms-surface-hover)",
            selected: "var(--sms-surface-selected)",
            raw: "var(--sms-surface-raw)",
          },
          border: {
            DEFAULT: "var(--sms-border)",
            subtle: "var(--sms-border)",
            strong: "var(--sms-border-strong)",
            selectedRail: "var(--sms-selected-rail)",
          },
          text: {
            primary: "var(--sms-text-primary)",
            secondary: "var(--sms-text-secondary)",
            muted: "var(--sms-text-muted)",
            ash: "var(--sms-text-ash)",
            raw: "var(--sms-raw-text)",
            offset: "var(--sms-raw-offset)",
          },
          cyan: {
            DEFAULT: "var(--sms-accent-cyan)",
            hover: "var(--sms-accent-cyan-hover)",
            dim: "var(--sms-accent-cyan-dim)",
          },
          copper: {
            DEFAULT: "#cc9166",
            dim: "rgba(204, 145, 102, 0.12)",
            border: "rgba(204, 145, 102, 0.35)",
          },
          green: {
            DEFAULT: "var(--sms-status-green)",
            dim: "var(--sms-status-green-dim)",
            border: "var(--sms-status-green-border)",
          },
          amber: {
            DEFAULT: "var(--sms-status-amber)",
            dim: "var(--sms-status-amber-dim)",
            border: "var(--sms-status-amber-border)",
          },
          red: {
            DEFAULT: "var(--sms-status-red)",
            dim: "var(--sms-status-red-dim)",
            border: "var(--sms-status-red-border)",
          },
          blue: {
            DEFAULT: "var(--sms-status-blue)",
            dim: "var(--sms-status-blue-dim)",
          },
          btnPrimary: {
            bg: "var(--sms-btn-primary-bg)",
            hover: "var(--sms-btn-primary-hover)",
            text: "var(--sms-btn-primary-text)",
            border: "var(--sms-btn-primary-border)",
          },
        },
      },
      borderRadius: {
        tag: "9999px",
        btn: "9999px",
        surface: "10px",
        modal: "10px",
      },
      backgroundImage: {
        "gilded-gradient": "linear-gradient(103deg, rgb(174, 147, 87), rgb(255, 240, 204) 40%, rgb(174, 147, 87) 70%, rgba(189, 157, 79, 0))",
      },
      boxShadow: {
        card: "none",
        cardHover: "0 0 0 1px #2e3038",
        header: "none",
        modal: "0 0 0 1px #2e3038",
        subtle: "rgba(255, 255, 255, 0.2) 0px 0px 0px 1px",
      },
      transitionDuration: {
        fast: "150ms",
        smooth: "250ms",
      },
    },
  },
  plugins: [],
};

export default config;
