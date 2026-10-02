"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { plans, planPrice, TRIAL_DAYS, type BillingCycle } from "@/lib/plans";
import { cn, formatCurrency } from "@/lib/utils";
import { Reveal, SectionHeading } from "./reveal";

export function PricingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div className="mx-auto flex w-fit items-center rounded-full border border-border bg-card p-1 text-sm font-medium">
      {(["monthly", "annual"] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "cursor-pointer rounded-full px-4 py-1.5 capitalize transition",
            cycle === c ? "bg-brand text-white shadow" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c}
          {c === "annual" && <span className={cn("ml-1.5 text-xs", cycle === c ? "text-white/80" : "text-emerald-500")}>−17%</span>}
        </button>
      ))}
    </div>
  );
}

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Costs less than a day of <span className="text-gradient">human overtime.</span>
            </>
          }
          description={`Start with a ${TRIAL_DAYS}-day free trial. No credit card required. Cancel anytime.`}
        />
        <PricingToggle cycle={cycle} onChange={setCycle} />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => {
            const price = planPrice(p, cycle);
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl border bg-card p-8",
                    p.highlight
                      ? "border-transparent shadow-2xl shadow-violet-900/15 [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(120deg,var(--brand-1),var(--brand-3))_border-box] border-2"
                      : "border-border",
                  )}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    {price === null ? (
                      <span className="font-display text-4xl font-extrabold">Custom</span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-extrabold tracking-tight">
                          {formatCurrency(cycle === "annual" ? Math.round(price / 12) : price)}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 h-5 text-xs text-muted-foreground">
                    {price !== null && cycle === "annual" ? `Billed ${formatCurrency(price)} yearly` : price !== null ? "Billed monthly" : "Volume & annual contracts"}
                  </p>
                  <Link
                    href={p.id === "enterprise" ? "#contact" : `/signup?plan=${p.id}&cycle=${cycle}`}
                    className={buttonClass(p.highlight ? "primary" : "outline", "lg", "mt-6 w-full")}
                  >
                    {p.cta}
                  </Link>
                  <ul className="mt-8 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-2 dark:text-violet-300" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prices in South African Rand, excl. VAT. Secure payments by card, EFT, Apple Pay & Google Pay.
        </p>
      </div>
    </section>
  );
}
