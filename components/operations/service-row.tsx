import { StatusBadge, type StatusTone } from "@/components/design-system";
import type { ServiceInfo } from "@/lib/monitoring";
import { cn } from "@/lib/utils";

const toneMap: Record<ServiceInfo["status"], StatusTone> = {
  running: "ready",
  restarting: "pending",
  stopped: "danger",
};

const statusLabel: Record<ServiceInfo["status"], string> = {
  running: "Running",
  restarting: "Restarting",
  stopped: "Stopped",
};

const dotClass: Record<ServiceInfo["status"], string> = {
  running: "bg-primary",
  restarting: "bg-amber-300",
  stopped: "bg-destructive",
};

export function ServiceRow({ name, status, uptime, lastRestart }: ServiceInfo) {
  return (
    <div className="rounded-lg border bg-card/50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("inline-flex size-2 shrink-0 rounded-full", dotClass[status])} aria-hidden="true" />
          <span className="truncate text-sm font-medium text-foreground">{name}</span>
        </div>
        <StatusBadge tone={toneMap[status]} className="shrink-0 text-[10px]">
          {statusLabel[status]}
        </StatusBadge>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
        <span className="tabular-nums">{uptime}</span>
        <span>Restart: {lastRestart}</span>
      </div>
    </div>
  );
}
