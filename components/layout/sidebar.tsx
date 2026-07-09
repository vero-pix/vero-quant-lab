"use client";

import {
  Activity,
  BookOpen,
  CandlestickChart,
  GraduationCap,
  LayoutDashboard,
  Library,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Operations", href: "/operations", icon: Activity },
  { name: "Guardian", href: "/guardian", icon: ShieldCheck },
  { name: "Simulador", href: "/simulador", icon: SlidersHorizontal },
  { name: "Gráfico", href: "/chart", icon: CandlestickChart },
  { name: "Research", href: "/research", icon: BookOpen },
  { name: "Academy", href: "/academy", icon: GraduationCap },
  { name: "Knowledge", href: "/knowledge", icon: Library },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card lg:block">
      <div className="flex h-full flex-col px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            VQ
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Vero Quant Lab</p>
            <p className="text-xs text-muted-foreground">Studio</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
