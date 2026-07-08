# NEXT_TASK.md

Última actualización: 8 Julio 2026

---

## En curso

- 🚧 **Simulador A+ (carril 1)** — componente interactivo sobre `public/aplus-features.json`. Sliders de parámetros, simulación 2×ATR, métricas en vivo (señales/día, WR, PF, neto), curva de equity, y línea de narrativa que enseña. Reutilizable en Academy.

## Próximas prioridades

1. **Simulador A+ carril 2 — espejo conductual.** Normalizar el historial real (4.811 ejecuciones, multi-instrumento) en un dataset limpio y construir el simulador contrafactual: WR por condición, seguidillas, "¿qué habría cambiado con stop / con el límite diario?".
2. **Seguridad: keys Binance read-only.** Reemplazar las keys de ejecución temporales en `.env.local`.
3. **Tema claro + toggle.** Definir set de tokens claro; dashboard oscuro, Academy clara.
4. **Vercel (camino B).** Requiere keys read-only + protección con password + decidir cómo la app hosteada lee la data real (API HTTP del VPS).

---

## Regla

Cada integración reemplaza datos mock. Nunca agregar pantallas sin necesidad real. La app es interfaz, nunca ejecutor.

---

## Investigaciones

- **R-001 TradingView** — Cerrada. Decisión: Lightweight Charts.
- **R-002 Guardian** — Aprobada e implementada (Binance-only). Parámetros: límite diario max(10%, $5), kill-switch 4 consecutivas.
- **R-003 Backtesting / Simulador** — Activa. El motor del sweep alimenta el simulador; el historial real alimenta el carril conductual.

---

## Historial de tasks (sesión 8 Jul 2026)

- Estabilización: asegurar git, código muerto, unificar design system, centralizar helpers, dedupe SectionHeading, barrels (LabService diferido).
- Fix ruta de datos `~/Trading` + pnl null-safe.
- R-002 Guardian: investigación → scaffold (mock) → HttpAdapter Binance real.
- Diseño: identidad "Guardian sereno" + tokens de datos Binance.
- Fix equity: normalizar assets Earn (prefijo LD).
- Binance real conectado (keys temporales de ejecución).
- Simulador A+: `features.json` (4.899 velas) generado; componente en construcción.
- Capital retirado. Historial completo analizado (89% sin stop; WR swing > scalping).

## Tasks previas (V1)

TASK-011 Knowledge · TASK-012 Academy · TASK-013 Trading Engine · TASK-014 VPS · TASK-015 Binance · TASK-016 Telegram.
