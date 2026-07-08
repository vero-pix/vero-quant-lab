import { Send, Bot, AlertTriangle, Clock, XCircle } from "lucide-react";
import { StatusBadge, SectionHeading } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { TelegramSnapshot, BotStatus } from "@/lib/telegram";

function botStatusTone(status: BotStatus): "ready" | "danger" | "pending" {
  if (status === "running") return "ready";
  if (status === "error") return "danger";
  return "pending";
}

function botStatusLabel(status: BotStatus): string {
  if (status === "running") return "Activo";
  if (status === "error") return "Error";
  return "Detenido";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit",
  });
}

function agoText(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export function TelegramPanel({ snapshot }: { snapshot: TelegramSnapshot }) {
  return (
    <section className="space-y-5">
      <SectionHeading icon={Send} title="Telegram" subtitle="Alertas, bot y errores" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Estado del bot</p>
          <div className="mt-1 flex justify-center">
            <StatusBadge tone={botStatusTone(snapshot.botStatus)}>
              {botStatusLabel(snapshot.botStatus)}
            </StatusBadge>
          </div>
        </div>
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Alertas recientes</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
            {snapshot.alerts.length}
          </p>
        </div>
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Errores</p>
          <p className={cn("mt-0.5 text-xl font-semibold tabular-nums", snapshot.errors.length > 0 ? "text-destructive" : "text-foreground")}>
            {snapshot.errors.length}
          </p>
        </div>
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Uptime</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
            {snapshot.uptime}
          </p>
        </div>
      </div>

      {snapshot.lastMessage && (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
            <Bot className="size-3.5 text-primary" />
            Último mensaje
          </h3>
          <div className="rounded-lg border bg-card/50 px-4 py-3">
            <p className="text-sm text-foreground">{snapshot.lastMessage}</p>
            {snapshot.lastMessageAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTime(snapshot.lastMessageAt)} ({agoText(snapshot.lastMessageAt)})
              </p>
            )}
          </div>
        </div>
      )}

      {snapshot.alerts.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
            <AlertTriangle className="size-3.5 text-amber-400" />
            Últimas alertas
          </h3>
          <div className="space-y-1">
            {snapshot.alerts.map((a, i) => (
              <div key={`alert-${i}`} className="flex items-start gap-3 rounded-lg border bg-card/50 px-4 py-2 text-sm">
                <span className="w-16 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {formatTime(a.timestamp)}
                </span>
                <span className="min-w-0 flex-1 text-foreground">{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {snapshot.errors.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
            <XCircle className="size-3.5 text-destructive" />
            Errores
          </h3>
          <div className="space-y-1">
            {snapshot.errors.map((e, i) => (
              <div key={`err-${i}`} className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.03] px-4 py-2 text-sm">
                <span className="w-16 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {formatTime(e.timestamp)}
                </span>
                <span className="min-w-0 flex-1 text-foreground">{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3" />
        Datos del VPS
      </div>
    </section>
  );
}
