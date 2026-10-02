import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/server/users";
import { completeSignIn } from "@/lib/server/auth-helpers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2, "Enter your full name").max(100),
  company: z.string().min(2, "Enter your business name").max(120),
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/\d/, "Password must include a number"),
});

export async function POST(req: Request) {
  if (!rateLimit(`signup:${clientIp(req)}`, 10, 60 * 60 * 1000).ok) {
    return Response.json({ error: "Too many sign-ups from this network." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
  }
  if (findUserByEmail(parsed.data.email)) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  const user = createUser({ ...parsed.data, provider: "password" });
  return Response.json({ redirect: await completeSignIn(user, true, "/dashboard?welcome=1") });
}
