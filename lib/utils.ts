import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pnlClass(value: number): string {
  if (value > 0) return "text-primary";
  if (value < 0) return "text-destructive";
  return "text-foreground";
}

export function pnlText(value: number): string {
  return `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;
}
