import { createSession, getSession } from "@/lib/session";
import { findUserById, toSession } from "@/lib/server/users";

/** Re-issues the session cookie from the latest user record (e.g. after a plan change). */
export async function POST() {
  const session = await getSession();
  const user = session ? findUserById(session.sub) : undefined;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await createSession(toSession(user));
  return Response.json({ ok: true, plan: user.plan });
}
