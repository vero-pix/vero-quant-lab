# Decisión

## Problema

Elegir la plataforma de charting para el dashboard web de VQL. TradingView es el estándar del mercado pero tiene múltiples opciones: Lightweight Charts (gratis, open-source), Charting Library (licencia comercial), o alternativas como ECharts, Chart.js, Highcharts.

## Alternativas

1. **TradingView Lightweight Charts (Apache 2.0, gratis)**: ~12 KB gzipped, solo financial charts, Canvas 60fps
2. **TradingView Charting Library (comercial)**: Full terminal experience, requiere negociar licencia
3. **Apache ECharts (Apache 2.0, gratis)**: ~80-130 KB gzipped, candlesticks + todo tipo de charts
4. **Chart.js (MIT, gratis)**: ~66 KB gzipped, candlesticks necesita plugin
5. **Highcharts (comercial)**: ~200 KB+ gzipped, caro sin ventaja real para financial data
6. **Recharts (MIT, gratis)**: ~50 KB gzipped, SVG, mal rendimiento con datos financieros grandes

## Decisión

**Opción 1 — TradingView Lightweight Charts.**

## Justificación

1. **Especificidad**: Lightweight Charts fue construido por TradingView para financial time-series. Candlesticks, line, area, volume histogram son ciudadanos de primera clase.
2. **Rendimiento**: Canvas rendering mantiene 60fps con 10K+ puntos. Maneja actualizaciones en tiempo real sin jank.
3. **Bundle**: ~12 KB gzipped — el más pequeño de todas las alternativas.
4. **Licencia**: Apache 2.0 — sin restricciones, sin pagos, sin atribución obligatoria en UI (se puede hacer via logo opcional).
5. **Futuro**: Si VQL necesita pie charts, heatmaps o treemaps, se agrega ECharts como biblioteca secundaria sin reemplazar el charting financiero.

## Riesgo mitigado

El único riesgo es que Lightweight Charts solo hace financial charts. Para dashboards que necesiten gráficos no-financieros (ej. distribución de P&L por símbolo como pie chart), necesitaremos una segunda biblioteca. Esto no es un problema real porque:
- El dashboard de VQL es 90% financial charts
- Agregar ECharts como dependencia secundaria es trivial y no conflictivo
- La mayoría de proyectos fintech siguen esta misma estrategia (Lightweight Charts + ECharts/Recharts)

## Estado

Aprobada.

## Fecha

2026-07-08
