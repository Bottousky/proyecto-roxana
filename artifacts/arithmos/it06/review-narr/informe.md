# Arithmos — revisión narrativa, de dirección y de puesta en escena (cap. 6 «Lo que no se ve»)

Revisor independiente (rev-narr-4), 2026-10-06. No abrí navegador ni corrí Playwright ni scripts del juego. Trabajé
con el código, los logs de partidas automáticas y las capturas PNG que ya existían.

## Alcance, evidencia y advertencias

- **Código** (`HEAD` = `22d9276`; `src/ch6/` sin cambios desde `81648bd`): `experiments/arithmos/src/ch6/chapter.js`,
  `common.js`, `scenes-a.js` y `scenes-b.js`. También leí `logic/equations.js` (textos y transformaciones), `acting.js`
  (`hop`, `rectSpot`, `wordSpot`), `engine/world.js` (`Label`, lectura limpia), `ch2/common.js` y `ch3/common.js`
  (familias y fondo), `ch3/*` (voces de las familias) y `ch5/scenes-b.js` y `ch5/chapter.js` (cierre del cap. 5).
- **Costura 6→7:** `src/ch7/` existe **sin seguimiento en git** y está en preparación. Sólo leí las primeras líneas de
  7.1 para juzgar el gancho.
- **Contrato y diseño:** `docs/arithmos/ARITHMOS_MASTER.md` y `ARITHMOS_DESIGN.md` (premisa, personajes, tabla de Punto,
  diseño 6.1–6.8). También `ARITHMOS_REVIEW.md` (tablas rev-narr-2 y rev-narr-3) y los informes
  `it04/review-narr/informe.md` e `it05/review-narr/informe.md`.
- **Logs:** `artifacts/arithmos/it06/c6-directa.log` y `c6-errores.log`. Además leí la evidencia guardada en
  `c6-*/state.json`, que permite saber dónde quedó Punto en cada escena.
- **Capturas** (1600×900): `it06/c6-directa/001–019` e `it06/c6-errores/002, 004, 006`. Amplié recortes con `sips` en
  el scratchpad. Las capturas (10:05–10:07) son posteriores a la última edición de `ch6/*.js` (09:43–09:46), así que
  corresponden al código actual.
- **Huecos de la evidencia:** no hay capturas de 6.7 después de elegir, ni del final de 6.8 (la derivación y el gancho
  `x · x = 2`), ni de las paletas de operaciones, ni a 844×390.
- Las dos partidas empezaron en el cap. 6: `state.json` no tiene `puntoArrow`, así que Punto aparece sin flecha.
- Los logs son de un bot que decide en décimas de segundo. Muestran **qué se dice y en qué orden**, no el ritmo.

## Lo que funciona (para calibrar)

- **Mara volvió a ser Mara.** Tiene 6 líneas, todas prácticas y cortas. Ninguna define. La mejor es
  «Probando se encuentra. Pero si mañana son treinta cajas, me paso la vida moviendo a Punto.»
  (`scenes-a.js:168`): motiva el paso de tantear a transformar con una necesidad suya. «La caja tiene ocho. No cualquier
  cosa.» (`:347`) usa la caja como verdad del mundo contra el truco de Cuña. Quedó resuelto A2 de rev-narr-2 y A5 de
  rev-narr-3.
- **Curva y la premisa:** «Mi abuela decía: "el 3 pasa sumando". Nunca supe adónde pasaba.» (`:169`) es la premisa del
  mundo (una abreviatura que sobrevivió a lo que abreviaba) dicha con humor y por un personaje.
- **Autoría del estudiante:** escribe él cada renglón correcto. `writeDeriv` lo hace caminar, ponerse en pose de
  escribir y trazar (`scenes-a.js:17-29`). Las derivaciones se leen bien a 1600×900 (`c6-directa/004`, `009`).
- **Representación clara y con consecuencia.** Los dos marcadores y la raya que los une son legibles. Las operaciones
  equivocadas de 6.2 tienen una consecuencia que se ve:
  - con «+3 sólo a la izquierda» los marcadores se separan (`c6-errores/004`);
  - con «−3 a los dos» siguen juntos, y el juego reconoce que es válido aunque no despeje: «Siguen juntos… pero quedó
    x − 6 = 2» (`:188`).

  Lo mismo pasa con «−7 a los dos» en 6.8.
- **Más agencia que en el cap. 5.** Hay búsquedas reales con Punto (6.1, segunda parte de 6.3, 6.5) y paletas de
  operaciones con camino libre (6.2, 6.7, 6.8).
- **Recta tiene un arco mínimo:** «Eso lo resuelvo de memoria» (6.3), «De memoria lo pasé con el signo que tenía»
  y, en 6.8, «Las dos cajas, de a tres. Ahora me acuerdo.» Recordar y entender quedan atados.
- **Continuidad:** la «media vuelta de las Terrazas» (6.7) remite al cap. 4. El dato de al-Khwārizmī queda en la
  Bitácora como dato. No aparecen «como dije» ni «lo anticipé».

## ¿Repite el cap. 6 los problemas señalados antes?

| Problema (rev-narr-2/3) | En el cap. 6 | Dónde |
|---|---|---|
| Mara define y dictamina | **No (resuelto).** Pero habla fuera de cuadro en 6.2, 6.4 y 6.8 | A6 |
| Estudiante pasivo | **No.** Escribe todo. Pero ahora es el que corrige a todos y cierra cada escena con la regla (regresión de N2) | A2, M4 |
| Cuestionario encadenado | **En parte.** Hay 5 elecciones evaluadas, menos que en el 5. El patrón pasó a un desfile de vecinos con un truco equivocado (6.3–6.6) | A2, M3 |
| Marea ausente | **Sí.** Una sola mención y nada en riesgo. Lo equivocado queda escrito; lo entendido se borra solo entre escenas | A1 |
| Cuentas contradictorias | Ya no en los números de las cajas. **Sí** entre texto e imagen (6.7) y entre lo que se dice y lo que se puede hacer (6.8) | A4 |
| Acciones de un solo botón | **Menos.** Quedan tres búsquedas de un solo blanco (6.3a, 6.6, 6.8) y una corrección automática (`3 = x ÷ 4`) | M3 |
| Composición / primeros planos | **Sí, agravado.** Dos planos para ocho escenas, ningún primer plano, hablantes fuera de cuadro | A6 |
| «Como dije» | No | — |
| Amarillo sólo de Punto (B2), aviso en el título (B6), subtítulo viejo sobre la escena nueva (B7) | **Sí, regresan los tres** | M10, B1, B2 |
| Familias sin nombre visible (M6 de rev-narr-3) | **Sí** | M5 |
| Bitácora como boletín (M8) | **Sí** | M9 |

---

## Hallazgos ALTOS

### A1. La premisa no actúa: la Marea no amenaza nada, lo equivocado queda escrito y lo entendido se borra solo
- **Dónde:**
  - La única mención es «antes de la Marea» (`scenes-a.js:94`).
  - Cada `setup` borra todo lo escrito con `removeWhere(/^(eqv-|d6-|c6-)/)` (`scenes-a.js:151, 237, 305`;
    `scenes-b.js:14`). Nadie lo borra en el mundo.
- **Qué:**
  - Las escrituras equivocadas de los vecinos quedan en el pizarrón, sin tachar, con la misma tiza y en la misma columna
    que las del estudiante.
    - `c6-directa/009`: «x = 5 + 3 = 8» encima de «x + 3 − 3 = 5 − 3 / x = 2». Hay dos resultados contradictorios y
      nada indica cuál es el bueno.
    - Lo mismo pasa con «0 = 0» (`012`) y con «x = 1» (`016`).
  - En cambio, la derivación correcta de cada escena desaparece al empezar la siguiente (`c6-directa/015`, `017`, `018`).
  - El capítulo no tiene clímax. Nada se pierde ni se salva.
- **Por qué importa:**
  - El diseño dice que «lo que nadie entiende, el borrador se lo lleva» y que «lo comprendido resiste». En este
    capítulo pasa lo contrario: resiste lo que nadie entiende y se borra lo comprendido.
  - Es la tercera vez que se señala (A1 de rev-narr-2, A3 de rev-narr-3).
  - Además, el capítulo de «pasa sumando» es el lugar natural de la premisa. Las abreviaturas que sobrevivieron a lo que
    abreviaban son justamente los despejes de memoria de Recta, Cuña, Oval y Curva.
- **Propuesta:**
  - **Que la incógnita nazca de la Marea.** En el registro de Mara, la pasada borró el primer número de un renglón:
    «▢ − 3 = 5». La x es el nombre del hueco. Así se responde la pregunta de 6.1 que hoy no cierra (ver M2).
  - **Que el borrador pase después de cada truco.** Se lleva el renglón que nadie puede justificar («x = 5 + 3 = 8»,
    «0 = 0», «x = 1»). Los renglones del estudiante quedan tenues pero legibles, y el registro se acumula a lo largo del
    capítulo en lugar de limpiarse.
  - **Un cierre con apuesta.** Una pasada grande de la Marea sobre el registro de las cajas. El jugador elige qué
    renglones sostener y lo justifica señalando la operación que se puede deshacer. Lo justificado resiste y lo demás se
    va.
- **Cómo comprobarlo:**
  - al final de 6.6, captura sin ningún renglón equivocado legible;
  - captura del final del capítulo con el registro completo y tenue;
  - al menos un `describe` de «se borra / resiste» por escena con truco.

### A2. 6.3–6.7 son un desfile de vecinos con un error cada uno, sin necesidad ni apuesta, y el estudiante pasa a ser el que corrige
- **Dónde:** las entradas de los vecinos tienen el tono de un ejercicio:
  - «Yo tengo otra caja… Eso lo resuelvo de memoria.» (`scenes-a.js:251`)
  - «Yo tengo un truco más rápido: multiplico los dos lados por cero… y listo.» (`:321`)
  - «A mí me gusta elevar todo al cuadrado… Queda más lindo.» (`scenes-b.js:46`)
  - «Esta la saqué rápido: x por x igual a x.» (`:89`)
  - «Me dieron un acertijo: −2 por x tiene que quedar debajo de 6.» (`:133`)
  - «Una última: dos cajas iguales…» (`:183`)
- **Qué:**
  - **La misma plantilla cuatro veces seguidas (6.3–6.6):**
    1. Un vecino solo, al borde del cuadro, anuncia su truco.
    2. Su renglón aparece en el pizarrón.
    3. Una elección de menú.
    4. El jugador mueve a Punto.
    5. Un pensamiento da el veredicto.
    6. El estudiante dice la regla en voz alta.
    7. El vecino acepta con una frase ingeniosa.
  - **Motivos de paja.** Nadie eleva al cuadrado porque «queda más lindo», ni multiplica por cero para «terminar más
    rápido». «Esta» (6.6) no se refiere a nada, y «me dieron un acertijo» no dice quién. Desde 6.4 la caja (lo que no se
    ve) desaparece hasta 6.8.
  - **Las familias del cap. 3 vuelven sin su historia.** No se usan las deudas de Curva y Cuña, el saldo −3 de Oval en
    3.5, ni la rivalidad sobre quién tiene más. Cada familia es portadora de un error.
  - **Voces que se contradicen.**
    - Curva «nunca supo adónde pasaba» el 3 en 6.2 y en 6.6 manipula `x · x = x` «rápido».
    - Oval, generoso y preocupado por las tejas en los caps. 2–3, aparece como esteta.
  - **El estudiante corrige a cuatro vecinos seguidos** y cierra cada escena con una regla:
    - «El 3 sumaba: para sacarlo, se resta a los dos lados.» (`:288`)
    - «Pero la caja de Oval tenía 3… El −3 lo trajo el cuadrado.» (`scenes-b.js:67`)
    - «Al dividir por x, se suponía que x no es cero…» (`:112`)
    - «Dividir por un negativo da vuelta la recta…» (`:164`)

    Es la corrección de A2 de rev-narr-2 llevada al otro extremo. El profesor ya no es Mara: es el protagonista
    (regresión de N2).
- **Por qué importa:**
  - El contrato §4 pide que cada escena tenga «un propósito dramático» y alterne «descubrimiento, descanso, humor y
    emoción».
  - El §13 pide buscar «momentos que parezcan una plantilla educativa».
  - Un vecino que comete un error absurdo enseña a reconocer errores ajenos, no a sentir por qué uno mismo los
    cometería.
- **Propuesta:**
  - **Atar cada transformación a una necesidad de una familia, con su historia de los caps. 2–3:**
    - **6.4, Cuña.** Su deuda de −4 está anotada en una cuenta larga. Quiere «borrar la cuenta» y multiplica todo por
      cero: «0 = 0, ya no debo nada». Mara: «La caja tiene ocho. Y vos seguís debiendo cuatro.» El truco es tentador
      porque borra la deuda, no por velocidad.
    - **6.5, Oval.** Anotó su saldo «más corto» como `x · x = 9` y la Marea se llevó el renglón original. Hoy no sabe si
      tiene 3 o debe 3. El registro de Mara, que resistió, dice −3 (es su saldo de 3.5). Así el «invitado de más» es el
      **+3**. Además se corta una idea falsa que hoy se refuerza: en 6.5 y 6.6 la solución sospechosa es la negativa o el
      cero, y en el borrador de 7.1 «un lado no mide −3».
    - **6.6, Curva.** Que la caja de Curva esté vacía, porque Curva nunca tiene nada (cap. 2: «ya no me queda
      ninguno»). Dividir por x es suponer que tiene algo. La solución perdida, x = 0, es su caja: «Dividiste suponiendo
      que tenía algo. Yo nunca tengo nada.»
    - **6.7, Cuña.** Cada teja que pide le deja un saldo de −2 y Mara no le fía por debajo de −6. Dividir por un
      negativo tiene un sentido que se puede contar.
  - **Variar la forma de las escenas.** Un error lo comete Punto (A3) y otro lo comete el estudiante, y lo corrige un
    vecino. En al menos una escena, dos familias discuten entre ellas.
  - **Que no todas las escenas terminen en una regla dicha en voz alta.** A veces alcanza con que el vecino concluya,
    como Curva en 6.6, o con la imagen.
- **Cómo comprobarlo:**
  - ninguna entrada de vecino con «acertijo», «truco» o «me gusta» sin un motivo del mundo;
  - en el log, al menos dos escenas de 6.3–6.7 sin una línea del estudiante que enuncie una regla;
  - al menos una familia que use su saldo del cap. 3.

### A3. Punto como x es un cursor, no un personaje: no decide, no se equivoca, no escribe y no reacciona
- **Dónde:**
  - **6.1:** Punto salta al cero en una cinemática (`scenes-a.js:97-102`). El comentario del código dice «Punto se
    ofrece», pero en pantalla es el estudiante quien lo designa: «Punto, vos sos lo de la caja. Te llamo x.» (`:104`).
  - **En todo el capítulo:** Punto sólo hace `hop` cuando el jugador toca una marca (`placeX`, `:31-69`). Aparte del
    sonido de cada salto, su voz suena dos veces: `punto('no')` en 6.3 y `punto('question')` en el gancho.
  - **Nunca escribe:** el «x · x = 2» amarillo del gancho aparece sin trazo, solo (`scenes-b.js:253-255`).
  - **Ningún primer plano** del momento en que se vuelve x (`SHOTS.line` de 1760 u; Punto mide unos 40 px en
    `c6-directa/003`).
- **Qué:**
  - Es el capítulo en el que el acompañante podría cambiar más (la tabla del diseño: «cambia cómo percibe, se expresa y
    se relaciona»), y es donde menos actúa. Retrocede de «Trazo» (estela, dirección) a un punto que salta:
    - sin `puntoArrow`, no tiene flecha;
    - no deja estela;
    - no tiene opinión;
    - no tiene ninguno de sus errores característicos (caps. 1, 3, 5).
  - Situaciones que le pasan a él y nadie registra:
    - **6.4:** «cualquier caja serviría» quiere decir que Punto da igual dónde esté.
    - **6.5:** la x puede estar en dos lugares.
    - **6.6:** con Punto en el 0, los marcadores desaparecen.
  - «Vos sos lo de la caja» identifica a Punto con un número. El diseño dice «hace de x» (un papel), y el contrato §4
    advierte: «un punto no es el número cero… no vale nada: es alguien».
- **Por qué importa:**
  - El contrato §4 pide un acompañante que «pueda sorprenderse, intentar algo, equivocarse y comprender junto al
    jugador» y que no sea un muñeco.
  - La pregunta dramática del juego («¿qué puede cambiar sin dejar de ser lo mismo?») tiene acá su imagen más exacta:
    Punto cambia de lugar y sigue siendo Punto, y la ecuación cambia de forma y sigue diciendo lo mismo. El capítulo no
    la usa.
- **Propuesta:**
  - **6.1:**
    - Que Punto se ofrezca él: salta a la recta antes de que nadie lo pida y escribe una «x» amarilla sobre su cabeza
      (es «Punto que escribe»).
    - El estudiante: «Hacé de lo que hay en la caja. Mientras tanto, te digo x.»
    - Primer plano de ≥ 2 s de ese momento.
  - **Un error propio y verosímil en 6.1.** Punto lee «saco tres, quedan cinco» y salta al 2 (5 − 3, el despeje con el
    signo equivocado) o al 5. Los marcadores lo desmienten, y eso prepara el error de Recta en 6.3.
  - **Su rasgo de Trazo, puesto a trabajar.** Cada lugar donde Punto se sienta y la relación se cumple queda marcado
    con su estela. Así se ve el conjunto de soluciones (sirve para 6.4, 6.5 y 6.7; ver A5).
  - **6.5:** cuando aparece −3, Punto se desdobla y deja un fantasma tenue en el 3: hay dos lugares donde «él» cumple.
  - **6.6:** al dividir por x con Punto en el 0, Punto parpadea o se encoge. Lo que «se perdió» es él.
  - **6.4:** con el truco de Cuña, Punto salta por todos lados y nada cambia; se queda quieto, desanimado. Si da lo
    mismo dónde está, deja de importar. Ese latido es el que la escena necesita.
  - **Una línea del estudiante que nombre la pregunta dramática sin solemnidad.** Por ejemplo, en 6.2: «Te movés y
    seguís siendo vos. La cuenta cambia y sigue diciendo lo mismo.»
- **Cómo comprobarlo:**
  - en el log, al menos dos reacciones de Punto (sonido o gesto con `describe`) que no sean un salto pedido por el
    jugador;
  - un error de Punto;
  - una escritura de Punto;
  - una captura de primer plano en 6.1.

### A4. El texto contradice la imagen en 6.7, y en 6.8 un camino que el juego declara válido no se puede recorrer
- **6.7 (Al revés):**
  - Los pensamientos afirman la posición de Punto: «Con Punto en el 0: antes se cumplía (0 < 6) y ahora no (0 < −3).»
    (`scenes-b.js:159`) y «Con Punto en el 0 se sigue cumpliendo.» (`:155`).
  - Pero Punto queda donde lo dejó el jugador en la exploración anterior, que exige haber visto un lugar que cumple y
    otro que no (`:136-139`).
  - En las dos partidas el bot terminó en x = 2 (`c6-*/state.json`, `try-x` de `c6.al-reves`), no en 0.
  - Si un jugador explora primero un positivo y después un negativo, termina en un lugar que no cumple (por ejemplo,
    −5). Ahí, con «÷ (−2), dejando <», la tilde **aparece** (−5 < −3) mientras el texto dice «antes se cumplía y ahora
    no». La imagen dice lo contrario del texto, justo en la demostración.
- **6.8 (Dos pasos, el momento):**
  - La paleta ofrece sólo «−1», «÷ 2» y «−7 a los dos» (`:188-192`). Después de dividir primero (x + 1/2 = 7/2), ninguna
    combinación deja sola a la x: haría falta «− 1/2».
  - A los cuatro pasos el juego resuelve solo: «Así no termino nunca. Primero lo que está más afuera: el +1…»
    (`:211-216`).
  - En seguida el estudiante dice: «Dividiendo primero también se llega, con mitades en el camino…» (`:217`). Se
    contradice en dos líneas, y el jugador no pudo llegar.
  - Si se insiste, aparecen escrituras como «1/2x», ambigua entre (1/2)·x y 1/(2x) (`equations.js:12`).
  - Con cuatro pasos, el «x = 3» del juego se escribe en la fila 5 (`:215`), y «3 = x ÷ 4» se escribe también en la fila
    5 (`:229`): dos renglones superpuestos. Pasó en las dos partidas: los caminos `m1, m7, m1, m7` y `m7 ×4` de
    `state.json`. No hay captura; lo deduzco del código.
  - La Bitácora atribuye el resultado al jugador: «tu camino fue: restar 1, restar 7, restar 1, restar 7. x = 3.»
    (`:284`).
- **Por qué importa:**
  - El contrato §6 pide «reconocer caminos válidos alternativos; no evaluar únicamente una secuencia de clics
    prevista». 6.8 es el momento rejugable que debería demostrarlo.
  - Un texto que describe una posición que no es la de la pantalla le enseña al jugador a no mirar.
  - Es la misma clase de falla que A5 de rev-narr-2 y A2 de rev-narr-3 (cuentas que no cierran), ahora entre texto e
    imagen.
- **Propuesta:**
  - **6.7:**
    - Antes de la paleta, llevar a Punto al 0 con una línea («Punto, volvé al cero») o redactar el pensamiento con su
      posición real (`view.x`).
    - Mejor todavía: comparar conjuntos, no un punto (A5).
  - **6.8:**
    - Ofrecer operaciones que se calculen según el estado: «− 1/2 a los dos» cuando la ecuación tenga mitades, «÷ 2»
      siempre, o una operación que el jugador compone (número y operación).
    - Sacar «Así no termino nunca» como salida automática. Si el jugador se estanca, que Punto proponga algo, pero que
      lo aplique el jugador.
    - Calcular la fila del gancho a partir de la última usada.
    - En la Bitácora, distinguir «tu camino» de «lo que terminó el juego».
- **Cómo comprobarlo:**
  - 6.7 jugada terminando en −5 y en 2, con captura del pensamiento y la tilde;
  - 6.8 jugada con «÷ 2» primero, hasta x = 3 sin intervención y sin solapamiento (captura del final);
  - un test que recorra los cuatro órdenes de 6.8.

### A5. El caso obligatorio («pasa sumando») y las desigualdades se demuestran en un solo punto: que las soluciones se conservan se dice, no se ve
- **Dónde:**
  - **6.2:** la operación se prueba «con Punto en el 8» (pista de `scenes-a.js:175`), es decir, en la solución. Después
    de transformar, el jugador no puede mover a Punto. La conservación queda en palabras: «…quedarse en el lugar, para
    cualquier x» (`:201`) y «Por eso no aparece ni se pierde ninguna x» (`:220`).
  - **6.7:** la relación se indica con una tilde «✓» sobre Punto (`common.js:126-135`). El conjunto de las x que cumplen
    no se dibuja nunca, y la conclusión «Las mismas x de antes» (`:155`) se afirma sin mostrarlas. La «media vuelta» del
    cap. 4 se nombra (`:164`), pero no se ve.
- **Qué:**
  - En la solución, una transformación que conserva las soluciones y otra que agrega soluciones se ven iguales: los
    marcadores siguen juntos. Lo que distingue «+3 a los dos» de «× 0» es lo que pasa **fuera** de la solución, y eso
    sólo se explora en 6.4.
  - La tilde «✓» es la marca escolar de «correcto». Se lee como evaluación del jugador, no como «esta x cumple».
  - Además cambia la gramática visual: la igualdad es una raya entre marcadores (una relación) y la desigualdad, una
    marca sobre Punto (un veredicto).
- **Por qué importa:**
  - El contrato §6 exige que el jugador reconozca «por qué las ecuaciones conservan las mismas soluciones» y que no
    baste con que el narrador lo diga.
  - El contrato §3 pide evitar los íconos de «respuesta correcta».
  - Que la revisión matemática confirme el alcance; yo lo marco como problema de puesta en escena.
- **Propuesta:**
  - **6.2:**
    - Después de «+3 a los dos», liberar a Punto y dejar los marcadores de la ecuación original en tiza tenue.
    - En cualquier otra marca, los dos pares quedan separados **por la misma distancia**. Sólo en el 8 se juntan los
      dos pares.
    - El pensamiento puede entonces ser una sola observación del jugador: «Donde antes no coincidían, ahora tampoco.»
  - **6.7:**
    - Que la estela de Punto (A3) deje una marca bajo cada x probada que cumple, y que el conjunto se complete con un
      trazo («todas las de la derecha del −3»).
    - Al dividir por −2 sin dar vuelta el signo, el trazo nuevo queda del otro lado y la diferencia con el original se
      ve entera.
    - Mostrar la media vuelta: la recta de los marcadores gira alrededor del 0, con el giro rígido del cap. 4.
    - Reemplazar la «✓» por una flecha o un «<» de tiza entre los marcadores.
- **Cómo comprobarlo:**
  - en 6.2, una captura con Punto en un valor distinto del 8 después de transformar, con los dos pares visibles;
  - en 6.7, una captura de los dos conjuntos (correcto y sin dar vuelta) a la vez.

### A6. Puesta en escena de diapositiva: dos planos para ocho escenas, hablantes fuera de cuadro, escritura a distancia y ningún primer plano
- **Dónde y qué:**
  - **Sólo dos planos** (`common.js:18-21`): `box` (900 u) en 6.1 y `line` (1760 u) en todo lo demás. Siete escenas con
    el mismo encuadre:
    - la recta a media altura;
    - el estudiante diminuto contra el borde izquierdo;
    - un vecino contra el borde derecho (a unos 56 px del marco);
    - la derivación arriba a la izquierda;
    - el cuadrante superior derecho vacío (`c6-directa/007`, `012`, `015`, `017`).
  - **Hablantes fuera de cuadro.**
    - En 6.2, Mara (12300 u) y Curva (12180 u) quedan a la izquierda del plano, que empieza en 12560. «Probando se
      encuentra…», «Mi abuela decía…» y «Ah. Así sí.» se dicen sin nadie en pantalla (`c6-directa/005`).
    - En 6.4 y en el gancho de 6.8, Mara habla fuera de cuadro (`cast` la pone en `BOX.x − 150`, `common.js:58`).
  - **Escritura a distancia.** Recta, Cuña, Oval y Curva «escriben» desde el borde derecho, pero sus renglones aparecen
    arriba a la izquierda, a unos 1340 px de ellos (`scenes-a.js:253-259`, `323-329`; `scenes-b.js:47-49`, `90-94`).
    Oval y Curva ni siquiera se ponen en pose de escribir. Eso también choca con la premisa de que el estudiante es quien
    traza: si los vecinos escriben, tiene que verse cómo.
  - **El pago de 6.1 no se lee.** Los ocho atados de la caja se funden en dos bloques rayados con una banda celeste
    continua. No se pueden contar (`c6-directa/002`, ampliada: separación de 32 u, `scenes-a.js:123`).
    - Punto, que está en el 8, queda fuera de cuadro cuando se abre la caja.
    - La comprobación de la hipótesis («ocho») y la x que la anticipó no comparten nunca el plano.
  - **El lugar no se establece.** El fondo del cap. 3 (depósito, registro, mesa) está entre 8000 y 11800 u y los planos
    del cap. 6, entre 12150 y 14320: el depósito no aparece nunca. «La explanada del depósito» es una línea sobre verde.
  - **Ningún primer plano** en todo el capítulo: ni cuando Punto se vuelve x, ni cuando se abre la caja, ni en el
    desdoblamiento de 6.5, ni en `x · x = 2`. Es N4, otra vez.
- **Por qué importa:**
  - El contrato §3 pide «composición cinematográfica, encuadres expresivos… el pizarrón debe sentirse como un medio vivo,
    no como una diapositiva estática».
  - Con siete escenas iguales, el ritmo visual es el de una presentación.
  - Una voz sin cuerpo en pantalla rompe la actuación (N5) y la lectura de quién dice qué.
- **Propuesta:**
  - **Una gramática de tres planos por escena:**
    - un plano de situación con el vecino **cerca** del estudiante (≤ 600 u entre ellos), frente a la recta;
    - el plano de la recta para operar;
    - un inserto o primer plano (≤ 700 u, ≥ 2 s) en la revelación de cada escena.
  - Que los vecinos se acerquen a la columna de la derivación para escribir, o que le dicten al estudiante y él escriba
    (y pueda dudar).
  - En 6.1:
    - atados separados ≥ 48 u, en dos filas de cuatro con aire, y contados al aparecer, de a uno con su nota;
    - un plano que incluya la caja abierta y a Punto en el 8.
  - Un plano de llegada al depósito en 6.1 (el registro de Mara, la puerta con el 0 del cap. 3).
- **Cómo comprobarlo:**
  - extender la guarda de pruebas: todo hablante con `d.say` tiene que estar dentro del encuadre (hoy sólo se controla
    lo tocable);
  - captura de la caja abierta en la que se cuenten ocho;
  - al menos tres encuadres distintos en `c6-directa`.

---

## Hallazgos MEDIOS

### M1. Costuras 5→6 y 6→7: cambio de lugar y de elenco sin transición; el gancho del 7 se cuenta de segunda mano y anticipa su descubrimiento
- **5→6:**
  - El cap. 5 termina con Peldaño, en las Terrazas: «¿cómo se anota un número que no sé cuánto vale?»
    (`ch5/scenes-b.js`, final de `diagonal`).
  - El 6 empieza con `w.clear()` en el depósito del cap. 3, con otras familias, sin hora ni plano de llegada.
  - La única costura es el pensamiento «Un número que está, pero no se ve.» (`scenes-a.js:96`). Además, el título del
    capítulo se lee en la tarjeta y otra vez en el pensamiento.
  - Peldaño desaparece y su pregunta queda colgada hasta el gancho del final.
- **6→7:**
  - Mara relata, fuera de cuadro, lo que dijo Peldaño, que no está: «Dice que el cuadrado dibujado sobre ella ocupa
    justo dos cuadrados de la huerta» (`scenes-b.js:251`).
  - En el borrador de 7.1 (sin seguimiento en git), eso mismo es el descubrimiento que hace el jugador con los cuatro
    triángulos. El gancho lo adelanta como rumor.
  - «Hay que aprender a hacer crecer los números…» (`:260`) nombra el título siguiente («Crecer»). Es la metatextualidad
    de M1 de rev-narr-3, otra vez.
  - «Un número que por sí mismo da 2» es ambiguo: puede leerse como «él solo».
- **Propuesta:**
  - **5→6:** abrir con Peldaño, que baja de las Terrazas al depósito con su pregunta. Mara le contesta con la caja:
    «Tampoco sé cuánto hay acá. Primero esto.» La pregunta del 5 queda viva y vuelve en el cierre.
  - **6→7:** que Peldaño esté en cuadro con su dibujo del cuadrado sobre la diagonal, sin decir cuántos cuadros ocupa.
    El estudiante escribe «x · x = ?». Punto, escribiendo su x, pregunta qué número multiplicado por sí mismo da eso.
    Sin nombrar el capítulo siguiente.

### M2. La lógica de la caja (6.1) no cierra y la apertura vuelve innecesario el cálculo
- **Dónde:** `scenes-a.js:94-95` y `118-129`.
- **Qué:**
  - «No me acuerdo cuántos… Lo que sí anoté: si saco tres, quedan cinco.» Para anotar eso había que saber que eran ocho.
  - «No la quiero abrir a la intemperie», y la abre en la misma escena, sin consecuencia. El jugador puede preguntarse
    por qué no la abrió antes.
- **Por qué importa:** en la escena que funda la idea de incógnita, el motivo para no mirar es débil. Un adolescente
  atento lo nota y la escena se vuelve pretexto (contrato §2: «la matemática no es un candado delante de la historia»).
- **Propuesta:** el renglón borrado por la Marea (A1) explica por qué se sabe «− 3 = 5» y no el primer número. Que la
  caja se abra con una condición del mundo («se abre cuando llegue Curva a buscar lo suyo») o al final del capítulo como
  pago. Si se abre en 6.1, que cueste algo (la Marea roza lo de adentro) y que Punto esté en el plano.

### M3. Elecciones que se delatan o llegan después de la respuesta, y búsquedas de un solo blanco
- **Elecciones** (5 `d.choose` evaluados):
  - **La correcta es la más larga y la que razona:**
    - «Sumar lo mismo a los dos lados, y simplificar.» frente a «Una regla que no hay que entender.» (`c6-directa/004`);
    - «Por cero, todo cae en el mismo lugar: se perdió lo que decía la cuenta.» frente a «Multiplicar por cero no cambia
      nada.» (`011`).
  - **Opciones de paja:**
    - «Creerle: lo hizo de memoria.» y «Hacerla de memoria otra vez.» (`:263-265`);
    - «No: Curva ya encontró la x, es 1.» frente a «Sí: 0 · 0 = 0.» (`scenes-b.js:97-98`), donde la correcta trae su
      prueba.
  - **Preguntas después de la respuesta:**
    - en 6.4, «¿Qué hizo el truco de Cuña?» llega justo después de «Con esta cuenta, cualquier caja serviría» (`:340`);
    - en 6.2, «¿qué quería decir "pasa sumando"?» llega después de que el estudiante ya lo dijo (`:201`).
  - **Las respuestas equivocadas no cambian nada en el mundo:** sólo producen una línea. Es N3 del cap. 1.
- **Búsquedas de un solo blanco:**
  - **6.3:** la primera búsqueda sólo termina en el 8 (`:273`). Si el jugador encuentra primero el 2 verdadero (los dos
    bots lo hicieron: `try-x` x = 2, `match: true`), aparece la raya, nadie dice nada y el juego insiste en el 8. Ignora
    un descubrimiento correcto.
  - **6.6:** «Poné a Punto en el 0» (`:102-103`).
  - **6.8:** «Poné a Punto en el 3» (`:219`).
  - **6.8:** después de «÷ 4» o «+ 4», el juego aplica «× 4» solo (`:236-243`) y el jugador no vuelve a elegir.
- **Propuesta:**
  - **Actuar la respuesta equivocada de 6.2:** con «el 3 se muda», el «−3» viaja con su signo al otro lado
    (x = 5 − 3) y los marcadores se separan. Es el error de Recta, que así queda sembrado.
  - **6.3:** si el jugador encuentra el 2 primero, Recta reacciona («¿Dos? Yo dije ocho») y probar el 8 pasa a ser una
    decisión.
  - **6.6:** que el jugador busque **todas** las soluciones antes de que Curva divida, como en 6.5. Encuentra el 0 y el
    1, y después ve cuál se pierde.
  - Opciones del mismo registro y largo.
  - Predicción antes de la acción y nunca un cuestionario sobre lo que se acaba de decir.

### M4. Ritmo: cada idea se dice tres o cuatro veces y los pensamientos instruyen o narran lo visible
- **Redundancias:**
  - **6.2:** «Siguen juntos: si a los dos les sumo lo mismo…» + «Ir tres para atrás y volver tres…» + la elección + el
    rótulo «"pasa sumando" = sumar a los dos lados» + «Y se puede deshacer…».
  - **6.5:** tres líneas seguidas de conclusión (`scenes-b.js:64-68`).
  - **6.6:** el pensamiento repite el `describe` casi palabra por palabra (`:109-110`). Además, «Con Punto en el 0, los
    dos dan 0: cumple» llega después de que el jugador ya eligió «Sí: 0 · 0 = 0».
- **Pensamientos que explican la interfaz:**
  - «Ahora no es "igual": es "menor". Cuando se cumple, aparece una tilde sobre Punto.» (`:134`)
  - «Abajo, lo que da x − 3. Arriba, el 5. Tienen que caer en el mismo lugar.» (`scenes-a.js:109`)
- **Volumen:** el capítulo tiene 27 `d.think`. Con 8 líneas del estudiante en voz alta, el protagonista lacónico del
  diseño piensa y explica más que nadie.
- **Por qué importa:** es M5 de rev-narr-2 y M9 de rev-narr-3. La explicación repetida le quita al jugador el momento
  de notarlo.
- **Propuesta:**
  - una formulación por idea, la de quien la descubre;
  - las instrucciones de interfaz, en la pista «?» y no en la voz del personaje;
  - meta: ≤ 1 pensamiento de conclusión por escena.

### M5. Las familias no se identifican y no se relacionan
- **Dónde:** un solo vecino por escena, contra el borde derecho (`lx(LINE.to) + 90`), con cabeza de unos 35 px. No hay
  nombre en pantalla: quién habla sólo se sabe por el subtítulo.
- **Qué:**
  - Recta (cabeza cuadrada) y Cuña (triángulo) se confunden a ese tamaño (recortes de `007` y `012`).
  - En 6.1, Curva está en escena y no dice nada.
  - Las familias no se hablan entre sí, aunque en el cap. 3 discutían quién tenía más.
- **Por qué importa:** es M6 de rev-narr-3. Además, las voces pierden la continuidad de sus capítulos (A2).
- **Propuesta:**
  - nombre en tiza a los pies de cada familia;
  - dos familias por escena, por lo menos en 6.4–6.7 (Cuña y Curva, deudoras, del mismo lado; Recta enfrente);
  - un gesto del que habla.

### M6. «Izquierda / derecha» con dos sentidos, y dos marcadores iguales
- **Dónde:**
  - Los botones dicen «+3 sólo a la izquierda» (el lado de la ecuación).
  - El `describe` dice «El marcador de la izquierda se corre tres lugares; el de la derecha se queda.»
    (`scenes-a.js:182`), y ese marcador termina **a la derecha** del otro en la recta (`c6-errores/004`: el de
    «x − 3 + 3» queda en +8 y el del «5», en +5).
  - En 6.7, «izquierda» quiere decir otra vez la dirección en la recta (`:137`, `:164`).
  - Los dos marcadores son el mismo triángulo blanco (`common.js:102`, mismo color para L y R). Sólo se distinguen por
    la altura y el rótulo, y la correspondencia «miembro izquierdo = el de abajo» es arbitraria.
- **Por qué importa:** es la misma clase de ambigüedad que «cuartos» en el cap. 5 (M5 de rev-narr-3), en el capítulo
  donde «lado» es la palabra central. Para un lector de pantalla, el `describe` de 6.2 es directamente confuso.
- **Propuesta:**
  - nombrar los miembros por su contenido («el de la x», «el del 5») o como «primer / segundo miembro»;
  - reservar «izquierda / derecha» para la recta;
  - dar a cada marcador una forma propia (triángulo y cuadrado, por ejemplo), además de la altura.

### M7. Los marcadores mienten cuando el valor se sale de la recta
- **Dónde:** `common.js:99` y `118`. Un valor fuera de [−10, 12] se dibuja pegado al extremo (12,6 o −10,6), sin aviso.
- **Qué:** en 6.5, con Punto en 4, 5 o −4, «x · x» queda clavado al final de la recta como si valiera 12,6. Lo mismo pasa
  con −2x para x ≤ −7 (6.7) y con 2x + 1 para x ≥ 6 (6.8). Justo en 6.5, la escena en la que el jugador explora a ciegas
  buscando dónde vale 9.
- **Por qué importa:** contrato §2: «una metáfora visual debe aclarar una propiedad sin inventar otras». Acá inventa
  valores.
- **Propuesta:** fuera de rango, el marcador se transforma en una flecha en el extremo con el valor escrito («→ 25»), o
  la cámara se abre. El rótulo puede mostrar el valor además de la expresión («x · x = 16»).

### M8. Escenas con el diseño de 6.4–6.6 que no dejan intentar la transformación al jugador
- **Dónde:** en 6.4, 6.5 y 6.6 el vecino aplica la transformación inválida y el jugador sólo comprueba.
- **Qué:** el jugador sólo puede elegir una transformación inválida en dos lugares: «+3 sólo a la izquierda» (6.2) y
  dividir sin dar vuelta el signo (6.7). Las inválidas más tentadoras (× 0, al cuadrado, ÷ x) las aplica siempre un
  vecino. Detectar es más fácil que no caer.
- **Por qué importa:** el contrato §6 pide «una oportunidad de detectar una transformación inválida», y eso está. Pero
  §5 pide que el jugador pueda «predecir y modificar»: nunca tiene en la mano «× 0», «al cuadrado» o «÷ x» como
  herramientas tentadoras.
- **Propuesta:** en el cierre (A1), una paleta que incluya «× 0», «÷ x» y «al cuadrado» junto a las válidas. Que el
  jugador las pueda usar y vea el efecto con la estela de soluciones (A5). Es la transferencia que hoy falta entre 6.3–6.6
  y 6.8.

### M9. La Bitácora sigue siendo un boletín y atribuye de más
- **Dónde:** `writeJournal6` (`scenes-b.js:264-307`).
- **Qué:**
  - Hasta 9 ítems en «Lo que pasó», todos evaluativos («Moviste…», «Sumaste…», «Comprobaste…»), y un cuerpo de 7
    párrafos (rev-narr-3 pedía ≤ 4).
  - No queda ningún momento de historia: ni la abuela de Curva, ni los ocho atados de Mara, ni Punto haciendo de x.
  - Atribuye de más:
    - el camino de 6.8 que terminó el juego (A4);
    - «Pensaste que "pasa sumando" era mudar el número **o** una regla sin explicación» (`:274`) le atribuye al jugador
      las dos respuestas equivocadas cuando eligió una.
- **Propuesta:** 3–5 ítems, al menos uno de historia («Punto hizo de x para la caja de Mara»), evidencias plegadas
  aparte y cuerpo de ≤ 4 párrafos.

### M10. Accesibilidad de textos, rótulos y blancos
- **Sin `describe`:** 6.3, 6.5, 6.7 y 6.8 no tienen ninguno.
  - No se describen la tilde ni el resultado de dividir sin dar vuelta, ni los pasos de 6.8, ni el gancho «x · x = 2».
  - Las derivaciones son texto de canvas: con lector de pantalla, sólo llegan si las acompaña un `describe` o un
    subtítulo.
- **Botones sin verbo y con símbolos** (6.8): «−1 a los dos», «÷ 2 a los dos», «× 4 a los dos» (`:189-191`, `231-233`)
  no tienen `label`, y les falta «lados». Las de 6.2 y 6.7 sí tienen etiqueta («Sumarle 3 sólo a la izquierda»,
  «Dividir por menos dos…»). Es M11 de rev-narr-2, otra vez.
- **Blancos táctiles:** las marcas de `placeX` miden 36×84 u (`scenes-a.js:50`), unos 17×40 px a 844×390, por debajo de
  los 44 px que fijó el cap. 1. Las marcas están a 64 u y caben blancos de unos 60 u.
- **Tamaños en teléfono:** a 844×390, los números de la recta (22 u) quedan en unos 10 px y los rótulos de los
  marcadores (30 u), en unos 14 px. Los rótulos de canvas no siguen la opción de tamaño de texto: `--scale` sólo afecta
  el DOM. La lectura limpia tiene un mínimo de 13 px.
- **Amarillo para lo que no hizo Punto** (B2 de rev-narr-2): el rótulo «"pasa sumando" = sumar a los dos lados»
  (`:217`), dibujado sin que nadie lo escriba, y «x · x = 2» (`scenes-b.js:253`). Si lo escribe Punto, que se vea (A3);
  si no, que sea blanco.
- **Propuesta:**
  - `describe` en cada resultado de operación y en cada renglón escrito («El estudiante escribe: 2x = 6»);
  - `label` con verbo en la paleta de 6.8 («Restar 1 a los dos lados»);
  - blancos de 60×120 u;
  - un plano más cerrado de la recta para teléfono (por ejemplo, de −4 a 12 cuando la escena no necesita los
    negativos).

---

## Hallazgos BAJOS

- **B1. El último subtítulo de una escena queda sobre la siguiente:** «Ocho. Bien.» (`c6-directa/003`), «Más lindo,
  pero con un invitado de más.» con Curva ya en escena y el rótulo «Oval» (`015`), y luego `017` y `018`. Es B7 de
  rev-narr-2 y rev-narr-3, otra vez.
- **B2. «Anotado en la Bitácora (≡)» sigue visible en la pantalla de título** (`c6-directa/019`). Es B6, otra vez.
- **B3. Volver a jugar el capítulo 6 deja a Punto sin flecha** (`state.json` sin `puntoArrow`). El capítulo no fija el
  estado que presupone (B1 de rev-narr-3).
- **B4. El cero con barra de Atkinson («Ø»)** en «0 · (x − 3) = 0 · 5» y «0 = 0» (`c6-directa/011`, `012`) se parece al
  símbolo de conjunto vacío, justo en una escena sobre conjuntos de soluciones. Conviene evaluar un 0 sin barra en la
  familia «Tiza», o al menos en las derivaciones.
- **B5. «Dividir por cero no da nada»** (`scenes-b.js:110`) se puede oír como «da cero», la confusión que 4.6 desarmó.
  Mejor «no da ningún número» o «no está definido».
- **B6. «Una última» y «Me dieron un acertijo»** son fórmulas de clase (ver A2).
- **B7. Repetición sin variación en 6.8:** con «−7 a los dos», el mismo pensamiento «Sigue valiendo, pero no ayudó…» se
  oye hasta cuatro veces seguidas (`c6-errores.log`, 44,8–48,1 s).
- **B8. «Me queda cero igual a cero, y listo»** (Cuña): no se entiende qué cree haber resuelto. Si el motivo cambia
  (A2), esta línea cae sola.
- **B9. La derivación de 6.1 queda pegada al borde superior** en el plano de la caja (`c6-directa/002`: «x − 3 = 5» a
  unos 20 px del marco) y lejos de la caja.

## Qué no pude verificar

- **Audio:** no escuché nada (`hop`, `punto('no')`, `question`, `found`, el borrador del cap. 5).
- **Ritmo, actuación y transiciones:** sólo vi cuadros sueltos y logs de un bot. No sé cuánto dura cada escena para una
  persona, ni cómo se ven el salto de Punto o la animación de los marcadores.
- **Pantallas sin captura:**
  - las paletas de operaciones (`wordSpot`) de 6.2, 6.7 y 6.8;
  - el final de 6.7 después de elegir;
  - el final de 6.8 con la derivación completa;
  - el gancho «x · x = 2».
- **La superposición de renglones en 6.8 y la contradicción de 6.7** con Punto en −5 son deducciones del código y de la
  evidencia de `state.json`, no capturas.
- **Teléfono y tacto:** no hay capturas del cap. 6 a 844×390. Los tamaños de M10 son cálculos. No sé cuánto mitiga la
  elección «del objeto más cercano» del toque (F3) en una recta de 23 marcas.
- **Accesibilidad en pantalla:** la Bitácora en pantalla, el lector de pantalla, «describir acciones», el texto grande,
  la lectura limpia y el movimiento reducido. Sólo leí el código.
- **Ramas no cubiertas:**
  - 6.5 con «Ninguna»;
  - 6.7 terminando la exploración en un valor que no cumple;
  - 6.8 dividiendo primero;
  - los momentos «Desplegar: pasa sumando» y «Desplegar: dos pasos».
- **La flecha de Punto:** las dos partidas empezaron en el cap. 6, sin `puntoArrow`.
- **El cap. 7:** está en preparación y sin seguimiento en git. Sólo leí el arranque de 7.1 para juzgar la costura.
- **Comprensión de personas:** nada de esto es un playtest. Que algo «se sienta plantilla» o «se lea mal» es una
  hipótesis que hay que comprobar con jugadores.
