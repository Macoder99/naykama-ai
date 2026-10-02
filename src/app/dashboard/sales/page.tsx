"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Card, CardHeader, PageHeader, StatCard } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RevenueAreaChart, SimpleBarChart } from "@/components/dashboard/charts";
import { channelSplit, revenueSeries, topProducts } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

const ranges = { "3M": 3, "6M": 6, "9M": 9 } as const;

export default function SalesPage() {
  const [range, setRange] = useState<keyof typeof ranges>("9M");
  const data = revenueSeries.slice(-ranges[range]).map((r) => ({ ...r, profit: r.revenue - r.expenses }));
  const revenue = data.reduce((s, r) => s + r.revenue, 0);
  const expenses = data.reduce((s, r) => s + r.expenses, 0);
  const profit = revenue - expenses;
  const maxProduct = Math.max(...topProducts.map((p) => p.revenue));

  function exportReport() {
    const csv = ["Month,Revenue,Expenses,Profit", ...data.map((r) => `${r.month},${r.revenue},${r.expenses},${r.profit}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Sales & Profit"
        description="Sales reports and profit dashboard across every channel."
        actions={
          <>
            <div className="flex rounded-xl bg-muted p-1 text-sm font-medium">
              {(Object.keys(ranges) as Array<keyof typeof ranges>).map((r) => (
                <button key={r} onClick={() => setRange(r)} className={cn("cursor-pointer rounded-lg px-3 py-1", range === r ? "bg-card shadow-sm" : "text-muted-foreground")}>
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(revenue)} delta={8.9} />
        <StatCard label="Expenses" value={formatCurrency(expenses)} delta={-3.2} />
        <StatCard label="Net profit" value={formatCurrency(profit)} delta={14.6} />
        <StatCard label="Profit margin" value={`${Math.round((profit / revenue) * 100)}%`} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Profit dashboard" description="Monthly net profit" />
          <div className="p-3 sm:p-5">
            <SimpleBarChart
              data={data}
              x="month"
              currency
              series={[
                { key: "profit", label: "Profit", color: "#7c3aed" },
                { key: "expenses", label: "Expenses", color: "#93c5fd" },
              ]}
              stacked
              height={300}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Sales by channel" />
          <ul className="space-y-4 p-5">
            {channelSplit.map((c) => (
              <li key={c.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="font-medium">{formatCurrency((revenue * c.value) / 100)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${c.value * 2.5}%`, background: c.fill }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Revenue trend" />
          <div className="p-3 sm:p-5">
            <RevenueAreaChart data={data} x="month" series={[{ key: "revenue", label: "Revenue", color: "#2563eb" }]} height={240} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Top products" />
          <ul className="space-y-4 p-5">
            {topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-semibold">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span>{formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(p.revenue / maxProduct) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.sold} sold</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
