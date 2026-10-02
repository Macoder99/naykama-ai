"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, CheckCheck, Search, Send, Sparkles, UserRound } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { ChannelIcon } from "@/components/dashboard/channel-icon";
import { channelMeta, conversations as seed, type Channel, type Conversation } from "@/lib/data";
import { streamChat } from "@/lib/chat-client";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn } from "@/lib/utils";

const filters: Array<{ id: "all" | Channel; label: string }> = [
  { id: "all", label: "All" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "web", label: "Web" },
  { id: "messenger", label: "Messenger" },
  { id: "instagram", label: "Instagram" },
];

export default function InboxPage() {
  const [items, setItems] = usePersistentState<Conversation[]>("inbox", seed);
  const [activeId, setActiveId] = useState<string | null>(seed[0].id);
  const [filter, setFilter] = useState<"all" | Channel>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const list = useMemo(
    () =>
      items.filter(
        (c) => (filter === "all" || c.channel === filter) && c.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, filter, query],
  );
  const active = items.find((c) => c.id === activeId);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [active?.messages.length]);

  function update(id: string, fn: (c: Conversation) => Conversation) {
    setItems((all) => all.map((c) => (c.id === id ? fn(c) : c)));
  }

  function sendReply() {
    if (!active || !draft.trim()) return;
    const time = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    update(active.id, (c) => ({ ...c, messages: [...c.messages, { from: "agent", text: draft.trim(), time }], status: "human", time: "now" }));
    setDraft("");
  }

  async function aiDraft() {
    if (!active) return;
    setDrafting(true);
    setDraft("");
    const transcript = active.messages.map((m) => `${m.from === "customer" ? active.name : "Business"}: ${m.text}`).join("\n");
    try {
      await streamChat(
        { messages: [{ role: "user", content: `Conversation on ${channelMeta[active.channel].label}:\n${transcript}\n\nDraft the next reply. Reply text only.` }], mode: "app", tool: "reply" },
        (t) => setDraft((d) => d + t),
      );
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Card className="flex h-[calc(100dvh-8rem)] overflow-hidden lg:h-[calc(100dvh-10rem)]">
      <div className={cn("flex w-full flex-col border-r border-border md:w-80 lg:w-96", mobileThread && "hidden md:flex")}>
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-bold">Inbox</h1>
            <Badge tone="brand">
              <Bot className="h-3 w-3" /> AI auto-reply on
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" className="h-9 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-ring" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn("shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium", filter === f.id ? "bg-foreground text-background" : "bg-muted text-foreground/70 hover:text-foreground")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="scrollbar-thin flex-1 overflow-y-auto p-2">
          {list.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  setActiveId(c.id);
                  setMobileThread(true);
                  update(c.id, (x) => ({ ...x, unread: false }));
                }}
                className={cn("flex w-full cursor-pointer gap-3 rounded-xl p-3 text-left transition", c.id === activeId ? "bg-muted" : "hover:bg-muted/60")}
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 to-violet-500/20 text-sm font-semibold">
                  {c.name[0]}
                  <span className="absolute -right-0.5 -bottom-0.5 rounded-full bg-card p-0.5">
                    <ChannelIcon channel={c.channel} className="h-3.5 w-3.5" />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{c.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.messages[c.messages.length - 1].text}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge tone={c.status === "ai" ? "brand" : c.status === "human" ? "amber" : "green"} className="px-2 text-[10px]">
                      {c.status === "ai" ? "AI handling" : c.status === "human" ? "Needs human" : "Resolved"}
                    </Badge>
                    {c.tag && <Badge className="px-2 text-[10px]">{c.tag}</Badge>}
                  </div>
                </div>
                {c.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-2" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {active ? (
        <div className={cn("flex min-w-0 flex-1 flex-col", !mobileThread && "hidden md:flex")}>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button onClick={() => setMobileThread(false)} className="rounded-lg p-1.5 hover:bg-muted md:hidden" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <p className="font-semibold">{active.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ChannelIcon channel={active.channel} className="h-3 w-3" /> via {channelMeta[active.channel].label}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => update(active.id, (c) => ({ ...c, status: c.status === "ai" ? "human" : "ai" }))}>
              {active.status === "ai" ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{active.status === "ai" ? "Take over" : "Hand to AI"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => update(active.id, (c) => ({ ...c, status: "resolved" }))}>
              <CheckCheck className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Resolve</span>
            </Button>
          </div>
          <div ref={scroller} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4 sm:p-6">
            {active.messages.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "customer" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm", m.from === "customer" ? "rounded-tl-sm bg-card" : m.from === "ai" ? "rounded-tr-sm bg-brand text-white" : "rounded-tr-sm bg-foreground text-background")}>
                  {m.from !== "customer" && (
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold opacity-75">
                      {m.from === "ai" ? (
                        <>
                          <Sparkles className="h-3 w-3" /> Naykama AI
                        </>
                      ) : (
                        "You"
                      )}
                    </p>
                  )}
                  {m.text}
                  <p className="mt-1 text-right text-[10px] opacity-60">{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="rounded-2xl border border-border bg-background p-2 focus-within:border-ring">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                rows={2}
                placeholder={`Reply on ${channelMeta[active.channel].label}…`}
                className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={aiDraft} disabled={drafting}>
                  <Sparkles className="h-3.5 w-3.5 text-brand-2" /> {drafting ? "Drafting…" : "AI draft"}
                </Button>
                <Button size="sm" onClick={sendReply} disabled={!draft.trim()}>
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center text-sm text-muted-foreground md:flex">Select a conversation</div>
      )}
    </Card>
  );
}
