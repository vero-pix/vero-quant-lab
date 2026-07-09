# BACKLOG — Vero Quant Lab

Ideas y tareas parqueadas. El plan agendado vive en `ROADMAP.md`; esto es la lista cruda. Última actualización: 9 Julio 2026.

---

## Tareas pendientes (accionables)

| # | Tarea | Prioridad | Nota |
|---|---|---|---|
| B-05 | Fase C — API de estado del VPS (deploy) | 🟠 Media | Código listo. Trivial ahora: VQL co-locado en el VPS → localhost, sin exponer puerto. Activa Operations/Telegram/servicios reales. |
| B-10 | Tailscale (VPS + celular) | 🟠 Media | Acceso remoto seguro a VQL, sin puertos públicos. |
| B-11 | Heatmap de mercado | 🟠 Media | Quick win: cajas por moneda, % 24h de Binance. |
| B-12 | Order Flow / Bookmap (R-005) | 🟠 Media | Adaptar OrderFlowMap (MIT, mismo stack Lightweight Charts) + feed Binance @depth/@trade. Heatmap, DOM, CVD, volume profile, muros. |
| B-02 | Simulador A+ carril 2 (espejo conductual) | 🟠 Media | Requiere normalizar el historial primero. |
| B-03 | Normalizar historial de trades en dataset limpio | 🟠 Media | 4.811 ejecuciones, multi-instrumento, monedas mezcladas. Insumo del carril 2. |
| B-06 | Limpiar bot Telegram (quitar Capital) | 🟡 Baja | Aún referencia `capital_client` y el comando `posicion`. |
| B-13 | Noticias / sentimiento + copiloto IA | 🟡 Baja | APIs de noticias + LLM que explique comprar/no. |
| B-14 | VPS de trading como checkout git | 🟡 Baja | Hoy se despliega por scp; dejarlo como `git pull`. |
| B-08 | Automatizar snapshot de equity de apertura | 🟢 Menor | Hoy captura al primer load del día. |
| B-09 | Homologar LabService al patrón adapter | 🟢 Menor | Diferido conscientemente. |

## Completadas
B-01 keys read-only ✓ · B-04 tema claro/oscuro ✓ · Chart A+ (Fase B) ✓ · Futuros ✓ · Cockpit Fase A ✓ · fix anti-spam Telegram ✓.

---

## Ideas (sin comprometer)

- **P&L real normalizado** desde Binance `myTrades` (costo promedio → PnL flotante + WR/rachas reales por instrumento).
- **Insight del historial** para Academy: sin stop 62% WR vs con stop 51% — el stop baja el WR pero corta la cola que liquida.
- **WR por instrumento**: swing (Plata 79%, JPY 75%, Oro 68%) supera al scalping (ETH 60%).
- **Más de Binance**: order book/depth, 24h stats, funding/open interest (sentimiento), Power BI (conectores ya disponibles).
- **Identidad PAICIO** para VQL (nombre/logo del "Trading Cockpit A+").

---

## Decisiones registradas

- Capital retirado (8 Jul). Sistema Binance-only.
- Guardian = panel de control sobre enforcement existente (R-002).
- Charting: Lightweight Charts (R-001).
- **Hosting: VQL en el VPS + Tailscale, no Vercel** (tiempo real necesita servidor persistente). 9 Jul.
- El sistema de trading (`vero-*`) es sagrado: VQL nunca lo toca.
- PAICIO (juego de economía) es un proyecto aparte de VQL.
