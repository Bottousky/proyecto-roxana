# Arithmos — revisión narrativa, de dirección y de puesta en escena (caps. 2, 3 y 4)

Revisor independiente (rev-narr-2), 2026-10-06. Sin navegador ni scripts. La revisión se basa en lectura de código,
logs de partidas automáticas y capturas PNG ya hechas.

## Alcance, evidencia y advertencias

- **Código leído** (estado de `HEAD` = `1cc023f`): `experiments/arithmos/src/ch2/scenes.js`, `ch3/scenes-a.js`,
  `ch3/scenes-b.js`, `ch4/scenes-a.js`, `ch4/scenes-b.js`, sus `common.js`, `ch1/common.js` (Punto, estudiante),
  `engine/world.js` (Dot), `engine/ui.js` (Bitácora, rótulos), `ending.js`, `main.js` (encadenado).
- **Contrato y diseño:** `docs/arithmos/ARITHMOS_MASTER.md`, `ARITHMOS_DESIGN.md` (incluye el diseño del cap. 5 agregado
  en `1cc023f`), `ARITHMOS_REVIEW.md` (N1–N17, rev-mat-2).
- **Logs:** `artifacts/arithmos/it04/c2-errores.log`, `c2-snaps.log`, `c3-perdon.log`, `c4-directa.log`,
  `c4-errores.log`; consultados además `c1-errores.log` (costuras 1→2→3), `c2c3-check.log`, `full-directa.log`.
- **Capturas mostradas** (1600×900): `c2-snaps/` 001–040, `c4-directa/` 001–019, `c1-errores/` 019–071, más
  `c4-repartir/`, `c4-directa2/` y `c4-touch2/` (844×390) para el cap. 4 con el diseño de plano nuevo.
- **Desfase de versiones (importante):** el juego cambió mientras se tomaban las capturas. `c2-snaps` (08:32) es anterior
  a la última edición de `ch2/scenes.js` (08:33) y muestra textos viejos ("Oval, tres"); `c4-directa`/`c4-errores`
  (08:38–08:43) son anteriores a `8d97397` y `1cc023f` (plano de las Terrazas, ubicación de familias, `clearSigns`).
  Para cada hallazgo de imagen se indica qué captura lo muestra y si el código actual lo confirma o lo pudo haber
  cambiado. Los textos se citan del código actual.
- Los logs son de un bot que lee y elige rápido: sirven para ver **qué se dice y en qué orden**, no el ritmo real.

## Lo que funciona (para calibrar)

- La costura cap. 1 → cap. 2 es buena: "—Ni idea. Mañana." → "—Sí, ya sé. El 1. Todavía no lo sé." y Punto que
  marca todo, incluida la cabeza del estudiante (humor con función, `ch2/scenes.js:171-192`).
- Errores reales de Punto con consecuencia visible: atados de a cinco (2.2), "4 + 3 = 7" en la pizarra (4.1),
  "× 2 → más" (4.3), contar plantas de más (4.2), levantar un atado para nadie (4.6).
- Errores del jugador que cambian el mundo: familias que se quejan desde la marca equivocada (3.3,
  `placeComplaint`), familias que protestan por el reparto desigual (4.4), el depósito de prueba de Punto (2.4).
- Trampa visual bien armada en 2.2: la hilera de ayer (34) es **más larga** que la de hoy (37) (`c1-errores/022`).
- "Lo comprendido resiste" tiene dos pagos concretos: la brisa de borrador que no se lleva los ceros (2.5) y la
  piedra "4 × 3" que se vuelve nítida (4.1).
- El gancho cap. 4 → cap. 5 paga el "Guardala" de 4.4 y encaja con el diseño del cap. 5.

---

## Hallazgos ALTOS

### A1. La premisa del borrador/Marea desaparece después del cap. 2
- **Dónde:** la Marea se nombra sólo en `ch2/scenes.js:230, 640, 923, 989`. En `ch3/*` no hay ninguna mención ni
  amenaza (sólo manchas decorativas, `ch3/common.js:38-40`). En `ch4` queda la piedra casi borrada
  (`ch4/common.js:59-60`), sin que nada esté en riesgo.
- **Qué:** en los caps. 3 y 4 nadie pierde nada si no se entiende. Los conflictos son contables (una deuda, un
  reparto) y se resuelven sin costo.
- **Por qué importa:** "Lo que nadie entiende, el borrador se lo lleva" es el motor dramático del diseño. Sin él,
  los caps. 3–4 se leen como una serie de problemas de cuentas con personajes de pretexto (ver A4).
- **Propuesta:** una amenaza visible y un pago de "lo comprendido resiste" por capítulo. Cap. 3: la celda de Curva
  en el registro se va borrando mientras nadie sabe cómo escribir la deuda. El "0" y el "3" se borran con la
  pasada y "−3" queda. Cap. 4: la Marea se come los escalones de las Terrazas cuyo signo nadie entiende. Al
  entender "4 × 3", la piedra y los escalones se redibujan.

### A2. Mara pasa de "así se hizo siempre" a maestra que enuncia las reglas
- **Dónde:** cap. 2: "¿Por qué de a diez? No me preguntes." (`ch2/scenes.js:413`). Caps. 3–4: Mara presenta la
  recta (`ch3/scenes-a.js:336`), la regla de los pares (`:229`), cierra con resúmenes (`:433`;
  `ch3/scenes-b.js:461`; `ch4/scenes-a.js:468`) y explica notación y fundamentos: |−4| (`ch3/scenes-b.js:112`),
  el paréntesis (`:252-254`), "Dividir es deshacer multiplicar" (`ch4/scenes-b.js:385`), "No es cero ni
  infinito… Por eso no se divide por cero" (`:404`). Mara dice 33 líneas en el cap. 2, 19 en el 3 y 18 en el 4.
- **Qué:** cambia de personalidad sin un momento que lo motive. La que no sabía por qué ata de a diez ahora sabe
  convenciones de notación y la razón de que no se divida por cero. Casi todas las escenas de los caps. 3–4
  terminan con ella diciendo la conclusión.
- **Por qué importa:** el contrato pide buscar "cambios de personalidad" y "exposición innecesaria" (§13). La
  conclusión llega oída, no comprendida, y la voz lacónica que se había construido se pierde.
- **Propuesta:** Mara sigue siendo la del procedimiento. Reacciona, se equivoca, pregunta ("¿Y eso cómo lo
  anoto?") y puede nombrar una convención (|x|, el paréntesis) **después** de que el estudiante o Punto la
  mostraron. Habría que eliminar o mover a la Bitácora los resúmenes de `ch3/scenes-a.js:433`,
  `ch3/scenes-b.js:461`, `ch4/scenes-a.js:468`, `ch4/scenes-b.js:260` y `:404`.

### A3. El protagonista pierde voz y autoría
- **Dónde:** el estudiante dice en voz alta 6 líneas en el cap. 2, 2 en el 3 y **0 en el 4** (conteo de
  `d.say('student'`). En el cap. 2 escribe él (37, 34, 302, 1000: `s.setPose('write')`). Desde 3.5 y en todo el
  cap. 4 **escribe Mara** (`m.setPose('write')` en `ch3/scenes-b.js:241`, `ch4/scenes-a.js:147,163,286,461`,
  `ch4/scenes-b.js:30,517`). Otras acciones que podían ser del jugador están automatizadas: "Rodeás las marcas de
  ayer de a diez" (`ch2/scenes.js:432`) ocurre sola.
- **Qué:** el diseño dice que el estudiante "es el único que puede trazar". En el cap. 4 mira, piensa veredictos y
  otros escriben la notación.
- **Por qué importa:** es pasividad (§13). La notación formal, que es el puente "experiencia → símbolo" del
  contrato (§5), la pone otra persona.
- **Propuesta:** que el estudiante escriba cada igualdad del cap. 4. Puede ser un toque sobre la pizarra después
  de comprender, con la tiza que se mueve. Que tenga 1–2 líneas dichas por escena, dirigidas a Punto o a una
  familia. En 2.3, que el jugador rodee él mismo la hilera de ayer: es la transferencia natural del molde.

### A4. Caps. 3 y 4: estructura de cuestionario encadenado y acciones de un solo botón
- **Dónde:** hay 11 elecciones evaluativas (`evaluate: true`) en las 7 escenas del cap. 3 y 15 en las 7 del
  cap. 4. El ciclo se repite en 4.1, 4.2, 4.3 (tres veces), 4.5, 4.6 (tres veces) y 4.7: una familia o Mara plantea
  un problema, hay opción múltiple, una acción, un pensamiento-veredicto ("como dije" / "no X: Y"), la regla
  dicha por Mara y una ecuación en la pizarra. Acciones con un único blanco posible: 3.4 (siempre sólo la marca
  siguiente, `ch3/scenes-b.js:54`), 4.2 girar (`ch4/scenes-a.js:242`), 4.3 "× 2", "× (−1)" y "× (−1)"
  (`waitWord`, `:480-485`), 4.5 "llenar una bolsa" ×4 (`ch4/scenes-b.js:229`), 4.6 "llenar una bolsa de cero" ×3.
- **Por qué importa:** el contrato rechaza explícitamente "pulsar continuar mientras el juego piensa" y pide
  decisión y consecuencia por escena (§4, §8). Con tantas predicciones, el capítulo se siente evaluación.
- **Propuesta:** una sola predicción por escena, la que tiene consecuencia en el mundo. Convertir los botones
  únicos en decisiones:
  - 4.3: "Cornisa tiene que quedar en +6: ¿qué le aplicás?" (× 2, × (−2), × (−1) y después × 2: hay más de un
    camino válido).
  - 4.5: el jugador elige el tamaño de bolsa para llevar 12 sin que sobre (3, 4 o 5; con 5 sobran 2).
  - 4.6: llenar bolsas de cero cuantas veces quiera y decidir cuándo parar.
  - 3.4: tocar dónde empieza y dónde termina y contar a su manera.

### A5. Las cuentas de las familias se contradicen entre escenas y capítulos
- **Dónde y qué:**
  - Cap. 2 → 3: en 2.5–2.6, Oval 302, Recta 52 y Curva 37, que son 3 atados y 7 (`ch2/scenes.js:901, 1030`). En
    3.1: "Recta tiene cuatro guardados; Oval, otros cuatro" y Curva "ya no me queda ninguno"
    (`ch3/scenes-a.js:64-65`). El jugador acaba de ver "Familia Oval 302" y el cambio a "Cuentas (en atados)"
    (`c1-errores/037`) no lo reconcilia.
  - Dentro del cap. 4: en 4.1 las cuatro familias deben 3 (`ch4/scenes-a.js:68`, 4 × (−3) = −12). En 4.3,
    Peldaño está en +1, Rampa en +2 y Cornisa en −3 (`:333`), y "la cosecha se duplicó. Y las cuentas también"
    (`:399`). En 4.5 pagan "tres atados cada familia" (`ch4/scenes-b.js:216`), no seis. Mara dice "**Ayer**: doce
    entre cuatro familias" (`:260`), pero fue recién y fueron catorce.
  - La huerta de Peldaño es de 9 × 4 en 4.2 (`ch4/scenes-a.js:302`) y de 4 × 5 en 4.7 (`ch4/scenes-b.js:445`).
- **Por qué importa:** en un juego sobre cantidades, quien hace lo que se le enseña (seguir los números) encuentra
  contradicciones. Que las deudas se dupliquen porque se duplicó la cosecha no tiene lógica económica y debilita
  la metáfora de la escala.
- **Propuesta:** un registro por capítulo, con valores estables y visibles en pantalla. En 3.1, una línea que
  reconcilie ("lo que cada familia dejó guardado acá, en el depósito"), o valores que salgan del cap. 2. En 4.3,
  presentar la escala como hipótesis explícita ("¿Y si…?") o usar a las cuatro familias en −3. En 4.5, "Recién"
  y "catorce, tres para cada una y sobraron dos". Que la huerta tenga la misma medida o sea de otra persona.

### A6. La evolución de Punto en el cap. 3 se decreta y en el cap. 4 se pierde
- **Dónde:** en 3.7 se pone `p.arrow = true` (`ch3/scenes-b.js:449`) y la línea que lo acompaña es de Mara y
  habla de los números (`:461`). Nadie reacciona al cambio de Punto. La flecha ya se había usado en 3.5
  (`:231-237`), antes del "momento". En el cap. 4, `punto()` crea un punto sin flecha (`ch1/common.js:73-84`) y
  `arrow` no aparece en ningún archivo de `ch4` ni se guarda en `flags`. Del diseño ("Punto que escribe: palabras
  cortas, discute"; "Trazo: señala hacia, acompaña recorridos"), Punto no escribe ninguna palabra ni discute. En
  el cap. 3 no se equivoca nunca: pone la rayita (3.1), demuestra el par cero (3.5) y escribe los negativos (3.3).
- **Por qué importa:** el contrato exige que la evolución cambie percepción, expresión y relación (§4). Hoy es un
  detalle gráfico de 5 s que desaparece en el capítulo siguiente. Además, la evolución del cap. 2 (sus primeras
  cifras) queda mal encuadrada (A8).
- **Propuesta:**
  - Persistir el estado (por ejemplo, `flags.c3hacia` hace que `punto()` arranque con `arrow`).
  - Escenificar el descubrimiento: en el pozo, Punto señala hacia arriba por dónde salir, el estudiante lo nota
    ("Ahora señalás") y Punto lo repite con alegría.
  - En el cap. 4, que Punto use la flecha con intención (señala la fila que cuenta) y que se equivoque con ella:
    en "× (−1)" señala primero hacia el lado equivocado.
  - En el cap. 3, darle un error genuino. Por ejemplo, se para en −5 creyendo que es "más" que −2, o escribe la
    rayita después del número.

### A7. Las familias del cap. 4 reutilizan las cabezas que identificaban a las familias de los caps. 2–3
- **Dónde:** `ch4/common.js:25-30`: Peldaño tiene cabeza cuadrada como Recta, Rampa triangular como Espiral,
  Cornisa ovalada como Oval y Balcón en rulo como Curva (`ch3/scenes-a.js:283-288`). La regla del propio código
  es "La forma de la cabeza dice de qué familia es" (`ch2/common.js:72`). Sólo agregan un sombrero. Sus nombres
  nunca aparecen en pantalla salvo como rótulo del hablante (`c4-repartir/004`, `c4-directa/010`).
- **Por qué importa:** el lenguaje visual que el juego enseñó se rompe. En 4.4, "¿Y por qué Peldaño y Rampa tienen
  cuatro y nosotras tres?" obliga a asociar nombres nuevos con cabezas ya conocidas por otra familia.
- **Propuesta:** cabezas nuevas para las Terrazas (escalón, rombo, semicírculo, estrella) y el nombre escrito en
  tiza en cada escalón la primera vez que se las ve. El nombre visible también ayuda a la accesibilidad.

### A8. El momento de evolución del cap. 2 (las primeras cifras de Punto) está fuera de cuadro
- **Dónde:** 2.3 Atados. El estudiante se crea en x = 6020 (`ch2/scenes.js:389`) y el plano `SHOTS.frame` empieza
  en 6040 (`ch2/common.js`), así que **queda fuera de cuadro toda la escena**. Punto aparece cortado en el borde
  izquierdo, montado sobre el "14" del cap. 1 (`c1-errores/023`, código actual; `c2-snaps/003-006`). Las cifras
  "1" y "4" se escriben debajo de la línea de suelo (`y = bnd.y + 86`, `:466-470`). En `c2-snaps/006`, el "1"
  queda bajo la figura de Mara y el "4" tapado por Punto, mientras el estudiante dice "¡Escribiste!" fuera de
  cuadro. La superposición con Mara puede estar corregida en el código actual: Mara ahora está en FRAME.x + 340,
  según `c1-errores/023`.
- **Por qué importa:** es la evolución del capítulo y el pago emocional del cap. 1, y no se ve. Es la misma clase
  de problema que N4 y N13 de la revisión del cap. 1.
- **Propuesta:** el estudiante dentro del plano (x ≥ 6150), un primer plano de ≥ 2 s sobre el atado y los
  sueltos mientras Punto escribe, las cifras **arriba** del suelo y Punto apartándose para mostrarlas.

---

## Hallazgos MEDIOS

### M1. "Como dije" / "Lo anticipé": el pensamiento se vuelve marcador de aciertos
- **Dónde:** `ch2/scenes.js:445`; `ch3/scenes-a.js:265, 432`; `ch3/scenes-b.js:81, 322, 421`;
  `ch4/scenes-a.js:136`; `ch4/scenes-b.js:172, 259` (9 casos).
- **Por qué importa:** es un elogio automático disfrazado (§4) y repite lo que la imagen ya mostró.
- **Propuesta:** cuando se acierta, que no haya veredicto y que hable la consecuencia (Punto que festeja, la
  familia que asiente). Si se conserva una línea, que nombre la razón, no el acierto.

### M2. Ganchos de capítulo repetidos o sin apuesta
- **2→3:** "Mara… te debo tres atados de ayer. Y ya no me queda ninguno." se dice idéntica al final de 2.8
  (`ch2/scenes.js:1333`) y al comienzo de 3.1 (`ch3/scenes-a.js:65`). En el log aparecen a 1,5 s de distancia
  (`c2-errores.log` 110.1 s / 111.6 s).
- **3→4:** el gancho es un problema de cuenta ("¿Cuánto se debe, en total?", `ch3/scenes-b.js:463-464`). El
  cap. 4 lo vuelve a plantear con Mara (`ch4/scenes-a.js:68`) y una tercera vez con la pregunta (`:87`).
- **Propuesta:** abrir el cap. 3 con otra imagen (Curva con las manos vacías frente a la celda en blanco). Que el
  gancho 3→4 tenga apuesta, por ejemplo la piedra de las Terrazas que se está borrando (ver A1). Que el cap. 4
  abra con la llegada y la piedra, sin repetir la cuenta.

### M3. Los cierres de los caps. 2 y 3 no tienen decisión y repiten
- **2.8** (`ch2/scenes.js:1313-1330`): Punto vuelve a explicar el 14 con un atado y cuatro palitos, igual que en
  2.3. El diseño pedía que el jugador le explicara a Mara con atados y que ella corrigiera su registro.
- **3.7** (`ch3/scenes-b.js:446-461`) es una cinemática con un resumen de Mara.
- **Propuesta:** en 2.8, el jugador arma con atados un número que Mara no sabe leer (por ejemplo 205) y paga el
  "así se hizo siempre". En 3.7, el jugador elige hacia dónde sale Punto y ese primer trazo es la escena.

### M4. Redundancias de idea y de línea
- Mara aprende dos veces que el cero importa: "Yo siempre lo dejaba en blanco" (`ch2/scenes.js:662`) y "Siempre
  pensé que el cero no era nada" (`:977`).
- "Así se hizo siempre" aparece tres veces (`:344, 413, 640`) sin un pago explícito.
- 4.3: el pensamiento "Por uno, nadie se mueve" (`ch4/scenes-a.js:435`) y el resumen de Mara (`:468`) dicen lo
  mismo.
- 4.5: la línea de Mara, el pensamiento y la ecuación escrita repiten la misma idea (`ch4/scenes-b.js:260-263`).
- 4.2: "Girar no saca ni pone ninguna" (`ch4/scenes-a.js:285`) y "Girarlo no le saca ni le pone ninguna" (`:318`).
- "Por la cerca que (me) arreglaste" se usa dos veces (`ch3/scenes-a.js:222`, `ch3/scenes-b.js:88`).
- "Ayer" sirve de comodín en `ch3/scenes-a.js:65, 257`, `ch3/scenes-b.js:88, 138` y `ch4/scenes-b.js:260`.

### M5. Explicaciones que se adelantan y enunciados que miran por el jugador
- **La regla antes de actuar:** "Lo que tiene paga lo que debe: uno contra uno." (`ch3/scenes-a.js:229`), "De a
  uno, por vueltas…" (`ch4/scenes-b.js:82`), "Dividir es deshacer multiplicar." (`:385`).
- **El enunciado describe lo que había que observar:** "En el depósito: un atado de atados, un atado y ningún
  suelto" (`ch2/scenes.js:759`) y "Tres atados de atados, ningún atado, dos sueltos. ¿Qué número es?" (`:952`).
  El paso de observar desaparece (§8: observar, intentar, confirmar).
- **Adelanto del cap. 6 sin necesidad:** "tampoco se puede volver atrás…" (`ch4/scenes-b.js:405`).
- **Propuesta:** pasar la regla a la ayuda graduada ("?"). El enunciado pregunta y la descripción queda para
  "describir acciones".

### M6. Escenas con necesidad dramática débil
- **2.6:** Curva pregunta cuánto más tiene Recta y cierra con "Igual se lo voy a reclamar" (`ch2/scenes.js:1029,
  1045`). No se entiende qué reclama ni a quién.
- **2.7:** del depósito con 110 se pasa a 999 con "Todos devolvieron lo que les sobraba" y "acaban de traer un
  palito más" (`:1187-1188`). Es un problema armado.
- **3.4:** "Recta, ¿cuánto más que nosotros tenés?" es un pretexto (`ch3/scenes-b.js:43`).
- **3.6:** Punto cae sin preparación, "puede subir cinco marcas" no se justifica (`:372`) y el rescate termina
  sin reencuentro, con Punto flotando en +1 (`c2-snaps/038`).
- **4.6:** "Si un día las Terrazas quedan vacías…" es una hipótesis filosófica sin apuesta
  (`ch4/scenes-b.js:321`).
- **Propuesta:**
  - 3.6: la escalera tiene cinco peldaños, o Punto tiene fuerza para cinco saltos. Al salir, el estudiante lo
    recibe en la mano (primer plano).
  - 2.6: Curva cree que Recta tiene "el doble" y quiere saber si es justo; la diferencia lo desmiente.
  - 2.7: el palito número mil es el que trae el estudiante, el de su tiza.

### M7. Ritmo y monotonía en el depósito (2.4)
- **Dónde:** tres cargas con 10, 5 y 14 objetos, cada uno con dos toques (objeto y cuarto)
  (`ch2/scenes.js:642-646, 668-742`): unos 58 toques. Las ideas nuevas son el primer canje (carga 2) y el canje
  doble (carga 3).
- **Propuesta:** después del primer canje, ofrecer "guardar todos los sueltos" o "todos los atados", como el
  "llenar el molde de una vez" de 2.3.

### M8. Composición: textos y figuras que compiten
- **La pizarra del cap. 1 invade 2.2, 2.3 y 2.6.** "hoy" (amarillo) queda encima de "catorce" (`c1-errores/022`,
  `c2-snaps/002`), Punto se para sobre el "14" (`c2-snaps/014`) y la llave del cap. 1 se lee como un poste.
- **Presentación de Mara (2.1):** su cabeza queda dentro del anillo amarillo del "1" (`c1-errores/020`).
- **La mancha del cero (2.5):** casi no se ve y está corrida hacia arriba, no entre el 3 y el 2 (`c2-snaps/010`,
  ampliada; `ch2/scenes.js:909-916`). La pregunta "¿Qué había entre el 3 y el 2?" depende de verla.
- **Cap. 3:**
  - El estudiante y Mara quedan cortados en el borde izquierdo (`c2-snaps/030, 035, 039`, `c1-errores/058`).
  - El estudiante queda parado sobre la recta, más allá de +6, con Punto sobre la cabeza: se puede leer como una
    "familia más" (`c2-snaps/025-026`).
  - Mara aparece cortada en `c2-snaps/007` y `025`.
- **Cap. 4:**
  - La piedra con el signo casi borrado se lee como una cara (ojos y nariz) y está en el borde del plano
    (`c4-directa/001`, ampliada), mientras el estudiante piensa "Una cruz acostada entre el 4 y el 3".
  - Las notas se acumulan arriba de la pizarra; la más nueva queda **arriba** de las viejas
    (`ch4/scenes-b.js:516`; `c4-directa2/017`) y la pizarra, en el centro, queda vacía.
- **Propuesta:**
  - Atenuar la pizarra del cap. 1 cuando la cámara está en el montón, o correr el montón y los rótulos.
  - Un plano corto de presentación para Mara.
  - Una mancha centrada y más visible.
  - Ubicar al estudiante dentro del plano y fuera de la recta.
  - Un inserto corto de la piedra antes del pensamiento.
  - Ordenar las notas de arriba hacia abajo por orden de aparición.

### M9. Lugares sin rótulo: el depósito y "la mesa"
- **El depósito:** los cuartos sólo se distinguen por el ancho y la regla se dice una vez (`ch2/scenes.js:637`;
  `c2-snaps/007-008`).
- **"La mesa":** en el cap. 3 es un caballete idéntico al del registro, junto a él (`c1-errores/037`), mientras
  el texto dice "mesa" (`ch3/scenes-b.js:146, 175`).
- **Propuesta:** un pictograma de tiza sobre cada puerta (|, atado, atado de atados) y una mesa dibujada como mesa.

### M10. La Bitácora es más manual que recuerdo
- **Dónde:** `engine/ui.js:586-630` muestra el resumen, después el cuerpo (reglas) y recién al final "seen" (lo
  jugado). El cuerpo del cap. 3 tiene 9 párrafos (`ch3/scenes-b.js:498-508`).
- **Qué falta:** ningún momento de historia (las primeras cifras de Punto, la casa de los Oval, el pozo).
- **El aviso:** "Anotado en la Bitácora" sigue en pantalla al empezar el capítulo siguiente (`c1-errores/037,
  059`) y no dice dónde está la Bitácora.
- **Propuesta:** primero "Lo que pasó" (3–5 líneas, una de historia), después "Lo que eso dice" (≤ 4 párrafos) y
  el dato al final. El aviso podría decir "Anotado en la Bitácora (≡)".

### M11. [Accesibilidad] Rótulos repetidos y botones que no dicen la acción
- **Rótulos idénticos, sin posición.** Es una regresión de F13, que se corrigió en el cap. 1:
  - "Palito suelto" ×37 (`ch2/scenes.js:533`)
  - "Recta: atado / suelto" (`:1079`)
  - "Un atado que se tiene / que se debe (punteado)" (`ch3/scenes-a.js:167`)
- **Botones cuyo texto es un enunciado o una pregunta:**
  - "ya no queda nada de Curva" (`ch2/scenes.js:1082`)
  - "¿y la otra?" (`ch3/scenes-b.js:149`)
  - "listo" (`ch2/scenes.js:536`)
  - "atar (3)" (`:534`)
- **Eventos visuales sin `d.describe`:**
  - Punto cae al pozo (`ch3/scenes-b.js:358-364`)
  - Oval le pasa dos atados a Curva (`ch3/scenes-a.js:224-226`)
  - las filas de deudas se forman en 4.1 (`ch4/scenes-a.js:106`)
  - el corte de la huerta (`ch4/scenes-b.js:463-466`)
  - el llenado de bolsas (4.5)
- **Descripción engañosa:** "Rodeás las marcas de ayer" (`ch2/scenes.js:432`) atribuye al jugador algo que hace
  el juego.
- **Propuesta:** etiquetas con posición o estado ("palito 3 de 37", "atado de Recta, 2 de 5"), botones con
  verbo ("Terminar: ver lo que le sobra a Recta", "Agregar un atado y una deuda"), y `describe` en esos cinco
  eventos.

### M12. El protagonista no tiene deseo propio y la Ronda desaparece
- **Dónde:** "No hay vuelta. Por ahora." (1.1) no se retoma. La Ronda, la familia de Punto y núcleo emotivo del
  cap. 1, sólo es decorado en 2.1–2.2. En los caps. 3–4 la relación estudiante–Punto no cambia.
- **Propuesta:** un latido por capítulo. Por ejemplo: Lino visita el depósito, el estudiante prueba la puerta y
  sigue cerrada, Punto le regala una marca.

### M13. Texto clave ilegible en pantallas chicas (4.1)
- **Dónde:** el "4 + 3 = 7" de Punto mide unos 14 px a 1600×900 (`c4-directa/002`) y unos 6 px a 844×390
  (`c4-touch2/002`). La opción "Siete, como escribió Punto" depende de leerlo. Las deudas de los escalones miden
  unos 10 px en el teléfono.
- **Propuesta:** un inserto de la pizarra mientras Punto escribe y una letra más grande para las notas de Punto.

### M14. En 2 − 5, el jugador no decide cuántos pares agregar
- **Dónde:** "agregar pares que valen cero" agrega exactamente tres pares de una vez (`ch3/scenes-b.js:300-316`).
- **Por qué importa:** "¿cuántos me faltan para poder pagar?" es justamente el razonamiento de 2 − 5.
- **Propuesta:** un par por toque. Que el jugador decida cuándo alcanza y que, si sobran pares, se vea que no
  cambian nada.

---

## Hallazgos BAJOS

- **B1.** "Espiral" tiene cabeza triangular (`ch3/scenes-a.js:287`), aunque hay una espiral fantasma en el fondo
  (`ch3/common.js:39`). Nombre y forma no se corresponden.
- **B2.** El amarillo es la tiza de Punto, pero también se usa para saldos y sumas que Punto no escribió:
  `sign-*` (`ch3/scenes-a.js:294`) y "8 + 12 = 20" (`ch4/scenes-b.js:474`). En 3.3 hay un buen detalle: los
  negativos se escriben en amarillo y pasan a blanco (`:421-423`). Conviene sostener esa regla.
- **B3.** La corrección "× 2 → más lejos del 0" cambia el texto sin que nadie la haga (`ch4/scenes-a.js:420`).
  Mejor que Punto borre y reescriba: es su propia corrección.
- **B4.** Las notas de multiplicación persisten todo el cap. 4, pero las de división se borran en cada escena
  (`ch4/scenes-b.js` setups con `bl-`). La continuidad de la pizarra es inconsistente.
- **B5.** Las plantas de la huerta parecen letras "ϒ" (`c4-directa2/016`), un riesgo de confusión en un mundo de
  símbolos.
- **B6.** "Partes de algo." cita el título del capítulo siguiente en el pensamiento (`ch4/scenes-b.js:558`). Es
  metatextual; mejor una imagen (Punto empuja un atado que se parte apenas).
- **B7.** Las capturas de inicio muestran el último subtítulo de la escena anterior sobre el decorado nuevo
  (`c2-snaps/007, 013, 039`; `c1-errores/036, 058`). Si dura más que los 160 ms de N11, atribuye una línea a otro
  lugar. No se pudo verificar.
- **B8.** En 2.2, Mara anotó la carga de ayer con marcas aunque en el depósito "se ata de a diez"
  (`ch2/scenes.js:322`). Falta una línea ("La Marea me desarmó los atados; lo anoté como pude").
- **B9.** En 2.7, con la opción "dejar los diez", Punto copia "1000" sin que se vea por qué
  (`ch2/scenes.js:1240-1244`) y "Diez no entra en un lugar." es demasiado escueta. Mejor que el estudiante
  escriba "10" en el lugar de ese cuarto y se lea "1000".
- **B10.** El cap. 4 empieza en las Terrazas por corte, sin subida (`ch4/scenes-a.js:41-57`). Un plano de llegada
  ubicaría el lugar.
- **B11.** El cartel de saldo de Curva queda encima del rulo de su cabeza ("±1", `c2-snaps/035, 039`).
- **B12.** La línea sobre Brahmagupta, "y eso no funciona" (`ch4/scenes-b.js:604`), juzga en lugar de
  explicar. Mejor: "…0 ÷ 0 = 0; hoy se sabe que no tiene un resultado".
- **B13.** "Sí, ya sé. El 1. Todavía no lo sé." (`ch2/scenes.js:208`) se entiende como juego, pero en voz alta
  puede sonar a error. Alternativa: "Sí, ya sé: el 1. Todavía no sé qué hace ahí."

## Regresiones respecto de la revisión narrativa del cap. 1

- **N2** (la voz del estudiante se vuelve profesor) reaparece en los pensamientos-veredicto del cap. 4 (M1, A4).
- **N4** (primeros planos en lo emocional): en los caps. 2–4 sólo se aplica en el pozo y en el plano del 14 de
  2.1. Faltan en las primeras cifras de Punto (A8), en la deuda de Curva y en la piedra.
- **N13** (objetivos y figuras al borde): el estudiante queda fuera de cuadro en 2.3 y Mara y el estudiante
  aparecen cortados en el cap. 3 (A8, M8).
- **F13** (rótulos con posición): no se extendió a los caps. 2–3 (M11).

## Qué no pude verificar

- **Audio:** no escuché nada (voz de Punto, tiza, borrador, el `cue('found')`, la brisa).
- **Movimiento real y ritmo:** sólo vi cuadros sueltos y logs de un bot que lee y elige en fracciones de
  segundo. No pude juzgar duraciones de lectura, pausas, actuación ni transiciones.
- **Versión de las capturas:** varias son anteriores al código actual (ver "Alcance"). Las del cap. 4 en
  1600×900 con el plano nuevo de 4.1–4.3 no existen; sólo hay de 844×390.
- **Tacto real, lector de pantalla, movimiento reducido, modo "describir acciones" y texto grande:** sólo leí el
  código de rótulos y `describe`.
- **Bitácora y tarjetas de fin de capítulo en pantalla:** sólo leí el código, no hay capturas.
- **Comprensión de personas:** ninguna de estas observaciones es un playtest. Que algo "se lea mal" o "aburra" es
  una hipótesis a comprobar con jugadores.
