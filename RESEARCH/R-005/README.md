# R-005 — Order Flow (heatmap tipo Bookmap)

> **Estado**: Investigada — lista para implementar
> **Fecha**: 9 jul 2026
> **Objetivo**: Traer un heatmap de liquidez tipo Bookmap (order flow) a VQL, con la menor construcción desde cero posible.

## Hallazgo central

**OrderFlowMap** (github.com/Azhagesan-dev/OrderFlowMap) es **directamente adaptable**:

- **Licencia MIT** → se puede reusar y adaptar legalmente (solo mantener el aviso de copyright).
- **Mismo stack que VQL**: construido sobre **Lightweight Charts** (la decisión de R-001). Encaja natural.
- Trae listo (la parte difícil): heatmap de profundidad, detección de **muros de liquidez**, **burbujas de trades**, **DOM ladder**, **tape**, **CVD**, **volume profile**, **VWAP**, stats de microestructura.

## El punto de enchufe (lo único que cambia)

Todo el renderizado es genérico. La fuente de datos vive en **una sola función**: `connectLive()` (~línea 1035) y su handler `market_data` (~1127). Hoy habla con OpenAlgo (mercados de India). Se reemplaza por un adaptador de **Binance**.

Modelo de datos que hay que llenar (no cambia):
- `depth.push({ time, bids:[{p, q, o}], asks:[{p, q, o}] })` — snapshot del libro por instante.
- `trades[] = { time, price, qty, side }` — cada trade.

## Adaptador de Binance (simple y del lado del navegador)

Binance da streams públicos por WebSocket, **sin key**, y el navegador se conecta **directo** (funciona en el celular, sin pasar por el VPS):

1. **Libro de órdenes** → `wss://stream.binance.com:9443/ws/<symbol>@depth20@100ms`
   Entrega snapshots del top-20 cada 100 ms: `{ bids:[[precio,cantidad],...], asks:[...] }`.
   Mapeo: cada `[p,q]` → `{p:Number(p), q:Number(q), o:1}` (Binance no da conteo de órdenes; `o` es opcional). Push a `depth[]`. **Más simple que OpenAlgo** — es snapshot, no hay que mantener el libro con diffs.
2. **Trades** → `wss://stream.binance.com:9443/ws/<symbol>@aggTrade`
   `{ p:precio, q:cantidad, m:isBuyerMaker }`. Lado: `m ? 'sell' : 'buy'`. Push a `trades[]`.
   **Ventaja sobre OpenAlgo**: trades reales, no inferidos por delta de volumen.

Con eso, todo el heatmap/CVD/volume-profile funciona con data real de Binance.

## Integración en VQL

- Portar el núcleo (los "primitives" de Lightweight Charts + el adaptador Binance) a un componente cliente `components/orderflow/order-flow.tsx`, reusando la misma librería que ya usa el Chart A+.
- Página `/orderflow` (o pestaña dentro del Chart). Corre 100% en el navegador con el WebSocket de Binance → no necesita el VPS.
- Selectores de símbolo/tick reusan los del Chart A+.
- Mantener el `LICENSE` de OrderFlowMap (MIT) y el crédito.

## Esfuerzo

Medio. El renderizado (lo caro) viene hecho. El trabajo es: (1) escribir el adaptador Binance (~1 función + 2 WebSockets), (2) portar el HTML/JS single-file a un componente React, (3) estilo con tokens de VQL. Días, no semanas.

## Los otros repos que pasaste

- **awesome-institutional-trading**: índice de recursos (order flow, microestructura, gamma). Para leer/investigar, no código a reusar.
- **Linus-Indicator-Collection**: indicadores en Pine Script (TradingView). No reusables directo en web, pero **referencia de fórmulas** (CVD, VWAP, Volume Profile, Footprint) si implementamos las nuestras.

## Decisión

Adaptar **OrderFlowMap (MIT)** con adaptador de Binance, integrado como componente de VQL. No construir el heatmap desde cero. Secuencia: después del Chart A+ (Fase B, ya hecho) y las piezas del cockpit en curso.
