import { GoogleIcon, MicrosoftIcon } from "@/components/brand-icons";
import { buttonClass } from "@/components/ui/button";

export function OAuthButtons({ next }: { next?: string }) {
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="grid grid-cols-2 gap-3">
      <a href={`/api/auth/oauth/google${q}`} className={buttonClass("outline", "md")}>
        <GoogleIcon className="h-4 w-4" /> Google
      </a>
      <a href={`/api/auth/oauth/microsoft${q}`} className={buttonClass("outline", "md")}>
        <MicrosoftIcon className="h-4 w-4" /> Microsoft
      </a>
    </div>
  );
}

export function Divider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
      {message}
    </p>
  );
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}
