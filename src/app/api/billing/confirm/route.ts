import { z } from "zod";
import { createSession, getSession } from "@/lib/session";
import { billingProvider } from "@/lib/server/billing";
import { findUserById, toSession, updateUser } from "@/lib/server/users";
import { plans } from "@/lib/plans";

const schema = z.object({ plan: z.enum(["starter", "business"]) });

/** Demo-mode only: activates a plan without charging. Disabled once Stripe is configured. */
export async function POST(req: Request) {
  if (billingProvider() !== "demo") return Response.json({ error: "Not available" }, { status: 404 });
  const session = await getSession();
  const user = session ? findUserById(session.sub) : undefined;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const plan = plans.find((p) => p.id === parsed.data.plan)!;
  updateUser(user.id, { plan: plan.name });
  await createSession(toSession(user));
  return Response.json({ ok: true, plan: plan.name });
}
