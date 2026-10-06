# Arithmos — revisión narrativa, de puesta en escena y accesibilidad (cap. 8 «Formas»)

Revisor independiente (rev-narr-6), 2026-10-06. No abrí navegador, no corrí el juego ni scripts de partida. Trabajé
con el código del commit, los logs de partidas automáticas y las capturas PNG que ya existían.

## Alcance, evidencia y advertencias

- **Código revisado: commit `55e9eee`.** Los números de línea son los del commit
  (`git show 55e9eee:experiments/arithmos/src/ch8/…`).
  - `ch8/chapter.js`, `common.js`, `scenes-a.js` (8.1–8.4) y `scenes-b.js` (8.5–8.8).
  - Costura de entrada: `ch7/scenes-b.js` 556–683 (7.9, gancho y `writeJournal7`).
  - Contexto: `ch7/scenes-a.js` (`studentWrites`, 7.1), `ch7/common.js` (`SHOTS`), `ch5/scenes-b.js` 425–500 (la
    diagonal de Peldaño), `engine/ui.js` (`note`, `describe`), `main.js` (`setHint`), `ending.js` (`chapterCard`).
- **El árbol cambió mientras revisaba.** Apareció el commit `2e43021` (14:59, «cap. 8 en teléfono»), que agranda los
  rótulos del mapa de 8.7 y cambia los botones de ancho de 8.5. Además hay trabajo sin commit del cap. 9. No reviso
  nada de eso como código; lo menciono sólo donde atenúa un hallazgo.
- **Contrato y diseño:** `docs/arithmos/ARITHMOS_MASTER.md`; `ARITHMOS_DESIGN.md` (premisa, tabla de Punto, «Capítulo 8
  — Formas» y los 12 «Criterios de escena»). Formato y recurrencias: `it07/review-narr/informe.md` (rev-narr-5).
- **Partidas** (bot, no personas):
  - `it08/c8-directa` (1600×900): de 8.1 al título, capturas 001–041.
  - `it08/c8-errores` (1600×900): ruta con errores, capturas 001–044.
  - `it08/c8-telefono` (844×390, táctil): ruta directa con el código del commit. Terminó con dos errores de botones
    superpuestos («ancho 1» tapa a «ancho 2», «ancho 3» tapa a «ancho 4»).
  - `it08/c8-telefono2` y `it08/c8-casas-tel`: 8.5–8.8 con `2e43021`. Las uso sólo como apoyo.
  - `it08/c7-errores2`: única partida que cruza la costura 7→8 (capturas 047 y 048).
  - Las partidas de 1600×900 son de las 14:53 y 14:55, y el commit es de las 14:56. Hay dos diferencias menores de
    texto entre las capturas y el commit: «igual (girado)» y «parecido (× 2)» en las capturas, contra «girada» y
    «parecida» en el código. El resto del texto de los logs coincide con el código.
- Los logs muestran **qué se dice y en qué orden**, no el ritmo.

## Lo que funciona (para calibrar)

- **El capítulo tiene una idea propia y la sostiene: el alcance de un argumento.** Las cuatro afirmaciones fuertes
  declaran hasta dónde valen:
  - √2: «vale para todos los p y q a la vez» (`scenes-a.js:168`);
  - 180°: «En un plano… Sobre una pelota, un triángulo grande suma más» (`:282`);
  - Pitágoras: «con ángulo recto», con contraejemplo en una rama (`scenes-b.js:203-208`);
  - la sombra: dependencia en un solo sentido (`:356`).

  Es exactamente el apartado F del contrato: conectar argumentos visuales con su alcance.
- **Honestidad sobre el dibujo:** «El dibujo está hecho con medidas que no existen: no prueba nada. Lo que prueba es el
  razonamiento» (`scenes-a.js:168`). Pocos juegos educativos se animan a decirlo.
- **Callbacks que funcionan:**
  - las «dos rectas como la del pozo» y el «(−1, −1) del otro lado de los dos ceros, como el pozo» (`scenes-b.js:231`,
    `:265`), del cap. 3;
  - «Media vuelta es lo que gira Punto para mirar para atrás» (`scenes-a.js:242`), del × (−1) del cap. 4;
  - el «12» de Peldaño es uno de los valores que el jugador puede probar en 8.1, y da 289 contra 288.
- **Dos interacciones con decisión real:**
  - **8.7:** ubicar una casa entre 35 cruces, con una nota específica para (2, 3) (`scenes-b.js:261`). El bot de
    errores la pisó y la nota correspondía.
  - **8.3:** elegir qué operación hacerle a cada marco, con una consecuencia que se ve (calza o vuelve).
- **Las familias usan el resultado en tres escenas:**
  - Peldaño: «en la puerta pinto 1,414, y al lado: "casi"» (`scenes-a.js:169`);
  - Cornisa: «El ancho no lo quiero: estirado de un solo lado ya no es mi ventana» (`:421`);
  - Balcón: «Cinco cuadros de tirante. Y sin medir.» (`scenes-b.js:209`).

  Era la propuesta de M2 de rev-narr-5.
- **Mara pregunta y no define:** «Con la tabla, ¿se puede saber la hora mirando la sombra?» (`scenes-b.js:348`).
- **Un plano nuevo:** `SHOTS.shadow` en 8.8 es el primer encuadre fuera de la pizarra en dos capítulos.
- **Legible a 1600×900** en la mayoría de los rótulos: la tabla de la cerca, «3² + 4² = 5²», las coordenadas y
  «A + B + C = 180°» (`c8-directa/025`, `030`, `033`, `013`).

## ¿Repite el cap. 8 los problemas señalados antes?

| Problema (rev-narr-2 a 5) | En el cap. 8 | Dónde |
|---|---|---|
| Escenas en plantilla, desfile de vecinos, nada se acumula | **Sí, igual.** Ocho escenas, siete con la misma apertura y el mismo par de planos | A1 |
| Cuestionario encadenado | **Sí, peor.** 11 elecciones evaluadas (cap. 7: 9); tres escenas con dos | A2, M2 |
| El juego hace el paso decisivo; botón único; único hueco | **Sí** | A2 |
| Punto oyente, sin error ni evolución | **Peor.** No habla, no se equivoca, no actúa | A3 |
| Marea sin apuesta | **Peor.** No aparece: sólo se la nombra | A4 |
| Texto y cuentas que contradicen la imagen | **Sí** | A5 |
| Tamaños en teléfono | **Sí** (el bot terminó, con dos botones superpuestos) | A6 |
| El estudiante como profesor, «Nombre:» | **En parte.** 7 líneas con vocativo (cap. 7: 9); concluye las ocho escenas | M1 |
| Opciones que se delatan | **Sí, ahora con patrón aprendible** | M2 |
| Costura de entrada | **Mejoró el texto** («partí el lado»); sigue sin imagen y Peldaño repite su línea | M3 |
| Gancho al capítulo siguiente | **Sí.** Resuelve la idea del cap. 9 y nombra su título | M4 |
| Hablante cortado en el plano `tiles`; sin primer plano | **Sí** | M5 |
| `studentWrites` mudo, botones sin verbo, amarillo que no es de Punto | **Sí** | M6 |
| Bitácora como boletín | **Sí** | M7 |
| Subtítulo de una escena sobre la siguiente (B1), aviso de Bitácora en título (B2), «Ø» (B4) | **Sí, regresan** | B1–B3 |
| «Como dije» | No | — |

---

## Hallazgos ALTOS

### A1. Ocho vecinos, ocho problemas, el mismo plano: el hilo de la diagonal se cierra en una escena de plantilla y el capítulo no tiene clímax

- **Dónde:**
  - **La misma apertura.** Siete de ocho `setup` hacen `boardCast` + `SHOTS.board`, y cada `play` hace
    `d.shot(SHOTS.board, 1)` y después `d.shot(SHOTS.tiles, 0.8)`:
    - `scenes-a.js:23/30/35`, `186/191/216`, `300/305/327`, `450/455/470`;
    - `scenes-b.js:22/27/34`, `119/124/141`, `225/230/242`.

    Las aperturas `c8-directa/001`, `008`, `014`, `017`, `023` y `032` son casi idénticas a las del cap. 7. No se usan
    nunca `SHOTS.close` ni `SHOTS.wide`.
  - **La misma secuencia:**
    1. Un vecino trae un problema: Peldaño, Cornisa, Cornisa, Peldaño (más Mara), Rampa, Balcón, Mara y Cornisa.
    2. Una o dos predicciones de menú.
    3. Un gesto.
    4. El estudiante concluye.
    5. Una coda.
  - **Nada se acumula.** Cada `setup` hace `clean(g, /^c8-/)` (`common.js:29-32`). Desaparecen sin que nadie los
    borre en el mundo:
    - el «√2 no es una fracción»;
    - la paralela;
    - la ventana de Cornisa;
    - la tabla de la cerca;
    - el mapa.
  - **Los contextos se repiten.** La huerta otra vez: el cuadro de 8.1, la huerta de Peldaño en 8.4 y la de Rampa en
    8.5. Es lo que A1 de rev-narr-5 marcó con cuatro huertas en el cap. 7.
- **Qué:**
  - **No hay hilo dramático.** Las escenas no se necesitan entre sí.
  - **El cierre más fuerte del juego se gasta en una escena común.** La diagonal viene del cap. 5 («Que ninguna,
    nunca, entre justo, se puede probar», `ch5/scenes-b.js:488`), pasa por el cap. 7 y se resuelve en 8.1: la primera
    demostración por el absurdo del juego. Ocurre en la escena 1, con el mismo plano y el mismo tono que la tabla de
    sombras, sin nada en juego.
  - **El capítulo termina en una tabla y una pregunta** (8.8).
  - **No hay humor, emoción ni respiro.** Para el bot, las ocho escenas duran entre 5 y 13 s (`c8-directa/log.txt`).
    Todas tienen el mismo tono de consulta.
- **Por qué importa:**
  - Contrato §4: «Cada escena necesita un propósito dramático» y hay que alternar «descubrimiento, descanso, humor y
    emoción».
  - Contrato §13: buscar «momentos que parezcan una plantilla educativa».
  - Es la cuarta revisión seguida que lo marca (A2/A6 de rev-narr-4, A1 de rev-narr-5) y la forma se volvió todavía
    más regular.
- **Propuesta (reversible, sin sistemas nuevos):**
  - **Un hilo que el capítulo ya insinúa: rehacer las Terrazas después de la Marea.** Los materiales ya están en el
    texto:
    - las tejas (8.2);
    - la ventana (8.3);
    - la huerta y la caja (8.4);
    - la cerca (8.5);
    - el tirante de la «escalera nueva» (8.6), que es la escalera que la Marea se llevó en 7.2;
    - el camino entre las casas (8.7).

    Cada escena deja su pieza **dibujada en las Terrazas, no en la pizarra**, y la pieza no se borra entre escenas.
  - **El clímax es la diagonal.** Reordenar: 8.6 (Pitágoras) antes que la prueba. Con patas 1 y 1, el tirante cumple
    tirante × tirante = 2, y eso planta p · p = 2 · q · q con algo que el jugador acaba de demostrar, en vez de con
    una frase. La prueba de que √2 no es fracción cierra el capítulo, con la Marea (A4).
  - **Variar el plano de apertura en al menos tres escenas:**
    - un plano de dos para plantear (vecino y estudiante);
    - `SHOTS.wide` para las Terrazas que se reconstruyen;
    - `close` para la conclusión de la prueba.
  - Sacar al menos una huerta. 8.5 puede ser el corral de Rampa o la cerca de la escalera.
- **Cómo comprobarlo:**
  - en `c8-directa`, al menos tres encuadres de apertura distintos;
  - una captura final con piezas de cuatro escenas anteriores visibles en las Terrazas;
  - la prueba de 8.1 en la última o penúltima escena del log.

### A2. El paso decisivo lo dan el juego o el estudiante: botones que se repiten, piezas que van a su único lugar y 11 predicciones

- **Dónde y qué, escena por escena** (contrato §8: «no conviertas todo en arrastrar piezas al único hueco compatible»;
  criterios 1 y 2):
  - **8.1, la prueba:**
    - El modelo entero lo enuncia el estudiante en la primera línea, antes de que el jugador haga nada (`:32-33`): «la
      diagonal mediría p de esas rayitas… el cuadrado del lado tendría q · q cuadraditos… p · p = 2 · q · q».
    - Los dos cuadrados de q van solos a su esquina fija (`targets`, `:98`).
    - La inferencia central la dicen el estudiante y un pensamiento: lo pisado dos veces es igual a lo que queda sin
      tapar, y por eso hay un par entero más chico (`:123-124`).
    - «más chico» es un botón único que se toca dos veces (`:131`).
    - El jugador elige q de una lista y contesta dos menús.
  - **8.2:**
    - «Tocá cada punta… se recorta y va a la línea» (`:221`). El juego las pone en orden y giradas (`acc`, `:217-232`),
      así que no se puede armar mal ni ver que no cierran.
    - La paralela la traza el juego (`:252-253`).
    - El ángulo alterno es una elección entre dos («A» o «B», `:274-277`) y la ayuda nombra el lado AC (`:264`).
  - **8.4, el «momento»:** «otra huerta como la de ahora» ×4 (`:477`) y «otra caja» ×8 (`:519`). Son doce toques del
    mismo botón y cada pieza va a su lugar fijo (`spots4`, `slots`). Hay dos predicciones evaluadas en la escena
    (`:464-468`, `:506-510`).
  - **8.5:** el jugador elige un ancho y el juego arma la cerca (`scenes-b.js:63`). Nunca maneja los doce tramos: el
    diseño decía «armar huertas rectangulares».
  - **8.6, el «momento»:**
    - El estudiante propone la construcción, que es el paso creativo (`:140`).
    - Los tres triángulos van a su único destino (`after`, `:146`).
    - La ayuda anticipa el resultado: «quedan de a dos, formando rectángulos. El cuadrado grande no cambia» (`:156`).
    - La idea («lo libre tiene que ser lo mismo») es un pensamiento (`:193`).
    - Hay dos predicciones evaluadas (`:133-137`, `:196-200`).
  - **8.7:** la transferencia a Pitágoras la hace el estudiante: «Es el tirante de Balcón: patas 4 y 3» (`:286`). El
    jugador sólo eligió «Cinco», y las patas las dibuja el juego (`:278-283`).
  - **8.8:** cuatro toques de hora. El número de la sombra lo escribe el juego (`:340`), y el jugador no mide nada.
  - **En total:** 11 `d.choose` con `evaluate: true`, contra 9 en el cap. 7. 8.1, 8.4 y 8.6 tienen dos cada una
    (criterio 1: «A lo sumo una predicción por escena»).
- **Por qué importa:**
  - El verbo es COMPRENDER y el contrato §5 pide que el jugador pueda «observar, predecir y modificar».
  - En este capítulo predice. Lo que se modifica lo modifica el juego, y lo que se infiere lo infiere el estudiante.
  - Las dos escenas marcadas como «momento» (8.4 y 8.6) son las de gesto más pobre.
- **Propuesta (una por escena):**
  - **8.1:** que el jugador arrastre cada cuadrado de q a la esquina que quiera, también uno encima del otro. Con dos
    esquinas opuestas aparece el cuadrado pisado y quedan dos sin tapar. Después, que el jugador **elija** con qué
    comparar: «lo pisado dos veces = ¿qué?», tocando las dos esquinas libres. El estudiante sólo dice la conclusión.
  - **8.2:** que cada punta se arrastre a la línea y se gire con un toque. Si quedan separadas o encimadas, se ve el
    hueco o el pedazo de más. Aceptar cualquier orden.
  - **8.4:** una sola predicción. Para el área, que el jugador **dibuje** con un arrastre el cuadrado de lado doble
    sobre la cuadrícula; los cuadros aparecen contados. Para el volumen, el jugador apila las cajas donde quiere y la
    escena termina cuando la caja grande está llena.
  - **8.5:** doce tramos sueltos que el jugador coloca, recto o doblando. Cualquier rectángulo cerrado vale y se anota;
    uno abierto no encierra nada.
  - **8.6:** que el jugador elija qué triángulos correr y adónde, entre las cuatro esquinas, sin la ayuda que anticipa
    el resultado. Sacar la segunda predicción o llevarla a 8.7.
  - **8.7:** que el jugador trace el camino de Peldaño. Primero por las rectas (7 pasos), después derecho; el juego
    sólo mide. Ver A3 para hacerlo con Punto.
  - **8.8:** que el jugador cuente los pasos de la sombra sobre una regla de tiza en el piso y escriba el número.
- **Cómo comprobarlo:**
  - ≤ 6 elecciones evaluadas en el log;
  - ninguna escena con dos;
  - en `c8-errores`, una captura de 8.1 o 8.2 con un armado que no cierra, hecho por el jugador;
  - ningún `wordSpot` que se toque más de dos veces seguidas.

### A3. Punto desaparece como personaje: no habla, no se equivoca, no actúa

- **Dónde:** todo lo que Punto hace en el capítulo es:
  - dos pulsos con sonido de pregunta (`scenes-a.js:156-157`, `scenes-b.js:359-360`);
  - un sonido de «no» cuando un marco no calza (`scenes-a.js:399`).

  No tiene ninguna línea (`d.say('punto'` no aparece), ningún error, ninguna corrección y ningún `flag`. El estudiante
  le habla una vez («Punto: si hubiera un par…», `:166`) y lo nombra otra («lo que gira Punto», `:242`). En las
  capturas está siempre en el mismo lugar, junto al estudiante.
- **Qué:**
  - Es un retroceso respecto del cap. 7, donde Punto proponía duplicar, se ponía triste y contento, y se equivocaba
    dos veces (rev-narr-5, «Lo que funciona»).
  - El diseño ubica en los caps. 7–11 su estado «Plano / curva»: «percibe dependencias, cambio», «dibuja relaciones»,
    «anticipa con el jugador» (`ARITHMOS_DESIGN.md`, tabla de Punto). Nada de eso aparece.
  - El criterio 4 («Punto se equivoca de verdad al menos una vez por capítulo y se corrige él mismo») no se cumple.
- **Por qué importa:**
  - Contrato §4: el acompañante «Debe adquirir identidad y evolucionar… cambia cómo percibe, se expresa y se
    relaciona».
  - En un capítulo de formas y recorridos, Punto, que desde el cap. 3 es un trazo con estela, es la herramienta
    natural. Sin él, el capítulo es el estudiante dando una clase a los vecinos.
- **Propuesta (cada una con un error real o un gesto propio):**
  - **8.5, el error de Punto desde el cap. 1:** «la fila más larga tiene más». Que Punto, no un menú, sostenga «misma
    cerca, misma tierra» y arme él la huerta de 1 × 5 orgulloso. El jugador arma otra al lado y Punto mira las dos,
    borra su «igual» y escribe «≠». Fijar `g.flags.puntoFence`.
  - **8.2:** Punto se para en la línea y da media vuelta para mirar atrás, dejando estela: el arco de 180° es su
    recorrido, y las tres puntas lo llenan.
  - **8.7, su rasgo de trazo:** Punto va de lo de Peldaño a lo de Rampa. El jugador le marca el camino; primero hace la
    ele (4 y 3) y deja su estela, después va derecho. Las dos estelas quedan y se comparan: 7 contra 5. Es el primer
    «dibuja relaciones».
  - **8.8, el anticipo del cap. 9:** Punto quiere adivinar la hora mirando la sombra, dice «¡las 10!» con 2 pasos y
    eran las 14. La consecuencia la ve él. Hoy el error lo carga una opción de menú (`:351`).
- **Cómo comprobarlo:**
  - ≥ 2 líneas o notas de Punto en el log;
  - un `describe` de Punto corrigiéndose sin una línea previa del estudiante;
  - un flag nuevo de Punto en `state.json`.

### A4. La Marea no aparece: sólo Mara la nombra en 8.7

- **Dónde:** la única mención es «La Marea borró el camino entre las casas» (`scenes-b.js:231`). No hay pasada ni
  borrado; el `g.audio.erase` de `scenes-a.js:231` es el sonido de recortar las puntas. En `c8-directa/032` la pizarra
  está vacía mientras Mara lo cuenta, y no se ve ningún camino borrado.
- **Qué:**
  - El criterio 6 dice que «La Marea aparece una vez por capítulo: borra lo que no se entiende; lo entendido resiste».
    El cap. 7 lo cumplía en su forma mínima (rev-narr-5, M3); el cap. 8 no lo cumple.
  - El capítulo desperdicia su mejor ocasión: **su tema es que un dibujo no prueba y un argumento sí.** Es la premisa
    de la Marea dicha con otras palabras.
- **Por qué importa:**
  - La premisa del diseño es «Lo que nadie entiende, el borrador se lo lleva». Sin Marea el capítulo no tiene riesgo
    ni fuerza externa.
  - Es la tercera revisión seguida que pide que la Marea obligue a decidir (A1 de rev-narr-4, M3 de rev-narr-5).
- **Propuesta (eligiendo una de dos):**
  - **8.7, mostrar lo que se cuenta.** La escena abre con la pasada del borrador sobre el camino y las casas, en
    `SHOTS.wide`. Lo que resiste es el registro de Mara con pares de números. Reconstruir el lugar con «(3, 2)» es
    literalmente «lo comprendido resiste».
  - **Cierre de la prueba de √2 (si se reordena, A1).** La Marea pasa sobre la pizarra:
    - se lleva los cuadrados de prueba (49 contra 50, 289 contra 288) y el dibujo de los cuadrados «que no existen»;
    - deja tenue y legible el argumento escrito («si hubiera un par, habría otro más chico»).

    Es la puesta en imagen de la línea de `:168`.
- **Cómo comprobarlo:**
  - una captura a mitad de la pasada;
  - un `describe` que diga qué resistió y por qué;
  - una captura posterior con el argumento tenue y el dibujo borrado.

### A5. El texto y la imagen se contradicen: la sombra no se ve y va para el lado del sol, las cajas no se cuentan y los rótulos se pisan

- **8.8, la sombra:**
  - **No se ve.** Es un trazo blanco de 7 u sobre la línea del piso, con `p: 0.55` y `z: 2` (`scenes-b.js:320-323`).
    En `c8-directa/037` y en su recorte se confunde con el piso: la escena de medir la sombra no tiene sombra visible.
  - **Va siempre a la derecha** (`fx + 6 + len * 40`). A las 14 y a las 16 el sol está a la derecha de Cornisa
    (`tx = fx − 420 + t · 840`, `:337`), así que la sombra apunta hacia el sol. La captura `037` es justo a las 14:
    sol a la derecha.
  - **El largo no sale del dibujo.** Viene de una tabla fija (`SHADOW`, `:298`) y la posición del sol no lo
    determina, así que dibujo y número pueden no coincidir.
  - **La conclusión cita horas que el jugador puede no haber probado.** Se prueban 4 de 5 horas (`:344`), pero el
    estudiante dice siempre «2 pasos puede ser a las 10 o a las 14» (`:356`), y lo mismo el pensamiento de `:355`.
    Si el jugador saltó las 10, el pizarrón muestra otro par (8 y 16).
- **8.4, las cajas:** las ocho cajas son cubos de alambre amarillos encimados (`cube`, `:431-441`). En `021` y `022`
  son una maraña: no se distinguen «cuatro abajo y cuatro arriba», que es justo lo que dice el pensamiento, y la caja
  grande blanca queda tapada.
- **8.2, la paralela:**
  - La paralela sale por el borde izquierdo de la pizarra (`010`–`013`).
  - El ángulo azul de la derecha de C es casi invisible: sus dos lados coinciden con la paralela y con CB, y sólo queda
    un arco de 34 u.
  - El estudiante dice «quedan el de A, el de C y el de B, uno al lado del otro» (`:280`), pero en la imagen se ve uno
    solo.
- **8.3, rótulos encimados:** «igual (girada)» e «igual (dada vuelta)» quedan pegados en una sola línea: en la captura
  se lee «igual (girada)igual (dada vuelta)» (`c8-errores/016`, `c8-directa/015`). Los dos están centrados a 100 u de
  distancia (`:394`) y miden más que eso. Además, el primero cae sobre el borde superior del marco grande.
- **8.7, rótulos encimados:** «Peldaño» se pisa con el «−1» del eje parado (`034`). `2e43021` agranda los dos rótulos
  (de 15 a 19–21), así que es probable que empeore.
- **8.5, una rama que dice lo que no se vio:**
  - El pensamiento usa todas las huertas posibles (`all`) y no las probadas: «la tierra va de 5 a 9» (`:86`).
  - El estudiante escribe «áreas 5, 8, 9» (`:88`).
  - Si el jugador probó 2, 3 y 4, el pizarrón muestra 8, 9 y 8.
- **8.4 contra 7.1:** Peldaño dice «Mi huerta es de dos por dos cuadros» (`:456`). En 7.1 tenía nueve cuadros (3 × 3)
  y una de dos (`ch7/scenes-a.js:53`, `:92`). Es la tercera huerta de Peldaño, sin origen (criterio 5).
- **8.1 contra 7.1:** en 7.1 Peldaño pintó «raíz de dos» en la puerta (`ch7/scenes-a.js:162`). En 8.1, después de
  probar que √2 no es fracción, decide pintar «1,414, y al lado: "casi"» (`:169`): cambia el nombre exacto por la
  aproximación. El contrato (C) pide «Distinguir valor exacto de aproximación».
- **8.6:** el «?» amarillo del tirante sigue en el pizarrón después de que el tirante mide 5 (`030`).
- **Por qué importa:**
  - Criterios 5 y 8 («si dos cosas valen lo mismo, miden lo mismo»); contrato §2: «una metáfora visual debe aclarar
    una propiedad sin inventar otras».
  - Una sombra que va hacia el sol inventa una propiedad falsa en la escena que prepara el cap. 9.
  - Es la misma clase de falla que A3 de rev-narr-5 y A4 de rev-narr-4.
- **Propuesta:**
  - **8.8:**
    - la sombra, una banda rayada (no un trazo sobre el piso), del lado opuesto al sol y con marcas de paso;
    - el sol en una posición compatible con la tabla (o sólo su dirección, una flecha de rayo que pasa por la cabeza
      de Cornisa y toca el piso donde termina la sombra);
    - que la conclusión use el par que el jugador generó.
  - **8.4:** dibujar sólo el frente de las cajas ya puestas y la línea de las cuatro de arriba, o apilarlas en dos
    pisos separados («abajo» y «arriba») que después se juntan.
  - **8.2:** la paralela dentro del área. Marcar los tres ángulos sobre la paralela (A copiado, C, B copiado) con arcos
    de radios distintos, que no dependan sólo del color.
  - **8.3:** rótulos debajo de cada marco, sin centrarlos en un espacio menor que su ancho.
  - **8.7:** el rótulo de la casa a la derecha y arriba cuando el cruce está en el borde.
  - **8.5:** usar `tried` y no `all` en el pensamiento y en lo escrito.
  - **8.4:** «La huerta nueva que quiero hacer, de dos por dos», o usar la de nueve de 7.1 (lado 3 → 6, 9 → 36).
  - **8.1:** «Dejo √2 en la puerta. Y si alguien pregunta cuánto es, abajo: 1,414 y "casi"».
  - **8.6:** reemplazar el «?» por «5».
- **Cómo comprobarlo:**
  - captura de 8.8 a las 14 con la sombra visible y del lado opuesto al sol;
  - captura del final de 8.4 con 8 cajas contables;
  - capturas de 8.3 y 8.7 sin rótulos encimados;
  - `grep 'va de 5 a 9'` sin resultados fijos.

### A6. En teléfono (844×390) las figuras y tablas sobre las que se predice no se leen, y los blancos son chicos

- **Dónde** (`c8-telefono`, código del commit; tamaños medidos a ojo sobre las capturas):
  - **8.1:**
    - la línea «en 5: la diagonal, casi 7. 7 · 7 = 49 …» mide ≈ 8–9 px y los cuadraditos ≈ 3–4 px (`002`);
    - la predicción «¿Hasta cuándo se puede seguir achicando?» se hace con la pizarra de ≈ 210 px de ancho y los
      cuadrados de la bajada de ≈ 5–25 px, con «2q − p» ilegible (`005`).
  - **8.2:** las letras A, B y C miden ≈ 7 px y los ángulos azules de C ≈ 10 px (`011`). El jugador tiene que tocar
    «el ángulo de abajo en A» con un blanco de 60 × 44 u.
  - **8.3:** la elección «¿Qué tiene igual una copia parecida?» se hace con los marcos de ≈ 15–30 px (`015`).
  - **8.5:** la tabla de la cerca mide ≈ 8 px (`025`). El commit dejó «ancho 1» sobre «ancho 2» y «ancho 3» sobre
    «ancho 4» (`summary.json`, `errors`). `2e43021` lo corrige.
  - **8.6:** «3 × 3» y «4 × 4» miden ≈ 5 px (`029`).
  - **8.7:**
    - los números de los ejes miden ≈ 6–7 px (`033`);
    - los cruces son blancos de 36 u, unos 30 px en pantalla;
    - la predicción de la distancia se hace sobre el mapa en plano general, con la pizarra de ≈ 210 px. Sigue igual con
      `2e43021` (`c8-telefono2/012`).
  - **8.8:** la tabla de sombras mide ≈ 5 px (`037`, `038`) y Cornisa ≈ 25 px de alto. La pregunta «¿La sombra dice la
    hora?» se hace sobre una tabla que no se puede leer.
- **Por qué importa:**
  - Contrato §3: «signos menos, fracciones, exponentes… ejes y etiquetas deben distinguirse sin esfuerzo».
  - Contrato §9: «Verificá… disposición táctil».
  - Es A5 de rev-narr-5 y M10 de rev-narr-4: tercera vez, ahora en todas las escenas del capítulo.
- **Propuesta:**
  - Toda elección se hace con la figura en el plano en que se lee: `d.shot(SHOTS.tiles)` **antes** de `d.choose`.
    En 8.8, un inserto de la tabla.
  - Mínimo de 12 px en pantalla para rótulos y exponentes, medido en el plano en que aparecen. Que la guarda de
    `ui.js`, que ya detecta botones superpuestos, mida también el tamaño de los rótulos y haga fallar la partida.
  - Blancos de ≥ 44 px en pantalla. En 8.7, ampliar el mapa a la pizarra entera en teléfono, o elegir columna y fila
    con dos gestos.
- **Cómo comprobarlo:** capturas de teléfono de 8.1 (`005`), 8.7 (elección) y 8.8 (elección) con todo texto ≥ 12 px,
  y `summary.json` sin errores.

---

## Hallazgos MEDIOS

### M1. Voces: el estudiante concluye las ocho escenas y define; Mara cierra el capítulo; los vecinos traen enunciados de segunda mano

- **Dónde:**
  - **El estudiante:** 16 líneas en voz alta y 20 pensamientos. Concluye en las ocho escenas. Siete líneas empiezan
    con vocativo:
    - «Punto:» (`scenes-a.js:166`);
    - «Cornisa:» (`:280`, `:413`; `scenes-b.js:356`);
    - «Peldaño:» (`scenes-a.js:538`);
    - «Rampa:» (`scenes-b.js:87`);
    - «Balcón:» (`:194`).
  - **Define por decreto:** «Si la vuelta entera se parte en 360 partes, los grados, media vuelta son 180»
    (`scenes-a.js:242`).
  - **La exposición del arranque de 8.1** (`:32-33`) son dos líneas de álgebra antes de cualquier imagen.
  - **Cinco escenas terminan sin que la familia use el resultado:**
    - 8.2: Cornisa no vuelve a sus tejas;
    - 8.4: Peldaño no dice cuánta tierra pide;
    - 8.5: Rampa no elige su huerta;
    - 8.7: Peldaño y Rampa no reaccionan;
    - 8.8: Cornisa no dice qué hará con la tabla.
  - **Problemas traídos de segunda mano:**
    - «El carpintero dice…» (`scenes-a.js:192`), un personaje que no existe;
    - Mara trae «la caja de atados de Cornisa» con Cornisa fuera de escena (`:496`);
    - Mara «Una noche probé hasta mil» (`:74`), una tarea que nunca se le vio y que sirve sólo para alimentar la
      opción «mil no son todos».
  - **Mara cierra el capítulo** con una frase de tema: «Que una cosa dependa de otra… eso hay que mirarlo con cuidado»
    (`scenes-b.js:358`). El criterio 3 dice que Mara «no define ni cierra».
- **Por qué importa:**
  - Criterio 3. Contrato §4: el guion debe «funcionar para un adolescente y resultar interesante para un adulto», y
    vecinos que sólo enuncian suenan a libro de texto (rev-narr-5, B12).
- **Propuesta:**
  - Vocativos ≤ 3 en el capítulo.
  - En 8.1, construir el modelo con imagen. Mostrar el cuadrado inclinado de 7.1 sobre el cuadro de Peldaño y partir
    el lado en q: el cuadrado del lado se llena de q · q cuadraditos y el de la diagonal debería llenarse de p · p.
    El estudiante dice una sola frase.
  - Una línea de uso por familia en cada escena. Por ejemplo, Rampa: «Tres por tres. Y me sobra el tramo que iba a
    estirar.»
  - Cornisa trae su propia caja.
  - El carpintero se vuelve Balcón, que ya trabaja madera en 8.6.
  - Que la última línea del capítulo sea de Punto o de una familia, no de Mara.
- **Cómo comprobarlo:** en el log, ≤ 3 líneas del estudiante con «Nombre:» y una línea de familia después de cada
  conclusión.

### M2. Opciones que se delatan con un patrón aprendible, y una transferencia que repite los mismos números

- **Dónde:**
  - **En seis de las once elecciones, la correcta es la más larga y trae su propia razón:**
    - 8.1, `proof-need`: «Probando no se termina nunca: hace falta una razón.» (`scenes-a.js:78`);
    - 8.1, `descent`: «Para siempre: cada par da otro más chico.» (`:159`);
    - 8.2: «Con este pasó; para saber si pasa con todos, hace falta una razón.» (`:244`);
    - 8.3: «La forma: los ángulos iguales y todos los lados multiplicados por lo mismo.» (`:415`);
    - 8.6: «Para cualquier triángulo con ángulo recto: el reacomodo no usó el 3 ni el 4.» (`scenes-b.js:197`);
    - 8.8: «Cada hora da una sola sombra; pero una sombra puede ser de dos horas.» (`:350`).
  - **En las numéricas pasa lo contrario:** la correcta es un número pelado y las incorrectas traen una razón
    («Cinco.» contra «Siete: tres más cuatro.»; «Ocho.» contra «Cuatro, como la huerta.»).
  - **Cuatro preguntas son la misma:** «¿vale para todos?» (8.1 dos veces, 8.2 y 8.6), y la respuesta es siempre «hace
    falta una razón» o «para todos, con la condición».
  - **Opciones de paja:**
    - «Ya se probaron mil: no hay ninguno.»;
    - «Hasta que no se pueda dibujar.»;
    - «El área: ocupa lo mismo.» (el marco grande ocupa visiblemente más);
    - «No: la sombra no tiene que ver con la hora.»
  - **8.5 tiene dos opciones,** y una es «Depende de la forma.» (`scenes-b.js:31`), la respuesta prudente por defecto.
  - **8.7 repite 8.6:** las mismas tres opciones (`:272-274` contra `:134-136`), el mismo triángulo 3-4-5 y la misma
    respuesta. No es transferencia: es el mismo problema con otro nombre.
  - **Ayudas de un solo nivel que dan la respuesta:** 8.2 (`:264`) y 8.6 (`:156`). El contrato §5 pide «ayudas
    graduadas».
- **Por qué importa:**
  - Una elección que se gana por la forma de la opción mide lectura de menús, no comprensión (contrato §5).
  - Para transferir, el contrato pide una «situación nueva… sin repetir la misma secuencia».
  - Es M4 de rev-narr-5 y M3 de rev-narr-4.
- **Propuesta:**
  - Opciones del mismo largo y todas con una razón: errores verosímiles con su argumento.
  - Sacar dos de las cuatro preguntas de «¿vale para todos?». En 8.2 y 8.6 la generalidad se puede mostrar sin
    preguntar: el jugador estira un vértice del triángulo y las puntas siguen haciendo media vuelta.
  - **8.7 con otros números:** (−1, −1) y (4, 1) dan patas 5 y 2. El tirante no es entero (√29, «entre 5 y 6»): es
    una transferencia real que conecta con 8.1.
  - Ayudas en tres niveles: reformular, señalar y demostrar.

### M3. Costura 7→8: el texto mejoró, pero Peldaño repite su línea, la puerta no se ve y es la tercera vez que pregunta lo mismo

- **Dónde:**
  - Gancho del cap. 7: «Pero ayer partí el lado del cuadro en doce y la diagonal no cayó en ninguna rayita. ¿En
    cuántas hay que partirlo?» (`ch7/scenes-b.js:637`).
  - Tras la tarjeta, 8.1 abre con Peldaño: «Partí el lado del cuadro en doce y la diagonal no cayó en ninguna rayita.
    ¿En cuántas lo parto para que caiga justo?» (`scenes-a.js:31`).
- **Qué:**
  - **La misma línea dos veces seguidas.**
  - **Peldaño pregunta por tercera vez lo mismo.** Ya lo había preguntado en 5.9 («¿Cuántas barras mide?»,
    `ch5/scenes-b.js:426`, donde el estudiante concluyó «Que ninguna, nunca, entre justo, se puede probar») y en 7.1.
    Un personaje que no aprende nada no avanza.
  - **No hay imagen:**
    - la puerta pintada se nombra tres veces (`ch7/scenes-a.js:162`, `ch7/scenes-b.js:637`, `scenes-a.js:169`) y no
      se ve nunca;
    - el experimento de las doce rayitas tampoco se dibuja.
  - **8.1 empieza en el mismo lugar, el mismo plano y con el mismo elenco que 7.9** (`c7-errores2/047` contra `048`).
  - **El aviso de la Bitácora** aparece en el gancho y sigue en la apertura de 8.1 (`c7-errores2/048`).
- **A favor:** se corrigió «partí la diagonal» por «partí el lado» (M5 de rev-narr-5).
- **Por qué importa:** el gancho es el deseo que mueve el capítulo, y hoy el deseo es repetir una pregunta ya
  contestada.
- **Propuesta:**
  - Que el gancho use la promesa del cap. 5. Mara, escéptica: «Vos dijiste que se podía probar que ninguna cae justo.
    Yo probé hasta mil. Probámelo.» Así «probé hasta mil» tiene origen (M1), y la necesidad nueva es **demostrar**, no
    medir.
  - 8.1 abre en la puerta de Peldaño (plano cercano, el «√2» pintado) y no repite la línea.
  - El aviso de la Bitácora, después del gancho.

### M4. Costura 8→9: el gancho resuelve de antemano la idea central del cap. 9 y lo nombra

- **Dónde:** 8.8 (`scenes-b.js:348-358`).
- **Qué:**
  - El diseño pedía terminar en una pregunta («¿cada hora da una sola sombra?»).
  - La escena la convierte en elección evaluada (`:349-353`) y el estudiante enuncia la diferencia entre relación y
    función: «Dada la hora, hay una sola sombra. Al revés, no» (`:356`). Es el núcleo del cap. 9 «Depende» (G:
    «Diferenciar una relación de una función»).
  - Mara cierra con el título del capítulo siguiente: «Que una cosa dependa de otra» (`:358`). Es la misma falla que
    M1 de rev-narr-4 y M5 de rev-narr-5.
  - **Motivación sin causa:** «Desde que entendí lo de las copias, mido mi sombra para saber la hora» (`:318`). La
    semejanza no explica medir la hora.
  - **No hay gancho dramático,** ni deseo ni amenaza.
- **Por qué importa:**
  - El cap. 9 empezará con su idea dicha y evaluada.
  - El contrato §4 pide cierre con deseo y revelación, no un adelanto de temario.
- **Propuesta:**
  - 8.8 termina **antes** de la respuesta. Cornisa quiere usar la sombra como reloj; con la tabla del jugador ve 2
    pasos y no sabe si son las 10 o las 14. Punto apuesta y se equivoca (A3). Corte.
  - La motivación tiene que usar de verdad la semejanza. Cornisa: «Mi sombra y la del poste son copias parecidas a la
    misma hora: si la mía mide 2 y yo 1, el poste de 3 hace 6.» Eso usa 8.3. Y la hora queda como pregunta.
  - Sin la palabra «depende» en la última línea.

### M5. Composición: el que habla queda fuera de cuadro, los momentos no tienen primer plano y el subtítulo anterior queda sobre la escena nueva

- **Dónde:**
  - **El estudiante fuera de cuadro en `tiles`.** Queda cortado por el borde izquierdo mientras dice líneas centrales:
    - «Supongamos que hubiera un p y un q…» (`004`);
    - «Punto: si hubiera un par…» (`006`);
    - «Por la punta de arriba, una recta paralela…» (`010`);
    - la conclusión de 8.2 (`012`);
    - «Rampa: la cerca mide el borde…» (`025`);
    - «Tres para el costado…» (`033`).

    Sólo aparece entero cuando camina a escribir (`studentWrites`, `ch7/scenes-a.js:16`). Es M7 de rev-narr-5.
  - **Sin primer plano:**
    - en los dos «momentos» (8.4 y 8.6);
    - en la frase «√2 no es una fracción» (`007`, con el mismo encuadre que el resto).

    No se usan `close` ni insertos.
  - **El subtítulo de la escena anterior queda sobre la pizarra vacía de la siguiente, con el hablante ya fuera:**
    - Peldaño en `008`;
    - el pensamiento sobre la esfera en `014`;
    - Cornisa en `016`;
    - «—Peldaño: el lado…» en `023`.

    Es B7 de rev-narr-2, 3 y 4 y B1 de rev-narr-5.
  - **8.8:** Cornisa, que es el sujeto de la escena, mide ≈ 110 px de alto en un plano de 1600 px, y la sombra no se
    ve (A5).
- **Propuesta:**
  - El plano `tiles` corrido 100–150 u a la izquierda mientras habla el estudiante, o el estudiante parado junto al
    borde de la pizarra durante toda la manipulación.
  - Extender la guarda de pruebas: todo hablante de `d.say` dentro del encuadre.
  - Un inserto de ≥ 2 s en la revelación de cada momento: el cuadrado del tirante convertido en 9 + 16, la caja llena
    y la frase de √2.
  - Limpiar el subtítulo al cambiar de escena.

### M6. Accesibilidad: lo que escribe el estudiante no se anuncia, botones sin verbo y amarillo para todo

- **`studentWrites` sigue mudo.** No llama a `d.describe` (`ch7/scenes-a.js:10-22`). Las siete conclusiones escritas
  del capítulo son sólo canvas:
  - «√2 no es una fracción»;
  - «A + B + C = 180°»;
  - «lado × 2: área × 4, volumen × 8»;
  - «perímetro 12: áreas 5, 8, 9»;
  - «3² + 4² = 5²»;
  - «a² + b² = c² (con ángulo recto)»;
  - «(3, 2) ≠ (2, 3)».

  Es M6 de rev-narr-5, otra vez.
- **Sin `describe`:**
  - la casa ubicada en 8.7 (`house()`, `scenes-b.js:243-246`, sólo suena un toque);
  - el contraejemplo 4-5-6, que es una línea de Balcón y un pensamiento sin dibujo (`:204-206`).
- **Rótulos sin verbo, o que nombran algo que no está en pantalla:**
  - «El ángulo de abajo en A» (`scenes-a.js:275`);
  - «El cruce (3, 2)» (`scenes-b.js:251`); mejor «Poner la casa de Rampa en 3, 2»;
  - «Correr el triángulo 1/3/4» (`:164`): los triángulos no tienen número dibujado.
- **Amarillo que no es de Punto.** Lo usan:
  - la meta p · p = 2 · q · q;
  - «falta un cuadradito»;
  - el cuadrado pisado;
  - las puntas;
  - las huertas;
  - las cajas;
  - la fila 3 × 3;
  - el cuadrado del tirante;
  - las casas;
  - el sol.

  El color deja de decir quién escribió (B2 de rev-narr-2, M10 de rev-narr-4, M6 de rev-narr-5).
- **Pronunciación con lector de pantalla:** «−1» con U+2212, «√2», «180°» y «a²» se leen distinto según el lector
  (no lo probé).
- **Propuesta:**
  - `studentWrites` anuncia en palabras: «El estudiante escribe: raíz de 2 no es una fracción».
  - `describe` al ubicar cada casa.
  - `label` con verbo y lugar: «Correr el triángulo de arriba a la derecha».
  - Amarillo sólo para Punto y lo que Punto toca. Las huertas en blanco rayado y el sol en blanco.

### M7. La Bitácora sigue siendo un boletín de respuestas y atribuye de más

- **Dónde:** `writeJournal8`, `scenes-b.js:365-406`.
- **Qué:**
  - Hasta diez ítems en «Lo que pasó», todos sobre respuestas: «Partiste…», «Viste…», «Pensaste…», «Anticipaste…».
    Ninguno es de historia: ni la puerta de Peldaño, ni la ventana de Cornisa, ni el tirante de Balcón, ni las casas.
  - **Atribuye de más:**
    - quien eligió «Sin medir no se sabe» en 8.7 lee «derecho no son 7: son 5» (`:386`), como si hubiera dicho 7;
    - quien probó 2, 3 y 4 en 8.5 lee «dio de 5 a 9» (`:382`) sin haber visto el 5 (ver A5).
  - El cuerpo tiene cuatro párrafos, pero el tercero carga copias y escala, y el cuarto carga perímetro, Pitágoras y
    coordenadas (`:394-395`). Es M9 de rev-narr-5, sin cambios.
- **Propuesta:**
  - Entre 3 y 5 ítems, al menos dos de historia.
  - Una frase por rama.
  - Una idea por párrafo: argumento y √2; ángulos; copias y escala; perímetro, área y Pitágoras. Las coordenadas van en
    «Desplegar».

---

## Hallazgos BAJOS

- **B1. El subtítulo de la escena anterior queda sobre la siguiente:** `c8-directa/008`, `014`, `016` y `023` (ver
  M5). Es la quinta revisión que lo marca.
- **B2. «Anotado en la Bitácora (≡)»** sigue visible en el gancho, en la tarjeta de fin y en la pantalla de título
  (`040`, `041`, `c8-errores/043`). En la costura 7→8 queda sobre la apertura de 8.1 (`c7-errores2/048`).
- **B3. Cero barrado («Ø»):**
  - «5Ø» (`002`);
  - «18Ø°» (`013`);
  - el origen del mapa (`033`);
  - «1Ø h» (`037`);
  - «Ø» en la tabla de 7.9 (`c7-errores2/047`).
- **B4. Concordancia:**
  - los rótulos dicen «igual (girada)» y «parecida», concordando con la ventana;
  - el `describe` dice «ni igual ni parecido» (`scenes-a.js:368`), concordando con el marco, y el rótulo «ni igual ni
    parecida» (`:366`);
  - las capturas muestran todavía «girado» y «parecido».

  Elegir un solo sustantivo.
- **B5. «A + B + C = 180°»** usa las letras de los vértices como nombres de ángulos (`:281`). Que lo decida la revisión
  matemática; una opción es «ángulo A + ángulo B + ángulo C = 180°».
- **B6. «el lado se multiplica una vez; el área, dos veces»** (`:538`) es ambiguo. Mejor «el largo, por 2; el área,
  por 2 y otra vez por 2; el volumen, por 2 tres veces».
- **B7.** Los cuadrados azules de 8.1 no tienen la «q» escrita; el grande sí tiene «p» (`004`).
- **B8. «El dibujo está hecho con medidas que no existen»** (`:168`). Mejor «El dibujo muestra un par que no existe».
- **B9. En 8.4, la caja de Cornisa «de dos por dos por dos»** se dibuja sin subdividir. El 2 × 2 × 2 no se ve y no se
  usa.
- **B10. «Dos cuadros más por lado: algo más.»** (`:467`) mezcla un dato cierto (al lado de 2 se le suman 2) con una
  conclusión vaga, y se lee como una trampa de redacción. Mejor un error con número: «Unos ocho cuadros: dos filas y
  dos columnas más».
- **B11. Los blancos de 8.1 y 8.5** («en 2», «en 3»… y los anchos) aparecen como lista de palabras a la derecha de la
  figura, lejos de lo que modifican. Es la misma forma de «probar valores de una lista» que 7.9, 8.1, 8.5 y 8.8.

## Qué mejoró respecto del cap. 7

- **Una idea de capítulo coherente y adulta:** distinguir evidencia de argumento y declarar el alcance. Lo sostienen
  las tres pruebas visuales más ambiciosas del juego: la bajada de Tennenbaum, la paralela y el reacomodo.
- **La costura de entrada dice lo correcto:** «partí el lado», no «partí la diagonal».
- **Las familias usan el resultado** en tres escenas (Peldaño, Cornisa y Balcón).
- **Menos vocativos** (7 contra 9).
- **Dos interacciones con decisión real** (8.3 y 8.7), con consecuencia visible en 8.3 y una nota específica en 8.7.
- **Un encuadre nuevo** (`SHOTS.shadow`) y una escena fuera de la pizarra.
- **Callbacks** al pozo (cap. 3), a la media vuelta (cap. 4) y al cuadrado de dos de 7.1.
- **El detector de botones superpuestos** encontró dos solapamientos en teléfono, y `2e43021` los corrige.
- **Sin «como dije»** ni veredictos automáticos.

**En retroceso:**

- Punto, que no actúa (A3).
- La Marea, que no aparece (A4).
- La cantidad de predicciones evaluadas (11).

## Qué no pude verificar

- **Audio:** no escuché nada (el recorte de las puntas con `erase`, los `tap` con tono creciente y los sonidos de Punto).
- **Ritmo y actuación:** sólo vi cuadros sueltos y logs de un bot. No sé cuánto dura cada escena para una persona ni
  cómo se ven:
  - el viaje de las puntas;
  - el dibujo de la bajada;
  - el movimiento del sol;
  - la caminata del estudiante a la pizarra.
- **Pantallas sin captura:**
  - la tarjeta «Capítulo 8» al entrar desde el cap. 7: `c7-errores2` pasa de `047` a `048` sin capturarla;
  - la nota de (2, 3) en 8.7;
  - la nota de «No calza» en 8.3;
  - la rama «any» de 8.6 con Balcón en pantalla;
  - la Bitácora abierta;
  - el momento rejugado desde la Bitácora.
- **Ramas no cubiertas por las partidas:**
  - 8.1 «seguir probando» y q = 7 o 12;
  - 8.2 «Con otro triángulo daría distinto» y elegir B como ángulo alterno;
  - 8.3 operaciones equivocadas sobre el girado y el ancho;
  - 8.4 «algo más»;
  - 8.5 sin probar 1 ni 5, y sin probar 3 (la línea de Rampa de `:80`);
  - 8.6 «Sin medirlo no se puede saber»;
  - 8.7 «Sin medir no se sabe» y un cruce equivocado para Peldaño;
  - 8.8 saltear las 10 o las 14, y «No: la sombra no tiene que ver».

  Lo que digo de esas ramas sale del código.
- **Teléfono real:** todas las partidas de 844×390 son emulación. Los tamaños en píxeles los medí a ojo sobre las
  capturas. `c8-telefono2` y `c8-casas-tel` corresponden a `2e43021`, no al commit revisado.
- **Lector de pantalla:** no probé cómo se leen «√2», «−1», «180°», «a² + b² = c²» ni los `describe` en contexto.
  Tampoco el texto grande ni la lectura limpia con la tabla de sombras.
- **Movimiento reducido:** no sé cómo se resuelven el viaje del sol y el de las puntas.
- **Comprensión de personas:** nada de esto es un playtest. Que algo «se sienta plantilla», «delate la respuesta» o «se
  lea mal» es una hipótesis que hay que comprobar con jugadores.
