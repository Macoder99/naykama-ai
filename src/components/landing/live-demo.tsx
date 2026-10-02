"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Sparkles } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { streamChat, type UiMessage } from "@/lib/chat-client";
import { uid } from "@/lib/utils";
import { SectionHeading, Reveal } from "./reveal";

const suggestions = [
  "Do you deliver to Soweto?",
  "How much is a large planter?",
  "Book me an appointment for Friday",
  "Create a quote for 20 large planters",
];

export function LiveDemo() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! 👋 I'm the AI employee for **Green Haven**, a plant shop in Johannesburg. Ask me about prices, delivery, bookings or quotes — I'll handle it like a pro.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const user: UiMessage = { id: uid(), role: "user", content };
    const assistant: UiMessage = { id: uid(), role: "assistant", content: "" };
    const history = [...messages.filter((m) => m.id !== "welcome"), user];
    setMessages((m) => [...m, user, assistant]);
    setInput("");
    setLoading(true);
    try {
      await streamChat({ messages: history.map(({ role, content }) => ({ role, content })), mode: "demo" }, (t) =>
        setMessages((m) => m.map((x) => (x.id === assistant.id ? { ...x, content: x.content + t } : x))),
      );
    } catch (e) {
      setMessages((m) =>
        m.map((x) => (x.id === assistant.id ? { ...x, content: (e as Error).message } : x)),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="demo" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-96 max-w-4xl rounded-full bg-gradient-to-r from-blue-600/15 to-violet-600/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Live AI demo"
          title={
            <>
              Talk to an AI employee <span className="text-gradient">right now.</span>
            </>
          }
          description="This is a real, working assistant. Pretend you're a customer of Green Haven and see how Naykama responds."
        />
        <Reveal className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-violet-900/10">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                  <Bot className="h-5 w-5" />
                  <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Green Haven · AI Employee</p>
                  <p className="text-xs text-emerald-500">Online · replies instantly</p>
                </div>
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-brand-2/10 px-2.5 py-1 text-xs font-medium text-brand-2 sm:flex dark:text-violet-300">
                <Sparkles className="h-3 w-3" /> Powered by Naykama AI
              </span>
            </div>

            <div ref={scroller} className="scrollbar-thin h-[420px] space-y-4 overflow-y-auto p-5">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-sm text-white"
                        : "max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5"
                    }
                  >
                    {m.content ? (
                      m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content
                    ) : (
                      <span className="flex gap-1 py-1.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                            style={{ animationDelay: `${i * 120}ms` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="shrink-0 cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-brand-2/50 hover:bg-muted disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 pl-4 focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything a customer would…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  aria-label="Message"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-brand text-white transition disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
