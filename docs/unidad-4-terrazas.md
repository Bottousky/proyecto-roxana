# Proyecto Roxana — Ohmdal, Unidad 4
# “La vuelta completa”

**Versión:** 0.2 — guion detallado listo para build (diálogos finales; los ejecutores copian textual)
**Alcance:** Unidad 4 completa: del acueducto moribundo (gancho de la U3) al valle regado y el gancho al Faro (U5).
**Tema técnico:** ley de tensiones de Kirchhoff, divisor de tensión, divisor de corriente, resistencia equivalente, circuito escalera. La unidad «de maestría»: nada nuevo que tocar, todo nuevo que combinar — y la primera vez que el jugador **predice antes de probar**.
**Requisito narrativo:** Unidad 3 completada (`unit3Completed`, Forja en ritmo).
**Estado:** guion aprobado para construcción. Plan de hitos: `plan-implementacion-u4.md`.

---

## A. Síntesis de la unidad (canon)

### A.1. Premisa

Las Terrazas: el acueducto de cobre que riega el valle por niveles, obra mayor de los Maestros. Cada terraza toma su parte del empuje y deja pasar el resto. Hace décadas que nadie sabe **repartirlo**: las terrazas altas ahogan sus cultivos y a la más baja no le llega casi nada. La guardiana lo resume:

> **«Acá arriba sobra y allá abajo falta. Y si toco una sola piedra, cambia TODO el valle. Por eso no toco nada.»**

Esa frase es la unidad entera: en una red, **nada está solo**. Cada piedra le habla a todas las demás. La U4 enseña a leer esa conversación — y, por primera vez, a **anticiparla**: el evento mayor exige predecir en la Bitácora cuánto empuje llega al último escalón ANTES de abrir el agua.

Frases centrales:

> En toda vuelta completa, lo que sube baja. El empuje no desaparece: se reparte en escalones.

> Una red entera puede mirarse como una sola piedra.

### A.2. Léxico diegético de la Unidad 4

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| caída de tensión | el escalón | Bitácora, tras el evento mayor |
| ley de tensiones de Kirchhoff (KVL) | la Regla de la Vuelta | Bitácora, tras el evento mayor |
| divisor de tensión | el reparto del empuje | Bitácora, tras el evento mayor |
| resistencia equivalente | la Piedra Única | Bitácora, tras el evento mayor |
| circuito escalera | la Escalera (es el acueducto: se camina) | escenario, no se convierte |

**Instrumento nuevo:** Ohm aprende a medir **entre dos puntos** (modo brazos): abre los brazos y reporta el escalón —la diferencia de empuje— entre sus dos manos. Hasta ahora medía el río parado en un tramo; ahora mide el empuje abarcando un trecho. (Para medir empuje hay que abarcar, no pararse.)

### A.3. Matemática canónica (enteros — verificada; los ejecutores no la cambian)

Piedras marrón 1 / roja 2 / amarilla 4 / gris 8; **filas se suman**; **dos iguales en paralelo = la mitad** (roja∥roja=marrón 1, amarilla∥amarilla=roja 2, gris∥gris=amarilla 4). Cristales de Empuje 4/8/16.

- **Los escalones (tutorial):** Empuje 16 sobre fila marrón+marrón+roja+amarilla (1+1+2+4 = 8) → río 2. Escalones (río × piedra): 2, 2, 4, 8. La vuelta: +16 −2 −2 −4 −8 = **0**, exacto.
- **El reparto justo (divisor):** dos terrazas en fila, Empuje 12, objetivos: alta 8, baja 4 (proporción 2:1). Solución A: roja(2)+marrón(1) → río 4 → escalones 8 y 4. Solución B: amarilla(4)+roja(2) → río 2 → escalones 8 y 4. **Misma proporción, distinto río**: la de piedras grandes (B) paga menos río (menos peaje — puente a U3). Dos soluciones válidas.
- **La Piedra Única (equivalente):** roja∥roja = marrón; amarilla∥amarilla = roja; gris∥gris = amarilla. Y serie+paralelo: marrón + (roja∥roja) = 1+1 = roja(2); roja + (amarilla∥amarilla) = 2+2 = amarilla(4). Ohm «no distingue» la red de su piedra única.
- **La Escalera del valle (evento mayor) — VERIFICADA:** manantial Empuje 16; tramo manantial→terraza 1 = roja(2); terraza 1 cuelga con amarilla(4); tramo terraza 1→terraza 2 = roja(2); terraza 2 (última) cuelga con roja(2).
  - Plegado con la Piedra Única, desde abajo: terraza 2 = roja(2); rama hacia ella = roja+roja = amarilla(4); en terraza 1: amarilla ∥ amarilla = **roja(2)**; total = roja+roja = amarilla(4); río del manantial = 16/4 = 4.
  - Empujes: terraza 1 recibe **8**; terraza 2 recibe **4** (= un cuarto del manantial). La **predicción** que pide la unidad: «a la última terraza llega 4».
  - **Segunda solución válida** (escala de piedras): tramos amarilla(4), terraza 1 gris(8), terraza 2 amarilla(4) → mismo reparto (8 y 4) con menos río (manantial río 2). El banco acepta toda configuración que dé terraza 1 = 8 y terraza 2 = 4. Con otros empujes el objetivo «un cuarto» se mantiene proporcional.

**Regla de reuso:** cero piezas nuevas de banco. La novedad es el **modo brazos de Ohm** y la **página de predicción** de la Bitácora. La unidad es topología + método.

### A.4. Misconcepciones que la unidad ataca

| Misconcepción | Dónde cae |
|---|---|
| «La tensión se gasta como la corriente» (confunden V con I) | Ohm con brazos abiertos: el empuje SÍ cae por escalones — y el río sigue igual en toda la fila (contraste con U2) |
| «La fuente da siempre la misma corriente» | la Piedra Única: cambiar la red cambia el río del manantial |
| «Cada componente es independiente» | tocar una piedra de la Escalera mueve TODAS las agujas del valle |
| «No se puede saber sin probar» | la página de predicción: el jugador calcula, después mide, y la vuelta cierra exacta |

### A.5. Personajes

- **La Guardiana de las Terrazas** *(nueva; propuesta de nombre: Vega — pendiente del autor; el código usa el label «Guardiana»)* — vieja, precisa, paralizada por respeto: sabe que todo está conectado (¡intuición correcta!) y por eso no toca nada. Arco: del miedo reverencial al cálculo — no «animarse», sino **saber antes de tocar**.
- **Edda** — su arco de enseñar culmina: la página de predicción es idea SUYA. Inventa, diegéticamente, el examen honesto: predecir no para aprobar, sino para saber si entendiste.
- **Maese Lumen** — comedia y cierre de arco: predice con su vieja liturgia y falla; predice con la cuenta y acierta.
- **Ohm** — modo brazos. Un (1) beat mudo: en la terraza más baja, frente al lago, se queda mirando el Faro apagado un segundo de más. No dice nada. (Plantado para U5.)
- **La Consejera** — cameo opcional (una escena): trae el inventario de jornales de la U3 y pregunta cuánto costará regar el valle.

---

## 1. NIVEL 0 — Aula (módulo cuatro)

Con `unit3Completed`, el proyector ofrece el módulo cuatro. 2 min.

**Proyector:**

> *clac* MUNDOS APLICADOS. UNIDAD CUATRO.
>
> Las Terrazas de Ohmdal: el agua que baja pensando.
>
> Recuerde, estudiante: lo que sube, baja. Y lo que baja, se reparte.

La imagen se aclara un instante en un acueducto de cobre escalonado, y se apaga.

> (Agua que piensa. En esta escuela ya nada me sorprende.)

Re-interacción: **Proyector:** «*clac* Unidad cuatro: en curso. Mida dos veces. Toque una. *clac*»

Flag: `playedUnit4Intro`. En la plaza, el **Camino a las Terrazas** está abierto (visible con `unit3Completed`; el camino baja del lado de la Forja).

---

## 2. NIVEL 1 — El canal alto: los escalones

**ID propuesto:** `MAP_TERRACES_TOP` · 5–6 min · **Puzzle 1 (tutorial)**

Una ladera de cobre y tierra, terrazas de cultivo escalonadas hacia el valle. Arriba, la **Guardiana**, inmóvil junto a una compuerta, como si montara guardia desde hace décadas.

**Guardiana:**

> No te acerques a las piedras. …Perdón. Es la costumbre.
> Treinta años acá. Conozco cada canal de memoria. Y no muevo ninguno.

**Edda:**

> ¿Por qué no?

**Guardiana:**

> Porque si toco esta —y señala una cualquiera— cambia aquella, y la del fondo, y el riego entero. Todo está atado a todo.
> No es miedo. Es respeto. …Bueno. Un poco de miedo.

**Ohm:**

> Observación correcta. Conclusión incompleta. Para leer una red atada: brazos.

*(Ohm extiende los brazos por primera vez. Modo nuevo: mide el empuje ENTRE dos puntos.)*

### PUZZLE 1 — Los escalones

**ID:** `PUZZLE_VOLTAGE_STEPS` · medición pura, sin fallo · 4–5 min
**Vista de banco:** una vuelta completa del canal alto: manantial (Empuje 16) → fila de cuatro piedras fijas (marrón, marrón, roja, amarilla) → vuelta a tierra. Ohm con **modo brazos**: botón «abrazar» entre dos puntos cualesquiera; reporta el escalón. También el modo río de siempre (parado en un tramo).

Experiencias (en cualquier orden):

1. **Abrazar el manantial:** Ohm reporta «Subida: dieciséis.»
2. **Abrazar cada piedra, una por una:** escalones de 2, 2, 4, 8.
   **Edda** (haciendo la cuenta en voz alta): «Dos, dos, cuatro, ocho… son dieciséis. Lo que subió, bajó. Exacto. No sobra ni falta un escalón.»
   **Ohm:** «Deuda de la vuelta: cero. Siempre cero.»
3. **Medir el río parado en cada tramo** (modo viejo): el mismo río 2 en toda la fila.
   **Edda:** «El empuje baja por escalones… pero el río es el mismo en todos lados. No son la misma cosa. ¡NUNCA fueron la misma cosa!»
   *(El gran error que la unidad desmonta: confundir empuje con río.)*
4. **Abrazar la vuelta entera** (manantial + las cuatro piedras): «Deuda: cero.»

Cierre:

**Guardiana** (que lo vio mil veces):

> Mil veces vi bajar esa agua. Nunca vi que la cuenta cerraba sola.
> El acueducto no es un misterio. Es una cuenta que siempre cerró, y yo no sabía leerla.

Flags: `solvedVoltageSteps`. Bitácora «Los escalones» (vivencial).

---

## 3. NIVEL 2 — Las terrazas medias: el reparto justo

**ID propuesto:** `MAP_TERRACES_MID` · 6–7 min · **Puzzle 2**

Dos terrazas de cultivo, una sobre la otra. La alta, encharcada; la baja, reseca y agrietada.

**Guardiana:**

> Mira. Arriba se ahoga el maíz. Abajo se raja la tierra. Y el agua es la misma — solo que mal repartida.
> Los Maestros sabían darle a cada terraza lo suyo. Yo no me animo a tocar la proporción.

**Edda:**

> ¿Y si te lo mostramos con las manos, en chico, antes de tocar el valle de verdad?

### PUZZLE 2 — El reparto justo

**ID:** `PUZZLE_FAIR_SPLIT` · 5–7 min
**Vista de banco:** dos terrazas en fila bajo un manantial de Empuje 12; engaste de una piedra por terraza (marrón/roja/amarilla/gris); aguja de empuje recibido por terraza (alta: zona verde en 8; baja: zona verde en 4); Ohm modo brazos. Objetivo: alta 8, baja 4.

- **Piedras iguales** (p. ej. roja+roja): río 3, escalones 6 y 6 — reparto mitad y mitad. La alta no llega a 8, la baja sobra. **Ohm:** «Reparto igual. Objetivo: desigual. Ajuste la proporción.»
- **Solución A** (roja arriba 2, marrón abajo 1): río 4 → alta 8, baja 4. ✓
- **Solución B** (amarilla 4, roja 2): río 2 → alta 8, baja 4. ✓ — mismo reparto, menos río.
  **Edda:** «¡Las dos andan! Pero la de piedras grandes pide menos río al manantial…»
  **Guardiana:** «Menos agua para el mismo riego. Eso… eso es lo que yo nunca supe calcular.»
  **Ohm:** «El reparto es proporción, no tamaño. La proporción manda.»

Cierre — la Guardiana toca una piedra por primera vez en treinta años (elige la solución B, «porque el valle paga menos»):

**Guardiana:**

> Toqué una piedra. Por una razón. Con un número.
> …No tembló el valle. Se ordenó.

Flags: `solvedFairSplit`. Bitácora «El reparto del empuje» (vivencial).

---

## 4. NIVEL 3 — El mural de los Maestros: la Piedra Única

**ID propuesto:** `MAP_TERRACES_MURAL` · 5–7 min · **Puzzle 3**

Un muro de cobre grabado: a un lado, una maraña de canales; al otro, una sola piedra; entre los dos, el signo **=**. El truco de los Maestros, perdido.

**Guardiana:**

> Este mural lleva aquí más que yo. Nunca lo entendí. Una maraña… igual a una piedra. ¿Igual cómo?

**Ohm:**

> Demostrable. Tráiganme una red. Yo decido si la distingo.

### PUZZLE 3 — La Piedra Única

**ID:** `PUZZLE_SINGLE_STONE` · 5–7 min
**Vista de banco:** a la izquierda, una red armable (dos ramas en paralelo, o serie+paralelo); a la derecha, un engaste de **una** piedra; Ohm parado en el manantial mide el río de cada lado. Desafío: encontrar la piedra única que hace que Ohm **no distinga** un lado del otro.

- **roja ∥ roja** → piedra única = **marrón** (1). Ohm: «Izquierda: río X. Derecha: río X. No distingo. Son la misma piedra.»
- **amarilla ∥ amarilla** → **roja** (2).
- **gris ∥ gris** → **amarilla** (4).
- **marrón + (roja ∥ roja)** → **roja** (2). *(serie del marrón con el equivalente marrón)*
- **roja + (amarilla ∥ amarilla)** → **amarilla** (4).

Al resolver dos o más equivalencias:

**Edda:**

> La red entera se esconde dentro de una piedra. Y si Ohm no la distingue…

**Ohm:**

> …el río tampoco. Una red es una piedra que todavía no terminaste de mirar.

**Guardiana:**

> Entonces el valle entero… es una piedra. Una sola piedra que aprendí a temer.

Flags: `solvedSingleStone`. Bitácora «La Piedra Única» (vivencial). *(Esta es la herramienta que vuelve resoluble la Escalera.)*

---

## 5. NIVEL 4 — El acueducto completo: la Escalera

**ID propuesto:** `MAP_TERRACES_AQUEDUCT` · 9–12 min · **Puzzle 4 — evento mayor, y la primera predicción**

El acueducto entero a la vista, bajando del manantial al lago por tres niveles. El valle, expectante.

**Guardiana:**

> El valle completo. Tres niveles. Si me equivoco, riego mal toda una temporada.
> Por eso nunca lo toqué. Mejor mal repartido y quieto, que peor por mi mano.

**Edda:**

> No vamos a tocar nada todavía. Primero lo decimos. *(a ti)* Plegá la Escalera con la Piedra Única, desde abajo. Decime cuánto empuje le va a llegar a la terraza del fondo. ANTES de abrir el agua.

**Guardiana:**

> ¿Adivinar?

**Edda:**

> No. Saber. Medir después es mirar. Decirlo antes — eso es entender.

### PUZZLE 4 — La Escalera (con página de predicción)

**ID:** `PUZZLE_LADDER` · 8–10 min
**Vista de banco:** el acueducto — manantial (Empuje 16) → tramo roja → terraza 1 (cuelga amarilla) → tramo roja → terraza 2 (cuelga roja, la última). Herramienta de plegado: el jugador colapsa la red por etapas con la Piedra Única (cada plegado muestra el equivalente). La **página de predicción** de la Bitácora: input numérico «empuje que llega a la terraza del fondo». Recién con la predicción cargada, el botón **«Abrir el agua»** se habilita.

Plegado guiado (la Piedra Única, U3 viva):
1. Terraza 2 (final) = roja (2).
2. Rama hacia terraza 2 = roja + roja = amarilla (4).
3. En terraza 1: amarilla ∥ amarilla = **roja (2)**.
4. Total: roja + roja = amarilla (4). Río del manantial = 16/4 = 4.
5. Escalón del primer tramo = 4×2 = 8 → terraza 1 recibe 8. Terraza 2 recibe **4**.

**Predicción correcta: 4.** El jugador escribe 4, abre el agua, y la aguja del fondo marca 4.

- **Predicción exacta:** el valle se riega parejo; la Bitácora estampa **«PREDICHO Y MEDIDO: IGUALES».** `predictionExact`.
- **Predicción errada:** nada se rompe. El agua corre, la aguja marca 4, y la página muestra «lo esperado / lo medido» lado a lado. **Ohm:** «Diferencia entre lo dicho y lo visto: ahí está la lección. Repliegue. Vuelva a decir.» Se puede re-predecir las veces que haga falta. *(El error es información, también en el papel.)*

**Segunda solución** (tramos amarilla, terraza 1 gris, terraza 2 amarilla): mismo reparto 8/4 con menos río; el banco la acepta. La predicción del fondo sigue siendo 4 (un cuarto).

### Resolución

Las tres terrazas en su verde, el agua repartida. El valle entero se riega parejo por primera vez en décadas — la restauración más serena del juego: no luces, riego.

El mosaico del manantial se completa:

> Lo que sube, baja. Lo que baja, se reparte en escalones.
> Y los escalones de toda vuelta, sumados, dan cero.

**Guardiana:**

> Toqué las piedras. Todas. Y supe lo que iba a pasar antes de que pasara.
> Treinta años de respeto, y bastaba con aprender a leer. Los Maestros no eran magos. Eran prolijos.

**Ohm:**

> Registro: primera predicción del estudiante. Resultado: el futuro es calculable. Anótelo en grande.

**Lumen** *(que predijo primero con su liturgia y falló, después con la cuenta y acertó)*:

> La cuenta le gana al rezo. Otra vez. Empiezo a tomármelo personal.

La Bitácora arde y se abre sola: la entrada mayor.

Flags: `solvedLadder`, `valleyRestored`, `learnedKVL`. La Bitácora estrena su **página de predicción** como herramienta permanente.

---

## 6. NIVEL 5 — Cierre y gancho al Faro

**Duración:** 3–4 min.

El valle verde al atardecer. La Guardiana ya no monta guardia: **opera** el acueducto, moviendo piedras con confianza.

**Edda** (mirando el lago al pie del valle):

> ¿Y eso de ahí abajo? Esa torre, sobre el agua.

**Guardiana:**

> El Faro. Lleva apagado desde que se fueron los Maestros.
> Parpadeaba, ¿saben? No alumbraba fijo como una lámpara: **latía**. La-aaa-tido… la-aaa-tido. Nadie supo nunca con qué corazón.

**Ohm** *(se queda mirando el Faro un segundo de más, en silencio. Su pecho parpadea una vez. No dice nada.)*

**Edda:**

> ¿Ohm…?

**Ohm:**

> Nada. Un dato viejo. Sigamos.

*(Beat plantado para U5. La reserva no se gasta.)*

Flags: `unit4Completed`. Pantalla de cierre (patrón U2/U3): título «Fin de la Unidad 4 — “La vuelta completa”», resumen (si la primera predicción fue exacta; entradas de Bitácora) y teaser del Faro que late.

---

## 7. Entradas de Bitácora de la Unidad 4

Dos capas; las vivenciales nacen al resolver cada puzzle; las formales llegan con `learnedKVL` (tras el evento mayor).

1. **«Los escalones»** (`solvedVoltageSteps`) — vivencial: el empuje cae piedra a piedra; la vuelta siempre cierra en cero; el río es el mismo en toda la fila. Formal: **la Regla de la Vuelta** (ley de tensiones de Kirchhoff): en toda vuelta cerrada, las subidas y bajadas de empuje se cancelan. Nota al pie: *«El mismo apellido de la regla del cruce. Kirchhoff tenía dos reglas y ningún apuro.»* **Error común:** confundir empuje con río — el empuje cae por escalones; el río, en una fila, no.
2. **«El reparto del empuje»** (`solvedFairSplit`) — vivencial: las dos terrazas, la proporción 2:1, las dos soluciones y cuál pagaba menos río. Formal: **divisor de tensión** — cada piedra cobra empuje en proporción a su freno. **Error común:** creer que la piedra grande «aguanta» y la chica «sufre»: cobran proporcional, ninguna sufre.
3. **«La Piedra Única»** (`solvedSingleStone`) — vivencial: la red que Ohm no pudo distinguir de una piedra. Formal: **resistencia equivalente**; en fila se suman, en ramales se achican (con los casos vividos: dos iguales en paralelo = la mitad). ✎ *Si toda red puede ser una sola piedra… ¿qué piedra es tu casa entera, vista desde el medidor de la entrada?*
4. **«La Escalera»** (formal mayor, `learnedKVL`) — el método de plegado etapa por etapa, el dibujo de la Escalera del valle, y la **página de predicción** estrenada: lo esperado, lo medido, la palabra IGUALES. Cierre: *«Hoy la Bitácora dejó de ser un diario. Ahora también es un mapa de lo que va a pasar.»* ✎ *Antes de enchufar algo nuevo en tu casa, ¿podrías decir si la llave va a saltar? Esa pregunta ya es ingeniería.*

---

## 8. Flags de la unidad

```txt
playedUnit4Intro
metGuardiana
solvedVoltageSteps
solvedFairSplit
solvedSingleStone
predictionAttempted
predictionExact
solvedLadder
valleyRestored
learnedKVL
unit4Completed
```

---

## 9. Criterios de aceptación

El jugador puede decir, sin clase previa:

- «El empuje baja por escalones; en toda vuelta completa, lo que sube baja.»
- «El empuje y el río no son la misma cosa: en una fila el empuje cae y el río no.»
- «En una fila, cada piedra cobra empuje según su proporción.»
- «Una red entera se puede mirar como una sola piedra, y el río no nota la diferencia.»
- «Puedo decir cuánto va a marcar la aguja ANTES de conectar — y verificarlo.»

Y recién después leer: *eso se llama ley de tensiones de Kirchhoff, divisor de tensión y resistencia equivalente.*

---

## 10. Notas de coherencia y pendientes

1. **Nombre de la Guardiana** (propuesta: Vega) — pendiente del autor, junto con la Forjadora (Brasa) y el Farero (Ciro). El código usa el label «Guardiana».
2. **La aritmética de §A.3 está verificada a mano** (enteros en todos los nodos, dos configuraciones válidas para el evento mayor). Es canon: contradicción ⇒ frenar y reportar.
3. **El modo brazos de Ohm** nace acá y queda disponible en todos los bancos futuros (y en modo práctica de los viejos).
4. **La página de predicción** es UI nueva de la Bitácora — diseñarla reutilizable: U5 la va a querer.
5. **El cameo de la Consejera** es opcional: decidir según ritmo (la unidad ya tiene personaje nuevo).
