# Notas de investigación — R-002 Guardian

## Pregunta

¿Debe VQL tener un módulo Guardian? Si sí, ¿qué hace exactamente, y qué NO hace?

## Lo que ya existe (enforcement real, corriendo 24/7)

Los servicios leen posiciones vía `capital_client.cjs` (Capital.com) y actúan/alertan. Datos y umbrales relevantes:

| Servicio | Frecuencia | Qué hace | Umbrales (env) |
|---|---|---|---|
| `capital_freno.cjs` | 12s | Solo alerta sobre 4 patrones de sobre-operar | `MAX_POS=2`, `MAX_RISK_PCT=15`, `COVERED=ETHUSD,BTCUSD` |
| `capital_stopguard.cjs` | 15s | Pone stop protector a longs desnudos (`--live`) | `STOPGUARD_PCT=0.6` |
| `capital_tpguard.cjs` | 15s | Pone TP = entrada + 2×ATR a longs con stop sin TP | `TP_ATR=2`, `TP_USD_MIN=5` |

Los 4 patrones del `freno` (su matemática, ya calibrada al historial):
1. Demasiadas posiciones — el modelo dice UNA entrada A+; cada extra es sobre-operar.
2. Promediar a la baja — 2+ longs encimados del mismo epic. Sin stop, doblar es riesgo ciego.
3. Riesgo total > umbral — suma de (entrada − stop) × size sobre el balance.
4. Instrumento no cubierto — sin señal, sin backtest, sin zonas.

Observación clave: el `freno` re-alerta solo cuando la situación CAMBIA o EMPEORA (firma `lastKey`). El Guardian de VQL puede reusar esa misma lógica de estado para no ser ruidoso.

## Lo que NO existe (el gap)

- **Límite de pérdida diaria acumulada**: no hay bloqueo cuando la pérdida realizada del día cruza un umbral absoluto.
- **Bloqueo por pérdidas consecutivas**: no hay kill-switch tras N stops seguidos.

Ambas son reglas del protocolo aún no operacionalizadas. El dato para calcularlas ya existe: `diario_trades.jsonl` (net por trade) y `senales_aplus.jsonl` (resultado: stop/tp por señal).

## Inputs pendientes (bloquean el enforcement fino)

Del protocolo, siguen sin definir tres inputs. Algunos ya están parametrizados en el `freno`:

- Equity actual de la cuenta — el `freno` lo lee en vivo del balance de Capital.
- Pérdida diaria máxima tolerable (absoluta, en $) — **pendiente**.
- Apalancamiento máximo por producto — **pendiente**.

## Fuentes de datos para el módulo (solo lectura)

- Posiciones vivas: `capital_client.cjs` (o su equivalente HTTP en el VPS).
- Log del freno: `/tmp/vero_freno.log` (VQL ya tiene `lib/logs`).
- Trades cerrados: `diario_trades.jsonl` (nota: la primera línea trae un `1` pegado antes del JSON; el parser debe tolerarlo).
- Señales: `senales_aplus.jsonl` (trae `sl`, `tp`, `resultado`, `pnl`).
- Reporte diario: `reporte_diario.jsonl` (`{fecha, n, wr, net}`).

## Tensiones a resolver

- **VQL es interfaz, nunca origen ni ejecutor.** El Guardian no debe abrir/cerrar posiciones ni poner stops: eso lo hacen los servicios. VQL muestra, calcula el semáforo y alerta.
- **Enforcement real vs cálculo/alerta.** El bloqueo duro de pérdida diaria solo es garantizable a nivel bróker o servicio `launchd`. VQL puede calcular y gritar el número, pero el bloqueo efectivo es fase posterior (o un nuevo servicio gemelo del `freno`).
- **No duplicar lógica.** Los umbrales viven hoy en los plist (env). Si VQL permite editarlos, la fuente de verdad de esos valores debe quedar clara para no divergir.
