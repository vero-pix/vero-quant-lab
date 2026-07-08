# VQL Design System v1

## Filosofia del diseño

El Design System de Vero Quant Lab existe para que todo el producto se sienta como una misma herramienta: sobria, precisa y preparada para trabajo profundo.

La direccion visual combina la claridad de Vercel con la disciplina operativa de Linear. El sistema evita ornamentos innecesarios, metricas falsas y componentes que prometan funcionalidades no implementadas.

## Principios

- Consistencia antes que variedad: los mismos patrones deben repetirse en Workspace, Research, Academy, Knowledge y futuras superficies.
- Baja friccion visual: mucho espacio, bordes sutiles, contraste suficiente y jerarquia clara.
- Componentes pequenos y tipados: cada pieza debe tener una responsabilidad clara.
- Estados explicitos: Ready, Pending, Planned y otros estados deben mostrarse de forma consistente.
- Sin datos inventados: las cards deben poder representar estados vacios con honestidad.
- Crecimiento gradual: nuevas pantallas deben componerse desde esta base antes de crear variantes.

## Componentes disponibles

### Layout

- `AppContainer`: contenedor raiz para superficies de aplicacion.
- `ContentContainer`: contenedor centrado con anchos estandar.
- `Section`: bloque semantico con espaciado consistente.
- `PageTitle`: encabezado de pagina con eyebrow, titulo y descripcion.

### Cards

- `Card`: tarjeta base con borde sutil y fondo del sistema.
- `MetricCard`: tarjeta para metricas reales.
- `ActionCard`: tarjeta accionable para entradas de modulo o workflow.
- `EmptyStateCard`: tarjeta grande para comunicar ausencia de datos reales.
- `StatusCard`: tarjeta de estados en formato lista.

### Status

- `StatusBadge`: badge textual con tono visual.
- `StatusDot`: punto de estado para listas densas.

Tonos disponibles:

- `ready`
- `pending`
- `planned`
- `neutral`
- `danger`

### Buttons

- `PrimaryButton`: accion principal.
- `SecondaryButton`: accion secundaria o complementaria.

### Typography

- `DisplayTitle`: titulo principal.
- `SectionTitle`: titulo de seccion.
- `Caption`: texto corto en mayusculas para etiquetas y contexto.

### Feedback

- `ComingSoon`: bloque para funcionalidades planificadas.
- `EmptyState`: estado vacio reutilizable.

## Ejemplos de uso

### Page shell

```tsx
import { ContentContainer, PageTitle, Section } from "@/components/design-system";

export function ExamplePage() {
  return (
    <ContentContainer>
      <Section>
        <PageTitle
          eyebrow="Research"
          title="Research workspace"
          description="Superficie para investigaciones y experimentos."
        />
      </Section>
    </ContentContainer>
  );
}
```

### Action card

```tsx
import { Brain } from "lucide-react";
import { ActionCard } from "@/components/design-system";

export function ResearchAction() {
  return (
    <ActionCard
      title="Research"
      description="Continuar investigaciones y experimentos."
      icon={Brain}
      status="Ready"
      statusTone="ready"
    />
  );
}
```

### Status card

```tsx
import { StatusCard } from "@/components/design-system";

export function SystemStatus() {
  return (
    <StatusCard
      title="Estado del sistema"
      items={[
        { label: "Research", value: "Ready", tone: "ready" },
        { label: "Trading Engine", value: "Pending Integration", tone: "pending" },
        { label: "AI Copilot", value: "Planned", tone: "planned" },
      ]}
    />
  );
}
```

### Empty state

```tsx
import { EmptyState } from "@/components/design-system";

export function EmptyProjects() {
  return (
    <EmptyState
      title="Trabajo actual"
      description="El Workspace esta preparado para recibir proyectos cuando existan datos reales."
    />
  );
}
```

## Buenas practicas

- Usar `PageTitle` para encabezados de pagina y `SectionTitle` para bloques internos.
- Usar `StatusBadge` o `StatusDot` siempre que se muestre un estado.
- Usar `EmptyState` o `EmptyStateCard` cuando no existan datos reales.
- Usar `MetricCard` solo para metricas reales, verificables y actuales.
- Mantener los bordes sutiles y evitar backgrounds decorativos.
- No crear variantes visuales nuevas hasta comprobar que no existe un componente reutilizable.
- No introducir nuevas funcionalidades desde componentes del Design System.
