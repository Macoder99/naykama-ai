"use client";

import { useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { Badge, Card, CardHeader, Input, Label, Modal, PageHeader, Select, StatCard } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/dashboard/charts";
import { expenses as seed, type Expense } from "@/lib/data";
import { usePersistentState } from "@/lib/use-persistent-state";
import { formatCurrency, uid } from "@/lib/utils";

const CATEGORIES = ["Inventory", "Rent", "Payroll", "Transport", "Marketing", "Utilities", "Software", "Other"];
const COLORS = ["#7c3aed", "#2563eb", "#a855f7", "#0ea5e9", "#ec4899", "#14b8a6", "#f59e0b", "#64748b"];

export default function ExpensesPage() {
  const [items, setItems] = usePersistentState<Expense[]>("expenses", seed);
  const [open, setOpen] = useState(false);
  const total = items.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((c, i) => ({
    name: c,
    amount: items.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
    fill: COLORS[i],
  })).filter((c) => c.amount > 0);

  function add(form: FormData) {
    setItems((all) => [
      {
        id: uid("e"),
        description: String(form.get("description")),
        category: String(form.get("category")),
        amount: Number(form.get("amount")),
        date: String(form.get("date")),
        method: String(form.get("method")),
      },
      ...all,
    ]);
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track spending and keep your books VAT-ready."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total this month" value={formatCurrency(total)} delta={-3.2} />
        <StatCard label="Largest category" value={[...byCategory].sort((a, b) => b.amount - a.amount)[0]?.name ?? "—"} />
        <StatCard label="VAT claimable (est.)" value={formatCurrency((total * 0.15) / 1.15)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="All expenses" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{e.description}</td>
                    <td className="px-5 py-3">
                      <Badge>{e.category}</Badge>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{e.date}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.method}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setItems((all) => all.filter((x) => x.id !== e.id))} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-500" aria-label="Delete expense">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="By category" />
          <div className="p-5">
            <DonutChart data={byCategory.map((c) => ({ name: c.name, value: Math.round((c.amount / total) * 100), fill: c.fill }))} />
            <ul className="mt-4 space-y-2">
              {byCategory.map((c) => (
                <li key={c.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">{formatCurrency(c.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add expense">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
            <Camera className="h-5 w-5 text-brand-2" /> Tip: snap a receipt in the AI Assistant and it will extract the details for you.
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount (R)</Label>
              <Input id="amount" name="amount" type="number" min={0} step="0.01" required />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="method">Payment method</Label>
              <Select id="method" name="method">
                {["Card", "EFT", "Cash", "Debit order"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save expense
          </Button>
        </form>
      </Modal>
    </>
  );
}
