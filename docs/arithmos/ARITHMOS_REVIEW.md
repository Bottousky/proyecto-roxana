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

Revisiones narrativa/audiovisual (C1-R2) y funcional (C1-R3): en curso / pendientes.
Playtests humanos: **ninguno**.

## Regresiones
Ninguna registrada todavía.
