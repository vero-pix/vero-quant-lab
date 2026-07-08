# IMPLEMENTATION_PLAN.md

# Vero Quant Lab --- Plan de Implementación V1.1

## Objetivo

La arquitectura base de VQL está terminada.

A partir de esta etapa el foco deja de ser construir pantallas y pasa a
ser conectar el laboratorio con la operación real de trading.

------------------------------------------------------------------------

# Principio de trabajo

Cada Sprint debe acercar VQL a la operación real.

No se crearán nuevos módulos salvo que una investigación o una necesidad
operacional lo justifique.

Ciclo de trabajo:

Investigación

↓

Decisión

↓

Implementación

↓

Medición

↓

Nueva investigación

------------------------------------------------------------------------

# Sprint 1 --- Integración Trading Engine

## Objetivo

Reemplazar los datos mock por datos reales provenientes del sistema A+.

## Archivos origen

-   diario_trades.jsonl
-   senales_aplus.jsonl
-   reporte_diario.json

## Componentes afectados

-   Dashboard
-   Operations
-   TradingService

## Criterio de éxito

Dashboard y Operations muestran datos reales sin modificar la UI.

------------------------------------------------------------------------

# Sprint 2 --- Integración VPS

## Objetivo

Mostrar el estado real del servidor.

## Información requerida

-   CPU
-   RAM
-   Disco
-   Uptime
-   Heartbeat
-   Estado de servicios

## Arquitectura

Crear un adaptador para una futura API del VPS utilizando
MonitoringService.

------------------------------------------------------------------------

# Sprint 3 --- Integración Binance

## Objetivo

Mostrar información real de Binance.

## Información

-   Saldo Spot
-   Posiciones
-   Órdenes abiertas
-   Precio actual
-   Última actualización

Toda comunicación debe pasar por BinanceService.

------------------------------------------------------------------------

# Sprint 4 --- Integración Telegram

## Objetivo

Mostrar el estado del sistema de alertas.

## Información

-   Último mensaje
-   Estado del bot
-   Alertas enviadas
-   Errores

Crear TelegramService.

------------------------------------------------------------------------

# Sprint 5 --- Investigación Continua

Las investigaciones generan decisiones.

No se investiga por investigar.

## Backlog inicial

-   R-001 TradingView
-   R-002 Pine Script
-   R-003 Backtesting Profesional
-   R-004 Lightweight Charts
-   R-005 Order Flow
-   R-006 Open Source para Trading

Cada investigación debe terminar con:

-   Conclusión
-   Decisión
-   Acciones

------------------------------------------------------------------------

# Sprint 6 en adelante

Cada decisión importante genera una implementación.

Ejemplo:

Investigación:

TradingView

↓

Decisión:

Mantener TradingView para desarrollo.

Usar Lightweight Charts para visualización propia.

↓

Implementación.

------------------------------------------------------------------------

# Reglas del proyecto

-   No crear nuevas pantallas sin una necesidad real.
-   No implementar funciones "por si acaso".
-   Primero integrar.
-   Después optimizar.
-   Cada Sprint debe dejar una mejora utilizable.
-   Usar VQL diariamente para descubrir necesidades reales.

------------------------------------------------------------------------

# Definición de éxito

Al finalizar la V1.1:

-   Dashboard utiliza datos reales.
-   Operations monitorea la infraestructura real.
-   Research documenta decisiones técnicas.
-   Knowledge centraliza el conocimiento.
-   Academy organiza el aprendizaje.
-   VQL se convierte en el punto de entrada diario para la operación y
    la mejora continua.
