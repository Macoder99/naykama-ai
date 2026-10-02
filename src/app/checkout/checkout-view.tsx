"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";
import { plans, TRIAL_DAYS, type BillingCycle, type PlanId } from "@/lib/plans";
import { cn, formatCurrency } from "@/lib/utils";

function formatCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function CheckoutView() {
  const params = useSearchParams();
  const router = useRouter();
  const initialPlan = (params.get("plan") === "starter" ? "starter" : "business") as Exclude<PlanId, "enterprise">;
  const [planId, setPlanId] = useState(initialPlan);
  const [cycle, setCycle] = useState<BillingCycle>(params.get("cycle") === "annual" ? "annual" : "monthly");
  const [demo, setDemo] = useState(false);
  const [card, setCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("canceled") ? "Checkout was canceled — you have not been charged." : "");

  const plan = plans.find((p) => p.id === planId)!;
  const price = (cycle === "monthly" ? plan.monthly : plan.annual) ?? 0;
  const vat = price - price / 1.15;
  const trialEnds = new Date(Date.now() + TRIAL_DAYS * 86400000).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  async function start() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, cycle }),
      });
      const json = (await res.json()) as { provider?: string; url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Checkout failed");
      if (json.provider === "stripe" && json.url) {
        window.location.href = json.url;
        return;
      }
      setDemo(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDemo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/billing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    if (res.ok) {
      router.push("/dashboard/billing?checkout=success");
      router.refresh();
    } else {
      setError("Payment could not be completed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-emerald-500" /> Secure checkout
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Link href="/dashboard/billing" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to billing
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">Start your {TRIAL_DAYS}-day free trial</h1>
          <p className="mt-2 text-muted-foreground">You won&apos;t be charged until {trialEnds}. Cancel anytime.</p>

          <div className="mt-8 space-y-3">
            {plans
              .filter((p) => p.id !== "enterprise")
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id as typeof planId)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-4 rounded-2xl border-2 bg-card p-5 text-left transition",
                    planId === p.id ? "border-brand-2 shadow-lg shadow-violet-600/10" : "border-border hover:border-brand-2/40",
                  )}
                >
                  <span className={cn("mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2", planId === p.id ? "border-brand-2 bg-brand-2" : "border-border")}>
                    {planId === p.id && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <p className="font-display font-bold whitespace-nowrap">
                    R{cycle === "monthly" ? p.monthly : p.annual}
                    <span className="text-xs font-normal text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</span>
                  </p>
                </button>
              ))}
          </div>

          <div className="mt-6 flex w-fit rounded-xl bg-muted p-1 text-sm font-medium">
            {(["monthly", "annual"] as const).map((c) => (
              <button key={c} onClick={() => setCycle(c)} className={cn("cursor-pointer rounded-lg px-4 py-1.5 capitalize", cycle === c ? "bg-card shadow-sm" : "text-muted-foreground")}>
                {c} {c === "annual" && <span className="ml-1 text-xs text-emerald-500">2 months free</span>}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Need more than 10 seats, SSO or data residency?{" "}
            <Link href="/#contact" className="font-medium text-brand-2 hover:underline dark:text-violet-300">
              Talk to sales about Enterprise
            </Link>
          </p>
        </div>

        <Card className="h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                Naykama {plan.name} ({cycle})
              </span>
              <span>{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Incl. VAT (15%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>{TRIAL_DAYS}-day free trial</span>
              <span>−{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Due today</span>
              <span>R0.00</span>
            </div>
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}

          {demo ? (
            <form onSubmit={confirmDemo} className="mt-6 space-y-4">
              <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                Demo mode — no real payment is processed. Configure <code>STRIPE_SECRET_KEY</code> to enable live Stripe Checkout.
              </p>
              <div>
                <Label htmlFor="card">Card number</Label>
                <div className="relative">
                  <CreditCard className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="card" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card} onChange={(e) => setCard(formatCard(e.target.value))} className="pl-9" required minLength={19} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="exp">Expiry</Label>
                  <Input id="exp" placeholder="MM / YY" autoComplete="cc-exp" required pattern="\d{2}\s?/\s?\d{2}" />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" autoComplete="cc-csc" required pattern="\d{3,4}" />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Processing…" : "Start free trial"}
              </Button>
            </form>
          ) : (
            <Button size="lg" className="mt-6 w-full" onClick={start} disabled={loading}>
              <Lock className="h-4 w-4" /> {loading ? "Redirecting…" : "Continue to secure payment"}
            </Button>
          )}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> PCI-DSS compliant · 256-bit TLS · Powered by Stripe
          </div>
        </Card>
      </main>
    </div>
  );
}
