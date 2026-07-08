# Filtro A+ — Quiz de scalping ETH

> Reconstruido el 8 Jul 2026 a partir del quiz original (que se perdió sin commitear). Calibración actualizada a la vigente (RSI 50-70; banda 62-70 la mejor). Este es el contenido pedagógico de las 9 condiciones del Filtro A+: el *porqué* de cada una, con su pregunta y feedback. Insumo para el curso A+ de Academy, conectable al checklist del Simulador.

El Filtro A+ compra SOLO cuando se cumplen las 9 condiciones, en orden. Cada una filtra un riesgo distinto; el poder está en exigirlas juntas.

---

## 1. Mercado vivo

**Qué es:** cuenta de transacciones recientes o profundidad del libro. Verifica que haya suficiente liquidez para entrar y salir sin slippage relevante. Es el prerequisito de todo lo demás: sin mercado activo, el resto del filtro no tiene sentido.

**Pregunta:** ¿por qué es la primera condición y no una más?

- Confirma que hay liquidez para entrar y salir sin que el slippage degrade el R/R. — ✅ **Correcta.** Sin mercado activo, incluso una señal perfecta se ejecuta mal: el spread se come el target.
- Nada relevante: ETH siempre tiene liquidez suficiente en cualquier momento. — ❌ Hay ventanas horarias donde el spread se amplía y la profundidad cae. Entrar ahí genera slippage que destruye el R/R del scalp.
- Solo afecta a posiciones grandes; en scalp con tamaño pequeño es irrelevante. — ❌ El slippage afecta proporcionalmente igual. En scalp, donde el target puede ser $1–2, incluso $0.15 de slippage degrada el ratio.

---

## 2. ER 1m ≥ 0.30

**Qué es:** el Efficiency Ratio mide qué parte del movimiento es desplazamiento real vs ruido. ER 0.30 = por cada dólar de volatilidad total, 30 centavos son dirección.

**Pregunta:** si el ER de 1m marca 0.17, ¿qué significa?

- Por cada dólar de volatilidad total, solo $0.17 son desplazamiento real; el resto es ruido. — ✅ **Correcta.** En scalping necesitas dirección, no oscilación. Con ER 0.17 hay mucho movimiento pero sin tendencia explotable.
- El precio bajó 17% en el último minuto. — ❌ El ER no mide variación porcentual. Es un ratio de eficiencia: desplazamiento neto / suma de todos los movimientos.
- El volumen relativo es bajo y no conviene entrar. — ❌ El volumen lo mide la condición 7 (VolR). El ER mide calidad de la tendencia de precio, independiente del volumen.

---

## 3. ER 5m ≥ 0.25 (por qué ambos timeframes)

**Qué es:** el filtro exige ER direccional en 1m Y en 5m. El 5m da el contexto; el 1m, la entrada inmediata.

**Pregunta:** ¿por qué exige ER alto en AMBOS timeframes y no solo en uno?

- Porque pueden divergir: el 5m confirma tendencia de contexto y el 1m confirma que el momento inmediato acompaña. — ✅ **Correcta.** ER 5m alto con ER 1m bajo = tendencia clara pero retroceso/consolidación inmediata. El filtro distingue esa diferencia.
- Porque son el mismo indicador: si uno pasa, el otro también pasa siempre. — ❌ Pueden divergir perfectamente. Ese es justo el caso que el doble filtro atrapa.
- Porque el 5m mide volumen institucional y el 1m mide volumen retail. — ❌ Ambos miden eficiencia de precio, no volumen. La diferencia es solo el timeframe de cálculo.

---

## 4. EMA9 > EMA21 (alcista)

**Qué es:** el cruce de medias confirma que la estructura de corto plazo es alcista.

**Pregunta:** ¿qué NO te dice el cruce EMA9 > EMA21?

- La fuerza del impulso, ni si el momentum está acelerando o desacelerando. — ✅ **Correcta.** El cruce confirma dirección pero no intensidad. Por eso el filtro complementa con ER (calidad), Mom5 (momentum) y VolR (respaldo).
- Que el precio va a seguir subiendo de forma garantizada. — ❌ Las EMAs son rezagadas: confirman lo que ya pasó, no predicen. Ningún indicador garantiza dirección futura.
- Que el precio ya superó el VWAP del día. — ❌ El VWAP es la condición 8, separada. EMA9 > EMA21 solo habla de estructura de medias.

---

## 5. Pullback + Mom5 (retoma con momentum)

**Qué es:** hubo un retroceso al EMA9 (pullback) y el precio vuelve sobre él con momentum. El pullback filtra el precio de entrada; el momentum filtra la dirección de la retoma.

**Pregunta:** ¿por qué exige pullback Y momentum juntos?

- Porque cada uno filtra un riesgo distinto: el pullback filtra el precio de entrada, el momentum filtra la dirección de la retoma. Solo juntos eliminan ambos. — ✅ **Correcta.** La redundancia es deliberada.
- Porque Mom5 mide volumen acumulado y el pullback confirma soporte. — ❌ Mom5 mide momentum de precio, no volumen (eso es VolR). El pullback no confirma soporte: confirma punto de entrada favorable dentro de la tendencia.
- Son redundantes: cualquiera por separado bastaría. — ❌ No. Cada uno cubre un riesgo diferente; por separado dejan un flanco abierto.

Nota de calibración: no pedir MÁS momentum del calibrado (mom5 ≈ 0.6×ATR). Exigir momentum alto = entrar tarde al envión, y el backtest lo castiga.

---

## 6. RSI en banda 50-70

**Qué es:** el RSI debe estar en la banda de entrada. La banda 62-70 concentra las mejores entradas; el techo real es la sobrecompra (75-80), donde se SALE, no se entra.

**Pregunta:** ¿por qué no entrar con RSI ya muy alto?

- Para no entrar cuando ya consumiste el impulso: entrar sobre 70 deja poco recorrido para que el target sea alcanzable. — ✅ **Correcta.** En un scalp el recorrido es escaso. La banda reserva recorrido; la sobrecompra es zona de salida.
- Porque en crypto el RSI es más rápido y 62 equivale al 70 de acciones. — ❌ El RSI se calcula igual en cualquier activo. Es lógica de scalp, no de velocidad del indicador.
- Porque RSI alto indica que el volumen bajó y ya no hay comprador. — ❌ El RSI no mide volumen. Un RSI alto puede coexistir con volumen alto. Es gestión de recorrido, no señal de volumen.

---

## 7. VolR ≥ 1.00

**Qué es:** el volumen relativo del rebote debe estar sobre lo normal. Un impulso sin volumen es sospechoso.

**Pregunta:** un impulso alcista con VolR 0.76, ¿qué es?

- Un movimiento de baja convicción: posible trampa alcista sin participación suficiente. — ✅ **Correcta.** VolR bajo sugiere que pocos respaldan el movimiento; alta probabilidad de que no se sostenga.
- Señal confiable si las demás pasan; el volumen no importa tanto en crypto. — ❌ El volumen bajo es alerta en cualquier activo. Un movimiento sin respaldo es más susceptible a fakeout.
- Oportunidad de comprar antes de que llegue el volumen fuerte. — ❌ Anticipar el volumen es especular sobre especulación. El filtro exige confirmación presente, no predicción.

---

## 8. Precio > VWAP

**Qué es:** el precio debe estar sobre su VWAP del día. El VWAP integra todo el volumen de la jornada: es el consenso de precio de los participantes más grandes.

**Pregunta:** ¿por qué el VWAP y no solo las EMAs?

- Porque el VWAP integra el volumen del día y refleja el consenso intradiario; estar por encima = respaldo. — ✅ **Correcta.** Las EMAs son rezagadas y trabajan en el timeframe del gráfico; el VWAP aporta la referencia de volumen del día.
- Las EMAs son más confiables: si las medias son alcistas, hay que entrar igual. — ❌ Son rezagadas y no integran volumen. El VWAP aporta información que las EMAs no tienen.
- Significa que el precio está barato respecto al VWAP: buena oportunidad de compra. — ❌ "Barato respecto al VWAP" es lógica de inversión, no de scalp. Precio bajo VWAP sin recuperar el nivel es trampa, no ganga.

---

## 9. Distancia a resistencia

**Qué es:** no entrar a menos de ~$3 de una resistencia. El precio necesita espacio para que el target sea alcanzable con un R/R aceptable.

**Pregunta:** ¿por qué el umbral de distancia y no entrar igual?

- Porque está calibrado para garantizar un R/R mínimo: sin espacio hasta la resistencia, el ratio se vuelve negativo. — ✅ **Correcta.** Con stop en $1.5 y resistencia a $1, el ratio es 0.67:1. Con $3 de espacio, el target cabe.
- Es un número arbitrario: podría ser $1 o $5 sin diferencia. — ❌ Está calibrado al R/R del sistema, no es arbitrario.
- Porque ETH siempre tiene resistencias cada $3. — ❌ Las resistencias no se distribuyen regularmente. El umbral es función del sistema, no del activo.

---

## Cómo se usa en VQL

- **Simulador A+:** el checklist en vivo de estas 9 condiciones, moviendo umbrales.
- **Academy:** cada condición = una lección (lee el porqué → responde el quiz → pruébalo en el simulador).
- **Indicador TradingView:** el mismo checklist, operando en tiempo real.
