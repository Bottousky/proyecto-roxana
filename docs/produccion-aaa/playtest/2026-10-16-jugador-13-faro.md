# Playtest tramo Faro (informe 13)

Estado final: NO llegué al final de la historia. Me quedé en la primera mesa del Faro ("I · El pulso del Faro") y no pude confirmar que se resuelva. Ruta: partida de http://localhost:4190/?tramo=faro, opción "Continuar el viaje" (no toqué "Comenzar otro viaje"). Pestaña propia: tabId "seed" (tabs_create falló; la pestaña se abrió con navigate). Viewport 1280x800 (ahora restablecido). Pestaña a cerrar al final.

Nota de método: el juego se maneja con clic en el suelo y con WASD. Como jugador de prueba me costó bastante moverme, así que parte del tiempo fue navegación, no puzzle.

## Bitácora de juego (cronológica)

1. Título: "Continuar el viaje" carga en unos 10 s (la barra llega a 96% y luego entra el mundo). Esperaba ver el tramo del Faro directo; entré bien, con la pantalla de "Noche, día 1".
2. Guía (H): dice "Abrí la Fuente del Faro, la primera mesa". Lo entendí. El botón "Cerrar" de la guía no respondió al primer clic; cerré con H, y la primera vez con H la guía se volvió a abrir (la tecla alterna y no lo esperaba). Confuso.
3. Bitácora (J): ocupa toda la pantalla y tiene muchísimo contenido de capítulos anteriores ("La cuenta del carro", "Pruebas que conservé", etc.). Me sirvió para entender el concepto de "dos faroles en fila: el que más frena se queda con más voltaje", pero el texto es denso para un chico de 12 a 15 años. Un punto a favor: la sección "Lo que hay detrás lo que vio Ohm" explica bien la ley de las tensiones.
4. Mapa (M): muy claro. Muestra el Faro con dos engranajes "Por restaurar" y un rombo dorado de "Siguiente paso". Lo usé para encontrar el camino. Muy buen recurso.
5. Caminé por el puente del Lago de las Señales. Pisé un objeto dorado en el puente y apreté E: no pasó nada. La flecha de "Hacia El Faro" estaba bien. La etiqueta de zona cambia a "Ribera de las Señales" / "Lago de las Señales" con un texto que se corta en la tarjeta.
6. En la plaza del Faro se disparó una secuencia de diálogos (Bitácora, Nereo, Nico, Edda, Ohm) sin que yo hiciera nada. Al terminar, el texto dice "vos abrí la primera mesa". Yo no abrí nada: la base ya estaba iluminada y el mensaje "I · La base recibe energía" apareció solo. Esperaba: llegar, hablar, y abrir yo la mesa. Pasó: la mesa se abrió sola y después me pidieron que la "abra". Contradicción de guion.
7. Hablé con Nereo (E): diálogos largos y muy poéticos ("Cobre que se queja, cobre que descansa"). Son lindos pero la última respuesta ("Las dos manivelas... si la fuente va a aguantar") no da una pista operativa.
8. Entré al puzzle "I · El pulso del Faro" (Cámara de alimentación). Objetivo: "Dale fuerza al núcleo sin recalentar los tendidos". Dos objetivos: "El núcleo sostiene su pulso" y "Ningún tendido se calienta".
9. Ohm sugirió aflojar el regulador y mirar el tendido norte. Probé el regulador: 4/6 -> 3/6 -> 2/6 -> 3/6. Con cada cambio el núcleo seguía en "Casi" y el tendido norte seguía "Se calienta". El comentario de Ohm dice que frenar más deja menos fuerza para el núcleo: el sentido del regulador es lo más confuso del puzzle.
10. Probé la Pista: el botón existe pero el texto de la pista quedó fuera de la vista (ver bugs).
11. Tendí cables: el tendido sur en paralelo con el tendido norte. Resultado: ambos tendidos quedaron "Fresco" (✓), con el mensaje "Los dos tendidos juntos se reparten la corriente, y cada uno se calienta un cuarto de lo que se calentaba solo". Ese mensaje lo entendí bien: es el mejor momento del puzzle, cuando el chico entiende que dos caminos reparten la corriente.
12. Pero al tender el cable tuve que reajustar varias veces: en un momento quedó desconectada la fuente (los bornes Fuente+ y tendido norte A quedaron en gris) y el núcleo no recibía nada. Lo arreglé volviendo a tender Fuente+ a tendido norte A. Al final el tablero quedó con Fuente+ conectado, ambos tendidos "Fresco", y el núcleo en "Casi" con el mensaje "No te quedan cables en la mano". No pude confirmar cuál de los dos objetivos quedó pendiente (la lista muestra un "(pendiente)" y no sé a cuál corresponde). Me trabé alrededor de 40 pasos ahí.
13. No llegué a "II" ni al final. Paré porque ya estaba muy por encima de los ~15 minutos de trabado y el tablero ya no era claro.

Tiempo aproximado: bastante más de una hora de juego real (muchísimo en mover el personaje y en el puzzle del Faro). Se nota que la navegación con teclado es lenta y los clics en el suelo se corren cuando la cámara se mueve.

## 1. Esperaba X y pasó Y
- Esperaba llegar al Faro y abrir yo la primera mesa; pasó que la base se activó sola con una secuencia de diálogos.
- Esperaba que la guía me llevara al puzzle; pasó que la guía tiene un "Ubicarme en el mapa" que no hace nada visible en la plaza (el marcador dorado sí aparece en el mapa).
- Esperaba que el puzzle me dijera qué hacer; pasó que el objetivo y el mensaje de Ohm son dos niveles distintos y no los reconcilié.

## 2. Comprensión de cada mesa
- Tensión y corriente, en la Bitácora: lo entendí a medias. La frase "el que más frena, más se queda" sirve, pero no la usé para resolver.
- Puzzle "El pulso del Faro": llegué a entender que dos caminos en paralelo reparten la corriente y que el cobre se calienta si lleva mucha. Eso sí lo aprendí. El regulador no lo entendí: con cada cambio el núcleo seguía igual, no sé si frenar más o menos le da fuerza al núcleo.
- Probé sin entender en algunos momentos: moví el regulador y los cables a ciegas, para ver qué pasaba.

## 3. Puzzles
- Fáciles: tender el cable en paralelo (cuando lo logré, la idea quedó clara).
- Difíciles / confusos: el regulador (sentido de "frenar más / menos"), y el estado de los cables (tomar un cable al tocar un borne ocupado, y que la fuente quede desconectada sin avisar).
- Pistas: "Ohm: Aflojá el regulador... y mirá qué le pasa al tendido norte" no alcanza. La pista "Lo que dijo el cobre" aparece cuando se resuelve algo; antes de eso no ayuda a salir de un callejón.

## 4. Bitácora
- Muy rica y bien escrita, con dibujos de circuitos y notas de Edda. Muy buena para aprender.
- Problema: la mayoría del contenido es de capítulos anteriores; un jugador que llega al Faro se pierde en 20 páginas que no necesita. Sugerencia: resaltar la página del tramo actual o colapsar lo viejo.

## 5. Navegación
- WASD y clic en el suelo funcionan, pero las teclas se mueven muy poco por pulsación (había que mandar 10 o 15 pulsaciones para avanzar un par de baldosas).
- La cámara sigue al personaje y los clics se corren; varias veces toqué el suelo cerca de un objeto y me llevó a otro (Nereo, o el "Volver al lago").
- Hay un botón "Volver al lago" (E) junto a la salida de la plaza que está muy cerca del objeto dorado: fácil de activar por error. Pensé que era parte del puzzle.
- "Mirar con Ohm" (Q) y "Acercate" aparecen sólo cuando estás muy cerca de la instalación. Varias veces no los vi y no sabía que había que acercarse más.

## 6. Arte y presentación
- Muy linda la plaza del Faro, la torre, los sauces, el agua con reflejos; el tono de la noche funciona.
- El tablero del puzzle es de madera y cobre, se entiende a simple vista. Muy bien.
- La pantalla de carga y el título son lindos.
- Problema: el tablero del puzzle queda cortado a la derecha en un viewport de 1280x800 y algunos bornes, el regulador y el mensaje de la pista quedan fuera de la vista.

## 7. Diálogos e historia, y el final
- Los diálogos son bonitos pero largos; Nereo habla en acertijos ("Cobre que se queja, cobre que descansa") y eso es encantador pero no ayuda a saber qué hacer.
- Hay muchas capas de texto: la Bitácora, el Ohm, el mensaje del tablero, la guía. Me costó saber cuál era el próximo paso.
- No vi el final.

## 8. Errores o bugs
1. Secuencia automática: la base se activa sin interacción del jugador, pero el diálogo dice "vos abrí la primera mesa". Contradicción.
2. Botón "Cerrar" de la guía: no responde al clic; sólo se cierra con la tecla H (y H alterna, así que se vuelve a abrir si la pulsás dos veces).
3. Tablero de cables: al tocar un borne que ya tiene cable se levanta ese cable en vez de conectar uno nuevo. Con eso perdí la conexión de la fuente y el núcleo quedó sin energía, sin aviso claro. Y el mensaje "No te quedan cables en la mano" no explica cómo recuperar un cable.
4. Botón "Pista" (y el texto de la pista) queda fuera de la vista en 1280x800.
5. Objetivos: no está claro qué objetivo queda "(pendiente)" en la lista del puzzle; la barra superior muestra un ✓ en "El núcleo sostiene su pulso" aunque el núcleo sigue en "Casi".
6. El botón de "Ubicarme en el mapa" de la guía no mueve la vista de la cámara.
7. Algunos botones (ej. "Mirar con Ohm" y "Acercate") figuran en el DOM como fuera del viewport cuando no estás en rango; no es visible para el jugador, pero dificulta testear.

## 9. Ritmo
- La secuencia de diálogos al llegar al Faro es larga (unos 10 diálogos seguidos antes de jugar).
- El puzzle del Faro es lento de entender: se pasó de "Aflojá" a una decisión de cableado sin una pista intermedia.
- La navegación con teclado es lenta.

## 10. Top 10 a mejorar
1. Hacer que el jugador abra la primera mesa, o cambiar el texto "vos abrí la primera mesa" si la base ya se activa sola.
2. Aclarar el sentido del regulador (frenar más = menos fuerza para el núcleo): decirlo en la mesa con una frase corta.
3. Cables: tocar un borne con cable no debe levantar el cable sin avisar; mostrar "tomaste el cable de X" y permitir soltarlo.
4. Mantener la fuente conectada: si un cable se levanta y la fuente queda sin conexión, avisar.
5. Mostrar qué objetivo está pendiente y por qué (el "(pendiente)" no se entiende).
6. Pista visible en 1280x800 (hoy queda fuera del área).
7. Botón "Cerrar" de la guía y la tecla H: que no se alternen de forma confusa.
8. Bitácora: resaltar el capítulo actual y colapsar los anteriores.
9. Movimiento con teclado más responsive (una pulsación debería avanzar más).
10. Diálogos de Nereo: sumar una pista concreta en la frase final ("probá aflojar el regulador y mirá el tendido norte") en vez de metáforas.

## 11. Top 5 de lo mejor
1. El mapa del reino: claro, con los engranajes por restaurar y el rombo del siguiente paso.
2. La Bitácora: explicaciones con dibujos y la cuenta de las tensiones; muy buen material de aprendizaje.
3. El tablero de cobre y madera: visualmente legible y con retroalimentación ("Fresco", "Se calienta").
4. El mensaje "Lo que dijo el cobre: los dos tendidos juntos se reparten la corriente": el momento en que el concepto de paralelo se entiende.
5. El tono y la estética de la plaza del Faro (noche, sauces, agua, torre).
