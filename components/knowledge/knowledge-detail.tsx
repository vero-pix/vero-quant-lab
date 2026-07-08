import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { KnowledgeDoc } from "@/lib/knowledge";

export function KnowledgeDetail({ doc }: { doc: KnowledgeDoc }) {
  return (
    <div className="space-y-6">
      <Link
        href="/knowledge"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Volver a documentos
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground">{doc.title}</h1>
        <span className="rounded border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {doc.category}
        </span>
      </div>

      <div className="rounded-lg border bg-card/50 px-5 py-4">
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
