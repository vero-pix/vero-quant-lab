export const APP_VERSION = "1.4.0";

export interface Novedad {
  version: string;
  fecha: string;
  cambios: string[];
}

export const NOVEDADES: Novedad[] = [
  {
    version: "1.4.0",
    fecha: "11 jul 2026",
    cambios: [
      "🌊 Order Flow: heatmap de liquidez tipo Bookmap con feed real de Binance (@depth/@aggTrade), DOM, CVD y volume profile.",
      "🎯 Score A+ para BTC en el Dashboard, junto al de ETH.",
      "🌐 VQL en dominio propio: https://vql.economics.cl con HTTPS y contraseña, accesible desde el celular sin app.",
      "🛡️ Guardian: el BNB de comisiones ya no se marca como 'posición sin stop' (era un falso BLOQUEO); se trata como activo de utilidad.",
    ],
  },
  {
    version: "1.3.0",
    fecha: "9 jul 2026",
    cambios: [
      "📈 Chart A+: velas de Binance con EMAs, markers de señal A+, RSI, 1s y checklist estilo TradingView.",
      "🎯 Score A+: medidor 0-100 con desglose (tendencia, momentum, volumen, estructura, riesgo).",
      "☁️ VQL corre 24/7 en el VPS y se accede desde el celular por Tailscale.",
      "✦ Globo de versión con novedades y botón de actualizar.",
    ],
  },
  {
    version: "1.2.0",
    fecha: "9 jul 2026",
    cambios: [
      "🛡️ Guardian real: posiciones de Binance en vivo, semáforo, 'sin stop' en rojo. Keys read-only (seguridad).",
      "🧪 Simulador A+ interactivo. 🔻 Vista de Futuros (distancia a liquidación). 🌗 Tema claro/oscuro.",
    ],
  },
  {
    version: "1.1.0",
    fecha: "8 jul 2026",
    cambios: [
      "🎨 Identidad 'Guardian sereno' + integración Binance real + paneles Estado A+, Zonas y Casi-señales.",
    ],
  },
  {
    version: "1.0.0",
    fecha: "8 jul 2026",
    cambios: [
      "🚀 Base: Dashboard, Operations, Research, Knowledge, Academy.",
    ],
  },
];
