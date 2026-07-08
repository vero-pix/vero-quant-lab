import { GraduationCap } from "lucide-react";
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

export function AcademyList({ modules }: { modules: AcademyModule[] }) {
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card/50 px-6 py-16 text-center">
        <GraduationCap className="size-8 text-muted-foreground" />
        <div>
          <p className="text-base font-medium text-foreground">Sin módulos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea un módulo dentro de ACADEMY/ para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {modules.map((m) => (
        <Link key={m.slug} href={`/academy/${m.slug}`} className="block">
          <article className="flex items-center justify-between gap-4 rounded-lg border bg-card/50 px-5 py-3.5 transition-colors hover:border-primary/30 hover:bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-foreground">{m.title}</span>
              <StatusBadge tone={statusTone(m.status)} className="shrink-0 text-[10px]">
                {m.status}
              </StatusBadge>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{m.lessons.length} lecciones</span>
          </article>
        </Link>
      ))}
    </div>
  );
}
