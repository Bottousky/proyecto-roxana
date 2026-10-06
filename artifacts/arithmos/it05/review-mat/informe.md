# Revisión matemática independiente — Capítulo 5 «Partes de algo» (rev-mat-4)

Fecha: 2026-10-06. Revisor: subagente independiente, **sin navegador** (restricción de entorno).

**Versión revisada.** Código `experiments/arithmos/src/ch5/*`, `src/logic/fractions.js` y `tests/fractions.test.mjs` tal como están en `074d296`. Desde ese commit, ninguno de esos archivos cambió: `81648bd` (cap. 6) no los toca. Los logs `it05/c5-errores.log` y `c5-directa.log` son de las 09:38–09:39, posteriores al commit de las 09:37, así que las capturas corresponden a este código.

**Método.**
- Leí todos los textos, opciones, devoluciones, descripciones y la Bitácora.
- Recalculé cada igualdad y cada cantidad.
- Revisé las capturas «snap» y «eleccion» de las dos rutas. Recorté algunas para mirarlas de cerca.
- Contrasté con `ARITHMOS_DESIGN.md` (cap. 5), `ARITHMOS_CURRICULUM.md`, `ARITHMOS_MASTER.md` y las revisiones previas.
- Corrí `node --test experiments/arithmos/tests/`: 58 de 58 pruebas pasan.

**Alcance de la evidencia.** Las rutas las recorrió un bot automático, no una persona. Este informe no certifica comprensión humana.

## Resumen

La aritmética del capítulo es correcta en casi todas sus afirmaciones:
- 1/2 = 2/4 = 3/6.
- 2/3 = 8/12 < 9/12 = 3/4.
- 1/2 + 1/3 = 3/6 + 2/6 = 5/6.
- 2,05 = 2 + 5/100 < 2,5.
- 50 % de 80 = 80 % de 50 = 40.
- 1,4 / 1,41 / 1,414 < diagonal < 1,5 / 1,42 / 1,415.
- 5/8 y 9/16 están entre 1/2 y 3/4.

Los problemas importantes son de otro tipo:
- una definición de n/d que contradice al 5/4;
- una devolución falsa;
- una representación a escala que dibuja media barra más larga que una barra entera;
- una evidencia de la diagonal que no distingue un irracional de 1/3.

Hay además varias incoherencias de cantidades entre escenas y una Bitácora que le atribuye al jugador cosas que no hizo.

| Severidad | Cantidad |
|---|---|
| ALTA | 4 |
| MEDIA | 13 |
| BAJA | 14 |

---

## Hallazgos ALTA

### A-1 · La definición de n/d es la de «parte-todo» y contradice a 5/4; la opción «incorrecta» es defendible

**Dónde:**
- `scenes-a.js:261`: el estudiante dice «Tres cuartos: tres partes, de las cuatro iguales que entran en una barra».
- Bitácora, `scenes-b.js:458`: «n/d de una unidad: n partes de las d iguales que entran en ella».
- Contra `scenes-a.js:466-470,479`: la opción «En ningún lado: no se pueden tomar 5 de 4 partes» se trata como error, y la devolución es «Cuartos hay los que haga falta».

**Qué:** «n partes **de las** d» describe elegir n de un total de d. Con esa definición, 5/4 son 5 partes de las 4 que hay, y eso es imposible. El juego afirma que 5/4 existe y queda pasando el 1, y a la vez marca como error justamente la conclusión que se deduce de su propia definición. La devolución cambia de definición sin decirlo: «cuartos hay los que haga falta» es la lectura de medida (n pedazos de tamaño 1/d). El diseño sí la planteaba así: «n partes de las que entran d en la unidad».

**Por qué importa:**
- Es la idea central de C1.
- Un jugador que razona bien con lo que el juego le dijo es corregido.
- La Bitácora deja escrita una definición falsa para n > d.

**Cómo comprobar la corrección:**
- La línea 261 y la Bitácora dicen la definición de medida. Por ejemplo: «un cuarto es el pedazo que entra justo cuatro veces en la barra; tres cuartos son tres pedazos de ese tamaño» y «n/d: n pedazos del tamaño que entra d veces justo en la unidad (n puede pasar a d: 5/4 es una barra y un cuarto)».
- La devolución a «no se pueden tomar 5 de 4» reconoce la lectura y la corrige: «de cuatro partes no se toman cinco, pero pedazos de un cuarto se pueden poner cinco».
- Ningún texto del capítulo vuelve a decir «de las d».

### A-2 · Devolución falsa al tocar la marca de 1/4: «Tres cuartos es un salto más»

**Dónde:** `scenes-a.js:453`. El texto es `Esa es ${['', 'un cuarto', 'dos cuartos: la mitad'][i]}. Tres cuartos es un salto más.`

**Qué:** con i = 1, el pensamiento del estudiante dice «Esa es un cuarto. Tres cuartos es un salto más». De 1/4 a 3/4 hay **dos** saltos de un cuarto. Con i = 2 la frase es correcta. La ruta con errores del bot no tocó una marca equivocada (`c5-errores.log` no tiene la línea), así que esta rama nunca se ejecutó en la evidencia. Lo encontré leyendo el código.

**Por qué importa:**
- Es la consecuencia de un error del jugador y enuncia un conteo falso justo cuando se aprende que 3/4 son tres saltos de 1/4.
- El contrato exige que cada respuesta equivocada reciba una consecuencia verdadera.

**Cómo comprobar la corrección:**
- La cantidad de saltos sale de `3 - i`: «un salto más» o «dos saltos más».
- Correr la ruta con errores tocando primero la marca 1 y después la 2, y leer las dos devoluciones en el log.

### A-3 · En el depósito, la media barra es más larga que una barra entera (escala inconsistente)

**Dónde:**
- `scenes-b.js:229`: las barras enteras del depósito miden `bw - 24` = **116** u, a escala 1.
- `scenes-b.js:230`: la media barra mide `BAR.w / 2` = **160** u.
- `scenes-b.js:248`: los décimos miden `BAR.w / 10` = 32 u, así que cinco suman 160 u.
- `scenes-b.js:277`: los centésimos miden `BAR.w/100 + 2` = 5,2 u.
- Capturas `c5-directa/030`, `031` y `c5-errores/034`. Se ve a simple vista: la «media barra» del piso, a la derecha, es más larga que cada barra del cuarto de «barras», y los cuatro décimos de la fila de arriba ya ocupan más ancho que una barra entera.

**Qué:** el dibujo afirma que 1/2 barra es más que 1 barra y que 5/10 es más que 1. Además, un centésimo mide 1/6 de un décimo en vez de 1/10.

**Por qué importa:**
- Todo el capítulo mide con una unidad; acá la unidad dibujada y sus partes no se corresponden.
- Es la propiedad falsa que el contrato prohíbe que una metáfora invente, y aparece en la escena que define los decimales.

**Cómo comprobar la corrección:**
- Una sola escala en la escena: las barras del depósito miden L, la media barra L/2, cada décimo L/10 y cada centésimo L/100 (con un mínimo visible declarado si hace falta, por ejemplo una marca).
- Una guarda que falle si `half.len !== bar.len / 2` o si `5 * tenth.len !== half.len`.
- Captura nueva donde cinco décimos alineados coinciden con media barra del depósito.

### A-4 · La diagonal: lo que se muestra (décimos, centésimos y milésimos que nunca cierran) no distingue un inconmensurable de 1/3

**Dónde:**
- `scenes-b.js:379-398`: tres intentos, todos con particiones decimales.
- `408`, devoluciones: «Partir más fino acerca, pero no alcanza: ninguna partición entra justo»; «Las aproximaciones se acercan cada vez más, pero ninguna llega justo».
- `406`: «Probé toda la noche con partes más chicas», dicho fuera de cuadro.
- Bitácora `451`: «Mediste la diagonal … con décimos, centésimos y milésimos: siempre cerca, nunca justo».
- Capturas `c5-directa/038` y `039`.

**Qué:** 1/3 de barra tampoco entra justo en décimos, centésimos ni milésimos (0,3 < 1/3 < 0,4; 0,33 < 1/3 < 0,34; …) y sin embargo entra justo en tercios. La secuencia que el jugador ve es idéntica para 1/3 y para la diagonal. Lo único que separa los dos casos es una afirmación de Mara sin evidencia en pantalla y la promesa de una prueba posterior.

El juego declara bien el límite: «hay una manera de probarlo», «la prueba … llega más adelante». Pero presenta las aproximaciones decimales como la razón: «Partir más fino acerca, pero no alcanza». Así queda armado el error clásico «no tiene decimal exacto ⇒ no es una fracción» o «irracional = decimal que no termina», y en el capítulo no aparece ningún decimal periódico que lo desarme.

**Por qué importa:**
- Es el momento rejugable del capítulo y el único contacto con C4.
- El contrato pide distinguir exacto de aproximado sin que lo sugestivo pase por prueba.

**Cómo comprobar la corrección (alcanza con una de estas opciones):**
- **(a)** Un contraste visible: 1/3 de barra medido en décimos, centésimos y milésimos tampoco cierra, pero en tercios entra justo. «Que no cierre en décimos no dice nada; la pregunta es si **alguna** partición entra».
- **(b)** Mostrar particiones no decimales que se acercan sin cerrar: 7/5 = 1,4; 17/12 ≈ 1,4167; 41/29 ≈ 1,4138; 99/70 ≈ 1,4143. Que Mara muestre su lista de intentos.
- Las devoluciones y la Bitácora dejan de decir que el refinamiento decimal es la razón.
- Una prueba unitaria: `measureWith(1/3, 10|100|1000)` nunca es exacta, mientras que 1/3 sí entra con d = 3.

---

## Hallazgos MEDIA

### M-1 · «Para que sea igual para todas, los pedazos tienen que ser iguales»: la regla es más amplia que lo que vale

**Dónde:** `scenes-a.js:204`. La Bitácora (`435`) la repite: «para repartir igual, partes iguales».

**Qué:** lo que tiene que ser igual es lo que recibe cada familia, no cada pedazo. En la ruta «En 2», cada familia termina con pedazos distintos (1/2 + 1/4) y el reparto es igual. En 5.3, Cornisa tiene 2/4 y Peldaño 1/2: pedazos distintos, misma cantidad.

**Por qué importa:** la regla tal como está empuja a la respuesta equivocada de 5.3 («Cornisa: tiene dos pedazos» o «Peldaño: su pedazo es más grande»).

**Cómo comprobar:** el texto dice algo como «a cada una le tiene que tocar lo mismo; si le das un pedazo a cada una, los pedazos tienen que ser iguales». En la ruta «En 2», ninguna frase contradice lo que se ve.

### M-2 · «En 3» se trata como callejón y «En 2» no, aunque las dos rutas son válidas

**Dónde:** `scenes-a.js:224-248`, con el comentario de la línea 239. Bitácora `437`.

**Qué:**
- Con mitades, la mitad que sobra se vuelve a cortar en cuartos y se sigue.
- Con tercios, sobra un tercio y Mara dice «Así se complica. Empecemos de nuevo». Pero 2/3 + (1/3 ÷ 4) = 8/12 + 1/12 = 9/12 = 3/4 es igual de válido.
- La Bitácora de la ruta con errores dice «Cortaste las barras en 3, después en 2», que se lee como cortar en sextos. En realidad el corte en 3 se deshizo.

**Por qué importa:**
- El contrato pide reconocer caminos alternativos válidos.
- El jugador puede concluir que con tercios no se puede.

**Cómo comprobar:**
- Con «En 3», el tercio sobrante se corta en 4 y cada familia termina con 2/3 + 1/12 = 9/12. La guarda acepta 0,75.
- O, como mínimo, la línea reconoce que se puede y que es más trabajo.
- La Bitácora dice: «Probaste en 3 (sobraba un tercio y empezaron de nuevo); después en 2…».

### M-3 · Cantidades incoherentes entre escenas y una fracción sin unidad

**Dónde:**
- `scenes-a.js:339`: «**Ayer**, a Cornisa le tocó una barra cortada en cuartos; a Peldaño, una cortada por la mitad». Las barras llegaron **hoy**, en 5.2, y en 5.2 cada familia recibió 3/4. Además, «le tocó una barra» sugiere una barra entera, pero se dibujan 2/4.
- `scenes-b.js:142`: Balcón dice «Rampa tenía **media barra** y yo le di **un tercio de la mía**». Rampa tenía 3/4.
- En la misma línea: «un tercio de la mía» es ambiguo, como 1/3 de lo que tiene Balcón (3/4 → 1/4 de barra) o 1/3 de barra. Esto pasa justo después de que Mara jurara en 5.1 «Medio, ¿de qué? Desde hoy, en mis cuentas eso va siempre».
- `scenes-b.js:220`: «quedan … dos enteras… y media». Las tres barras se repartieron todas y estas no tienen origen.

**Por qué importa:**
- El contrato y rev-mat-3 (M-3) piden cantidades coherentes entre escenas.
- La ambigüedad de «un tercio de la mía» hace defendible la respuesta «1/2 + 1/4 = 3/4» en una pregunta cuya respuesta esperada es 5/6.

**Cómo comprobar:** una tabla de lo que tiene cada familia al terminar cada escena. Por ejemplo, que 5.3 y 5.6 usen otra barra explícita («de la barra de ayer…» no; mejor «Mara cortó otra barra para Cornisa y Peldaño»). Que 5.6 diga «un tercio **de barra**». Que el origen de las 2½ barras de 5.7 se nombre.

### M-4 · «No eran vecinas»: la frase es falsa y confunde marcas con números

**Dónde:** `scenes-a.js:496`, devolución a «No: son marcas vecinas».

**Qué:** 1/2 y 3/4 **son** marcas vecinas en la partición en cuartos. Lo falso es que no haya números entre ellas. La frase niega lo verdadero y no nombra lo falso.

**Por qué importa:** la distinción entre una marca de una partición elegida y un número es justamente lo que enseña la densidad.

**Cómo comprobar:** el texto dice algo como «Son vecinas en cuartos, pero no hay números vecinos: partiendo más fino, siempre aparece otra marca en el medio».

### M-5 · La partición común la elige el juego, y las marcas que la justifican se borran antes de mostrarla

**Dónde:**
- `scenes-b.js:98`: se borran los cuartos (`cm-ta`) y los tercios (`cm-tb`).
- `104-112`: aparecen los doceavos.
- En 5.6 (`186-189`) los sextos los elige también el juego, aunque ahí se ve la coincidencia.

**Qué:** el jugador no ve por qué 12: que cada marca de tercios y de cuartos cae sobre una de doceavos. No elige la partición y no se dice por qué sirve.

**Por qué importa:** sin eso, «primero la misma partición» queda como receta. El contrato pide explicar el porqué.

**Cómo comprobar:**
- Las marcas de tercios y de cuartos quedan visibles bajo las de doceavos.
- O el jugador elige entre 7, 12 y 6 y ve cuál hace coincidir las dos.
- La devolución nombra la coincidencia.

### M-6 · «Cuartos» quiere decir dos cosas en el capítulo de fracciones

**Dónde:**
- `scenes-b.js:233`: «guardarlos en el cuarto de al lado».
- `260`: «Así nadie confunde los **cuartos**».
- `271`: «Aparece un **tercer cuarto**, el de los centésimos».
- Título «El cuarto de los décimos».
- Bitácora `462`: «siguen los cuartos del depósito».

**Qué:** en el mismo capítulo, «cuarto» significa 1/4 (tres cuartos de barra, cinco cuartos). «Un tercer cuarto» se lee como fracción.

**Por qué importa:** es una confusión entre objetos y nombres, una de las cosas que la revisión matemática tiene que señalar según el contrato.

**Cómo comprobar:** en el cap. 5, el depósito usa «lugar» o «compartimiento» (o «cuarto del depósito» siempre completo) y «cuarto» queda sólo para 1/4. Una búsqueda de `cuarto` en `ch5/` no devuelve usos ambiguos.

### M-7 · Falta el porqué de los décimos

**Dónde:** `scenes-b.js:232-243`. La única opción que se acepta es «Partirla en décimos…». Los motivos que se dan contra las otras son prácticos: «alguien cuenta tres barras», «afuera se pierde».

**Qué:** nunca se dice que el lugar de la derecha vale diez veces menos (diez décimos forman una barra, como diez sueltos forman un atado). Partir en décimos aparece ya decidido.

**Por qué importa:** el diseño de 5.7 es «decimales como valor posicional». Sin la regla del diez, la coma es una convención sin fundamento y 2,05 se aprende de memoria.

**Cómo comprobar:**
- Antes o después de guardar, se ve que diez décimos juntos se atan en una barra y pasan a la izquierda, en simetría con el cap. 2.
- La pregunta permite proponer «en mitades» y la consecuencia muestra por qué no encaja con el depósito.

### M-8 · «8 de cada 10» no se puede ver: los palitos separados parecen atados

**Dónde:** `scenes-b.js:331-335`: diez palitos a 4 u de distancia. Captura `c5-directa/036`, recortada.

**Qué:** los 8 palitos de arriba forman bloques blancos casi iguales a un atado, sin el lazo. Los 2 de abajo se ven como un solo palito. A la izquierda hay 4 atados levantados y a la derecha 5 bloques levantados, así que el dibujo sugiere 50 contra 40.

**Por qué importa:** la consecuencia visible tiene que mostrar 40 y 40. Hoy la imagen dice otra cosa y sólo el rótulo dice 40.

**Cómo comprobar:** los palitos se separan lo suficiente para contarlos (o los 8 se atan en una mitad visible). En una captura nueva se cuentan 8 + 2 por grupo, o bien 4 atados contra 4 atados (40 = 8 × 5).

### M-9 · 50 % de 80 = 80 % de 50 queda como coincidencia o truco, y no se conecta con los centésimos

**Dónde:** `scenes-b.js:309-344`. «Mara, sos tramposa», en la línea 342.

**Qué:**
- La igualdad vale siempre: a % de b = a·b/100 = b % de a, por la conmutativa del cap. 4.
- El juego sólo muestra un caso y no dice por qué.
- El diseño prometía «% = de cada cien = centésimos», recién vistos en 5.7. No se conecta. Tampoco aparece 1/2 = 0,5 = 50 %; el 0,5 sólo figura en la Bitácora.

**Por qué importa:**
- El verbo es comprender: sin el porqué, el jugador se queda con una curiosidad.
- Además, «Mara, sos tramposa» refuerza la idea de truco.

**Cómo comprobar:**
- Una línea del estudiante (no de Mara) que lo justifique. Por ejemplo: «50 de cada 100 de 80 es 50 × 80 ÷ 100; 80 de cada 100 de 50 es 80 × 50 ÷ 100: el mismo producto».
- Una transferencia: «¿y el 25 % de 40 o el 40 % de 25?».
- Escribir 50 % = 50/100 = 0,50 = 1/2 en la pizarra con los centésimos del depósito.

### M-10 · La medición de la diagonal se narra pero no se ve

**Dónde:** `scenes-b.js:387-396`. La descripción dice «Punto mide la diagonal en décimos…: 14 se quedan cortos y 15 se pasan». En pantalla, Punto hace dos saltos (`389-390`) y aparece la desigualdad (`c5-directa/038`).

**Qué:** el juego afirma más de lo que muestra. En décimos sería perfectamente visible: 14 marcas de 1/10 del lado sobre la diagonal y el resto que no llega. En centésimos y milésimos ya no se ve a esa escala, y el juego no lo dice.

**Por qué importa:** el pedido explícito es que la diagonal no afirme más de lo que muestra. Además, el jugador no participa de la medición.

**Cómo comprobar:**
- En décimos se dibujan las 14 marcas y el sobrante, y el jugador decide si la 15.ª «entra».
- Para centésimos y milésimos, una lupa o una línea que declare «a esta escala ya no se ve: Mara lo midió con…».

### M-11 · La Bitácora atribuye al jugador cosas que no hizo o no pensó

**Dónde:** `scenes-b.js:427-451`. Verificado en `it05/c5-*/state.json`.
- `434`: a quien eligió «Medio atado» (medio atado es más) le escribe «Pensaste que dos "medios" eran lo mismo». Eso sólo es cierto para «Lo mismo».
- `451`: «**Mediste** la diagonal…». Midieron Punto y Mara; el jugador sólo predijo.
- `437`: «Cortaste las barras en 3, después en 2». Ver M-2.
- `443`: a «Lo mismo» le escribe «Pensaste, **como Punto**, que un cuarto era más o igual». Punto dijo «más», no «igual».
- `445`: «**Sumaste** media barra y un tercio». El jugador anticipó; sumó el juego.

**Por qué importa:** la regla ya fue señalada en caps. 1–3 (M14 y la baja de rev-mat-2): la Bitácora no puede atribuir de más.

**Cómo comprobar:** cada rama depende de la respuesta exacta («atado», «same», etc.) y usa «anticipaste/creíste» para predicciones y «viste» para lo que hizo el juego. Recorrer las 3 respuestas de cada pregunta y leer el `seen` resultante.

### M-12 · Las fracciones, la notación central del capítulo, se leen mal

**Dónde:**
- `common.js:107-113` (`fracLabel`). Los rótulos usan la línea de base alfabética (`chalk.js:281`). El denominador va en y + 0,55·s, así que su parte de arriba queda en y − 0,15·s, y la raya está en y − 0,12·s: **encima del denominador**.
- Capturas `c5-errores/023` y `c5-directa/020` (recorte): el 4 de 3/4 aparece tachado, «16» se lee «T6» y el 8 tiene un trazo encima.
- En línea, con Kalam y en negrita amarilla (`scenes-b.js:58,147`), «1/» se funde: el 1 y la barra son dos trazos inclinados. «1/2 + 1/3 = 2/5» se lee «l/2 + l/3» o «113». Ver `c5-directa/026`.

**Por qué importa:**
- El contrato pide que las fracciones se distingan sin esfuerzo.
- Ya se corrigió el 4 contra el 9 con `unicode-range`, pero no el 1 ni la barra.

**Cómo comprobar:**
- La raya en y − 0,35·s, más ancha que el número más largo, con aire arriba y abajo.
- Para el 1 y la «/», usar Atkinson con `unicode-range` U+0031 y U+002F, o una barra más horizontal.
- Revisar en una captura a 844×390.

### M-13 · Falta lo que el capítulo promete desde el diseño y el currículo

**Dónde:** contraste con `ARITHMOS_DESIGN.md` (cap. 4: «la multiplicación no "siempre agranda" (× 1, × −1, **y luego fracciones**)»; 5.4: «Ubicar 1/2, 3/4 y 5/4»), con `fuentes.md` (NAP 1°/2°: «racional como **cociente**») y con la cobertura C1–C2.

**Qué:**
- **(a)** La fracción como cociente nunca se escribe. 2 ÷ 4 = 2/4 y 3 ÷ 4 = 3/4 aparecen con flecha. El gancho del cap. 4 (14 ÷ 4 → 3, sobran 2) no se cierra como 14 ÷ 4 = 3 + 1/2.
- **(b)** No hay ninguna multiplicación por una fracción, aunque «medio montón de 6 = 3» es 1/2 × 6 y estaba a mano para la promesa «multiplicar no siempre agranda».
- **(c)** No se pasa de fracción a decimal fuera de 5/10. 3/4 = 0,75, lo que cada familia tiene, cabría en el depósito. Tampoco hay decimales periódicos, y es el contraste que necesita A-4.
- **(d)** 1/2 nunca se ubica ni se rotula en la recta, aunque la pregunta de densidad lo nombra. Y 5/4 lo ubica Punto.

**Por qué importa:** son prerrequisitos de los caps. 6–7. Las ecuaciones con x/4 y la función 1/x necesitan el cociente.

**Cómo comprobar:** una línea de pizarra «3 ÷ 4 = 3/4» en 5.2, «1/2 de 6 = 3» en 5.1 y «3/4 = 0,75» en 5.7, cada una con su consecuencia visible. En 5.4, el jugador ubica 1/2.

---

## Hallazgos BAJA

### B-1 · Texto de pizarra fuera de los bordes

**Dónde:** `c5-directa/004`–`006` y `014`.

**Qué:** «2 atados entre 4 → 1/2 atado cada una» se sale del pizarrón y «una» queda cortado. «2/4 = 1/2» (fila 5, `scenes-a.js:370`) queda escrito sobre el marco inferior.

**Cómo comprobar:** añadir una guarda que verifique que el ancho del texto no supera `BOARD.w − 60`.

### B-2 · «Darle uno a dos familias» no tiene consecuencia visible

**Dónde:** `scenes-a.js:81`.

**Qué:** sólo hay una queja; los atados no se mueven. En el cap. 4 el mismo error sí movía los atados (N3).

### B-3 · «Partir cada atado por la mitad» es ambiguo

**Qué:** puede leerse como cortar los palitos por el medio o como separar 5 y 5. El cap. 4 terminó con el atado «rajado por el medio», que sugiere lo primero. La igualdad 1/2 atado = 5 palitos sigue valiendo en cantidad de tiza, pero conviene decir «en dos grupos de cinco».

### B-4 · La fila de Cornisa queda vacía

**Dónde:** 5.3, después de superponer los cuartos (`c5-directa/014`).

**Qué:** la fila de Cornisa se ve vacía y puede leerse como «Cornisa no tiene nada».

**Cómo comprobar:** dejar una copia fantasma de los cuartos en su fila o devolverlos.

### B-5 · Los sextos tienen una devolución genérica

**Dónde:** `scenes-a.js:387`.

**Qué:** las respuestas «Dos», «Seis» y «Uno» reciben la misma línea. Falta algo como «dos sextos llegan a un tercio, no a la mitad».

### B-6 · Densidad poco legible

**Dónde:** `scenes-a.js:490,494`.

**Qué:** 5/8 y 9/16 flotan a 190 y 260 u sobre el suelo, sin línea a su marca. Los octavos y los dieciseisavos tienen el mismo color y la misma altura, así que no se sabe qué marca es cuál.

### B-7 · «2/6 de barra» no tiene consecuencia propia

**Dónde:** 5.6.

**Qué:** sólo se dibuja 2/5. 2/6 = 1/3 también es menor que 1/2 y merecía su contraste.

### B-8 · Centésimos y décimos fantasma confusos

**Dónde:** 5.7, `c5-directa/033`.

**Qué:** los centésimos (5,2 × 14 u, amarillos) parecen letras, una como «2» y otra como «Z». Mientras se dice «ningún décimo», los décimos de antes siguen visibles con transparencia de 0,25.

### B-9 · Falta el contraste 2,50 = 2,5

**Qué:** «El cero guarda el lugar» puede generalizarse a que todo cero cambia el valor.

**Cómo comprobar:** añadir una transferencia breve con 2,50 frente a 2,5.

### B-10 · «Más o menos» es la lectura habitual de ±

**Dónde:** `scenes-b.js:417`: «Con la raya ondulada: "más o menos"».

**Qué:** en la escuela argentina, «más o menos» se lee como ±, que va a aparecer en las cuadráticas (cap. 7). La Bitácora dice bien «aproximadamente»; el diálogo debería decir lo mismo.

### B-11 · Bitácora: un número que no se vio y una unidad que falta

**Qué:** «1/2 = 2/4 = 3/6 = 0,5» incluye 0,5, que no aparece en el juego. «Más partes, más chicas: 1/4 < 1/3» omite «de la misma unidad», justo en el capítulo de «¿de qué?».

### B-12 · Lógica y textos desconectados

**Qué:**
- Los textos están escritos a mano (`'1/2 + 1/3 = 3/6 + 2/6 = 5/6'`, `'50 % de 80 = 40'`) y no hay guardas que los comparen con `add()` o `percentOf()`. Sólo 5.2 tiene guarda.
- `isHalf` no se usa: el error «partes desiguales llamadas mitad» lo comete Punto, nunca el jugador.

**Cómo comprobar:** agregar pruebas de `percentOf(a,b) === percentOf(b,a)` para varios pares, `equivalent(decimal('2,50'), decimal('2,5'))`, 1/3 en décimos y la devolución de `place-frac`.

### B-13 · Documentación desalineada

**Qué:**
- `ARITHMOS_DESIGN.md` todavía titula el cap. 5 «(diseño, no implementado)» y la tabla dice «pendiente».
- `ARITHMOS_CURRICULUM.md` no tiene el contrato por concepto de C1–C4 (necesidad, error, consecuencia, transferencia) que exige el §5 del contrato.
- «Unidades», en la fila del cap. 5, no se trata ni se declara movida.
- No hay dato histórico. Está bien no inventarlo, pero si se agrega, `fuentes.md` no tiene hoy nada sobre fracciones, decimales ni la diagonal: hay que sumar fuentes antes.

### B-14 · Los pedazos se achican en el aire

**Dónde:** 5.2.

**Qué:** los pedazos se achican mientras vuelan a la barra punteada (escala `GS`). Es coherente con la unidad dibujada más chica, pero puede leerse como «el pedazo se achicó».

**Cómo comprobar:** una línea o un gesto que diga «la barra de arriba es un dibujo a escala», o achicar la barra y el pedazo juntos.

---

## Lo que está bien (para no romperlo al corregir)

- Repartir dos atados tiene dos caminos válidos, desatar y partir, y los dos se reconocen y convergen en «1/2 atado = 5 palitos». La unidad punteada se dibuja en 5.2, 5.3, 5.5 y 5.6.
- El absurdo de 2/5 < 1/2 se ve: el pedazo de Punto es más corto que la media barra sola. «Juntando, no puede haber menos» es un buen argumento.
- La densidad se muestra con un mecanismo general, partir a la mitad, y no con un solo ejemplo afortunado: 5/8 y 9/16 son correctos.
- Las desigualdades de la diagonal salen de `measureWith` (14/141/1414) con la coma decimal bien formateada. «≈ 1,414» es correcto tanto como truncamiento como redondeo. El límite de la prueba se declara, y se acepta la respuesta prudente («Hasta ahora ninguna. Quizás no haya ninguna.»).
- La notación es coherente en lo esencial: coma decimal en todos lados, «50 %» con espacio, «≠» para el error de Punto y «→» para repartos, que no es una igualdad.
- Coherencia con el cap. 4: «los dos atados que sobraron ayer» y «seis atados» coinciden con 4.4 y 4.6.

## Qué no pude verificar

- **El juego en ejecución.** No abrí el navegador ni corrí scripts, por restricción. Tampoco vi animaciones ni ritmo: sólo capturas fijas.
- **Ramas sin evidencia.** Por eso A-2 y parte de M-11 salen de leer el código:
  - 5.1 «Partir cada atado» y la respuesta «Medio atado»;
  - 5.2 «En 2» elegido primero;
  - 5.3 «Peldaño» y los sextos «6» y «1»;
  - 5.4 partición en 2, tocar las marcas 1/4 y 2/4, 5/4 «Entre el 0 y el 1», densidad «Sí»;
  - 5.5 «Lo mismo» y «2/3»;
  - 5.6 «2/6»;
  - 5.7 «Dejarla afuera» y «más que 2,5»;
  - 5.8 «El 50 % de 80»;
  - 5.9 «No se puede saber nunca».
- **Sin capturas de algunos momentos.** No hay captura de la comparación en doceavos de 5.5, ni de la pizarra final de 5.6 («1/2 + 1/3 = 3/6 + 2/6 = 5/6» y «≠ 2/5»), ni del rótulo «3 barras entre 4 → 3/4».
- **Disposición táctil o de teléfono (844×390)** del cap. 5: no hay evidencia.
- **El texto real de la Bitácora en pantalla.** Sólo vi el `seen` en `state.json`.
- **Comprensión humana.** No hay playtests. Nada de esto certifica que una persona entienda.
