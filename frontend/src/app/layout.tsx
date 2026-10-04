import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('sms_theme');
                  if (stored === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans min-h-screen bg-sms-canvas text-sms-text-primary antialiased selection:bg-[#cc9166]/20 selection:text-[#cc9166]`}
      >
        {children}
      </body>
    </html>
  );
}
