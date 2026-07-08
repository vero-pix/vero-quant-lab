# ROADMAP — Vero Quant Lab

## Estado actual: v0.1.0 — Foundation Cleanup

El proyecto tiene diseño system completo, dominio modelado y metodología documentada, pero **cero funcionalidad ejecutable**. No hay capa de datos, autenticación, API ni investigaciones reales.

## Fase 1: Fundación (ahora — Q3 2026)

**Objetivo**: Habilitar una investigación real end-to-end usando Git como fuente de verdad.

| Item | Descripción | Prioridad |
|---|---|---|
| Directorios base | Crear `RESEARCH/`, `KNOWLEDGE/`, `DECISIONS/`, `JOURNAL/`, `ACADEMY/` con estructura interna y READMEs | Crítica |
| Autenticación | Supabase Auth — login, sesión, protección de rutas | Crítica |
| File-based research | Lector de archivos Markdown desde `RESEARCH/` para visualizar investigaciones en la app | Alta |
| Editor de investigación | Interfaz para crear/editar investigaciones con commit automático a Git | Alta |
| Ruta Research funcional | Reemplazar EmptyStateCards con lista de investigaciones reales desde el filesystem | Alta |
| Dashboard real | Conectar StatCards a datos reales (conteo de investigaciones activas, etc.) | Media |
| Responsive design | Asegurar que todas las rutas existentes funcionan en mobile (consulta) | Alta |
| Migración TW v4 | Convertir de Tailwind v3 + PostCSS a v4 + CSS-first config | Media |
| Tests | Vitest + Testing Library para componentes críticos | Media |

**Entregable**: Una investigación real creada, visualizada y completada dentro de la app, con todos los cambios persistidos en Git.

## Fase 2: Knowledge y Decisions (Q3 2026 — Q4 2026)

**Objetivo**: Expandir la interfaz a los dominios de Knowledge y Decisions.

| Item | Descripción |
|---|---|
| Ruta Knowledge | Visualizador de `KNOWLEDGE/` con navegación por categorías |
| Ruta Decisions | Visualizador de `DECISIONS/` con trazabilidad a investigaciones |
| Editor Markdown | Editor unificado para crear/editar archivos en cualquier dominio |
| Búsqueda local | Filtro y búsqueda por texto sobre archivos Markdown |
| Sidebar actualizado | Navegación reflejando los 5 dominios correctamente |

**Entregable**: Los 3 dominios (Research, Knowledge, Decisions) editables desde la app con persistencia en Git.

## Fase 3: Journal y Academy (Q4 2026)

**Objetivo**: Completar los 5 dominios.

| Item | Descripción |
|---|---|
| Ruta Journal | Visualizador de `JOURNAL/` con entradas por fecha |
| Ruta Academy | Visualizador de `ACADEMY/` con progreso de estudio |
| Dashboard completo | Vista general con estado de todos los dominios |
| Estadísticas básicas | Conteo de investigaciones, decisiones, entradas de journal |

**Entregable**: Los 5 dominios funcionales con interfaz completa.

## Fase 4: AI y Búsqueda (2027)

**Objetivo**: Aumentar la capacidad de investigación con asistencia inteligente.

| Item | Descripción |
|---|---|
| AI Copilot | Asistente contextual para formular hipótesis, revisar experimentos, detectar sesgos |
| Búsqueda semántica | Indexación de todo el contenido Markdown para búsqueda por concepto |
| Supabase como índice | Base de datos como caché de búsqueda, no como fuente de verdad |
| Recomendaciones | Sugerir investigaciones relacionadas, decisiones previas, knowledge relevante |

**Entregable**: Búsqueda semántica funcional sobre todo el corpus de conocimiento.

## Más adelante (sin fecha)

- Trading Engine (repo separado)
- Integración con APIs de mercado para datos en vivo
- Exportación de investigaciones a PDF
- Versionamiento visual de investigaciones (diff entre estados)
- Múltiples perfiles de investigación (por mercado, por estrategia)

## Criterios de paso entre fases

- Una fase se considera completa cuando todas las rutas del dominio asociado funcionan en producción
- No se salta una fase para empezar la siguiente
- Excepción: bugs críticos de seguridad o pérdida de datos en producción tienen prioridad sobre cualquier fase
