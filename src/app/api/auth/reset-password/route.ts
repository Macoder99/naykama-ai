import { z } from "zod";
import { consumeResetToken, findUserByEmail, hashPassword, updateUser } from "@/lib/server/users";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const email = consumeResetToken(parsed.data.token);
  const user = email ? findUserByEmail(email) : undefined;
  if (!user) return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  updateUser(user.id, { passwordHash: hashPassword(parsed.data.password) });
  return Response.json({ ok: true });
}
