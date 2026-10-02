"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Copy,
  ImagePlus,
  Mic,
  MicOff,
  Plus,
  Square,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Avatar } from "@/components/ui/primitives";
import { useUser } from "@/components/dashboard/session-context";
import { streamChat, type UiMessage } from "@/lib/chat-client";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, uid } from "@/lib/utils";

interface Thread {
  id: string;
  title: string;
  messages: UiMessage[];
  updated: number;
}

const starters = [
  { title: "Write a follow-up email", prompt: "Write a follow-up email to Aisha Patel about quotation Q-482." },
  { title: "Create an invoice", prompt: "Create an invoice for Cape Interiors: 6 fiddle leaf figs at R420 and installation R850." },
  { title: "Summarise my week", prompt: "Summarise this week's sales, top products and customer conversations." },
  { title: "Social media posts", prompt: "Write social media posts announcing our spring plant sale with 20% off." },
];

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function ChatView() {
  const user = useUser();
  const params = useSearchParams();
  const [threads, setThreads] = usePersistentState<Thread[]>("chat-threads", []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [provider, setProvider] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const initialQuery = useRef(false);

  const active = threads.find((t) => t.id === activeId);
  const messages = active?.messages ?? [];

  const lastContent = messages[messages.length - 1]?.content;
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, lastContent]);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[#*_`>|]/g, "").slice(0, 1200));
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
  }, []);

  const send = useCallback(
    async (text: string, img?: string) => {
      const content = text.trim();
      if ((!content && !img) || loading) return;
      const threadId = activeId ?? uid("t_");
      const userMsg: UiMessage = { id: uid(), role: "user", content, image: img };
      const asst: UiMessage = { id: uid(), role: "assistant", content: "" };
      const history = [...(threads.find((t) => t.id === threadId)?.messages ?? []), userMsg];

      setThreads((ts) => {
        const exists = ts.some((t) => t.id === threadId);
        const next = exists
          ? ts.map((t) => (t.id === threadId ? { ...t, messages: [...history, asst], updated: Date.now() } : t))
          : [{ id: threadId, title: content.slice(0, 48) || "Image analysis", messages: [...history, asst], updated: Date.now() }, ...ts];
        return next;
      });
      setActiveId(threadId);
      setInput("");
      setImage(undefined);
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let full = "";
      const patch = (fn: (m: UiMessage) => UiMessage) =>
        setThreads((ts) =>
          ts.map((t) => (t.id === threadId ? { ...t, messages: t.messages.map((m) => (m.id === asst.id ? fn(m) : m)) } : t)),
        );
      try {
        const p = await streamChat(
          {
            // Only the latest image is re-sent to keep payloads small.
            messages: history.map(({ role, content, image }, i) => ({ role, content, image: i === history.length - 1 ? image : undefined })),
            mode: "app",
          },
          (t) => {
            full += t;
            patch((m) => ({ ...m, content: m.content + t }));
          },
          controller.signal,
        );
        setProvider(p);
        if (speakReplies) speak(full);
      } catch (e) {
        if ((e as Error).name !== "AbortError") patch((m) => ({ ...m, content: `⚠️ ${(e as Error).message}` }));
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [activeId, loading, setThreads, speak, speakReplies, threads],
  );

  useEffect(() => {
    const q = params.get("q");
    if (q && !initialQuery.current) {
      initialQuery.current = true;
      send(q);
    }
  }, [params, send]);

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    rec.lang = "en-ZA";
    rec.interimResults = true;
    rec.continuous = false;
    let transcript = "";
    rec.onresult = (e) => {
      transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    rec.onend = () => {
      setListening(false);
      if (transcript.trim()) {
        setSpeakReplies(true);
        send(transcript);
      }
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert("Images must be under 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-4rem)] sm:-m-6 lg:-m-8">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="p-3">
          <button
            onClick={() => setActiveId(null)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">History</p>
          {threads.length === 0 && <p className="px-2 text-xs text-muted-foreground">No conversations yet.</p>}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center rounded-xl text-sm",
                t.id === activeId ? "bg-muted font-medium" : "text-foreground/70 hover:bg-muted/60",
              )}
            >
              <button onClick={() => setActiveId(t.id)} className="flex-1 cursor-pointer truncate px-3 py-2 text-left">
                {t.title}
              </button>
              <button
                onClick={() => {
                  setThreads((ts) => ts.filter((x) => x.id !== t.id));
                  if (activeId === t.id) setActiveId(null);
                }}
                className="mr-1 hidden rounded-lg p-1.5 text-muted-foreground hover:text-red-500 group-hover:block"
                aria-label="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setActiveId(null)} className="rounded-lg p-1.5 hover:bg-muted md:hidden" aria-label="New chat">
              <Plus className="h-4 w-4" />
            </button>
            <span className="font-semibold">Naykama Assistant</span>
            {provider && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {provider === "openai" ? "GPT" : "Demo model"}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSpeakReplies((s) => !s);
              window.speechSynthesis?.cancel();
            }}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
              speakReplies ? "bg-brand-2/10 text-brand-2 dark:text-violet-300" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Volume2 className="h-3.5 w-3.5" /> Read replies aloud
          </button>
        </div>

        <div ref={scroller} className="scrollbar-thin flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-xl shadow-violet-600/30">
                <Bot className="h-7 w-7" />
              </span>
              <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">How can I help {user.company} today?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask anything — write emails, create invoices, analyse images, translate, or talk using your voice.
              </p>
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                {starters.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => send(s.prompt)}
                    className="cursor-pointer rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-2/40 hover:shadow-lg"
                  >
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-3">
                  {m.role === "user" ? (
                    <Avatar name={user.name} className="h-8 w-8" />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div className="group min-w-0 flex-1 pt-1">
                    <p className="mb-1 text-xs font-semibold">{m.role === "user" ? "You" : "Naykama"}</p>
                    {m.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image} alt="Uploaded" className="mb-2 max-h-56 rounded-xl border border-border" />
                    )}
                    {m.content ? (
                      m.role === "assistant" ? (
                        <Markdown>{m.content}</Markdown>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      )
                    ) : (
                      <span className="inline-flex gap-1 py-2">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-2/60" style={{ animationDelay: `${i * 120}ms` }} />
                        ))}
                      </span>
                    )}
                    {m.role === "assistant" && m.content && (
                      <div className="mt-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => navigator.clipboard.writeText(m.content)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Copy">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => speak(m.content)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Read aloud">
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-background/60 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input, image);
            }}
            className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15"
          >
            {image && (
              <div className="relative m-1 mb-2 w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Attachment preview" className="h-16 rounded-lg border border-border" />
                <button type="button" onClick={() => setImage(undefined)} className="absolute -top-2 -right-2 rounded-full bg-foreground p-0.5 text-background" aria-label="Remove image">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input, image);
                }
              }}
              rows={1}
              placeholder={listening ? "Listening…" : "Message Naykama…"}
              className="max-h-40 min-h-[44px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
              aria-label="Message"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Attach image">
                  <ImagePlus className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={cn(
                    "relative rounded-lg p-2 hover:bg-muted",
                    listening ? "text-red-500" : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={listening ? "Stop voice input" : "Voice input"}
                >
                  {listening && <span className="absolute inset-1 animate-pulse-ring rounded-full bg-red-500/40" />}
                  {listening ? <MicOff className="relative h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {loading ? (
                <button type="button" onClick={() => abortRef.current?.abort()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background" aria-label="Stop">
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim() && !image} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-brand text-white disabled:opacity-40" aria-label="Send">
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Naykama can make mistakes. Review important documents before sending.</p>
        </div>
      </section>
    </div>
  );
}
