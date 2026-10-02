"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search, Sparkles } from "lucide-react";
import { Avatar, Badge, Card, Input, Label, Modal, PageHeader, Select, StatCard } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { customers as seedCustomers, leads as seedLeads, type Customer, type Lead, type LeadStage } from "@/lib/data";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, formatCurrency, uid } from "@/lib/utils";

const stages: Array<{ id: LeadStage; label: string; color: string }> = [
  { id: "new", label: "New", color: "bg-sky-500" },
  { id: "contacted", label: "Contacted", color: "bg-blue-500" },
  { id: "qualified", label: "Qualified", color: "bg-indigo-500" },
  { id: "proposal", label: "Proposal", color: "bg-violet-500" },
  { id: "won", label: "Won", color: "bg-emerald-500" },
];

function exportCsv(rows: Customer[]) {
  const header = "Name,Email,Phone,Company,Spend,Orders,Status";
  const body = rows.map((r) => [r.name, r.email, r.phone, r.company, r.spend, r.orders, r.status].join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function CrmPage() {
  const [tab, setTab] = useState<"customers" | "leads">("customers");
  const [customers, setCustomers] = usePersistentState<Customer[]>("customers", seedCustomers);
  const [leads, setLeads] = usePersistentState<Lead[]>("leads", seedLeads);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const filtered = useMemo(
    () => customers.filter((c) => `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(query.toLowerCase())),
    [customers, query],
  );
  const pipeline = leads.filter((l) => l.stage !== "won").reduce((s, l) => s + l.value, 0);

  function addRecord(form: FormData) {
    if (tab === "customers") {
      setCustomers((c) => [
        {
          id: uid("u"),
          name: String(form.get("name")),
          email: String(form.get("email")),
          phone: String(form.get("phone") ?? ""),
          company: String(form.get("company") || "—"),
          spend: 0,
          orders: 0,
          lastSeen: "Just now",
          status: "active",
        },
        ...c,
      ]);
    } else {
      setLeads((l) => [
        {
          id: uid("l"),
          name: String(form.get("name")),
          company: String(form.get("company") || "—"),
          value: Number(form.get("value") || 0),
          stage: "new",
          source: String(form.get("source") || "Manual"),
          score: 50 + Math.floor(Math.random() * 40),
        },
        ...l,
      ]);
    }
    setModal(false);
  }

  return (
    <>
      <PageHeader
        title="CRM & Leads"
        description="Every customer and lead captured by your AI employee across all channels."
        actions={
          <>
            {tab === "customers" && (
              <Button variant="outline" onClick={() => exportCsv(filtered)}>
                <Download className="h-4 w-4" /> Export
              </Button>
            )}
            <Button onClick={() => setModal(true)}>
              <Plus className="h-4 w-4" /> Add {tab === "customers" ? "customer" : "lead"}
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value={customers.length.toString()} delta={12} />
        <StatCard label="VIP customers" value={customers.filter((c) => c.status === "vip").length.toString()} />
        <StatCard label="Open pipeline" value={formatCurrency(pipeline)} delta={21} />
        <StatCard label="Leads captured by AI" value="86%" />
      </div>

      <div className="mb-4 flex w-fit rounded-xl bg-muted p-1 text-sm font-medium">
        {(["customers", "leads"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("cursor-pointer rounded-lg px-4 py-1.5 capitalize", tab === t ? "bg-card shadow-sm" : "text-muted-foreground")}>
            {t === "customers" ? "Customer database" : "Lead pipeline"}
          </button>
        ))}
      </div>

      {tab === "customers" ? (
        <Card>
          <div className="border-b border-border p-4">
            <div className="relative max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers…" className="pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 text-right font-medium">Lifetime spend</th>
                  <th className="px-5 py-3 text-right font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} className="h-8 w-8" />
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{c.phone}</td>
                    <td className="px-5 py-3">{c.company}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(c.spend)}</td>
                    <td className="px-5 py-3 text-right">{c.orders}</td>
                    <td className="px-5 py-3">
                      <Badge tone={c.status === "vip" ? "brand" : c.status === "active" ? "green" : "default"} className="capitalize">
                        {c.status === "vip" ? "VIP" : c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{c.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((s) => {
            const items = leads.filter((l) => l.stage === s.id);
            return (
              <div
                key={s.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) setLeads((ls) => ls.map((l) => (l.id === dragId ? { ...l, stage: s.id } : l)));
                  setDragId(null);
                }}
                className="w-72 shrink-0 rounded-2xl bg-muted/60 p-3"
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={cn("h-2.5 w-2.5 rounded-full", s.color)} />
                  <p className="text-sm font-semibold">{s.label}</p>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    {formatCurrency(items.reduce((a, l) => a + l.value, 0))}
                  </span>
                </div>
                <div className="min-h-24 space-y-2">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={() => setDragId(l.id)}
                      className="cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                    >
                      <p className="text-sm font-semibold">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.company}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">{formatCurrency(l.value)}</span>
                        <Badge tone={l.score >= 80 ? "green" : l.score >= 60 ? "amber" : "default"}>
                          <Sparkles className="h-3 w-3" /> {l.score}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>via {l.source}</span>
                        <Select
                          value={l.stage}
                          onChange={(e) => setLeads((ls) => ls.map((x) => (x.id === l.id ? { ...x, stage: e.target.value as LeadStage } : x)))}
                          className="h-7 w-auto rounded-lg px-1.5 text-[11px]"
                          aria-label="Move stage"
                        >
                          {stages.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={tab === "customers" ? "Add customer" : "Add lead"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addRecord(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" />
          </div>
          {tab === "customers" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="value">Deal value (R)</Label>
                <Input id="value" name="value" type="number" min={0} required />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Select id="source" name="source">
                  {["WhatsApp", "Website", "Email", "Instagram", "Messenger", "Referral", "Manual"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
