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
  title: "SecureMailScope // NTRO Cryptographic Posture Assessment",
  description:
    "Passive Forensic Cryptographic Posture Analysis for Defense Email Infrastructure (SMTP, IMAP, POP3) — NTRO SIH26159",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-soc-bg text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
