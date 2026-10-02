"use client";

import { motion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-2 dark:text-violet-300">{eyebrow}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>}
    </Reveal>
  );
}
