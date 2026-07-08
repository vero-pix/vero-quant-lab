import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { StatusBadge, type StatusTone } from "@/components/design-system/status";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  subtle?: boolean;
};

export function Card({ className, subtle = false, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-5",
        subtle ? "bg-card/70" : "bg-card",
        className,
      )}
      {...props}
    />
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  className?: string;
};

export function MetricCard({ label, value, detail, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      {detail ? <p className="mt-2 text-xs text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}

type ActionCardProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  status?: string;
  statusTone?: StatusTone;
  disabled?: boolean;
  className?: string;
};

export function ActionCard({
  title,
  description,
  icon: Icon,
  status,
  statusTone = "neutral",
  disabled = false,
  className,
}: ActionCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        disabled ? "opacity-70" : "hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {Icon ? (
          <div className="flex size-9 items-center justify-center rounded-md border bg-secondary">
            <Icon className="size-4 text-primary" aria-hidden="true" />
          </div>
        ) : null}
        {status ? <StatusBadge tone={statusTone}>{status}</StatusBadge> : null}
      </div>
      <h3 className="mt-5 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </Card>
  );
}

type EmptyStateCardProps = {
  title: string;
  description: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyStateCard({
  title,
  description,
  icon: Icon,
  className,
}: EmptyStateCardProps) {
  return (
    <Card subtle className={cn("p-6 sm:p-8", className)}>
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="flex size-10 items-center justify-center rounded-md border bg-secondary">
            <Icon className="size-4 text-primary" aria-hidden="true" />
          </div>
        ) : null}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Sin datos reales todavia</p>
        </div>
      </div>
      <div className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </div>
    </Card>
  );
}

type StatusCardProps = {
  title: string;
  items: Array<{
    label: string;
    value: string;
    tone?: StatusTone;
  }>;
  className?: string;
};

export function StatusCard({ title, items, className }: StatusCardProps) {
  return (
    <Card subtle className={className}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline gap-3 text-sm">
            <span className="shrink-0 text-muted-foreground">{item.label}</span>
            <span className="min-w-6 flex-1 border-b border-dotted border-border" />
            <StatusBadge tone={item.tone ?? "neutral"}>{item.value}</StatusBadge>
          </div>
        ))}
      </div>
    </Card>
  );
}
