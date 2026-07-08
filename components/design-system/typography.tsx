import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextProps<T extends HTMLElement> = HTMLAttributes<T>;

export function DisplayTitle({ className, ...props }: TextProps<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("text-3xl font-semibold tracking-normal text-foreground sm:text-5xl", className)}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: TextProps<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold tracking-normal text-foreground", className)}
      {...props}
    />
  );
}

export function Caption({ className, ...props }: TextProps<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
