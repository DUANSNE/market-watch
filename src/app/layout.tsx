import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Market Watch",
  description: "全球债券市场 · AI 产业链 · 大宗商品 · 宏观指标",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl backdrop-saturate-150">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
            <Link href="/" className="text-sm font-semibold tracking-[0.15em] uppercase text-white/90">
              Market Watch
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/bonds" className="rounded-md px-4 py-2 text-xs font-medium uppercase tracking-wider text-white/50 transition hover:bg-white/[0.04] hover:text-white/90">
                债券
              </Link>
              <span className="text-white/10">/</span>
              <Link href="/evening" className="rounded-md px-4 py-2 text-xs font-medium uppercase tracking-wider text-white/50 transition hover:bg-white/[0.04] hover:text-white/90">
                观察
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
