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
  title: "SecureMailScope // Enterprise Email Forensic Posture Assessment",
  description:
    "Passive Network Forensic Analyzer for Email Cryptographic Security Posture Assessment (SMTP, IMAP, POP3) — SIH26159",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('sms_theme');
                  if (stored === 'dark') {
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-sms-canvas text-sms-text-primary antialiased selection:bg-sms-accent-cyan/20 selection:text-sms-accent-cyan`}
      >
        {children}
      </body>
    </html>
  );
}
