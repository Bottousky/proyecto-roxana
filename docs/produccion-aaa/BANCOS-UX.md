# Bancos: rediseño de UX (ciclo 15)

**Problema reportado por el usuario (5 oct 2026):** los bancos seguían siendo difíciles de
entender, sobrecargados de información y con demasiadas opciones. No quedaba claro qué había que
hacer, cómo, cuándo estaba resuelto ni cómo seguir con la historia.

**Base:** investigación de puzzles y juegos parecidos en
[INVESTIGACION-PUZZLES-UX.md](INVESTIGACION-PUZZLES-UX.md), con fuentes. Las más aplicadas fueron
PhET (andamiaje implícito y números apagados), Horizon Forbidden West (objetivo visible desde el
principio), The Witness (respuesta inmediata), Patrick's Parabox (pocas posibilidades, deshacer
siempre visible), Taconis (el dibujo del tablero enseña física) y Mayer (texto pegado a lo que
explica).

## Qué cambió

| Pregunta del jugador | Antes | Ahora |
|---|---|---|
| ¿Qué tengo que hacer? | Un párrafo de encargo a la derecha, un subtítulo y observaciones en prosa debajo del tablero | Arriba, el objetivo en una frase con ◎ y el encargo en pasos numerados que se tildan solos. El paso actual se resalta. Las piezas de la meta llevan ◎ en el tablero |
| ¿Cómo? | Modos de herramienta, un interruptor de alimentación obligatorio (apagar para cablear, encender para probar), cajones de cables, de instrumentos y de pruebas | Ohm dice qué se puede tocar para el paso actual. Hay un solo instrumento por banco, y su botón se ilumina cuando el paso lo pide. La mesa se alimenta sola: el probador de camino la apaga mientras se usa y un cortocircuito se repone con el próximo cambio. Los cables se tienden con dos toques o arrastrando, y cada cable de mano tiene su × para retirarlo |
| ¿Voy bien? | Frases largas debajo del tablero, lejos de cada pieza | Cada pieza dice su estado en palabras sobre sí misma (Funciona, Casi, Le falta fuerza, Demasiada fuerza, Al revés, Se calienta, Sin camino…). Una medición sobre un tramo o un empalme queda anotada en él |
| ¿Ya está? | Una caja a la derecha con «Dejar funcionando», y «Volver» dejaba la instalación armada pero apagada | Aparece una tarjeta con «¡Funciona!», lo que se aprendió y un único botón: «Seguir la historia →». Salir con el banco funcionando también lo pone en servicio: no hay forma de perder lo resuelto |
| ¿Y si me trabo? | «Pedir una observación», siempre igual | El botón de pista se ofrece solo (late) después de 90 s o de seis cambios sin tildar un paso nuevo. Las cuatro pistas siguen igual |

**Tablero.** Los cables soldados de la instalación se dibujan como cobre fijo que corre por los
bordes con un tronco común desde cada borne de la fuente; los de mano cuelgan. En las Terrazas, por
ejemplo, el tablero se lee ahora como una escalera de tres ramas entre «Fuente +» y «Retorno −»,
donde antes había nueve cables cruzados en diagonal. El mando de cada freno o regulador está sobre
la pieza, con el mismo nombre que la pieza.

**Quitado de la pantalla.** El subtítulo, el pie con atajos de teclado, el lema «Un cambio · una
observación», el cajón de cables tendidos, «Otros instrumentos de Ohm», «Comparar mis pruebas» con
la anotación de predicciones, «Leer las marcas numéricas» del pie y el interruptor de
alimentación. Las mediciones, cambios y resultados se siguen anotando solos en la Bitácora. Los
números siguen disponibles dentro del instrumento («Ver números»).

**Cambios de comportamiento declarados.**
- La mesa se alimenta sola. La seguridad sigue explicada donde importa: el probador de camino
  apaga la mesa y lo dice («esta prueba usa la pila del instrumento»), y la protección contra
  cortocircuito sigue saltando y explicando la causa.
- Salir con el encargo cumplido pone la instalación en servicio. Salir con el encargo sin
  cumplir nunca lo hace.
- «Empezar de nuevo» devuelve los cables a su lugar, pero no borra lo que alguien ya vio (las
  pruebas de Lumen, Vega, Ivara y Nereo) ni las pistas pedidas.
- Cada banco ofrece un solo instrumento, el que pide su historia; antes podía ofrecer hasta tres.

## Medido (1440×900, banco recién abierto, `scripts/qa-bench-load.mjs`)

| | Antes (`6abad80`) | Ahora |
|---|---|---|
| Textos fuera del tablero, sumando los 9 bancos | 144 | 105, contando también las placas sobre el tablero |
| Controles fuera del tablero, sumando los 9 bancos | 93 | 52 |
| Bancos que obligan a desplazar | 2/9 | 0/9 (también a 1280×720) |
| Placas encimadas | — | 0 a 1440×900; 1 a 1280×720 (Terrazas, rozándose) |

`scripts/qa-bench-flow.mjs` juega cinco bancos con el mouse real: probador del Taller, cable
arrastrado, mandos del Cerrojo y de las Terrazas, pedido de Ivara, cortocircuito del Portal y
tarjeta de éxito.

## Teléfono: apaisado primero (ciclo 16)

El usuario propuso probar el teléfono apaisado. Es la forma natural de jugar una aventura en 3D,
y la investigación sugería ese mismo diseño para el banco: tablero grande y acciones al alcance
de los pulgares. Con 844×390 emulado, el mundo y el título ya se veían bien, pero el banco se
reducía a una franja ilegible y el mapa quedaba debajo de su encabezado. Ahora:

- **Banco:** dos columnas. A la izquierda, el tablero tan grande como deja la altura, con cada
  mando sobre su pieza y botones de 34 px. A la derecha, el objetivo con el paso actual en
  palabras (los demás, sólo con su marca), los cuatro botones arriba y siempre a mano, y la frase
  de Ohm debajo, que se desplaza si es larga. Los bornes responden 8 px más allá de su borde.
- **Mapa:** la guía y las pestañas a la izquierda; el mapa entero a la derecha.
- **Bitácora:** la página ocupa casi toda la altura. **Diálogo:** más bajo, deja ver la escena.
- **En vertical:** el título y los bancos sugieren girar el teléfono, sin impedir seguir así. La
  barra de Ohm ya no queda fija sobre el tablero: en la prueba táctil tapaba los bornes.

`scripts/qa-landscape.mjs` captura todas esas pantallas y `qa-touch.mjs` acepta `SIZE=844x390`.

## Pendiente o NO VERIFICADO

- **Prueba con personas: NO VERIFICADA.** La investigación recomienda partidas grabadas con
  jugadores nuevos que narren en voz alta. Nada de lo medido acá sustituye eso.
- **Teléfono real: NO VERIFICADO.** Sólo con emulación táctil: apaisado 844×390 y 740×360, y
  vertical 390×844.
- No implementado, para discutir: pistas que cambian según el error cometido (hoy son una
  secuencia fija de cuatro), una pregunta de predicción en los bancos clave (por ejemplo, antes de
  que Ivara aísle la cocina) y señalar en el tablero dónde se corta un camino abierto.
