"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, postJson } from "@/components/auth/oauth-buttons";

export function VerifyForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? undefined;
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  async function submit(code: string) {
    setLoading(true);
    setError("");
    try {
      const { redirect } = await postJson<{ redirect: string }>("/api/auth/verify-2fa", { code, next });
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
      setLoading(false);
    }
  }

  function update(i: number, value: string) {
    const clean = value.replace(/\D/g, "");
    const nextDigits = [...digits];
    if (clean.length > 1) {
      clean.slice(0, 6).split("").forEach((d, k) => (nextDigits[k] = d));
    } else {
      nextDigits[i] = clean;
    }
    setDigits(nextDigits);
    const filled = nextDigits.join("");
    if (clean && i < 5 && clean.length === 1) refs.current[i + 1]?.focus();
    if (filled.length === 6) submit(filled);
  }

  return (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Two-factor authentication</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit(digits.join(""));
        }}
      >
        <FormError message={error} />
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={6}
              aria-label={`Digit ${i + 1}`}
              autoFocus={i === 0}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className="h-14 w-full rounded-xl border border-border bg-background text-center font-display text-xl font-semibold outline-none focus:border-ring focus:ring-4 focus:ring-ring/15"
            />
          ))}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading || digits.join("").length < 6}>
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </>
  );
}
