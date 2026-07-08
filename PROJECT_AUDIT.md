# PROJECT AUDIT — Vero Quant Lab

## 1. Qué entiende que es Vero Quant Lab

Vero Quant Lab es un laboratorio de investigación cuantitativa implementado como una aplicación web. Está concebido como un "research operating system": un espacio de trabajo donde se formulan hipótesis, se ejecutan experimentos, se documentan papers, se gestionan benchmarks, y se producen decisiones de inversión con trazabilidad epistémica.

No es una plataforma de trading. No es un dashboard financiero. Es un laboratorio — la distinción es deliberada y está documentada en la metodología (`docs/research-method.md`).

El proyecto distingue entre cinco dominios: Research (investigación), Academy (educación), Knowledge (documentación), Trading Engine (ejecución, en repo separado), y AI Copilot (asistencia, planificado).

## 2. Cuál cree que es el objetivo del proyecto

El objetivo es construir una plataforma que discipline el proceso de investigación cuantitativa: desde una idea inicial hasta una decisión de inversión documentada, pasando por hipótesis, experimentos, validación estadística y revisión por pares. Todo con trazabilidad completa, mecanismos anti-sesgo, y un modelo de madurez epistémico.

En términos prácticos: que Verónica (la única usuaria hoy) pueda entrar, crear una investigación, seguir el pipeline stage-gate desde "observación" hasta "validado" o "descartado", y que quede un registro reutilizable para decisiones futuras.

El proyecto también busca servir como plataforma educativa (Academy) y base de conocimiento (Knowledge), pero el core diferenciador es Research.

## 3. Qué módulos existen hoy

| Módulo | Estado | Descripción |
|---|---|---|
| **Workspace Home** | Implementado | Pantalla de inicio con saludo, 5 ActionCards (Research, Trading, Academy, Knowledge, AI Copilot), estado del sistema y trabajo actual. Animaciones con Framer Motion. |
| **Sidebar + Header** | Implementado | Navegación lateral fija con 5 rutas. Header sticky con branding. |
| **Dashboard** | Shell | Página con PageHeader + 3 StatCards con datos mock (04, 12, 28). Sin datos reales. |
| **Research** | Shell | 4 EmptyStateCards (Papers, Experimentos, Hipótesis, Benchmark). Sin funcionalidad. |
| **Academy** | Shell | Placeholder. "Academy workspace ready." |
| **Knowledge** | Shell | Placeholder. "Knowledge workspace ready." |
| **Settings** | Shell | Placeholder. "Settings workspace ready." |
| **Design System** | Completo | 6 familias de componentes (buttons, cards, feedback, layout, status, typography) con 6 story files. Sin consumo real en páginas. |
| **Domain Model** | Solo tipos | 155 líneas en `types/domain.ts` con 10 entidades, relaciones y status enums. Sin implementación. |
| **Research Methodology** | Solo documentación | 296 líneas en `docs/research-method.md`. Stage-gates, estados de madurez, anti-sesgo. Sin ejecución. |

## 4. Qué partes están incompletas

**Crítico** (sin esto el proyecto no funciona):

- **Capa de datos**: no hay base de datos, ni cliente Supabase, ni schema, ni migraciones, ni queries. Cero persistencia.
- **Autenticación**: no hay login, registro, sesión, ni control de acceso.
- **API o Server Actions**: no hay backend. No se puede crear, leer, actualizar ni eliminar nada.
- **Tests**: cero. No hay Vitest, Playwright, ni ningún framework de testing instalado.
- **CI/CD**: no hay GitHub Actions, ni Vercel Analytics, ni configuración de deploy.

**Importante** (bloquea flujos completos):

- **SPECS**: `specs/` está vacío. No hay ninguna especificación escrita a pesar de que DECISION-003 dice "toda funcionalidad comenzará con una SPEC".
- **Research funcional**: ninguna investigación puede comenzarse, ejecutarse ni concluirse.
- **Academy, Knowledge, Settings**: páginas placeholder sin contenido.
- **Assets estáticos**: `public/` vacío. Sin favicon, imágenes, logos, ni fuentes locales.

**Menor** (mejorable pero no bloquea):

- **Migración Tailwind v4**: el stack declarado usa TW v4, el proyecto usa v3 con PostCSS.
- **Migración ESLint v9**: usa v8 con configuración legacy.
- **Storybook HOME redirect**: `.storybook-home/` es overengineering para etapa v0.1.
- **Documentación huérfana**: 5 READMEs placeholder en subdirectorios de `docs/`.
- **Dos sistemas de botones**: `ui/button.tsx` (shadcn) y `design-system/buttons.tsx` (custom). Sin criterio de uso documentado.

## 5. Qué riesgos arquitectónicos detecta

**R1 — Abstracción prematura**: el diseño del dominio (10 entidades, 10 status enums, 296 líneas de metodología) fue completado antes de ejecutar una sola investigación real. Existe riesgo alto de que estas abstracciones no calcen con la práctica y requieran refactors profundos. La decisión R-001 (construir end-to-end) mitiga esto, pero aún no se ejecuta.

**R2 — Documentación como sustituto de implementación**: 17 archivos de documentación vs 0 funcionalidad ejecutable. Esto puede generar una falsa sensación de avance. El riesgo es que el equipo priorice pulir docs en vez de construir el loop de feedback funcional.

**R3 — Stack desalineado**: el perfil de la usuaria (`~/.claude/CLAUDE.md`) declara Next.js 16, Tailwind v4, shadcn/ui, AI SDK v6, Supabase. El proyecto usa Next.js 15, Tailwind v3, sin AI SDK, sin Supabase. Si no se alinea pronto, la divergencia será más costosa de corregir.

**R4 — Sin tests ni CI**: cualquier cambio en tipos, componentes o lógica de negocio no tiene protección. El riesgo de regression es alto incluso en cambios pequeños.

**R5 — Deuda de migración TW v4**: mientras más componentes se agreguen con sintaxis TW v3 (className, tailwind.config.ts, PostCSS), más costosa será la migración a v4 (CSS-first, `@import`, lightningcss).

**R6 — Design system sin consumidores**: los componentes existen, tienen stories, pero ninguna página los usa en contexto real. Esto oculta problemas de API, composición o rendimiento que solo aparecerán al integrarlos con datos reales.

## 6. Qué decisiones considera correctas

**D001 — Trading Engine en repo separado**: decisión correcta. La lógica de ejecución de trading es un dominio diferente (event-driven, baja latencia, conexión con brokers) que no debe acoplarse al research workspace. La separación evita que la complejidad operativa del trading contamine el ciclo de investigación.

**D002 — Investigación como entidad central (no Strategy)**: también correcta. En un laboratorio, lo que se produce son investigaciones, conclusiones y decisiones. Las estrategias son un output posible, no el core. Centrar el modelo en ResearchProject evita el sesgo de diseñar alrededor de "estrategias ganadoras".

**D003 — Stage-gates y estados de madurez epistémica**: el modelo de fases con gates (observación → framed → hypothesized → experimenting → validating → validated) impone disciplina. Específicamente, el estado "killed" e "inconclusive" son importantes porque normalizan que no toda investigación termina en una tesis accionable. Esto reduce el sesgo de publicación.

**D004 — Workspace Home como entrada principal (no Dashboard)**: la home es un centro de acción, no un panel de métricas. Esto es consistente con el propósito del producto: iniciar trabajo, no monitorear. El dashboard queda como herramienta secundaria.

**D005 — Decision R-001 (construir end-to-end primero)**: la decisión de priorizar una investigación funcional completa sobre documentación o migraciones es estratégicamente correcta y está bien justificada.

**D006 — shadcn/ui + CVA + cn + CSS variables**: el patrón de componentes con class-variance-authority, tailwind-merge y variables HSL es mantenible, tipado y escalable. Buena elección técnica.

**D007 — Dark theme por defecto**: consistente con herramientas de análisis financiero (Bloomberg Terminal, TradingView). No es moda, es funcional.

**D008 — Sidebar con indicador de ruta activa**: patrón simple, efectivo, sin estado global. Buena implementación.

## 7. Qué decisiones cuestionaría

**Q001 — ¿Por qué existen dos sistemas de botones?** `components/ui/button.tsx` (shadcn) y `components/design-system/buttons.tsx` (custom) resuelven lo mismo con APIs distintas. Si no hay un criterio documentado, el equipo no sabrá cuál usar. Recomendación: elegir uno (shadcn tiene mejor accesibilidad con Radix Slot) y eliminar el otro.

**Q002 — ¿Storybook con HOME redirect era necesario?** El script `HOME=.storybook-home` evita que Storybook escriba en `~/.storybook`. Para un proyecto unipersonal en etapa v0.1, esto es overengineering. Si el objetivo es no contaminar el home del dev, se puede usar `STORYBOOK_HOME=/tmp/storybook` en el script sin necesidad del directorio `.storybook-home/` versionado.

**Q003 — ¿docs/ está sobre-dividido?** Hay 17 archivos en `docs/` para una app sin funcionalidad. Específicamente: 5 READMEs placeholder (`docs/academy/`, `docs/adr/`, `docs/architecture/`, `docs/decisions/`, `docs/research/`) que no contienen información. 135 líneas en `dashboard-design-options.md` para una exploración de diseño que debería ser un issue/PR. `workspace-design.md` documenta una decisión ya tomada pero el resto del proyecto no sigue el mismo nivel de detalle, creando inconsistencia.

**Q004 — ¿La metodología de 296 líneas debería ser código, no documentación?** `docs/research-method.md` describe un pipeline stage-gate sofisticado. Si el objetivo es que se cumpla, debería estar codificado en el flujo de la aplicación (estados validados por tipo, transiciones controladas, gates con condiciones), no solo documentado. Mientras sea solo un markdown, es opcional.

**Q005 — ¿10 status enums era necesario antes de implementar?** Cada entidad tiene su propio status enum (`ResearchProjectStatus`, `ExperimentStatus`, `HypothesisStatus`, etc.). La mayoría son idénticos en estructura. Una alternativa más simple: un `ResearchStatus` genérico y reutilizable, o incluso usar string literal union type. La explosión de enums aumenta el mantenimiento sin beneficio claro hasta que las entidades existan.

**Q006 — ¿El layout con "lg:pl-72" hardcodeado escala?** El sidebar tiene ancho fijo 72 (w-72) y el main content usa `lg:pl-72`. Si en el futuro el sidebar cambia de ancho o se vuelve colapsable, habrá que actualizar ambos valores. Una variable CSS (`--sidebar-width`) sería más mantenible.

## 8. Qué información le falta para convertirse en el ingeniero principal del proyecto

Para poder implementar con confianza, necesito:

**Sobre visión y prioridades:**

- ~~VISION.md, ROADMAP.md, AI_TEAM.md no existen~~. No sé cuál es la visión de producto a 3/6/12 meses, ni el roadmap priorizado, ni si hay un equipo (humano o AI) con roles definidos.
- ¿La prioridad inmediata es construir investigación end-to-end (como dice R-001) o hay otro objetivo más urgente?

**Sobre decisiones técnicas concretas:**

- ¿Se usará Supabase como base de datos? (tu perfil lo dice, el proyecto no lo refleja).
- ¿Auth con Supabase, o otra opción?
- ¿Server Actions vs API routes vs tRPC?
- ¿ORM para Supabase? (Supabase JS client directo, Drizzle, Prisma, Kysely?)
- ¿Zod para validación runtime?
- ¿Testing framework preferido? (Vitest es el estándar en Next.js).
- ¿Tailwind v4 se migra antes de implementar la capa de datos, o después?

**Sobre investigación:**

- ¿Qué tipo de datos financieros se investigarán? (Crypto, equities, forex, futuros, todos?)
- ¿Fuentes de datos? (APIs de exchanges, feeds, archivos CSV, web scraping?)
- ¿Se necesita soporte para datos en tiempo real o basta con datos históricos?
- ¿El primer research project será sobre un tema concreto o es exploratorio?

**Sobre el workspace:**

- ¿El directorio `RESEARCH/` a nivel raíz del repo es independiente de la app Next.js, o debería integrarse? Hoy está fuera de `vero-quant-lab/`.
- ¿Los archivos de investigación (R-XXX/) se almacenarán en el repo (git) o en Supabase?

**Sobre operación:**

- ¿Hay algún contrato de API o diseño de interfaz para la capa de datos?
- ¿Hay preferencia por ciertos patrones de componentes Server vs Client?
- ¿Se espera un diseño responsivo completo o prioridad desktop?

Esta información es necesaria para tomar decisiones de implementación alineadas con lo que realmente se necesita, no con lo que yo asuma.
