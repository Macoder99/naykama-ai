"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Minus, Package, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { Badge, Card, Input, Label, Modal, PageHeader, Select, StatCard } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { products as seed, type Product } from "@/lib/data";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, formatCurrency, formatNumber, uid } from "@/lib/utils";

export default function InventoryPage() {
  const [items, setItems] = usePersistentState<Product[]>("products", seed);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(items.map((p) => p.category)))];
  const shown = useMemo(
    () =>
      items.filter(
        (p) => (category === "All" || p.category === category) && `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query, category],
  );
  const low = items.filter((p) => p.stock <= p.reorder);
  const stockValue = items.reduce((s, p) => s + p.stock * p.cost, 0);
  const retailValue = items.reduce((s, p) => s + p.stock * p.price, 0);

  function adjust(id: string, delta: number) {
    setItems((all) => all.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)));
  }

  function save(form: FormData) {
    const product: Product = {
      id: editing?.id ?? uid("p"),
      name: String(form.get("name")),
      sku: String(form.get("sku")),
      category: String(form.get("category")),
      price: Number(form.get("price")),
      cost: Number(form.get("cost")),
      stock: Number(form.get("stock")),
      reorder: Number(form.get("reorder")),
    };
    setItems((all) => (editing ? all.map((p) => (p.id === product.id ? product : p)) : [product, ...all]));
    setOpen(false);
    setEditing(null);
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Real-time stock levels. Your AI checks availability before confirming any order."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add product
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={String(items.length)} icon={<Package className="h-4 w-4" />} />
        <StatCard label="Units in stock" value={formatNumber(items.reduce((s, p) => s + p.stock, 0))} />
        <StatCard label="Stock value (cost)" value={formatCurrency(stockValue)} />
        <StatCard label="Retail value" value={formatCurrency(retailValue)} />
      </div>

      {low.length > 0 && (
        <Card className="mb-6 flex flex-col gap-3 border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="flex-1 text-sm">
            <b>{low.length} products</b> are at or below their reorder level: {low.map((p) => p.name).join(", ")}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setItems((all) => all.map((p) => (p.stock <= p.reorder ? { ...p, stock: p.stock + p.reorder * 2 } : p)))}
          >
            <Sparkles className="h-3.5 w-3.5" /> Auto-restock
          </Button>
        </Card>
      )}

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or SKU…" className="pl-9" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48" aria-label="Category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Margin</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const pct = Math.min(100, (p.stock / Math.max(1, p.reorder * 3)) * 100);
                const isLow = p.stock <= p.reorder;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge>{p.category}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                      {Math.round(((p.price - p.cost) / p.price) * 100)}%
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjust(p.id, -1)} className="rounded-md p-1 hover:bg-muted" aria-label={`Decrease ${p.name}`}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className={cn("w-8 text-center font-semibold", isLow && "text-amber-500")}>{p.stock}</span>
                          <button onClick={() => adjust(p.id, 1)} className="rounded-md p-1 hover:bg-muted" aria-label={`Increase ${p.name}`}>
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted md:block">
                          <div className={cn("h-full rounded-full", isLow ? "bg-amber-500" : "bg-brand")} style={{ width: `${pct}%` }} />
                        </div>
                        {isLow && <Badge tone="amber">Low</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setItems((all) => all.filter((x) => x.id !== p.id))}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-500"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit product" : "Add product"}
      >
        <form
          key={editing?.id ?? "new"}
          onSubmit={(e) => {
            e.preventDefault();
            save(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={editing?.name} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" required defaultValue={editing?.sku} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required defaultValue={editing?.category} list="categories" />
              <datalist id="categories">
                {categories.slice(1).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="price">Selling price (R)</Label>
              <Input id="price" name="price" type="number" min={0} step="0.01" required defaultValue={editing?.price} />
            </div>
            <div>
              <Label htmlFor="cost">Cost (R)</Label>
              <Input id="cost" name="cost" type="number" min={0} step="0.01" required defaultValue={editing?.cost} />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" min={0} required defaultValue={editing?.stock ?? 0} />
            </div>
            <div>
              <Label htmlFor="reorder">Reorder level</Label>
              <Input id="reorder" name="reorder" type="number" min={0} required defaultValue={editing?.reorder ?? 5} />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save product
          </Button>
        </form>
      </Modal>
    </>
  );
}
