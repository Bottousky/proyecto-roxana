# Revisión matemática C7b — 7.2 (día n), 7.3b (cociente), 7.8 (exponente un medio), 7.9 (simplificar) y Bitácora del cap. 7

Revisor independiente. Commits d14602c, 8dce4ca, e784008, c5bfa9b. Leí el código de las escenas, `writeJournal7` entera, `logic/growth.js`, las capturas `c72b/005`, `c73q-errores/007`, `c79s-errores/005` y los logs `c72-errores.out`, `c73q-errores.out`, `c79s-errores.out`, `c78f.out`. No ejecuté el juego. Rutas relativas a `experiments/arithmos/src/ch7/`.

**Cuentas que verifiqué y están bien:** tabla de 7.2 (1 + 10 · n da 1, 11, 21, 31…; 10 · n con n = 3 da 30, 11 · n con n = 2 da 22; Punto pasa el día 6, 64 > 61); 2⁵ ÷ 2² = 32 ÷ 4 = 8 = 2³, 2⁷ = 128; 512 · 1,414 ≈ 724 (2 elevado a 9,5) < 1000 < 1024 = 2¹⁰, log₂ 1000 ≈ 9,97; (x − 2)(x + 2) = x · x − 4; filas 5 ÷ 1 = 5, −4 ÷ (−2) = 2, 0 ÷ 0 sin definir frente a x + 2 = 4. No encontré ninguna cuenta falsa en lo nuevo. Los problemas son de fundamento, de notación y de distractores.

## ALTA

**A1. 7.8: el exponente un medio se justifica con una regla que el propio juego limitó a exponentes que cuentan factores.**
- Dónde: `scenes-b.js:765` («Como al juntar factores, se suman los exponentes: un medio y un medio hacen uno»); Bitácora `scenes-b.js:944`, que contradice a `:942` («Cuando los exponentes cuentan factores, … se suman»).
- Qué: en 7.3b la suma de exponentes se mostró contando factores (desplegar y numerar). Un medio no cuenta factores. El texto primero pone el nombre («Por eso a √2 también se lo escribe…») y después usa la regla como si ya valiera. Además repite «√2 · √2 = 2» en dos globos seguidos (764 y 765).
- Por qué importa: rompe §5 («receta sin fundamento») y la regla del encargo («nada más allá de lo mostrado»). En 7.3 la extensión a 2⁰ y 2⁻¹ se presentó con su razón (seguir el patrón de la tabla). Acá falta decir que es una elección para que la regla siga valiendo. El jugador atento ve que la Bitácora se contradice en dos párrafos seguidos.
- Arreglo sugerido (una línea): «Si el exponente cuenta duplicaciones, media duplicación se escribe 2 elevado a un medio. Para que los exponentes se sigan sumando, como cuando seguimos la tabla hasta 2⁰, dos medias tienen que dar 2¹ = 2. El número positivo que multiplicado por sí mismo da 2 es √2, el lado de 7.1». En la Bitácora: «Para que los exponentes se sigan sumando, 2 elevado a un medio tiene que ser √2: un medio y un medio hacen uno». Hay que decir «positivo»: −√2 · −√2 también da 2, y los escalones no se vuelven negativos.
- Cómo comprobar: correr la ruta directa hasta c7.cuantas-veces y buscar en el log la frase nueva. `grep -n "cuentan factores\|un medio" scenes-b.js` no tiene que mostrar ninguna afirmación sobre el exponente ½ apoyada sólo en «juntar factores».

## MEDIA

**M1. 7.8: lo de un medio no tiene ninguna decisión y «se escribe» sin que nada se escriba.**
- Dónde: `scenes-b.js:764-766`, `:944`; aceptación de C7b en `docs/arithmos/ARITHMOS_BACKLOG.json` («Escena jugable con decisión»).
- Qué: E7b aparece como monólogo. Dice «se lo escribe 2 elevado a un medio», pero en la pizarra sólo quedan `lg-eq` y `lg-log`. `pw()` no puede escribir ½ como exponente, porque `SUP` no tiene '/'.
- Por qué importa: el jugador no hace ni predice nada. La notación que se nombra nunca se ve.
- Arreglo: agregar una elección, «Media duplicación, ¿por cuánto multiplica?», con estas opciones: √2 ≈ 1,414 / 1,5 («la mitad del camino entre 1 y 2», el error aditivo de 7.2) / 1 («la mitad de 2»). Para refutarlas: 1,5 · 1,5 = 2,25 se pasa de 2, y 1 · 1 = 1 no crece. Después escribir en la pizarra «2 elevado a 1/2 = √2 ≈ 1,414», con el 1/2 en una etiqueta chica y elevada.
- Comprobar: el log muestra «elige …» en 7.8 y la captura de c7.cuantas-veces muestra la línea.

**M2. 7.9: la factorización que justifica simplificar sólo se dice, no se escribe.**
- Dónde: `scenes-b.js:887` (diálogo) y `:888` (en la pizarra sólo va el resultado). Captura `c79s-errores/005`: el subtítulo ocupa tres renglones y la pizarra tiene lugar libre.
- Qué: «x · x − 4 es (x − 2) · (x + 2): x · x + 2 · x − 2 · x − 4» es el paso clave y no queda anotado. Tampoco se dice que «+ 2 · x − 2 · x» se anula. En 7.6 se factorizó con rectángulos de fichas. Acá se hace con la distributiva con negativos, que viene del cap. 4 (deudas, partir el rectángulo) y vale, pero tiene que estar a la vista.
- Arreglo: `studentWrites` con «(x − 2) · (x + 2) = x · x + 2 · x − 2 · x − 4 = x · x − 4» y otro renglón «(x − 2) · (x + 2) ÷ (x − 2) = x + 2, con x ≠ 2».
- Comprobar: en la captura nueva de c7.no-se-puede se ven los dos renglones antes de `ns-simp`.

**M3. 7.9: el distractor «No: con x = 3 dan distinto» no es un error de concepto.**
- Dónde: `scenes-b.js:871` y su respuesta en `:886`.
- Qué: es un error de cuenta. Quien calcula 9 − 4 = 5 lo descarta, así que no distingue comprensión de adivinanza. El error típico del tema es prohibir también x = −2 («ahí arriba da cero»), o sea confundir cero arriba con cero abajo.
- Arreglo: reemplazarlo por `{id: 'minus2', text: 'Casi, pero tampoco con x = −2: ahí arriba da cero.'}`, que se responde en sus propios términos: «Con x = −2: (4 − 4) ÷ (−4) = 0 ÷ (−4) = 0, y x + 2 = 0. Cero arriba se puede; cero abajo, no». Se puede sumar la fila x = −2 a `ROWS`.
- Comprobar: una corrida de errores que elija esa opción y muestre la respuesta en el log.

**M4. 7.9: la razón de «0 ÷ 0 no está definida» no se da en la escena, y justo ahí x + 2 da 4.**
- Dónde: `scenes-b.js:874` y `:886`. La razón que se dio antes (`u.reason`, «no se divide por cero») viene del cap. 4, donde sólo se argumentó 6 ÷ 0 («ningún número por 0 da 6»). 0 ÷ 0 aparece únicamente en la Bitácora del cap. 4 (`ch4/scenes-b.js:617`).
- Por qué importa: para 0 ÷ 0 la razón es la contraria (sirven todos). La pregunta natural es «¿y por qué no vale 4?».
- Arreglo (una línea): «¿Qué número por 0 da 0? El 4, pero también el 7: cualquiera. No hay uno solo; por eso no está definida, aunque x + 2 dé 4».
- Comprobar: la frase aparece en los logs de las tres opciones.

**M5. 7.3b (y 7.9): «arriba» y «abajo» quieren decir dos cosas en la misma escena.**
- Dónde: `scenes-b.js:225, 230, 236, 237` (abajo = la base) frente a `:269, 275` («cada dos de abajo se va con uno de arriba», abajo = el divisor). En `:275` la respuesta a «1³» dice «El 2 de abajo no se divide» (la base), dos renglones después de usar «abajo» como divisor. También en la Bitácora `:913`. En 7.9, `:887` («el (x − 2) de arriba se va con el de abajo»).
- Qué: además, en la pizarra la división está en un solo renglón con «÷» (captura `c73q-errores/007`). No hay nada arriba ni abajo.
- Por qué importa: §13 pide buscar «confusiones entre objetos y notaciones», y esta cae justo en el cociente de potencias.
- Arreglo: para dividir, decir «cada dos del 2² se va con uno del 2⁵» o «del que divide / del dividido». Otra opción es escribir esas dos cuentas como fracción apilada si se quiere hablar de arriba y abajo.
- Comprobar: en 7.3b, cada «de abajo» que quede se refiere a una sola cosa.

**M6. Bitácora: «con una cifra de 1 a 9 por una potencia de 10» es falso como regla general.**
- Dónde: `scenes-b.js:942` (de antes, pero está en la entrada revisada).
- Qué: 1 500 000 = 1,5 · 10⁶. El primer factor es un número de 1 a menos de 10, no siempre una cifra. El mismo `sci()` usa 1 ≤ m < 10.
- Arreglo: «con un número de 1 a menos de 10 (3; 1,5) por una potencia de 10».
- Comprobar: leer el párrafo.

**M7. Evidencia: la ruta de errores nunca eligió una opción mal en 7.2.**
- Dónde: `scripts/playthrough.mjs:199` busca `'10 · n'` y `:396` (`t.includes(w)`) agarra la primera opción que lo contiene, que es «1 + 10 · n: …». `c72-errores.out` muestra «elige «1 + 10 · n…»».
- Qué: D9 figura como «probado-auto», pero las respuestas a «10 · n» y «11 · n» nunca corrieron. Tampoco corrieron «1³» (7.3b) ni «con x = 3» (7.9). Revisé su texto a mano y está bien.
- Arreglo: usar `'10 · n: diez'` y sumar corridas para las otras opciones.
- Comprobar: en el log de errores aparece «daría 30, y la tabla dice 31».

## BAJA

**B1. 7.2: el renglón n de Punto (`scenes-a.js:289`) es una regla («× 2 el anterior»), no el valor del día n.** Mara pidió «sin hacer toda la tabla». 7.3 define 2ⁿ como «empezar en 1 y multiplicar n veces», que es exactamente lo de Punto, pero nunca se conecta con el renglón n. Sugerencia: en 7.3, «El día n de Punto: 2ⁿ», y en la Bitácora (`:942`) «sucesión geométrica: el día n, 2ⁿ». En la Bitácora, decir «la de Mara» antes de 1 + 10 · n, para que el ejemplo no se lea como la definición. Detalle visual: si el jugador para en el día 7, el renglón n queda en la posición 9 con un hueco (`:288`).

**B2. 7.3b: «Cinco dos repartidos en dos dos» (`scenes-b.js:267`) cuesta leerlo.** No es repartir ni medir como en el cap. 4. Sugerencia, en la línea de los «÷ 2» de 7.3: «El miércoles Punto se partió a la mitad dos veces: 2⁵ ÷ 2²».

**B3. 7.3b: `:264` dice «Lo de los exponentes vale para multiplicar» y en `:276` aparece una regla de exponentes para dividir.** Cambiar por «vale para multiplicar y dividir; para sumar, no», o poner el cociente antes de la suma.

**B4. 7.3b: «los exponentes se restan» (`:276`, `:942`) se dice en general, pero la razón («cada dos de abajo se va con uno de arriba») sólo funciona si el dividido tiene al menos tantos factores.** 2² ÷ 2² = 2⁰ = 1 y 2² ÷ 2³ = 2⁻¹ coinciden con 7.3 y servirían de transferencia. O se acota la regla, o se agrega ese renglón. En la pizarra (`:274`) falta «= 8», que las otras filas sí tienen, «2·2·2» va sin espacios y no se dibuja qué factores se van.

**B5. Bitácora `:927` (opción «ninguna» en (x + 1)² = 0): «un cuadrado de área 0 tiene lado 0» vuelve al argumento de la huerta, que la escena dejó a propósito** («Sin pensar en la huerta, con la cuenta», `:685`). Alinear: «con x = −1, (−1 + 1)² = 0 · 0 = 0: una».

**B6. Bitácora, orden y atribución:** `pq` (`:912`) va antes que `ps` aunque en la escena la suma va primero; `rs` (`:932`) va antes que `rq` (`:934`) aunque la predicción va primero. `:905` dice «escribiste» por una elección; mejor «elegiste».

**B7. Notación:** la Bitácora pone x² y 5x (`:943`) al lado de x · x y 2 · x (`:944`). Lo segundo es coherente con el cap. 6, pero en la misma entrada parecen dos objetos distintos: unificar o decir «x · x, o sea x²». En la tabla de 7.2 conviven «× 2» (Punto) y «10 · n» (Mara).

**B8. 7.9 (`:887`):** se puede nombrar con el vocabulario de 6.4 (`ch6/scenes-a.js:357`): «no es una identidad: vale para cualquier x menos 2».
