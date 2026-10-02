"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Check, CheckCircle2, CreditCard, Download, Zap } from "lucide-react";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { useUser } from "@/components/dashboard/session-context";
import { plans, TRIAL_DAYS, type BillingCycle } from "@/lib/plans";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const history = [
  { id: "NK-20260901", date: "1 Sep 2026", amount: 999, status: "Paid" },
  { id: "NK-20260801", date: "1 Aug 2026", amount: 999, status: "Paid" },
  { id: "NK-20260701", date: "1 Jul 2026", amount: 399, status: "Paid" },
];

const usage = [
  { label: "AI conversations", used: 6920, limit: 15000 },
  { label: "AI Studio generations", used: 412, limit: 2000 },
  { label: "Team seats", used: 4, limit: 10 },
  { label: "Connected channels", used: 4, limit: 6 },
];

function SuccessBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const [show] = useState(params.get("checkout") === "success");
  useEffect(() => {
    if (!show) return;
    fetch("/api/auth/refresh", { method: "POST" }).then(() => router.refresh());
  }, [show, router]);
  if (!show) return null;
  return (
    <Card className="mb-6 flex items-center gap-3 border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
      <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Your subscription is active. Welcome aboard!
    </Card>
  );
}

export default function BillingPage() {
  const user = useUser();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const current = plans.find((p) => p.name === user.plan);

  return (
    <>
      <PageHeader title="Billing & Subscription" description="Manage your plan, usage and invoices." />
      <Suspense>
        <SuccessBanner />
      </Suspense>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="bg-brand p-6 text-white">
            <p className="text-sm text-white/75">Current plan</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="font-display text-3xl font-bold">{user.plan}</p>
              {user.plan === "Trial" && <Badge className="bg-white/20 text-white">{TRIAL_DAYS} days left</Badge>}
            </div>
            <p className="mt-2 text-sm text-white/80">
              {current?.monthly ? `${formatCurrency(current.monthly)} / month · renews 1 Nov 2026` : user.plan === "Enterprise" ? "Custom contract · invoiced annually" : "Upgrade to keep your AI employee working after the trial."}
            </p>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            {usage.map((u) => (
              <div key={u.label}>
                <div className="flex justify-between text-sm">
                  <span>{u.label}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(u.used)} / {formatNumber(u.limit)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(u.used / u.limit) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Payment method" />
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-xl border border-border p-4">
              <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 text-white">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">Visa •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 08/28</p>
              </div>
              <Badge tone="green">Default</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Payments are processed securely by Stripe. We never store your card details.</p>
          </div>
        </Card>
      </div>

      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Plans</h2>
        <div className="flex rounded-xl bg-muted p-1 text-sm font-medium">
          {(["monthly", "annual"] as const).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className={cn("cursor-pointer rounded-lg px-4 py-1.5 capitalize", cycle === c ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.name === user.plan;
          const price = cycle === "monthly" ? p.monthly : p.annual;
          return (
            <Card key={p.id} className={cn("flex flex-col p-6", p.highlight && "ring-2 ring-brand-2")}>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">{p.name}</p>
                {p.highlight && (
                  <Badge tone="brand">
                    <Zap className="h-3 w-3" /> Popular
                  </Badge>
                )}
              </div>
              <p className="mt-3 font-display text-3xl font-bold">
                {price ? formatCurrency(price) : "Custom"}
                {price && <span className="text-sm font-normal text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</span>}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className={buttonClass("outline", "md", "mt-6 pointer-events-none opacity-60")}>Current plan</span>
              ) : p.id === "enterprise" ? (
                <Link href="/#contact" className={buttonClass("outline", "md", "mt-6")}>
                  Contact sales
                </Link>
              ) : (
                <Link href={`/checkout?plan=${p.id}&cycle=${cycle}`} className={buttonClass(p.highlight ? "primary" : "secondary", "md", "mt-6")}>
                  {user.plan === "Trial" ? "Choose plan" : "Switch plan"}
                </Link>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader title="Billing history" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{h.id}</td>
                  <td className="px-5 py-3 text-muted-foreground">{h.date}</td>
                  <td className="px-5 py-3">{formatCurrency(h.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge tone="green">{h.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        const text = `Naykama AI (Pty) Ltd\nTax invoice ${h.id}\nDate: ${h.date}\nBilled to: ${user.company} <${user.email}>\nAmount: ${formatCurrency(h.amount)} (incl. 15% VAT)\nStatus: ${h.status}\n`;
                        const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${h.id}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-2 hover:underline dark:text-violet-300">
                      <Download className="h-3.5 w-3.5" /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
