import { z } from "zod";
import { createSession, getSession } from "@/lib/session";
import { findUserById, hashPassword, toSession, updateUser, verifyPassword } from "@/lib/server/users";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("profile"), name: z.string().trim().min(2).max(80), company: z.string().trim().min(1).max(120) }),
  z.object({ action: z.literal("password"), current: z.string().min(1), next: z.string().min(8).max(128) }),
]);

export async function PATCH(req: Request) {
  const session = await getSession();
  const user = session ? findUserById(session.sub) : undefined;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const body = parsed.data;

  if (body.action === "profile") {
    updateUser(user.id, { name: body.name, company: body.company });
  } else {
    if (!user.passwordHash || !verifyPassword(body.current, user.passwordHash)) {
      return Response.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    updateUser(user.id, { passwordHash: hashPassword(body.next) });
  }
  await createSession(toSession(user));
  return Response.json({ ok: true });
}
