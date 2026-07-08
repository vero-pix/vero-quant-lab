# ROADMAP — Vero Quant Lab

Última actualización: 8 Julio 2026

## Dónde estamos: V1.2 — Laboratorio operativo

La base está construida y en uso. Módulos vivos: Dashboard, Operations, Research, Knowledge, Academy, Guardian. Integración real de Trading Engine y Binance. Identidad visual "Guardian sereno". El foco ya no es construir pantallas: es **conectar el laboratorio con la operación real y convertir el historial en aprendizaje**.

Ciclo de trabajo: investigación → decisión → implementación → medición → nueva investigación.

---

## Fase actual — Simulador A+ (carril 1)

**Objetivo:** entender el A+ moviendo sus parámetros y viendo el efecto en riesgo/retorno, con data real.

- Componente interactivo sobre `aplus-features.json` (4.899 velas). Interacción primero.
- Métricas en vivo: señales/día, win rate, profit factor, neto. Curva de equity.
- Capa de narrativa que enseña (no solo números).

**Entregable:** simulador usable en `/simulador`, reutilizable en Academy.

---

## Próxima — Simulador A+ (carril 2): espejo conductual

**Objetivo:** convertir el historial real en el material de aprendizaje más honesto.

- Normalizar el historial (4.811 ejecuciones, multi-instrumento) en un dataset limpio.
- WR por condición (instrumento, con/sin stop, seguidilla, hora).
- Simulador contrafactual: "¿qué habría cambiado con stop / con el límite diario del Guardian?".
- Framing constructivo, no de culpa.

**Entregable:** el círculo cerrado — el historial prueba las reglas, el Guardian las hace cumplir, Academy las enseña.

---

## Diseño y experiencia

- Tema claro + toggle (dashboard oscuro, Academy clara).
- Colores de datos consistentes (`--up`/`--down`/`--signal`) en todos los gráficos.
- Lightweight Charts para el chart de precio anotado (estilo Binance).

---

## Seguridad y despliegue

- **Keys Binance read-only** (reemplazar las de ejecución temporales). Prerequisito de todo lo demás.
- **Vercel (camino B):** dashboard real accesible desde afuera. Requiere read-only keys + protección con password + API HTTP del VPS para la data real.

---

## Integraciones reales (quitar mocks)

- **API HTTP del VPS** → Operations, Telegram y el estado de servicios del Guardian dejan de ser mock.
- **Limpiar el bot de Telegram** → quitar referencias a Capital, dejarlo Binance-only.

---

## Academy

- Convertir cada regla de oro del A+ (no perseguir, no promediar, RSI 62–70, tomar ganancia en sobrecompra) en una lección interactiva con el simulador embebido.

---

## Refinamientos (menores)

- Automatizar el snapshot de equity de apertura (hoy captura al primer load del día).
- Revisar el piso de $5 del límite diario para cuentas chicas (hoy domina sobre el 10%).
- Homologar LabService al patrón adapter (diferido).

---

## Criterios

- No se agregan pantallas sin necesidad real ni funciones "por si acaso".
- Cada fase deja algo usable a diario.
- Seguridad (keys, exposición) tiene prioridad sobre features.
