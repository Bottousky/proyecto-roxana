# Revisión matemática independiente: cap. 6 «Lo que no se ve» (rev-mat-5)

- Fecha: 2026-10-06. Commit revisado: `22d9276` (rama `claude/arithmos-graphic-adventure-065e68`).
- Alcance: `experiments/arithmos/src/ch6/{common,scenes-a,scenes-b,chapter}.js`, `src/logic/equations.js`,
  `tests/equations.test.mjs`. Contrato: `docs/arithmos/ARITHMOS_MASTER.md` §5, §6 y §7D. Diseño:
  `docs/arithmos/ARITHMOS_DESIGN.md` (cap. 6). Historia: `docs/arithmos/research/fuentes.md` §10.
- Evidencia usada: `artifacts/arithmos/it06/c6-errores.log`, `c6-directa.log`, sus `state.json` y capturas;
  como apoyo, `artifacts/arithmos/it05/c6-directa.log`, porque registra los toques del bot («toca …»).
- Método: lectura de código y textos; `node --test experiments/arithmos/tests/` (65/65 pasan); un script
  propio en el scratchpad que importa `equations.js` para recalcular rótulos, posiciones de los
  marcadores y caminos posibles. **Sin navegador**: no jugué el capítulo, y las partidas son de un bot,
  no de personas.

## Veredicto corto

El núcleo está bien elegido y casi todo lo escrito es correcto: el ejemplo literal del contrato
(x − 3 = 5 → x − 3 + 3 = 5 + 3 → x = 8), la operación visible en los dos marcadores y en la cuenta, la
simplificación que cambia el rótulo sin mover el marcador, ×0 que aplasta todo en el cero, el −3 que
aparece al elevar al cuadrado, el 0 que se pierde al dividir por x y la «media vuelta» del cap. 4 para
la desigualdad.

Fallan cuatro cosas que el contrato exige con todas las letras:

1. El camino alternativo válido de 2x + 1 = 7 no se puede completar.
2. En dos escenas, el texto describe en la pantalla algo que no está pasando.
3. La frase central de la Bitácora («resolver es buscar dónde coinciden») confunde el valor común de
   los miembros con la solución, dentro de la propia representación.
4. El criterio de validez que se enseña primero es una prueba en un solo punto.

## Cumplimiento del caso obligatorio (§6)

| Exigencia | Escena | Estado |
|---|---|---|
| «Pasa sumando» como transformación de ambos miembros | 6.2 | Cumple; ver A4 y M1 |
| Reconocer qué operación se aplicó y qué se simplificó | 6.2, 6.3 | Cumple. En 6.8 la operación sólo se ve un segundo en los rótulos |
| Por qué se conservan las soluciones | 6.2 (una línea), Bitácora | Correcto pero escaso; nunca se usa para anticipar (M2) |
| Transferencia con estructura diferente | 6.8 | Existe, pero está rota (A1, A2) |
| Detectar una transformación inválida | 6.2 (a un solo miembro), 6.3 (signo equivocado) | Cumple, sólo con la misma estructura (M8) |
| Reconocer caminos válidos alternativos | 6.8 | **No cumple** (A1) |
| Multiplicar por 0 | 6.4 | Cumple; buena imagen |
| Elevar al cuadrado | 6.5 | Correcto; el jugador no verifica la raíz ajena (M4) |
| Dividir por una expresión que puede ser 0 | 6.6 | Correcto; «son dos» sin justificar (M3) |
| Desigualdad por un negativo | 6.7 | La explicación es correcta; el texto puede ser falso (A3); falta el contraste (M5) |
| Factorización y otras transformaciones | — | **No cubierto** (M9) |
| Explicar los límites de la representación | — | **No se explica** (M1, B1) |

---

## ALTA

### A1. 6.8: sólo una secuencia de clics termina; el camino alternativo válido queda sin salida y el diálogo se contradice

- **Dónde:**
  - `src/ch6/scenes-b.js:188-216`: paleta fija de `{−1, ÷2, −7}`, sin deshacer, con un tope de 4 pasos
    y después un rescate.
  - `scenes-b.js:212` («Así no termino nunca. Primero lo que está más afuera…») seguido de
    `scenes-b.js:217` («Dividiendo primero también se llega, con mitades en el camino…»).
  - Evidencia: `it06/c6-errores.log` 44.8–48.3 s y `it06/c6-directa.log` 36.1–38.4 s. Las dos rutas,
    también la «directa», terminan en el rescate. Los caminos registrados en `state.json` son
    `[m7,m7,m7,m7]` y `[m1,m7,m1,m7]`.
- **Qué:** busqué con `equations.js` todos los caminos de hasta 4 pasos. El único que deja la x sola es
  `−1` y después `÷2`.
  - **Dividir primero:** da x + 1/2 = 7/2 y la paleta no ofrece «−1/2». Además, ÷2 otra vez da
    1/2x + 1/4, y no hay ×2 para volver.
  - **Usar −7 una sola vez:** deja la b en −6. Desde ahí, restando y dividiendo, nunca vuelve a 0.
  - **Diálogo con «dividir primero»:** el jugador oye primero que «así no termino nunca» y, en la
    línea siguiente, que «dividiendo primero también se llega». No lo vio pasar.
  - **Pizarra:** el rescate escribe `x = 3` en el renglón 5 (`scenes-b.js:215`, id `d6-t5`) y
    `3 = x ÷ 4` usa el mismo renglón 5 (`scenes-b.js:229`), así que en las dos rutas registradas los
    dos textos se superponen. No hay captura que lo muestre.
- **Por qué importa:** el contrato pide en §6 «Reconocé caminos válidos alternativos; no evalúes
  únicamente una secuencia de clics prevista». La consigna de la escena dice «Cualquier camino que deje
  sola a la x vale» (`:195`), y eso es falso con esta paleta. Además, castiga en silencio un paso válido
  (−7): el jugador lo hace, el juego le dice «Sigue valiendo» y ya no tiene forma de terminar.
- **Cómo comprobar la corrección:**
  - Agregar una prueba que recorra todas las secuencias de la paleta real de la escena (con las
    operaciones inversas y un «deshacer») y exija que, desde cualquier estado alcanzable, se pueda
    llegar a `x = 3`.
  - Partida automática con `d2` primero: tiene que terminar sin el rescate y con la línea de
    `:217` coherente.
  - Captura del pizarrón al final de 6.8, sin superposición.

  El arreglo que más se alinea con el capítulo es un botón «deshacer el último paso» (es la idea misma
  de por qué se conservan las soluciones), más un número elegible, o al menos las inversas (+1, +7,
  ×2, −1/2).

### A2. «3 = x ÷ 4»: el texto dice «Siguen juntos» con los marcadores separados, y un rótulo muestra un decimal redondeado como si fuera exacto

- **Dónde:**
  - `scenes-b.js:219`: Punto queda en el 3 para comprobar 2x + 1 = 7.
  - `:227-247`: la ecuación nueva se dibuja con Punto todavía en el 3.
  - `:240`: «Siguen juntos, pero ahora es x ÷ 16…» y «Siguen juntos, pero la x no se soltó…».
  - `:244-247`: «Doce».
  - `src/logic/equations.js:18-27` (`fmt`).
  - Evidencia: `it06/c6-errores.log` 51.5 s; `state.json` registra `try-x` x = 3 justo antes.
- **Qué:** con x = 3 la ecuación 3 = x/4 da L = 3 y R = 0,75. Los marcadores **nunca** estuvieron juntos
  en esta parte.
  - Después de ÷4: 0,75 frente a 0,1875.
  - Después de +4: 7 frente a 4,75.
  - Después de ×4: 12 frente a 3. El capítulo cierra diciendo «Doce» con los marcadores separados y
    sin la raya amarilla.
  - En la rama ÷4, el rótulo del marcador derecho no dice «x ÷ 16» sino **«0,063x»**. 1/16 no se
    escribe como fracción con denominador ≤ 12, así que `fmt` cae a `toFixed(3)`, y 0,0625 se
    muestra redondeado como si fuera exacto.
  - En la rama +4 el rótulo es «1/4x + 4», que se puede leer como 1/(4x) + 4.
- **Por qué importa:** es una consecuencia falsa en pantalla, en la escena de transferencia. Peor: un
  jugador que aprendió que «coinciden = se cumple» ve que la respuesta final (12) se anuncia mientras la
  representación muestra que con esta x no se cumple. El rótulo 0,063 contradice el criterio «valor
  exacto frente a aproximación» de §7C, que el cap. 5 acaba de trabajar.
- **Cómo comprobar:**
  - Llevar a Punto al 12, o pedirle al jugador que lo encuentre, antes de las operaciones. Con x = 12
    las tres ramas sí siguen juntas: 3/4 = 12/16, 7 = 7, 12 = 12.
  - Que `fmt` escriba n/d para cualquier d, o que el texto venga de la operación (`x ÷ 16`).
  - Prueba unitaria: `divBoth(eq(lin(0,3), lin(1/4,0)), 4).R.text` no debe contener «,».
  - Prueba de escena: cada «Siguen juntos» exige `view.match` en ese momento.

### A3. 6.7: el texto supone que Punto está en el 0, pero está donde lo dejó el jugador; según la posición, la conclusión es falsa

- **Dónde:**
  - `scenes-b.js:136-139`: `placeX` termina cuando el jugador vio un caso que cumple y uno que no, con
    Punto en la última marca tocada.
  - `:155`: «Con Punto en el 0 se sigue cumpliendo. Las mismas x de antes.»
  - `:159`: «Con Punto en el 0: antes se cumplía (0 < 6) y ahora no (0 < −3).»
  - Evidencia: en las dos rutas, `state.json` registra `try-x` −5 y después 2, así que Punto queda en
    el **2**. Aun así, el log muestra «Con Punto en el 0…» (`it06/c6-errores.log` 40.7 s y 42.5 s;
    `c6-directa.log` 32.7 s).
- **Qué:** lo recalculé con la lógica real, según dónde quede Punto:

  | x | −2x < 6 | x < −3 («dejando <») | x > −3 («dando vuelta») |
  |---|---|---|---|
  | −5 | no | **sí** | no |
  | −3 | no | no | no |
  | 0 | sí | no | sí |
  | 2 | sí | no | sí |

  - **Con Punto en el 2** (lo que pasó en las partidas), los números del paréntesis no son los de la
    pantalla: allí se ve −4 < 6 y 2 < −3.
  - **Con Punto en el −5**, con «dejando <» la tilde *aparece* mientras el texto dice que dejó de
    cumplirse; con «dando vuelta» no hay tilde ni antes ni después, y el texto dice «se sigue
    cumpliendo».
  - **Con Punto en el −3**, con «dejando <» no cambia nada en pantalla, pero el texto afirma que
    cambió.
  - Además, «Las mismas x de antes» se concluye de un solo punto.
- **Por qué importa:** el jugador ve una cosa y lee otra justo en el caso que el contrato nombra
  («la puesta en escena no debe ocultar estas diferencias»). Las respuestas equivocadas tienen que
  recibir consecuencias verdaderas.
- **Cómo comprobar:**
  - Llevar a Punto al 0 (`moveX`) antes de elegir la operación, o escribir el texto con `view.x` y los
    valores reales.
  - Mejor todavía, mostrar el conjunto: marcar en la recta todas las marcas enteras que cumplen antes y
    después (el diseño lo prometía: «se ve en la recta»), para que «las mismas x» se vea y no se infiera
    de un punto.
  - Partida automática con la lista `[2, −5]` (Punto termina en −5): el texto tiene que coincidir con la
    tilde.

### A4. «Resolver es buscar dónde coinciden»: en esta representación, el lugar donde coinciden no es la solución

- **Dónde:**
  - `scenes-b.js:288` (resumen de la Bitácora): «resolver es buscar dónde coinciden».
  - `:291`: «… no cambia dónde coinciden».
  - `scenes-a.js:111`: «Cuando los dos marcadores caigan en la misma marca, encontraste lo de la caja».
  - `src/ch6/common.js:125-146`: para «=» la raya se dibuja en el valor común (`:140-144`); para «<»
    la tilde va sobre Punto (`:129-133`).
  - El diseño también usa esa frase (`ARITHMOS_DESIGN.md:224`).
  - Capturas: `it06/c6-errores/010-snap-c6.memoria.png` (raya en el 5, Punto en el 2) y
    `006-snap-c6.dos-lados.png` (raya en el 8).
- **Qué:** en la recta hay tres cosas: Punto (la x) y dos marcadores (los valores de cada miembro).
  - Los marcadores coinciden en el **valor común** de los miembros: en 6.1 es el 5, con la caja en el 8;
    en 6.3 es el 5, con x = 2.
  - Una transformación válida **sí cambia** dónde coinciden: en 6.2, +3 a los dos mueve el encuentro
    del 5 al 8. Lo que no cambia es *con qué x* coinciden.
  - Leída en la propia representación, la oración de la Bitácora es falsa.
  - A eso se suma que la señal de «se cumple» está en lugares distintos según la relación: la raya, en
    el valor común; la tilde, en la x.
- **Por qué importa:** es la definición central del capítulo y confunde dos objetos: el valor de la
  incógnita y el valor de los miembros. §13 pide justamente buscar «confusiones entre objetos y
  notaciones». Un jugador que tome el resumen al pie de la letra contestaría «5» en 6.1.
- **Cómo comprobar:**
  - Reescribir así: «resolver es buscar **para qué x** coinciden» y «no cambia **con qué x**
    coinciden».
  - Marcar siempre la solución sobre Punto (por ejemplo, la tilde también en las ecuaciones), y dejar la
    raya como señal secundaria.
  - Revisión de texto: ninguna línea del capítulo debería usar «dónde coinciden» como sinónimo de
    solución.

---

## MEDIA

### M1. El criterio de validez se enseña como una prueba en un solo punto, y el capítulo nunca lo concilia con ×0 y el cuadrado

- **Dónde:**
  - `scenes-a.js:175`, consigna de 6.2: «mirá si los dos marcadores siguen cayendo juntos con Punto en
    el 8».
  - `:183` y `:193`: el resultado se juzga sólo en x = 8.
  - 6.4 (`:330-340`) y 6.5 (`scenes-b.js:50`).
- **Qué:**
  - «Siguen juntos en el 8» sólo dice que no se perdió el 8. ×0 pasa esa prueba (en el 8 siguen
    juntos) y el cuadrado también (en el 3). El capítulo lo muestra, pero nunca dice que la prueba de
    6.2 no alcanza.
  - Después de la transformación válida, el jugador nunca mueve a Punto para ver que coinciden **sólo**
    en el 8.
  - Con «+3 sólo a la izquierda», la pantalla dice «se separaron», pero no muestra que la nueva cuenta
    tiene otra solución (5). El jugador puede quedarse con «se rompió» en lugar de «cambió la
    solución».
  - Tampoco se declara el límite de la representación: muestra una x por vez y sólo enteros entre −10
    y 12.
- **Por qué importa:** la confusión entre «coinciden con esta x» y «son equivalentes» es el riesgo
  principal de la representación, y la consigna la instala.
- **Cómo comprobar:**
  - Después de +3 a los dos, permitir mover a Punto (o mostrar el rastro de las x probadas) y que el
    estudiante diga: «En el 8 siguen juntos: no se perdió. Para saber que no aparece otra, hace falta
    poder deshacer».
  - Después de «sólo a la izquierda», pedir que encuentre la nueva coincidencia (x = 5).
  - Una línea en 6.4: «En el 8 también seguían juntos. Eso no alcanza».

### M2. La explicación de por qué se conservan las soluciones es correcta pero mínima, mezcla dos condiciones y el jugador nunca la usa

- **Dónde:** `scenes-a.js:220` (la única formulación en escena); Bitácora en `scenes-b.js:291` y `:293`;
  `equations.js:108`. El diseño prometía la conexión «uno a uno» con el cap. 1, que no aparece en
  ningún texto del juego.
- **Qué:**
  - Para no perder ni inventar soluciones, un paso tiene que cumplir dos cosas:
    - **Poder hacerse para toda x.** Así ninguna se pierde: a cosas iguales, la misma operación da
      cosas iguales.
    - **Poder deshacerse.** Así ninguna aparece.
  - La Bitácora mete la división por x bajo «lo que no se deshace», pero ahí la solución no se pierde
    por no poder deshacer: se pierde porque **en x = 0 el paso no se puede hacer**. Para x ≠ 0 dividir
    por x sí se deshace.
  - «Deshacer» se usa en dos sentidos sin distinguirlos:
    - Despejar: «lo que la deshace es multiplicar» (`:240`), «se deshace en el orden contrario»
      (`:295`).
    - Invertir el paso sobre la ecuación (`scenes-a.js:220`).
  - Ninguna escena le pide al jugador que clasifique un paso («¿se puede deshacer? ¿entonces puede
    cambiar las soluciones?») **antes** de ver el resultado. 6.4, 6.5 y 6.6 preguntan después.
- **Por qué importa:** el objetivo del contrato es «entiendo por qué se puede hacer y reconozco cuándo
  no». Hoy el reconocimiento es retrospectivo.
- **Cómo comprobar:**
  - Bitácora con las dos condiciones separadas.
  - Una decisión predictiva, por ejemplo en 6.5 o 6.6: «¿Este paso se puede deshacer para toda x?»,
    elegida antes de mover a Punto, con su consecuencia.

### M3. 6.6: «son dos: el 0 y el 1» se afirma sin justificar que no hay más; falta el camino correcto, y «dividir por cero no da nada» es ambiguo

- **Dónde:** `scenes-b.js:110`, `:112-113`.
- **Qué:**
  - El jugador comprobó el 0; el 1 lo trajo Curva. Que no haya otras soluciones exige separar casos
    («si x ≠ 0, dividir se deshace y queda x = 1; el 0 se mira aparte») o factorizar: x · (x − 1) = 0.
    El capítulo no hace ninguna de las dos cosas.
  - «Dividir por cero no da nada» se puede leer como «da cero» («nada»), que es justo el error clásico.
    La descripción accesible (`:109`) dice bien «no está definido».
- **Cómo comprobar:** que el estudiante haga el caso aparte en una línea, y reemplazar «no da nada» por
  «no está definido: no hay número».

### M4. 6.5: el cuadrado no tiene propósito y la verificación en la cuenta original la dice el estudiante; el jugador no la hace

- **Dónde:** `scenes-b.js:46`, `:67-68`.
- **Qué:**
  - Elevar «porque queda más lindo» es inocuo y correcto.
  - La lección operativa («después de elevar, hay que probar en la cuenta de antes») se enuncia, pero el
    jugador nunca pone a Punto en −3 sobre `x = 3` para verlo fallar.
  - No hay transferencia donde elevar sea un paso útil y la raíz ajena haya que descartarla. El diseño
    del cap. 7 tampoco la tiene: 7.7 va en la dirección contraria.
- **Cómo comprobar:** `view.set(e0)` y que el jugador lleve a Punto al −3 sobre la cuenta original (los
  marcadores se separan). Anotar en el backlog la transferencia pendiente.

### M5. 6.7: «debajo de 6» con un marcador que siempre está físicamente abajo; «izquierda» con dos significados; sin el caso que no da vuelta

- **Dónde:**
  - `scenes-b.js:133`: «tiene que quedar debajo de 6».
  - `common.js:15`: `MK.L` siempre más bajo que `MK.R`.
  - `scenes-a.js:139` y `:182`: «+3 sólo a la izquierda», «el marcador de la izquierda se corre» (en
    la captura `004-snap`, ese marcador queda a la **derecha** del otro).
  - `scenes-b.js:137` y `:164`: «a la izquierda del 6», «lo que estaba a la izquierda queda a la
    derecha».
- **Qué:**
  - «Debajo» es literalmente siempre cierto para el marcador de −2x.
  - «Izquierda» nombra a veces el primer miembro y a veces el orden en la recta, y la explicación de la
    desigualdad depende del segundo sentido.
  - Sólo se muestra dividir por un negativo. Sin el contraste (÷2 en 2x < 6 no da vuelta; sumar 2x a
    los dos lados de −2x < 6 da −3 < x sin dar vuelta nada), queda abierta la regla falsa «si hay un
    negativo, se da vuelta». Ese segundo camino sirve además como alternativa válida para la
    desigualdad.
- **Cómo comprobar:**
  - Usar «menor que 6» / «a la izquierda del 6 en la recta», y «primer y segundo miembro» (o «el de
    abajo / el de arriba»).
  - Agregar el ítem de contraste, con su consecuencia en la recta.

### M6. 6.3: la línea equivocada de Recta queda en la pizarra, sin tachar, dentro de la cadena

- **Dónde:** `scenes-a.js:255-258` y `:286-287`; captura `it06/c6-errores/010-snap-c6.memoria.png`.
- **Qué:** la pizarra dice `x + 3 = 5 / x = 5 + 3 = 8 / x + 3 − 3 = 5 − 3 / x = 2`. Leída como
  derivación, la tercera línea parece salir de la segunda y el resultado contradice a la segunda.
- **Cómo comprobar:** tachar la segunda línea o borrarla con la Marea, y escribir la corrección colgando
  de la primera. Verificarlo en captura.

### M7. La Bitácora atribuye de más y generaliza mal

- **Dónde:** `scenes-b.js:284` y `:295`, más `:274`, `:275` y `:279`. Evidencia en el `journal` de
  `it06/c6-errores/state.json`.
- **Qué:**
  - «En 2 · x + 1 = 7 tu camino fue: restar 7, restar 7, restar 7, restar 7. x = 3.» El jugador no
    llegó a x = 3 por ese camino: lo escribió el rescate.
  - «Cualquier camino válido llega» es falso, y el propio capítulo lo muestra («sigue valiendo, pero no
    ayudó»). Lo verdadero es: «todo camino válido que deja sola a la x da el mismo número».
  - Menores:
    - «Comprobaste…», cuando el jugador eligió «Creerle» y la escena lo obligó a comprobar.
    - «Pensaste que era mudar el número **o** una regla…» junta dos respuestas distintas.
    - «Anticipaste… dos soluciones: 3 y −3», cuando anticipó la cantidad, no cuáles.
- **Cómo comprobar:** distinguir en `seen` si se llegó con el camino propio o con ayuda; corregir la
  oración general; prueba con el `state.json` de la ruta con errores.

### M8. La transferencia (6.8) no ofrece ningún paso inválido

- **Dónde:** `scenes-b.js:188-192` y `:230-234`. Todas las opciones son equivalencias; `two-step.keeps`
  siempre es `true`.
- **Qué:** la detección de pasos inválidos sólo ocurre con la misma estructura (6.2 y 6.3). Falta el
  error típico de la estructura nueva: dividir sólo el 2x (x + 1 = 7/2) o «pasar dividiendo» el 2
  dejando el +1.
- **Cómo comprobar:** agregar una opción inválida con su consecuencia en los marcadores.

### M9. Cobertura: lo que el contrato o el backlog piden y el capítulo no tiene

- **Dónde:** contrato §6 (factorización) y §7D; `ARITHMOS_BACKLOG.json` C6, cuyo título incluye
  «sistemas»; `ARITHMOS_DESIGN.md`, tabla de recorrido.
- **Qué falta:**
  - Sistemas.
  - Patrón y generalización.
  - Variable frente a incógnita frente a parámetro.
  - «Identidad» nombrada como tal: x − 3 + 3 = x y 0 = 0 aparecen, pero no se dicen.
  - Conjunto solución de una desigualdad.
  - Factorizar como transformación (y el producto que da cero).
  - El §5 por concepto en `ARITHMOS_CURRICULUM.md` para D (sólo figura «D1–D6 … pendiente»).
- **Por qué importa:** el backlog marca C6 «implementado» con un título que promete sistemas.
- **Cómo comprobar:** separar en el backlog lo cubierto de lo pendiente (o crear C6b) y escribir la
  ficha §5 de D4–D5.

### M10. El gancho «x · x = 2» descansa en una afirmación no justificada y literalmente engañosa

- **Dónde:** `scenes-b.js:251` y `:260`.
- **Qué:**
  - Que el cuadrado construido sobre la diagonal de la huerta tenga el área de dos huertas es
    verdadero, pero sólo se afirma de oídas («Dice que»).
  - «Ocupa justo dos cuadrados de la huerta» sugiere que cubre dos cuadrados. En realidad, inclinado,
    cubre la mitad de cuatro.
  - Ni el cap. 5 (que sólo midió ≈ 1,414) ni el borrador del cap. 7 (no menciona la diagonal) lo
    justifican.
  - «Un número que por sí mismo da 2» puede leerse como «que es 2».
- **Cómo comprobar:**
  - Dibujar la construcción del *Menón*: cuatro huertas en un cuadrado de 2 × 2 y sus diagonales, que
    forman un cuadrado de cuatro medias huertas = 2. Es una prueba de verdad para este caso, barata en
    tiza.
  - Si se deja para el cap. 8, decirlo y anotarlo en el backlog.
  - Texto: «un número que, multiplicado por sí mismo, da 2».

### M11. La evidencia «directa» del bot no recorre el camino previsto de 6.8, y el registro muestra un toque que el juego no ejecutó

- **Dónde:**
  - `it05/c6-directa.log:71-76`: «toca op-m1» cuatro veces, pero el juego escribe dos veces «Sigue
    valiendo…», que sólo sale con m7.
  - `it06/c6-directa/state.json`: camino `[m1,m7,m1,m7]`.
  - `scripts/playthrough.mjs:489`: el orden de la ruta directa pone `op-m1` antes que `op-d2` y m1
    siempre está disponible, así que nunca elegiría ÷2.
- **Qué:**
  - Ninguna evidencia por interfaz muestra que el camino canónico −1 → ÷2 funcione.
  - El desajuste entre el toque y la operación ejecutada probablemente sea del bot: los botones nuevos
    se crean sin posición hasta el siguiente cuadro (`engine/ui.js:388-425`, se posicionan en
    `main.js:135`) y un clic con `force` cae en el de arriba. No lo pude reproducir.
- **Cómo comprobar:**
  - Ruta directa que elija `op-d2` después de m1, con traza «toca …» y la operación registrada.
  - Verificar que el id tocado coincida con `two-step.op`.
  - Ocultar los botones de texto hasta su primer posicionamiento.

---

## BAJA

- **B1.** `common.js:99,118`: los marcadores fuera de la recta se recortan a 12,6 sin aviso. En 6.5, x · x
  con |x| ≥ 4 parece valer unos 12,6; en 6.7, −2x con x = −10. Agregar una flecha o el valor cuando
  queda fuera de escala.
- **B2.** Notación con fracciones: «1/4x + 4» y «1/2x + 1/4» (`equations.js:12`) son ambiguas; mejor
  «x/4 + 4» o «(1/4)·x».
- **B3.** `tests/equations.test.mjs:48`: el nombre de la prueba («x² = x ÷ x pierde el 0») describe otra
  ecuación (x² = x/x, cuyas soluciones son ±1). Lo que se prueba es x² = x dividida por x.
- **B4.** La evidencia `try-x` registra `match` también en la desigualdad (`scenes-a.js:61`): x = 2 queda
  «match: false» aunque −4 < 6 se cumple. Registrar `holds`.
- **B5.** La Bitácora escribe «2 · x + 1 = 7» y «−2 · x < 6», y la pizarra «2x + 1 = 7» y «−2x < 6».
  Unificar.
- **B6.** 6.4: la opción «Multiplicar por cero no cambia nada» recibe la misma réplica que la correcta
  (`scenes-a.js:347`). Darle su propia consecuencia: «Cambió todo: antes servía sólo el 8».
- **B7.** Los distractores se descartan sin pensar («Una regla que no hay que entender», «Creerle», «Hacerla
  de memoria otra vez»). Así esas elecciones no sirven como evidencia de comprensión.
- **B8.** Dato histórico (`scenes-b.js:296`): fiel en sustancia a `fuentes.md` §10, pero la fuente dice
  «pasándolo al otro miembro» y el juego, «sumándolo en los dos miembros». Es una lectura moderna
  razonable, pero la fuente no la respalda textualmente. Sugiero:
  - Citar una traducción primaria (Rosen, 1831) para esa lectura.
  - Agregar «en palabras, sin símbolos» (la fuente lo registra), para no sugerir que escribía como
    nosotros.

  Fecha y lugar («Bagdad, hacia 820») y la etimología de «álgebra» están bien.
- **B9.** «La caja de Oval tenía 3» (`scenes-b.js:67`): Oval nunca habló de una caja.
- **B10.** En las capturas de inicio de escena aparece la última línea de la escena anterior sobre la
  pizarra nueva. Por ejemplo, `it06/c6-errores/018-c6.al-reves-inicio.png` muestra «O sea que son dos:
  el 0 y el 1.» sobre −2x < 6 con la tilde en el 0. No sé si un jugador lo ve (puede ser el momento de
  la captura).
- **B11.** 6.2 nunca escribe la forma abreviada «x = 5 + 3», que es lo que produce «pasa sumando». Ponerla
  junto a «x − 3 + 3 = 5 + 3» cerraría el vínculo atajo ↔ transformación sin depender de la respuesta
  «move».
- **B12.** `equations.js:37` y `common.js:87` usan tolerancias distintas (1e-12 y 1e-9) para la misma
  relación. Hoy no cambia nada.

## Lo que está bien (para no perderlo al corregir)

- La transformación mueve los dos marcadores y la simplificación cambia el rótulo sin moverlos
  (`scenes-a.js:190` y `:202`). Distingue con claridad «transformar» de «simplificar».
- ×0 se ve como lo que es: todo cae en el 0 para cualquier x (captura `012-c6.por-cero-eleccion.png`).
- Al dividir por x los marcadores desaparecen en x = 0, y la descripción dice «no está definido».
- −3 aparece por exploración, no por anuncio. La explicación («−3 y 3 caen en el mismo 9») es la
  correcta: el cuadrado no es uno a uno.
- La «media vuelta» para la desigualdad es coherente con el cap. 4 (`ch4/scenes-b.js:613`).
- Con «dejando <» y con «dando vuelta» los marcadores quedan en el mismo lugar y sólo cambia la
  relación. Es una buena oportunidad para señalar que los marcadores **se cruzaron**.
- Todas las igualdades escritas en la pizarra son correctas; las 65 pruebas pasan.

## Qué no pude verificar

- **El juego en un navegador.** Por la restricción del entorno no lo abrí. Todo lo de pantalla sale del
  código, de los logs y de las capturas del bot.
- **Momentos sin captura:**
  - La paleta y las consecuencias de 6.7.
  - Los pasos de 6.8 y la rama 3 = x ÷ 4: la superposición del renglón 5 y el rótulo «0,063x» están
    calculados, no vistos.
  - Los marcadores desapareciendo en 6.6.
- **La causa del toque m1 → m7** del bot (M11).
- **Si la línea de la escena anterior** queda visible para un jugador humano (B10).
- **El dato de al-Khwārizmī** sólo lo contrasté con `fuentes.md` (MacTutor), no con una traducción
  primaria.
- **Audio, teclado, entrada táctil y 844×390.** No se evaluaron para este capítulo.
- **Comprensión humana.** No hay playtests. Nada de esto certifica que alguien entienda.
- **Gancho del cap. 7.** El cap. 7 está en borrador. No revisé si retoma la justificación del gancho
  más allá de buscar «diagonal» (sin resultados).
