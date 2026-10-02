import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SECUREMAILSCOPE // SIH26159 Forensic Defense Workstation",
  description:
    "Passive Network Forensic Analyzer for Email Cryptographic Posture Assessment (SMTP, IMAP, POP3) — SIH26159 (Demo / Simulated Capture)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-tactical-bg text-tactical-text antialiased selection:bg-phosphor-cyan/20 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
