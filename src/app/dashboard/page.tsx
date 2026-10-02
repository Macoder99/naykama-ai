"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Bot, CalendarCheck, CircleDollarSign, Clock, FileText, MessageSquare, PackageX, Sparkles, Users } from "lucide-react";
import { Badge, Card, CardHeader, StatCard } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { DonutChart, RevenueAreaChart } from "@/components/dashboard/charts";
import { useUser } from "@/components/dashboard/session-context";
import { appointments, channelSplit, conversations, notifications, products, revenueSeries, tasks } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

function Welcome() {
  const welcome = useSearchParams().get("welcome");
  const user = useUser();
  if (!welcome) return null;
  return (
    <Card className="mb-6 overflow-hidden border-0 bg-brand p-6 text-white">
      <p className="font-display text-xl font-semibold">Welcome to Naykama AI, {user.name.split(" ")[0]}! 🎉</p>
      <p className="mt-1 text-sm text-white/80">Your 14-day free trial has started. Connect a channel and your AI employee is ready to work.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/dashboard/integrations" className={buttonClass("secondary", "sm", "bg-white text-violet-700 hover:bg-white/90")}>
          Connect WhatsApp
        </Link>
        <Link href="/dashboard/chat" className={buttonClass("ghost", "sm", "text-white hover:bg-white/15 hover:text-white")}>
          Talk to your AI
        </Link>
      </div>
    </Card>
  );
}

export default function OverviewPage() {
  const user = useUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const lowStock = products.filter((p) => p.stock <= p.reorder);

  return (
    <>
      <Suspense>
        <Welcome />
      </Suspense>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s what your AI employee did for {user.company} today.</p>
        </div>
        <Link href="/dashboard/chat" className={buttonClass("primary", "md")}>
          <Sparkles className="h-4 w-4" /> Ask Naykama
        </Link>
      </div>

      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
          <Bot className="h-6 w-6" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">AI daily briefing</p>
          <p className="text-sm text-muted-foreground">
            Handled <b className="text-foreground">214 conversations</b>, booked <b className="text-foreground">9 appointments</b>, sent{" "}
            <b className="text-foreground">6 invoices</b> and recovered <b className="text-foreground">R12,650</b> in overdue payments. {lowStock.length} products need
            restocking.
          </p>
        </div>
        <Link href="/dashboard/tasks" className={buttonClass("outline", "sm")}>
          Review <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (Sep)" value={formatCurrency(329000)} delta={8.9} icon={<CircleDollarSign className="h-4 w-4" />} />
        <StatCard label="AI conversations" value="6,920" delta={9.1} icon={<MessageSquare className="h-4 w-4" />} />
        <StatCard label="New customers" value="148" delta={12.4} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Avg. response time" value="2.4s" delta={18} icon={<Clock className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue vs expenses" description="Last 9 months" action={<Badge tone="green">+81% YoY</Badge>} />
          <div className="p-3 pt-4 sm:p-5">
            <RevenueAreaChart
              data={revenueSeries}
              x="month"
              series={[
                { key: "revenue", label: "Revenue", color: "#7c3aed" },
                { key: "expenses", label: "Expenses", color: "#2563eb" },
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Conversations by channel" description="This month" />
          <div className="p-5">
            <DonutChart data={channelSplit} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {channelSplit.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Live inbox" action={<Link href="/dashboard/inbox" className="text-sm font-medium text-brand-2 dark:text-violet-300">Open</Link>} />
          <ul className="p-3">
            {conversations.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link href="/dashboard/inbox" className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">{c.name[0]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {c.name} {c.unread && <span className="h-2 w-2 rounded-full bg-brand-2" />}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{c.messages[c.messages.length - 1].text}</p>
                  </div>
                  <Badge tone={c.status === "ai" ? "brand" : c.status === "human" ? "amber" : "green"}>
                    {c.status === "ai" ? "AI" : c.status === "human" ? "Needs you" : "Resolved"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Today's schedule" action={<Link href="/dashboard/calendar" className="text-sm font-medium text-brand-2 dark:text-violet-300">Calendar</Link>} />
          <ul className="space-y-2 p-5">
            {appointments
              .filter((a) => a.day <= 1)
              .map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <CalendarCheck className="h-4 w-4 text-brand-2 dark:text-violet-300" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.day === 0 ? "Today" : "Tomorrow"} · {a.start} · {a.customer}
                    </p>
                  </div>
                  {a.bookedBy === "ai" && <Badge tone="brand">AI booked</Badge>}
                </li>
              ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Needs attention" />
          <ul className="space-y-2 p-5">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-3 text-sm">
                <PackageX className="h-4 w-4 text-amber-500" />
                <span className="flex-1">
                  <b>{p.name}</b> — {p.stock} left
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-xl bg-red-500/10 p-3 text-sm">
              <FileText className="h-4 w-4 text-red-500" />
              <span className="flex-1">
                <b>INV-1038</b> overdue 16 days
              </span>
            </li>
            {tasks
              .filter((t) => t.priority === "high" && t.status !== "done")
              .map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm">
                  <Sparkles className="h-4 w-4 text-brand-2" />
                  <span className="flex-1">{t.title}</span>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent activity" action={<Link href="/dashboard/notifications" className="text-sm font-medium text-brand-2 dark:text-violet-300">View all</Link>} />
        <ul className="divide-y divide-border p-2">
          {notifications.slice(0, 5).map((n) => (
            <li key={n.id} className="flex items-start gap-3 p-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
              <span className="text-xs whitespace-nowrap text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
