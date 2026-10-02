"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { Label } from "@/components/ui/primitives";
import { FormError, postJson } from "@/components/auth/oauth-buttons";
import { PasswordInput } from "@/components/auth/password-input";

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("confirm")) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await postJson("/api/auth/reset-password", { token, password: form.get("password") });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h1 className="mt-4 font-display text-2xl font-bold">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">You can now sign in with your new password.</p>
        <Link href="/login" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose a strong password you don&apos;t use elsewhere.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <FormError message={error} />
        <div>
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" name="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput id="confirm" name="confirm" required minLength={8} autoComplete="new-password" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading || !token}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </>
  );
}
