"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  Brain,
  GraduationCap,
  Library,
  LineChart,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardData, SystemStatusItem } from "@/lib/trading";

export function WorkspaceHome({
  dashboard,
  systemStatus,
}: {
  dashboard?: DashboardData;
  systemStatus?: SystemStatusItem[];
}) {
  const tradingStatus =
    dashboard?.tradingStatus === "active" ? "Active" : "Pending";

  const tradingDescription = dashboard
    ? `${dashboard.signalCount} señales A+, ${dashboard.tradeCount} trades`
    : "Ir al Trading Engine.";

  const workspaceActions = [
    {
      title: "Research",
      description: "Continuar investigaciones y experimentos.",
      icon: Brain,
      status: "Ready" as const,
    },
    {
      title: "Trading",
      description: tradingDescription,
      icon: LineChart,
      status: tradingStatus,
    },
    {
      title: "Academy",
      description: "Continuar escribiendo el curso.",
      icon: GraduationCap,
      status: "Ready" as const,
    },
    {
      title: "Knowledge",
      description: "Documentación y arquitectura.",
      icon: Library,
      status: "Ready" as const,
    },
    {
      title: "AI Copilot",
      description: "Próximamente.",
      icon: Bot,
      status: "Planned" as const,
      disabled: true,
    },
  ];

  const displayStatus = systemStatus ?? [
    { label: "Research", value: "Ready" },
    { label: "Academy", value: "Ready" },
    { label: "Knowledge", value: "Ready" },
    { label: "Trading Engine", value: "Pending Integration" },
    { label: "AI Copilot", value: "Planned" },
  ];

  return (
    <div className="space-y-12 py-4">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl space-y-8"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Buenos días, Verónica</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Bienvenida a Vero Quant Lab
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              ¿Qué quieres hacer hoy?
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {workspaceActions.map((action, index) => {
            const Icon = action.icon;

            return (
              <motion.article
                key={action.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.04 * index, ease: "easeOut" }}
                className={cn(
                  "group rounded-lg border bg-card/80 p-4 transition-colors",
                  action.disabled
                    ? "border-border/70 opacity-70"
                    : "hover:border-primary/40 hover:bg-card",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md border bg-secondary">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {action.status}
                  </span>
                </div>
                <h2 className="mt-5 text-sm font-semibold text-foreground">{action.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18, ease: "easeOut" }}
          className="rounded-lg border bg-card/70 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border bg-secondary">
              <BookOpen className="size-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Trabajo actual</h2>
              <p className="text-sm text-muted-foreground">Workspace preparado</p>
            </div>
          </div>
          <div className="mt-8 max-w-2xl space-y-3">
            <p className="text-base leading-7 text-foreground">
              Sin datos reales todavía.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              El Workspace está preparado para recibir proyectos, investigaciones,
              documentación y módulos de trabajo cuando existan fuentes reales.
            </p>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24, ease: "easeOut" }}
          className="rounded-lg border bg-card/70 p-6"
        >
          <h2 className="text-lg font-semibold text-foreground">Estado del sistema</h2>
          <div className="mt-6 space-y-4">
            {displayStatus.map((item) => (
              <div key={item.label} className="flex items-baseline gap-3 text-sm">
                <span className="shrink-0 text-muted-foreground">{item.label}</span>
                <span className="min-w-6 flex-1 border-b border-dotted border-border" />
                <span className="text-right font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.article>
      </section>
    </div>
  );
}
