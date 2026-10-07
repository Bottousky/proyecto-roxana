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

## Revisiones independientes del cap. 6 (rev-mat-5 y rev-narr-4, 2026-10-06)

Informes: `artifacts/arithmos/it06/review-mat/informe.md` y `artifacts/arithmos/it06/review-narr/informe.md`.
Ambas sin navegador, sobre el commit 22d9276. Todas las igualdades de la pizarra eran correctas; 65/65 pruebas.
Corregido en el commit siguiente (evidencia en `artifacts/arithmos/it07/c6-*`):

| Origen | # | Hallazgo | Disposición |
|---|---|---|---|
| mat | A1 | 6.8: sólo −1 → ÷2 terminaba; dividir primero o −7 dejaban sin salida; el rescate se contradecía; renglones superpuestos | Corregido: paleta −1, ÷2, −1/2, −7, un paso inválido y **deshacer** (borra el renglón); con tres renglones sólo se ofrece deshacer; rescate a los 10 pasos, con texto coherente; la ruta directa del bot recorre ahora el camino ÷2 → −1/2 |
| mat | A2 | «3 = x ÷ 4»: «siguen juntos» con los marcadores separados; «0,063x» | Corregido: los textos ya no dicen «juntos»; el jugador lleva a Punto al 12 y ahí sí coinciden; `fmt` escribe fracciones exactas hasta /100 y los coeficientes como «x/16», «3x/4» (prueba nueva) |
| mat | A3 | 6.7: «con Punto en el 0» con Punto en otro lado | Corregido: Punto vuelve al 0 antes de elegir; además se marcan debajo de la recta **todas** las x enteras que cumplen, antes y después (el conjunto se ve, no se infiere de un punto) |
| mat | A4 | «Resolver es buscar dónde coinciden» confundía el valor común con la solución | Corregido en Bitácora, consigna de 6.1, encabezado de `equations.js`: «para qué x coinciden» |
| mat | M1 | Criterio de un solo punto | Parcial: 6.4 dice que «que el 8 siga sirviendo no alcanza»; 6.2 nombra la otra solución de la cuenta rota (x = 5). Pendiente: mover a Punto después de la transformación válida |
| mat | M2 | Dos condiciones mezcladas | Corregido: «se puede hacer con cualquier x» (no se pierde) y «se puede deshacer» (no aparece), en 6.2 y en la Bitácora; ÷x clasificado como «no se puede hacer en x = 0». Pendiente: decisión predictiva antes de ver el resultado |
| mat | M3 | 6.6: «son dos» sin justificar; «no da nada» | Corregido: casos (x ≠ 0 → x = 1; x = 0 aparte); «no está definido, no hay ningún número» |
| mat | M4 | 6.5: el jugador no comprueba el −3 | Corregido: la cuenta original vuelve a la recta con Punto en −3 y los marcadores se separan |
| mat | M5 | «debajo de 6», «izquierda» ambigua, sin contraste | Corregido: «dar menos que 6», «primer miembro»; contraste ÷2 sin vuelta |
| mat | M6 | La línea equivocada de Recta quedaba en la pizarra | Corregido: la Marea la borra (también rev-narr A1) |
| mat | M7 | Bitácora atribuía de más | Corregido: distingue camino propio y rescate, «Elegiste comprobar» sólo si lo eligió, respuestas separadas, «todo camino válido que deja sola a la x da el mismo número» |
| mat | M8 | 6.8 sin paso inválido | Corregido: «÷ 2 sólo al 2x», con su consecuencia (sólo se mueve un marcador; la cuenta pide otra x) |
| mat | M9 | Cobertura: sistemas, factorización, identidad, conjunto solución | Parcial: conjunto solución visible en 6.7; factorización en 7.5–7.6. Pendiente: sistemas (C6b en el backlog), identidad nombrada, ficha §5 de D |
| mat | M10 | Gancho «x · x = 2» de oídas | Corregido: el gancho es una pregunta de Peldaño (huerta cuadrada de dos cuadros); 7.1 lo resuelve con la construcción de cortar dos cuadros en triángulos |
| mat | M11 | El bot tocaba un botón y se ejecutaba otro | Corregido en `ui.js`: los botones nuevos se ubican al crearse (antes quedaban en el origen hasta el cuadro siguiente) |
| mat | B3–B9, B11 | Varios | Corregidos B3 (nombre de prueba), B4 (`holds` en la evidencia), B5 (2x en la Bitácora), B6, B8 («en palabras, sin símbolos»), B9, B11 («x = 5 + 3 = 8»). Pendientes: B1 (marcadores fuera de escala), B10, B12 |
| narr | A1 | La Marea no actúa | Parcial: borra la cuenta de memoria de Recta en 6.3. Pendiente: la pasada grande del cierre |
| narr | A2 | Desfile de vecinos con trucos | Pendiente (replanteo: atar cada escena al saldo de cada familia del cap. 3) |
| narr | A3 | Punto como cursor | Parcial: «vos hacés de lo que hay en la caja»; reacciona al paso inválido. Pendiente: que se ofrezca, se equivoque y tenga un primer plano |
| narr | A4 | Texto contra imagen | Corregido (ver mat A1–A3, M7) |
| narr | A5 | «Pasa sumando» en un solo punto | Parcial (conjunto de 6.7; ver mat M1) |
| narr | A6 | Puesta de diapositiva | Pendiente |
| narr | M1–M10 | Costuras, caja de 6.1, opciones largas, nombres, izquierda/derecha, inválidos siempre ajenos, Bitácora, accesibilidad | Parciales: gancho 6→7 sin adelantar el descubrimiento; izquierda/derecha; el jugador tiene en la mano un paso inválido (6.8); descripciones nuevas en 6.3, 6.5, 6.7, 6.8; botones con verbo. Pendientes: caja de 6.1, longitud de las opciones, blancos táctiles de la recta en teléfono |

## Revisiones independientes del cap. 7 (rev-mat-6 y rev-narr-5, 2026-10-06)

Informes: `artifacts/arithmos/it07/review-mat/informe.md` y `artifacts/arithmos/it07/review-narr/informe.md`.
Ambas sin navegador, sobre b5ed429. Todas las igualdades de la pizarra eran verdaderas. Corregido
en el commit siguiente (evidencia: `artifacts/arithmos/it08/c71-trace` ruta directa, `it08/c7-errores2`):

| Origen | # | Hallazgo | Disposición |
|---|---|---|---|
| mat | A1 | Logaritmo mal definido («cuántas veces para llegar a mil» contado con duplicaciones enteras) | Corregido: se distingue «pasar mil» (10 duplicaciones) de «llegar justo» (el exponente no entero); media duplicación = × √2 (de 7.1), 2^9,5 ≈ 724; Bitácora reescrita |
| mat | A2 / narr A3 | Barras de 7.2 recortadas en 130 | Corregido: la escala se achica para todo a la vez (barras y raya del 100), con descripción; la carrera dura 8 días |
| mat | A3 / narr A3 | Ficha x fuera de escala en 7.7 | Corregido: se avisa que x se dibuja de un largo cualquiera (7.5) y, hallado x = 2, la huerta se redibuja a escala y se cuentan 8 y 9 |
| mat | M1 | «Por sí mismo da dos» | Corregido: «área 2; multiplicado por sí mismo da 2» |
| mat | M2 | 2⁰ sin regla de partida | Corregido: «se empieza en 1»; 2⁴ = 1 · 2 · 2 · 2 · 2; la réplica usa la regla y la tabla |
| mat | M3 | Notación científica: mantisa 1–9 | Corregido en la Bitácora; pendiente un caso como 3 040 000 |
| mat | M4 / narr A3 | «El lado de antes no lo sé» contradice 7.1 | Corregido: x es un lado todavía no decidido; «una cuenta que sirva para cualquier lado» |
| mat | M5 | «Ese rectángulo no se arma» como definición | Corregido: «con estas fichas»; se nombra 0 + 5 y que con lados no enteros se podría |
| mat | M6 | −4 por analogía | Corregido: renglón x + 1 = 3 o x + 1 = −3; se prueba −4 en la cuenta (16 − 8 = 8); se quitó la línea de Oval repetida |
| mat | M8 / narr A2 | 7.9 sin x = 0; dominio de la cuenta vs del reparto | Corregido: se pueden probar 0 y 1 (con resultados negativos); Rampa distingue la cuenta (x ≠ 2) del reparto (más de dos) |
| mat | M9 | Gancho «partí la diagonal» | Corregido: «partí el lado» |
| mat | M10 | Bitácora: objetos, exageraciones, atribuciones | Corregido en párrafos 1, 2 y 4 y en las ramas de «lo que pasó» |
| mat | M7, M11 | Completar el cuadrado con un solo b; cobertura de E (propiedades de potencias, otras raíces, √(x²) = |x|, sucesiones, racionales) | Pendiente (backlog C7b) |
| mat | B | «faltan una tira», «Las otras 1» | Corregido |
| narr | A2 | El juego da el paso decisivo | Parcial: en 7.4 se puede contar el 3 (el error de Punto) y tiene consecuencia; en 7.9 se prueban 0 y 1. Pendiente: 7.1, 7.5, 7.6 |
| narr | A4 | 7.8 ya resuelto por la tabla de 7.2 | Corregido: 7.2 termina en el día 8 (256) |
| narr | A5 | Teléfono | Parcial: interacciones en plano cercano, botones separados, guarda de superposición; pendiente: predicciones lejanas en 7.5 y 7.7 |
| narr | A1, M1–M10 | Plantilla, Punto oyente, voces, la Marea, opciones, costuras, composición, Bitácora | Pendientes (backlog N7-R) |

## Revisiones independientes del cap. 8 (rev-mat-7 y rev-narr-6, 2026-10-06)

Informes: `artifacts/arithmos/it08/review-mat/informe.md` y `artifacts/arithmos/it08/review-narr/informe.md`.
Ambas sin navegador, sobre 55e9eee. Todas las igualdades y construcciones eran exactas. Corregido en el
commit siguiente (evidencia: `artifacts/arithmos/it08/c8b-directa`, `it08/c8b-errores`, `it08/c81-check`):

| Origen | # | Hallazgo | Disposición |
|---|---|---|---|
| mat | A1 | 8.1: «el dibujo no prueba nada» mal dicho; q < p < 2q implícito; la pregunta del descenso sin «si hubiera»; la contradicción no se cierra | Corregido: el estudiante dice q < p < 2q (y por qué); los nuevos lados son enteros positivos y más chicos; la pregunta lleva «si hubiera un par de enteros»; las tres ramas cierran la contradicción; la Marea borra los dibujos y quedan la cuenta y el razonamiento escritos; Bitácora |
| mat | A2 / narr A5 | 8.8: la sombra de la tarde apuntaba al sol; la conclusión dependía de eso; no se veía | Corregido: la sombra apunta lejos del sol (derecha a la mañana, izquierda a la tarde), en azul y gruesa; la tabla anota el largo y el sentido; se tocan las 5 horas; 8.8 ya no concluye: deja la pregunta «sólo con el largo, ¿se sabe la hora?» y el cap. 9 la contesta hablando del largo |
| mat | M1 | «A + B + C» suma puntos | Corregido: ∠A + ∠B + ∠C = 180° |
| mat | M2 | 8.3: el marco equivocado quedaba al costado | Corregido: la caja del marco transformado se apoya sobre la ventana (con un corrimiento chico cuando no calza) |
| mat | M3 | Vocabulario, iguales también semejantes, el marco ancho | Corregido: congruentes/semejantes, × 1, el ancho con los mismos ángulos pero lados no proporcionales; sin adelantar «cuatro ventanas» |
| mat | M4 | Sólo k = 2; «¿cuánta tierra más?» | Corregido: pregunta por el total; se menciona × 3 → × 9 y × 27 |
| mat | M5 | 8.6: el hueco «cuadrado» tomado del dibujo | Corregido: los dos agudos suman 90° (por 8.2) y queda 180° − 90° |
| mat | M6 | c sin nombrar | Corregido: catetos, hipotenusa; cateto² + cateto² = hipotenusa² |
| mat | M7 | 8.7 sin transferencia | Parcial: 3 − (−1) = 4 y 2 − (−1) = 3 explícitos; opción sin los números. Pendiente: otro triángulo |
| mat | M8, M9 | Conclusiones con horas no vistas; Bitácora | Corregido (todas las horas; ramas de la Bitácora; gramática) |
| narr | A3 | Punto desaparece | Parcial: en 8.5 Punto escribe «misma cerca = misma tierra» y lo borra él mismo |
| narr | A4 | La Marea no aparece | Corregido: borra los dibujos de la prueba de √2; el razonamiento queda |
| narr | A5 | Cajas de 8.4 ilegibles; huerta 2 × 2 contra el cap. 7; la puerta | Corregido: la caja grande por pisos, vista de arriba; la huerta es la de 3 × 3; Peldaño deja √2 en la puerta |
| narr | M4 | El gancho 8→9 ya resolvía el cap. 9 | Corregido: queda como pregunta |
| narr | A1, A2, A6, M1–M3, M5–M7 | Plantilla sin hilo ni clímax, agencia, teléfono, voces, opciones, costura 7→8, composición, accesibilidad, Bitácora | Pendientes (backlog N8-R) |

## Revisiones independientes de los caps. 9 a 12 (rev-mat-8, rev-narr-7, rev-mat-9, rev-mat-10, 2026-10-06/07)

Informes: `artifacts/arithmos/it09/review-mat/informe.md` (cap. 9), `it09/review-narr/informe.md` (cap. 9),
`it10/review-mat/informe.md` (cap. 10) e `it10/review-mat-11-12/informe.md` (caps. 11 y 12). Todas sin
navegador. En los cuatro capítulos, todas las igualdades escritas eran verdaderas; los hallazgos altos son
de definiciones, alcance y frases falsas en su lectura literal.

| Origen | # | Hallazgo | Disposición |
|---|---|---|---|
| mat-8 (9) | A1 | «Una regla se comprueba con uno nuevo» | Corregido (40ceece): un caso que coincide no prueba; Mara dice que la hizo ella; Bitácora |
| mat-8 (9) | A2 | 9.7: escalones contados unidos con curvas; «se cruzan antes del día 6» | Corregido: sólo puntos por día, escala vertical, «el día 6 la de Punto pasa a la de Mara» (`it10/c97-check`) |
| mat-8 (9) | A3 | 9.8: «noche» para horas sin medir; tiempo sin escala; invierno | Parcial: el texto distingue noche (no definida) de horas sin medir y dice que el dibujo achica los huecos; invierno corregido. Pendiente: tiempo a escala |
| mat-8 (9) | M1–M8 | Imagen sin alcance, «la sombra» por «el largo», relación sin definir, máquina de Punto sin dibujar, ola decorativa, criterios de unir, citas no vistas | Corregidos M1, M2, M3, M4 (texto), M6, M7 (criterio de la entrada), M8. Pendientes: M5 (dibujar la máquina de Punto), M9, M10 |
| narr-7 (9) | A1–A4 | Plantilla, el juego da el paso, gráficos que son dibujos, teléfono ilegible | Pendientes (backlog N9-R); A3 parcial con los cambios de mat-8. A2 en 9.4 (ciclo 8): el jugador mueve la recta parada sobre cada dibujo, ve los cortes contados y decide cuando quiere; si se equivoca, se le muestra la entrada que lo contradice (`it11/c94b-directa`, `it11/c94-tel`). A2 en 9.2: el jugador arma la regla con dos piezas y la máquina la prueba renglón por renglón contra lo anotado; una regla falsa falla en un renglón visible, aunque coincida en otro (`it11/c92-errores`). A2 en 9.1: la tabla de 8.8 queda a la vista y el jugador dibuja las flechas al revés desde el 2 (una hora equivocada recibe su nota); del 2 salen dos (`it11/c91-errores`, `it11/c91-tel`). A2 en 9.8: primero se anticipa mañana a las 10 con un solo día dibujado y después se mide; la pregunta final es una transferencia (dentro de diez días, a las 8); horas y el 2 rotulados (`it11/c98-errores`, `it11/c98b-directa`) |
| mat-9 (10) | A1 | «Tres pedazos son media vuelta y un poco más» (falso: 3 < π) | Corregido: la opción es «cuatro, como los rayos dibujados»; se dice que el borde es π veces el diámetro; 360° = 2π en la pizarra; π «no es fracción» en vez de «no termina» |
| mat-9 (10) | A2 | «Dos cuartos: vuelta entera» | Corregido: media vuelta, como × (−1); regla (a, b) → (−b, a) |
| mat-9 (10) | A3 | Pares de atados como rectas continuas; «la solución está donde se cruzan» | Corregido: sólo puntos (filas de pares), el cruce tiene que caer en un punto entero, caso de filas iguales; Bitácora con «primer grado» |
| mat-9 (10) | M1–M14 | Cuerda vs arco, radianes sin uso posterior, sen 30° sin justificar los 60°, coseno sólo nombrado, 390° ya dibujado, rampa sin ángulo marcado, semejanza por ángulos, punto vs flecha, i sin regla, baldes con período 3, Bitácora | Parciales (M2 360° = 2π; M10 regla del cuarto). Pendientes en C10-R |
| mat-10 (11) | A1 | 11.7: los datos no apoyaban «el viento trae las dos»; se afirmaba la causa | Corregido: datos nuevos donde, con el mismo viento, más polvo no trae más borrones; el estudiante compara de a pares y dice que son pocos días; Bitácora sin afirmar la causa |
| mat-10 (12) | A2 | El final extrapola «duplica» con 4 puntos sin declararlo | Corregido: «si sigue duplicando» en la pregunta; el estudiante dice que otra regla podría pasar por los mismos puntos y que se anota como suposición; 12.1 y la Bitácora dicen «si la regla sigue igual» |
| mat-10 (11, 12) | M1, M5, M6, M7, M8 | «No dice nada del próximo caso»; «cuánto subió» ambiguo; «las rectas suben»; la tangente como «apenas toca»; la falacia «crecen cada vez menos» | Corregidos |
| mat-10 (11, 12) | M2–M4, M9, M10 | Eje logarítmico sin decir, «4 seguros» con 5 días, equiprobabilidad de los dados, valor absoluto sin dibujar, cobertura de J | Pendientes (C11-R, C12-R) |

## Revisión narrativa de los caps. 10 a 12 (rev-narr-8, 2026-10-07)

Informe: `artifacts/arithmos/it10/review-narr-10-12/informe.md` (sobre a3cc472, sin navegador).

| # | Hallazgo | Disposición |
|---|---|---|
| A1 | El cierre no cierra: la predicción no se pone a prueba, la Marea borra lo medido y deja lo supuesto, la escalera de 30 contra la de mil del cap. 7 | Corregido: la cuarta noche llega a 16 sobre la curva («la suposición aguantó una noche más: no es una prueba»); se redibuja a tiempo; la Marea grande pasa en su plano y la escalera resiste; «Llegamos»; la escalera es la de las Terrazas |
| A2 | El arco de Punto se cuenta en vez de mostrarse | Parcial: Punto corre por la curva mientras se dice su viaje. Pendiente: que Punto anticipe algo él mismo, se equivoque en 10 y 12, y los cabos sueltos («¿Cómo te llamás?», la Ronda) |
| A3 | Plantilla en las 24 escenas, menús evaluados, un solo botón | Parcial (ciclo 8): 10.2 deja elegir hasta qué ángulo girar (30° a 150°) y cuándo parar, con una predicción al pasar los 90° (la altura de 120° es la de 60°; el costado se hace negativo) (`it11/c102-*`). 12.5: el jugador elige qué tramo medir, también hacia atrás del 1 (del 0,9 al 1: 4,1), y decide cuándo alcanza; por los dos lados se encierra el 4 (`it11/c125-*`). 11.1: el jugador decide hasta cuántos baldes subir (10 a 1000), puede pedir otra tanda desde cero (empieza en 90 % y termina en 67 %) y decide cuándo alcanza (`it11/c111*`). 12.6: el jugador elige en cuántos pedazos partir y puede mirar los rectángulos por arriba (8,25 por abajo y 9,75 por arriba encierran el 9) (`it11/c126-*`). 10.6: antes de girar, el jugador anticipa adónde va (3, 1) (las otras opciones son girar a favor del reloj y reflejar) (`it11/c106-*`). El pozo existe fuera de la pizarra: 10.1 abre en el pozo sin soga, y en 10.8 cada balde sube de verdad en el pozo (lleno o a medias, con la rueda girando) mientras se anota en la pizarra (`it11/well*`). 11.6: el jugador marca él mismo los casilleros que suman 7 y el que suma 12 y decide cuándo están todos (un «ya están» antes de tiempo recibe «faltan: forman una diagonal»); abre con Rampa tirando dos seises en la fiesta, de donde le viene apostar al 12 (`it11/c116*`). Pendientes: 10.3, 11.4, las Terrazas de noche (12.8) |
| A4 | Gráficos ilegibles para decidir (también en teléfono) | Parcial: en teléfono acostado la pizarra crece ~30 % mientras se toca (a3cc472). Pendiente: rótulos chicos a 1600×900 (11.4, 11.7) y predicciones hechas con el texto ocupando la pantalla |
| A5 | Imagen contra tesis en las costuras (baldes con ciclo de tres, eje logarítmico sin decir) | Pendiente (N10-12) |
| M1–M9 | Voces, Marea, costuras, cuentas, opciones, accesibilidad, composición, Bitácoras, 12.1 | Pendientes (N10-12); 12.1 ya elige en el panel de opciones |

### Medias aplicadas después (2026-10-07)

| Origen | # | Disposición |
|---|---|---|
| mat-9 (10) | M6 | 10.3: la pregunta por los 390° llega antes de dibujar la segunda vuelta |
| mat-9 (10) | M13 | 10.8: los baldes ya no siguen un ciclo visible de tres |
| mat-10 (11) | M2 | 11.1: se dice que cada marca es diez veces más; raya de 2/3; sin «nunca da exacto» |
| mat-10 (11) | M3 | 11.3: «en estos cinco días», sin «seguros» |
| mat-10 (11) | M4 | 11.6: se dice que se cuenta cuál dado es cuál y por qué los 36 pares son igual de posibles |
| mat-10 (12) | M10 | 12.1: se suma la familia del «¿cuántas veces?» (logarítmica), seis formas |
| mat-9 (10) | M1 | 10.1: en la rama «seis justos» se dibuja el hexágono del compás (cuerda) y se dice que la soga va por el borde, que es más largo; el relleno automático numera las piezas (`it11/c10m-errores/004`) |
| mat-9 (10) | M3 | (ya en 6059140) «π no es ninguna fracción»; Bitácora: «3,14 es una aproximación» |
| mat-9 (10) | M4 | 10.2: se marcan la manija a 30° y su reflejo; se justifican las otras dos esquinas de 60° (lados iguales, suma 180°); «la manija está a medio rayo de altura» en vez de «la altura» |
| mat-9 (10) | M5 | 10.2: el costado se dibuja en cada giro y va a la tabla (giro, alto, costado); triángulo rayo-alto-costado con esquina recta; 0,5² + 0,87² ≈ 1 con el redondeo dicho; costado negativo a la izquierda (`it11/c10m-errores/008`) |
| mat-9 (10) | M7 | 10.4: arco del ángulo al pie, cuadradito en la esquina recta, «el largo es el de la tabla, no lo que ocupa en el piso»; Bitácora con qué largo y qué ángulo |
| mat-9 (10) | M8 | 10.4: «en un triángulo, la esquina recta y la misma inclinación dejan la forma fija; la ventana tenía cuatro lados»; rampa nueva de 60° y largo 4 con decisión (4 · 0,87 ≈ 3,5), donde «la mitad» ya no sirve (`it11/c10m-errores/015`) |
| mat-9 (10) | M9 | 10.5: la casa de Rampa vuelve a (3, 2) como en el cap. 8; ninguna flecha es (3, 2); suma coordenada a coordenada escrita; el paralelogramo vale para cualquier par (`it11/c10m-errores/019`) |
| mat-9 (10) | M10 | 10.6: «contra el reloj» en el diálogo y la Bitácora; i es el número un rayo arriba del cero; 3 + i rotulado; i · (3 + i) = −1 + 3i escrito; 2i explicado sin ambigüedad; −2i también (`it11/c10m-errores/023`) |
| mat-9 (10) | M11 | Cap. 9: pizarra, opción, diálogo y Bitácora dicen «con números de la recta»; en 10.6, «eso sigue valiendo en la recta»; Bitácora del 10 lo reconcilia |
| mat-9 (10) | M12 | 10.7: se escriben las dos tablas (la azul, de las paralelas) y el estudiante lee el paralelismo en la tabla; caso de la misma recta («el doble suma 14»); Bitácora con «primer grado» y la lectura de la tabla |
| mat-9 (10) | M14 | Bitácora del 10: cada rama dice lo que el jugador eligió (sin «pensaste otra altura» para «no se sabe», ni «buscaste un par» para «muchos»); abreviatura «multiplicar por i gira un cuarto de vuelta» |
| mat-9 (10) | M6 (rama) | 10.3: la rama «no se sabe» recibe su propia respuesta |
| mat-10 (12) | M9 | 12.7: se dibuja la V (lo lejos del cero) con sus dos tramos, −x y x; «con −4, −x es −(−4) = 4»; se cita la línea de la ladera del cap. 3, no el pozo |
| mat-9/10 | resto | Pendientes: mat-9 B (bajas); mat-10 M10 en parte (perillas en el cierre, polinomios de grado mayor) |

## Revisión matemática de los arreglos del cap. 10 y de la escena 7.3b (rev-mat-11, 2026-10-07)

Informe: `artifacts/arithmos/it11/review-mat-c10b/informe.md` (sobre 6e9b3f4, sin navegador, con capturas).
Veredicto: los arreglos de rev-mat-9 resuelven M1, M4, M5, M7, M10, M11, M14 y la M9 de 12.7; M8 y M12 quedaban
parciales por dos errores nuevos. 7.3b: todas las cuentas y dibujos correctos.

| # | Hallazgo | Disposición |
|---|---|---|
| A1 | «La ventana tenía cuatro lados»: era una ele de seis | Corregido: «una ele, con seis lados: con más de tres lados, los ángulos no alcanzan» |
| A2 | La raya de la tabla se dibuja como «/» y la matriz se lee como fracciones | Corregido: la raya es un trazo derecho dibujado aparte; la descripción dice «raya» |
| M1 | Lugar y flecha se vuelven a juntar sin decir por qué | Corregido: «la suma es la flecha (3, 2), la que va derecho del pozo a la casa; desde el cero se anotan igual»; i es «la flecha (0, 1)»; Bitácora |
| M2 | 7.3b usa 4⁵, 4³, 8² sin definir otra base | Corregido: «4³ es empezar en 1 y multiplicar por 4 tres veces» antes de la primera pregunta; «con cualquier número abajo, se cuentan factores iguales» |
| B1–B5 | «cualquier inclinación» con tres filas; «es 0,87»; rama «no se sabe»; 180°; dos manijas | Corregidos: con la rueda se gira y se lee el alto; «casi 0,87»; respuesta propia; «las tres suman 180°»; se borran las rayas de los 90° y se dice «la marca de los 30°» |
| B6–B10 | Hexágono sólo en una rama; rama `none`; 2i como número; criterio de paralelas; paralelogramo aplastado | Corregidos: el hexágono se dibuja en las tres ramas; «multiplicado dos veces»; «multiplicar por 2i»; criterio con «por un mismo número»; «si no van en la misma dirección» |
| B11 | 12.7: Recta y Cuña estaban en la línea del depósito | Corregido (la notación \|x\| queda en la Bitácora: la letra de tiza inclina la raya) |
| B12–B14 | Reglas y exponentes 0 y −1; despliegue sin lector de pantalla; rama `4` de la Bitácora | Corregidos: «cuando los exponentes cuentan factores»; `unfold` describe los factores; «sumaste arriba y multiplicaste abajo» |
| B15 | «Nombre:» en caps. 7 y 10 | Corregido (18 líneas) |
| M13 (resto) | «que hayan salido llenas» con el balde 6 a medias | Corregido: «lo que salió antes no cambia lo que sale ahora» |

## Revisión de lo nuevo del ciclo 8: 9.2, 9.4, 6.4, 12.1, 12.4 (rev-c8, 2026-10-07)

Informe: `artifacts/arithmos/it11/review-c8-nuevas/informe.md` (matemática y agencia, sin navegador, con
capturas y registros del bot).

| # | Hallazgo | Disposición |
|---|---|---|
| A1 | Las Bitácoras leían evidencia de otros capítulos con el mismo nombre (12 tomaba la de 9.1; 5 escribía «undefined» con la de 4) | Corregido en las doce: cada Bitácora lee sólo la evidencia de sus escenas. Chequeo estático: ninguna depende de otro capítulo; la del 5 dice ahora «Cortaste las barras en 4» (`it11/r2-c45`) |
| A2 | 9.2 se resolvía probando combinaciones; la segunda pieza se elegía a ciegas | Corregido: con la primera pieza sola, la pizarra muestra lo que da en cada renglón (2, 4, 6 al lado de 3, 5, 7); la pregunta repite la primera pieza; después de dos intentos, Mara señala el salto entre renglones; «=» y «≠» en cada renglón |
| A3 | «otra cosa con el 5» cuando el 5 ya estaba probado | Corregido: «con uno que no probamos, como el 100» |
| M1 | Bitácora 9, `rule-predict` | Corregido: cada rama dice lo que se eligió (20: faltó el + 1; 13: sumó lo mismo) |
| M2–M3 | 9.4: decidir sin mirar sin volver atrás; entradas sin marca | Corregido: opción «Todavía no sé: sigo moviendo la recta»; la Bitácora dice si se decidió sin mover; marca 0 en cada eje y «en el medio, en la entrada 0» |
| M4 | Definición de asíntota falsa en general | Corregido: «se acerca tanto como se quiera»; «esta no la toca nunca porque en el 2 no hay valor»; la del «¿cuántas veces?» también se nombra |
| M5–M6 | √ descrita igual que el log; el reflejo sin un par legible | Corregido: «arranca en el 0 con valor 0; aquella, cerca del 0, baja sin fin»; ventana de 0 a 4 con (2, 4) y (4, 2) marcados (`it11/r3-c12`) |
| M7 | «Reconociste las seis formas»; `bad` cuenta intentos | Corregido: «Uniste cada forma con su regla; N veces elegiste primero una regla que no era» |
| M8 | 9.2 con salidas de dos cifras | Columna corrida; la del 10 sigue pasando por arriba un instante (animación) |
| B1–B3 | 6.4: «como» como razón; rótulo «ecuación»; derivaciones de los personajes sin lector | Corregidos: frase separada; «← ecuación: sólo con 8» y «0 = 0 vale para cualquier x: identidad»; `d.describe` en 6.3, 6.4, 6.5 y 6.6 |
| B4–B6 | 9.4: «a el círculo», guion ASCII, borde mudo; tangentes; «todas las entradas» | Corregidos: «al círculo», «−», aviso en el borde, «toca en un punto», «de punta a punta» |
| B8, B10–B12 | Panel sin la primera pieza; intentos repetidos; «se corta»; espejo inexacto; la raya «en el 2» | Corregidos |
| B7, B9 (en parte) | Rótulo «función» pegado al dibujo; contador lejos del dibujo de abajo | Pendientes (bajas) |

## Revisión de 7.7, 9.1 y 9.8 (rev-c8b, 2026-10-07)

Informe: `artifacts/arithmos/it11/review-c8b/informe.md`.

| # | Hallazgo | Disposición |
|---|---|---|
| A1 | 7.7: «la raíz de (x + 1)² no es x + 1» (falso si x + 1 ≥ 0) | Corregido: «no siempre es x + 1… si x + 1 es positivo, es x + 1; si es negativo, no»; Bitácora igual |
| A2 | 9.8: «va a medir 4» sin condición | Corregido: «si el sol sigue haciendo el mismo recorrido, unos 4. No es una medición: es anticipar. En diez días lo medimos y vemos», en las tres ramas |
| M1–M3 | 7.7: «por sí mismo»; adelanta 9.6 con el mismo −4 y la misma frase; Bitácora «los que probaste» | Corregidos: «multiplicado por sí mismo»; ahora es (x + 1)² = −9, con razón geométrica («no hay cuadrado de área negativa»); Bitácora con lo elegido |
| M4–M6 | 9.8: tiempos («mañana» con días ya medidos); el juego lee el resultado; el día 1 sin describir | Corregidos: «el día 2, a las 10, ¿cuánto habrá medido?»; el jugador toca el punto de las 10 del día 2 y ve el 2; el día 1 se describe con sus valores |
| M7 | 9.1: la tabla «de ayer» cambió el sentido de la flecha | Corregido: «8 h: largo 4 →» como en 8.8 (la flecha es para dónde apunta la sombra) |
| M8 | 9.1: el juego anuncia que hay otra hora | Corregido: después de la primera flecha, el jugador decide «puede haber otra» o «ya está»; si dice «ya está», se marca en amarillo el renglón de las 14 en la tabla |
| B1–B7 | Varias | Corregidos: se prueban las dos de la rama «dos»; la rama «el 0 no es área» se contesta con la cuenta; las ecuaciones quedan en el resumen («ninguna en la recta»); las opciones equivocadas traen su razón; un solo «del 2 salen dos»; «el día 2» en la Bitácora |
| Teléfono | 9.8 ilegible al decidir; la tabla de 9.1 chica | Nuevo para todo el juego: en pantallas bajas el panel de opciones tiene «ver la pizarra», que lo esconde para mirar la pizarra más grande, y «volver a las opciones» (`it11/peek-c98-tel`). Tabla de 9.1 más grande; horas de 9.8 de 14 |

## Regresiones
- rev-mat-2 encontró regresiones de M10 y M15 introducidas por la reescritura `f3974ca` (corregidas arriba).
