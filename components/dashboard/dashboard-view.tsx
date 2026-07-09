import { Activity, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { StatusBadge, SectionHeading } from "@/components/design-system";
import { AplusLivePanel } from "@/components/dashboard/aplus-live-panel";
import { SenalVivaPanel } from "@/components/dashboard/senal-viva-panel";
import { ZonasPanel } from "@/components/dashboard/zonas-panel";
import { CasiPanel } from "@/components/dashboard/casi-panel";
import type { EngineStatus, DailyStats, SignalAplus, Trade, ActivityEntry } from "@/lib/trading";
import { cn, pnlClass, pnlText } from "@/lib/utils";

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

function MetricCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-xl font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function getNextAction(
  engineStatus: EngineStatus | null,
  dailyStats: DailyStats | null,
  lastSignal: SignalAplus | null,
  lastTrade: Trade | null,
): { label: string; description: string } {
  if (!engineStatus) {
    return { label: "Sin datos del sistema", description: "No se puede determinar el estado del laboratorio." };
  }

  const offline = engineStatus.components.find((c) => c.status === "offline");
  if (offline) {
    return { label: `Revisar ${offline.name}`, description: `Componente desconectado: ${offline.name}.` };
  }

  if (lastTrade && dailyStats && dailyStats.tradeCount > 0) {
    return { label: `Revisar operación ${lastTrade.sym}`, description: `Trade ${lastTrade.dir}. P&L: ${pnlText(lastTrade.net ?? 0)}` };
  }

  if (lastSignal) {
    return { label: `Monitorear señal ${lastSignal.symbol}`, description: `Señal A+ @ $${lastSignal.entry.toFixed(0)}` };
  }

  return { label: "No existen tareas pendientes", description: "Todo está al día." };
}

function DashboardView({
  engineStatus,
  dailyStats,
  activityFeed,
  lastSignal,
  lastTrade,
  tradingStatus,
}: {
  engineStatus: EngineStatus | null;
  dailyStats: DailyStats | null;
  activityFeed: ActivityEntry[];
  lastSignal: SignalAplus | null;
  lastTrade: Trade | null;
  tradingStatus: "active" | "inactive" | "error";
}) {
  const vps = engineStatus?.components.find((c) => c.name === "VPS") ?? null;
  const binance = engineStatus?.components.find((c) => c.name === "Binance") ?? null;
  const telegram = engineStatus?.components.find((c) => c.name === "Telegram") ?? null;

  const tradingEngineStatus: "online" | "offline" | "unknown" =
    tradingStatus === "active" ? "online"
    : tradingStatus === "error" ? "offline"
    : "offline";

  const displayComponents = [
    { key: "VPS", name: "VPS", status: vps?.status ?? "unknown", detail: vps?.detail ?? "—" },
    { key: "Engine", name: "Trading Engine", status: tradingEngineStatus, detail: tradingStatus === "active" ? "Activo" : "Inactivo" },
    { key: "Binance", name: "Binance", status: binance?.status ?? "unknown", detail: binance?.detail ?? "—" },
    { key: "Telegram", name: "Telegram", status: telegram?.status ?? "unknown", detail: telegram?.detail ?? "—" },
  ];

  const allComponents = engineStatus?.components ?? [];
  const offlineComponents = allComponents.filter((c) => c.status === "offline");
  const unknownComponents = allComponents.filter((c) => c.status === "unknown");

  let hoursSinceLastSignal: number | null = null;
  if (lastSignal) {
    hoursSinceLastSignal = (Date.now() - new Date(lastSignal.fecha).getTime()) / 3600000;
  }

  const engineOffline = displayComponents.find((c) => c.status === "offline");
  const engineUnknown = displayComponents.find((c) => c.status === "unknown");
  const hasCriticalAlert = offlineComponents.length > 0 || engineOffline !== undefined;
  const hasWarningAlert = unknownComponents.length > 0 || engineUnknown !== undefined || (hoursSinceLastSignal !== null && hoursSinceLastSignal > 24);
  const hasAlerts = hasCriticalAlert || hasWarningAlert;

  const nextAction = getNextAction(engineStatus, dailyStats, lastSignal, lastTrade);

  return (
    <div className="space-y-6">
      <section>
        <SectionHeading icon={Activity} title="Estado General" subtitle="¿El sistema está funcionando?" />
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {displayComponents.map((c) => (
            <span key={c.key} className="flex items-center gap-1.5 text-sm">
              <Dot status={c.status} />
              <span className="font-medium text-foreground">{c.name}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">{c.detail}</span>
            </span>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            Última actualización: {engineStatus?.lastUpdate ?? "—"}
          </span>
        </div>
      </section>

      <SenalVivaPanel />

      <AplusLivePanel />

      <ZonasPanel />

      <CasiPanel />

      <section>
        <SectionHeading icon={TrendingUp} title="Trading Hoy" subtitle="¿Qué pasó hoy?" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="P&L del día"
            value={dailyStats ? pnlText(dailyStats.net) : "—"}
            className={dailyStats ? pnlClass(dailyStats.net) : "text-foreground"}
          />
          <MetricCard label="Trades ejecutados" value={dailyStats?.tradeCount ?? "—"} />
          <MetricCard label="Win Rate" value={dailyStats ? `${dailyStats.winRate}%` : "—"} />
          <MetricCard label="Señales recibidas" value={dailyStats?.signalCount ?? "—"} />
        </div>
        {lastSignal && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3">
            <span
              className={cn(
                "inline-flex size-1.5 rounded-full shrink-0",
                lastSignal.resultado === "target" ? "bg-primary" : "bg-destructive",
              )}
            />
            <span className="text-xs text-muted-foreground">Última señal:</span>
            <span className="text-sm font-medium text-foreground">{lastSignal.symbol}</span>
            <span className="text-xs text-muted-foreground">@ ${lastSignal.entry.toFixed(0)}</span>
            <StatusBadge tone={lastSignal.resultado === "target" ? "ready" : "danger"} className="text-[10px]">
              {lastSignal.resultado}
            </StatusBadge>
            <span className={cn("ml-auto tabular-nums text-sm", pnlClass(lastSignal.pnl))}>{pnlText(lastSignal.pnl)}</span>
          </div>
        )}
      </section>

      <section>
        <SectionHeading icon={Activity} title="Actividad Reciente" subtitle="Últimos 5 eventos" />
        <div className="mt-4 space-y-2">
          {activityFeed.length > 0 ? (
            activityFeed.map((entry, i) => (
              <div
                key={`act-${i}`}
                className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-2.5 text-sm"
              >
                <span
                  className={cn(
                    "inline-flex size-1.5 rounded-full shrink-0",
                    entry.type === "señal" && (entry.result === "target" ? "bg-primary" : "bg-destructive"),
                    entry.type === "trade" && ((entry.pnl ?? 0) >= 0 ? "bg-primary" : "bg-destructive"),
                    entry.type === "reporte" && "bg-muted-foreground",
                  )}
                />
                <span className="w-20 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {formatTime(entry.ts)}
                </span>
                <span className="min-w-0 flex-1 truncate text-foreground">{entry.description}</span>
                {entry.pnl !== null && (
                  <span className={cn("tabular-nums text-sm", pnlClass(entry.pnl))}>{pnlText(entry.pnl)}</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
          )}
        </div>
      </section>

      <section>
        <SectionHeading
          icon={AlertTriangle}
          title="Alertas"
          subtitle={hasAlerts ? "Requiere atención" : "Todo en orden"}
        />
        <div className="mt-4">
          {hasCriticalAlert ? (
            <div className="space-y-2">
              {offlineComponents.map((c) => (
                <div key={c.name} className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.03] px-4 py-3">
                  <AlertTriangle className="size-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name} desconectado</p>
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                </div>
              ))}
              {tradingStatus !== "active" && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.03] px-4 py-3">
                  <AlertTriangle className="size-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Trading Engine inactivo</p>
                    <p className="text-xs text-muted-foreground">No hay actividad de trading reciente.</p>
                  </div>
                </div>
              )}
            </div>
          ) : hasWarningAlert ? (
            <div className="space-y-2">
              {unknownComponents.map((c) => (
                <div key={c.name} className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3">
                  <AlertTriangle className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name} sin datos</p>
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                </div>
              ))}
              {hoursSinceLastSignal !== null && hoursSinceLastSignal > 24 && lastSignal && (
                <div className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3">
                  <AlertTriangle className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sin señales hace 24 horas</p>
                    <p className="text-xs text-muted-foreground">Última señal: {formatTime(lastSignal.fecha)}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">Sistema funcionando correctamente</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeading icon={ArrowRight} title="Próxima Acción" subtitle="¿Qué debo hacer ahora?" />
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-5">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-primary/10">
              <ArrowRight className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">{nextAction.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{nextAction.description}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { DashboardView };
