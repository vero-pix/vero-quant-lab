import { Activity, Coins, Gauge, Layers, ShieldCheck, ShieldAlert, TrendingDown } from "lucide-react";
import { StatusBadge, SectionHeading } from "@/components/design-system";
import type { GuardianSnapshot, SemaforoEstado } from "@/lib/guardian";
import type { FuturesPosition } from "@/lib/futures";
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

// Color de la distancia a liquidación: verde >25%, ámbar 10-25%, rojo <10%.
function liqTone(distPct: number): { text: string; bar: string; border: string; bg: string; label: string } {
  if (distPct < 10) return { text: "text-block", bar: "bg-block", border: "border-block/40", bg: "bg-block/5", label: "crítica" };
  if (distPct < 25) return { text: "text-caution", bar: "bg-caution", border: "border-caution/30", bg: "bg-card/50", label: "ajustada" };
  return { text: "text-go", bar: "bg-go", border: "border-border", bg: "bg-card/50", label: "holgada" };
}

function FuturesRow({ f }: { f: FuturesPosition }) {
  const tone = liqTone(f.distToLiqPct);
  const distClamped = Math.min(Math.max(f.distToLiqPct, 0), 100);
  const pnlPos = f.uPnlUsd >= 0;
  return (
    <div className={cn("rounded-lg border p-4", tone.border, tone.bg)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{f.symbol}</span>
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold",
              f.side === "LONG" ? "bg-go/15 text-go" : "bg-block/15 text-block",
            )}
          >
            {f.side} {f.leverage}x
          </span>
          {f.hasStop ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-go">
              <ShieldCheck className="size-3" /> stop
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldAlert className="size-3" /> sin stop
            </span>
          )}
        </div>
        <span className={cn("text-sm font-semibold tabular-nums", pnlPos ? "text-go" : "text-block")}>
          {pnlPos ? "+" : ""}{fmtUsd(f.uPnlUsd)} ({pnlPos ? "+" : ""}{f.uPnlPct}%)
        </span>
      </div>

      {/* Métrica principal: distancia a liquidación */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Distancia a liquidación</span>
          <span className={cn("font-semibold tabular-nums", tone.text)}>{f.distToLiqPct}% · {tone.label}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full transition-all", tone.bar)} style={{ width: `${distClamped}%` }} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        <Metric label="Entrada" value={fmtUsd(f.entryPx)} />
        <Metric label="Marca" value={fmtUsd(f.markPx)} />
        <Metric label="Liquidación" value={f.liqPx > 0 ? fmtUsd(f.liqPx) : "—"} valueClass={tone.text} />
        <Metric label="Margen" value={fmtUsd(f.marginUsd)} />
        <Metric label="Nocional" value={fmtUsd(f.notionalUsd)} />
      </div>
    </div>
  );
}

function Metric({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums text-foreground", valueClass)}>{value}</span>
    </div>
  );
}

export function GuardianView({ snapshot }: { snapshot: GuardianSnapshot }) {
  const { semaforo, dailyLoss, consecutiveLosses, positions, holdings, futures, services, updatedAt } = snapshot;
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
        <SectionHeading icon={Coins} title="Posiciones en vivo (Binance)" subtitle="Holdings cripto > $1 y su estado de stop" />
        {holdings.length === 0 ? (
          <div className="mt-3 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
            Sin posiciones cripto abiertas. Solo stablecoins / efectivo.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {holdings.map((h) => (
              <div
                key={h.asset}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
                  h.naked ? "border-block/40 bg-block/5" : "bg-card/50",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground tabular-nums">{h.asset}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {h.qty.toLocaleString("es-CL", { maximumFractionDigits: 6 })}
                  </span>
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {fmtUsd(h.valueUsd)}
                  </span>
                  {h.hasTp ? (
                    <span className="hidden text-[11px] text-muted-foreground sm:inline">· con TP</span>
                  ) : null}
                </div>
                {h.naked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-block/40 bg-block/15 px-2 py-1 text-xs font-semibold text-block">
                    <ShieldAlert className="size-3.5" />
                    SIN STOP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-go/40 bg-go/15 px-2 py-1 text-xs font-medium text-go">
                    <ShieldCheck className="size-3.5" />
                    Protegida
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading icon={Gauge} title="Futuros (apalancados)" subtitle="Informativo · la distancia a liquidación manda" />
        {futures.length === 0 ? (
          <div className="mt-3 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
            Sin posiciones de futuros.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {futures.map((f) => (
              <FuturesRow key={`${f.symbol}-${f.side}`} f={f} />
            ))}
          </div>
        )}
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
