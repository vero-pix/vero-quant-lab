# Decisión

## Problema

El proyecto Vero Quant Lab v0.1.0 tiene arquitectura documentada, design system completo, dominio modelado y metodología especificada, pero cero funcionalidad ejecutable. No hay capa de datos, autenticación ni API. La documentación supera 3:1 al código funcional. Sin un loop de feedback funcional, las decisiones de diseño no pueden validarse.

## Alternativas

1. **Mantener el rumbo actual**: seguir documentando, refinando tipos y expandiendo el design system hasta tener una especificación completa antes de implementar.

2. **Migrar a Tailwind v4 ahora**: actualizar la base de estilos antes de agregar más componentes, aprovechando que el codebase es pequeño.

3. **Construir end-to-end primero**: implementar una investigación real completa (crear, leer, almacenar) conectando Supabase + autenticación + Server Actions, postergando docs y refinamiento estético.

## Decisión

**Opción 3 — Construir end-to-end primero.**

## Justificación

1. **Evidencia directa del codebase**: 17 archivos de documentación vs 0 archivos de especificación implementada (`specs/` vacío). La documentación actual no se sostiene porque no ha sido validada por implementación.

2. **Riesgo de abstracción prematura**: el análisis identificó 10 status enums para entidades que no existen, 296 líneas de metodología sin ejecutar, y design system sin consumidores reales. Cada día sin implementación aumenta la probabilidad de que estas abstracciones sean incorrectas.

3. **La opción 1 no resuelve el problema**: más documentación sobre un sistema sin datos no produce aprendizaje. La opción 2 (migrar TW v4) es tácticamente correcta pero no crítica — los componentes actuales son pocos y la migración será igual de fácil en 2 semanas si se mantiene la disciplina.

4. **Una investigación end-to-end validará o invalidará** el modelo de dominio, la metodología y las necesidades reales del design system en el mismo acto de construirla.

## Impacto

- **Positivo**: se obtendrá el primer artefacto funcional del proyecto. Las decisiones de diseño (dominio, componentes, metodología) podrán evaluarse contra uso real.
- **Negativo**: posterga la migración a TW v4 y la expansión del design system.
- **Riesgo mitigado**: la deuda técnica de TW v3 se mantiene manejable porque el codebase es pequeño (~500 líneas de componentes).

## Estado

Aprobada.

## Fecha

2026-07-08

## Revisión futura

Revisar en 2 semanas o al completar la primera investigación end-to-end, lo que ocurra primero. En ese punto evaluar:

- ¿El modelo de dominio necesitó cambios?
- ¿La metodología stage-gate se usó o se ignoró?
- ¿Los componentes del design system cubrieron las necesidades reales?
- ¿Migrar a TW v4 ahora o postergar?
