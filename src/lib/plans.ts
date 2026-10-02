export type PlanId = "starter" | "business" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  highlight?: boolean;
  cta: string;
  features: string[];
}

export const TRIAL_DAYS = 14;

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo founders and small shops getting their first AI employee.",
    monthly: 399,
    annual: 3990,
    cta: "Start free trial",
    features: [
      "1 AI employee",
      "2,000 AI conversations / month",
      "Website chat + WhatsApp",
      "Invoices & quotations",
      "Appointment booking",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "For growing teams that want to automate support, sales and admin.",
    monthly: 999,
    annual: 9990,
    highlight: true,
    cta: "Start free trial",
    features: [
      "5 AI employees",
      "15,000 AI conversations / month",
      "All channels: WhatsApp, SMS, Email, Messenger, Instagram",
      "CRM, leads & inventory",
      "Voice assistant & image understanding",
      "Sales & profit dashboards",
      "Team roles (up to 10 seats)",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organisations that need scale, security and dedicated support.",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    features: [
      "Unlimited AI employees",
      "Custom conversation volume",
      "SSO / SAML & SCIM",
      "Custom AI training on your data",
      "Dedicated success manager",
      "99.99% uptime SLA",
      "Data residency (South Africa / EU)",
      "Audit logs & advanced security",
    ],
  },
];

export function planPrice(plan: Plan, cycle: BillingCycle) {
  return cycle === "monthly" ? plan.monthly : plan.annual;
}
