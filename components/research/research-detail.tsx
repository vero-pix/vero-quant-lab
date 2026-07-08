import { ArrowLeft, FlaskConical, Lightbulb, ScrollText, Target, ListChecks, GitBranch } from "lucide-react";
import Link from "next/link";
import { StatusBadge, type StatusTone } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { ResearchProject } from "@/lib/research";

function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s.includes("progreso") || s.includes("desarrollo") || s.includes("tomada")) return "ready";
  if (s.includes("planificada") || s.includes("pendiente")) return "pending";
  if (s.includes("completada") || s.includes("validada") || s.includes("aprobada")) return "ready";
  return "neutral";
}

interface Section {
  icon: typeof Target;
  label: string;
  content: string | null;
}

export function ResearchDetail({ project }: { project: ResearchProject }) {
  const sections: Section[] = [
    { icon: Target, label: "Objetivo", content: project.objective },
    { icon: Lightbulb, label: "Hipótesis", content: project.hypothesis },
    { icon: FlaskConical, label: "Evidencia", content: project.evidence },
    { icon: ScrollText, label: "Conclusión", content: project.conclusion },
    { icon: GitBranch, label: "Decisión", content: project.decision },
    { icon: ListChecks, label: "Acciones", content: project.actions },
  ];

  const hasContent = sections.some((s) => s.content !== null);

  return (
    <div className="space-y-6">
      <Link
        href="/research"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Volver a investigaciones
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground">
          {project.id}: {project.title}
        </h1>
        <StatusBadge tone={statusTone(project.status)}>{project.status}</StatusBadge>
      </div>

      {hasContent ? (
        <div className="space-y-5">
          {sections.map((s) =>
            s.content ? (
              <SectionCard key={s.label} icon={s.icon} label={s.label} content={s.content} />
            ) : null,
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card/50 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Esta investigación aún no tiene contenido.
          </p>
        </div>
      )}
    </div>
  );
}

function SectionCard({ icon: Icon, label, content }: Section) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
      </div>
      <div className="rounded-lg border bg-card/50 px-4 py-3">
        <p className={cn("text-sm leading-relaxed text-muted-foreground", "whitespace-pre-wrap")}>
          {content}
        </p>
      </div>
    </section>
  );
}
