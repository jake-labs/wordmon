import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 한글 둥근 글꼴. 한글 글리프는 unicode-range로 필요할 때 받으므로 preload는 끈다.
const jua = Jua({
  variable: "--font-jua",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  title: "워드몬 - 단어를 외우면 몬스터가 진화해요",
  description: "초등 필수 영단어 800개로 몬스터를 키우는 단어 수집 게임",
};

export const viewport: Viewport = {
  themeColor: "#fff8e7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
