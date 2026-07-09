# NEXT_TASK.md

Última actualización: 9 Julio 2026

---

## En curso

- 🚧 **Deploy de VQL en el VPS Hetzner** (por ssh, sin tocar los `vero-*`): swap 4GB → clonar → `.env.local` read-only → `npm ci` + build acotado → systemd `vero-vql` en puerto 3000.
- 🚧 **Score A+** (medidor 0-100 + desglose) — construyéndose.

## Inmediatas (esta sesión)

1. Terminar el deploy en el VPS y verificar que responde en `:3000` sin afectar los bots.
2. **Tailscale**: instalar en el VPS + celular → acceder a VQL desde cualquier lado, seguro.
3. Verificar Score A+ y el Checklist A+ del chart contra el indicador real de TradingView.

## Después

1. **Fase C — API de estado del VPS** (localhost, co-locado): Operations/Telegram/servicios reales.
2. **Heatmap de mercado** (quick win).
3. **Order Flow (R-005)**: adaptar OrderFlowMap (MIT) + feed Binance.
4. **Simulador A+ carril 2** (espejo conductual) — requiere normalizar el historial.

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
