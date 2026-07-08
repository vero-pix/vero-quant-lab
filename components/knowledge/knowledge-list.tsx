import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { KnowledgeDoc } from "@/lib/knowledge";

export function KnowledgeList({ docs }: { docs: KnowledgeDoc[] }) {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card/50 px-6 py-16 text-center">
        <BookOpen className="size-8 text-muted-foreground" />
        <div>
          <p className="text-base font-medium text-foreground">Sin documentos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega archivos .md dentro de KNOWLEDGE/ para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <Link key={doc.slug} href={`/knowledge/${encodeURIComponent(doc.slug)}`} className="block">
          <article className="flex items-center justify-between gap-4 rounded-lg border bg-card/50 px-5 py-3.5 transition-colors hover:border-primary/30 hover:bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <span className="truncate text-sm text-foreground">{doc.title}</span>
              <span className="shrink-0 rounded border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {doc.category}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{doc.lastModified}</span>
          </article>
        </Link>
      ))}
    </div>
  );
}
