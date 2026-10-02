import { NextResponse, type NextRequest } from "next/server";
import { isProvider, providerConfig } from "@/lib/server/oauth";
import { createUser, findUserByEmail } from "@/lib/server/users";
import { completeSignIn } from "@/lib/server/auth-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(req.url);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, url));
  if (!isProvider(provider)) return fail("provider");

  const saved = req.cookies.get("nk_oauth")?.value;
  const { state, next } = saved ? (JSON.parse(saved) as { state: string; next: string }) : { state: "", next: "/dashboard" };
  const code = url.searchParams.get("code");
  if (!code || !state || url.searchParams.get("state") !== state) return fail("oauth_state");

  const cfg = providerConfig(provider);
  const tokenRes = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId ?? "",
      client_secret: cfg.clientSecret ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: `${url.origin}/api/auth/oauth/${provider}/callback`,
    }),
  });
  if (!tokenRes.ok) return fail("oauth_token");
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const infoRes = await fetch(cfg.userInfoUrl, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!infoRes.ok) return fail("oauth_profile");
  const info = (await infoRes.json()) as { email?: string; name?: string; preferred_username?: string };
  const email = info.email ?? info.preferred_username;
  if (!email) return fail("oauth_email");

  const user =
    findUserByEmail(email) ?? createUser({ email, name: info.name ?? email.split("@")[0], company: "My Business", provider });
  const res = NextResponse.redirect(new URL(await completeSignIn(user, true, next), url));
  res.cookies.delete("nk_oauth");
  return res;
}
