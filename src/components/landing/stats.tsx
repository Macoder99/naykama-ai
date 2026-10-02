import { Reveal } from "./reveal";

const stats = [
  ["2.3M+", "Conversations handled"],
  ["< 3s", "Average response time"],
  ["68%", "Support tickets automated"],
  ["R 41M", "Invoices generated"],
];

const logos = ["Ubuntu Foods", "Kasi Kreations", "Mzansi Motors", "Thrive Clinics", "Cape Interiors", "Jozi Fitness"];

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/40 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by fast-growing businesses across Africa and beyond
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-display text-lg font-bold text-foreground/40">
          {logos.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map(([v, l], i) => (
            <Reveal key={l} delay={i * 0.08} className="text-center">
              <p className="font-display text-4xl font-extrabold tracking-tight text-gradient sm:text-5xl">{v}</p>
              <p className="mt-2 text-sm text-muted-foreground">{l}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
