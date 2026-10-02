import "server-only";
import { createSession, setPending2fa } from "@/lib/session";
import { toSession, type UserRecord } from "./users";

/** Completes sign-in, routing through 2FA when enabled. Returns where the client should go next. */
export async function completeSignIn(user: UserRecord, remember: boolean, next?: string) {
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    await setPending2fa(user.id, remember);
    return `/verify-2fa${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  }
  await createSession(toSession(user), remember);
  return safeNext(next, user.role === "admin" ? "/admin" : "/dashboard");
}

export function safeNext(next: string | undefined | null, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
