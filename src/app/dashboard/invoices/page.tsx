"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Download, FileText, Plus, Printer, Send, Sparkles, Trash2 } from "lucide-react";
import { Badge, Card, Input, Label, PageHeader, StatCard, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { useUser } from "@/components/dashboard/session-context";
import { invoices as seed, invoiceTotals, VAT_RATE, type Invoice } from "@/lib/data";
import { streamChat } from "@/lib/chat-client";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, formatCurrency, uid } from "@/lib/utils";

const statusTone = { draft: "default", sent: "blue", paid: "green", overdue: "red" } as const;

function nextNumber(list: Invoice[], kind: Invoice["kind"]) {
  const prefix = kind === "invoice" ? "INV-" : "Q-";
  const max = list
    .filter((i) => i.kind === kind)
    .map((i) => Number(i.number.replace(prefix, "")) || 0)
    .reduce((a, b) => Math.max(a, b), kind === "invoice" ? 1000 : 400);
  return `${prefix}${max + 1}`;
}

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function InvoicesPage() {
  const user = useUser();
  const [list, setList] = usePersistentState<Invoice[]>("invoices", seed);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<"all" | Invoice["kind"]>("all");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [toast, setToast] = useState<string>();

  const stats = useMemo(() => {
    const inv = list.filter((i) => i.kind === "invoice");
    const sum = (s: Invoice["status"]) => inv.filter((i) => i.status === s).reduce((a, i) => a + invoiceTotals(i.lines).total, 0);
    return { paid: sum("paid"), outstanding: sum("sent"), overdue: sum("overdue"), quotes: list.filter((i) => i.kind === "quote").length };
  }, [list]);

  function startNew(kind: Invoice["kind"]) {
    setEditing({
      id: uid("i"),
      number: nextNumber(list, kind),
      kind,
      customer: "",
      email: "",
      date: isoDate(),
      due: isoDate(kind === "invoice" ? 14 : 30),
      status: "draft",
      lines: [{ id: uid("x"), description: "", qty: 1, price: 0 }],
    });
  }

  function save(inv: Invoice, status?: Invoice["status"]) {
    const next = status ? { ...inv, status } : inv;
    setList((all) => (all.some((i) => i.id === next.id) ? all.map((i) => (i.id === next.id ? next : i)) : [next, ...all]));
    setEditing(next);
    setToast(status === "sent" ? `${next.number} sent to ${next.email || next.customer}` : `${next.number} saved`);
    setTimeout(() => setToast(undefined), 2500);
  }

  // Ask the AI to turn a plain-language request into structured line items.
  async function aiFill(kind: Invoice["kind"]) {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    let raw = "";
    try {
      await streamChat(
        {
          messages: [
            {
              role: "user",
              content: `Extract a ${kind} from this request and reply ONLY with JSON like {"customer":"","email":"","lines":[{"description":"","qty":1,"price":0}]} (prices in ZAR excl. VAT). Request: ${aiPrompt}`,
            },
          ],
          mode: "app",
          tool: "json",
        },
        (t) => (raw += t),
      );
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = match ? (JSON.parse(match[0]) as { customer?: string; email?: string; lines?: Array<{ description: string; qty: number; price: number }> }) : null;
      const base: Invoice = {
        id: uid("i"),
        number: nextNumber(list, kind),
        kind,
        customer: parsed?.customer ?? "",
        email: parsed?.email ?? "",
        date: isoDate(),
        due: isoDate(kind === "invoice" ? 14 : 30),
        status: "draft",
        lines: (parsed?.lines?.length ? parsed.lines : [{ description: aiPrompt, qty: 1, price: 0 }]).map((l) => ({
          id: uid("x"),
          description: String(l.description),
          qty: Number(l.qty) || 1,
          price: Number(l.price) || 0,
        })),
      };
      setEditing(base);
      setAiPrompt("");
    } catch {
      setToast("Couldn't parse the AI response — opened a blank draft instead.");
      startNew(kind);
    } finally {
      setAiBusy(false);
    }
  }

  if (editing) {
    const totals = invoiceTotals(editing.lines);
    const set = (patch: Partial<Invoice>) => setEditing({ ...editing, ...patch });
    return (
      <>
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setEditing(null)}>
            <ArrowLeft className="h-4 w-4" /> All documents
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <Button variant="outline" onClick={() => save(editing)}>
              Save draft
            </Button>
            {editing.kind === "invoice" && editing.status !== "paid" && (
              <Button variant="outline" onClick={() => save(editing, "paid")}>
                Mark paid
              </Button>
            )}
            <Button onClick={() => save(editing, "sent")} disabled={!editing.customer}>
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </div>
        {toast && <div className="no-print mb-4 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-300">{toast}</div>}

        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <Card className="no-print space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Input id="customer" value={editing.customer} onChange={(e) => set({ customer: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={editing.email} onChange={(e) => set({ email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="date">Issue date</Label>
                <Input id="date" type="date" value={editing.date} onChange={(e) => set({ date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="due">{editing.kind === "invoice" ? "Due date" : "Valid until"}</Label>
                <Input id="due" type="date" value={editing.due} onChange={(e) => set({ due: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Line items</Label>
              <div className="space-y-2">
                {editing.lines.map((l, i) => (
                  <div key={l.id} className="grid grid-cols-[1fr_64px_96px_32px] gap-2">
                    <Input
                      placeholder="Description"
                      value={l.description}
                      onChange={(e) => set({ lines: editing.lines.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })}
                      aria-label="Description"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={l.qty}
                      onChange={(e) => set({ lines: editing.lines.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)) })}
                      aria-label="Quantity"
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={l.price}
                      onChange={(e) => set({ lines: editing.lines.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)) })}
                      aria-label="Unit price"
                    />
                    <button
                      onClick={() => set({ lines: editing.lines.filter((_, j) => j !== i) })}
                      className="flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-500"
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => set({ lines: [...editing.lines, { id: uid("x"), description: "", qty: 1, price: 0 }] })}>
                <Plus className="h-3.5 w-3.5" /> Add line
              </Button>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={editing.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Banking details, terms…" />
            </div>
          </Card>

          <Card className="print-area overflow-hidden bg-white p-8 text-slate-900 shadow-xl dark:bg-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <LogoMark className="h-9 w-9" />
                <div>
                  <p className="font-display text-lg font-bold">{user.company}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold tracking-tight text-violet-700 uppercase">{editing.kind === "invoice" ? "Invoice" : "Quotation"}</p>
                <p className="text-sm text-slate-500">{editing.number}</p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Bill to</p>
                <p className="mt-1 font-semibold">{editing.customer || "Customer name"}</p>
                <p className="text-slate-500">{editing.email}</p>
              </div>
              <div className="text-right">
                <p>
                  <span className="text-slate-400">Issued:</span> {editing.date}
                </p>
                <p>
                  <span className="text-slate-400">{editing.kind === "invoice" ? "Due:" : "Valid until:"}</span> {editing.due}
                </p>
              </div>
            </div>
            <table className="mt-8 w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left text-xs uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {editing.lines.map((l) => (
                  <tr key={l.id} className="border-b border-slate-200">
                    <td className="py-2.5">{l.description || "—"}</td>
                    <td className="py-2.5 text-right">{l.qty}</td>
                    <td className="py-2.5 text-right">{formatCurrency(l.price)}</td>
                    <td className="py-2.5 text-right">{formatCurrency(l.qty * l.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 ml-auto w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VAT ({VAT_RATE * 100}%)</span>
                <span>{formatCurrency(totals.vat)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
            {editing.notes && <p className="mt-8 rounded-lg bg-slate-50 p-3 text-xs whitespace-pre-wrap text-slate-600">{editing.notes}</p>}
            <p className="mt-10 text-center text-[11px] text-slate-400">Generated with Naykama AI · Thank you for your business</p>
          </Card>
        </div>
      </>
    );
  }

  const shown = list.filter((i) => filter === "all" || i.kind === filter);

  return (
    <>
      <PageHeader
        title="Invoices & Quotes"
        description="Create, send and track invoices and quotations — or let the AI write them for you."
        actions={
          <>
            <Button variant="outline" onClick={() => startNew("quote")}>
              <FileText className="h-4 w-4" /> New quote
            </Button>
            <Button onClick={() => startNew("invoice")}>
              <Plus className="h-4 w-4" /> New invoice
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paid" value={formatCurrency(stats.paid)} />
        <StatCard label="Outstanding" value={formatCurrency(stats.outstanding)} />
        <StatCard label="Overdue" value={formatCurrency(stats.overdue)} />
        <StatCard label="Open quotes" value={String(stats.quotes)} />
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-3 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-fuchsia-500/10 p-5 sm:flex-row sm:items-center">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-2" />
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aiFill("invoice")}
            placeholder="e.g. Invoice Cape Interiors for 6 fiddle leaf figs at R420 and installation R850"
            className="flex-1 bg-card"
            aria-label="Describe the invoice"
          />
          <div className="flex gap-2">
            <Button onClick={() => aiFill("invoice")} disabled={aiBusy || !aiPrompt.trim()}>
              {aiBusy ? "Generating…" : "AI invoice"}
            </Button>
            <Button variant="outline" onClick={() => aiFill("quote")} disabled={aiBusy || !aiPrompt.trim()}>
              AI quote
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex rounded-xl bg-muted p-1 text-sm font-medium">
            {(["all", "invoice", "quote"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("cursor-pointer rounded-lg px-3 py-1 capitalize", filter === f ? "bg-card shadow-sm" : "text-muted-foreground")}>
                {f === "all" ? "All" : `${f}s`}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Number</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Issued</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id} onClick={() => setEditing(i)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{i.number}</td>
                  <td className="px-5 py-3">{i.customer}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.due}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(invoiceTotals(i.lines).total)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[i.status]} className="capitalize">
                      {i.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Download className="ml-auto h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Tip: open a document and use <b>Print / PDF</b> to download a PDF copy.
      </p>
    </>
  );
}
