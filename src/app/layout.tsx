import type { Metadata, Viewport } from "next";
import { Jua, Gowun_Dodum, Press_Start_2P } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const jua = Jua({ weight: "400", subsets: ["latin"], variable: "--font-jua", display: "swap" });
const gowun = Gowun_Dodum({ weight: "400", subsets: ["latin"], variable: "--font-gowun", display: "swap" });
const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel", display: "swap" });

export const metadata: Metadata = {
  title: "쓔 키우기 프로젝트",
  description: "중기부 청년인턴 정책 체험 게이미피케이션 프로그램 - 나만의 쓔를 키워보세요!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "쓔 키우기",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffd166",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${jua.variable} ${gowun.variable} ${pixel.variable}`}>
      <body className="min-h-full flex flex-col bg-ssyu-cream text-ssyu-brown">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
