import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/brand-icons";

const columns = [
  { title: "Product", links: [["Features", "/#features"], ["Live demo", "/#demo"], ["Pricing", "/#pricing"], ["Integrations", "/#features"]] },
  { title: "Company", links: [["About", "/#"], ["Careers", "/#"], ["Blog", "/#"], ["Contact", "/#contact"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["POPIA", "/privacy#popia"], ["GDPR", "/privacy#gdpr"]] },
];

export function CtaBanner() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand px-6 py-16 text-center text-white sm:px-16">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-400/40 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Your AI employee starts today.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join thousands of businesses automating support, sales and admin with Naykama AI.
          </p>
          <Link href="/signup" className={buttonClass("secondary", "lg", "mt-8 bg-white text-violet-700 hover:bg-white/90")}>
            Get Started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The AI business employee that answers customers, books appointments, creates invoices and manages inventory — 24/7.
          </p>
          <div className="mt-5 flex gap-2">
            {[XIcon, LinkedInIcon, InstagramIcon].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social link" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:text-foreground">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Naykama AI (Pty) Ltd. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>🔒 GDPR & POPIA compliant</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> All systems operational
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
