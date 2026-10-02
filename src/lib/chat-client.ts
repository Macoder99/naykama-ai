export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export async function streamChat(
  body: {
    messages: Array<Pick<UiMessage, "role" | "content" | "image">>;
    mode?: "demo" | "app";
    tool?: string;
    language?: string;
  },
  onToken: (token: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Something went wrong. Please try again.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
  return res.headers.get("X-AI-Provider") ?? "demo";
}
