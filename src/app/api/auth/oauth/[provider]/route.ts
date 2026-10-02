import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { isProvider, providerConfig } from "@/lib/server/oauth";
import { createUser, findUserByEmail } from "@/lib/server/users";
import { completeSignIn, safeNext } from "@/lib/server/auth-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(req.url);
  if (!isProvider(provider)) return NextResponse.redirect(new URL("/login?error=provider", url));

  const next = safeNext(url.searchParams.get("next"));
  const cfg = providerConfig(provider);

  if (!cfg.clientId || !cfg.clientSecret) {
    // Demo mode: no OAuth credentials configured, sign in a sample account for this provider.
    const email = `demo.${provider}@naykama.ai`;
    const user =
      findUserByEmail(email) ??
      createUser({
        email,
        name: provider === "google" ? "Google Demo User" : "Microsoft Demo User",
        company: "Demo Business",
        provider,
      });
    return NextResponse.redirect(new URL(await completeSignIn(user, true, next), url));
  }

  const state = randomBytes(16).toString("hex");
  const authorize = new URL(cfg.authorizeUrl);
  authorize.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: `${url.origin}/api/auth/oauth/${provider}/callback`,
    response_type: "code",
    scope: cfg.scope,
    state,
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(authorize);
  res.cookies.set("nk_oauth", JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}
