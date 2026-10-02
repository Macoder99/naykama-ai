import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { Reveal, SectionHeading } from "./reveal";

const testimonials = [
  {
    quote:
      "Naykama replies to our WhatsApp customers in seconds — even at 2am. Sales are up 34% and my team finally has time to focus on growth.",
    name: "Thandiwe Mokoena",
    role: "Founder, Kasi Kreations",
  },
  {
    quote:
      "We replaced three different tools with Naykama. Invoices, bookings and inventory all just… happen. It genuinely feels like hiring a superstar employee.",
    name: "Pieter van Wyk",
    role: "Operations Director, Cape Interiors",
  },
  {
    quote:
      "Our clinic's no-show rate dropped by 41% thanks to automatic reminders and rescheduling. Patients love how fast it answers.",
    name: "Dr. Aisha Patel",
    role: "Practice Owner, Thrive Clinics",
  },
  {
    quote:
      "Setup took 10 minutes. It learned our price list instantly and now handles 70% of customer questions without any human help.",
    name: "Sipho Ndlovu",
    role: "CEO, Mzansi Motors",
  },
  {
    quote:
      "The analytics alone are worth it. I know exactly what's selling, what's running low and how much profit we made — every single day.",
    name: "Lerato Dlamini",
    role: "Owner, Ubuntu Foods",
  },
  {
    quote:
      "Multilingual support was a game-changer. Customers write in isiZulu, Afrikaans or English and Naykama replies perfectly every time.",
    name: "Johan Botha",
    role: "Manager, Jozi Fitness",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Loved by businesses"
          title={
            <>
              Teams that hired Naykama <span className="text-gradient">never looked back.</span>
            </>
          }
        />
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08} className="mb-4 break-inside-avoid">
              <figure className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
