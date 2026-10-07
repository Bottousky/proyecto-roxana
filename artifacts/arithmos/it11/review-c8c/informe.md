# Revisión rev-c8c: 10.2, 10.6, 11.1, 12.5, 12.6 y «ver la pizarra» (matemática + agencia + UX)

Commits: 18c5194 (10.2), 94b1649 (12.5), 8ccfc37 (11.1), a02e23d (peek), f0e6859 (10.6, 12.6). Las líneas citadas
son las de **f0e6859** (en 94aa491 `ch10/scenes-a.js` corre +6). Rutas relativas a `experiments/arithmos/`. Leí el
código, los logs `c102-errores`, `c106-errores`, `c111*`, `c125*`, `c126*`, `full-tel/log.txt` y las capturas pedidas,
más 12 capturas `*-pizarra.png` de `full-tel` (caps. 3, 6, 8, 9, 10, 11, 12). Verifiqué los números con node.

Resumen: 2 ALTA, 8 MEDIA, 6 BAJA. La matemática nueva está bien en todos los casos. Los problemas son de ejecución
(un dibujo que no se borra), de agencia (el juego dice la respuesta justo antes de preguntarla) y de UX del peek.

## ALTA

**A1. La «otra tanda» de 11.1 queda dibujada en las siete escenas siguientes del cap. 11.** `src/ch11/scenes-a.js:87`
- Qué: la segunda tanda se dibuja con ids `c11b-…` (curva azul, punto y «67 %»), pero 11.2 a 11.7 limpian con
  `clean(g, /^c11-/)` (`scenes-a.js:111, 162, 201`; `scenes-b.js:17, 86, 182, 229`), que no los borra. Se ve en
  `full-tel/338-c11.parejo-pizarra.png` (la curva cruza las barras del ayudante A), `344-c11.contar-pizarra.png`
  (cruza el árbol) y `350-c11.causa-pizarra.png`: ahí parece una tendencia que baja sobre la nube de puntos
  «borrones / polvo», justo en la escena que enseña a no leer de más un gráfico.
- Por qué importa: hay datos falsos en pantalla durante todo el capítulo, y el bot dijo «sin errores».
- Corrección: usar ids `c11-b…` (que entren en `/^c11-/`) o borrarlos al salir de 11.1.
- Comprobar: ruta con «Otra tanda» y captura de 11.2 a 11.7. No tiene que quedar nada azul con «%».

**A2. 12.5: el juego dice «4» un renglón antes de preguntar «¿A qué número se acercan?».** `src/ch12/scenes-b.js:62`
- Qué: si el jugador midió algún tramo hacia atrás (justo lo que el commit promueve), sale el `think` «Por la derecha
  dan menos que 4 y por la izquierda, más: lo encierran», y después la pregunta evaluada. Se ve en
  `c125-directa.out` (6.4 s → 7.7 s).
- Por qué importa: es la única decisión evaluada de la escena, y se resuelve leyendo la frase anterior (§8: «el juego
  piensa por el jugador»). Además afirma el 4 antes de que haya nada que lo muestre.
- Corrección: preguntar primero y decir lo de «encierran» después. Mejor aún, que el encierro lo decida el jugador:
  «Con 3,9 por la derecha y 4,1 por la izquierda, ¿dónde queda lo que buscamos?», con opciones como «entre los dos»,
  «abajo de 3,9» o «no se sabe».
- Comprobar: en `c125-directa.out`, ningún renglón anterior a la pregunta contiene «4» fuera de las etiquetas medidas.

## MEDIA

**M1. 12.6: el narrador encierra el 9 antes de preguntar, y a «6» no se le contesta con lo medido.** `src/ch12/scenes-b.js:134, 141`
- Qué: el `think` «por abajo dan menos que lo juntado y por arriba, más: lo encierran» aparece antes de «¿A cuántos
  baldes se acercan?». Con 8,25 y 9,75 en la tabla, sólo el 9 cabe en el medio. Y a quien elige «6: el último caudal»
  le contestan con la fórmula del triángulo, aunque en pantalla ya hay 7,5 y 8,25, que pasaron el 6.
- Corrección: la misma de A2 (el jugador elige entre qué números queda). A «6» hay que contestarle: «Ya con 6 pedazos
  juntamos 7,5: pasamos el 6».
- Comprobar: en `c126-errores.out`, la respuesta a «6» cita una suma de la tabla.

**M2. 12.5: con el orden libre, «la recta azul del final» puede ser la del tramo largo.** `src/ch12/scenes-b.js:65, 70`
- Qué: la recta que queda es la del último tramo elegido. Con la secuencia 1,1 → 1,5 → «Ya está» (que el código
  permite, `:53`), queda la de 1 a 1,5, y el estudiante dice que pasa «por dos puntos muy cercanos». La opción «Al
  último que salió» tampoco es lo que se quiere preguntar: el último ya no es el más corto.
- Corrección: antes del `say`, redibujar la recta del tramo más corto que se midió, o decir «la del tramo más corto».
  La opción quedaría «Al del tramo más corto que medí».
- Comprobar: con 0,1 → 0,5 → «Ya está», la captura final muestra la recta casi tangente.

**M3. 10.2: se puede parar en 90° y saltear lo nuevo, pero el cierre lo afirma igual.** `src/ch10/scenes-a.js:188, 237` y `scenes-b.js:390`
- Qué: «Ya está» aparece con 30, 60 y 90 (`full-tel/297`), así que pasar de 90° es optativo. Quien para ahí no ve el
  costado negativo ni que 120° tiene la altura de 60°. Igual el estudiante dice «A la izquierda del centro, el costado
  es negativo», y la Bitácora: «a 120°, la altura de los 60°».
- Corrección: pedir al menos un ángulo de más de 90° antes de «Ya está», o, si elige «Ya está» antes, hacerle la
  predicción de 120° de todas formas.
- Comprobar: ruta 30 → 60 → 90 → «Ya está». O no se ofrece, o aparece la pregunta de 120°.

**M4. 11.1: parar en 100 deja sin comprobar la pregunta de los mil, y el texto dice «lo vimos».** `src/ch11/scenes-a.js:79–80, 94, 96–97`
- Qué: «Ya está» se ofrece desde 100. En `c111-errores.out` el jugador para en 100 (66 %) y el estudiante dice «con
  muchos baldes… se acomoda… Eso lo vimos», con un solo punto después de 10. A «Exactamente dos de cada tres» se le
  contesta «a veces da justo y a veces un poco más o un poco menos», y en pantalla no hay nada que lo muestre. Además,
  «Otra tanda» sólo aparece en 100 o en 300: quien sube directo a 1000 no la ve nunca, porque el lazo corta.
- Corrección: «Ya está» recién desde 300 (o 1000), y ofrecer «Otra tanda» también después de 1000. A «Exactamente» hay
  que contestarle con números de la pantalla: «con 100 dio 66 %, con 300, 63 %: cerca, no clavado».
- Comprobar: con la ruta 10 → 100 → «Ya está» no se puede, o el texto no dice «lo vimos».

**M5. «volver a las opciones» queda por encima de la pausa y no se vuelve inerte.** `src/engine/ui.js:413`, `styles.css:106`, `ui.js:571`
- Qué: `#peek-back` se agrega a `body`, fuera de `#stage`, con `z-index: 6`, y `#pause` (adentro de `#stage`) no tiene
  z-index. Si alguien abre la pausa (≡ o Esc) mientras mira la pizarra, el botón queda dibujado sobre el diálogo, abajo
  al medio (en 390 px de alto tapa parte de la hoja). Se puede tocar: muestra `#choices` detrás de la pausa. También
  queda arriba de `#rotate` (z 5).
- Corrección: ponerlo adentro de `#stage`, agregarlo a la lista de `inert` de `showPause` y esconderlo al pausar. Al
  reanudar, devolverle el foco si se estaba mirando la pizarra (hoy va a `#stage`).
- Comprobar: con 844×390, ver la pizarra, apretar Esc y sacar una captura. El botón no aparece sobre la pausa.

**M6. «ver la pizarra» es el primero en el DOM y el último en pantalla, y la pausa le da el foco.** `src/engine/ui.js:371, 590`
- Qué: el botón se agrega antes que las opciones y se manda al final con `order: 99`. En Tab y en el lector va
  primero, antes de las respuestas (WCAG 2.4.3). Al reanudar desde la pausa, `querySelector('button')` lo enfoca a él:
  Enter esconde las opciones en vez de elegir. En `choose()` se usa `:not(.peek)`, pero en `showPause` no.
- Corrección: agregarlo después del lazo de opciones, sacar el `order`, y usar `button:not(.peek)` en la línea 590.
- Comprobar: con teclado, pausa → reanudar → Enter elige la primera opción. El lector lee el prompt y después las
  opciones.

**M7. En el teléfono, el peek no agranda la pizarra: los rótulos chicos siguen ilegibles.** varias escenas
- Qué: en 844×390 el peek saca el panel y vuelve al encuadre normal (la pizarra ocupa ~380 px; con el panel, ~255).
  Los valores de tamaño 17–19 se leen, chicos (`300-c10.alto-pizarra`, `377-c12.rapido-pizarra`). Los de 13–15 no:
  los encabezados «giro / alto / costado», la escala de 11.1, las horas de 9.8 (`peek-c98-tel/002`: el «10» que pide
  la pregunta mide ~7 px). Con el panel abierto la tabla de 10.2 es ilegible (`301`), y la predicción de 120° necesita
  leer la fila de 60°. En escritorio, la curva azul de 11.1 pasa por encima de «73 %» y «66 %», y su punto final
  pisa el «2/3» (`c111b-directa/007`).
- Corrección: en el peek, acercar la cámara a la pizarra (no sólo esconder el panel), o subir el mínimo de los rótulos
  a ~18 en pantallas bajas. En 11.1, poner las etiquetas azules donde no las cruce la otra curva.
- Comprobar: en `full-tel` nuevo, los encabezados de 10.2 y las horas de 9.8 se leen en la captura de la pizarra.

**M8. La partida completa en el teléfono es anterior a 10.6 y 12.6.** `artifacts/arithmos/it11/full-tel/log.txt`
- Qué: el commit f0e6859 dice «partida completa en 844×390… sin errores», pero `full-tel/log.txt` (04:15) no tiene
  «punta de (3, 1)» ni «pedazos partís»: en 12.6 el bot contesta directo la pregunta final. `c106-*` y `c126-*` son
  de 1600×900. Las elecciones nuevas de 10.6 y 12.6 no se corrieron en el teléfono. Ese mismo bot tampoco vio A1.
- Corrección: volver a correr `full-tel --peek` y anotar en ESTADO qué versión cubre (§13).
- Comprobar: el log nuevo contiene las dos preguntas y la captura `*-c12.junta-pizarra`.

## BAJA

- **B1.** `ch10/scenes-a.js:177`, `ch12/scenes-b.js:45, 116`: las tablas se arman en el orden
  en que el jugador elige, no por ángulo ni por tramo. Con 90 → 30 → 150 → 60, el patrón «baja como subió» cuesta
  verlo. Cada valor debería tener su renglón fijo.
- **B2.** `ch10/scenes-a.js:205`: si el primer giro es a 150°, el `think` dice «0,5, como a 30°», y 30° todavía no
  está en la tabla (el «Medio rayo justo» llega después del lazo). Conviene decir «como va a dar a 30°» o comparar
  sólo con filas que ya estén.
- **B3.** `ch12/scenes-b.js:304`: quien eligió «Al último que salió» recibe en la Bitácora «aunque con tramo cero no se
  pueda dividir», que es la respuesta a la otra opción. Hay que escribirle su propia línea.
- **B4.** `ch11/scenes-b.js:288`: «cuando ya se veía adónde iba» es un juicio del juego, no algo que hizo el jugador.
  Alcanza con «Paraste en 100 baldes».
- **B5.** `ch11/scenes-a.js:70, 88`: las dos tandas se distinguen sólo por color: «64 %» amarillo, «67 %» azul (§9:
  nada esencial sólo con color). El «90 %» de la otra tanda con 10 baldes sólo está en el `think`. Conviene rotular
  «otra tanda» y marcar su punto en 10.
- **B6.** Peek (`ui.js:364–371, 405–411`): el `aria-label` («Esconder las opciones…») no contiene el texto visible
  «ver la pizarra» (WCAG 2.5.3, control por voz). El blanco mide ~22 px de alto (2.5.8 pide 24). Al volver no se
  rearma la guarda de 450 ms, así que un Enter que se repite al mantenerlo apretado elige la primera opción. Al lector
  el peek no le da nada: conviene repetir en `#sr-live` la última descripción de la pizarra. No encontré forma de
  quedar trabado: `reset()` lo esconde (`ui.js:558`) al cambiar de escena, repetirla o volver al título.

## Lo que está bien

- Matemática verificada con node. 10.2: sen y cos con dos decimales y signo (120°: 0,87 / −0,5; 150°: 0,5 / −0,87;
  90°: 1 / 0, sin «−0»). 12.5: 4 − h → 3; 3,5; 3,9; 3,99; 4,1; 4,01, y la recta pasa por los dos puntos. 12.6: sumas
  9(n ∓ 1)/n → 6; 7,5; 8,25; 8,7 (sin «8,700000001», `dec` redondea); 9,75 por arriba. 11.1: con 10, 70 % y 90 %; con
  1000, 64 % y 67 % («muy distinta», «cerca de dos tercios»: correcto). 10.6: (−1, 3); (1, −3) es a favor del reloj;
  (−3, 1) es el reflejo en el eje parado.
- Las predicciones nuevas (10.2 pasando 90°, 10.6) son decisiones de verdad: los distractores son errores típicos, cada
  uno trae su razón, se barajan (`director.js:161`) y se contestan en sus propios términos.
- Bitácora 10: las líneas de `sin-past90-predict` y `quarter-predict` atribuyen sólo lo que el jugador eligió.
- Peek: el foco va a «volver» y de ahí a la primera opción; el bot excluye `.peek`; `abort()` → `reset()` lo esconde.
