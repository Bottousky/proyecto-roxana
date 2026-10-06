# Revisión matemática independiente: cap. 7 «Crecer» (rev-mat-6)

- Fecha: 2026-10-06. Commit revisado: `b5ed429` (rama `claude/arithmos-graphic-adventure-065e68`).
- Alcance: `experiments/arithmos/src/ch7/{common,scenes-a,scenes-b,chapter}.js`, `src/logic/growth.js`,
  `tests/growth.test.mjs`. Gancho de entrada: `src/ch6/scenes-b.js` (final de `dosPasos`). Contrato:
  `docs/arithmos/ARITHMOS_MASTER.md` §5, §6, §7 (E) y §13. Diseño: `docs/arithmos/ARITHMOS_DESIGN.md`
  (cap. 7 y «Criterios de escena»).
- Números de línea: son los de `b5ed429`. En el árbol de trabajo hay cambios sin commit en
  `ch7/scenes-a.js` y `ch7/scenes-b.js` (encuadres y posición de botones; desplazan 1 o 2 líneas). Revisé
  el diff: no cambia ningún texto ni cuenta.
- Evidencia usada:
  - `artifacts/arithmos/it07/c6c7-directa/{log.txt,state.json,*.png}`: ruta directa, caps. 6 y 7.
  - `artifacts/arithmos/it07/c7-errores/{log.txt,state.json,*.png}`: ruta con errores del cap. 7. Ya
    había terminado cuando la revisé.
  - `artifacts/arithmos/it07/c7b-directa2/`: es de una versión anterior del texto (en 7.9 dice «no da
    nada», que el código actual ya no dice). La usé sólo como apoyo.
- Método:
  - Lectura de código, textos y Bitácora, rama por rama.
  - `node --test experiments/arithmos/tests/`: 73/73 pasan.
  - Un script propio en el scratchpad que importa `growth.js` y recalcula cada igualdad de la pizarra,
    las barras de 7.2, la escala de las fichas, los contraejemplos y las factorizaciones.
  - Recortes de capturas con `sips`.
  - **Sin navegador.** Las partidas son de un bot, no de personas.

## Veredicto corto

Todas las igualdades que quedan escritas en la pizarra son verdaderas:

- √9 = 3, √2 · √2 = 2 y √2 ≈ 1,414.
- 2⁴ = 16 y la tabla hasta 2⁻¹ = 1/2.
- 3 · 10⁶ > 4 · 10⁵ y 0,001 = 1 · 10⁻³.
- (x + 2)(x + 3) = x² + 5x + 6.
- x² + 2x + 1 = 8 + 1, (x + 1)² = 9, x = 2 o x = −4.
- 2⁹ = 512 < 1000 < 1024 = 2¹⁰ y log₂ 1000 ≈ 9,97.
- x ≠ 2.

La construcción de 7.1 (dos cuadros cortados por la diagonal que forman un cuadrado de área 2) resuelve
bien el pendiente M10 de rev-mat-5.

Fallan tres cosas que el contrato exige con todas las letras (§7E, §13 y el criterio de escena 8):

1. **El logaritmo queda mal definido.** Se presenta como «¿cuántas veces para llegar a mil?», se cuenta
   10 y se escribe 9,97. El juego nunca dice qué significa «9,97 veces».
2. **El gráfico de barras de 7.2 se recorta en 130 sin avisar.** Justo cuando duplicar se dispara, las
   barras muestran que la distancia se achica.
3. **En 7.7 la ficha x mide ≈ 3 cuadraditos.** La pizarra dibuja una huerta de ≈ 15,5 cuadraditos y un
   cuadrado de lado ≈ 4, mientras el texto dice 8, 9 y lado 3.

Hay además varias reglas enunciadas sin su condición (notación científica, «no se arma», «x ≠ 2» contra
«más de dos») y una cobertura de E bastante más angosta que lo que declara el backlog.

## Cumplimiento por escena (diseño del cap. 7 y contrato E)

| Escena | Idea del diseño | Estado |
|---|---|---|
| 7.1 | Raíz como pregunta inversa; √2 | Correcto y bien construido; el lenguaje vuelve a fallar (M1) |
| 7.2 | Crecimiento aditivo contra multiplicativo | La tabla está bien; el gráfico la contradice (A2) |
| 7.3 | Exponente 0 y negativo por patrón | Correcto; los errores no tienen consecuencia visible y falta 2⁻¹ = −2 (M2) |
| 7.4 | Notación científica | Correcto para este número; la regla no tiene condición (M3) |
| 7.5 | Polinomios como áreas | Correcto; x como incógnita en una identidad (M4); escala (A3) |
| 7.6 | Factorizar como armar un rectángulo | Correcto con enteros; definición por el modelo (M5) |
| 7.7 | Completar el cuadrado | Cuentas correctas; el dibujo las contradice (A3); −4 por analogía (M6); sin transferencia (M7) |
| 7.8 | Logaritmo como pregunta inversa | **Definición ambigua** (A1) |
| 7.9 | Restricciones | Correcto; x = 0 no se puede probar; dominio de la cuenta contra el del reparto (M8) |
| Límites que el diseño promete declarar | √ positiva; exponentes fraccionarios y otras bases «sólo mencionados»; √2 no fracción en cap. 8 | Sólo el primero (M11) |
| E: sucesiones, propiedades de potencias, cuadráticas, expresiones racionales | — | Mínimo o ausente (M11) |

---

## ALTA

### A1. 7.8 y Bitácora: el logaritmo se define como «¿cuántas veces para llegar a mil?», se cuenta 10 y se escribe 9,97

- **Dónde:**
  - `src/ch7/scenes-b.js:518`: «Esto es al revés: ¿cuántas veces, para llegar a mil? Esa pregunta
    tiene nombre: logaritmo.»
  - `:519`: pizarra `log₂ 1000 ≈ 9,97`.
  - `:520`: Mara dice «Casi diez: nueve duplicaciones no alcanzan y diez se pasan un poco».
  - `:646`: la Bitácora dice «¿Cuántas veces hay que duplicar para pasar mil? Diez (2¹⁰ = 1024): es la
    pregunta al revés de la potencia, el logaritmo (log₂ 1000 ≈ 9,97).»
  - `src/logic/growth.js:66-70`: `timesToReach` devuelve a la vez `k = 10` y `log = 9,97`.
  - Evidencia: `c6c7-directa/log.txt` 110,1–111,3 s; `state.json`: `log {k: 10, log: 9.966}`. Ninguna
    captura muestra el renglón `log₂` en la pizarra.
- **Qué:**
  - **Pasar contra llegar.** Lo que el jugador cuenta son duplicaciones enteras. Con duplicaciones
    enteras **ninguna** llega justo a mil. La respuesta a la pregunta que se jugó («¿cuántos días hasta
    pasar los mil?», `:474` y `:479`) es 10, que no es log₂ 1000 sino el primer entero mayor o igual.
  - **«9,97 veces» no tiene sentido en el capítulo.** El único significado que el capítulo le dio al
    exponente es contar cuántas veces se multiplica (`:139`). Los exponentes no enteros nunca se
    presentan: ni siquiera se mencionan, aunque el diseño promete hacerlo. El 9,97 aparece sin un
    procedimiento que el jugador pueda seguir o comprobar.
  - **La Bitácora se contradice.** La oración dice que «Diez» es el logaritmo y entre paréntesis da 9,97.
    Un lector puede concluir que log₂ 1000 = 10, o que el logaritmo es «cuántas veces para pasar».
- **Por qué importa:** el contrato pide los «logaritmos como respuesta a una pregunta inversa» (§7E), y
  esa pregunta inversa tiene que estar bien formulada: ¿a qué exponente hay que elevar 2 para obtener
  **exactamente** 1000? Mezclar «la cantidad entera de pasos para superar» con «el exponente exacto» es
  una confusión de objetos (§13). Además, la pizarra afirma un valor que el jugador no tiene con qué
  entender (criterio 11: «la evidencia no puede probar más de lo que muestra»).
- **Cómo comprobar la corrección:**
  - Texto: «Con duplicaciones enteras ninguna da justo mil: con 9 no alcanza, con 10 se pasa. El
    exponente que da justo 1000 se llama log₂ 1000: está entre 9 y 10 (≈ 9,97).» La Bitácora tiene que
    separar «10 duplicaciones para pasar mil» de «log₂ 1000 ≈ 9,97».
  - Darle sentido al exponente no entero con lo que el capítulo ya tiene. 7.1 mostró que √2 · √2 = 2:
    dos «medias duplicaciones» hacen una, así que 2^(1/2) = √2 y log₂ √2 = 1/2. Es un logaritmo que el
    jugador puede verificar, y cumple el «sólo mencionados» del diseño. Con el mismo recurso, una
    predicción comprobable: 2^9,5 = 512 · √2 ≈ 724 < 1000, así que log₂ 1000 está más cerca de 10 que de
    9.
  - Revisión de texto: ninguna línea iguala «cuántas veces para pasar» con el logaritmo. En
    `timesToReach`, renombrar `k` (por ejemplo, `passes`) para que el código tampoco los confunda.

### A2. 7.2: las barras se recortan en 130 sin aviso; desde el día 8 el gráfico muestra la distancia achicándose

- **Dónde:**
  - `src/ch7/scenes-a.js:208`: escala.
  - `:214-219`: `setBars`, con `Math.min(130, …)` en `:216`.
  - Capturas: `c6c7-directa/037-snap-c7.duplicar.png` y `038-…`, y `c7-errores/008` y `009`. En el día
    10 la tabla dice 1024 contra 101 y las barras miden ≈ 130 contra 101.
- **Qué:** recalculado con la lógica real:

  | Día | Tabla (Punto / Mara) | Razón real | Barras | Razón dibujada |
  |---|---|---|---|---|
  | 7 | 128 / 71 | 1,80 | 128 / 71 | 1,80 |
  | 8 | 256 / 81 | 3,16 | 130 / 81 | 1,60 |
  | 9 | 512 / 91 | 5,63 | 130 / 91 | 1,43 |
  | 10 | 1024 / 101 | 10,14 | 130 / 101 | 1,29 |

  Desde el día 8 la barra de Punto deja de crecer. No hay corte dibujado, flecha ni cifra que avise. Las
  dos rutas del bot llegaron hasta el día 10, y la pista de la escena invita a hacerlo («Tocá "otro día"
  y mirá las dos columnas»).
- **Por qué importa:** la idea de la escena es que multiplicar crece distinto que sumar, y el gráfico
  contradice a la tabla en el momento exacto en que eso se ve. El contrato pide diferenciar «un gráfico
  de un dibujo decorativo» (§7G) y la «lectura crítica de gráficos» (§7I); el criterio de escena 8 pide
  escalas fieles. Un estudiante que confíe en el dibujo aprende lo contrario.
- **Cómo comprobar:** cualquiera de estas tres salidas, verificada con una captura del último día:
  - Cortar la carrera cuando Punto pasa los cien (día 7), que es la pregunta que se hizo.
  - Reescalar las barras cuando una se pasa: la línea de 100 baja, y eso mismo muestra la explosión.
  - Si se recorta, dibujar un corte con la cifra.

  La altura de cada barra tiene que ser proporcional a su valor, o el recorte tiene que estar marcado.
  Una prueba simple: extraer el cálculo de alturas a una función y exigir proporcionalidad o una marca
  de recorte.

### A3. 7.7 (y 7.5): la ficha x mide ≈ 3,07 cuadraditos, así que la pizarra contradice «ocho», «nueve» y «lado 3»

- **Dónde:**
  - `src/ch7/common.js:21-22`: `T = {X: 92, U: 30}`, es decir, x ≈ 3,07 unidades. El comentario dice
    «no es un múltiplo justo», pero a la vista es casi 3.
  - `scenes-b.js:404`: «En total, ocho cuadraditos de tierra».
  - `:406-409`: las fichas.
  - `:447`: «un cuadrado de nueve tiene lado 3».
  - Capturas: `c6c7-directa/061-snap-c7.completar.png` y `c7-errores/037-…`. Recorté la 061: el lado de
    x² mide unas 3 veces el cuadradito de la esquina, y el cuadrado completo, unas 4.
- **Qué:**
  - Con las medidas dibujadas, la L tiene un área de 3,07² + 2 · 3,07 ≈ 15,5 cuadraditos, y el texto
    dice 8.
  - Al poner la esquina, el cuadrado dibujado tiene lado ≈ 4,07 (≈ 16,5 cuadraditos). Mientras tanto, el
    estudiante dice «un cuadrado de nueve tiene lado 3» y concluye x = 2.
  - El cuadradito de la esquina está ahí mismo y sirve de regla: quien cuente a lo largo del lado obtiene
    4, no 3.
  - En ningún momento se dice que la ficha x no está a escala.
  - En 7.5 la misma ficha (≈ 3) coincide con el lado 3 que Peldaño acaba de calcular en 7.1, y sugiere
    x = 3 (ver M4).
- **Por qué importa:** en esta representación, el argumento es contar el área. Si el dibujo tiene otra
  área, la metáfora «inventa» una propiedad (§2: una metáfora visual debe aclarar una propiedad sin
  inventar otras). Además rompe el criterio 8 («si dos cosas valen lo mismo, miden lo mismo»). La
  convención de las fichas algebraicas, con un x de largo arbitrario, vale mientras x es desconocido o
  general. En 7.7 x queda **determinado**, y el dibujo lo desmiente.
- **Cómo comprobar:**
  - Antes de resolver, una línea que lo diga: «la tira x la dibujo de un largo cualquiera: todavía no sé
    cuánto mide». Vale también para 7.5.
  - Después de encontrar x = 2, animar las fichas a x = 2 (`T.X = 2 · T.U`). La L pasa a tener
    4 + 2 + 2 = 8 cuadraditos y el cuadrado, 3 × 3 = 9, y el jugador puede contarlos. Es una
    verificación con consecuencia perceptible, que hoy no existe.
  - Captura antes y después, y comprobar que el ancho de la ficha x sobre el del cuadradito valga 2.

---

## MEDIA

### M1. 7.1: «por sí mismo, da dos» vuelve a la ambigüedad que se corrigió en el cap. 6, y el área 2 nunca se dice

- **Dónde:**
  - `scenes-a.js:157`: «Punto: el lado de esta huerta, por sí mismo, da dos».
  - En cambio, `ch6/scenes-b.js:334` ya dice «Un número que, multiplicado por sí mismo, da 2» (corrección
    de rev-mat-5 M10).
  - `scenes-a.js:147`: el área sólo aparece implícita, en la descripción accesible.
- **Qué:**
  - «Por sí mismo da dos» se lee como «es dos», y aparece en la línea que define √2.
  - La razón de que el lado al cuadrado sea 2 nunca se dice en voz alta: el cuadrado grande son los dos
    cuadros cortados, cuatro medios cuadros. La consecuencia se ve, pero la justificación queda tácita.
  - Además, el cuadro de huerta mide 40 px en la primera parte de la escena y 104 px en la segunda
    (`:55` y `:35`) (ver B11).
- **Por qué importa:** es la definición de √2 del capítulo (§13, objetos y notaciones).
- **Cómo comprobar:** «el lado de esta huerta, multiplicado por sí mismo, da dos: la huerta son los dos
  cuadros, cortados en cuatro mitades». Revisar en el texto que «por sí mismo» siempre vaya con
  «multiplicado».

### M2. 7.3: 2⁰ y 2⁻¹ se justifican por el patrón, pero los errores sólo reciben una frase y falta el error típico de 2⁻¹

- **Dónde:**
  - `scenes-b.js:88`: «Se cuentan los dos que se multiplican».
  - `:115-119`: la elección para 2⁰.
  - `:134`: la respuesta, «Si no, la tabla se corta».
  - `:136-138`: 2⁻¹ lo escribe el estudiante, sin decisión del jugador.
  - `:139`: «el exponente cuenta cuántas veces se multiplica por dos».
- **Qué:**
  - **La definición hace coherente el distractor.** Si 2⁴ es «contar los dos», el distractor «2⁰ = 0: no
    queda ningún dos» es la consecuencia natural. Pasa lo mismo con «el exponente cuenta cuántas veces
    se multiplica por dos» si no se dice **desde qué**: 2⁴ = 1 · 2 · 2 · 2 · 2, y con cero factores
    queda el 1.
  - **No se dice que 2⁰ = 1 es una decisión.** Se elige así para que la tabla siga; no sale de contar
    factores.
  - **Los errores sólo reciben una frase.** «Si no, la tabla se corta» no muestra nada. Por ejemplo,
    con 2⁰ = 0, subir multiplicando por 2 da 0, 0, 0 y nunca 2, 4, 8.
  - **2⁻¹ no tiene decisión ni distractor.** El error típico (2⁻¹ = −2, «exponente negativo, número
    negativo») no se ofrece, y hay un solo renglón negativo. Con 2⁻² = 1/4 se vería 2⁻ⁿ = 1/2ⁿ.
- **Por qué importa:** §5 pide distinguir la interpretación errónea de la comprensión genuina; §8 pide
  equivocarse con consecuencias comprensibles; el diseño dice «patrón, no regla».
- **Cómo comprobar:**
  - Definición «empezando en 1».
  - Con 2⁰ = 0 o 2⁰ = 2, escribir el valor elegido y mostrar dónde se rompe el «× 2» hacia arriba.
  - Una elección para 2⁻¹ con −2 como distractor y su consecuencia: −2 · 2 = −4, no 1.
  - Un renglón 2⁻² = 1/4.
  - En la Bitácora: «2⁰ = 1 se elige así para que la tabla siga».

  Límite a declarar: con base 0 la tabla no se puede bajar (habría que dividir por 0), y eso conecta
  con 7.9 (ver B12).

### M3. 7.4: la regla para comparar no tiene condición, y la interacción enseña a contar ceros en vez de lugares

- **Dónde:**
  - `scenes-b.js:184`: la pista, «Tocá cada cero que hay detrás del 3».
  - `:234`: «El exponente … pesa más que el 3 o el 4» y «Primero se mira el exponente».
  - `:644`: la Bitácora, «se escriben corriendo lugares».
  - `growth.js:40`: la condición 1 ≤ m < 10 aparece sólo en un comentario del código.
- **Qué:**
  - «Primero se mira el exponente» sólo vale si los dos números están escritos con un único dígito
    distinto de cero antes de la coma (1 ≤ m < 10), y son positivos.
  - Contraejemplos sin normalizar: 0,5 · 10⁶ = 500 000 < 9 · 10⁵; 30 · 10⁵ = 3 000 000.
  - La condición no aparece en ningún texto.
  - «Contar los ceros detrás del 3» coincide con «contar lugares» sólo cuando la mantisa tiene una cifra
    seguida de ceros. 3 040 000 tiene 5 ceros y es 3,04 · 10⁶; el 1024 de 7.8 tiene un cero y es
    1,024 · 10³.
  - No hay ningún caso con una mantisa de más de una cifra.
- **Por qué importa:** es una regla enunciada sin su condición, que generaliza mal (§13). Tampoco hay
  transferencia a una estructura distinta (§5).
- **Cómo comprobar:**
  - Enunciar la condición en la escena y en la Bitácora.
  - Agregar un caso con una mantisa de más de una cifra, donde contar ceros falla. Por ejemplo,
    2 500 000 = 2,5 · 10⁶, o el 1024 del 7.8.
  - Opcional: que Cornisa anote 40 · 10⁵ y el jugador vea que la regla falla hasta normalizar.

### M4. 7.5: una identidad presentada como incógnita («el lado de antes no lo sé»), que además contradice 7.1

- **Dónde:**
  - `scenes-b.js:261`: «El lado de antes no lo sé: le digo x».
  - `scenes-a.js:82`: en 7.1, Peldaño calculó lado 3 (y después √2).
  - `common.js:22`: la ficha mide ≈ 3.
  - `scenes-b.js:311-312` y Bitácora `:645`.
- **Qué:**
  - **Contradice 7.1.** Peldaño conoce los lados de sus huertas, y la ficha x dibujada mide casi 3
    (criterio 5: «toda cantidad tiene origen en la historia y coincide entre escenas»).
  - **Es una identidad, no una ecuación.** (x + 2)(x + 3) = x² + 5x + 6 vale para **todo** x. Presentar
    x como «un lado que no sé» convierte una variable en una incógnita, sin decir nunca que la igualdad
    vale para cualquier lado. El contrato pide distinguir incógnita, variable y parámetro (§7D), y
    rev-mat-5 M9 ya lo dejaba pendiente.
  - **Límite sin declarar.** El modelo representa sólo x > 0 y términos positivos, pero la identidad vale
    también donde no hay huerta (x negativo).
- **Por qué importa:** confusión entre objetos (§13). Es el primer uso de x como variable en el juego.
- **Cómo comprobar:**
  - Que Peldaño diga, por ejemplo: «tengo huertas de varios tamaños: quiero una cuenta que sirva para
    todas».
  - Después de armar, comprobar con x = 3 (5 · 6 = 30 = 9 + 15 + 6) y con otro valor.
  - En la Bitácora: «vale para cualquier x: es una identidad».
  - Declarar que las fichas sólo muestran x positivos.

### M5. 7.6: «ese rectángulo no se arma» y «factorizar es armar el rectángulo con las fichas» definen por el modelo

- **Dónde:**
  - `scenes-b.js:382`: «Con enteros, ninguno: ese rectángulo no se arma».
  - `:645`: «Factorizar es armar el rectángulo con las fichas».
  - `growth.js:51-55`: `factor` busca sólo enteros no negativos.
  - Diseño 7.6: «con x² + 5x + 5 no cierra».
- **Qué:**
  - **Factoriza con reales.** x² + 5x + 5 no factoriza con enteros (verifiqué también los negativos),
    pero sí con reales: (x + (5 − √5)/2)(x + (5 + √5)/2) ≈ (x + 1,382)(x + 3,618). El capítulo acaba de
    presentar √2 como un lado legítimo. El rectángulo sólo «no se arma» con fichas enteras, y la
    Bitácora define factorizar por las fichas: un estudiante concluye que x² + 5x + 5 «no se puede
    factorizar».
  - **La enumeración está incompleta.** Lista 1 + 4 y 2 + 3, pero no 0 + 5: x(x + 5), con producto 0.
  - **Límite sin declarar.** La regla «suman 5, multiplicados dan 6» sólo vale cuando x² tiene
    coeficiente 1.
  - **Falta el uso que pide el contrato.** Factorizar nunca se usa para resolver: el producto que da cero
    (§6, «Extendé el criterio a … factorización»; pendiente de rev-mat-5 M9).
  - **El jugador no arma nada.** Elige uno de tres pares de lados y las fichas se acomodan solas (ver
    B14).
- **Por qué importa:** es una definición atada a la representación, con un límite sin declarar (§6, §13).
- **Cómo comprobar:**
  - En la Bitácora: «Factorizar es escribir como producto. Con fichas enteras se ven sólo los factores
    con números enteros».
  - En la escena: «con fichas enteras no se arma; con lados no enteros sí, y se encuentran completando el
    cuadrado», con un enlace explícito a 7.7.
  - Incluir el 0 + 5.
  - Una línea que use la factorización para resolver: x² + 5x + 6 = 0 ⇔ (x + 2)(x + 3) = 0 ⇔ x = −2 o
    x = −3. O dejarlo anotado como pendiente.

### M6. 7.7: el −4 se legitima por analogía con un caso en que el −3 sobraba, y no se comprueba en la cuenta original

- **Dónde:**
  - `scenes-b.js:448`: Mara dice «Como en la cuenta de Oval: x · x = 9 también daba con −3».
  - `:449`: «La huerta no…».
  - `ch6/scenes-b.js:71-73`: en 6.5, el −3 «lo trajo el cuadrado» y era un «invitado de más».
- **Qué:**
  - **En el cap. 6 el −3 era una solución ajena.** La había metido el cuadrado y no cumplía x = 3.
  - **Acá el −4 es una solución genuina** de x² + 2x = 8, porque (x + 1)² = 9 ⇔ x + 1 = ±3 es una
    equivalencia.
  - **Hay una tercera cosa.** «La huerta no» descarta el −4 por el contexto, no por el álgebra.
  - **Se mezclan tres objetos:** la raíz ajena, la raíz genuina y la raíz excluida por el problema.
  - **El jugador no comprueba el −4.** Nunca lo prueba en x² + 2x = 8 (16 − 8 = 8), que es justo el
    criterio que enseñó el cap. 6.
  - **Falta un renglón en la pizarra.** Se pasa de (x + 1)² = 9 a x = 2 o x = −4 sin escribir
    «x + 1 = 3 o x + 1 = −3».
- **Por qué importa:** §6 distingue elevar al cuadrado (puede introducir soluciones) de deshacer un
  cuadrado sin el ± (las pierde). La idea central del capítulo es que «deshacer un cuadrado tiene dos
  caminos».
- **Cómo comprobar:**
  - Que Mara pregunte: «En la cuenta de Oval el −3 sobraba. ¿Y acá?».
  - Que el jugador pruebe el −4 en la original y vea que cumple.
  - Cerrar con «el −4 es de la cuenta; lo descarta la huerta».
  - Escribir el renglón del ±.

### M7. 7.7: completar el cuadrado sólo con b = 2; sin transferencia ni casos sin solución

- **Dónde:** toda la escena 7.7; `growth.js:57-63` (general, pero se usa sólo con `(2, 8)`); Bitácora
  `:645`.
- **Qué:**
  - Con una tira por lado, la esquina es 1 · 1 sin pensarlo. La idea general nunca aparece: repartir las
    b tiras en dos mitades, y entonces la esquina es (b/2)².
  - No hay transferencia con otra estructura. Por ejemplo, x² + 6x = 7: esquina 9, (x + 3)² = 16, x = 1 o
    x = −7.
  - Tampoco hay un caso con una sola solución (x² + 2x = −1) ni uno sin solución (x² + 2x = −2, que
    lleva a (x + 1)² = −1).
- **Por qué importa:**
  - §5 pide una «situación nueva … sin repetir la misma secuencia».
  - La idea de los «dos caminos» necesita sus contracasos: cero o un solo camino.
- **Cómo comprobar:** un ítem breve de transferencia. Con x² + 6x = 7, el jugador reparte 3 + 3 tiras y
  elige el tamaño de la esquina (1, 3 o 9), con su consecuencia. Más una línea sobre un cuadrado igual a
  un número negativo.

### M8. 7.9: x = 0 no se puede probar, y se confunde el dominio de la cuenta con el del reparto

- **Dónde:**
  - `scenes-b.js:557`: `VALS = [5, 4, 3, 2]`.
  - `:549`: la opción «Con x = 0».
  - `:604`: la respuesta verbal a esa opción.
  - `:605`: la pizarra escribe `x ≠ 2`.
  - `:607`: Rampa escribe «si vienen más de dos» y dice «Con 3, un atado entero cada uno; con 5, un
    tercio».
- **Qué:**
  - **El error más típico no se puede probar.** «Con x = 0» se ofrece, pero la tabla no lo deja probar, y
    se refuta sólo de palabra. Probarlo mostraría 1 ÷ (−2) = −1/2: la cuenta está definida, pero es
    absurda para el reparto (medio atado negativo por persona).
  - **Se confunden dos dominios.** La cuenta está definida para todo x ≠ 2. El reparto sólo tiene sentido
    para x entero mayor que 2. El juego escribe x ≠ 2 y Rampa pasa a «más de dos» sin decir por qué
    quedan fuera el 0 y el 1. Se puede leer x ≠ 2 como x > 2.
  - **El ejemplo de Rampa no sale de la tabla.** Su frase está fija. En `c6c7-directa` el bot probó 2, 5
    y 4, y el 3 no está en la pizarra (captura `070`). Además, con x = 3 hay una sola persona: «cada
    uno» no corresponde.
- **Por qué importa:** el contrato pide restricciones y dominio (§7D y §7J), y consecuencias para los
  errores (§8).
- **Cómo comprobar:**
  - Agregar 0 (y 1) a `VALS`.
  - Con x = 0, la tabla muestra −1/2 y Rampa dice que la cuenta da, pero que nadie recibe medio atado
    negativo.
  - Dos renglones en la pizarra: «la cuenta: x ≠ 2» y «el reparto: x = 3, 4, 5, …».
  - Armar la frase de Rampa con los valores que se probaron.

### M9. Gancho al cap. 8: «partí la diagonal en doce y no cayó en ninguna rayita» confunde qué segmento se parte

- **Dónde:** `scenes-b.js:611`, contra `ch5/scenes-b.js:435`, `:460` y `:526` (en 5.9 se partía **el
  lado**, también en doceavos, y se medía la diagonal).
- **Qué:**
  - Si se parte la diagonal en doce, su extremo cae justo en la marca doce. Lo que «no cayó» queda sin
    decir.
  - La prueba que promete el cap. 8 (la diagonal y el lado son inconmensurables) depende exactamente de
    qué segmento se toma como unidad.
  - La frase no coincide con lo que el jugador hizo en el cap. 5.
- **Cómo comprobar:** «partí el lado en doce y la diagonal no cayó en ninguna rayita. ¿En cuántas hay
  que partir el lado?». Contrastar con el texto de 5.9.

### M10. La Bitácora confunde objetos, generaliza de más y atribuye de más

- **Dónde:** `scenes-b.js:643-646`, `:623`, `:627`, `:637`. Evidencia: `journal` de
  `c7-errores/state.json`.
- **Qué:**
  - **«2ⁿ cuenta cuántas veces se multiplica por 2» (`:644`).** El que cuenta es n, el exponente, no 2ⁿ,
    que es el valor. En un capítulo que termina con «exponente ↔ valor» (el logaritmo), mezclarlos
    importa. La escena lo dice bien en `:139`.
  - **«La raíz es el lado» y «√2 es la diagonal de un cuadrado de lado 1» (`:643`).** Confunden un número
    con un segmento: es lo que el segmento mide. La escena lo dice bien en `scenes-a.js:161`: «el camino
    en diagonal **mide** raíz de dos».
  - **«El signo √ indica … el número positivo».** √0 = 0 (ver B1).
  - **«Duplicar empieza lento y después no lo alcanza nadie».** «Empieza lento» depende de los valores
    iniciales. «Nadie» exagera: lo verdadero es «ninguna suma fija por día».
  - **«No vale donde ese abajo da cero».** Mejor «no está definida», que es lo que dice la escena.
  - **El logaritmo:** ver A1.
  - **Atribuciones de más:**
    - «Apostaste a sumar diez o al empate» junta dos respuestas distintas.
    - «Comparaste por el exponente» atribuye un método a quien sólo eligió una respuesta.
    - «Pensaste en otro valor» se le dice también a quien eligió «Se puede con cualquier x», que no
      pensó en ningún valor.
- **Cómo comprobar:** reescribir esas frases y probarlas con el `state.json` de las dos rutas. Para
  `rational-predict = all`, la línea tiene que nombrar esa respuesta.

### M11. Cobertura: lo que piden el contrato (E) y el propio diseño, y no está

- **Dónde:**
  - Contrato §7E.
  - `ARITHMOS_DESIGN.md`, cap. 7, «Límites a declarar».
  - `ARITHMOS_BACKLOG.json`: C7 figura «implementado».
  - Busqué en el capítulo «fraccionari», «otras bases», «sucesi», «identidad», «variable» y «∛»: no
    aparecen.
- **Qué falta:**
  - **Exponentes fraccionarios.** El diseño promete mencionarlos y no se mencionan. 2^(1/2) = √2 es el
    puente natural (ver A1).
  - **Logaritmos de otras bases.** Tampoco se mencionan, y nadie explica qué indica el subíndice de
    `log₂`.
  - **Propiedades de las potencias.** Falta 2ᵃ · 2ᵇ = 2ᵃ⁺ᵇ y la potencia de una potencia. Tampoco se
    confronta el error (a + b)² = a² + b², y 7.7 tiene justo el dibujo que lo refuta.
  - **Raíces.**
    - Sólo cuadradas.
    - No hay raíces de otro índice ni de negativos (√−9 frente a ∛−8 = −2).
    - Falta √(x²) = |x|, que conecta con el valor absoluto del cap. 3.
  - **Sucesiones.** La tabla de 7.2 es una sucesión aritmética y una geométrica, pero no se nombran ni se
    escribe el término general (1 + 10n, 2ⁿ).
  - **Polinomios.** Hay un solo producto. No aparecen grado, coeficientes ni operaciones. Si la referencia
    curricular lo pide, faltan también la división y el teorema del resto (validación pendiente en
    `ARITHMOS_CURRICULUM.md`).
  - **Cuadráticas.** Hay una sola ecuación. Falta la cantidad de soluciones, la fórmula resolvente y el
    vínculo con factorizar (producto cero).
  - **Expresiones racionales.** Sólo el dominio de 1 ÷ (x − 2). Falta simplificar ocultando una
    restricción: (x² − 4)/(x − 2) = x + 2 sólo si x ≠ 2. Eso conecta con 6.6 («dividir por lo que puede
    ser cero»).
  - **√2 no es una fracción.** No se declara que la prueba queda para el cap. 8. Sólo queda el gancho, y
    está mal formulado (M9).
- **Por qué importa:** §10 («una pantalla con el título de un tema no cuenta como cobertura») y §11 («no
  rebajes criterios para que el tablero parezca completo»).
- **Cómo comprobar:** en el backlog, separar lo cubierto de lo pendiente (por ejemplo, C7b), y agregar
  al menos las menciones que el diseño promete.

---

## BAJA

- **B1.** `scenes-a.js:85`: «La raíz de un número es la positiva».
  - Falta «cuadrada».
  - √0 = 0, que no es positivo.
  - Los negativos no tienen raíz cuadrada real.

  Sugiero: «la raíz cuadrada de un número no negativo es el número no negativo que multiplicado por sí
  mismo lo da».
- **B2.** `scenes-a.js:190`: la descripción accesible dice «Él dibujaría cada día el doble de lo que ya
  hay». Leída al pie de la letra, el total se triplica (1, 3, 9, 27, …). El estudiante lo dice bien en
  `:261` («cada día suma todo lo que ya había»). Sugiero: «cada día dibujaría tantos como ya hay: el
  total se duplica».
- **B3.** 7.2: la pregunta «¿quién llega antes a cien?» (`:200`) nunca se contesta de forma explícita
  (Punto llega el día 7 con 128; Mara, el día 10 con 101). La conclusión habla de otra cosa: el día en
  que Punto pasa adelante. «No te alcanza nadie» (`:261`) queda sin su argumento, que es corto: desde el
  día 6 Punto suma al menos 64 por día y Mara, 10.
- **B4.** Concordancia en mensajes armados por código:
  - `scenes-b.js:365`: «faltan una tira». Se ve en `c7-errores/log.txt` 87,8 s y en la captura `029`.
  - `:514`: «Las otras 1 sobraban». Se ve en `c7-errores/log.txt` 102,0 s.
- **B5.** `scenes-b.js:310`: quien eligió «seis tiras y cinco cuadraditos» (cambió la suma por el
  producto) recibe «Las tiras son los bordes nuevos: no se pueden olvidar», que responde a otro error.
- **B6.** `scenes-b.js:312`: «como cuando repartimos en las Terrazas». En el cap. 4, «Repartir» (4.4) es
  la división; la distributiva fue «Partir el rectángulo» (4.7). Remite a la escena equivocada.
- **B7.** `scenes-b.js:236`: «Y un grano solo es nada: una milésima de gramo». 0,001 no es nada, y el
  juego viene peleando contra «cero = nada» desde el cap. 2. Sugiero «casi nada».
- **B8.** 7.4: el error de Punto (contar el 3) no se le puede escapar al jugador.
  - El 3 no se puede tocar y «listo» exige los seis ceros.
  - La evidencia `sci-short` registra apuro, no comprensión.
- **B9.** 7.7 (`scenes-b.js:404`): «dos tiras de x pegadas, una a cada lado» puede leerse como lados
  opuestos. Mejor «una a la derecha y otra abajo».
- **B10.** 7.8:
  - «Los mil de la escalera grande» (`:474`) es una cantidad nueva, sin origen en la historia.
  - La tabla de 7.2 ya mostró 2¹⁰ = 1024, así que la predicción se puede leer de la escena anterior.
  - Si el jugador se pasa de largo, la pizarra deja «2048 / 11 duplicaciones» junto a la desigualdad
    (`c7-errores/041`).
- **B11.** 7.1:
  - El cuadro de huerta mide 40 px con nueve cuadros y 104 px con dos (`scenes-a.js:55` y `:35`).
  - El diseño promete «√2 entre 1,41 y 1,42», y la escena no lo muestra. Es una verificación barata:
    1,41² = 1,9881 < 2 < 2,0164 = 1,42².
  - La predicción queda trivial, porque el gancho del cap. 6 ya dijo «está en el medio»
    (`ch6/scenes-b.js:334`).
- **B12.** `growth.js`:
  - `power(0, n)` con n ≤ 0 devuelve 1 o Infinity sin aviso.
  - `timesToReach(b, n)` con b ≤ 1 entra en un bucle infinito.
  - `undefinedAt` no tiene prueba.

  Hoy no afecta al juego, pero la lógica no declara sus límites.
- **B13.** Las pruebas validan la lógica, no los textos derivados (concordancia, valores citados por
  Rampa, la Bitácora por rama). Una prueba que arme la Bitácora con los `state.json` de las dos rutas
  habría encontrado M10.
- **B14.** 7.6: el jugador elige uno de tres pares de lados y las fichas se acomodan solas. El diseño
  decía «armar un rectángulo». La evidencia `factor-try` no distingue entre comprender la regla de la
  suma y el producto y probar opciones.

## Lo que está bien (para no perderlo al corregir)

- **7.1.** Cortar los dos cuadros por la diagonal y armar el cuadrado inclinado es la construcción del
  *Menón* reducida a área 2. Muestra que el lado es la diagonal sin pedir fe. Los lados amarillos son las
  diagonales y la barra «un lado de 2» deja comparar. Verifiqué la geometría: cuatro triángulos
  rectángulos con el ángulo recto en el centro y rotaciones de 0, 90°, 180° y 270° forman un cuadrado de
  lado 104·√2 ≈ 147 px < 208 px.
- **Exacto y aproximado.** √2 · √2 = 2 se escribe con «=» y √2 ≈ 1,414 con «≈»; el valor exacto y la
  aproximación quedan bien separados (§7C).
- **√ y el −3.** «√ indica el positivo; x · x = 9 tiene además −3» es coherente con el cap. 6 y con 7.7.
- **7.2.** La tabla es correcta (1 + 10d contra 2ᵈ), el adelantamiento es el día 6 (64 contra 61) y la
  explicación del mecanismo («cada día suma todo lo que ya había») es la correcta. Comprobé hasta el
  día 60 que duplicar no vuelve a quedar atrás.
- **7.3.** La tabla que baja «÷ 2» es una buena representación, y 2⁰ = 1 y 2⁻¹ = 1/2 son correctos.
- **7.4.** El error de Punto (3 · 10⁷ por contar siete cifras) es el clásico, y se corrige él mismo
  después de que el jugador cuenta. 0,001 = 1 · 10⁻³ conecta con la tabla hacia abajo.
- **7.5.** Los distractores son los errores típicos: (x + 2)(x + 3) = x² + 6, y cambiar la suma por el
  producto. La bandeja trae fichas de más.
- **7.6.** Las consecuencias se ven y son correctas: con (1, 6) faltan dos tiras; con (1, 5) falta una
  tira y sobra un cuadradito (captura `c7-errores/029`). «Con enteros» está bien dicho.
- **7.7.** «Lo que se agrega de un lado del igual, se agrega del otro» conecta con el cap. 6, aparecen
  las dos soluciones y el contexto descarta el −4 de forma explícita.
- **7.8.** El valor log₂ 1000 ≈ 9,97 es correcto y está acotado con 2⁹ < 1000 < 2¹⁰.
- **7.9.** «No está definida» corrige el «no da nada» del cap. 6 (rev-mat-5 M3). El «= 0» de Punto se lo
  lleva la Marea y el «?» queda.
- **Historia.** El capítulo no afirma nada histórico sin fuente, como pedía el diseño.
- **Pruebas.** 73/73 pasan, y mi script confirma todas las igualdades escritas.

## Qué no pude verificar

- **El juego en un navegador.** No lo abrí, por la restricción del entorno. Todo lo de pantalla sale del
  código, de los logs y de las capturas del bot.
- **Momentos sin captura.** Ninguna captura muestra:
  - El cuadrado de 7.1 armado, ni los renglones √2 · √2 = 2 y √2 ≈ 1,414.
  - La ecuación final de 7.5.
  - El renglón «x = 2 o x = −4» de 7.7.
  - El renglón `log₂ 1000 ≈ 9,97` de 7.8.

  Esos textos los verifiqué en el código, no en pantalla.
- **La ruta con errores en 7.1.** El bot registró «no pudo tocar cut1» (`c7-errores/log.txt` 43,7 s) y
  aun así la escena terminó. No sé cómo: lo dejo para la revisión funcional.
- **`c7b-directa2`.** Corresponde a un texto anterior; no es evidencia del texto actual.
- **Otros tamaños, entrada y audio.** No revisé las partidas en 844×390 ni las táctiles (había una
  corriendo, `c7-telefono3`). Tampoco evalué audio ni teclado.
- **La referencia curricular de E.** No contrasté la cobertura con una referencia argentina: está
  pendiente en `ARITHMOS_CURRICULUM.md`.
- **Comprensión humana.** No hay playtests. Nada de esto certifica que alguien entienda.
