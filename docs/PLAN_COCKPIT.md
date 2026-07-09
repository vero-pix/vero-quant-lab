# Plan — VQL como plataforma única (cockpit)

Fecha: 9 Julio 2026

## Objetivo

Dejar de abrir Telegram + TradingView + Binance + VQL por separado. Todo lo que hoy vives repartido en esas cuatro, verlo en **una sola vista**: VQL.

## Principio (no negociable)

VQL **muestra y consolida; no ejecuta órdenes.** La ejecución sigue en el sistema (bot/servicios del VPS). Telegram se mantiene como canal de **push** (el "tócame cuando arma una señal"); VQL es el canal de **trabajo** (donde miras todo junto). Opcional: sumar notificaciones del navegador cuando VQL esté abierto.

## El linchpin

El sistema vivo (detectores, bot, freno) corre en el **VPS (Hetzner)**; VQL corre local. Para ver señales y estado **en vivo**, VQL necesita una fuente de datos del VPS. La pieza clave de todo el plan es una **API HTTP del VPS** que VQL consuma. Sin eso, VQL solo ve archivos locales que pueden estar desactualizados.

## Estrategia con Telegram

La vía limpia **no** es "conectar Telegram", sino **replicar sus lecturas** desde las mismas fuentes que usa el bot (Binance klines, JSONL, zonas.env). Así VQL calcula lo mismo, nativo, sin depender del bot. Cada comando de Telegram se vuelve un panel de VQL:

| Comando Telegram | Panel en VQL | Fuente |
|---|---|---|
| `estado` | Lectura A+ en vivo (checklist) | Binance klines (VQL ya calcula indicadores) |
| `binance` | Posiciones en vivo | Binance API (fix en curso) |
| `reporte` | Reporte diario | reporte_diario.jsonl |
| `zonas` | Niveles S/R | zonas.env |
| `casi` | Radar de casi-señales | casi_senales.jsonl |
| Señal ✅/❌ | Tarjeta de señal en vivo | API del VPS (feed) |

## Fases

### Fase A — Consolidar las lecturas del bot (lo que ya se puede)
Convertir los comandos de lectura en paneles nativos de VQL (tabla de arriba). No requiere el VPS: usa data local + Binance. Entrega valor inmediato.

### Fase B — El chart (reemplazar mirar TradingView)
Lightweight Charts con precio + overlay del checklist A+ (marcadores donde dispara). No es TradingView completo, pero es el A+ operable dentro de VQL.

### Fase C — Feed de señales en vivo (el corazón)
API HTTP del VPS que exponga: estado de detectores, la señal A+ armada (pending order), estado de servicios y log del freno. VQL lee el feed y muestra la señal apenas se arma — con su checklist — igual que Telegram, pero en la app. Esto además vuelve reales los paneles de Operations y Telegram (hoy mock) y habilita Vercel.

### Fase D — Acción (decisión de diseño)
VQL no ejecuta. Para actuar sobre una señal hay dos opciones: (a) mostrar y tú actúas en Binance/bot; (b) un botón que dispare el **mismo flujo del bot** vía la API del VPS — pero la ejecución vive en el sistema, no en VQL. Recomendación: empezar por (a), show-only, coherente con el principio y la misión protectora.

## Secuencia recomendada

1. Terminar el fix de **posiciones spot en vivo** (en curso).
2. **Vista de Futuros** (protectora: distancia a liquidación).
3. **Keys Binance read-only** (seguridad, antes de más integración).
4. **Fase A** — comandos del bot como paneles.
5. **Fase C** — API del VPS (linchpin) → señales en vivo, Operations/Telegram reales.
6. **Fase B** — chart A+ con Lightweight Charts.
7. **Revalidar A+** para futuros (investigación, en paralelo).

## Qué desbloquea el linchpin (API del VPS)

- Señales A+ en vivo dentro de VQL (adiós depender de Telegram para verlas).
- Operations y Telegram dejan de ser mock.
- Guardian con estado real de servicios.
- Vercel viable (la app hosteada lee data real por HTTP, no archivos locales).
