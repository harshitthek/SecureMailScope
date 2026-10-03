import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  fallback: ["JetBrains Mono", "SF Mono", "Cascadia Code", "Consolas", "monospace"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SecureMailScope // SIH26159 — Forensic Analyzer",
  description:
    "Passive Network Forensic Analyzer for Email Cryptographic Posture Assessment (SMTP, IMAP, POP3) — SIH26159",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('sms_theme');
                  var isDark = true;
                  if (stored === 'light') {
                    isDark = false;
                  } else if (stored === 'dark') {
                    isDark = true;
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    isDark = false;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-sms-canvas text-sms-text-primary antialiased selection:bg-sms-cyan/20 selection:text-sms-cyan`}
      >
        {children}
      </body>
    </html>
  );
}
