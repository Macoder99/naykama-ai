"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, Sparkles } from "lucide-react";
import { allNavItems } from "./nav";
import { cn } from "@/lib/utils";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const nav = allNavItems.filter((i) => i.label.toLowerCase().includes(q));
    return q ? [{ href: `/dashboard/chat?q=${encodeURIComponent(query)}`, label: `Ask AI: "${query}"`, ai: true }, ...nav] : nav;
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  if (!open) return null;

  function go(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") setIndex((i) => Math.min(i + 1, results.length - 1));
              if (e.key === "ArrowUp") setIndex((i) => Math.max(i - 1, 0));
              if (e.key === "Enter" && results[index]) go(results[index].href);
            }}
            placeholder="Jump to a page or ask your AI employee…"
            className="h-14 flex-1 bg-transparent text-sm outline-none"
            aria-label="Command search"
          />
          <kbd className="rounded-md border border-border px-1.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.map((r, i) => {
            const Icon = "icon" in r ? r.icon : Sparkles;
            return (
              <li key={r.href}>
                <button
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => go(r.href)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm",
                    i === index ? "bg-muted" : "",
                  )}
                >
                  <Icon className={cn("h-4 w-4", "ai" in r ? "text-brand-2" : "text-muted-foreground")} />
                  {r.label}
                  {i === index && <CornerDownLeft className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No results</li>}
        </ul>
      </div>
    </div>
  );
}
