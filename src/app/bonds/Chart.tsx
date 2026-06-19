"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

type BondItem = {
  id: string;
  name: string;
  market: string;
  category: string;
  price: number;
  history?: { timestamp: number; close: number }[];
};

export default function BondChart({ items }: { items: BondItem[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLog, setIsLog] = useState(true);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, null, { renderer: "svg" });
    }
    const chart = chartInstance.current;

    // Color mapping by region
    const colorMap: Record<string, string> = {
      "🇺🇸 美国": "#60a5fa",
      "🇪🇺 欧洲": "#34d399",
      "🇨🇳 中国": "#fbbf24",
      "🌍 全球": "#a78bfa",
    };

    const shortColorMap: Record<string, string> = {
      "🇺🇸 美国": "#93c5fd",
    };

    const series: echarts.SeriesOption[] = [];
    const legendData: string[] = [];

    items.forEach((item) => {
      if (!item.history || item.history.length < 5) return;
      const isYieldTicker = item.id.startsWith("us") && item.category !== "超长债";
      const color = item.market === "🇺🇸 美国" && item.category !== "长债"
        ? shortColorMap[item.market] || "#93c5fd"
        : colorMap[item.market] || "#999";
      const dash = item.category === "短债" || item.category === "中债" ? "dash" : "solid";

      const data = item.history.map((p) => [p.timestamp, p.close] as [number, number]);

      // For ETF-type data (Bund, China, Intl), normalize to percent change from start
      const isEtf = !item.id.startsWith("us");
      let seriesData: [number, number][];
      if (isEtf) {
        const base = data[0][1];
        seriesData = data.map(([ts, val]) => [ts, ((val - base) / base) * 100]);
      } else {
        seriesData = data;
      }

      series.push({
        name: item.name,
        type: "line",
        data: seriesData,
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: isEtf || item.category === "长债" ? 2.5 : 1.8,
          type: dash === "dash" ? "dashed" : "solid",
          color,
        },
        itemStyle: { color },
        emphasis: { focus: "series" },
      });
      legendData.push(item.name);
    });

    const option: echarts.EChartsOption = {
      color: ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#93c5fd"],
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        backgroundColor: "rgba(15,23,42,0.92)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        textStyle: { color: "#e2e8f0", fontSize: 12 },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return "";
          const p = params[0];
          const date = new Date(p.data[0]).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
          let html = `<div style="font-size:13px;font-weight:600;margin-bottom:6px;color:#94a3b8">${date}</div>`;
          params.forEach((pp: any) => {
            const val = pp.seriesName.includes("US") ? pp.data[1].toFixed(2) + "%" : pp.data[1].toFixed(2) + "%";
            html += `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0">
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
        pageTextStyle: { color: "#94a3b8" },
        bottom: 0,
        type: "scroll",
      },
      grid: { left: 60, right: 40, top: 30, bottom: 56 },
      xAxis: {
        type: "time",
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
        axisLabel: { color: "#64748b", fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: isLog ? "log" : "value",
        logBase: items[0]?.id.startsWith("us") ? 10 : Math.E,
        axisLine: { show: false },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          formatter: (v: number) => {
            if (items[0]?.id.startsWith("us")) return v.toFixed(1) + "%";
            return v.toFixed(0) + "%";
          },
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)", type: "dashed" } },
      },
      dataZoom: [
        { type: "inside", start: 0, end: 100 },
        { type: "slider", bottom: 24, height: 16, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", fillerColor: "rgba(96,165,250,0.15)", textStyle: { color: "#64748b", fontSize: 10 } },
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
  }, [items, isLog]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            可拖拽缩放 · 悬停查看详情 · 点击图例切换品种
          </p>
        </div>
        <button
          onClick={() => { chartInstance.current?.dispose(); chartInstance.current = null; setIsLog(!isLog); }}
          className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition ${
            isLog
              ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
              : "border-white/10 bg-white/6 text-slate-400"
          }`}
        >
          {isLog ? "📐 对数坐标" : "📏 线性坐标"}
        </button>
      </div>
      <div ref={chartRef} style={{ width: "100%", height: "520px" }} />
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500 md:grid-cols-4">
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <span className="font-medium text-sky-400">—</span> 美国收益率（实线=长债，虚线=短债）
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <span className="font-medium text-emerald-400">—</span> 欧洲 Bund（累计%）
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <span className="font-medium text-amber-400">—</span> 中国国债（累计%）
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <span className="font-medium text-purple-400">—</span> 国际国债（累计%）
        </div>
      </div>
    </div>
  );
}
