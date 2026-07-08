# VISION — Vero Quant Lab

## Propósito

Vero Quant Lab es un laboratorio de investigación cuantitativa. Su propósito es disciplinar el proceso de pasar de una observación de mercado a una decisión de inversión documentada, trazable y reutilizable.

No es una plataforma de trading. No es un dashboard financiero. Es un laboratorio donde las ideas se formulan, se ponen a prueba, se validan o se descartan, y todo queda registrado.

## Principios

1. **Git es la fuente de verdad.** Toda investigación, conocimiento, decisión y diario vive en archivos Markdown dentro del repositorio. La aplicación Next.js es una interfaz para visualizar y editar ese conocimiento, nunca la fuente de verdad.

2. **El proceso importa más que el resultado.** Una hipótesis refutada documentada vale más que una ganancia no explicada. El laboratorio premia la trazabilidad epistémica.

3. **Investigación primero, ejecución después.** Las estrategias de trading emergen de investigaciones validadas, no al revés. Trading Engine es un módulo separado y posterior.

4. **Sin datos inventados.** Los componentes del sistema muestran estados reales. Si no hay datos, se muestra vacío con honestidad. No hay métricas falsas ni dashboards decorativos.

5. **Una sola aplicación responsive.** Desktop es el entorno principal de investigación. Mobile es prioritario para consulta, seguimiento y operación. No existen dos aplicaciones.

6. **Server Components por defecto.** Client Components solo donde exista interacción real. No se optimiza antes de tiempo.

## Lo que VQL no es

- No es un reemplazo de Bloomberg Terminal
- No es un roboadvisor
- No es un gestor de portafolio automático
- No es una red social de trading
- No es un curso online (Academy es un organizador de estudio personal, no una plataforma educativa multi-usuario)

## Dominios

| Dominio | Descripción | Fuente de verdad |
|---|---|---|
| **Research** | Ciclo completo de investigación: observación, hipótesis, experimento, validación, decisión | `RESEARCH/` en Git |
| **Knowledge** | Conceptos, frameworks, referencias, arquitectura, lecciones aprendidas | `KNOWLEDGE/` en Git |
| **Decisions** | Registro de decisiones de inversión con trazabilidad a la investigación que las justifica | `DECISIONS/` en Git |
| **Journal** | Diario de operaciones, reflexiones, errores, sesgos observados | `JOURNAL/` en Git |
| **Academy** | Plan de estudio personal, cursos, libros, ejercicios | `ACADEMY/` en Git |

## Stack

- Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
- AI SDK v6 para asistencia en flujos internos
- Vercel para deploy
- Supabase solo para autenticación, caché e índice de búsqueda (no como fuente de verdad)
- Git como fuente de verdad absoluta

## Éxito

VQL tiene éxito cuando:
- Una investigación puede seguirse desde la observación inicial hasta la decisión final con todos los pasos intermedios documentados
- Decisions inactivas pueden reactivarse con contexto completo años después
- El conocimiento generado es reutilizable entre investigaciones
- El journal revela patrones de sesgo que la investigación mitiga
