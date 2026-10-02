import "server-only";

export type OAuthProvider = "google" | "microsoft";

interface ProviderConfig {
  clientId?: string;
  clientSecret?: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

export function providerConfig(provider: OAuthProvider): ProviderConfig {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scope: "openid email profile",
    };
  }
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    userInfoUrl: "https://graph.microsoft.com/oidc/userinfo",
    scope: "openid email profile User.Read",
  };
}

export function isProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "microsoft";
}
