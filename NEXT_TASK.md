# NEXT_TASK.md

Última actualización: 18 Julio 2026

---

> Estado al día en `HANDOFF_2026-07-18.md`. Deploy, Fase C, Order Flow, #39, noticias y snapshot A+ ya cerrados.

## Inmediata

1. **Push + redeploy** de los últimos commits (features #28/#29) al VPS: `git push origin main` en el Mac → `git pull && npm run build && systemctl restart vero-vql` en el VPS. Solo `vero-vql`.

## Después (sin urgencia)

1. **Limpieza del bot Telegram** (Trading-side): quitar comando `posicion` (Capital, muerto) y la ruta de ejecución por Capital. Prompt listo.
2. **Heatmap de mercado** (quick win): cajas por moneda, % 24h de Binance.
3. **Simulador A+ carril 2** (espejo conductual) — requiere normalizar el historial (B-03) primero.

## Gated en data (el norte)

- **Mejorar el A+**: correr la sesión de calibración (R-006, barrido + walk-forward) cuando el historial acumule ≥30 días (hoy ~15). Nunca recalibrar a mano.

---

## Regla

La app es visor, nunca ejecutor. El sistema de trading (`vero-*` en el VPS) es sagrado: VQL nunca lo toca. Cada integración reemplaza mock.

---

## Investigaciones

- **R-001 TradingView** — Cerrada. Decisión: Lightweight Charts.
- **R-002 Guardian** — Implementada (Binance-only). Límite diario max(10%, $5), kill-switch 4 consecutivas.
- **R-003 Backtesting / Simulador** — Activa.
- **R-005 Order Flow** — Abierta. Base: OrderFlowMap (MIT) + Binance.

---

## Hecho reciente (9 Jul 2026)

Guardian real + keys read-only (seguridad cerrada) · Chart A+ (Lightweight Charts, 1s, checklist) · Score A+ · Futuros · tema claro/oscuro · cockpit Fase A (Estado/Zonas/Casi) · Fase C VPS API (código listo, deploy pendiente) · fix anti-spam Telegram desplegado al VPS.

## Contexto

PAICIO es un proyecto aparte (juego de economía). La visión "Trading Cockpit A+" es el norte de VQL.
