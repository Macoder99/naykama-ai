import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Protected by encryption · GDPR & POPIA compliant
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-brand lg:block">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-fuchsia-400/40 blur-3xl" />
        <div className="absolute -right-20 -bottom-32 h-96 w-96 rounded-full bg-blue-400/40 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center p-14 text-white">
          <Sparkles className="h-10 w-10" />
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight">
            Your AI employee is ready
            <br /> to start work.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            Automate customer support, sales, invoicing and inventory. Join 2,300+ businesses saving 30+ hours every week.
          </p>
          <div className="mt-10 max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm leading-relaxed">
              &ldquo;Naykama handles 70% of our customer questions and books appointments while we sleep. It&apos;s the best hire we&apos;ve ever made.&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold">Thandiwe Mokoena</p>
            <p className="text-xs text-white/70">Founder, Kasi Kreations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
