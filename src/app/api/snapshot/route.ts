import { NextResponse } from "next/server";

/**
 * 实时快照 API
 * 在 Vercel Serverless 环境中，每次请求实时抓取最新数据并返回。
 * 不依赖本地文件写入，Vercel 原生兼容。
 */
export const maxDuration = 120;
export const dynamic = "force-dynamic";

import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

/* ── 工具函数 ── */
function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(input = "") {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input = "", length = 160) {
  if (input.length <= length) return input;
  return `${input.slice(0, length).trim()}…`;
}

function formatPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function guessConfidence(value: number) {
  if (Math.abs(value) >= 2) return "高";
  if (Math.abs(value) >= 0.8) return "中";
  return "中低";
}

/* ── 数据源 ── */

type FinanceTarget = {
  id: string;
  name: string;
  symbol: string;
  market: string;
  category: string;
  thesis: string;
};

type ContentTarget = {
  id: string;
  name: string;
  kind: string;
  feedUrl: string;
  homepage?: string;
};

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "market-watch/1.0",
      Accept: "application/json,text/plain,application/xml,text/xml,*/*",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`请求失败: ${response.status}`);
  return response.text();
}

async function fetchFinanceTarget(target: FinanceTarget) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(target.symbol)}?interval=1d&range=10d`;
  const parsed = JSON.parse(await fetchText(url));
  const result = parsed?.chart?.result?.[0];
  const closes = asArray(result?.indicators?.quote?.[0]?.close).filter(
    (v): v is number => typeof v === "number",
  );
  const highs = asArray(result?.indicators?.quote?.[0]?.high).filter(
    (v): v is number => typeof v === "number",
  );
  const lows = asArray(result?.indicators?.quote?.[0]?.low).filter(
    (v): v is number => typeof v === "number",
  );

  if (closes.length < 2) throw new Error(`历史数据不足: ${target.symbol}`);

  const latestClose = closes.at(-1)!;
  const previousClose = closes.at(-2)!;
  const change = latestClose - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    id: target.id,
    name: target.name,
    market: target.market,
    category: target.category,
    price: Number(latestClose.toFixed(2)),
    currency: result?.meta?.currency ?? "USD",
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    high: highs.at(-1) ? Number(Number(highs.at(-1)).toFixed(2)) : undefined,
    low: lows.at(-1) ? Number(Number(lows.at(-1)).toFixed(2)) : undefined,
    thesis: target.thesis,
    source: "Yahoo Finance",
  };
}

function normalizeRssItems(feed: Record<string, unknown>) {
  const rssItems = asArray((feed as any)?.rss?.channel?.item).map(
    (item: any) => ({
      title: item.title ?? "未命名内容",
      link:
        typeof item.link === "string"
          ? item.link
          : item.link?.href ?? item.guid ?? "",
      publishedAt: item.pubDate ?? item.published ?? item.updated,
      summary: truncate(stripHtml(item.description ?? item["content:encoded"] ?? "")),
    }),
  );

  const atomItems = asArray((feed as any)?.feed?.entry).map((item: any) => ({
    title:
      typeof item.title === "string"
        ? item.title
        : item.title?.["#text"] ?? "未命名内容",
    link:
      typeof item.link === "string"
        ? item.link
        : item.link?.href ?? asArray(item.link)[0]?.href ?? "",
    publishedAt: item.updated ?? item.published,
    summary: truncate(stripHtml(item.summary ?? item.content ?? "")),
  }));

  return [...rssItems, ...atomItems]
    .filter((item) => item.link || item.title)
    .slice(0, 6);
}

async function fetchContentTarget(target: ContentTarget) {
  const text = await fetchText(target.feedUrl);
  const parsed = xmlParser.parse(text) as Record<string, unknown>;
  const items = normalizeRssItems(parsed);
  return { id: target.id, name: target.name, homepage: target.homepage, items };
}

/* ── 分析 ── */

function buildInsights(
  finance: Awaited<ReturnType<typeof fetchFinanceTarget>>[],
  content: Awaited<ReturnType<typeof fetchContentTarget>>[],
) {
  const sorted = [...finance].sort(
    (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
  );
  const topMover = sorted[0];
  const rising = finance.filter((i) => i.changePercent > 0).length;
  const falling = finance.filter((i) => i.changePercent < 0).length;
  const latestHeadline = content.flatMap((s) => s.items).at(0);

  const sentimentTitle =
    rising > falling
      ? "风险偏好仍有支撑"
      : rising < falling
        ? "市场分歧仍在扩大"
        : "市场整体延续分化";
  const sentimentBody =
    rising > falling
      ? "上涨标的数量更多，说明资金仍愿意承担一定风险，但还需要继续观察是否有更广泛的扩散。"
      : rising < falling
        ? "下跌标的数量偏多，短期情绪更容易受到政策、盈利或宏观变量扰动。"
        : "主要追踪标的方向并不一致，当前更像结构性行情，而不是单边趋势。";

  return [
    topMover
      ? {
          title: `${topMover.name} 是今日最大波动来源`,
          body: `${topMover.name} 今日变动 ${formatPercent(topMover.changePercent)}。如果它代表的是你重点观察的风格或资产链条，通常值得作为今天复盘的第一入口。`,
          confidence: guessConfidence(topMover.changePercent),
          tags: [topMover.market, topMover.category],
        }
      : null,
    {
      title: sentimentTitle,
      body: sentimentBody,
      confidence: "中",
      tags: ["市场情绪", "日更"],
    },
    latestHeadline
      ? {
          title: "最新内容更新可作为行情解释线索",
          body: `最近抓到的一条内容是“${latestHeadline.title}”。把事件流和价格变化放在一起看，更容易判断今天是消息驱动，还是纯资金风格切换。`,
          confidence: "中",
          tags: ["内容跟踪", "事件驱动"],
        }
      : null,
  ].filter(Boolean);
}

/* ── 主处理 ── */

export async function GET() {
  try {
    // 读取配置
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const configRaw = await fs.readFile(
      path.join(process.cwd(), "data", "tracking-config.json"),
      "utf8",
    );
    const config = JSON.parse(configRaw);
    const financeTargets: FinanceTarget[] = config.financeTargets ?? [];
    const contentTargets: ContentTarget[] = config.contentTargets ?? [];

    // 并行抓取
    const [financeResults, contentResults] = await Promise.all([
      Promise.allSettled(financeTargets.map(fetchFinanceTarget)),
      Promise.allSettled(contentTargets.map(fetchContentTarget)),
    ]);

    const finance = financeResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const content = contentResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const insights = buildInsights(finance, content);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      analysisMode: "local",
      finance,
      content,
      insights,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "未知错误";
    console.error("快照生成失败:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
