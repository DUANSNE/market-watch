"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

type BondItem = {
  id: string;
  name: string;
  market: string;
  category: string;
  price: number;
  changePercent: number;
  history?: { timestamp: number; close: number }[];
};

/* 判断是美债收益率还是 ETF 价格 */
function isYieldItem(item: BondItem) {
  return item.id.startsWith("us");
}

function SingleChart({
  items,
  title,
  yUnit,
  isLog: initialLog,
  colorMap,
}: {
  items: BondItem[];
  title: string;
  yUnit: string;
  isLog: boolean;
  colorMap: Record<string, string>;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [logScale, setLogScale] = useState(initialLog);
  const needsNormalize = items.length > 0 && !isYieldItem(items[0]);

  useEffect(() => {
    if (!chartRef.current || items.length === 0) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, null, { renderer: "svg" });
    }
    const chart = chartInstance.current;

    const series: echarts.SeriesOption[] = [];
    const legendData: string[] = [];

    // 判断是否需要归一化（ETF 类需要用 base=100 来展示相对表现）
    // needsNormalize 已在组件作用域中定义

    items.forEach((item) => {
      if (!item.history || item.history.length < 5) return;
      const color = colorMap[item.id] || "#60a5fa";
      const dash = item.category === "短债" || item.category === "中债" ? "dashed" : "solid";
      const width = item.category === "长债" || item.category === "超长债" ? 2.5 : 1.8;

      let seriesData: [number, number][];
      if (needsNormalize) {
        // 归一化：首日=100，后续为相对值
        const base = item.history[0].close;
        seriesData = item.history.map((p) => [p.timestamp, base > 0 ? (p.close / base) * 100 : 100]);
      } else {
        seriesData = item.history.map((p) => [p.timestamp, p.close]);
      }

      series.push({
        name: item.name,
        type: "line",
        data: seriesData,
        smooth: true,
        symbol: "none",
        lineStyle: { width, type: dash as any, color },
        itemStyle: { color },
        emphasis: { focus: "series" },
      });
      legendData.push(item.name);
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        backgroundColor: "rgba(15,23,42,0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        textStyle: { color: "#e2e8f0", fontSize: 12 },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return "";
          const date = new Date(params[0].data[0]).toLocaleDateString("zh-CN", {
            year: "numeric", month: "short", day: "numeric",
          });
          let html = `<div style="font-size:13px;font-weight:600;margin-bottom:6px;color:#94a3b8">${date}</div>`;
          params.forEach((pp: any) => {
            const val = needsNormalize
              ? (pp.data[1] - 100).toFixed(2) + "%"
              : pp.data[1].toFixed(2) + yUnit;
            html += `<div style="display:flex;justify-content:space-between;gap:24px;padding:2px 0">
              <span style="color:${pp.color};display:flex;align-items:center;gap:4px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${pp.color}"></span>
                ${pp.seriesName}
              </span>
              <span style="font-weight:600;color:#e2e8f0">${val}</span>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        data: legendData,
        textStyle: { color: "#94a3b8", fontSize: 11 },
        bottom: 0,
        type: "scroll",
        pageTextStyle: { color: "#94a3b8" },
      },
      grid: { left: 60, right: 30, top: 20, bottom: 50 },
      xAxis: {
        type: "time",
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
        axisLabel: { color: "#64748b", fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: logScale ? "log" : "value",
        axisLine: { show: false },
        axisLabel: {
          color: "#64748b", fontSize: 11,
          formatter: (v: number) => {
            if (needsNormalize) return (v - 100).toFixed(0) + "%";
            return v.toFixed(1) + yUnit;
          },
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)", type: "dashed" as const } },
      },
      dataZoom: [
        { type: "inside" as const, start: 30, end: 100 },
        {
          type: "slider" as const, bottom: 22, height: 14,
          borderColor: "rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.02)",
          fillerColor: "rgba(96,165,250,0.15)",
          textStyle: { color: "#64748b", fontSize: 10 },
        },
      ],
      series,
    };

    chart.setOption(option, true);
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [items, logScale, colorMap, yUnit]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-slate-500">
            {items.length} 个品种 · 可缩放
          </span>
        </div>
        <button
          onClick={() => { chartInstance.current?.dispose(); chartInstance.current = null; setLogScale(!logScale); }}
          className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
            logScale
              ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
              : "border-white/10 bg-white/6 text-slate-400"
          }`}
        >
          {logScale ? "📐 对数" : "📏 线性"}
        </button>
      </div>
      <div ref={chartRef} style={{ width: "100%", height: "420px" }} />
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>▬ 实线 = 长债</span>
        <span>- - 虚线 = 短债/中债</span>
        {needsNormalize && <span>📌 归一化: 起始日 = 100</span>}
      </div>
    </div>
  );
}

export default function BondCharts({ items }: { items: BondItem[] }) {
  const yieldItems = items.filter((i) => i.id.startsWith("us"));
  const etfItems = items.filter((i) => !i.id.startsWith("us"));

  const yieldColors: Record<string, string> = {
    us10y: "#60a5fa", us30y: "#3b82f6", us5y: "#93c5fd", us3m: "#bfdbfe",
  };
  const etfColors: Record<string, string> = {
    "china-bond": "#fbbf24", "intl-treas": "#34d399", "em-bonds": "#a78bfa",
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-slate-800/40 to-slate-950/80 p-5 shadow-lg">
        <SingleChart
          items={yieldItems}
          title="🇺🇸 美债收益率"
          yUnit="%"
          isLog={false}
          colorMap={yieldColors}
        />
      </div>

      {etfItems.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-slate-800/40 to-slate-950/80 p-5 shadow-lg">
          <SingleChart
            items={etfItems}
            title="🌍 全球债券 ETF 相对表现"
            yUnit=""
            isLog={true}
            colorMap={etfColors}
          />
        </div>
      )}
    </div>
  );
}
