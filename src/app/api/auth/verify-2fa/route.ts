import { z } from "zod";
import { createSession, getPending2fa } from "@/lib/session";
import { findUserById, toSession } from "@/lib/server/users";
import { verifyTotp } from "@/lib/server/totp";
import { safeNext } from "@/lib/server/auth-helpers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ code: z.string().min(6).max(8), next: z.string().optional() });

export async function POST(req: Request) {
  if (!rateLimit(`2fa:${clientIp(req)}`, 10, 10 * 60 * 1000).ok) {
    return Response.json({ error: "Too many attempts. Please sign in again later." }, { status: 429 });
  }
  const pending = await getPending2fa();
  if (!pending) return Response.json({ error: "Your sign-in session expired. Please sign in again." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  const user = findUserById(pending.sub);
  if (!parsed.success || !user?.twoFactorSecret || !verifyTotp(user.twoFactorSecret, parsed.data.code)) {
    return Response.json({ error: "That code isn't valid. Check your authenticator app." }, { status: 401 });
  }
  await createSession(toSession(user), pending.remember);
  return Response.json({ redirect: safeNext(parsed.data.next, user.role === "admin" ? "/admin" : "/dashboard") });
}
