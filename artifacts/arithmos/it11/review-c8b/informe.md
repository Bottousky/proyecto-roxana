# Revisión rev-c8b: 7.7, 9.1 y 9.8 (matemática + agencia)

Commits: 4307944 (7.7), 4d91eae (9.1), b862e1d (9.8). Leí el código, los logs `c77-errores.out`, `c91-errores.out`,
`c98-errores.out` / `c98-directa.out` y las capturas indicadas, más `c98c-directa/003` (posterior al commit) y
`c91-tel/002`, `c91-tel/021` (teléfono). Rutas relativas a `experiments/arithmos/`.

Resumen: hay 2 ALTA, 8 MEDIA y 7 BAJA. Las dos ALTA son frases falsas en su lectura literal que el juego contradice
dos renglones antes o dos renglones después. Lo demás es coherencia, a quién se le atribuye el mérito y legibilidad.

## ALTA

**A1. 7.7: «La raíz de (x + 1)² no es x + 1».** `src/ch7/scenes-b.js:663`
- Qué: es falso cuando x + 1 ≥ 0. Con x = 2, que es justo el caso que se acaba de resolver, √((x + 1)²) = √9 = 3 = x + 1.
  Dos renglones antes el estudiante dijo «un cuadrado de nueve tiene lado 3. Entonces x + 1 = 3», o sea, usó que la raíz *es* x + 1.
- Por qué importa: es la frase nueva central del commit y se contradice con la anterior. Un jugador atento puede concluir
  que «x + 1 = 3» estaba mal.
- Corrección: «no siempre es x + 1: es lo lejos que está x + 1 del cero. Si x + 1 es positivo, es x + 1; si es negativo,
  no». Mejor todavía, escribirlo con las barritas del cap. 3 (ver B5): √((x + 1)²) = |x + 1|.
- Comprobar: correr `c77-directa` y leer la línea en el log: tiene que decir «no siempre» o algo equivalente.

**A2. 9.8: «va a medir 4» y «Todos los días el sol da la misma vuelta», dichos sin condición.** `src/ch9/scenes-b.js:310`
- Qué: la opción correcta dice «4… *si el sol sigue dando la misma vuelta*», pero en las dos ramas el estudiante afirma
  sin condición «va a medir 4» y «Todos los días el sol da la misma vuelta». En la línea 311 el juego mismo dice que en
  invierno la ve cambia mucho. Diez días alcanzan para que la sombra de las 8 cambie: cerca del equinoccio, la altura del
  sol a esa hora se mueve 1–2°, y con el sol a ~14° (sombra ≈ 4 veces la altura) eso da entre ≈ 3,5 y ≈ 4,7.
- Por qué importa: el contrato pide no afirmar más de lo que hay en pantalla, y hay tres días medidos. Además, 9.2 enseñó
  que «coincidir no prueba la regla… otra cosa con uno que no probamos, como el 100» (`src/ch9/scenes-a.js:240`). «Dentro
  de diez días» es el 100 de esta escena. La rama «No se puede saber: no lo medimos» se rebate con «Medido no está, pero
  el patrón se repite», que es justo la inferencia que 9.2 dijo que no prueba nada.
- Corrección: que el estudiante diga «Si el sol sigue dando la misma vuelta, unos 4. No es una medición: es anticipar».
  A «No se puede saber» hay que contestarle en sus términos: «Medido, no. Anticipado, sí, suponiendo que el sol repite;
  diez días después lo medimos y vemos». Hay que sacar «Todos los días el sol da la misma vuelta» como hecho.
- Comprobar: en `c98-errores.out` y `c98-directa.out`, ninguna línea dice «va a medir 4» sin la condición.

## MEDIA

**M1. 7.7: «por sí mismo» se puede leer como «solo, sin ayuda».** `src/ch7/scenes-b.js:673, 675, 680`
- Qué: «un número de la recta, por sí mismo, nunca da negativo» se lee naturalmente como «un número, solo, nunca es
  negativo», que es falso (−3 lo es). Hasta el cap. 7 el juego decía siempre «*multiplicado* por sí mismo» (6.x
  `ch6/scenes-b.js:331`, 7.1 `ch7/scenes-a.js:160`). El atajo «por sí mismo», entre comillas, recién se define en 9.6
  (`ch9/scenes-b.js:127`).
- Corrección: «multiplicado por sí mismo» en las tres frases (y en la 673: «sólo el 0, multiplicado por sí mismo, da 0»).
- Comprobar: `grep -n "por sí mismo" src/ch7` no tiene que encontrar la forma sin «multiplicado».

**M2. 7.7 adelanta el hallazgo de 9.6 con la misma frase y el mismo −4.** `ch7/scenes-b.js:675` y `ch9/scenes-b.js:127, 158`
- Qué: la opción correcta de 7.7 es igual, palabra por palabra, a la de 9.6 («No: un número de la recta, por sí mismo,
  nunca da negativo»), y el número es el mismo (−4). En 9.6 Mara lo plantea como algo nuevo («Oval me pidió… un −4»),
  y las dos Bitácoras anotan «Viste que…». Un jugador que pasó por 7.7 reconoce la frase y elige sin probar la máquina.
- Corrección: elegir una de dos. (a) En 9.6 nombrar lo ya visto («Como con (x + 1)² = −4 en la huerta: ¿y qué *sí*
  puede salir?») y poner la decisión en la imagen, que sí es nueva. (b) En 7.7 usar otro número y otra redacción, y
  dejar que 9.6 lo generalice.
- Comprobar: en la partida 1 → 12 con errores, las dos escenas no muestran el mismo texto de opción.

**M3. Bitácora 7: el texto atribuye pruebas que el jugador no hizo.** `src/ch7/scenes-b.js:880`
- Qué: en las ramas `two` y `one` dice «buscaste un número; los que probaste dan 4». El jugador eligió una opción; la
  cuenta la hizo el juego (y en la rama `two` sólo con x = 1, ver B1). En la rama `one` hay un solo número y el plural
  «los que» no corresponde.
- Corrección: «Para (x + 1)² = −4 elegiste x = 1 y x = −3 (o «x = −3»); con esos da 4, no −4: en la recta, ninguna».
- Comprobar: con la ruta con errores, la Bitácora 7 no dice «probaste» en esa línea.

**M4. 9.8: tiempos y días que no cierran.** `src/ch9/scenes-b.js:264, 280–284, 289`
- Qué: Cornisa ya «siguió midiendo, varios días», así que el día 2 ya está medido. Igual se pregunta «Mañana… ¿cuánto
  *va a* medir?», y el hint dice «aparece lo que Cornisa midió mañana», que mezcla pasado con mañana. La opción «2, como
  hoy a las 10» llama «hoy» al día 1, pero en 9.1 esa misma tabla es «la tabla de ayer».
- Corrección: «Al día siguiente, a las 10, ¿cuánto habrá medido?» u «El día 2 a las 10…»; hint: «aparece lo que midió
  el día 2»; opción: «2, como el día 1 a las 10».
- Comprobar: leer el prompt y el hint en `c98-directa.out` / captura 002.

**M5. 9.8: quien comprueba es el juego, no el jugador.** `src/ch9/scenes-b.js:286–302`
- Qué: la predicción ahora va antes (bien), pero la interacción sigue siendo apretar «otro día» dos veces. La lectura «a
  las 10, 2» la dan `d.describe` y `d.think`. Además, a «No se puede saber: mañana es otro día» se le contesta con
  «Se podía anticipar: el día 2… midió 2», que es mirar el resultado después, no un argumento.
- Corrección: después de dibujar el día 2, que el jugador toque el punto de las 10 de ese día (o elija la altura) y vea
  que da 2. A «no se puede saber» hay que contestarle en sus términos: «Con un solo día no se sabe; se anticipa con lo
  que sabemos del sol, y después se mide».
- Comprobar: en el bot hay una acción del jugador sobre el día 2 antes del `think` de la línea 302.

**M6. 9.8: el lector de pantalla no recibe el día 1 antes de la pregunta.** `src/ch9/scenes-b.js:277`
- Qué: `drawDay(0)` no llama a `describe`, así que no se describen ni los valores (4, 2, 1, 2, 4) ni las horas rotuladas.
  Hoy la pregunta «Mañana a las 10» sólo se puede contestar mirando, o leyendo la pista de la opción «como hoy a las 10».
- Corrección: `d.describe('Día 1 dibujado: a las 8, 4; a las 10, 2; a las 12, 1; a las 14, 2; a las 16, 4. Una ve.')`
  antes del `choose`.
- Comprobar: con «describir acciones» activado, esa descripción aparece antes de la pregunta.

**M7. 9.1: la «tabla de ayer» no es la de ayer, y la flecha cambió de significado.** `src/ch9/scenes-a.js:37–40` y
`src/ch8/scenes-b.js:369`
- Qué: en 8.8 la tabla decía «8 h: largo 4 →» y «14 h: largo 2 ←»: la flecha era *para qué lado* apuntaba la sombra.
  La copia de 9.1 dice «8 h → 4» y «14 h → 2»: ahora la flecha significa «le toca» y la dirección desaparece. Así, la de
  las 14 aparece con → aunque ayer apuntaba ←. Justo al final de la escena el estudiante dice «si además decís para qué
  lado apunta, ahí sí se distinguen»: esa información estaba en la tabla de ayer y la copia la borró.
- Corrección: copiarla como era («8 h: largo 4») sin flechas, o con la dirección en una columna gris y la frase final
  señalándola.
- Comprobar: en la captura 004 de 9.1, la tabla no usa → con otro significado.

**M8. 9.1: el juego dice que hay otra hora; el jugador no lo decide.** `src/ch9/scenes-a.js:85, 104`
- Qué: después de la primera flecha al revés, el hint pregunta «¿Qué otra hora tenía sombra 2?» y la interacción no
  termina hasta que haya dos. El jugador que eligió «Las 10» nunca tiene que decidir si hay otra: se la anuncian. Y se
  puede ganar tocando horas al azar, porque las incorrectas sólo muestran una nota.
- Corrección: después de la primera flecha, ofrecer «ya está, no hay más» o seguir buscando. Si elige «ya está», se le
  señala el renglón «14 h» de la tabla. El hint neutro sería «¿Hay otra hora con sombra 2?».
- Comprobar: en la ruta con errores, el bot elige «ya está» después de las 10 y recibe la refutación con la tabla.

## BAJA

- **B1.** `ch7/scenes-b.js:680`: en la rama `two` («x = 1 y x = −3») sólo se prueba x = 1. Hay que agregar «con x = −3,
  (−3 + 1)² = 4».
- **B2.** `ch7/scenes-b.js:673`: a «el 0 no es el área de ningún cuadrado» se le contesta afirmando lo contrario («un
  cuadrado de área 0 tiene lado 0»). Mejor responder en sus términos, con la cuenta: «Sin la huerta: con x = −1,
  (−1 + 1)² = 0 · 0 = 0. Cumple».
- **B3.** `ch7/scenes-b.js:665–682`: (x + 1)² = 0 y (x + 1)² = −4 sólo aparecen en el prompt; en la pizarra no quedan
  escritas. El resumen amarillo «= 9: dos = 0: una = −4: ninguna» no tiene el lado izquierdo ni «en la recta», y el
  lector lo lee tal cual («En la pizarra: = 9: dos…»). Corrección: escribir «(x + 1)² = 0» y «(x + 1)² = −4» al
  preguntar y «ninguna en la recta» en el resumen.
- **B4.** En 7.7, Q2 (−4), y en 9.8, la transferencia: la opción correcta es la única que trae justificación o la
  condición («Ninguna en la recta: …», «4, … si el sol sigue…»), mientras que las incorrectas son números sueltos o
  frases cortas. Un jugador que no entendió puede acertar eligiendo la opción más «matizada». Hay que darles razón a
  las opciones incorrectas también.
- **B5.** `ch7/scenes-b.js:663, 892`: se pierde la ocasión de enlazar con el cap. 3 («lo lejos que está un número del
  cero se escribe con barritas: |−4| = 4», `ch3/scenes-b.js:553`). Escribir √((x + 1)²) = |x + 1| en la pizarra lo
  conecta y hace que A1 sea exacta.
- **B6.** `ch9/scenes-a.js:107, 114`: en la rama «Las 10» salen seguidos «Del 2 salen dos flechas.» y «Las 10 o las 14:
  del 2 salen dos flechas.» (se ve en `c91-errores.out`). Hay que dejar uno solo.
- **B7.** `ch9/scenes-b.js:346`: la Bitácora dice «anticipaste que *mañana* a las 10…». Leída días después, «mañana»
  confunde; mejor «el día 2».

## Disposición y legibilidad

- 7.7 (`c77b-directa/007`): bien. La captura es anterior a «cq-eq5» y la escena siguiente lo borra, así que **no está
  verificado**. Según las coordenadas cae dentro del marco, debajo de «x = 2 o x = −4». Conviene sacar una captura
  después de escribirlo.
- 9.1 (`c91-errores/002`, `004`): en escritorio, bien. En teléfono (`c91-tel/002`) el título «la tabla de ayer» (tamaño
  15) no se lee y los renglones (18) apenas. El hint manda justo ahí, así que sube a MEDIA si se confirma en 844×390.
  Las flechas de ida al 0,3 casi no se ven, pero no hace falta verlas.
- 9.8 (`c98c-directa/003`): en escritorio, el «2» del eje y las horas (tamaño 12) se leen, chicas. `c98b/004` es
  anterior al «2». **No hay corrida de teléfono de la 9.8 nueva**. En la vieja (`c91-tel/021`) el «4» y el «1» de tamaño
  16 ya medían ~5 px, así que las horas de tamaño 12 van a ser ilegibles, y ahora las dos preguntas dependen de leer las
  10 y las 8. Hay que correr la 9.8 en teléfono y subir el tamaño o rotular en la descripción.

## Lo que está bien

- Las cuentas de 7.7 son correctas: (x + 1)² = 0 → x = −1; (x + 1)² = −4 no tiene solución real; el test cubre
  x² + 2x + 5 ≥ 4. La regla «positivo: dos; cero: una; negativo: ninguna en la recta» tiene razón (la distancia) además
  de ejemplos. Los distractores de Q1/Q2 (dos «como con el 9», ±2 tomando la raíz de 4) son errores reales.
- 9.1: la tabla coincide con 8.8 (4, 2, 1, 2, 4). La nota ante una hora equivocada contesta en sus términos («A las 8 la
  sombra medía 4, no 2»). Las etiquetas de los puntos tocables y las descripciones de cada flecha están bien.
- 9.8: anticipar antes de ver resuelve el «botón único» de antes. Las líneas nuevas de la Bitácora atribuyen lo que el
  jugador eligió. La transferencia a «dentro de diez días, a las 8» es una buena pregunta nueva (cambia la hora y la
  distancia).
