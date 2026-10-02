"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, FileText, MessageCircle, Package, Play, Sparkles, Star } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/brand-icons";

const floating = [
  { icon: CalendarCheck, title: "Appointment booked", sub: "Thandi · Fri 10:00", pos: "left-[-1rem] top-16 sm:left-[-3rem]", delay: 0.9 },
  { icon: FileText, title: "Invoice INV-1042 sent", sub: "R 4,850.00", pos: "right-[-1rem] top-36 sm:right-[-3rem]", delay: 1.1 },
  { icon: Package, title: "Low stock alert", sub: "Reordered 40 units", pos: "left-6 bottom-[-1.25rem] sm:left-[-2rem]", delay: 1.3 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600/30 via-violet-600/30 to-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur"
        >
          <span className="flex h-5 items-center rounded-full bg-brand px-2 text-[10px] font-semibold text-white">NEW</span>
          Voice & image understanding are live
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto mt-7 max-w-4xl text-center font-display text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl"
        >
          Hire Your First <span className="text-gradient">AI Employee.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl"
        >
          Naykama AI answers customers, books appointments, creates invoices, manages inventory, and works 24/7.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/signup" className={buttonClass("primary", "lg", "w-full px-7 sm:w-auto")}>
            Get Started — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#demo" className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
            <Play className="h-4 w-4" /> Try the live demo
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1.5 font-medium text-foreground">4.9/5</span> from 2,300+ businesses
          </span>
          <span>14-day free trial · No credit card</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-fuchsia-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-violet-900/10">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">app.naykama.ai/inbox</span>
            </div>
            <div className="grid md:grid-cols-[240px_1fr]">
              <div className="hidden border-r border-border p-3 md:block">
                {[
                  ["Lerato M.", "Do you deliver to Soweto?", "WhatsApp"],
                  ["James K.", "Can I move my booking?", "SMS"],
                  ["Aisha P.", "Quote for 20 units please", "Email"],
                  ["Sipho N.", "Is the blue one in stock?", "Instagram"],
                ].map(([n, m, c], i) => (
                  <div key={n} className={`mb-1 rounded-xl p-2.5 ${i === 0 ? "bg-muted" : ""}`}>
                    <div className="flex justify-between text-sm font-medium">
                      {n}
                      <span className="text-[10px] text-muted-foreground">{c}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{m}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 p-5 sm:p-7">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <WhatsAppIcon className="h-4 w-4 text-emerald-500" /> Lerato M. via WhatsApp
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="max-w-sm rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm"
                >
                  Hi! Do you deliver to Soweto, and can I get 3 of the large planters by Saturday?
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="ml-auto max-w-md rounded-2xl rounded-tr-sm bg-brand px-4 py-3 text-sm text-white shadow-lg shadow-violet-600/20"
                >
                  <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-white/80">
                    <Sparkles className="h-3 w-3" /> Naykama AI
                  </span>
                  Yes, we deliver to Soweto! 🎉 We have 12 large planters in stock. 3 × R450 + R80 delivery = <b>R1,430</b>.
                  I&apos;ve reserved them and can deliver Saturday between 9–12. Shall I send the invoice?
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                  className="flex flex-wrap gap-2"
                >
                  {["Stock reserved", "Delivery slot held", "Invoice drafted"].map((t) => (
                    <span key={t} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                      ✓ {t}
                    </span>
                  ))}
                </motion.div>
                <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" /> AI is handling 128 conversations right now…
                </div>
              </div>
            </div>
          </div>

          {floating.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: f.delay }}
              className={`absolute hidden sm:block ${f.pos}`}
            >
              <div className="glass flex animate-float items-center gap-3 rounded-2xl border border-border px-4 py-3 shadow-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                  <f.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
