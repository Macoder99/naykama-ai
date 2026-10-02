"use client";

import { Bot, Clock, Smile, ThumbsUp, Timer, Users } from "lucide-react";
import { Card, CardHeader, PageHeader, StatCard } from "@/components/ui/primitives";
import { SimpleBarChart, SimpleLineChart } from "@/components/dashboard/charts";
import { hourlyActivity, revenueSeries } from "@/lib/data";

const intents = [
  { name: "Order status", value: 28 },
  { name: "Pricing & quotes", value: 22 },
  { name: "Bookings", value: 18 },
  { name: "Product questions", value: 16 },
  { name: "Delivery", value: 10 },
  { name: "Complaints", value: 6 },
];

const languages = [
  { name: "English", value: 64 },
  { name: "isiZulu", value: 14 },
  { name: "Afrikaans", value: 9 },
  { name: "Sesotho", value: 7 },
  { name: "Other", value: 6 },
];

export default function AnalyticsPage() {
  const resolution = revenueSeries.map((r, i) => ({ month: r.month, ai: 58 + i * 3.4, human: 42 - i * 3.4 }));
  return (
    <>
      <PageHeader title="Analytics" description="How your AI employee is performing across every conversation." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Resolved by AI" value="86%" delta={6.2} icon={<Bot className="h-4 w-4" />} />
        <StatCard label="First response" value="2.4s" delta={18} icon={<Timer className="h-4 w-4" />} />
        <StatCard label="CSAT" value="4.8/5" delta={2.1} icon={<Smile className="h-4 w-4" />} />
        <StatCard label="Hours saved" value="312h" delta={11} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Leads captured" value="241" delta={14} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Conversion" value="23%" delta={3.4} icon={<ThumbsUp className="h-4 w-4" />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Conversations by hour" description="Your AI handles the after-hours rush" />
          <div className="p-3 sm:p-5">
            <SimpleBarChart
              data={hourlyActivity}
              x="hour"
              stacked
              series={[
                { key: "ai", label: "AI", color: "#7c3aed" },
                { key: "human", label: "Team", color: "#93c5fd" },
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Automation rate" description="% of conversations resolved without a human" />
          <div className="p-3 sm:p-5">
            <SimpleLineChart
              data={resolution}
              x="month"
              series={[
                { key: "ai", label: "AI resolved %", color: "#7c3aed" },
                { key: "human", label: "Human %", color: "#2563eb" },
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Top customer intents" />
          <ul className="space-y-4 p-5">
            {intents.map((i) => (
              <li key={i.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{i.name}</span>
                  <span className="font-medium">{i.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${i.value * 3}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Customer languages" description="Detected and replied to automatically" />
          <div className="p-3 sm:p-5">
            <SimpleBarChart data={languages} x="name" series={[{ key: "value", label: "Share %", color: "#a855f7" }]} height={240} />
          </div>
        </Card>
      </div>
    </>
  );
}
