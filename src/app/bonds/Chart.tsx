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

export default function BondCharts({ items }: { items: BondItem[] }) {
  const yields = items.filter((i) => i.id.startsWith("us"));
  const etfs = items.filter((i) => !i.id.startsWith("us"));

  return (
    <div className="space-y-10">
      {yields.length > 0 && <ChartView items={yields} title="美国国债收益率" yUnit="%" isLog={false} />}
      {etfs.length > 0 && <ChartView items={etfs} title="全球主权债 ETF 相对表现（基准归一化）" yUnit="" isLog={true} />}
    </div>
  );
}

/* ── 灰度配色 ── */
const GRAY_PALETTE = ["#1a1a1a", "#555", "#888", "#aaa", "#ccc"];

function ChartView({
  items, title, yUnit, isLog: defaultLog,
}: {
  items: BondItem[]; title: string; yUnit: string; isLog: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const instance = useRef<echarts.ECharts | null>(null);
  const [log, setLog] = useState(defaultLog);

  const needsNorm = items.length > 0 && !isYieldItem(items[0]);

  useEffect(() => {
    if (!ref.current || items.length === 0) return;
    if (!instance.current) instance.current = echarts.init(ref.current, null, { renderer: "svg" });
    const chart = instance.current;

    const series: echarts.SeriesOption[] = [];
    const legends: string[] = [];

    items.forEach((item, i) => {
      if (!item.history || item.history.length < 6) return;
      const c = GRAY_PALETTE[i % GRAY_PALETTE.length];
      const w = item.category === "长债" || item.category === "超长债" ? 2 : 1.2;

      let data: [number, number][];
      if (needsNorm) {
        const base = item.history[0].close;
        data = item.history.map((p) => [p.timestamp, base > 0 ? (p.close / base) * 100 : 100]);
      } else {
        data = item.history.map((p) => [p.timestamp, p.close]);
      }

      series.push({
        name: item.name, type: "line", data, smooth: true, symbol: "none",
        lineStyle: { width: w, color: c }, emphasis: { focus: "series" },
      });
      legends.push(item.name);
    });

    chart.setOption({
      animation: false,
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis", appendToBody: true,
        backgroundColor: "rgba(255,255,255,0.96)", borderColor: "#e5e5e5", borderWidth: 1,
        textStyle: { color: "#333", fontSize: 12 },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return "";
          const d = new Date(params[0].data[0]);
          const dateStr = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
          let h = `<div style="font-size:12px;font-weight:600;margin-bottom:6px;color:#1a1a1a">${dateStr}</div>`;
          params.forEach((p: any) => {
            const v = needsNorm ? (p.data[1] - 100).toFixed(2) + "%" : p.data[1].toFixed(2) + yUnit;
            h += `<div style="display:flex;justify-content:space-between;gap:24px;padding:1px 0">
              <span style="color:#888;display:flex;align-items:center;gap:4px">
                <span style="display:inline-block;width:6px;height:6px;background:${p.color};border-radius:50%"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight:600;color:#1a1a1a">${v}</span>
            </div>`;
          });
          return h;
        },
      },
      legend: { data: legends, textStyle: { color: "#888", fontSize: 11 }, bottom: 0, type: "scroll", pageTextStyle: { color: "#888" } },
      grid: { left: 56, right: 20, top: 16, bottom: 44 },
      xAxis: {
        type: "time", axisLine: { lineStyle: { color: "#e5e5e5" } },
        axisLabel: { color: "#999", fontSize: 10 }, splitLine: { show: false },
      },
      yAxis: {
        type: log ? "log" : "value",
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: "#999", fontSize: 10, margin: 8,
          formatter: (v: number) => needsNorm ? (v - 100).toFixed(0) + "%" : v.toFixed(1) + yUnit,
        },
        splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
      },
      dataZoom: [
        { type: "inside" as const, start: 40, end: 100 },
        { type: "slider" as const, bottom: 26, height: 10, borderColor: "#e5e5e5", backgroundColor: "rgba(0,0,0,0.02)", fillerColor: "rgba(0,0,0,0.08)", textStyle: { color: "#999", fontSize: 10 } },
      ],
      series,
    }, true);

    const r = () => chart.resize();
    window.addEventListener("resize", r);
    return () => { window.removeEventListener("resize", r); chart.dispose(); instance.current = null; };
  }, [items, log]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1a1a1a]">{title}</h3>
        </div>
        <button
          onClick={() => { instance.current?.dispose(); instance.current = null; setLog(!log); }}
          className="text-xs text-[#999] border border-[#d4d4d4] rounded px-3 py-1 transition hover:border-[#999] hover:text-[#555]"
        >
          切换至{log ? "线性" : "对数"}坐标
        </button>
      </div>
      <div ref={ref} style={{ width: "100%", height: "420px" }} />
    </div>
  );
}
