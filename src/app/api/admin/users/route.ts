import { z } from "zod";
import { getSession } from "@/lib/session";
import { findUserById, listUsers, updateUser } from "@/lib/server/users";

async function requireAdmin() {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ users: listUsers() });
}

const patchSchema = z.object({
  id: z.string(),
  role: z.enum(["owner", "admin", "manager", "agent", "viewer"]).optional(),
  plan: z.enum(["Trial", "Starter", "Business", "Enterprise", "Free"]).optional(),
  resetTwoFactor: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { id, role, plan, resetTwoFactor } = parsed.data;
  if (id === admin.sub && role && role !== "admin") {
    return Response.json({ error: "You can't remove your own admin role." }, { status: 400 });
  }
  if (!findUserById(id)) return Response.json({ error: "User not found" }, { status: 404 });
  updateUser(id, {
    ...(role && { role }),
    ...(plan && { plan }),
    ...(resetTwoFactor && { twoFactorEnabled: false, twoFactorSecret: undefined }),
  });
  return Response.json({ ok: true });
}
