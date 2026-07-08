# Dashboard Design Options

## Analisis actual

El proyecto ya tiene una base limpia: App Router, layout con sidebar fija, header superior, tema oscuro, tokens tipo shadcn/ui y un dashboard minimo con `PageHeader` + tres `StatCard`.

La restriccion importante es que todavia no hay datos reales, autenticacion, base de datos ni IA, asi que el dashboard debe sentirse como una consola profesional sin prometer funcionalidad inexistente.

## Alternativa 1: Vercel-Inspired

Enfoque: dashboard sobrio, modular, mucho espacio negativo, cards limpias, metricas arriba y actividad reciente abajo.

```txt
┌─────────────────────────────────────────────────────────────┐
│ Header: Vero Quant Lab Studio                       Search  │
├───────────────┬─────────────────────────────────────────────┤
│ Sidebar       │ Dashboard                                   │
│               │ Studio overview                             │
│ Dashboard     │                                             │
│ Research      │ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ Academy       │ │Research  │ │Academy   │ │Knowledge │      │
│ Knowledge     │ │04        │ │12        │ │28        │      │
│ Settings      │ └──────────┘ └──────────┘ └──────────┘      │
│               │                                             │
│               │ ┌──────────────────────┐ ┌────────────────┐ │
│               │ │ Recent work          │ │ System status  │ │
│               │ │ - Strategy notes     │ │ Ready          │ │
│               │ │ - Research draft     │ │ No integrations│ │
│               │ │ - Academy outline    │ │ Local only     │ │
│               │ └──────────────────────┘ └────────────────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

### Ventajas

- Encaja muy bien con el estado actual del proyecto.
- Se puede construir con componentes simples y tipados.
- Da sensacion de producto serio sin inventar data.
- Mantiene bajo el costo visual y tecnico.

### Riesgo

- Puede sentirse demasiado generico si no se agregan senales propias de Vero Quant Lab.

## Alternativa 2: Linear-Inspired

Enfoque: operativo, denso, orientado a flujos de trabajo. Dashboard como centro de tareas, investigacion, prioridades y progreso.

```txt
┌─────────────────────────────────────────────────────────────┐
│ Header: Workspace / Dashboard                       Search  │
├───────────────┬─────────────────────────────────────────────┤
│ Sidebar       │ Dashboard                                   │
│               │                                             │
│ Dashboard     │ ┌─────────────────────────────────────────┐ │
│ Research      │ │ Focus Queue                             │ │
│ Academy       │ │ ● Research framework setup              │ │
│ Knowledge     │ │ ● Academy curriculum outline            │ │
│ Settings      │ │ ● Knowledge taxonomy                    │ │
│               │ └─────────────────────────────────────────┘ │
│               │                                             │
│               │ ┌──────────────┐ ┌──────────────┐          │
│               │ │ Research     │ │ Academy      │          │
│               │ │ 4 streams    │ │ 12 modules   │          │
│               │ └──────────────┘ └──────────────┘          │
│               │                                             │
│               │ ┌─────────────────────────────────────────┐ │
│               │ │ Recent Activity                         │ │
│               │ │ Today / This week / Backlog             │ │
│               │ └─────────────────────────────────────────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

### Ventajas

- Muy apropiado si Vero Quant Lab sera una herramienta de trabajo recurrente.
- Prioriza claridad, seguimiento y estados.
- Escala bien cuando existan research streams, modulos y notas reales.

### Riesgo

- Sin datos persistentes todavia, algunas secciones podrian sentirse simuladas.
- Requiere definir mejor el modelo mental: tareas, streams, estados, prioridades.

## Alternativa 3: Raycast-Inspired

Enfoque: command center. Layout compacto, busqueda visual, accesos rapidos y acciones principales.

```txt
┌─────────────────────────────────────────────────────────────┐
│ Header: Vero Quant Lab Studio                       Search  │
├───────────────┬─────────────────────────────────────────────┤
│ Sidebar       │ ┌─────────────────────────────────────────┐ │
│               │ │ What do you want to open?               │ │
│ Dashboard     │ │ Search research, lessons, notes...      │ │
│ Research      │ └─────────────────────────────────────────┘ │
│ Academy       │                                             │
│ Knowledge     │ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│ Settings      │ │ New note   │ │ New module │ │ Research │ │
│               │ └────────────┘ └────────────┘ └──────────┘ │
│               │                                             │
│               │ ┌─────────────────────────────────────────┐ │
│               │ │ Quick Open                              │ │
│               │ │ Cmd Research                            │ │
│               │ │ Cmd Academy                             │ │
│               │ │ Cmd Knowledge                           │ │
│               │ └─────────────────────────────────────────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

### Ventajas

- Se siente moderno y rapido.
- Muy bueno si el producto futuro sera una estacion de comando.
- Funciona bien con Lucide y Framer Motion.

### Riesgo

- Puede sugerir funcionalidades de busqueda o acciones que aun no existen.
- Mas dificil de justificar sin command palette real o datos navegables.

## Recomendacion

Recomiendo la alternativa **Linear-Inspired con disciplina visual tipo Vercel**.

La razon: Vero Quant Lab suena mas a workspace profesional de investigacion y aprendizaje que a landing o launcher. El dashboard deberia responder: "que esta activo, que requiere atencion, que se esta construyendo". Linear aporta estructura operativa; Vercel aporta sobriedad visual. Raycast seria atractivo mas adelante, cuando exista command palette real, busqueda funcional o acciones rapidas.

## Direccion recomendada

- Mantener sidebar + header actual.
- Dashboard con una fila de metricas.
- Agregar una seccion principal `Focus Queue` o `Current Work`.
- Agregar paneles secundarios: `Research streams`, `Academy progress`, `Knowledge base`.
- Usar cards discretas, bordes finos, fondo oscuro, tipografia Inter y acentos teal/purple ya definidos.
- Evitar graficos falsos por ahora. Mejor estados textuales y listas claras.
