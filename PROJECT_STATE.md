# PROJECT_STATE.md

# Vero Quant Lab

Versión objetivo: V1.2

Última actualización: 8 Julio 2026

---

# Misión

Construir una plataforma personal para investigar, operar y aprender trading cuantitativo. VQL no reemplaza a TradingView: es el centro de trabajo diario y, sobre todo, **protege la operativa de la impulsividad** — el problema medido es entradas rentables convertidas en cuenta perdedora por operar sin stop.

---

# Estado actual por módulo

## Dashboard — ✅ Operativo
Estado general, Trading Hoy, actividad, panel Binance, panel Telegram.

## Operations — ✅ Operativo (con matiz)
System Health + servicios. **Hoy corre con datos MOCK del VPS** (no hay API del VPS conectada). El estado de Telegram que muestra NO es real.

## Guardian — ✅ Operativo (Binance-only)
Panel de riesgo sobre el enforcement que ya existe (`freno`/`stopguard`/`tpguard`). Semáforo GO / PRECAUCIÓN / BLOQUEO. Equity real desde Binance (fix del prefijo LD de Earn). Límite diario = max(10% del equity de apertura, $5). Kill-switch a 4 pérdidas consecutivas. Ver R-002.

## Simulador A+ — 🚧 En construcción
Componente interactivo sobre `public/aplus-features.json` (4.899 velas reales). Carril 1: sensibilidad de parámetros (RSI, ER, momentum, volumen). Carril 2 (pendiente): espejo conductual sobre el historial real.

## Research / Knowledge / Academy — ✅ Terminados (V1)
Lectura de Markdown desde `RESEARCH/`, `KNOWLEDGE/`, `ACADEMY/`.

## Settings — ⬜ Shell (placeholder)
Futuro: fuente de umbrales, selección mock/HTTP, config de tema.

---

# Integraciones — real vs mock

| Fuente | Estado | Detalle |
|---|---|---|
| Trading Engine (JSONL) | ✅ Real | Lee `~/Trading` (path corregido). Tolera líneas irregulares. |
| Binance | ✅ Real | Keys en `.env.local`. ⚠️ TEMPORAL: son keys de ejecución — cambiar a read-only. |
| VPS (Operations) | 🟡 Mock | Falta API HTTP del VPS. |
| Telegram | 🟡 Mock | Estado del bot no es real (depende de la API del VPS). |

---

# Arquitectura

Next.js 15 + TypeScript + Tailwind. Server Components por defecto. Patrón único: `lib/<dominio>/{service,adapter,types}`, adapter Mock por defecto y HTTP cuando hay config. La UI nunca accede directo al filesystem ni a APIs externas.

Diseño: identidad "Guardian sereno" (dark) por tokens CSS. Colores de datos estilo Binance: `--up` verde, `--down` rojo, `--signal` oro. Tema claro + toggle: pendiente. Charting elegido (R-001): TradingView Lightweight Charts.

---

# Decisiones clave (sesión 8 Jul 2026)

- **Capital retirado.** Se cierra la operativa manual en Capital.com. El sistema queda Binance-only.
- **Guardian = panel de control** sobre servicios existentes, no motor nuevo (R-002 aprobada).
- **Estabilizar antes que features.** Base consolidada: git, código muerto, design system, path fix.
- **LabService** sigue leyendo `fs` directo — homologar a adapter DIFERIDO conscientemente.
- **Simulador A+** con 2 carriles, reutilizable en Academy.
- **Vercel**: se busca dashboard real (camino B), con prerequisitos primero.

---

# Principios

- No construir funciones innecesarias. Cada módulo resuelve un problema real.
- Toda investigación termina en una decisión.
- Git es la fuente de verdad. La app es interfaz, nunca origen ni ejecutor.
- Primero usar. Después mejorar.

---

# Criterio de éxito

Abro VQL todos los días. Veo el estado del sistema y mi riesgo. Registro investigaciones. Aprendo con el simulador. Tomo mejores decisiones y no me sobre-opero.
