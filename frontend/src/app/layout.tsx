import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureMailScope | Cryptographic Posture Assessment (NTRO SIH26159)",
  description:
    "AI-Assisted Cryptographic Security Posture Assessment for Secure Email Communications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
