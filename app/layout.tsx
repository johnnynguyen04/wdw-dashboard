import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disney World Wait Time Analysis | Data Science Portfolio — Johnny Nguyen",
  description:
    "A machine learning analysis of 1,754,414 Disney World wait time records (2015–2021). Random Forest model (R²=0.579) with seasonal trends, holiday impact, and live wait-time predictions across 8 attractions.",
  openGraph: {
    title: "Disney World Wait Time Analysis",
    description: "1.75M records · 8 attractions · Random Forest ML model · R²=0.579",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
