import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const brandFont = Playfair_Display({
  variable: "--font-brand",
  subsets: ["latin"],
  style: ["italic", "normal"],
});

const uiFont = Space_Grotesk({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SsunEdu YouTube Downloader",
  description:
    "Free YouTube downloader dashboard. 무료 유튜브 다운로더. 無料のYouTubeダウンローダー。",
  keywords: [
    "youtube downloader",
    "free youtube downloader",
    "youtube download site",
    "무료 유튜브 다운로드",
    "유튜브 다운로더",
    "유튜브 다운로드 사이트",
    "YouTube ダウンロード",
    "YouTube ダウンローダー 無料",
  ],
  alternates: {
    languages: {
      "en-US": "/",
      "ko-KR": "/",
      "ja-JP": "/",
    },
  },
  openGraph: {
    title: "SsunEdu YouTube Downloader",
    description:
      "Free YouTube downloader dashboard. 무료 유튜브 다운로더. 無料のYouTubeダウンローダー。",
    locale: "ko_KR",
  },
  verification: {
    google: "Vn7jzu7s2VYl84xoMTTI3YFZXn12lmwV5OYDC_Eolvw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${brandFont.variable} ${uiFont.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
