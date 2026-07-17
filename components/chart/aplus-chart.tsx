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
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
} from "lightweight-charts";
import { Check, X } from "lucide-react";
import { fetchKlines, SYMBOLS, TIMEFRAMES, TF_LABEL, TF_WARNING, type Timeframe } from "@/lib/chart/klines";
import { ema, rsi, EMA_OVERLAYS } from "@/lib/chart/indicators";
import { computeAplusMarkers } from "@/lib/chart/aplus-signals";
import { computeChecklist, type AplusChecklist } from "@/lib/chart/checklist";
import type { ZonasState } from "@/lib/cockpit/zonas";
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

// Colores de las zonas S/R — mismos tokens que el panel "Zonas S/R"
// (resistencia = --block rojo, soporte = --go verde), sensibles al tema.
function zoneColors() {
  return {
    resistencia: tokenHsl("--block", "#F6465D"),
    soporte: tokenHsl("--go", "#0ECB81"),
  };
}

// Etiqueta de la línea: precio + distancia con signo al precio actual.
// Ej: "R 1946.5  −16" (resistencia) · "S 1900  +31" (soporte).
function zoneLineTitle(z: ZonasState["niveles"][number]): string {
  const tag = z.tipo === "resistencia" ? "R" : "S";
  const precio = z.precio.toLocaleString("es-CL", { maximumFractionDigits: 2 });
  const dist = `${z.distUsd >= 0 ? "+" : "−"}${Math.abs(Math.round(z.distUsd))}`;
  return `${tag} ${precio}  ${dist}`;
}

// Panel Checklist A+ — tabla "Filtro A+ | Estado" estilo indicador de TradingView.
function ChecklistPanel({ symbol, tf, checklist }: { symbol: string; tf: string; checklist: AplusChecklist | null }) {
  const allPass = checklist?.ok && checklist.passed === checklist.total;
  return (
    <div className="flex flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">Checklist A+</h3>
        <span className="text-[11px] text-muted-foreground">{symbol.replace("USDT", "")} · {tf}</span>
      </div>
      {!checklist ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">Leyendo…</div>
      ) : !checklist.ok ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">Sin datos suficientes.</div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Filtro A+</span><span>Estado</span>
          </div>
          <ul className="divide-y divide-border">
            {checklist.rows.map((row) => (
              <li key={row.label} className="flex items-center gap-2 px-4 py-2">
                {row.ok ? <Check className="size-4 shrink-0 text-go" /> : <X className="size-4 shrink-0 text-block" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{row.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{row.value}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className={cn("mt-auto flex items-center justify-between border-t px-4 py-2.5 text-sm font-semibold",
            allPass ? "text-go" : "text-muted-foreground")}>
            <span>{allPass ? "🟢 Alineado" : "Cumple"}</span>
            <span className="tabular-nums">{checklist.passed} / {checklist.total}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function AplusChart() {
  const [symbol, setSymbol] = useState<string>("ETHUSDT");
  const [tf, setTf] = useState<Timeframe>("15m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aplusCount, setAplusCount] = useState(0);
  const [checklist, setChecklist] = useState<AplusChecklist | null>(null);
  const [zonas, setZonas] = useState<ZonasState | null>(null);
  const [themeTick, setThemeTick] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<{ main?: IChartApi; rsi?: IChartApi }>({});
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const zoneLinesRef = useRef<IPriceLine[]>([]);

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
      // Serie nueva → las price lines viejas murieron con el chart anterior; el
      // efecto de zonas las redibuja sobre esta serie (deps incluyen `loading`).
      candleSeriesRef.current = candleSeries;
      zoneLinesRef.current = [];

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
      candleSeriesRef.current = null;
      zoneLinesRef.current = [];
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
      setThemeTick((t) => t + 1); // recolorea las zonas S/R con el tema nuevo
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Checklist A+ en vivo para el símbolo/temporalidad elegidos (+ contexto 5m).
  // Fetch propio (independiente del canvas) con refresco cada 30s.
  useEffect(() => {
    let alive = true;
    async function loadChecklist() {
      try {
        const [main, ctx] = await Promise.all([fetchKlines(symbol, tf, 300), fetchKlines(symbol, "5m", 120)]);
        if (alive) setChecklist(computeChecklist(main, ctx));
      } catch {
        // conservamos el último checklist
      }
    }
    loadChecklist();
    const id = setInterval(loadChecklist, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [symbol, tf]);

  // Zonas S/R desde la MISMA fuente que el panel (/api/zonas → zonas.env + precio).
  // Se refresca sola cada 45s, así que cuando el detector reescribe zonas.env, las
  // líneas del chart se actualizan sin tocar TradingView.
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/zonas", { cache: "no-store" });
        const data = (await r.json()) as ZonasState;
        if (alive) setZonas(data);
      } catch {
        // conservamos el último estado de zonas
      }
    }
    load();
    const id = setInterval(load, 45_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Dibuja las zonas como price lines horizontales sobre las velas: rojas =
  // resistencia, verdes = soporte, con etiqueta precio + distancia. Solo ETH tiene
  // zonas.env; en BTC/SOL no se dibuja nada. Redibuja al rearmar el chart (loading),
  // al cambiar de símbolo/temporalidad, al refrescar zonas o al cambiar de tema.
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;
    for (const line of zoneLinesRef.current) {
      try { series.removePriceLine(line); } catch { /* serie ya reemplazada */ }
    }
    zoneLinesRef.current = [];
    if (symbol !== "ETHUSDT" || !zonas?.ok) return;

    const cols = zoneColors();
    for (const z of zonas.niveles) {
      const line = series.createPriceLine({
        price: z.precio,
        color: z.tipo === "resistencia" ? cols.resistencia : cols.soporte,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: zoneLineTitle(z),
      });
      zoneLinesRef.current.push(line);
    }
  }, [zonas, symbol, tf, loading, themeTick]);

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
              title={TF_WARNING[t]}
              className={cn("rounded-md px-2.5 py-1.5 text-sm font-medium tabular-nums transition-colors",
                tf === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                t === "1s" && "italic")}
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
          {symbol === "ETHUSDT" && zonas?.ok && zonas.niveles.length > 0 && (
            <span className="inline-flex items-center gap-1" title="Zonas S/R desde zonas.env — se refrescan solas">
              <span className="inline-block h-0 w-3 border-t border-dashed border-block" />
              <span className="inline-block h-0 w-3 border-t border-dashed border-go" />
              S/R ({zonas.niveles.length})
            </span>
          )}
        </div>
      </div>

      {/* Aviso de 1s */}
      {tf === "1s" && TF_WARNING["1s"] && (
        <div className="rounded-lg border border-caution/30 bg-caution/5 px-4 py-2.5 text-xs text-caution">
          ⚠️ {TF_WARNING["1s"]}
        </div>
      )}

      {/* Chart + Checklist A+ lado a lado */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative min-w-0 rounded-lg border bg-card/30 p-2">
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

        <ChecklistPanel symbol={symbol} tf={TF_LABEL[tf]} checklist={checklist} />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Velas públicas de Binance · markers A+ y checklist evaluados en la temporalidad mostrada (condiciones estructurales del sistema).
        VQL solo grafica: no ejecuta órdenes.
      </p>
    </div>
  );
}
