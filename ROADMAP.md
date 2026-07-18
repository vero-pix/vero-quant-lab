# ROADMAP — Vero Quant Lab

Última actualización: 18 Julio 2026 · estado al día en `HANDOFF_2026-07-18.md`

## Dónde estamos: V1.5 — Cockpit en producción, con data real

Desplegado en https://vql.economics.cl (VPS Hetzner). Cerrados: deploy + dominio, Fase C (estado del VPS real vía `status_server.cjs`), Order Flow, Historial real (myTrades + FIFO), paridad del Checklist A+ con el detector (#39), zonas S/R sobre el Chart, panel de Noticias (RSS) y snapshot A+ a PDF. El cockpit muestra el sistema real de punta a punta. Lo que falta para mejorar el A+ está gated en DATA (30-60 días para recalibrar), no en features.

## Historial: V1.3 — Cockpit tomando forma

El laboratorio ya es un cockpit real, con data en vivo y seguro. El norte es la visión **"Trading Cockpit A+"** (PAICIO): ver todo el trading en una sola pantalla, sin abrir Telegram + TradingView + Binance por separado.

Ciclo de trabajo: investigación → decisión → implementación → medición → nueva investigación.

### Ya construido y en uso
- **Guardian real** (Binance-only): posiciones en vivo, semáforo, equity real, "sin stop" en rojo. Con **keys read-only** (seguridad cerrada).
- **Chart A+** (Lightweight Charts): velas de Binance, EMAs, markers de señal A+, RSI, 1s, checklist estilo TradingView.
- **Simulador A+** (carril 1): sensibilidad de parámetros sobre data real.
- **Vista de Futuros**: distancia a liquidación.
- **Cockpit Fase A**: paneles Estado A+, Zonas S/R, Casi-señales.
- **Identidad "Guardian sereno"** + tema claro/oscuro + colores de datos.
- **Fix anti-spam de Telegram** desplegado en el VPS.

---

## Decisión de hosting (9 Jul 2026)

**VQL corre en el VPS Hetzner, no en Vercel.** Razón: el cockpit va hacia tiempo real (order flow, ticks, WebSockets), y Vercel serverless no sostiene conexiones persistentes. Se accede desde el celular con **Tailscale** (seguro, sin exponer puertos). VQL co-locado con el sistema de trading → la API de estado del VPS queda en `localhost` (Fase C trivial). Regla dura: VQL nunca toca los servicios `vero-*` de trading.

---

## En curso

- **Score A+** (medidor 0-100 + desglose) — el "Centro de Decisiones A+".
- **Deploy de VQL en el VPS + Tailscale** — producción real, accesible desde el celular.

---

## Próximas piezas del cockpit

1. **Fase C — API de estado del VPS**: Operations/Telegram/servicios/feed dejan de ser mock. Trivial ahora (localhost, co-locado).
2. **Heatmap de mercado** (quick win): cajas por moneda, % 24h de Binance.
3. **Order Flow (R-005)**: adaptar OrderFlowMap (licencia MIT, mismo stack Lightweight Charts) + feed de Binance (@depth/@trade). Heatmap de liquidez, DOM, CVD, volume profile, muros.
4. **Simulador A+ carril 2 — espejo conductual**: normalizar el historial real (4.811 ejecuciones) y el contrafactual "¿qué cambiaba con stop / límite diario?".
5. **Noticias / sentimiento** y **copiloto IA** (explica por qué comprar o no).

---

## Academy

Convertir cada regla de oro del A+ en lección interactiva (quiz `docs/filtro-aplus-quiz.md` + simulador + chart embebidos).

---

## Refinamientos (menores)

- Automatizar snapshot de equity de apertura.
- Revisar piso de $5 del límite diario para cuentas chicas.
- Homologar LabService al patrón adapter (diferido).
- Limpiar el bot de Telegram (quitar referencias a Capital).

---

## Criterios

- No se agregan pantallas sin necesidad real ni funciones "por si acaso".
- La app es interfaz/visor, nunca ejecutor. La ejecución vive en los bots del VPS.
- El sistema de trading es sagrado: nada lo desestabiliza.
- Cada fase deja algo usable a diario.
