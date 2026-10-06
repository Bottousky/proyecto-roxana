# Arithmos — revisiones, decisiones y regresiones

Cada hallazgo: dónde, cómo reproducir, por qué importa, cómo comprobar la corrección.
Origen: **autor** (revisión del constructor, no independiente) · **rev-mat / rev-narr / rev-func**
(subagente independiente) · **playtest** (persona real).

## Decisiones

| Fecha | Decisión | Motivo | Reversible |
|---|---|---|---|
| 2026-10-05 | Tecnología propia: HTML + módulos ES + Canvas 2D + compuesto WebGL; sin motor ni build | Manuel pidió no heredar decisiones técnicas del repo; una aventura 2D de tiza necesita control del trazo y texto/accesibilidad en DOM | Sí |
| 2026-10-05 | Ubicación `experiments/arithmos/` (como Bitland) y evidencia en `artifacts/arithmos/` | No tocar infraestructura compartida | Sí |
| 2026-10-05 | Tiza codificada por presión en canales RGB (blanca/amarilla/celeste) + umbral contra el diente del pizarrón | Grano físico creíble y estable (sin parpadeo); costo de un cuadro de pantalla | Sí |
| 2026-10-05 | Capítulo 1 = correspondencia, cardinalidad, más/menos, número vs numeral | Base de todas las dependencias; la idea "el número es lo que comparten las colecciones emparejables" es interesante también para adultos | Sí |
| 2026-10-05 | Punto no habla con palabras en el cap. 1; su evolución es expresiva (marcar → escribir) | La evolución cambia cómo percibe y se expresa, no su tamaño | Sí |
| 2026-10-05 | Sin video por ffmpeg; "película" = cuadros del screencast de Chrome + reproductor HTML | No instalar binarios; evidencia de ritmo revisable | Sí |
| 2026-10-05 | Fuentes Kalam (manuscrita) y Atkinson Hyperlegible (lectura limpia), OFL, locales | Legibilidad y licencia verificable; sin servicios externos | Sí |

## Hallazgos del capítulo 1

| # | Origen | Dónde | Hallazgo | Por qué importa | Estado / comprobación |
|---|---|---|---|---|---|
| 1 | autor | Laboratorio de tiza | Trazos con interior sólido: parecían vectoriales | La materialidad de tiza es requisito | Corregido con cerdas y diente más fino; captura `it01/lab-chalk.jpg` |
| 2 | autor | 1.1 | La figura se perdía contra el rayado de luz de la puerta; faltaba un plano cercano para "Tengo las manos de tiza" | Actuación ilegible en el momento de identificación | Corregido: sale de la luz y hay primer plano |
| 3 | autor | 1.5 | Marca + unión vertical + punto se leían como una sola "paleta" o figurita; el contorno abombado de la piedra cruzaba todo | Metáfora visual engañosa justo en la idea central | Corregido: piedra baja de canto plano, puntos emparejados por encima del canto, uniones punteadas; captura `it01/fast-errores/*quien*` |
| 4 | autor | 1.5, 1.9 | Marcas a 23 u y asientos a 34 u: blancos táctiles < 44 px en tablet | Accesibilidad táctil | Corregido: 46 u en ambos; falta medir en tablet real |
| 5 | autor | 1.9 | La fila de la Ronda se superponía con la casa borrada de la búsqueda | Confusión espacial | Corregido: gradas desplazadas 450 u |
| 6 | autor | 1.10 | El encuadre dejaba afuera las gradas: no se veía qué unió Punto con "1" y "4" | Rompía la revelación número/numeral | Corregido: plano `nombre` incluye gradas y pizarra |
| 7 | autor | todo el cap. | Sin línea de suelo las figuras flotaban | Lectura espacial | Corregido: suelo de tiza en tramos |
| 8 | autor | 1.9 | Noche demasiado oscura; asientos casi invisibles | Legibilidad | Corregido: oscurecimiento 0.9, asientos más grandes y marcados |
| 9 | autor | pruebas | Playwright no hacía clic en puntos en movimiento (espera estabilidad) | El probador se trababa, no el juego | Corregido en el probador (`force`) |
| 10 | autor | 1.4 | La Marea casi no se veía (franja tenue en plano general) | Clímax de la primera mitad sin fuerza | Corregido: ola de polvo con partículas que apaga lo que cruza; la piedra y sus marcas reaparecen. Hoja `it01` + `scripts/film-seg.mjs c1.marea` |
| 11 | autor | todo | El subtítulo anterior quedaba sobre la acción siguiente | Texto viejo compite con la imagen | Corregido: se oculta 160 ms después de avanzar si no llega otra línea |
| 12 | autor | 1.7 | "buscar →" quedaba fuera de cuadro (bloqueo real; sólo lo detectó la partida a velocidad real) | Imposible avanzar | Corregido + guarda: todo objeto tocable fuera de cuadro > 1,5 s se reporta como error de consola y falla las pruebas |
| 13 | autor | 1.10 | Escena armada y guion con valores por defecto distintos (crash al abrirla con guardado incompleto) | Pérdida de progreso | Corregido: `seatedMap` único |

### Revisión matemática independiente (rev-mat, 2026-10-05, sobre ef68a58)

Evidencia del revisor: `artifacts/arithmos/it01/review-mat/`. Disposición:

| # | Sev. | Hallazgo | Resolución |
|---|---|---|---|
| M1 | alta | Gradas: asientos más separados que la fila y gradas más anchas que la fila; "la fila es más larga" era falso en pantalla; se podía acertar por el largo de los bancos | Corregido: fila a 60 u (720 u de largo) contra gradas compactas (316 u); la intuición "más largo = más" queda armada y se refuta. Se pide justificar las predicciones afirmativas |
| M2 | alta | "Los asientos ocupados" no eran 14 | Corregido: la frase ya no los nombra; las colecciones emparejadas son las marcas, los presentes y las palabras de "uno" a "catorce" |
| M3 | alta | El registro de Punto no era uno a uno (primera marca de nadie, 13 visitas y 14 marcas) | Corregido: cada marca sigue a una visita (14 visitas, incluido Punto mismo); las 14 uniones finales se dibujan de a una, punteadas, con una nota cada una |
| M4 | alta | El "14" aparecía sin contar; "contar" sólo fracasaba | Corregido: el jugador cuenta las marcas (una palabra por marca, en cualquier orden; repetir avisa); la última palabra dice cuántas; recién entonces se escribe "14" |
| M5 | alta | "'14' son dos signos y nada más" niega la estructura posicional; la opción "en el 14 hay dos" era literalmente cierta | Corregido: "Es una manera de escribir un número"; opción reformulada "el 14 nombra a dos" con respuesta "nombra a catorce" |
| M6 | media | Faltaban "uno a uno" y "colecciones finitas" en la Bitácora | Corregido en abreviatura y cuerpo |
| M7 | media | Confundía la relación "emparejables" con lo que comparten | Corregido: "algo que no cambia entre todas las colecciones que se pueden emparejar así" |
| M8 | media | No reconocía contar como camino válido en las gradas; no había "alcanzan justo" | Corregido: opción "justo"; pregunta "¿Cómo lo sabés?"; contar se reconoce como emparejar con palabras |
| M9 | media | Contar vs marcar en condiciones distintas (velocidades 0.75 y 0.16) | Corregido: misma velocidad; el texto reconoce que contar tildando funcionaría; las marcas se eligen porque Punto no conoce las palabras |
| M10 | media | Gradas no eran transferencia real (la interfaz elegía quién subía; no se interpretaba la sobra; no había conservación) | Corregido: el jugador elige quién va a qué asiento; interpreta el asiento libre; prueba de conservación (Punto los aprieta en una fila corta) |
| M11 | media | Lino aparecía sobre la fila de emparejados (parecía una marca con dos puntos) | Corregido: entra por la derecha, fuera de la fila |
| M12 | media | Saltar animación salteaba conclusiones | Corregido: saltar se detiene en cada línea de diálogo |
| M13 | baja | "no hay uno solo de nada" era falso | Corregido: "¿Qué hace un 1 en el nombre de catorce?" |
| M14 | baja | Bitácora atribuía de más (doble de punto vs de marca; bloqueo de la interfaz; uniones hechas por la ayuda) | Corregido: distingue cada caso; la demostración de la ayuda se usa una vez |
| M15 | baja | La fila de las gradas incluía a Punto sin decirlo | Corregido: "La Ronda y Punto…" |
| M16 | baja | Gramática; "Fin del capítulo" sobre el 14; "Desplegar" sólo un momento | Corregido; dos momentos desplegables |
| M17 | baja | Documentación desalineada | Corregido en CURRICULUM y DESIGN (numeración 1.1–1.10) |
| M18 | baja | "No soy el primero que anota" podía leerse como relato de origen | Corregido: se describe lo visto sin generalizar |

Pendiente: nueva pasada de rev-mat sobre la versión corregida.

### Revisión narrativa y audiovisual independiente (rev-narr, 2026-10-05, sobre la película it02)

Evidencia del revisor: `artifacts/arithmos/it02/review-narr/` (hojas de contacto por tramo, cortes, rutas alternativas). Disposición:

| # | Sev. | Hallazgo | Resolución |
|---|---|---|---|
| N1 | alta | La revelación final era una definición leída (32 % del texto del capítulo en la última escena) | Rehecho: marcas, palabras y presentes se alinean en tres filas columna por columna; una llave y "14"; quedan 3 líneas cortas. Las definiciones viven en la Bitácora |
| N2 | alta | La voz del estudiante pasaba de lacónica a profesor; fórmulas repetidas | Dieta de texto: pensamientos cortos, sin "X es Y"; la fórmula uno a uno queda en la retroalimentación y la Bitácora |
| N3 | alta | Equivocarse no tenía consecuencia en el mundo (cuestionarios por eliminación); la opción correcta se delataba por el registro | Cada respuesta equivocada produce un cambio visible: Punto busca un punto sin línea; Punto impide borrar la marca y revisa; Punto busca a alguien parado o salta en el asiento vacío; los doce sin unir reclaman; Punto se asoma detrás del 14. Opciones con el mismo registro |
| N4 | alta | Todo lo emocional en plano general; Punto ilegible | Primeros planos (≤ 500 u, ≥ 2 s) en la pérdida, el descubrimiento de quién falta, el hallazgo, el baile con el más chico y la primera marca; Punto más grande (r 11) |
| N5 | alta | Figura en reposo como "chupetín"; no actuaba al hablar | Pose de reposo con extremidades separadas; gesto automático al hablar; saludo, sobresalto al toque de Punto, arrodillarse junto a Punto, encogerse de hombros |
| N6 | alta | Clímax de 3 s, último par como hueco único, cortes duros | Reencuentro con todas las marcas y puntos tocables (unir mal se detecta); baile ≥ 6 s con plano cercano; regreso caminando con el más chico; noche que cae sobre la ronda y corte por coincidencia de estrellas |
| N7 | media | Punto pasivo | Guía el registro yendo al siguiente sin anotar; intenta marcar la piedra y falla (prepara su primera marca); imita el salto tardío del que falta; brilla más cerca del escondite |
| N8 | media | Pagos sin preparar (el más chico llega tarde; primera marca) | Primer plano del más chico llegando tarde; intento fallido de Punto en la piedra |
| N9 | media | Ruta "Contarlos" contradecía la imagen y era un riel | Contar es interactivo y funciona (cada uno queda tildado con su palabra); las marcas se eligen porque Punto no conoce las palabras |
| N10 | media | Monotonía: ~76 toques idénticos | Gradas: el jugador sienta a tres y Punto sigue; el recuento final escribe palabras (otra acción) |
| N11 | media | Gradas como ejercicio con pretexto; Punto experimentador sin motivo | El deseo del estudiante abre la escena ("¿Y para mí?"); Punto aprieta la fila por su propio error (cree que es demasiado larga) |
| N12 | media | Signos ilegibles: "!" bajo las marcas, abanico de líneas, pares que parecen figuras | Sin puntitos bajo las marcas; sin abanico; puntos que comparten marca se separan |
| N13 | media | Composición: objetivos al borde, Marea fuera de cuadro | Guarda de 56 px en las pruebas; la Marea avanza dentro del encuadre durante el registro |
| N14 | media | Líneas que narran lo visible | Recortadas o eliminadas |
| N15–17 | baja | Reescrituras puntuales, "Tengo las manos de tiza" sin mirar las manos, detalles | Aplicadas: "¿Son tu familia?", "¿Cómo vas a saber si vuelven todos?", "Ni idea. Mañana.", cabeza inclinada hacia las manos |

Pendiente: nueva película y segunda pasada de rev-narr sobre esta versión.

### Revisión funcional independiente (rev-func, 2026-10-05, sobre ef68a58 y ff90ce6)

Evidencia y scripts del revisor: `artifacts/arithmos/it01/review-func/` (`lib.mjs`, `t1`–`t7`, `p01`–`p08`; con `ARITHMOS_LIVE=1` usan el árbol actual). Disposición:

| # | Sev. | Hallazgo | Resolución / comprobación |
|---|---|---|---|
| F1 | alta | Tras cerrar la pausa, Enter la reabría (foco en ≡) | Corregido: el foco vuelve a la escena. `node scripts/keyboard-check.mjs` → `enterAdvancesAfterPause: true` |
| F2 | alta | La pausa no retenía el foco; se elegía detrás | Corregido: el resto es `inert`, Tab queda atrapado y las elecciones ignoran la entrada en pausa. `keyboard-check` → `focusEscapedPause: 0` |
| F3 | alta | Táctil en teléfono: el toque activaba al vecino y mostraba errores no cometidos (evidencia falseada) | Corregido: el toque elige el objeto cuyo dibujo está más cerca (no el botón de arriba). Partida táctil 844×390 ruta directa: ninguna evidencia de repetición falsa |
| F4 | alta | Saltar se salteaba conclusiones | Corregido antes (ff90ce6) |
| F5 | alta | Con texto grande, las elecciones tapaban la pregunta y la escena | Panel con altura máxima y desplazamiento, letra que se adapta a pantallas bajas; la cámara se corre hacia arriba según el alto real del panel. Pendiente re-medir con `p08` |
| F6 | media | Opciones desde el título fallaba en la primera visita | Corregido: el diálogo se titula "Opciones", abre esa pestaña con el foco adentro y tolera no tener partida |
| F7 | media | Volver a ver/Desplegar desde el título quedaba colgado | Corregido: fuera de la partida esas pestañas y botones no aparecen |
| F8 | media | Un Enter de más elegía la primera opción (y era la correcta) | Corregido: no se acepta elegir antes de 450 ms; el foco llega después; las opciones evaluativas se mezclan |
| F9 | media | Recargar a mitad repetía preguntas y duplicaba evidencia | Corregido en la Ronda, Quién y El nombre (fases guardadas); guardado inmediato en cada acción |
| F10 | media | Con el capítulo terminado, Continuar rejugaba la última escena | Corregido: los capítulos se encadenan; al terminar el último, el título ofrece volver a jugar cada capítulo como partida nueva (la evidencia lleva número de partida y la Bitácora usa sólo la actual) |
| F11 | media | En vertical la escena es diminuta | Aviso para girar el teléfono (se puede seguir igual). Vertical sigue sin optimizar |
| F12 | media | "?" repetido completaba la tarea | Corregido antes (una sola demostración) |
| F13 | media | Emparejar con teclado: ~289 Tab, orden y etiquetas sin posición | Corregido: un solo Tab entra al grupo y las flechas llevan al objeto más cercano en esa dirección; etiquetas con posición ("marca 3 desde la izquierda", "cerca de la marca 5") |
| F14 | baja | Movimiento reducido mantenía la sacudida | Corregido |
| F15 | baja | "Saltar" visible mientras un texto espera | Corregido: sólo durante animaciones |
| F16 | baja | El audio seguía en pausa | Corregido: el contexto de audio se suspende |
| F17 | baja | Un punto que deambula salía de cuadro en tablet | Mitigado (la guarda lo detecta); ajustar casas si reaparece |
| F18 | baja | "Describir" se superponía con "saltar" | Movido debajo de los controles de la esquina |
| F19 | baja | DOM: botón enfocable dentro de `aria-hidden`; pestañas sin `aria-controls` ni flechas | Corregido |
| F20 | baja | En un recuerdo, "Repetir esta escena" no salía del recuerdo | Corregido: "Salir del recuerdo" |
| — | autor | En 844×390 el botón "comprobar" tapaba al más chico y se trababa el reencuentro (lo encontró la partida táctil) | Corregido + guarda: un botón de texto que tape un objeto tocable es error de prueba |

Revisiones narrativa/audiovisual (C1-R2) y funcional (C1-R3): hechas (arriba). Segunda pasada narrativa: pendiente.
Playtests humanos: **ninguno**.

## Revisión matemática independiente, 2.ª ronda (rev-mat-2, 2026-10-06, caps. 1–3)

Informe: `artifacts/arithmos/it03/review-mat/informe.md`. Subagente sin navegador (lectura de código,
textos, Bitácoras, película de la ruta directa de los caps. 1–2). No vio el cap. 3 en pantalla.

| # | Sev. | Hallazgo | Disposición |
|---|---|---|---|
| A1 | alta | Cap. 2: el primer numeral de Punto se leía "41" (sueltos a la izquierda de los atados); igual con 37 | Corregido: al terminar de atar, los sueltos se ordenan a la derecha de los atados |
| A2 | alta | Cap. 3: fichas en atados y registro en palitos con valor posicional (52, 302); saldos que no coincidían con la línea | Corregido: hoja nueva "Cuentas (en atados)"; Recta 4, Oval 4, Curva −3; Oval (4) le paga 2 a Curva (Oval +2), Recta debe 1 (+3). Cada saldo de la línea coincide con su fila |
| A3 | alta | "Me pidieron prestado y ahora debo tres" invertía la deuda; "ya pagué dos" sin atados | Corregido: cada cambio de saldo es una operación del modelo (Mara le paga 1 a Recta: +4; dos deudas anotadas dos veces se sacan: −1 − (−2) = +1) |
| A4 | alta | Gradas: "justo" podía ser correcto contando al estudiante y el juego lo acusaba de contar mal (regresión de M15) | Corregido: la pregunta nombra la colección ("para la Ronda y Punto"); el estudiante, un poco aparte; la devolución a "justo + conté" considera que se contó a sí mismo |
| A5 | alta | Cap. 2 "¿Cuántos más?": tocar dos veces desataba; los atados de Curva no se podían desatar → callejón sin salida | Corregido: tocar de nuevo deselecciona; "desatar" es una acción explícita de cualquiera de los dos lados; aviso si no queda pareja posible |
| M-a | media | Cap. 2 decía "número" por "cifra" | Corregido en las seis líneas |
| M-b | media | "El cero no cuenta nada" | Corregido: "El 0 dice 'ninguno' en ese lugar" |
| M-c | media | Conservación antes de sentar, con opción de identidad (regresión de M10) | Corregido: después del asiento libre, Punto los aprieta y se pregunta cuántos asientos sobran (mismo registro); se vuelven a sentar y se ve |
| M-d | media | "Hice una marca de más" se refutaba con el emparejamiento actual (circular) | Corregido: Punto muestra el registro de la mañana (doce toques, doce marcas) |
| M-e | media | "Hoy llegó más" era verdadero y no se reconocía; el 34 nunca aparecía | Corregido: después del 37 se agrupa la hilera de ayer de a diez (34) y se cierra la pregunta |
| M-f | media | El depósito "de todos" (110) mostraba 302 de los Oval | Corregido: la tiza de los Oval está en su propio depósito |
| M-g | media | La comparación de estantes ocurría dentro de los cuartos del depósito | Corregido: la comparación se hace afuera, a la izquierda |
| M-h | media | Signo y resta sin distinguir en el juego | Corregido: en −1 − (−2) se pregunta qué dice la rayita suelta; Mara explica el paréntesis |
| M-i | media | Perdonar más de lo que se debe; nunca se decía que sacar una deuda es como dar un atado | Corregido: la historia pasa a "deudas anotadas dos veces"; pregunta "¿qué otra cosa la habría dejado igual?" con la respuesta "darle dos atados" mostrada en la línea |
| M-j | media | El orden en la línea se acertaba buscando el rótulo; la pregunta previa con deudas | Corregido: los negativos no tienen número hasta ubicar a las familias; las quejas dicen cuánto faltaría para llegar a cero; la pregunta es "¿qué número es menor: −4 o −1?" |
| M-k | media | "Debajo de cero" y "deber" sin puente; 2 − 5 no se juega | Corregido: Punto cae a −4 "como Espiral, que debe cuatro"; en 3.5 Oval tiene 2 y paga 5 (pares cero) y queda en −3 |
| M-l | media | Pasos y subida del pozo con un solo botón | Corregido: se anticipan los pasos (7/8/1) y en el pozo el jugador elige hasta qué marca sube; si no son cinco, Punto vuelve |
| bajas 1–12 | baja | Mara olvida el cero; Bitácora que atribuye de más; "nombra a los catorce"; "siete atados"; "dejar los diez"; espacio en blanco; el 0 sin lado; "+" sin presentar; textos fantasma anticipados; comentarios | Corregidas 1–10 (el "+" lo presenta Mara con la cruz; los textos fantasma pasan a dibujos). 11: comentario de `ch3/common.js` corregido; `placevalue.js` sin cambios (función sin uso). 12: currículo, pendiente en este ciclo |

## Revisión matemática independiente del cap. 4 (rev-mat-3, 2026-10-06)

Informe: `artifacts/arithmos/it04/review-mat/informe.md`. Sin navegador. Confirmó resueltas casi todas las
correcciones de rev-mat-2.

| # | Sev. | Hallazgo | Disposición |
|---|---|---|---|
| A-1 | alta | "Otra vuelta" aparecía con repartos desparejos y el juego decía "cada una tiene tres" igual | Corregido: sólo aparece cuando todas tienen lo mismo, y no actúa si no; guarda que compara lo que se ve con la cuenta |
| — | alta (autor) | Los atados de la familia 0 se tomaban por "sin dueño" (5 sobrantes) | Corregido antes de la revisión; guardas en reparto y medida |
| M-1 | media | El giro del rectángulo reacomodaba los atados (no era rígido) | Corregido: filas y columnas igual de separadas; el giro cae justo en la grilla (guarda) |
| M-2 | media | La media vuelta no era un giro (positivos y negativos por arriba); la segunda desandaba; (−1)(−1) sin nadie en ±1 | Corregido: giro rígido alrededor del cero (positivos por arriba, negativos por abajo); la segunda media vuelta sigue en el mismo sentido y cierra la vuelta; Punto gira desde +1 |
| M-3 | media | Cantidades del cap. 4 contradictorias (deudas que se duplican; "ayer" eran 12; la huerta 9 × 4 y 4 × 5; 6 atados sin origen) | Corregido: 4.3 es el plano de las casas respecto del pozo (escala, no deudas); "recién, catorce"; la huerta de 9 × 4 es de Rampa; los 6 atados son los guardados para la próxima cosecha |
| M-4 | media | En 2 − 5 los pares cero salían de la nada y Mara cobraba 8 | Corregido: Oval le pide prestado a Mara de a un atado (el jugador decide cuántos); Mara: "me pagaste cinco: dos tuyos y tres que te presté; me debés tres"; guarda de la cuenta |
| A2 parcial | — | Espiral sin fila en el registro | Corregido: se anota (ahora "Cuña", −4) en 3.2 |
| baja 12 | — | Currículo y diseño desactualizados | Corregido (B4–B5 implementado; deuda = atado punteado) |

## Revisión narrativa y de puesta en escena, caps. 2–4 (rev-narr-2, 2026-10-06)

Informe: `artifacts/arithmos/it04/review-narr/informe.md`. Sin navegador; varias capturas eran anteriores al código.

| # | Sev. | Hallazgo | Disposición |
|---|---|---|---|
| A1 | alta | La Marea desaparece después del cap. 2 | Corregido en 3 y 4: la pasada de borrador se lleva las escrituras equivocadas de la deuda y el −3 resiste; la escalera de las Terrazas está borroneada y se redibuja al entender 4 × 3; el gancho 3→4 es la escalera y la piedra |
| A2 | alta | Mara pasa a enunciar reglas y conclusiones | Corregido en 3–4: las conclusiones las dice o piensa el estudiante (|x|, paréntesis, 6 ÷ 0); Mara reacciona y anota |
| A3 | alta | El estudiante pierde voz y autoría | Corregido: el estudiante escribe las igualdades del cap. 4 y |−4| = |+4| = 4; rodea él la hilera de ayer en 2.3; más líneas dichas |
| A4 | alta | Cuestionario encadenado y acciones de un solo botón | Parcial: 4.3 pasa a elegir la operación (× 2 / + 2 / × (−2); × (−1) / − 4 / × 0) con consecuencia; 4.6 se para cuando el jugador quiere; 2 − 5 se pide prestado de a uno. Quedan predicciones por escena en 3 y 4 |
| A5 | alta | Cuentas contradictorias entre escenas y capítulos | Corregido (ver rev-mat-3 M-3); 3.1 reconcilia con el cap. 2 ("desde que todos devolvieron lo que les sobraba") |
| A6 | alta | La evolución de Punto se decreta y se pierde | Corregido: la flecha se estrena en 3.7 con reacción del estudiante, se guarda (`flags.puntoArrow`) y sigue en los caps. 4–5; en 3.1 Punto se equivoca de verdad (pone la rayita detrás del 3) |
| A7 | alta | Las familias del cap. 4 repetían cabezas | Corregido: cabezas nuevas (escalón, rombo, semicírculo, hexágono) y nombres escritos en los escalones; Espiral pasa a llamarse Cuña (cabeza triangular) |
| A8 | alta | Las primeras cifras de Punto, fuera de cuadro y bajo el suelo | Corregido: estudiante dentro del plano, primer plano, cifras arriba del suelo, Punto se aparta |
| M1 | media | "Como dije / lo anticipé" | Corregido en caps. 2–5 |
| M2 | media | Ganchos repetidos | Corregido 2→3 y 3→4 |
| M3–M7, M9, M12 | media | Cierres sin decisión, redundancias, reglas antes de actuar, motivos débiles, monotonía del depósito, lugares sin rótulo, deseo del protagonista | **Pendiente** (anotado en el backlog) |
| M8 | media | Composición | Parcial (notas del cap. 4; rótulos de nombres). Pendiente: atenuar la pizarra del cap. 1 en el 2, mancha del cero |
| M10 | media | Bitácora más manual que recuerdo | Corregido: "Lo que pasó" primero, "Lo que eso dice" después; el aviso dice dónde está (≡) |
| M11 | media | Rótulos repetidos, botones sin verbo, eventos sin describir | Corregido en 2–4 (posición en rótulos, botones con verbo, descripciones nuevas) |
| M13 | media | "4 + 3 = 7" ilegible en teléfono | Parcial (primer plano de la piedra); pendiente inserto de la pizarra |
| M14 | media | 2 − 5: los pares se agregaban de a tres | Corregido |
| — | (autor) | El 4 de la tiza (Kalam) se confunde con el 9 | Corregido: familia "Tiza" = Kalam con el 4 de Atkinson Hyperlegible (unicode-range), también en subtítulos y opciones |
| B1–B13 | baja | Varios | Corregidos B1, B2 (saldos en blanco; el amarillo es de Punto), B3, B6, B8, B12; el resto pendiente |

## Revisiones independientes del cap. 5 (rev-mat-4 y rev-narr-3, 2026-10-06)

Informes: `artifacts/arithmos/it05/review-mat/informe.md` y `artifacts/arithmos/it05/review-narr/informe.md`.
Ambas sin navegador, sobre el commit 074d296. Corregido en el commit siguiente:

| Origen | # | Hallazgo | Disposición |
|---|---|---|---|
| mat | A-1 | n/d definido como "n partes de las d" (hacía imposible 5/4) | Corregido: "n pedazos del tamaño que entra d veces justo"; la opción de 5/4 ya no se apoya en la definición vieja; Bitácora |
| mat | A-2 | Devolución falsa ("un salto más" desde 1/4) | Corregido: cuenta los saltos que faltan |
| mat | A-3 | Cinco décimos más largos que una barra | Corregido: todo lo guardado en las cajas a la misma escala; la media barra se parte en décimos que se achican junto con ella |
| mat | A-4 | La diagonal: "no cierra en decimales" usado como evidencia | Corregido: el jugador mide con mitades, tercios, quintos, séptimos, décimos o doceavos; contraejemplo de 1/3 (no cierra en décimos y en tercios entra justo); el límite de la prueba se declara |
| mat | medias | Regla de partes iguales; "en 3" rechazado; "no eran vecinas"; cantidades entre escenas; porqués; "cuarto" ambiguo; fracciones de pie; Bitácora que atribuye de más; cociente, 0,75, 1/2 en la recta | Corregidos: "a cada una le tiene que tocar lo mismo"; "en 3" válido (2/3 + 1/12); "en cuartos son vecinas"; historias coherentes (barra extra para Cornisa y Peldaño; Cornisa le da 1/3 de lo suyo; las barras de Mara); el jugador elige la partición común (6/7/12; 5/6); "diez décimos hacen una barra"; % como centésimos y misma cuenta dada vuelta; "cajas" en vez de "cuartos"; raya de las fracciones; 3 ÷ 4 = 3/4; 3/4 = 0,75; 1/2 rotulado. **Pendiente:** multiplicar por una fracción en general (sólo × 1/2 como 50 %) |
| narr | A1 | Agencia: casi todo menú | Parcial: 5.5, 5.6, 5.7 y 5.9 pasan a acciones con decisión (particiones, cajas, mediciones) |
| narr | A2 | Cuentas contradictorias | Corregido (ver mat) |
| narr | A3 | La Marea ausente | Corregido en 5.1: una brisa se lleva la nota vieja "medio" (sin decir de qué) |
| narr | A4 | El 5 se lee S y el 1, l | Corregido: todas las cifras de la tiza con el diseño de Atkinson Hyperlegible |
| narr | A5 | Voces de aula | Parcial: el estudiante le habla a Punto y concluye; Mara ya no define la coma ni cierra la diagonal |
| narr | A6 | Composición | Parcial: primer plano de las barras punteadas, inserto en la recta, escalas, nombres de las familias en el suelo |
| narr | M1–M10 | Ganchos, errores de Punto con la misma puesta, opciones obvias, motivos débiles, "cuarto", nombres, 2,05 escrito, Bitácora, repeticiones, accesibilidad | Parciales: gancho 4→5 reescrito (el atado rajado); Punto se corrige solo; "cajas"; nombres; 2,05 escrito; Bitácora de 4 párrafos. Pendientes: motivos de 5.4/5.8 y más primeros planos |

## Regresiones
- rev-mat-2 encontró regresiones de M10 y M15 introducidas por la reescritura `f3974ca` (corregidas arriba).
