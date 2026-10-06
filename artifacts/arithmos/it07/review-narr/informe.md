# Arithmos — revisión narrativa, de puesta en escena y accesibilidad (cap. 7 «Crecer»)

Revisor independiente (rev-narr-5), 2026-10-06. No abrí navegador ni corrí el juego ni scripts de partida. Trabajé con el
código del commit, los logs de partidas automáticas y las capturas PNG que ya existían.

## Alcance, evidencia y advertencias

- **Código revisado: commit `b5ed429`.** Los números de línea de este informe son los del commit
  (`git show b5ed429:experiments/arithmos/src/ch7/…`).
  - `ch7/chapter.js`, `common.js`, `scenes-a.js` y `scenes-b.js`.
  - Costura de entrada: final de `ch6/scenes-b.js` (líneas 322–334).
  - Contexto: `ch4/common.js` (familias, pizarra, elenco), `ch4/*` y `ch5/*` (voces de Peldaño, Rampa, Cornisa y
    Balcón), `ch5/scenes-b.js` 410–503 (la diagonal), `ch6/scenes-a.js` 290–297 (la Marea del cap. 6),
    `engine/camera.js`, `engine/ui.js`, `engine/director.js` y `main.js` (encuadre, zona segura, `describe`).
- **Mientras revisaba, el árbol de trabajo cambió** (10:43–10:47, sin commit). Esos cambios agregan el plano `tiles` en
  7.1, 7.2, 7.3 y 7.8, separan botones en 7.2, 7.8 y 7.9, y sacan el cambio de plano en la pasada de la Marea. No los
  reviso como código, pero los menciono donde atenúan un hallazgo.
- **Contrato y diseño:** `docs/arithmos/ARITHMOS_MASTER.md`; `ARITHMOS_DESIGN.md` (premisa, tabla de Punto, cap. 7,
  cap. 8 y los 12 «Criterios de escena»). Formato y recurrencias: `it06/review-narr/informe.md`.
- **Partidas** (bot, no personas):
  - `it07/c6c7-directa` (1600×900): de 6.1 a 7.9, capturas 029–072. Corresponde al código del commit (capturas de
    10:33–10:35; el commit es de 10:36).
  - `it07/c7-errores` (1600×900): ruta con errores, capturas 001–049.
  - `it07/c7-telefono` (844×390, táctil): código del commit. **Quedó atascada en 7.8.**
  - `it07/c7-telefono2`: escenas del commit con el nuevo detector de botones superpuestos (`ui.js`, 10:41).
  - `it07/c7-telefono3`: ya incluye los planos `tiles` sin commit de 7.1 y 7.2.
  - Leí `log.txt`, `summary.json` y la evidencia de `state.json`. `c7b-directa` y `c7b-directa2` son anteriores a las
    últimas ediciones y sólo las usé como apoyo.
- **Ninguna partida empezó antes del cap. 6**, así que no hay `puntoArrow` y Punto aparece sin flecha.
- Los logs muestran **qué se dice y en qué orden**, no el ritmo.

## Lo que funciona (para calibrar)

- **Continuidad conceptual con los capítulos anteriores.** El capítulo ata cada idea a algo ya vivido:
  - la diagonal del cap. 5 («Es la diagonal que medimos: más o menos 1,414», `scenes-a.js:157`);
  - el reparto de las Terrazas del cap. 4 («como cuando repartimos en las Terrazas», `scenes-b.js:312`);
  - las bolsas vacías del cap. 4 (`:582`, que remite a `ch4/scenes-b.js:355`);
  - el −3 de Oval del cap. 6 (`scenes-a.js:84`);
  - el «lo que se agrega de un lado del igual, se agrega del otro» del cap. 6, aplicado a completar el cuadrado
    (`scenes-b.js:441`). Es la mejor costura conceptual hasta ahora.
- **El error de Punto de 7.4 es suyo.** Escribe 3 · 10⁷ porque «contó siete cifras» (`scenes-b.js:174-177`). Es el rasgo
  del diseño: «cuenta los signos de un numeral como si fueran cosas». Además lo borra y lo reescribe él mismo
  (`:213-219`).
- **Punto tiene iniciativa** por primera vez en varios capítulos:
  - en 7.2 propone su plan («× 2 cada día», `scenes-a.js:190-193`);
  - se pone triste cuando queda atrás y contento cuando pasa adelante (`:245-250`);
  - Mara lo trata como alguien con una manera propia («con tu manera de duplicar», `scenes-b.js:474`).
- **El lugar está establecido y los hablantes están en cuadro.** En las nueve aperturas se ven la pizarra de Mara, las
  Terrazas con los nombres de Peldaño y Rampa en sus escalones, y la familia que habla parada junto a la pizarra
  (`c6c7-directa/030`, `047`, `054`, `066`). Ya no se habla fuera de cuadro en los planos generales (A6 de rev-narr-4).
- **Una consecuencia bien actuada: 7.6 con lados equivocados.** Las fichas van a su lugar, queda el hueco punteado de la
  tira que falta y un cuadradito suelto, y el pensamiento dice exactamente lo que se ve (`c7-errores/029`: «faltan una
  tira y sobra un cuadradito»).
- **Rampa cierra 7.9 con sus palabras:** «Entonces escribo arriba: "si vienen más de dos". Con 3, un atado entero cada
  uno; con 5, un tercio.» (`scenes-b.js:607`). Es el modelo de cómo una familia puede concluir aplicando la idea a su
  mundo.
- **Mara pregunta y reacciona** en vez de definir: «¿No hay una forma corta?» (`:87`), «¿Y un renglón más abajo?»
  (`:135`) y una línea con humor que apunta a un límite real del crecimiento: «¿Y de dónde sacás tanta tiza el día
  siete?» (`scenes-a.js:262`).
- **Legible a 1600×900:** fichas, cifras y exponentes se leen bien en el plano `tiles` (`c6c7-directa/048`, `049`, `061`;
  `c7-errores/024`).

## ¿Repite el cap. 7 los problemas señalados antes?

| Problema (rev-narr-2/3/4) | En el cap. 7 | Dónde |
|---|---|---|
| Escenas en plantilla, desfile de vecinos con un problema cada uno | **Sí, agravado.** Nueve escenas con la misma forma y la misma apertura | A1 |
| Cuestionario encadenado | **Sí, agravado.** 9 elecciones evaluadas (el cap. 6 tenía 5) | A1, M4 |
| El estudiante como profesor | **Sí.** Concluye en las nueve escenas; 9 líneas empiezan con «Punto:» o el nombre de una familia | A1, M2 |
| Acciones de un solo botón / el juego hace el paso decisivo | **Sí** | A2 |
| Cuentas y texto que contradicen la imagen | **Sí** | A3, A4 |
| Marea sin apuesta | **En parte.** Aparece una vez, como efecto de cierre calcado del cap. 6 | M3 |
| Punto cursor / sin evolución | **Mejoró** (iniciativa, dos errores), pero sigue como oyente y no evoluciona | M1 |
| Hablantes fuera de cuadro | **Mejoró** en planos generales; en el plano `tiles` el estudiante queda cortado | M7 |
| Ningún primer plano | **En parte.** Hay planos cercanos para manipular, no para los momentos | M7 |
| Familias sin nombre visible | **En parte.** Hay rótulos en los escalones, pero no los ve quien habla en la pizarra | M2 |
| Bitácora como boletín | **En parte.** Cuerpo de 4 párrafos; «Lo que pasó» sigue siendo evaluativo | M9 |
| `describe` faltantes, botones sin verbo | **En parte** | M6 |
| Tamaños en teléfono | **Sí, y ahora verificado:** ilegible y una partida atascada | A5 |
| Gancho de segunda mano | **Sí** en 6→7; en 7→8 no hay imagen y se repite el cap. 5 | M5 |
| Amarillo sólo de Punto (B2), aviso en el título (B6), subtítulo viejo (B7), Punto sin flecha (B3), «Ø» (B4) | **Sí, regresan** | M6, B1–B4 |
| «Como dije» | No | — |

---

## Hallazgos ALTOS

### A1. Nueve escenas con la misma plantilla y el mismo plano: un desfile de problemas sin hilo ni clímax

- **Dónde:**
  - **La misma apertura nueve veces.** Cada `setup` pone `boardCast` y `SHOTS.board`, y cada `play` empieza con
    `d.shot(SHOTS.board, 1)`. Ver `scenes-a.js:44-52`, `177-185`, y `scenes-b.js:80-86`, `154-162`, `254-260`,
    `327-333`, `397-403`, `466-473`, `535-543`. Las capturas `c6c7-directa/030`, `035`, `039`, `047`, `051`, `054`,
    `057`, `062` y `066` son casi idénticas:
    - el estudiante, Punto y Mara a la izquierda;
    - una familia a la derecha de la pizarra vacía;
    - Peldaño y Rampa en los escalones.
  - **La misma secuencia en cada escena:**
    1. Alguien trae un problema: Peldaño, Mara, Mara, Cornisa, Peldaño, Balcón, Rampa, Mara y Rampa.
    2. Una predicción de menú de tres opciones (9 `d.choose` con `evaluate: true`).
    3. Un gesto.
    4. El estudiante concluye con la regla, dirigida a alguien. Nueve de esas líneas empiezan con un nombre y dos puntos:
       «Punto: …» (`scenes-a.js:157`, `261`; `scenes-b.js:139`, `210`, `515`), «Peldaño: …» (`:312`), «Balcón: …»
       (`:378`), «Rampa: …» (`:447`, `606`).
    5. Una coda.
- **Qué:**
  - **No hay hilo.** Las escenas no se necesitan entre sí. El diseño proponía uno, «redibujar la escalera antes que la
    Marea» (7.2 en `ARITHMOS_DESIGN.md`), pero la implementación lo redujo a una predicción («¿quién llega antes a
    cien?»). La escalera no se dibuja nunca y la Marea no vuelve por ella.
  - **Nada se acumula.** Cada `setup` borra lo anterior con `clean(g, /^(…)/)` (`scenes-b.js:22-25`) y
    `removeWhere(/^(c7-|dp-)/)` (`scenes-a.js:176`). Nadie borra eso en el mundo. Desaparecen sin que nadie los toque:
    - el √2 de Peldaño, que «lo pinta en la puerta»;
    - la escalera de Punto;
    - la tabla de potencias.
  - **No hay clímax.** El capítulo termina en 7.9, en el mismo plano y con el mismo tono que 7.1.
  - **Los contextos se repiten.** Cuatro de nueve escenas son huertas (7.1, 7.5, 7.6, 7.7). El contrato §5 pide variar
    «las relaciones y contextos».
- **Por qué importa:**
  - Contrato §4: cada escena necesita «un propósito dramático» y hay que alternar «descubrimiento, descanso, humor y
    emoción».
  - Contrato §13: hay que buscar «momentos que parezcan una plantilla educativa».
  - Es la tercera revisión seguida que lo marca (A2 y A6 de rev-narr-4). En este capítulo el patrón se volvió más
    regular: más elecciones evaluadas y una sola apertura.
- **Propuesta:**
  - **Usar el hilo que ya está en el diseño: la escalera de cien escalones antes de que vuelva la Marea.**
    - 7.2 pasa a ser una decisión con consecuencia. El jugador elige el plan (sumar diez o duplicar) y lo vive: con +10,
      la Marea llega con la escalera a medias y se lleva lo que no estaba terminado.
    - El polvo de Cornisa (7.4) mide cuánto se lleva la Marea cada noche: es el reloj.
    - Las huertas de 7.5–7.7 son las terrazas nuevas al pie de esa escalera.
    - El cierre es la pasada de la Marea sobre todo lo escrito en el capítulo (ver M3).
  - **Romper la plantilla en al menos tres escenas:**
    - **7.3 sin menú.** El jugador baja la tabla y él mismo escribe el renglón de 2⁰ eligiendo la cifra. La tabla «se
      corta» o «sigue» a la vista, y nadie enuncia la regla.
    - **7.4 discutida entre dos familias.** Cornisa dice «anoche fue más: 4 es más que 3». Es su rasgo del cap. 5
      («Yo tengo dos pedazos y Peldaño uno solo. ¡Tengo más!»). Peldaño le contesta con los ceros.
    - **7.6 que concluya Balcón.** Que lo diga ella, no el estudiante.
  - **Variar las aperturas:**
    - un plano de dos (familia y estudiante frente a frente, ≤ 600 u) para plantear;
    - `tiles` para manipular;
    - `SHOTS.wide`, que existe y nunca se usa, para la escalera y la Marea.
- **Cómo comprobarlo:**
  - en `c6c7-directa`, al menos tres encuadres distintos de apertura;
  - en el log, ≤ 5 elecciones evaluadas y ≤ 4 líneas del estudiante que empiecen con «Nombre:» (hoy 9);
  - al final del capítulo, una captura con algo escrito en escenas anteriores todavía visible.

### A2. El juego hace el paso decisivo en casi todas las escenas; el jugador toca, elige de un menú o repite un botón

- **Dónde y qué, escena por escena** (contrato §8: «no conviertas todo en arrastrar piezas al único hueco compatible»;
  criterio 2):
  - **7.1:**
    - **Filas.** Las opciones son 1, 3 o 9 filas, con la pista «Peldaño la quiere cuadrada» (`scenes-a.js:63-65`). Si el
      jugador se equivoca, el juego acomoda en 3 solo (`:81`) y el jugador nunca elige el 3. Los dos bots eligieron
      «1 fila» (`state.json`, `square-rows`).
    - **Triángulos.** «Tocá cada triángulo: se acomoda alrededor del centro» (`:104`): cada toque lleva el triángulo al
      cuadrante siguiente (`:132-137`). Descubrir que cuatro mitades arman un cuadrado inclinado cuyo lado es la diagonal
      es el centro de la escena, y lo hace el juego.
  - **7.2:** «otro día» hasta diez veces (`:233`), un solo botón.
  - **7.3:**
    - «un renglón abajo» tres veces (`scenes-b.js:99`), otro botón único.
    - Los renglones aparecen escritos solos, sin el estudiante ni Punto (`:107-111`).
    - El 2⁻¹ lo escribe el estudiante sin que el jugador haga nada (`:136-138`).
  - **7.4:**
    - **El 3 no se puede tocar** (`i === 0 ? null`, `:186`) y la pista dice «Tocá cada cero que hay detrás del 3»
      (`:184`). El error que la escena quiere distinguir, contar el 3 como Punto, queda fuera del alcance del jugador.
    - La parte de los números chicos (10⁻³) es dicha y escrita (`:236-238`).
  - **7.5:** «Tocá una ficha de la bandeja: va al lugar libre que le corresponde» (`:280-298`). Cada ficha cae en su
    único hueco y las que sobran se rechazan con una nota. No se puede armar mal, así que no hay hipótesis que comprobar
    armando.
  - **7.6:**
    - Es un menú de pares de lados (`:339-345`) y el juego acomoda todas las fichas.
    - Si falla dos veces, queda una sola opción (`opts.splice`, `:374`; `c7-errores/028` muestra dos).
    - El caso que no cierra (x² + 5x + 5) es un pensamiento enumerado (`:382`), no algo que el jugador intente.
  - **7.7:**
    - Un único blanco: «Tocá la esquina vacía» (`:421-432`).
    - Las dos raíces, la idea que el diseño destaca («"deshacer" un cuadrado tiene dos caminos»), las traen Mara y un
      pensamiento (`:448-449`).
  - **7.8:** «duplicar» N veces (`:488`); ver A4.
  - **7.9:** **no se puede probar x = 0** (`VALS = [5, 4, 3, 2]`, `:557`). Es justo la hipótesis que plantea la
    predicción («Con x = 0: dividir por cero», `:547`). El pensamiento la refuta de palabra: «Con x = 0 sí se puede:
    abajo queda −2» (`:604`).
- **Por qué importa:**
  - El verbo central es COMPRENDER y el contrato §5 pide que el jugador pueda «observar, predecir y modificar».
  - En este capítulo predice, y lo que modifica lo modifica el juego.
  - Las respuestas equivocadas, salvo en 7.5 y 7.6, producen sólo una línea de corrección (N3 de rev-narr-2, otra vez).
- **Propuesta (una por escena, sin agregar sistemas):**
  - **7.1:**
    - El jugador arrastra o gira cada triángulo. El juego acepta cualquier armado que cierre, y uno que no cierre deja un
      hueco visible.
    - Las filas que no son 3 no se corrigen solas: Peldaño protesta y el jugador vuelve a elegir.
  - **7.4:**
    - Todas las cifras se pueden tocar, también el 3.
    - Si el jugador cuenta siete, 3 · 10⁷ se despliega como «30 000 000» debajo de «3 000 000» y no coinciden. Es la
      consecuencia del error de Punto, vista.
  - **7.5:** que el jugador elija **dónde** va cada tira (borde de abajo o de la derecha). Que una tira de más se pueda
    poner y deje la huerta despareja.
  - **7.6:**
    - Empezar con el juego de Balcón de **cinco** cuadraditos (no cierra con ningún par), y después con seis.
    - O dejar que el jugador acomode las fichas libremente y que el juego reconozca cualquier rectángulo que cierre.
  - **7.7:** después de (x + 1)² = 9, que el jugador marque en una recta (la del cap. 6) los dos lugares donde x + 1
    mide 3 de largo. Así aparecen el 3 y el −3, y la huerta descarta uno.
  - **7.9:** agregar x = 0 y x = 1 a los valores. El renglón aparece («0 | −2 | −1/2»), y que Rampa diga lo que eso
    significa en su historia (ver A3).
- **Cómo comprobarlo:**
  - en `c7-errores`, 7.4 con el 3 contado y su consecuencia en captura;
  - 7.6 con un intento que no cierra hecho por el jugador;
  - 7.9 con x = 0 probado.

### A3. El texto y las cuentas contradicen la imagen o a otras escenas

- **7.2, las barras mienten** (`scenes-a.js:216`, `Math.min(130, …)`):
  - El día 10, Punto (1024) y Mara (101) se dibujan como 130 contra 101 (`c6c7-directa/037`, `038`).
  - La barra de Punto se monta sobre el rótulo «× 2 cada día» (recorte de `038`).
  - La imagen dice «duplicar gana por poco» en la escena cuya idea es que crece distinto. Pasa también en teléfono
    (`c7-telefono3/008`).
- **7.5 contra 7.1:** Peldaño dice «Agrando la huerta cuadrada… El lado de antes no lo sé: le digo x.»
  (`scenes-b.js:261`). Dos escenas antes:
  - supo que su huerta de nueve tiene lado 3 y la de dos, lado √2;
  - dijo «Lo pinto así en la puerta» (`scenes-a.js:161`);
  - y en el cap. 5 su huerta cuadrada medía «una barra justa».
- **7.7, la escala contradice la solución:**
  - La ficha x mide 92 u y la unidad 30 u (`common.js:22`), así que el x dibujado vale ≈ 3,07 unidades.
  - La escena concluye x = 2 y «un cuadrado de nueve tiene lado 3» (`scenes-b.js:447`). El cuadrado de lado x + 1
    dibujado (`c6c7-directa/061`) mide ≈ 4,07 unidades: unos 16,5 cuadraditos, no 9.
  - Criterio 8: «si dos cosas valen lo mismo, miden lo mismo».
- **7.8, el pizarrón contradice la conclusión:**
  - Si el jugador se pasa, queda escrito «2048 / 11 duplicaciones» (`c7-errores/040`, `041`) mientras el estudiante
    escribe y dice «10 veces».
  - El pensamiento dice «Las otras 1 sobraban» (`:514`).
- **7.9, dos dominios sin nombrar:**
  - La historia es «si vienen x, a cada uno le toca 1 ÷ (x − 2)». Con x = 0 o x = 1 serían −2 o −1 personas.
  - El pensamiento afirma «Con x = 0 sí se puede» (`:604`) y el estudiante «sirve para cualquier x menos 2» (`:606`).
  - Rampa concluye «si vienen más de dos» (`:607`), que es otra restricción.
  - Nadie marca la diferencia entre dónde está definida la cuenta y dónde tiene sentido la historia. Que la revisión
    matemática decida el alcance; acá lo marco porque el texto dice dos cosas.
- **7.4, Cornisa se contradice:** «No me entra en la libreta» (`:163`) y, poco después, «La de anoche la anoté así:
  4 · 10⁵» (`:225`). Si ya conoce la forma corta, la escena no tiene motivo.
- **7.2 contra 7.8:** «cien escalones» de «la escalera del fondo» (`scenes-a.js:186`) y «los mil de la escalera grande»
  (`scenes-b.js:474`). La segunda escalera no tiene origen.
- **El «cuadro» de huerta mide tres cosas distintas:**
  - 40 u en los nueve de 7.1 (`scenes-a.js:55`, amarillos sin rayado);
  - 104 u en los dos de 7.1 (`:35`, blancos rayados);
  - 30 u como «cuadradito» en 7.5–7.7.
  - Además se llama «cuadro», «cuadradito» y «cuadro de tierra».
- **Por qué importa:**
  - Criterios 5 y 8; contrato §2: «una metáfora visual debe aclarar una propiedad sin inventar otras».
  - Es la misma clase de falla que A4 de rev-narr-4 y A5 de rev-narr-2. Un jugador que mira y cuenta, que es lo que el
    juego le pide, encuentra que la imagen dice otra cosa.
- **Propuesta:**
  - **7.2:** escala que muestre el salto. Dos opciones:
    - la columna de Punto sigue más allá de la pizarra y la cámara sube con ella (`SHOTS.wide`);
    - o parar la carrera cuando alguno llega a cien (día 7) y no dibujar más (ver A4).
  - **7.5:** dar al x un motivo:
    - «Todavía no decidí de qué tamaño la hago. Quiero saber qué fichas pido para cualquier lado.»
    - Es además la primera vez que x es **variable** (cualquier valor) y no incógnita (un valor oculto, cap. 6). Vale
      decirlo.
  - **7.7:** al resolver, que la ficha x se encoja a 2 unidades y la L se vuelva la cuadrícula de 3 × 3 de 7.1. Es un
    callback visual: el mismo nueve.
  - **7.8:** si el jugador se pasa, el estudiante borra hasta 1024 («la undécima sobraba»). Corregir la concordancia
    («la otra sobraba»).
  - **7.9:** que Rampa haga explícita la diferencia. Por ejemplo, el estudiante: «La cuenta se puede con 0 o con 1, pero
    no hay −2 personas»; Rampa: «Entonces escribo "si vienen más de dos"».
  - **7.4:** que Cornisa no sepa la forma corta (anotó «400 000» en cifras, o «cuatrocientos mil» en palabras).
  - **7.8:** que «los mil» salgan de algo dicho antes. Por ejemplo, los granos de polvo de Cornisa, o la escalera de 7.2
    si se la usa como hilo (A1).
  - Una sola medida de unidad para todo el capítulo (30 u o 40 u) y un solo nombre («cuadro»).
- **Cómo comprobarlo:**
  - captura del día 10 de 7.2 donde la proporción 1024 : 101 se vea;
  - captura del final de 7.7 con 9 cuadros contables;
  - captura de 7.8 pasándose, con el pizarrón corregido;
  - `grep` de «no lo sé: le digo x» sin resultados.

### A4. El «momento» 7.8 ya está resuelto en 7.2: la pregunta inversa llega con la respuesta en la memoria y el mismo gesto

- **Dónde:** la tabla de 7.2 sigue hasta el día 10 (`race(1, 10, 2, 10)`, `scenes-a.js:203`). En las dos partidas
  llegó a «10 · 101 · 1024» (`state.json`: `race-day` hasta 10; `c6c7-directa/037`).
- **El teléfono lo empeora:** en 844×390, «otro día» tapa a «parar» (`c7-telefono2/summary.json`), así que quien juega
  con el dedo difícilmente pueda parar antes.
- **Qué:**
  - Tres escenas después, 7.8 pregunta «empezando con uno y duplicando cada día, ¿cuántos días para pasar mil?»
    (`scenes-b.js:474-479`). Es la misma sucesión, con el mismo comienzo, y el jugador ya vio 512 y 1024 escritos en la
    pizarra.
  - El gesto es el mismo: tocar un botón hasta pasar.
  - Las opciones «Unos cien días» y «Quinientos días: la mitad de mil» son de paja después de esa tabla.
  - El sentido del 9,97 («nueve no alcanzan y diez se pasan un poco») lo da Mara (`:520`), no el jugador.
  - Además, el momento del capítulo ocurre en el plano más abierto (`c6c7-directa/064`).
- **Por qué importa:**
  - El contrato (E) pide «logaritmos como respuesta a una pregunta inversa».
  - Si la respuesta ya estuvo a la vista, la pregunta no se siente inversa: se siente repetida.
  - Es la escena marcada como «momento» rejugable.
- **Propuesta:**
  - **Cortar la carrera de 7.2 cuando alguno llega a cien** (día 7, 128). La tabla no muestra más.
  - **Hacer 7.8 desde el otro lado: un número grande dado, sin tabla.** Por ejemplo, los tres millones de granos de
    Cornisa: «¿cuántas duplicaciones desde un grano?». El jugador apuesta (20, 22, 3 000 000 / 2…). Después duplica
    rápido con un gesto que acelera, y la respuesta es 2²¹ < 3 · 10⁶ < 2²². El número de 7.4 vuelve y la pregunta
    inversa es necesaria.
  - **Que el sentido de «9,97 veces» lo diga el jugador o Punto:** «menos de diez y más de nueve», marcado entre dos
    renglones de la tabla. No Mara.
  - **Un plano cercano** (`tiles` o más cerrado) en la escritura del logaritmo.
- **Cómo comprobarlo:**
  - en `state.json`, `race-day` termina en 7;
  - en el log de 7.8, el número objetivo no aparece en ninguna escena anterior;
  - la última línea de 7.8 no es de Mara.

### A5. En teléfono (844×390), con el código del commit, tres escenas no se leen, dos predicciones se hacen sobre figuras ilegibles y 7.8 queda bloqueada

- **Dónde** (evidencia de teléfono; el cálculo de la zona segura sale de `main.js:72-76`: 56 px arriba y 78 abajo, con
  `SHOTS.board` a ≈ 0,4 px por unidad):
  - **7.2:** la tabla y las barras sólo se ven en el plano general. Las filas miden ≈ 6 px y los rótulos de las barras,
    ≈ 6 px (`c7-telefono/008`).
  - **7.3:** la tabla de potencias mide ≈ 9 px y sus exponentes, ≈ 5 px. «2⁰» con cero barrado no se distingue
    (`c7-telefono/015`).
  - **7.5 y 7.7, predicciones sobre figuras ilegibles.** El jugador predice mirando la figura en el plano general. Con el
    panel de opciones abierto, la pizarra mide ≈ 130 px:
    - en 7.5 no se leen «x + 3» ni «x + 2» (`c7-telefono/023`);
    - en 7.7 el hueco de la esquina mide ≈ 10 px (`c7-telefono/029`);
    - el plano cercano llega **después** de elegir (`scenes-b.js:275`, `419`).
  - **7.8:** la partida `c7-telefono` **quedó atascada**. Después de una duplicación, cada toque en «duplicar» cayó en
    «ya pasó»: la evidencia registra `log-early` (k = 1, v = 2) cientos de veces, y el resumen dice «atascado en
    c7.cuantas-veces». Los dos botones están a 50 u (`:488-489`), unos 20 px en pantalla.
  - **Botones de palabra superpuestos** (`c7-telefono2/summary.json`):
    - las filas de 7.1;
    - «otro día» y «parar» en 7.2;
    - los valores de x en 7.9 (siguen en `c7-telefono3`).
  - **Árbol de trabajo (sin commit):** el plano `tiles` en 7.1, 7.2, 7.3 y 7.8 lleva la tabla de 7.2 a ≈ 9–10 px
    (`c7-telefono3/008`). Pero:
    - los exponentes de 7.8 siguen en ≈ 5 px (`c7-telefono3/035`);
    - las predicciones de 7.5 y 7.7 siguen en plano general.
- **Por qué importa:**
  - El contrato §3 pide que «exponentes, raíces… deban distinguirse sin esfuerzo».
  - El contrato §9 pide verificar la disposición táctil.
  - Un capítulo cuyo contenido son tablas y exponentes no funciona si no se pueden leer, y una escena que no se puede
    terminar con el dedo es un bloqueo.
  - Es M10 de rev-narr-4, ahora con captura.
- **Propuesta:**
  - Toda escena con tabla o exponentes, en `tiles` o más cerca durante la lectura, no sólo durante el toque.
  - Las predicciones (7.5, 7.7, 7.9) se hacen con la figura en plano cercano: `d.shot(SHOTS.tiles)` **antes** de
    `d.choose`.
  - Exponentes con un mínimo de 0,7 del cuerpo y nunca por debajo de 12 px en pantalla. En 7.8, también «2¹⁰»
    escrito en palabras en el subtítulo.
  - Botones de palabra con separación mínima de 56 px en pantalla, medida en el plano en que aparecen. La guarda nueva
    de `ui.js` ya los detecta: que la falla de la guarda haga fallar la partida de prueba.
- **Cómo comprobarlo:**
  - `c7-telefono` completa sin errores en `summary.json`;
  - capturas de 7.2, 7.3 y 7.8 con cifras ≥ 12 px;
  - capturas de las elecciones de 7.5 y 7.7 con la figura legible.

---

## Hallazgos MEDIOS

### M1. Punto tiene iniciativa, pero es el oyente de las lecciones y no evoluciona

- **Dónde:**
  - Seis líneas del estudiante se dirigen a Punto para explicarle algo (`scenes-a.js:82`, `157`, `261`;
    `scenes-b.js:139`, `210`, `515`). Cinco empiezan con «Punto:».
  - Punto no actúa ni reacciona en 7.1, 7.3 (salvo ser nombrado), 7.5, 7.6 ni 7.7.
  - Sus correcciones:
    - en 7.4 se corrige después de que el estudiante le dicta la respuesta (`:210` y luego `:213-219`);
    - en 7.9 no se corrige: lo reta el estudiante (`:582`) y lo borra la Marea (`:589`).
  - Ningún `flag` de Punto en el capítulo.
- **Qué:**
  - El diseño ubica en los caps. 7–11 su estado «Plano / curva»: percibe «dependencias, cambio», «dibuja relaciones»,
    «anticipa con el jugador». El capítulo no siembra nada de eso.
  - El criterio 4 pide que «se corrige él mismo (borra y reescribe)» y que su evolución se conserve en `flags`.
- **Por qué importa:**
  - Contrato §4: Punto «puede sorprenderse, intentar algo, equivocarse y comprender junto al jugador». No es un alumno
    al que se le explica.
  - «Crecer», el capítulo del cambio, es el lugar natural para que Punto empiece a ver el cambio.
- **Propuesta:**
  - **7.2:** Punto sube por su columna día a día y deja estela (su rasgo de «Trazo»). La estela es la curva del
    crecimiento. Si el jugador eligió +10, la estela de Mara es recta. Primer «dibuja relaciones». Fijar
    `g.flags.puntoCurve`.
  - **7.4:** Punto se corrige antes de que nadie hable. Al aparecer los seis «×10» del jugador, salta sobre su 7, lo
    borra y escribe el 6. El estudiante sólo confirma.
  - **7.9:** Punto escribe «= 0». Cuando el renglón «?» queda y la Marea viene, Punto mismo borra su «0» y deja el «?»,
    o defiende el «0» y la Marea se lo lleva. Que la decisión de defender o soltar sea suya y visible.
  - Bajar los vocativos a dos en todo el capítulo.
- **Cómo comprobarlo:**
  - en el log, ≤ 2 líneas que empiecen con «Punto:»;
  - un `describe` de Punto corrigiéndose sin una línea previa del estudiante;
  - un flag nuevo de Punto en `state.json`.

### M2. Voces: el estudiante cierra siempre, Mara aporta el contenido, las familias no se hablan

- **Dónde:**
  - **El estudiante:** 17 líneas en voz alta y 13 pensamientos. Es quien define («La raíz de un número es la positiva»,
    `scenes-a.js:85`; «Esa pregunta tiene nombre: logaritmo», `scenes-b.js:518`).
  - **Mara trae el saber en tres momentos clave:**
    - el −3 en 7.1 (`scenes-a.js:84`);
    - el −3 otra vez en 7.7 (`scenes-b.js:448`);
    - el sentido del 9,97 (`:520`).
  - **Peldaño está parado en la pizarra sin hablar** en 7.2, 7.3 y 7.8 (`boardCast` con `who = 0`).
  - **Las familias no reaccionan a lo que se resuelve para ellas.** Rampa no dice nada cuando su x resulta 2 (7.7) y
    Peldaño no responde a la regla de 7.5.
  - **Ninguna familia le habla a otra**, aunque en los caps. 4–5 discutían quién tenía más (Cornisa) y pedían «igual
    para todas» (Balcón).
  - **Rótulos fuera de cuadro.** Cornisa y Balcón hablan junto a la pizarra, pero sus rótulos están en escalones fuera
    del plano.
- **Por qué importa:**
  - Criterio 3: «Mara reacciona, anota, pregunta; no define ni cierra».
  - Contrato §13 pide buscar «cambios de personalidad».
  - Familias que sólo traen un enunciado («¿Cuánto mide x?», `:404`) suenan a libro de texto.
- **Propuesta:**
  - Que el −3 lo vea el jugador (A2, 7.7) y no lo recuerde Mara.
  - Que el «casi diez» lo diga Punto o el jugador.
  - En cada escena, una línea de la familia que **use** el resultado en su vida, como Rampa en 7.9:
    - Rampa en 7.7: «Dos. Le pongo dos de lado y me sobra la esquina.»
    - Balcón en 7.6: «Sin que sobre nada: así nadie se pelea por la ficha suelta.» Es su rasgo de equidad.
  - Cornisa contra Peldaño en 7.4 (A1).
  - Si la familia no tiene nada que decir en la escena, que no esté parada en la pizarra.
  - El nombre de la familia que habla, en tiza a sus pies, junto a la pizarra.

### M3. La Marea aparece una vez, pero como efecto de cierre calcado del cap. 6: borra algo ya refutado y nada está en juego

- **Dónde:**
  - **7.9:** «Pasa una brisa de borrador. El "= 0" de Punto se deshace» (`scenes-b.js:583-593`). Es el mismo código que
    en 6.3 (`ch6/scenes-a.js:290-297`): el mismo texto, `erase(1.2, 0.5)`, `shake = 0.15` y la misma duración.
  - En 7.2 y 7.4 la Marea sólo se nombra («se llevó entera la escalera del fondo», `scenes-a.js:186`; «el polvo de tiza
    que dejó la Marea esta noche», `scenes-b.js:163`) y no se ve.
- **Qué:**
  - Pasa **después** de que el estudiante refutó a Punto. Es un sello sobre un veredicto ya dicho, no una fuerza que
    obliga a decidir.
  - En el commit, la pasada aleja la cámara al plano general (`:585`) para borrar un rótulo de ≈ 25 px. El árbol de
    trabajo quita ese cambio de plano.
  - Lo entendido no «resiste»: desaparece entre escenas por `clean()` (A1).
- **Por qué importa:**
  - La premisa del diseño es que «lo que nadie entiende, el borrador se lo lleva; lo comprendido resiste».
  - Es A1 de rev-narr-4 (y de rev-narr-2/3). La forma mínima del criterio 6 se cumple, pero repetida igual dos
    capítulos seguidos se vuelve un efecto de sonido.
- **Propuesta:**
  - Con el hilo de A1, la Marea es el plazo de la escalera y el clímax del capítulo. Al final pasa sobre la pizarra y las
    Terrazas:
    - se lleva los renglones que nadie justificó (el 3 · 10⁷ si quedó, el «= 0»);
    - deja tenues los que el jugador escribió y comprobó (√2, x ≠ 2, la tabla);
    - si la escalera se hizo a tiempo, queda.
  - Puesta propia, distinta de la del cap. 6: `SHOTS.wide`, la banda del borrador cruzando de lado a lado y un silencio
    antes.
- **Cómo comprobarlo:**
  - una captura del final con el registro del capítulo tenue y legible;
  - un `describe` que diga qué resistió y por qué.

### M4. Opciones que se delatan, dos predicciones en una escena y respuestas equivocadas sin consecuencia

- **Dónde:**
  - **7.1, filas:** sólo una opción es cuadrada, y la pista lo dice (`scenes-a.js:63`).
  - **7.3, el pensamiento delata la respuesta.** «Cada renglón hacia abajo, un dos menos: el resultado se divide por
    dos» (`scenes-b.js:113`), junto con los «÷ 2» ya escritos, enuncia el patrón **antes** de preguntar 2⁰ (`:115-119`).
  - **7.6:** las fichas de Balcón son exactamente las de 7.5 (`:334`) y la respuesta («x + 2 por x + 3») estaba escrita
    en la escena anterior. El bot directo la eligió de entrada.
  - **7.7, dos predicciones evaluadas** (`:413-417` y `:435-439`). Criterio 1: «a lo sumo una predicción por escena».
    La segunda refleja lo que ya está escrito: «x² + 2x + 1 = 8 + ?» (`:434`).
  - **Opciones de paja:**
    - «Quinientos días: la mitad de mil» (`:478`);
    - «Dejaron más o menos lo mismo» (`:230`);
    - «Se puede con cualquier x» (`:549`).
- **Por qué importa:**
  - Una pregunta cuya respuesta se acaba de decir mide atención al subtítulo, no comprensión (contrato §5).
  - Es M3 de rev-narr-4 y N3 de rev-narr-2.
- **Propuesta:**
  - En 7.3, sacar el pensamiento de `:113` y los «÷ 2» hasta después de la elección.
  - En 7.6, fichas distintas de las de 7.5 (por ejemplo x² + 7x + 12). Si se quiere el contraste, primero x² + 5x + 5.
  - En 7.7, una sola predicción. Que el «8 + 1» lo escriba el jugador eligiendo la cifra, sin el «+ 1» ya puesto a la
    izquierda.
  - Distractores que sean errores reales y del mismo largo. Para 7.8, por ejemplo «unos veinte» (mil dividido «unos
    cincuenta por día»).

### M5. Costuras: 6→7 se cuenta de segunda mano y nombra el título; 7→8 no tiene imagen y repite la pregunta del cap. 5

- **6→7:**
  - Mara relata el problema de Peldaño y no está en cuadro (`ch6/scenes-b.js:325`; `c6c7-directa/029`).
  - El último pensamiento nombra el capítulo siguiente: «Hay que aprender a hacer crecer los números…» (`:334`). Es M1
    de rev-narr-4, otra vez.
  - Corte duro de la explanada del depósito a las Terrazas, sin llegada. La tarjeta de capítulo hace de transición.
  - 7.1 abre con un problema que el gancho no mencionó (nueve cuadros) y difiere el del gancho (`scenes-a.js:53`, `91`).
  - Peldaño, que no estuvo en el cap. 6, dice «x · x = 2» (`:91`).
- **7→8:**
  - Peldaño: «Con la raíz de dos pinté la puerta. Pero ayer partí la diagonal en doce y no cayó en ninguna rayita. ¿En
    cuántas hay que partirla?» (`scenes-b.js:611`).
  - **No hay imagen.** Ni la puerta pintada (mencionada dos veces y nunca vista) ni la diagonal con doce rayitas.
  - **El texto confunde el procedimiento.** En el cap. 5 se partía **el lado** para medir la diagonal
    (`ch5/scenes-b.js:435-463`); «partí la diagonal en doce» describe otro.
  - **Repite el cap. 5.** El jugador ya hizo ese experimento y el estudiante ya concluyó «Que ninguna, nunca, entre
    justo, se puede probar» (`ch5/scenes-b.js:488`). El gancho le devuelve a Peldaño una pregunta que el capítulo
    anterior ya contestó.
  - El aviso «Anotado en la Bitácora (≡)» aparece durante el gancho y sigue en la tarjeta y en el título
    (`c6c7-directa/071`, `072`).
- **Propuesta:**
  - **6→7:**
    - Peldaño en cuadro al final del cap. 6, con la puerta de su huerta y dos cuadros dibujados en el suelo.
    - El estudiante escribe «x · x = 2» y Punto le pone el signo de pregunta. Sin nombrar el capítulo.
    - 7.1 empieza en la puerta de Peldaño y el «probemos con nueve» lo propone el estudiante.
  - **7→8:**
    - La necesidad es nueva: Mara quiere anotar el √2 de la puerta **como fracción** en su registro («todo lo que
      anoto es partes de algo»).
    - Peldaño muestra la diagonal y el lado partido en doce: diecisiete doceavos se quedan cortos por muy poco.
    - Plano cercano de la puerta pintada.
    - El aviso de la Bitácora, después del gancho.

### M6. Accesibilidad: valores que cambian sin `describe`, botones sin verbo y amarillo que no es de Punto

- **Sin `describe`:**
  - los valores de la tabla y las barras de 7.2 (sólo hay pensamientos el día 1 y en el sobrepaso, `scenes-a.js:245-250`);
  - cada renglón de 7.3 (`scenes-b.js:107`);
  - el contador de 7.8 (`:496-497`);
  - cada renglón probado en 7.9 (`:569`).
  - `studentWrites` nunca anuncia lo escrito, porque `director.draw` no habla y los rótulos son de canvas.
  - Con lector de pantalla, 7.2 y 7.8 se reducen a tocar un botón sin saber qué pasa.
- **Rótulos sin verbo:**
  - «otro día» (`scenes-a.js:233`);
  - «Ficha: cuadrado x por x» (`scenes-b.js:281`);
  - «Listo: N lugares» (`:187`);
  - «ya pasó» (`:489`).
  - Además, «Escribir 2³» (`:99`) usa superíndices Unicode, que cada lector pronuncia distinto.
- **Amarillo que no es de Punto:**
  - los cuadraditos de 1 (`common.js:56`);
  - los nueve cuadros de 7.1 (`scenes-a.js:58`);
  - las hipotenusas de los triángulos (`common.js:70`);
  - los «÷ 2» de 7.3, que aparecen sin que nadie los escriba (`scenes-b.js:110`, `131`, `136`).
  - Punto escribe en amarillo en este mismo capítulo («× 2 cada día», 3 · 10⁷, «= 0»), así que el color deja de decir
    quién escribió (B2 de rev-narr-2 y M10 de rev-narr-4).
  - A favor: las fichas se distinguen también por forma, no sólo por color.
- **Propuesta:**
  - `describe` en cada paso de 7.2 («Día 3: Mara 31, Punto 8»), 7.3 («2 a la 2 igual a 4»), 7.8 («512, nueve
    duplicaciones») y 7.9 («Con x = 5: abajo 3; a cada uno, un tercio»).
  - Que `studentWrites` anuncie en palabras («El estudiante escribe: raíz de 9 igual a 3»).
  - `label` con verbo y lugar:
    - «Dibujar otro día de escalera»;
    - «Poner el cuadrado x por x en la huerta»;
    - «Decir que ya pasó mil».
  - Exponentes en palabras en los `label`.
  - Cuadraditos en blanco o celeste. Los «÷ 2», en blanco y escritos por alguien.

### M7. Composición: los momentos no tienen primer plano, el que habla queda cortado y las predicciones se hacen lejos

- **Dónde:**
  - **Sin primer plano en los momentos:**
    - el sobrepaso del día 6 en 7.2, con Punto de ≈ 10 px en el plano general;
    - el momento 7.8 entero (`c6c7-directa/064`);
    - la Marea de 7.9 en el commit (`:585`).
    - Hay planos cercanos (`tiles`, `close`) sólo para manipular, salvo el cuadrado inclinado de 7.1 (`scenes-a.js:148`).
  - **El estudiante cortado mientras habla.** En `tiles`, a 1600×900, queda partido por el borde izquierdo
    (`c6c7-directa/068`: dice «Punto, ¿uno repartido entre nadie…» con medio cuerpo fuera; `c7-errores/024`).
  - **Subtítulos tapando figuras.** En `tiles`, el subtítulo cae sobre los pies de los personajes (`049`, `061`).
  - **Predicciones lejos, primer plano después.** En 7.5 y 7.7 se predice en plano general y el plano cercano llega
    después (A5).
  - **7.1, una comparación difícil.** La barra «un lado de 2» queda horizontal, a la izquierda (`scenes-a.js:151-152`),
    y el lado del cuadrado inclinado, a la derecha. Comparar a ojo una horizontal con una diagonal alejadas es difícil.
    No hay captura de ese momento.
  - **Un rótulo pisado.** En 7.2, la barra de Punto se monta sobre «× 2 cada día» (A3).
- **Por qué importa:**
  - Criterio 8: «primer plano en el momento clave; nada fuera de cuadro».
  - Contrato §3: «encuadres expresivos».
- **Propuesta:**
  - Un inserto de ≥ 2 s en la revelación de cada escena: Punto pasando adelante, «x ≠ 2», «log₂ 1000 ≈ 9,97».
  - Un plano `tiles` corrido 100–150 u a la izquierda cuando habla el estudiante.
  - En 7.1, girar una copia de la barra de 2 sobre el lado inclinado.
  - Extender la guarda de pruebas: todo hablante de `d.say` dentro del encuadre (hoy sólo se controla lo tocable).

### M8. Las fichas no tienen nombre y la notación no se ata a la figura

- **Dónde:** `tile()` dibuja un rectángulo rayado sin rótulo (`common.js:54-62`). Los nombres «x²», «x» y «1» sólo
  aparecen en la ecuación final (`scenes-b.js:311`, `377`) y en los `label` de accesibilidad.
- **Qué:**
  - Nada en la pizarra dice que el cuadrado grande es x · x ni que la tira es x · 1.
  - Las medidas «x + 3» y «x + 2» están en el contorno de 7.5, pero no en el rectángulo de 7.6 ni en la L de 7.7.
- **Por qué importa:** contrato §5: «cómo se conecta esa experiencia con otra representación y con la notación formal».
  Sin el rótulo, «5x» en la ecuación no remite a cinco tiras.
- **Propuesta:**
  - La primera vez que aparece cada ficha (7.5), el estudiante escribe adentro «x²», «x» y «1».
  - Al escribir la ecuación, cada término se subraya y parpadea su grupo de fichas.

### M9. La Bitácora sigue siendo un boletín y atribuye de más en ramas equivocadas

- **Dónde:** `writeJournal7`, `scenes-b.js:616-657`.
- **Qué:**
  - Hasta 9 ítems en «Lo que pasó», todos sobre respuestas: «Anticipaste…», «Apostaste…», «Comparaste…». Ninguno es de
    historia: ni Punto proponiendo duplicar, ni el √2 en la puerta de Peldaño, ni el «= 0» que se llevó la Marea.
  - Atribuye de más:
    - «Apostaste a sumar diez o al empate» (`:623`) cuando eligió una;
    - «Miraste primero el 3 y el 4» (`:627`) también para quien eligió «más o menos lo mismo»;
    - «Pensaste en otro valor» (`:637`) para quien eligió «se puede con cualquier x».
  - El cuerpo cumple los 4 párrafos, pero el segundo y el tercero cargan tres o cuatro ideas cada uno.
- **Propuesta:**
  - 3–5 ítems, al menos dos de historia.
  - Una frase por rama, no «o».
  - Cuerpo con una idea por párrafo: raíz, crecimiento, áreas y la pregunta inversa (el logaritmo y la restricción
    pueden ir en «Desplegar»).

### M10. Repeticiones dentro del capítulo y con el anterior

- Mara dice casi la misma línea dos veces: «En la cuenta de Oval, x · x = 9 también daba −3» (`scenes-a.js:84`) y «Como
  en la cuenta de Oval: x · x = 9 también daba con −3» (`scenes-b.js:448`).
- «Un lado no mide −3» (`scenes-a.js:85`) y «un lado no mide −4» (`scenes-b.js:449`): el mismo argumento.
- La regla de 7.5 («Dos por tres, los cuadraditos; dos más tres, las tiras», `:312`) se repite invertida en 7.6
  (`:378`). Son dos escenas seguidas con la misma conclusión.
- «A mí me dieron las fichas sueltas» (`:334`) repite la fórmula «Me dieron un acertijo» del cap. 6 (B6 de rev-narr-4).
- La sucesión 1, 2, 4… 1024 con el mismo gesto en 7.2 y 7.8 (A4).
- «el lado de esta huerta, por sí mismo, da dos» (`scenes-a.js:157`) repite la ambigüedad «por sí mismo da 2» que
  rev-narr-4 marcó en el gancho del cap. 6 (M1). Mejor «multiplicado por sí mismo, da dos».
- **Propuesta:**
  - una sola mención del −3 (y que la vea el jugador);
  - en 7.6, que concluya Balcón con sus palabras;
  - variar la fórmula de entrada de las familias;
  - corregir «por sí mismo».

---

## Hallazgos BAJOS

- **B1. El subtítulo de una escena queda sobre la siguiente:** `c6c7-directa/034`, `039`, `046`, `050` y `057`. Es la
  pizarra limpia de la escena nueva con la última línea de la anterior (B7 de rev-narr-2, 3 y 4).
- **B2. «Anotado en la Bitácora (≡)»** sigue visible al empezar 7.1 (`030`), en la tarjeta de fin y en la pantalla de
  título (`071`, `072`) (B6, otra vez).
- **B3. Punto sin flecha** en todas las partidas: empezaron en el cap. 6 o el 7 y no hay `puntoArrow`. El capítulo no
  fija el estado que presupone (B3 de rev-narr-4).
- **B4. El cero barrado («Ø»)** en «2⁰», «1000», «0 duplicaciones» y «0» de 7.9. En exponentes chicos, «2⁰» y «2⁹» se
  confunden (recorte de `045`; `c7-telefono/015`).
- **B5. «Las otras 1 sobraban»** (`scenes-b.js:514`, `c7-errores/040`): concordancia.
- **B6. «Acordate de las bolsas de las Terrazas: no hay cuántas»** (`:582`). La frase es rara, y las bolsas del cap. 4
  eran división como medida (¿cuántas bolsas de nada se llenan?), mientras que acá se reparte entre personas. Mejor:
  «Uno repartido entre nadie: no hay a quién darle; no es cero, es que no hay cuenta».
- **B7. «Y un grano solo es nada: una milésima de gramo»** (`:236`): en la escena de los números chicos, «es nada» dice
  lo contrario de la idea. Mejor «casi nada».
- **B8. «x ≠ 2» queda pegado al último renglón** cuando se prueban los cuatro valores (`c7-errores/047`).
- **B9. Los «÷ 2» a la derecha de cada renglón** se pueden leer como «2³ = 8 ÷ 2» (recorte de `045`). Mejor flechas
  curvas entre resultados, en el margen.
- **B10. La puerta de Peldaño** se nombra dos veces (`scenes-a.js:161`, `scenes-b.js:611`) y no se ve nunca.
- **B11. La pregunta de Mara «¿de dónde sacás tanta tiza el día siete?»** (`scenes-a.js:262`) es buena y nadie la
  retoma. Podría conectar con el polvo de 7.4 o con el límite real de duplicar.
- **B12. «Mi huerta… ¿Cuánto mide x?»** (`scenes-b.js:404`): una vecina que pregunta con la x del enunciado suena a
  libro. Mejor «¿cuánto le pongo de lado?».
- **B13. Ruta con errores:** «no pudo tocar cut1: page.click: Timeout» (`c7-errores/log.txt`, 43,7 s), y aun así la
  escena siguió. Puede ser que el blanco del cuadro 2 quede tapado por los de los triángulos del cuadro 1. Es para la
  revisión funcional; no hay captura de ese tramo.

## Qué mejoró respecto del cap. 6

- **Hablantes en cuadro y lugar establecido.** La familia que habla está junto a la pizarra, y las Terrazas con sus
  rótulos se ven en cada apertura (A6 de rev-narr-4, resuelto en los planos generales).
- **Más de dos planos:** `board`, `tiles` y `close`. Hay planos cercanos para manipular, y fichas y cifras legibles a
  1600×900.
- **Punto con iniciativa, emoción y dos errores verosímiles.** Contar cifras en 7.4 es su rasgo del diseño, y 1 ÷ 0 = 0
  en 7.9 viene del cap. 4. En 7.4 borra y reescribe su error (A3 de rev-narr-4, parcial).
- **Lo equivocado ya no queda escrito como si valiera.** Punto borra su 3 · 10⁷ y la Marea se lleva el «= 0» (A1 de
  rev-narr-4, parcial).
- **Una consecuencia de error bien hecha (7.6)** y una escena de exploración con valores (7.9).
- **Mara pregunta y reacciona**, con humor. Ya no define en la mayoría de sus líneas.
- **Una familia concluye en sus términos** (Rampa en 7.9).
- **Costura conceptual rica** con los caps. 4, 5 y 6.
- **Bitácora con cuerpo de 4 párrafos** (antes 7).
- **Más `describe`:** 16 en el capítulo, incluida la Marea y los errores de Punto.

## Qué no pude verificar

- **Audio:** no escuché nada (`punto('happy'|'sad'|'question')`, el borrador de la Marea, los `tap` con tono creciente).
- **Ritmo y actuación:** sólo vi cuadros sueltos y logs de un bot. No sé cuánto dura cada escena para una persona ni
  cómo se ven el corte de los cuadros, el giro de las tiras, la estela o el pulso de Punto.
- **Pantallas sin captura en ninguna partida:**
  - 7.1: el corte, el armado del cuadrado inclinado, el plano `close`, la barra «un lado de 2» y los renglones de √2;
  - la pasada de la Marea en 7.9 a mitad del borrado;
  - el gancho 7→8 en pantalla (sólo está en el log);
  - la Bitácora abierta.
- **El atasco táctil de 7.8** lo deduzco de `c7-telefono/state.json` (`log-early` repetido con k = 1) y del resumen, no
  de una captura del toque.
- **Teléfono real:** las partidas de 844×390 son emulación. Además mezclan el código del commit (`c7-telefono`,
  `c7-telefono2`) con cambios sin commit (`c7-telefono3`).
- **Lector de pantalla:** no probé cómo se leen los superíndices («2³», «10⁻³», «log₂») ni los `describe` en contexto.
  Tampoco el texto grande ni la lectura limpia con estas tablas, donde el mínimo de 13 px puede superponer renglones.
- **Ramas no cubiertas por las partidas:**
  - 7.1 «en 9 filas»;
  - 7.2 «parar» antes del día 10;
  - 7.3 «2⁰ = 2»;
  - 7.4 «más o menos lo mismo»;
  - 7.5 «seis tiras y cinco cuadraditos»;
  - 7.7 «Nada: ya es un cuadrado» y «8 + 2»;
  - 7.8 «quinientos»;
  - 7.9 «cualquier x».
- **La flecha de Punto en una partida completa desde el cap. 1.**
- **Comprensión de personas:** nada de esto es un playtest. Que algo «se sienta plantilla», «delate la respuesta» o «se
  lea mal» es una hipótesis que hay que comprobar con jugadores.
