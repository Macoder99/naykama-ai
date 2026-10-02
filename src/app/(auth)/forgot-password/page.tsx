"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { FormError, postJson } from "@/components/auth/oauth-buttons";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await postJson<{ devResetUrl?: string }>("/api/auth/forgot-password", {
        email: new FormData(e.currentTarget).get("email"),
      });
      setDevUrl(res.devResetUrl);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
      {sent ? (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
            <MailCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a secure link to reset your password. It expires in 30 minutes.
          </p>
          {devUrl && (
            <div className="mt-6 rounded-xl border border-dashed border-border p-3 text-xs">
              <p className="font-medium">Development mode — no email provider configured:</p>
              <Link href={devUrl.replace(/^https?:\/\/[^/]+/, "")} className="mt-1 block break-all text-brand-2 underline dark:text-violet-300">
                Open reset link
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold tracking-tight">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <FormError message={error} />
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@company.com" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </>
      )}
    </>
  );
}
