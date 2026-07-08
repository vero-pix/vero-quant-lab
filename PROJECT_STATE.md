# PROJECT_STATE.md

# Vero Quant Lab

Versión objetivo: V1.0

Última actualización: 8 Julio 2026

---

# Misión

Construir una plataforma personal para investigar, operar y aprender trading cuantitativo.

VQL no busca reemplazar TradingView.

Busca convertirse en mi centro de trabajo diario.

---

# Objetivos de la V1

✅ Ver el estado del sistema
✅ Monitorear la operación
✅ Investigar nuevas tecnologías
✅ Centralizar el conocimiento
✅ Organizar mi aprendizaje
✅ Integrar fuentes reales (VPS, Binance, Telegram)

Todo desde una única aplicación.

---

# Estado actual por módulo

## Dashboard

Estado: ✅ Operativo

Muestra:
- Estado general (VPS, Trading Engine, Binance, Telegram)
- Trading Hoy (P&L, trades, win rate, señales)
- Actividad reciente
- Alertas
- Próxima acción
- Binance (saldo, órdenes abiertas, precios ETH/BTC)
- Telegram (alertas, estado del bot, errores)

Consume TradingService, BinanceService, TelegramService.

---

## Operations

Estado: ✅ Operativo

Muestra:
- System Health (VPS, Trading Engine, Binance, Telegram)
- Services (16 servicios del VPS)
- Actividad reciente
- Alertas
- Métricas

Consume TradingService + MonitoringService (VpsAdapter).

---

## Research

Estado: ✅ Terminado (V1)

Lee archivos Markdown desde RESEARCH/.

Arquitectura: ResearchService + ResearchRepository.

---

## Knowledge

Estado: ✅ Terminado (V1)

Lee archivos Markdown desde KNOWLEDGE/.

Renderiza markdown con react-markdown + remark-gfm.

---

## Academy

Estado: ✅ Terminado (V1)

Lee archivos Markdown desde ACADEMY/.

Renderiza lecciones con react-markdown.

---

# Arquitectura

Frontend:
- Next.js 15 + TypeScript + Tailwind CSS
- Server Components por defecto

Servicios:
- TradingService — datos de trades, señales, reportes (JSONL)
- MonitoringService — estado del VPS (VpsAdapter mock/HTTP)
- BinanceService — saldo, órdenes, precios en vivo
- TelegramService — alertas, estado del bot, errores
- ResearchService — investigaciones
- KnowledgeService — documentación
- AcademyService — cursos

Todos los módulos consumen Services. La UI nunca accede directamente al filesystem ni a APIs externas.

Patrón de integración para fuentes externas (VPS, Binance, Telegram):
- Interfaz Adapter
- MockAdapter (datos mock por defecto)
- HttpAdapter (fetch a API real cuando hay credenciales/configuración)

---

# Principios

- No construir funciones innecesarias.
- Cada módulo debe resolver un problema real.
- Toda investigación termina en una decisión.
- Git es la fuente de verdad.
- Primero usar. Después mejorar.

---

# Roadmap

FASE 1 — Base (completada)

✅ Dashboard
✅ Operations
✅ Research
✅ Knowledge
✅ Academy

FASE 2 — Integración del laboratorio (completada)

✅ Trading Engine (datos desde JSONL)
✅ VPS (adapter monitoring)
✅ Binance (saldo, órdenes, precios)
✅ Telegram (alertas, bot, errores)
⬜ Logs
⬜ Configuración

FASE 3 — Investigaciones

- R-001 TradingView
- R-002 Pine
- R-003 Backtesting
- R-004 Lightweight Charts
- R-005 Order Flow

FASE 4 — Mejoras derivadas de investigaciones.

No desarrollar funcionalidades sin una investigación previa.

---

# Criterio de éxito

Abro VQL todos los días.

Veo el estado del sistema.

Registro investigaciones.

Aprendo.

Tomo mejores decisiones.

Si ocurre eso, VQL está cumpliendo su misión.
