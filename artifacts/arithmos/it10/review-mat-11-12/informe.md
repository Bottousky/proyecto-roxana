# Revisión matemática independiente: cap. 11 «Lo que pasa a veces» y cap. 12 «Anticipar» (rev-mat-10)

- Fecha: 2026-10-06. Commits revisados: `f90ad31` (cap. 11) y `efa47c9` (cap. 12), rama
  `claude/arithmos-graphic-adventure-065e68`.
- Alcance:
  - Cap. 11: `experiments/arithmos/src/ch11/{chapter,scenes-a,scenes-b}.js`, `src/logic/chance.js`,
    `tests/chance.test.mjs`.
  - Cap. 12: `experiments/arithmos/src/ch12/{chapter,common,scenes-a,scenes-b}.js`, `src/logic/anticipate.js`,
    `tests/anticipate.test.mjs`.
  - Costuras y referencias cruzadas:
    - `ch10/scenes-b.js:274-321`: los seis baldes y el gancho.
    - `ch7`: escaleras de Mara y de Punto, huerta, reparto. `ch6/scenes-b.js`: deshacer.
    - `ch3/scenes-b.js`: distancia al cero y pozo.
    - Bitácoras de los caps. 8 y 9 (la del 9, ya corregida en `40ceece`).
  - Contrato: `docs/arithmos/ARITHMOS_MASTER.md` §5, §7I, §7J (y la frase del cierre), §13.
  - Diseño: `docs/arithmos/ARITHMOS_DESIGN.md`, capítulos 11 y 12 y «Criterios de escena».
- Números de línea: los de `efa47c9`. Mientras revisaba, `HEAD` avanzó a `40ceece` (correcciones del cap. 9).
  Comprobé con `git diff` que `ch11/`, `ch12/`, `logic/chance.js`, `logic/anticipate.js` y sus pruebas no
  cambiaron entre `f90ad31`/`efa47c9` y `HEAD`, ni en la copia de trabajo: las líneas valen también en `HEAD`.
  Las citas del cap. 9 son de `HEAD`.
- Evidencia usada (bot, no personas):
  - `artifacts/arithmos/it09/c11-directa/`, `c11-errores2/` (`c11-errores/` es una corrida incompleta, sin log).
  - `artifacts/arithmos/it10/c12-directa/`, `c12-errores/` (`c12a-directa/` cubre sólo 12.1 a 12.4).
  - En cada una: `log.txt`, `state.json` y capturas.
- Método:
  - Lectura del código, los diálogos y las Bitácoras, rama por rama.
  - `node --test experiments/arithmos/tests/`: 96/96 en `HEAD`. `chance.test.mjs`: 5/5. `anticipate.test.mjs`: 7/7.
  - Scripts propios en el scratchpad, que importan la lógica del juego:
    - Recalculan la proporción de baldes llenos para cada n de 1 a 1000 con la semilla del juego, y las 360
      y 3600 tiradas de dados.
    - Calculan la correlación de 11.7 y la relación polvo–borrones dentro de cada viento.
    - Recalculan secantes, sumas de rectángulos, la tarifa, la parábola y las composiciones.
    - Buscan otras reglas que pasan por 1, 2, 4, 8: encuentran una cúbica y prueban que ninguna ola pasa.
    - Ejecutan `writeJournal11` y `writeJournal12` del commit en todas las ramas.
    - Comparan cada línea `lee:` y `elige` de los cuatro logs con el texto del commit: coinciden 36/36,
      36/36, 35/35 y 39/39.
  - **Sin navegador.** No abrí el juego; todo lo de pantalla sale del código, los logs y las capturas del bot.

## Veredicto corto

Las cuentas son correctas en los dos capítulos:

- **Cap. 11.**
  - Baldes: 4 de 6 coincide con el cap. 10; con 10, 100 y 1000 baldes, 70 %, 66 % y 64 %.
  - Promedio y mediana: 10 y 4. Las dos terrazas: promedio 5 las dos, rangos 2 y 8.
  - Gráfico de Punto: desde 96, las barras de 100 y 104 miden 4 y 8 (el doble).
  - Conteo: 3 · 2 = 6 y 3 · 2 · 4 = 24.
  - Dados: 6/36 y 1/36, y la grilla suma 36. Las 360 tiradas dan 58 sietes y 6 doces.
- **Cap. 12.**
  - Perillas: y = 10x + 1 pasa por (0, 1) y (3, 31), y se alcanza.
  - Salto: 6t − t² tiene ceros en 0 y 6 y máximo 9 en t = 3.
  - Composición: 25 y 9. (y − 1) ÷ 2 deshace el doble más uno.
  - Velocidades medias: 4 − h, o sea 3; 3,5; 3,9; 3,99.
  - Sumas por la izquierda: 9 − 9/n, o sea 6; 7,5; 8,7.
  - Tarifa: continua en 10, y 16 → 13.
  - Marea: 2ⁿ da 16 y 32, y cruza 30 en n ≈ 4,91.

Fallan dos cosas que están en el centro de lo que cada capítulo enseña:

1. **11.7: los datos del pizarrón no muestran lo que se concluye.** El estudiante propone mirar días con el
   mismo viento. Hecho eso con los seis días de Mara, en los tres vientos el día con más polvo borró más
   (5 de 6 días cumplen borrones = polvo − 1). Además, la conclusión cambia una causa no probada (el polvo)
   por otra igual de no probada (el viento): «era el viento». El límite «pocos datos» no se dice.
2. **El cierre del juego anticipa con cuatro datos sin decir qué supone.**
   - 12.1 dice: «Viendo un pedazo, uno ya sabe qué esperar».
   - 12.8 corre por la curva más allá de lo medido y concluye la noche 5 como un hecho.
   - La Bitácora cierra con «así se anticipa».
   - Una cúbica pasa por los mismos cuatro puntos (1, 2, 4, 8) y llega a 30 recién la noche 6.
   - Contradice al cap. 8, al cap. 9 corregido («si coincide no la prueba») y al propio cap. 11 («no es
     una garantía»).

Además (MEDIA):

- **Cap. 11.**
  - La Bitácora dice que la frecuencia «no dice nada del próximo caso», y 11.8 que «se sabe qué parte va a
    pasar».
  - El gráfico de 11.1 usa un eje logarítmico sin avisarlo y afirma un 2/3 que no muestra.
  - 11.3 dice «siempre» y «nunca» con cinco días.
  - 11.6 no justifica por qué los 36 pares son igual de posibles, y llama «cerca» a 6 doces contra 10
    esperados.
- **Cap. 12.**
  - El enunciado final admite otra lectura, que da otra noche.
  - Las familias se describen mal: «las rectas suben», «las que despegan duplican», «hueco» por asíntota, y
    la huerta dibujada con lados negativos.
  - La tangente es «la que apenas toca», y la recta final, que es secante, se llama tangente.
  - «La integral es al revés de la derivada» queda como eslogan.
  - El valor absoluto sólo se dice.
  - Se cayeron la familia logarítmica y las perillas del cierre.

## Cumplimiento por escena

### Cap. 11 (diseño y contrato I)

| Escena | Idea del diseño | Estado |
|---|---|---|
| 11.1 | Frecuencia que se estabiliza | Proporciones correctas y coherentes con el cap. 10; «lo vimos, no está garantizado», bien. El eje es logarítmico sin avisar y el 2/3 no se ve en el gráfico (M2). Lo que dice del próximo balde (M1) |
| 11.2 | Promedio y mediana | 10 y 4 correctos; la robustez de la mediana, bien dicha. «Como la mayoría» y «guarda los de todos» (B1) |
| 11.3 | Dispersión | Promedios y rangos correctos; **«siempre», «nunca» y «seguros» con cinco días** (M3) |
| 11.4 | Eje truncado | Barras exactas y redibujo correcto. «El alto no compara cantidades» dice de más (B2) |
| 11.5 | Principio de multiplicación | 6 y 24, con un árbol correcto. Falta la condición y un caso donde no vale (B3) |
| 11.6 | Dos dados | 6/36 y 1/36 correctos; «si los dados son parejos», declarado. Los pares ordenados sin justificar, y el juego marca solo. Simulación: «cerca» y «debería» (M4). Semilla fija (B11) |
| 11.7 | Correlación vs causa | **Con el mismo viento, polvo y borrones siguen juntos. La conclusión pone otra causa. «Pocos datos», sin declarar** (A1) |
| 11.8 | Anticipar; gancho | Clasificación correcta. «Se sabe qué parte va a pasar» (M1) |
| Límites del diseño | Estabilización observada; dados parejos; pocos datos | El 1.º sí, con M1. El 2.º sí, incompleto (M4). El 3.º no (A1) |

### Cap. 12 (diseño y contrato J)

| Escena | Idea del diseño | Estado |
|---|---|---|
| 12.1 | Familias por su forma | Cada regla va a su forma. Las descripciones fallan (M6). **«Viendo un pedazo, uno ya sabe qué esperar»** (A2). Faltan la V y la curva que se aplana (M10) |
| 12.2 | Parámetros de la recta | Correcto y alcanzable; los papeles de a y b, bien dichos. «+ -1» (B6) |
| 12.3 | Ceros, máximo, crece/decrece | Todo correcto, con la simetría como razón. «Mara le midió» una fórmula (B7) |
| 12.4 | Composición e inversa | 25 y 9; deshacer en orden contrario; x · x con el signo: correcto. Sin notación (B8). Contradice a 12.1 en la huerta (M6) |
| 12.5 | Derivada como límite | 3 → 3,5 → 3,9 → 3,99 → 4 es correcto, y la rama «tramo cero», muy bien. **La tangente es la que «apenas toca», y la secante final se llama tangente** (M7) |
| 12.6 | Acumulación | 6, 7,5, 8,7 → 9 es correcto. «Al revés de la derivada», sin fundamento; una razón falsa en la rama `inf` (M8) |
| 12.7 | Por tramos y valor absoluto | Tarifa correcta y continua. \|x\| sólo se dice (M9) |
| 12.8 | Cierre | La recta y la ola se descartan bien. **Extrapola sin declarar la suposición** (A2). Enunciado ambiguo y «cuatro noches» (M5). Sin perillas (M10) |
| Límites del diseño | Derivada e integral sin reglas; familias por un tramo, no todas | El 1.º se cumple. El 2.º no se declara: se afirma lo contrario (A2) |

### Respuestas a lo pedido

- **Frecuencia relativa (observación vs garantía).** «Eso lo vimos, no está garantizado» (11.1) y la
  Bitácora («no una garantía») lo dicen bien. Pero:
  - La Bitácora niega que diga algo del próximo caso, y 11.8 la vuelve certeza (M1).
  - El gráfico deforma el eje y afirma un 2/3 que no muestra (M2).
  - 11.3 generaliza cinco días a «siempre» (M3).
- **Promedio, mediana, rango.** Correctos. «El promedio reparte todo» es la interpretación justa. La mediana
  se define sólo para una cantidad impar (B1). El rango se presenta como herramienta para «por lo menos 4»,
  cuando lo que decide es el mínimo (M3).
- **Eje truncado.** Correcto y bien resuelto. La Bitácora lo acota a barras (bien). La frase de la escena dice
  de más (B2). Lo irónico: el gráfico de 11.1 hace lo que 11.4 enseña a revisar (M2).
- **Principio de multiplicación.** Correcto; falta la condición (B3).
- **Dos dados.** El cálculo es correcto y «dados parejos» se declara. Falta lo que sostiene el 36: pares
  ordenados igual de posibles, con dados distinguibles e independientes. La simulación se lee de más (M4).
- **Simulación.** 58 y 6 en 360 tiradas: compatibles con 1/6 y 1/36 (P(≤ 6 doces) ≈ 0,13). Pero «cerca» para
  6 contra 10 y «debería» no son la lectura correcta (M4). Siempre da lo mismo (B11).
- **Correlación vs causa.** La idea está bien dicha y la opción «no se sabe» es la que se trata como buena. Los
  datos y la conclusión, no (A1).
- **Familias por forma.**
  - La clasificación de las cinco reglas es correcta.
  - Lo que se dice de cada familia no lo es (M6).
  - El alcance («un pedazo alcanza») es falso (A2).
  - Faltan logarítmica, valor absoluto dibujado, radicales y polinómicas (M10).
- **Parámetros de la recta.** Correctos: «b es dónde empieza», «a es cuánto sube por día». Son parámetros sólo
  de la recta (M10).
- **Lectura del salto.** Correcta: ceros, crecimiento, decrecimiento, máximo y signo, con la simetría como
  razón del máximo.
- **Composición e inversa.** Correctas, con la condición del signo para x · x («√ si x ≥ 0»), coherente con el
  cap. 6. Esa misma condición contradice la miniatura de la huerta en 12.1 (M6).
- **Derivada.** «El número al que se acercan las velocidades de tramos cada vez más cortos» es correcto, y
  separar «con tramo cero no se divide» de «se acercan a 4» es lo mejor de la escena. **La tangente está mal
  dicha** (M7).
- **Integral.** «La suma se acerca al área debajo del gráfico» y «caudal por tiempo» son correctos. «Al revés
  de la derivada» no se presenta bien (M8).
- **Por tramos y valor absoluto.** La tarifa es correcta. El valor absoluto, sin gráfico y sin desplegar −x
  (M9).
- **Cierre.** Cuatro datos no justifican la extrapolación, y la suposición no se declara (A2). El enunciado
  admite otra lectura con otra respuesta (M5).
- **Bitácoras.**
  - Sin `undefined` ni ramas vacías; ≤ 4 párrafos; no se escriben en una repetición; filtran por partida.
  - Problemas de contenido: A1, A2 y M1.
  - Ramas que atribuyen de más: B4 y B5.

---

## ALTA

### A1. 11.7: con el mismo viento, polvo y borrones siguen juntos; y la conclusión pone al viento como causa

- **Dónde:**
  - `src/ch11/scenes-b.js:168-175`: los seis días. Por viento:
    - poco: polvo 2 → 1 borrón, 3 → 2;
    - bastante: 5 → 4, 4 → 3;
    - mucho: 8 → 7, 6 → 6.
  - `:196`: describe («Los puntos suben juntos, casi en fila»).
  - `:204-209`: aparece el viento.
  - `:210`, rama `maybe`: «Ahí está: el viento trae polvo y empuja la Marea. Las dos cosas vienen con el
    viento.»
  - `:211`, el estudiante: «Acá parece que el viento trae las dos. Para saber si el polvo hace algo, habría
    que mirar días con el mismo viento.»
  - Bitácora `:295`: «Sospechaste una tercera causa: era el viento.» / «…el viento traía las dos cosas.»
  - Diseño, «Límites a declarar» del cap. 11: «la correlación se muestra con pocos datos».
  - Captura: `it09/c11-directa/030-snap-c11.causa.png`. Cada par del mismo viento sube hacia la derecha.
- **Qué:**
  1. **La prueba que propone el estudiante, hecha con los datos de Mara, da lo contrario de lo que se
     concluye.** Con el mismo viento, el día con más polvo borró más en los tres pares. En 5 de los 6 días,
     borrones = polvo − 1 exacto. La correlación total es r ≈ 0,986, y la relación sigue entera dentro de
     cada viento. Los datos son tan compatibles con «el polvo hace borrar» (y el viento sólo trae polvo) como
     con «el viento causa las dos»: no distinguen.
  2. **Se cambia una causa no probada por otra.** Que el viento acompañe a polvo y borrones es otra
     asociación, vista en los mismos seis días. «Ahí está», «era el viento» y «el viento traía las dos cosas»
     son una afirmación causal hecha con el mismo tipo de evidencia que la escena acaba de rechazar. Las
     ramas `yes` y `luck` del pensamiento sí dicen «puede» (bien); la Bitácora, en las tres ramas, no.
  3. **El límite prometido no aparece.** Son seis días, con ejes sin números. Nadie dice «con seis días es una
     sospecha».
- **Por qué importa:**
  - Es la escena de §7I «distinguir una relación estadística de una explicación causal».
  - Un estudiante que hace lo que la escena recomienda llega a lo contrario de lo que la escena afirma. La
    Bitácora le deja una causa como hecho.
  - Criterio 11: la evidencia no puede probar más de lo que muestra.
- **Cómo comprobar la corrección:**
  - **Datos que muestren la tercera causa.** Que, con el mismo viento, el polvo no cambie los borrones. Por
    ejemplo:
    - poco: (2, 2) y (4, 2);
    - bastante: (3, 4) y (6, 4);
    - mucho: (5, 7) y (8, 7).
    
    En total, polvo y borrones siguen subiendo juntos (r ≈ 0,73), y dentro de cada viento la relación
    desaparece (lo calculé).
  - **Que el jugador haga la comparación.** Por ejemplo, tocar los dos días de «mucho» y ver que borraron lo
    mismo.
  - **Textos.**
    - Rama `maybe`: «El viento puede estar detrás de las dos: con el mismo viento, más polvo no borró más.»
    - Estudiante: «…con seis días, es una sospecha.»
    - Bitácora: «sospechaste una tercera causa: el viento» / «el viento puede traer las dos cosas».
  - **Verificación:** un script que, para cada viento, compare los borrones de sus días; y una captura donde
    los pares del mismo viento queden a la misma altura.

### A2. El cierre anticipa con cuatro datos sin declarar la suposición (12.1, 12.8 y la Bitácora)

- **Dónde:**
  - 12.1, `src/ch12/scenes-a.js:43`: «Cada regla tiene la suya: si reconocemos la forma, sabemos qué
    esperar.»
  - 12.1, `:73`: «Viendo un pedazo, uno ya sabe qué esperar.»
  - 12.8, `src/ch12/scenes-b.js:178`: las noches 0 a 3, con 1, 2, 4, 8.
  - `:202-218`: tres familias; el bucle sigue hasta elegir «duplica».
  - `:219`: describe («pasa por los cuatro puntos y sigue subiendo»).
  - `:220-226`: «¿En qué noche la Marea pasa la escalera?»; el pensamiento: «La quinta: 16 todavía no, 32
    sí.»
  - `:231-234`: Punto corre por el tramo 4 → 5, que nadie midió.
  - Bitácora: `:273` (abreviatura «Reconocer la familia, ajustar las perillas, leer el gráfico: así se
    anticipa.») y `:278` («Con todo eso, se anticipa.»).
  - Contraste:
    - 11.8, `ch11/scenes-b.js:260` y `:269`: «exacto» es sólo para «lo que tiene una regla fija».
    - Bitácora del cap. 11, `:301`: «no una garantía».
    - Bitácora del cap. 8, `ch8/scenes-b.js:413`: «Probando casos no se termina».
    - Bitácora del cap. 9 corregida, `ch9/scenes-b.js:336` (`HEAD`): «un caso nuevo puede mostrar que está
      mal, pero si coincide no la prueba (otra regla podría coincidir ahí)».
    - 9.8 corregido, `:301`: «Mientras el sol dé la misma vuelta».
  - Capturas: `it10/c12-directa/030-c12.anticipar-eleccion.png` y `032-snap-c12.anticipar.png`.
- **Qué:**
  1. **Cuatro puntos no determinan una regla.** La cúbica 1 + n + n(n − 1)/2 + n(n − 1)(n − 2)/6 pasa
     exactamente por 1, 2, 4, 8 en las noches 0 a 3. Después da 15, 26 y 42: llega a 30 recién la noche 6.
     También «despega». Es el ejemplo clásico: las regiones de un círculo cortado por cuerdas dan 1, 2, 4, 8,
     16, **31**. La recta y la ola se descartan bien (ninguna pasa por los cuatro puntos; ver «Lo que está
     bien»). Pero entre las reglas que pasan, elegir «duplica» es una suposición. El juego no la dice en
     ningún momento de la escena. La única condición aparece en una rama de la Bitácora: «duplicando, pasa la
     escalera en la quinta» (`:269`).
  2. **«Viendo un pedazo, uno ya sabe qué esperar» es falso, y el capítulo tiene el contraejemplo.** La huerta
     (x · x con lados positivos, como dice 12.4) vista en [0, 3] despega igual que la escalera de Punto. Un
     pedazo de la ola cerca de 0 parece una recta. El diseño declara el límite opuesto («se reconocen por la
     forma en un tramo, no se clasifican todas») y la escena no lo dice.
  3. **El cierre contradice los criterios del juego.**
     - En 11.8, «exacto» es para lo que tiene una regla conocida. La Marea no la tiene: se observaron cuatro
       noches. Con el criterio del cap. 11, la noche 5 es lo más probable si la Marea sigue igual, no un
       hecho.
     - Los caps. 8 y 9 (ya corregido) dicen que los casos que coinciden no prueban la regla.
     - El cierre es la única escena en la que una predicción tiene consecuencias. Ahí se hace lo contrario.
  4. **La Bitácora del final lo fija.** La abreviatura y el último párrafo dicen «así se anticipa», sin
     «mientras la regla siga valiendo». Es lo último que se lleva el jugador.
- **Por qué importa:**
  - Es el cierre del juego. El contrato pide integrar lo anterior en la capacidad de **interpretar y
    anticipar relaciones**, y §7I pide distinguir regularidad observada de garantía.
  - Lo que integra el cierre (familia, gráfico) deja afuera justo lo que haría honesta la predicción: la
    incertidumbre del cap. 11.
  - Criterio 11.
- **Cómo comprobar la corrección:**
  - **Declarar la suposición en 12.8**, en voz del estudiante. Por ejemplo: «Si sigue duplicando, la quinta
    noche pasa la escalera. Cuatro noches no lo prueban: mañana medimos la cuarta. Si da 16, la sospecha
    sigue; si no, cambiamos de familia.» Y que la decisión lo use: «por las dudas, terminar antes de la
    quinta».
  - **Mejor, que se juegue.**
    - Mostrar una segunda curva que también pasa por los cuatro puntos (la cúbica: 15, 26, 42) y preguntar
      qué se puede saber.
    - O medir la noche 4 (16) antes de decidir.
    - Punto puede correr hasta la noche 4 (medida) y detenerse en el tramo supuesto.
  - **12.1:** «Viendo un pedazo, uno sospecha qué esperar. Un pedazo solo engaña: la huerta, con lados
    positivos, despega como la escalera de Punto.»
  - **Bitácora:** «…así se anticipa, mientras la regla siga valiendo.»
  - **Verificación:** `git grep -n "sabe qué esperar\|así se anticipa\|se anticipa\." --
    experiments/arithmos/src/ch12` sin frases que afirmen la predicción sin su condición.

---

## MEDIA

### M1. Lo que la frecuencia dice del próximo caso: la Bitácora lo niega y 11.8 lo vuelve certeza

- **Dónde:**
  - Bitácora `ch11/scenes-b.js:301`: «…no una garantía, y no dice nada del próximo caso».
  - 11.8:
    - `:269`: «pero con muchos casos, se sabe qué parte va a pasar»;
    - `:253`: el botón «sólo lo probable» para el próximo balde;
    - `:260`: la nota «el próximo, no».
  - 11.1, `scenes-a.js:91`: el pizarrón dice «llenos ÷ baldes → cerca de 2/3».
  - Contraste:
    - Cap. 10, `ch10/scenes-b.js:314`: la respuesta correcta es «No se sabe seguro; lo más probable, llena».
    - Cap. 12, `ch12/scenes-b.js:65`: la misma flecha «→» para un límite.
- **Qué:**
  1. **La frecuencia estabilizada sí dice algo del próximo balde.** Dice que es más probable que suba lleno,
     más o menos 2 de cada 3 veces. Es la respuesta que el cap. 10 da por buena y la que 11.8 pide con «sólo
     lo probable». La Bitácora dice lo contrario. La nota de 11.8 («el próximo, no») choca con su propio
     botón.
  2. **«Se sabe qué parte va a pasar» contradice el «no está garantizado» de 11.1.** Con otros mil baldes, la
     parte será parecida, no sabida. En este mismo juego, a los 1000 dio 64 %, no 2/3.
  3. **El puente con 11.6 no se dice.** El número donde se acomoda la frecuencia estima la probabilidad. En 11.1
     la palabra «probabilidad» no aparece; en 11.6 aparece sólo por conteo.
  4. **La flecha.** «→» es la notación que el cap. 12 usa para «se acerca a» (un límite). La frecuencia no
     tiende a 2/3 con seguridad: es lo más probable.
- **Por qué importa:** §7I y criterio 11; la Bitácora es lo que queda; y M1.1 contradice al cap. 10, que
  pide justo esa respuesta.
- **Cómo comprobar:**
  - Bitácora: «…no es una garantía. No dice cómo va a salir el próximo, pero sí qué es más probable: lleno, más
    o menos 2 de cada 3 veces. A ese número le decimos probabilidad.»
  - 11.8: «con muchos casos, se puede esperar más o menos qué parte va a pasar».
  - 11.1: escribir «llenos ÷ baldes: cerca de 2/3», sin flecha.
  - Verificación: `git grep -n "no dice nada del próximo\|se sabe qué parte" -- experiments/arithmos/src/ch11`
    sin resultados.

### M2. 11.1: el eje se estira sin avisar y el 2/3 no está en el gráfico

- **Dónde:**
  - `scenes-a.js:50`: `px = gx + log10(n) / 3 · W`.
  - `:52`: rótulos 1, 10, 100 y 1000 a igual distancia.
  - `:53-54`: sólo «la mitad» y «todos»; no hay 0 ni 2/3.
  - `:89`: rama `exact`, «Nunca da exacto».
  - `:90`.
  - Captura: `it09/c11-directa/004-snap-c11.baldes.png`.
  - Evidencia `freq`: 0,7; 0,66; 0,64.
- **Qué:**
  1. **Eje logarítmico sin avisar.** De 1 a 10, de 10 a 100 y de 100 a 1000 ocupan lo mismo (120 px). Los
     primeros 10 baldes llenan un tercio del gráfico, y los últimos 900, otro tercio. El salto del principio
     se ve enorme y la calma del final, corta. Tres escenas después, el capítulo enseña «mirar dónde empieza el
     eje».
  2. **El 2/3 no se ve en el gráfico.** Lo que se ve es 70 %, 66 % y 64 %. Desde el balde 74 hasta el 1000 la
     proporción queda **siempre por debajo** de 2/3 (entre 61,9 % y 66,3 %), y el último tramo se aleja (66 →
     64). El 2/3 viene de los seis baldes del cap. 10 y del código (`p = 2/3`), no de lo que se ve. Con
     n = 1000, 64 % está a 1,8 desvíos de 2/3: es compatible, pero el gráfico no lo muestra. Lo que muestra
     es «cerca de 64 %, casi 2 de cada 3».
  3. **«Nunca da exacto» es falso.** Con 3, 6 y 72 baldes da exactamente 2/3, y los dos primeros están
     dibujados.
  4. **El eje vertical no rotula el 0.**
- **Por qué importa:**
  - Criterio 8 (escalas fieles) y criterio 11.
  - §7I (lectura crítica de gráficos): el juego hace, sin avisar, lo que 11.4 enseña a revisar.
- **Cómo comprobar:**
  - Rótulo «cada marca, diez veces más baldes», o un eje lineal con un recuadro ampliado del principio.
  - Raya punteada en 2/3 con su rótulo, y 0 en el eje vertical.
  - Texto: «se acomoda cerca de 64 %, casi 2 de cada 3».
  - Rama `exact`: «Exacto da a veces, de casualidad (con 3, con 6); con muchos, no se clava.»

### M3. 11.3: «siempre», «nunca» y «seguros» con cinco días

- **Dónde:**
  - `scenes-a.js:163`: «Mañana necesito por lo menos 4 seguros».
  - `:164`: cinco días por ayudante.
  - `:174`: «A: siempre hace entre 4 y 6».
  - `:179`: «Con A, nunca menos de 4».
  - `:180`: rango.
  - Bitácora `scenes-b.js:287`: «Para tener 4 seguros llamaste al ayudante parejo».
- **Qué:**
  - Cinco días observados no garantizan nada. Lo dicen la escena anterior (11.1, «no está garantizado») y el
    cierre del capítulo. Acá se dice «siempre», «nunca» y «seguros».
  - La decisión «por lo menos 4» la resuelve el mínimo de cada ayudante (4 contra 1), no el rango. Con
    promedios iguales, menos rango quiere decir valores más cerca del promedio. Como razón está bien, pero no
    se dice: el rango aparece como si fuera la herramienta para «por lo menos 4».
- **Por qué importa:** es el error que el capítulo enseña a evitar (criterio 11, §7I), dicho por el estudiante.
- **Cómo comprobar:**
  - «A: estos cinco días hizo entre 4 y 6.»
  - «Con A, en estos días, nunca menos de 4: es la apuesta más segura, no una garantía.»
  - Rampa: «Necesito por lo menos 4, lo más seguro posible.»
  - «Con el mismo promedio, el de menos rango no se aleja tanto del 5.»

### M4. 11.6: por qué los 36 pares son igual de posibles, y cómo se leen 360 tiradas

- **Dónde:**
  - `scenes-b.js:102-119`: la grilla, con filas y columnas 1–6 sin «primer dado» ni «segundo dado».
  - `:126-142`: marcar es un botón; el juego pinta los casilleros.
  - `:143`: «Si los dados son parejos…».
  - `:145-158`: `rollTwo(360)`, con semilla fija en `logic/chance.js:37`.
  - `:158`: «el 7 debería salir cerca de 60 veces… y el 12, cerca de 10. Salieron 58 y 6: cerca, no exacto».
  - Captura: `it09/c11-directa/025-snap-c11.dados.png`.
  - Evidencia `dice-roll`: 58 y 6 en las dos partidas.
- **Qué:**
  1. **Lo que sostiene 6/36.** Que los 36 pares **ordenados** son igual de posibles: (1, 6) y (6, 1) son dos
     maneras. «Si los dados son parejos» es necesario pero no alcanza: hace falta además mirar los dados como
     dos distintos, que caen sin influirse. Es la confusión clásica: contar 21 combinaciones, con el 7 «de 3
     maneras» y el 12 «de 1», y dar 3/21 contra 1/21. El jugador no la enfrenta: toca «marcar los 7» y el
     juego pinta seis casilleros. §5 pide nombrar la interpretación errónea que se quiere distinguir; esta es
     la del tema.
  2. **360 tiradas.**
     - 58 sietes contra 60 esperados (3 % menos) y 6 doces contra 10 (40 % menos). «Cerca, no exacto» los
       pone en la misma bolsa.
     - En las barras, el 7 sale ≈ 9,7 veces más que el 12, no 6.
     - Con 360 tiradas, el 12 se espera 10 veces: son «pocos casos», lo que 11.1 enseñó. Que salgan 6 o
       menos tiene probabilidad ≈ 0,13: es normal.
     - «Debería» suena a obligación, la idea que el cap. 10 corrigió («ya le toca»).
- **Por qué importa:** §5 y §7I. La simulación es la única comparación del capítulo entre conteo y
  frecuencia.
- **Cómo comprobar:**
  - Rotular «dado rojo» y «dado azul».
  - Pedir que el jugador marque él los pares del 7.
  - Que Rampa diga «3 y 4 es lo mismo que 4 y 3», y responder: «No: rojo 3 y azul 4 es otra tirada que rojo
    4 y azul 3.»
  - Simulación: «Se esperan unos 60 y unos 10. Salieron 58 y 6. El 7, cerca; el 12 sale tan poco que 360
    tiradas son pocas para él.»
  - Opcional, «tirar 3600»: con la semilla del juego da 596 y 97.

### M5. 12.8: «cuánto subió cada noche» admite otra lectura con otra respuesta; y las noches no cierran

- **Dónde:**
  - `src/ch12/scenes-b.js:194`: «Medí cuánto subió cada noche: 1, 2, 4, 8 escalones».
  - `:196`: el eje vertical no tiene nombre (sólo `xname: 'noche'`).
  - `:219`: «cruza la raya del 30 entre la noche 4 y la 5».
  - `:221-226`: la opción «En la noche 4: 16» se corrige con «La cuarta llega a 16: todavía no».
  - `:227`: «tenemos cuatro noches».
  - Capturas: `it10/c12-directa/030` y `032`.
- **Qué:**
  1. **Otra lectura, otra respuesta.** «Cuánto subió cada noche» se lee también como lo que subió esa noche,
     un aumento. Con esa lectura, el nivel es 1, 3, 7 y 15, y la noche 4 suma 16: llega a **31** y pasa la
     escalera **en la noche 4**, la respuesta que el juego corrige. La lectura «hasta dónde llegó esa noche»
     también es posible («La Marea vuelve»). El gráfico dibuja 1, 2, 4, 8 como alturas, pero el eje vertical
     no dice de qué. La escena anterior (12.6) enseñó justamente a separar «cuánto entra por vez» de «cuánto
     se juntó».
  2. **«Tenemos cuatro noches».** Ya se midieron las noches 0 a 3. Si la Marea pasa en la 5, queda una noche
     (la 4), o dos contando la 5. No hay cuenta que dé cuatro.
  3. **Lo que pasa entre noches.** «Entre la noche 4 y la 5», y Punto corriendo por la curva entre noches:
     si la Marea se mide una vez por noche, lo que se lee son los puntos. El cap. 9 corregido lo dice para las
     escaleras (`ch9/scenes-b.js:238`: «como se cuentan por día, lo que se lee son los puntos»).
- **Por qué importa:** es la decisión final del juego; criterio 5 (cuentas coherentes).
- **Cómo comprobar:**
  - «Medí hasta dónde llegó cada noche: al escalón 1, 2, 4, 8», y el eje vertical «hasta dónde llega».
  - «Nos queda una noche, la cuarta.»
  - «La quinta noche ya pasa: 32.»
  - Verificación: leer el enunciado sumando y comprobar que la respuesta no cambia.

### M6. 12.1: lo que se dice de cada familia

- **Dónde:**
  - `scenes-a.js:13-19`: las miniaturas.
  - `:25`: pista de la huerta, «x · x da lo mismo con 3 y con −3».
  - `:50`: describe.
  - `:73`: el estudiante.
  - Bitácora `scenes-b.js:275`.
  - Contraste:
    - `scenes-a.js:252`: «con los lados de las huertas, que son positivos»;
    - `:113-118`: la perilla a baja hasta 0 y negativos.
  - Captura: `it10/c12-errores/003-snap-c12.familias.png`.
- **Qué:**
  1. **«Las rectas suben parejo».** También bajan o se quedan quietas: la perilla a de 12.2 llega a a = 0 y
     a = −2. Lo que las define es que cambian lo mismo en cada paso.
  2. **«Las que despegan, duplican».**
     - La familia exponencial multiplica por un mismo número en cada paso: ×2 es una, ×1,5 es otra.
     - «Despegar» no la distingue: x · x con x ≥ 0 y x³ también despegan sin multiplicar por lo mismo.
     - La prueba que la distingue (los cocientes entre pasos son iguales) no se da, aunque 12.8 usa la
       paralela para la recta («no suma lo mismo»).
  3. **«Hueco».**
     - En el uso escolar, un hueco es un punto que falta en una curva por lo demás entera: (x² − 4) ÷ (x − 2)
       es una recta con un hueco en 2.
     - 1 ÷ (x − 2) tiene otra cosa: cerca de 2 se va para arriba y para abajo sin tope (una asíntota), y lejos
       se aplana hacia 0.
     - «No están definidas en un lugar» no caracteriza la familia: la recta con un hueco tampoco está definida
       en un lugar.
     - En la miniatura, el corte va de ≈ 1,73 a ≈ 2,27 por el recorte de la caja. Parece una franja sin
       definir.
  4. **La huerta.** La pista dice que «x · x da lo mismo con 3 y con −3» y la miniatura es la U entera. Pero
     una huerta no tiene lado −3. Con su dominio (lados positivos, como dice 12.4) el gráfico es media U, que
     despega como la escalera de Punto. Es la idea del cap. 9 («depende de qué cuenta la máquina»): la misma
     cuenta con otro dominio es otra función, con otra forma.
- **Por qué importa:**
  - §7J: familias, discontinuidades y asíntotas.
  - Criterio 11.
  - El punto 4 deshace una distinción que el juego ya enseñó, y 12.4 la vuelve a usar.
- **Cómo comprobar:**
  - Textos: «las rectas cambian parejo», «las que despegan multiplican por lo mismo en cada paso», «las que
    se disparan cerca de un número donde no están definidas». Nombrar «asíntota» es opcional.
  - La U como regla «x · x», no «huerta»; o dibujar la huerta como media U y decirlo.
  - Verificación: `git grep -n "duplican\|hueco" -- experiments/arithmos/src/ch12` sin descripciones
    falsas.

### M7. 12.5: qué es la tangente

- **Dónde:**
  - `scenes-b.js:38-39`: la recta azul pasa por (1, 5) con la pendiente del tramo y va de t = 0,2 a 2,6.
  - `:37`: se borra y redibuja sólo la recta; el segundo punto no se dibuja.
  - `:47`: la pista habla de «el segundo punto».
  - `:59` y `:63`: la opción «3,99» se corrige.
  - `:64`: «La recta azul, al final, apenas toca el salto: es la tangente.»
  - `:65`.
  - Captura: `it10/c12-directa/018-snap-c12.rapido.png`.
- **Qué:**
  1. **La recta final es una secante.** Es la recta del segundo 1 al 1,01: pendiente 3,99, y corta al salto
     en t = 1 y t = 1,01. La tangente tiene pendiente 4. La escena acaba de corregir a quien elige «3,99: es el
     último que dio». Con la recta hace lo que corrigió con el número.
  2. **«Apenas toca» es la idea errónea más común de tangente.** En la parábola coincide; en general no. La
     tangente a x³ en 0 cruza la curva. La ola de 12.1 tiene tangentes que la cruzan en cada punto de
     inflexión. La escena tiene a mano la definición correcta: la recta que pasa por el punto con la
     inclinación a la que se acercan las secantes, 4.
  3. **El segundo punto no se dibuja.** La pista lo menciona, pero el jugador no ve dos puntos que se acercan.
  4. **El 4 se infiere de cuatro valores.** La razón está al alcance del cap. 6: (6(1 + h) − (1 + h)² − 5) ÷ h
     = 4 − h. Es lo que el cap. 8 pide («hace falta una razón»), y lo que permite decir «se acercan a 4» sin
     adivinar el siguiente.
- **Por qué importa:**
  - §7J y la frase del cierre (límite, derivada).
  - §13: confusión entre objetos (secante y tangente) y metáfora engañosa.
- **Cómo comprobar:**
  - Dibujar el segundo punto en cada tramo.
  - Al final, dibujar la recta de pendiente 4, distinta de la azul, y decir: «La tangente es la recta con la
    inclinación a la que se acercan las azules: 4.»
  - Opcional: «del 1 al 1 + h da 4 − h: cuanto más corto, más cerca de 4».
  - Verificación: `git grep -n "apenas toca" -- experiments/arithmos/src/ch12` sin resultados.

### M8. 12.6: «al revés de la derivada» queda como eslogan, y la rama `inf` razona mal

- **Dónde:**
  - `scenes-b.js:128`: «Y es al revés de la derivada: una dice qué tan rápido, la otra cuánto se juntó.»
  - `:127`, rama `inf`: «Crecen, pero cada vez menos: se acercan a 9.»
- **Qué:**
  1. **«Al revés» no tiene nada en pantalla que lo sostenga.**
     - La frase compara un número en un instante (4, en 12.5) con un total en un intervalo (9, en 12.6).
       Entre esos dos números no hay «al revés».
     - La relación verdadera es entre funciones. Sea J(t) lo juntado hasta t (acá t²: 1, 4 y 9 a los 1, 2 y 3
       minutos). Qué tan rápido crece J es el caudal, 2t. Y eso, salvo lo que había al empezar.
     - Sin mostrarlo, la frase se aprende como receta («integrar es derivar al revés»). §5 no lo permite: «una
       receta sin fundamento».
     - La segunda mitad («una dice qué tan rápido, la otra cuánto se juntó») dice que responden preguntas
       distintas, no que una deshace a la otra.
  2. **Rama `inf`.**
     - «Crecen cada vez menos» no implica acercarse a 9: 1 + 1/2 + 1/3 + … crece cada vez menos y no se acerca
       a nada.
     - Los pasos mostrados (+1,5 y +1,2, el segundo de 6 a 30 pedazos) ni siquiera dejan ver «cada vez
       menos».
     - La razón firme está en el dibujo: los rectángulos quedan siempre debajo de la recta, así que la suma
       nunca pasa de 9; lo que falta son triangulitos que suman 9 ÷ n (3; 1,5; 0,3).
- **Por qué importa:** el contrato pide acumulación «sin convertir el recorrido en un curso universitario».
  Se puede no mencionar el teorema; no se puede mencionarlo como eslogan.
- **Cómo comprobar:**
  - O sacar «al revés», o mostrarlo: tabla «a 1 min, 1; a 2, 4; a 3, 9», y «lo juntado crece cada vez más
    rápido; qué tan rápido crece es el caudal: por eso se dice que una deshace a la otra».
  - Rama `inf`: «No: los rectángulos quedan siempre abajo de la recta, nunca pasan de 9, y lo que falta se
    achica: 3; 1,5; 0,3.»

### M9. 12.7: el valor absoluto sólo se dice

- **Dónde:**
  - `scenes-b.js:168`.
  - `RULES` (`logic/anticipate.js:11`, familia `v`): ninguna escena la dibuja.
  - Contraste:
    - `ch3/scenes-b.js:27` y siguientes: la distancia al cero se trabajó en la línea horizontal.
    - `:354` y siguientes: el pozo es vertical («Cuatro debajo del suelo»).
  - Captura: `it10/c12-directa/027-snap-c12.tramos.png`.
- **Qué:**
  1. **El gráfico no está.** «Un solo gráfico, dos reglas» habla de la V, que no está en la pizarra.
  2. **−x no se despliega.** «A la izquierda del cero, −x» es el punto difícil: −x es positivo cuando x es
     negativo (x = −4 → −x = 4). Un estudiante lee «−x» como «negativo».
  3. **El pozo era vertical.** «La distancia al cero del pozo… a la izquierda»: en el pozo era arriba o abajo
     del suelo.
- **Por qué importa:** §7J (valor absoluto y por tramos); §5 (poder desplegar la abreviatura).
- **Cómo comprobar:**
  - Dibujar la V junto al precio.
  - «Con −4, −x es −(−4) = 4: la distancia.»
  - «La distancia al cero de la línea de Mara.»

### M10. Cobertura de J y desvíos del diseño en el cierre

- **Dónde:**
  - Diseño 12.1: siete reglas, con «distancia al cero» y «¿cuántas veces?». La escena tiene cinco
    (`scenes-a.js:20`, `PICKS`).
  - `logic/anticipate.js:12`: `veces`, con `Math.log2`.
  - `tests/anticipate.test.mjs:5-8`: «las siete reglas del viaje tienen familia» prueba algo que el juego no
    muestra.
  - Diseño 12.8: «elegir la familia y las perillas». La escena no tiene perillas (`scenes-b.js:202-218`).
- **Qué:**
  - **Familias de §7J.**
    - Están: afín (12.2), cuadrática (12.3), exponencial (12.1, 12.8), trigonométrica (miniatura; el cap. 10
      trabaja más) y por tramos (12.7).
    - Racional: sólo la miniatura. Valor absoluto: sólo dicho (M9). Radical: sólo como «√ deshace x · x»,
      sin gráfico.
    - Logarítmica: estaba en el diseño y se cayó. La regla está en `RULES`, no en la escena.
    - Polinómica de grado mayor que 2: no está.
  - **Lectura del gráfico.** Ceros, signo, crecimiento, decrecimiento y máximo (12.3): sí. Simetría: «igual de
    los dos lados». Discontinuidad y asíntota: no se nombran (M6).
  - **Parámetros.** Sólo los de la recta: «relacionar parámetros con cambios de comportamiento» se queda en a y
    b.
  - **El cierre.** No usa parámetros, tasa ni acumulación. Tampoco el cap. 11, que es lo que pide una
    predicción con cuatro datos (A2).
- **Por qué importa:** §7J y la frase del contrato sobre el cierre («integrar lo anterior»). El diseño promete
  lo que el juego no hace, y una prueba lo da por hecho.
- **Cómo comprobar:**
  - Sumar a 12.1 la curva que se aplana («¿cuántas veces?») y la V: el código ya las tiene.
  - Una perilla de base en 12.8 (×2, ×3) o de «a» en la U de 12.3.
  - Que diseño, prueba y juego digan lo mismo.

---

## BAJA

- **B1.** 11.2:
  - `scenes-a.js:135`, «como la mayoría»: el 4 lo tienen 2 de 5 familias. «Como casi todas» (`:140`) está
    bien.
  - `:112`, «la Ronda, que guarda los de todos»: se puede leer como que los 34 incluyen los atados de las
    otras familias (doble conteo). «La Ronda, que son doce» evita la duda.
  - La mediana se define sólo para una cantidad impar de datos (pista de `:126`).
- **B2.** 11.4, `:251`, «el alto no compara cantidades». Con el eje en 96, el orden y las diferencias siguen
  bien (4 y 8 unidades de un trozo). Lo que se rompe es la proporción: el alto «no dice cuántas veces más».
- **B3.** 11.5: «cuando se elige una cosa de cada grupo, las maneras se multiplican» necesita que cada
  elección combine con todas las otras. La pista lo roza («las bufandas que se pueden usar con él», `:37`). Un
  caso donde no vale («la copa no va con la bufanda roja»: 5) daría la transferencia que pide §5.
- **B4.** Bitácora del cap. 11 (`scenes-b.js:285-289`), ramas que atribuyen de más:
  - `both` (11.2) → «elegiste el del medio».
  - `same` (11.3) → «pensaste en el otro»: el jugador dijo «cualquiera».
  - `lie` (11.4) → «te pareció decir otra cosa»: el jugador dijo que los números eran mentira, y eran
    ciertos. Hay que decirlo.
- **B5.** Bitácora del cap. 12:
  - `:259`: cuenta intentos fallidos, no reglas. Dos intentos con la misma regla dan «2 las probaste en otra
    familia primero», y puede dar «7 las probaste» con cinco formas. Usa cifras en vez de palabras («a dos
    las probaste»). Como en rev-mat-8 B4, un reinicio de escena sumaría intentos; no lo probé.
  - `:263`, rama `neg` («El doble menos uno») → «probaste otro orden»: no es otro orden, es otra operación.
  - `:265`, rama `3.99` → «aunque con tramo cero no se pueda dividir»: no responde a lo que eligió.
- **B6.** 12.2:
  - `scenes-a.js:104` y `:113`: el rótulo es `` `y = ${a} · x + ${b}` ``. Con b = −1 se lee «y = 4 · x +
    -1», y con a = −2, «y = -2 · x + 5»: guion en vez de signo menos, y «+ −». El resto del juego usa «−»
    con `dec`.
  - `curve` recorta por muestra (`common.js:32`) con n = 6: una recta empinada termina un paso antes del
    borde (y = 12x + 5 termina en x = 5; el borde está en 5,42).
- **B7.** 12.3, `:146`: «Mara le midió la altura: a los t segundos está a 6t − t²». Una medición da puntos; la
  fórmula es un modelo. En un capítulo sobre anticipar conviene separarlos: «Mara encontró la regla de la
  altura».
- **B8.** 12.4:
  - La composición no se escribe: (2x + 1)² y 2x² + 1. §5 pide conectar con la notación.
  - Bitácora `scenes-b.js:276`, «algunas se deshacen (en el orden contrario)»: falta «con la operación
    contraria». El pizarrón (`scenes-a.js:253`) sí lo muestra.
- **B9.** Recortes del dibujo:
  - 12.5 (`:38-39`): la recta azul llega a ≈ 11,4 en t = 2,6 con el eje hasta 10, y sale del mapa por
    arriba (captura 018).
  - 12.1: el «hueco» dibujado mide de ≈ 1,73 a 2,27 por el recorte.
- **B10.** 12.8:
  - `:216`: la ola se descarta con «no parece una ola». La razón firme existe y es la del describe (`:215`):
    la curva no pasa por los puntos. De hecho, ninguna ola C + A · sen(ωn + φ) pasa por 1, 2, 4, 8: con pasos
    iguales debería cumplir yₙ₊₁ − C = 2 cos ω (yₙ − C) − (yₙ₋₁ − C) para n = 1 y n = 2, y esas dos
    igualdades piden C = 0 y cos ω = 1,25, que no existe.
  - La pregunta de familia (`:209`) no baraja las opciones: la correcta es siempre la primera. Los `choose`
    con `evaluate` sí barajan (`engine/director.js:161`).
- **B11.** Semillas fijas (`logic/chance.js:6`, `:37`): todos ven los mismos 1000 baldes y las mismas 360
  tiradas (58 y 6). Desplegar el momento «Dos dados» desde la Bitácora repite exactamente el resultado. Para
  reproducir está bien, pero «caso por caso es suerte» suena raro si se repite idéntico. Se puede decir («Mara
  anotó estas tiradas») o variar la semilla por partida. Además, `:156` dice «salió 7 unas 58 veces»: es un
  conteo exacto y «unas» sobra.
- **B12.** 11.7, `:207`: los rótulos de viento van a (+10, −8) px de cada punto, y los puntos están a ≈ 31 px
  en diagonal: cada rótulo queda entre dos puntos (captura 030). Los ejes no tienen números. La palabra
  «correlación» no aparece (no es obligatoria).
- **B13.** 12.7: el rótulo «16 → 13» cae sobre la curva amarilla y la flecha se confunde con el trazo
  (captura 027).
- **B14.** 11.1: los seis primeros baldes del gráfico no son los seis del cap. 10. Allá: lleno, lleno, a
  medias, lleno, lleno, a medias (`ch10/scenes-b.js:274`); acá: lleno, lleno, a medias, a medias, lleno,
  lleno. A los 6 coincide la proporción (4/6), pero no el camino: a los 4, 1/2 contra 3/4. Si el gráfico
  arranca «de los seis que vimos», debería repetirlos.
- **B15.** Pruebas:
  - `chance.test.mjs:9-10` («con pocos casos puede estar lejos») sólo verifica que las proporciones están
    entre 0 y 1.
  - `anticipate.test.mjs:5-8` cuenta siete familias que la escena no usa (M10).
  - Ninguna prueba cubre 11.7: por ejemplo, que dentro de cada viento la relación desaparezca (A1).

---

## Lo que está bien (para no perderlo al corregir)

- **Costura con el cap. 10.** «De seis baldes, cuatro subieron llenos» coincide con `ch10/scenes-b.js:274`.
  El gancho de 11.8 entra directo en 12.1.
- **11.1.**
  - «Eso lo vimos, no está garantizado. Y el próximo balde, igual, no se sabe» es la frase justa.
  - Las tres ramas del pensamiento dicen «cerca», no «igual».
- **11.2.**
  - 10 y 4 son correctos.
  - «El promedio reparte todo» es la interpretación correcta del promedio.
  - «La mediana no se mueve aunque la Ronda tenga mil» es la propiedad justa.
  - La opción «los dos, y avisar» se recibe como la más honesta.
- **11.3.** Promedios iguales (5), rangos 2 y 8, y el rango bien definido («de lo más bajo a lo más alto»).
- **11.4.**
  - Las barras desde 96 son exactamente el doble (8 contra 4 unidades).
  - El redibujo desde cero es correcto.
  - «Los números eran ciertos, pero el dibujo decía otra cosa» separa dato de representación.
  - La Bitácora acota la regla a los gráficos de barras.
- **11.5.** El árbol es correcto (seis hojas sin superponerse), y las ramas de error explican por qué se
  multiplica y no se suma.
- **11.6.**
  - La grilla es correcta: 6 casilleros para el 7, 1 para el 12, 36 en total.
  - «Si los dados son parejos» declara una suposición.
  - «No es imposible, es raro» es exacto.
  - La Bitácora da la regla con su condición: «Con casos igual de posibles».
- **11.7.**
  - La opción «no se sabe» es la que se trata como buena.
  - Las ramas `yes` y `luck` del pensamiento dicen «puede».
  - El cuerpo de la Bitácora dice «puede haber una tercera». Lo que falla es lo que A1 describe.
- **11.8.** La clasificación es correcta, y la distinción «exacto con una regla / lo probable» es la idea del
  capítulo.
- **12.1.** Las cinco reglas van a su forma, y las pistas de error son correctas. Las miniaturas son fieles:
  la recta y la de Punto, en la misma ventana, se comparan bien; la asíntota en 2 va punteada.
- **12.2.**
  - La recta y = 10x + 1 coincide con el cap. 7 y con el cap. 9.
  - Se alcanza con las perillas: a sólo toma pares y b sólo impares, y la meta es (10, 1).
  - «b es dónde empieza, el día 0» y «a es cuánto sube por día» son correctos.
- **12.3.**
  - Ceros, crecimiento, decrecimiento, máximo y signo, correctos.
  - El máximo se justifica por simetría («igual de los dos lados»), y vale para todo t, no sólo para los
    enteros tocables.
  - «Se frena arriba» anticipa la derivada nula en el máximo.
- **12.4.**
  - 25 y 9: un contraejemplo basta para mostrar que el orden importa, y la escena lo usa bien.
  - La aritmética de las ramas equivocadas es correcta (1,5 y 9).
  - «Sólo se deshace si sabemos el signo; con los lados de las huertas, que son positivos, la raíz lo
    deshace» y «√ (si x ≥ 0)» son exactos y coherentes con el cap. 6.
- **12.5.**
  - Las velocidades medias son exactas: 4 − h.
  - La rama «con tramo cero no se puede dividir» se responde muy bien: es cierto, y aun así se acercan a un
    número. Es la noción de límite sin fórmulas.
  - La definición de derivada es correcta.
- **12.6.**
  - Las sumas por la izquierda son exactas: 9 − 9/n.
  - «Caudal por tiempo» da las unidades.
  - La opción correcta trae su razón geométrica: el triángulo de 3 por 6, a la mitad.
  - La rama «6: el último caudal» separa bien caudal de total.
- **12.7.**
  - La tarifa es continua en 10 y 16 → 13 es correcto.
  - La fórmula escrita es correcta.
  - «Un solo gráfico, dos reglas» define bien una función por tramos.
- **12.8.**
  - La recta se descarta con la razón justa (las diferencias no son iguales).
  - La ola también se descarta bien: ninguna pasa por los cuatro puntos (B10).
  - 2ⁿ pasa por los cuatro puntos y el cruce del 30 está bien leído en el modelo continuo.
  - La rama de la Bitácora «duplicando, pasa…» ya tiene la condición que falta en el resto (A2).
- **Bitácoras.**
  - Las ramas producen texto sin huecos; las dos tienen cuatro párrafos.
  - No se escriben en una repetición del momento y filtran la evidencia por partida.
- **Pruebas.** 96/96 en `HEAD`; `chance` 5/5 y `anticipate` 7/7.

## Qué no pude verificar

- **El juego en un navegador.** No lo abrí, por la restricción del entorno. Todo lo de pantalla sale del
  código, los logs y las capturas del bot.
- **Las partidas y los commits.**
  - `c11-directa` (17:17) y `c11-errores2` (17:23) son anteriores a `f90ad31` (17:24). `c12-directa` (18:14)
    y `c12-errores` (18:15) son de antes de `efa47c9` o de su mismo minuto.
  - Todas las líneas `lee:` y `elige` coinciden con el texto de los commits (script propio).
  - Las Bitácoras guardadas en `state.json` coinciden con las que produce el código del commit.
- **Esperas largas.** En `c12-directa`, la captura de 12.1 falló por tiempo (≈ 98 s de espera). En
  `c11-directa` hay 141 s entre la elección de 11.7 y la línea siguiente. Es funcional; no lo investigué.
- **Ramas sin partida.** El bot no recorrió estas ramas; las revisé sólo en el código:
  - Cap. 11:
    - 11.1 `nothing`; 11.2 `both`; 11.3 `same`; 11.4 `lie`; 11.5 `9`; 11.6 `same`; 11.7 `luck`.
    - 11.8: las clasificaciones equivocadas, salvo «escalera de Mara».
  - Cap. 12:
    - 12.1: los errores, salvo Mara → hueco. 12.2: pasarse de largo y los valores negativos.
    - 12.3 `1`; 12.4 `neg` y `m3`; 12.5 `none`; 12.6 `inf`; 12.7 `8`; 12.8 `15`.
  - En los dos capítulos: el reinicio de escena y la repetición de los momentos.
  - Las dos Bitácoras las ejecuté en todas sus ramas.
- **La cúbica y la ola de A2 y B10.** Las calculé yo. Son contraejemplos matemáticos, no una afirmación sobre
  cómo se comporta la Marea del juego.
- **Audio, teclado, táctil y legibilidad**: no los evalué.
- **La referencia curricular de I y J**: no la contrasté.
- **El cap. 9 corregido (`40ceece`)** sólo lo cito para la continuidad; no lo revisé.
- **Comprensión humana.** No hay playtests. Nada de esto certifica que alguien entienda.
