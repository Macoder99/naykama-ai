import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(20000),
  image: z.string().startsWith("data:image/").max(6_000_000).optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  mode: z.enum(["demo", "app"]).default("app"),
  tool: z.string().max(60).optional(),
  language: z.string().max(40).optional(),
  businessName: z.string().max(80).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const AI_TOOLS = {
  email: "Write a professional, warm business email. Include a subject line.",
  invoice:
    "Generate a clean invoice in Markdown with a table of line items, subtotal, VAT (15%) and total in South African Rand.",
  quotation:
    "Create a formal quotation in Markdown with line items table, validity period (30 days), VAT (15%) and total in Rand.",
  marketing: "Write high-converting marketing copy with a headline, body and call to action.",
  product: "Write a compelling, SEO-friendly product description with bullet-point benefits.",
  social:
    "Write 3 engaging social media post variations (Instagram, Facebook, LinkedIn) with relevant emojis and hashtags.",
  summary:
    "Summarise the meeting notes into: Key points, Decisions, Action items (with owners) and Next steps.",
  document:
    "Analyse the document: give a short summary, key facts/figures, risks or red flags, and recommended actions.",
  translate: "Translate the text accurately and naturally. Return only the translation.",
  reply: "Draft a friendly, helpful reply to the customer message on behalf of the business.",
  json: "Reply with valid minified JSON only. No prose, no code fences.",
} as const;

export type AiTool = keyof typeof AI_TOOLS;

export function systemPrompt(req: ChatRequest) {
  const business = req.businessName ?? "the user's business";
  const base = `You are Naykama AI, a world-class AI business employee working for ${business}. You help with customer support, sales, administration and daily operations: answering customer questions, booking appointments, writing emails, generating invoices and quotations, marketing content, product descriptions, social media posts, meeting summaries, document analysis and translation. Be concise, warm, professional and action-oriented. Use Markdown formatting (headings, bullet lists, tables) when it improves clarity. Default currency is South African Rand (R) and VAT is 15% unless told otherwise.`;
  const demo =
    req.mode === "demo"
      ? " You are running as a live demo on the Naykama AI website for a fictional plant & home decor shop called 'Green Haven' in Johannesburg (open Mon–Sat 8:00–18:00, delivers across Gauteng for R80, large planters R450, small planters R180, indoor plants from R120). Keep replies under 120 words."
      : "";
  const tool = req.tool && req.tool in AI_TOOLS ? ` Task: ${AI_TOOLS[req.tool as AiTool]}` : "";
  const lang = req.language ? ` Respond in ${req.language}.` : "";
  return base + demo + tool + lang;
}

type OpenAIContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

export async function openAIStream(req: ChatRequest, apiKey: string): Promise<ReadableStream<Uint8Array>> {
  const messages: Array<{ role: string; content: OpenAIContent }> = [
    { role: "system", content: systemPrompt(req) },
    ...req.messages.map((m) => ({
      role: m.role,
      content: m.image
        ? [
            { type: "text" as const, text: m.content || "Describe this image." },
            { type: "image_url" as const, image_url: { url: m.image } },
          ]
        : m.content,
    })),
  ];

  const res = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      stream: true,
      temperature: 0.6,
      max_tokens: req.mode === "demo" ? 300 : 1500,
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`OpenAI error ${res.status}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.replace(/^data:\s*/, "").trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
            const token = json.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          } catch {
            // ignore partial frames
          }
        }
      },
    }),
  );
}

const today = () => new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

/** Best-effort extraction of "<qty> <item> at R<price>" / "<item> R<price>" phrases for demo mode. */
function mockDocumentJson(text: string): string {
  const request = text.split("Request:").pop() ?? text;
  const customer = request.match(/(?:[Ff]or|[Ii]nvoice|[Qq]uot(?:e|ation))\s+([A-Z][\w&'-]*(?:\s+[A-Z][\w&'-]*)*)/)?.[1] ?? "";
  const body = request.replace(/^.*?\bfor\s+(?=\d|[a-z])/, "");
  const lines = body
    .split(/,\s|\band\b|;/)
    .map((part) => {
      const m = part.match(/(?:(\d+)\s*(?:x|×)?\s+)?([a-zA-Z][a-zA-Z\s'-]*?)\s*(?:at|@|for|-)?\s*R\s?(\d[\d,.]*)/);
      if (!m) return null;
      const description = m[2].trim();
      return { description: description.charAt(0).toUpperCase() + description.slice(1), qty: Number(m[1] ?? 1), price: Number(m[3].replace(/,/g, "")) };
    })
    .filter((l): l is { description: string; qty: number; price: number } => l !== null && l.description.length > 0);
  return JSON.stringify({ customer: customer.replace(/\s+(for|with)$/i, ""), email: "", lines });
}

function mockAnswer(req: ChatRequest): string {
  const last = req.messages[req.messages.length - 1];
  const text = last.content.trim();
  const q = text.toLowerCase();
  const tool = req.tool as AiTool | undefined;

  if (tool === "json") return mockDocumentJson(text);
  if (tool === "reply") {
    return `Hi there! Thank you so much for getting in touch 😊 I completely understand — let me sort this out for you right away. I've checked your details and can confirm we'll have an update for you within the hour. Is there anything else I can help with in the meantime?`;
  }

  if (last.image) {
    return `### Image analysis\n\nI can see an uploaded image. Here's what I'd extract for your business:\n\n- **Type:** Looks like a product photo / document\n- **Suggested actions:** add to inventory, attach to a customer record, or generate a product description\n\n> Connect your OpenAI API key (\`OPENAI_API_KEY\`) to enable full vision analysis of receipts, invoices and product photos.`;
  }

  if (tool === "translate") {
    return `**Translation (${req.language ?? "target language"}):**\n\n${text}\n\n_Demo mode: add an \`OPENAI_API_KEY\` for real translations into 50+ languages._`;
  }
  if (tool === "invoice" || /\binvoice\b/.test(q)) {
    return `## Invoice INV-${Math.floor(1000 + Math.random() * 9000)}\n**Date:** ${today()}  \n**Due:** 14 days\n\n| Item | Qty | Unit price | Amount |\n|---|---:|---:|---:|\n| Consulting services | 4 | R 850.00 | R 3,400.00 |\n| Setup & onboarding | 1 | R 1,200.00 | R 1,200.00 |\n\n| | |\n|---|---:|\n| Subtotal | R 4,600.00 |\n| VAT (15%) | R 690.00 |\n| **Total** | **R 5,290.00** |\n\nPayment via EFT or card. Want me to email this to the customer?`;
  }
  if (tool === "quotation" || /\bquot(e|ation)\b/.test(q)) {
    return `## Quotation Q-${Math.floor(100 + Math.random() * 900)}\n**Date:** ${today()} · **Valid for:** 30 days\n\n| Item | Qty | Unit price | Amount |\n|---|---:|---:|---:|\n| Large planter | 20 | R 450.00 | R 9,000.00 |\n| Delivery (Gauteng) | 1 | R 80.00 | R 80.00 |\n\n**Subtotal:** R 9,080.00  \n**VAT (15%):** R 1,362.00  \n**Total:** **R 10,442.00**\n\nShall I send this quote and set a follow-up reminder for 3 days?`;
  }
  if (tool === "email" || /\bemail\b/.test(q)) {
    return `**Subject:** Thank you for choosing us 🙌\n\nHi there,\n\nThank you for reaching out! I'm happy to confirm that we've received your request and our team is already on it.\n\nHere's what happens next:\n1. You'll receive a confirmation within the hour\n2. We'll schedule a quick call at a time that suits you\n3. Your order / booking will be finalised\n\nIf you have any questions, simply reply to this email — we're here 24/7.\n\nWarm regards,  \n${req.businessName ?? "The Team"}`;
  }
  if (tool === "social" || /social|instagram|post/.test(q)) {
    return `**Instagram** 📸\nNew week, new green energy 🌿 Our indoor plants are back in stock — tag a friend who needs a little jungle at home! #PlantLove #Joburg #HomeDecor\n\n**Facebook** 👍\nGood news, Gauteng! 🚚 We now deliver same-week across the province for just R80. Order via WhatsApp and our AI assistant will sort you out in seconds.\n\n**LinkedIn** 💼\nSmall business, big automation: our AI employee now handles 70% of customer questions — so our team can focus on growth. #SmallBusiness #AI`;
  }
  if (tool === "product" || /product description/.test(q)) {
    return `### ${text.split("\n")[0].slice(0, 60) || "Premium Product"}\n\nElevate your everyday with a product designed for people who care about quality.\n\n- ✨ **Premium materials** built to last\n- 🚀 **Ready to use** straight out of the box\n- 🌍 **Locally supported** with fast delivery\n- 💚 **Satisfaction guaranteed** — 30-day returns\n\n_Order today and get free delivery on orders over R500._`;
  }
  if (tool === "marketing") {
    return `# Work smarter, not longer.\n\nYour customers want answers now — not tomorrow. With our new offer, you get faster service, better prices and a team that's always on.\n\n**Why customers love us**\n- Instant replies, day or night\n- Transparent pricing\n- Local, friendly support\n\n👉 **Claim 20% off this week only — book now.**`;
  }
  if (tool === "summary" || /summar/.test(q)) {
    return `### Meeting summary\n\n**Key points**\n- Q3 revenue up 18%; WhatsApp is now the top sales channel\n- Customer response time dropped from 4h to under 1 minute\n\n**Decisions**\n- Launch winter promotion on 1 June\n- Hire one additional delivery driver\n\n**Action items**\n- [ ] Thabo — finalise promo pricing (Fri)\n- [ ] Naledi — update inventory reorder levels (Wed)\n- [ ] Naykama AI — draft campaign emails & social posts (today)\n\n**Next steps:** review campaign results in two weeks.`;
  }
  if (tool === "document") {
    return `### Document analysis\n\n**Summary:** The document outlines commercial terms, deliverables and payment schedule.\n\n**Key facts**\n- Length: ~${text.split(/\s+/).length} words\n- Contains pricing / dates that should be tracked\n\n**Potential risks**\n- Payment terms longer than 30 days\n- Missing termination clause details\n\n**Recommended actions**\n1. Confirm payment terms with the client\n2. Add renewal date to the calendar\n3. Store in the customer's CRM record`;
  }
  if (/deliver|soweto|shipping/.test(q)) {
    return `Yes! 🚚 We deliver across Gauteng — including Soweto — for a flat **R80**. Orders placed before 14:00 usually arrive the next business day. Would you like me to reserve your items and book a delivery slot?`;
  }
  if (/book|appointment|schedule|slot/.test(q)) {
    return `Absolutely! 📅 I have the following slots available:\n\n- **Tomorrow** — 09:00, 11:30, 15:00\n- **Friday** — 10:00, 14:00\n\nWhich one works best for you? I'll send a confirmation and a reminder an hour before.`;
  }
  if (/price|cost|how much|planter/.test(q)) {
    return `Here are our most popular items 🌿\n\n| Item | Price |\n|---|---:|\n| Large planter | R450 |\n| Small planter | R180 |\n| Indoor plants | from R120 |\n\nDelivery across Gauteng is R80. Want me to put together a quote?`;
  }
  if (/hour|open|close/.test(q)) {
    return `We're open **Monday to Saturday, 08:00–18:00** 🕗 — but I'm available 24/7 to answer questions, take orders and book appointments.`;
  }
  if (/stock|inventory/.test(q)) {
    return `Current stock snapshot 📦\n\n- Large planters: **12** in stock\n- Small planters: **34** in stock\n- Monstera (indoor): **5** left — low stock ⚠️\n\nWant me to create a purchase order to restock the Monstera?`;
  }
  if (/^(hi|hello|hey|sawubona|dumela|molo)\b/.test(q)) {
    return `Hello! 👋 I'm Naykama, your AI employee. I can answer customer questions, book appointments, create invoices and quotes, write emails and marketing content, and analyse your sales. What can I help you with today?`;
  }
  return `Great question! Here's how I'd handle that:\n\n1. **Understand** — I've captured your request: _"${text.slice(0, 140)}${text.length > 140 ? "…" : ""}"_\n2. **Act** — I can draft a reply, create a task, generate a document or update your CRM\n3. **Follow up** — I'll remind you or the customer automatically\n\nWould you like me to turn this into an email, invoice, quote or task?\n\n_Running in demo mode — connect \`OPENAI_API_KEY\` for full GPT-powered answers._`;
}

export function mockStream(req: ChatRequest): ReadableStream<Uint8Array> {
  const answer = mockAnswer(req);
  const encoder = new TextEncoder();
  const tokens = answer.match(/\S+\s*|\s+/g) ?? [answer];
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= tokens.length) {
        controller.close();
        return;
      }
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
      controller.enqueue(encoder.encode(tokens[i++]));
    },
  });
}
