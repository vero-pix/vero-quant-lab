import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type StatusTone = "ready" | "pending" | "planned" | "neutral" | "danger";

const statusToneStyles: Record<StatusTone, string> = {
  ready: "border-primary/30 bg-primary/10 text-primary",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  planned: "border-accent/30 bg-accent/10 text-accent",
  neutral: "border-border bg-secondary text-muted-foreground",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

const statusDotStyles: Record<StatusTone, string> = {
  ready: "bg-primary",
  pending: "bg-amber-300",
  planned: "bg-accent",
  neutral: "bg-muted-foreground",
  danger: "bg-destructive",
};

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function StatusBadge({
  className,
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
        statusToneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}

type StatusDotProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function StatusDot({ className, tone = "neutral", ...props }: StatusDotProps) {
  return (
    <span
      className={cn("inline-flex size-2 rounded-full", statusDotStyles[tone], className)}
      aria-hidden="true"
      {...props}
    />
  );
}
