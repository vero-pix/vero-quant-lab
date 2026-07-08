import { StatusBadge, type StatusTone } from "@/components/design-system";
import type { HealthStatus } from "@/lib/monitoring";
import { cn } from "@/lib/utils";

const toneMap: Record<HealthStatus, StatusTone> = {
  online: "ready",
  warning: "pending",
  offline: "danger",
};

const labelMap: Record<HealthStatus, string> = {
  online: "Online",
  warning: "Warning",
  offline: "Offline",
};

const dotMap: Record<HealthStatus, string> = {
  online: "bg-primary",
  warning: "bg-amber-300",
  offline: "bg-destructive",
};

export function SystemHealthCard({
  name,
  status,
  detail,
}: {
  name: string;
  status: HealthStatus;
  detail: string;
}) {
  return (
    <div className="rounded-lg border bg-card/50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex size-2 rounded-full", dotMap[status])} aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">{name}</span>
        </div>
        <StatusBadge tone={toneMap[status]} className="text-[10px]">
          {labelMap[status]}
        </StatusBadge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
