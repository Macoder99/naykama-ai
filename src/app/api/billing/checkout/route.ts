import { z } from "zod";
import { getSession } from "@/lib/session";
import { billingProvider, createStripeCheckout } from "@/lib/server/billing";

const schema = z.object({ plan: z.enum(["starter", "business"]), cycle: z.enum(["monthly", "annual"]) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid plan" }, { status: 400 });

  if (billingProvider() === "demo") return Response.json({ provider: "demo" });

  try {
    const url = await createStripeCheckout({
      planId: parsed.data.plan,
      cycle: parsed.data.cycle,
      email: session.email,
      userId: session.sub,
      origin: new URL(req.url).origin,
    });
    return Response.json({ provider: "stripe", url });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
