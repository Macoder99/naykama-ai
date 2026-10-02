import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Naykama AI protects your data under GDPR and POPIA." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="1 October 2026">
      <p>
        Naykama AI (Pty) Ltd (&ldquo;Naykama&rdquo;, &ldquo;we&rdquo;) is committed to protecting personal information. This policy explains what
        we collect, why, and the rights you have.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account information: name, email, business name and billing details.</li>
        <li>Business data you upload or connect: conversations, customers, invoices, inventory.</li>
        <li>Usage data: device, browser, and product analytics to improve the service.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To provide and improve the service, process payments, secure accounts and communicate with you. We never sell personal information
        and never use your business data to train public AI models.
      </p>
      <h2 id="security">Security</h2>
      <p>
        Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is restricted by role-based access control, protected by
        two-factor authentication, logged, and backed up automatically every day.
      </p>
      <h2 id="popia">POPIA (South Africa)</h2>
      <p>
        We process personal information in accordance with the Protection of Personal Information Act, 4 of 2013. Our Information Officer
        can be reached at privacy@naykama.ai. You may request access to, correction of, or deletion of your personal information at any time.
      </p>
      <h2 id="gdpr">GDPR (European Union)</h2>
      <p>
        Where the GDPR applies, we act as a processor for your customer data and a controller for your account data. You have the rights of
        access, rectification, erasure, restriction, portability and objection. Data Processing Agreements are available on request.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email privacy@naykama.ai.</p>
    </LegalPage>
  );
}
