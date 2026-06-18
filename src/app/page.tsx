export const dynamic = "force-dynamic";

import {
  formatDateTime,
  formatPrice,
  formatSignedNumber,
  formatSignedPercent,
  getDashboardSnapshot,
  getSummaryText,
  getTopMover,
  getTrackingConfig,
  type HistoryPoint,
} from "@/lib/dashboard";

/* ── SVG 趋势图 ── */

function SparklineChart({ history, color }: { history: HistoryPoint[]; color: string }) {
  if (!history || history.length < 2) return null;

  const values = history.map((p) => p.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const w = 200;
  const h = 56;
  const padX = 0;
  const padY = 4;

  const chartH = h - padY * 2;

  function x(i: number) {
    return padX + (i / (values.length - 1)) * (w - padX * 2);
  }
  function y(v: number) {
    return padY + chartH - ((v - min) / range) * chartH;
  }

  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto overflow-visible"
      preserveAspectRatio="none"
    >
      {/* 渐变填充区域 */}
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* 填充 */}
      <polygon
        fill={`url(#grad-${color})`}
        points={`${padX},${h} ${points} ${w - padX},${h}`}
      />
      {/* 折线 */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* 最新值圆点 */}
      <circle
        cx={x(values.length - 1)}
        cy={y(values.at(-1)!)}
        r="3"
        fill={color}
        stroke="#0f172a"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ── 颜色徽标 ── */

function ChangeBadge({ value }: { value: number }) {
  const tone =
    value > 0
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
      : value < 0
        ? "bg-rose-500/15 text-rose-300 ring-rose-400/20"
        : "bg-white/10 text-slate-200 ring-white/10";

  return (
    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm ring-1 ${tone}`}>
      {formatSignedPercent(value)}
    </span>
  );
}

/* ── 页面 ── */

export default async function Home() {
  const [config, snapshot] = await Promise.all([
    getTrackingConfig(),
    getDashboardSnapshot(),
  ]);
  const summaryText = getSummaryText(snapshot);
  const topMover = getTopMover(snapshot.finance);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
      {/* 顶栏 Hero */}
      <section className="grid gap-6 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_35%),linear-gradient(135deg,#111827,#050816)] p-8 shadow-2xl shadow-sky-950/30 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1 text-sm text-sky-200">
            每日自动更新的全球数据驾驶舱
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {config.site.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              {config.site.subtitle}。涵盖美股、日本、中国、欧洲四大市场，实时行情与内容追踪同屏展示。
            </p>
          </div>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            {summaryText}
          </p>
        </div>

        <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/6 p-5">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-sm text-slate-400">最近更新时间</div>
            <div className="mt-2 text-xl font-semibold text-white">
              {formatDateTime(snapshot.generatedAt)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-sm text-slate-400">追踪标的</div>
            <div className="mt-2 text-xl font-semibold text-white">
              {snapshot.finance.length} 个
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-sm text-slate-400">今日最大波动</div>
            <div className="mt-2 text-xl font-semibold text-white">
              {topMover ? topMover.name : "暂无数据"}
            </div>
            {topMover ? (
              <div className="mt-3">
                <ChangeBadge value={topMover.changePercent} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 市场板块：按地区分组 */}
      {["🇺🇸 美股", "🇯🇵 日本", "🇨🇳 中国 A 股", "🇭🇰 港股", "🇪🇺 欧洲", "🇬🇧 英国", "🇩🇪 德国"].map(
        (region) => {
          const items = snapshot.finance.filter((f) => f.market === region);
          if (!items.length) return null;
          return (
            <section key={region}>
              <h2 className="mb-4 text-xl font-semibold text-white">{region}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const firstClose = item.history?.at(0)?.close;
                  const lastClose = item.history?.at(-1)?.close;
                  const trendColor =
                    firstClose && lastClose && lastClose >= firstClose
                      ? "#34d399"
                      : "#fb7185";

                  return (
                    <article
                      key={item.id}
                      className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-black/20"
                    >
                      {/* 头部 */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-slate-400">
                            {item.category}
                          </div>
                          <h3 className="mt-1 truncate text-lg font-semibold text-white">
                            {item.name}
                          </h3>
                        </div>
                        <ChangeBadge value={item.changePercent} />
                      </div>

                      {/* 价格 */}
                      <div className="mt-3 text-2xl font-semibold text-white">
                        {formatPrice(item.price, item.currency)}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        日变动 {formatSignedNumber(item.change)} /{" "}
                        {formatSignedPercent(item.changePercent)}
                      </div>

                      {/* 趋势图 */}
                      {item.history && item.history.length >= 2 && (
                        <div className="mt-3">
                          <SparklineChart history={item.history} color={trendColor} />
                          <div className="mt-1 flex justify-between text-xs text-slate-500">
                            <span>
                              {new Date(
                                item.history[0].timestamp,
                              ).toLocaleDateString("zh-CN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>
                              {new Date(
                                item.history[item.history.length - 1].timestamp,
                              ).toLocaleDateString("zh-CN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 日高/日低 */}
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-slate-500">日高</div>
                          <div className="mt-1 font-medium">
                            {item.high?.toFixed(2) ?? "--"}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-slate-500">日低</div>
                          <div className="mt-1 font-medium">
                            {item.low?.toFixed(2) ?? "--"}
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {item.thesis}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        },
      )}

      {/* 站点与平台追踪 + 分析 */}
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">站点与平台追踪</h2>
              <p className="mt-1 text-sm text-slate-400">
                当前以 RSS / 官方公开源为主，适合做资讯、公告、政策与社区动态汇总。
              </p>
            </div>
            <div className="rounded-full bg-white/6 px-3 py-1 text-sm text-slate-300">
              {snapshot.content.length} 个来源
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {snapshot.content.map((source) => (
              <article
                key={source.id}
                className="rounded-[24px] border border-white/8 bg-white/4 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{source.name}</h3>
                    <div className="mt-1 text-sm text-slate-500">
                      共 {source.items.length} 条最近更新
                    </div>
                  </div>
                  {source.homepage ? (
                    <a
                      className="text-sm text-sky-300 transition hover:text-sky-200"
                      href={source.homepage}
                      target="_blank"
                      rel="noreferrer"
                    >
                      访问来源
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3">
                  {source.items.slice(0, 4).map((entry) => (
                    <a
                      key={entry.link}
                      href={entry.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-white/6 bg-black/15 p-4 transition hover:border-sky-400/20 hover:bg-sky-400/5"
                    >
                      <div className="text-sm text-slate-500">
                        {entry.publishedAt
                          ? formatDateTime(entry.publishedAt)
                          : "时间未知"}
                      </div>
                      <div className="mt-1 text-base font-medium text-white">
                        {entry.title}
                      </div>
                      {entry.summary ? (
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {entry.summary}
                        </p>
                      ) : null}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
            <h2 className="text-2xl font-semibold text-white">今日分析</h2>
            <div className="mt-5 space-y-4">
              {snapshot.insights.map((insight) => (
                <article
                  key={insight.title}
                  className="rounded-[24px] border border-white/8 bg-white/4 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-medium text-white">
                      {insight.title}
                    </h3>
                    {insight.confidence ? (
                      <span className="rounded-full bg-white/7 px-3 py-1 text-xs text-slate-300">
                        置信度 {insight.confidence}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {insight.body}
                  </p>
                  {insight.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {insight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
