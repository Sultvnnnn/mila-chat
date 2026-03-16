"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { day: "Sen", pesan: 40 },
  { day: "Sel", pesan: 65 },
  { day: "Rab", pesan: 45 },
  { day: "Kam", pesan: 90 },
  { day: "Jum", pesan: 75 },
  { day: "Sab", pesan: 110 },
  { day: "Min", pesan: 85 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {label}
        </p>

        <p className="text-sm text-zinc-900 dark:text-mula font-medium">
          {payload[0].value} pesan masuk
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[300px] w-full mt-4 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <span className="text-sm text-zinc-400 animate-pulse">
          Memuat grafik MILA...
        </span>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-zinc-200 dark:stroke-zinc-800"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{
              className: "fill-zinc-500 dark:fill-zinc-400",
              fontSize: 12,
            }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              className: "fill-zinc-500 dark:fill-zinc-400",
              fontSize: 12,
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ className: "fill-zinc-50 dark:fill-zinc-800/50" }}
          />
          <Bar
            dataKey="pesan"
            className="fill-zinc-900 dark:fill-zinc-100"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
