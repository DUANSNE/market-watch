export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, formatSignedNumber, formatSignedPercent, getDashboardSnapshot } from "@/lib/dashboard";
import BondCharts from "./Chart";

export default async function BondsPage() {
  const [, snapshot] = await Promise.all([Promise.resolve(null), getDashboardSnapshot()]);
  const bondIds = ["us10y", "us30y", "shy", "us5y", "us3m", "china-bond", "intl-treas", "em-bonds"];
  const finance = snapshot.finance.filter((f) => bondIds.includes(f.id));
  const regions = ["🇺🇸 美国", "🇨🇳 中国", "🌍 全球"];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:px-8">
      <div className="space-y-16">

        {/* Hero */}
        <section className="space-y-8">
          <div className="space-y-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.20em] text-white/30">
              全球债券市场
            </div>
            <h1 className="max-w-2xl text-3xl font-light leading-tight tracking-tight text-white md:text-4xl">
              利率曲线 · 跨境对比 · 长周期趋势
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/40">
              覆盖美国国债全期限收益率、中国人民币利率市场及全球主权债。所有图表支持拖拽缩放与对数/线性坐标切换。
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-light tabular-nums text-white">{finance.length}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/25">追踪品种</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-light tabular-nums text-white">{formatDateTime(snapshot.generatedAt)}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/25">最近更新</div>
            </div>
          </div>

          <div className="h-px w-full bg-white/[0.06]" />
        </section>

        {/* Charts */}
        <section className="space-y-8">
          <BondCharts items={finance} />
        </section>

        {/* Tables */}
        <div className="h-px w-full bg-white/[0.06]" />

        {regions.map((region) => {
          const items = finance.filter((f) => f.market === region);
          if (!items.length) return null;
          return (
            <section key={region} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">{region}</span>
                <span className="text-[10px] text-white/20">{items.length} 品种</span>
              </div>

              <div className="overflow-hidden border border-white/[0.06]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.10em] text-white/25">品种</th>
                      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.10em] text-white/25">类型</th>
                      <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-[0.10em] text-white/25">收益率 / 价格</th>
                      <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-[0.10em] text-white/25">日变动</th>
                      <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-[0.10em] text-white/25">涨跌幅</th>
                      <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-[0.10em] text-white/25 hidden md:table-cell">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const up = item.changePercent >= 0;
                      const isYield = item.id.startsWith("us");
                      return (
                        <tr key={item.id} className="border-b border-white/[0.03] transition hover:bg-white/[0.015] last:border-0">
                          <td className="px-5 py-3.5 text-sm font-medium text-white/90">{item.name}</td>
                          <td className="px-5 py-3.5 text-xs text-white/30">{item.category}</td>
                          <td className="px-5 py-3.5 text-right text-sm tabular-nums text-white/90">
                            {isYield ? item.price.toFixed(2) + "%" : formatPrice(item.price, item.currency)}
                          </td>
                          <td className={`px-5 py-3.5 text-right text-sm tabular-nums ${up ? "text-white/60" : "text-white/40"}`}>
                            {item.change !== undefined ? formatSignedNumber(item.change) + (isYield ? "%" : "") : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`inline-flex items-center gap-1 text-xs tabular-nums font-medium ${up ? "text-white/70" : "text-white/40"}`}>
                              {up ? "+" : ""}{formatSignedPercent(item.changePercent)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-xs text-white/20 hidden md:table-cell">{item.thesis}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {/* Footer */}
        <footer className="border-t border-white/[0.04] pt-6 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-white/15">
          Yahoo Finance · 不构成投资建议
        </footer>
      </div>
    </main>
  );
}
