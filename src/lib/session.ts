import "server-only";
import { cookies } from "next/headers";
import { signToken, verifyToken } from "@/lib/jwt";

export const SESSION_COOKIE = "nk_session";
export const PENDING_2FA_COOKIE = "nk_2fa";

export type Role = "owner" | "admin" | "manager" | "agent" | "viewer";

export interface Session {
  sub: string;
  email: string;
  name: string;
  company: string;
  role: Role;
  plan: string;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function createSession(session: Session, remember = true) {
  const token = await signToken({ ...session }, remember ? "30d" : "1d");
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: remember ? 60 * 60 * 24 * 30 : undefined });
  store.delete(PENDING_2FA_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken<Session>(store.get(SESSION_COOKIE)?.value);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PENDING_2FA_COOKIE);
}

export async function setPending2fa(userId: string, remember: boolean) {
  const token = await signToken({ sub: userId, remember }, "10m");
  (await cookies()).set(PENDING_2FA_COOKIE, token, { ...cookieOptions, maxAge: 600 });
}

export async function getPending2fa() {
  return verifyToken<{ sub: string; remember: boolean }>((await cookies()).get(PENDING_2FA_COOKIE)?.value);
}
