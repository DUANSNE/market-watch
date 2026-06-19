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
          <SectionDivider label="三条大师视角 · 交叉验证" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {/* Hartnett */}
            <div className="group rounded-xl border border-white/[0.06] bg-gradient-to-br from-sky-950/30 to-slate-950 p-5 transition hover:border-sky-500/20">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sm font-bold text-sky-400">
                  H
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Michael Hartnett</div>
                  <div className="text-[11px] text-slate-500">市场体温计</div>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">资金流向</span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">拥挤交易</span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">反身性</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                擅长看资金流向、拥挤交易与情绪摆动的反转点。当前他会关注资金是否从 AI 向价值/大宗轮动，以及债券与股票之间的相对吸引力。当所有人都在同一方向时，他会提示拥挤风险。
              </p>
            </div>

            {/* Dalio */}
            <div className="group rounded-xl border border-white/[0.06] bg-gradient-to-br from-emerald-950/30 to-slate-950 p-5 transition hover:border-emerald-500/20">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-bold text-emerald-400">
                  D
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Ray Dalio</div>
                  <div className="text-[11px] text-slate-500">宏观结构图</div>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">债务周期</span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">货币体系</span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">长期约束</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                擅长看债务周期位置、货币信用体系变化和国家间力量转移。当前他会关注去全球化对通胀的结构性影响、中美脱钩对资本流动的改变，以及各国债务水平的可持续性。
              </p>
            </div>

            {/* Marks */}
            <div className="group rounded-xl border border-white/[0.06] bg-gradient-to-br from-rose-950/30 to-slate-950 p-5 transition hover:border-rose-500/20">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-sm font-bold text-rose-400">
                  M
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Howard Marks</div>
                  <div className="text-[11px] text-slate-500">风险尺子</div>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">周期位置</span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">估值</span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">风险补偿</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                擅长看市场处在周期的哪个位置、是否物有所值。当前他会评估 AI 估值是否已消化所有利好、大宗是否提供了不对称的赔率，以及信用市场是否在传递警示信号。
              </p>
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
