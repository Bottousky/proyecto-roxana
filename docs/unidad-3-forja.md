# Proyecto Roxana — Ohmdal, Unidad 3
# “El precio del río”

**Versión:** 0.1 — propuesta de diseño (nivel medio de detalle: estructura, puzzles con números y beats de diálogo; el guion línea por línea se escribe antes del build, como se hizo con la U2)
**Alcance:** Unidad 3 completa: de la forja que entibia (gancho de la U2) hasta la Forja restaurada y el gancho a las Terrazas (U4).
**Tema técnico:** potencia y energía — P = V·I, efecto Joule, dimensionado de conductores y fusibles, energía = potencia × tiempo.
**Requisito narrativo:** Unidad 2 completada (`unit2Completed`, Castillo encendido).
**Estado:** borrador para revisar con el autor. Nada implementado.

---

## A. Síntesis de la unidad (canon propuesto)

### A.1. Premisa

El Castillo encendido despertó a la Forja, el distrito hambriento de la U2. La Forja trabaja… y algo anda mal: **los canales entibian**, los fusibles «justos» mueren jóvenes, y la Consejera —ahora aliada— llega con su libro de inventario y la pregunta que el Consejo nunca supo contestar:

> **«Si el río no se gasta… ¿qué es lo que estamos pagando?»**

La unidad entera responde con las manos: el río no se gasta, pero el río **trabaja** — y el trabajo se paga. Lo que se entrega no es río: es **empuje por caudal**. Y todo canal cobra **peaje en calor** según cuánto río lleva.

Es la finura pedagógica del arco: en la U2 desmentimos «la corriente se gasta»; acá la refinamos antes de que se convierta en el error opuesto («entonces nada cuesta nada»). Algo SÍ se entrega. Distinguir el río de lo que el río entrega es distinguir corriente de energía.

Frase central de la unidad:

> El río no se gasta. El río trabaja. Y el trabajo se paga.

### A.2. Léxico diegético de la Unidad 3

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| potencia (P = V·I) | la Entrega («lo que el río entrega») | Bitácora, tras encender la Forja |
| efecto Joule (calor en el conductor) | el Peaje («todo canal cobra peaje en calor») | Bitácora, tras encender la Forja |
| energía (P × t) | el Jornal («entrega sostenida un tiempo») | Bitácora, tras encender la Forja |
| sección / calibre del conductor | el grosor del canal (angosto / medio / ancho) | es físico, no se convierte: se ve |
| disipación, sobrecarga | canal frío / tibio / caliente / al rojo | ídem |

El instrumento nuevo es el **termómetro de canal**: una aguja de calor que se apoya sobre cualquier tramo. (Patrón U1: cada arco de aprendizaje trae UNA aguja nueva.)

### A.3. Diseño de puzzles — una variable nueva por puzzle

| Puzzle | Concepto | Manipulación | Feedback de fallo |
|---|---|---|---|
| El canal tibio | el calor existe y depende del río, no del tiempo de uso | medir con el termómetro tramos con distinto río | ninguno: medición pura (tutorial) |
| La enfermería de fusibles | el fusible se elige con margen: ni mártir ni inútil | elegir calibre de fusible por máquina | fusible joven muere al arrancar; fusible gordo deja quemar el canal |
| El Canal Largo | misma entrega, dos maneras: empuje alto paga menos peaje | elegir cristal + piedras para alimentar el horno lejano | canal al rojo (la entrega llega, pero el peaje se come el resto) |
| La Forja completa (evento mayor) | dimensionar una red real: entrega, grosor, fusible por rama | configurar toda la red de la Forja | máquinas hambrientas, canales calientes o mártires en serie; el fallo informa |

**Aritmética canónica** (cristales 4/8/16 y piedras marrón 1 / roja 2 / amarilla 4 / gris 8, heredados de U1–U2):

- **Río** = Empuje / Piedra (la Puerta de Ohm, intacta).
- **Entrega** = Empuje × Río. Con Empuje 8: marrón→río 8→entrega 64; roja→río 4→entrega 32; amarilla→río 2→entrega 16; gris→río 1→entrega 8.
- **Peaje** del canal: crece con el río al cuadrado y baja con el grosor — en el juego es **cualitativo**: el termómetro marca frío / tibio / caliente / al rojo. Tolerancias de grosor propuestas: angosto aguanta río 2, medio río 4, ancho río 8 (por encima: caliente; muy por encima: al rojo y el canal se corta).
- **El Canal Largo** (núcleo conceptual): entregar **entrega 16** al horno lejano.
  - Camino A: Empuje 4 + marrón (1) → río 4 → entrega 16 ✓, pero el canal largo y angosto con río 4 se pone **al rojo**.
  - Camino B: Empuje 16 + gris+gris en fila (8+8=16, ¡los frenos en fila se suman — U2 reusada!) → río 1 → entrega 16 ✓, canal **frío**.
  - Misma entrega; peaje dieciséis veces menor. Es —sin decirlo— por qué la electricidad viaja con empuje alto. La Bitácora lo formaliza después como pregunta: ✎ *¿Por qué los cables que cruzan el campo van tan alto y con tanto empuje?*

**Regla de reuso:** ninguna pieza de la U1–U2 se reemplaza; se agrega el termómetro y los grosores de canal. La fila de piedras de la U2 reaparece como herramienta (sumar frenos para bajar río).

### A.4. Misconcepciones reales que la unidad ataca

| Misconcepción documentada | Dónde se desmiente jugando |
|---|---|
| «Si la corriente no se gasta, entonces nada se gasta» | el termómetro: el calor es real, medible, y alguien lo paga |
| «Un cable es un cable» | el mismo río pone tibio al canal ancho y al rojo al angosto |
| «Más grande siempre aguanta más» (fusibles) | el fusible gordo no muere… y deja que muera el canal: proteger es elegir el margen justo |
| «El calor de los cables es porque están viejos / usados» | canal nuevo + río grande = caliente igual; el peaje depende del río, no de la edad |
| «Potencia y corriente son lo mismo» | el Canal Largo: misma entrega con río 4 o con río 1 |

### A.5. Personajes

- **La Forjadora** *(personaje nuevo — propuesta de nombre: **Brasa**; revisar con el autor si lleva nombre propio: es habitante de Ohmdal, no figura institucional, así que el canon de «sin nombre» no la alcanza)* — dueña del fuego, práctica, sin paciencia para doctrinas: ella SIEMPRE supo que algo se pagaba, porque su gremio lo paga en carbón desde hace generaciones. Su fricción no es creer/no creer: es que nadie le sepa decir **cuánto**. Es la clienta perfecta de la unidad: pide números, no consuelo.
- **La Consejera** — regresa como aliada. Su arco: el libro de inventario, que en la U2 contaba un tesoro imaginario, acá por primera vez **cuenta algo real**: jornales (energía). La burocracia encuentra su redención: medir de verdad. Beat de humor: descubre con horror cuánta entrega derrochaban los sellos ceremoniales («los lacres del Consejo consumían más que la biblioteca»).
- **Edda** — su arco de enseñar avanza: acá le explica el peaje a la Forjadora… y fracasa con palabras hasta que la deja **tocar el canal** con el termómetro. Aprende la regla de la casa: fenómeno antes que sermón.
- **Maese Lumen** — duelo y gloria: la unidad lo obliga a aceptar que sus mártires (los fusibles) no eran héroes sino **mal elegidos**. La enfermería de fusibles es su escena: pasa de venerar el sacrificio a calcular el margen. («Un mártir por año es santidad. Uno por semana es mal cálculo.»)
- **Ohm** — gana el modo termómetro además del de río (sigue siendo el medidor vivo). Cero backstory nueva: la reserva no se gasta.

### A.6. Estado de implementación

Sin construir. Patrón U1/U2: salas top-down + vistas de banco + Bitácora. Piezas de banco nuevas: termómetro de canal, selector de grosor (angosto/medio/ancho), fusibles con calibre visible, máquina de forja con placa de entrega. Escala greybox: Forja = 2–3 salas nuevas + reuso del Castillo (la forja ya existe como distrito del Repartidor).

---

## 1. Resumen narrativo

La U2 cerró con Lumen retirando la mano del canal tibio. La U3 abre con la Forja a pleno: martillos que caen solos, hornos respirando — y la Forjadora esperando en la puerta con un fusible muerto en la mano: el tercero de la semana. La Consejera llega por su lado: desde que el reino se encendió, «algo» se consume, y el Consejo quiere saber qué cosa, porque esta vez **no piensa volver a sellar nada sin números**.

Primer acto (el canal tibio): medir con el termómetro lo que la mano ya sabía. El calor no está en las máquinas viejas ni en los rituales: está donde el río es grande y el canal es chico. El peaje existe y tiene reglas.

Segundo acto (la enfermería): Lumen despliega su colección de mártires. Elegir calibre de fusible por máquina: el justo muere al arrancar; el gordo no muere nunca — y en la demostración más incómoda de la unidad, el canal se corta antes que el fusible. El fusible no es un héroe: es **el que muere a propósito para que no muera otra cosa**.

Tercer acto (el Canal Largo): el horno lejano de la Forjadora, al final de un canal angosto imposible de recablear. Con empuje bajo, la entrega llega… y el canal se pone al rojo. La solución no es más río: es **más empuje y menos río** — misma entrega, peaje mínimo. La Forjadora, tocando el canal frío que alimenta su horno encendido, dicta la frase de la unidad.

Evento mayor (la Forja completa): dimensionar la red entera — cuatro máquinas con placas de entrega distintas, grosor de canal y fusible por rama, presupuesto de Tronco heredado de la U2. Cuando la Forja canta (martillos en ritmo), la Bitácora formaliza: **potencia, efecto Joule, energía**. La Consejera abre un libro nuevo: «Inventario de jornales. Este sí.»

Gancho a la U4: la Forjadora menciona el viejo acueducto de cobre — **las Terrazas** que riegan el valle por niveles. «El empuje baja por escalones, dicen. La terraza más baja casi no recibe. Nadie sabe repartirlo desde que se fueron los Maestros.»

---

## 2. Estructura de niveles (resumen — guion fino antes del build)

| Nivel | Mapa | Función | Duración |
|---|---|---|---|
| 0 | Aula de Electrónica (reuso) | proyector módulo 3: «POTENCIA. Lo que el río entrega.» — se corta antes de explicar (como siempre) | 2 min |
| 1 | Patio de la Forja | la Forjadora, el fusible muerto, la Consejera con su pregunta; **Puzzle 1: el canal tibio** | 5–6 min |
| 2 | Enfermería de fusibles (taller de Lumen en la Forja) | **Puzzle 2: la enfermería** — calibre y margen | 5–7 min |
| 3 | El Canal Largo | **Puzzle 3** — misma entrega, dos caminos; el corazón conceptual | 6–8 min |
| 4 | Nave mayor de la Forja | **Puzzle 4 (evento mayor): la Forja completa** — dimensionar la red | 8–10 min |
| 5 | Cierre | la Forja en ritmo; inventario de jornales; gancho Terrazas | 3–4 min |

**Beats de diálogo clave** (a desarrollar):

- Forjadora, presentación: «¿Vos sos el que anda encendiendo cosas? Bien. Ahora explicame quién paga el carbón de TODO esto.»
- Consejera, pregunta de la unidad: «El río no se gasta. Lo medimos. Entonces, ¿qué es lo que falta cada mañana?»
- Ohm, en el canal tibio: «Río: grande. Canal: chico. Peaje: en curso.»
- Lumen, enfermería: «Este murió joven. Este no murió nunca y dejó morir al canal. La santidad, estudiante, era una cuestión de calibre.»
- Forjadora, Canal Largo resuelto (frase de la unidad): «El río no se gasta. El río trabaja. Y el trabajo se paga. Por fin alguien que lo dice con números.»

---

## 3. Entradas de Bitácora de la Unidad 3

Formato de dos capas. Las vivenciales nacen incompletas; la formal llega tras el evento mayor.

1. **«El peaje»** — vivencial: el termómetro en los canales; mismo río, distinto grosor, distinto calor. Formal: efecto Joule; el calor crece fuerte con la corriente (con el cuadrado — dicho como «el doble de río, cuatro veces el peaje», medido, no como fórmula).
2. **«El mártir y el margen»** — vivencial: el fusible justo muere joven, el gordo no protege. Formal: el fusible se dimensiona con margen sobre el río de trabajo y por debajo de lo que aguanta el canal. **Error común:** «más grande aguanta más» — un fusible que no puede morir no protege nada.
3. **«La Entrega»** — vivencial: el Canal Largo — entrega 16 con río 4 (al rojo) o con río 1 (frío). Formal: **potencia = empuje × río (P = V·I)**, el vatio nombrado; la misma potencia puede viajar con poco río y mucho empuje. ✎ *¿Por qué los cables que cruzan el campo van tan alto y con tanto empuje?*
4. **«El Jornal»** (formal, tras el evento mayor) — energía = potencia × tiempo; el inventario de la Consejera como tabla real (entrega de cada máquina × horas de forja). Nota al pie estilo Bitácora: *«Mucho después, a la entrega le pusieron Watt, y al jornal, joule. El peaje también se llama joule. No es casualidad: es la misma moneda.»*

---

## 4. Flags de la unidad

```txt
playedUnit3Intro
metForjadora
solvedWarmChannel
solvedFuseInfirmary
burnedChannelDemo      (si el jugador vivió el canal-muere-antes-que-el-fusible)
solvedLongChannel
solvedForgeNetwork
forgeRestored
learnedPower
unit3Completed
```

---

## 5. Criterios de aceptación

El jugador puede decir, sin clase previa:

- «El calor de un cable depende de cuánto río lleva y de qué tan gordo es el cable.»
- «El doble de río calienta mucho más que el doble.»
- «El fusible se elige para que muera él y no otra cosa — ni tan justo ni tan gordo.»
- «Se puede entregar lo mismo con mucho empuje y poco río, y el canal lo agradece.»
- «Lo que se paga no es río: es entrega sostenida en el tiempo.»

Y recién después leer: *eso se llama potencia, efecto Joule y energía.*

---

## 6. Notas de coherencia y pendientes

1. **Nombre de la Forjadora** («Brasa» es propuesta) y si los habitantes de Ohmdal nuevos siguen llevando nombre propio (Edda y Lumen lo tienen; el canon «sin nombre» es solo institucional). Decisión del autor.
2. **El peaje cuadrático** se enseña medido («doble de río, cuatro veces el peaje»), nunca como I²R. Verificar en build que el termómetro lo respete numéricamente.
3. **La Consejera recurrente** queda confirmada por esta unidad si el autor aprueba (resuelve la decisión abierta de `unidad-2-caminos.md` §13.5).
4. **Continuidad:** el canal tibio del cierre de la U2 debe ser EL MISMO canal que abre el nivel 1 (mismo lugar del mapa).
5. Los valores de tolerancia de grosor (2/4/8) y las placas de entrega del evento mayor se ajustan en build para que existan **al menos dos soluciones válidas** (regla de la casa desde la U1).
