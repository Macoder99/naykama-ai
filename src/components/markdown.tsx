import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-2 text-sm leading-relaxed break-words",
        "[&_h1]:font-display [&_h1]:text-lg [&_h1]:font-bold [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
        "[&_table]:w-full [&_table]:text-left [&_table]:text-xs [&_th]:border-b [&_th]:border-current/15 [&_th]:py-1.5 [&_th]:pr-3 [&_th]:font-semibold [&_td]:border-b [&_td]:border-current/10 [&_td]:py-1.5 [&_td]:pr-3",
        "[&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] dark:[&_code]:bg-white/10",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-2 [&_blockquote]:pl-3 [&_blockquote]:opacity-80",
        "[&_a]:underline [&_strong]:font-semibold",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
