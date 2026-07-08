import { FileText } from "lucide-react";
import Link from "next/link";
import { StatusBadge, type StatusTone } from "@/components/design-system";
import type { ResearchProject } from "@/lib/research";

function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s.includes("progreso") || s.includes("desarrollo") || s.includes("tomada")) return "ready";
  if (s.includes("planificada") || s.includes("pendiente")) return "pending";
  if (s.includes("completada") || s.includes("validada") || s.includes("aprobada")) return "ready";
  return "neutral";
}

export function ResearchList({ projects }: { projects: ResearchProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card/50 px-6 py-16 text-center">
        <FileText className="size-8 text-muted-foreground" />
        <div>
          <p className="text-base font-medium text-foreground">Sin investigaciones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una carpeta R-XXX dentro de RESEARCH/ para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((r) => (
        <Link key={r.id} href={`/research/${r.id}`} className="block">
          <article className="flex items-center justify-between gap-4 rounded-lg border bg-card/50 px-5 py-3.5 transition-colors hover:border-primary/30 hover:bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 text-sm font-semibold text-foreground">{r.id}</span>
              <span className="truncate text-sm text-foreground">{r.title}</span>
              <StatusBadge tone={statusTone(r.status)} className="shrink-0 text-[10px]">
                {r.status}
              </StatusBadge>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{r.lastModified}</span>
          </article>
        </Link>
      ))}
    </div>
  );
}
