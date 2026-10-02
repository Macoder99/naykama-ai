import { z } from "zod";
import { getSession } from "@/lib/session";
import { findUserById, updateUser } from "@/lib/server/users";
import { generateSecret, otpauthUrl, verifyTotp } from "@/lib/server/totp";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("setup") }),
  z.object({ action: z.literal("enable"), code: z.string() }),
  z.object({ action: z.literal("disable"), code: z.string() }),
]);

export async function POST(req: Request) {
  const session = await getSession();
  const user = session ? findUserById(session.sub) : undefined;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const body = parsed.data;

  if (body.action === "setup") {
    const secret = generateSecret();
    updateUser(user.id, { twoFactorSecret: secret, twoFactorEnabled: false });
    return Response.json({ secret, otpauth: otpauthUrl(secret, user.email) });
  }
  if (!user.twoFactorSecret || !verifyTotp(user.twoFactorSecret, body.code)) {
    return Response.json({ error: "Invalid code. Try again." }, { status: 400 });
  }
  if (body.action === "enable") {
    updateUser(user.id, { twoFactorEnabled: true });
  } else {
    updateUser(user.id, { twoFactorEnabled: false, twoFactorSecret: undefined });
  }
  return Response.json({ ok: true, enabled: body.action === "enable" });
}
