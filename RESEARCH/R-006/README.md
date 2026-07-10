# R-006 — Recalibrar el A+ para la economía de Binance

> **Estado**: ✅ Ejecutada — modelo de costo corregido y sweep re-corrido
> **Fecha**: 9 jul 2026 · **Ejecutada**: 10 jul 2026
> **Objetivo**: El sweep del A+ está calibrado con el modelo de costos de Capital. Corregirlo al de Binance (donde ahora opera Vero) y re-calibrar sobre esa economía real.

## El problema

`backtest_aplus_sweep.cjs`, línea 98, calcula el resultado de cada trade así:

```
trades.push((out - entry) - SPREAD)
```

`SPREAD` es un valor **fijo en dólares**: $1,75 en ETH, $50 en BTC — el spread de **Capital.com** (CFD). Toda la calibración vigente (RSI 50-70, ER, mom5, "target mínimo $5", "no entrar a menos de $3 de resistencia") está optimizada para ese costo. Pero Vero ya no opera en Capital: opera en **Binance**, donde el costo es otro.

## Corrección honesta (importante — antes dije lo contrario)

Dije "Binance es mucho más barato, BTC se vuelve viable". **Al hacer la cuenta, no es tan simple.** El costo de Capital es un *spread fijo en dólares*; el de Binance es una *comisión porcentual*. Comparando en % del nocional (ida y vuelta):

| | Costo round-trip | % del nocional |
|---|---|---|
| Capital ETH (~$1.750) | $3,50 fijo | ~0,20% |
| Capital BTC (~$62.000) | $50 fijo | ~0,08% |
| Binance taker (sin BNB) | 0,10%/lado | ~0,20% |
| Binance taker + BNB | 0,075%/lado | ~0,15% |
| Binance maker y/o VIP | menor | ~0,15% o menos |

Conclusión honesta:
- **ETH**: costo **similar** (empate en taker; algo más barato con BNB/maker).
- **BTC**: en % de comisión pura (0,20%), Binance es **más caro** que el spread de Capital (0,08%) — salvo que Vero use descuentos (BNB/maker/VIP). O sea, **BTC no "se vuelve viable" por defecto**; puede seguir marginal o incluso peor. Solo el backtest con el fee real lo dirá.
- El componente donde Binance sí gana claro: el **spread real** de Binance es ~1 tick ($0,01 en ETH) vs el spread ancho de Capital. En Capital todo el costo era spread; en Binance el spread es casi cero y el costo es la comisión.

Moraleja: la recalibración es **necesaria por precisión** (la calibración actual está optimizada para el costo equivocado), no porque garantice más edge. El resultado depende del **fee efectivo real de Vero**.

## Método

1. **Dato duro primero — el fee efectivo de Vero en Binance.** Depende de: taker vs maker, si tiene el descuento **BNB** activo, y su **tier VIP**. Medirlo, no asumirlo. (Default conservador: taker 0,10%/lado.)
2. **Cambiar el modelo de costo del sweep.** Reemplazar el `- SPREAD` fijo por comisión porcentual + spread real:
   ```
   const feeRT = feeRate * (entry + out);   // comisión en entrada y salida
   const realSpread = TICK;                 // spread real de Binance (~1 tick)
   trades.push((out - entry) - feeRT - realSpread);
   ```
   Parametrizar `feeRate` por flag (`--fee 0.001`), y correr varios escenarios (taker sin BNB, taker con BNB, maker) para ver la sensibilidad.
3. **Re-correr el sweep** sobre datos recientes de Binance (ETH y BTC).
4. **Re-testear BTC** con el fee real — pregunta abierta, sin asumir.
5. **Walk-forward**: calibrar en la ventana vieja, validar en la nueva (el sweep ya tiene `--end-hours-ago` para esto). Una calibración solo vale si sobrevive fuera de muestra.

## Resultados (10 jul 2026)

**Cambio aplicado** en `backtest_aplus_sweep.cjs` (sin tocar señales ni grilla):
el `- SPREAD` fijo se reemplazó por `FEE*(entry+out) + TICK`. Flags nuevos:
`--fee` (default `0.001` = 0,1% taker), `--tick` (default $0,01 ETH / $0,1 BTC).
`--spread` queda como fallback al modelo viejo de Capital. El log ahora muestra
el fee, no "Spread $X".

**Nota metodológica.** Con la ventana default (5000 velas ≈ 3,5 días) **ningún**
escenario produce combos — ni siquiera el control con `--spread` (modelo Capital).
La muestra es demasiado corta/choppy. Los números de abajo usan **20.000 velas
(~14 días)**. Con `--min-pf 1.0` (default) **solo ETH+BNB pasa**; para inspeccionar
los que no llegan a PF 1 se bajó el umbral de *display* a `--min-pf 0` (no cambia
lógica ni grilla, solo qué se imprime).

| Escenario | Comando | Mejor PF | WR | neto/u | n | ¿Edge? |
|---|---|---|---|---|---|---|
| ETH taker 0,1% | `--symbol ETHUSDT --fee 0.001` | 0,90 | 42% | −$2,0 | 12 | ❌ ninguno ≥ PF 1 |
| ETH + BNB 0,075% | `--symbol ETHUSDT --fee 0.00075` | **1,57** | 67% | **+$8,4** | 12 | ✅ único con edge |
| BTC taker 0,1% | `--symbol BTCUSDT --fee 0.001` | 0,55 | 62% | −$262,5 | 13 | ❌ muy negativo |
| Walk-forward ETH+BNB | `--fee 0.00075 --end-hours-ago 72` | **2,28** | 79% | **+$19,9** | 14 | ✅ sobrevive fuera de muestra |

(Todas con `--bars 20000`. Top combos ETH+BNB: reciente `er1 0.30 · er5 0.25 ·
rsi 40-68 · mom5 0.3 · trend 0.1 · volr 0.8`; walk-forward `er1 0.34 · er5 0.25 ·
rsi 40-74 · mom5 0.3 · volr 1.0`.)

### Lo que dicen los números

- **ETH es marginal y está dominado por el fee.** El *mismo* combo pasa de
  **−$2,0 (taker 0,1%)** a **+$8,4 (BNB 0,075%)**: el descuento BNB de 0,025%/lado
  es literalmente la diferencia entre perder y ganar. El edge bruto del setup es
  tan chico que el costo se lo come.
- **BTC no se enciende.** WR 62% pero PF 0,55 y −$262/u: la comisión de 0,1% sobre
  ~$62k de nocional ($124 ida y vuelta) más el stop 2×ATR entierran el resultado.
  Confirma la duda honesta de arriba: BTC **no "se vuelve viable" por defecto**.
- **Walk-forward positivo para ETH+BNB** (PF 2,28 fuera de muestra), pero el combo
  óptimo se corre entre ventanas y `n` es chico (12-16 trades): robusto en signo,
  no tanto en los umbrales exactos.

## Decisión (tomada)

- **Activar el descuento BNB en Binance es la prioridad #1.** Es el factor que
  convierte el A+ de ETH de perdedor a ganador. Sin BNB (taker puro), ETH no tiene
  edge en esta ventana.
- **ETH: mantener la calibración actual** (`er1≈0.30, er5 0.25, rsi 50-70, mom5
  0.6×ATR`). Los top combos giran alrededor de esos valores; con `n` chico no se
  justifica sobre-ajustar a un combo puntual. **Con BNB activo**, hay margen para
  aflojar levemente los mínimos de target/distancia — validar con más data antes.
- **BTC: sigue APAGADO** (`ARM_ORDER` off). No mostró edge con el fee real; solo
  se re-evalúa si Vero consigue maker/VIP que baje el costo bien por debajo de 0,1%.
- **Las reglas "$5 target" y "$3 de resistencia"** eran para cubrir el spread de
  Capital; en Binance el costo es %-based, no fijo. No se relajan aún: la muestra
  actual es chica y el margen de ETH es delgado. Revisar cuando haya más historial
  con BNB activo.

### Pendiente antes de tocar plata real

- Confirmar el **fee efectivo real** de Vero en Binance (¿BNB activo? ¿tier VIP?) —
  todo lo anterior asume taker con/sin BNB.
- Re-correr con **más historial** (30-60 días) cuando esté disponible: 14 días y
  ~12-16 trades por combo es muestra chica para fijar umbrales.

## Regla de oro

Ninguna recalibración toca plata real sin **validación fuera de muestra (walk-forward)**. Recalibrar a ciegas al nuevo costo es curve-fitting.
