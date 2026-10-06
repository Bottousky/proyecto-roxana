# Revisión matemática independiente: cap. 10 «Vueltas y flechas» (rev-mat-9)

- Fecha: 2026-10-06. Commit revisado: `910a374` (rama `claude/arithmos-graphic-adventure-065e68`).
- Alcance:
  - `experiments/arithmos/src/ch10/{scenes-a,scenes-b,chapter}.js`.
  - `src/logic/turns.js` y `tests/turns.test.mjs`.
  - Costura de entrada: `src/ch9/scenes-b.js` (9.8 «Lo que vuelve» y `writeJournal9`).
  - Contrato: `docs/arithmos/ARITHMOS_MASTER.md` §5, §7H (y §7C, §7D, §7F, §7I, porque los toca), §13.
  - Diseño: `docs/arithmos/ARITHMOS_DESIGN.md`, «Capítulo 10 — Vueltas y flechas» y «Criterios de escena».
- Números de línea: son los de `910a374`. Mientras revisaba entraron `f90ad31`, `efa47c9` y `40ceece`. Ninguno
  toca `ch10/` ni `logic/turns.js` (lo comprobé con `git diff 910a374 HEAD`). `40ceece` cambia seis líneas de
  `ch9/scenes-b.js` sin mover la numeración. Las citas del cap. 9 son de `HEAD` (`40ceece`).
- Evidencia usada:
  - `artifacts/arithmos/it09/c10-directa2/`, `c10-errores/` y `c10b-check/` (`log.txt`, `state.json`,
    capturas).
  - **Las partidas son anteriores al commit**: `c10-errores` a las 16:52, `c10-directa2` a las 16:53 y
    `c10b-check` a las 17:01:51. El commit es de las 17:02:14. Comparé con un script las 84 líneas «lee» y
    «elige» de los tres `log.txt` y todos los textos de la Bitácora de los tres `state.json`: todos están
    textuales en el commit. Hay una diferencia visual: en `c10-directa2` y `c10-errores`, la cuadrícula de 10.5
    llega sólo a −3; en `c10b-check` y en el commit llega a −4 (ver «Qué no pude verificar»).
- Método:
  - Lectura del código, los textos y la Bitácora, rama por rama.
  - `node --test experiments/arithmos/tests/`: 96/96 pasan, 7 de ellas de `turns.test.mjs`.
  - Scripts propios en el scratchpad. Hacen cuatro cosas:
    - Recalculan cada igualdad de la pizarra con la lógica real (`turns.js`).
    - Calculan lo que el dibujo muestra pero no dice (hueco, cuerdas, alturas y costados, cruces de rectas,
      período de la secuencia de baldes).
    - Arman la Bitácora del commit (`writeJournal10`) en las 23 ramas.
    - Comparan cada línea de los logs con el commit.
  - **Sin navegador.** Las partidas son de un bot, no de personas.

## Veredicto corto

Todas las igualdades escritas en la pizarra son verdaderas:

- 2π ≈ 6,28; sen 30° = 0,5; sen 90° = 1; sen(x + 360°) = sen x.
- sube = largo · sen 30° = 6 · 0,5 = 3.
- (3, 2) + (1, −4) = (4, −2), y en el otro orden también.
- i · i = −1; 2i · 2i = −4.
- a + b = 7 y a − b = 1 → (4, 3). La tabla «1 1 | 7 / 1 −1 | 1» copia bien los números, con signo.

Los dibujos que sostienen cuentas también están bien:

- **10.1.** Seis pedazos entran y el séptimo pisa al primero (0,717 rayos). El hueco mide 2π − 6 ≈ 0,283, menos
  de un tercio.
- **10.2.** El triángulo de 30° y −30° es equilátero.
- **10.3.** La ola se repite cada 360°.
- **10.6.** El giro va contra el reloj y da (3, 1) → (−1, 3) → (−3, −1).
- **10.7.** El cruce es (4, 3).

Fallan tres cosas que se dicen con palabras. Las tres son falsas en su lectura literal:

1. **10.1, rama «Tres», y la Bitácora: «Tres pedazos son media vuelta y un poco más».** Es al revés: tres
   pedazos (3 radianes ≈ 171,9°) **no llegan** a media vuelta, que es π ≈ 3,14 pedazos. La línea siguiente
   dice «Media vuelta, π, unos 3,14 rayos», y lo contradice.
2. **10.6, en todas las rutas: «Dos cuartos: (−3, −1). La flecha da vuelta entera hacia el otro lado».** El
   mismo capítulo usa «vuelta entera» para 360° (10.1, y 10.6:183: «dos medias vueltas, vuelta entera»), y el
   cap. 4 también. Dos cuartos son media vuelta, que es justo lo que hace que i · i = −1.
3. **10.7: «Con una sola pista hay ocho pares posibles: toda una recta», con los pares de atados unidos por
   rectas.**
   - Ocho puntos no son una recta.
   - El cap. 9 enseñó a no unir valores que se cuentan de a uno («si unimos, la línea dice cosas que no
     existen»).
   - La regla «las dos a la vez, donde se cruzan» falla cuando el cruce no es entero: «suman 8» y «se llevan 1»
     se cruzan en (4,5; 3,5), y no hay ningún par de atados.

Además falta el «para qué» de varias ideas:

- Los radianes no se vuelven a usar. 360° = 2π no se escribe nunca.
- El coseno y alto² + costado² = 1 sólo se nombran.
- La pregunta de los 390° se contesta mirando un punto que ya está dibujado.
- La rampa no dice qué lado es el «largo» ni dónde está el ángulo, y llama «semejantes» a las rampas sólo por
  tener el mismo ángulo. El cap. 8 dijo que con los mismos ángulos no alcanza.
- En los complejos, la flecha (3, 1) nunca se conecta con el número 3 + i, ni se dice la regla de las
  coordenadas.
- La «matriz» es sólo un nombre.
- Los seis baldes del cierre siguen un patrón que se repite cada tres, justo después del capítulo que enseña
  que lo que se repite se anticipa.

## Cumplimiento por escena (diseño del cap. 10 y contrato H)

| Escena | Idea del diseño | Estado |
|---|---|---|
| 10.1 | Radián: entran 6 y un poco más; 2π ≈ 6,28; π | Construcción y cuentas correctas. **La rama «Tres» y su Bitácora son falsas** (A1). No distingue la cuerda del arco (M1). Los radianes no se usan después (M2). «No termina» (M3) |
| 10.2 | Seno y coseno como alto y costado; alto² + costado² = 1 | sen 30° = 0,5 bien justificado en lo esencial, con dos saltos (M4). Coseno y Pitágoras sólo nombrados (M5) |
| 10.3 | Periodicidad; no es la sombra | Gráfico y fórmula correctos; la comparación con la sombra está bien. Sin anticipación real (M6) |
| 10.4 | Razón en triángulos semejantes; altura sin medir | Cuentas correctas. Lados y ángulo sin decir (M7). Semejanza sólo por el ángulo, contra el cap. 8; ningún otro ángulo (M8) |
| 10.5 | Vectores; punta con cola; el orden no cambia el destino | Correcto. La casa de Rampa se mudó desde el cap. 8 y (3, 2) pasa a ser una flecha (M9) |
| 10.6 | i como cuarto de vuelta; i · i = −1; 2i · 2i = −4 | Las cuentas y el giro son correctos. **«Vuelta entera» por media vuelta** (A2). La parte de «número» queda sin hacer (M10). Costura con «por sí mismo» (M11) |
| 10.7 | Sistemas como rectas; paralelas; tabla (matriz) | (4, 3) y paralelas, correctos. **Pares discretos unidos como recta** (A3). Matriz sólo nombrada; falta el caso de la misma recta (M12) |
| 10.8 | Cierre: lo que pasa a veces | La conclusión es correcta, pero los datos tienen período 3 (M13) |
| Límites que el diseño promete declarar | π no es 3,14; seno con radio 1; complejos sin la teoría completa; sistemas 2 × 2 | Los dos primeros se declaran. Los otros dos no se dicen, y la Bitácora generaliza de más (M12, M14) |
| Bitácora | ≤ 4 párrafos; lo que pasó sin atribuir de más | Una línea falsa (A1), tres que atribuyen de más y condiciones omitidas (M14) |

---

## ALTA

### A1. 10.1, rama «Tres», y la Bitácora: «tres pedazos son media vuelta y un poco más» es falso

- **Dónde:**
  - `src/ch10/scenes-a.js:51`: opción «Tres, como de punta a punta pasando por el centro.».
  - `:101`: la respuesta a esa opción, «Tres pedazos son media vuelta y un poco más. La vuelta entera: seis y
    un pedacito.».
  - `:102`: la línea siguiente, «Media vuelta, π, unos 3,14 rayos».
  - Bitácora `scenes-b.js:333`: «Pensaste en tres rayos; tres son media vuelta y un poco más: la vuelta
    entera, 2π ≈ 6,28.».
  - Evidencia: `c10-errores/log.txt` 5,5 s; `c10-errores/state.json` (Bitácora, primera línea de «seen»).
- **Qué:**
  - **La desigualdad está al revés.** 3 rad ≈ 171,9° < 180°. Media vuelta es π ≈ 3,14 pedazos; tres pedazos
    **no alcanzan**. La frase correcta es «media vuelta son tres pedazos y un poco más». El juego dice lo
    contrario, y dos segundos después afirma «Media vuelta, π, unos 3,14 rayos», que lo contradice. La Bitácora
    lo deja escrito.
  - **La opción mezcla radio y diámetro.** «De punta a punta pasando por el centro» es el diámetro: dos rayos,
    no tres. El error que esa opción intenta capturar es real y muy común: «alrededor entra tres veces y pico lo
    de punta a punta». Eso es **correcto** para diámetros (perímetro ≈ 3,14 diámetros = 6,28 radios). La
    respuesta del juego no recoge esa mitad buena. Tampoco dice que el pedazo es medio diámetro y que por eso
    entran el doble. El capítulo nunca conecta 2π rayos con «π veces lo de punta a punta», que es la fórmula que
    el alumno de secundaria probablemente ya conoce.
  - El bot de errores eligió «Tres», puso **un** pedazo y apretó «ya está». Por eso no se vio que tres pedazos
    quedan cortos de la mitad (`c10-errores/003`: sólo aparece el «1»; ver M1).
- **Por qué importa:**
  - Es una desigualdad falsa sobre π, en la escena que define π, y queda en la Bitácora, que es la abreviatura
    que el jugador consulta después (§5).
  - Justo a quien llegó con la idea de «tres», que es quien más necesita la corrección, se le confirma una
    versión falsa.
  - §13: «falsedades» y «confusiones entre objetos» (radio y diámetro).
- **Cómo comprobar la corrección:**
  - `:101`, rama «3»: «De punta a punta son dos rayos, no uno. Lo de punta a punta entra alrededor tres veces y
    un poco más; los rayos, el doble: seis y un poco más. Tres rayos ni llegan a media vuelta: media vuelta son
    3,14.»
  - Hacer explícito el error en la opción: «Tres: alrededor entra tres veces lo de punta a punta.»
  - Bitácora `:333`: «Pensaste en tres; tres son las veces que entra lo de punta a punta (π ≈ 3,14). Con rayos,
    el doble: 2π ≈ 6,28.»
  - Prueba: armar `writeJournal10` con `radian-predict = '3'` (como hice yo) y exigir que ninguna línea diga que
    3 rayos son «media vuelta y un poco más». Agregar `assert.ok(3 < Math.PI)` junto a un comentario en la
    prueba de 2π.

### A2. 10.6: «Dos cuartos… la flecha da vuelta entera»: dos cuartos son media vuelta

- **Dónde:**
  - `src/ch10/scenes-b.js:176`, en todas las rutas: «Dos cuartos: (−3, −1). La flecha da vuelta entera hacia
    el otro lado: es la de antes por −1.».
  - En la misma escena: `:183` («−1 por −1 es 1: dos medias vueltas, vuelta entera») y `:186` («Dos cuartos son
    media vuelta: i · i = −1»).
  - Fuera de la escena: 10.1 (`scenes-a.js:102`, «una vuelta entera son 6 rayos»); cap. 4, Bitácora
    (`ch4/scenes-b.js:613`, «Dos medias vueltas son una entera»).
  - Evidencia: `c10b-check/log.txt` 9,0 s; `c10-directa2/log.txt` 37,7 s; `c10-errores/log.txt` 36,1 s.
- **Qué:**
  - En el juego, «vuelta entera» es un término con significado fijo: 360°, dos medias vueltas. Lo usan el cap. 4,
    10.1 y la propia escena, siete renglones más abajo.
  - `:176` lo usa para la media vuelta que dan dos cuartos. Coloquialmente se entiende «se da vuelta del todo»,
    pero leído con el vocabulario del capítulo dice «dos cuartos = vuelta entera», o sea, × 1.
  - Es el paso del que depende toda la escena: dos cuartos = media vuelta = × (−1), así que i · i = −1. En la
    rama «−1», el jugador lee en seguida «dos medias vueltas, vuelta entera», y las dos frases chocan.
- **Por qué importa:** es la escena «momento» (se puede desplegar desde la Bitácora) del concepto más delicado
  del capítulo. Una lectura literal lleva a i · i = 1. §13: «falsedades» y «confusiones entre objetos y
  notaciones».
- **Cómo comprobar la corrección:**
  - `:176`: «Dos cuartos: (−3, −1). La flecha quedó apuntando al revés: media vuelta, la de antes por −1.»
  - Revisión: en `ch10/`, «vuelta entera» tiene que aparecer sólo para 360°. Con un `grep "vuelta entera"`
    alcanza.

### A3. 10.7: pares de atados unidos como recta; «ocho pares posibles: toda una recta»

- **Dónde:**
  - `src/ch10/scenes-b.js:214`: «Pensé dos números de atados».
  - `:218-221`: ocho puntos y una recta continua de (0, 7) a (7, 0). `:223`: «Con una sola pista hay ocho pares
    posibles: toda una recta.».
  - `:226`: la recta continua de «se lleva 1». `:243`: «Cada pista es una recta de pares; las dos a la vez,
    donde se cruzan.».
  - `:255`: la recta «suman 3».
  - Bitácora `:356`: «Dos condiciones a la vez son dos rectas: la solución está donde se cruzan».
  - Capturas `c10b-check/009` y `011`.
  - En el cap. 9:
    - `ch9/scenes-a.js:296`: «si unimos, la línea dice cosas que no existen. Sueltos.».
    - `ch9/scenes-b.js:238` (`HEAD`): «como se cuentan por día, lo que se lee son los puntos».
    - Bitácora `ch9/scenes-b.js:337`: «no se unen cuando no hay nada entre medio».
- **Qué:**
  - **La frase es falsa en cualquiera de las dos lecturas.**
    - Si los atados se cuentan de a uno, hay exactamente 8 pares (lo comprobé), y son ocho **puntos** sobre una
      recta, no «toda una recta».
    - Si valen medios atados (el cap. 5 parte atados), pares como (3,5; 3,5) también cumplen, y hay infinitos,
      no ocho.
    - El dibujo une los ocho puntos con una línea, que es exactamente lo que el cap. 9 pidió no hacer con
      cantidades que se cuentan.
  - **La regla general que se escribe falla en el primer caso nuevo.** «Suman 8» y «se llevan 1» son dos rectas
    que se cruzan en (4,5; 3,5): con atados enteros, **no hay ningún par**, aunque las rectas se cruzan. La
    Bitácora («la solución está donde se cruzan») da una respuesta equivocada ahí.
  - El caso es valioso, porque une sistemas con dominio (cap. 9). Hoy el juego lo vuelve un error.
- **Por qué importa:**
  - Es la idea central de la escena («sistemas como rectas que se cruzan»).
  - Contradice una regla que el cap. 9 enseñó dos veces, y en la Bitácora.
  - §7D pide «soluciones y restricciones»; §7G, «diferenciar un gráfico de un dibujo decorativo»; §13,
    «restricciones omitidas» y «confusiones entre objetos».
- **Cómo comprobar la corrección:** hay dos salidas coherentes.
  - **Cantidades continuas:** cambiar los atados por algo que se mide, por ejemplo dos pedazos de la soga nueva
    de 10.1. «Entre los dos miden 7; el de Cornisa le lleva 1 al de Balcón». En ese caso, «toda una recta» sí es
    cierto. Corregir «ocho pares» por «todos los pares de esa recta», y los puntos enteros quedan como ejemplos.
  - **Mantener atados:**
    - Dibujar sólo los puntos, o la recta en punteado tenue con un rótulo de «guía».
    - Decir: «Los ocho pares caen sobre una recta; los de en medio no son atados.»
    - Agregar el caso «suman 8, se llevan 1»: las rectas se cruzan en (4,5; 3,5) y no hay par de atados. Es una
      buena transferencia con el cap. 9.
  - Bitácora: «Dos condiciones de la forma "tanto de a más tanto de b da tanto" son dos rectas; los pares que
    cumplen las dos están en el cruce, si el cruce es un par posible.»
  - Revisión de captura: en 10.7 no queda ninguna línea continua entre pares que se cuentan de a uno, salvo que se
    elija la primera salida.

---

## MEDIA

### M1. 10.1: «Seis justos» no se distingue de la cuerda; el relleno automático no numera

- **Dónde:**
  - `scenes-a.js:49` (opción «Seis justos.») y `:101` (respuesta «Seis no alcanzan: queda un hueco.»).
  - El relleno automático: `:90-97` (piezas 2 a 6 sin rótulo) y `:98-100`.
  - Captura `c10-errores/003` (sólo se ve el «1»); comparar con `c10-directa2/003` (1 a 6).
- **Qué:**
  - **Cuerda contra arco.** En la escuela se construye el hexágono «llevando el radio con el compás»: el radio
    entra **exactamente** seis veces como cuerda (lo comprobé: cada cuerda abarca 60°). Quien elige «Seis justos»
    puede estar pensando correctamente en eso. El juego le contesta «Seis no alcanzan: queda un hueco» sin decir
    por qué. La soga se dobla y sigue el borde, el arco es más largo que la cuerda, y por eso sobra un hueco.
    Es la diferencia que define al radián, y no se dice.
  - **Conteo invisible.** Si el jugador aprieta «ya está» antes de seis, el juego completa las piezas sin
    números y deja una corona amarilla continua (`c10-errores/003`). El «seis» del cierre no se ve contado, y
    tampoco se ve que el séptimo pisa al primero.
- **Por qué importa:** §5 pide distinguir la interpretación errónea de la comprensión genuina. Acá la
  interpretación «equivocada» es correcta en otro objeto (la cuerda). Además, el criterio de escena 5 pide que
  la consecuencia sea visible.
- **Cómo comprobar la corrección:**
  - Rama «6»: «Con el compás, el rayo entra seis veces justo, pero de punta a punta derecho, por adentro. La
    soga va por el borde, que es más largo: por eso sobra un pedacito.»
  - Opcional: dibujar el hexágono tenue debajo de la soga.
  - En `:94`, agregar el rótulo `String(n)` a cada pieza automática.
  - Verificar con una captura de la ruta de errores.

### M2. Los radianes se presentan y no se usan; 360° = 2π nunca se escribe

- **Dónde:**
  - `scenes-a.js:103` (pizarra «una vuelta = 2π rayos ≈ 6,28») y `:104` («eso es medir en radianes. Sirve para
    cualquier rueda…»).
  - Todo el resto del capítulo usa grados: `:148`, `:160`, `:187`, `:250`, `:254` y `:276`.
  - `scenes-b.js:135-190`: el cuarto de vuelta sin π/2.
  - Bitácora `:353`.
  - Gancho del cap. 9 (`ch9/scenes-b.js:303`): «Para eso hay que medir ángulos de otra manera.».
- **Qué:**
  - Después de 10.1 no aparece ningún ángulo en radianes. Nunca se escribe 360° = 2π, ni 30° = π/6, ni cuarto
    de vuelta = π/2. 10.6 era el lugar natural para esta última, y tampoco está.
  - La única mención de la equivalencia es oral: «cada 360° o 2π» (`:253`).
  - La pizarra iguala un giro con un largo, «una vuelta = 2π rayos», y no escribe nunca «rad».
  - «Sirve para cualquier rueda» es cierto, porque todas las circunferencias son semejantes (cap. 8). Pero no hay
    una segunda rueda donde comprobarlo.
  - El cap. 9 promete «medir ángulos de otra manera». El capítulo cambia la medida y vuelve a los grados sin
    haber usado la nueva para nada.
- **Por qué importa:** §7H nombra «radianes» y pide «evitar capítulos de reglas aisladas». §5 pide transferir a
  una situación nueva. Tal como está, el radián es un nombre y no una herramienta.
- **Cómo comprobar la corrección:** alcanza con un uso.
  - En 10.1, después de la pizarra: «una vuelta = 360° = 2π rad».
  - O en 10.6: «un cuarto de vuelta, 90°, son π/2 rayos de borde».
  - O un uso de la soga, que es lo que hace un pozo: la rueda gira 1 radián y el balde sube un rayo de soga;
    media vuelta, π rayos. Esto da al radián su razón de ser: el largo de soga que se enrolla es ángulo × radio.
  - Una segunda rueda más grande donde vuelvan a entrar 6 y un poco más.
  - Verificar en una captura que «360° = 2π» queda escrito.

### M3. «π no termina»: el propio cap. 5 dijo que no terminar no distingue nada

- **Dónde:**
  - `scenes-a.js:102`: «6,28… Ese número no termina; se lo llama 2π.».
  - Bitácora `scenes-b.js:353`: «π no es 3,14: es un número que no termina.».
  - Cap. 5: `ch5/scenes-b.js:485` («un tercio de barra, en décimos, tampoco cierra: 0,3; 0,33; 0,333…») y
    Bitácora `:535` («No cerrar en decimales no lo prueba (1/3 tampoco cierra)»).
- **Qué:**
  - Es cierto que las cifras de π no terminan. Pero el juego ya enseñó que 1/3 tampoco termina, así que «no
    termina» pone a π en la misma bolsa que 1/3.
  - Lo que distingue a π es que, como √2 (cap. 8), **no es una fracción**. Eso no se dice.
  - Además, lo único que el jugador midió es «6 y un poco más». Que no termine se afirma como si saliera de la
    soga, y la prueba (mucho más difícil que la de √2) no se menciona. El criterio de escena 11 dice que «la
    evidencia no puede probar más de lo que muestra».
- **Por qué importa:** §7C pide «distinguir valor exacto de aproximación» e irracionales. La frase actual
  distingue lo exacto de lo aproximado, que está bien, pero da un criterio que el mismo juego desautorizó.
- **Cómo comprobar la corrección:** cambiar `:102` y la Bitácora por algo como: «π no es 3,14: 3,14 es una
  aproximación. Y, como √2, no es ninguna fracción; eso se puede probar, pero la prueba es larga y no la hacemos.»

### M4. 10.2: la razón de sen 30° = 1/2 tiene dos saltos y una palabra ambigua

- **Dónde:** `scenes-a.js:180-185`, sobre todo `:185`: «el triángulo tiene tres ángulos de 60°: los tres lados
  miden un rayo. La altura es la mitad de ese lado: medio rayo.».
- **Qué:**
  - **Los 60° de las otras dos esquinas no se justifican.** El del centro mide 30° + 30° = 60°. Los otros dos son
    iguales porque los lados que salen del centro son rayos, y suman 120° porque los tres suman 180° (cap. 8). El
    juego salta de «60° en el centro» a «tres ángulos de 60°». Es un renglón, y conecta con el cap. 8.
  - **«La altura» es ambigua.** Dicho de un triángulo, «la altura» es la del triángulo: desde el centro hasta el
    lado opuesto mide √3/2 ≈ 0,87, que además es el número que está escrito en la tabla, en la fila de 60°. Lo
    que es la mitad del lado es la altura **de la manija sobre el centro**: el lado parado va de −0,5 a 0,5.
  - **La esquina de 30° no está marcada.** Cuando se dibuja el triángulo, la manija ya está en 90° (`:173`), así
    que el vértice de 30° no tiene ninguna marca.
- **Por qué importa:** es la única prueba del capítulo, y §7F pide «conectar argumentos visuales con su
  alcance». Con «la altura» un alumno puede creer que la altura de un equilátero de lado 1 es 0,5.
- **Cómo comprobar la corrección:**
  - `:185`: «En el centro, 30 y 30 hacen 60°. Los dos lados que salen del centro son rayos, iguales, así que las
    otras dos esquinas son iguales y suman 120°: 60 cada una. Los tres lados miden un rayo. El lado parado va de
    la manija a su reflejo, y el centro lo corta por la mitad: la manija está a medio rayo.»
  - Marcar con un punto la posición de los 30° antes de dibujar el triángulo.

### M5. 10.2: el coseno y alto² + costado² = 1 sólo se nombran

- **Dónde:** `scenes-a.js:186` («al costado, coseno. Y como en el tirante, alto² + costado² = 1»); pizarra
  `:187` (sólo senos); Bitácora `scenes-b.js:354`.
- **Qué:**
  - El costado no se dibuja, no se mide y no aparece en ninguna tabla. La regla mide alturas, y la línea amarilla
    va de la manija a la regla, no al centro.
  - El triángulo rectángulo del que habla Pitágoras (rayo, alto y costado) no se dibuja. El que se dibuja es el
    equilátero.
  - alto² + costado² = 1 no se escribe en la pizarra ni se comprueba con ningún valor. Con lo que hay en la
    tabla, 0,5² + 0,87² ≈ 1,007: un buen momento para decir «≈ por el redondeo».
  - Nada usa el coseno después.
  - Tampoco se dice que el costado, como la altura, tiene signo: a la izquierda del centro es negativo.
- **Por qué importa:** el diseño promete «el costado, el coseno; alto² + costado² = 1 (Pitágoras)». §5 pide que
  cada concepto tenga algo que observar y comprobar. Hoy es vocabulario.
- **Cómo comprobar la corrección:**
  - Al girar, dibujar también el costado, del centro al pie de la manija, y anotar «30° → alto 0,5; costado
    0,87».
  - Que el estudiante compruebe una fila: «0,5 · 0,5 + 0,87 · 0,87 ≈ 1».
  - Dibujar el triángulo rectángulo rayo-alto-costado, que es el tirante del cap. 8.

### M6. 10.3: la pregunta de los 390° se lee en el gráfico; la periodicidad no se usa para anticipar

- **Dónde:**
  - `scenes-a.js:220`: `heights(1, 30, 720)` grafica todos los puntos de a 30°, también el de 390°.
  - `:246-250`: la pregunta se hace después de graficar las dos vueltas; la opción `:249` es «No se sabe: no la
    pusimos.».
  - `:252` (respuesta) y `:254` (pizarra).
  - Captura `c10-directa2/010`.
- **Qué:**
  - Cuando se pregunta por 390°, el punto de 390° ya está en el mapa. La opción «no la pusimos» es falsa en
    pantalla, y la correcta se contesta leyendo el gráfico, sin usar la regla.
  - sen(x + 360°) = sen x queda escrita sin que ningún caso la necesite. La única «predicción» cae dentro de lo
    dibujado.
  - La rama «unknown» recibe la misma respuesta que «Más que 1»: no se le habla a lo que eligió.
- **Por qué importa:** el diseño dice que «lo que se repite se puede anticipar» (es el gancho de 9.8 y el cierre
  de 10.8). §5 pide transferencia, y §13 marca su ausencia.
- **Cómo comprobar la corrección:**
  - Preguntar por un ángulo fuera del mapa: 1110° (tres vueltas y 30°), −330° o 750°.
  - O preguntar después de la primera vuelta, antes de dibujar la segunda.
  - Para la rama «unknown»: «La pusimos: mirá el punto después de los 360°. Y aunque no la hubiéramos puesto, una
    vuelta entera deja la manija donde estaba.»

### M7. 10.4: no se dice qué lado es «largo» ni dónde está el ángulo

- **Dónde:**
  - `scenes-a.js:276` («de 2 tablones de largo, sube 1»).
  - `:278-283`: «largo» va como rótulo junto a la tabla inclinada y «sube» junto al lado parado. No hay arco de
    ángulo ni marca de ángulo recto.
  - `:297` («alto ÷ largo es siempre el mismo número, y es el seno del ángulo»).
  - Bitácora `scenes-b.js:354`.
  - Captura `c10-directa2/015`.
- **Qué:**
  - «Largo de una rampa» es ambiguo en el habla común: puede ser la tabla o lo que ocupa en el piso. Con el piso
    la razón sería tan 30° ≈ 0,577, no 0,5 (lo calculé: la rampa de 2 ocupa 1,73 en el piso). Que es la tabla
    sólo se sabe por dónde está el rótulo.
  - El ángulo de 30° no se marca. Está entre el piso y la tabla, abajo a la izquierda. En la rueda, en cambio,
    estaba en el centro, entre el costado y el rayo. El ángulo recto tampoco se marca.
  - La correspondencia que hace que «con la tabla de la rueda» sirva no se muestra: el centro de la rueda es el
    pie de la rampa, el rayo es la tabla y la manija es la punta.
  - La Bitácora repite «alto ÷ largo es siempre el seno del ángulo» sin decir qué largo ni qué ángulo.
- **Por qué importa:** es la definición del seno como razón, la que se usa en la escuela técnica. El error típico
  es dividir por el lado equivocado o tomar el ángulo equivocado. Es una restricción omitida (§13), y la
  Bitácora es la abreviatura que queda (§5).
- **Cómo comprobar la corrección:**
  - Marcar el ángulo de 30° con un arquito al pie y el ángulo recto con un cuadradito.
  - Rotular «largo (la tabla)».
  - Superponer una vez la rampa de 2 sobre la rueda de 10.2, escalada: la tabla sobre el rayo de los 30°.
  - Bitácora: «En una rampa, alto ÷ largo de la tabla (el lado de enfrente del ángulo recto) es el seno del
    ángulo con el piso.»

### M8. 10.4: «son semejantes» sólo por el ángulo, contra lo que dijo el cap. 8; ningún otro ángulo

- **Dónde:**
  - `scenes-a.js:296`: «las rampas son semejantes, como las copias de Cornisa» (en las tres ramas).
  - Cap. 8: `ch8/scenes-a.js:444` («Y el ancho tiene los mismos ángulos, todos rectos, pero no todos sus lados se
    multiplicaron por lo mismo: estirado de un solo lado ya no es mi ventana.») y Bitácora `ch8/scenes-b.js:415`
    («los mismos ángulos y todos los lados multiplicados por lo mismo»).
  - `:297` («Con la tabla de la rueda, sabés cuánto sube cualquier rampa sin construirla.»).
- **Qué:**
  - **Semejanza.** El cap. 8 enseñó, con un ejemplo hecho a propósito, que tener los mismos ángulos **no
    alcanza**. Acá se concluye «semejantes» sólo de «la misma inclinación». En triángulos sí alcanza (dos ángulos
    iguales: el de 30° y el recto), pero el juego no lo dice. Un alumno que aprendió el cap. 8 tiene derecho a
    objetar. Además, la rampa de 6 es justo la que no se conoce: su proporcionalidad no se puede tomar de los
    datos, tiene que salir del criterio.
  - **Transferencia.** «Con la tabla de la rueda, cualquier rampa»: la tabla tiene 30°, 60° y 90°, y ninguna
    rampa usa otro ángulo que 30°. La única cuenta (6 · 0,5) se puede hacer con «la mitad», sin seno. Nada
    muestra que el seno haga falta.
- **Por qué importa:** §13 pide buscar confusiones y ausencia de transferencia, y el criterio de escena 5 pide
  coherencia con los capítulos anteriores.
- **Cómo comprobar la corrección:**
  - `:296`: «En triángulos, con los ángulos alcanza: con la esquina recta y la misma inclinación, la forma queda
    fija. En la ventana no alcanzaba porque tenía más lados.»
  - Agregar una rampa de 60°: «Rampa quiere una de 60°, de largo 4: con la tabla, 0,87 · 4 ≈ 3,5.» Así el seno
    hace algo que «la mitad» no hace.

### M9. 10.5: la casa de Rampa se mudó, y (3, 2) pasa de casa a flecha

- **Dónde:**
  - `scenes-b.js:43` («mi casa está en (4, −2)»), `:47` (`CARDS = [[3, 2], [1, −4], [2, 1]]`), `:109` y `:110`;
    Bitácora `:355`.
  - Cap. 8, `ch8/scenes-b.js:284`: «La casa de Rampa la tengo anotada así: (3, 2).», en el mismo mapa de Mara,
    con el pozo en el cero.
- **Qué:**
  - **Coherencia.** En el cap. 8 la casa de Rampa está en (3, 2), y en el cap. 10, en (4, −2). Además, la
    primera flecha es (3, 2): quien recuerda el cap. 8 puede leer «la flecha (3, 2) lleva a lo de Rampa».
  - **Punto contra flecha.** La escena quiere separar «dónde está» de «cuánto y hacia dónde» («no desde dónde»,
    `:109`), y lo hace con la misma escritura (a, b) para las dos cosas. Si encima el par que fue una casa ahora
    es una flecha, se borra la diferencia que se quiere enseñar.
  - **Regla de la suma.** Que las flechas se suman coordenada a coordenada (3 + 1 y 2 + (−4)) no se dice: se
    escribe el resultado.
  - **El orden.** Que «el orden no cambia el destino» se ve en un solo par y se generaliza en la Bitácora. La
    razón general es corta y conecta con el cap. 2: cada coordenada es una suma, y en una suma el orden no
    importa. Además, el dibujo amarillo y azul forma un paralelogramo, que vale para cualquier par.
- **Por qué importa:**
  - El criterio de escena 5 pide que las cantidades coincidan con los capítulos anteriores.
  - §13 pide buscar «confusiones entre objetos y notaciones».
  - El cap. 8 insistió en que un caso no prueba una regla (8.1 y 8.2). Acá se generaliza desde un par.
- **Cómo comprobar la corrección:**
  - Usar la casa de Rampa del cap. 8, (3, 2), con otras flechas (por ejemplo (4, −1), (−1, 3) y (2, 2)), o
    decir que es otro lugar («el galpón de Rampa»).
  - Que el estudiante diga: «se suman los de adelante con los de adelante y los de arriba con los de arriba:
    3 + 1 y 2 − 4».
  - Una línea sobre el paralelogramo: «Con cualquier par pasa lo mismo: las dos rutas son los lados de un mismo
    paralelogramo.»

### M10. 10.6: el giro está bien hecho; la parte de «número» queda sin hacer

- **Dónde:**
  - `scenes-b.js:148`: «contra el reloj» está sólo en la ayuda, que aparece únicamente si se pide.
  - `:153-165`: el giro y los rótulos (3, 1) → (−1, 3) → (−3, −1).
  - `:186`: «es un número que gira».
  - `:189`: «Dos cuartos de vuelta y el doble de largo, dos veces.».
  - Bitácora `:355` y `:351` (abbr «i es un cuarto de vuelta»).
  - Captura `c10b-check/007`.
- **Qué:**
  - **Sentido.** Un cuarto de vuelta **contra** el reloj es × i; a favor del reloj es × (−i). El sentido no está
    en el diálogo, ni en la pizarra, ni en la Bitácora («Girar un cuarto de vuelta es multiplicar por i»).
  - **Coordenadas.** La pizarra muestra (3, 1) → (−1, 3) → (−3, −1), y la ayuda dice «Mirá qué pasa con sus
    números», pero nadie dice la regla: (a, b) → (−b, a).
  - **Número y flecha.** La flecha (3, 1) nunca se identifica con el número 3 + i, ni i con la flecha (0, 1). Sin
    eso, «multiplicar la flecha por i» no es una cuenta sino un nombre para el giro. La cuenta que lo conecta es
    corta y está al alcance: i · (3 + i) = 3i + i · i = −1 + 3i, es decir (−1, 3). Lo verifiqué con `cmul`.
    §7H pide números complejos **con** sentido geométrico: hoy está la geometría y falta el número.
  - **2i.** 2i no se define antes de usarlo. La explicación «Dos cuartos de vuelta y el doble de largo, dos
    veces» se puede leer como (dos cuartos + doble) × 2 = vuelta entera y × 4. Lo que se quiere decir es «un
    cuarto y el doble, dos veces: media vuelta y cuatro veces el largo: −4».
  - **−i y −2i.** También (−i) · (−i) = −1 y (−2i) · (−2i) = −4. El cap. 7 insistió en que x · x = 9 «tiene
    además −3» (`ch7/scenes-b.js:669`). Acá, la respuesta a Oval da uno solo, sin aclarar.
  - **«i es un cuarto de vuelta»** (abbr) y «es un número que gira» confunden el número con la operación de
    multiplicar por él. Por la misma lógica, −1 «sería» media vuelta.
- **Por qué importa:** es la escena momento y el concepto de §7H. La restricción (contra el reloj) y la conexión
  con la notación formal (a + bi) son lo que §5 pide («conectar con la notación formal»).
- **Cómo comprobar la corrección:**
  - Decir «contra el reloj» en `:186` y en la Bitácora.
  - Una línea del estudiante después del segundo giro: «el de adelante pasa arriba, y el de arriba pasa adelante
    con el signo cambiado».
  - Rotular la flecha amarilla «3 + i» y escribir «i · (3 + i) = −1 + 3i».
  - `:189`: «2i es un cuarto de vuelta y el doble de largo. Dos veces: media vuelta y cuatro de largo: −4. Y
    −2i, girando para el otro lado, también.»

### M11. «Por sí mismo»: el cap. 10 no dice nada falso, pero deja en pie universales del cap. 9 que ahora son falsos

- **Dónde:**
  - Cap. 10: `scenes-b.js:178` (opción «Ninguno: un número por sí mismo nunca da negativo.», que ahora es la
    incorrecta), `:184`, `:188-189` y Bitácora `:343`.
  - Cap. 9 (`HEAD`):
    - `ch9/scenes-b.js:158`: la misma frase era la opción **correcta**.
    - `:164`: «No hay número que falte probar.».
    - `:166`: «con todos, sale cualquier número de 0 para arriba […], nunca uno negativo. El −4 no está, con los
      números que conocemos.».
    - Pizarra `:169`: «imagen de x · x: 0 y los positivos».
    - Bitácora `:327`: «Viste que x · x nunca da negativo.» / «Pensaste que x · x podía dar −4; nunca da
      negativo.».
    - Bitácora `:338`: «x · x da 0 o positivos».
- **Qué:**
  - Lo que dice el cap. 10 es correcto: «Con los números de la recta no se podía. Con éstos sí: 2i · 2i = −4».
    La rama «none» también contesta bien («Ninguno de la recta»).
  - Pero el cap. 9 dejó escrito, en la pizarra y en la Bitácora, que x · x «nunca da negativo» y que «no hay
    número que falte probar», sin «en la recta». La salvedad «con los números que conocemos» quedó sólo en el
    diálogo.
  - El cap. 10 usa como respuesta **incorrecta** la frase textual que el cap. 9 premió, y no vuelve a la
    Bitácora del 9.
  - Después del cap. 10, la Bitácora del jugador contiene «x · x nunca da negativo» y «2i · 2i = −4» sin nada
    que las reconcilie.
- **Por qué importa:** es la costura que el diseño eligió («cap. 9: con los números que conocemos»). §5 dice que
  la abreviatura tiene que poder desplegarse sin contradicción, y §13 pide restricciones explícitas.
- **Cómo comprobar la corrección:**
  - Cap. 9, Bitácora y pizarra: «con los números de la recta, x · x da 0 o positivos».
  - En `:164`: «No hay número **de la recta** que falte probar».
  - En 10.6, después de `:189`, el estudiante: «Lo que dijimos con la máquina de Oval sigue valiendo en la recta;
    i no está en la recta.»
  - Comprobar con un `grep "nunca da negativo"` en `ch9/`: cada aparición lleva «en la recta» o «con los números
    de la recta».

### M12. 10.7: la matriz es sólo un nombre; falta el caso de la misma recta y la condición de «recta»

- **Dónde:**
  - `scenes-b.js:258-264`: la tabla del **primer** sistema, escrita después de hablar del segundo, y la frase
    «Sirve para no escribir las letras todo el tiempo.».
  - `:251` (opción «Muchos») y `:260`.
  - Bitácora `:356`.
  - Lógica: `solve2` sí distingue `'many'` y lo prueba (`turns.test.mjs:38`).
- **Qué:**
  - **Matriz sin lectura.** §7H dice «sistemas y su lectura matricial». El juego da el nombre y una razón
    notacional («para no escribir las letras»), que es la menos importante.
    - La tabla aparece justo después del sistema sin solución, pero copia el otro. El sistema de las paralelas
      daría «1 1 | 7 / 1 1 | 3»: las dos filas tienen igual la parte de la izquierda y distinto el número, y eso
      se puede leer en la tabla sin dibujar nada.
    - Quien lee la tabla como del último sistema mencionado, la lee mal.
  - **Caso de la misma recta.** «Si son paralelas, no hay» omite el caso de dos pistas que dicen lo mismo
    («suman 7» y «el doble suma 14»): hay tantos pares como en una sola. En la clasificación escolar argentina
    (compatible determinado, compatible indeterminado, incompatible), las rectas coincidentes son el caso
    indeterminado. La lógica lo tiene; el juego no lo dice.
  - **«Dos condiciones a la vez son dos rectas»** sólo vale para condiciones de primer grado. «El producto da
    12» no es una recta.
- **Por qué importa:** §13 pide buscar «restricciones omitidas», y el diseño promete la tabla «como forma de
  anotar». Un renglón la vuelve una forma de leer.
- **Cómo comprobar la corrección:**
  - Escribir también la tabla de «suman 7 y suman 3» y que el estudiante diga: «La izquierda es igual y el número
    no: las rectas son paralelas, sin dibujarlas».
  - En la rama `many`, o en la Bitácora: «Si las dos pistas dicen lo mismo, es la misma recta: sirven todos sus
    pares.»
  - Bitácora: «Dos condiciones como "tanto de a más tanto de b da tanto"…».

### M13. 10.8: los seis baldes tienen período 3, justo después del capítulo de lo que se repite

- **Dónde:** `scenes-b.js:274` (`PULLS = ['llena', 'llena', 'a medias', 'llena', 'llena', 'a medias']`), `:316`
  y `:319`. Captura `c10b-check/014`.
- **Qué:**
  - **El patrón.** La secuencia es exactamente «llena, llena, a medias» dos veces (lo comprobé). Un alumno que
    acaba de aprender en 10.3 que «lo que se repite se puede anticipar» puede decir con buen fundamento: «el 7 es
    llena, como el 1 y el 4». El juego le contesta «Casi siempre no es siempre», que no responde a su
    razonamiento.
  - **La rama «A medias: ya le toca».** Contesta «que hayan salido llenas no hace que "le toque" a medias». Pero
    el último balde, el 6, salió a medias: la frase describe mal los datos en pantalla. Con esta secuencia, «ya
    le toca» no tiene sentido como falacia del jugador.
  - Además, la secuencia es fija: todos los jugadores ven el mismo «azar».
- **Por qué importa:** §7I pide «distinguir una regularidad observada de una garantía». Los datos fijos tienen
  una regularidad perfecta, que empuja a la conclusión contraria a la que se quiere.
- **Cómo comprobar la corrección:**
  - Usar una secuencia sin período corto y con la misma proporción, por ejemplo «llena, a medias, llena, llena,
    llena, a medias», o sortearla con una semilla.
  - Que la rama «ya le toca» se dispare con una racha de llenas al final, o reescribirla: «El balde no lleva la
    cuenta: lo que salió antes no cambia lo que sale ahora».
  - Verificar con un script que `PULLS` no tiene período menor que 6.

### M14. Bitácora: una línea falsa, tres que atribuyen de más y abreviaturas sin su condición

- **Dónde:** `scenes-b.js:328-367`. La armé en las 23 ramas con evidencia sintética, y con la evidencia de las
  tres partidas.
- **Qué:**
  - **Falsa:** la rama «3» de 10.1 (A1).
  - **Atribuye de más:**
    - `sin30 = unknown` («No se puede saber sin medir»): «Pensaste otra altura para los 30°». No pensó ninguna.
    - `i = none` («Ninguno: un número por sí mismo nunca da negativo»): «Buscaste el cuarto de vuelta en la
      recta». Dijo que no había ninguno.
    - `system-parallel = many` («Muchos»): «buscaste un par». Dijo que había muchos.
  - **Abreviaturas sin su condición:**
    - Párrafo 1: «π … un número que no termina» (M3); falta 360° = 2π (M2).
    - Párrafo 2: «alto ÷ largo» sin decir qué largo ni qué ángulo (M7).
    - Párrafo 3: «multiplicar por i» sin «contra el reloj» (M10).
    - Párrafo 4: «son dos rectas … si son paralelas, no hay» (A3, M12).
    - abbr: «i es un cuarto de vuelta» (M10).
- **Por qué importa:** el criterio de escena 10 pide «lo que pasó, sin atribuir de más». §5 dice que la
  abreviatura es lo que el jugador usa después.
- **Cómo comprobar la corrección:**
  - Una prueba que importe `writeJournal10`, por ejemplo exportándola o moviéndola a un módulo sin dependencias
    del motor. La prueba la corre con evidencia sintética de cada rama y busca las frases de arriba.
  - Para `unknown`: «Dijiste que sin medir no se sabía; se sabe: medio rayo, por el triángulo de lados iguales.»

---

## BAJA

- **B1.** 10.2: la rama `unknown` («No se puede saber sin medir») recibe la respuesta de `third`, «no un
  tercio» (`scenes-a.js:177`). No se le habla a lo que eligió. Se puede decir que «medir» es justo lo que hace
  la regla, y que el triángulo lo hace innecesario.
- **B2.** 10.2: la tabla escribe «60° → 0,87» y la descripción dice «a 0,87 rayo» (`:160-161`), sin «≈». El
  valor exacto es √3/2. El capítulo distingue con cuidado exacto de aproximado en π, y acá no.
- **B3.** 10.1:
  - Las piezas se dibujan a radio R + 4 (`:70`). Cada arco mide 5,7 % más que el rayo amarillo. Es un detalle
    visual, porque el ángulo es exacto, pero contradice «cada pedazo mide lo mismo que ese rayo» (`:47`).
  - La pizarra dice «≈ 6,28» sin unidad.
- **B4.** 10.4: «sabés cuánto sube **cualquier** rampa» (`:297`), con una tabla de tres ángulos. Conviene decir
  «con una tabla de la rueda más completa».
- **B5.** 10.6:
  - La pregunta «¿Qué número, multiplicado dos veces, da media vuelta?» (`scenes-b.js:181`) es ambigua: ¿por sí
    mismo, o aplicado dos veces? Mejor: «¿Por qué número hay que multiplicar dos veces seguidas para dar media
    vuelta?».
  - «Así lo anotamos desde la piedra» (`:135`): × (−1) como media vuelta llega en el cap. 4, no en la piedra del
    cap. 1.
- **B6.** 10.7, lectura del mapa (`c10b-check/011`):
  - El eje vertical no tiene «Balcón ↑»; en la pizarra, a y b no están atados a los nombres.
  - La recta azul «suman 3» cruza la amarilla «se lleva 1» en (2, 1) (lo calculé). Justo cuando se habla de que
    las rectas «no se cruzan», hay un cruce en pantalla, de otro sistema.
  - La recta azul no tiene puntos, y las otras dos sí.
  - «Mara anota» (`:264`), pero quien escribe es el estudiante (`:262-263`).
- **B7.** 10.7: sólo se pueden tocar los puntos amarillos (`:231`). El que toca un blanco, por ejemplo (5, 2),
  no recibe el «suma 7 pero no se lleva 1». Es la mitad simétrica del error, y la nota sólo existe para la otra
  mitad.
- **B8.** Lógica y pruebas:
  - `radiiAround()` devuelve la constante 2π. La prueba «entran 2π radios» comprueba que 2π está entre 6,28 y
    6,29, no modela la soga.
  - `slopeRatio(deg)` no recibe el largo. La prueba «depende del ángulo, no del largo» no puede probar eso:
    falta, por ejemplo, `point(L, 30).y / L` para varios L.
  - `quarter` se prueba con un solo vector, y no hay prueba de que cuatro cuartos vuelvan al inicio.
  - `heights` compara valores redondeados a milésimos. Está bien para la tabla, pero conviene decirlo.
  - No hay prueba de `writeJournal10`. Con ella, A1 se habría visto.
- **B9.** 10.5: con tres flechas hay seis pares ordenados, y el resultado de cada intento se ve en pantalla. La
  escena se puede resolver probando, sin anticipar. Una flecha más, o pedir el destino antes de mover, haría que
  la suma se piense.

## Lo que está bien (para no perderlo al corregir)

- **10.1, cuentas y dibujo.**
  - 2π ≈ 6,2832. El hueco, 2π − 6 ≈ 0,283, es «menos de un tercio de pedazo». El séptimo pisa al primero en
    0,717 rayos.
  - Las piezas se numeran contra el reloj desde el rayo, a continuación una de otra.
  - «Seis enteros y un pedacito» es exacto.
  - «Media vuelta, π, unos 3,14 rayos» y «π no es 3,14» separan bien valor exacto de aproximación (§7C).
  - «Sirve para cualquier rueda: con una más grande, los pedazos también son más largos» es la razón correcta:
    la semejanza de las circunferencias.
- **10.2.**
  - Las alturas son correctas: 30° → 0,5; 60° → 0,866; 90° → 1.
  - El triángulo de 30° y −30° es equilátero, con lado parado de 1. La idea de la prueba es la clásica y la
    correcta.
  - El distractor «un tercio: 30 es un tercio de 90» es el error típico (pensar que la altura es proporcional al
    ángulo), y la respuesta «la altura no crece parejo con el giro» lo nombra bien.
  - El seno se define para un rayo de radio, como prometía el diseño.
- **10.3.**
  - El gráfico es correcto: sube a 1 en 90°, baja a −1 en 270°, vuelve a 0 en 360°, y la segunda vuelta es
    idéntica.
  - Esta vez unir los puntos es lo correcto, porque la rueda gira de manera continua (contrasta con A3).
  - sen(x + 360°) = sen x es correcta, y «cada 360° o 2π» también.
  - La diferencia con la sombra («no se hace negativa ni sube y baja así») evita confundir dos fenómenos
    periódicos.
- **10.4.**
  - El dibujo es exacto: la tabla mide largo · U, y el lado parado, largo · U · 0,5.
  - Los rótulos «sube 1, 2, 3» salen de la cuenta.
  - «No se suma: se multiplica» contesta bien el error aditivo («dos más que la de 4»).
  - sube = largo · sen 30° = 6 · 0,5 = 3 es correcto.
- **10.5.**
  - (3, 2) + (1, −4) = (4, −2) es el único par que llega (revisé los seis órdenes).
  - El recorrido azul en el otro orden es correcto y forma el paralelogramo.
  - «Una flecha dice cuánto y hacia dónde, no desde dónde» es la definición justa.
  - En el commit, todas las flechas quedan dentro de la cuadrícula (`c10b-check/003`).
- **10.6.**
  - El giro es contra el reloj, con la convención del mapa: (3, 1) → (−1, 3) → (−3, −1), lo mismo que `cmul`
    con i.
  - Las respuestas a «−1» («dos medias vueltas, vuelta entera») y a «Ninguno» («Ninguno de la recta: […] Un
    cuarto de vuelta sale de la recta») son buenas.
  - «Con los números de la recta no se podía» califica bien lo dicho en el cap. 9.
  - i · i = −1 y 2i · 2i = −4 son correctos.
  - La media vuelta como × (−1) es coherente con el cap. 4.
- **10.7.**
  - (4, 3) es la única solución; hay 8 pares enteros no negativos que suman 7; «suman 7» y «suman 3» son
    paralelas y no tienen solución.
  - La nota para el toque equivocado («(a, b): a le lleva 1 a b, pero suman …») es precisa.
  - La respuesta a «(5, 2)» («suma 7, pero no 3») es buena.
- **10.8.**
  - El recuento llena 4, a medias 2 es correcto.
  - «Casi siempre no es siempre» y «el balde no lleva la cuenta» son las ideas justas para §7I.
  - La proporción 4/6 es coherente con el ≈ 2/3 del cap. 11.
- **Costura con el cap. 9.**
  - «Medir ángulos de otra manera» lleva a 10.1.
  - La ola de 10.3 retoma la sombra y marca la diferencia.
  - La pregunta de Oval se responde con «con los números que conocemos» → «con los de la recta no».
- **Pruebas.** Las 96 pasan, y mis scripts confirman todas las igualdades escritas.

## Qué no pude verificar

- **El juego en un navegador.** No lo abrí, por la restricción del entorno. Todo lo de pantalla sale del código,
  de los logs y de las capturas del bot.
- **Las partidas son anteriores al commit.**
  - Textos y Bitácora coinciden con `910a374` (script).
  - En `c10-directa2` y `c10-errores`, la cuadrícula de 10.5 va de 4 a −3, y la flecha (1, −4) termina fuera de
    ella (`c10-directa2/017` y `018`).
  - `c10b-check/003` muestra la cuadrícula hasta −4, como el commit. Pero esa partida cubre sólo 10.5 a 10.8, y
    sólo la ruta directa.
- **Ramas sin partida.** El bot no recorrió estas ramas; las revisé sólo en el código:
  - 10.1: «6».
  - 10.2: `unknown`.
  - 10.3: `unknown`.
  - 10.4: `measure`.
  - 10.5: empezar por (1, −4), y los pares fallidos salvo (2, 1) + (3, 2).
  - 10.6: `none`.
  - 10.7: `many` y los toques equivocados.
  - 10.8: `full`.
- **Momentos sin captura.** No hay captura de estos momentos; los revisé en el código:
  - 10.2: el triángulo equilátero y «sen 30° = 0,5    sen 90° = 1».
  - 10.3: «sen(x + 360°) = sen x».
  - 10.4: «sube = largo · sen 30° = …».
  - 10.5: «(3, 2) + (1, −4) = (4, −2)» sobre el mapa. No sé si pisa la cuadrícula.
  - 10.6: «2i · 2i = −4».
- **Otros tamaños, entrada y audio.** No revisé partidas táctiles ni de teléfono del cap. 10 (no las hay en
  `it09`), ni teclado. No evalué el audio.
- **Referencia curricular de H.** No contrasté la cobertura con una referencia argentina: está pendiente en
  `ARITHMOS_CURRICULUM.md`.
- **Comprensión humana.** No hay playtests. Nada de esto certifica que alguien entienda.
