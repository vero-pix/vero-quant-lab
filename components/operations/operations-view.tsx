import { Activity, AlertTriangle, Bell, Info, TrendingUp } from "lucide-react";
import { StatusBadge, SectionHeading } from "@/components/design-system";
import { SystemHealthCard } from "@/components/operations/system-health-card";
import { ServiceRow } from "@/components/operations/service-row";
import type { EngineStatus, ActivityEntry, AlertEntry, DailyStats } from "@/lib/trading";
import type { SystemHealthData, ServiceInfo } from "@/lib/monitoring";
import type { LogEntry } from "@/lib/logs";
import { cn, pnlClass, pnlText } from "@/lib/utils";

function severityBadge(s: string) {
  if (s === "critical") return <StatusBadge tone="danger">Crítica</StatusBadge>;
  if (s === "warning") return <StatusBadge tone="pending">Advertencia</StatusBadge>;
  return <StatusBadge tone="neutral">Info</StatusBadge>;
}

function levelDot(level: LogEntry["level"]) {
  const colors = {
    info: "bg-muted-foreground",
    success: "bg-emerald-500",
    warning: "bg-amber-400",
    error: "bg-destructive",
    critical: "bg-rose-500",
  };
  return <span className={cn("inline-flex size-1.5 rounded-full shrink-0", colors[level])} />;
}

function sourceLabel(source: LogEntry["source"]) {
  const labels: Record<LogEntry["source"], string> = {
    engine: "Engine",
    binance: "Binance",
    telegram: "Telegram",
    system: "Sistema",
    vps: "VPS",
  };
  return labels[source];
}

function OperationsView({
  engineStatus,
  activityFeed,
  alerts,
  dailyStats,
  systemHealth,
  services,
  logEntries,
}: {
  engineStatus: EngineStatus | null;
  activityFeed: ActivityEntry[];
  alerts: AlertEntry[];
  dailyStats: DailyStats | null;
  systemHealth: SystemHealthData;
  services: ServiceInfo[];
  logEntries: LogEntry[];
}) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHeading icon={Activity} title="System Health" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {systemHealth.components.map((c) => (
            <SystemHealthCard key={c.id} name={c.name} status={c.status} detail={c.detail} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>Heartbeat: {systemHealth.heartbeat}</span>
          <span>Actualizado: {systemHealth.updatedAt}</span>
        </div>
      </section>

      <section>
        <SectionHeading icon={TrendingUp} title="Services" />
        <div className="mt-3 space-y-2">
          {services.map((s) => (
            <ServiceRow key={s.id} {...s} />
          ))}
        </div>
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

      <section>
        <SectionHeading icon={Bell} title="Logs del sistema" />
        <div className="mt-3 space-y-1">
          {logEntries.length > 0 ? (
            logEntries.slice(0, 25).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border bg-card/50 px-4 py-2 text-sm"
              >
                <span className="mt-1.5 shrink-0">{levelDot(entry.level)}</span>
                <span className="w-14 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {new Date(entry.ts).toLocaleString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="w-16 shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {sourceLabel(entry.source)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground">{entry.message}</p>
                  {entry.detail && (
                    <p className="truncate text-xs text-muted-foreground">{entry.detail}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin registros.</p>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {logEntries.length > 0
            ? `Mostrando las últimas ${Math.min(logEntries.length, 25)} entradas`
            : "No hay datos disponibles"}
        </p>
      </section>
    </div>
  );
}

export { OperationsView };
