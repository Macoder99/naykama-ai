import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  company: z.string().max(120).optional(),
  message: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000).ok) {
    return Response.json({ error: "Too many messages. Please try later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }
  console.info("[contact] new enquiry", { email: parsed.data.email, company: parsed.data.company });
  return Response.json({ ok: true });
}
