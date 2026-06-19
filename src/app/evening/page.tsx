export const dynamic = "force-dynamic";

import { formatDateTime, formatPrice, formatSignedPercent, getDashboardSnapshot } from "@/lib/dashboard";

/* ── 组件 ── */

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-light tabular-nums text-white/90">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-[0.10em] text-white/25">{label}</div>
    </div>
  );
}

function ValueRow({ label, name, price, changePercent, currency = "USD", note }: {
  label: string; name: string; price: number; changePercent: number; currency?: string; note?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.03] py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/25">{label}</span>
          {note && <span className="text-[10px] text-white/15">{note}</span>}
        </div>
        <div className="mt-0.5 truncate text-sm text-white/80">{name}</div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="text-right text-sm tabular-nums text-white/90">
          {formatPrice(price, currency)}
        </span>
        <span className={`text-right text-xs tabular-nums ${changePercent >= 0 ? "text-white/50" : "text-white/35"}`}>
          {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function StateBadge({ label, value, tone }: { label: string; value: string; tone: "positive" | "caution" }) {
  return (
    <div className={`border px-4 py-3 ${tone === "positive" ? "border-white/[0.06]" : "border-white/[0.04]"}`}>
      <div className="text-[10px] font-medium uppercase tracking-[0.10em] text-white/20">{label}</div>
      <div className="mt-1 text-xs text-white/60">{value}</div>
    </div>
  );
}

function InsightCard({ title, body, confidence, tags }: {
  title: string; body: string; confidence?: string; tags?: string[];
}) {
  return (
    <div className="border-b border-white/[0.04] py-5 first:pt-0 last:border-0">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium text-white/80">{title}</h4>
        {confidence && <span className="shrink-0 text-[10px] text-white/20">{confidence}</span>}
      </div>
      <p className="text-xs leading-relaxed text-white/35">{body}</p>
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((t) => <span key={t} className="text-[10px] text-white/20">{t}</span>)}
        </div>
      )}
    </div>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1 text-[10px] text-white/20 transition hover:text-white/50">
      {label} ↗
    </a>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-white/[0.04]" />
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/20">{label}</span>
      <div className="h-px flex-1 bg-white/[0.04]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   晚间观察
   ═══════════════════════════════════════════════ */

export default async function EveningPage() {
  const snapshot = await getDashboardSnapshot();
  const get = (id: string) => snapshot.finance.find((f) => f.id === id);

  const sox = get("sox"); const nvda = get("nvidia"); const aapl = get("apple");
  const ndx = get("nasdaq"); const spx = get("sp500"); const crude = get("crude");
  const gold = get("gold"); const copper = get("copper"); const dxy = get("dxy");
  const tnx = get("us10y"); const vix = get("vix");
  const nikkei = get("nikkei"); const hsi = get("hang-seng"); const sh = get("shanghai");
  const stoxx = get("euro-stoxx"); const ftse = get("ftse100"); const dax = get("dax");

  const total = snapshot.finance.length;
  const rising = snapshot.finance.filter((f) => f.changePercent > 0).length;
  const falling = snapshot.finance.filter((f) => f.changePercent < 0).length;
  const riskOn = spx && spx.changePercent > 0 && vix && vix.price < 20 && dxy && dxy.price < 102;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:px-8">
      <div className="space-y-16">

        {/* ═══ HERO ═══ */}
        <section className="space-y-8">
          <div className="space-y-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.20em] text-white/30">
              {formatDateTime(snapshot.generatedAt)}
            </div>
            <h1 className="max-w-2xl text-3xl font-light leading-tight tracking-tight text-white md:text-4xl">
              晚间全球观察
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/40">
              AI 产业链 · 大宗商品 · 宏观指标 · 三条大师视角交叉验证
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            <Kpi value={String(total)} label="追踪标的" />
            <Kpi value={String(rising)} label="上涨" />
            <Kpi value={String(falling)} label="下跌" />
            <Kpi value={riskOn ? "偏积极" : "偏谨慎"} label="整体情绪" />
          </div>

          <div className="h-px w-full bg-white/[0.06]" />
        </section>

        {/* ═══ AI 链 ═══ */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">AI 产业链</h2>
            <span className="text-[10px] text-white/20">半导体 · 算力 · 消费电子</span>
          </div>
          <div className="divide-y divide-white/[0.03] border-y border-white/[0.06]">
            {[sox, nvda, aapl, ndx].map((item) =>
              item ? <ValueRow key={item.id} label={item.category} name={item.name} price={item.price} changePercent={item.changePercent} note={item.thesis} /> : null
            )}
          </div>
        </section>

        {/* ═══ 大宗商品 ═══ */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">大宗商品</h2>
            <span className="text-[10px] text-white/20">能源 · 贵金属 · 工业金属</span>
          </div>
          <div className="divide-y divide-white/[0.03] border-y border-white/[0.06]">
            {[crude, gold, copper].map((item) =>
              item ? <ValueRow key={item.id} label={item.category} name={item.name} price={item.price} changePercent={item.changePercent} note={item.thesis} /> : null
            )}
          </div>
        </section>

        {/* ═══ 宏观约束 ═══ */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">宏观约束</h2>
            <span className="text-[10px] text-white/20">利率 · 汇率 · 波动率</span>
          </div>
          <div className="divide-y divide-white/[0.03] border-y border-white/[0.06]">
            {[dxy, tnx, vix, sox].map((item) =>
              item ? <ValueRow key={item.id} label={item.category} name={item.name} price={item.price} changePercent={item.changePercent} note={item.thesis} /> : null
            )}
          </div>

          <div className="flex gap-3 mt-3">
            <StateBadge label="美元" value={dxy && dxy.price < 101 ? "偏弱 — 利好风险资产" : "偏强 — 压制新兴市场"} tone={dxy && dxy.price < 101 ? "positive" : "caution"} />
            <StateBadge label="利率" value={tnx && tnx.price < 4.5 ? "温和 — 成长股估值友好" : "偏高 — 对估值形成约束"} tone={tnx && tnx.price < 4.5 ? "positive" : "caution"} />
            <StateBadge label="情绪" value={vix && vix.price < 20 ? "低波动 — 风险偏好尚可" : "高波动 — 警惕尾部风险"} tone={vix && vix.price < 20 ? "positive" : "caution"} />
          </div>
        </section>

        {/* ═══ 全球市场速览 ═══ */}
        <section className="space-y-4">
          <Divider label="全球市场速览" />
          <div className="divide-y divide-white/[0.03] border-y border-white/[0.06]">
            {[spx, nikkei, hsi, sh, stoxx, ftse, dax, ndx].map((item) =>
              item ? <ValueRow key={item.id} label={item.market} name={item.name} price={item.price} changePercent={item.changePercent} /> : null
            )}
          </div>
        </section>

        {/* ═══ 三条大师视角 ═══ */}
        <section className="space-y-6">
          <Divider label="三条大师视角" />
          <p className="text-xs leading-relaxed text-white/25">
            以下内容基于近期公开发表的访谈、备忘录和研究报告。每一条均附来源链接。末尾附独立判断。
          </p>

          <div className="space-y-8">
            {/* Hartnett */}
            <div className="border-l-2 border-white/[0.08] pl-6 space-y-5">
              <div>
                <div className="text-base font-medium text-white/90">Michael Hartnett</div>
                <div className="text-[10px] uppercase tracking-[0.10em] text-white/25">Bank of America · 首席投资策略师</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">AI 泡沫论</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      Hartnett 认为当前 AI 驱动的市场是<strong className="text-white/70">"自 1880 年代铁路泡沫以来最大的泡沫"</strong>，市场集中度接近 48%，超越 1920 年代与 2000 年科网泡沫。仅 21 只股票在创新高，与 2000 年 3 月见顶时完全一致。
                    </p>
                  </div>
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">交易策略</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      建议<strong className="text-white/70">做多商品、卖出美元、消费股逆向多头</strong>。虽触发卖出信号但不要急于离场——等待美联储转鹰或信用条件收紧。全球降息仍多于加息，短期支撑风险偏好。
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">宏观框架</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      美国经济处于<strong className="text-white/70">"Boom Loop"</strong>——GDP 强劲但以名义增长为主。<strong className="text-white/70">"这十年就是关于供给"</strong>。核心风险是债券收益率上行，每次泡沫破灭都由此触发。
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <SourceLink href="https://www.moneycontrol.com/news/business/markets/" label="AI 铁路泡沫论" />
                    <SourceLink href="https://www.cnbc.com/2026/04/17/" label="商品/做空美元" />
                    <SourceLink href="https://www.businessinsider.com/" label="泡沫投资手册" />
                    <SourceLink href="https://www.thestreet.com/economy/" label="Boom Loop" />
                    <SourceLink href="https://www.benzinga.com/markets/" label="卖出信号" />
                  </div>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-white/25">
                <span className="font-medium text-white/40">⚖ 判断：</span>
                泡沫论信号价值高但每次喊泡沫未必立即可见顶。他看多商品/看空美元的判断（供给约束、去美元化）比 AI 泡沫论更自洽。当前处于"高胜率低赔率"阶段。
              </div>
            </div>

            {/* Dalio */}
            <div className="border-l-2 border-white/[0.08] pl-6 space-y-5">
              <div>
                <div className="text-base font-medium text-white/90">Ray Dalio</div>
                <div className="text-[10px] uppercase tracking-[0.10em] text-white/25">Bridgewater Associates · 创始人</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">2026–2028 危险窗口</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      美国债务 <strong className="text-white/70">$39.2 万亿</strong>，年利息即将突破 <strong className="text-white/70">$1 万亿</strong>，财政已"越过不归点"。支出 $7.1 万亿 vs 收入 $5.3 万亿的缺口正像动脉斑块一样挤压经济。
                    </p>
                  </div>
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">资本战争</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      世界从贸易战进入<strong className="text-white/70">资本战争</strong>——资金流动被武器化。建议组合 <strong className="text-white/70">10–15% 配置黄金</strong>。2025 年黄金回报 65%，跑赢标普 47 个百分点。80% 的世界货币在历史上已消失。
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">五大力量</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      债务/货币恶化 · 政治撕裂 · 中美技术冷战 · 气候变化 · AI 革命。科技战争赢家将"赢得所有战争"。中国持有约 $8000 亿美债被武器化的可能引发严重关切。
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <SourceLink href="https://fortune.com/2026/03/14/" label="大周期与债务危机" />
                    <SourceLink href="https://fortune.com/2026/02/04/" label="资本战争与黄金" />
                    <SourceLink href="https://247wallst.com/investing/" label="两年内大问题" />
                    <SourceLink href="https://hbr.org/podcast/2026/01/" label="HBR 访谈" />
                    <SourceLink href="https://www.bridgewater.com/" label="Bridgewater" />
                  </div>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-white/25">
                <span className="font-medium text-white/40">⚖ 判断：</span>
                方向性框架不可忽视（$39 万亿债务是事实），但对时点预测不够精确。VIX ~16、信用利差窄说明市场未定价灾难场景。适合做结构仓位参考（黄金、硬资产），不适合做择时工具。
              </div>
            </div>

            {/* Marks */}
            <div className="border-l-2 border-white/[0.08] pl-6 space-y-5">
              <div>
                <div className="text-base font-medium text-white/90">Howard Marks</div>
                <div className="text-[10px] uppercase tracking-[0.10em] text-white/25">Oaktree Capital · 联合创始人</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">AI 估值判断</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      备忘录 <em>AI Hurtles Ahead</em>：AI 是<strong className="text-white/70">真实技术革命</strong>而非投机。但部分 AI 收入是<strong className="text-white/70">"循环收入"</strong>——公司相互购买服务，最终必须由终端用户买单。结论：<strong className="text-white/70">"不要 all-in"</strong>。
                    </p>
                  </div>
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">私人信贷警告</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      最新备忘录对<strong className="text-white/70">直接借贷市场</strong>发出明确警告——该行业正面临 2008 年以来首次大考。Oaktree 已主动减少相关敞口。快速资本涌入降低了信贷标准。
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">历史哲学</div>
                    <p className="text-xs leading-relaxed text-white/40">
                      把 AI 类比 1860 年代铁路大繁荣——真实技术被过度乐观放大。<strong className="text-white/70">"泡沫并非由技术发展直接导致，而是由过度乐观所致"</strong>。
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <SourceLink href="https://www.oaktreecapital.com/insights/memo/ai-hurtles-ahead" label="AI Hurtles Ahead" />
                    <SourceLink href="https://www.oaktreecapital.com/insights/memo/whats-going-on-in-private-credit" label="私人信贷备忘录" />
                    <SourceLink href="https://www.oaktreecapital.com/insights/memo/is-it-a-bubble" label="Is It a Bubble?" />
                    <SourceLink href="https://seekingalpha.com/news/" label="SA 报道" />
                    <SourceLink href="https://www.oaktreecapital.com/insights" label="Oaktree 研究" />
                  </div>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-white/25">
                <span className="font-medium text-white/40">⚖ 判断：</span>
                三者中最"中间派"。关于 AI "技术是真的但价格未必合理"是理性共识。私人信贷警告最值得重视——该市场爆发增长但未经压力测试，与 PE 杠杆深度绑定。Oaktree 主动减仓的行为信号比言辞更有分量。"适度谦逊"是当前最平衡的态度。
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 今日分析 ═══ */}
        <section className="space-y-6">
          <Divider label="今日分析" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-0">
              {snapshot.insights.slice(0, 2).map((insight) => (
                <InsightCard key={insight.title} {...insight} />
              ))}
            </div>
            <div className="space-y-6">
              {snapshot.insights.slice(2, 4).map((insight) => (
                <InsightCard key={insight.title} {...insight} />
              ))}
              <div className="space-y-1">
                <div className="text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">核心结论</div>
                <p className="text-sm leading-relaxed text-white/50">
                  判断全球资金今天在追逐<strong className="text-white/80">确定性增长（AI）</strong>，还是在押注<strong className="text-white/80">再通胀与补库（大宗）</strong>，抑或进入<strong className="text-white/80">全面避险</strong>。
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-medium uppercase tracking-[0.10em] text-white/20">反方提醒</div>
                <p className="text-xs leading-relaxed text-white/30">
                  市场最一致的方向往往也是最大的反脆弱性来源。通过利率、信用利差和相关资产验证来检查叙事是否过热。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] pt-6 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-white/15">
          自动生成 · 数据仅供参考 · 不构成投资建议
        </footer>
      </div>
    </main>
  );
}
