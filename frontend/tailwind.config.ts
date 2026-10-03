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
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "SF Mono", "Cascadia Code", "Consolas", "monospace"],
      },
      colors: {
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
            raw: "var(--sms-raw-text)",
            offset: "var(--sms-raw-offset)",
          },
          cyan: {
            DEFAULT: "var(--sms-accent-cyan)",
            hover: "var(--sms-accent-cyan-hover)",
            dim: "var(--sms-accent-cyan-dim)",
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
        tag: "var(--sms-radius-tag)",
        btn: "var(--sms-radius-btn)",
        surface: "var(--sms-radius-surface)",
        modal: "var(--sms-radius-modal)",
      },
      boxShadow: {
        card: "var(--sms-shadow-card)",
        cardHover: "var(--sms-shadow-card-hover)",
        header: "var(--sms-shadow-header)",
        modal: "var(--sms-shadow-modal)",
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
