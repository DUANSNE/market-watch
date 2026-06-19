"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

type BondItem = {
  id: string; name: string; category: string;
  history?: { timestamp: number; close: number }[];
};

function Chart({ items, title, yUnit, log }: {
  items: BondItem[]; title: string; yUnit: string; log: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<echarts.ECharts | null>(null);
  const [isLog, setLog] = useState(log);
  const norm = items.length > 0 && !items[0].id.startsWith("us");

  useEffect(() => {
    if (!ref.current || items.length === 0) return;
    if (!inst.current) inst.current = echarts.init(ref.current);
    const ch = inst.current;

    const series: any[] = [];
    const leg: string[] = [];

    items.forEach((item, i) => {
      if (!item.history || item.history.length < 6) return;
      let data: [number, number][];
      if (norm) {
        const base = item.history[0].close;
        data = item.history.map(p => [p.timestamp, base > 0 ? (p.close/base)*100 : 100]);
      } else {
        data = item.history.map(p => [p.timestamp, p.close]);
      }
      series.push({ name: item.name, type: "line", data, smooth: true, symbol: "none" });
      leg.push(item.name);
    });

    ch.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: leg, bottom: 0, type: "scroll" },
      grid: { left: 60, right: 20, top: 16, bottom: 44 },
      xAxis: { type: "time" },
      yAxis: {
        type: isLog ? "log" : "value",
        axisLabel: { formatter: (v: number) => norm ? (v-100).toFixed(0)+"%" : v.toFixed(1)+yUnit },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      dataZoom: [{ type: "inside", start: 40, end: 100 }, { type: "slider", bottom: 26, height: 10 }],
      series,
    }, true);

    const r = () => ch.resize();
    window.addEventListener("resize", r);
    return () => { window.removeEventListener("resize", r); ch.dispose(); inst.current = null; };
  }, [items, isLog]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1a202c]">{title}</h3>
        <button onClick={() => { inst.current?.dispose(); inst.current=null; setLog(!isLog); }}
          className="text-xs text-[#a0aec0] border border-[#e2e8f0] rounded px-3 py-1 hover:border-[#a0aec0] hover:text-[#4a5568]">
          {isLog ? "线性坐标" : "对数坐标"}
        </button>
      </div>
      <div ref={ref} style={{ width: "100%", height: "420px" }} />
    </div>
  );
}

export default function BondCharts({ items }: { items: BondItem[] }) {
  const us = items.filter(i => i.id.startsWith("us"));
  const gl = items.filter(i => !i.id.startsWith("us"));
  return (
    <div className="space-y-10">
      {us.length > 0 && <Chart items={us} title="美国国债收益率" yUnit="%" log={false} />}
      {gl.length > 0 && <Chart items={gl} title="全球主权债 ETF 相对表现（基准归一化）" yUnit="" log={true} />}
    </div>
  );
}
