import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { plans, TRIAL_DAYS, type BillingCycle, type PlanId } from "@/lib/plans";

/**
 * Payments are processed by Stripe Checkout when STRIPE_SECRET_KEY is set (card data never touches
 * our servers). Without keys the app runs a clearly-labelled demo checkout so the flow can be tested.
 */
export function billingProvider(): "stripe" | "demo" {
  return process.env.STRIPE_SECRET_KEY ? "stripe" : "demo";
}

export async function createStripeCheckout(opts: {
  planId: PlanId;
  cycle: BillingCycle;
  email: string;
  userId: string;
  origin: string;
}) {
  const plan = plans.find((p) => p.id === opts.planId);
  const amount = plan && (opts.cycle === "monthly" ? plan.monthly : plan.annual);
  if (!plan || !amount) throw new Error("Plan is not available for online checkout");

  const form = new URLSearchParams({
    mode: "subscription",
    customer_email: opts.email,
    client_reference_id: opts.userId,
    success_url: `${opts.origin}/dashboard/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/checkout?plan=${plan.id}&cycle=${opts.cycle}&canceled=1`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "zar",
    "line_items[0][price_data][unit_amount]": String(amount * 100),
    "line_items[0][price_data][recurring][interval]": opts.cycle === "monthly" ? "month" : "year",
    "line_items[0][price_data][product_data][name]": `Naykama AI ${plan.name} (${opts.cycle})`,
    "subscription_data[trial_period_days]": String(TRIAL_DAYS),
    "metadata[plan]": plan.name,
    "metadata[userId]": opts.userId,
    allow_promotion_codes: "true",
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const json = (await res.json()) as { url?: string; error?: { message: string } };
  if (!res.ok || !json.url) throw new Error(json.error?.message ?? "Stripe checkout failed");
  return json.url;
}

/** Verifies a Stripe webhook `Stripe-Signature` header (v1 scheme, 5 minute tolerance). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${payload}`).digest();
  const signatures = header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .map((kv) => Buffer.from(kv.slice(3), "hex"));
  return signatures.some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
}
