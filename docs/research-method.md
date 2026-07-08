# Research Method

Este documento define el metodo de investigacion de Vero Quant Lab. No describe
implementacion, base de datos, APIs ni comportamiento de aplicacion. Complementa
a `domain-model.md`: donde ese documento define las entidades, este define las
reglas que las gobiernan.

## Principio

Vero Quant Lab no es una plataforma de trading. Es un laboratorio donde una idea
termina convirtiendose (o no) en una estrategia operable.

El activo que acumula el laboratorio no son estrategias: es conocimiento con
procedencia. Una investigacion honesta que concluye "esto no tiene edge" es un
exito, no un fracaso. El rendimiento no se mide en estrategias producidas, sino
en preguntas cerradas con evidencia.

El metodo existe para construir friccion deliberada entre tener una idea y
creerle. La ciencia lo llama pre-registro; el machine learning lo llama holdout;
un fondo lo llama comite de riesgo. Es el mismo mecanismo: comprometerse con el
criterio de exito antes de ver el resultado.

## Entidad central

La entidad principal del sistema es `Research Project` (la Investigacion), no
`Strategy`.

La `Strategy` es un output posible de una Investigacion, no su razon de ser.
Poner la Investigacion al centro define la identidad del producto: el foso no es
el backtesting, que es commodity, sino la honestidad epistemica
institucionalizada.

## Que nace primero

El orden natural del origen de una investigacion es:

```
OBSERVACION  ->  PREGUNTA  ->  (Paper / Idea como insumos)  ->  HIPOTESIS  ->  Experimento
   (que vi)      (que no        (que ya se sabe                 (afirmacion
                  entiendo)       de esto)                        falsable)
```

- La `Observation` nace primero. Material crudo, no compromete nada.
- La `Research Question` convierte la observacion en algo investigable sin
  asumir la respuesta.
- `Paper` e `Idea` son insumos que entran aqui, no el origen.
- La `Hypothesis` llega despues, ya con criterio de validacion escrito.

Regla: no se puede crear una `Hypothesis` sin un `Research Project` padre que
tenga `researchQuestion` definida. Empezar por la hipotesis es una respuesta
disfrazada de pregunta y arrastra sesgo de confirmacion desde el inicio.

## El embudo de fases y puertas

Una investigacion evoluciona como un embudo con puertas (stage-gates), no como
una lista de tareas. Cada puerta exige evidencia para pasar. En cada puerta,
matar es una salida legitima.

```
Observacion
   |
   v  [Gate 0: la pregunta es investigable y no trivial?]
Pregunta formalizada
   |
   v  [Gate 1: hay hipotesis falsable con criterio pre-registrado?]
Hipotesis + criterios de validacion (CONGELADOS)
   |
   v  [Gate 2: diseno de experimento, split de datos definido antes de mirar]
Experimento in-sample / exploracion
   |
   v  [Gate 3: sobrevive out-of-sample sin re-tuneo?]   <- la puerta que mata la mayoria
Validacion out-of-sample
   |
   v  [Gate 4: el efecto es economicamente real tras costos, no solo estadistico?]
Candidata a Strategy
   |
   v  [Gate 5: comite de riesgo: capacidad, drawdown, correlacion con lo existente]
Strategy aprobada -> elegible para Trading Engine
```

La evolucion no es siempre lineal: una hipotesis rechazada puede generar una
nueva observacion. Ese feedback loop se captura; el aprendizaje de una hipotesis
muerta es un activo.

## Estados de madurez

El ciclo de vida de `Research Project` refleja madurez epistemica, no actividad
administrativa. Un proyecto puede estar activo toda la vida sin avanzar en
conocimiento; el estado debe distinguir esas situaciones.

| Estado          | Significado                                         | Puerta      |
| --------------- | -------------------------------------------------- | ----------- |
| `observation`   | idea cruda capturada                               | -           |
| `framed`        | pregunta formalizada                               | Gate 0      |
| `hypothesized`  | hipotesis con criterio congelado                   | Gate 1      |
| `experimenting` | corriendo experimentos in-sample                   | Gate 2      |
| `validating`    | probando out-of-sample                             | Gate 3      |
| `validated`     | supero OOS y significancia economica               | Gate 4      |
| `promoted`      | derivo una `Strategy` formal                       | Gate 5      |
| `killed`        | rechazada, con conclusion escrita obligatoria      | cualquiera  |
| `inconclusive`  | sin poder para concluir (datos / tiempo)           | cualquiera  |
| `archived`      | cerrada y guardada como conocimiento               | -           |

`killed` e `inconclusive` no son sinonimos de `archived`. Son resultados
cientificos. La diferencia entre "lo rechace porque la evidencia dice no" y "no
pude concluir" es informacion valiosa que la plataforma debe preservar.

El estado `killed` exige un campo `conclusion` no vacio para poder guardarse.
Matar sin aprendizaje esta prohibido por diseno.

## Cuando una Investigacion se convierte en Strategy

La conversion ocurre en el Gate 4, y solo si se cumplen simultaneamente:

1. Hipotesis validada con los criterios congelados antes de ver resultados, no
   ajustados a posteriori.
2. Evidencia out-of-sample: al menos un `Experiment` con resultado sobre datos
   no usados para construir o tunear la senal.
3. Significancia economica, no solo estadistica: el edge sobrevive a costos de
   transaccion, slippage y latencia realistas.
4. Tesis mecanica articulada (`thesis`): por que existe el edge en terminos de
   estructura de mercado. Sin mecanismo plausible, es data-mining con suerte.

La transicion `Research Project (validated) -> Strategy (draft)` es un acto
explicito y trazable, con la evidencia adjunta. La `Strategy` nace con un enlace
permanente a la investigacion y los experimentos que la justifican.

## Cuando una Strategy puede entrar al Trading Engine

Es una puerta distinta y mas dura que la anterior (Gate 5), equivalente al
comite de riesgo de un fondo. Validar que hay edge no es lo mismo que autorizar
capital. Una `Strategy` pasa de `approved` a elegible cuando cumple:

1. Robustez, no solo rentabilidad: sensibilidad parametrica suave. Mover el
   parametro alrededor de +/-20% no colapsa el resultado.
2. Perfil de riesgo definido (`riskModel`): max drawdown esperado, tamano de
   posicion y kill-switch pre-definido.
3. Capacidad y decay: cuanto capital admite antes de mover el mercado, y
   monitoreo de degradacion del edge en el tiempo.
4. No-redundancia: correlacion baja con las estrategias ya activas.
5. Autorizacion explicita: un gate humano final. La maquina propone; el comite
   dispone.

Separacion de poderes: el modulo Research nunca mueve capital, solo produce
`Strategy` aprobadas. El Trading Engine nunca investiga, solo ejecuta lo
autorizado. Esa frontera protege contra el peor pecado: ajustar la investigacion
para justificar una operacion que ya se queria hacer.

## Metricas minimas para aprobar una Investigacion

Dos umbrales, ambos obligatorios.

Umbral estadistico (Gate 3):

- Resultado out-of-sample en datos jamas usados para construir la senal.
  Innegociable.
- Significancia ajustada por multiplicidad. Si se probaron muchas variantes, se
  corrige (por ejemplo Deflated Sharpe Ratio). Celebrar el mejor de N backtests
  como si fuera el unico es el pecado numero uno del quant.
- Estabilidad temporal: el edge aparece en multiples sub-periodos, no en un solo
  regimen.

Umbral economico (Gate 4):

- Sharpe out-of-sample neto de costos por encima de un minimo pre-definido.
- Retorno que sobrevive a costos realistas: comisiones, slippage, spread.
- Max drawdown y tiempo de recuperacion dentro de tolerancia.
- Capacidad minima relevante para la escala del laboratorio.

Estas metricas viven en `Benchmark`. Sin registrar `numVariantsTested` no es
posible defenderse del data-mining.

Metrica meta del laboratorio: la tasa de investigaciones que se matan. Un
laboratorio sano mata la mayoria. Una tasa alta de `validated` no indica
talento, indica credulidad.

## Como evitar el sesgo de confirmacion

No se logra con disciplina personal, que siempre falla, sino con arquitectura
que hace dificil hacer trampa. Seis mecanismos:

1. Pre-registro: los `validationCriteria` de la hipotesis se congelan antes de
   correr el experimento y quedan con timestamp. Cambiar el criterio despues de
   ver resultados queda marcado como revision visible, nunca se borra.
2. Holdout sagrado: el split out-of-sample se define antes de mirar, y el sistema
   cuenta cuantas veces se toco el holdout. Cada mirada lo contamina.
3. Contador de intentos (`numVariantsTested`): hace visible el data-mining y
   permite deflactar la significancia.
4. Hipotesis nula por defecto: el estado inicial de toda hipotesis es "no hay
   edge". La carga de la prueba recae en demostrar lo contrario.
5. Red-team obligatorio: antes de promover una `Strategy`, un paso donde se
   escribe por que esto podria estar equivocado (overfitting, look-ahead bias,
   survivorship, un solo regimen). Campo obligatorio, no opcional.
6. El kill como exito: matar una hipotesis con evidencia se trata igual que
   validar. Si matar se siente como fracaso, se dejaran de matar ideas y se
   empezaran a forzar validaciones.

El sesgo de confirmacion no se combate pensando mejor, sino quitando la
posibilidad de mentirse. El producto es el compromiso previo hecho software.

## Workflow completo

```
FASE 0 - CAPTURA        Observacion cruda -> Research Project
                        (sin compromiso, bajo costo de entrada)

FASE 1 - ENCUADRE       Pregunta de investigacion formalizada
                        Papers / Ideas como insumos     GATE 0

FASE 2 - HIPOTESIS      Afirmacion falsable + criterios CONGELADOS
                        estado nulo = "no edge"          GATE 1

FASE 3 - DISENO         Experimento: metodologia + split de datos
                        define holdout ANTES             GATE 2

FASE 4 - EXPLORACION    Corre in-sample. Itera. Cuenta variantes.
                        numVariantsTested++  (holdout intacto)

FASE 5 - VALIDACION OOS Toca el holdout una vez. Benchmark.
                        deflacta por multiplicidad       GATE 3
                        -> la mayoria muere aqui (killed)

FASE 6 - REALIDAD ECON. Costos, slippage, capacidad, drawdown
                        red-team obligatorio             GATE 4
                        -> nace Strategy (draft)

FASE 7 - COMITE RIESGO  Robustez, kill-switch, no-redundancia
                        autorizacion humana              GATE 5
                        -> elegible Trading Engine

FASE 8 - CONOCIMIENTO   Todo resultado (validado, killed, inconclusive)
                        -> Knowledge Article + Academy
                        el aprendizaje se destila, la procedencia queda
```

Feedback loop: un `killed` puede generar una nueva `Observation`.

El conocimiento (Fase 8) no es opcional ni final: captura todos los caminos,
incluidos los muertos. Ahi esta el compounding del laboratorio; cada
investigacion, viva o muerta, deja sedimento reutilizable.

## Ajustes al modelo de dominio

El modelo de `domain-model.md` es la base correcta. El metodo requiere estos
ajustes para codificar la disciplina. Se listan como direccion, no como
implementacion.

### Research Project

- Reemplazar el ciclo administrativo (`draft -> active -> paused -> completed`)
  por el ciclo de madurez descrito arriba.
- Anadir `observation` (u `origin`) como campo de origen.

### Hypothesis

- `criteriaFrozenAt`: timestamp del congelamiento de criterios.
- `criteriaRevisions`: historial visible de cambios, solo apilable, nunca
  borrable.
- `outcome` con distincion explicita: `validated | rejected | inconclusive`.
- Estado nulo por defecto: "sin edge hasta demostrar lo contrario".

### Experiment

- `datasetSplit`: definicion in-sample / out-of-sample, congelada.
- `holdoutTouchCount`: cuantas veces se evaluo contra el holdout.
- `numVariantsTested`: contador contra el data-mining.
- `redTeamNotes`: el "por que esto podria estar mal", obligatorio antes de
  promover.

### Benchmark

- Enriquecer con metricas duras: `sharpeOOS`, `maxDrawdown`, `sampleSize`,
  `costModel`, `deflatedSharpe`. Sin esto, `approved` es una opinion, no un
  veredicto.

### Decision (entidad nueva, ligera)

- Registra cada paso por una puerta: que decidio, con que evidencia, en que
  fecha, y el resultado (`pass | kill | inconclusive`).
- Es el libro de actas del laboratorio. Da procedencia total y hace auditable
  por que una estrategia llego a produccion.

### Frontera de poderes

- La `Strategy` aprobada es el unico puente entre Research y Trading Engine.
  Ninguna otra entidad cruza. Es un invariante del dominio.

## Idea de fondo

Cualquiera puede construir un backtester. Lo que casi nadie construye, y lo que
hace a Vero Quant Lab un laboratorio y no una plataforma de trading, es el
sistema inmune contra la propia esperanza: el pre-registro, el holdout contado,
el kill celebrado, la procedencia total.

La metrica de exito del laboratorio no es cuantas estrategias produce, sino
cuantas ideas mato rapido y barato, con evidencia, antes de que costaran capital.
