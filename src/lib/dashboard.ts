import fs from "node:fs/promises";
import path from "node:path";

export type FinanceItem = {
  id: string;
  name: string;
  market: string;
  category: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  thesis?: string;
  source?: string;
};

export type ContentItem = {
  title: string;
  link: string;
  publishedAt?: string;
  summary?: string;
  translatedTitle?: string;
  translatedSummary?: string;
};

export type ContentSource = {
  id: string;
  name: string;
  homepage?: string;
  items: ContentItem[];
};

export type Insight = {
  title: string;
  body: string;
  confidence?: string;
  tags?: string[];
};

export type DashboardSnapshot = {
  generatedAt: string;
  analysisMode?: string;
  finance: FinanceItem[];
  content: ContentSource[];
  insights: Insight[];
};

export type TrackingConfig = {
  site: {
    title: string;
    subtitle: string;
    refreshCadence: string;
  };
  financeTargets: Array<{
    id: string;
    name: string;
    symbol: string;
    market: string;
    category: string;
    thesis: string;
  }>;
  contentTargets: Array<{
    id: string;
    name: string;
    kind: string;
    feedUrl: string;
    homepage?: string;
  }>;
};

const rootDir = process.cwd();
const snapshotPath = path.join(rootDir, "data", "latest-snapshot.json");
const configPath = path.join(rootDir, "data", "tracking-config.json");

const fallbackSnapshot: DashboardSnapshot = {
  generatedAt: new Date().toISOString(),
  analysisMode: "local",
  finance: [],
  content: [],
  insights: [],
};

function parseSnapshot(raw: string): DashboardSnapshot {
  const parsed = JSON.parse(raw) as DashboardSnapshot;
  return {
    ...fallbackSnapshot,
    ...parsed,
    finance: Array.isArray(parsed.finance) ? parsed.finance : [],
    content: Array.isArray(parsed.content) ? parsed.content : [],
    insights: Array.isArray(parsed.insights) ? parsed.insights : [],
  };
}

/**
 * 获取 Dashboard 快照
 *
 * - Vercel 环境：调用实时 API（本地文件不可写，每次请求实时抓取）
 * - VPS/Docker 环境：读取本地 latest-snapshot.json（由 cron 定时更新）
 */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    try {
      const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      const response = await fetch(`${origin}/api/snapshot`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`API 返回 ${response.status}`);
      const data = await response.json();
      return data as DashboardSnapshot;
    } catch (error) {
      console.warn("Vercel 实时 API 不可用，尝试读取本地快照:", error);
      // 降级：尝试读取本地文件（部署时带入的快照）
      try {
        const raw = await fs.readFile(snapshotPath, "utf8");
        return parseSnapshot(raw);
      } catch {
        return fallbackSnapshot;
      }
    }
  }

  // 非 Vercel 环境：读取本地文件
  try {
    const raw = await fs.readFile(snapshotPath, "utf8");
    return parseSnapshot(raw);
  } catch {
    return fallbackSnapshot;
  }
}

export async function getTrackingConfig(): Promise<TrackingConfig> {
  const raw = await fs.readFile(configPath, "utf8");
  return JSON.parse(raw) as TrackingConfig;
}

/* ── 格式化函数 ── */

export function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

export function formatSignedNumber(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/* ── 分析函数 ── */

export function getMarketTone(finance: FinanceItem[]) {
  if (!finance.length) return "暂无市场快照";

  const rising = finance.filter((item) => item.changePercent > 0).length;
  const falling = finance.filter((item) => item.changePercent < 0).length;

  if (rising >= Math.max(2, falling + 1)) return "偏积极";
  if (falling >= Math.max(2, rising + 1)) return "偏谨慎";
  return "分化中";
}

export function getTopMover(finance: FinanceItem[]) {
  return [...finance].sort(
    (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
  )[0];
}

export function getSummaryText(snapshot: DashboardSnapshot) {
  const tone = getMarketTone(snapshot.finance);
  const topMover = getTopMover(snapshot.finance);
  const feedCount = snapshot.content.reduce(
    (total, source) => total + source.items.length,
    0,
  );

  if (!topMover) {
    return "当前还没有可展示的追踪数据，先运行一次更新脚本即可生成首页内容。";
  }

  return `当前市场情绪${tone}。波动最大的追踪对象是 ${topMover.name}，日内变动 ${formatSignedPercent(topMover.changePercent)}。站内同时汇总了 ${feedCount} 条内容更新，方便你把行情、政策和站点动态放在同一个界面里一起判断。`;
}
