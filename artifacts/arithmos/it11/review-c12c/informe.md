# Revisión matemática — cap. 12, agregados del ciclo 11 (7412182, 35da502, e39af1e, 0d6a985)

Revisé código, Bitácora (`writeJournal12`), capturas `c122u2/004`, `c123b-errores/005`, `c121h/007` y logs `c121h.out`, `c122u-errores.out`, `c123b-errores.out`. No ejecuté el juego. Rutas relativas a `experiments/arithmos/`.

Lo que está bien: todas las cuentas son correctas (2 · 4 = 8; 1 · 4 · 4 = 16; 1,5 · 3 · 3 = 13,5; 6 − 6 = 0; 1 ÷ 100 = 0,01; 1 ÷ 1000 = 0,001). El desarrollo x · (6 − 2x)² = 4x³ − 24x² + 36x es correcto. La caja crece en (0, 1) y decrece en (1, 3): la derivada es 12 (x − 1)(x − 3). El máximo en [0, 3] es 16, en x = 1. El test `boxVolume` es correcto. Las opciones erradas (a = 1 «la de siempre»; a = 1/2 «más abierta, más tierra»; x = 1,5 «en la mitad, como el salto»; x = 3 «el corte más grande») son errores plausibles y se responden en sus propios términos. La rama `box-predict` de la Bitácora es fiel a lo que pasó.

## ALTA

**A1. La caja nunca dice su dominio, y todo lo que se afirma vale sólo ahí.**
- Dónde: `src/ch12/scenes-a.js:229` (Cornisa da la fórmula), `:245` (lectura y «polinomio de grado 3»), `:246` (pizarra), `src/ch12/scenes-b.js:388` (Bitácora).
- Qué: nadie dice que el corte va de 0 a 3. Sólo lo sugieren el mapa ([0, 3]) y la opción errada «x = 3: el corte más grande». Pero inmediatamente después de «el máximo es 16, y después decrece» viene «es un polinomio de grado 3», y la igualdad escrita vale para cualquier x. Como polinomio, x · (6 − 2x)² da 16 en x = 4, 80 en x = 5 y −64 en x = −1: no tiene máximo y vuelve a crecer después de 3.
- Por qué importa: el contrato (§7 J, «interpretar dominio»; §13, «restricciones omitidas») y el cap. 9 separan la cuenta del problema: «el dominio de la cuenta es todo menos el 2; el de tu reparto, 3, 4, 5…». En 12.3, dos líneas antes, el salto lo hace bien: «mientras salta». Así como está, el jugador se lleva que una cúbica sube, tiene un máximo y baja.
- Corrección: Cornisa o el estudiante dice algo como «El corte va de 0 a 3: dos cortes de 3 ya se comen los 6». La lectura agrega «en la caja» o «entre 0 y 3» («el máximo de la caja es 16»). La Bitácora agrega «con x entre 0 y 3». Comprobación: buscar «0 a 3» o «entre 0 y 3» en `:229`/`:245` y en `scenes-b.js:388`.

**A2. «Las U son iguales de los dos lados del eje parado» es falso como regla y choca con 12.3.**
- Dónde: `src/ch12/scenes-a.js:71`.
- Qué: vale para x · x y para a · x · x (12.2). Pero el salto 6t − t², que 12.3 llama «una U dada vuelta, igual de los dos lados» (`:218`), es simétrico respecto de t = 3, no del eje parado. La Bitácora (`scenes-b.js:387`) ya dice bien «de su eje».
- Por qué importa: instala un error frecuente (simetría siempre respecto del eje vertical) y deja en contradicción a 12.1 con 12.3.
- Corrección: «las U son iguales de los dos lados de una raya parada que pasa por la punta (en x · x, el eje parado), y por eso se dice que son simétricas». Comprobación: leer la frase y verificar que sigue siendo cierta para el salto con su raya en t = 3.

## MEDIA

**M1. La asíntota acostada se justifica con «más cerca, sin llegar nunca», no con «tanto como se quiera».**
- Dónde: `src/ch12/scenes-a.js:80`; `scenes-b.js:387` («se acerca a 0 sin llegar»); `docs/arithmos/ARITHMOS_CURRICULUM.md:110`.
- Qué: la definición dada una línea antes (`:79`) es «se acercan… tanto como se quiera». Lo que dice `:80` es más débil. 1 + 1 ÷ x también se acerca cada vez más a 0 sin llegar nunca, y su asíntota es la raya del 1. Los dos puntos de «sin llegar nunca: la raya del 0 también es asíntota» presentan como causa justo lo que no define la asíntota: una curva puede cruzar su asíntota acostada. Además, no se dice por qué no llega: 1 repartido siempre deja algo. En la pizarra no queda nada escrito: la etiqueta «asíntota» está sólo en la raya parada, y `d.describe` no cambió.
- Por qué importa: es el error clásico sobre las asíntotas, y contradice la definición del mismo capítulo.
- Corrección: «… si vienen 1002, 0,001; con 10002, 0,0001: tan cerca de 0 como se quiera. La raya del 0 también es asíntota. Y no llega nunca: 1 repartido siempre le deja algo a cada uno». Opcional: escribir «102 → 0,01   1002 → 0,001» junto a la miniatura o etiquetar el eje acostado. Comprobación: la frase incluye «tanto/tan cerca como se quiera» y la razón del «nunca» va aparte.

**M2. La opción correcta de 12.2 no distingue a de x: «a = 2: 2 · 2 · 2 = 8».**
- Dónde: `src/ch12/scenes-a.js:151`.
- Qué: con a = x = 2, «2 · 2 · 2» también es x · x · x = 2³ = 8. El punto (2, 8) está justo sobre y = x · x · x, la cúbica que aparece en la escena siguiente. Quien piense «y = x · x · x» elige la correcta por una razón falsa, y `params-u` la registra como acierto. El `think` (`:156`, «2 · 4») sí separa los factores, pero llega después de elegir.
- Corrección: «a = 2: 2 · (2 · 2) = 2 · 4 = 8». Otra opción: un punto donde a ≠ x, aunque el rango de y es [0, 10]. Comprobación: en la opción correcta se ve qué factor es a.

**M3. La «huerta nueva» no le da significado a la perilla a, y repite los números de la huerta de Rampa del cap. 7.**
- Dónde: `src/ch12/scenes-a.js:138` y `:157`.
- Qué: «con lado 2, quiero 8 de tierra» no dice la forma. Un cuadrado de lado 2 tiene 4. En 7.x, la huerta de Rampa con lado 2 ya daba 8, pero como x · x + 2 · x, que no es de la forma a · x · x. Nunca se dice qué es a en una huerta (dos cuadrados de lado x; a = 1/2, medio cuadrado). Además, se dibuja la U en [−3, 3] cuando el cap. 7 dijo «un lado no mide −4».
- Por qué importa: §5 pide que el parámetro tenga una necesidad y una lectura. Hoy a es sólo «la que estrecha la U», y el contexto confunde más de lo que ayuda.
- Corrección: dar la forma («Mi huerta nueva son canteros cuadrados de lado x pegados: ¿cuántos?») o cerrar con el significado («a = 2: dos cuadrados de lado 2, 2 · 4 = 8»). Si no, sacar la huerta y preguntar sólo por la U. Comprobación: en el diálogo aparece qué representa a.

**M4. «Polinomio» y «grado» se nombran sin presentarse, y el desarrollo salta todos los pasos.**
- Dónde: `src/ch12/scenes-a.js:245` y `:246`.
- Qué: es la primera vez que aparecen «polinomio» y «grado» en todo el juego (grep en `src/`). La pizarra pasa de x · (6 − 2x) · (6 − 2x) a 4 · x · x · x − 24 · x · x + 36 · x de un salto. En 7.x el mismo tipo de producto se mostró con el paso intermedio (`ch7/scenes-b.js:898`). Tampoco se dice que la U y el salto son de grado 2, que es justo el contraste que da sentido a «grado 3».
- Por qué importa: §5, «comprender antes de abreviar». Hay que creerse el −24 y el +4.
- Corrección: escribir primero «(6 − 2x) · (6 − 2x) = 36 − 12 · x − 12 · x + 4 · x · x», o al menos decir de dónde sale x · x · x: «x por −2x por −2x da 4 · x · x · x». Y decir: «una suma de números por x, x · x, x · x · x… es un polinomio; el grado es cuántas x se multiplican como mucho: la U y el salto, 2; la caja, 3». Comprobación: aparecen el paso intermedio y la definición de grado con su contraste.

**M5. La fórmula de la caja se afirma pero no se ve.**
- Dónde: `src/ch12/scenes-a.js:229` a `:234`.
- Qué: no se dibuja la tabla 6 × 6 con las esquinas cortadas, ni los lados x y 6 − 2x. Todo lo que sigue («el fondo mide 6 − 6») depende de entender 6 − 2x.
- Corrección: un croquis del cuadrado con cuatro esquinas de lado x y el rótulo «6 − 2x» antes del gráfico. Comprobación: captura con el croquis.

## BAJA

- **B1** `scenes-a.js:157`, `:149`: «con a más grande, sube más rápido y queda más angosta» sólo vale con a positivo (con a negativo la U se da vuelta). Agregar «(con a positivo)». Las tres que se muestran son positivas: hoy no hay nada falso en pantalla.
- **B2** `scenes-a.js:236`–`:241`: «¿Con qué corte entra más?» se pregunta con el gráfico ya dibujado, y `d.describe` (`:235`) dice «sube hasta 16 en x = 1». Es lectura, no anticipación, aunque la evidencia se llama `box-predict`. Para que «en la mitad, como el salto» sea una hipótesis que se pone a prueba, preguntar antes de dibujar, como en el salto (`:184`).
- **B3** `scenes-a.js:245`: «Pero no es una U» compara con el salto, que se llamó «U dada vuelta». Más preciso: «no es una U dada vuelta como el salto».
- **B4** Notación mezclada en la misma escena: «6t − t²» (`:181`); «(6 − 2x) · (6 − 2x)» y «4 · x · x · x» (`:229`, `:246`); «x · (6 − 2x)²» en la Bitácora; «x² + 5x + 6» en el cap. 7. Elegir una. El subtítulo parte «x · x ·⏎x» en dos renglones (captura `c123b-errores/005`): usar espacios que no corten.
- **B5** `scenes-b.js:387`: los parámetros de la Bitácora sólo mencionan y = a · x + b. Agregar «en y = a · x · x, a estrecha o abre la U». `params-u` no tiene rama en `seen`. Es coherente con `params`, que tampoco la tiene, pero es una elección evaluada.
- **B6** Sin captura de la pizarra con la igualdad escrita (`:246`, tamaño 15, unos 60 caracteres): la captura 005 es anterior. No pude verificar que se lea, sobre todo en 844 × 390.
- **B7** `ARITHMOS_CURRICULUM.md:108`–`:111`: J2b, J3b y J8b deberían heredar las correcciones de A1, M1 y M3. «J-gap: ninguno abierto» es prematuro hasta resolver A1 y A2.
