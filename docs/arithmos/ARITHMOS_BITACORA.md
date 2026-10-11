# Arithmos · La Bitácora (Tomo 1)

Estado: **v1 implementada** (2026-10-11). Evidencia: `artifacts/arithmos/animlab/c31/bitacora/` (capturas y los dos PDF de una partida completa).

## Qué es

El cuaderno de matemática del jugador: **«Arithmos · Tomo 1»**, a su nombre. Cada mundo del Instituto tiene su serie de tomos (Ohmdal la suya, de electricidad); éste es el primero de Arithmos. Se lee en el juego (menú de pausa → Bitácora), se descarga en PDF y, más adelante, se podrá **comprar impreso**.

## Lo que se tomó de Ohmdal (rama `codex/playcanvas-slice`: `src/journal.js`, `journal.css`, `journal-pdf.js`)

| En Ohmdal | En Arithmos |
|---|---|
| Cuaderno de campo de cuero, abierto en doble página, cinta, elástico, pestañas de colores, folios, esquinas para pasar la hoja | Igual en uso; **identidad propia**: tapas de tela verde Arithmos, **papel cuadriculado con margen rojo** (el cuaderno de matemática de la escuela), elástico |
| Tintas por tipo de anotación (birome azul, lápiz rojo, verde, grafito, siena de Edda) | **Lápiz** para lo que pasó, **birome azul** para lo que eso dice, **lápiz rojo para los números** (se marcan solos), sello del capítulo en verde |
| Foto del lugar pegada con cinta | **La foto de su propia pizarra** al cerrar el capítulo (lo que escribió con tiza), recortada a donde hay tiza |
| Post-it «Para pensar», ficha rayada | La idea del capítulo en un **recuadro a mano**; «Volver a ver» en un post-it (sólo en pantalla) |
| «Mi pregunta o hipótesis» por página | **«Mi pregunta»** por capítulo, sobre renglones; se guarda en la partida y sale impresa como tinta |
| Notas al margen de Edda | **Punto estuvo acá** (su dibujo en lápiz) |
| «La Bitácora de {nombre}», pedido al empezar | El nombre del **registro de Dirección** (escuela 3D); se pide al empezar con ese nombre ya escrito, y si se cambia, cambia también allá |
| PDF en el navegador: pliegos A4 para casa, libro A5 para imprenta, tapa y contratapa; páginas largas siguen en la hoja siguiente | Lo mismo, **sin dependencias** (Ohmdal usa html-to-image + jsPDF; Arithmos se sirve sin dependencias): fotografía de cada hoja con SVG + foreignObject y un PDF escrito a mano (`src/engine/pdf.js`, ~60 líneas) |
| Portadilla: gente que conocí, por dónde pasé | Portadilla «Este cuaderno es de…» con el sello del tomo e **índice** de los 12 capítulos (✓ los anotados) |

## Cómo funciona

- `src/engine/bitacora.js` (puro, probado en Node): hojas del tomo, HTML de la doble página, dueño (`ownerName`: Dirección manda; si no hay escuela, el nombre dado al empezar), lectura y escritura del registro de la escuela (`roxana.escuela.v1`, mismo origen; sólo cambia `name` si el registro ya existe, nunca lo crea).
- `bitacora.css`: la estética (pantalla y hojas del PDF). Fuentes: las del juego (Kalam, Atkinson Hyperlegible).
- `src/engine/bitacora-pdf.js`: vuelca cada página en hojas A5 con columnas CSS (un bloque no se parte, un rótulo no queda solo al pie), fotografía cada hoja (≈150 dpi pliegos, ≈215 dpi libro) y encuaderna.
- `src/engine/pdf.js`: PDF de imágenes JPEG, con metadatos (título, autor) en UTF-16.
- `Game.addJournal(entry)` (los 12 capítulos pasan por acá): anota, saca la foto de la pizarra (`photographBoard`, ≤ 720 px, JPEG) y la guarda aparte de la partida (`roxana.arithmos.fotos.v1`). Empezar de nuevo borra las fotos.
- Título → Empezar → «¿A nombre de quién va tu Bitácora?» (el bot completa `--nombre=`).

## Verificado (`scripts/bitacora-check.mjs`, partida completa `it13/full-directa2`)
- Doble página en 1600×900 y en teléfono acostado 844×390 (una página debajo de la otra, pestañas arriba).
- PDF pliegos A4: 21 hojas, 7.9 MB, 44 s en el contenedor (WebGL por software). Libro A5: 41 páginas, 12.5 MB, 84 s.
- La nota propia se guarda; el nombre viene de Dirección y, cambiado al empezar, cambia allá.
- Pruebas: `tests/bitacora.test.mjs` (7).

## Pendiente
- **Safari** (Mac, iPad): fotografiar SVG con foreignObject puede «ensuciar» el lienzo en algunas versiones; si falla, el juego avisa «No se pudo armar el PDF en este navegador». Probar en dispositivo [H]. Plan B: imprimir desde el navegador con `@page` A5.
- **Peso de los PDF** (8–12 MB): bajar la calidad del JPEG o la resolución de las hojas cuadriculadas si hace falta para mandarlo por mensaje.
- **Contenido** (revisión de los caps. 10–12, M8): la Bitácora del 11 atribuye de más («elegiste el del medio» si eligió «Los dos»; «pensaste en el otro» si eligió «Cualquiera»), la del 10 dice «rectas paralelas» donde la escena dice filas, falta una hoja de cierre del viaje.
- **La escuela**: en Dirección, Arithmos figura «Sin bitácora» (`WORLDS.available: false`, integración X-2). Cuando se integre, Dirección puede listar el tomo de Arithmos y su descarga.

## El tomo impreso (a futuro)
Lo que pide una imprenta y cómo llegar desde lo que ya existe:
1. **Interior**: A5 (148 × 210 mm) + 3 mm de sangrado por lado, 300 dpi o vectorial. El camino: el juego exporta los datos de la Bitácora (la partida + las notas + las fotos) y un servicio compone **el mismo HTML** (`bookSections`) con Chromium (`page.pdf`, vectorial: el texto queda como texto) a tamaño con sangrado. Las fotos de la pizarra (720 px) alcanzan para ~120 mm a 150 dpi: para imprenta conviene guardarlas a 1440 px.
2. **Tapa**: aparte, con el lomo según la cantidad de páginas; el nombre del dueño en la tapa.
3. **Privacidad**: el nombre y lo escrito son de un menor; hoy el PDF se arma en su navegador y no sale de ahí. Comprar el tomo implica mandarlo: consentimiento de un adulto y nada más que lo necesario.
