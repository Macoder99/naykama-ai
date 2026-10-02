"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Live demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "glass border-b border-border/60 py-2.5" : "py-4",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/login" className={buttonClass("ghost", "md", "hidden sm:inline-flex")}>
            Sign in
          </Link>
          <Link href="/signup" className={buttonClass("primary", "md", "hidden sm:inline-flex")}>
            Get Started
          </Link>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass mx-4 mt-3 rounded-2xl border border-border p-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href="/login" className={buttonClass("outline", "md")}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonClass("primary", "md")}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
