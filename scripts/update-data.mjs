import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "data", "tracking-config.json");
const snapshotPath = path.join(rootDir, "data", "latest-snapshot.json");
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

function asArray(value) {
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

function formatPercent(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function guessConfidence(value) {
  if (Math.abs(value) >= 2) return "高";
  if (Math.abs(value) >= 0.8) return "中";
  return "中低";
}

async function loadConfig() {
  const raw = await fs.readFile(configPath, "utf8");
  return JSON.parse(raw);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "market-watch/1.0",
      Accept: "application/json,text/plain,application/xml,text/xml,*/*",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchFinanceTarget(target) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    target.symbol,
  )}?interval=1d&range=10d`;
  const parsed = JSON.parse(await fetchText(url));
  const result = parsed?.chart?.result?.[0];
  const closes = asArray(result?.indicators?.quote?.[0]?.close).filter(
    (value) => typeof value === "number",
  );
  const highs = asArray(result?.indicators?.quote?.[0]?.high).filter(
    (value) => typeof value === "number",
  );
  const lows = asArray(result?.indicators?.quote?.[0]?.low).filter(
    (value) => typeof value === "number",
  );

  if (closes.length < 2) {
    throw new Error(`历史数据不足: ${target.symbol}`);
  }

  const latestClose = Number(closes.at(-1));
  const previousClose = Number(closes.at(-2));
  const change = latestClose - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    id: target.id,
    name: target.name,
    market: target.market,
    category: target.category,
    price: latestClose,
    currency: result?.meta?.currency ?? "USD",
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    high: Number(highs.at(-1)) || undefined,
    low: Number(lows.at(-1)) || undefined,
    thesis: target.thesis,
    source: "Yahoo Finance",
  };
}

function normalizeRssItems(feed) {
  const rssItems = asArray(feed?.rss?.channel?.item).map((item) => ({
    title: item.title ?? "未命名内容",
    link:
      typeof item.link === "string"
        ? item.link
        : item.link?.href ?? item.guid ?? "",
    publishedAt: item.pubDate ?? item.published ?? item.updated,
    summary: truncate(stripHtml(item.description ?? item["content:encoded"] ?? "")),
  }));

  const atomItems = asArray(feed?.feed?.entry).map((item) => ({
    title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "未命名内容",
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

async function fetchContentTarget(target) {
  const text = await fetchText(target.feedUrl);
  const parsed = xmlParser.parse(text);
  const items = normalizeRssItems(parsed);

  return {
    id: target.id,
    name: target.name,
    homepage: target.homepage,
    items,
  };
}

function buildLocalInsights(finance, content) {
  const sortedByMove = [...finance].sort(
    (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
  );
  const topMover = sortedByMove[0];
  const rising = finance.filter((item) => item.changePercent > 0).length;
  const falling = finance.filter((item) => item.changePercent < 0).length;
  const latestHeadline = content.flatMap((source) => source.items).at(0);

  const sentimentTitle =
    rising > falling ? "风险偏好仍有支撑" : rising < falling ? "市场分歧仍在扩大" : "市场整体延续分化";
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
          body: `${topMover.name} 今日变动 ${formatPercent(
            topMover.changePercent,
          )}。如果它代表的是你重点观察的风格或资产链条，通常值得作为今天复盘的第一入口。`,
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

function stripMarkdownFence(input = "") {
  return input
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function fetchAiInsights(config, finance, content) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey || !model) {
    return null;
  }

  const prompt = `
你是一个金融与内容观察助手。请根据以下 JSON 数据，用中文输出 3 条分析观点。
要求：
1. 只输出 JSON 数组。
2. 每个元素包含 title、body、confidence、tags 字段。
3. body 不要空话，要说明“价格变化”和“内容更新”之间可能的联系。
4. 不要编造数据中不存在的事实。

金融数据：
${JSON.stringify(finance, null, 2)}

内容数据：
${JSON.stringify(content, null, 2)}

站点配置：
${JSON.stringify(config.site, null, 2)}
  `.trim();

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "你是谨慎的市场分析助手，只能依据输入数据得出简洁结论。",
        },
        {
          role: "user",
          content: `请返回形如 {"insights":[...]} 的 JSON 对象。\n\n${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 分析请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const contentText = data?.choices?.[0]?.message?.content;

  if (!contentText) {
    return null;
  }

  const parsed = JSON.parse(stripMarkdownFence(contentText));
  return Array.isArray(parsed.insights) ? parsed.insights : null;
}

async function main() {
  const config = await loadConfig();

  const finance = (
    await Promise.allSettled(config.financeTargets.map((target) => fetchFinanceTarget(target)))
  )
    .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  const content = (
    await Promise.allSettled(config.contentTargets.map((target) => fetchContentTarget(target)))
  )
    .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  let insights = buildLocalInsights(finance, content);
  let analysisMode = "local";

  try {
    const aiInsights = await fetchAiInsights(config, finance, content);
    if (aiInsights?.length) {
      insights = aiInsights;
      analysisMode = "ai";
    }
  } catch (error) {
    console.warn("AI 分析未启用，回退到本地摘要：", error.message);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    analysisMode,
    finance,
    content,
    insights,
  };

  await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log("数据快照已更新");
  console.log(`金融条目: ${finance.length}`);
  console.log(`内容源: ${content.length}`);
  console.log(`分析模式: ${analysisMode}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
