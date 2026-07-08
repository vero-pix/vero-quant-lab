import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

const baseButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

export function PrimaryButton({ className, icon, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        baseButtonClass,
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function SecondaryButton({ className, icon, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        baseButtonClass,
        "border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
