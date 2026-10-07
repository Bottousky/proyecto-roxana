# Revisión independiente (matemática + agencia) — 6.4, 9.2, 9.4, 12.1, 12.4

Commits revisados: 0e2ef9d (6.4), b89b211 (12.1 / 12.4 / Bitácora 12), 843ed15 (9.4), 51810f2 (9.2).
Leí los diffs, las escenas enteras, `logic/functions.js`, las bitácoras de 5, 6, 9 y 12, los logs del bot y las capturas que me pasaron. Además miré `artifacts/arithmos/it10/full-1a12/state.json` para ver cómo quedan las bitácoras en una partida completa.

Resumen: la matemática nueva está bien casi toda (identidad, la recta parada, el reflejo de x · x y √x). Los problemas serios son de **atribución en la Bitácora** (un bug que ya está en partidas completas) y de **agencia en 9.2** (la regla se puede sacar probando las 12 combinaciones sin pensar). La definición de asíntota de la Bitácora 12 es falsa en general.

---

## ALTA

### A1. La Bitácora 12 lee la respuesta del cap. 9 (choque de `inverse-predict`); el cap. 5 escribe «undefined»
- **Dónde:** `src/ch12/scenes-b.js:286` (`first('inverse-predict')`); el evento se registra en `src/ch9/scenes-a.js` (9.1, sombra 2) y en `src/ch12/scenes-a.js` (12.4). Mismo tipo de bug en `src/ch5/scenes-b.js:502` (`first('cut')` encuentra primero el `cut` de `c4.partir`).
- **Qué:** `writeJournal12` filtra por *run*, no por escena. En una partida 1→12, `first('inverse-predict')` devuelve el evento de 9.1 (`answer: 'both'`), que nunca vale `'right'`. Entonces la Bitácora dice «Para deshacer «el doble más uno» probaste otro orden» aunque el jugador acertó. Pasa en `it10/full-1a12/state.json`: la evidencia tiene `both` (c9.flechas) y `right` (c12.encadenar), y la Bitácora muestra la línea de error. En esa misma partida, la Bitácora 5 dice «Cortaste las barras en undefined…».
- **Por qué importa:** se rompe la regla (4), «la Bitácora le atribuye sólo lo que hizo». Pasa en **toda** partida completa, y las corridas por capítulo no lo detectan porque arrancan con la evidencia vacía.
- **Corrección:** la evidencia ya trae `seg`. Hay que filtrar por `e.seg === 'c12.encadenar'` y `e.seg === 'c5.barras'`, o renombrar los tipos (`undo-predict`, `bar-cut`). También conviene un test que juegue de corrido (o que cargue `full-1a12/state.json`), corra `writeJournal*` y verifique que no aparece `undefined` y que la línea del 12 coincide con lo que se respondió en 12.4. Hay que revisar también `count` (c1/c11) y `scale` (c4/c8): hoy no hacen daño porque el capítulo que los usa va antes, pero conviene confirmarlo.

### A2. 9.2: la regla se saca probando combinaciones; la segunda pieza se elige a ciegas
- **Dónde:** `src/ch9/scenes-a.js:156-186`.
- **Qué:** hay 3 × 4 = 12 combinaciones, los intentos no tienen límite ni costo, y la máquina hace la cuenta y la comparación por el jugador («da 6» en azul al lado de «5»). Para ganar alcanza con tocar y mirar el color. Después de elegir la primera pieza no se muestra lo que da (× 2 → 2, 4, 6), así que la segunda («+ 1») no sale de mirar la diferencia: se adivina. Probé las combinaciones: con cualquier terna de {1, 2, 3, 5} sólo × 2 + 1 cumple todos los renglones, así que la unicidad está bien. Lo que falla es que se llega a la respuesta sin entender por qué. Encima, la pregunta que sigue («Si entra 10…», `:189-194`) ya no exige pensar nada, porque la regla está escrita en la máquina.
- **Por qué importa:** contradice el contrato (§5/§8, «el jugador toma el paso decisivo» y «no se resuelve sin entender»), y es justamente lo que el commit dice que agrega.
- **Corrección (una de estas):** (a) después de la primera pieza, escribir en la columna «tu regla» lo que da esa pieza sola (2, 4, 6 contra 3, 5, 7), así la segunda pieza se elige leyendo «le falta 1 a cada uno»; (b) después de dos reglas fallidas, que Mara señale el paso entre renglones («de 1 a 2 sale 2 más: ¿qué pieza hace eso?»); (c) en vez de preguntar por el 10, preguntar por un número que el jugador no haya probado, con opciones que no se lean en la máquina. **Cómo comprobar:** una ruta de bot que elija al azar debería necesitar en promedio unos 6 intentos; con (a), un jugador que razona acierta la segunda pieza siempre. Si se registra `rule-try` con el paso intermedio, el log tendría que mostrar que la segunda elección siguió a la diferencia mostrada.

### A3. 9.2: «otra cosa con el 5» contradice la pizarra cuando el jugador ya probó el 5
- **Dónde:** `src/ch9/scenes-a.js:196` (la línea es anterior, pero con el cambio pesa más: ahora el jugador arma la regla contra esos mismos renglones).
- **Qué:** el jugador elige 3 de {1, 2, 3, 5} (`:140`), y 3 de las 4 ternas posibles incluyen el 5. En esos casos «otra regla rara podría dar lo mismo con estos números y otra cosa con el 5» es falso: el 5 es uno de «estos números» y está anotado («5 → 11»).
- **Por qué importa:** es una afirmación que la evidencia en pantalla desmiente (§13).
- **Corrección:** nombrar un número que no se haya probado (`INS.find(x => !seen.some(r => r[0] === x))` o directamente «con un número que no probamos»). **Cómo comprobar:** una ruta de bot que alimente 1, 3 y 5 y lea la línea.

---

## MEDIA

### M1. Bitácora 9: la línea de `rule-predict` atribuye mal
- **Dónde:** `src/ch9/scenes-b.js:319`.
- **Qué:** si elige 20 o 13, dice «Con pocos casos pensaste otra regla». Pero a esa altura el jugador ya armó y probó × 2 + 1, y la regla está escrita en la máquina. Elegir 20 es olvidarse del «+ 1» al aplicarla, no pensar otra regla.
- **Corrección:** algo como «Con la regla armada, para el 10 elegiste 20: faltó el + 1; salió 21». **Comprobar:** `c92-errores`, que elige 20, tiene que mostrar la línea nueva.

### M2. 9.4: se puede decidir sin mover la recta, y una vez abierto el panel no se puede volver
- **Dónde:** `src/ch9/scenes-a.js:394-441` («decidir» aparece apenas se elige el dibujo, con `moves = 0`); la Bitácora en `scenes-b.js:325` ignora `moves` y `sawTwo`.
- **Qué:** cada decisión es binaria, así que adivinando se acierta la mitad. Con la recta en −2,5, el círculo y la U acostada dicen «no corta», lo que empuja a decir que «puede ser». La corrección muestra el contraejemplo (está bien), pero el jugador que adivina bien con la recta o la U no ve nada. Además, el panel de elección no tiene «seguir mirando», y con un dibujo elegido no se puede cambiar a otro.
- **Corrección:** habilitar «decidir» recién cuando la recta pasó por al menos 3 lugares, o cuando cruzó el centro. Agregar una opción «Seguir mirando» que cierre el panel. En la Bitácora, usar `moves`/`sawTwo` («Al círculo lo decidiste sin mover la recta; en la entrada 0 lo cortaba dos veces»). **Comprobar:** en la ruta `errores` del bot (círculo apurado), «decidir» no tiene que estar disponible con `c9Moves = 0`.

### M3. 9.4: «entrada 0» y «entrada −2,5» no se leen en la pizarra
- **Dónde:** `src/ch9/scenes-a.js:373` (el eje es una raya sin marcas), `:399` (describe) y `:453` (nota «En la entrada 0…»).
- **Qué:** la nota y el texto para lector de pantalla nombran entradas con número, pero los cuatro dibujos no tienen ni un 0 ni marcas. Quien ve la pantalla no puede relacionar «entrada 0» con nada.
- **Corrección:** dibujar una marca y un «0» en el centro de cada eje, o escribir la entrada al pie de la recta parada («entrada 0»). **Comprobar:** en la captura del contraejemplo (`c94-errores`), el 0 tiene que verse al pie de la recta azul.

### M4. Bitácora 12 y 12.1: la definición de asíntota es falsa en general
- **Dónde:** `src/ch12/scenes-b.js:299` («la raya a la que se pega sin tocarla es una asíntota») y `src/ch12/scenes-a.js:79` («pegadas… sin tocarla nunca»).
- **Qué:** que la curva no toque la raya no define una asíntota. Hay curvas que cortan su asíntota horizontal (y = sen x / x corta y = 0 infinitas veces), y una función definida aparte en el punto puede tocar su asíntota vertical. Lo que define una asíntota es que la distancia a la raya se achica tanto como se quiera. Para 1 ÷ (x − 2) en particular lo que se dice es cierto, pero la Bitácora lo presenta como regla general. La asíntota horizontal ya está planeada (J-gap), y ahí esta frase va a quedar desmentida.
- **Corrección:** en la escena, «en esta no la toca nunca, porque en 2 no está definida»; en la Bitácora, «la raya a la que la curva se acerca cada vez más, tanto como uno quiera, es una asíntota».

### M5. 12.4 contra 12.1: la «familia de las raíces» se describe igual que la del «¿cuántas veces?»
- **Dónde:** `src/ch12/scenes-a.js:276` («Es la familia de las raíces: sube cada vez más despacio»), contra `:69` y la Bitácora (`scenes-b.js:299`, «curvas que suben cada vez más despacio» como una sola familia).
- **Qué:** 12.1 dice que «cada forma es una familia» y que se reconoce por la forma. Ahora dos familias tienen la misma descripción. Además, la miniatura del logaritmo también baja pegada al eje parado y no está definida en 0: con la definición nueva, ese eje es una asíntota, y el juego no lo dice. Un jugador atento queda con una contradicción.
- **Corrección:** distinguirlas con lo que se ve: «la raíz arranca en el 0 y ahí vale 0; la del “¿cuántas veces?” no llega al 0: se hunde pegada al eje». O no llamar «familia» a la raíz y quedarse con «es x · x dada vuelta». **Comprobar:** leer juntas 12.1, 12.4 y la Bitácora: ninguna descripción de forma tiene que encajar en dos familias.

### M6. 12.4: el reflejo es sólo cinemática y no hay ningún par (a, b) ↔ (b, a) que se pueda leer
- **Dónde:** `src/ch12/scenes-a.js:261-276`.
- **Qué:** con la ventana [0, 3] y marcas en 1, 2 y 3, los únicos puntos legibles de x · x son (0, 0) y (1, 1), y los dos están sobre la diagonal, o sea que no se mueven al reflejar. «Cada punto (a, b) de una es el (b, a) de la otra» no tiene ningún ejemplo visible. El jugador además no hace nada: se dibuja y se afirma.
- **Corrección:** usar la ventana [0, 4] con marcas en 1 a 4: x · x llega a (2, 4) y √x a (4, 2). Marcar ese par con dos puntos y un trazo perpendicular a la diagonal. Mejor todavía: que el jugador toque dónde cae el reflejo de (2, 4) antes de que se dibuje la amarilla. **Comprobar:** en la captura tiene que verse un par no trivial con las coordenadas legibles.

### M7. Bitácora 12: «Reconociste las seis formas» exagera, y `bad` cuenta intentos, no formas
- **Dónde:** `src/ch12/scenes-b.js:283`; `src/ch12/scenes-a.js:62`.
- **Qué:** la sexta forma se resuelve por descarte, en un panel con una sola opción (`PICKS.filter(...)`), que encima es un «apretar continuar». Y `bad` cuenta eventos fallidos: probar mal la misma forma tres veces produce «3 las probaste en otra familia», cuando fue una sola forma.
- **Corrección:** usar `new Set(fam.filter(e => !e.ok).map(e => e.family)).size`. Decir «cinco formas, y la sexta por descarte», o ubicar la última sola, sin panel. **Comprobar:** una ruta de bot que falle tres veces la misma forma.

### M8. 9.2: con salidas de dos cifras los renglones se pisan
- **Dónde:** `src/ch9/scenes-a.js:175` («da r» en `A.x0 + 100`) y `:127` (el número que entra arranca en `mx − 60 = A.x0 + 110`, `my + mh/2 + 10`, que es la altura del tercer renglón).
- **Qué:** midiendo en `c92-errores/005`, «3 → 7» ya termina pegado a «da». Con «5 → 11» el «11» se mete en el «da», y «da 11», «da 15» o «da 17» en el tercer renglón llega al soporte de entrada de la máquina. Cuando entra el 10, su número aparece encima de «da 7». Es justo la comparación que el jugador tiene que leer.
- **Corrección:** correr la columna «tu regla» a `A.x0 + 120` y mover la máquina, o achicar los renglones. **Comprobar:** una ruta de bot que alimente 1, 2 y 5 y pruebe × 3 + 2, y mirar la captura.

---

## BAJA

- **B1. 6.4, la frase con «como»** (`src/ch6/scenes-a.js:355`): «0 · (x − 3) = 0 · 5 se cumple con cualquier x, como «ir tres para atrás y volver tres»» se puede leer como si esa fuera la razón. Sugerencia: «Por cero, todo da 0, con cualquier x. Lo mismo pasa con x − 3 + 3 = x («ir tres para atrás y volver tres»): también vale para cualquier x». La matemática está bien: ecuación contra identidad es la distinción escolar habitual, y es coherente con 6.2 (`:199`) y con 6.6 (x · x ÷ x no vale en 0).
- **B2. 6.4, pizarra** (`:356`): «vale para cualquier x: identidad» queda debajo de «0 = 0», sin flecha que diga a qué renglón se refiere, y «x − 3 = 5» no tiene su rótulo «ecuación». El nombre no se pone a prueba: un chequeo corto sería mover a Punto sobre x − 3 + 3 = x y ver que los marcadores no se separan.
- **B3. Cap. 6, accesibilidad**: el describe nuevo (`scenes-a.js:26`) cubre sólo `writeDeriv`. Los renglones de los personajes, que son justo los que hay que criticar, no llegan al lector de pantalla: `d6-r1` «x = 5 + 3 = 8» (`:255`), `d6-z1`/`d6-z2` (`:331-333`), `d6-q1` (`scenes-b.js:46`), `d6-v1`/`d6-v2` (`:93-95`). El commit dice que «las derivaciones del cap. 6 llegan al lector»: no es del todo así. Se arregla con un `d.describe` después de cada `d.draw` de esos renglones.
- **B4. 9.4, textos del describe**: «corta a el círculo» (`:447` y el de la entrada 0, `:442`) tendría que ser «al círculo». `String(bx)` da «-2,5» con guion ASCII; en el resto del juego se usa «−». En el borde (±3), «mover» no hace nada y no avisa (`:417`); conviene describir «la recta ya está en el borde».
- **B5. 9.4, tangentes**: en ±2 sobre el círculo y en −1,5 sobre la U acostada, el cartel dice «corta 1 vez», pero la recta toca sin cruzar. Matemáticamente no es incorrecto como conteo de puntos, aunque «toca en un punto» es más preciso. La nota de error (`:453`) podría nombrar el error de método: «una entrada con una sola altura no alcanza: hay que mirar todas».
- **B6. 9.4, «todas las entradas»** (`:447`, `:453`): el barrido recorre 13 posiciones. Es mejor decir «de punta a punta, corta siempre una vez» que afirmar «todas».
- **B7. 9.4, layout** (captura `c94b-directa/004`): el rótulo «función» de la recta queda pegado al extremo de arriba de la recta azul y de la U de abajo (`:452`, `c.y + 3.6K + 4`). El contador «corta 1 vez» está siempre arriba al centro, lejos del dibujo de abajo que se está mirando.
- **B8. 9.2, panel de la segunda pieza** (`:161`): no repite la primera («× 2, y después…»). Quien usa lector de pantalla o se distrae elige sin ver la mitad de la regla. La Bitácora lista intentos repetidos tal cual (`scenes-b.js:317`): conviene deduplicar.
- **B9. 9.2, colores**: acierto en amarillo y error en azul, sin otra marca. Los números alcanzan para comparar, pero un «≠» en los renglones que fallan ayudaría, y además el azul es el color de los rótulos.
- **B10. 12.1, palabras**: «Donde una curva se corta» (Bitácora `:299`, escena `:79`) choca con «corta» = «cruza», que se usa en 9.4 («la recta parada corta el dibujo»). Mejor «se parte» o «se interrumpe». La discontinuidad se nombra pero no se marca en la pizarra (sólo aparece «asíntota»). Llamar «discontinuidad» al corte de 1 ÷ (x − 2) es la convención escolar (en rigor, la función es continua en su dominio), así que está bien para el nivel. La curva también se pega al eje acostado (y = 0, asíntota horizontal) y el juego no lo menciona; queda para el J-gap.
- **B11. 12.4, dibujo** (`:266`): con `n: 30`, x · x termina en (1,7; 2,89) y no llega a (√3, 3), mientras que √x sí llega a (3, √3): en el borde el espejo no es exacto (unos 4 px). Se arregla muestreando hasta √3. La marca «3» del eje parado toca la caja «x · x» de arriba (captura `019`).
- **B12. 12.1, asíntota con lector de pantalla**: el describe de la raya (`:77`) está bien. Falta decir que la raya está en el 2 («la raya punteada, en el 2, donde no se puede repartir»), que es lo que la conecta con 7.9.

---

## Lo que está bien (para no tocar)
- 6.4: «ecuación» (pregunta para qué x se cumple) contra «identidad» (vale para cualquier x) es correcto y coincide con la Bitácora 6. «Por cero la ecuación se vuelve una identidad» es cierto para cualquier ecuación.
- 9.4: `crossings()` es exacto y coincide con los dibujos (el test lo cubre). Los conteos de cada posición son correctos (círculo: 0 si |x| > 2; U acostada: 0 si x < −1,5). Que la recta empiece en −2,5, donde todavía no se ve el «2 veces», es una buena decisión. El contraejemplo en 0 es correcto (±2; ±2,12).
- 9.2: con cualquier terna, × 2 + 1 es la única combinación que cumple. «Coincide con todo lo anotado» y después «coincidir no prueba la regla» es la secuencia epistémica correcta.
- 12.4: en la ventana cuadrada, las dos curvas son reflejo exacto una de la otra. «(si x ≥ 0)» es coherente con 7.1 («la raíz es la positiva»), y la notación (a, b) ya se usaba en los caps. 8 y 10.
