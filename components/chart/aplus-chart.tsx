"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  type IChartApi,
} from "lightweight-charts";
import { fetchKlines, SYMBOLS, TIMEFRAMES, TF_LABEL, type Timeframe } from "@/lib/chart/klines";
import { ema, rsi, EMA_OVERLAYS } from "@/lib/chart/indicators";
import { computeAplusMarkers } from "@/lib/chart/aplus-signals";
import { cn } from "@/lib/utils";

// Colores de datos (tokens de mercado, fijos como Binance).
const UP = "#0ECB81";
const DOWN = "#F6465D";

// Resuelve un token HSL del tema (respeta claro/oscuro).
function tokenHsl(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
}
function themeColors() {
  return {
    text: tokenHsl("--muted-foreground", "#9aa"),
    grid: tokenHsl("--border", "#2a2a2a"),
    signal: tokenHsl("--signal", "#F0B90B"),
    exit: tokenHsl("--muted-foreground", "#9aa"),
  };
}

export function AplusChart() {
  const [symbol, setSymbol] = useState<string>("ETHUSDT");
  const [tf, setTf] = useState<Timeframe>("15m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aplusCount, setAplusCount] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<{ main?: IChartApi; rsi?: IChartApi }>({});

  // (Re)construye ambos charts al cambiar símbolo/temporalidad.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    async function build() {
      let candles;
      try {
        candles = await fetchKlines(symbol, tf, 500);
      } catch (e) {
        if (alive) { setError(String(e)); setLoading(false); }
        return;
      }
      if (!alive || !mainRef.current || !rsiRef.current) return;

      // Limpia charts previos.
      chartsRef.current.main?.remove();
      chartsRef.current.rsi?.remove();

      const c = themeColors();
      const chartOpts = {
        autoSize: true,
        layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: c.text, fontFamily: "inherit" },
        grid: { vertLines: { color: c.grid }, horzLines: { color: c.grid } },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: c.grid },
        timeScale: { borderColor: c.grid, timeVisible: true, secondsVisible: false },
      };

      // ---- chart principal: velas + volumen + EMAs + markers ----
      const main = createChart(mainRef.current, chartOpts);
      const candleSeries = main.addSeries(CandlestickSeries, {
        upColor: UP, downColor: DOWN, borderUpColor: UP, borderDownColor: DOWN, wickUpColor: UP, wickDownColor: DOWN,
      });
      candleSeries.setData(candles.map((k) => ({ time: k.time as never, open: k.open, high: k.high, low: k.low, close: k.close })));

      const volSeries = main.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "" });
      volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      volSeries.setData(candles.map((k) => ({
        time: k.time as never, value: k.volume,
        color: k.close >= k.open ? `${UP}55` : `${DOWN}55`,
      })));

      // EMAs superpuestas (registro extensible en indicators.ts).
      const closes = candles.map((k) => k.close);
      for (const o of EMA_OVERLAYS) {
        const line = main.addSeries(LineSeries, { color: o.color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
        const s = ema(closes, o.period);
        line.setData(candles.map((k, i) => (s[i] == null ? null : { time: k.time as never, value: s[i]! })).filter(Boolean) as never);
      }

      // Markers A+ (compra) + salida por sobrecompra.
      const { buys, exits } = computeAplusMarkers(candles, { signal: c.signal, exit: c.exit });
      const markers = [...buys, ...exits].sort((a, b) => a.time - b.time);
      createSeriesMarkers(candleSeries, markers.map((m) => ({ time: m.time as never, position: m.position, color: m.color, shape: m.shape, text: m.text })));
      if (alive) setAplusCount(buys.length);

      // ---- sub-chart RSI ----
      const rsiChart = createChart(rsiRef.current, { ...chartOpts, rightPriceScale: { borderColor: c.grid }, timeScale: { ...chartOpts.timeScale, visible: false } });
      const rsiSeries = rsiChart.addSeries(LineSeries, { color: c.signal, lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
      const rs = rsi(closes, 14);
      rsiSeries.setData(candles.map((k, i) => (rs[i] == null ? null : { time: k.time as never, value: rs[i]! })).filter(Boolean) as never);
      for (const [price, style] of [[70, 2], [50, 3], [30, 2]] as const) {
        rsiSeries.createPriceLine({ price, color: c.grid, lineWidth: 1, lineStyle: style, axisLabelVisible: true, title: String(price) });
      }
      rsiChart.priceScale("right").applyOptions({ autoScale: false });
      rsiSeries.applyOptions({ autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }) });

      // Sincroniza el rango temporal de ambos charts.
      const sync = (range: unknown) => { if (range) rsiChart.timeScale().setVisibleLogicalRange(range as never); };
      main.timeScale().subscribeVisibleLogicalRangeChange(sync);
      rsiChart.timeScale().subscribeVisibleLogicalRangeChange((r) => { if (r) main.timeScale().setVisibleLogicalRange(r as never); });
      main.timeScale().fitContent();

      chartsRef.current = { main, rsi: rsiChart };
      if (alive) setLoading(false);
    }

    build();
    return () => {
      alive = false;
      chartsRef.current.main?.remove();
      chartsRef.current.rsi?.remove();
      chartsRef.current = {};
    };
  }, [symbol, tf]);

  // Reacciona al cambio de tema (toggle claro/oscuro en <html>).
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const c = themeColors();
      const opts = {
        layout: { textColor: c.text },
        grid: { vertLines: { color: c.grid }, horzLines: { color: c.grid } },
        rightPriceScale: { borderColor: c.grid },
        timeScale: { borderColor: c.grid },
      };
      chartsRef.current.main?.applyOptions(opts);
      chartsRef.current.rsi?.applyOptions(opts);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="space-y-4">
      {/* Selectores */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border bg-card/50 p-1">
          {SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                symbol === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {s.replace("USDT", "")}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border bg-card/50 p-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={cn("rounded-md px-2.5 py-1.5 text-sm font-medium tabular-nums transition-colors",
                tf === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {TF_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {EMA_OVERLAYS.map((o) => (
            <span key={o.period} className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-3 rounded" style={{ backgroundColor: o.color }} />EMA{o.period}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 font-medium text-signal">◆ A+ ({aplusCount})</span>
        </div>
      </div>

      {/* Charts */}
      <div className="relative rounded-lg border bg-card/30 p-2">
        {error ? (
          <div className="flex h-[520px] items-center justify-center text-sm text-muted-foreground">
            No pude cargar las velas ({error}).
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/40 text-sm text-muted-foreground">
                Cargando {symbol} {TF_LABEL[tf]}…
              </div>
            )}
            <div ref={mainRef} className="h-[420px] w-full" />
            <div className="mt-1 border-t pt-1">
              <p className="px-1 text-[10px] uppercase tracking-wide text-muted-foreground">RSI 14</p>
              <div ref={rsiRef} className="h-[120px] w-full" />
            </div>
          </>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Velas públicas de Binance · markers A+ evaluados en la temporalidad mostrada (condiciones estructurales del sistema).
        VQL solo grafica: no ejecuta órdenes.
      </p>
    </div>
  );
}
