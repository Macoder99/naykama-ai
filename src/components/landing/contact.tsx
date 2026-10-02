"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/primitives";
import { Reveal, SectionHeading } from "./reveal";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setStatus("sent");
      form.reset();
    } else {
      setError(((await res.json()) as { error?: string }).error ?? "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Let's talk about your business."
          description="Questions about Enterprise, partnerships or getting started? Our team replies within one business day."
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@naykama.ai" },
              { icon: Phone, label: "Sales", value: "+27 10 500 1234" },
              { icon: MapPin, label: "Office", value: "Sandton, Johannesburg, South Africa" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="font-medium">{c.value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-brand p-6 text-white">
              <p className="font-display text-lg font-semibold">Prefer to chat?</p>
              <p className="mt-1 text-sm text-white/80">Our own AI employee is available 24/7 in the live demo above.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
              {status === "sent" ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <p className="mt-4 font-display text-xl font-semibold">Message sent!</p>
                  <p className="mt-1 text-sm text-muted-foreground">We&apos;ll be in touch within one business day.</p>
                  <Button variant="outline" className="mt-6" type="button" onClick={() => setStatus("idle")}>
                    Send another
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="c-name">Full name</Label>
                      <Input id="c-name" name="name" required minLength={2} placeholder="Jane Doe" />
                    </div>
                    <div>
                      <Label htmlFor="c-email">Work email</Label>
                      <Input id="c-email" name="email" type="email" required placeholder="jane@company.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="c-company">Company</Label>
                    <Input id="c-company" name="company" placeholder="Company name" />
                  </div>
                  <div>
                    <Label htmlFor="c-msg">How can we help?</Label>
                    <Textarea id="c-msg" name="message" required minLength={10} rows={5} placeholder="Tell us about your business…" />
                  </div>
                  {status === "error" && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Send message"}
                  </Button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
