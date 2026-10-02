import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import type { Role, Session } from "@/lib/session";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  company: string;
  role: Role;
  plan: string;
  passwordHash?: string;
  provider: "password" | "google" | "microsoft";
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

/**
 * In-memory user store. Swap for a real database (Postgres/Prisma, Supabase, etc.)
 * by re-implementing these functions — the rest of the app only uses this module.
 */
const globalStore = globalThis as unknown as {
  __nkUsers?: Map<string, UserRecord>;
  __nkResetTokens?: Map<string, { email: string; expires: number }>;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function users() {
  if (!globalStore.__nkUsers) {
    const map = new Map<string, UserRecord>();
    // Stable ids keep existing session cookies valid across dev-server restarts.
    const seed: Array<Omit<UserRecord, "createdAt" | "passwordHash" | "provider" | "twoFactorEnabled">> = [
      { id: "usr_demo_owner", email: "demo@naykama.ai", name: "Ontiretse Manyaka", company: "Green Haven", role: "owner", plan: "Business" },
      { id: "usr_platform_admin", email: "admin@naykama.ai", name: "Platform Admin", company: "Naykama AI", role: "admin", plan: "Enterprise" },
    ];
    for (const s of seed) {
      map.set(s.email, {
        ...s,
        passwordHash: hashPassword("demo1234"),
        provider: "password",
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      });
    }
    globalStore.__nkUsers = map;
  }
  return globalStore.__nkUsers;
}

function resetTokens() {
  globalStore.__nkResetTokens ??= new Map();
  return globalStore.__nkResetTokens;
}

export function findUserByEmail(email: string) {
  return users().get(email.toLowerCase().trim());
}

export function findUserById(id: string) {
  for (const u of users().values()) if (u.id === id) return u;
  return undefined;
}

export function createUser(input: {
  email: string;
  name: string;
  company: string;
  password?: string;
  provider: UserRecord["provider"];
}) {
  const email = input.email.toLowerCase().trim();
  const user: UserRecord = {
    id: randomUUID(),
    email,
    name: input.name,
    company: input.company,
    role: "owner",
    plan: "Trial",
    passwordHash: input.password ? hashPassword(input.password) : undefined,
    provider: input.provider,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  };
  users().set(email, user);
  return user;
}

export function updateUser(id: string, patch: Partial<UserRecord>) {
  const user = findUserById(id);
  if (!user) return undefined;
  Object.assign(user, patch);
  return user;
}

export function toSession(user: UserRecord): Session {
  return { sub: user.id, email: user.email, name: user.name, company: user.company, role: user.role, plan: user.plan };
}

export function createResetToken(email: string) {
  const token = randomBytes(24).toString("hex");
  resetTokens().set(token, { email: email.toLowerCase(), expires: Date.now() + 30 * 60 * 1000 });
  return token;
}

export function consumeResetToken(token: string) {
  const entry = resetTokens().get(token);
  resetTokens().delete(token);
  if (!entry || entry.expires < Date.now()) return undefined;
  return entry.email;
}

export function listUsers() {
  return Array.from(users().values()).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    company: u.company,
    role: u.role,
    plan: u.plan,
    provider: u.provider,
    twoFactorEnabled: u.twoFactorEnabled,
    createdAt: u.createdAt,
  }));
}
