"use client";

import { useRef, useState } from "react";
import {
  Copy,
  FileSearch,
  FileText,
  Languages,
  Mail,
  Megaphone,
  MessageSquareText,
  NotebookPen,
  Receipt,
  Share2,
  ShoppingBag,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Label, PageHeader, Select, Textarea } from "@/components/ui/primitives";
import { Markdown } from "@/components/markdown";
import { streamChat } from "@/lib/chat-client";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  placeholder: string;
  example: string;
}

const tools: Tool[] = [
  { id: "email", name: "Email writer", icon: Mail, placeholder: "What should the email say?", example: "Thank a customer for their order and let them know delivery is on Saturday morning." },
  { id: "reply", name: "Customer reply", icon: MessageSquareText, placeholder: "Paste the customer's message…", example: "Hi, my order arrived damaged. I'm really disappointed. What can you do?" },
  { id: "invoice", name: "Invoice", icon: Receipt, placeholder: "Who is it for and what are the items?", example: "Invoice for Cape Interiors: 6 fiddle leaf figs at R420, 6 large planters at R450, installation R850." },
  { id: "quotation", name: "Quotation", icon: FileText, placeholder: "Describe the quote…", example: "Quote for Essop Boutique Hotel: 40 snake plants at R160, 40 small planters at R180, monthly care R2,400." },
  { id: "marketing", name: "Marketing copy", icon: Megaphone, placeholder: "What are you promoting?", example: "Spring sale: 20% off all indoor plants this weekend, free delivery over R500." },
  { id: "product", name: "Product description", icon: ShoppingBag, placeholder: "Product name and key details…", example: "Fiddle leaf fig, 1.2m tall, comes in a 25cm nursery pot, loves bright indirect light." },
  { id: "social", name: "Social posts", icon: Share2, placeholder: "What's the post about?", example: "We just opened our second store in Rosebank!" },
  { id: "summary", name: "Meeting summary", icon: NotebookPen, placeholder: "Paste meeting notes or transcript…", example: "Discussed Q3 results, revenue up 18%. Thabo to finalise promo pricing by Friday. Naledi updating reorder levels. Need another driver." },
  { id: "document", name: "Document analysis", icon: FileSearch, placeholder: "Paste a document or upload a .txt/.md/.csv file…", example: "This agreement is between Green Haven and Cape Interiors for monthly plant maintenance at R1,800 per month, payment due within 60 days of invoice..." },
  { id: "translate", name: "Translate", icon: Languages, placeholder: "Text to translate…", example: "Thank you for your order! Your plants will be delivered tomorrow between 9 and 12." },
];

const languages = ["English", "isiZulu", "isiXhosa", "Afrikaans", "Sesotho", "Setswana", "Sepedi", "Xitsonga", "French", "Portuguese", "Swahili", "Spanish", "German", "Arabic", "Chinese (Simplified)"];
const tones = ["Professional", "Friendly", "Persuasive", "Luxury", "Playful", "Concise"];

export default function StudioPage() {
  const [toolId, setToolId] = useState("email");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tool = tools.find((t) => t.id === toolId)!;

  async function generate() {
    if (!input.trim()) return;
    setOutput("");
    setLoading(true);
    try {
      await streamChat(
        {
          messages: [{ role: "user", content: toolId === "translate" ? input : `Tone: ${tone}.\n\n${input}` }],
          mode: "app",
          tool: toolId,
          language: toolId === "translate" || language !== "English" ? language : undefined,
        },
        (t) => setOutput((o) => o + t),
      );
    } catch (e) {
      setOutput(`⚠️ ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="AI Studio" description="Generate business content in seconds — emails, invoices, marketing, translations and more." />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setToolId(t.id);
              setOutput("");
            }}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition",
              t.id === toolId ? "border-transparent bg-brand text-white shadow-lg shadow-violet-600/20" : "border-border bg-card hover:bg-muted",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display font-semibold">
              <tool.icon className="h-5 w-5 text-brand-2 dark:text-violet-300" /> {tool.name}
            </h2>
            <button onClick={() => setInput(tool.example)} className="text-xs font-medium text-brand-2 hover:underline dark:text-violet-300">
              Use example
            </button>
          </div>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={tool.placeholder} rows={10} className="mt-4" />
          {toolId === "document" && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.csv,.json,.html"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setInput((await f.text()).slice(0, 18000));
                }}
              />
              <Button variant="outline" size="sm" className="mt-3" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Upload document
              </Button>
            </>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {toolId !== "translate" && toolId !== "summary" && toolId !== "document" && (
              <div>
                <Label>Tone</Label>
                <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                  {tones.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <Label>{toolId === "translate" ? "Translate to" : "Output language"}</Label>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={loading || !input.trim()} size="lg" className="mt-5 w-full">
            <Sparkles className="h-4 w-4" /> {loading ? "Generating…" : "Generate"}
          </Button>
        </Card>

        <Card className="flex min-h-[420px] flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Result</h2>
            {output && (
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output)}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
          <div className="mt-4 flex-1 rounded-xl bg-muted/50 p-4">
            {output ? (
              <Markdown>{output}</Markdown>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <Sparkles className="mb-3 h-8 w-8 text-brand-2/50" />
                Your generated content will appear here.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
