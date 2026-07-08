# Domain Model

Este documento define el modelo de dominio de Vero Quant Lab. No describe implementacion, base de datos, APIs ni comportamiento de aplicacion.

## Entidades

## Research Project

### Proposito

Agrupar una linea de investigacion con objetivo, pregunta, fuentes, hipotesis, experimentos y estrategias derivadas.

### Atributos principales

- `id`
- `title`
- `summary`
- `status`
- `objective`
- `researchQuestion`
- `tags`
- `createdAt`
- `updatedAt`

### Relaciones

- Contiene muchas `Hypothesis`.
- Contiene muchos `Experiment`.
- Referencia muchos `Paper`.
- Puede producir muchas `Strategy`.
- Puede alimentar muchos `Knowledge Article`.
- Puede estar relacionado con muchas `Academy Lesson`.

### Ciclo de vida

`draft` -> `active` -> `paused` -> `completed` -> `archived`

## Experiment

### Proposito

Validar o invalidar hipotesis mediante una metodologia definida y parametros observables.

### Atributos principales

- `id`
- `title`
- `summary`
- `status`
- `methodology`
- `parameters`
- `conclusion`
- `createdAt`
- `updatedAt`

### Relaciones

- Pertenece a un `Research Project`.
- Puede validar una o muchas `Hypothesis`.
- Puede evaluar una `Strategy`.
- Puede producir uno o muchos `Benchmark`.

### Ciclo de vida

`planned` -> `running` -> `completed` -> `invalidated` -> `archived`

## Hypothesis

### Proposito

Expresar una afirmacion investigable que puede ser validada, rechazada o archivada.

### Atributos principales

- `id`
- `title`
- `statement`
- `rationale`
- `validationCriteria`
- `status`
- `outcome`
- `createdAt`
- `updatedAt`

### Relaciones

- Pertenece a un `Research Project`.
- Puede estar sustentada por muchos `Paper`.
- Puede ser evaluada por muchos `Experiment`.

### Ciclo de vida

`draft` -> `active` -> `validated` -> `rejected` -> `archived`

## Paper

### Proposito

Registrar una fuente academica o tecnica estudiada y conectarla con investigacion, hipotesis y conocimiento reutilizable.

### Atributos principales

- `id`
- `title`
- `authors`
- `source`
- `publishedAt`
- `url`
- `status`
- `notes`
- `tags`

### Relaciones

- Puede referenciarse desde muchos `Research Project`.
- Puede sustentar muchas `Hypothesis`.
- Puede alimentar muchos `Knowledge Article`.

### Ciclo de vida

`queued` -> `reading` -> `studied` -> `referenced` -> `archived`

## Strategy

### Proposito

Representar una idea operacional de trading derivada de investigacion y preparada para evaluacion futura.

### Atributos principales

- `id`
- `title`
- `summary`
- `status`
- `thesis`
- `marketTypes`
- `timeframes`
- `riskModel`
- `createdAt`
- `updatedAt`

### Relaciones

- Puede derivar de un `Research Project`.
- Puede evaluarse en muchos `Experiment`.
- Puede usar muchos `Indicator`.
- Puede tener muchos `Benchmark`.
- Puede originar muchos `Trade`.
- Puede estar documentada en muchos `Knowledge Article`.

### Ciclo de vida

`draft` -> `researching` -> `testing` -> `approved` -> `retired`

## Benchmark

### Proposito

Registrar una evaluacion comparativa de una estrategia o experimento contra una referencia definida.

### Atributos principales

- `id`
- `title`
- `status`
- `timeframe`
- `marketType`
- `baseline`
- `resultSummary`
- `executedAt`

### Relaciones

- Puede pertenecer a una `Strategy`.
- Puede originarse desde un `Experiment`.

### Ciclo de vida

`planned` -> `running` -> `completed` -> `failed` -> `archived`

## Indicator

### Proposito

Definir una senal, formula o variable usada por estrategias o experimentos.

### Atributos principales

- `id`
- `title`
- `summary`
- `status`
- `formula`
- `parameters`
- `timeframes`
- `tags`

### Relaciones

- Puede ser usado por muchas `Strategy`.

### Ciclo de vida

`draft` -> `testing` -> `approved` -> `deprecated`

## Trade

### Proposito

Representar una operacion individual asociada o no a una estrategia.

### Atributos principales

- `id`
- `title`
- `status`
- `symbol`
- `marketType`
- `side`
- `entryPrice`
- `exitPrice`
- `openedAt`
- `closedAt`
- `notes`

### Relaciones

- Puede estar asociado a una `Strategy`.

### Ciclo de vida

`planned` -> `open` -> `closed` -> `cancelled`

## Knowledge Article

### Proposito

Documentar conocimiento reutilizable, arquitectura, conceptos, decisiones o aprendizajes.

### Atributos principales

- `id`
- `title`
- `slug`
- `summary`
- `status`
- `category`
- `contentSummary`
- `tags`

### Relaciones

- Puede relacionarse con muchos `Research Project`.
- Puede referenciar muchos `Paper`.
- Puede documentar muchas `Strategy`.
- Puede alimentar muchas `Academy Lesson`.

### Ciclo de vida

`draft` -> `reviewing` -> `published` -> `archived`

## Academy Lesson

### Proposito

Representar una unidad educativa del modulo Academy.

### Atributos principales

- `id`
- `title`
- `summary`
- `status`
- `module`
- `order`
- `learningObjectives`
- `tags`

### Relaciones

- Puede apoyarse en muchos `Knowledge Article`.
- Puede derivar de uno o muchos `Research Project`.

### Ciclo de vida

`draft` -> `reviewing` -> `published` -> `archived`
