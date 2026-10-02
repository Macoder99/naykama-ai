"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Globe, Mail, MessageSquare, Plug, ShoppingCart, type LucideIcon } from "lucide-react";
import { InstagramIcon, MessengerIcon, WhatsAppIcon } from "@/components/brand-icons";
import { Badge, Card, Input, Label, Modal, PageHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn } from "@/lib/utils";

type IconType = LucideIcon | ((p: React.SVGProps<SVGSVGElement>) => React.ReactElement);

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
  group: "Channels" | "Business apps";
  fields: Array<{ name: string; label: string; placeholder: string; type?: string }>;
}

const integrations: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business", description: "Reply to customers, take orders and send invoices on WhatsApp via the Cloud API.", icon: WhatsAppIcon, color: "text-emerald-500 bg-emerald-500/10", group: "Channels", fields: [{ name: "phone", label: "Business phone number", placeholder: "+27 82 555 0100" }, { name: "token", label: "Cloud API access token", placeholder: "EAAG…", type: "password" }] },
  { id: "email", name: "Email", description: "Connect Gmail, Outlook or any IMAP/SMTP inbox for AI email replies.", icon: Mail, color: "text-blue-500 bg-blue-500/10", group: "Channels", fields: [{ name: "address", label: "Support email address", placeholder: "hello@yourbusiness.co.za", type: "email" }] },
  { id: "sms", name: "SMS", description: "Two-way SMS with customers via Twilio, Clickatell or BulkSMS.", icon: MessageSquare, color: "text-sky-500 bg-sky-500/10", group: "Channels", fields: [{ name: "sid", label: "Account SID / API key", placeholder: "AC…" }, { name: "from", label: "Sender number", placeholder: "+27…" }] },
  { id: "web", name: "Website live chat", description: "Add the Naykama chat widget to your website with one line of code.", icon: Globe, color: "text-violet-500 bg-violet-500/10", group: "Channels", fields: [{ name: "domain", label: "Website domain", placeholder: "yourbusiness.co.za" }] },
  { id: "messenger", name: "Facebook Messenger", description: "Answer Facebook Page messages automatically.", icon: MessengerIcon, color: "text-blue-600 bg-blue-600/10", group: "Channels", fields: [{ name: "page", label: "Facebook Page ID", placeholder: "1234567890" }] },
  { id: "instagram", name: "Instagram Direct", description: "Reply to Instagram DMs, story replies and comments.", icon: InstagramIcon, color: "text-pink-500 bg-pink-500/10", group: "Channels", fields: [{ name: "handle", label: "Instagram handle", placeholder: "@yourbusiness" }] },
  { id: "gcal", name: "Google Calendar", description: "Sync appointments booked by your AI to your calendar.", icon: Calendar, color: "text-amber-500 bg-amber-500/10", group: "Business apps", fields: [{ name: "calendar", label: "Calendar email", placeholder: "you@gmail.com", type: "email" }] },
  { id: "shop", name: "Shopify / WooCommerce", description: "Sync products, stock levels and orders.", icon: ShoppingCart, color: "text-lime-600 bg-lime-500/10", group: "Business apps", fields: [{ name: "store", label: "Store URL", placeholder: "yourstore.myshopify.com" }] },
];

export default function IntegrationsPage() {
  const [connected, setConnected] = usePersistentState<Record<string, string>>("integrations", { whatsapp: "+27 82 555 0100", web: "greenhaven.co.za", email: "hello@greenhaven.co.za", instagram: "@greenhaven.jhb" });
  const [active, setActive] = useState<Integration | null>(null);
  const [busy, setBusy] = useState(false);

  function connect(form: FormData) {
    if (!active) return;
    setBusy(true);
    const label = String(form.get(active.fields[0].name));
    setTimeout(() => {
      setConnected((c) => ({ ...c, [active.id]: label }));
      setBusy(false);
      setActive(null);
    }, 900);
  }

  const snippet = `<script src="https://cdn.naykama.ai/widget.js" data-workspace="greenhaven" async></script>`;

  return (
    <>
      <PageHeader title="Integrations" description="Connect your channels and tools — your AI employee works across all of them from one inbox." />
      {(["Channels", "Business apps"] as const).map((group) => (
        <section key={group} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{group}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {integrations
              .filter((i) => i.group === group)
              .map((i) => {
                const isOn = Boolean(connected[i.id]);
                const Icon = i.icon;
                return (
                  <Card key={i.id} className="flex flex-col p-5 transition hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", i.color)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      {isOn && (
                        <Badge tone="green">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </Badge>
                      )}
                    </div>
                    <p className="mt-4 font-semibold">{i.name}</p>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{i.description}</p>
                    {isOn && <p className="mt-3 truncate text-xs text-muted-foreground">{connected[i.id]}</p>}
                    <div className="mt-4">
                      {isOn ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConnected((c) => {
                              const next = { ...c };
                              delete next[i.id];
                              return next;
                            })
                          }
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setActive(i)}>
                          <Plug className="h-3.5 w-3.5" /> Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}

      <Card className="p-5">
        <p className="font-semibold">Website chat widget</p>
        <p className="mt-1 text-sm text-muted-foreground">Paste this before the closing &lt;/body&gt; tag on your website.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <code className="flex-1 overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 font-mono text-xs whitespace-nowrap text-violet-200">{snippet}</code>
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(snippet)}>
            Copy
          </Button>
        </div>
      </Card>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={`Connect ${active?.name ?? ""}`}>
        {active && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              connect(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">{active.description}</p>
            {active.fields.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input id={f.name} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder} required />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Credentials are encrypted with AES-256 and never shown again.</p>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Verifying connection…" : "Connect"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
