import { DatabaseBackup, KeyRound, Lock, ShieldCheck, UserCog, Zap } from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";

const items = [
  { icon: Lock, title: "AES-256 encryption", desc: "Data encrypted at rest and TLS 1.3 in transit." },
  { icon: ShieldCheck, title: "GDPR & POPIA", desc: "Built for European and South African privacy law." },
  { icon: KeyRound, title: "Secure authentication", desc: "2FA, SSO and OAuth with Google & Microsoft." },
  { icon: UserCog, title: "Role-based access", desc: "Owner, admin, manager, agent and viewer roles." },
  { icon: DatabaseBackup, title: "Automatic backups", desc: "Daily encrypted backups with point-in-time restore." },
  { icon: Zap, title: "99.99% uptime", desc: "Multi-region, auto-scaling cloud architecture." },
];

export function Security() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Security & trust"
          title={
            <>
              Bank-grade security. <span className="text-gradient">By default.</span>
            </>
          }
          description="Your customers trust you with their data. You can trust us with it too."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 0.08}>
              <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-6">
                <it.icon className="h-6 w-6 shrink-0 text-brand-2 dark:text-violet-300" />
                <div>
                  <p className="font-semibold">{it.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
