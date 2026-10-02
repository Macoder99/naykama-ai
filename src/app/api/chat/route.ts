import { chatRequestSchema, mockStream, openAIStream } from "@/lib/ai";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const body = parsed.data;

  if (body.mode === "app") {
    const session = await getSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    body.businessName ??= session.company;
  }

  const limit = body.mode === "demo" ? rateLimit(`demo:${clientIp(req)}`, 20, 60 * 60 * 1000) : rateLimit(`app:${clientIp(req)}`, 120, 60 * 1000);
  if (!limit.ok) {
    return Response.json({ error: "Rate limit reached. Please try again shortly." }, { status: 429 });
  }

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-AI-Provider": process.env.OPENAI_API_KEY ? "openai" : "demo",
  };

  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      return new Response(await openAIStream(body, key), { headers });
    } catch (err) {
      console.error("[chat] OpenAI failed, falling back to demo model", err);
    }
  }
  return new Response(mockStream(body), { headers: { ...headers, "X-AI-Provider": "demo" } });
}
