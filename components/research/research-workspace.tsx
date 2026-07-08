import { FileText } from "lucide-react";
import { StatusBadge, type StatusTone } from "@/components/design-system";
import type { ResearchListItem } from "@/lib/lab";
import { cn } from "@/lib/utils";

function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s.includes("progreso") || s.includes("desarrollo") || s.includes("tomada")) return "ready";
  if (s.includes("planificada") || s.includes("pendiente")) return "pending";
  if (s.includes("completada") || s.includes("validada")) return "ready";
  return "neutral";
}

function priorityTone(p: string): StatusTone {
  if (p === "alta") return "danger";
  if (p === "media") return "pending";
  return "neutral";
}

const FILE_LABELS: Record<string, string> = {
  README: "Definición",
  NOTES: "Notas",
  SOURCES: "Fuentes",
  RESULTS: "Resultados",
  DECISION: "Decisión",
};

function ResearchWorkspace({ research }: { research: ResearchListItem[] }) {
  if (research.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card/50 px-6 py-16 text-center">
        <FileText className="size-8 text-muted-foreground" />
        <div>
          <p className="text-base font-medium text-foreground">Sin investigaciones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Las investigaciones aparecerán aquí cuando se creen en RESEARCH/.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {research.map((r) => (
        <article
          key={r.id}
          className="rounded-lg border bg-card/50 transition-colors hover:border-primary/30 hover:bg-card"
        >
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {r.id}: {r.title}
                </h3>
                <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
                <StatusBadge tone={priorityTone(r.priority)}>
                  {r.priority === "alta" ? "Alta" : r.priority === "media" ? "Media" : "Baja"}
                </StatusBadge>
              </div>

              {r.objective ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{r.objective}</p>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                {r.files.map((f) => (
                  <span
                    key={f.name}
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                      r.files.length > 0 && "border-border bg-secondary text-muted-foreground",
                    )}
                  >
                    {FILE_LABELS[f.name] ?? f.name}
                  </span>
                ))}
              </div>

              {r.decision ? (
                <p className="text-xs text-muted-foreground italic">
                  Decisión: {r.decision.replace(/\*\*/g, "")}
                </p>
              ) : null}
            </div>

            <div className="flex flex-row flex-wrap gap-4 sm:flex-col sm:items-end sm:justify-between">
              <div className="text-right text-xs text-muted-foreground">
                <p>{r.date}</p>
                <p className="mt-0.5">Progreso: {r.progress}</p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                Modificado: {r.lastModified}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export { ResearchWorkspace };
