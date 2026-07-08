# Decisión

## Problema

Definir si VQL incorpora un módulo Guardian y con qué alcance, sin duplicar el enforcement de riesgo que ya opera en el sistema de trading ni convertir la app en ejecutor de órdenes.

## Alternativas

1. **No hacer módulo.** Dejar el riesgo solo en los servicios `launchd` y el protocolo en `.md`. Costo: la operadora no tiene visibilidad consolidada del estado de protección ni se cierra el gap de pérdida diaria.
2. **Guardian como motor de enforcement nuevo en VQL.** VQL calcula riesgo y actúa (pone stops, bloquea). Costo: duplica lógica existente, viola el principio "la app es interfaz, nunca origen", y mete a VQL a ejecutar acciones de trading.
3. **Guardian como capa de visibilidad y control sobre el enforcement existente + cierre del gap por cálculo/alerta.** VQL muestra el estado de protección, deriva un semáforo con la misma lógica del `freno`, permite ajustar umbrales y calcula/alerta la pérdida diaria. No ejecuta órdenes.

## Decisión

**Opción 3 — Guardian como capa de visibilidad y control.**

## Justificación

1. **Reusa lo que ya funciona.** `freno`, `stopguard` y `tpguard` ya enforcean; el Guardian los hace visibles y auditables desde un solo lugar, en vez de reimplementarlos.
2. **Ataca la causa medida.** Mostrar en vivo cuántas posiciones están sin stop es la métrica exacta de la destrucción de capital histórica. Ninguna pantalla actual la da.
3. **Cierra el único gap real** (pérdida diaria acumulada y pérdidas consecutivas) con el dato que ya existe en los JSONL, sin inventar reglas genéricas.
4. **Respeta los principios del proyecto.** VQL sigue siendo interfaz: no abre, cierra ni promedia; no pone stops. El enforcement duro permanece en los servicios.
5. **Es incremental.** V1 del Guardian es lectura + semáforo + alerta. El bloqueo efectivo de pérdida diaria (servicio gemelo del `freno` o config a nivel bróker) queda como fase posterior, con decisión propia.

## Riesgo mitigado

- **Divergencia de umbrales**: si el Guardian edita umbrales que hoy viven en los plist, se define una única fuente de verdad antes de implementar (no dos configuraciones que se contradigan).
- **Falsa sensación de bloqueo**: el semáforo BLOQUEO de V1 alerta pero no impide clicks en Capital. Debe comunicarse como señal, no como candado, hasta que exista el enforcement gemelo.

## Parámetros definidos (2026-07-08)

- **Límite de pérdida diaria**: `max(10% del equity de apertura del día, $5)`. El baseline es el valor de la cuenta al abrir la jornada, fijo durante el día (no se recalcula con cada trade). Piso de $5 (mismo patrón que el TP mínimo del `tpguard`).
- **Bloqueo por pérdidas consecutivas**: 4 stops seguidos gatillan el kill-switch.

Observación registrada: en cuentas chicas el piso de $5 domina y eleva el % efectivo del límite (ej. equity $17 → 10% = $1,70, pero aplica $5 ≈ 29%). En ese régimen el 10% deja de proteger. Revisar bajar/escalar el piso si la cuenta opera en montos pequeños.

## Addendum — Binance-only (2026-07-08)

Capital.com quedó **retirado** de la operación. El Guardian pasa a ser **Binance-only**:

- **Equity de apertura del día**: se calcula desde el balance de Binance valorizado a USD (USDT/USDC = 1; ETH/BTC con los precios `{ASSET}USDT` del snapshot). Baseline fijo del día, persistido en un archivo local de VQL (`.guardian-state.json`), **nunca** en `~/Trading`.
- **Pérdida diaria y pérdidas consecutivas**: se derivan de `diario_trades_binance.jsonl` (cerrados = filas con `net` o `closeT`+`exitPx`). Ganancia deja `dailyLoss` en 0.
- **Posiciones**: abiertas = filas sin `closeT`; desnudas = abiertas sin `sl`; riesgo abierto = `Σ|entryPx − sl|·size / equity`.
- **Estado de servicios**: se reportan los guardianes **de Binance** (`binanceguard`, `binancetrailing`) vía `MonitoringService`, no los de Capital.

Nota de data actual: hoy hay poca data Binance (**1 posición abierta con stop, 0 cerrados**), así que las métricas de pérdida parten en **0** y el semáforo arranca en **GO**. VQL sigue siendo interfaz: no ejecuta órdenes ni escribe en `~/Trading`.

## Estado

Aprobada. Parámetros definidos. En implementación: `lib/guardian/*` con adapter real Binance + ruta `/guardian`.

## Fecha

2026-07-08
