# Fuentes — R-002 Guardian

## Servicios de riesgo existentes (sistema de trading)

- `tradingview-mcp/scripts/capital_freno.cjs` — freno anti-sobre-operar (alerta 4 patrones).
- `tradingview-mcp/scripts/capital_stopguard.cjs` — stop protector automático a longs desnudos.
- `tradingview-mcp/scripts/capital_tpguard.cjs` — take-profit automático (entrada + 2×ATR).
- `tradingview-mcp/scripts/binance_trailing.cjs`, `trailing_exit.sh` — trailing de salida.
- `tradingview-mcp/scripts/capital_client.cjs` — cliente Capital.com (posiciones, balance, updatePosition).

## Definición de servicios (launchd)

- `deploy/cl.vero.freno.plist` — env: `INTERVAL=12`, `MAX_POS=2`, `MAX_RISK_PCT=15`; log `/tmp/vero_freno.log`.
- `deploy/cl.vero.stopguard.plist`, `deploy/cl.vero.tpguard.plist`, `deploy/cl.vero.trailing.plist`.

## Contratos de datos

- `diario_trades.jsonl` — trades cerrados Capital: `{id, sym, dir, entryPx, exitPx, rpl, swap, net, openT, closeT}`. Ojo: primera línea con `1` pegado antes del JSON.
- `diario_trades_binance.jsonl` — trades cerrados Binance (fuente separada).
- `senales_aplus.jsonl` — señales A+: `{ts, fecha, symbol, epic, entry, sl, tp, atr, rsi, er, volr, regimen, resultado, resuelto_ts, pnl}`.
- `reporte_diario.jsonl` — resumen diario: `{fecha, n, wr, net}`.

## Documentos del sistema

- `PROYECTO.md` — documento maestro del sistema de trading (propósito: "protegerla de sí misma").
- `CLAUDE.md` — operativa viva, reglas de oro, diagrama de compra A+.
- `A+_construccion.md` — construcción de la señal A+.

## Protocolo de riesgo (activo de partida)

- `AI_Risk_Guardian_Protocolo.md` — RISK SCORE (0–100), kill-switch, límites de pérdida diaria y consecutiva, reglas basadas en el historial real.
