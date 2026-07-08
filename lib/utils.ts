import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pnlClass(value: number | null | undefined): string {
  if (value == null) return "text-foreground";
  if (value > 0) return "text-primary";
  if (value < 0) return "text-destructive";
  return "text-foreground";
}

export function pnlText(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;
}
