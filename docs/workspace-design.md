# Workspace Home v1

## Cambio de dirección

Vero Quant Lab no usa el dashboard como pantalla principal. La ruta `/` ahora funciona como Workspace Home: un centro de operaciones sobrio para iniciar trabajo, no un panel de métricas.

## Decisiones tomadas

- La pantalla inicial prioriza intención y orientación: saluda a Verónica, presenta Vero Quant Lab y pregunta qué quiere hacer hoy.
- Se mantienen el Sidebar y Header existentes para conservar continuidad estructural.
- No se agregan gráficos, métricas falsas ni datos inventados.
- Las acciones principales se muestran como tarjetas discretas: Research, Trading, Academy, Knowledge y AI Copilot.
- Trading queda visible como destino futuro, pero marcado como integración pendiente.
- AI Copilot queda marcado como planificado, sin implementar funcionalidad.
- La sección `Trabajo actual` usa una tarjeta grande que comunica explícitamente que no hay datos reales todavía.
- `Estado del sistema` usa una lista textual con separadores sutiles para evitar parecer un dashboard analítico.

## Inspiración visual

La dirección combina Vercel y Linear:

- De Vercel: espacio amplio, jerarquía clara, bordes sutiles, bajo ruido visual.
- De Linear: estructura operativa, listas legibles, estados concretos y sensación de herramienta de trabajo.

## Animación

Las animaciones con Framer Motion son discretas:

- Entrada leve con opacidad y desplazamiento vertical pequeño.
- Delays cortos en las tarjetas para dar sensación de carga ordenada.
- Sin animaciones llamativas ni efectos que distraigan del contenido.

## Alcance excluido

- No se implementó Trading Dashboard.
- No se agregó autenticación.
- No se agregó base de datos.
- No se agregó IA.
- No se agregaron integraciones externas.
