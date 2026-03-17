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
  title: "WDW Wait Time Analysis | Data Science Dashboard",
  description:
    "Interactive dashboard analyzing 1.75M+ wait time records across 8 attractions at Walt Disney World theme parks (2015–2021). Features ML predictions, seasonal trends, and insider tips.",
  openGraph: {
    title: "WDW Wait Time Analysis",
    description: "1.75M+ records analyzed across 4 theme parks with ML predictions",
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
