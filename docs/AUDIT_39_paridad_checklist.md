# Audit #39 — Paridad del Checklist A+ (VQL ↔ TradingView)

> Fecha: 17 Jul 2026 · Alcance: comparar el **Checklist A+** que VQL dibuja junto al Chart contra el indicador Pine de TradingView, en instrumento, timeframe, umbrales y redondeo. Estado: **hallazgo bloqueante interno + pendiente el `.pine` para cerrar.**

## Veredicto ejecutivo

La auditoría no puede cerrarse comparando solo contra TradingView, porque VQL tiene **dos** implementaciones distintas del A+ que **ya divergen entre sí**:

- `lib/aplus/live.ts` — el panel "Estado A+ en vivo" del cockpit. Declara replicar el comando `estado` del bot de Telegram y `scripts/calc_indicators.js` del detector. Es la implementación **autoritativa** (la que refleja lo que el sistema realmente opera).
- `lib/chart/checklist.ts` — el panel "Checklist A+" que se dibuja al lado del Chart. Es el que se supone debe espejar visualmente el indicador de TradingView.

El panel bajo auditoría (`checklist.ts`) **no es fiel ni a la especificación canónica del A+ ni a `live.ts`**. Diverge en al menos siete dimensiones, incluyendo dos filtros ausentes y el timeframe de cálculo. Por tanto, alinear el panel contra el Pine mientras contradice al bot es optimizar la vitrina equivocada: primero debe reflejar lo que el detector hace, después reconciliarse con el Pine.

**Recomendación:** cerrar primero la paridad interna (`checklist.ts` → `live.ts` / spec canónica), luego reconciliar el par ya alineado contra el `.pine`. Fixear el panel contra TradingView antes de eso no mejora la confiabilidad del A+.

## La cadena de verdad (4 capas)

El A+ vive en cuatro implementaciones que deben ser byte-fieles entre sí:

1. **Detector** (`~/Trading/.../calc_indicators.js`, VPS) — ejecuta las órdenes reales. Es la verdad de terreno.
2. **`live.ts`** (cockpit / espejo del bot) — declara ser idéntico a (1).
3. **Indicador Pine** (TradingView) — lo que Vero mira visualmente.
4. **`checklist.ts`** (panel del Chart) — lo que #39 quiere alinear a (3).

La especificación canónica compartida son las 9 condiciones de `docs/filtro-aplus-quiz.md` y `A+_construccion.md`. Cualquier paridad debe medirse contra esa spec, no entre pares arbitrarios.

## Matriz de divergencia — `checklist.ts` vs `live.ts` (autoritativo)

Ambos leen klines públicos de Binance, pero difieren en método antes de llegar a los umbrales:

| # | Dimensión | `live.ts` (autoritativo, espejo del bot) | `checklist.ts` (panel bajo auditoría) | Diverge |
|---|---|---|---|---|
| M1 | Timeframe de cálculo | Fijo **1m** + contexto 5m, siempre | El **timeframe seleccionado** en el chart (15m por defecto; puede ser 1s/1m/5m/15m/1h) + contexto 5m | **Sí** — crítico |
| M2 | Vela evaluada | Solo velas **cerradas** (`slice(0,-1)`); `price` = vela en formación aparte | Incluye la **vela en formación** (usa `last()` sobre toda la serie) | **Sí** — crítico |
| F1 | Mercado vivo (liquidez) | Paso 1, **gate**: `volabs ≥ 50` | **Ausente** | **Sí** — filtro faltante |
| F2 | ER 1m | `ER ≥ 0.30` sobre 1m cerrado | `ER ≥ 0.30` pero sobre el tf seleccionado; **etiqueta "Tendencia 1m" es incorrecta cuando tf≠1m** | Umbral igual, base y label mal |
| F3 | ER 5m | `ER ≥ 0.25` sobre 5m | `ER ≥ 0.25` sobre 5m | No |
| F4 | EMA9 > EMA21 | Igual | Igual | No |
| F5 | Pullback + rebote | **Un** paso combinado: `pull ≤ 0.5×ATR` **Y** `mom5 ≥ 0.6×ATR` **Y** `mom2 ≥ 1.0` | **Dos** filas separadas: pullback y mom5. **`mom2 ≥ 1.0` ausente** | **Sí** — condición faltante + conteo distinto |
| F6 | RSI en banda | `50–70` | `50–70` | No |
| F7 | Volumen del rebote | `volr ≥ 1.0`, denominador = **promedio de TODAS las velas cerradas** | `volr ≥ 1.0`, denominador = **SMA(20)** del volumen | Umbral igual, denominador distinto |
| F8 | Precio > VWAP | **VWAP de sesión anclado a 00:00 UTC** (fetch aparte) | **VWAP acumulativo anclado al inicio de la ventana** de 300 velas | **Sí** — ancla distinta |
| F9 | Distancia a resistencia | Nivel de **`zonas.env`** más cercano arriba; `dist ≥ $3 USD` | **Pivote de máximo local** (±3 velas) del propio klines; `dist ≥ 0.3%` | **Sí** — fuente y umbral distintos |

Consecuencia práctica: el conteo "X / 9" del panel del Chart **no es comparable** con el veredicto del cockpit ni del bot. Con tf por defecto 15m, el panel evalúa un instrumento temporal distinto al que opera el sistema (scalping 1m).

## Riesgos de divergencia vs el indicador Pine (a confirmar con el `.pine`)

No tengo el source Pine en el repo VQL (`KNOWLEDGE/Pine.md` y `KNOWLEDGE/TradingView.md` son solo glosario). Vive en el repo Trading (`~/Trading/tradingview-mcp/scripts/`) o en TradingView. Para cerrar #39 hay que confirmar, filtro por filtro, contra ese source. Puntos donde Pine y VQL suelen divergir:

- **Suavizado Wilder vs SMA.** `ta.rsi` y `ta.atr` de Pine usan RMA (Wilder). VQL usa Wilder en RSI y ATR (bien), pero el ER de Kaufman y el VolR son medias simples: confirmar que el Pine calcula ER y VolR con la misma ventana y el mismo tipo de media.
- **Ancla del VWAP.** `ta.vwap` de Pine ancla por sesión (reset diario en la zona horaria del símbolo/chart, no necesariamente 00:00 UTC). `live.ts` ancla a 00:00 **UTC**; `checklist.ts` ancla a la ventana. Los tres pueden dar VWAP distinto en la misma vela. Confirmar zona horaria del reset en el Pine.
- **Precio típico del VWAP.** VQL usa HLC3 `(H+L+C)/3`. Pine `ta.vwap` por defecto usa `hlc3` también, pero es parametrizable — confirmar.
- **Vela en formación (`barstate.isconfirmed`).** Si el Pine evalúa `barstate.isconfirmed` (vela cerrada), coincide con `live.ts` y **no** con `checklist.ts`. Confirmar.
- **Resistencia.** ¿El Pine dibuja S/R desde niveles fijos (equivalente a `zonas.env`, como `live.ts`) o desde pivotes calculados (como `checklist.ts`)? Y ¿umbral en $ o en %? Esta es la divergencia más grande a resolver.
- **Redondeo y locale.** VQL formatea con `es-CL` (coma decimal) y redondeos por filtro (RSI a 0 decimales, resto a 2). Es solo presentación, pero si se compara el *display* contra el Pine, alinear decimales por métrica.

## Qué necesito para cerrar #39

1. **El source `.pine`** del indicador A+ (o export del script). Está fuera del repo VQL — probablemente en `~/Trading/tradingview-mcp/scripts/`. Sin él, la comparación contra TradingView queda como matriz de riesgos, no como verificación.
2. Confirmar cuál es la **referencia de verdad** para el panel del Chart: el detector `calc_indicators.js` (lo que se opera) o el Pine (lo que se mira). Deberían coincidir; si no, ese es un hallazgo aparte para el Agente Trading.

## Plan recomendado

- **Paso 1 — Paridad interna (VQL, sin bloqueos).** Alinear `checklist.ts` a `live.ts`: fijar cálculo a 1m sobre velas cerradas, agregar el gate de liquidez (F1) y la condición `mom2 ≥ 1.0` (F5), unificar denominador de VolR (F7), ancla de VWAP (F8) y fuente/umbral de resistencia desde `zonas.env` (F9). Reutilizar la lógica de `live.ts` en vez de duplicar reduce el riesgo de que vuelvan a divergir.
- **Paso 2 — Reconciliación con el Pine (requiere `.pine`).** Con el par ya alineado, comparar contra el source Pine punto por punto usando la matriz de riesgos de arriba; documentar cada diferencia real y decidir cuál manda.
- **Paso 3 — Verificación.** Correr ambos evaluadores sobre la misma vela cerrada y confirmar veredicto idéntico (mismo instrumento, minuto, umbrales); dejar el caso de prueba registrado.

> Regla que se mantiene: VQL es visor. Este audit y cualquier alineación tocan solo `lib/chart/*` de VQL; nunca el detector ni los `vero-*`.
