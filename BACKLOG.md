# BACKLOG — Vero Quant Lab

Ideas y tareas parqueadas. No es el roadmap (eso vive en `ROADMAP.md`): es la lista cruda de lo que surgió y aún no está agendado. Última actualización: 8 Julio 2026.

---

## Tareas pendientes (accionables)

| # | Tarea | Prioridad | Nota |
|---|---|---|---|
| B-01 | Reemplazar keys Binance por SOLO-LECTURA | 🔴 Alta | Hoy `.env.local` usa keys de ejecución. Riesgo de seguridad, sobre todo antes de Vercel. |
| B-02 | Simulador A+ carril 2 (espejo conductual) | 🟠 Media | Requiere normalizar el historial primero. |
| B-03 | Normalizar historial de trades en dataset limpio | 🟠 Media | 4.811 ejecuciones, multi-instrumento, monedas mezcladas. Insumo del carril 2. |
| B-04 | Tema claro + toggle | 🟠 Media | Tokens ya en CSS; falta set claro + switch. |
| B-05 | API HTTP del VPS | 🟡 Baja | Desbloquea Operations/Telegram/Guardian reales (hoy mock). |
| B-06 | Limpiar bot Telegram (quitar Capital) | 🟡 Baja | El bot aún referencia `capital_client` y el comando `posicion`. |
| B-07 | Vercel (camino B) | 🟡 Baja | Depende de B-01, password y B-05. |
| B-08 | Automatizar snapshot de equity de apertura | 🟢 Menor | Hoy captura al primer load del día. |
| B-09 | Homologar LabService al patrón adapter | 🟢 Menor | Diferido conscientemente. |

---

## Ideas (sin comprometer)

- **P&L real normalizado**: el CSV mezcla monedas; el neto en bruto no refleja el efecto de las liquidaciones. Normalizar con la columna Converted y emparejar round-trips.
- **Insight del historial** para Academy: sin stop 62% WR vs con stop 51% — el stop baja el WR pero corta la cola que liquida. Lección central.
- **WR por instrumento**: swing (Plata 79%, JPY 75%, Oro 68%) supera al scalping (ETH 60%). El edge está en operar con calma.
- **Revisar piso del límite diario** ($5) para cuentas chicas: hoy domina sobre el 10% y el % deja de proteger.
- **Charts anotados estilo Binance** con Lightweight Charts: marcadores de señal, indicadores, look educativo.

---

## Decisiones registradas

- Capital retirado (8 Jul 2026). Sistema Binance-only.
- Guardian = panel de control sobre enforcement existente, no motor nuevo (R-002).
- Estabilizar base antes de features nuevas.
- Simulador A+ con 2 carriles, reutilizable en Academy.
- Charting: Lightweight Charts (R-001).
