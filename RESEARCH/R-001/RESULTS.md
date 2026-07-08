# Resultados

## Benchmark de charting libraries

| Library | Bundle (gzip) | Candlesticks | Render | 10K+ pts | Licencia |
|---|---|---|---|---|---|
| Lightweight Charts | ~12 KB | Nativo | Canvas | 60fps | Apache 2.0 |
| ECharts | ~80-130 KB | Nativo | Canvas/WebGL | 60fps | Apache 2.0 |
| Chart.js | ~66 KB | Plugin | Canvas | 30-45fps | MIT |
| Highcharts | ~200 KB+ | Plugin | SVG | <10fps | Comercial |
| Recharts | ~50 KB | Workaround | SVG | Jank notorio | MIT |
| Nivo | ~82 KB | No soporta | SVG/Canvas | Variable | MIT |

## Verificación de integración con Next.js

Lightweight Charts es framework-agnóstico. Se integra con React via `useRef` + `useEffect`. No necesita wrapper. TypeScript-first. Funciona con SSR (el chart se monta en el cliente via `useEffect`).

## Costos

- Lightweight Charts: $0 (Apache 2.0)
- ECharts: $0 (Apache 2.0)
- Charting Library (TradingView): requiere negociación, cifras no públicas
- Highcharts: desde $160/desarrollador/año

## Conclusión

Lightweight Charts es la opción óptima para VQL. Si en el futuro se necesitan charts no-financieros, agregar ECharts como biblioteca secundaria.
