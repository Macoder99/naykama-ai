"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Bot,
  CircleDollarSign,
  Database,
  KeyRound,
  LifeBuoy,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Avatar, Badge, Card, CardHeader, Input, PageHeader, Select, StatCard, Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RevenueAreaChart, SimpleBarChart } from "@/components/dashboard/charts";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, formatCurrency } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  plan: string;
  provider: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CircleDollarSign },
  { id: "tickets", label: "Support tickets", icon: LifeBuoy },
  { id: "ai", label: "AI usage", icon: Bot },
  { id: "security", label: "Security", icon: Shield },
] as const;
type TabId = (typeof tabs)[number]["id"];

const mrr = [
  { month: "Jan", mrr: 182000, signups: 210 },
  { month: "Feb", mrr: 214000, signups: 244 },
  { month: "Mar", mrr: 251000, signups: 289 },
  { month: "Apr", mrr: 296000, signups: 312 },
  { month: "May", mrr: 338000, signups: 351 },
  { month: "Jun", mrr: 392000, signups: 402 },
  { month: "Jul", mrr: 451000, signups: 455 },
  { month: "Aug", mrr: 517000, signups: 498 },
  { month: "Sep", mrr: 589000, signups: 561 },
];

const subscriptions = [
  { company: "Green Haven", plan: "Business", cycle: "Monthly", amount: 999, status: "active", renews: "1 Nov 2026" },
  { company: "Thrive Clinics", plan: "Business", cycle: "Annual", amount: 9990, status: "active", renews: "14 Mar 2027" },
  { company: "Mzansi Motors", plan: "Starter", cycle: "Monthly", amount: 399, status: "past_due", renews: "28 Sep 2026" },
  { company: "Le Café", plan: "Starter", cycle: "Monthly", amount: 399, status: "trialing", renews: "9 Oct 2026" },
  { company: "Nkosi Logistics", plan: "Enterprise", cycle: "Annual", amount: 180000, status: "active", renews: "1 Jan 2027" },
  { company: "Dube Dental", plan: "Business", cycle: "Monthly", amount: 999, status: "canceled", renews: "—" },
];

interface Ticket {
  id: string;
  subject: string;
  company: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "solved";
  updated: string;
}

const seedTickets: Ticket[] = [
  { id: "T-2041", subject: "WhatsApp number verification stuck", company: "Le Café", priority: "high", status: "open", updated: "12 min ago" },
  { id: "T-2040", subject: "Invoice VAT number not showing on PDF", company: "Thrive Clinics", priority: "medium", status: "pending", updated: "1 hour ago" },
  { id: "T-2039", subject: "Request: Sesotho voice support", company: "Mzansi Motors", priority: "low", status: "open", updated: "3 hours ago" },
  { id: "T-2038", subject: "Card declined on renewal", company: "Mzansi Motors", priority: "urgent", status: "open", updated: "5 hours ago" },
  { id: "T-2036", subject: "How to export customer list?", company: "Green Haven", priority: "low", status: "solved", updated: "Yesterday" },
];

const aiUsage = [
  { day: "Mon", conversations: 182000, studio: 21000 },
  { day: "Tue", conversations: 196000, studio: 24000 },
  { day: "Wed", conversations: 205000, studio: 23000 },
  { day: "Thu", conversations: 211000, studio: 27000 },
  { day: "Fri", conversations: 238000, studio: 31000 },
  { day: "Sat", conversations: 254000, studio: 18000 },
  { day: "Sun", conversations: 221000, studio: 12000 },
];

const topConsumers = [
  { company: "Nkosi Logistics", tokens: 48.2, cost: 9640, pct: 92 },
  { company: "Thrive Clinics", tokens: 12.4, cost: 2480, pct: 83 },
  { company: "Green Haven", tokens: 7.1, cost: 1420, pct: 63 },
  { company: "Mzansi Motors", tokens: 1.9, cost: 380, pct: 95 },
];

const auditLog = [
  { who: "admin@naykama.ai", what: "Changed role of thabo@greenhaven.co.za to Manager", when: "09:12", ip: "196.25.1.14" },
  { who: "system", what: "Automatic backup completed (snapshot #8812, 4.2 GB)", when: "03:00", ip: "—" },
  { who: "aisha@thriveclinics.co.za", what: "Enabled two-factor authentication", when: "Yesterday", ip: "102.132.8.2" },
  { who: "system", what: "Blocked 14 failed sign-in attempts from 45.33.12.0/24", when: "Yesterday", ip: "45.33.12.9" },
  { who: "admin@naykama.ai", what: "Exported POPIA data request DSR-118", when: "Mon", ip: "196.25.1.14" },
];

const subTone = { active: "green", trialing: "blue", past_due: "amber", canceled: "default" } as const;
const prioTone = { low: "default", medium: "blue", high: "amber", urgent: "red" } as const;

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(((await res.json()) as { users: AdminUser[] }).users);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setError("");
    const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) setError(((await res.json()) as { error?: string }).error ?? "Update failed");
    load();
  }

  const shown = users.filter((u) => `${u.name} ${u.email} ${u.company}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>
      {error && <p className="border-b border-border bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Sign-in</th>
              <th className="px-5 py-3 font-medium">2FA</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} className="h-8 w-8" />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">{u.company}</td>
                <td className="px-5 py-3 capitalize">{u.provider}</td>
                <td className="px-5 py-3">{u.twoFactorEnabled ? <Badge tone="green">On</Badge> : <Badge>Off</Badge>}</td>
                <td className="px-5 py-3">
                  <Select value={u.role} onChange={(e) => patch({ id: u.id, role: e.target.value })} className="h-8 w-28 text-xs" aria-label={`Role for ${u.email}`}>
                    {["owner", "admin", "manager", "agent", "viewer"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-5 py-3">
                  <Select value={u.plan} onChange={(e) => patch({ id: u.id, plan: e.target.value })} className="h-8 w-28 text-xs" aria-label={`Plan for ${u.email}`}>
                    {["Free", "Trial", "Starter", "Business", "Enterprise"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </Select>
                </td>
                <td className="px-5 py-3 text-right">
                  {u.twoFactorEnabled && (
                    <Button variant="ghost" size="sm" onClick={() => patch({ id: u.id, resetTwoFactor: true })}>
                      Reset 2FA
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TicketsTab() {
  const [tickets, setTickets] = usePersistentState<Ticket[]>("admin-tickets", seedTickets);
  const [filter, setFilter] = useState<"all" | Ticket["status"]>("all");
  return (
    <Card>
      <div className="flex gap-1 border-b border-border p-3">
        {(["all", "open", "pending", "solved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium capitalize", filter === f ? "bg-muted" : "text-muted-foreground")}>
            {f} {f !== "all" && <span className="ml-1 text-xs text-muted-foreground">{tickets.filter((t) => t.status === f).length}</span>}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {tickets
          .filter((t) => filter === "all" || t.status === filter)
          .map((t) => (
            <li key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  <span className="mr-2 text-muted-foreground">{t.id}</span>
                  {t.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.company} · updated {t.updated}
                </p>
              </div>
              <Badge tone={prioTone[t.priority]} className="w-fit capitalize">
                {t.priority}
              </Badge>
              <Select
                value={t.status}
                onChange={(e) => setTickets((all) => all.map((x) => (x.id === t.id ? { ...x, status: e.target.value as Ticket["status"], updated: "just now" } : x)))}
                className="h-8 w-32 text-xs"
                aria-label={`Status for ${t.id}`}
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="solved">Solved</option>
              </Select>
            </li>
          ))}
      </ul>
    </Card>
  );
}

function SecurityTab() {
  const [controls, setControls] = usePersistentState("admin-security", {
    enforce2fa: false,
    sso: true,
    ipAllowlist: false,
    sessionTimeout: true,
    rateLimit: true,
    backups: true,
  });
  const rows = [
    { key: "enforce2fa", label: "Require 2FA for all admins", desc: "Admins must enrol an authenticator app." },
    { key: "sso", label: "Allow Google & Microsoft sign-in", desc: "OAuth 2.0 / OpenID Connect providers." },
    { key: "ipAllowlist", label: "Admin IP allow-list", desc: "Restrict admin panel access to trusted networks." },
    { key: "sessionTimeout", label: "Idle session timeout (30 min)", desc: "Automatically sign out inactive admin sessions." },
    { key: "rateLimit", label: "Brute-force protection", desc: "Rate-limit sign-in and API requests per IP." },
    { key: "backups", label: "Automatic encrypted backups", desc: "Daily snapshots with 30-day retention." },
  ] as const;
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader title="Security controls" />
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <Switch checked={controls[r.key]} onChange={(v) => setControls({ ...controls, [r.key]: v })} label={r.label} />
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader title="Compliance status" />
          <div className="grid grid-cols-2 gap-3 p-5">
            {[
              { icon: ShieldCheck, label: "POPIA", value: "Compliant" },
              { icon: ShieldCheck, label: "GDPR", value: "Compliant" },
              { icon: Lock, label: "Encryption", value: "AES-256 / TLS 1.3" },
              { icon: Database, label: "Last backup", value: "Today 03:00" },
              { icon: KeyRound, label: "Admins with 2FA", value: "3 of 4" },
              { icon: Activity, label: "Uptime (30d)", value: "99.98%" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-muted/60 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <c.icon className="h-3.5 w-3.5 text-emerald-500" /> {c.label}
                </p>
                <p className="mt-1 text-sm font-semibold">{c.value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Audit log" />
          <ul className="divide-y divide-border">
            {auditLog.map((a, i) => (
              <li key={i} className="p-4 text-sm">
                <p>{a.what}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.who} · {a.when} · {a.ip}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("overview");
  return (
    <>
      <PageHeader title="Admin panel" description="Platform-wide management for Naykama AI." />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition",
              tab === t.id ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="MRR" value={formatCurrency(589000)} delta={13.9} icon={<CircleDollarSign className="h-4 w-4" />} />
            <StatCard label="Active businesses" value="3,482" delta={9.4} icon={<Users className="h-4 w-4" />} />
            <StatCard label="AI conversations (7d)" value="1.51M" delta={11.2} icon={<Bot className="h-4 w-4" />} />
            <StatCard label="Open tickets" value="3" icon={<LifeBuoy className="h-4 w-4" />} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title="Monthly recurring revenue" />
              <div className="p-3 sm:p-5">
                <RevenueAreaChart data={mrr} x="month" series={[{ key: "mrr", label: "MRR", color: "#7c3aed" }]} />
              </div>
            </Card>
            <Card>
              <CardHeader title="New sign-ups" />
              <div className="p-3 sm:p-5">
                <SimpleBarChart data={mrr} x="month" series={[{ key: "signups", label: "Sign-ups", color: "#2563eb" }]} height={280} />
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "users" && <UsersTab />}

      {tab === "subscriptions" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Paying customers" value="2,914" delta={7.8} />
            <StatCard label="Trials" value="568" />
            <StatCard label="Churn (30d)" value="1.9%" delta={-0.4} />
            <StatCard label="ARPA" value="R1,012" delta={3.1} />
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Cycle</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Renews</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.company} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">{s.company}</td>
                      <td className="px-5 py-3">{s.plan}</td>
                      <td className="px-5 py-3 text-muted-foreground">{s.cycle}</td>
                      <td className="px-5 py-3 text-right">{formatCurrency(s.amount)}</td>
                      <td className="px-5 py-3">
                        <Badge tone={subTone[s.status as keyof typeof subTone]}>{s.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{s.renews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "tickets" && <TicketsTab />}

      {tab === "ai" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tokens (30d)" value="312M" delta={12.6} />
            <StatCard label="Model cost (30d)" value="R62,400" delta={8.1} />
            <StatCard label="Avg latency" value="1.2s" delta={-6} />
            <StatCard label="Moderation flags" value="0.02%" />
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title="Requests this week" />
              <div className="p-3 sm:p-5">
                <SimpleBarChart
                  data={aiUsage}
                  x="day"
                  stacked
                  series={[
                    { key: "conversations", label: "Conversations", color: "#7c3aed" },
                    { key: "studio", label: "AI Studio", color: "#93c5fd" },
                  ]}
                />
              </div>
            </Card>
            <Card>
              <CardHeader title="Top consumers" description="% of plan quota used" />
              <ul className="space-y-4 p-5">
                {topConsumers.map((c) => (
                  <li key={c.company}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{c.company}</span>
                      <span className="text-muted-foreground">{c.tokens}M tokens</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", c.pct > 90 ? "bg-amber-500" : "bg-brand")} style={{ width: `${c.pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.pct}% of quota · {formatCurrency(c.cost)} cost
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}

      {tab === "security" && <SecurityTab />}
    </>
  );
}
