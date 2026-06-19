export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, getDashboardSnapshot } from "@/lib/dashboard";
import BondCharts from "./Chart";

export default async function BondsPage() {
  const s = await getDashboardSnapshot();
  const ids = ["us10y","us30y","shy","us5y","us3m","china-bond","intl-treas","em-bonds"];
  const all = s.finance.filter(f => ids.includes(f.id));
  const us  = all.filter(f => f.id.startsWith("us"));
  const gl  = all.filter(f => !f.id.startsWith("us"));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-xl font-semibold text-[#1a202c] mb-2">全球债券市场</h1>
      <p className="text-sm text-[#718096] mb-1">美国国债各期限收益率 · 中国利率市场 · 全球主权债 ETF</p>
      <p className="text-xs text-[#a0aec0] mb-8">更新于 {formatDateTime(s.generatedAt)} · {all.length} 个追踪品种</p>

      <section className="mb-12">
        <BondCharts items={all} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#1a202c] mb-3">美国国债收益率</h2>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr><th>品种</th><th>类型</th><th className="nr">当前收益率</th><th className="nr">日变动</th><th className="nr">涨跌幅</th><th className="nr">逻辑</th></tr>
            </thead>
            <tbody>
              {us.map(i => (
                <tr key={i.id}>
                  <td className="b">{i.name}</td><td className="m">{i.category}</td>
                  <td className="nr b">{i.price.toFixed(2)}%</td>
                  <td className={`nr ${i.change>=0?"":"m"}`}>{i.change>=0?"+":""}{i.change.toFixed(2)}%</td>
                  <td className="nr"><span className={`tag ${i.changePercent>=0?"tag-up":"tag-dn"}`}>{i.changePercent>=0?"+":""}{i.changePercent.toFixed(2)}%</span></td>
                  <td className="nr m">{i.thesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#1a202c] mb-3">全球主权债 ETF</h2>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr><th>品种</th><th>类型</th><th className="nr">价格</th><th className="nr">日变动</th><th className="nr">涨跌幅</th><th className="nr">逻辑</th></tr>
            </thead>
            <tbody>
              {gl.map(i => (
                <tr key={i.id}>
                  <td className="b">{i.name}</td><td className="m">{i.category}</td>
                  <td className="nr b">{formatPrice(i.price,i.currency)}</td>
                  <td className={`nr ${i.change>=0?"":"m"}`}>{i.change>=0?"+":""}{i.change.toFixed(2)}</td>
                  <td className="nr"><span className={`tag ${i.changePercent>=0?"tag-up":"tag-dn"}`}>{i.changePercent>=0?"+":""}{i.changePercent.toFixed(2)}%</span></td>
                  <td className="nr m">{i.thesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-center text-xs text-[#cbd5e0] pt-6 border-t border-[#e2e8f0]">Yahoo Finance · 不构成投资建议</footer>
    </main>
  );
}
