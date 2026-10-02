"use client";

import { useState } from "react";
import { AlertTriangle, Bot, CalendarCheck, CheckCheck, CircleDollarSign, Info, type LucideIcon } from "lucide-react";
import { Card, CardHeader, PageHeader, Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { notifications as seed, type Notification } from "@/lib/data";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn } from "@/lib/utils";

const icons: Record<Notification["type"], { icon: LucideIcon; cls: string }> = {
  sale: { icon: CircleDollarSign, cls: "bg-emerald-500/10 text-emerald-500" },
  alert: { icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-500" },
  ai: { icon: Bot, cls: "bg-violet-500/10 text-violet-500" },
  booking: { icon: CalendarCheck, cls: "bg-blue-500/10 text-blue-500" },
  system: { icon: Info, cls: "bg-slate-500/10 text-slate-500" },
};

const prefs = [
  { key: "sales", label: "New orders & payments" },
  { key: "stock", label: "Low stock alerts" },
  { key: "handoff", label: "AI handoffs to human" },
  { key: "bookings", label: "Appointment changes" },
  { key: "reports", label: "Weekly performance report" },
] as const;

export default function NotificationsPage() {
  const [items, setItems] = usePersistentState<Notification[]>("notifications", seed);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [channels, setChannels] = usePersistentState<Record<string, { push: boolean; email: boolean; whatsapp: boolean }>>(
    "notif-prefs",
    Object.fromEntries(prefs.map((p) => [p.key, { push: true, email: p.key === "reports", whatsapp: p.key === "handoff" }])),
  );
  const shown = items.filter((n) => filter === "all" || !n.read);
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `You have ${unread} unread notifications.` : "You're all caught up."}
        actions={
          <Button variant="outline" onClick={() => setItems((all) => all.map((n) => ({ ...n, read: true })))} disabled={!unread}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex gap-1 border-b border-border p-3">
            {(["all", "unread"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium capitalize", filter === f ? "bg-muted" : "text-muted-foreground hover:text-foreground")}>
                {f}
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">Nothing here 🎉</p>
          ) : (
            <ul className="divide-y divide-border">
              {shown.map((n) => {
                const { icon: Icon, cls } = icons[n.type];
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => setItems((all) => all.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                      className={cn("flex w-full cursor-pointer items-start gap-4 p-4 text-left transition hover:bg-muted/40", !n.read && "bg-brand-2/[0.03]")}
                    >
                      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cls)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className={cn("text-sm", !n.read ? "font-semibold" : "font-medium")}>{n.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                      </div>
                      {!n.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card className="h-fit">
          <CardHeader title="Preferences" description="Choose how you're notified." />
          <div className="p-5">
            <div className="mb-2 grid grid-cols-[1fr_repeat(3,48px)] text-center text-[11px] font-medium text-muted-foreground">
              <span />
              <span>Push</span>
              <span>Email</span>
              <span>WhatsApp</span>
            </div>
            {prefs.map((p) => (
              <div key={p.key} className="grid grid-cols-[1fr_repeat(3,48px)] items-center border-t border-border py-3">
                <span className="text-sm">{p.label}</span>
                {(["push", "email", "whatsapp"] as const).map((c) => (
                  <span key={c} className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={channels[p.key]?.[c] ?? false}
                      onChange={(e) => setChannels({ ...channels, [p.key]: { ...channels[p.key], [c]: e.target.checked } })}
                      className="h-4 w-4 accent-violet-600"
                      aria-label={`${p.label} via ${c}`}
                    />
                  </span>
                ))}
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 p-3">
              <span className="text-sm">Quiet hours (22:00–07:00)</span>
              <QuietHours />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function QuietHours() {
  const [on, setOn] = usePersistentState("quiet-hours", true);
  return <Switch checked={on} onChange={setOn} label="Quiet hours" />;
}
