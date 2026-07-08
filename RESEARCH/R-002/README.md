# R-002 — Guardian

> **Estado**: Aprobada — pendiente de implementación
> **Inicio**: 2026-07-08 · **Decisión**: 2026-07-08
> **Objetivo**: Definir si VQL debe tener un módulo Guardian y qué debe hacer exactamente, partiendo de los servicios de riesgo que ya operan en el sistema de trading.
>
> **Parámetros**: límite diario = max(10% del equity de apertura del día, $5); kill-switch a 4 pérdidas consecutivas.

## Contexto

El propósito declarado del sistema de trading no es predecir el mercado, es proteger a la operadora de sí misma: win rate ~82% pero operativa sin stop loss, con tendencia a sobre-operar (perseguir enviones, promediar a la baja). Ese es el problema medido de destrucción de capital: entradas rentables convertidas en cuenta perdedora por liquidaciones forzadas.

VQL hoy monitorea (Dashboard, Operations) pero no ataca esa causa. El activo de mayor valor ya producido —el protocolo de riesgo con RISK SCORE, kill-switch y límites de pérdida— vive fuera de la app. R-002 evalúa convertirlo en un módulo de primera clase.

## Hallazgo central

El enforcement de riesgo **ya existe** como servicios `launchd` corriendo 24/7. El Guardian de VQL no debe ser un motor nuevo, sino una capa de **visibilidad y control** sobre ellos, más el cierre del único gap real.

Servicios existentes (en `tradingview-mcp/scripts/`):

1. **`capital_freno.cjs`** (cada 12s) — Espejo anti-sobre-operar. Solo ALERTA (Telegram + sonido), no actúa. Detecta 4 patrones: >`MAX_POS` (2) posiciones, promediar a la baja (2+ longs del mismo epic), riesgo total > `MAX_RISK_PCT` (15%) del balance, instrumento no cubierto (fuera de ETHUSD/BTCUSD).
2. **`capital_stopguard.cjs`** (cada 15s) — Detecta longs sin stop y en `--live` pone stop protector (entrada − 0,6%). Ataca directo el mayor riesgo: quedar sin stop.
3. **`capital_tpguard.cjs`** (cada 15s) — A longs con stop pero sin TP les pone TP = entrada + 2×ATR (piso $5, cubre spread).
4. **`binance_trailing.cjs` / `trailing_exit.sh`** — Trailing de salida.

## Gap identificado

Ningún servicio enforcea **límite de pérdida diaria acumulada** ni **bloqueo por pérdidas consecutivas**. El `freno` mide riesgo abierto como % del balance, no pérdida realizada del día. Estas dos reglas son exactamente las que el protocolo marcó como pendientes de enforcear.

## Decisión (resumen)

Ver `DECISION.md`. El Guardian de VQL = panel de visibilidad + semáforo GO/PRECAUCIÓN/BLOQUEO derivado de los mismos criterios del `freno` + edición de umbrales + cálculo y alerta del gap de pérdida diaria. VQL sigue siendo interfaz: no ejecuta órdenes ni reemplaza el enforcement a nivel bróker.

## Referencias

Ver `SOURCES.md`.
