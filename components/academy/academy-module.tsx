import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { StatusBadge, type StatusTone } from "@/components/design-system";
import type { AcademyModule } from "@/lib/academy";

function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s.includes("progreso")) return "ready";
  if (s.includes("planificado")) return "pending";
  if (s.includes("completado")) return "ready";
  return "neutral";
}

export function AcademyModuleDetail({ mod }: { mod: AcademyModule }) {
  return (
    <div className="space-y-6">
      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Volver a módulos
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground">{mod.title}</h1>
        <StatusBadge tone={statusTone(mod.status)}>{mod.status}</StatusBadge>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Progreso: {mod.progress}</span>
        <span>{mod.lessons.length} lecciones</span>
      </div>

      {mod.description && (
        <div className="rounded-lg border bg-card/50 px-4 py-3">
          <p className="text-sm text-muted-foreground">{mod.description}</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Lecciones</h2>
        {mod.lessons.length > 0 ? (
          <div className="space-y-2">
            {mod.lessons.map((l) => (
              <Link
                key={l.slug}
                href={`/academy/${mod.slug}/${l.slug}`}
                className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-card"
              >
                <BookOpen className="size-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{l.title}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin lecciones aún.</p>
        )}
      </div>
    </div>
  );
}
