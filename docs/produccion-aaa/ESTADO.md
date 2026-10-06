# Ohmdal · Arco I — estado del loop de producción

Encargo: [OHMDAL_AAA_LOOP.md](../../OHMDAL_AAA_LOOP.md). Este archivo es el punto de reanudación:
objetivo actual, hechos comprobados, backlog priorizado, evidencia y siguiente acción.
Las capturas y reportes viven en `experiments/playcanvas/output/` (no versionado); acá se
cita la revisión de código que los produjo.

## Base del proyecto (comprobada el 5 oct 2026)

- Implementación activa: **PlayCanvas** en `experiments/playcanvas`, rama `codex/playcanvas-slice`.
  La versión Three.js de `src/` sólo se usa para exportar geometría (`export-scene.mjs`) y como
  fuente del canon que `sync-game.mjs` copia a `src/game/`. No hay AGENTS.md ni CLAUDE.md.
- Canon: `ARCO_I.md`, `LORE.md`, `PEDAGOGIA.md`. Crítica más reciente:
  `docs/critica-arco1-jugabilidad-pedagogia-lore-2026-09-25.md`; sus ocho hallazgos tienen
  commits del 26 sep que dicen atenderlos (relato según evidencia, volver ≠ poner en servicio,
  Ivara/Nereo exigen comprobación, primera clase antes del cierre, habitantes hacen uniones
  rutinarias, Terrazas con línea compartida). Verificación pendiente en este loop.
- Equipo de esta sesión: MacBook Apple M2, macOS 26.7.1, Chrome instalado, Node 26.10 (Homebrew).
  Blender 5.2.2 instalado el 5 oct con Homebrew (`bake-ao.mjs` lo usa al reexportar el mundo).
- Línea base en `2397b6f`: `npm test` 81/81, `npm run check` correcto, `npm run build` correcto
  (26 MB en `dist/`, geometría 11,3 MB, JS 2,5 MB / 677 kB gzip).

- Partida automatizada completa en la base (`2397b6f`, Chrome headless en el M2): **completa**,
  9 zonas, 9 bancos, 9 recuerdos, final, epílogo y recarga; 0 errores de página/consola;
  ~7 min con soluciones conocidas. No hay bloqueos de progresión conocidos.

## Ciclo 1 · Moverse y hablar sin tropiezos (5 oct 2026)

Defectos observados en la base y su reproducción:

1. **El jugador desaparece detrás del primer plano.** En 4 de 9 llegadas de la partida
   automatizada (Plaza, Castillo, Lago, Manantial parcial) un árbol tapa la figura; en el Lago
   no se ve nada (`output/baseline-2397b6f/playthrough-24-lake-arrival.png`). No existía
   ningún tratamiento de oclusión.
2. **Enter reabre la conversación que acaba de cerrar.** Enter/E continúan el diálogo y también
   interactúan; tras la última línea, cada par de pulsaciones vuelve a abrir a Edda en bucle.
   Reproducción: `GAME_URL=http://127.0.0.1:4193/ node scripts/qa-dialogue-input.mjs` contra la base.
3. **Utilería sobre el eje de los caminos.** Equipaje del Portal en la curva del camino al
   pueblo (el baúl a 0,67 m del eje), puesto de fruta y banco cortando el circuito de la
   fuente, cajón de manzanas sobre la calle del Mercado. El comentario de `dressing.js`
   prometía lo contrario y ninguna prueba lo comprobaba.

Cambios:

- `src/see-through.js`: lo que queda entre la cámara y la figura (árboles, follaje, muros,
  aleros) se abre en una trama Bayer dentro de una cápsula de pies a cabeza. Sólo lo que está
  0,9 m más cerca de la cámara que los pies: suelo, agua, orillas y puentes no se agujerean;
  sombras y selección no cambian.
- `src/game/main.js`: después de cerrar un diálogo, E/Enter/Espacio necesitan 450 ms de calma
  para volver a interactuar; cada pulsación en ese lapso lo prolonga.
- `src/dressing.js`: equipaje contra la cerca del Portal; puesto de fruta al este de la
  fuente, banco al borde del circuito, cajón de manzanas al sur de la calle del Mercado.
- Pruebas/QA: `tests/dressing.test.js` comprueba el eje de cada camino (falla con la base);
  `scripts/qa-dialogue-input.mjs` (falla con la base, pasa ahora).
- Herramientas: `scripts/chrome.mjs` (Chrome por plataforma), `scripts/serve-snapshot.mjs`
  (copia congelada para partidas largas), `GAME_URL`/`PLAYTHROUGH_OUTPUT` en `playthrough.mjs`.

Verificación (runtime idéntico al commit del ciclo 1; la copia evaluada se comparó archivo por archivo):

- `npm test` PlayCanvas 82/82, raíz 282/282 (la raíz necesitó `npm ci`; el arnés de
  `tests/cinematic-startup.test.js` ahora provee `performance`, que el controlador usa al cerrar
  un diálogo), `npm run check` correcto.
- Partida automatizada completa sobre la copia congelada: terminada, 0 errores, 9 zonas,
  9 recuerdos, recarga final (`output/playthrough-cycle1/`, 417 s).
- Antes/después, misma partida y cámara: `output/baseline-2397b6f/playthrough-NN-*.png` contra
  `output/playthrough-cycle1/playthrough-NN-*.png`. Lago (24): de invisible a figura entera;
  Castillo (18) y Plaza (05): de cabeza o torso a cuerpo completo. Espigón del Faro (25): sin
  agujeros en el piso ni en la baranda.
- `scripts/qa-dialogue-input.mjs`: pasa; con la base falla («la conversación quedó abierta»).
- Rendimiento comparado en la misma escena (bitácora final, viaje por mapa, 300 cuadros,
  1440×900, Chrome headless + Metal, M2): Lago y Plaza a 16,6 ms de media y 16,8 ms p95 en
  ambas versiones. Está topado por la sincronía vertical: muestra que no hay regresión, no el
  margen disponible. No es una medición en pantalla real.
- Revisión visual con `scripts/visit.mjs`: puesto de fruta (mira a la fuente desde el este),
  banco al borde del circuito, equipaje detrás del murete del Portal.

Autocrítica: la trama se nota como punteado al pasar detrás de copas (es la solución elegida,
no un defecto oculto). **Ohm no está cubierto**: en el Lago sigue tapado. Las casas visitables
(`homes.js`) usan otros materiales y no se abren. Los postes de la escena sobre caminos
siguen ahí (backlog 4).

## Ciclo 2 · Ohm visible, faroles fuera de las calles y una ruta adversarial (5 oct 2026)

- **Ohm también se ve detrás del primer plano**: segunda cápsula en `src/see-through.js`.
  En la llegada al Lago del ciclo 1 seguía oculto; ahora se ven ambos
  (`output/playthrough-cycle2/playthrough-24-lake-arrival.png`).
- **Faroles fuera de las calles**: el de la calle del Mercado y dos de Terrazas estaban sobre
  el eje del camino. Se movieron en la fuente (`src/world.js` raíz) y se reexportó el mundo.
  Blender 5.2.2 instalado con Homebrew; `bake-ao.py` usa Metal: exportación + horneado en 4 min.
  Diferencias verificadas: obstáculos y luces sólo de esos faroles; vértices sólo en el
  empedrado de Plaza y Terrazas (+54 c/u, el pavimento rodea sólidos); relieve idéntico;
  comparación visual lado a lado sin cambios ajenos (`output/cmp-*.png`). La auditoría de
  «atravesables» da lo mismo que en la base. Prueba nueva: postes de escena fuera del eje de
  cada camino (falla con la escena anterior).
- **Banco sin cables fantasma**: con cero cables en la mano (o la instalación ya en servicio)
  tocar un borne ya no «toma un cable» ni deja la indicación pidiendo apoyar un extremo.
  Prueba en `tests/bench-guidance.test.js` (falla sin el arreglo). Copia raíz y PlayCanvas.
- **Ruta adversarial** en el mismo arnés (`ROUTE=adversarial node scripts/playthrough.mjs`):
  salida bloqueada probada temprano, cable equivocado deshecho y banco abandonado, recargas
  con el banco a medio hacer, durante escenas (despertar, Puerta, Faro) y al llegar al Lago,
  interfaces abiertas y cerradas en serie, frenos equivocados en la Puerta, regreso físico
  Castillo → Plaza y vuelta, y Edda respondiendo tras el final. El informe guarda ahora todas
  las líneas de diálogo; las dos rutas comprueban que el cierre de la Puerta narra el freno
  que se tocó.
- Herramientas: `scripts/compare.mjs` (antes/después lado a lado), `scripts/qa-type-sizes.mjs`.

Verificación (runtime idéntico a la copia evaluada; comparación archivo por archivo):

- `npm test` PlayCanvas 83/83, raíz 283/283; `npm run check` correcto.
- Ruta principal completa (`output/playthrough-cycle2/`, 381 s, 0 errores) sobre la revisión
  sin el arreglo de cables; ruta adversarial completa sobre la revisión del commit
  (`output/adversarial-cycle2/`, 548 s, 0 errores, 224 líneas de diálogo registradas). En la
  primera corrida adversarial falló una aserción del arnés (`undefined` frente a `false`); el
  juego no había puesto el banco en servicio. Se corrigió el arnés, no el criterio.
- Pendiente de esta pasada: la ruta adversarial todavía no cubre equivocarse en Terrazas ni en
  las tres etapas del Faro, ni las pantallas táctiles.

## Ciclo 3 · Piso de lectura (5 oct 2026)

Medición con `scripts/qa-type-sizes.mjs` (título, diálogo, mundo, Bitácora, mapa, guía, pausa
y primer banco; el texto SVG se mide con su escala en pantalla y cuenta aunque esté oculto a
lectores de pantalla; sólo se eximen glifos sueltos como Ω o +). Piso: 12 px para lo que
informa, 11 px para rótulos en versalitas.

| Tamaño | Base `2397b6f` | Ciclo 3 |
|---|---|---|
| 1280×720 | 140 textos bajo el piso (rol del hablante 8 px, teclas 8–10 px, guardado 9 px, «Vos» 7,6 px, grabados 8,7 px, brújula 8,3 px) | 0 |
| 390×844 | 96 (pie del título 6 px, rol 7 px, «Vos» 5,3 px, bornes 8 px, grabados 5,1 px) | 0 |
| 844×390 | 76 | 0 |

Cambios (todos en `src/game/hud.css`, salvo dos marcas en `puzzles.js`):

- Piso de tamaño para HUD, diálogo, título, Bitácora, mapa, guía, pausa y banco. Va al final de
  las hojas del recorrido con `!important` sólo en el tamaño; `puzzles.css` se carga después,
  por eso las reglas del banco llevan `#workbench`.
- Plano local, mapa del reino y brújula: los rótulos crecen en unidades del dibujo (con valores
  propios para teléfono y pantallas bajas).
- Teléfono: el encargo del banco quedaba en una columna de una o dos palabras por línea (ya en
  la base); ahora ocupa todo el ancho. El tablero de los bancos densos conserva 600 px de ancho
  y se desplaza de costado dentro de un marco (`.wb-board-frame`, en ambas copias de
  `puzzles.js`), en vez de encimar nombres y grabados. El primer banco sigue a ancho completo.
- Ω decorativos del banco marcados `aria-hidden`.

Verificación: capturas antes/después de las 8 pantallas en 3 tamaños
(`output/type-cycle3/cmp-*.png`) revisadas una por una. Se corrigió una regresión propia: la
regla del número de entrada achicaba el título del índice de la Bitácora. Bancos densos
(Castillo, Terrazas) revisados en escritorio y teléfono. En teléfono, quitar un cable desde la
lista y volver a unirlo tocando dos bornes del tablero desplazado funciona (6 → 5 → 6 cables).
`npm test` 83/83 y 283/283, `npm run check` correcto, partida completa sobre la copia del ciclo
(`output/playthrough-cycle3/`, 392 s, 0 errores) y `qa-dialogue-input` correcto.

Autocrítica: «Celda +» roza el marco de la celda en el primer banco; la pausa sigue necesitando
desplazamiento a 720 px de alto para «Pantalla completa» (como antes). El tablero desplazable en
el teléfono no muestra un indicio explícito de que hay más a la derecha además del corte.
Emulación de teléfono, no hardware real.

## Ciclo 4 · Comprensión de los bancos y coherencia del modelo (5 oct 2026)

- **Fichas por banco** (`docs/produccion-aaa/PUZZLES.md`, generadas con
  `node scripts/puzzle-sheet.mjs --md`): comprensión buscada, pista, acción, comprobación pedida,
  primera ayuda, descubrimiento, consecuencia y una batería de intentos equivocados evaluados
  con el modelo del juego (quitar cada cable, mandos en sus extremos, atajo + a −, receptor
  invertido). Los 9 bancos dan una señal distinta ante cada error; ninguno queda en silencio.
- **Dos textos que enseñaban algo falso**, encontrados por la batería:
  la cúpula del Faro II conectada al revés decía «casi completa sus vueltas» (falta de fuerza en
  vez de polaridad), y «contra la marca de avance» aparecía en el núcleo y la señal del Faro,
  que no tienen esa marca. Ahora la inversión se describe como inversión, con las palabras de
  cada pieza.
- **Polaridad declarada, no implícita**: el juego decía «la polaridad determina el sentido de
  esta bobina» sin razón física; un solenoide común atrae con cualquier sentido. El pestillo de
  la Puerta es ahora un imán, dicho en el banco, la lección y la Bitácora. El núcleo del Faro I
  y la señal del Faro II son bobinas comunes y funcionan con sus cables invertidos.
  `isPolarized()` en el modelo; motores, pestillo imantado, corazón de Ohm y cristal de la lente
  dependen del sentido. Simplificaciones declaradas al inicio de `PUZZLES.md` (sin tocar el canon).
- Pruebas nuevas (raíz): toda pieza polarizada invertida se describe como inversión y nunca como
  falta de fuerza; el pestillo es imán y las bobinas comunes funcionan invertidas. Fallan con el
  texto y el modelo anteriores.
- Ruta adversarial ampliada: mandos equivocados con la alimentación encendida en Terrazas
  (todo al mínimo, todo al máximo), Faro I (regulador en 0 y 5 Ω) y Faro III (freno en 6 y 36 Ω).

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 285/285, `npm run check`
correcto; ruta adversarial ampliada completa (`output/adversarial-cycle4/`, 554 s, 0 errores,
seis intentos con mandos equivocados no resueltos, 9 zonas y recarga final). `puzzle-sheet`
sin intentos silenciosos. Límite: la batería evalúa el modelo, no a personas; que estas señales
basten para que un principiante entienda queda para la prueba con jugadores (NO VERIFICADO).

## Ciclo 5 · Lo que se busca al llegar, en foco (5 oct 2026)

La profundidad de campo enfocaba sólo 12 m alrededor del jugador: la fuente de la Plaza, la
rueda del Manantial, la Puerta de Ohm con su Ω, la forja y el molino de Terrazas y la galería
del Faro llegaban como manchas en el tercio superior. Se probaron cuatro ajustes con la misma
bitácora, el mismo viaje por mapa y la misma cámara (`?dof=rango,radio`, parámetro de prueba
nuevo en `src/world.js`): 12/3,5 (anterior), 20/3,5, 28/3 y 36/2,5. Con 36 el fondo se
aplana; con 28 y radio 3 los destinos se leen y el borde lejano y el primer plano conservan el
desenfoque de maqueta. Quedó 28/3 para exteriores; interiores, bancos y escenas no cambian.

Evidencia: `output/dof-cycle5/cmp-*.png` (ocho llegadas, antes/después). Calzada: el Ω de la
Puerta pasa a ser legible desde la llegada. Rendimiento sin cambios en Plaza y Faro (16,6 ms
de media, topado por la sincronía vertical). `npm test` 83/83, `npm run check` correcto. Es un
cambio de una constante de presentación: no se repitió la partida completa.

## Ciclo 6 · El primer latido de Ohm (5 oct 2026)

Los momentos construidos se revisaron en movimiento: la partida captura cada escena de
restauración (`SCENE_FRAMES=1`, hojas en `output/scenes-cycle6/sheet-*.png`; herramienta
`scripts/contact-sheet.mjs`).

- **Despertar de Ohm (el más débil, y el primero que vive el jugador):** la escena decía «Una
  pequeña luz despierta bajo el vidrio» y no se veía ninguna luz; Ohm pasaba de apagado a
  encendido de golpe, diminuto en el encuadre. Ahora: una luz cian titila, crece, late dos veces
  y se asienta dentro de Ohm (con su luz puntual sobre el pedestal); Ohm pasa de la penumbra al
  color a medida que llega la luz; el sonido suma dos latidos graves con los dos pulsos; la
  cámara se acerca más (zoom máx. 1,75, dentro del límite que fija la prueba de escenas). Con
  movimiento reducido la luz aparece sin parpadeos ni pulsos. Primera versión descartada: el
  resplandor tapaba a Ohm entero; se achicó. Evidencia: `output/awaken-before/sheet.png` y
  `output/awaken-after/sheet.png` (`scripts/qa-awaken-scene.mjs`, misma partida y recorrido).
- **Regresión propia corregida:** la pausa tras cerrar un diálogo (ciclo 1) también tragaba E
  sobre otro objeto si se apretaba en menos de 450 ms; la partida automatizada lo encontró al
  fallar en el pedestal. Ahora sólo bloquea volver a abrir lo que estaba al alcance al cerrar.
  `qa-dialogue-input` lo comprueba de forma determinista (falla con la versión anterior).
- Puerta: la reja sube y la cámara recorre el arco; correcto, el Ω queda chico. Manantial: el
  vuelo hasta la Plaza pasa por cuadros de sólo copas de árboles. Faro: torre, haz, Lago y
  Terrazas; el haz se ve en un solo cuadro y no cruzando el lago como dice el texto.

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 285/285 (el arnés de la
raíz provee ahora `nearby`), `npm run check` correcto, partida completa
(`output/playthrough-cycle6/`, 399 s, 0 errores) y `qa-dialogue-input` correcto. Sonido de los
latidos: NO VERIFICADO de oído (sin escucha en esta sesión).

## Ciclo 7 · El agua baja por su canal, el Ω se lee y el haz se ve llegar (5 oct 2026)

- **Faro:** visto desde arriba, el haz del Faro pasaba por encima de la cámara; en los cuadros
  del Lago y las Terrazas no había ninguna luz que «cruzara el lago». Ahora una franja de luz
  cálida gira con el haz sobre el agua y los campos, empezando donde termina la isla
  (`poolTexture` en `src/world.js`); sólo de noche (escala con el nivel de faroles), nunca de
  día. Primer intento descartado: una luz puntual cónica iluminaba la propia isla del Faro y
  ensuciaba la galería; segundo, una franja demasiado blanca que aplanaba el terreno.
- **Manantial:** el vuelo hasta la Plaza pasaba por cuadros de sólo copas de árboles. Ahora la
  cámara baja por el canal real (orilla este del Manantial, canal de la Calzada, canal de la
  Plaza) hasta la fuente. Prueba nueva: durante la bajada el foco queda a menos de 4 m del
  curso de agua (falla con el recorrido anterior).
- **Puerta:** plano cercano del Ω sobre la puerta abierta antes de abrir al valle.
- Herramienta: `scripts/qa-finale-scene.mjs` reproduce la escena real del Faro de noche desde
  una bitácora terminada (revisión visual, no aceptación).

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 285/285,
`npm run check` correcto, partida completa con captura de todas las escenas
(`output/scenes-cycle7/`, 416 s, 0 errores). Antes/después del Faro en `output/finale-sheet.png`.
Pendiente menor: el regreso de la cámara desde la fuente al Manantial (1,4 s) vuelve a cruzar
copas de árboles.

## Ciclo 8 · El taller de Lumen se enciende de verdad (5 oct 2026)

- **La luz que vuelve se ve:** el taller (y la galería del Faro) tienen lámparas colgantes
  eléctricas cuya luz el exportador no llevaba a PlayCanvas: al restaurar sólo subía el brillo
  general. Ahora `hangingLamp` registra su punto de luz y `export-scene.mjs` lo exporta con los
  faroles. Al restaurar el taller, tres círculos cálidos caen sobre la mesa y el piso; al
  restaurar la red de la torre, dos lámparas iluminan la galería de noche. Antes de restaurar
  quedan apagadas (consecuencia persistente). Reexportación verificada: sólo 5 luces nuevas,
  geometría y colisiones idénticas.
- **Menos piso vacío:** la mesa donde Lumen dibuja sus esquemas (sillas, vela, cesto) junto al
  hogar, y el mostrador de reparaciones junto a la puerta. La utilería admite ahora una altura
  para apoyar piezas sobre muebles sin que cuenten como obstáculo.
- Evidencia, misma partida y cámara: `output/workshop-cmp.png` (llegada y restaurado, ciclo 7
  contra ciclo 8) y `output/lighthouse-night-cmp.png`.

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 285/285, `npm run check`
correcto, pruebas de utilería (cercanía a lo que se usa, caminos y ejes), partida completa con
escenas (`output/scenes-cycle8/`, 409 s, 0 errores).

Autocrítica: a oscuras la mesa de dibujo se lee pequeña y oscura; los resplandores de las
lámparas son discos algo grandes. Faltan objetos propios del oficio (bobinas de cobre, frascos,
herramientas): el kit no los tiene y no se fabricaron.

## Ciclo 9 · Rendimiento medido en la build de producción (5 oct 2026)

Resultados y método en [RENDIMIENTO.md](RENDIMIENTO.md). En el M2 con Chrome, los nueve lugares
caben en 60 FPS en las tres configuraciones medidas (peor cuadro: 15,2 ms a 2448×1530 px en
calidad alta); memoria estable tras tres vueltas; sin errores. Carga local de 2,6 s al mundo y
19,3 MB transferidos: la descarga es la debilidad (geometría en coma flotante). Móvil de
referencia NO VERIFICADO (sin dispositivo). Para medir sin abrir la build entregada se agregó
`VITE_INSPECT=1` (acceso de inspección en una build aparte) y `scripts/perf.mjs`.

## Ciclo 10 · Nada que se atraviese y la Puerta que se mueve entera (5 oct 2026)

- **Auditoría de atravesables con el radio real:** `scripts/audit-walkthrough.mjs` daba 16 casos
  usando 0,15 m de margen; el cuerpo mide 0,34 m (el mismo radio de la navegación) y no llega a
  esas celdas. Con el radio real quedaban tres casos verdaderos, y ahora informa qué pieza es.
- **Calzada:** las cadenas que levantan el rastrillo colgaban hasta el suelo delante de la Puerta
  sin colisión. Ahora frenan mientras la Puerta está cerrada y desaparecen al abrirse, con el
  mismo mecanismo que la reja (`gateObstacles`, raíz y exportador). Además, en PlayCanvas sólo
  subía la reja: cadenas, contrapesos y engranajes quedaban fijos en la pose cerrada (la cadena
  colgaba hasta el suelo con la Puerta abierta). Se exportan como piezas móviles y responden con
  la reja, como en el original: la cadena se recoge, los contrapesos bajan, los engranajes giran.
- **Manantial:** un cable bajaba en diagonal desde 3,5 m hasta el suelo cruzando la altura del
  pecho; ahora baja vertical a un borne con colisión.
- **Taller:** dos carretes de alambre de cobre envejecido (no luminoso), con colisión.
- La auditoría de atravesables queda sin casos. La prueba de la Puerta (`arc.test.mjs`) exigía
  que abrir quitara un solo obstáculo; ahora quita la reja y las dos cadenas. Se actualizó con
  la misma intención: al abrir desaparecen sólo las piezas de la Puerta.
- **Ocluyentes de primer plano (6):** revisadas las ocho llegadas (`output/arrivals-cycle8.png`).
  Las torres que aparecen delante al entrar al Manantial y a Terrazas son el lugar que se acaba
  de dejar: muestran la continuidad del reino. Con el foco del ciclo 5 ya no salen borrosas y la
  transparencia mantiene visible al jugador. Sin cambios.

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 285/285, `npm run check`
correcto, auditoría de atravesables sin casos, ruta principal (`output/playthrough-cycle10/`,
404 s) y adversarial (`output/adversarial-cycle10/`, 551 s) completas y sin errores. Revisión
visual de la Puerta abierta, los carretes y el borne (`output/cycle10-visits.png`).

## Ciclo 11 · Geometría empaquetada: menos descarga y menos memoria (5 oct 2026)

`scripts/pack-geometry.mjs` (último paso de `export:world`) y `src/geometry-format.js` (lector
con tipo por canal, usado por el juego, la auditoría y los horneados). Normales Int8, colores
Uint8, índices de 16 bits en 502/503 mallas. Transferido 19,3 → 16,8 MB, decodificado 84,6 →
53,3 MB, memoria JS 113,4 → 92,6 MB; sin cambio visual apreciable ni en el costo por cuadro.
El circuito completo reproduce el archivo byte a byte. Detalle en
[RENDIMIENTO.md](RENDIMIENTO.md). Verificación: `npm test` 83/83, `npm run check`, auditoría de
atravesables sin casos y **partida completa contra la build de producción minificada**
(`dist-perf`, `output/playthrough-cycle11-prod/`, 364 s, 0 errores).

## Ciclo 12 · Jugar con el dedo, título apaisado, el regreso del Manantial y el audio (5 oct 2026)

- **Táctil (13):** `scripts/qa-touch.mjs` juega en un teléfono emulado (390×844) sólo con toques
  del protocolo de Chrome: título, lectura, cruceta, tocar suelo y objetos (acercarse y usar),
  botón de interactuar, mapa, Bitácora y pausa, cruce a la Plaza, taller, medición con Ohm y dos
  bancos resueltos por toque. Encontró un defecto real: en vertical, la cámara del taller (y de
  las casas) se desplaza sólo el 35 % (25 %) de lo que se mueve el jugador; en 390 px el cierre
  derecho y la taza quedaban fuera de cuadro y no se podían tocar. En pantallas verticales la
  cámara de interiores ahora sigue más al jugador. Lo demás que falló en el camino eran errores
  del guion (toques en el borde, conversaciones demoradas, la regla «tocar = acercarse y usar»),
  corregidos en el guion sin cambiar el juego; queda registrado en sus comentarios.
- **Título (11):** a 800×600 ya no se recorta. Sí se encimaba en teléfono apaisado (844×390):
  rótulo cortado arriba y pie encima de «Opciones». En pantallas bajas se ocultan los rótulos
  decorativos y se compacta el bloque.
- **Manantial (8):** la cámara volvía de la fuente de la Plaza volando 95 m sobre copas; ahora
  corta a la rueda y se acerca a la cámara de juego. Prueba: ningún cuadro del regreso sale del
  Manantial (falla con el regreso anterior).
- **Audio (14, por código):** el Castillo y la alimentación del Faro no tenían sonido propio de
  restauración (sólo el clic genérico). Ahora: dos luces que se encienden una tras otra y el sello
  que se retira; un zumbido grave de generador. Prueba: cada instalación tiene su respuesta
  (falla con el audio anterior). Mute, volumen y silencio con la pestaña oculta están en el
  código. Escucha real: NO VERIFICADA.

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 286/286, `npm run check`
correcto; ruta principal (`output/playthrough-cycle12/`, 395 s), adversarial
(`output/adversarial-cycle12/`, 562 s), táctil (`output/qa-touch-cycle12/`) y diálogos: todas
completas y sin errores.

## Ciclo 13 · Aceptación final sobre la candidata `9b5cd5e` (5 oct 2026)

Ver [ACEPTACION.md](ACEPTACION.md). Pasadas sobre la build de producción minificada:
- recorrido completo, adversarial, táctil y diálogos: completas y sin errores;
- prueba de humo de la build entregable: correcta;
- rendimiento: dentro del objetivo de escritorio.

La ruta adversarial ahora habla con cada habitante presente al llegar a cada lugar y en todo
el reino después del final. En la primera corrida exigió alcanzar a Edda mientras se retiraba
de la Plaza: era un error de la prueba, no del juego, y se reprodujo y comprobó aparte.

La misión **no se declara cumplida**. Quedan pendientes tres comprobaciones que no se pueden
hacer en este equipo: móvil real, escucha del audio y prueba con personas.

## Ciclo 14 · Bancos en una sola vista, y pendientes de la crítica que eran accionables (5 oct 2026)

Reabierto tras la entrega parcial: el usuario señaló que los bancos estaban sobrecargados. En la
aceptación los había dejado como «legibles, pero densos» para la revisión humana; era trabajo
accionable dentro del alcance y la crítica del 25 sep ya lo marcaba.

- **Medición** (`scripts/qa-bench-load.mjs`, cada banco recién abierto): a 1280×720 los nueve
  bancos obligaban a desplazar y en siete el tablero quedaba cortado; lo que cada pieza «dice»
  (MIRÁ Y ESCUCHÁ) aparecía en la columna derecha, debajo del encargo y de los mandos, lejos de lo
  que se tocaba; en el tablero de Terrazas siete nombres quedaban pisados por cables.
- **Cambio:** lo que se observa en cada pieza pasa justo debajo del tablero, en formato compacto
  (nombre y estado en una línea, en dos columnas); el tablero se dimensiona por la altura
  disponible; herramientas, alimentación e «Otros instrumentos» en una fila; encabezado sin
  subtítulo (el encargo ya lo dice); columna del encargo y mandos más ancha. En los bancos de muchas
  piezas, los bornes dicen sólo A/B/+/− bajo el nombre grabado de la pieza (como ya hacían el taller
  y el Manantial); el nombre completo sigue en la lista táctil y en el lector de pantalla.
- **Resultado:** tablero, observaciones, encargo y mandos a la vista a la vez en 9/9 bancos a
  1440×900 y a 1280×720 (antes: el tablero cortado en 7/9 a 1280×720); nombres pisados 19 → 15–16;
  piso de lectura intacto. Antes/después: `output/bench-load/cmp-*.png`. En el teléfono el banco
  sigue siendo una columna con desplazamiento, ahora con las observaciones bajo el tablero.
- **Ohm menos previsible:** la fórmula «… registrado/a» aparecía 9 veces; quedan 5 (las que
  presentan la fórmula, dialogan con otra línea o se responden entre el taller y el Faro). Las otras
  cuatro pasan a una observación concreta, una pregunta cotidiana (el pan de Marin) y una pausa
  («Ohm no anota nada.»).
- **Edda se equivoca:** antes de reparar el Castillo apuesta, con su nombre, que la enfermería va
  a brillar menos si la cocina tiene su propio camino; después reconoce que perdió (en paralelo
  brilla igual que sola). La línea final sólo afirma lo que la prueba de Ivara ya exige; una prueba
  ata el diálogo al modelo.
- **Faro con menos trámite:** Nereo hace las uniones de la base y abre el obturador y el freno
  óptico (como hace las del muelle); el jugador conserva las decisiones (aislar el puente gastado,
  acoplar el motor) y los tres bancos. Los mandos siguen operables por si no se habla con Nereo.

Verificación (runtime idéntico a la copia evaluada): `npm test` 83/83 y 287/287, `npm run check`,
piso de lectura en 3 tamaños; ruta principal (`output/playthrough-cycle14/`, comprueba que Nereo
hace las preparaciones), adversarial (`output/adversarial-cycle14/`, 696 s, 16 habitantes),
táctil y diálogos: completas y sin errores.

- La primera adversarial se trabó en el rincón del acueducto del Manantial, como ya había
  ocurrido (y se había recuperado) en dos corridas anteriores. Reproducido: el robot sólo pulsaba
  ↓ y empujaba contra el borde del estanque. Ahora, si está bloqueado, pulsa la diagonal y se
  desliza, como haría una persona. Es un ajuste del guion, no del juego.
- Las siguientes corridas fallaron por **contención del equipo**: otra sesión de Claude Code
  trabajaba en paralelo (carga de 6 a 10). El juego seguía respondiendo a consultas, pero no
  procesaba teclas ni clics, porque Chrome no producía cuadros. La reproducción enfocada pasa
  limpia en condiciones normales. El guion ahora registra los estados que ve mientras espera.
  La adversarial se repitió con baja carga y pasó.

## Ciclo 15 · Bancos que se entienden: objetivo, pasos, estado sobre cada pieza y un solo botón (5 oct 2026)

El usuario volvió a jugar los bancos y los encontró difíciles de entender, sobrecargados y con
demasiadas opciones. No quedaba claro qué hacer, cómo, cuándo estaba bien ni cómo seguir. Pidió
investigar puzzles y juegos parecidos. La investigación con fuentes está en
[INVESTIGACION-PUZZLES-UX.md](INVESTIGACION-PUZZLES-UX.md) y el rediseño, con el antes y el
después medidos, en [BANCOS-UX.md](BANCOS-UX.md). En resumen:
- Objetivo en una frase y encargo en pasos que se tildan solos. Las piezas de la meta llevan ◎.
- Cada pieza dice su estado en palabras y lleva su propio mando sobre el tablero.
- Los cables soldados son cobre fijo por los bordes; los de mano cuelgan, se arrastran y tienen su ×.
- Una sola frase de Ohm y un solo instrumento por banco. La mesa se alimenta sola. La pista se
  ofrece cuando no se avanza.
- Al cumplir, «¡Funciona!», lo que se aprendió y un único «Seguir la historia →». Salir con el
  banco funcionando lo pone en servicio.

Pruebas actualizadas al comportamiento nuevo, sin borrar ninguna: raíz 291/291 y PlayCanvas
83/83. Nuevo `scripts/qa-bench-flow.mjs`, que juega cinco bancos con el mouse. Las partidas
completas se registran en [ACEPTACION.md](ACEPTACION.md).

## Ciclo 16 · El teléfono, apaisado (6 oct 2026)

El usuario preguntó si no convenía probar el teléfono apaisado. Sí: es la forma natural de jugar una
aventura en 3D. Con 844×390 emulado, el mundo y el título se veían bien, pero el banco se reducía a
una franja ilegible, el mapa quedaba debajo de su encabezado, la Bitácora casi no dejaba lugar a la
página y el diálogo tapaba media escena. Todo eso quedó resuelto. El detalle, con capturas, está en
[BANCOS-UX.md](BANCOS-UX.md#teléfono-apaisado-primero-ciclo-16): banco en dos columnas, mapa con
la guía al costado, Bitácora a pantalla completa y diálogo más bajo. En vertical, el juego sugiere
girar el teléfono.

También quedó resuelta la falla táctil de la candidata `3422928`. En vertical, la barra de Ohm
estaba fija sobre el tablero y tapaba los bornes que la prueba tocaba. Ahora va debajo del tablero.
La partida táctil vertical pasa completa (`output/qa-touch-390x844/`).

## Ciclo 17 · Un mapa de juego que es el mundo (6 oct 2026)

El usuario pidió reemplazar el mapa, que parecía «una página web con garabatos», por un mapa de
juego AAA que siguiera de verdad la geografía. Ahora el mapa es el propio mundo fotografiado desde
arriba y pintado en la GPU. Encima tiene niebla de lo no recorrido, ilustraciones de cada lugar,
nombres según el zoom, bancos, el jugador con su dirección, el siguiente paso con ruta dorada, y
viaje desde la lista o tocando el lugar. El detalle está en [MAPA.md](MAPA.md). La fidelidad está
medida: el río del juego cae sobre agua pintada en el 100 % de los puntos, y lugares y caminos
sobre tierra en el 100 %.

## Ciclo 18 · El Monte Quieto y la Casa de Compuertas (6 oct 2026)

A pedido del usuario, al oeste del Manantial ahora hay una montaña con una central de agua callada.
Responde a lo que se hizo en el reino y deja el umbral del Arco II. El detalle está en
[MONTE-QUIETO.md](MONTE-QUIETO.md). El mapa suma sombreado de relieve y el nombre del monte.

## Backlog priorizado (orden del encargo)

| # | Categoría | Problema observado | Estado |
|---|---|---|---|
| 1 | Navegación | Jugador tapado por el primer plano | Hecho (ciclo 1) |
| 1b | Navegación | Ohm tapado por el primer plano (la trama sólo sigue al jugador) | Hecho (ciclo 2) |
| 2 | Interacción | Enter reabre conversaciones | Hecho (ciclo 1) |
| 3 | Navegación | Utilería sobre caminos | Hecho (ciclo 1) |
| 4 | Navegación | Faroles de la escena sobre caminos (Mercado y Terrazas) | Hecho (ciclo 2) |
| 5 | Presentación | Profundidad de campo: el destino de cada llegada (fuente, rueda del Manantial, Castillo) queda borroso en el tercio superior | Hecho (ciclo 5) |
| 6 | Presentación | Llegadas con grandes ocluyentes borrosos en primer plano | Revisado (ciclo 10): son el lugar anterior (continuidad), ya en foco; sin cambios |
| 7 | Arte | Interior del taller de Lumen: caja oscura casi vacía | Hecho (ciclos 8 y 19): luz de lámparas al restaurar, mesa de dibujo y mostrador, carretes de cobre, tablero de herramientas y globos de vidrio esperando reparación |
| 8 | Momentos | Despertar (6), canal del Manantial, Ω de la Puerta y haz del Faro (7), regreso del Manantial (12) | Hecho |
| 9 | Puzzles | Verificar en juego los 8 hallazgos de la crítica del 25 sep; fichas y coherencia del modelo | Hecho en lo verificable (ciclos 2 y 4): relato según traza, Ivara/Nereo exigen comprobación, volver ≠ poner en servicio, primera clase antes del cierre y acuerdo forja/riego en Terrazas están en el código y la partida los recorre; fichas y modelo en ciclo 4. El hallazgo 5 (estructura predecible por zona) es de ritmo: queda para revisión humana de diversión |
| 10 | UI | Banco: tomaba un cable sin tener ninguno y la indicación «Ahora tocá otra pieza…» quedaba tras resolver | Hecho (ciclo 2) |
| 11 | UI | Título recortado | Hecho (ciclo 12): 800×600 ya bien; corregido el teléfono apaisado |
| 12 | Rendimiento | Medir build de producción en el M2: FPS, carga, memoria por zona | Hecho (ciclo 9): 60 FPS con margen en escritorio; móvil NO VERIFICADO |
| 12b | Rendimiento | Descarga de 19,3 MB | Hecho (ciclo 11): 16,8 MB; geometría 11,3 → 8,8 MB |
| 13 | Móvil | Controles táctiles y 390×844 | Hecho en emulación (ciclo 12, `qa-touch.mjs`); hardware real NO VERIFICADO |
| 14 | Audio | Revisión por código | Hecho (ciclo 12): sonidos de restauración completos; escucha NO VERIFICADA |
| 15 | Presentación | (Hecho, ciclo 3) Tipografía diminuta a 1280×720: rol del hablante 8 px, «Continuar» 10 px, teclas del recordatorio 8 px, guardado 9 px, rótulos de Bitácora/mapa 8–10 px, notas de opciones 10 px (`scripts/qa-type-sizes.mjs`) | Hecho (ciclo 3) |
| 16 | Navegación | Detalles atravesables a la altura del pecho | Hecho (ciclo 10): 13 eran falsos positivos (margen menor que el cuerpo); 3 reales corregidos |
| 17 | Assets | `portraits.webp` y `portraits-2.webp` (semirrealistas) ya no se ven: los retratos activos están en `art-polish/` y coinciden con los sprites | Revisado (ciclo 19): se conservan; `style.css` los usa como base y dos herramientas de QA los usan (`qa-art.html`, `qa-asset-server.mjs`) |
| 18 | Puzzles/UI | Bancos difíciles de entender: qué hacer, cómo, cuándo está bien, cómo seguir (reporte del usuario) | Hecho (ciclo 15): ver BANCOS-UX.md. Prueba con personas NO VERIFICADA |
| 19 | Móvil | Teléfono apaisado: banco ilegible, mapa fuera de la vista | Hecho (ciclo 16) en emulación; hardware real NO VERIFICADO |
| 20 | Mapa | El mapa no parecía de un juego ni seguía la geografía (reporte del usuario) | Hecho (ciclo 17): ver MAPA.md. Teléfono real NO VERIFICADO |
| 21 | Mundo | Montaña y central al oeste del Manantial, umbral del Arco II (pedido del usuario) | Hecho (ciclo 18): ver MONTE-QUIETO.md |

## Comandos útiles (desde `experiments/playcanvas`)

```sh
npm test && npm run check && npm run build
npm run dev                         # 127.0.0.1:4190
node scripts/playthrough.mjs        # partida completa por teclado y clics, guardado aislado
```

Los scripts de navegador eligen Chrome por plataforma (`scripts/chrome.mjs`, `CHROME_PATH`).

## Siguiente acción

**Entrega parcial, candidata `80ae42c` (6 oct 2026).** Aceptación completa en verde, que ahora
incluye el teléfono apaisado ([ACEPTACION.md](ACEPTACION.md)). Siguen pendientes, fuera del alcance
de este equipo:
- teléfono real (tacto y 30 FPS);
- escucha del audio;
- prueba con personas, en especial de los bancos rediseñados.

Siguen abiertos y para decidir con el usuario:
- **Bancos:** pistas que cambien según el error cometido y una pregunta de predicción en los bancos
  clave ([BANCOS-UX.md](BANCOS-UX.md)).
- **Escenas oscuras:** la llegada al Faro de noche, el Lago al crepúsculo y el taller a oscuras.
  El canon las pide así.

Para mirar el juego en el navegador integrado, cerrá la pestaña al terminar: compite por la GPU
con las partidas automatizadas.

Servidores de trabajo: `npm run dev` (4190, código vivo), `node scripts/serve-snapshot.mjs 4192`
(copia congelada para partidas largas).
