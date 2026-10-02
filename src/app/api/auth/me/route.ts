import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/server/users";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null }, { status: 401 });
  const user = findUserById(session.sub);
  return Response.json({ user: { ...session, twoFactorEnabled: user?.twoFactorEnabled ?? false, provider: user?.provider } });
}
