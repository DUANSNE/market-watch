export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, formatSignedNumber, formatSignedPercent, getDashboardSnapshot, getTrackingConfig } from "@/lib/dashboard";
import BondCharts from "./Chart";

export default async function BondsPage() {
  const [config, snapshot] = await Promise.all([getTrackingConfig(), getDashboardSnapshot()]);
  const finance = snapshot.finance;

  const regions = ["🇺🇸 美国", "🇪🇺 欧洲", "🇨🇳 中国", "🌍 全球"];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:px-8 lg:px-10">
      <div className="space-y-10">
        {/* Hero */}
        <section>
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 p-7 shadow-2xl shadow-black/40 md:p-9">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/8 px-3.5 py-1 text-xs font-medium text-sky-300/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400/60" />
                  全球债券市场 · 互动数据面板
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{config.site.title}</h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-400">{config.site.subtitle}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-white">{finance.length}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">追踪品种</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-sm font-bold tabular-nums text-white">{formatDateTime(snapshot.generatedAt)}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">最近更新</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 互动图表 */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-5 w-1 rounded-full bg-sky-400" />
            <h2 className="text-base font-bold text-white">全球债券互动图表</h2>
            <span className="text-xs text-slate-500">可缩放 · 对数/线性切换</span>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-slate-800/40 to-slate-950/80 p-5 shadow-lg">
            <BondCharts items={finance} />
          </div>
        </section>

        {/* 按区域表格式展示 */}
        {regions.map((region) => {
          const items = finance.filter((f) => f.market === region);
          if (!items.length) return null;
          return (
            <section key={region}>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-5 w-1 rounded-full bg-white/[0.10]" />
                <h2 className="text-base font-bold text-white">{region}</h2>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-white/[0.02] text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">品种</th>
                      <th className="px-4 py-3">类型</th>
                      <th className="px-4 py-3 text-right">收益率/价格</th>
                      <th className="px-4 py-3 text-right">日变动</th>
                      <th className="px-4 py-3 text-right">涨跌幅</th>
                      <th className="px-4 py-3 text-right">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const up = item.changePercent >= 0;
                      return (
                        <tr key={item.id} className="border-b border-white/[0.03] transition hover:bg-white/[0.02] last:border-0">
                          <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                          <td className="px-4 py-3 text-slate-400">{item.category}</td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums text-white">
                            {item.id.startsWith("us")
                              ? item.price.toFixed(2) + "%"
                              : formatPrice(item.price, item.currency)}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                            {item.change !== undefined ? formatSignedNumber(item.change) + (item.id.startsWith("us") ? "%" : "") : "--"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${up ? "bg-emerald-500/12 text-emerald-400" : "bg-red-500/12 text-red-400"}`}>
                              {up ? "▲" : "▼"} {formatSignedPercent(item.changePercent)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{item.thesis}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {/* 底部 */}
        <footer className="border-t border-white/[0.04] pt-6 text-center text-xs text-slate-600">
          数据来源：Yahoo Finance · 美债为直接收益率 · 非美债券为 ETF 累积表现 · 不构成投资建议
        </footer>
      </div>
    </main>
  );
}
