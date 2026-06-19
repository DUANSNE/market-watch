import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Market Watch",
  description: "全球债券市场 · AI 产业链 · 大宗商品 · 宏观指标",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-[#333]">
        <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-sm font-semibold tracking-wide text-[#1a202c]">Market Watch</Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/bonds" className="text-[#666] hover:text-[#1a202c]">债券市场</Link>
              <Link href="/evening" className="text-[#666] hover:text-[#1a202c]">晚间观察</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
