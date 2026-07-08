# Project Review — Vero Quant Lab

**Fecha**: 2026-07-08
**Revisor**: Tech Lead
**Alcance**: Código fuente completo (`app/`, `components/`, `lib/`, `types/`, `docs/`)
**Propósito**: Auditoría técnica previa a fase Foundation (ROADMAP Q3 2026)

---

## 1. Arquitectura

### 🔴 Dos sistemas de botones en paralelo

`components/ui/button.tsx` (shadcn: CVA + Slot + variants) y `components/design-system/buttons.tsx` (custom: PrimaryButton + SecondaryButton) coexisten sin que ninguno se use en páginas reales. Ambas implementan lo mismo con API diferente. Genera confusión sobre cuál usar y duplica mantenimiento.

### 🔴 Sin capa de transporte de datos

No hay API routes, Server Actions, ni fetch. Todo el fetching ocurre inline en Server Components vía singletons que leen del filesystem. Esto imposibilita:
- Llamar a estos servicios desde client components
- Cachear respuestas con `cache()` o `revalidate`
- Deploy statico con datos actualizados

### 🟡 LabService sin interfaz

TradingService usa `TradingRepository` interface (inyección de dependencias). LabService lee `fs` directamente sin abstracción. Acopla la investigación al filesystem permanentemente.

### 🟡 Singleton services con efecto secundario

`getTradingService()` y `getLabService()` son singletons module-level. En desarrollo con hot reload persisten entre renders. En producción con multiple instancias de server, cada una tiene su propio singleton con datos posiblemente distintos.

### 🟢 Repository pattern en TradingService

`TradingService` recibe `TradingRepository` por constructor. Correcto. Permite swap a API, base de datos, o mocks en tests sin cambiar el service.

---

## 2. Organización del código

### 🔴 `types/domain.ts` es código muerto

155 líneas definiendo 10 entidades (ResearchProject, Experiment, Hypothesis, Paper, Strategy, Benchmark, Indicator, Trade, KnowledgeArticle, AcademyLesson) con 10 status enums. **Cero referencias** desde cualquier archivo del proyecto. Las tipos reales están en `lib/trading/types.ts` y `lib/lab/types.ts`. Este archivo es un vestigio de diseño conceptual no implementado que genera confusión.

### 🔴 `types/navigation.ts` es código muerto

Define `NavigationItem` con `LucideIcon`. La sidebar define su navigation array inline en `sidebar.tsx`.

### 🟡 Funciones helper duplicadas entre vistas

`Dot()`, `SectionHeading()`, `pnlClass()`, `pnlText()` existen idénticas en `dashboard-view.tsx` y `operations-view.tsx`. Deberían vivir en un archivo compartido.

### 🟡 Sin barrel exports para componentes de página

Cada página importa con ruta completa (`@/components/dashboard/dashboard-view`). El design system sí tiene barrel. Inconsistente.

### 🟢 Directorio plano y predecible

`components/dashboard/`, `components/layout/`, `components/operations/`, `components/research/` hacen obvio dónde buscar.

---

## 3. Acoplamiento

### 🔴 Páginas acopladas a singletons de servicio

`app/dashboard/page.tsx` llama a `getTradingService()` y `getLabService()` directamente. Para testear una página se necesita el filesystem real o mockear módulos completos.

### 🟡 LabService acoplado al filesystem

Lee `RESEARCH/` con `readdirSync`, `readFileSync`, `statSync`. No hay interfaz intermedia. Cambiar la fuente de datos requiere reescribir el service completo.

### 🟢 TradingService desacoplado del repositorio

`TradingService` no sabe si los datos vienen de JSONL, API, o base de datos. Solo conoce la interfaz.

---

## 4. Escalabilidad

### 🔴 Todos los datos se leen completos en cada request

`getTrades()` devuelve el array completo de trades. El repo no soporta `limit`/`offset`. El service llama `.slice(0, 5)` después de parsear todo el archivo. Con 10,000+ trades el tiempo de response se degrada linealmente.

### 🔴 Sin base de datos ni cache

JSONL + `.txt` no escalan para consultas. No hay `cache()`, no hay `unstable_noStore`, no hay `revalidate`. Cada request relee y parsea todos los archivos.

### 🟡 Sin paginación en el repositorio

`TradingRepository` no tiene métodos paginados. `getTrades(limit, offset)` no existe. Para agregar paginación hay que modificar la interfaz y la implementación.

---

## 5. Consistencia visual

### 🟡 `PageHeader` vs `PageTitle`

`components/layout/page-header.tsx` y `components/design-system/layout.tsx` → `PageTitle` son casi idénticas:
- PageHeader: `text-3xl` title, `text-sm` description
- PageTitle: `text-3xl sm:text-5xl` title, `text-sm sm:text-base` description

Todas las páginas usan PageHeader. Ninguna usa PageTitle. La documentación del design system recomienda PageTitle.

### 🟡 Color hardcodeado en Operations

`operations-view.tsx:130` usa `text-amber-400` para el ícono `AlertTriangle`. El design system define `text-amber-300` en `status.tsx:9` para el tono `pending`. Inconsistencia de 100 puntos en el canal Lightness.

### 🟡 Framer Motion aplicado inconsistentemente

`AppShell` anima el fade-in del main content. `WorkspaceHome` anima cards individuales con delays escalonados. El dashboard no tiene animaciones. Operations no tiene animaciones. Research no tiene animaciones. Tres enfoques distintos en un mismo proyecto.

### 🟢 Tema oscuro HSL consistente

Todas las variables CSS, configuración de Tailwind, y componentes manuales usan `hsl(var(--variable))`. No hay colores literales fuera del tema, excepto el caso de `text-amber-400`.

---

## 6. Consistencia de componentes

### 🔴 `StatCard` duplica `MetricCard`

`components/stat-card.tsx` es un componente independiente. `components/design-system/cards.tsx` exporta `MetricCard` que hace exactamente lo mismo (label + value + detail). StatCard se creó antes o al margen del design system.

### 🔴 Design system construido pero no consumido

De 7 familias de componentes en el design system (buttons, cards, feedback, layout, status, typography + barrel), **solo `StatusBadge` se usa en páginas reales**. El resto del design system existe solo en Storybook y documentación. Las páginas construyen sus propias variantes inline.

### 🟡 StatusBadge es el único puente

`dashboard-view.tsx`, `operations-view.tsx`, y `research-workspace.tsx` importan `StatusBadge` del design system. El `StatusDot` del design system **no se usa**: ambas vistas definen su propio `Dot()` inline.

### 🟢 API de StatusBadge/StatusDot consistente

5 tonos (`ready`, `pending`, `planned`, `neutral`, `danger`) con estilos definidos en un mapa. Si se empezara a consumir, la consistencia visual sería inmediata.

---

## 7. Código duplicado

### 🔴 `Dot()` — 2 implementaciones idénticas

- `dashboard-view.tsx:7-19`
- `operations-view.tsx:6-18`

Misma lógica de `size-2.5 rounded-full` con colores según string `"online" | "offline" | "unknown"`. El design system tiene `StatusDot` que hace lo mismo con `StatusTone`.

### 🔴 `SectionHeading()` — 2 implementaciones similares

- `dashboard-view.tsx:31-43` — versión con border + icon box + subtitle opcional
- `operations-view.tsx:30-37` — versión simplificada solo icon + title

Misma responsabilidad, distinta implementación visual.

### 🔴 `pnlClass()` y `pnlText()` — 2 implementaciones idénticas

Aparecen en ambos archivos con exactamente la misma lógica.

### 🔴 `Button` — 2 implementaciones que no se usan

`components/ui/button.tsx` (shadcn) y `components/design-system/buttons.tsx` (custom). Ninguna se importa en páginas.

### 🟡 `PageHeader` vs `PageTitle` — 2 implementaciones casi iguales

Difieren en responsive breakpoints y nombre de prop `eyebrow`.

---

## 8. Rendimiento

### 🟡 JSONL parseado completo en cada request

`readJsonl()` hace `split("\n")` → `filter(Boolean)` → `map(JSON.parse)` → `filter(null)`. Sin memoización. Operación O(n) en cada llamado.

### 🟡 Sin Suspense boundaries

Si un servicio tarda (por ejemplo, archivo JSONL grande), toda la página se bloquea. No hay `loading.tsx` por ruta ni `<Suspense>` por sección.

### 🟡 Sin streaming

Todas las páginas esperan a tener todos los datos antes de renderizar. Los datos de trading (rápidos) y los de lab (lectura de directorio) podrían mostrarse independientemente.

### 🟢 Server Components

Sin JavaScript del lado del cliente para fetching. Cero JS bundle para carga de datos.

---

## 9. Mantenibilidad

### 🔴 17 archivos de documentación vs ~500 líneas de componentes

Proporción ~3:1 docs:código. Muchos docs describen cosas que no existen en código:
- `docs/domain-model.md`: 10 entidades que no existen como tipos reales
- `docs/entity-relationship.md`: Diagrama ER de entidades no implementadas
- `docs/research-method.md`: 296 líneas sobre metodología de investigación no implementada
- `docs/research-workspace.md`: Filosofía de un módulo que solo lista directorios

Mantener docs sincronizados con código requiere disciplina que un proyecto solo-trader no tiene.

### 🟡 Sin tests

`specs/` vacío. Sin Vitest, Playwright, Testing Library, ni scripts de test en package.json. Refactorizar código duplicado requiere verificación manual.

### 🟡 Sin CI/CD

Sin GitHub Actions, Vercel analytics, o cualquier pipeline automatizado. Cada cambio se verifica manualmente con `next build`.

### 🟢 Strict TypeScript

`strict: true` en tsconfig. Previene toda una clase de bugs.

### 🟢 ESLint configurado

`next lint` disponible con `eslint-config-next`.

---

## 10. Riesgos técnicos

### 🔴 Static Site Generation congela los datos

`next.config.ts` está vacío. Sin `dynamic = 'force-dynamic'` o `revalidate`, `next build` genera HTML estático. Un dashboard desplegado mostraría "7 señales" permanentemente, aunque hayan ocurrido 20 trades nuevos. Para un trader que depende de estos datos, es catastrófico.

### 🔴 Filesystem reads en producción cloud

`JsonTradingRepository` lee de `~/Desktop/Trading/`. `LabService` lee de `process.cwd() + "/RESEARCH"`. En Vercel:
- No hay `~/Desktop/` — todas las llamadas fallan
- `RESEARCH/` existe en el build pero no se actualiza en runtime

Deployar a Vercel sin resolver esto causa fallo completo del Dashboard, Operations, y Research.

### 🟡 Sin manejo de errores por página

Si `TradingService` lanza (JSONL malformado, archivo faltante), toda la página crashea. No hay `<ErrorBoundary>` ni `error.tsx` por ruta.

### 🟡 Sin autenticación

Intencional (solo-trader, local), pero el roadmap menciona Vercel + Supabase. Si se despliega en web sin auth, cualquier persona con la URL ve datos de trading en vivo.

### 🟡 Sin loading states

No hay `loading.tsx` en ninguna ruta. La primera visita puede mostrar pantalla en blanco mientras se leen y parsean los archivos.

### 🟢 Sin dependencias externas de red

No hay APIs, no hay base de datos remota, no hay auth tokens. La app funciona 100% offline. Cero riesgo de API rate limits o expiración de credenciales.

---

## Resumen por severidad

| Severidad | Conteo | Hallazgos clave |
|-----------|--------|-----------------|
| 🔴 Crítico | 13 | SSG congela datos; filesystem falla en Vercel; sin tests; dos sistemas de botones; 4 funciones duplicadas; `types/domain.ts` muerto; sin capa de transporte; sin paginación en repo; `StatCard` duplica `MetricCard`; design system no consumido; páginas acopladas a singletons |
| 🟡 Mejorable | 19 | LabService sin interfaz; singletons con side effects; helper functions duplicadas; PageHeader vs PageTitle; color hardcodeado; Framer Motion inconsistente; JSONL sin cache; sin Suspense; 17 docs vs 500 líneas de código; sin CI; sin loading states; barrel exports faltantes; sin streaming |
| 🟢 Correcto | 7 | Repository pattern en TradingService; Strict TypeScript; ESLint configurado; Server Components; dark theme HSL consistente; StatusBadge API con 5 tonos; sin dependencias externas de red |

---

## Próximas acciones recomendadas

1. **🔴** Agregar `dynamic = 'force-dynamic'` en todas las rutas operativas (`/dashboard`, `/operations`, `/research`, `/`)
2. **🔴** Resolver dependencia de filesystem local (`~/Desktop/Trading/`) antes de cualquier deploy
3. **🔴** Consolidar los dos sistemas de botones en uno
4. **🔴** Eliminar código muerto (`types/domain.ts`, `types/navigation.ts`)
5. **🔴** Eliminar duplicación de `Dot`, `SectionHeading`, `pnlClass`, `pnlText`
6. **🟡** Integrar design system en páginas (empezar por `Card`/`MetricCard` y `PageTitle`)
7. **🟡** Agregar interfaz a LabService
8. **🟡** Agregar paginación a `TradingRepository`
9. **🟡** Configurar Vitest y test básico del TradingService
10. **🟢** Mantener el repository pattern actual
