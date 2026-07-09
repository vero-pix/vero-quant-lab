import { Activity, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border bg-secondary">
            <Activity className="size-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Vero Quant Lab Studio</p>
            <p className="truncate text-xs text-muted-foreground">Research operating system</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center gap-2 rounded-md border bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
