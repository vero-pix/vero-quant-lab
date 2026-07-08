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

## Estado

Pendiente. Bloqueada por dos inputs: pérdida diaria máxima tolerable (absoluta, $) y umbral de pérdidas consecutivas (N). Definidos esos, pasa a implementación.

## Fecha

2026-07-08
