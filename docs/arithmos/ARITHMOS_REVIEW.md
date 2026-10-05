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

Revisiones independientes del capítulo 1: **pendientes** (C1-R1, C1-R2, C1-R3).
Playtests humanos: **ninguno**.

## Regresiones
Ninguna registrada todavía.
