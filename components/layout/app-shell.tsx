"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { VersionBadge } from "@/components/version-badge";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  // En /orderflow el globo tapa el heatmap en móvil → no lo renderizamos ahí.
  const hideVersionBadge = pathname?.startsWith("/orderflow");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8"
        >
          {children}
        </motion.main>
      </div>
      {!hideVersionBadge && <VersionBadge />}
    </div>
  );
}
