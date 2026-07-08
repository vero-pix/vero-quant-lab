import { Activity, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/design-system";
import type { EngineStatus, ActivityEntry, AlertEntry, DailyStats } from "@/lib/trading";
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

function pnlClass(v: number): string {
  if (v > 0) return "text-primary";
  if (v < 0) return "text-destructive";
  return "text-foreground";
}

function pnlText(v: number): string {
  return `${v >= 0 ? "+" : ""}$${v.toFixed(2)}`;
}

function SectionHeading({ icon: Icon, title }: { icon: typeof Activity; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function severityBadge(s: string) {
  if (s === "critical") return <StatusBadge tone="danger">Crítica</StatusBadge>;
  if (s === "warning") return <StatusBadge tone="pending">Advertencia</StatusBadge>;
  return <StatusBadge tone="neutral">Info</StatusBadge>;
}

function OperationsView({
  engineStatus,
  activityFeed,
  alerts,
  dailyStats,
}: {
  engineStatus: EngineStatus | null;
  activityFeed: ActivityEntry[];
  alerts: AlertEntry[];
  dailyStats: DailyStats | null;
}) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHeading icon={Activity} title="Estado de servicios" />
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {engineStatus?.components.map((c) => (
            <div key={c.name} className="rounded-lg border bg-card/50 px-3 py-2.5 text-center">
              <div className="flex justify-center">
                <Dot status={c.status} />
              </div>
              <p className="mt-1 text-xs font-medium text-foreground">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {c.status === "online" ? "Online" : c.status === "offline" ? "Offline" : "—"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Última actualización: {engineStatus?.lastUpdate ?? "—"}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <SectionHeading icon={TrendingUp} title="Actividad reciente" />
          <div className="mt-3 space-y-1">
            {activityFeed.length > 0 ? (
              activityFeed.map((entry, i) => (
                <div
                  key={`act-${i}`}
                  className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-2 text-sm"
                >
                  <span
                    className={cn(
                      "inline-flex size-1.5 rounded-full shrink-0",
                      entry.type === "señal" && "bg-primary",
                      entry.type === "trade" && (entry.pnl ?? 0) >= 0 ? "bg-primary" : "bg-destructive",
                      entry.type === "reporte" && "bg-muted-foreground",
                    )}
                  />
                  <span className="w-24 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {entry.ts.length > 16
                      ? new Date(entry.ts).toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
                      : entry.ts.slice(0, 16)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground">{entry.description}</span>
                  {entry.result ? (
                    <StatusBadge
                      tone={entry.result === "target" || entry.result === "ganancia" ? "ready" : "danger"}
                      className="text-[10px]"
                    >
                      {entry.result}
                    </StatusBadge>
                  ) : null}
                  {entry.pnl !== null ? (
                    <span className={cn("w-16 text-right tabular-nums text-sm", pnlClass(entry.pnl))}>
                      {pnlText(entry.pnl)}
                    </span>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin actividad registrada.</p>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {activityFeed.length > 0
              ? `Mostrando ${activityFeed.length} eventos recientes`
              : "No hay datos disponibles"}
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">Alertas</h2>
          </div>
          <div className="mt-3 space-y-2">
            {alerts.length > 0 ? (
              alerts.slice(0, 10).map((alert, i) => (
                <div
                  key={`alert-${i}`}
                  className="rounded-lg border bg-card/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {alert.severity === "critical" ? (
                      <AlertTriangle className="size-3 text-destructive" />
                    ) : (
                      <Info className="size-3 text-muted-foreground" />
                    )}
                    {severityBadge(alert.severity)}
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {new Date(alert.ts).toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{alert.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin alertas registradas.</p>
            )}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Señales A+</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {engineStatus ? String(activityFeed.filter((e) => e.type === "señal").length) : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Trades hoy</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {dailyStats ? String(dailyStats.tradeCount) : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {dailyStats ? `${dailyStats.winRate}%` : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">P&L Hoy</p>
          <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", dailyStats ? pnlClass(dailyStats.net) : "text-foreground")}>
            {dailyStats ? pnlText(dailyStats.net) : "—"}
          </p>
        </div>
      </section>
    </div>
  );
}

export { OperationsView };
