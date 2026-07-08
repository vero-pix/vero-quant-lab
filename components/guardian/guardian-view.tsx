import { Activity, Layers, ShieldCheck, TrendingDown } from "lucide-react";
import { StatusBadge, SectionHeading, type StatusTone } from "@/components/design-system";
import type { GuardianSnapshot, SemaforoEstado } from "@/lib/guardian";
import { cn } from "@/lib/utils";

const semaforoTone: Record<SemaforoEstado, StatusTone> = {
  GO: "ready",
  PRECAUCION: "pending",
  BLOQUEO: "danger",
};

const semaforoLabel: Record<SemaforoEstado, string> = {
  GO: "GO",
  PRECAUCION: "Precaución",
  BLOQUEO: "Bloqueo",
};

const semaforoDot: Record<SemaforoEstado, string> = {
  GO: "bg-emerald-500",
  PRECAUCION: "bg-amber-400",
  BLOQUEO: "bg-rose-500",
};

function fmtUsd(n: number) {
  return `$${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}

export function GuardianView({ snapshot }: { snapshot: GuardianSnapshot }) {
  const { semaforo, dailyLoss, consecutiveLosses, positions, services, updatedAt } = snapshot;
  const pctUsed = Math.min(Math.max(dailyLoss.pctUsed, 0), 1);

  return (
    <div className="space-y-8">
      <section>
        <div
          className={cn(
            "rounded-lg border bg-card p-5",
            semaforo.estado === "BLOQUEO" && "border-rose-500/40",
            semaforo.estado === "PRECAUCION" && "border-amber-400/40",
            semaforo.estado === "GO" && "border-emerald-500/40",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn("inline-flex size-3 rounded-full", semaforoDot[semaforo.estado])}
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold text-foreground">
                {semaforoLabel[semaforo.estado]}
              </h2>
            </div>
            <StatusBadge tone={semaforoTone[semaforo.estado]}>Semáforo</StatusBadge>
          </div>
          <ul className="mt-4 space-y-1.5">
            {semaforo.razones.map((razon, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full bg-muted-foreground" />
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
