import { z } from "zod";
import { createResetToken, findUserByEmail } from "@/lib/server/users";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.email() });

export async function POST(req: Request) {
  if (!rateLimit(`forgot:${clientIp(req)}`, 5, 60 * 60 * 1000).ok) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

  const user = findUserByEmail(parsed.data.email);
  let devResetUrl: string | undefined;
  if (user) {
    const token = createResetToken(user.email);
    const url = `${new URL(req.url).origin}/reset-password?token=${token}`;
    // Plug in your email provider (Resend, SES, Postmark...) here.
    console.info(`[auth] password reset link for ${user.email}: ${url}`);
    if (process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true") devResetUrl = url;
  }
  return Response.json({ ok: true, devResetUrl });
}
