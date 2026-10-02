import { verifyStripeSignature } from "@/lib/server/billing";
import { findUserById, updateUser } from "@/lib/server/users";

interface StripeEvent {
  type: string;
  data: { object: { client_reference_id?: string; metadata?: Record<string, string> } };
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook not configured" }, { status: 501 });

  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const obj = event.data.object;
  const userId = obj.client_reference_id ?? obj.metadata?.userId;
  const user = userId ? findUserById(userId) : undefined;

  if (user) {
    if (event.type === "checkout.session.completed" && obj.metadata?.plan) {
      updateUser(user.id, { plan: obj.metadata.plan });
    } else if (event.type === "customer.subscription.deleted") {
      updateUser(user.id, { plan: "Free" });
    }
  }
  return Response.json({ received: true });
}
