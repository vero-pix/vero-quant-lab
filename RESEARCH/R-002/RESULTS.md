# Resultados — R-002 Guardian

## Qué encontramos

1. **El enforcement de riesgo ya está construido y operando.** `freno` (alerta 4 patrones), `stopguard` (stop automático a longs desnudos), `tpguard` (TP automático), `trailing` (salida). El Guardian no necesita reimplementar nada de esto.

2. **Existe un gap concreto:** no hay límite de pérdida diaria acumulada ni bloqueo por pérdidas consecutivas. Son las dos reglas del protocolo aún sin operacionalizar. El dato para calcularlas ya está en los JSONL.

3. **El dato de stop-loss ya fluye en origen.** `senales_aplus.jsonl` trae `sl`/`tp` por señal; las posiciones vivas exponen `stopLevel`/`limitLevel`. El Guardian puede mostrar en tiempo real cuántas posiciones están desnudas — la métrica exacta de la causa de destrucción de capital.

4. **Los umbrales ya están parametrizados** en los plist (`MAX_POS=2`, `MAX_RISK_PCT=15`, `STOPGUARD_PCT=0.6`, `TP_ATR=2`). Falta solo pérdida diaria máxima y apalancamiento por producto.

## Qué debe ser el Guardian (alcance V1)

Un módulo de VQL con tres capas, todas de solo lectura sobre el sistema:

1. **Estado de protección en vivo** — posiciones abiertas, cuántas desnudas (sin stop), riesgo abierto como % del balance, y si `freno`/`stopguard`/`tpguard` están corriendo. Es la vista que ninguna pantalla actual da consolidada.

2. **Semáforo GO / PRECAUCIÓN / BLOQUEO** — derivado de los mismos criterios del `freno` (posiciones, promediar, riesgo %) más el conteo de desnudas y el gap de pérdida diaria. No es enforcement nuevo: es la lectura consolidada del estado que ya calculan los servicios, más el número que falta.

3. **Umbrales editables + log de alertas** — ver/ajustar los umbrales y leer `/tmp/vero_freno.log` desde la app (VQL ya tiene `lib/logs`).

## Qué NO debe hacer el Guardian (límites duros)

- No abre, cierra ni promedia posiciones.
- No pone stops ni TPs (eso lo hacen stopguard/tpguard).
- No es la fuente de verdad de los umbrales si eso divide la configuración con los plist.
- El bloqueo efectivo de pérdida diaria (kill-switch real) queda fuera de V1: VQL calcula y alerta; el enforcement duro es un servicio gemelo del `freno` o configuración a nivel bróker, en fase posterior.

## Arquitectura propuesta (a validar en implementación)

- `lib/guardian/{types,adapter,service}.ts`, mismo patrón Mock/HTTP que el resto.
- `MockGuardianAdapter` (datos de ejemplo) + `HttpGuardianAdapter` (lee VPS/logs/JSONL).
- Ruta `/guardian`, entrada en el sidebar.
- Consume: posiciones (Capital vía VPS), `diario_trades.jsonl`, `reporte_diario.jsonl`, `/tmp/vero_freno.log`.

## Pendiente antes de implementar

- Definir pérdida diaria máxima tolerable (absoluta, $) y umbral de pérdidas consecutivas (N).
- Confirmar cómo VQL lee el estado del VPS en producción (mock vs HTTP) — hoy los adapters ya contemplan ambos.
- Decidir fuente de verdad única de umbrales (plist vs Guardian) para no divergir.
