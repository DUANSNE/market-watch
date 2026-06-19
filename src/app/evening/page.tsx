export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, getDashboardSnapshot, type FinanceItem } from "@/lib/dashboard";

export default async function EveningPage() {
  const snapshot = await getDashboardSnapshot();
  const get = (id: string) => snapshot.finance.find((f) => f.id === id);
  const fmt = (v: number) => v.toFixed(2);

  const total = snapshot.finance.length;
  const upCount = snapshot.finance.filter((f) => f.changePercent > 0).length;
  const downCount = snapshot.finance.filter((f) => f.changePercent < 0).length;

  const byId = (id: string) => get(id);
  const row = (ids: string[]) => ids.map(byId).filter((f): f is FinanceItem => !!f);

  const rows = {
    ai: row(["sox", "nvidia", "apple", "nasdaq"]),
    commodity: row(["crude", "gold", "copper"]),
    macro: row(["dxy", "us10y", "vix"]),
    global: row(["sp500", "nasdaq", "nikkei", "hang-seng", "shanghai", "euro-stoxx", "ftse100", "dax"]),
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:px-8">

      {/* 页面标题 */}
      <section className="mb-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#1a1a1a]">晚间全球观察</h1>
        <p className="text-sm leading-relaxed text-[#777]">
          AI 产业链 · 大宗商品 · 宏观指标 · 三条大师视角交叉验证
        </p>
        <div className="mt-3 text-xs text-[#999]">{formatDateTime(snapshot.generatedAt)}</div>

        <div className="kpi-grid mt-5">
          <div className="kpi-item">
            <h3>追踪标的</h3>
            <div className="val">{total}</div>
          </div>
          <div className="kpi-item">
            <h3>上涨</h3>
            <div className="val" style={{ color: "#166534" }}>{upCount}</div>
          </div>
          <div className="kpi-item">
            <h3>下跌</h3>
            <div className="val" style={{ color: "#991b1b" }}>{downCount}</div>
          </div>
          <div className="kpi-item">
            <h3>平盘</h3>
            <div className="val">{total - upCount - downCount}</div>
          </div>
        </div>
        <div className="h-rule mt-6" />
      </section>

      {/* AI 产业链 */}
      <Section title="AI 产业链" subtitle="半导体 · 算力 · 消费电子">
        <table className="data-table">
          <thead>
            <tr>
              <th>品种</th>
              <th>分类</th>
              <th className="num">价格</th>
              <th className="num">涨跌幅</th>
              <th>逻辑</th>
            </tr>
          </thead>
          <tbody>
            {rows.ai.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.name}</td>
                <td className="text-[#999]">{item.category}</td>
                <td className="num font-medium">{formatPrice(item.price, item.currency)}</td>
                <td className="num">
                  <span className="tag" style={{
                    background: item.changePercent >= 0 ? "#dcfce7" : "#fee2e2",
                    color: item.changePercent >= 0 ? "#166534" : "#991b1b",
                  }}>
                    {item.changePercent >= 0 ? "+" : ""}{fmt(item.changePercent)}%
                  </span>
                </td>
                <td className="text-[#aaa] text-xs">{item.thesis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 大宗商品 */}
      <Section title="大宗商品" subtitle="能源 · 贵金属 · 工业金属">
        <table className="data-table">
          <thead>
            <tr>
              <th>品种</th>
              <th>分类</th>
              <th className="num">价格</th>
              <th className="num">涨跌幅</th>
              <th>逻辑</th>
            </tr>
          </thead>
          <tbody>
            {rows.commodity.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.name}</td>
                <td className="text-[#999]">{item.category}</td>
                <td className="num font-medium">{formatPrice(item.price, item.currency)}</td>
                <td className="num">
                  <span className="tag" style={{
                    background: item.changePercent >= 0 ? "#dcfce7" : "#fee2e2",
                    color: item.changePercent >= 0 ? "#166534" : "#991b1b",
                  }}>
                    {item.changePercent >= 0 ? "+" : ""}{fmt(item.changePercent)}%
                  </span>
                </td>
                <td className="text-[#aaa] text-xs">{item.thesis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 宏观约束 */}
      <Section title="宏观约束" subtitle="利率 · 汇率 · 波动率">
        <table className="data-table">
          <thead>
            <tr>
              <th>品种</th>
              <th>分类</th>
              <th className="num">价格</th>
              <th className="num">涨跌幅</th>
              <th>逻辑</th>
            </tr>
          </thead>
          <tbody>
            {rows.macro.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.name}</td>
                <td className="text-[#999]">{item.category}</td>
                <td className="num font-medium">{formatPrice(item.price, item.currency)}</td>
                <td className="num">
                  <span className="tag" style={{
                    background: item.changePercent >= 0 ? "#dcfce7" : "#fee2e2",
                    color: item.changePercent >= 0 ? "#166534" : "#991b1b",
                  }}>
                    {item.changePercent >= 0 ? "+" : ""}{fmt(item.changePercent)}%
                  </span>
                </td>
                <td className="text-[#aaa] text-xs">{item.thesis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 全球市场速览 */}
      <Section title="全球市场速览" subtitle="">
        <table className="data-table">
          <thead>
            <tr>
              <th>地区</th>
              <th>品种</th>
              <th className="num">价格</th>
              <th className="num">涨跌幅</th>
            </tr>
          </thead>
          <tbody>
            {rows.global.map((item) => (
              <tr key={item.id}>
                <td className="text-[#999]">{item.market}</td>
                <td className="font-medium">{item.name}</td>
                <td className="num font-medium">{formatPrice(item.price, item.currency)}</td>
                <td className="num">
                  <span className="tag" style={{
                    background: item.changePercent >= 0 ? "#dcfce7" : "#fee2e2",
                    color: item.changePercent >= 0 ? "#166534" : "#991b1b",
                  }}>
                    {item.changePercent >= 0 ? "+" : ""}{fmt(item.changePercent)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 三条大师视角 */}
      <div className="section-divider"><span>三条大师视角</span></div>
      <p className="mb-6 text-xs leading-relaxed text-[#999]">
        以下内容基于近期各家公开的访谈、备忘录和研究报告，每条附来源链接。末尾附独立判断。
      </p>

      {/* Hartnett */}
      <div className="mb-8 border-l-2 border-[#d4d4d4] pl-5">
        <h3 className="mb-1 text-base font-semibold text-[#1a1a1a]">Michael Hartnett</h3>
        <p className="mb-4 text-xs text-[#aaa]">Bank of America · 首席投资策略师</p>

        <div className="mb-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">AI 泡沫论</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            当前 AI 驱动的市场是<strong className="text-[#1a1a1a]">"自 1880 年代铁路泡沫以来最大的泡沫"</strong>，市场集中度接近 48%。仅 21 只股票在创新高（占指数 4%），与 2000 年 3 月科网见顶时一致。
          </p>
        </div>
        <div className="mb-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">交易策略</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            做多<strong className="text-[#1a1a1a]">商品、卖出美元、消费股逆向多头</strong>。虽触发卖出信号但不要急于离场——等待美联储转鹰或信用条件收紧。全球降息仍多于加息。
          </p>
        </div>
        <div className="mb-3">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">宏观框架</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            美国经济处于<strong className="text-[#1a1a1a]">"Boom Loop"</strong>。<strong className="text-[#1a1a1a]">"这十年就是关于供给"</strong>。核心风险：债券收益率上行。每次泡沫破灭都由此触发。
          </p>
        </div>
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
          <Source text="AI 铁路泡沫论" href="https://www.moneycontrol.com/news/business/markets/" />
          <Source text="做多商品/做空美元" href="https://www.cnbc.com/2026/04/17/" />
          <Source text="泡沫后投资手册" href="https://www.businessinsider.com/" />
          <Source text="卖出信号解析" href="https://www.benzinga.com/markets/" />
          <Source text="Boom Loop" href="https://www.thestreet.com/economy/" />
        </div>
        <p className="text-xs leading-relaxed text-[#aaa]">
          <span className="text-[#777] font-medium">⚖ 判断：</span>
          泡沫论信号价值高但每次喊泡沫未必立即可见顶。看多商品/看空美元（供给约束、去美元化）比泡沫论更自洽。当前"高胜率低赔率"。
        </p>
      </div>

      {/* Dalio */}
      <div className="mb-8 border-l-2 border-[#d4d4d4] pl-5">
        <h3 className="mb-1 text-base font-semibold text-[#1a1a1a]">Ray Dalio</h3>
        <p className="mb-4 text-xs text-[#aaa]">Bridgewater Associates · 创始人</p>

        <div className="mb-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">2026–2028 危险窗口</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            美国债务 <strong className="text-[#1a1a1a]">$39.2 万亿</strong>，年利息即将突破 <strong className="text-[#1a1a1a]">$1 万亿</strong>，财政已"越过不归点"。支出 $7.1 万亿 vs 收入 $5.3 万亿。
          </p>
        </div>
        <div className="mb-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">资本战争与黄金</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            世界从贸易战进入<strong className="text-[#1a1a1a]">资本战争</strong>。建议组合 <strong className="text-[#1a1a1a]">10–15% 配置黄金</strong>。2025 年黄金回报 65%，跑赢标普 47 个百分点。80% 的世界货币在历史上已消失。
          </p>
        </div>
        <div className="mb-3">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">五大力量</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            债务/货币恶化 · 政治撕裂 · 中美技术冷战 · AI 革命。科技战争赢家将"赢得所有战争"。
          </p>
        </div>
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
          <Source text="大周期与债务危机" href="https://fortune.com/2026/03/14/" />
          <Source text="资本战争与黄金" href="https://fortune.com/2026/02/04/" />
          <Source text="两年内大问题" href="https://247wallst.com/investing/" />
          <Source text="HBR 访谈" href="https://hbr.org/podcast/2026/01/" />
          <Source text="Bridgewater" href="https://www.bridgewater.com/" />
        </div>
        <p className="text-xs leading-relaxed text-[#aaa]">
          <span className="text-[#777] font-medium">⚖ 判断：</span>
          $39 万亿债务是事实，但时点预测不够精确。VIX ~16、信用利差窄说明市场未定价灾难场景。适合做结构仓位参考，不适合做择时工具。
        </p>
      </div>

      {/* Marks */}
      <div className="mb-8 border-l-2 border-[#d4d4d4] pl-5">
        <h3 className="mb-1 text-base font-semibold text-[#1a1a1a]">Howard Marks</h3>
        <p className="mb-4 text-xs text-[#aaa]">Oaktree Capital · 联合创始人</p>

        <div className="mb-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">AI 估值判断</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            备忘录 <em>AI Hurtles Ahead</em>：AI 是真实的技术革命，但部分收入是<strong className="text-[#1a1a1a]">"循环收入"</strong>——AI 公司相互购买服务。结论：<strong className="text-[#1a1a1a]">"不要 all-in"</strong>。
          </p>
        </div>
        <div className="mb-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">私人信贷警告</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            最新备忘录对<strong className="text-[#1a1a1a]">直接借贷市场</strong>发出警告——该行业正面临 2008 年以来首次大考。Oaktree 已主动减少相关敞口。
          </p>
        </div>
        <div className="mb-3">
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-[#999]">历史哲学</h4>
          <p className="text-sm leading-relaxed text-[#555]">
            把 AI 类比 1860 年代铁路大繁荣。<strong className="text-[#1a1a1a]">"泡沫并非由技术直接导致，而是过度乐观应用于技术"</strong>。
          </p>
        </div>
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
          <Source text="AI Hurtles Ahead" href="https://www.oaktreecapital.com/insights/memo/ai-hurtles-ahead" />
          <Source text="私人信贷备忘录" href="https://www.oaktreecapital.com/insights/memo/whats-going-on-in-private-credit" />
          <Source text="Is It a Bubble?" href="https://www.oaktreecapital.com/insights/memo/is-it-a-bubble" />
          <Source text="Oaktree 研究" href="https://www.oaktreecapital.com/insights" />
        </div>
        <p className="text-xs leading-relaxed text-[#aaa]">
          <span className="text-[#777] font-medium">⚖ 判断：</span>
          三者中最"中间派"。私人信贷警告最值得重视——该市场与 PE 杠杆深度绑定，Oaktree 主动减仓的行为信号比言辞更有分量。
        </p>
      </div>

      {/* 今日分析 */}
      <div className="section-divider"><span>今日分析</span></div>
      <div className="space-y-4">
        {snapshot.insights.map((insight) => (
          <div key={insight.title} className="border-b border-[#f0f0f0] pb-4 last:border-0">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h4 className="text-sm font-medium text-[#333]">{insight.title}</h4>
              {insight.confidence && <span className="shrink-0 text-xs text-[#ccc]">{insight.confidence}</span>}
            </div>
            <p className="text-xs leading-relaxed text-[#888]">{insight.body}</p>
            {insight.tags && insight.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {insight.tags.map((t) => <span key={t} className="text-[10px] text-[#bbb]">{t}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-12 pt-6 text-center text-xs text-[#ccc]">
        自动生成 · 数据仅供参考 · 不构成投资建议
      </footer>
    </main>
  );
}

/* ── 子组件 ── */

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-sm font-semibold text-[#1a1a1a]">{title}</h2>
      {subtitle && <p className="mb-4 text-xs text-[#aaa]">{subtitle}</p>}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Source({ text, href }: { text: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-xs text-[#bbb] transition hover:text-[#555]">
      {text} ↗
    </a>
  );
}
