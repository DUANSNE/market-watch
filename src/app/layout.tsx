import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "市场追踪 | Daily Market Watch",
  description: "金融数据追踪、网站内容跟踪与每日分析摘要 — 你关心的信息每天自动更新",
};

const navItems = [
  { href: "/", label: "📊 市场追踪", desc: "四大市场实时数据" },
  { href: "/evening", label: "🌙 晚间观察", desc: "AI vs 大宗 · 大师视角" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-900 font-sans text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3 md:px-10 lg:px-12">
            <div className="text-lg font-semibold tracking-tight text-white">
              Market Watch
            </div>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
