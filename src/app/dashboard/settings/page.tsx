"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Bot, Building2, Download, KeyRound, Lock, ShieldCheck, Trash2, Users } from "lucide-react";
import { Avatar, Badge, Card, CardHeader, Input, Label, PageHeader, Select, Switch, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/dashboard/session-context";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile & business", icon: Building2 },
  { id: "ai", label: "AI employee", icon: Bot },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "team", label: "Team & roles", icon: Users },
  { id: "privacy", label: "Data & privacy", icon: Lock },
] as const;

type TabId = (typeof tabs)[number]["id"];

const team = [
  { name: "Ontiretse Manyaka", email: "demo@naykama.ai", role: "Owner" },
  { name: "Thabo Nkosi", email: "thabo@greenhaven.co.za", role: "Manager" },
  { name: "Naledi Mokoena", email: "naledi@greenhaven.co.za", role: "Agent" },
  { name: "Accountant", email: "books@ledgerpro.co.za", role: "Viewer" },
];

const roleMatrix = [
  { perm: "View dashboards & reports", roles: ["Owner", "Admin", "Manager", "Agent", "Viewer"] },
  { perm: "Reply to customers", roles: ["Owner", "Admin", "Manager", "Agent"] },
  { perm: "Create invoices & quotes", roles: ["Owner", "Admin", "Manager"] },
  { perm: "Manage inventory & expenses", roles: ["Owner", "Admin", "Manager"] },
  { perm: "Configure AI & integrations", roles: ["Owner", "Admin"] },
  { perm: "Billing & team management", roles: ["Owner"] },
];

function Feedback({ msg }: { msg?: { ok: boolean; text: string } }) {
  if (!msg) return null;
  return <p className={cn("text-sm", msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{msg.text}</p>;
}

function ProfileTab() {
  const user = useUser();
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [hours, setHours] = usePersistentState("biz-hours", { open: "08:00", close: "18:00", days: "Mon–Sat" });

  async function save(form: FormData) {
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "profile", name: form.get("name"), company: form.get("company") }),
    });
    const json = (await res.json()) as { error?: string };
    setMsg(res.ok ? { ok: true, text: "Profile updated." } : { ok: false, text: json.error ?? "Could not save." });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Profile" description="Your personal and business details." />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(new FormData(e.currentTarget));
          }}
          className="space-y-4 p-5"
        >
          <div className="flex items-center gap-4">
            <Avatar name={user.name} className="h-14 w-14 text-lg" />
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
            </div>
            <div>
              <Label htmlFor="company">Business name</Label>
              <Input id="company" name="company" defaultValue={user.company} required />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">Save changes</Button>
            <Feedback msg={msg} />
          </div>
        </form>
      </Card>
      <Card>
        <CardHeader title="Business hours" description="Your AI tells customers when you're open and books inside these hours." />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="days">Days</Label>
            <Input id="days" value={hours.days} onChange={(e) => setHours({ ...hours, days: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="open">Opens</Label>
            <Input id="open" type="time" value={hours.open} onChange={(e) => setHours({ ...hours, open: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="close">Closes</Label>
            <Input id="close" type="time" value={hours.close} onChange={(e) => setHours({ ...hours, close: e.target.value })} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AiTab() {
  const [cfg, setCfg] = usePersistentState("ai-config", {
    name: "Naykama",
    tone: "Friendly",
    language: "Auto-detect",
    instructions: "We sell indoor plants, planters and accessories in Johannesburg. Delivery across Gauteng is R80. Always offer to book a consultation for orders over R5,000.",
    autoReply: true,
    handoff: true,
    autoInvoice: false,
    voice: true,
  });
  const [saved, setSaved] = useState(false);
  const toggles = [
    { key: "autoReply", label: "Auto-reply to customers", desc: "Respond instantly on all connected channels." },
    { key: "handoff", label: "Smart human handoff", desc: "Escalate complaints, refunds and complex requests to your team." },
    { key: "autoInvoice", label: "Auto-send invoices", desc: "Send invoices automatically when an order is confirmed." },
    { key: "voice", label: "Voice notes", desc: "Transcribe and reply to WhatsApp voice notes." },
  ] as const;

  return (
    <Card>
      <CardHeader title="AI employee" description="Personality, knowledge and automation rules." />
      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="ai-name">Assistant name</Label>
            <Input id="ai-name" value={cfg.name} onChange={(e) => setCfg({ ...cfg, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-tone">Tone</Label>
            <Select id="ai-tone" value={cfg.tone} onChange={(e) => setCfg({ ...cfg, tone: e.target.value })}>
              {["Friendly", "Professional", "Playful", "Luxury", "Concise"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-lang">Reply language</Label>
            <Select id="ai-lang" value={cfg.language} onChange={(e) => setCfg({ ...cfg, language: e.target.value })}>
              {["Auto-detect", "English", "isiZulu", "Afrikaans", "isiXhosa", "Sesotho", "Setswana", "French", "Portuguese"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="ai-instructions">Business knowledge & instructions</Label>
          <Textarea id="ai-instructions" rows={5} value={cfg.instructions} onChange={(e) => setCfg({ ...cfg, instructions: e.target.value })} />
          <p className="mt-1.5 text-xs text-muted-foreground">Tip: include prices, policies, FAQs and anything a new employee should know.</p>
        </div>
        <div className="divide-y divide-border rounded-xl border border-border">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <Switch checked={cfg[t.key]} onChange={(v) => setCfg({ ...cfg, [t.key]: v })} label={t.label} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            Save AI settings
          </Button>
          {saved && <Feedback msg={{ ok: true, text: "Saved — your AI is up to date." }} />}
        </div>
      </div>
    </Card>
  );
}

function SecurityTab() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<string>();
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string }>();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j: { user?: { twoFactorEnabled?: boolean; provider?: string } }) => {
        setEnabled(Boolean(j.user?.twoFactorEnabled));
        setProvider(j.user?.provider);
      });
  }, []);

  async function call(body: object) {
    const res = await fetch("/api/auth/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: res.ok, json: (await res.json()) as { secret?: string; otpauth?: string; error?: string; enabled?: boolean } };
  }

  async function begin() {
    const { ok, json } = await call({ action: "setup" });
    if (ok && json.secret && json.otpauth) {
      setSetup({ secret: json.secret, qr: await QRCode.toDataURL(json.otpauth, { width: 180, margin: 1 }) });
    }
    setMsg(undefined);
  }

  async function confirm(action: "enable" | "disable") {
    const { ok, json } = await call({ action, code });
    if (!ok) return setMsg({ ok: false, text: json.error ?? "Invalid code" });
    setEnabled(action === "enable");
    setSetup(null);
    setCode("");
    setMsg({ ok: true, text: action === "enable" ? "Two-factor authentication is on." : "Two-factor authentication disabled." });
  }

  async function changePassword(form: FormData) {
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "password", current: form.get("current"), next: form.get("next") }),
    });
    const json = (await res.json()) as { error?: string };
    setPwMsg(res.ok ? { ok: true, text: "Password updated." } : { ok: false, text: json.error ?? "Could not update password." });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Two-factor authentication"
          description="Protect your account with an authenticator app (Google Authenticator, Authy, 1Password, Microsoft Authenticator)."
          action={enabled !== null && <Badge tone={enabled ? "green" : "amber"}>{enabled ? "Enabled" : "Off"}</Badge>}
        />
        <div className="space-y-4 p-5">
          {setup ? (
            <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qr}
                alt="Scan this QR code with your authenticator app"
                width={180}
                height={180}
                className="rounded-xl border border-border bg-white"
              />
              <div className="space-y-3">
                <p className="text-sm">1. Scan the QR code, or enter this key manually:</p>
                <code className="block rounded-lg bg-muted px-3 py-2 font-mono text-sm tracking-wider break-all">{setup.secret}</code>
                <p className="text-sm">2. Enter the 6-digit code from your app:</p>
                <div className="flex gap-2">
                  <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="123456" className="w-36 font-mono tracking-widest" aria-label="Authentication code" />
                  <Button onClick={() => confirm("enable")} disabled={code.length !== 6}>
                    Verify & enable
                  </Button>
                </div>
              </div>
            </div>
          ) : enabled ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Current code" className="w-36 font-mono tracking-widest" aria-label="Authentication code" />
              <Button variant="danger" onClick={() => confirm("disable")} disabled={code.length !== 6}>
                Disable 2FA
              </Button>
            </div>
          ) : (
            <Button onClick={begin} disabled={enabled === null}>
              <KeyRound className="h-4 w-4" /> Set up 2FA
            </Button>
          )}
          <Feedback msg={msg} />
        </div>
      </Card>

      {provider === "password" && (
        <Card>
          <CardHeader title="Change password" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePassword(new FormData(e.currentTarget));
              e.currentTarget.reset();
            }}
            className="grid gap-4 p-5 sm:grid-cols-2"
          >
            <div>
              <Label htmlFor="current">Current password</Label>
              <Input id="current" name="current" type="password" autoComplete="current-password" required />
            </div>
            <div>
              <Label htmlFor="next">New password</Label>
              <Input id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit">Update password</Button>
              <Feedback msg={pwMsg} />
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader title="Active sessions" />
        <ul className="divide-y divide-border">
          {[
            { device: "Chrome on Windows", where: "Johannesburg, ZA", current: true },
            { device: "Safari on iPhone", where: "Johannesburg, ZA", current: false },
          ].map((s) => (
            <li key={s.device} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{s.device}</p>
                <p className="text-xs text-muted-foreground">{s.where}</p>
              </div>
              {s.current ? <Badge tone="green">This device</Badge> : <Button variant="ghost" size="sm">Revoke</Button>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TeamTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Team members" action={<Button size="sm">Invite member</Button>} />
        <ul className="divide-y divide-border">
          {team.map((m) => (
            <li key={m.email} className="flex items-center gap-3 p-4">
              <Avatar name={m.name} className="h-9 w-9" />
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <Select defaultValue={m.role} className="h-8 w-28 text-xs" disabled={m.role === "Owner"} aria-label={`Role for ${m.name}`}>
                {["Owner", "Admin", "Manager", "Agent", "Viewer"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader title="Role-based access" description="What each role can do in your workspace." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Permission</th>
                {["Owner", "Admin", "Manager", "Agent", "Viewer"].map((r) => (
                  <th key={r} className="px-3 py-3 font-medium">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((row) => (
                <tr key={row.perm} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{row.perm}</td>
                  {["Owner", "Admin", "Manager", "Agent", "Viewer"].map((r) => (
                    <td key={r} className="px-3 py-3 text-center">
                      {row.roles.includes(r) ? <span className="text-emerald-500">●</span> : <span className="text-muted-foreground/40">○</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PrivacyTab() {
  const user = useUser();
  const [retention, setRetention] = usePersistentState("retention", "12");
  const [consent, setConsent] = usePersistentState("consent", { marketing: false, analytics: true });

  function exportData() {
    const dump: Record<string, unknown> = { exportedAt: new Date().toISOString(), account: user };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.startsWith("nk:")) dump[key.slice(3)] = JSON.parse(localStorage.getItem(key) ?? "null");
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "naykama-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Compliance" description="Naykama AI is built for POPIA (South Africa) and GDPR (EU)." />
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {[
            ["Encryption", "AES-256 at rest · TLS 1.3 in transit"],
            ["Backups", "Automatic daily backups · 30-day point-in-time recovery"],
            ["Data residency", "South Africa (Cape Town) region"],
            ["Information Officer", "privacy@naykama.ai"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="mt-1 text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Retention & consent" />
        <div className="space-y-4 p-5">
          <div className="max-w-xs">
            <Label htmlFor="retention">Delete customer conversations after</Label>
            <Select id="retention" value={retention} onChange={(e) => setRetention(e.target.value)}>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="36">3 years</option>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">Product analytics</p>
              <p className="text-xs text-muted-foreground">Help us improve with anonymised usage data.</p>
            </div>
            <Switch checked={consent.analytics} onChange={(v) => setConsent({ ...consent, analytics: v })} label="Product analytics" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">Marketing emails</p>
              <p className="text-xs text-muted-foreground">Product news and tips. Unsubscribe anytime.</p>
            </div>
            <Switch checked={consent.marketing} onChange={(v) => setConsent({ ...consent, marketing: v })} label="Marketing emails" />
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Your data rights" description="Access, export or erase your data at any time." />
        <div className="flex flex-wrap gap-3 p-5">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4" /> Export my data
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Delete all workspace data stored on this device? This cannot be undone.")) {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("nk:"))
                  .forEach((k) => localStorage.removeItem(k));
                location.reload();
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Erase workspace data
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  return (
    <>
      <PageHeader title="Settings" description="Manage your account, AI employee, security and privacy." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0 scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                tab === t.id ? "bg-card shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {tab === "profile" && <ProfileTab />}
          {tab === "ai" && <AiTab />}
          {tab === "security" && <SecurityTab />}
          {tab === "team" && <TeamTab />}
          {tab === "privacy" && <PrivacyTab />}
        </div>
      </div>
    </>
  );
}
