import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Market Watch",
  description: "全球债券市场 · 晚间观察 · 宏观经济与市场分析",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fafafa] text-[#1a1a1a]">
        <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-[#fafafa]/95 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 md:px-8">
            <Link href="/" className="text-sm font-semibold tracking-wide text-[#1a1a1a]">
              Market Watch
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/bonds" className="text-[#666] transition hover:text-[#1a1a1a]">
                债券市场
              </Link>
              <Link href="/evening" className="text-[#666] transition hover:text-[#1a1a1a]">
                晚间观察
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
