import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AppContainerProps = HTMLAttributes<HTMLDivElement>;

export function AppContainer({ className, ...props }: AppContainerProps) {
  return (
    <div
      className={cn("min-h-screen bg-background text-foreground", className)}
      {...props}
    />
  );
}

type ContentContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide" | "narrow";
};

const contentSizes = {
  default: "max-w-7xl",
  wide: "max-w-[1440px]",
  narrow: "max-w-4xl",
};

export function ContentContainer({
  className,
  size = "default",
  ...props
}: ContentContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-5 py-6 sm:px-8", contentSizes[size], className)}
      {...props}
    />
  );
}

type SectionProps = HTMLAttributes<HTMLElement> & {
  spacing?: "default" | "compact" | "loose";
};

const sectionSpacing = {
  default: "space-y-6",
  compact: "space-y-4",
  loose: "space-y-8",
};

export function Section({
  className,
  spacing = "default",
  ...props
}: SectionProps) {
  return <section className={cn(sectionSpacing[spacing], className)} {...props} />;
}

type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
};

type SectionHeadingProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
};

export function SectionHeading({ icon: Icon, title, subtitle }: SectionHeadingProps) {
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

export function PageTitle({ eyebrow, title, description, className }: PageTitleProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <div className="max-w-3xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
