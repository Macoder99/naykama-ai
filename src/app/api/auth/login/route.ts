import { z } from "zod";
import { findUserByEmail, verifyPassword } from "@/lib/server/users";
import { completeSignIn } from "@/lib/server/auth-helpers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
  remember: z.boolean().default(true),
  next: z.string().optional(),
});

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000).ok) {
    return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid email and password." }, { status: 400 });

  const { email, password, remember, next } = parsed.data;
  const user = findUserByEmail(email);
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  return Response.json({ redirect: await completeSignIn(user, remember, next) });
}
