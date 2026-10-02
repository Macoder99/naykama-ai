"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { Divider, FormError, OAuthButtons, postJson } from "@/components/auth/oauth-buttons";
import { PasswordInput } from "@/components/auth/password-input";

const oauthErrors: Record<string, string> = {
  oauth_state: "Sign-in was interrupted. Please try again.",
  oauth_token: "We couldn't verify your account with the provider.",
  oauth_profile: "We couldn't read your profile from the provider.",
  oauth_email: "Your account doesn't have an email address.",
  provider: "Unsupported sign-in provider.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const [error, setError] = useState(oauthErrors[params.get("error") ?? ""] ?? "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const { redirect } = await postJson<{ redirect: string }>("/api/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
        remember: form.get("remember") === "on",
        next,
      });
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your AI employee.</p>
      <div className="mt-8">
        <OAuthButtons next={next} />
      </div>
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" defaultValue="demo@naykama.ai" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs font-medium text-brand-2 hover:underline dark:text-violet-300">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" autoComplete="current-password" required defaultValue="demo1234" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 rounded accent-violet-600" /> Keep me signed in
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-4 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <b className="text-foreground">Demo accounts</b> (password <code>demo1234</code>): demo@naykama.ai (business owner) ·
        admin@naykama.ai (platform admin)
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Naykama?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
