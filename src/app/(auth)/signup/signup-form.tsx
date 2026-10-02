"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { Divider, FormError, OAuthButtons, postJson } from "@/components/auth/oauth-buttons";
import { PasswordInput } from "@/components/auth/password-input";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const plan = params.get("plan");

  const rules = [
    { ok: password.length >= 8, label: "8+ characters" },
    { ok: /[A-Za-z]/.test(password), label: "A letter" },
    { ok: /\d/.test(password), label: "A number" },
  ];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const { redirect } = await postJson<{ redirect: string }>("/api/auth/signup", Object.fromEntries(form));
      router.push(plan ? `/checkout?plan=${plan}&cycle=${params.get("cycle") ?? "monthly"}` : redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Hire your AI employee</h1>
      <p className="mt-2 text-sm text-muted-foreground">14-day free trial · No credit card required</p>
      <div className="mt-8">
        <OAuthButtons next="/dashboard?welcome=1" />
      </div>
      <Divider label="or sign up with email" />
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" placeholder="Jane Doe" />
          </div>
          <div>
            <Label htmlFor="company">Business</Label>
            <Input id="company" name="company" required autoComplete="organization" placeholder="Acme (Pty) Ltd" />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 flex gap-3">
            {rules.map((r) => (
              <span key={r.label} className={cn("flex items-center gap-1 text-xs", r.ok ? "text-emerald-500" : "text-muted-foreground")}>
                <Check className="h-3 w-3" /> {r.label}
              </span>
            ))}
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating your workspace…" : "Create free account"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
