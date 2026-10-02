import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="1 October 2026">
      <p>These terms govern your use of Naykama AI. By creating an account you agree to them.</p>
      <h2>Subscriptions & billing</h2>
      <ul>
        <li>Paid plans renew automatically monthly or annually until cancelled.</li>
        <li>Free trials last 14 days; you will not be charged unless you add a payment method and continue.</li>
        <li>You can cancel at any time from Settings → Billing; access continues until the end of the billing period.</li>
      </ul>
      <h2>Acceptable use</h2>
      <p>
        You may not use Naykama AI to send spam, impersonate others, or process data you are not authorised to process. You are responsible
        for reviewing AI-generated content before relying on it for legal, financial or medical decisions.
      </p>
      <h2>Availability</h2>
      <p>We target 99.9% monthly uptime (99.99% on Enterprise with SLA).</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, our liability is limited to the fees paid in the 12 months preceding a claim.</p>
    </LegalPage>
  );
}
