import type { ReactNode } from "react";
import { Clock, Inbox } from "lucide-react";

import { EmptyStateCard } from "@/components/design-system/cards";
import { StatusBadge } from "@/components/design-system/status";
import { cn } from "@/lib/utils";

type ComingSoonProps = {
  title?: string;
  description?: ReactNode;
  className?: string;
};

export function ComingSoon({
  title = "Coming soon",
  description = "Esta funcionalidad esta planificada y se implementara cuando exista una SPEC aprobada.",
  className,
}: ComingSoonProps) {
  return (
    <div className={cn("rounded-lg border bg-card/70 p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md border bg-secondary">
            <Clock className="size-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <StatusBadge tone="planned">Planned</StatusBadge>
      </div>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <EmptyStateCard
      title={title}
      description={description}
      icon={Inbox}
      className={className}
    />
  );
}
