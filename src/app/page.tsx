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

/* ── 趋势图 ── */
function SparklineChart({ history, color: strokeColor }: { history: HistoryPoint[]; color: string }) {
  if (!history || history.length < 2) return null;
  const values = history.map((p) => p.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const padY = 3;
  const chartH = h - padY * 2;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = padY + chartH - ((v - min) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const gradId = `spark-${strokeColor.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={`0,${h} ${points} ${w},${h}`} />
      <polyline fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={w} cy={padY + chartH - ((values.at(-1)! - min) / range) * chartH} r={2.5} fill={strokeColor} stroke="#0f172a" strokeWidth={1.5} />
    </svg>
  );
}

function Badge({ value }: { value: number }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
        value > 0
          ? "bg-emerald-500/12 text-emerald-400"
          : value < 0
            ? "bg-red-500/12 text-red-400"
            : "bg-white/6 text-slate-400"
      }`}
    >
      {value > 0 ? "▲" : value < 0 ? "▼" : ""}
      {formatSignedPercent(value)}
    </span>
  );
}

function FinanceCard({ item }: { item: any }) {
  const first = item.history?.at(0)?.close;
  const last = item.history?.at(-1)?.close;
  const trendColor = first && last && last >= first ? "#34d399" : "#fb7185";

  return (
    <article className="group rounded-2xl border border-white/[0.06] bg-gradient-to-b from-slate-800/40 to-slate-950/80 p-5 shadow-lg shadow-black/10 transition hover:border-white/[0.12] hover:shadow-xl">
      {/* 头部 */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{item.market}</span>
            <span className="text-slate-600">·</span>
            <span>{item.category}</span>
          </div>
          <h3 className="mt-0.5 truncate text-base font-semibold text-white">{item.name}</h3>
        </div>
        <Badge value={item.changePercent} />
      </div>

      {/* 价格 */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-white">
          {formatPrice(item.price, item.currency)}
        </span>
        <span className="text-xs text-slate-500">
          日 {formatSignedNumber(item.change)}
        </span>
      </div>

      {/* 趋势图 */}
      {item.history && item.history.length >= 2 && (
        <div className="mt-3">
          <SparklineChart history={item.history} color={trendColor} />
          <div className="mt-0.5 flex justify-between text-[10px] text-slate-600">
            <span>{new Date(item.history[0].timestamp).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</span>
            <span>{new Date(item.history[item.history.length - 1].timestamp).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* 日高/日低 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/[0.03] px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">日高</div>
          <div className="mt-0.5 text-sm font-medium tabular-nums text-slate-200">{item.high?.toFixed(2) ?? "--"}</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">日低</div>
          <div className="mt-0.5 text-sm font-medium tabular-nums text-slate-200">{item.low?.toFixed(2) ?? "--"}</div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">{item.thesis}</p>
    </article>
  );
}

export default async function Home() {
  const [config, snapshot] = await Promise.all([getTrackingConfig(), getDashboardSnapshot()]);
  const topMover = getTopMover(snapshot.finance);
  const summaryText = getSummaryText(snapshot);

  const regions = ["🇺🇸 美股", "🇯🇵 日本", "🇨🇳 中国 A 股", "🇭🇰 港股", "🇪🇺 欧洲", "🇬🇧 英国", "🇩🇪 德国", "AI 链", "大宗商品", "宏观"];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:px-8 lg:px-10">
      <div className="space-y-10">
        {/* ═════ HERO ═════ */}
        <section>
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 p-7 shadow-2xl shadow-black/40 md:p-9">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/8 px-3.5 py-1 text-xs font-medium text-sky-300/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400/60" />
                  每日自动更新的全球数据驾驶舱
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{config.site.title}</h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-400">{config.site.subtitle}</p>
                <p className="max-w-xl text-sm leading-relaxed text-slate-400">{summaryText}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-white">{snapshot.finance.length}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">追踪标的</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-white">{formatDateTime(snapshot.generatedAt)}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">最近更新</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-white">{topMover?.name ?? "—"}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">今日最大波动</div>
                  {topMover && (
                    <div className="mt-1">
                      <Badge value={topMover.changePercent} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════ 按区域分组 ═════ */}
        {regions.map((region) => {
          const items = snapshot.finance.filter((f) => f.market === region);
          if (!items.length) return null;
          return (
            <section key={region}>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-5 w-1 rounded-full bg-white/[0.10]" />
                <h2 className="text-base font-bold text-white">{region}</h2>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-500">{items.length} 个标的</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <FinanceCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}

        {/* ═════ 内容追踪 + 分析 ═════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-5 w-1 rounded-full bg-white/[0.10]" />
            <h2 className="text-base font-bold text-white">站点与平台追踪</h2>
            <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-500">{snapshot.content.length} 个来源</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              {snapshot.content.map((source) => (
                <div key={source.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{source.name}</h3>
                      <div className="mt-0.5 text-xs text-slate-500">{source.items.length} 条最近更新</div>
                    </div>
                    {source.homepage && (
                      <a href={source.homepage} target="_blank" rel="noreferrer" className="shrink-0 rounded-md bg-white/[0.04] px-3 py-1 text-xs font-medium text-sky-400 transition hover:bg-sky-400/10">
                        访问 ↗
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    {source.items.slice(0, 4).map((entry) => (
                      <a key={entry.link} href={entry.link} target="_blank" rel="noreferrer" className="block rounded-lg border border-white/[0.04] bg-black/20 px-4 py-3 transition hover:border-sky-500/15 hover:bg-sky-500/4">
                        <div className="text-[11px] text-slate-500">{entry.publishedAt ? formatDateTime(entry.publishedAt) : "时间未知"}</div>
                        <div className="mt-0.5 text-sm font-medium text-white">{entry.title}</div>
                        {entry.summary && <p className="mt-1 text-xs leading-relaxed text-slate-400 line-clamp-2">{entry.summary}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="mb-4 text-sm font-semibold text-white">今日分析</h3>
                <div className="space-y-3">
                  {snapshot.insights.map((insight) => (
                    <div key={insight.title} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                        {insight.confidence && (
                          <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">{insight.confidence}</span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400">{insight.body}</p>
                      {insight.tags?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {insight.tags.map((t) => (
                            <span key={t} className="rounded-md bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500">{t}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <footer className="border-t border-white/[0.04] pt-6 text-center text-xs text-slate-600">
          自动生成 · 数据仅供参考 · 不构成投资建议
        </footer>
      </div>
    </main>
  );
}
