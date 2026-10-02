import {
  BarChart3,
  Bot,
  CalendarDays,
  FileText,
  Globe2,
  Image as ImageIcon,
  Inbox,
  Mic,
  Package,
  PenLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";
import { InstagramIcon, MessengerIcon, WhatsAppIcon } from "@/components/brand-icons";
import { Mail, MessageSquare, MonitorSmartphone } from "lucide-react";

const features = [
  { icon: Bot, title: "24/7 customer support", desc: "Answers questions instantly using your prices, policies and product catalogue." },
  { icon: CalendarDays, title: "Appointment booking", desc: "Books, reschedules and sends reminders — synced to your calendar." },
  { icon: FileText, title: "Invoices & quotations", desc: "Generates branded invoices and quotes in seconds, then follows up on payment." },
  { icon: Package, title: "Inventory management", desc: "Tracks stock levels, predicts demand and alerts you before you run out." },
  { icon: Users, title: "CRM & lead management", desc: "Captures every lead, scores intent and nudges hot prospects to close." },
  { icon: BarChart3, title: "Sales & profit insights", desc: "Real-time dashboards for revenue, expenses, margins and AI performance." },
  { icon: PenLine, title: "Content generation", desc: "Emails, product descriptions, social posts and marketing campaigns on demand." },
  { icon: Globe2, title: "50+ languages", desc: "Speaks your customers' language — from isiZulu to French — automatically." },
  { icon: Mic, title: "Voice assistant", desc: "Talk to your AI employee hands-free and get answers read back to you." },
  { icon: ImageIcon, title: "Image understanding", desc: "Reads receipts, product photos and documents and turns them into actions." },
  { icon: Inbox, title: "Unified inbox", desc: "Every conversation from every channel, in one beautiful, searchable place." },
  { icon: ShieldCheck, title: "Enterprise security", desc: "Encryption, role-based access, GDPR & POPIA compliance, automatic backups." },
];

const channels = [
  { icon: WhatsAppIcon, name: "WhatsApp", color: "text-emerald-500" },
  { icon: MessengerIcon, name: "Messenger", color: "text-blue-500" },
  { icon: InstagramIcon, name: "Instagram", color: "text-pink-500" },
  { icon: Mail, name: "Email", color: "text-amber-500" },
  { icon: MessageSquare, name: "SMS", color: "text-violet-500" },
  { icon: MonitorSmartphone, name: "Website chat", color: "text-sky-500" },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Everything you need"
          title={
            <>
              One AI employee. <span className="text-gradient">Every department.</span>
            </>
          }
          description="Support, sales, admin and operations — handled by an assistant that never sleeps, never forgets and gets smarter every day."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-violet-600/0 opacity-0 transition group-hover:from-blue-600/[0.04] group-hover:to-violet-600/[0.06] group-hover:opacity-100" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-violet-600/25">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <p className="text-center text-sm font-medium text-muted-foreground">Connects with the channels your customers already use</p>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {channels.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-5 transition hover:border-brand-2/40">
                <c.icon className={`h-7 w-7 ${c.color}`} />
                <span className="text-xs font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
