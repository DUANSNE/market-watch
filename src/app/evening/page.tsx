export const dynamic = "force-dynamic";

import {
  formatDateTime,
  formatPrice,
  formatSignedPercent,
  getDashboardSnapshot,
  getTrackingConfig,
  type FinanceItem,
} from "@/lib/dashboard";

/* ── 工具组件 ── */

function MiniBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        up
          ? "bg-emerald-500/12 text-emerald-400"
          : "bg-red-500/12 text-red-400"
      }`}
    >
      {up ? "▲" : "▼"} {formatSignedPercent(value)}
    </span>
  );
}

function DataCard({
  label,
  name,
  price,
  changePercent,
  currency = "USD",
  subtitle,
}: {
  label: string;
  name: string;
  price: number;
  changePercent: number;
  currency?: string;
  subtitle?: string;
}) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition hover:border-white/[0.12] hover:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {label}
            </span>
            {subtitle && (
              <span className="text-[10px] text-slate-600">{subtitle}</span>
            )}
          </div>
          <div className="mt-0.5 truncate text-sm font-medium text-slate-200">
            {name}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-right text-base font-semibold tabular-nums text-white">
            {formatPrice(price, currency)}
          </span>
          <MiniBadge value={changePercent} />
        </div>
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-white/[0.10]" />
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-white/[0.04]" />
    </div>
  );
}

function InsightCard({
  title,
  body,
  confidence,
  tags,
}: {
  title: string;
  body: string;
  confidence?: string;
  tags?: string[];
}) {
  const dotColor =
    confidence === "高"
      ? "bg-emerald-500"
      : confidence === "中"
        ? "bg-amber-500"
        : "bg-slate-500";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/[0.10]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold leading-snug text-white">
            {title}
          </h3>
        </div>
        {confidence && (
          <span className="shrink-0 rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {confidence}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-slate-400">{body}</p>
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-500"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   晚间观察页面
   ══════════════════════════════════════════════ */

export default async function EveningPage() {
  const [config, snapshot] = await Promise.all([
    getTrackingConfig(),
    getDashboardSnapshot(),
  ]);

  const now = snapshot.generatedAt;

  // ── 分类取数 ──
  const getById = (id: string) => snapshot.finance.find((f) => f.id === id);

  const sox = getById("sox");
  const nvda = getById("nvidia");
  const aapl = getById("apple");
  const spx = getById("sp500");
  const ndx = getById("nasdaq");
  const crude = getById("crude");
  const gold = getById("gold");
  const copper = getById("copper");
  const dxy = getById("dxy");
  const tnx = getById("us10y");
  const vix = getById("vix");
  const nikkei = getById("nikkei");
  const hsi = getById("hang-seng");
  const shanghai = getById("shanghai");
  const stoxx = getById("euro-stoxx");
  const ftse = getById("ftse100");
  const dax = getById("dax");

  const finance = snapshot.finance;
  const rising = finance.filter((f) => f.changePercent > 0).length;
  const falling = finance.filter((f) => f.changePercent < 0).length;
  const total = finance.length;
  const riskOn =
    spx && spx.changePercent > 0 && vix && vix.price < 20 && dxy && dxy.price < 102;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:px-8 lg:px-10">
      <div className="space-y-10">
        {/* ════════════════ HERO ════════════════ */}
        <section>
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950 p-7 shadow-2xl shadow-black/40 md:p-9">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/8 px-3.5 py-1 text-xs font-medium text-amber-300/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                  每晚更新 · {formatDateTime(now)}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  晚间全球观察
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-400">
                  AI 景气 vs 大宗赔率 · 三条大师视角交叉验证 · 每天一个独立判断
                </p>
              </div>

              {/* 快照指标 */}
              <div className="flex shrink-0 flex-wrap gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-white">
                    {total}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">追踪标的</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-emerald-400">
                    {rising}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">上涨</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-red-400">
                    {falling}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">下跌</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-white">
                    {riskOn ? "偏积极" : "偏谨慎"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">整体情绪</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ AI 链 ════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sm">
              ⚡
            </span>
            <h2 className="text-base font-bold text-white">AI 链 · 产业景气</h2>
            <span className="rounded-md border border-sky-500/15 bg-sky-500/8 px-2 py-0.5 text-[11px] font-medium text-sky-400">
              营收 · 资本开支 · 产业扩散
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <DataCard label="半导体景气" name={sox?.name ?? "SOX"} price={sox?.price ?? 0} changePercent={sox?.changePercent ?? 0} subtitle="AI 资本开支映射" />
            <DataCard label="AI 算力核心" name={nvda?.name ?? "Nvidia"} price={nvda?.price ?? 0} changePercent={nvda?.changePercent ?? 0} subtitle="数据中心需求晴雨表" />
            <DataCard label="科技消费" name={aapl?.name ?? "Apple"} price={aapl?.price ?? 0} changePercent={aapl?.changePercent ?? 0} subtitle="消费电子景气" />
            <DataCard label="成长风格" name={ndx?.name ?? "Nasdaq"} price={ndx?.price ?? 0} changePercent={ndx?.changePercent ?? 0} subtitle="科技整体水位" />
          </div>
        </section>

        {/* ════════════════ 大宗链 ════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-sm">
              🛢
            </span>
            <h2 className="text-base font-bold text-white">大宗商品 · 周期价值</h2>
            <span className="rounded-md border border-amber-500/15 bg-amber-500/8 px-2 py-0.5 text-[11px] font-medium text-amber-400">
              库存 · 供需 · 再通胀
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <DataCard label="能源" name={crude?.name ?? "WTI 原油"} price={crude?.price ?? 0} changePercent={crude?.changePercent ?? 0} subtitle="供给扰动敏感" />
            <DataCard label="贵金属" name={gold?.name ?? "黄金"} price={gold?.price ?? 0} changePercent={gold?.changePercent ?? 0} subtitle="实际利率敏感" />
            <DataCard label="工业金属" name={copper?.name ?? "铜"} price={copper?.price ?? 0} changePercent={copper?.changePercent ?? 0} subtitle="制造业晴雨表" />
          </div>
        </section>

        {/* ════════════════ 宏观约束 ════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-sm">
              📊
            </span>
            <h2 className="text-base font-bold text-white">宏观约束</h2>
            <span className="rounded-md border border-indigo-500/15 bg-indigo-500/8 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
              利率 · 汇率 · 波动率
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <DataCard label="美元" name={dxy?.name ?? "DXY"} price={dxy?.price ?? 0} changePercent={dxy?.changePercent ?? 0} subtitle="全球流动性锚" />
            <DataCard label="利率" name={tnx?.name ?? "US 10Y"} price={tnx?.price ?? 0} changePercent={tnx?.changePercent ?? 0} subtitle="估值压制/支撑" />
            <DataCard label="恐慌" name={vix?.name ?? "VIX"} price={vix?.price ?? 0} changePercent={vix?.changePercent ?? 0} subtitle="尾部风险温度" />
            <DataCard label="科技情绪" name={sox?.name ?? "SOX"} price={sox?.price ?? 0} changePercent={sox?.changePercent ?? 0} subtitle="半导体信心" />
          </div>

          {/* 宏观状态条 */}
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <div
              className={`rounded-xl border px-4 py-3 ${
                dxy && dxy.price < 101
                  ? "border-emerald-500/15 bg-emerald-500/6"
                  : "border-amber-500/15 bg-amber-500/6"
              }`}
            >
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                美元状态
              </div>
              <div className="mt-0.5 text-sm font-semibold text-white">
                {dxy && dxy.price < 101 ? "偏弱 — 利好风险资产" : "偏强 — 压制新兴市场"}
              </div>
            </div>
            <div
              className={`rounded-xl border px-4 py-3 ${
                tnx && tnx.price < 4.5
                  ? "border-emerald-500/15 bg-emerald-500/6"
                  : "border-amber-500/15 bg-amber-500/6"
              }`}
            >
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                利率环境
              </div>
              <div className="mt-0.5 text-sm font-semibold text-white">
                {tnx && tnx.price < 4.5
                  ? "温和 — 成长股估值友好"
                  : "偏高 — 对估值形成约束"}
              </div>
            </div>
            <div
              className={`rounded-xl border px-4 py-3 ${
                vix && vix.price < 20
                  ? "border-emerald-500/15 bg-emerald-500/6"
                  : "border-amber-500/15 bg-amber-500/6"
              }`}
            >
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                市场情绪
              </div>
              <div className="mt-0.5 text-sm font-semibold text-white">
                {vix && vix.price < 20
                  ? "低波动 — 风险偏好尚可"
                  : "高波动 — 警惕尾部风险"}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ 全球市场速览 ════════════════ */}
        <section>
          <SectionDivider label="全球市场速览" />
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <DataCard label="🇺🇸 美国" name={spx?.name ?? "S&P 500"} price={spx?.price ?? 0} changePercent={spx?.changePercent ?? 0} />
            <DataCard label="🇯🇵 日本" name={nikkei?.name ?? "Nikkei 225"} price={nikkei?.price ?? 0} changePercent={nikkei?.changePercent ?? 0} />
            <DataCard label="🇭🇰 港股" name={hsi?.name ?? "Hang Seng"} price={hsi?.price ?? 0} changePercent={hsi?.changePercent ?? 0} />
            <DataCard label="🇨🇳 A 股" name={shanghai?.name ?? "上证指数"} price={shanghai?.price ?? 0} changePercent={shanghai?.changePercent ?? 0} />
            <DataCard label="🇪🇺 欧洲" name={stoxx?.name ?? "Euro Stoxx 50"} price={stoxx?.price ?? 0} changePercent={stoxx?.changePercent ?? 0} />
            <DataCard label="🇬🇧 英国" name={ftse?.name ?? "FTSE 100"} price={ftse?.price ?? 0} changePercent={ftse?.changePercent ?? 0} />
            <DataCard label="🇩🇪 德国" name={dax?.name ?? "DAX"} price={dax?.price ?? 0} changePercent={dax?.changePercent ?? 0} />
            <DataCard label="🇺🇸 科技" name={ndx?.name ?? "Nasdaq"} price={ndx?.price ?? 0} changePercent={ndx?.changePercent ?? 0} />
          </div>
        </section>

        {/* ════════════════ 三条大师视角 ════════════════ */}
        <section>
          <SectionDivider label="三条大师视角 · 最新动态与交叉验证" />
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            以下内容基于各大师近期公开发表的访谈、备忘录和研究报告，每一条均附来源链接便于查证。末尾附独立判断。
          </p>

          <div className="mt-5 space-y-5">
            {/* ═══ Hartnett ═══ */}
            <div className="rounded-2xl border border-sky-500/12 bg-gradient-to-br from-sky-950/25 to-slate-950 p-6 transition hover:border-sky-500/25">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-base font-bold text-sky-400">H</span>
                  <div>
                    <div className="text-base font-semibold text-white">Michael Hartnett</div>
                    <div className="text-xs text-sky-400/70">Bank of America · 首席投资策略师</div>
                  </div>
                </div>
                <span className="rounded-md border border-sky-500/20 bg-sky-500/8 px-2.5 py-1 text-[11px] font-medium text-sky-400">市场体温计 · 资金流向</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 最新观点 */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-sky-300/80">AI 泡沫论</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Hartnett 认为当前 AI 驱动的市场是<strong className="text-white">"自 1880 年代铁路泡沫以来最大的泡沫"</strong>，市场集中度已接近 48%，超过 1920 年代、Nifty Fifty 和 1990 年代科网泡沫。仅 21 只股票（占指数 4%）在创新高，与 2000 年 3 月科网见顶时完全一致。
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">交易策略</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      虽然触发卖出信号（Bull & Bear Indicator 达 8.0），但他建议<strong className="text-white">不要急于离场</strong>，等待两个触发事件：美联储转鹰或信用条件显著收紧。推荐做多<strong className="text-white">商品、卖出美元、消费股（逆向多头）</strong>。认为全球降息（31 次）仍多于加息（12 次），短期支撑风险偏好。
                    </p>
                  </div>
                </div>

                {/* 宏观判断 + 来源 */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300/80">宏观框架</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Hartnett 称美国经济处于<strong className="text-white">"繁荣循环（Boom Loop）"</strong>——GDP 增长强劲但名义增长虚高。他认为<strong className="text-white">"这十年就是关于供给"</strong>，地缘政治、供给约束和资源争夺正在重塑市场。核心风险：<strong className="text-white">债券收益率上行</strong>——每次泡沫破灭都由央行收紧触发。
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">来源链接</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.moneycontrol.com/news/business/markets/bofa-s-hartnett-warns-of-biggest-bubble-since-railroads-in-ai-rally-implications-for-india-and-ems-13929061.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/10">AI 铁路泡沫论 ↗</a>
                      <a href="https://www.cnbc.com/2026/04/17/bank-of-americas-hartnett-backs-two-trades-to-play-lower-rates-ai-war.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/10">做多商品/做空美元 ↗</a>
                      <a href="https://www.businessinsider.com/stock-market-crash-ai-bubble-where-to-invest-playbook-defensive-2026-5" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/10">泡沫后投资手册 ↗</a>
                      <a href="https://www.benzinga.com/markets/equities/26/05/52874099/hartnett-bofa-post-bubble-playbook-sell-signal" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/10">卖出信号解析 ↗</a>
                      <a href="https://www.thestreet.com/economy/bank-of-america-drops-stunning-take-on-the-economy" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/10">Boom Loop 经济论 ↗</a>
                      <a href="https://finance.yahoo.com/markets/stocks/articles/bofa-hartnett-warns-mega-ipos-124137913.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400/10">Mega IPO 泡沫警告 ↗</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 独立判断 */}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">⚖️ 独立判断</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Hartnett 的「AI 泡沫论」信号价值高，但需注意他的框架本质是<strong className="text-white">反身性情绪指标</strong>——每次他喊泡沫时未必是立即顶部。当前他同时承认"利率条件宽松不支持立即崩盘"，这种矛盾本身说明市场处于<strong className="text-sky-300">"高胜率但低赔率"</strong>的阶段。他看多商品/看空美元的判断与基本面更自洽（全球供给约束、去美元化、财政扩张），比 AI 泡沫论更值得认真对待。
                </p>
              </div>
            </div>

            {/* ═══ Dalio ═══ */}
            <div className="rounded-2xl border border-emerald-500/12 bg-gradient-to-br from-emerald-950/25 to-slate-950 p-6 transition hover:border-emerald-500/25">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-base font-bold text-emerald-400">D</span>
                  <div>
                    <div className="text-base font-semibold text-white">Ray Dalio</div>
                    <div className="text-xs text-emerald-400/70">Bridgewater Associates · 创始人</div>
                  </div>
                </div>
                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400">宏观结构 · 债务周期</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">2026–2028 危险窗口</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Dalio 警告美国正进入<strong className="text-white">"2026 年中期选举到 2028 年大选之间的特别危险期"</strong>。国家债务约 <strong className="text-white">$39.2 万亿</strong>，年利息即将超过 <strong className="text-white">$1 万亿</strong>，财政轨迹已"越过不归点"。他认为美国政府支出 $7.1 万亿 vs 收入 $5.3 万亿的缺口正像动脉斑块一样挤压经济。
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">资本战争与黄金</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Dalio 警告世界正从贸易战进入<strong className="text-white">"资本战争"</strong>——资金流动被武器化。他建议投资组合 <strong className="text-white">10–15% 配置黄金</strong>，称 2025 年黄金以美元计回报 65%，跑赢标普 500 达 47 个百分点。他认为 80% 的世界货币在历史上已实质性消失，<strong className="text-white">硬资产和金条</strong>是对冲法币贬值的核心工具。
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">五大力量框架</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      在他的 Big Cycle 框架中，Dalio 当前聚焦五股力量的交汇：<strong className="text-white">债务/货币体系恶化</strong>、<strong className="text-white">国内政治撕裂</strong>、<strong className="text-white">中美技术冷战</strong>、<strong className="text-white">气候变化</strong>、<strong className="text-white">AI 技术革命</strong>。他认为科技战争的赢家将"赢得所有战争"——包括经济战和地缘战。对中国持有美债（约 $8000 亿）被武器化的可能表达了严重关切。
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">来源链接</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://fortune.com/2026/03/14/ray-dalio-big-cycle-debt-crisis-political-disorder-world-order/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-400/10">大周期与债务危机 ↗</a>
                      <a href="https://fortune.com/2026/02/04/ray-dalio-warns-capital-war-geopolitical-tensions-debt-gold-asset/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-400/10">资本战争与黄金 ↗</a>
                      <a href="https://247wallst.com/investing/2026/05/02/ray-dalio-were-on-the-brink-of-major-problems-within-2-years/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-400/10">两年内大问题 ↗</a>
                      <a href="https://www.prokerala.com/news/articles/a1776864.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-400/10">2026–2028 危险窗口 ↗</a>
                      <a href="https://hbr.org/podcast/2026/01/ray-dalio-on-economic-trends-investing-and-making-decisions-amid-uncertainty" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-400/10">HBR 访谈 ↗</a>
                      <a href="https://www.bridgewater.com/research-and-insights" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-400/10">Bridgewater 研究 ↗</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">⚖️ 独立判断</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Dalio 的债务末日叙事已持续多年，他对时间点的预测历史上不够精确——但<strong className="text-white">方向性判断不可忽视</strong>。$39 万亿债务、$1 万亿年利息是事实，而非观点；外国持有美债意愿下降也是可观测趋势。但投资者需要区分"长期危险"和"短期交易"。当前市场并未定价 Dalio 的灾难场景（VIX ~16、信用利差窄），说明<strong className="text-amber-300">要么他过早，要么市场过于乐观</strong>。黄金部分已部分验证（金价 ~$4200），而对中美科技战和去美元化的判断与 Hartnett 的商品多头叙述一致。他的框架适合做<strong className="text-white">结构性仓位参考</strong>（黄金、硬资产、分散化），不适合做择时工具。
                </p>
              </div>
            </div>

            {/* ═══ Marks ═══ */}
            <div className="rounded-2xl border border-rose-500/12 bg-gradient-to-br from-rose-950/25 to-slate-950 p-6 transition hover:border-rose-500/25">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-base font-bold text-rose-400">M</span>
                  <div>
                    <div className="text-base font-semibold text-white">Howard Marks</div>
                    <div className="text-xs text-rose-400/70">Oaktree Capital · 联合创始人</div>
                  </div>
                </div>
                <span className="rounded-md border border-rose-500/20 bg-rose-500/8 px-2.5 py-1 text-[11px] font-medium text-rose-400">风险尺子 · 周期位置</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">AI 估值判断（最新）</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Marks 在 2026 年 2 月的备忘录 <em>AI Hurtles Ahead</em> 中进一步探讨了 AI 泡沫问题。他认为 AI 是<strong className="text-white">真实的技术革命</strong>而非投机，但指出部分 AI 收入目前是<strong className="text-white">"循环收入"</strong>——AI 公司互相购买服务，最终必须由终端用户买单。他总结："技术进步真实、需求增长迅速，但<strong className="text-rose-300">没人能确定这是否是泡沫</strong>——不要 all-in。"
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">私人信贷警告</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      2026 年 4 月最新备忘录 <em>What's Going on in Private Credit?</em> 中，Marks 对<strong className="text-white">直接借贷（Direct Lending）市场</strong>发出明确警告，认为该行业正面临自 2008 年以来的首次大考。Oaktree 已主动减少直接借贷和软件行业的风险敞口。他指出快速资本涌入降低了信贷标准，而私募股权投资组合公司的表现将决定直接贷款的最终命运。
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300/80">历史类比与哲学</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      他把 AI 类比为 1860 年代的<strong className="text-white">铁路大繁荣</strong>——真实的技术变革被过度乐观放大。引用了 Derek Thompson 的原文和马克·吐温"历史押韵"的格言。他反复强调"<strong className="text-rose-300">市场泡沫并非由技术或金融发展直接导致，而是由过度乐观应用于这些发展所导致</strong>"。他的核心建议始终是：<strong className="text-white">没有确定答案的事，不要 all-in，保持适度谦逊</strong>。
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">来源链接</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.oaktreecapital.com/insights/memo/ai-hurtles-ahead" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10">AI Hurtles Ahead ↗</a>
                      <a href="https://www.oaktreecapital.com/insights/memo/whats-going-on-in-private-credit" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10">私人信贷备忘录 ↗</a>
                      <a href="https://www.oaktreecapital.com/insights/memo/is-it-a-bubble" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10">Is It a Bubble? ↗</a>
                      <a href="https://seekingalpha.com/news/4573849-howard-marks-outlines-growing-concerns-about-private-credit-in-new-memo" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10">SA 报道 ↗</a>
                      <a href="https://acquirersmultiple.com/2026/03/howard-marks-ai-hurtles-ahead-market-implications-for-long-term-investors/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10">AI 启示分析 ↗</a>
                      <a href="https://www.oaktreecapital.com/insights" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10">Oaktree 研究 ↗</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">⚖️ 独立判断</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Marks 是三者中<strong className="text-white">最"中间派"</strong>的一位——他既不像 Hartnett 那样用极端历史类比来警示泡沫，也不像 Dalio 那样用宏大周期叙事来推导危机。他的价值在于<strong className="text-sky-300">提供衡量风险补偿的尺子</strong>而非方向性预测。关于 AI，"技术是真的但价格未必合理"是绝大多数理性投资者的共识。他关于私人信贷的警告<strong className="text-amber-300">更加值得重视</strong>——该市场确实经历了爆发式增长但未经压力测试，且与 PE 杠杆深度绑定。Oaktree 主动减仓的行为信号比任何言辞都更有分量。在当下环境，Marks 式的"适度谦逊"可能是三者中<strong className="text-white">最平衡、最可操作</strong>的投资态度。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ 今日分析 ════════════════ */}
        <section>
          <SectionDivider label="今日分析" />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {/* 独立判断 */}
            <div className="space-y-3">
              {snapshot.insights.slice(0, 2).map((insight) => (
                <InsightCard key={insight.title} {...insight} />
              ))}
            </div>

            {/* 结论区 */}
            <div className="space-y-3">
              {snapshot.insights.slice(2, 4).map((insight) => (
                <InsightCard key={insight.title} {...insight} />
              ))}

              {/* 一句话结论 */}
              <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-sky-950/20 to-slate-950 p-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400/80">
                  🎯 一句话结论
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  综合当天价格、利率、信用、库存数据，判断全球资金今天在追逐
                  <span className="font-semibold text-white">确定性增长（AI）</span>，
                  还是在押注
                  <span className="font-semibold text-amber-300">再通胀与补库（大宗）</span>，
                  抑或进入
                  <span className="font-semibold text-red-400">全面避险</span>。
                </p>
              </div>

              {/* 反方提醒 */}
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/4 p-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                  ⚠️ 反方提醒
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  市场最一致的方向，往往也是最大的反脆弱性来源。需要通过利率、信用利差和相关资产验证来检查叙事是否过热。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ 底部 ════════════════ */}
        <footer className="border-t border-white/[0.04] pt-6 text-center text-xs text-slate-600">
          自动生成 · 数据仅供参考 · 不构成投资建议
        </footer>
      </div>
    </main>
  );
}
