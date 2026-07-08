# R-001 — TradingView

> **Estado**: Cerrada
> **Inicio**: 2026-07-08 · **Cierre**: 2026-07-08
> **Objetivo**: Evaluar si TradingView sigue siendo la mejor opción de charting para VQL

## Contexto

VQL usa un dashboard web (Next.js + Tailwind CSS) para monitorear señales de trading, trades en vivo y reportes. Necesitamos charting financiero integrado. TradingView es el líder del mercado pero tiene opciones tanto gratuitas (Lightweight Charts) como pagadas (Charting Library).

## Hallazgos principales

1. **Lightweight Charts (TradingView, Apache 2.0, gratis)**: ~12 KB gzipped, Canvas rendering, 60fps con 10K+ puntos. Ideal para financial time-series. Framework-agnóstico. Limitación: solo charts financieros (candlesticks, line, area, volume histogram).

2. **ECharts (Apache 2.0, gratis)**: ~80-130 KB gzipped. Soporta candlesticks + pie, heatmap, treemap. Canvas/WebGL. Buena opción si necesitas diversidad de charts.

3. **Chart.js (MIT, gratis)**: ~66 KB gzipped. Candlesticks necesita plugin. General-purpose.

4. **Highcharts (comercial)**: ~200 KB+. $160+/dev. No aporta ventaja significativa sobre Lightweight Charts para financial data.

5. **Recharts (MIT, gratis)**: ~50 KB gzipped. SVG. Jank notorio con +1K puntos. No recomendado para financial data.

## Decisión

**Seguir con Lightweight Charts de TradingView.** Razones:

- Es el más pequeño (~12 KB gzipped)
- Construido por el equipo de TradingView específicamente para financial charts
- Canvas rendering = performance con datos en tiempo real
- Apache 2.0 — sin restricciones comerciales
- Si en el futuro VQL necesita pie/heatmap/treemap, agregar ECharts como secundaria

## Referencias

- https://www.tradingview.com/lightweight-charts/
- https://github.com/tradingview/lightweight-charts
- https://chenguangliang.com/en/posts/blog152_react-chart-libraries-comparison/
