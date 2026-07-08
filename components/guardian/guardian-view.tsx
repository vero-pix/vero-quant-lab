import { Activity, Layers, ShieldCheck, TrendingDown } from "lucide-react";
import { StatusBadge, SectionHeading } from "@/components/design-system";
import type { GuardianSnapshot, SemaforoEstado } from "@/lib/guardian";
import { cn } from "@/lib/utils";

const semaforoLabel: Record<SemaforoEstado, string> = {
  GO: "GO",
  PRECAUCION: "Precaución",
  BLOQUEO: "Bloqueo",
};

// Dirección "Guardian sereno": el semáforo usa los tokens go/caution/block.
const semaforoStyles: Record<
  SemaforoEstado,
  { dot: string; heading: string; border: string; bg: string; badge: string }
> = {
  GO: {
    dot: "bg-go",
    heading: "text-go",
    border: "border-go/40",
    bg: "bg-go/10",
    badge: "border-go/40 bg-go/15 text-go",
  },
  PRECAUCION: {
    dot: "bg-caution",
    heading: "text-caution",
    border: "border-caution/40",
    bg: "bg-caution/10",
    badge: "border-caution/40 bg-caution/15 text-caution",
  },
  BLOQUEO: {
    dot: "bg-block",
    heading: "text-block",
    border: "border-block/40",
    bg: "bg-block/10",
    badge: "border-block/40 bg-block/15 text-block",
  },
};

function fmtUsd(n: number) {
  return `$${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}

export function GuardianView({ snapshot }: { snapshot: GuardianSnapshot }) {
  const { semaforo, dailyLoss, consecutiveLosses, positions, services, updatedAt } = snapshot;
  const pctUsed = Math.min(Math.max(dailyLoss.pctUsed, 0), 1);

  const s = semaforoStyles[semaforo.estado];

  return (
    <div className="space-y-8">
      {/* El semáforo es el protagonista: el estado de riesgo manda la vista. */}
      <section>
        <div className={cn("rounded-xl border p-6 sm:p-8", s.border, s.bg)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={cn("inline-flex size-4 shrink-0 rounded-full", s.dot)}
                aria-hidden="true"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Estado de riesgo
                </p>
                <h2 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", s.heading)}>
                  {semaforoLabel[semaforo.estado]}
                </h2>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex h-6 shrink-0 items-center rounded-md border px-2 text-xs font-medium",
                s.badge,
              )}
            >
              Semáforo
            </span>
          </div>
          <ul className="mt-5 space-y-2">
            {semaforo.razones.map((razon, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className={cn("mt-1.5 inline-flex size-1.5 shrink-0 rounded-full", s.dot)} />
                {razon}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <SectionHeading icon={TrendingDown} title="Pérdida diaria" />
          <p className="mt-4 text-2xl font-semibold text-foreground">
            {fmtUsd(dailyLoss.current)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}/ {fmtUsd(dailyLoss.limitUsd)}
            </span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pctUsed >= 1 ? "bg-rose-500" : pctUsed >= 0.7 ? "bg-amber-400" : "bg-emerald-500",
              )}
              style={{ width: `${pctUsed * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Math.round(pctUsed * 100)}% del límite · max({dailyLoss.limitPct}% equity, {fmtUsd(dailyLoss.limitFloorUsd)})
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <SectionHeading icon={Activity} title="Pérdidas consecutivas" />
          <p className="mt-4 text-2xl font-semibold text-foreground">
            {consecutiveLosses.current}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}/ {consecutiveLosses.max}
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Kill-switch a {consecutiveLosses.max} stops seguidos
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <SectionHeading icon={Layers} title="Posiciones" />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Abiertas</span>
              <span className="font-medium text-foreground tabular-nums">
                {positions.open} / {positions.maxPos}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sin stop</span>
              <StatusBadge tone={positions.naked > 0 ? "danger" : "ready"} className="text-[10px]">
                {positions.naked}
              </StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Riesgo abierto</span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  positions.riskPct > positions.riskLimitPct ? "text-destructive" : "text-foreground",
                )}
              >
                {positions.riskPct}% / {positions.riskLimitPct}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading icon={ShieldCheck} title="Servicios de enforcement" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card/50 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex size-2 rounded-full",
                    service.running ? "bg-emerald-500" : "bg-destructive",
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-foreground">{service.name}</span>
              </div>
              <StatusBadge tone={service.running ? "ready" : "danger"} className="text-[10px]">
                {service.running ? "Activo" : "Detenido"}
              </StatusBadge>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-muted-foreground">
        Actualizado: {new Date(updatedAt).toLocaleString("es-CL")} · VQL es interfaz: no ejecuta órdenes ni pone stops.
      </p>
    </div>
  );
}
