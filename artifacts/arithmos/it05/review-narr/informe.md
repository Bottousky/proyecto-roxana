# Arithmos — revisión narrativa, de dirección y de puesta en escena (cap. 5 «Partes de algo»)

Revisor independiente (rev-narr-3), 2026-10-06. No usé navegador, Playwright ni scripts del juego. Me basé en el código,
en los logs de partidas automáticas y en capturas PNG ya hechas.

## Alcance, evidencia y advertencias

- **Código leído** (`HEAD` = `074d296`): `experiments/arithmos/src/ch5/chapter.js`, `common.js`, `scenes-a.js`,
  `scenes-b.js`. Para la costura y el elenco leí también `ch4/scenes-b.js` (escena `partir` y Bitácora), `ch4/common.js`,
  `ch2/common.js` (`villager`), `engine/world.js` (flecha de Punto), `engine/ui.js` (Bitácora), `ending.js`, `chapters.js`
  y `styles.css` (familia «Tiza»).
- **Contrato y diseño:** `docs/arithmos/ARITHMOS_MASTER.md` y `ARITHMOS_DESIGN.md` (premisa, personajes, tabla de Punto,
  diseño 5.1–5.9). También `ARITHMOS_REVIEW.md` (tabla rev-narr-2) y el informe anterior,
  `artifacts/arithmos/it04/review-narr/informe.md`.
- **Logs:** `artifacts/arithmos/it05/c5-directa.log` y `c5-errores.log`. Para la costura 4→5 usé `c4-directa.log`
  (líneas 69–73).
- **Capturas** (1600×900): `it05/c5-directa/001–040` y `it05/c5-errores/` (003, 010–012, 020, 044), más
  `it05/c4-directa/028–029` para el paso del cap. 4 al 5. Las amplié recortando con `sips` en el scratchpad.
- **Versión:** las capturas del cap. 5 (09:38–09:39) son posteriores a la última edición de `ch5/*.js` (09:17–09:18), así
  que corresponden al código actual. El tramo del cap. 5 dentro de `c4-directa` es anterior (09:14) y sólo lo usé para la
  costura.
- **Partidas que empezaron en el cap. 5:** `c5-*/state.json` no tiene `puntoArrow` ni `c4groups`. Por eso en esas capturas
  Punto no puede mostrar la flecha y la escalera de las Terrazas aparece borroneada (ver B1).
- Los logs son de un bot que lee y elige en décimas de segundo. Muestran **qué se dice y en qué orden**, no el ritmo.

## Lo que funciona (para calibrar)

- **Pago del cap. 4.** Mara cerraba el 4 con «Un pedazo de atado. Eso no lo anoté nunca». En 5.1 el estudiante escribe
  «1/2 atado = 5 palitos» y ella dice «Así lo anoto». Los seis atados que Mara guardaba en 4.6 reaparecen como «medio
  montón» (5.1) y como «la próxima cosecha» (5.8). La línea de Cornisa «Ayer quedamos en que era igual para todas» cose
  bien con 4.4.
- **Errores genuinos de Punto con refutación visual:** corta a ojo (5.2), escribe 1/4 > 1/3 (5.5) y 1/2 + 1/3 = 2/5 (5.6).
  El mejor es el de 5.6: el pedazo de 2/5 queda más corto que la media barra sola (`c5-directa/027`), un absurdo que se ve.
- **5.4 tiene la decisión espacial más genuina del capítulo.** El jugador elige la partición y, con tercios, no aparece
  ninguna marca para 3/4. Después toca una marca y Punto salta cuarto por cuarto hasta ahí (`scenes-a.js:416-461`).
- **La coma de Punto** recuerda su «rayita» del menos del cap. 3. «El cero otra vez. Ya no se me escapa.» paga el cap. 2.
- **Humor con carácter:** Cornisa con «¡Tengo más!» y «Bueno. Pero los míos son dos.» (5.3) y Peldaño con «Mara, sos
  tramposa» (5.8).
- **M1 de rev-narr-2 está resuelto:** en el cap. 5 no hay «como dije» ni «lo anticipé». Además, el texto es magro: unas
  55 líneas en las 9 escenas de la ruta directa.
- **5.9 declara su límite.** «Probar que ninguna, nunca, va a entrar justo es otra cosa» separa la aproximación de la
  prueba, como pide el contrato §7F.

## ¿Repite el cap. 5 los problemas de rev-narr-2?

| Problema de rev-narr-2 | En el cap. 5 | Dónde |
|---|---|---|
| A1 Marea ausente | **Sí, por completo.** Ninguna mención y nada en riesgo. Además, el pizarrón con lo comprendido se borra sin causa | A3 |
| A2 Mara enuncia reglas | **Sí, en parte.** Define el porcentaje antes de actuar, dicta la regla de las partes iguales, explica la coma y cierra la diagonal | A5 |
| A3 Estudiante pasivo | **Mejoró la autoría** (escribe 7 renglones) **pero no la agencia:** escribe cuando el juego decide y habla sólo para dar definiciones | A1, A5 |
| A4 Cuestionario encadenado / acciones de un botón | **Sí, se agravó.** 15 elecciones de menú (13 evaluadas) y 4 interacciones espaciales, 3 de ellas de un solo blanco | A1 |
| A5 Cuentas contradictorias | **Sí.** Barras repartidas que vuelven a aparecer, un «ayer» que es hoy y una noche que no pasó | A2 |
| M1 «Como dije» | No (resuelto) | — |
| M2 Ganchos repetidos | **Sí.** La línea de Balcón se dice dos veces seguidas entre el 4 y el 5 | M1 |
| M8 Composición | **Sí, y con más peso:** lo esencial es diminuto, hay figuras fundidas y texto que se sale del pizarrón | A4, A6 |
| N4 Primeros planos | **No hay ninguno** en todo el capítulo | A6 |
| B2 Amarillo = Punto / B3 corrección sin actor | **Sí, regresan los dos** | M2, M10 |

---

## Hallazgos ALTOS

### A1. El capítulo es un cuestionario de predicción con animación automática; el «momento» 5.9 no tiene acción del jugador
- **Dónde:** `ch5/scenes-a.js` y `scenes-b.js`.
  - Hay 15 `d.choose` (13 con `evaluate: true`) y sólo 4 lugares tocables:
    - 5.3 `eq-move` (`scenes-a.js:350`), un único blanco.
    - 5.4 marcas `q1–q3` (`:440`), la única elección real sobre el dibujo.
    - 5.5 `cm-cut` (`scenes-b.js:72`), un único blanco: «Partir una barra en 4 y otra en 3»; la partición la decide el juego.
    - 5.6 `sm-join` (`:161`), un único blanco.
  - Cinco escenas (5.1, 5.2, 5.7, 5.8 y 5.9) no tienen ninguna acción sobre el mundo, sólo menús.
  - El ciclo se repite casi idéntico en 5.3, 5.5, 5.6, 5.7, 5.8 y 5.9: una familia o Mara plantea, hay opción múltiple,
    un toque o ninguno, la animación resuelve, un pensamiento da el veredicto y se escribe la ecuación.
- **Qué:**
  - En 5.2 el jugador elige «En 2 / En 3 / En 4» de un menú. Cortar y repartir es automático (`cutBars` y `dealPieces`,
    `scenes-a.js:270-305`), aunque el cap. 4 ya tenía un reparto tocable por familia (4.4).
  - En 5.9, el momento del capítulo, Punto mide tres veces solo (`scenes-b.js:379-398`). El jugador sólo predice y Mara
    cierra con «Probé toda la noche con partes más chicas. Ninguna entra justo.» (`:406`).
  - La medida tampoco se ve: no hay regla de décimos sobre la diagonal. Aparece el texto «1,4 < diagonal < 1,5»
    (`c5-directa/038`) y el pensamiento cuenta lo que no se mostró: «Catorce décimos no llegan; quince se pasan.» (`:396`).
- **Por qué importa:** el contrato §4 y §8 rechaza «pulsar continuar mientras el juego piensa» y «arrastrar al único hueco».
  §8 pide distinguir observar, intentar y confirmar.
  - En 5.9 hay además un problema de comprensión. Quien elige «Sí: partiendo bastante fino, en algún momento entra
    justo» está transfiriendo bien lo de 5.4 («siempre cabe otro, partiendo más fino»). El juego lo refuta por autoridad
    (Mara probó de noche), no con evidencia que el jugador haya producido.
- **Propuesta** (una acción con consecuencia por escena; la predicción se queda sólo donde cambia algo):
  - **5.1:** dos verbos sobre cada atado (desatar o partir) y entregar tocando a cada familia, como en 4.4. Si se le da
    un atado a dos familias, que se vean los atados en sus manos y la protesta (hoy es sólo una línea, `scenes-a.js:81`).
  - **5.2:** el jugador corta la barra tocando a lo largo (marcas tenues de 2, 3, 4 y 6 partes que se fijan al tocar) y
    reparte por vueltas tocando familias. Si corta en tercios, que pueda partir en cuatro el tercio que sobra
    (2/3 + 1/12 = 3/4) en lugar de «Así se complica. Empecemos de nuevo» (`scenes-a.js:240`). Es un camino válido y siembra los
    doceavos de 5.5.
  - **5.5 y 5.6:** el jugador elige la partición común tocando la barra (6 o 12 sirven; 5 no). Con 12 se llega a
    10/12 = 5/6, otro camino válido.
  - **5.9:** «Probá con la partición que quieras» (décimos, centésimos, milésimos, séptimos, doceavos…). Cada intento
    tiende una regla de tiza sobre la diagonal y muestra «corto / se pasa». El jugador decide cuándo dejar de probar.
    Mara puede acompañar («Yo probé con las mías. Probá vos.») en lugar de reemplazar la exploración.
- **Cómo comprobarlo:** contar los `spotOf/rectSpot/wordSpot` por escena (≥ 1 con más de un blanco posible en 5.1, 5.2,
  5.5, 5.6 y 5.9) y jugar 5.9 eligiendo «más fino»: el jugador tiene que poder probar al menos dos particiones propias.

### A2. Las cantidades se contradicen entre escenas: barras ya repartidas que reaparecen, un «ayer» que es hoy, una noche que no pasó
- **Dónde y qué:**
  - **5.2:** las tres barras se reparten completas y cada familia queda con 3/4 (`scenes-a.js:250-264`).
  - **5.3:** «**Ayer**, a Cornisa le tocó una barra cortada en cuartos; a Peldaño, una cortada por la mitad.» (`:339`).
    Las barras llegaron hoy (5.2), nadie recibió una barra entera y lo que cada una recibió fueron 3/4
    (`c5-directa/012`).
  - **5.6:** «Rampa tenía media barra y yo le di un tercio de la mía.» (`scenes-b.js:142`). Rampa tenía 3/4, y la parte
    de Balcón estaba en cuartos (o en media y cuarto): de ahí no sale un tercio.
  - **5.7:** «tengo que anotar cuántas barras quedan: dos enteras… y media» (`:220`), aunque las tres barras se
    repartieron enteras en 5.2.
  - **5.9:** Peldaño pregunta y en la línea siguiente Mara dice «Probé toda la noche» (`:406`). La escena no deja pasar
    ninguna noche.
  - **Ruta «En 2» de 5.2:** el pensamiento «la mitad son dos cuartos, así que son tres cuartos» (`scenes-a.js:260`,
    `c5-errores/012`) dice 1/2 = 2/4 **antes** de que 5.3 lo pregunte. En esa ruta la predicción de 5.3 ya viene resuelta.
- **Por qué importa:** es la misma clase de problema que A5 de rev-narr-2. En un capítulo sobre medir partes, quien sigue
  los pedazos (lo que el juego enseña) encuentra que los pedazos no cierran. El «ayer» comodín, ya señalado en M4,
  vuelve.
- **Propuesta:** un libro de cuentas del capítulo, estable y visible.
  - Que 5.2 termine con repartos mezclados. Por ejemplo, la primera barra se corta en mitades y las otras dos en cuartos:
    Peldaño y Balcón reciben media más un cuarto, y Cornisa y Rampa tres cuartos. Así 5.3 compara lo que **efectivamente**
    tienen («Yo tengo tres pedazos y Peldaño dos») y la equivalencia sale del reparto.
  - En 5.6, otra entrega explícita en tercios («Llegó otra barra, cortada en tres en el camino») o números que salgan del
    libro.
  - En 5.7, «Mañana traen dos barras y media: ¿cómo lo anoto?».
  - En 5.9, sacar «toda la noche» o poner un corte de tiempo.
  - Revisar la línea de `scenes-a.js:260` en la ruta «En 2» para que no adelante 5.3.
- **Cómo comprobarlo:** una tabla de piezas por familia y por escena, recorrida por las dos rutas de 5.2, sin ninguna
  incoherencia.

### A3. La premisa (la Marea, «lo comprendido resiste») no aparece; el pizarrón con lo entendido se borra sin causa
- **Dónde:**
  - No hay ninguna aparición de «Marea», «borra» ni «resiste» en `ch5/*`.
  - `medio.setup` hace `w.clear()` (`scenes-a.js:57`): todas las igualdades del cap. 4, legibles al final de 4.7
    (`c4-directa/028`), desaparecen «a la mañana siguiente» (`c4-directa/029`) sin explicación.
  - Después, cada `setup` borra lo que escribió el estudiante en la escena anterior (`removeWhere(/^(c5-|cm-|sm-|dc-)/)`).
- **Qué:** nada está en riesgo en el capítulo. Lo que más se parece a una amenaza, «Afuera se pierde. Y es tiza.»
  (`scenes-b.js:241`), es una opción descartada.
- **Por qué importa:** el diseño dice que «lo comprendido resiste: queda tenue, pero legible». En el cap. 5 lo comprendido
  es justamente lo que se borra, y no lo borra nadie. Es la regresión de A1 de rev-narr-2, que en los caps. 3 y 4 sí
  se había corregido.
- **Propuesta:**
  - Que las igualdades del cap. 4 sigan tenues en el pizarrón (o en la piedra) y que lo nuevo se escriba al lado. El
    registro del capítulo se acumula y no se limpia.
  - Dar a la Marea una función en este capítulo. En «el registro viejo» (5.7) la pasada borró las comas, porque nadie
    entendía para qué estaban, y Mara lee «205 barras» donde decía 2,05. Restituir la coma con la caja de los décimos es
    lo que hace que el registro vuelva a ser legible y resista.
  - En 5.9, la pasada llega a la huerta. El camino diagonal resiste aunque no se sepa escribir exacto, porque se entiende
    como medida. Así la pregunta del cierre tiene apuesta y no es sólo una curiosidad.
- **Cómo comprobarlo:** captura del comienzo de 5.1 con las notas del cap. 4 tenues; captura del final de 5.9 con el
  registro del capítulo completo; al menos un momento de «se borra / resiste» con `describe`.

### A4. Las cifras y fracciones de un capítulo de fracciones se leen mal: «5» parece «S» y «1/2» parece «l/2»
- **Dónde:** la familia «Tiza» sólo reemplaza el **4** por el de Atkinson (`styles.css:9-11`, `unicode-range: U+0034`).
  El 1 y el 5 siguen siendo los de Kalam en el canvas y en los botones del DOM.
  - «1/2 atado = **S** palitos» (`c5-directa/004`, ampliada).
  - «1/2 + 1/3 = 2/**S**» y «**l**/4 > **l**/3» en la tiza amarilla de Punto (`022`, `026`, `027`).
  - «**S**0 % de 80 = 40» (`036`).
  - «9/**T**6» (`020`).
  - Los botones «**S**/6 de barra.» y «Pasando el **l**.» (`026`, `018`).
  - En el título, «Volver a jugar el capítulo **S**» (`040`).
  - En 5.9 los decimales «l,4l4 < diagonal < l,4lS» (`038`).
- **Qué más:** en el pizarrón y en los subtítulos las fracciones se escriben con barra inclinada, y el 1 de Kalam es casi
  paralelo a «/». En la línea, en cambio, se escriben «de pie» (`fracLabel`). Nadie conecta las dos escrituras.
- **Por qué importa:** el contrato §3 pide que «fracciones… deben distinguirse sin esfuerzo». Leer 2,05 / 2,5 o 5/6 / 2/5
  es la tarea misma del capítulo. Ya se corrigió una vez esta clase de error con el 4 y el 9.
- **Propuesta:**
  - Extender la sustitución a `U+0031` y `U+0035` (y revisar el 7) con los glifos de Atkinson.
  - Escribir las fracciones del pizarrón «de pie» con `fracLabel`, o con raya horizontal, al menos la primera vez.
  - Que el estudiante haga el puente en 5.1: «Uno, una raya, dos» mientras la escribe de pie y después «también se
    escribe 1/2».
- **Cómo comprobarlo:** recortes al 100 % de «1/2 atado = 5 palitos», «2,05», «9/16» y «capítulo 5» a 1600×900 y a
  844×390. Ninguna cifra debe confundirse con una letra.

### A5. Las voces vuelven al aula: Mara define y dictamina, y el estudiante habla sólo en definiciones
- **Dónde:**
  - **Mara** (18 llamadas en el capítulo):
    - Dicta la regla antes de que el jugador la infiera: «Para que sea igual para todas, los pedazos tienen que ser
      iguales.» (`scenes-a.js:204`), dicha justo después de que las familias ya protestaron.
    - Define antes de actuar: «Por ciento quiere decir "de cada cien". El 50 % es la mitad: 50 de cada 100.»
      (`scenes-b.js:310`).
    - Explica la notación que inventó Punto: «Así nadie confunde los cuartos.» (`:260`).
    - Cierra 5.1 con la conclusión: «Cinco palitos: medio atado.» (`scenes-a.js:117`), antes del pensamiento del estudiante.
    - Cierra 5.9 con la evidencia que el jugador no produjo (`scenes-b.js:406`).
    - Plantea acertijos: el trato del 50 % y el 80 % es una pregunta trampa sin apuesta («Mara, sos tramposa»).
  - **Estudiante:** dice 5 líneas en voz alta y las 5 son conclusiones o definiciones sin destinatario:
    - «Uno, una raya, dos: una parte, de dos iguales.» (`:122`)
    - «Tres cuartos: tres partes, de las cuatro iguales que entran en una barra.» (`:261`)
    - «El mismo pedazo de barra, con tres nombres.» (`:389`)
    - «El cero guarda el lugar de los décimos.» (`scenes-b.js:281`)
    - «Con la raya ondulada: "más o menos"…» (`:417`)

    No le habla nunca a Punto ni a una familia. Los 22 `d.think` son casi todos veredictos.
- **Por qué importa:**
  - En los caps. 3 y 4 la corrección de A2 pasó las conclusiones al estudiante. En el cap. 5 el profesor volvió a ser
    Mara en las escenas clave, y el estudiante se convirtió en el de las definiciones: la regresión N2 del cap. 1 («la
    voz del estudiante pasa de lacónica a profesor»).
  - El contrato §13 pide buscar «exposición innecesaria» y «cambios de personalidad». La Mara lacónica del «así se hizo
    siempre» no inventa acertijos de porcentajes.
- **Propuesta:**
  - **Mara** pregunta y anota, no define. En 5.8 el trato tiene que ser suyo y práctico: «Para la próxima cosecha: ¿les
    doy la mitad de los 80 o el 80 por ciento de los 50? Elijan.» «Por ciento» lo pregunta una familia («¿Por ciento
    de qué?») y se ve con la cuadrícula de centésimos de 5.7.
  - En 5.2, que la regla no la diga nadie: la protesta y las barras desparejas alcanzan.
  - **Estudiante:** cada línea suya dicha en voz alta, dirigida a alguien. A Cornisa: «Los tuyos son dos, pero cada uno
    es la mitad.» A Punto: «Esa rayita no es la del menos.» Las definiciones van a la Bitácora.
- **Cómo comprobarlo:** contar las líneas de Mara que contienen «quiere decir», «tienen que» o una conclusión antes de la
  acción del jugador (meta: 0). Toda línea del estudiante con destinatario.

### A6. Lo esencial está chico, se superpone o se sale del cuadro, y no hay un solo primer plano en el capítulo
- **Dónde y qué:**
  - **Barras de las familias (5.2), la idea central del capítulo.** Las barras fantasma miden 140 u y los pedazos se
    reducen a `GS = 140/320` (`scenes-a.js:162`): en pantalla son unos 125×13 px, arriba a la izquierda, lejos del corte
    que pasa bajo el pizarrón (`c5-directa/008`, `010`, ampliadas). La diferencia de los cortes «a ojo» es de 21 a 39 px
    (la queja de Rampa depende de eso). En 844×390 serían unos 55×6 px.
  - **Densidad (5.4).** Las etiquetas 5/8 y 9/16 tienen tamaño 22–24, flotan entre 190 y 260 u arriba de la línea sin
    unirse a su marca y las marcas de dieciseisavos miden 8 u (`scenes-a.js:490-494`, `c5-directa/020`). Además, 1/2,
    uno de los extremos de la pregunta «¿Hay algún número entre 1/2 y 3/4?», nunca se rotula.
  - **El depósito (5.7) muestra una escala engañosa.** Las barras enteras de la caja miden `bw - 24 = 116` u
    (`scenes-b.js:229`), pero los décimos miden `BAR.w/10 = 32` u (`:248`). Cinco décimos ocupan unos 175 px y se ven
    **más largos que una barra entera** de unos 120 px (`c5-directa/031`). Es una metáfora que inventa una propiedad
    (contrato §2).
  - **80 % de 50 (5.8).** Los ocho palitos de cada atado, a 4 u de distancia, se funden en un bloque y los dos que quedan
    abajo parecen uno (`scenes-b.js:331-335`, `c5-directa/036`, ampliada). No se lee «8 de cada 10». El primer atado
    toca el borde izquierdo del cuadro.
  - **Figuras fundidas.**
    - 5.3: Balcón queda a 40–70 u de Cornisa y de Peldaño (`scenes-a.js:322-323` más `FX(3)`; `c5-directa/011-015`).
    - 5.9: Peldaño, el que habla, queda a 20 u de Balcón y se ven como una figura de dos cabezas (`scenes-b.js:362`;
      `c5-directa/037-039`).
  - **Texto.**
    - «2 atados entre 4 → 1/2 atado cada una» cruza el marco derecho del pizarrón (`c5-directa/004`, `006`).
    - Por largo, «3 barras entre 4 → 3/4 de barra cada una» (`scenes-a.js:263`) probablemente también. No lo vi.
    - «1/2 = 2/4 = 3/6» (fila 5) queda apoyado en el marco inferior, con Punto encima del «1» (`015`).
  - **Planos.** Hay sólo tres planos (`SHOTS.share` de 1800 u, `board` de 1550 u y `line` de 1500 u). El pizarrón
    ocupa un tercio de la pantalla (en el cap. 4, `board` era de 780 u) y las figuras quedan en el tercio inferior con la
    mitad superior vacía. Ni la superposición 2/4 sobre 1/2, ni la coma de Punto, ni la diagonal tienen un plano cercano.
- **Por qué importa:**
  - Es la clase de problema que se marcó en N4, N13 y M8. Además pasa en los objetos que el jugador tiene que observar
    para comprender.
  - En el depósito, la imagen dice algo falso.
  - En teléfono (no hay capturas táctiles del cap. 5), varias de estas cosas serían ilegibles.
- **Propuesta:**
  - Un inserto o primer plano (≤ 700 u de ancho y ≥ 2 s) en cuatro momentos: el reparto de 5.2 sobre las barras de cada
    familia en tamaño real, la superposición de 5.3, la coma de 5.7 y la regla sobre la diagonal en 5.9.
  - Rótulos de densidad de ≥ 30 u, con una línea guía a su marca, y 1/2 rotulado.
  - En el depósito, una sola escala: una barra entera igual a diez décimos de largo; si no entra, cajas más anchas o
    barras en vertical.
  - En 5.8, palitos separados ≥ 10 u y los dos que quedan abajo, de cada atado, bien visibles.
  - Separación mínima de 90 u entre familias.
  - `boardText` con ancho máximo o salto de línea, y la fila 5 subida para que no toque el marco.
- **Cómo comprobarlo:** la guarda de objetos fuera de cuadro ya existe; agregarle una de superposición entre figuras y una
  de texto que sobresale del pizarrón. Recortes a 844×390 de 5.2, 5.4, 5.7 y 5.8.

---

## Hallazgos MEDIOS

### M1. Costuras: el gancho 4→5 se repite casi palabra por palabra y el gancho 5→6 promete otra cosa
- **4→5:**
  - Balcón cierra el 4 con «Mara… ¿y los dos atados que sobraron de la cosecha? Somos cuatro familias.»
    (`ch4/scenes-b.js:565`) y abre el 5 con «Mara, ¿y los dos atados que sobraron ayer? Somos cuatro familias.»
    (`ch5/scenes-a.js:70`). En `c4-directa.log` (líneas 69 y 73) aparecen con 1,7 s de diferencia. Es la misma falla
    que M2 de rev-narr-2 tuvo en 2→3 y que se corrigió en 2→3 y 3→4.
  - La imagen final del 4, la rajadura del atado que Punto mira «como si fuera una puerta» (`ch4/scenes-b.js:569-570`), no se paga en
    5.1.
  - Ese pensamiento está escrito como acotación en tercera persona dentro de la voz en cursiva del estudiante.
- **5→6:**
  - El cierre pregunta «¿cómo se la escribe exacta?» (la diagonal) y termina con «…que todavía no sabemos escribir. Lo
    que no se ve.» (`ch5/scenes-b.js:420-423`). En seguida aparece la tarjeta «Capítulo 6: Lo que no se ve». Se nombra dos
    veces el título siguiente, la misma metatextualidad que B6 de rev-narr-2.
  - El diseño ubica la raíz en el cap. 7 y la prueba en el 8. El cap. 6 en preparación (`src/ch6/`, sin seguimiento en
    git) abre con la caja de Mara y una incógnita x, no con la diagonal. La línea confunde «número desconocido» con
    «número conocido que no se puede escribir como fracción», una distinción que al cap. 6 le conviene cuidar.
- **Propuesta:**
  - Abrir 5.1 con la rajadura: Punto empujó el atado de noche y amaneció partido. El conflicto de Balcón queda implícito
    en la imagen, sin repetir la línea.
  - Cerrar el 5 con una imagen que apunte a la incógnita del 6 sin prometer √2. Por ejemplo, Mara mira una caja cerrada
    del depósito: «Esta no la abrí nunca».
  - La diagonal se deja como pregunta abierta para el 7 y el 8, anotada en la Bitácora.

### M2. Punto se equivoca tres veces con la misma puesta en escena y no comprende nunca
- **Dónde:** 5.2 corta a ojo (`scenes-a.js:185-204`), 5.5 escribe «1/4 > 1/3» (`scenes-b.js:53-63`) y 5.6 escribe
  «1/2 + 1/3 = 2/5» (`:143-151`).
- **Qué:**
  - El esquema es siempre el mismo: Punto escribe en amarillo y suena «happy», alguien lo cuenta, se refuta y suena «sad».
  - La corrección **cambia sola**: `pl.text = '1/4 < 1/3'` con sonido de borrador y sin que nadie la haga (`:91-94`), y
    `pl.text = '1/2 + 1/3 ≠ 2/5'` aparece de golpe, sin trazo ni `describe` (`:195`). Es la regresión de B3.
  - La coma (5.7), la única invención de Punto, ocurre sin que nadie la pida y la explica Mara.
  - Punto no reacciona a sus errores más allá del sonido, no intenta otra cosa ni comparte con el estudiante ningún
    momento de comprensión. La tabla del diseño quiere un Punto que «discute» y un «Trazo» que «acompaña recorridos»; acá
    es un puntero que se mueve adonde el guion lo necesita (sextos, saltos en la línea, la diagonal).
  - El deseo propio del estudiante y la Ronda siguen ausentes (M12 de rev-narr-2, pendiente).
- **Propuesta:**
  - **Un error que salga de su historia.** Punto lee la raya de la fracción como su rayita del menos («½ = 1 − 2 = −1») y
    el estudiante se lo desarma: «Esta rayita es otra: parte, no debe.»
  - **Que se corrija él.** Punto borra y reescribe su 1/4 < 1/3, con trazo y `describe`.
  - **La coma como decisión.** En 5.7 el jugador elige cómo escribir «dos barras y cinco décimos»: «25», «2 5» o la marca
    que propone Punto. Es el espejo del «32 / 3 2 / 302» de 2.6.
  - **Un latido de vínculo.** En 5.9, Punto recorre la diagonal dejando estela (su rasgo de Trazo) y es el primero que se
    planta: «no entra».
- **Cómo comprobarlo:** en el log, al menos una línea del estudiante dirigida a Punto, y ningún `pl.text =` sin trazo.

### M3. Errores sin consecuencia visible y elecciones que se resuelven por eliminación o por una respuesta obvia
- **Dónde:**
  - 5.1: «Darle uno a dos familias» sólo produce una línea de Cornisa y la opción desaparece (`scenes-a.js:79-83`,
    `c5-errores/003`).
  - El mismo esquema de «opción incorrecta que se borra y se vuelve a elegir» aparece en 5.2 (`:248`), 5.4 (`:432`) y 5.7
    (`scenes-b.js:242`).
  - 5.7 es casi una pregunta de opción única: «Dejarla afuera: no es una barra» y «Guardarla con las enteras» no son
    hipótesis que alguien sostendría. Además, la correcta dice cómo hacerlo («Partirla en décimos y guardarlos en el
    cuarto de al lado»), sin que se haya planteado por qué décimos.
  - 5.3 da la misma respuesta a «Dos», «Seis» o «Uno» sextos (`scenes-a.js:387`).
  - 5.2 rechaza un camino válido, «En 3» (ver A1).
- **Por qué importa:** es N3 del cap. 1 («cuestionarios por eliminación; la opción correcta se delata»). El contrato pide
  «equivocarse con consecuencias comprensibles» y reconocer caminos alternativos (§6, §8).
- **Propuesta:**
  - Que cada respuesta equivocada cambie el dibujo. Con dos sextos, Punto marca dos y no llega a la mitad. Al dar a dos
    familias, se ven los atados en sus manos.
  - Que las opciones no se borren: la equivocada queda tachada en tiza y se puede volver a probar.
  - En 5.7, preguntar primero «¿en cuántas partes la cortás para que entre en el depósito, que cuenta de a diez?».

### M4. Escenas con necesidad dramática débil (5.4, 5.5, 5.6, 5.8)
- **5.4:** «Para el registro: una línea como la de Curva» (`scenes-a.js:415`). No se dice para qué necesita Mara una
  línea, y la escena transcurre sin familias ni apuesta, con el estudiante y Mara en los bordes del cuadro
  (`c5-directa/016`).
- **5.5:** nadie necesita saber si 1/4 es más que 1/3: la escena existe para refutar a Punto.
- **5.6:** «yo le di un tercio de la mía» no tiene motivo, además de ser imposible (A2).
- **5.8:** dos «tratos» opacos (¿quién le da qué a quién?) y una pregunta trampa.
- **Propuesta:** atar las cuatro escenas a un hilo del capítulo, el **registro de partes** de Mara que la Marea amenaza
  (A3).
  - 5.4: la línea es donde Mara anota cuánto se llevó cada familia (3/4 y, si alguien devolvió, 5/4).
  - 5.5: Rampa tiene que elegir entre un tercio o un cuarto de la barra de mañana, y Punto le aconseja mal.
  - 5.6: Balcón le devuelve a Rampa lo que le debía del cap. 3.
  - 5.8: la oferta es la de Mara del 4.6 («los seis atados guardados»), con una consecuencia que alguien quiera.

### M5. «Cuartos» con dos significados en el capítulo de los cuartos
- **Dónde:** 5.7.
  - «Las enteras van en su cuarto.» (`scenes-b.js:231`)
  - «guardarlos en el cuarto de al lado» (`:233`)
  - «Así nadie confunde los cuartos.» (`:260`, `c5-directa/031`)
- **Por qué importa:**
  - Después de cuatro escenas en las que «cuarto» quiere decir 1/4, «nadie confunde los cuartos» se lee como «las
    cuartas partes».
  - Es una ambigüedad real para un adolescente y para un lector de pantalla.
- **Propuesta:** en el cap. 5, «lugar», «caja» o «estante» del depósito, o «puerta» si se quiere conservar el cap. 2. Los
  rótulos del pizarrón ya dicen «barras / décimos / centésimos».

### M6. Las familias no se identifican: una fila sin nombres y nombres sobre escalones vacíos
- **Dónde:** `familiesDown` (`scenes-a.js:36-38`) las pone en fila, a 160 u, mirando todas hacia el mismo lado
  (`c5-directa/001`). Los nombres que agregó A7 están en los escalones (`ch4/common.js:59-62`), que en 5.3–5.9 quedan
  vacíos a la derecha. En `c5-directa/012`, «Peldaño» aparece dos veces: en el escalón vacío y como rótulo de una fila del
  pizarrón, mientras el Peldaño real está a la izquierda, fundido con otra figura.
- **Por qué importa:** quién habla («Rampa», «Balcón») sólo se sabe por el rótulo del subtítulo, no se ve. La corrección
  A7 del cap. 4 se pierde en cuanto las familias bajan del escalón.
- **Propuesta:** nombre en tiza a los pies de cada familia mientras estén fuera de su escalón, y un gesto del que habla
  (ya existe el gesto automático del estudiante). La fila puede ser un semicírculo frente al pizarrón.

### M7. Huecos entre la experiencia y la notación que el jugador necesita ver
- **2,05** no se escribe nunca: el pizarrón sólo dice «2,5 = 2 + 5/10 = 2 + 1/2» (`c5-directa/033`). Los décimos quedan
  atenuados al 25 % y no vacíos (`scenes-b.js:276`), así que la caja de décimos parece tener algo.
- **El porcentaje (5.8)** se muestra como «8 de cada 10» y nunca como «de cada cien»: la cuadrícula de centésimos de 5.7
  no se usa.
- **1/2** no está rotulado en la línea (A6).
- **«0,5»** aparece en el cuerpo de la Bitácora (`:459`) pero no en el juego.
- **Por qué importa:** el contrato §5 pide conectar con «otra representación y con la notación formal». Acá lo que conecta
  es la frase, no la imagen. (Que la revisión matemática lo trate como contenido; yo lo marco por lo que no se ve.)
- **Propuesta:**
  - Escribir «2,05 = 2 + 5/100» bajo las cajas, con los décimos fuera de la caja (no atenuados).
  - Reutilizar la caja de centésimos de 5.7 como cuadrícula de 100 en 5.8.
  - Rotular 1/2 cuando se lo pregunta.

### M8. La Bitácora es un boletín de respuestas, no un recuerdo
- **Dónde:** `writeJournal5` (`scenes-b.js:427-472`).
  - «Lo que pasó» acumula hasta 11 ítems y casi todos son evaluaciones: «Anticipaste…», «Pensaste…», «Creíste…».
  - No queda ningún momento de historia: ni la coma de Punto, ni «Bueno. Pero los míos son dos», ni la huerta de
    Peldaño.
  - El cuerpo tiene 8 párrafos; M10 de rev-narr-2 proponía ≤ 4.
  - «Pensaste, como Punto, que un cuarto era más **o igual**» (`:443`) atribuye a Punto la opción «lo mismo», que él no
    sostuvo.
  - El ítem de 5.4 no registra un primer intento con mitades o tercios, y el de 5.9 es idéntico para las tres respuestas.
- **Propuesta:** 3–5 líneas en «Lo que pasó», al menos una de historia («Punto inventó la coma»), y las evidencias de
  respuesta en una sección aparte o plegada. Cuerpo ≤ 4 párrafos; los datos de densidad y de la diagonal pueden ir en
  el momento desplegable.

### M9. Ritmo: cada conclusión se dice dos o tres veces y los pensamientos señalan lo que hay que mirar
- **5.1:**
  - El medio atado se dice tres veces y además se escribe: «Cinco palitos cada una.», «Cinco palitos: medio atado.» y
    «…dos nombres para lo mismo» (`scenes-a.js:116-118`), más «1/2 atado = 5 palitos» en el pizarrón.
  - Después, «"Medio" solo no dice cuánto.» y en seguida Mara con «Medio, ¿de qué?» (`:144-145`).
- **5.8:** «Lo mismo: cuarenta y cuarenta.», luego Peldaño con «cuarenta las dos veces», luego «Un porcentaje solo no dice
  cuánto» (`scenes-b.js:341-343`).
- **5.9:** cuatro líneas seguidas de conclusión (`:406-408`, `417`). Además, el veredicto de la opción llega **después**
  de la advertencia sobre la prueba y afirma «ninguna partición entra justo» con la certeza que se acaba de reservar a la
  prueba.
- **Pensamientos que miran por el jugador:**
  - «Lo de Punto, abajo, es más corto que la media barra sola.» (`:182`)
  - «Partiendo cada atado por la mitad, daba lo mismo», que cuenta la rama no jugada (`scenes-a.js:118`)

  Es M5 de rev-narr-2.
- **Propuesta:**
  - Una sola formulación por idea, la del personaje que la descubre.
  - En 5.6, preguntar «¿qué tiene de raro el pedazo de Punto?» antes del pensamiento.
  - En 5.9, primero el veredicto y después el límite.

### M10. Accesibilidad de rótulos, descripciones y blancos táctiles
- **Sin `describe`:**
  - las correcciones de Punto (5.5 y 5.6, M2)
  - el resultado de juntar y cortar en 5.3, 5.5 y 5.6
  - la aparición del montón de seis (`scenes-a.js:128-131`)
  - el trazado del cuadrado y la diagonal (`scenes-b.js:374-377`)
- **Blancos táctiles:** las marcas de la línea miden 40×80 u (`scenes-a.js:440`), unos 22×45 px en 844×390, por debajo de
  los 44 px que el cap. 1 se fijó como mínimo. Las marcas están separadas 125 u, así que caben blancos de 100 u.
- **Botones sin contexto:** «En 2.», «En 3.» y «En 4.» se leen sueltos. Mejor «Cortar cada barra en 2 partes iguales».
- **Amarillo:** vuelve a usarse para cosas que no hizo Punto (regresión de B2):
  - los centésimos (`scenes-b.js:277`, que además se leen como glifos sueltos en `c5-directa/033`)
  - los pedazos de 2/3 y 3/4 (`:107-108`)
  - la diagonal (`:375`)
  - las marcas de las barras fantasma (`scenes-a.js:256`)
- **Propuesta:** `describe` en esos eventos, blancos de 100×90 u, verbos en los botones y amarillo sólo para Punto.

---

## Hallazgos BAJOS

- **B1. El estado de Punto y de la escalera depende de haber jugado los capítulos anteriores en la misma partida.** Con
  «Volver a jugar el capítulo 5» o una partida que empiece en el 5, falta `puntoArrow`: Punto pierde la flecha
  (`ch4/common.js:88`). También falta `c4groups`, y la escalera de las Terrazas aparece borroneada sin razón narrativa
  (`ch4/common.js:58`; comparar `c5-directa/004`, de trazo tenue, con `c4-directa/028`, de trazo pleno). Conviene que cada
  capítulo fije al entrar el estado que presupone.
- **B2.** En el cierre de 5.1, la mitad derecha del montón de seis queda montada sobre la pata central del caballete
  (`c5-directa/006`).
- **B3.** En 5.5 los pedazos de 1/4 y 1/3 se comparan montados sobre los contornos punteados de las dos filas
  (`c5-directa/023`). Se leerían mejor en una fila limpia, alineados a la izquierda.
- **B4.** «Así lo anoto.» (Mara, `scenes-a.js:123`) después de que escribió el estudiante deja ambiguo quién es el
  escribiente. Por ejemplo: «Así lo copio en mi registro».
- **B5.** Los objetos aparecen sin que nadie los traiga: el montón de seis «allá» se dibuja bajo el pizarrón y la media
  barra aparece en el suelo, junto a la escalera (`scenes-b.js:230`). Bastaría con que una familia o Mara los acerque.
- **B6.** El aviso «Anotado en la Bitácora (≡)» sigue visible en la pantalla de título (`c5-directa/040`), igual que entre
  capítulos (M10 de rev-narr-2).
- **B7.** Las capturas de «inicio» de cada escena muestran el último subtítulo de la anterior sobre el decorado nuevo
  (`c5-directa/007`, `016`, `021`, `034` y `037`). Es el mismo caso que B7 de rev-narr-2; no pude medir cuánto dura.
- **B8.** «La mañana siguiente» (`ch5/common.js:1`) no tiene un plano que la establezca: sólo un tinte cálido de 4 %
  (`common.js:78`). Un plano de llegada (B10 de rev-narr-2) ubicaría el tiempo y el lugar.

## Qué no pude verificar

- **Audio:** no escuché nada (los «happy», «sad» y «question» de Punto, la tiza, el borrador, el `cue('end')`).
- **Ritmo, actuación y transiciones:** sólo vi cuadros sueltos y logs de un bot que avanza en décimas de segundo.
- **La flecha de Punto:** sólo se dibuja en movimiento rápido (`engine/world.js:308`). Las partidas empezaron en el
  cap. 5 sin `puntoArrow` y las capturas son estáticas.
- **Teléfono y tacto:** no hay capturas del cap. 5 en 844×390. Los tamaños de A6 y M10 son cálculos a partir del código y
  de las capturas de 1600×900.
- **Ramas no cubiertas por las capturas:**
  - partir los atados por la mitad en 5.1
  - tocar una marca equivocada en 5.4
  - las respuestas «Dos», «Seis» o «Uno» sextos en pantalla
  - el recuerdo «Desplegar: lo que no entra justo»
- **La Bitácora en pantalla, el lector de pantalla, «describir acciones», texto grande y movimiento reducido:** sólo leí
  el código.
- **El renglón «3 barras entre 4 → 3/4 de barra cada una»:** no hay captura después de escribirlo. Que se salga del
  pizarrón es una inferencia por su largo.
- **El cap. 6:** está en preparación y sin seguimiento en git. Sólo leí sus primeras líneas para juzgar el gancho.
- **Comprensión de personas:** nada de esto es un playtest. Que algo «se lea mal» o «se sienta cuestionario» es una
  hipótesis a comprobar con jugadores.
