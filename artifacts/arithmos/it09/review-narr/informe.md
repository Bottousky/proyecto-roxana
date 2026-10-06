# Arithmos — revisión narrativa, de puesta en escena y accesibilidad (cap. 9 «Depende»)

Revisor independiente (rev-narr-7), 2026-10-06. No abrí navegador, no corrí el juego ni scripts de partida. Trabajé
con el código del commit, los logs de partidas automáticas y las capturas PNG que ya existían.

## Alcance, evidencia y advertencias

- **Código revisado: commit `b8a1bc5`.** Los números de línea son los de ese commit:
  - `ch9/chapter.js`, `common.js`, `scenes-a.js` (9.1–9.4) y `scenes-b.js` (9.5–9.8, `writeJournal9`).
  - Costura de entrada: `ch8/scenes-b.js` 318–427 (8.8 y `writeJournal8`).
  - Contexto: `ch7/scenes-a.js` 10–22 (`studentWrites`) y 187 (la escalera de 7.2); `ch7/scenes-b.js` 570 (el reparto
    de Rampa de 7.9); `ch6/scenes-b.js` 46 (Oval); `ch5/scenes-b.js` 40 (`puntoRewrites`); `engine/ui.js` 304–331
    (`note`, `describe`).
- **El árbol cambió mientras revisaba.** Aparecieron `22d3552` (16:45, cap. 10 10.1–10.4) y `910a374` (17:02, cap. 10
  completo). Ninguno toca `ch7`, `ch8`, `ch9` ni `engine` (lo comprobé con `git diff --stat`). Del cap. 10 sólo leí la
  primera línea de 10.1 para evaluar la costura 9→10. `ARITHMOS_DESIGN.md` cambió en `22d3552`: el cap. 9 figura como
  «jugable, en revisión» y aparece el diseño del cap. 10.
- **Partidas** (bot, no personas):
  - `it08/c9a-directa2` (1600×900, 15:09): 9.1–9.4 con el código de `ecf8734`. Entre ese commit y `b8a1bc5`, 9.1
    cambia sólo en texto: la línea de Cornisa, el enunciado de la pregunta y la conclusión del estudiante, a la que se
    le agregó «Si además decís para qué lado apunta…». Lo visual no cambió.
  - `it08/c9b-directa` (15:49): 9.5–9.8.
  - `it08/c9-errores` (15:51): 9.1–9.8 por la ruta con errores. El texto de 9.1 es el viejo.
  - `it08/c9-telefono2` (844×390, táctil, 16:25): 9.1–9.8 con el texto final.
  - `it08/c9-telefono` (15:52): igual que la anterior, pero terminó con tres botones superpuestos en 9.6. Ya está
    corregido en `c9-telefono2`.
  - `it08/c8b-directa` (16:20): es la única partida que cruza la costura 8→9 (capturas 041–043).
  - Ninguna partida cruza la costura 9→10: las de `it09/c10-*` empiezan en 10.1.
- Los logs muestran qué se dice y en qué orden, no el ritmo.
- Medí los tamaños en píxeles a ojo, sobre las capturas y sobre recortes ampliados ×2 o ×4 (hechos con `sips` en mi
  carpeta temporal).

## Lo que funciona (para calibrar)

- **Por primera vez en varios capítulos, las escenas comparten objetos:**
  - La tabla de sombras de 8.8 recorre 9.1, 9.3 y 9.8 con los mismos números (`SOMBRA`, `scenes-a.js:9`, igual que
    `SHADOW` de `ch8/scenes-b.js:322`).
  - Las escaleras de 7.2 vuelven en 9.7: 1 + 10 · d y 2ᵈ, que se cruzan cerca del día 6 (61 contra 64).
  - El reparto 1 ÷ (x − 2) de 7.9 vuelve en 9.5.
  - El mapa de 8.7 reaparece en 9.3: «En el mapa de Mara».
- **El error de Punto encarna la tesis del capítulo.** En 9.3 Punto dibuja una ola linda que no sale de la tabla. Es el
  error que el contrato G pide distinguir (un gráfico contra un dibujo decorativo). Después pasa el borrador: se lleva
  la ola y los puntos medidos quedan. Es la premisa de la Marea puesta en imagen (`scenes-a.js:259-275`).
- **Los límites los dicen los personajes:**
  - Cornisa: «Casi, porque no lo medí» (`:287`).
  - «La línea dice lo que suponemos entre medición y medición» (`:286`).
  - «dice si puede ser una función, no cuál» (`:390`).
  - «con los números que conocemos» (`scenes-b.js:166`).
  - «en invierno, la ve cambia un poco» (`:301`).
- **Hay gestos reales:**
  - En 9.3 se ubican cinco puntos entre 25 cruces, y cada error tiene una nota específica (`scenes-a.js:241-249`).
  - En 9.2, 9.5 y 9.6 el jugador elige qué números probar.
  - En 9.5, si el jugador no probó el 2, Rampa pregunta «¿Y con 2?» (`scenes-b.js:88-93`). Es un buen andamio.
- **Una familia usa el resultado:** Cornisa lee la hora 9 en el gráfico y le da «más o menos 3».
- **Tono menos de consulta:**
  - «no hay "lunes y medio"»;
  - Oval pide un −4, coherente con su «me gusta elevar todo al cuadrado» del cap. 6;
  - la ola «linda» de Punto.
- **Menos menús evaluados:** 7, contra los 11 del cap. 8 en `55e9eee`.
- **8.8 quedó corregido:**
  - la sombra apunta lejos del sol y se ve como una banda azul gruesa (`c8b-directa/041`);
  - la tabla anota el largo y el sentido;
  - la escena termina en una pregunta.
- **A 1600×900 se lee lo esencial:**
  - las flechas (`c9a-directa2/003`);
  - la tabla de la máquina (`006`);
  - el gráfico de sombras (`016`);
  - las tres escaleras (`c9b-directa/008`);
  - las ves (`c9-errores/032`).

## ¿Repite el cap. 9 los problemas señalados antes?

| Problema (rev-narr-2 a 6) | En el cap. 9 | Dónde |
|---|---|---|
| Plantilla, desfile de vecinos, nada se acumula, sin clímax | **Sí en la forma.** Mejora en motivos compartidos | A1 |
| El juego da el paso decisivo; botón único | **Sí** | A2 |
| Texto y cuentas que contradicen la imagen | **Sí, y ahora contra la tesis del capítulo** | A3 |
| Tamaños en teléfono | **Sí, en todas las elecciones** | A4 |
| Punto oyente, sin error ni evolución | **Mejoró:** dos errores. No se corrige solo y no escribe | M1 |
| Marea sin apuesta | **Aparece,** como «brisa», sin apuesta | M2 |
| El estudiante como profesor, «Nombre:» | **Peor:** 10 de 12 líneas | M3 |
| Opciones que se delatan | **Sí,** con el mismo patrón | M4 |
| Costura de entrada | **Mejoró** el gancho. Falta la tabla y la pregunta se repite tres veces | M5 |
| Gancho que adelanta el temario | **Sí:** Mara cierra con el contenido de 10.1 | M6 |
| Hablante fuera de cuadro, sin primer plano, subtítulo arrastrado | **Sí** | M7 |
| `studentWrites` mudo, amarillo para todo | **Sí** | M8 |
| Bitácora como boletín | **Sí, ahora con un puntaje** | M9 |
| «Anotado en la Bitácora» en la tarjeta y el título; «Ø» | **Sí** | B1, B2 |
| «Como dije» | No | — |

---

## Hallazgos ALTOS

### A1. La misma plantilla en las ocho escenas: un capítulo sobre la sombra que nunca sale a mirarla y termina sin clímax

- **Dónde:**
  - **La misma apertura.** Los ocho `setup` hacen `clean(g, /^c9-/)` + `boardCast` + `SHOTS.board`
    (`scenes-a.js:18-23`, `107-111`, `210-214`, `309-313`; `scenes-b.js:49-53`, `117-121`, `182-186`, `254-258`). Cada
    `play` hace `d.shot(SHOTS.board, 1)` y después `d.shot(SHOTS.tiles, 0.8)`. No se usan nunca `close`, `wide` ni
    `shadow`, aunque el cap. 8 terminó en `shadow`. Las aperturas son el mismo encuadre: `c9a-directa2/001`, `005`,
    `012`, `020` y `c9b-directa/007`, `009`.
  - **La misma secuencia:**
    1. Alguien trae un problema: Cornisa, Mara, Cornisa, Balcón, Rampa, Mara (por Oval), Mara (con Peldaño) y Cornisa.
    2. Plano `tiles`.
    3. Un gesto.
    4. Un menú.
    5. El estudiante concluye con un vocativo.
    6. A veces, `studentWrites`.
  - **La misma mecánica tres veces:** máquina + fila de números + menú en 9.2, 9.5 y 9.6, con la misma función `feed`.
    Además, 9.5 repite 7.9: la misma Rampa, la misma 1 ÷ (x − 2) y la misma pregunta de dónde se traba.
  - **Nada se acumula.** Cada escena limpia la pizarra. El gráfico de 9.3 desaparece y 9.8 dibuja otro, sin horas. El
    capítulo de la sombra no vuelve nunca afuera: «Seguí midiendo, varios días» (`scenes-b.js:264`) pasa en la
    pizarra.
  - **No hay clímax ni apuesta.**
    - El viajero que motiva el capítulo (`scenes-a.js:28`) no vuelve a aparecer.
    - El cierre son tres ves iguales, una predicción y una línea de Mara sobre medir ángulos.
    - Para el bot, las ocho escenas duran entre 4 y 12 s (`c9b-directa/log.txt`, `c9a-directa2/log.txt`).
- **Por qué importa:**
  - Contrato §4: cada escena necesita «un propósito dramático» y hay que alternar descubrimiento, descanso, humor y
    emoción.
  - Contrato §13: buscar «momentos que parezcan una plantilla educativa».
  - Es la quinta revisión seguida que lo marca (A2/A6 de rev-narr-4, A1 de rev-narr-5 y de rev-narr-6).
- **Propuesta (reversible, con piezas que ya existen):**
  - **Un hilo con deseo: el reloj de sombra de Cornisa para los viajeros.**
    - 9.1: el viajero no pudo leer el «2» de Cornisa, y Cornisa quiere un reloj que cualquiera pueda leer.
    - 9.3: el gráfico es la cara del reloj. Queda en un rincón de la pizarra, sin borrarse.
    - 9.4: los dibujos de Balcón son caras candidatas. ¿Cuál puede ser un reloj, con una sola lectura por hora?
    - 9.8: afuera, con `SHOTS.shadow`, durante varios días. El viajero vuelve y el jugador le dice la hora con el largo
      y el sentido. Es «la otra entrada» que anuncia la línea de `scenes-a.js:85`, y el estudiante no necesita
      explicarla.
  - **Juntar 9.5 y 9.6** en una sola escena de máquina («qué puede entrar, qué puede salir», con Oval presente). El
    lugar que queda libre es para el cierre del hilo.
  - **Variar los planos:**
    - 9.1 y 9.8 en `SHOTS.shadow`;
    - `close` sobre las flechas dadas vuelta (dos salen del 2) y sobre el doble corte de 9.4;
    - `wide` para la pasada del borrador.
- **Cómo comprobarlo:**
  - al menos tres encuadres de apertura distintos en la partida directa;
  - una captura de 9.8 con el gráfico de 9.3 todavía en la pizarra;
  - el viajero con líneas en 9.1 y en 9.8.

### A2. El paso decisivo lo da el juego: flechas de memoria, la vuelta automática, la recta parada que se mueve sola y dos botones únicos

- **Dónde, escena por escena:**
  - **9.1, flechas de memoria y vuelta automática:**
    - El jugador une cada hora con su sombra, pero la tabla de 8.8 no está en pantalla. La pista lo admite: «(la tabla
      de ayer)» (`:43`). La pizarra sólo tiene 8…16 y 1, 2, 4 (`:29-35`; `c9a-directa2/003`).
    - Si se equivoca, la nota le dicta la respuesta: «En la tabla, a las 8 la sombra medía 4» (`:53`). El gesto es
      transcribir de memoria o probar hasta que la nota dicte.
    - El momento decisivo, dar vuelta las flechas y descubrir que del 2 salen dos, es una cinemática (`:76-80`). El
      diseño decía que el jugador las dibuja: «y después cada sombra con su hora».
  - **9.2, la regla y la máquina de Punto:**
    - El jugador nunca formula la regla. Elige qué sale con 10 en un menú, el cartel se reescribe solo como «× 2 + 1»
      (`:164`) y el estudiante la enuncia (`:166`). Mara había pedido «Adiviná qué hace» (`:118`).
    - La máquina de Punto es un botón único («3», después «otra vez 3») que se toca dos veces (`:177-188`). Criterio 2.
  - **9.3, unir los puntos:**
    - La línea se dibuja igual sea cual sea la elección (`:284-285`). La elección sólo cambia un pensamiento.
    - El caso de las familias por día es sólo verbal: no hay puntos (ver A3).
  - **9.4, la recta parada:**
    - El estudiante enuncia la prueba antes de que el jugador vea nada (`:333`; `c9a-directa2/021`).
    - El jugador sólo dice «es función» o «no es», y el juego hace el barrido (`:361-365`). El diseño decía «Pasar una
      recta parada por cuatro dibujos».
  - **9.8, «otro día»:**
    - Es un botón único que se toca dos veces (`scenes-b.js:281`) y dibuja una ve idéntica.
    - La predicción se contesta con la imagen que el jugador acaba de ver tres veces.
  - **9.7:** emparejar dos carteles con tres letras está bien. Pero no hay tabla, y la ayuda cita valores que el
    gráfico no deja leer (ver A3).
- **Por qué importa:**
  - Contrato §8: «No aceptes escenas que se resuelvan sólo pulsando continuar mientras el juego piensa por el
    jugador».
  - Contrato §5: el jugador tiene que poder «observar, predecir y modificar».
  - Criterios 1 y 2. Es la cuarta revisión seguida (A2 de rev-narr-6).
- **Propuesta (una por escena):**
  - **9.1:**
    - La tabla de 8.8 queda en la pizarra, con sus → y ←. Copiar desde lo que se ve está bien.
    - Después, el jugador dibuja la vuelta: toca «2» y una hora. Tras la primera flecha, la pista pregunta «¿Qué otra
      hora tenía 2?». El jugador dibuja la segunda y ve dos flechas saliendo del 2.
    - Sacar el menú evaluado: el descubrimiento es el gesto.
  - **9.2:**
    - El jugador arma la regla con piezas de tiza (× 2, × 3, + 1, + 2). La máquina la prueba contra la tabla anotada, y
      una regla falsa falla en un renglón visible.
    - En la máquina de Punto, Punto la alimenta él mismo y el jugador decide cuándo vio bastante.
  - **9.3:**
    - Si el jugador eligió «sueltos», no se dibuja nada y Cornisa pregunta «¿y a las 9?»: con los puntos sueltos no
      hay respuesta. Después el jugador une tocando los puntos en orden.
    - Para Mara: sus tres puntos dibujados (ver A3). El jugador intenta unirlos, el tramo pasa por «martes y medio:
      4,5 familias» y Mara contesta.
  - **9.4:**
    - El jugador arrastra la recta parada, o la mueve con ← → como alternativa al gesto de precisión, y decide cuándo
      corta dos veces.
    - El veredicto va después del barrido. La regla del estudiante, después del primer dibujo.
  - **9.8:** antes de cada día, el jugador toca dónde va a estar la sombra de las 10 sobre un día vacío. Después se
    superpone la medición de Cornisa.
- **Cómo comprobarlo:**
  - ningún `wordSpot` tocado más de dos veces seguidas;
  - en `c9-errores`, una flecha de vuelta dibujada por el jugador;
  - una captura de 9.4 con la recta en una posición que eligió el jugador;
  - ≤ 5 `evaluate: true` en el capítulo.

### A3. Texto e imagen se contradicen, y dos de los gráficos son dibujos en el capítulo que dice que un gráfico se lee

- **9.2, la máquina de Punto no existe en pantalla:**
  - Punto se mete debajo de la máquina de Mara (`:171`). Sus salidas, «3 → 7» y «3 → 9», aparecen en amarillo arriba a
    la derecha (`:181`).
  - La única máquina dibujada dice «× 2 + 1» (`c9a-directa2/010`, `c9-telefono2/010`). En la imagen, la máquina de Mara
    dio 3 → 9. Eso contradice la línea de `:166` («Con el mismo número, siempre sale lo mismo») justo en la definición
    de función.
  - «Punto mira su máquina un rato. Después tacha la ruedita que giraba sola» (`:194`): no hay máquina, ni ruedita, ni
    tachado.
- **9.3, las familias por día no se dibujan:**
  - «¿Esos puntos se unen?» (`:293`) se pregunta sin los puntos de Mara.
  - En la pizarra está el gráfico de Cornisa, ya unido (`c9a-directa2/018`, `c9-telefono2/018`). La opción «Unidos,
    como los de Cornisa» señala los únicos puntos visibles.
- **9.3, la descripción de la ola:** el `describe` dice que «pasa por arriba y por abajo de los puntos sin tocarlos»
  (`:266`). En `c9a-directa2/014` la ola pasa por el punto de las 14: un valle cae a la misma altura.
- **9.7, el gráfico de las escaleras:**
  - El estudiante dice «con la tabla se leen algunos» (`scenes-b.js:238`), pero en la escena no hay tabla.
  - El eje vertical no tiene números (`:192-197`, sólo los días). La nota del error cita «el día 0 hay 10» (`:226`), un
    valor que el gráfico no deja leer.
  - «Se cruzan un poco antes del día 6»: el dibujo termina en el día 6, así que A y C se juntan en la punta y la curva
    no «despega» de la recta (`c9b-directa/008`). El cruce visible de la curva amarilla es con B, cerca del día 4.
- **9.8, las ves:**
  - El eje de tiempo no es proporcional. Cada día (8 h) ocupa 120 u y cada noche (16 h) 40 u (`:265-266`: `DW = 160`,
    `HX = 15`).
  - No hay marcas de hora. En vertical sólo hay «1» y «4» (`:268`; `c9-errores/032`).
  - La pregunta «Pasado mañana a las 10» pide leer un punto que el gráfico no rotula.
  - El pensamiento «Los huecos son parte del dominio que falta» (`:293`) confunde: esas horas no están en el dominio.
- **9.5, pensamientos que no dependen de lo probado:**
  - «Con todos los demás sale algo, aunque sea negativo» (`:94`) se dice siempre. Quien probó 3, 5 y 2 no vio ningún
    negativo.
  - En la rama `not2`: «La máquina acepta −1 y 2,5» (`:101`). El 2,5 no está entre los botones (`:65`).
- **Por qué importa:**
  - El diseño fija la idea central: «el gráfico es una herramienta para leer, no un dibujo». El contrato G pide
    diferenciar «un gráfico de un dibujo decorativo».
  - Los gráficos de 9.7 y 9.8 son dibujos: sin escala y con el tiempo comprimido.
  - Criterios 5 y 8; contrato §2: una metáfora visual no debe inventar propiedades. Es la misma falla que A5 de
    rev-narr-6.
- **Propuesta:**
  - **9.2:** la máquina de Punto como una segunda caja amarilla, con una ruedita que gira y sus salidas al lado. Punto la
    tacha de un trazo y la vuelve a alimentar: 3 → 7, 3 → 7.
  - **9.3:**
    - Los tres puntos de Mara en un mapa chico aparte (lunes, martes, miércoles), ver A2.
    - El `describe`: «una línea ondulada que no sale de la tabla: pasa cerca de algunos puntos y lejos de otros».
  - **9.7:**
    - Eje vertical con números (0, 10 … 70).
    - Llegar al día 7, o cortar la curva con una flecha de «sigue».
    - Que el jugador lea tres valores en el gráfico y arme la tabla: eso son literalmente las «tres maneras».
  - **9.8:**
    - Eje proporcional: cada 24 h igual; de 8 a 16 la ve, y la noche vacía con un rótulo «noche».
    - Horas 8, 10, 12, 14 y 16 en el primer día; en vertical, de 1 a 4.
    - El pensamiento: «De noche no hay sombra: esas horas no están en el dominio».
  - **9.5:** el pensamiento armado con `tried`, y no citar 2,5 si no es un botón.
- **Cómo comprobarlo:**
  - una captura de 9.2 con dos cajas;
  - una de 9.3 con los puntos de Mara;
  - capturas de 9.7 y 9.8 con los ejes numerados;
  - en 9.8, la noche más ancha que el día.

### A4. En teléfono (844×390) todas las elecciones se hacen sobre figuras que no se leen

- **Dónde** (`c9-telefono2`, texto final; tamaños medidos a ojo sobre recortes ampliados ×4). Cada elección evaluada se
  hace en un plano más lejano que el de la interacción, y el panel de opciones ocupa la mitad de abajo:
  - **9.1** (`003`): «8 h…16 h» y «1, 2, 4» ≈ 7 px; las flechas, trazos de ≈ 1 px.
  - **9.2** (`006`): la tabla «1 → 3…» ≈ 8 px; «entra:» ≈ 5 px.
  - **9.3, «¿Los puntos se unen?»** (`015`): la pizarra mide ≈ 150 px de ancho; los números de los ejes y los puntos,
    ≈ 3 px. Es ilegible.
  - **9.3b** (`018`): rótulos ≈ 6 px.
  - **9.6, «¿Puede salir −4?»** (`027`): la tabla «−3 → 9…» ≈ 6 px y «x · x» ≈ 4 px.
  - **9.8** (`033`): «1», «4» y «día 1» ≈ 5 px.
  - **9.4** (`022`): los veredictos «función / no es función» ≈ 6 px.
  - **Subtítulos que tapan la evidencia:**
    - 9.1 (`004`): la conclusión ocupa cuatro renglones y tapa la fila de las 16 h y el 4;
    - 9.7 (`030`): tres renglones tapan el eje.
  - **Blancos chicos:** los cruces de 9.3 son de 40 × 32 u (`scenes-a.js:241`). En el plano `tiles` quedan por debajo de
    44 px de alto. Lo calculé, no lo medí.
  - **Una demora sin explicación:** el bot pasó 104 s en 9.4 en el teléfono (`log.txt`, de 23,4 a 127,1 s), contra
    11 s a 1600×900. Ninguna captura ni error lo explica.
- **Por qué importa:**
  - Contrato §3: «ejes y etiquetas deben distinguirse sin esfuerzo».
  - Contrato §9: verificar la disposición táctil.
  - Es la cuarta revisión seguida (A5 de rev-narr-5, A6 de rev-narr-6), y ahora en todas las elecciones del capítulo.
- **Propuesta:**
  - Elegir sin salir del plano `tiles`: un panel compacto en un renglón, o las opciones como blancos sobre la pizarra.
  - Mínimo de 12 px para todo texto, medido en el plano en que se lee.
  - Que la guarda de `ui.js` que ya detecta botones superpuestos también mida los rótulos y los subtítulos que tapen
    blancos.
  - Acortar la línea de 9.1: «Si además decís…» puede pasar al cierre de 9.8.
  - Blancos de 9.3 de ≥ 44 px.
- **Cómo comprobarlo:**
  - capturas 003, 015 y 027 a 844×390 con todo texto ≥ 12 px;
  - `summary.json` con el control de tamaño nuevo, sin errores.

---

## Hallazgos MEDIOS

### M1. Punto se equivoca dos veces, pero no se corrige solo, no escribe y no reacciona

- **Dónde:**
  - **9.2, la máquina:**
    - La presenta Mara: «Punto también hizo una» (`:168`). Los botones los toca el jugador.
    - El veredicto lo da el estudiante: «Punto, … no es una función» (`:192`).
    - La corrección la cuenta un pensamiento del estudiante (`:194`).
  - **9.3, la ola:**
    - Punto dibuja la ola (`:259-268`) y el estudiante lo corrige (`:269`).
    - La brisa la borra (`:271-275`). Después Punto no reacciona: sólo `follow` (`:276`).
  - **9.6 y 9.8:** sólo pulsos con sonido de pregunta (`scenes-b.js:167-168`, `304-305`).
  - **9.7, su propia curva:** Mara dice «la de Punto, el doble cada día» (`:191`) y la curva amarilla es la suya, pero
    Punto no hace nada.
  - **Sin rastro propio:**
    - Punto no escribe en todo el capítulo (compárese con `puntoRewrites`, `ch5/scenes-b.js:40`).
    - No hay ningún flag de Punto: los `c9*` sólo marcan escenas terminadas (`c9-errores/state.json`).
- **Qué:**
  - Es un avance respecto del cap. 8 (A3 de rev-narr-6): hay dos errores, y la ola es el error del capítulo.
  - Pero no se cumple el criterio 4: «se corrige él mismo (borra y reescribe)».
  - El diseño ubica a Punto en el estado «Plano / curva»: «dibuja relaciones, anticipa con el jugador». Aquí dibuja un
    adorno y no anticipa nada.
  - Su máquina con «una ruedita que giraba sola» no es un error de comprensión verosímil: es un truco.
- **Por qué importa:** contrato §4: el acompañante cambia «cómo percibe, se expresa y se relaciona», puede
  «equivocarse y comprender junto al jugador».
- **Propuesta:**
  - **9.3:** tras la pasada, Punto mira el lugar vacío y vuelve a dibujar, esta vez uniendo los puntos uno por uno. Es
    su primer «dibuja relaciones». Escribe «9 → 3?» y Cornisa dice «casi».
  - **9.2:** Punto tacha él la ruedita con `puntoRewrites`.
  - **9.7:** Punto reconoce su curva y salta a la C antes que el jugador, que confirma o no. Es «anticipa con el
    jugador».
  - **9.8:** la opción «Más: cada día crece», que es su intuición de 7.2, la sostiene Punto y no un menú. La tercera ve
    lo desmiente y él lo corrige.
  - Fijar `g.flags.puntoGraph`.
- **Cómo comprobarlo:**
  - un `describe` de Punto corrigiéndose sin una línea previa del estudiante;
  - un flag de Punto en `state.json`.

### M2. La Marea aparece como «brisa», pero confirma un veredicto en vez de crear una apuesta

- **Dónde:** `scenes-a.js:271-275`. «Pasa una brisa de borrador: la ola de Punto se deshace»: sonido de borrado de
  1,2 s, sacudida de 0,15 y la ola que se desvanece. No se nombra a la Marea ni se ve el borrador. No hay captura de la
  pasada: `c9a-directa2` va de `014` (la ola) a `015` (la elección).
- **Qué:**
  - Está bien pensada: lo que no sale de la tabla se va, y lo medido resiste.
  - Pero llega después del veredicto del estudiante (`:269`), así que sólo lo confirma.
  - No hay riesgo ni decisión.
  - Le borra a Punto su dibujo sin un momento emocional.
  - El criterio 6 se cumple en su forma mínima.
- **Por qué importa:**
  - La premisa del diseño: «Lo que nadie entiende, el borrador se lo lleva».
  - Es la cuarta revisión que pide que la Marea obligue a decidir.
- **Propuesta:** que la Marea pase al empezar 9.8. Borra la tabla y deja el gráfico de 9.3, o al revés, y el jugador
  tiene que reconstruir la sombra de las 10 desde lo que quedó. Es una decisión con consecuencia, ligada a «un gráfico
  se lee».
- **Cómo comprobarlo:**
  - una captura a mitad de la pasada;
  - un `describe` que diga qué resistió y por qué;
  - una acción del jugador después de la pasada.

### M3. Voces: el estudiante abre diez de doce líneas con un vocativo y define todo; Mara cierra el capítulo

- **Dónde:**
  - **Vocativos.** El estudiante tiene 12 líneas en voz alta y 10 empiezan con vocativo:
    - «Cornisa:» (`scenes-a.js:85`; `scenes-b.js:300`);
    - «Mara:» (`scenes-a.js:166`, `295`; `scenes-b.js:166`, `238`);
    - «Punto,» (`scenes-a.js:192`, `269`);
    - «Balcón:» (`:389`);
    - «Rampa:» (`scenes-b.js:103`).
  - **Define por decreto:** «Eso es una relación, pero no una función» (`scenes-a.js:85`), «se llaman el dominio»
    (`scenes-b.js:103`), «se llama la imagen» (`:166`).
  - **Mara cierra el capítulo** (`:303`).
  - **Las familias no usan el resultado.** Sólo lo hace Cornisa en 9.3 (`scenes-a.js:287`):
    - Cornisa no contesta en 9.1 ni en 9.8;
    - Rampa no usa el dominio;
    - Balcón no reacciona.
  - **Problemas de segunda mano:**
    - Oval no está en escena («Oval me pidió», `scenes-b.js:127`);
    - las familias por día de Mara (`scenes-a.js:289`) y la escalera 10 + d de Peldaño (`scenes-b.js:191`, `239`) no
      tienen origen;
    - el viajero sólo se narra.
- **Por qué importa:** criterio 3 (Mara «no define ni cierra») y contrato §4. Es la tercera revisión que lo marca, y
  empeoró: el cap. 8 tenía 7 vocativos.
- **Propuesta:**
  - Vocativos ≤ 3 en el capítulo.
  - Una línea de uso por familia. Rampa: «Entonces si vienen dos, ni abro el atado».
  - Oval presente pidiendo su −4.
  - Cornisa contestándole al viajero en 9.8.
  - La última línea, de Punto o del viajero.
  - Las palabras «dominio» e «imagen» escritas por el estudiante debajo de lo que hizo el jugador (la lista de entradas
    que anduvieron), no como un discurso.

### M4. Opciones que se delatan con el patrón de siempre, y una «incorrecta» que el capítulo anterior enseñó a elegir

- **Dónde:**
  - **La correcta es la más larga y trae su razón** en 6 de 7 menús:
    - 9.1 (`scenes-a.js:70-72`);
    - 9.3a (`:279`);
    - 9.3b (`:291`);
    - 9.5 (`scenes-b.js:96`, la única que ocupa dos renglones en `c9b-directa/003`);
    - 9.6 (`:158`);
    - 9.8 (`:295`).
  - **En 9.2 vuelve el patrón numérico del cap. 8:** la correcta es un número pelado («21.») y las incorrectas traen
    razón (`scenes-a.js:157-159`).
  - **Opciones de paja:**
    - «Unirlos con una curva linda, como la de Punto», justo después de que la borró la Marea (`:281`);
    - «Sí: con −2, que es negativo», con «−2 → 4» escrito en la pizarra (`scenes-b.js:160`; `c9b-directa/005`);
    - «Más: cada día crece», después de tres ves iguales (`:297`);
    - «Cualquier número.» (`:98`).
  - **9.1 delata la respuesta.** Con «describir» activado, el `describe` de antes del menú dice «A la sombra 2 llegan dos
    flechas, de las 10 y de las 14» (`scenes-a.js:67`).
  - **9.8 castiga la prudencia.** Evalúa como incorrecta «No se puede saber» (`scenes-b.js:296`):
    - la tesis del cap. 8 era que probar casos no alcanza;
    - el contrato (§7 I) pide distinguir «una regularidad observada de una garantía»;
    - el estudiante contesta «Cornisa: 2» en todas las ramas (`:300`);
    - la Bitácora anota «pensaste otra cosa» (`:329`).
- **Por qué importa:**
  - Una elección que se gana por la forma mide lectura de menús (contrato §5).
  - 9.8 premia lo contrario de lo que el capítulo anterior enseñó.
  - Es M2 de rev-narr-6 y M4 de rev-narr-5.
- **Propuesta:**
  - Opciones del mismo largo, todas con una razón verosímil. Por ejemplo, en 9.6: «Sí: con un número entre −1 y 0, que
    no probé».
  - 9.8 sin `evaluate`: «No se puede saber seguro» es válida, con otra continuación: «si el sol sigue dando la misma
    vuelta, 2».
  - Mover el `describe` de 9.1 después de la elección, o hacerlo neutro: «De cada hora sale una flecha».

### M5. Costura 8→9: la misma pregunta tres veces, con los roles dados vuelta y sin la tabla

- **Dónde:**
  - 8.8 termina con Mara: «si un viajero te dice sólo el largo de su sombra… ¿le podés decir qué hora es?»
    (`ch8/scenes-b.js:379`; `c8b-directa/041`).
  - 9.1 abre con Cornisa: «Un viajero me preguntó la hora y le dije sólo el largo… No supo qué contestar»
    (`scenes-a.js:28`).
  - Después el menú lo pregunta otra vez (`:73`).
- **Qué:**
  - **Tres formulaciones de la misma pregunta seguidas.**
  - **Los roles se invierten.** En 8.8 el viajero da su sombra y Cornisa la lee; en 9.1 Cornisa da la suya y el viajero
    tendría que leerla.
  - **La semejanza sigue sin usarse.** La sombra de un viajero depende de su altura: es justo lo que usaría la
    semejanza de 8.3, y la motivación «Desde que entendí lo de las copias» (`ch8/scenes-b.js:342`) sigue sin hacerlo
    (M4 de rev-narr-6, a medias).
  - **«No supo qué contestar»:** el viajero era el que preguntaba. Lo que no supo fue la hora.
  - **La tabla desaparece.** La tabla de 8.8, en pantalla al final de 8.8 (`041`), no está en 9.1 (ver A2).
  - **Se pasa de afuera a la pizarra** sin volver.
  - **El aviso «Anotado en la Bitácora (≡)»** queda sobre la apertura de 9.1 (`c8b-directa/042`).
- **A favor:** 8.8 ya no resuelve el capítulo 9. Deja la pregunta, y la línea de 9.1 retoma el sentido de la sombra.
- **Propuesta:**
  - 9.1 abre afuera, en `SHOTS.shadow`, con el viajero presente. Pregunta la hora, Cornisa se mira la sombra y dice «2»,
    y el viajero mira el cielo.
  - Sin repreguntar: se va a la pizarra con la tabla de 8.8.
  - En 8.8, sacar «copias» o usarlo: «Mi sombra y la del poste son copias parecidas…».

### M6. Costura 9→10: Mara cierra con el temario de 10.1 y nombra una rueda que nunca se vio

- **Dónde:**
  - `scenes-b.js:303`. Mara: «Vueltas que se repiten… El sol da vueltas, la rueda del pozo da vueltas. Para eso hay que
    medir ángulos de otra manera.»
  - Tarjeta en `ch9/chapter.js:13-14`.
  - 10.1 (`910a374`) abre con Balcón: «La rueda del pozo perdió la soga…».
- **Qué:**
  - **Un adelanto de temario:** el gancho anuncia el contenido de 10.1, los radianes. Es M4 de rev-narr-4, 5 y 6.
  - **Mara cierra** (criterio 3).
  - **«La rueda del pozo» es sólo una palabra.** El pozo del cap. 3 era una recta parada sin rueda, y en el cap. 9 no
    se ve.
  - **No hay deseo ni amenaza,** y 10.1 no sigue el hilo de la sombra. A favor: el diseño de 10.3 prevé «no es la
    sombra de Cornisa», un buen eco.
  - **Una línea posiblemente vieja:** con `CHAPTERS[10]` registrado, la frase «El capítulo 10 todavía se está
    dibujando» ya no debería salir. No lo verifiqué.
- **Propuesta:**
  - Cerrar 9.8 con una imagen: Punto sigue el arco del sol con su estela y deja un medio círculo. La ve de la sombra y
    el arco son el mismo movimiento. El pulso de pregunta de Punto, sobre el arco.
  - La rueda del pozo, dibujada al fondo de las Terrazas desde 9.1.
  - Sin la frase de «medir ángulos de otra manera».

### M7. Composición a 1600×900: el que habla queda cortado, las revelaciones no tienen primer plano y los subtítulos se arrastran

- **El estudiante fuera de cuadro.** En el plano `tiles` queda cortado por el borde izquierdo mientras dice sus
  conclusiones (`c9a-directa2/004`, `007`, `014`, `016`; `c9b-directa/008`). Es M5 de rev-narr-6.
- **Sin primer plano en las revelaciones:**
  - las dos flechas que salen del 2;
  - el doble corte del círculo (sin captura);
  - la pasada del borrador.
- **El subtítulo anterior queda sobre la escena siguiente:**
  - `c9a-directa2/011`: «Punto mira su máquina…» sobre la pizarra vacía de 9.3;
  - `c9b-directa/009`: la línea de Peldaño sobre la apertura de 9.8, con Cornisa.

  Es la sexta revisión que lo marca.
- **9.4, la disposición delata los veredictos:**
  - el rótulo «función» de la recta cae sobre los brazos de la U (`c9-errores/021`);
  - la grilla deja las dos funciones a la izquierda y las dos que no lo son a la derecha (`scenes-a.js:321-324`):
    después de dos veredictos, la columna predice el resto.
- **9.3, Punto parece el sol.** Punto queda amarillo, arriba y al centro del gráfico, sobre las 12 (`:261`;
  `c9a-directa2/014`). Se lee como el sol del mediodía, y el sol de 8.8 también es amarillo.
- **Propuesta:**
  - El plano `tiles` corrido 100–150 u, o el estudiante parado en el borde de la pizarra.
  - Limpiar el subtítulo al cambiar de escena.
  - En 9.4, mezclar las posiciones y dejar los rótulos debajo de cada dibujo, con aire.
  - En 9.3, que Punto se pose en el borde del gráfico.

### M8. Accesibilidad: lo escrito no se anuncia, botones sin verbo y amarillo para todo

- **`studentWrites` sigue mudo** (`ch7/scenes-a.js:10-22`). Las cuatro conclusiones escritas del capítulo no llegan a
  `sr-live`:
  - «función: a cada entrada, una sola salida»;
  - «un gráfico se lee…»;
  - «dominio: cuenta x ≠ 2; reparto 3, 4, 5, …»;
  - «imagen de x · x: 0 y los positivos».

  Es la quinta vez.
- **Sin `describe`:**
  - la línea que une los puntos (`scenes-a.js:284-285`);
  - el cartel que pasa a «× 2 + 1» (`:164`).
- **Rótulos sin verbo:**
  - «Las 8» y «Sombra 2» (`:45-46`);
  - «A las 8, sombra 0» (`:241`);
  - «El dibujo de la recta» (`:343`);
  - «El gráfico A» y «Cartel 1 + 10 · d» (`scenes-b.js:218-219`).
- **«Cartel 2ᵈ»** usa U+1D48. Un lector de pantalla puede leerlo como «2» o por el nombre del carácter (no lo probé).
  El `describe` sí dice «2 elevado a d» (`:237`).
- **Amarillo para todo, no sólo para Punto:**
  - los carteles de las máquinas de Mara (`scenes-a.js:121`; `scenes-b.js:18`);
  - los puntos ubicados (`scenes-a.js:251`);
  - la línea que los une (`:284`);
  - los veredictos (`:378`);
  - las marcas de corte (`:372`);
  - «se traba» (`scenes-b.js:78`);
  - las ves (`:270`).

  En 9.2 esto alimenta la confusión de A3. En 9.3 la línea «buena» tiene el mismo amarillo y grosor que la ola borrada
  de Punto.
- **Propuesta:**
  - `studentWrites` llama a `d.describe('El estudiante escribe: …')` con la versión leíble («x distinto de 2»).
  - Rótulos con verbo: «Unir las 8 con la sombra 2».
  - Las máquinas de Mara en blanco y lo de Punto en amarillo.
  - Los puntos en blanco rayado.

### M9. La Bitácora sigue siendo un boletín, ahora con un puntaje

- **Dónde:** `writeJournal9`, `scenes-b.js:310-347`.
- **Qué:**
  - Hasta 8 ítems en «Lo que pasó», todos sobre respuestas.
  - Uno es un marcador: «Con la recta parada acertaste 3 de 4 dibujos» (`:323`). El contrato §3 pide evitar barras y
    estrellas.
  - «pensaste otra cosa» (`:329`) no dice qué.
  - **Atribuye de más:** «Con pocos casos pensaste otra regla» (`:317`, igual que el pensamiento de
    `scenes-a.js:163`). El jugador tenía tres casos que ya descartaban 20 y 13 (`c9a-directa2/006`).
  - Ningún ítem de historia: ni el viajero, ni la ola borrada, ni la máquina de Punto.
  - El cuarto párrafo (`:338`) carga dominio, imagen, tres representaciones y periodicidad. Es M7 de rev-narr-6, sin
    cambios.
- **Propuesta:**
  - Entre 3 y 5 ítems, al menos dos de historia.
  - Sin contadores.
  - Una idea por párrafo; la periodicidad, en «Desplegar».

---

## Hallazgos BAJOS

- **B1. El aviso «Anotado en la Bitácora (≡)»** sigue visible en la tarjeta de fin y en la pantalla de título
  (`c9b-directa/014`, `015`) y sobre la apertura de 9.1 (`c8b-directa/042`).
- **B2. Cero barrado:** «1Ø h» (`c9a-directa2/003`), «Ø → −1/2» (`c9b-directa/002`), «Ø» en el eje de días (`008`).
- **B3. «No supo qué contestar»** (`scenes-a.js:28`). Mejor: «Se quedó sin saber la hora».
- **B4. «pero esa ya es otra entrada»** (`:85`) es denso y hace la línea de cuatro renglones en teléfono.
- **B5. Choque de palabras:** «lo da vuelta adentro» (`:118`) para describir la máquina, en el capítulo donde «dar
  vuelta las flechas» quiere decir invertir. Mejor: «lo transforma adentro».
- **B6. «13: siempre suma lo mismo»** (`:159`) es ambigua: la tabla 3, 5, 7 crece siempre de a 2.
- **B7. 9.5 pierde la razón del «− 2».** Omite «menos los dos que ya cobraron» (`ch7/scenes-b.js:570`). Quien no tenga
  7.9 fresco no sabe por qué 1 ÷ (x − 2).
- **B8. 9.6, un eco que falta:** ¿sale 2? Sí, con √2, la diagonal de los caps. 7 y 8. Mostraría que «los positivos» no
  son sólo los cuadrados de enteros.
- **B9. «Relación» no se explica.** Se usa (`:85`) sin decir qué es. El diseño tiene «una relación puede asignar
  varios». (Para la revisión matemática.)
- **B10. Falta la notación de funciones.** El capítulo nunca escribe f(x) ni y = 2x + 1: el cartel es «× 2 + 1». El
  paso a la notación formal (contrato §5) queda para la revisión matemática.

## Qué mejoró respecto del cap. 8

- **Motivos que atraviesan el capítulo:** la tabla de sombras (9.1, 9.3, 9.8), las máquinas (9.2, 9.5, 9.6) y los ecos
  de 7.2, 7.9 y 8.7, con cuentas coherentes.
- **Punto se equivoca dos veces,** y su error en 9.3 es el error que el capítulo quiere distinguir.
- **La Marea aparece** con el sentido justo (se va lo inventado, quedan los puntos medidos), aunque sin apuesta.
- **Un gesto bueno:** ubicar los puntos en 9.3, con notas específicas. Además, el jugador elige qué números probar.
- **Menos menús evaluados:** 7 contra 11.
- **Límites dichos con naturalidad** por Cornisa y por el estudiante («Casi, porque no lo medí», «dice si puede ser,
  no cuál»).
- **Algo de humor:** «lunes y medio», Oval y su −4, la ola «linda».
- **Lo corregido en 8.8:** la sombra lejos del sol y visible; el gancho deja la pregunta abierta en lugar de
  resolverla.
- **En teléfono,** los tres botones superpuestos de 9.6 (`c9-telefono`) quedaron corregidos en `c9-telefono2`.
- **Sin «como dije»** ni veredictos automáticos del tipo «lo anticipé».

**En retroceso:** los vocativos (10 de 12 líneas) y el puntaje en la Bitácora.

## Qué no pude verificar

- **Audio:** no escuché nada (el borrado de la brisa, los sonidos de Punto, los toques).
- **Ritmo y actuación:** sólo vi cuadros sueltos y logs de un bot. No hay capturas de:
  - el barrido de la recta parada;
  - Punto dibujando la ola;
  - la pasada del borrador;
  - las flechas dándose vuelta;
  - la caminata del estudiante a la pizarra.
- **Pantallas sin captura:**
  - las notas de error de 9.1 (flecha equivocada), 9.3 (cruce equivocado), 9.4 (veredicto equivocado sobre el círculo)
    y 9.7 (emparejar A con B);
  - la Bitácora abierta;
  - el momento «Desplegar: puntos que se paran».
- **Ramas no cubiertas:**
  - 9.2 «13»;
  - 9.3 «sueltos»;
  - 9.5 «Cualquier número» y la ruta sin probar el 2;
  - 9.6 «Sí, con algún número que no probé» y «ya probé» después de 4;
  - 9.8 «No se puede saber».

  Lo que digo de esas ramas sale del código.
- **Capturas con texto viejo:** las de 9.1–9.4 a 1600×900 son de `ecf8734`. La línea final de 9.1 sólo la vi en el log
  y en las capturas de teléfono.
- **La demora de 104 s en 9.4 en teléfono:** no sé si es del bot o del juego.
- **Lector de pantalla:** no probé «2ᵈ», «·», «−», «÷» ni «≠», ni los `describe` en contexto. Tampoco el texto grande,
  la lectura limpia ni el movimiento reducido.
- **Teléfono real:** todas las partidas de 844×390 son emulación.
- **Costura 9→10 en marcha:** ninguna partida la cruza. Tampoco verifiqué la tarjeta «El capítulo 10 todavía se está
  dibujando» con el cap. 10 ya registrado.
- **Comprensión de personas:** nada de esto es un playtest. Que algo «se sienta plantilla», «delate la respuesta» o «no
  se lea» es una hipótesis que hay que comprobar con jugadores.
