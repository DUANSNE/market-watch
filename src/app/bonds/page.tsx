export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, formatSignedPercent, getDashboardSnapshot } from "@/lib/dashboard";
import BondCharts from "./Chart";

export default async function BondsPage() {
  const snapshot = await getDashboardSnapshot();
  const bondIds = ["us10y", "us30y", "shy", "us5y", "us3m", "china-bond", "intl-treas", "em-bonds"];
  const items = snapshot.finance.filter((f) => bondIds.includes(f.id));
  const yieldItems = items.filter((f) => f.id.startsWith("us"));
  const globalItems = items.filter((f) => !f.id.startsWith("us"));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:px-8">
      {/* 页面标题 */}
      <section className="mb-10">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-[#1a1a1a]">
          全球债券市场
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#777]">
          覆盖美国国债各期限收益率、中国利率市场及全球主权债 ETF。支持对数/线性切换，可拖拽缩放。
        </p>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-xs text-[#999]">
          <span>追踪品种 {items.length}</span>
          <span>更新于 {formatDateTime(snapshot.generatedAt)}</span>
        </div>
        <div className="h-rule mt-6" />
      </section>

      {/* 图表区域 */}
      <section className="mb-12 space-y-10">
        <BondCharts items={items} />
      </section>

      {/* 美债收益率表格 */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold text-[#1a1a1a]">美国国债收益率</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>品种</th>
                <th>类型</th>
                <th className="num">当前收益率</th>
                <th className="num">日变动</th>
                <th className="num">涨跌幅</th>
                <th className="num">描述</th>
              </tr>
            </thead>
            <tbody>
              {yieldItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-[#999]">{item.category}</td>
                  <td className="num font-medium">{item.id.startsWith("us") ? item.price.toFixed(2) + "%" : formatPrice(item.price, item.currency)}</td>
                  <td className={`num ${item.change >= 0 ? "text-[#333]" : "text-[#999]"}`}>
                    {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}{item.id.startsWith("us") ? "%" : ""}
                  </td>
                  <td className="num">
                    <span className="tag" style={{
                      background: item.changePercent >= 0 ? "#dcfce7" : "#fee2e2",
                      color: item.changePercent >= 0 ? "#166534" : "#991b1b",
                    }}>
                      {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="num text-[#aaa] text-xs">{item.thesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 全球债券表格 */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold text-[#1a1a1a]">全球主权债 ETF</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>品种</th>
                <th>类型</th>
                <th className="num">价格</th>
                <th className="num">日变动</th>
                <th className="num">涨跌幅</th>
                <th className="num">描述</th>
              </tr>
            </thead>
            <tbody>
              {globalItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-[#999]">{item.category}</td>
                  <td className="num font-medium">{formatPrice(item.price, item.currency)}</td>
                  <td className={`num ${item.change >= 0 ? "text-[#333]" : "text-[#999]"}`}>
                    {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}
                  </td>
                  <td className="num">
                    <span className="tag" style={{
                      background: item.changePercent >= 0 ? "#dcfce7" : "#fee2e2",
                      color: item.changePercent >= 0 ? "#166534" : "#991b1b",
                    }}>
                      {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="num text-[#aaa] text-xs">{item.thesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="pt-6 text-center text-xs text-[#ccc]">
        数据来源：Yahoo Finance · 不构成投资建议
      </footer>
    </main>
  );
}
