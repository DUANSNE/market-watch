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

function isYieldItem(item: BondItem) {
  return item.id.startsWith("us");
}

/* Monochrome palette for black background */
const C = {
  series: ["#ffffff", "#c0c0c0", "#888888", "#555555", "#333333"],
  ink: "#ffffff",
  muted: "#777777",
  rule: "rgba(255,255,255,0.08)",
  gridBg: "rgba(255,255,255,0.015)",
  tooltipBg: "rgba(0,0,0,0.92)",
};

function SingleChart({
  items, title, yUnit, isLog: initialLog,
}: {
  items: BondItem[]; title: string; yUnit: string; isLog: boolean;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<echarts.ECharts | null>(null);
  const [logScale, setLogScale] = useState(initialLog);
  const needsNorm = items.length > 0 && !isYieldItem(items[0]);

  useEffect(() => {
    if (!chartRef.current || items.length === 0) return;
    if (!instRef.current) instRef.current = echarts.init(chartRef.current, null, { renderer: "svg" });
    const chart = instRef.current;

    const series: echarts.SeriesOption[] = [];
    const legend: string[] = [];

    items.forEach((item, idx) => {
      if (!item.history || item.history.length < 5) return;
      const color = C.series[idx % C.series.length];
      const width = item.category === "长债" || item.category === "超长债" ? 1.5 : 1;

      let data: [number, number][];
      if (needsNorm) {
        const base = item.history[0].close;
        data = item.history.map((p) => [p.timestamp, base > 0 ? (p.close / base) * 100 : 100]);
      } else {
        data = item.history.map((p) => [p.timestamp, p.close]);
      }

      series.push({
        name: item.name, type: "line", data, smooth: true, symbol: "none",
        lineStyle: { width, color },
        itemStyle: { color },
        emphasis: { focus: "series" },
      });
      legend.push(item.name);
    });

    chart.setOption({
      animation: false,
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis", appendToBody: true,
        backgroundColor: "rgba(10,10,10,0.95)", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1,
        textStyle: { color: "#ccc", fontSize: 12 },
        formatter: (params: any) => {
          if (!params || !Array.isArray(params)) return "";
          const date = new Date(params[0].data[0]).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
          let h = `<div style="font-size:12px;font-weight:600;margin-bottom:6px;color:#666">${date}</div>`;
          params.forEach((p: any) => {
            const v = needsNorm ? (p.data[1] - 100).toFixed(2) + "%" : p.data[1].toFixed(2) + yUnit;
            h += `<div style="display:flex;justify-content:space-between;gap:20px;padding:1px 0">
              <span style="color:#999;display:flex;align-items:center;gap:4px">
                <span style="display:inline-block;width:6px;height:6px;background:${p.color}"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight:600;color:#fff">${v}</span>
            </div>`;
          });
          return h;
        },
      },
      legend: { data: legend, textStyle: { color: "#666", fontSize: 11 }, bottom: 0, type: "scroll", pageTextStyle: { color: "#666" } },
      grid: { left: 50, right: 20, top: 16, bottom: 46 },
      xAxis: {
        type: "time", axisLine: { lineStyle: { color: C.rule } }, axisLabel: { color: "#555", fontSize: 10 }, splitLine: { show: false },
      },
      yAxis: {
        type: logScale ? "log" : "value",
        axisLine: { show: false },
        axisLabel: { color: "#555", fontSize: 10, formatter: (v: number) => needsNorm ? (v - 100).toFixed(0) + "%" : v.toFixed(1) + yUnit },
        splitLine: { lineStyle: { color: C.rule, type: "dashed" } },
      },
      dataZoom: [
        { type: "inside" as const, start: 40, end: 100 },
        { type: "slider" as const, bottom: 24, height: 12, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.01)", fillerColor: "rgba(255,255,255,0.06)", textStyle: { color: "#555", fontSize: 10 } },
      ],
      series,
    }, true);

    const r = () => chart.resize();
    window.addEventListener("resize", r);
    return () => { window.removeEventListener("resize", r); chart.dispose(); instRef.current = null; };
  }, [items, logScale, yUnit]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-white/60">{title}</h3>
          <span className="text-[10px] text-white/20">{items.length} 系列</span>
        </div>
        <button
          onClick={() => { instRef.current?.dispose(); instRef.current = null; setLogScale(!logScale); }}
          className={`border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition ${
            logScale ? "border-white/20 text-white/70" : "border-white/[0.06] text-white/25 hover:border-white/15 hover:text-white/50"
          }`}
        >
          {logScale ? "Log" : "Lin"}
        </button>
      </div>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }} />
      <div className="mt-2 flex gap-4 text-[10px] uppercase tracking-wider text-white/15">
        <span>可拖拽缩放</span>
        {needsNorm && <span>基准归一化</span>}
      </div>
    </div>
  );
}

export default function BondCharts({ items }: { items: BondItem[] }) {
  const yields = items.filter((i) => i.id.startsWith("us"));
  const etfs = items.filter((i) => !i.id.startsWith("us"));

  return (
    <div className="space-y-10">
      <div>
        <SingleChart items={yields} title="美国国债收益率" yUnit="%" isLog={false} />
      </div>
      {etfs.length > 0 && (
        <div>
          <SingleChart items={etfs} title="全球主权债 ETF · 相对表现" yUnit="" isLog={true} />
        </div>
      )}
    </div>
  );
}
