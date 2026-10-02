"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/utils";

const axis = { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false };
const tooltipStyle = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 600 },
  cursor: { fill: "color-mix(in oklab, var(--brand-2) 8%, transparent)" },
};

type Row = Record<string, string | number>;

export function RevenueAreaChart({
  data,
  x,
  series,
  height = 280,
  currency = true,
}: {
  data: Row[];
  x: string;
  series: Array<{ key: string; label: string; color: string }>;
  height?: number;
  currency?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} tickFormatter={(v: number) => (currency ? `R${formatCompact(v)}` : formatCompact(v))} />
        <Tooltip {...tooltipStyle} formatter={(v) => (currency ? formatCurrency(Number(v)) : formatNumber(Number(v)))} />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} fill={`url(#g-${s.key})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({
  data,
  x,
  series,
  height = 260,
  stacked,
  currency,
}: {
  data: Row[];
  x: string;
  series: Array<{ key: string; label: string; color: string }>;
  height?: number;
  stacked?: boolean;
  currency?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={x} {...axis} interval="preserveStartEnd" />
        <YAxis {...axis} tickFormatter={(v: number) => (currency ? `R${formatCompact(v)}` : formatCompact(v))} />
        <Tooltip {...tooltipStyle} formatter={(v) => (currency ? formatCurrency(Number(v)) : formatNumber(Number(v)))} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            stackId={stacked ? "a" : undefined}
            radius={stacked && i < series.length - 1 ? [0, 0, 0, 0] : [6, 6, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLineChart({
  data,
  x,
  series,
  height = 260,
}: {
  data: Row[];
  x: string;
  series: Array<{ key: string; label: string; color: string }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} tickFormatter={(v: number) => formatCompact(v)} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 220 }: { data: Array<{ name: string; value: number; fill: string }>; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={3} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={d.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
