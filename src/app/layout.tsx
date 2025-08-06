import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Med Network - Healthcare Management System",
  description: "Modern healthcare management system for hospitals, doctors, and patients. Streamline appointments, manage medical records, and improve patient care.",
  keywords: "healthcare, hospital management, medical appointments, patient care, doctor dashboard",
  authors: [{ name: "Med Network Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  openGraph: {
    title: "Med Network - Healthcare Management System",
    description: "Modern healthcare management system for hospitals, doctors, and patients.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
