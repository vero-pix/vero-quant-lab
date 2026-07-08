import { Activity, ArrowRight, Crosshair, FlaskConical, LineChart, Target, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/design-system";
import type { EngineStatus, DailyStats, SignalAplus, Trade } from "@/lib/trading";
import type { LabStatus, NextAction } from "@/lib/lab";
import { cn } from "@/lib/utils";

function Dot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-2.5 rounded-full shrink-0",
        status === "online" && "bg-primary",
        status === "offline" && "bg-destructive",
        status === "unknown" && "bg-muted-foreground",
      )}
      aria-hidden="true"
    />
  );
}

function pnlClass(value: number): string {
  if (value > 0) return "text-primary";
  if (value < 0) return "text-destructive";
  return "text-foreground";
}

function pnlText(value: number): string {
  return `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;
}

function SectionHeading({ icon: Icon, title, subtitle }: { icon: typeof Activity; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-md border bg-secondary">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function DashboardView({
  engineStatus,
  dailyStats,
  recentSignals,
  recentTrades,
  labStatus,
  nextAction,
}: {
  engineStatus: EngineStatus | null;
  dailyStats: DailyStats | null;
  recentSignals: SignalAplus[];
  recentTrades: Trade[];
  labStatus: LabStatus | null;
  nextAction: NextAction | null;
}) {
  const hasResearch = labStatus?.activeResearch !== null;

  return (
    <div className="space-y-8">
      <section>
        <SectionHeading icon={Activity} title="Estado del sistema" subtitle="¿Está funcionando mi sistema?" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {engineStatus?.components.map((c) => (
            <div key={c.name} className="rounded-lg border bg-card/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Dot status={c.status} />
                <span className="text-sm font-medium text-foreground">{c.name}</span>
              </div>
              <p className="mt-1.5 truncate text-xs text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Última actualización: {engineStatus?.lastUpdate ?? "—"}
        </p>
      </section>

      <section>
        <SectionHeading icon={LineChart} title="Actividad de trading" subtitle="¿Cómo va mi trading hoy?" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div className="rounded-lg border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Target className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Últimas señales</p>
            </div>
            <div className="mt-3 space-y-1.5">
              {recentSignals.length > 0 ? (
                recentSignals.slice(0, 5).map((s, i) => (
                  <div key={`sig-${i}`} className="flex items-center gap-2 text-sm">
                    <span className={cn("inline-flex size-1.5 rounded-full", s.resultado === "target" ? "bg-primary" : "bg-destructive")} />
                    <span className="w-16 text-foreground">{s.symbol}</span>
                    <span className="w-14 text-right text-muted-foreground tabular-nums">${s.entry.toFixed(0)}</span>
                    <StatusBadge tone={s.resultado === "target" ? "ready" : "danger"} className="text-[10px]">
                      {s.resultado}
                    </StatusBadge>
                    <span className={cn("ml-auto tabular-nums", pnlClass(s.pnl))}>{pnlText(s.pnl)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin señales registradas.</p>
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Últimos trades</p>
            </div>
            <div className="mt-3 space-y-1.5">
              {recentTrades.length > 0 ? (
                recentTrades.slice(0, 5).map((t, i) => (
                  <div key={`tr-${i}`} className="flex items-center gap-2 text-sm">
                    <span className={cn("inline-flex size-1.5 rounded-full", (t.net ?? 0) >= 0 ? "bg-primary" : "bg-destructive")} />
                    <span className="w-12 text-foreground">{t.sym}</span>
                    <span className="text-muted-foreground">{t.dir}</span>
                    <span className={cn("ml-auto tabular-nums", pnlClass(t.net ?? 0))}>{pnlText(t.net ?? 0)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin trades hoy.</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="mt-0.5 text-xl font-semibold text-foreground">
                {dailyStats ? `${dailyStats.winRate}%` : "—"}
              </p>
            </div>
            <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">P&L Hoy</p>
              <p className={cn("mt-0.5 text-xl font-semibold tabular-nums", dailyStats ? pnlClass(dailyStats.net) : "text-foreground")}>
                {dailyStats ? pnlText(dailyStats.net) : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading icon={FlaskConical} title="Investigación" subtitle="¿Qué estoy investigando?" />
        <div className="mt-4 rounded-lg border bg-card/50 p-5">
          {hasResearch ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {labStatus!.activeResearch!.id}: {labStatus!.activeResearch!.title}
                  </p>
                  <StatusBadge tone="ready">{labStatus!.activeResearch!.status}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Progreso: {labStatus!.activeResearch!.progress}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{labStatus!.researchCount} investigación(es) total(es)</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay investigaciones activas.</p>
          )}
        </div>
      </section>

      <section>
        <SectionHeading icon={Crosshair} title="Próxima acción" subtitle="¿Qué debería hacer ahora?" />
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-5">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-primary/10">
              <ArrowRight className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">
                {nextAction?.label ?? "Sin tareas pendientes"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {nextAction?.description ?? "Todo está al día."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { DashboardView };
