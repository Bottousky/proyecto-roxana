# Revisión matemática independiente: cap. 9 «Depende» (rev-mat-8)

- Fecha: 2026-10-06. Commit revisado: `b8a1bc5` (rama `claude/arithmos-graphic-adventure-065e68`).
- Alcance:
  - `experiments/arithmos/src/ch9/{common,scenes-a,scenes-b,chapter}.js`.
  - `src/logic/functions.js` y `tests/functions.test.mjs`.
  - Costura de entrada: `src/ch8/scenes-b.js:319-385` (8.8 «Sombras»).
  - Referencias cruzadas: `ch7/scenes-a.js` (carrera sumar/duplicar, huerta x · x = 2), `ch7/scenes-b.js`
    (reparto 1 ÷ (x − 2)), `ch8/scenes-a.js` y Bitácora del cap. 8, `ch4/scenes-a.js` (medias vueltas).
  - Contrato: `docs/arithmos/ARITHMOS_MASTER.md` §5, §7G (y §7I, porque lo toca), §13.
  - Diseño: `docs/arithmos/ARITHMOS_DESIGN.md`, «Capítulo 9 — Depende» y «Criterios de escena».
- Números de línea: los de `b8a1bc5`. Mientras revisaba, `HEAD` avanzó (`22d3552`, `910a374`: cap. 10).
  Comprobé con `git diff` que `ch9/`, `ch8/`, `logic/functions.js` y `tests/functions.test.mjs` no
  cambiaron entre `b8a1bc5` y `HEAD`, ni en la copia de trabajo: las líneas valen también en `HEAD`.
- Evidencia usada (bot, no personas): `artifacts/arithmos/it08/c9a-directa2/`, `c9b-directa/`,
  `c9-errores/`, `c9-telefono2/` (`log.txt`, `state.json`, capturas).
- Método:
  - Lectura del código, los textos y la Bitácora, rama por rama.
  - `node --test experiments/arithmos/tests/`: 84/84 en la copia de trabajo (incluye `turns.test.mjs`,
    del cap. 10, sin commitear). Con los archivos de prueba de `b8a1bc5`: 77/77. `functions.test.mjs`: 4/4.
  - Scripts propios en el scratchpad:
    - Recalculan cada salida de las máquinas, los cruces de 9.7 y las posiciones de 9.3, 9.4 y 9.8.
    - Reproducen `verticalHits` con la grilla de la escena (`xs` de −3 a 3 cada 0,25) y miden dónde
      quedan las marcas contra los cortes verdaderos; prueban la heurística con otras formas.
    - Calculan sombras reales del sol (hora solar, declinación ±23,44°, sin refracción) para cuatro
      latitudes argentinas y tres épocas.
    - Ejecutan la `writeJournal9` del commit en todas las ramas, y con un reinicio de escena.
    - Comparan cada línea `lee:` / `elige` de los cuatro logs con el texto del commit.
  - **Sin navegador.** No abrí el juego; todo lo de pantalla sale del código, los logs y las capturas.

## Veredicto corto

Las cuentas y los dibujos son correctos:

- Tabla de sombras idéntica a la del cap. 8: 8→4, 10→2, 12→1, 14→2, 16→4. Ida: función. Vuelta: falla en 2
  y en 4 (`isFunction`).
- Máquina de Mara: 1→3, 2→5, 3→7, 5→11, 10→21. Cualquier terna de {1, 2, 3, 5} deja una sola regla de
  `RULES` (la del doble más uno).
- 1 ÷ (x − 2): −1 → −1/3, 0 → −1/2, 3 → 1, 5 → 1/3; con 2 se traba. x · x de −3 a 3: 9, 4, 1, 0, 1, 4, 9.
- 9.4: la recta y la U pasan; el círculo y la U acostada no. La marca peor cae en x = −1,5 (círculo) y
  x = −1 (U acostada), con las marcas a menos de 0,2 unidades (≈ 3 px) de los cortes verdaderos.
- 9.7: A = 1 + 10·d, B = 10 + d y C = 2ᵈ están bien dibujadas, sin recorte (máximo 64 ≤ 70).
- Las definiciones de función («a cada entrada, una sola salida»), dominio e imagen son correctas; los
  límites de la recta parada («con la entrada sobre la recta acostada», «dice si puede ser, no cuál»)
  están dichos.

Fallan tres cosas, todas sobre **qué prueba lo que se vio**, que es justo lo que el capítulo enseña:

1. **9.2 y la Bitácora dicen que un caso nuevo «comprueba» una regla.** Es lo contrario de la idea
   central del cap. 8 («Probando casos no se termina») y de §7I. Cuatro casos no determinan una regla.
2. **9.7 une conteos por día con curvas y lee un cruce «un poco antes del día 6, como vimos».** El mismo
   capítulo, en 9.3, dijo que lo que se cuenta por día no se une. El cap. 7 mostró «desde el día 6», no un
   cruce antes. El gráfico ni siquiera deja ver ese cruce.
3. **9.8 llama «noche» y «fuera del dominio» a huecos que en su mayor parte son horas con sol sin medir**,
   dice «Los huecos son parte del dominio que falta» (se lee al revés), y dibuja el tiempo sin escala.

Además: la imagen de x · x se afirma completa sin decir el dominio ni mostrar que sale cada positivo; la
Bitácora vuelve a decir «la sombra» donde rev-mat-7 pidió «el largo»; «relación» no se define; varias
conclusiones citan datos que el jugador puede no haber visto.

## Cumplimiento por escena (diseño del cap. 9 y contrato G)

| Escena | Idea del diseño | Estado |
|---|---|---|
| 9.1 | Función vs relación con flechas | Correcto, con «otra entrada» bien dicho; la opción y la Bitácora vuelven a «la sombra» (M2); «relación» sin definir (M3); la vuelta de las flechas es automática (B9) |
| 9.2 | Regla de entrada y salida; máquina de Punto | Salidas correctas; **«el caso nuevo lo comprueba»** (A1); el error se atribuye a «pocos casos» cuando los casos ya lo refutaban (M4); la máquina de Punto no se dibuja y la de Mara nunca repite entrada (M5) |
| 9.3 | Tabla → gráfico; unir o no unir | Puntos correctos; la suposición se declara en las tres ramas; la ola se descarta sin leerla y toca un punto (M6); criterio de unir mezcla entrada y salida, «sin inventar», familias sin dibujar (M7) |
| 9.4 | Recta parada | Clasificación, marcas y alcance correctos; la U sin nombrar la confusión típica (B1); rótulos «función» bajo dibujos (B2); heurística de `logic` frágil fuera de estas formas (B5) |
| 9.5 | Dominio: cuenta vs reparto | Distinción correcta y valiosa; cita 2,5 y «todos los demás» sin haberlos visto; el reparto puede no probarse nunca (M8) |
| 9.6 | Imagen | −4 «no está, con los números que conocemos»: correcto; «la imagen es el 0 y los positivos» sin dominio ni prueba de que sale cada positivo (M1) |
| 9.7 | Expresión, tabla y gráfico | Gráficos correctos; **cruce en curvas continuas de conteos discretos, «como vimos»** (A2); no hay tabla ni escala vertical (M9) |
| 9.8 | Periodicidad; gancho al cap. 10 | Predicción razonable; **huecos = noche = no definida** y eje sin escala (A3); «en invierno cambia un poco» subestima (M10) |
| Límites que el diseño promete | Línea entre puntos = suposición; recta parada con entrada acostada | El primero, en 9.3 sí, en 9.7 no (A2); el segundo, sí (falta en la Bitácora, B3) |

### Respuestas a lo pedido

- **Definiciones.** Función: correcta. Relación: sólo por un ejemplo negativo (M3). Dominio: «las
  entradas con las que se puede», bien distinguido entre cuenta y contexto. Imagen: «lo que puede salir»,
  correcta; el caso de x · x afirma de más (M1). Gráfico: «se lee: cada punto dice algo», bien, pero 9.7 y
  9.8 dibujan gráficos que no se pueden leer (M9, A3).
- **Prueba de la recta parada.** Correcta y con su alcance; ver B1, B2, B5.
- **Unir o no unir; interpolación.** La suposición se dice en todas las ramas de 9.3 (bien). El criterio
  «ni media familia» es incorrecto como criterio, las rectas se presentan como «sin inventar», y 9.7 viola
  el criterio (M7, A2).
- **Máquina de Punto.** «No es una función» es correcto; la máquina no está dibujada (M5).
- **Dominio de 1 ÷ (x − 2) vs reparto.** Correcto (todo menos 2; enteros mayores que 2), con evidencia
  incompleta (M8).
- **Imagen de x · x.** «Con los números que conocemos» es la salvedad justa para −4 (con complejos,
  2i · 2i = −4, que el cap. 10 en curso trabaja). Lo que falla es la otra mitad (M1).
- **Tres representaciones.** Gráficos correctos; cruce A–C en t ≈ 5,909: «un poco antes del día 6» es
  cierto **sólo** en el modelo continuo, que no se declara (A2).
- **Periodicidad y la noche.** «De noche no está definida» es una decisión defendible (mejor que 0); lo
  incorrecto es identificar los huecos con la noche y la frase sobre el dominio (A3, M10).
- **Bitácora.** Sin `undefined` ni ramas vacías; ver A1, M2, M4, M7, B3, B4, B12.

---

## ALTA

### A1. 9.2 y la Bitácora: «una regla se adivina con casos y se comprueba con uno nuevo»

- **Dónde:**
  - `src/ch9/scenes-a.js:163`: «Veintiuno: el doble, y uno más. Con pocos casos parecía otra cosa; el caso
    nuevo lo comprueba.» (ramas `20` y `13`).
  - `:164-165`: el cartel de la máquina pasa solo de «?» a «× 2 + 1», sin que nadie la abra ni Mara diga
    cómo la armó.
  - `:166`: «Mara: tu máquina hace «el doble más uno». Con el mismo número, siempre sale lo mismo.»
  - Bitácora: `src/ch9/scenes-b.js:336` («Una regla se adivina con casos y se comprueba con uno nuevo.»).
  - Contraste: `ch8/scenes-a.js:78-81` («Probando no se termina nunca: hace falta una razón»; «Mil no son
    todos») y `:180`; Bitácora del cap. 8, `ch8/scenes-b.js:413` («Probando casos no se termina: para saber
    que algo vale siempre hace falta una razón que sirva para todos a la vez»).
  - Evidencia: `c9-errores/log.txt` 18,5 s; Bitácora en `c9-telefono2/state.json`.
- **Qué:**
  - «Comprobar» es verificar que algo es cierto. Un caso nuevo que coincide **no** lo verifica: sólo
    podría refutarlo. Ejemplo: g(x) = 2x + 1 + (x − 1)(x − 2)(x − 3)(x − 10) da 3, 5, 7 y 21 con 1, 2, 3 y
    10, exactamente lo que vio el jugador, pero g(5) = 11 − 120 = −109.
  - La escena trata la sospecha como probada: el cartel «× 2 + 1» aparece solo y el estudiante afirma la
    regla y que «siempre» sale lo mismo. Lo que de verdad la cierra (Mara la construyó) no se dice.
- **Por qué importa:**
  - Contradice, en la abreviatura que el jugador se lleva, la idea central del capítulo anterior.
  - §7I pide «distinguir una regularidad observada de una garantía». El criterio de escena 11 dice que
    «la evidencia no puede probar más de lo que muestra».
  - Es el único lugar del capítulo donde se habla de cómo se sabe una regla.
- **Cómo comprobar la corrección:**
  - `:163`, por ejemplo: «Veintiuno: el doble más uno sigue andando. Un caso nuevo puede tirar abajo una
    regla; si coincide, todavía es una sospecha.»
  - Que Mara cierre: «Sí, la armé así: el doble, y uno más.» (o abrir la máquina). Recién ahí el cartel.
  - Bitácora: «Una regla se sospecha con casos; un caso nuevo puede descartarla, pero no probarla. Para
    saberla hay que ver cómo está hecha.»
  - Verificación: `git grep -n "comprueb" -- experiments/arithmos/src/ch9` no debe devolver frases que
    presenten un caso como prueba.

### A2. 9.7: un cruce «un poco antes del día 6, como vimos», leído en curvas que unen conteos por día

- **Dónde:**
  - `src/ch9/scenes-b.js:191` («la mía, diez por día, y la de Punto, el doble cada día»).
  - `:204-205`: cada gráfico se dibuja con 61 muestras, de t = 0 a 6 cada 0,1, como curva continua.
  - `:238`: «Se cruzan un poco antes del día 6, como vimos.»
  - Contraste dentro del capítulo: `scenes-a.js:289-295` (familias por día: «no hay un día a medias, ni
    media familia… si unimos, la línea dice cosas que no existen») y la Bitácora `scenes-b.js:337` («no se
    unen cuando no hay nada entre medio»).
  - Contraste con el cap. 7: `ch7/scenes-a.js:187` («Hoy dibujo uno, y después diez por día»), `:276`
    («Desde el día 6 vas adelante») y la Bitácora `ch7/scenes-b.js:649` («duplicar pasó adelante el día 6»).
  - Capturas: `c9b-directa/008-snap-c9.maneras.png`, `c9-telefono2/030-snap-c9.maneras.png`.
- **Qué:**
  1. **Contradice 9.3.** Los escalones se dibujan por día y se cuentan enteros, como las familias. Unidos,
     el gráfico afirma 1 + 10 · 5,5 = 56 y 2^5,5 ≈ 45,25 escalones a mitad del día 5. Con el criterio que
     el capítulo acaba de dar, son puntos sueltos. El cruce A–C está en t ≈ 5,909, con ≈ 60,09 escalones:
     existe sólo si se supone que las dos escaleras crecen parejo durante el día. El diseño pide decir esa
     suposición («la línea supone que entre puntos la regla sigue igual (hay que decirlo)»); 9.3 la dice,
     9.7 no.
  2. **«Como vimos» es falso.** El cap. 7 mostró la tabla por día: día 5, 51 a 32; día 6, 61 a 64. Lo que
     se vio es que Punto pasa adelante **el día 6**, no un cruce antes.
  3. **El gráfico no lo muestra.** El dibujo termina en el día 6, donde A = 61 y C = 64 están a 3 unidades
     (8,1 px de pizarra; ≈ 14 px a 1600 × 900, con puntos de ≈ 7 px de radio). En la captura se ven como un
     solo punto: parece que se encuentran justo en el 6. Que «la curva despega» por encima de la recta no se
     ve.
  4. **Omite el otro encuentro.** A y C valen 1 el día 0 (1 + 10 · 0 = 2⁰): los dos puntos están uno sobre
     otro en la captura. Un estudiante que mira el gráfico ve que «se tocan» al empezar. (También A y B
     coinciden el día 1, en 11, y B y C se cruzan en t ≈ 3,785; no se dice, y no hace falta.)
- **Por qué importa:**
  - §7G pide diferenciar un gráfico de un dibujo. La escena que integra las representaciones aplica, sin
    avisar, lo que 9.3 enseñó a no hacer.
  - Atribuye al cap. 7 algo que no mostró (criterio 5: cuentas coherentes entre escenas y capítulos).
  - Un jugador que aprendió 9.3 debería objetar, y el juego no le da con qué.
- **Cómo comprobar la corrección** (una de dos):
  - **Puntos sueltos** en los días 0 a 6 (mejor, 0 a 7) y: «El día 5 va adelante Mara, 51 a 32; el día 6,
    Punto, 64 a 61: pasa adelante entre el 5 y el 6, como vimos. Y el día 0 empiezan juntos, en 1.»
  - **Curvas declaradas:** «Si las dibujamos como si crecieran parejo durante el día (una suposición, como
    la línea de Cornisa), se cruzan un poco antes del 6.» Más «empiezan juntas en 1».
  - En los dos casos, extender hasta el día 7 (A = 71, C = 128) con otra escala, para que se vea C por
    encima de A. Verificación: una captura donde C supere visiblemente a A, y ningún «como vimos» sobre algo
    que no se vio.

### A3. 9.8: los huecos entre días se llaman «noche» y «fuera del dominio», y el tiempo no tiene escala

- **Dónde:**
  - `src/ch9/scenes-b.js:265-266`: `DW = 160`, `HX = 15`. Las 8 h medidas (8 a 16) ocupan 120 px; las
    16 h entre las 16 y las 8 del día siguiente, 40 px.
  - `:267` (base), `:268` (sólo los rótulos 1 y 4), `:272` (sólo «día k»; ninguna hora).
  - `:293`: «Entre un día y otro, de noche, no hay sombra: ahí la función no está definida. Los huecos son
    parte del dominio que falta.»
  - Capturas: `c9b-directa/010-snap-c9.vuelve.png`, `c9-telefono2/033-c9.vuelve-eleccion.png`.
- **Qué:**
  1. **Los huecos no son la noche.** Van de las 16 a las 8: 16 horas. Con condiciones compatibles con la
     tabla (por ejemplo, 41° S en diciembre, donde el modelo da 4,1 : 1,9 : 1 a las 8, 10 y 12), el sol se
     pone a las ≈ 19,5 y sale a las ≈ 4,5 (hora solar). Entre las 16 y la puesta hay sombra y crece: a las
     17, ≈ 6,4; a las 18, ≈ 11,6; a las 19, ≈ 38 (en las unidades de la tabla). Lo mismo antes de las 8.
     Aun en el equinoccio, 4 de esas 16 horas tienen sol. La mayor parte del hueco es **no medido**, no
     **no definido**. Es el argumento de 9.3 al revés: allá «entre las 8 y las 10 también hay sombra».
  2. **«No está definida» de noche** es una decisión defendible y mejor que poner 0: hacia la puesta el
     largo crece sin tope, no baja a cero. Pero es una decisión sobre el dominio, y vale para la noche, no
     para todo el hueco.
  3. **«Los huecos son parte del dominio que falta»** se lee como «los huecos son parte del dominio». Lo
     que se quiere decir es lo contrario: la noche no está en el dominio.
  4. **Cambia la entrada sin decirlo.** En 9.1 a 9.3 la entrada era la hora de un día; acá es el momento a
     lo largo de varios días, y el eje no tiene horas. Además no está a escala: 8 h valen 120 px y 16 h,
     40 px. El período de 24 h se dibuja con el día ocupando el 75 % del ancho, y el hueco queda chico, como
     si casi no existiera.
- **Por qué importa:**
  - Es la última frase del capítulo sobre el dominio. Confunde las dos nociones que el capítulo separa:
    «no medido» (9.3) y «fuera del dominio» (9.5).
  - Con el criterio del propio capítulo («un gráfico se lee»; criterio 8, «escalas fieles»), el dibujo de
    9.8 no se puede leer: no hay horas y el tiempo está deformado.
- **Cómo comprobar la corrección:**
  - Texto, por ejemplo: «De noche no hay sombra: ahí el largo no está definido; la noche no es parte del
    dominio. Entre las 16 y la noche sí hay sombra, cada vez más larga: no la medimos.»
  - Dibujo: eje del tiempo a escala (24 h por día, el hueco de las 16 a las 8 el doble de ancho que el
    tramo medido), con la noche marcada aparte de lo no medido.
  - Verificación: una captura donde el hueco mida el doble del tramo de 8 a 16 y donde se distinga «noche»
    de «sin medir».

---

## MEDIA

### M1. 9.6: «la imagen de x · x es el 0 y los positivos» no se sigue de lo que se vio, y falta el dominio

- **Dónde:** `scenes-b.js:132` (entradas −3 a 3), `:140` (se puede parar después de 4), `:157-164`,
  `:166`, `:169`. Evidencia `image` con `img: [0, 1, 4, 9]` en `c9b-directa/state.json` y
  `c9-errores/state.json`. Captura `c9b-directa/005-c9.imagen-eleccion.png`.
- **Qué:**
  1. La escena muestra que nunca sale un negativo. Que **cada** positivo sale hace falta mostrarlo: 2 sale
     con √2, 3 con √3, 0,25 con 0,5. El juego tiene el puente (`ch7/scenes-a.js:92`: «x · x = 2», la huerta
     de Peldaño) y no lo usa.
  2. La imagen depende del dominio. Con las entradas que ofrece la máquina, todas enteras, la imagen es
     {0, 1, 4, 9}: es lo que el propio juego guarda como evidencia `image`. La escena anterior enseñó que
     el dominio depende de lo que se cuenta; acá no se dice cuál es.
  3. La razón por signos («positivo por positivo…») aparece sólo en la rama `other` (`:164`). En `never`
     no hay razón; en `m2`, sólo para −2.
- **Por qué importa:** §7G (dominio e imagen) y criterio 11. Además se arriesga a aprender «la imagen es
  todo lo que no quedó excluido». Aplicado al reparto (dominio 3, 4, 5…), daría «todo menos el 0», cuando
  es {1, 1/2, 1/3, …}.
- **Cómo comprobar:** agregar «¿Y el 2? Con la huerta de Peldaño: √2 · √2 = 2. Cada positivo sale de su
  raíz» y «si entran todos los números que conocemos». Dar la razón por signos en las tres ramas.
  Opcional: preguntar qué sale del reparto, como transferencia.

### M2. 9.1 y la Bitácora: vuelve «la sombra» donde corresponde «el largo» (regresión de rev-mat-7 A2)

- **Dónde:** `scenes-a.js:71` (opción «Las 10 o las 14: con la sombra sola no se sabe.»);
  `scenes-b.js:315` (Bitácora, rama `both`: «la hora no depende sólo de la sombra»);
  `tests/functions.test.mjs:7` (nombre de la prueba). Contraste: `scenes-a.js:85` («Si además decís para
  qué lado apunta, ahí sí se distinguen»), `:73` («Cornisa dice sólo el largo»), Bitácora `:335` («el
  largo»).
- **Qué:** con la sombra entera (largo y dirección) la hora sí se sabe: el cap. 8 la dibuja apuntando para
  lados opuestos. La propia línea del estudiante lo dice. La opción correcta y la Bitácora restituyen la
  frase que rev-mat-7 marcó como falsa; además, las otras dos ramas de la Bitácora dicen «Con la sombra 2».
- **Por qué importa:** es la costura con el cap. 8. La Bitácora contradice al diálogo de la misma escena.
- **Cómo comprobar:** «con el largo solo no se sabe», «la hora no depende sólo del largo de la sombra»,
  «Con el largo 2…». Verificación: `git grep -n "sólo de la sombra\|sombra sola\|la sombra 2" --
  experiments/arithmos/src/ch9` sin resultados.

### M3. «Relación» no se define; aparece sólo como «lo que no es función»

- **Dónde:** `scenes-a.js:85` y Bitácora `scenes-b.js:335` («Eso es una relación, pero no una
  función»). Son las dos únicas apariciones visibles de la palabra; 9.4 (el círculo) no la usa.
- **Qué:** la frase es correcta, pero nunca se dice qué es una relación (cualquier forma de juntar
  entradas con salidas). Tampoco que las flechas de ida **también** son una relación, que además es
  función. Un jugador puede concluir que «relación» y «función» son clases separadas, y es falso: toda
  función es una relación.
- **Por qué importa:** §7G pide literalmente «diferenciar una relación de una función». Sin la definición,
  la diferencia queda como etiqueta.
- **Cómo comprobar:** «Las flechas de ida y las de vuelta son relaciones; las de ida, además, son función:
  de cada hora sale una sola.» En 9.4: «el círculo es una relación, pero no una función».

### M4. 9.2: «con pocos casos parecía otra cosa» atribuye mal el error, en todas las ramas

- **Dónde:** `scenes-a.js:140` (entradas 1, 2, 3, 5), `:155` (`left` se calcula y no se usa), `:163`;
  Bitácora `scenes-b.js:317` («Con pocos casos pensaste otra regla»). Evidencia: en
  `c9-errores/state.json`, `rule-predict` registra `answer: '20'` con `matching: ['double1']`.
- **Qué:** las cuatro ternas posibles de {1, 2, 3, 5} dejan sólo «el doble más uno» (`rulesMatching`, lo
  verifiqué). «20: el doble» ya estaba refutado por 1 → 3 (el doble de 1 es 2). «13: siempre suma lo mismo»,
  por 1 → 3 y 2 → 5 (suma 2, después 3). El error no viene de tener pocos casos: viene de no contrastar la
  sospecha con la tabla que estaba en la pizarra.
- **Por qué importa:** criterio 10 (la Bitácora sin atribuir de más) y §5 (distinguir la interpretación
  errónea). Además refuerza A1: sugiere que con más casos la regla quedaría probada.
- **Cómo comprobar:** «El doble de 1 es 2, y salió 3: la tabla ya decía que no era sólo el doble.» Usar
  `left` o la tabla para señalar el caso que refuta.

### M5. 9.2: la máquina de Punto no se dibuja, y la de Mara nunca recibe dos veces el mismo número

- **Dónde:** `scenes-a.js:144` (el filtro impide repetir una entrada), `:166`, `:168-190` (no hay segunda
  máquina; el botón «3» está en la misma fila «entra:»; las salidas van a `A.x1 − 120`), `:194` (la
  ruedita se narra; no se dibuja ni se tacha). Capturas `c9a-directa2/009` y `010`.
- **Qué:**
  - La única máquina dibujada dice «× 2 + 1». El 3 → 9 amarillo queda al lado. Que es otra máquina se
    sabe sólo por el color y por la frase de Mara. La interfaz del diseño dice «Ninguna información depende
    sólo del color».
  - «Con el mismo número, siempre sale lo mismo» (`:166`) no se observó en la máquina de Mara. El contraste
    se arma de un solo lado.
- **Por qué importa:** la conclusión «no es una función» tiene que quedar pegada a la máquina de Punto. Si
  no, se lee «la máquina × 2 + 1 dio 9», que contradice lo que se acaba de decir.
- **Cómo comprobar:** dibujar la máquina de Punto, con su ruedita, y que él la tache. Permitir darle de
  nuevo el 3 a la de Mara (sale 7 otra vez) antes de pasar a la de Punto.

### M6. 9.3: la ola decorativa se descarta sin leerla, y toca el punto de las 14

- **Dónde:** `scenes-a.js:263` (ola centrada en 2,5, amplitud 30 px), `:266` (describe: «pasa por arriba
  y por abajo de los puntos sin tocarlos»), `:269` («¿a qué hora es esa ola? No sale de la tabla.»).
  Captura `c9a-directa2/014-snap-c9.puntos.png`.
- **Qué:**
  1. Calculé la distancia mínima de la ola a cada punto: 69, 34,6, 45,7, **7,0** y 45,7 px. En las 14 es
     exactamente el radio del punto (7), menos que radio más medio trazo. En la captura, el valle de la ola
     está sobre el punto. El describe dice «sin tocarlos».
  2. El criterio que separa un gráfico de un dibujo decorativo es leerlo, y el estudiante lo escribe al
     final de la escena («un gráfico se lee: cada punto dice algo»). La crítica no lee: «¿a qué hora es esa
     ola?» no dice qué está mal. Leída, la ola dice cosas falsas: a las 8, unos 2,5; la tabla, 4.
- **Por qué importa:** §7G pide diferenciar un gráfico de un dibujo decorativo, y es esta escena.
- **Cómo comprobar:** mover la ola para que no toque ningún punto (o hacer el toque deliberado y
  comentarlo). Que el estudiante lea un valor: «A las 8 tu ola dice dos y medio; la tabla, 4.»

### M7. 9.3: unir o no unir — el criterio mezcla entrada y salida, la recta se presenta «sin inventar» y las familias no se dibujan

- **Dónde:** `scenes-a.js:279-286`, `:287`, `:289-295`; Bitácora `scenes-b.js:319`, `:321`, `:337`; 9.8
  `:286` y `:300` («la ve»). Captura `c9-telefono2/018-c9.puntos-eleccion.png`.
- **Qué:**
  1. **«Ni media familia» no es un criterio.** Lo que decide es la entrada: la cuenta es por día y entre
     días no hay otro valor. Con entrada continua y salida entera (cuánta gente hay en el depósito a lo
     largo del día) el gráfico es una escalera y va unido. Y 9.7 une conteos enteros (A2).
  2. **«Sin inventar».** La rama `pretty` dice «Unir sí, pero sin inventar: por los puntos», y la Bitácora,
     «se une por los puntos, sin inventar». Los tramos rectos también son una suposición (la misma rama lo
     dice en la frase siguiente). La sombra real se curva: con condiciones compatibles con la tabla, a las
     9 da ≈ 2,8 (la línea, 3) y a las 11, ≈ 1,25 (la línea, 1,5); el mínimo del mediodía es redondeado. La
     punta de la «ve» en las 12 es un efecto de los tramos rectos, y 9.8 nombra a la función por ese efecto.
     «Más o menos 3. Casi, porque no lo medí» (`:287`) sí está bien dicho.
  3. **Las familias no se dibujan.** «¿Esos puntos se unen?» se pregunta sin esos puntos en la pizarra: la
     consecuencia de unir (un valor en «lunes y medio») no se ve.
  4. **La rama `loose` de la Bitácora** («así que se unen (suponiendo)») trata como error dejar sueltos
     puntos medidos, que es válido. La escena dice «se puede unir»; la Bitácora, «se unen».
- **Por qué importa:** es la pregunta explícita del diseño para 9.3, y su criterio se reusa en 9.7 y 9.8.
- **Cómo comprobar:** «No hay lunes y medio: la cuenta es por día» (sin «ni media familia», o diciendo que
  no es la razón). «Por los puntos, con la línea más simple; la de verdad se curva un poco.» Dibujar los
  puntos de las familias. Bitácora `loose`: «se pueden unir (suponiendo)».

### M8. 9.5: las conclusiones citan entradas que el jugador puede no haber visto

- **Dónde:** `scenes-b.js:65` (botones −1, 0, 2, 3, 5), `:82-83` (termina con tres intentos si uno es el
  2), `:94`, `:101`, `:103`. En las tres partidas que pasan por 9.5, el bot dio sólo −1, 0 y 2.
- **Qué:**
  1. «La máquina acepta −1 y 2,5» (`:101`, ramas `not2`): 2,5 no es un botón, y −1 puede no haberse probado.
  2. «Con todos los demás sale algo» (`:94`) generaliza desde dos casos sin la razón, que es estructural:
     abajo da cero sólo con el 2.
  3. En la ruta del bot, ninguna entrada del reparto (3, 4, 5) pasa por la máquina, y el dominio «3, 4,
     5…» se afirma sin un solo ejemplo visto.
  4. No se repite por qué es x − 2 («menos los dos que ya cobraron», `ch7/scenes-b.js:570`). La razón de la
     opción correcta («y más de dos») depende de eso.
- **Por qué importa:** criterio 5 (toda cantidad tiene origen) y criterio 11; es la misma falla que
  rev-mat-7 señaló en 8.8 (M8).
- **Cómo comprobar:** citar sólo lo que está en la pizarra (`tried`); decir «abajo sólo da cero con el 2»;
  ofrecer o exigir una entrada del reparto; repetir «menos los dos que ya cobraron».

### M9. 9.7: «Tres maneras» muestra dos, y el gráfico no tiene escala de salida

- **Dónde:** `scenes-b.js:192-197` (sólo rótulos de días), `:212` (sólo expresiones), `:226` (la nota cita
  valores que el gráfico no deja leer), `:238` («con la tabla se leen algunos»). Diseño, 9.7: «Emparejar …
  con sus tablas y gráficos».
- **Qué:** no hay tabla en la pizarra, y el eje vertical no tiene números. «En B, el día 0 hay 10» no se
  puede leer del dibujo, y el emparejamiento se resuelve por la forma (recta empinada, recta chata, curva).
- **Por qué importa:** §7G (tablas, gráficos y expresiones). Un gráfico sin escala en la salida es, en los
  términos del capítulo, más un dibujo que un gráfico.
- **Cómo comprobar:** agregar la tabla (días 0 a 6, una columna por escalera, o carteles con tablas para
  emparejar) y marcas 0, 20, 40, 60 en el eje vertical.

### M10. 9.8: la periodicidad es aproximada, y el aviso la subestima

- **Dónde:** `scenes-b.js:300-301` («en invierno, la ve cambia un poco»); Bitácora `:329` y `:338` («lo
  que se repite se puede anticipar»).
- **Qué:**
  - De un día al siguiente la tabla casi no cambia: «pasado mañana a las 10, 2» es una buena predicción.
  - A lo largo del año cambia mucho. En el mismo lugar, la sombra de las 10 en junio es ≈ 4,7 veces la de
    diciembre (41° S: 8,8 contra 1,9 en unidades de la tabla; Buenos Aires: 10,7 contra 2,7). La del
    mediodía, ≈ 6,6 veces. «Un poco» es falso.
  - La rama `unknown` («No se puede saber») se trata como error. Es una respuesta prudente: medido no está
    y depende de que haya sol.
- **Por qué importa:** §7I (regularidad observada no es garantía), y es la entrada a la periodicidad del
  cap. 10.
- **Cómo comprobar:** «De un día al siguiente casi no cambia; de verano a invierno cambia mucho: es casi
  periódica.» Bitácora: «lo que se repite se puede anticipar, mientras se repita».

---

## BAJA

- **B1.** 9.4, `scenes-a.js:379`: a quien dice que la U no es función se le contesta «Una sola altura para
  cada entrada: sí es función». No se nombra la confusión típica (dos entradas con la misma salida, que
  está permitido). El capítulo tiene el ejemplo justo: a las 8 y a las 16 la sombra mide 4.
- **B2.** 9.4, `:378`: los rótulos «función» / «no es función» van debajo de los dibujos. Lo correcto es
  «gráfico de una función». §13: confusión entre el objeto y su representación.
- **B3.** Bitácora `scenes-b.js:337`: pierde el alcance de la recta parada (entrada acostada; dice si puede
  ser, no cuál), que la escena sí declara (`scenes-a.js:390`). «Corta … dos veces» se entiende, pero
  «más de una vez» es exacto.
- **B4.** Bitácora `:322-323`: si se reinicia 9.4 a mitad de escena (pausa → reiniciar escena,
  `engine/ui.js:91` → `main.js:255-265`, que no borra evidencia), el conteo suma los dos intentos. Mi
  ejecución de la `writeJournal9` del commit, con un reinicio después de dos dibujos, da «acertaste 5 de 6
  dibujos»: hay 4. Los capítulos 3 a 6 tienen el mismo patrón (`all()`). Se corrige contando el último
  `vertical-predict` de cada forma.
- **B5.** `logic/functions.js:29-40`: `verticalHits` está ajustada a estos cuatro dibujos (tolerancia 0,26,
  agrupa alturas a menos de 0,6). Con otras formas falla: una elipse achatada (semiejes 2 y 0,25), que no
  es función, pasa la prueba; y = 8x o y = 0,8 · x³/3 muestreadas cada 0,1, que sí son funciones, no la
  pasan. Las pruebas sólo cubren las cuatro formas. El juego no lo sufre; conviene un comentario o cortar
  por segmentos.
- **B6.** 9.6, `:164`: «No hay número que falte probar» sugiere que se probaron todos. El argumento es por
  casos (positivo, negativo, cero): «No hace falta probar más». `:163`: «menos por menos es más» es un
  eslogan. El cap. 4 lo justificó con dos medias vueltas (`ch4/scenes-a.js:544`, «(−1) × (−1) = 1»): citar
  las medias vueltas.
- **B7.** 9.2, `:192`: «no puedo anticipar nada» exagera. Lo que pasa es que la salida no depende sólo de
  la entrada: hay una entrada escondida (la ruedita). Decirlo conecta con «esa ya es otra entrada» de 9.1.
- **B8.** 9.5: «Depende de qué cuenta la máquina» (`:103`) juega con «cuenta» (cálculo / contar); «lo que
  le toca a cada uno» (`:58`) es a cada uno de los que no cobraron.
- **B9.** 9.1, `:76-79`: dar vuelta las flechas es automático. El diseño pide que el jugador una cada
  sombra con su hora. La consecuencia (dos flechas desde el 2) se ve, pero no la produce él.
- **B10.** 9.7: el cartel ya emparejado «C: 2ᵈ» (`:230`) queda junto al rótulo y al final de la recta B
  (captura `c9b-directa/008`: «C: 2ᵈ» en (985, 393), «B» en (925, 425)). El describe de `:210` resuelve el
  emparejamiento para lector de pantalla («A, una recta que sube de a diez»).
- **B11.** 9.8, `:300` y `:303`: «el sol da la misma vuelta» y «el sol da vueltas» describen el movimiento
  aparente. Es habla común, pero en una escuela técnica, y antes de un capítulo de vueltas, un «como lo
  vemos desde acá» evita una idea falsa.
- **B12.** Bitácora `:315`, rama `12`: «elegiste una sola hora» es cierto, pero a las 12 la sombra mide 1,
  no 2. Ese error es de lectura de la tabla, no de función.

---

## Lo que está bien (para no perderlo al corregir)

- **Costura con el cap. 8.** La tabla es la misma (`ch8/scenes-b.js:322`); la pregunta de Mara («sólo el
  largo… sin decir para qué lado apunta», `:379`) entra directo en 9.1.
- **9.1.**
  - «A cada hora le toca un solo largo; al largo 2 le tocan dos horas» es exactamente la diferencia.
  - «Si además decís para qué lado apunta… esa ya es otra entrada» es una idea precisa y poco común: la
    misma correspondencia puede volverse función agregando información a la entrada.
  - La definición escrita, «función: a cada entrada, una sola salida», es correcta. `isFunction` e
    `inverse` son correctas; la vuelta falla en 2 y en 4.
- **9.2.**
  - Las salidas son exactas, y cualquier terna de entradas deja una sola regla candidata.
  - «El mismo 3 dio 7 y después 9: no es una función» es correcto.
  - «La ruedita que giraba sola» es una buena imagen de una entrada oculta.
- **9.3.**
  - Los cinco puntos piden la sombra correcta y rechazan la equivocada con el valor de la tabla.
  - Las tres ramas dicen que la línea es una suposición, y la lectura a las 9 está matizada («más o menos
    3. Casi, porque no lo medí»); el valor real con condiciones compatibles es ≈ 2,8.
  - Los valores 4 : 2 : 1 son verosímiles (41° S en diciembre da 4,1 : 1,9 : 1).
- **9.4.**
  - Clasificación correcta. La recta parada recorre todo el dibujo y se detiene donde más corta; las marcas
    caen a menos de 0,2 unidades de los cortes verdaderos.
  - La tangente del círculo en x = ±2 cuenta un solo corte, como debe.
  - «Sirve con la entrada sobre la recta acostada» y «dice si puede ser una función, no cuál» declaran el
    alcance que pedía el diseño.
- **9.5.**
  - Las salidas son exactas (−1/3, −1/2, 1, 1/3) y el 2 traba.
  - La distinción «el dominio de la cuenta es todo menos el 2; el de tu reparto, 3, 4, 5…; depende de qué
    cuenta la máquina» es la idea correcta: la misma fórmula con dos dominios son dos funciones.
  - Es coherente con `ch7/scenes-b.js:570` y con la Bitácora del cap. 7 («1 ÷ (x − 2) pide x ≠ 2»).
- **9.6.**
  - «El −4 no está, con los números que conocemos» es la salvedad justa.
  - La respuesta a «con −2» es correcta.
  - La definición «lo que puede salir se llama la imagen» es correcta.
- **9.7.**
  - Las tres funciones están bien dibujadas y bien puestas en el mismo mapa.
  - Las notas de error comparan día 0 y día 1 con valores correctos.
  - En el modelo continuo, el cruce A–C (t ≈ 5,909) está, en efecto, un poco antes del día 6.
- **9.8.**
  - La predicción de pasado mañana se presenta condicionada («mientras el sol dé la misma vuelta»).
  - «De noche no está definida» es mejor modelo que «vale 0».
- **Bitácora.**
  - Las 20 ramas de `seen` producen texto sin huecos.
  - El cuerpo tiene 4 párrafos, y el primero ya dice «el largo».
  - No se escribe en una repetición del momento.
- **Pruebas.** 4/4 en `functions.test.mjs`; 77/77 con los archivos de prueba del commit.

## Qué no pude verificar

- **El juego en un navegador.** No lo abrí, por la restricción del entorno. Todo lo de pantalla sale del
  código, los logs y las capturas del bot.
- **Las partidas son anteriores al commit** (el commit es de las 16:35):
  - `c9a-directa2` (15:09) y `c9-errores` (15:51): tres líneas de 9.1 son de la versión vieja («sé qué
    sombra hay a cada hora», «Cornisa dice «mi sombra mide 2»», «la sombra es función de la hora»). El
    resto coincide.
  - `c9b-directa` (15:49) y `c9-telefono2` (16:25): todas las líneas `lee:` y `elige` coinciden con el
    commit (script propio).
  - La Bitácora de `c9b-directa` y `c9-errores` es anterior («la sombra depende de la hora»); la de
    `c9-telefono2` coincide. Para la Bitácora del commit ejecuté su `writeJournal9` en todas las ramas.
- **Ramas sin partida.** El bot no recorrió estas ramas; las revisé sólo en el código:
  - 9.1: `12`. 9.2: `13`, y la entrada 5.
  - 9.3: `loose` en la primera pregunta.
  - 9.4: respuestas equivocadas salvo el círculo.
  - 9.5: `all`, las entradas 3 y 5, y el camino «¿Y con 2?».
  - 9.6: `other` y el corte temprano «ya probé».
  - 9.7: emparejamientos equivocados salvo A → B.
  - 9.8: `unknown`.
  - El reinicio de escena y la repetición del momento 9.3.
- **9.4 en teléfono** tardó 104 s (contra ≈ 11 s en las otras partidas). No lo investigué: es funcional.
- **Sombras reales.** Las calculé con un modelo simple (hora solar, sin refracción ni ecuación del
  tiempo). Los órdenes de magnitud son firmes; las décimas, no.
- **Audio, teclado, táctil y legibilidad**: no los evalué.
- **La referencia curricular de G**: no la contrasté.
- **El cap. 10** está en curso (commits posteriores y archivos sin commitear). No lo revisé; sólo lo cito
  para la continuidad de «con los números que conocemos».
- **Comprensión humana.** No hay playtests. Nada de esto certifica que alguien entienda.
