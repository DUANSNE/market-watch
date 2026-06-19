export const dynamic = "force-dynamic";

import {
  formatDateTime,
  formatPrice,
  formatSignedPercent,
  getDashboardSnapshot,
  getTrackingConfig,
  type FinanceItem,
} from "@/lib/dashboard";

/* ── 助手函数 ── */

function Badge({ value }: { value: number }) {
  const color = value > 0 ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
    : value < 0 ? "bg-rose-500/15 text-rose-300 ring-rose-400/20"
    : "bg-white/10 text-slate-200 ring-white/10";
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs ring-1 ${color}`}>
      {formatSignedPercent(value)}
    </span>
  );
}

function DataRow({ label, item }: { label: string; item?: FinanceItem }) {
  if (!item) return null;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-base font-medium text-white">{item.name}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-white">{formatPrice(item.price, item.currency)}</div>
        <Badge value={item.changePercent} />
      </div>
    </div>
  );
}

/* ── 页面 ── */

export default async function EveningPage() {
  const [config, snapshot] = await Promise.all([getTrackingConfig(), getDashboardSnapshot()]);

  const aiItems = snapshot.finance.filter((f) => f.market === "AI 链");
  const commodityItems = snapshot.finance.filter((f) => f.market === "大宗商品");
  const macroItems = snapshot.finance.filter((f) => f.market === "宏观");
  const marketItems = snapshot.finance.filter((f) => ["🇺🇸 美股", "🇯🇵 日本", "🇨🇳 中国 A 股", "🇭🇰 港股", "🇪🇺 欧洲", "🇬🇧 英国", "🇩🇪 德国"].includes(f.market));

  const sox = snapshot.finance.find((f) => f.id === "sox");
  const crude = snapshot.finance.find((f) => f.id === "crude");
  const gold = snapshot.finance.find((f) => f.id === "gold");
  const copper = snapshot.finance.find((f) => f.id === "copper");
  const dxy = snapshot.finance.find((f) => f.id === "dxy");
  const us10y = snapshot.finance.find((f) => f.id === "us10y");
  const vix = snapshot.finance.find((f) => f.id === "vix");
  const sp500 = snapshot.finance.find((f) => f.id === "sp500");
  const nasdaq = snapshot.finance.find((f) => f.id === "nasdaq");
  const nvidia = snapshot.finance.find((f) => f.id === "nvidia");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
      {/* 标题 */}
      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_35%),linear-gradient(135deg,#111827,#050816)] p-8 shadow-2xl">
        <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1 text-sm text-amber-200">
          🌙 每晚更新 · {formatDateTime(snapshot.generatedAt)}
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">晚间全球观察</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-300">
          AI vs 大宗 · 三条大师视角 · 每天一个独立判断
        </p>
      </section>

      {/* ── 第一组：AI 链 vs 大宗链 ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* AI 链 */}
        <div className="rounded-[24px] border border-sky-400/15 bg-slate-950/70 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span className="text-sky-300">⚡</span> AI 链
          </h2>
          <p className="mt-1 text-sm text-slate-400">营收增长、资本开支、产业扩散</p>
          <div className="mt-4 space-y-2">
            {aiItems.map((item) => <DataRow key={item.id} label={item.category} item={item} />)}
            {nvidia && <DataRow label="AI 算力核心" item={nvidia} />}
          </div>
        </div>

        {/* 大宗链 */}
        <div className="rounded-[24px] border border-amber-400/15 bg-slate-950/70 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span className="text-amber-300">🛢</span> 大宗链
          </h2>
          <p className="mt-1 text-sm text-slate-400">库存、供需、再通胀、赔率</p>
          <div className="mt-4 space-y-2">
            <DataRow label="能源" item={crude} />
            <DataRow label="贵金属" item={gold} />
            <DataRow label="工业金属" item={copper} />
          </div>
        </div>
      </section>

      {/* ── 第二组：宏观约束 ── */}
      <section className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
        <h2 className="text-xl font-semibold text-white">📊 宏观约束</h2>
        <p className="mt-1 text-sm text-slate-400">利率、汇率、波动率——决定资金在 AI 与大宗之间如何分配</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DataRow label="美元指数" item={dxy} />
          <DataRow label="US 10Y 收益率" item={us10y} />
          <DataRow label="VIX 恐慌指数" item={vix} />
          <DataRow label="SOX / 科技情绪" item={sox} />
        </div>
      </section>

      {/* ── 第三组：大师视角 ── */}
      <section className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
        <h2 className="text-xl font-semibold text-white">🧠 三条大师视角</h2>
        <p className="mt-1 mb-5 text-sm text-slate-400">每天从不同维度交叉验证市场叙事</p>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Michael Hartnett — 市场体温计 */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/20 text-xs text-sky-300">H</span>
              <h3 className="font-semibold text-white">Michael Hartnett</h3>
            </div>
            <p className="mt-2 text-xs text-slate-400">资金流向 · 拥挤交易 · 反身性</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              擅长看资金流向、拥挤交易与情绪摆动的反转点。当前他会关注资金是否从 AI 向价值/大宗轮动，以及债券与股票之间的相对吸引力。
            </p>
          </div>

          {/* Ray Dalio — 宏观结构 */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300">D</span>
              <h3 className="font-semibold text-white">Ray Dalio</h3>
            </div>
            <p className="mt-2 text-xs text-slate-400">债务周期 · 货币体系 · 长期约束</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              擅长看债务周期位置、货币信用体系变化和国家间力量转移。当前他会关注去全球化对通胀的影响、中美脱钩对资本流动的改变。
            </p>
          </div>

          {/* Howard Marks — 风险尺子 */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-400/20 text-xs text-rose-300">M</span>
              <h3 className="font-semibold text-white">Howard Marks</h3>
            </div>
            <p className="mt-2 text-xs text-slate-400">周期位置 · 估值 · 风险补偿</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              擅长看市场处在周期的哪个位置、是否物有所值。当前他会评估 AI 估值是否已消化所有利好、大宗是否提供了不对称的赔率。
            </p>
          </div>
        </div>
      </section>

      {/* ── 第四组：每日分析 ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">💡 今日独立判断</h2>
          <div className="mt-4 space-y-3">
            {snapshot.insights.slice(0, 3).map((insight) => (
              <div key={insight.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-white">{insight.title}</h3>
                  {insight.confidence && (
                    <span className="rounded-full bg-white/7 px-2 py-0.5 text-xs text-slate-300">
                      {insight.confidence}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{insight.body}</p>
                {insight.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {insight.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-sky-400/10 px-2 py-0.5 text-xs text-sky-200">{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">🎯 一句话结论</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-sky-400/6 p-5">
              <p className="text-sm leading-7 text-slate-200">
                综合当天价格、利率、信用、库存数据，要判断：<strong>全球资金今天在追逐确定性增长（AI），还是在押注再通胀与补库（大宗），还是在全面避险？</strong>
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-amber-400/6 p-5">
              <p className="text-sm leading-7 text-slate-200">
                <strong>反方提醒：</strong>市场最一致的方向，往往也是最大的反脆弱性来源。需要通过利率、信用利差和相关资产验证来检查叙事是否过热。
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
              <p className="text-sm leading-7 text-slate-200">
                <strong>一致 & 分歧：</strong>本框架与 Hartnett（资金流向）、Dalio（宏观结构）、Marks（周期位置）的关系会在每晚更新中标注一致点和分歧点，帮你区分"事实"和"定价"谁跑得更快。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
