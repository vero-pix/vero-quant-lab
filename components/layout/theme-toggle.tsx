"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// Alterna la clase 'dark' en <html> y persiste la preferencia en localStorage.
// Oscuro por defecto: el estado inicial coincide con el SSR (<html class="dark">),
// y un script inline en el layout ya aplicó la preferencia guardada antes de
// pintar, así que no hay flash ni mismatch de hidratación.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage no disponible (modo privado): el toggle igual funciona en sesión.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="flex size-9 items-center justify-center rounded-md border bg-secondary text-muted-foreground transition-colors hover:text-foreground"
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}
