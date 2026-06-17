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
} from "@/lib/dashboard";

function ChangeBadge({ value }: { value: number }) {
  const tone =
    value > 0
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
      : value < 0
        ? "bg-rose-500/15 text-rose-300 ring-rose-400/20"
        : "bg-white/10 text-slate-200 ring-white/10";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm ring-1 ${tone}`}>
      {formatSignedPercent(value)}
    </span>
  );
}

export default async function Home() {
  const [config, snapshot] = await Promise.all([
    getTrackingConfig(),
    getDashboardSnapshot(),
  ]);
  const summaryText = getSummaryText(snapshot);
  const topMover = getTopMover(snapshot.finance);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
      <section className="grid gap-6 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_35%),linear-gradient(135deg,#111827,#050816)] p-8 shadow-2xl shadow-sky-950/30 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1 text-sm text-sky-200">
            每日自动更新的数据驾驶舱
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {config.site.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              {config.site.subtitle}。你可以在一个页面里同时看金融行情、重点站点更新，以及系统给出的每日分析摘要。
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
            <div className="text-sm text-slate-400">分析模式</div>
            <div className="mt-2 text-xl font-semibold text-white">
              {snapshot.analysisMode === "ai" ? "AI 摘要" : "本地规则摘要"}
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

      <section className="grid gap-4 lg:grid-cols-4">
        {snapshot.finance.map((item) => (
          <article
            key={item.id}
            className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-black/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-slate-400">
                  {item.market} · {item.category}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-white">{item.name}</h2>
              </div>
              <ChangeBadge value={item.changePercent} />
            </div>
            <div className="mt-6 text-3xl font-semibold text-white">
              {formatPrice(item.price, item.currency)}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              日变动 {formatSignedNumber(item.change)} / {formatSignedPercent(item.changePercent)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="text-slate-500">日高</div>
                <div className="mt-1 font-medium">{item.high?.toFixed(2) ?? "--"}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="text-slate-500">日低</div>
                <div className="mt-1 font-medium">{item.low?.toFixed(2) ?? "--"}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{item.thesis}</p>
          </article>
        ))}
      </section>

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
                        {entry.publishedAt ? formatDateTime(entry.publishedAt) : "时间未知"}
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
                    <h3 className="text-lg font-medium text-white">{insight.title}</h3>
                    {insight.confidence ? (
                      <span className="rounded-full bg-white/7 px-3 py-1 text-xs text-slate-300">
                        置信度 {insight.confidence}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{insight.body}</p>
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

          <section className="rounded-[28px] border border-amber-300/10 bg-amber-300/6 p-6">
            <h2 className="text-xl font-semibold text-white">如何扩展</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>修改 `data/tracking-config.json`，增加你关心的股票、指数、RSS 或站点源。</li>
              <li>执行 `npm run update-data`，站内快照会重建并反映到首页。</li>
              <li>如果你配置了兼容 OpenAI 的接口，分析模块会自动切换为 AI 输出。</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
