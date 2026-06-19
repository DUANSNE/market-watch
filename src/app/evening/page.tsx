export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, getDashboardSnapshot, type FinanceItem } from "@/lib/dashboard";

export default async function EveningPage() {
  const s = await getDashboardSnapshot();
  const get = (id: string) => s.finance.find(f => f.id === id);
  const row = (ids: string[]) => ids.map(get).filter((f): f is FinanceItem => !!f);

  const ai  = row(["sox","nvidia","apple","nasdaq"]);
  const cmd = row(["crude","gold","copper"]);
  const mac = row(["dxy","us10y","vix"]);
  const glb = row(["sp500","nasdaq","nikkei","hang-seng","shanghai","euro-stoxx","ftse100","dax"]);

  const T = ({ rows, cols }: { rows: FinanceItem[]; cols?: string[] }) => (
    <table className="tbl">
      <thead><tr>
        <th>品种</th><th>类型</th><th className="nr">价格</th><th className="nr">涨跌幅</th>
        {cols ? cols.map((c,i)=><th key={i} className="nr">{c}</th>) : <th>逻辑</th>}
      </tr></thead>
      <tbody>
        {rows.map(i => (
          <tr key={i.id}>
            <td className="b">{i.name}</td><td className="m">{i.category}</td>
            <td className="nr b">{formatPrice(i.price,i.currency)}</td>
            <td className="nr"><span className={`tag ${i.changePercent>=0?"tag-up":"tag-dn"}`}>{i.changePercent>=0?"+":""}{i.changePercent.toFixed(2)}%</span></td>
            {cols ? cols.map((_,j)=><td key={j} className="nr m">{i.thesis}</td>) : <td className="m">{i.thesis}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const up = s.finance.filter(f=>f.changePercent>0).length;
  const dn = s.finance.filter(f=>f.changePercent<0).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-xl font-semibold text-[#1a202c] mb-2">晚间全球观察</h1>
      <p className="text-sm text-[#718096] mb-1">AI 产业链 · 大宗商品 · 宏观指标 · 三条大师视角交叉验证</p>
      <p className="text-xs text-[#a0aec0] mb-4">{formatDateTime(s.generatedAt)}</p>

      <div className="kpis">
        <div className="k"><div className="v">{s.finance.length}</div><div className="l">追踪标的</div></div>
        <div className="k"><div className="v" style={{color:"#22543d"}}>{up}</div><div className="l">上涨</div></div>
        <div className="k"><div className="v" style={{color:"#822727"}}>{dn}</div><div className="l">下跌</div></div>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#1a202c] mb-1">AI 产业链</h2>
        <p className="text-xs text-[#a0aec0] mb-3">半导体 · 算力 · 消费电子</p>
        <div className="overflow-x-auto"><T rows={ai} /></div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#1a202c] mb-1">大宗商品</h2>
        <p className="text-xs text-[#a0aec0] mb-3">能源 · 贵金属 · 工业金属</p>
        <div className="overflow-x-auto"><T rows={cmd} /></div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#1a202c] mb-1">宏观约束</h2>
        <p className="text-xs text-[#a0aec0] mb-3">利率 · 汇率 · 波动率</p>
        <div className="overflow-x-auto"><T rows={mac} /></div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#1a202c] mb-1">全球市场速览</h2>
        <div className="overflow-x-auto">
          <table className="tbl"><thead><tr><th>地区</th><th>品种</th><th className="nr">价格</th><th className="nr">涨跌幅</th></tr></thead>
            <tbody>
              {glb.map(i => (
                <tr key={i.id}>
                  <td className="m">{i.market}</td><td className="b">{i.name}</td>
                  <td className="nr b">{formatPrice(i.price,i.currency)}</td>
                  <td className="nr"><span className={`tag ${i.changePercent>=0?"tag-up":"tag-dn"}`}>{i.changePercent>=0?"+":""}{i.changePercent.toFixed(2)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="sd">三条大师视角</div>

      <Master name="Michael Hartnett" org="Bank of America · 首席投资策略师" views={[
        { t:"AI 泡沫论", b:<>当前 AI 驱动的市场是<strong>"自 1880 年代铁路泡沫以来最大的泡沫"</strong>，市场集中度接近 48%，仅 21 只股票在创新高。</> },
        { t:"交易策略", b:<>做多<strong>商品、卖出美元、消费股逆向多头</strong>。虽触发卖出信号但不要急于离场。</> },
        { t:"宏观框架", b:<>美国经济处于<strong>"Boom Loop"</strong>。<strong>"这十年就是关于供给"</strong>。核心风险：债券收益率上行。</> },
      ]} sources={["AI 铁路泡沫论","做多商品/做空美元","泡沫后投资手册","Boom Loop"]}
        judge="泡沫论信号价值高，但每次喊泡沫未必立即可见顶。看多商品/看空美元更自洽。" />

      <Master name="Ray Dalio" org="Bridgewater Associates · 创始人" views={[
        { t:"2026–2028 危险窗口", b:<>美国债务<strong>$39.2 万亿</strong>，年利息即将突破<strong>$1 万亿</strong>。财政已"越过不归点"。</> },
        { t:"资本战争与黄金", b:<>建议组合<strong>10–15% 配置黄金</strong>。2025 年黄金回报 65%，跑赢标普 47 个百分点。</> },
        { t:"五大力量", b:<>债务/货币恶化 · 政治撕裂 · 中美技术冷战 · AI 革命。科技战争赢家将"赢得所有战争"。</> },
      ]} sources={["大周期与债务危机","资本战争与黄金","两年内大问题","HBR 访谈"]}
        judge="$39 万亿债务是事实，时点预测不够精确。适合做结构仓位参考，不适合做择时工具。" />

      <Master name="Howard Marks" org="Oaktree Capital · 联合创始人" views={[
        { t:"AI 估值判断", b:<>AI 是真实技术革命，但部分收入是<strong>"循环收入"</strong>——AI 公司相互购买服务。<strong>"不要 all-in"</strong>。</> },
        { t:"私人信贷警告", b:<>直接借贷市场面临 2008 年以来首次大考。Oaktree 已主动减仓。</> },
        { t:"历史哲学", b:<>把 AI 类比 1860 年代铁路大繁荣。<strong>"泡沫由过度乐观导致，非技术本身"</strong>。</> },
      ]} sources={["AI Hurtles Ahead","私人信贷备忘录","Is It a Bubble?","Oaktree 研究"]}
        judge="三者中最平衡。私人信贷警告最值得重视——与 PE 杠杆深度绑定，Oaktree 减仓行为信号比言辞更有分量。" />

      <div className="sd">今日分析</div>
      <div className="space-y-4">
        {s.insights.map(x => (
          <div key={x.title} className="border-b border-[#f7fafc] pb-4 last:border-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h4 className="text-sm font-medium text-[#1a202c]">{x.title}</h4>
              {x.confidence && <span className="text-xs text-[#cbd5e0]">{x.confidence}</span>}
            </div>
            <p className="text-xs text-[#718096] leading-relaxed">{x.body}</p>
            {x.tags?.length ? <div className="mt-2 flex flex-wrap gap-1.5">{x.tags.map(t=><span key={t} className="text-[10px] text-[#a0aec0]">{t}</span>)}</div> : null}
          </div>
        ))}
      </div>

      <footer className="text-center text-xs text-[#cbd5e0] pt-6 mt-10 border-t border-[#e2e8f0]">自动生成 · 数据仅供参考</footer>
    </main>
  );
}

function Master({ name, org, views, sources, judge }: {
  name: string; org: string;
  views: { t: string; b: React.ReactNode }[];
  sources: string[];
  judge: string;
}) {
  return (
    <div className="mb-8 pl-4 border-l-[3px] border-[#e2e8f0]">
      <h3 className="text-base font-semibold text-[#1a202c]">{name}</h3>
      <p className="text-xs text-[#a0aec0] mb-4">{org}</p>
      {views.map((v,i) => (
        <div key={i} className="mb-4">
          <h4 className="text-[11px] font-semibold text-[#a0aec0] uppercase tracking-wide mb-1">{v.t}</h4>
          <p className="text-sm text-[#4a5568] leading-relaxed">{v.b}</p>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
        {sources.map((s,i) => <span key={i} className="text-xs text-[#a0aec0]">{s} ↗</span>)}
      </div>
      <p className="text-xs text-[#a0aec0] leading-relaxed"><span className="font-medium text-[#718096]">⚖ 判断：</span>{judge}</p>
    </div>
  );
}
