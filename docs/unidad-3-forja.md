# Proyecto Roxana — Ohmdal, Unidad 3
# “El precio del río”

**Versión:** 0.2 — guion detallado listo para build (diálogos finales; los ejecutores copian textual)
**Alcance:** Unidad 3 completa: de la forja que entibia (gancho de la U2) hasta la Forja restaurada y el gancho a las Terrazas (U4).
**Tema técnico:** potencia y energía — P = V·I, efecto Joule, dimensionado de conductores y fusibles, energía = potencia × tiempo.
**Requisito narrativo:** Unidad 2 completada (`unit2Completed`, Castillo encendido).
**Estado:** guion aprobado para construcción. Plan de hitos: `plan-implementacion-u3.md`.

---

## A. Síntesis de la unidad (canon)

### A.1. Premisa

El Castillo encendido despertó a la Forja, el distrito hambriento de la U2. La Forja trabaja… y algo anda mal: **los canales entibian**, los fusibles «justos» mueren jóvenes, y la Consejera —ahora aliada— llega con su libro de inventario y la pregunta que el Consejo nunca supo contestar:

> **«Si el río no se gasta… ¿qué es lo que estamos pagando?»**

La unidad responde con las manos: el río no se gasta, pero el río **trabaja** — y el trabajo se paga. Lo que se entrega no es río: es **empuje por caudal**. Y todo canal cobra **peaje en calor** según cuánto río lleva.

Es la finura pedagógica del arco: en la U2 desmentimos «la corriente se gasta»; acá la refinamos antes de que se convierta en el error opuesto («entonces nada cuesta nada»).

Frase central:

> El río no se gasta. El río trabaja. Y el trabajo se paga.

### A.2. Léxico diegético de la Unidad 3

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| potencia (P = V·I) | la Entrega | Bitácora, tras encender la Forja |
| efecto Joule | el Peaje | Bitácora, tras encender la Forja |
| energía (P × t) | el Jornal | Bitácora, tras encender la Forja |
| sección del conductor | el grosor del canal (angosto / medio / ancho) | físico, se ve |
| disipación, sobrecarga | canal frío / tibio / caliente / al rojo | físico, se ve |

Instrumento nuevo: el **termómetro de canal** (Ohm gana el modo termómetro: apoya la mano sobre un tramo y reporta el calor).

### A.3. Matemática canónica (enteros, decidida — los ejecutores no la cambian)

- **Río** = Empuje / Piedra. **Entrega** = Empuje × Río. Piedras marrón 1 / roja 2 / amarilla 4 / gris 8; **filas de piedras se suman** (U2).
- **Grosores de canal y termómetro:** angosto tolera río 2, medio 4, ancho 8. Termómetro: **frío** si río ≤ mitad de la tolerancia; **tibio** si ≤ tolerancia; **caliente** si ≤ 1.5×; **al rojo** si más. Un canal al rojo, a la **tercera insistencia, se corta** (reparable: la Forjadora lo reempalma, comentario distinto cada vez — patrón fusible de Lumen).
- **Peaje cuadrático vivido:** duplicar el río en un mismo canal salta DOS niveles de termómetro («el doble de río, cuatro veces el peaje» — medido, jamás formulado).
- **Arranque de máquina:** al arrancar, cada máquina pica el río a **río de trabajo + 1** por un instante. **Fusible** calibre 1/2/4/8: se inmola **solo si el río lo supera estrictamente** (río > calibre; aviso/vibración antes, patrón U2) — el pico igual al calibre se aguanta. **Regla de la enfermería:** el fusible correcto es **el menor calibre que el pico no supera** (calibre ≥ pico) y que **salte antes de que el canal llegue al rojo**. Con picos 2/3/5 (máquinas A/B/C): correctos 2/4/8.

### A.4. Misconcepciones que la unidad ataca

| Misconcepción | Dónde cae |
|---|---|
| «Si la corriente no se gasta, nada se gasta» | el termómetro: el calor es real y alguien lo paga |
| «Un cable es un cable» | mismo río: canal ancho tibio, angosto al rojo |
| «Más grande siempre aguanta más» (fusibles) | el fusible gordo deja morir al canal |
| «El calor es porque están viejos» | canal nuevo + río grande = caliente igual |
| «Potencia y corriente son lo mismo» | el Canal Largo: misma entrega con río 4 o río 1 |

### A.5. Personajes

- **La Forjadora** *(nueva; propuesta de nombre: Brasa — pendiente del autor; en el guion habla como «Forjadora»)* — práctica, sin paciencia para doctrinas: SIEMPRE supo que algo se pagaba, porque su gremio lo paga en carbón. No pide consuelo: pide **cuánto**.
- **La Consejera** — aliada. Su libro por primera vez cuenta algo real: jornales. Humor: descubre que los lacres del Consejo consumían más que la biblioteca.
- **Edda** — aprende a enseñar: fracasa con palabras, acierta dejando tocar.
- **Maese Lumen** — la enfermería lo obliga a aceptar que sus mártires estaban **mal elegidos**. De venerar el sacrificio a calcular el margen.
- **Ohm** — gana el modo termómetro. Cero backstory nueva.

---

## 1. NIVEL 0 — Aula de Electrónica (módulo tres)

**Función:** re-entrada; con `unit2Completed`, el proyector ofrece el módulo tres. 2 min.

**Proyector:**

> *clac* MUNDOS APLICADOS. UNIDAD TRES.
>
> La Forja de Ohmdal: donde el río trabaja.
>
> Recuerde, estudiante: nada que trabaja, trabaja gratis.

La imagen tiembla y se corta. Sobre la lente, un instante, la silueta de un fusible fundido.

> (¿Eso fue una lección… o un aviso?)

Re-interacción posterior: **Proyector:** «*clac* Unidad tres: en curso. Abríguese. O no. Ya va a entender. *clac*»

Flag: `playedUnit3Intro`. El portal lleva a la plaza; en la plaza (nocturna), el **Camino a la Forja** está abierto (visible con `unit2Completed`).

---

## 2. NIVEL 1 — El patio de la Forja: el canal tibio

**ID propuesto:** `MAP_FORGE_YARD` · 5–6 min · **Puzzle 1 (tutorial de medición)**

Patio de piedra y cobre. Martillos que caen solos al fondo. La **Forjadora** espera en la puerta con un fusible muerto en la mano. La **Consejera** llega con su libro.

**Forjadora:**

> ¿Tú eres quien anda encendiendo cosas? Bien. Tenemos que hablar.
> Tercer fusible de la semana. Y los canales entibian como sopa. Esto antes no pasaba.

**Consejera:**

> Antes no pasaba NADA, Forjadora. Esa era exactamente la política.

**Forjadora:**

> …Touché.
> Mira: yo no entiendo de ríos ni de cuentas. Entiendo de carbón. Y desde que la Forja despertó, el carbón vuela. Algo se está yendo a alguna parte.

**Consejera:**

> Eso vine a preguntar. Medimos el río: no se gasta. Lo demostraron ustedes. Entonces, ¿qué es lo que falta cada mañana?

**Edda:**

> …Esa es buena pregunta. Ohm: ¿tienes algo para el calor?

**Ohm:**

> Modo nuevo disponible: termómetro. Apoyo la mano. Reporto el peaje.

### PUZZLE 1 — El canal tibio

**ID:** `PUZZLE_WARM_CHANNEL` · medición pura, sin fallo · 4–5 min
**Vista de banco:** cuatro canales del patio en corte (martillo: río 4 por canal angosto / fuelle: río 4 por canal ancho / canal viejo en desuso: río 0, angosto / yunque: río 2 por canal angosto), llave para conectar el segundo martillo al canal del yunque (duplica su río: 2 → 4), termómetro por tramo (modo nuevo de Ohm) y los puntos de río de siempre.

Experiencias (en cualquier orden):

1. **Canal del martillo** (río 4, angosto): **al rojo.** — **Ohm:** «Río: grande. Canal: chico. Peaje: en curso.»
2. **Canal del fuelle** (río 4, ancho): **frío.** — **Edda:** «¡El mismo río! ¿Por qué este ni se entera?» **Ohm:** «Mismo río. Más cauce. Menos peaje.»
3. **Canal viejo** (río 0): **frío**, aunque es el más viejo del patio. — **Forjadora:** «Ese canal tiene cien años y está helado. Así que no es la edad. Mi abuelo SIEMPRE dijo que era la edad.»
4. **Duplicar el río del yunque** (llave, 2 → 4): el termómetro salta de tibio a **al rojo** — dos niveles de un golpe, sin pasar por caliente. — **Ohm:** «Doble de río. Cuádruple de peaje. Anótelo.» **Consejera:** «YA lo anoté. Es mi línea, calderito.»

Cierre:

**Forjadora:**

> A ver si entendí: el calor no es fantasma ni vejez. Es el precio del paso. Más río por el mismo canal, más caro el peaje.
> …¿Y quién lo cobra?

**Edda:**

> El aire, supongo. Se lo lleva y no da recibo.

Flags: `solvedWarmChannel`. Bitácora «El peaje» (vivencial).

---

## 3. NIVEL 2 — La enfermería de fusibles

**ID:** `MAP_FORGE_INFIRMARY` · 5–7 min · **Puzzle 2**

El taller de Lumen dentro de la Forja: una pared entera de fusibles muertos, etiquetados con fecha y una velita. La colección de mártires.

**Lumen:**

> Mi enfermería. Bueno… mi cementerio, técnicamente. Cada uno de estos murió por la Forja.
> Este murió joven. Este no murió nunca — y dejó morir al canal. Empiezo a sospechar, estudiante, que la santidad era una cuestión de calibre.

**Forjadora:**

> Yo necesito que dejen de morirse, Lumen. O al menos que se mueran con sentido.

**Ohm:**

> Corrección: morirse con sentido es la función. Fusible = el que muere a propósito, para que no muera otra cosa.

**Edda:**

> …Eso es lo más bonito que dijiste nunca, Ohm.

**Ohm:**

> Registro: poesía accidental. No se repetirá.

### PUZZLE 2 — La enfermería

**ID:** `PUZZLE_FUSE_INFIRMARY` · 5–7 min
**Vista de banco:** tres máquinas con placa de **río de trabajo** y su canal (A: río 1, canal angosto · B: río 2, canal medio · C: río 4, canal ancho). Engaste de fusible por máquina (calibres 1/2/4/8) y botón **«Arrancar la Forja»**: al arrancar, cada máquina pica a río+1 un instante. El termómetro y las agujas, visibles.

Comportamiento:

- **Fusible ≤ pico de arranque:** muere al arrancar («joven»). — **Lumen:** «¡Otro mártir del amanecer! …Ya ni los velo, fíjate.»
- **Fusible demasiado gordo** (no salta antes del rojo del canal, demostración guiada con una falla simulada en la máquina A): el canal se corta primero. — **Forjadora:** «¿Y ESO quién lo repone? El fusible cuesta un cobre. El canal, una semana.» **Lumen:** «…El gordo no era un santo. Era un cómplice.»
- **Correctos:** A→2, B→4, C→8. Al arrancar la Forja con los tres bien: ritmo de martillos estable.

Cierre:

**Lumen:**

> Un mártir por año es santidad. Uno por semana es mal cálculo.
> Cuarenta años venerando el sacrificio y la respuesta era… margen. Elegir el margen.

Flags: `solvedFuseInfirmary`, `burnedChannelDemo` (si vivió la demo del canal). Bitácora «El mártir y el margen» (vivencial).

---

## 4. NIVEL 3 — El Canal Largo

**ID:** `MAP_FORGE_LONGCHANNEL` · 6–8 min · **Puzzle 3 — el corazón conceptual**

Detrás de la Forja, un canal angosto de doscientos pasos cruza el patio viejo hasta el **horno lejano** de la Forjadora. Imposible de recablear: pasa bajo tres edificios.

**Forjadora:**

> Mi horno. El bueno. Lleva años frío porque cada vez que lo alimentamos, el canal se pone al rojo a mitad de camino.
> No se puede cambiar el canal. Pasa por abajo de media Forja. O lo alimentas con ESE cable, o no hay horno.

**Edda:**

> Río suficiente para el horno, por un canal que no aguanta río… Suena a trampa.

**Ohm:**

> Reformulación: entrega suficiente. La entrega viaja de más de una manera.

### PUZZLE 3 — El Canal Largo

**ID:** `PUZZLE_LONG_CHANNEL` · 5–7 min
**Vista de banco:** cristal de Empuje elegible (4 / 8 / 16), engaste de piedras **en fila** (U2: los frenos en fila se suman) junto al horno, el canal largo angosto (tolera río 2) con termómetro en tres puntos, y la placa del horno: **ENTREGA 16**.

- **Camino A (la trampa natural):** Empuje 4 + marrón → río 4 → entrega 16 ✓… y el canal **al rojo** (a la tercera insistencia se corta; la Forjadora lo reempalma: «Una.» / «Dos. Me estás cobrando el favor.» / «Tres. La próxima lo reempalmas tú.»).
- **Camino B (canónico):** Empuje 16 + gris+gris en fila (16) → río 1 → entrega 16 ✓ — canal **frío**.
- **Camino C (también válido):** Empuje 8 + amarilla → río 2 → entrega 16 ✓ — canal **tibio**, al límite justo.

Si el jugador encuentra B y C: **Ohm:** «Misma entrega. Peaje distinto. La Forjadora prefiere el frío.»

Resolución (con B o C): el horno lejano respira, y la Forjadora apoya la mano en el canal — y la deja ahí.

**Forjadora:**

> Frío. El horno a fuego pleno y el canal frío.
> El río no se gasta. El río trabaja. Y el trabajo se paga. …Por fin alguien que lo dice con números.

**Edda:**

> Mucho empuje, poco río: la misma entrega con menos peaje. ¿Por eso los Maestros subían el empuje para los caminos largos…?

**Ohm:**

> Hipótesis: correcta. Alcance: más grande de lo que crees.

Flags: `solvedLongChannel`. Bitácora «La Entrega» (vivencial).

---

## 5. NIVEL 4 — La nave mayor: encender la Forja completa

**ID:** `MAP_FORGE_HALL` · 8–10 min · **Puzzle 4 — evento mayor**

La nave central: tres máquinas mayores apagadas — el **Martillo** (placa: ENTREGA 32), el **Fuelle** (ENTREGA 16) y la **Lumbre** (ENTREGA 8) — y el tablero de la Forja con su cristal de bus.

**Forjadora:**

> Todo junto, una vez. Como cuando era niña.
> Tres máquinas, un solo tronco, y el cobre que hay: un canal ancho, dos medios, dos angostos. Ni uno más. Repártelo bien.

**Consejera:**

> Y yo anoto la entrega de cada una. Por hora. *(abre un libro nuevo, flamante)* Inventario de jornales. Este sí.

### PUZZLE 4 — La Forja completa

**ID:** `PUZZLE_FORGE_NETWORK` · 7–9 min
**Vista de banco:** cristal de bus elegible (8 / 16); por máquina: engaste de piedras (fila permitida), **selector de grosor** con stock compartido (1 ancho, 2 medios, 2 angostos), engaste de fusible (1/2/4/8); termómetro y aguja por rama; aguja de Tronco con tolerancia 8; botón «Arrancar la Forja» (pico río+1 por máquina). **Validación por condiciones:** entregas exactas + ningún canal pasa de caliente en el pico + fusibles correctos (regla de la enfermería) + Tronco ≤ 8.

Solución canónica (Empuje 8): Martillo roja → río 4 (pico 5) → canal **ancho** + fusible 8 · Fuelle amarilla → río 2 (pico 3) → canal **medio** + fusible 4 · Lumbre gris → río 1 (pico 2) → canal **angosto** + fusible 2. Tronco 7 ≤ 8 ✓. **Soluciones alternativas válidas por elección de margen** (p. ej. Fuelle en el otro canal medio o el ancho si el Martillo usó medio tolerando el pico caliente-breve): el banco acepta toda combinación que cumpla las condiciones; con **Empuje 16 no hay solución** (la Lumbre pediría río ½): deliberado, eco del Repartidor.

Feedback de fallo (información, nunca castigo): máquina hambrienta = su placa parpadea y la Forjadora la nombra («El Martillo pide y no le llega.»); canal excedido = termómetro y, a la tercera, corte reparable; fusible mal elegido = muere al arrancar o deja sufrir al canal (diálogos de la enfermería reutilizables).

### Resolución

Los tres ritmos se traban en un compás: el Martillo marca, el Fuelle respira, la Lumbre sostiene. **La Forja canta.**

**Forjadora:**

> *(escucha, los ojos cerrados)* Ese compás. ESE. Treinta años sin oírlo.
> Dile a tu escuela que la Forja paga sus deudas: cuando necesiten hierro bien nacido, es acá.

**Consejera:**

> Entrega del Martillo: treinta y dos. Del Fuelle: dieciséis. De la Lumbre: ocho. Por hora, cincuenta y seis jornales.
> *(pausa, hojea su libro viejo)* …Los lacres ceremoniales del Consejo consumían nueve. La biblioteca, ocho.
> Cuarenta años lacrando puertas con más entrega de la que ahorrábamos al lacrarlas. No anote eso, calderito.

**Ohm:**

> Anotado.

La Bitácora arde y se abre sola: entradas formales de la unidad.

Flags: `solvedForgeNetwork`, `forgeRestored`, `learnedPower`.

---

## 6. NIVEL 5 — Cierre y gancho

**Duración:** 3–4 min.

La Forja en ritmo, de noche. El compás se oye desde la plaza (cambio permanente del mundo: la Forja suena).

**Edda** (mirando el valle desde el patio):

> ¿Ves el valle, allá abajo? Las Terrazas. El acueducto de cobre de los Maestros.
> Riega por niveles. O regaba.

**Forjadora:**

> Mi hierro va a las Terrazas desde siempre. La guardiana es de fiar — pero está paralizada: dice que el empuje «baja por escalones» y que la terraza más baja casi no recibe.
> Treinta años sin tocar una piedra. Por miedo a que tocar una mueva todas. …Y lo peor es que tiene razón: mueve todas.

**Ohm:**

> Dato: correcto. Conclusión: incompleta. Lo que mueve todas… se puede contar todo.

**Edda:**

> *(sonríe)* Eso suena a próxima lección.

Flags: `unit3Completed`. Pantalla de cierre de unidad (patrón U2): título «Fin de la Unidad 3 — “El precio del río”», resumen (jornales anotados, canales cortados sí/no) y teaser de las Terrazas.

---

## 7. Entradas de Bitácora de la Unidad 3

Dos capas; las vivenciales nacen al resolver cada puzzle; las formales llegan con `learnedPower` (tras el evento mayor).

1. **«El peaje»** (`solvedWarmChannel`) — vivencial: el termómetro; mismo río, distinto grosor, distinto calor; el canal viejo helado; doble de río = salto doble del termómetro. Formal: **efecto Joule** — el calor crece fuerte con la corriente («el doble de río, cuatro veces el peaje» — medido, no formulado). **Error común:** «el calor es porque el cable está viejo» — el peaje depende del río y del cauce, no de la edad.
2. **«El mártir y el margen»** (`solvedFuseInfirmary`) — vivencial: el justo muere al arrancar; el gordo deja morir al canal. Formal: el fusible se elige con **margen sobre el pico** y por debajo de lo que aguanta el canal. **Error común:** «más grande aguanta más» — un fusible que no puede morir no protege nada. *(El bloque del canal cortado se completa solo si `burnedChannelDemo`.)*
3. **«La Entrega»** (`solvedLongChannel`) — vivencial: entrega 16 con río 4 (al rojo) o con río 1 (frío). Formal: **potencia = empuje × río (P = V·I)**, el vatio nombrado; la misma potencia puede viajar con poco río y mucho empuje. ✎ *¿Por qué los cables que cruzan el campo van tan alto y con tanto empuje?*
4. **«El Jornal»** (formal mayor, `learnedPower`) — energía = potencia × tiempo; la tabla del inventario de la Consejera (56 jornales/hora de la Forja; los lacres: 9). Nota al pie: *«Mucho después, a la entrega le pusieron Watt, y al jornal, joule. El peaje también se llama joule. No es casualidad: es la misma moneda.»* ✎ *Busca en tu casa un aparato que diga “W”. Ese número es su hambre.*

---

## 8. Flags de la unidad

```txt
playedUnit3Intro
metForjadora
solvedWarmChannel
solvedFuseInfirmary
burnedChannelDemo
solvedLongChannel
solvedForgeNetwork
forgeRestored
learnedPower
unit3Completed
```

---

## 9. Criterios de aceptación

El jugador puede decir, sin clase previa:

- «El calor de un cable depende de cuánto río lleva y de qué tan gordo es el cable.»
- «El doble de río calienta mucho más que el doble.»
- «El fusible se elige para que muera él y no otra cosa — ni tan justo ni tan gordo.»
- «Se puede entregar lo mismo con mucho empuje y poco río, y el canal lo agradece.»
- «Lo que se paga no es río: es entrega sostenida en el tiempo.»

Y recién después leer: *eso se llama potencia, efecto Joule y energía.*

---

## 10. Notas de coherencia y pendientes

1. **Nombre de la Forjadora** («Brasa») — pendiente del autor; decidir junto con Vega (U4) y Ciro (U5). El código usa el label «Forjadora».
2. **Continuidad:** el canal que Lumen tocó en el cierre de la U2 (plaza nocturna) es el mismo que alimenta la Forja; el Camino a la Forja sale de la plaza.
3. La matemática de §A.3 es **canon de diseño**: si un ejecutor encuentra una contradicción, frena y reporta (no la resuelve).
4. El compás de la Forja queda como **ambience permanente** del distrito tras `forgeRestored` (variación del tema del Castillo con percusión grave).
