# Revisión matemática independiente: cap. 8 «Formas» (rev-mat-7)

- Fecha: 2026-10-06. Commit revisado: `55e9eee` (rama `claude/arithmos-graphic-adventure-065e68`).
- Alcance:
  - `experiments/arithmos/src/ch8/{common,scenes-a,scenes-b,chapter}.js`.
  - `src/logic/geometry.js` y `tests/geometry.test.mjs`.
  - Gancho de entrada: `src/ch7/scenes-b.js:637`.
  - Contrato: `docs/arithmos/ARITHMOS_MASTER.md` §5, §7F (y §7C y §7G, porque los toca), §13.
  - Diseño: `docs/arithmos/ARITHMOS_DESIGN.md`, «Capítulo 8 — Formas» y «Criterios de escena».
- Números de línea: son los de `55e9eee`. Mientras revisaba entraron `2e43021` y `ecf8734`. En el cap. 8
  sólo cambian encuadres, tamaños de rótulos y el texto del botón «ancho». Desde la línea 60 de
  `ch8/scenes-b.js`, sumar 1 para ubicarse en `HEAD`. Revisé ese diff: no cambia ningún texto ni cuenta.
- Evidencia usada:
  - `artifacts/arithmos/it08/c8-directa/` y `artifacts/arithmos/it08/c8-errores/` (`log.txt`,
    `state.json`, capturas).
  - **Las dos partidas son 1 a 3 minutos anteriores al commit** (14:53 y 14:55; el commit es de 14:56).
    Los diálogos coinciden con el commit: lo comprobé con un script, línea por línea. La Bitácora y un
    rótulo de 8.3 no coinciden (ver «Qué no pude verificar»).
- Método:
  - Lectura del código, los textos y la Bitácora, rama por rama.
  - `node --test experiments/arithmos/tests/`: 77/77 pasan.
  - Scripts propios en el scratchpad. Hacen cinco cosas:
    - Recalculan cada igualdad de la pizarra.
    - Reproducen las transformaciones de `Shape` (traslación, giro, escala y espejo, en el orden de
      `world.js:459-464`) para 8.3 y 8.6, y miden qué región queda libre o superpuesta.
    - Calculan sombras reales del sol para cuatro latitudes argentinas.
    - Arman la Bitácora del commit (`writeJournal8`) en todas las ramas.
    - Comparan cada línea de los logs con el commit.
  - Recortes de capturas con `sips`.
  - **Sin navegador.** Las partidas son de un bot, no de personas.

## Veredicto corto

Todas las igualdades escritas en la pizarra son verdaderas:

- 3·3 = 9 > 8, 4·4 = 16 < 18, 7·7 = 49 < 50, 10·10 = 100 > 98, 17·17 = 289 > 288.
- A + B + C = 180°.
- lado × 2: área × 4, volumen × 8.
- Perímetro 12: áreas 5, 8, 9.
- 3² + 4² = 5² y a² + b² = c² con ángulo recto.
- (3, 2) ≠ (2, 3) y distancia 5.

Las construcciones son exactas:

- **8.1.** El descenso de Tennenbaum está bien dibujado: lo pisado tiene lado 2q − p, las esquinas tienen
  lado p − q, y cada «más chico» es justo el cuadrado amarillo con las esquinas como nuevos «q».
- **8.6.** Los cuatro triángulos dejan libre, antes, un cuadrado inclinado de lado 5 con ángulos de
  90,000°, y después, exactamente 3×3 + 4×4, sin superponerse.
- **8.3.** La L no tiene ninguna simetría, así que «girada» y «dada vuelta» no se confunden.

Fallan dos cosas que el contrato pide con todas las letras (§7F, §7G, §13):

1. **8.1 dice mal qué prueba el dibujo y qué no.** «El dibujo está hecho con medidas que no existen: no
   prueba nada.» Los largos del dibujo existen: son el lado y la diagonal. Lo que no existe es un par de
   **enteros**. Además, el razonamiento toma del dibujo dos datos que nunca dice con palabras. Y la
   pregunta evaluada («¿Hasta cuándo se puede seguir achicando?») no separa los largos, que se achican
   sin fin de verdad, de los enteros, que no pueden.
2. **8.8 dibuja la sombra de la tarde del lado del sol, y concluye algo falso.** Concluye que «mirando
   la sombra, no se sabe» si son las 10 o las 14. Mirando la sombra **entera** sí se sabe: a la mañana y a
   la tarde apunta para lados opuestos (así funciona un reloj de sol). La conclusión sobre función y
   relación vale sólo para el **largo** de la sombra, en **un mismo día y lugar**, y el juego no dice
   ninguna de las dos condiciones.

Hay además pasos de prueba que se toman del dibujo (8.6: que el hueco del medio es un cuadrado), una
fórmula sin decir qué lado es c, notación que suma vértices, y escenas sin transferencia real (8.4 sólo con
k = 2; 8.7 repite el 3-4-5 con las patas dadas en la opción).

## Cumplimiento por escena (diseño del cap. 8 y contrato F)

| Escena | Idea del diseño | Estado |
|---|---|---|
| 8.1 | √2 no es fracción; probar no alcanza; alcance del argumento | Cuentas y construcción correctas; **el alcance está mal dicho** (A1) |
| 8.2 | Ángulo como giro; suma 180° con la paralela; vale en el plano | Correcto, con el límite de la esfera declarado; la notación suma vértices (M1) |
| 8.3 | Congruencia (mover, girar, dar vuelta) contra semejanza | La clasificación es correcta; varios intentos fallidos no se ven fallar (M2); faltan los nombres y poner a prueba la definición (M3) |
| 8.4 | Longitud ×k, área ×k², volumen ×k³ | Correcto con k = 2, en cuadrados y cubos; sin k general ni otra forma (M4) |
| 8.5 | Perímetro ≠ área | Correcto; no aprovecha que con tramos enteros se probaron *todas* (B5) |
| 8.6 | Pitágoras; reacomodo para cualquier a, b; contraejemplo | Geometría exacta; falta el paso de los 90° (M5); c sin definir (M6); el contraejemplo sólo aparece en una rama (B6) |
| 8.7 | Par ordenado, negativos, distancia con Pitágoras | Correcto; sin transferencia: mismo 3-4-5, con las patas dadas en la opción (M7) |
| 8.8 | La sombra depende de la hora: ¿una sola sombra por hora? | **Dibujo y conclusión fallan** (A2); cita datos que el jugador puede no haber visto (M8) |
| Límites que el diseño promete declarar | √2: no da sus cifras; 180° en el plano; reacomodo sólo con ángulo recto; los dibujos no reemplazan el argumento | Los tres primeros, sí. El cuarto está dicho de una manera que lo vuelve falso (A1) |
| Historia | No atribuir nada sin fuente | Cumplido: ningún texto visible nombra a Pitágoras, a Tennenbaum ni a Babilonia |

---

## ALTA

### A1. 8.1: el alcance del dibujo y del argumento está mal dicho

- **Dónde:**
  - `src/ch8/scenes-a.js:86` (`Q = P / Math.SQRT2`) y `:88` (rótulo «si cumplieran justo:»).
  - `:94`, `:123-124`, `:137` (la cadena: `Pk = P · (√2 − 1)^nivel`).
  - `:158-165`: la pregunta «¿Hasta cuándo se puede seguir achicando?», con «Para siempre: cada par da
    otro más chico.» como respuesta esperada y las respuestas a «Hasta que lleguen a 1 y 1.» y «Hasta que
    no se pueda dibujar.».
  - `:166`, y `:168`: «El dibujo está hecho con medidas que no existen: no prueba nada. Lo que prueba es
    el razonamiento, y vale para todos los p y q a la vez.»
  - Bitácora: `scenes-b.js:392`.
  - Evidencia: `c8-directa/log.txt` 10,6–11,8 s; `c8-errores/log.txt` 12,4–15,8 s; capturas
    `c8-directa/006-snap-c8.diagonal.png` y `007-…`.
- **Qué:** hay tres problemas encadenados.
  1. **«Medidas que no existen» es falso para lo que está dibujado.** El dibujo usa P = 168 y
     Q = 168/√2 ≈ 118,79. Son el lado y la diagonal de un mismo cuadrado: existen, y el cap. 7 los
     construyó (`ch7/scenes-a.js:158`: «es la diagonal de un cuadro»). En el dibujo, lo pisado y lo
     libre miden lo mismo, de verdad: (2Q − P)² = 2(P − Q)² ≈ 4842,47. Lo que no existe es que p y q
     sean **enteros**: una rayita común que entre justo en el lado y en la diagonal. La frase, dicha por
     la voz interior del estudiante en el cierre de la prueba central del capítulo, invita a leer «√2 no
     existe» o «los irracionales no son medidas». Es lo contrario de §7C y de lo que el propio capítulo
     quiere: √2 existe como largo, pero no es una fracción.
  2. **«No prueba nada» exagera, y oculta lo que el razonamiento sí toma del dibujo.** Cualquier par que
     cumpliera p · p = 2 · q · q tendría la misma razón p/q = √2. Por eso el dibujo es, a escala, el de
     **todos** los pares posibles, y de ahí sale la idea (esquinas opuestas; lo pisado contra lo libre).
     El razonamiento usa dos datos que hoy sólo están en el dibujo:
     - Los de q entran en el de p (q < p, porque p · p = 2 · q · q es más que q · q).
     - Se pisan (p < 2q, porque 2q · 2q = 4 · q · q es más que p · p = 2 · q · q).

     De esos dos datos depende que el par nuevo sea de enteros **positivos** (2q − p > 0, p − q > 0) y más
     chico (p − q < q). Ninguna línea los dice. Así, lo que el juego llama «el razonamiento» se apoya
     justo en lo que dice que «no prueba nada».
  3. **La pregunta evaluada mezcla los dos mundos.** «¿Hasta cuándo se puede seguir achicando?» no lleva
     el «si hubiera un par de enteros». Con los largos del dibujo, la cadena se achica **para siempre**:
     cada nivel es el anterior por √2 − 1 ≈ 0,414. Es exactamente lo que pasa con el lado y la diagonal, y
     por eso ninguna partición «cae justo». Con enteros, en cambio, no puede bajar para siempre. Esa
     diferencia es la prueba entera, y el juego la borra:
     - Premia «Para siempre» sin decir de qué.
     - A quien elige «Hasta que lleguen a 1 y 1» (la intuición correcta de que los enteros tocan fondo) le
       contesta «no hay dónde parar», sin reconocer que esa mitad es la que produce la contradicción.
     - La palabra «contradicción» o «absurdo» (o «las dos cosas no pueden pasar a la vez: el supuesto es
       falso») no aparece. La Bitácora (`scenes-b.js:392`) termina en «habría otro más chico, sin fin»,
       sin el paso que lo vuelve imposible.
- **Por qué importa:** es la escena que el diseño eligió para enseñar qué prueba un dibujo y qué prueba un
  argumento («Alcance: vale para todos los p y q a la vez»; «los dibujos no son exactos y no reemplazan el
  argumento»). El contrato pide «conectar argumentos visuales con su alcance» (§7F) y buscar «confusiones
  entre objetos» (§13). Hoy el alcance está mal dicho en las dos direcciones:
  - Le quita al dibujo lo que sí muestra.
  - Le niega existencia a los largos.
  - No separa largos de enteros, que es justo lo que responde la pregunta de Peldaño («¿en cuántas lo
    parto?»: en ninguna).
- **Cómo comprobar la corrección:**
  - Reemplazar `:168` por algo como: «Los largos del dibujo existen: son el lado y la diagonal, y
    achicándolos no se termina nunca. Lo que no puede existir es una rayita que entre justo en los dos,
    porque con enteros no se baja para siempre. El dibujo dio la idea; la prueba es que esto vale para
    cualquier p y q enteros.»
  - Decir con palabras los dos datos que hoy pone el dibujo, en `:94` o en `:124`: «q cabe en p, porque
    p · p es más que q · q; y dos q se pasan de p, porque 2q · 2q es cuatro veces q · q».
  - Prompt de `:162`: «Si hubiera un par de enteros, ¿hasta cuándo se podría seguir?». En la rama
    «1 y 1»: «Eso es lo que hacen los enteros: tocan fondo. Y la cadena no puede tocar fondo. Las dos cosas
    no pueden pasar a la vez: no hay ningún par.»
  - Bitácora: «…habría otro par de enteros más chico, y otro, sin fin; y los enteros positivos no bajan sin
    fin. Entonces no hay ningún par.»
  - Revisión de texto: ninguna línea dice o sugiere que el lado o la diagonal «no existen».

### A2. 8.8: la sombra de la tarde se dibuja del lado del sol, y «mirando la sombra no se sabe la hora» es falso sin aclarar que es el largo

- **Dónde:**
  - `src/ch8/scenes-b.js:298` (tabla `SHADOW`).
  - `:320-323` (`setShadow`, siempre de `fx + 6` hacia la derecha).
  - `:335-337` (el sol va de izquierda, a la mañana, a derecha, a la tarde).
  - `:348` (Mara: «¿se puede saber la hora mirando la sombra?»).
  - `:350-356`: opciones, respuesta de la rama `both` («mirando la sombra, no se sabe cuál de las dos») y
    conclusión del estudiante.
  - Captura `c8-directa/037-snap-c8.sombras.png`, después de las 14 h: el sol está arriba a la derecha de
    Cornisa, y la sombra, una raya tenue de unos 90 px, también a la derecha (recorte propio).
- **Qué:**
  - **Física.** A la tarde (14 h y 16 h) el sol dibujado está a la derecha de Cornisa (`tx = fx + 140` y
    `fx + 280`) y la sombra se dibuja a la derecha: apunta hacia el sol, lo que es imposible. Además, a las
    12 el sol está justo encima en el dibujo de perfil (`tx = fx`) y la sombra mide 1 paso. En un dibujo de
    perfil, eso pide un sol fuera del plano, que nunca se menciona.
  - **La conclusión depende del error.** Como el juego dibuja la sombra de las 10 y la de las 14 idénticas
    (mismo largo y mismo lado), parece que «mirando la sombra, no se sabe cuál de las dos». En la realidad
    apuntan para lados opuestos (oeste a la mañana, este a la tarde): la sombra entera **sí** dice la hora.
    Así funciona un reloj de sol. La pregunta de Mara, la opción `both` («cada sombra dice su hora») y su
    respuesta están planteadas sobre «la sombra», no sobre su largo. Un estudiante que conozca un reloj de
    sol tiene razón al elegir `both`, y el juego le dice que no.
  - **Faltan las condiciones de la función.** «Dada la hora, hay una sola sombra» vale para un mismo día y
    lugar. El mismo reloj da otra sombra en julio que en diciembre, y otra en Salta que en Ushuaia (tabla
    abajo). Es la condición que el cap. 9 va a necesitar para hablar de dominio y de variables.
  - **Lo que sí es correcto.** Con el largo como única salida, en un día fijo, hora → largo es una
    función, y largo → hora no lo es: 2 pasos corresponde a dos horas. Eso es lo que hay que conservar.
- **Verosimilitud de los valores** (cálculo propio, hora solar):

  | Lugar y fecha | sombra/altura a las 12 | 10 h ÷ 12 h | 8 h ÷ 12 h |
  |---|---|---|---|
  | Juego | — | 2 | 4 |
  | Córdoba, principios de nov. o de feb. (decl. −11,7°) | 0,36 | 1,88 | 4,54 |
  | Buenos Aires, misma fecha | 0,42 | 1,69 | 3,91 |
  | Buenos Aires, equinoccio | 0,69 | 1,43 | 3,21 |
  | Buenos Aires, invierno | 1,60 | 1,32 | 4,06 |

  - 1 : 2 : 4 es verosímil, redondeado, para el centro del país a fines de primavera o en verano.
  - Con 1 paso a las 12, Cornisa mediría 2,4–2,8 pasos (≈ 1,8–2,1 m): aceptable.
  - Dos salvedades:
    - Vale en **hora solar**. En hora civil argentina la sombra más corta cae cerca de las 13, así que 10 y
      14 no son simétricas.
    - El sol del dibujo no es coherente con la tabla: de perfil daría 0 a las 12 y una razón 8 h/10 h
      ≈ 2,5.
- **Por qué importa:**
  - Es el gancho al cap. 9. El contrato pide «diferenciar una relación de una función y un gráfico de un
    dibujo decorativo» (§7G).
  - El dibujo inventa una propiedad que no existe (§2: «una metáfora visual debe aclarar una propiedad sin
    inventar otras»), y esa propiedad sostiene una conclusión falsa en su lectura natural (§13).
- **Cómo comprobar la corrección:**
  - `setShadow` tiene que dibujar la sombra **lejos del sol**: con signo opuesto a `tx − fx`. Prueba
    simple: extraer la dirección a una función y exigir `sign(sombra) = −sign(sol − fx)` para 8, 10, 14 y
    16. Verificarlo con capturas a las 10 y a las 14.
  - Cambiar «la sombra» por «el largo de la sombra» en `:348`, en las opciones y en `:355-356`. Por
    ejemplo: «Dada la hora, el largo es uno solo; un largo de 2 pasos puede ser a las 10 o a las 14».
  - Agregar una línea, de Cornisa o de Mara: «Si además miro para qué lado cae, sé si es de mañana o de
    tarde.» Es un buen puente al cap. 9: con dos datos (largo y lado), la vuelta vuelve a ser de una sola
    hora.
  - Decir «hoy» o «en un mismo día»: «Hoy, cada hora da un solo largo.»
  - Si el sol queda justo encima a las 12, correrlo un poco o decir que «está alto, pero no encima».

---

## MEDIA

### M1. 8.2: «A + B + C = 180°» suma las letras con que se nombran los vértices

- **Dónde:** `scenes-a.js:281`; los rótulos de vértice están en `:195-197` (A, B, C, junto a los puntos).
  Captura `c8-directa/013-snap-c8.vuelta.png`. Bitácora `scenes-b.js:393` («las tres puntas»: bien).
- **Qué:** en la pizarra, A, B y C nombran **puntos**, y la igualdad suma esas mismas letras. La notación
  escolar argentina distingue el vértice A del ángulo Â (o ∠A). El texto dice siempre «el ángulo de A», y
  la pizarra no.
- **Por qué importa:** §13 pide buscar «confusiones entre objetos y notaciones». Es la primera igualdad
  geométrica del juego, y el mismo capítulo usa letras para números (p, q, a, b, c). Un estudiante puede
  leer que «se suman los puntos».
- **Cómo comprobar:** escribir «Â + B̂ + Ĉ = 180°», o marcar los ángulos con un arquito y rotularlos
  aparte. Verificarlo en una captura del final de 8.2.

### M2. 8.3: en cinco de los nueve intentos equivocados, el marco no queda sobre la ventana; «No calza» no se ve

- **Dónde:** `scenes-a.js:374-403`, sobre todo `:381` (`tx = fits ? ox : ox + 4`) y `:386` (`wantOff`
  corre 63 · escala a la derecha siempre que haya giro o espejo). Evidencia: `c8-errores/state.json`,
  `copy-try {cand: 'flip', op: 'girar'}`.
- **Qué:** reproduje la posición final de las doce combinaciones (marco × operación) con la transformación
  real de `Shape`:

  | Marco | Operación | Dónde queda (respecto de la ventana, 0–63) | Solape |
  |---|---|---|---|
  | girado | dar vuelta | arriba: y de −63 a 0 | 0 % |
  | dado vuelta | girar | al costado: x de 67 a 130 | 0 % |
  | grande | girar | arriba a la derecha: x 130–256, y −126–0 | 0 % |
  | grande | dar vuelta | x 4–130, y 0–126, sin tocar la ventana | 0 % |
  | ancho | girar | arriba a la derecha | 0 % |
  | girado / dado vuelta / ancho | achicar | encima, más chico | 16–31 % |
  | ancho | dar vuelta | encima | 82 % |

  `wantOff` supone que todo giro es el de +90° del marco «girado». Con −90°, con espejo o con escala 2, el
  marco termina al lado de la ventana o encima de ella. El bot de errores probó «dado vuelta + girar»: el
  marco giró y quedó al costado, y apareció «No calza. Volvé a probar.».
- **Por qué importa:** congruencia es «se superpone exactamente». La consecuencia que el jugador tiene que
  poder comprobar (§5: «qué consecuencia permite comprobar su hipótesis»; §8) es ver que **no** se
  superpone. Hoy, para la mitad de los errores, el juego afirma «no calza» sin mostrar la comparación: hay
  que creerle.
- **Cómo comprobar:** después de la operación, trasladar el marco para que coincidan las esquinas de las
  cajas que contienen a las dos figuras, o un vértice distinguido, y no por un desplazamiento fijo. Repetir
  mi tabla con un script que importe la misma lógica: en todos los intentos fallidos, la figura transformada
  tiene que quedar encima de la ventana y la diferencia tiene que verse. Hacen falta capturas de al menos
  «dado vuelta + girar» y «grande + girar».

### M3. 8.3: la semejanza queda con nombres coloquiales y su definición no se pone a prueba

- **Dónde:** `scenes-a.js:393` y `:366` (rótulos), `:413`, `:415-420`; Bitácora `scenes-b.js:394`.
- **Qué:**
  - **Nombres.** Sólo aparecen «iguales» y «parecidas». «Parecida», en el habla común, es cualquier
    parecido: la ventana estirada también «se parece». Los nombres formales (congruentes, semejantes) no
    aparecen nunca, y tampoco «razón» o «escala».
  - **Inclusión.** Las categorías se presentan como excluyentes («igual», «parecida», «ni igual ni
    parecida»). Una figura congruente es semejante con razón 1; no se dice.
  - **La mejor prueba de la definición no se usa.** El marco «ancho» tiene **los mismos ángulos** que la
    ventana: todos rectos, salvo uno de 270°. No es semejante porque los lados (28, 42, 35, 21, 63, 63
    contra 56, 42, 70, 21, 126, 63) no son proporcionales. Es justo el ejemplo que muestra que «mismos
    ángulos» no alcanza en un polígono de más de tres lados. La definición correcta (ángulos **y** lados
    proporcionales) se da, pero nada la pone a prueba.
  - **Orden.** En la rama `area` (`:420`) se dice «cuatro ventanas como la tuya» (área × 4) una escena
    antes de que 8.4 lo muestre, y para una L, cuando 8.4 sólo lo muestra con cuadrados (ver M4).
- **Por qué importa:** §5 pide conectar con la notación formal y distinguir la interpretación errónea. El
  error típico es «parecida = se ve parecida» o «mismos ángulos = semejante».
- **Cómo comprobar:**
  - El estudiante dice una vez «semejante» (y «congruente») junto a la palabra de Cornisa.
  - Cuando el ancho vuelve a su lugar: «Tiene los mismos ángulos que tu ventana, todos rectos, y no es
    parecida: un lado se multiplicó por 2 y el otro no.»
  - En la Bitácora: «Las iguales también son parecidas, con × 1.»
  - Mover el «cuatro ventanas» de la rama `area` a una formulación que no dependa de 8.4 («ocupa más: el
    doble de ancho y el doble de alto»).

### M4. 8.4: la escala se muestra sólo con k = 2 y sólo en cuadrados y cubos, y se usa como ley general

- **Dónde:** `scenes-a.js:456-539`; `:537`; `:538`; Bitácora `scenes-b.js:394` («Con el lado × 2, el área
  va × 4 y el volumen × 8»); uso anticipado en 8.3 (`scenes-a.js:420`).
- **Qué:**
  - El diseño promete «longitudes ×k, áreas ×k², volúmenes ×k³». El juego hace un único caso: k = 2,
    huerta cuadrada y caja cúbica. El enunciado del estudiante («el área, dos veces… el volumen, tres») es
    general en la forma, pero no hay ni un segundo factor (×3: área ×9) ni una forma no cuadrada (la L de
    8.3, un triángulo) donde se ponga a prueba.
  - La ley se usa para la L en 8.3 antes de mostrarla. La Bitácora la deja como regla sin decir de qué
    figuras («el lado» supone que hay uno solo).
  - Además, Peldaño pregunta «¿Cuánta tierra **más** necesito?» (`:456`): lo que hace falta agregar son 12
    cuadros, tres huertas más. El prompt (`:468`) y la conclusión responden el total, cuatro huertas. Es la
    confusión clásica entre «cuatro veces» y «cuatro veces más».
- **Por qué importa:** §5 pide «una situación nueva que permita transferir sin repetir la misma secuencia»,
  y §7F pide conectar el argumento visual con su alcance. Con un solo caso se puede creer que «al
  duplicar, ×4 y ×8» es un dato suelto y no la regla de k².
- **Cómo comprobar:**
  - Un ítem breve de transferencia: con el lado × 3, ¿cuántas huertas? Se predice 9 y se ve en una
    cuadrícula de 3 × 3.
  - O la ventana de 8.3 agrandada: cuatro L chicas no la arman, pero cuadriculando, cada cuadradito se
    vuelve cuatro.
  - Corregir «¿cuánta tierra más?» a «¿cuánta tierra va a entrar?», o contestar las dos: «cuatro veces la
    de ahora: tres huertas más».

### M5. 8.6: «lo que queda libre en el medio es el cuadrado del tirante» se toma del dibujo; el paso que lo prueba es la suma de 8.2

- **Dónde:** `scenes-b.js:148-151`, `:193`, `:196-202` (la respuesta evaluada «el reacomodo no usó el 3 ni
  el 4»), `:206`; Bitácora `:395`. Captura `c8-directa/028-snap-c8.pitagoras.png`.
- **Qué:**
  - Que el hueco del medio tenga cuatro lados iguales (los tirantes) sale de los triángulos. Que sea un
    **cuadrado**, y no un rombo, exige que cada ángulo del hueco mida 90°.
  - En cada esquina del hueco se juntan, sobre un lado recto del cuadrado grande, los dos ángulos agudos de
    un triángulo y el ángulo del hueco: 180° − (α + β). Como α + β + 90° = 180° (8.2), α + β = 90°, y el
    hueco tiene ángulos de 90°.
  - Sin ese paso, el área del hueco no tiene por qué ser «tirante × tirante». El juego lo afirma porque se
    ve. Verifiqué que en el dibujo el ángulo mide 90,000°: el dibujo está bien, pero el dibujo no es la
    prueba.
  - La respuesta «el reacomodo no usó el 3 ni el 4» es cierta, pero sí usó el ángulo recto y la suma de 8.2.
    La rama `any` (`:206`) explica bien por qué hace falta el ángulo recto para encajar en las esquinas. No
    dice que también hace falta para que el hueco sea un cuadrado.
- **Por qué importa:** es casi literalmente el riesgo que nombra §7F («no presentar una animación sugestiva
  como prueba universal»). Está en el límite con ALTA. Lo dejo en MEDIA porque nada de lo dicho es falso, y
  porque el arreglo es una línea que además conecta dos escenas del capítulo, que es lo que pide el diseño.
- **Cómo comprobar:** después de `:151`, una línea del estudiante o de Punto: «¿Y cómo sé que es un
  cuadrado? En cada esquina del medio, las dos puntas finas del triángulo suman media vuelta menos la
  esquina recta: un cuarto de vuelta. Lo que queda también es un cuarto de vuelta.» Y en la Bitácora:
  «…reacomodando cuatro triángulos; el hueco es un cuadrado porque las dos puntas finas suman 90°».

### M6. 8.6 y la Bitácora: «a² + b² = c²» sin decir qué lado es c; «cuadros» como unidad de largo y de área

- **Dónde:** `scenes-b.js:208` («a² + b² = c²   (con ángulo recto)»), Bitácora `:395`; `:125` («Las patas
  miden 3 y 4 cuadros»), `:194` («25 cuadros»), `:209` («Cinco cuadros de tirante»).
- **Qué:**
  - Ni la pizarra ni la Bitácora dicen que c es el lado **opuesto al ángulo recto**, ni que a y b son los
    que lo forman. En el juego, «patas» y «tirante» son palabras de Balcón. Los nombres cateto e
    hipotenusa no aparecen. Quien abra la Bitácora en el cap. 10 lee una fórmula sin saber a qué lado
    aplicarla. El error escolar más común con Pitágoras es aplicarla con c en un cateto: 3² + 5² = c².
  - «Cuadros» mide largos (3, 4, 5) y áreas (9, 16, 25) en la misma escena. La escena anterior (8.5)
    acababa de separar las dos medidas con cuidado, usando tramos para el borde y cuadros para lo de
    adentro.
- **Por qué importa:** la Bitácora es la abreviatura que el jugador va a usar después (§5: «puede usar su
  abreviatura… debe poder desplegar su significado»). Una fórmula sin su condición completa es una
  restricción omitida (§13).
- **Cómo comprobar:**
  - Pizarra y Bitácora: «a² + b² = c², con ángulo recto entre a y b; c, el lado de enfrente (el tirante)».
    Nombrar una vez cateto e hipotenusa.
  - Para el largo usar «lados de cuadro» o «pasos», y reservar «cuadros» para el área: «las patas miden 3
    y 4 lados de cuadro»; «cinco de largo».

### M7. 8.7: sin transferencia; mismo 3-4-5 y las patas ya restadas en la opción

- **Dónde:** `scenes-b.js:270-287`, sobre todo `:272` («Siete: cuatro para el costado y tres para arriba.»)
  y `:286`.
- **Qué:**
  - Lo que esta escena tiene de nuevo respecto de 8.6 es calcular las patas desde las coordenadas, con
    negativos: 3 − (−1) = 4 y 2 − (−1) = 3. Es la distancia del cap. 3 en cada eje. El jugador nunca lo
    hace: una opción le da «cuatro» y «tres» hechos, y el triángulo es otra vez el 3-4-5 de la escena
    anterior. La respuesta «5» se puede recordar sin calcular nada.
  - El diseño pide «la distancia entre dos casas con Pitágoras». §5 pide que la práctica varíe «las
    relaciones y contextos, no solamente cambiar números»; acá ni siquiera cambian los números.
- **Por qué importa:** §13 nombra como objetivo de la revisión matemática la «ausencia de transferencia».
- **Cómo comprobar:**
  - Que el jugador cuente o elija las patas: «¿cuánto hay de −1 a 3 por la acostada?».
  - Usar otra casa con un triángulo distinto. En la cuadrícula actual (x de −1 a 5, y de −1 a 3), el único
    par de patas con distancia entera es 3 y 4. Hay dos salidas:
    - Una distancia no entera: de (−1, 3) a (5, −1) son √52, entre 7 y 8, en conexión con 8.1.
    - Una cuadrícula más grande: por ejemplo, 5-12-13.
  - Sacar los números de la opción «Siete».

### M8. 8.8: las conclusiones citan datos que el jugador puede no haber visto, y la rama `none` afirma de más

- **Dónde:** `scenes-b.js:344` (alcanzan 4 de las 5 horas); `:355` (rama `both`: «A las 10 y a las 14…»;
  rama `none`: «Cambia con la hora, y siempre igual: a las 12, la más corta.»); `:356`.
- **Qué:**
  - **Datos no vistos.** Si el jugador toca 8, 12, 14 y 16, o 8, 10, 12 y 16, su tabla no tiene el par
    10 h / 14 h. Lo que ve repetido es 4 pasos, a las 8 y a las 16. Igual, el estudiante concluye «2 pasos
    puede ser a las 10 o a las 14», con un dato que esa partida no anotó. Las dos partidas del bot tocaron
    8, 10, 12 y 14, así que la falla no se vio.
  - **La rama `none` afirma de más.**
    - «Siempre igual»: no es cierto, el largo cambia con la estación (tabla de A2).
    - «A las 12, la más corta»: sólo vale en hora solar; en hora civil argentina, la más corta cae cerca de
      las 13.
- **Por qué importa:** es el criterio de escena 5 («toda cantidad tiene origen en la historia») y el 11
  («la evidencia no puede probar más de lo que muestra»), en la conclusión que abre el cap. 9.
- **Cómo comprobar:**
  - Que la conclusión use el par que el jugador vio. Con la tabla de 4 horas siempre hay uno, porque sólo
    falta una hora: si falta 10 o 14, el par es 8 / 16.
  - O pedir las 5 horas.
  - En la rama `none`: «cambia con la hora, y hoy, a la hora del mediodía del sol, es la más corta».

### M9. Bitácora: atribuye de más, deja una frase agramatical y abrevia la prueba sin su cierre

- **Dónde:** `scenes-b.js:365-405`. Armé la Bitácora del commit en todas las ramas, y con la evidencia de
  las dos partidas.
- **Qué:**
  - Rama `coord-distance = measure` («Sin medir no se sabe»): «Entre (−1, −1) y (3, 2), derecho no son 7:
    son 5» (`:386`). Le atribuye un 7 que no dijo. Va contra el criterio 10 («sin atribuir de más»).
  - Rama `area-scale-predict = 4`: «Con el lado doble, anticipaste cuatro veces de tierra» (`:379`).
    Falta un artículo («cuatro veces la tierra»).
  - Párrafo 1 (`:392`): termina en «habría otro más chico, sin fin». No dice que eso es imposible con
    enteros, que es el cierre de la prueba (A1).
  - Párrafo 3 (`:394`): «Con el lado × 2, el área va × 4» (M4). Párrafo 4 (`:395`): «a² + b² = c²» sin c
    (M6).
  - No hay renglón de la sombra, pero el diseño la presenta como gancho y no como idea del capítulo, así
    que lo considero correcto.
- **Por qué importa:** §5 (la abreviatura que queda) y el criterio de escena 10.
- **Cómo comprobar:**
  - Una prueba que arme `writeJournal8` con evidencia sintética de todas las ramas, como hice yo, y revise
    estas frases.
  - Para `measure`: «Entre (−1, −1) y (3, 2) no hace falta medir: en línea recta son 5, como el tirante.»

---

## BAJA

- **B1.** 8.2, rama `no` («Con otro triángulo daría distinto»): no tiene respuesta propia (`scenes-a.js:249`
  sólo cubre `yes`). La paralela contesta igual, pero no se le habla al que eligió eso.
- **B2.** 8.2, lectura del dibujo:
  - «Arriba, sobre la paralela, quedan el de A, el de C y el de B» (`:280`). Los tres ángulos están
    **debajo** de la paralela, entre ella y los lados. «Sobre» se puede leer como «encima».
  - Después de recortar, los ángulos de A y de B ya no están marcados en el triángulo (se fueron a la recta
    de la derecha), y el jugador tiene que tocar «el ángulo de abajo en A» sobre una esquina sin marca
    (`c8-directa/011`).
  - El ángulo C, entre los dos azules, tampoco se marca.
- **B3.** 8.3, rótulos:
  - «igual (girada)» e «igual (dada vuelta)» se pisan: «igual (girada)gual (dada vuelta)» en
    `c8-errores/015` y `016`. Los rótulos se centran a 100 px de distancia, y cada uno es más ancho.
  - La nota del ancho, «sigue el doble de ancho que de alto donde no debe» (`:400`), es vaga. Mejor: «el
    ancho se multiplicó por 2 y el alto no».
- **B4.** 8.4: la respuesta para quien eligió «Dos cuadros más por lado: algo más» empieza con «Cuatro
  huertas, no dos» (`:494`). Contesta la opción del doble, no la suya.
- **B5.** 8.5:
  - «La cuadrada encierra más» (`scenes-b.js:86`) es correcto, también para lados no enteros: el máximo
    real es 3 × 3 = 9.
  - El juego no dice por qué se puede afirmar con tres casos: con tramos enteros **no hay más huertas**
    que 1 × 5, 2 × 4 y 3 × 3, y se probaron todas.
  - Es el contraste perfecto con 8.1: probar todos los casos es una prueba cuando son finitos, y no lo es
    cuando son infinitos. Hoy el capítulo afirma, con tres casos, justo después de decir que los casos no
    alcanzan.
- **B6.** 8.6:
  - El contraejemplo 4-5-6 (`:204-206`) sólo aparece en la rama `any`. El diseño lo pide para todos. Es
    un triángulo válido y acutángulo: el ángulo opuesto a 6 mide 82,8°.
  - Durante el reacomodo, en 4 de los 6 órdenes posibles, los triángulos se pisan a mitad de camino. Con el
    orden del bot (1 → 3 → 4), se superponen 2,2 y después 5,6 cuadraditos. Sólo los órdenes que empiezan
    por el triángulo 4 no se pisan. Contradice por un momento «los mismos cuatro triángulos».
  - «Lo libre tiene que ser lo mismo» (`:193`): conviene «medir lo mismo», porque la forma no es la misma.
- **B7.** 8.7: los mensajes armados con plantilla escriben el menos con guion ASCII: «Ese es (-1, 0)» y la
  etiqueta accesible «El cruce (-1, 0)» (`:251`, `:261`, `:266`). Los rótulos y diálogos fijos usan «−».
  §3 pide signos menos legibles.
- **B8.** 8.8:
  - La tabla de la pizarra dice «sombra 4» sin unidad. «Pasos» sólo aparece en la descripción y en la
    conclusión.
  - «Desde que entendí lo de las copias, mido mi sombra» (`:318`) es un vínculo que no se explica. Puede
    funcionar si se dice que la razón sombra/altura es la misma para cualquier cosa a la misma hora, que es
    semejanza. Hoy no se dice.
- **B9.** `logic/geometry.js`:
  - `compareShapes` (`:57-62`) decide «iguales» si los lados coinciden en orden, sin mirar ángulos. Un
    cuadrado y un rombo de lado 1 salen «congruentes» (lo comprobé). La prueba «copias: iguales y
    parecidas» (`geometry.test.mjs:46-50`) certifica ese criterio con rectángulos, donde los ángulos son
    iguales por casualidad. El juego no lo usa, pero contradice la definición que el juego enseña.
  - `thirdAngle` tampoco se usa.
  - `rearrange` no modela el estado «antes» (c²), así que la prueba «el reacomodo deja a² + b² libre» es
    una identidad algebraica, no el teorema.
- **B10.** Notación mezclada: «tirante × tirante» y «3 × 3» junto a «p · p» y «5 · 5 = 25». En el cap. 7
  se usaba «·».
- **B11.** 8.1: los cuadrados azules no tienen rótulo «q». Sólo están rotulados p, p − q y 2q − p
  (`c8-directa/006`), y el argumento habla de «los dos de q».

## Lo que está bien (para no perderlo al corregir)

- **8.1, cuentas.** Recalculé los casos de la pizarra con `nearMisses`:

  | q | p | p · p | 2 · q · q | Rótulo |
  |---|---|---|---|---|
  | 2 | 3 | 9 | 8 | sobra un cuadradito |
  | 3 | 4 | 16 | 18 | faltan 2 cuadraditos |
  | 5 | 7 | 49 | 50 | falta un cuadradito |
  | 7 | 10 | 100 | 98 | sobran 2 cuadraditos |
  | 12 | 17 | 289 | 288 | sobra un cuadradito |

  - Todos son correctos, y «casi p» coincide con q·√2.
  - Hasta q = 1000, `round(q√2)` es siempre el p que minimiza |p² − 2q²|.
  - «A veces uno solo» es cierto: (1, 1), (3, 2), (7, 5), (17, 12), (41, 29), (99, 70), (239, 169),
    (577, 408) y (1393, 985).
- **8.1, construcción.**
  - Lo pisado está en (P − Q, P − Q), con lado 2Q − P; las esquinas libres tienen lado P − Q; las áreas
    coinciden: 4842,47 y 4842,47.
  - Cada «más chico» es exactamente el cuadrado amarillo, con las esquinas como nuevos cuadrados de q
    (nivel 1: 69,59 y 49,21).
  - «Lo que se pisa dos veces tiene que ser igual a lo que quedó sin tapar» es el paso de áreas correcto, y
    está bien dicho.
  - El álgebra de `descend` es correcta: (2q − p)² − 2(p − q)² = −(p² − 2q²).
- **8.1, alcance y gancho.**
  - Las respuestas a «Ya se probaron mil» («el mil uno podría caer») y a «seguir probando» son buenas.
  - «1,414 … «casi»» separa el valor exacto de la aproximación (§7C).
  - El gancho del cap. 7 ya dice «partí el **lado**», y resuelve rev-mat-6 M9.
  - Se cumple la promesa del cap. 5 («la prueba llega más adelante»).
- **8.2, geometría.**
  - El triángulo mide 66,6°, 41,7° y 71,7°.
  - Los sectores recortados se calculan bien y cubren exactamente un semiplano.
  - Los dos ángulos azules en C son los alternos correctos: el izquierdo va de la dirección CA a la
    paralela, y el derecho, de la paralela a CB.
  - «Como una zeta» es la pista adecuada.
- **8.2, alcance.**
  - «Con este pasó; para saber si pasa con todos, hace falta una razón» y «Vimos uno» distinguen bien la
    evidencia de la prueba.
  - El límite de la esfera es correcto: no hay rectas paralelas, y los triángulos grandes suman más.
- **8.3.**
  - La L no tiene ninguna simetría (probé las ocho del cuadrado), así que «dado vuelta» no se alcanza
    girando: la clasificación no tiene ambigüedad.
  - Las tres operaciones correctas dejan los vértices exactamente sobre la ventana.
  - El ancho no es semejante (lados no proporcionales).
  - La reflexión cuenta como congruencia, que es lo correcto.
  - La definición de semejanza pide ángulos **y** proporción.
- **8.4.**
  - Las 4 huertas y las 8 cajas llenan exactamente la figura grande. Revisé los lugares en perspectiva
    caballera: el desplazamiento de profundidad k corresponde a una caja de profundidad s.
  - «El lado se multiplica una vez; el área, dos veces; el volumen, tres» es la explicación correcta del
    mecanismo.
- **8.5.**
  - 5, 8 y 9 son todos los rectángulos enteros de perímetro 12.
  - «Saber una no alcanza para saber la otra» es la idea justa.
  - Los distractores son los errores típicos.
- **8.6.**
  - Reacomodo verificado con la transformación real. Antes, lo libre es el cuadrado inclinado de lado 5 y
    nada se superpone. Después, lo libre es exactamente el 3 × 3 de arriba a la izquierda más el 4 × 4 de
    abajo a la derecha, y los triángulos forman dos rectángulos 3 × 4.
  - «Sin ángulo recto, no hay reacomodo» y «41 no es 36» declaran bien el alcance.
  - «Ir por las patas es más largo que ir derecho» contesta bien el 7.
- **8.7.**
  - El orden del par está bien trabajado, con una respuesta específica para (2, 3).
  - Los negativos son coherentes con el cap. 3.
  - El triángulo de patas 4 y 3 está bien dibujado; la distancia 5 es correcta.
- **8.8.** Con el largo como única salida y un día fijo, «cada hora, un solo largo; un largo, dos horas» es
  exactamente la diferencia entre función y relación que necesita el cap. 9. Los valores 1 : 2 : 4 son
  verosímiles para el centro del país a fines de primavera o en verano, en hora solar.
- **Historia.** Ningún texto visible atribuye nada a Pitágoras, a Babilonia ni a otros, como pedía el
  diseño.
- **Pruebas.** 77/77 pasan, y mis scripts confirman todas las igualdades escritas.

## Qué no pude verificar

- **El juego en un navegador.** No lo abrí, por la restricción del entorno. Todo lo de pantalla sale del
  código, de los logs y de las capturas del bot.
- **Las partidas son anteriores al commit.**
  - Los diálogos coinciden con `55e9eee`: verifiqué todas las líneas de los dos `log.txt` contra el commit;
    la única distinta es un texto armado con plantilla.
  - La Bitácora de los `state.json` es de una versión anterior. Por ejemplo, dice «Pensaste en seguir
    probando o en dar por probado con mil casos» y «fueron cuatro huertas, y cuatro, pero fueron ocho
    cajas», que el commit ya no tiene. Para la Bitácora del commit ejecuté su `writeJournal8` con la
    evidencia de esas partidas y con todas las ramas.
  - En `c8-errores/016` el rótulo dice «parecido (× 2)»; el commit dice «parecida (× 2)».
- **Ramas sin partida.** El bot no recorrió estas ramas; las revisé sólo en el código:
  - 8.1: `more` y `chalk`.
  - 8.2: `no`.
  - 8.3: `area`, y todas las operaciones equivocadas salvo «dado vuelta + girar».
  - 8.4: la opción `3`.
  - 8.6: `measure` y `only`.
  - 8.7: `measure`, y los toques equivocados salvo (2, 3).
  - 8.8: `none`, y cualquier combinación de horas distinta de 8, 10, 12 y 14.
- **La sombra de las 16 y la de las 8.** No hay capturas. La de las 14 se ve en `c8-directa/037`, tenue.
  La dirección la confirmé en el código.
- **Otros tamaños, entrada y audio.** No revisé `c8-telefono.out` ni las capturas táctiles, ni los cambios
  de encuadre de `2e43021`. Tampoco evalué audio ni teclado.
- **La referencia curricular de F.** No contrasté la cobertura con una referencia argentina: está
  pendiente en `ARITHMOS_CURRICULUM.md`.
- **Comprensión humana.** No hay playtests. Nada de esto certifica que alguien entienda.
