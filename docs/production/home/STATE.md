# Home · Instituto Roxana — estado de producción

Estado canónico del loop de la home (brief: `ROXANA_HOME_AAA_LOOP.md`, recibido el 2026-10-05).
Estado: **CANDIDATO_PARA_REVISION** (2026-10-06) → [`CANDIDATE.md`](CANDIDATE.md). Sin críticos abiertos. Pulido de arte en curso. No es candidato todavía (ver `REVIEW-c07.md`). Loop de sesión: cron `04a38e45` cada minuto.

## Qué es la home real

- Ruta: `experiments/playcanvas/escuela.html` → `src/escuela/main.js` (PlayCanvas 2.22.1, sin Three.js).
- Rama/worktree: `claude/roxana-home-3d-upgrade-e3f8d2`, creada desde `f7984ca`
  (= `main` = `claude/landing-escuela-visual-12802b`). Ninguna otra rama tocó `src/escuela/` desde entonces.
- Ejecutar: `cd experiments/playcanvas && npm ci && node node_modules/vite/bin/vite.js --port 4196 --strictPort`
  → `http://127.0.0.1:4196/escuela.html` (`.claude/launch.json` → `roxana-home`). El 4190 lo usa otro agente.
- Capturas reproducibles (perfil aislado, nunca toca partidas): `node scripts/home-shots.mjs vista@0/tarde,electronica@3/noche [carpeta]`.
- Guardados que lee: Ohmdal `ohmdal.playcanvas.arc1.v1` (sólo lectura). Propio: `roxana.escuela.v1` (perfil, visita, preferencias).
- Otros mundos (otros agentes, otras ramas, **no tocar**): Arithmos `claude/arithmos-graphic-adventure-065e68`
  (`experiments/arithmos`, guardado `roxana.arithmos.v1`), Bitland `claude/bitland-aaa-loop-496fb2`
  (`experiments/bitland`, `bitland.partida.v1`), Physica `claude/physica-opus55-production-465980`
  (`experiments/physica`, `physica.v2`). En desarrollo corren en puertos/orígenes distintos: **no comparten
  localStorage con la home**. En GitHub Pages compartirían origen sólo si se publican bajo el mismo sitio.

## Línea base (ciclo 0, 2026-10-05) — `evidence/c00-base/`

Chrome 141 headless, ANGLE Metal, Apple M2, 1440×900 DPR1 y 390×844 DPR2 (emulación móvil, no teléfono real).

- Carga fría (Vite dev): ~9 s de pantalla vacía con sólo «Levantando el Instituto»; recarga ~2,5 s. Sin identidad,
  frase ni acción útil hasta que termina el 3D. Sin WebGL: sólo un texto de error, sin enlaces.
- Llegada: un modal centrado tapa el campus y exige elegir antes de mirar (`llegada--manana-1440.jpg`).
- Plano maestro: bandeja flotante entre nubes vista casi cenital desde 200 u con FOV 24°; patio gris vacío
  dominante; cuatro talleres idénticos; ocho rótulos grandes compitiendo; de noche casi ilegible.
- Etapa 10 de día: el haz de la linterna cruza la pantalla como una franja blanca (`vista-10-tarde-1440.jpg`).
- Móvil: campus en una franja central; rótulos superpuestos; medidor y directorio desbordan el ancho.
- Sin novedades editoriales, sin «Sobre Roxana» propio, sin redes. Sólo Ohmdal integra progreso; el medidor «0/40»
  sugiere cuatro mundos medidos cuando tres no tienen integración.

## Los tres problemas de mayor impacto

1. **El encuadre maestro no tiene identidad**: maqueta flotante genérica, cenital y lejana, sin foco, silueta ni planos.
2. **La primera visita depende del 3D**: carga muda, modal que intercepta, sin versión ligera ni accesos HTML
   (Jugar/Continuar, Explorar, Novedades, Sobre Roxana).
3. **Progreso, novedades y redes no existen como sistema**: sólo Ohmdal; sin cartelera ni fuente editorial;
   sin configuración validada de redes; medidor que confunde mundos no integrados con progreso.

## Ciclo 1 (2026-10-05) — interrumpido por límite de uso, checkpoint local

Hecho (evidencia en `evidence/c01/`, mismas condiciones que la base):
- Fin de la bandeja flotante: `src/escuela/landscape.js` (terreno polar, campos, camino pintado hasta el portón,
  arboledas fusionadas por sprite) y borde de césped en `school.js`; niebla lineal por hora (bruma de mañana/tarde).
- Encuadre maestro ¾ desde el sudeste (`OVERVIEW` en `rooms.js`), comparado con dos variantes (`output/home/variants*`).
- Haz de la linterna sólo de noche (antes: franja blanca de día).
- Portada HTML en `escuela.html`: identidad, frase, «Entrar a Ohmdal/Continuar», «Explorar el campus», Novedades,
  Sobre Roxana, antes y sin 3D. Sin modal de bienvenida. Versión ligera si falla WebGL (`lightVersion`). Rutas `#novedades`/`#sobre`.
- Novedades: `public/escuela/novedades.json` + `src/escuela/news.js` (validación, orden estable, vacío/carga/error,
  ejemplo sólo en dev y rotulado). Redes: `src/escuela/social.js`, **ninguna URL confirmada** → no se publica ningún enlace.

NO VERIFICADO todavía: versión ligera sin WebGL, panel de Novedades y de Sobre Roxana en el navegador, Atrás/Adelante,
móvil del nuevo layout, teclado/foco, `npm test`, build de producción, rendimiento.

Defectos conocidos: el rótulo «Taller de Física» queda bajo los botones de la portada; antetítulo con poco contraste;
cuatro talleres siguen idénticos por fuera; noche muy oscura; la tarjeta «Cambió por tu aventura» sigue siendo bloqueante.

## Ciclo 2 (2026-10-06) — verificación del ciclo 1 y artefactos protagonistas

Verificado (Chrome headless, ANGLE Metal, M2; GPU compartida con la partida automatizada de otro agente, así que
los tiempos de captura no sirven como medición):
- `npm test`: 93 pruebas OK (10 nuevas en `tests/escuela-home.test.js`: novedades, redes, perfil, paisaje,
  artefactos). `vite build` OK.
- `#novedades` (ejemplo rotulado sólo en dev), `#sobre`, versión ligera sin WebGL (`--disable-3d-apis`),
  móvil 390×844: capturas en `evidence/c02/`. 60 FPS a 1440×900 en reposo (rAF, 3 s), sin otra carga simultánea.

Corregido:
- Bruma ligada a la distancia de cámara (móvil ya no queda lavado); rótulos ocultos si caen bajo la portada o
  salen de pantalla; controles y portada ya no se superponen en móvil; medidor oculto en pantallas angostas.
- El haz diurno seguía visible: con mezcla aditiva la opacidad no actúa; ahora se apaga por emisivo y `enabled`.
- Aviso de vista previa fuera del título.

Salto visible — artefactos protagonistas (`src/escuela/artifacts.js`, ver `PROGRESSION.md` y `ASSETS.md`):
- Ohmdal: Faro en miniatura con placa y tendido de cobre sobre aisladores hasta los faroles del patio.
  La linterna se enciende sólo con `beacon_lens` real.
- Physica: columna de vidrio donde el agua sube, una piedra flota y el plato derrama afuera, donde cae.
- Bitland: ciudad cian sobre un chip bajo una lupa inclinada; un pulso recorre un único bucle (`LOOP / JMP 0x00`).
- Arithmos: caballete con pizarrón: la misma cantidad cambia de representación (½, 0,5, círculo, 2/4, 50 %),
  un punto que late y una figura de palitos.
- Tocar un artefacto abre su taller (segunda caja de selección por sala). Árboles movidos para despejar ejes.

Limitaciones: los tres mundos no integrados no cambian con progreso (sin contrato de origen); la lupa no
magnifica; el chip de Bitland apenas asoma en el plano maestro; noche todavía oscura fuera del patio; la
interacción insignia (respuesta al tocar un artefacto) aún es sólo navegación.

## Ciclo 3 (2026-10-06) — interacción insignia y regreso no bloqueante

- **Tocar un artefacto** acerca la cámara y el objeto responde a su manera (~2 s, saltable con un toque o
  Escape; con movimiento reducido 1 s sin vuelo), con un rótulo que explica; después abre su taller.
  Faro: según el `beacon_lens` **real** gira su haz o intenta encender y queda apagado. Columna: la piedra sube
  y el vidrio se entibia. Chip: el pulso sale de su bucle y un anillo recorre la ciudad. Pizarrón: escribe la
  siguiente forma y el punto se estira en un segmento. Botón «Mirar …» en cada taller (teclado).
- **«Cambió por tu aventura»** ya no es modal: campus transformado al llegar, tarjeta lateral con lo que volvió,
  recorrido opcional; se presenta una sola vez.
- Bruma de los acercamientos con distancia mínima (antes lavaba la piedra cercana); poses de Física y Bitland.
- QA de interacción reproducible: `node scripts/home-interact.mjs` → **20/20** (`evidence/c03/interaccion.log`).
  `npm test` 93/93, build OK. Evidencias en `evidence/c03/` (fixtures etapas 3, 5 y 10).

Limitaciones: la captura de la respuesta es un cuadro (un screenshot no verifica la animación: sin grabación
disponible, NO VERIFICADO el ritmo); sonido de los gestos sólo con sonido activado, no escuchado; Bitland,
Physica y Arithmos siguen sin progreso real (bloqueo de origen documentado en `PROGRESSION.md`).

## Ciclo 4 (2026-10-06) — cartelera física y ritmo del gesto

- **Cartelera de novedades** junto al camino del portón (`buildNoticeBoard`): postes, techito de pizarra, corcho
  con papeles dibujados desde `novedades.json` (hasta cuatro, más recientes primero; vacío digno; ejemplos de
  desarrollo marcados), placa NOVEDADES, luz tenue de noche y **farolito que sólo se enciende con novedades
  reales sin leer**. Se reconoce en el plano maestro (rótulo «Cartelera»), está en el directorio y tocarla lleva
  la cámara a ella y abre el panel HTML. La URL `#novedades` se restaura al recargar.
- **Ritmo del gesto** revisado con tira de cuadros (`scripts/home-strip.mjs`, 3 s muestreados): antes el efecto
  empezaba con la cámara en vuelo; ahora hay anticipación (0,55 s), gesto y reposo antes del taller (2,6 s).
- QA de interacción **26/26** (`evidence/c04/interaccion.log`), incluida la secuencia no leído → leer → recargar con
  contenido de prueba interceptado (no publicado). `npm test` 93/93.

Limitaciones: la tira es por capturas (~11 fps efectivos), no video; la cartelera muestra el ejemplo sólo en dev,
en producción hoy queda vacía porque no hay novedades confirmadas (dato externo pendiente, no un error).

## Ciclo 5 (2026-10-06) — silueta propia de cada taller y noche legible

- **Remates de techo** (`roofAccent` en `school.js`), dimensionados para el plano maestro y que suben con el techo
  al abrir la sala: Electrónica, pararrayos de cobre con aisladores, bajada y una bombilla que se enciende con
  `workshop` **real**; Física, anemómetro que gira con ráfagas; Programación, lucernario de vidrio con luz cian
  contenida (la ciudad del chip) y un mástil — Bitland por fin se anuncia desde lejos; Matemática, un sólido de
  tiza que rota dentro de un anillo de latón. Movimiento en reposo con movimiento reducido.
- Rótulos de talleres elevados por encima de los remates. Luz de luna (ambiente) para leer techos y caminos.
- Verificación: partes y proyecciones inspeccionadas en página; el anemómetro cae bajo el botón «Explorar» en modo
  portada (visible al explorar: `evidence/c05/explorar-2-tarde-1440.jpg`). `npm test` 93/93.
- Nueva toma `explorar` en `home-shots.mjs`. Una captura cayó por `CVDisplayLink` (pantalla en reposo); se repitió.

Limitaciones: en modo portada (escritorio) el texto cubre Física y parte de Electrónica; los remates de Φ, λ, ∑
son ambiente, no progreso (sin integración de esos mundos).

## Ciclo 6 (2026-10-06) — primer pintado real, portada, medición y peso

- **Primer pintado = el campus**: imagen fija renderizada desde el plano maestro (horizontal y vertical) como fondo
  antes de cualquier JS, con velo del lado del texto y estilos críticos de los botones en línea. Es también el fondo
  de la versión ligera sin WebGL (antes: degradado vacío). Se regenera con `home-shots.mjs poster@0/tarde`.
- **Portada de escritorio**: título en una línea, columnas más angostas y campus más a la derecha; el patio ya no
  queda bajo el texto (Física sigue parcialmente cubierta en 1440×900; se ve al explorar).
- **Medición** (`PERF.md`, `scripts/home-perf.mjs`, build de producción, GPU compartida con otros agentes):
  60 FPS con p99 16,8 ms en reposo y sala abierta a 1440; LCP 252 ms; CLS 0; interactivo en 2,0 s; entidades
  estables. **Corregido en el ciclo 7:** a 390×844 DPR 2, tras 10 ciclos, el JSON registra 16,4 FPS (omitido por error). Draw calls 856–1233: anotado como presupuesto pendiente.
- **Peso inicial 6,74 → 5,30 MB**: visitantes de Ohmdal se descargan al llegar a su etapa; estandarte en copia
  reducida. Etapa 10 verificada con los visitantes en el patio. QA de interacción 26/26, `npm test` 93/93.
- Corregido: rectángulo duro detrás del texto en la versión ligera.

## Ciclo 7 (2026-10-06) — revisión independiente y corrección de bloqueos

- **Revisión crítica** por un agente separado, de sólo lectura: 24 hallazgos, 2 críticos. Triage completo en
  [`REVIEW-c07.md`](REVIEW-c07.md).
- **Crítico 1 (reporte):** el ciclo 6 omitió un dato adverso (16,4 FPS tras ciclos a 390 DPR 2). Corregido en
  PERF/STATE. El script medía ese «después» en un primer plano; corregido. Con carga igual, antes ≈ después.
- **Crítico 2:** «reducir movimiento» del sistema ahora se respeta en 3D, esperas y CSS.
- **Corregidos además:** cantidades inventadas para mundos sin integrar (medidor «n/10» de Ohmdal), regreso con
  hash que salteaba «Cambió por tu aventura», home caída con almacenamiento bloqueado, versión ligera sin
  directorio, historial (abrir = un paso, cerrar = volver), carreras de gesto/atajos/farolito, `inert` y foco
  visible, rótulos anclados a su edificio, destello del portal al volver por bfcache, sonido al iniciar,
  selector de etapas sólo con `?qa`, interiores sin dibujar con el techo cerrado (≈25 % menos draw calls),
  perfil liviano por defecto en teléfonos táctiles.
- QA: `npm test` 96/96 (incluye compilación de los módulos de la home, que antes no cubría ningún test: así se
  escapó un error de sintaxis durante este ciclo); interacción 26/26; teclado e historial 14/14.

NO VERIFICADO: FPS absolutos con la GPU libre; bfcache real; teléfono real; sonido escuchado; memoria de GPU.
(Pérdida de contexto WebGL: resuelta y verificada en el ciclo 10.)

## Ciclo 8 (2026-10-06) — acercamientos limpios y el mapa que recuerda

- **Acercamientos** (revisión #7 y #18): en salas, gestos y recorridos los árboles del patio que quedan delante o al
  costado del sujeto se apagaban de golpe (rectificado: desde c11 se desvanecen); la exposición baja (−26 %) y el tinte de la tarde se neutraliza al acercarse; el
  rótulo del gesto pasa arriba con fondo propio; el aviso de exploración se oculta durante el gesto. Physica: la
  columna interior sube continua hasta el plato y la cortina exterior cae hasta la pileta; encuadre más abierto.
- **Mapa del Taller de Electrónica** (memoria §7): cada lugar de Ohmdal aparece con su miniatura sólo tras su
  restauración real; los demás son huecos anónimos. También en el panel, con texto alternativo. Alfombra de Lumen y
  lámparas colgantes que se encienden con `workshop`. Atlas y alfombra cargan al abrir el taller.
- QA: `npm test` 97/97; interacción 26/26; teclado e historial 14/14. Evidencias en `evidence/c08/`.

Limitaciones: bancos e instrumentos del taller siguen siendo cajas; los otros tres interiores sin cambios; la luz de
las lámparas colgantes es emisiva (sin luz puntual propia); FPS sin medir con la GPU libre.

## Ciclo 9 (2026-10-06) — jerarquía del plano maestro (antes/después en `evidence/c09/`)

- Pantalla del Anfiteatro a media luz desde la vista general (deja de ser lo más saturado del cuadro) y telón menos
  rojo; brilla entera con la sala abierta o un video.
- Luz de acento cálida sobre la estatua de Roxana: de noche es el foco del patio.
- Bruma más lejana; de mañana tira a azul, de tarde sigue beige oliva (rectificado en c11); árboles lejanos con
  suelo debajo. Colinas acercadas, pero **siguen fuera del encuadre** (la cámara maestra mira hacia abajo y el
  horizonte queda arriba del cuadro): no se forzó.
- Noche: más luna y luz ambiente; en etapas bajas se leen las formas; en la etapa 10 los faroles restaurados
  encienden el patio (la noche cuenta el progreso real). Lucernario de Trofeos con material propio y emisivo tenue:
  ya no satura, pero sigue claro (parcial).
- Imágenes del primer pintado regeneradas. QA: `npm test` 97/97; interacción 26/26; teclado 14/14.

## Ciclo 10 (2026-10-06) — instrumentos del taller, contexto perdido y primer pintado por hora

- **Bancos de Electrónica**: caja de instrumento en nogal (pantalla que vuelve con `workshop` real, perillas de latón,
  bornes), galvanómetro con esfera graduada y aguja en reposo, bobina de cobre, soldador en su soporte, protoboard.
  Etapa 0 vs 4 en `evidence/c10/banco-e0.jpg` / `banco-e4.jpg`.
- **Contexto WebGL perdido** → la misma página continúa como versión ligera (panel abierto conservado, Escape,
  Novedades, «Volver a cargar el campus 3D»). Defecto encontrado al probarlo: `canvas.hidden` no ocultaba el lienzo
  (el CSS `display:block` ganaba) y quedaba un rectángulo blanco; corregido. Prueba en `home-interact.mjs` §5.
- **Luz de acento sobre Roxana**: no alumbraba (apuntaba hacia arriba: los focos de PlayCanvas iluminan por −Y). Lo
  que el ciclo 9 atribuyó a ese foco era el farol de la etapa ≥1. Corregido y verificado midiendo su dirección; de
  noche crece con el farol real (`awaken`).
- **Primer pintado según la hora** (mañana/tarde/noche, horizontal y vertical) elegido por un script en línea con la
  misma regla que `hourFor`.
- QA: `npm test` 97/97; interacción **28/28** (incluye contexto perdido); teclado e historial 14/14.

## Ciclo 11 (2026-10-06) — segunda revisión independiente y correcciones

- Señal táctil de los artefactos: halo tenue del color de cada mundo que respira y se apaga en los acercamientos.
  (Dos defectos propios al hacerlo: con mezcla aditiva la opacidad no actúa, y un comentario `//` se comió el
  `addChild`, así que el halo no existía; ambos corregidos y verificados en la página.)
- Directorio «Sobre Roxana»; Novedades sin enlaces muertos (resto en la misma página, `href="#"` rechazado, no leído en
  primera visita sólo con contenido real); vista previa de entrada cancelable; lucernario de Bitland en violeta.
- **Segunda revisión independiente**: 0 críticos, 4 altos. Triage en [`REVIEW-c11.md`](REVIEW-c11.md): ALTO 1–3
  corregidos con prueba (versión ligera sin callejón, regreso por bfcache simulado, árboles que se desvanecen), ALTO 4
  bloqueado por el entorno (GPU ocupada por otro agente todo el ciclo). Medios y bajos corregidos salvo #10 (arte).
- Pósters del primer pintado por hora × tramo de progreso (abandonada / media / restaurada).
- QA: `npm test` 98/98; interacción **32/32** (nuevas: árboles, bfcache simulado, ligera, movimiento reducido);
  teclado e historial 15/15. Evidencias en `evidence/c11/`.

NO VERIFICADO: FPS con la GPU libre; bfcache real (sólo simulado); teléfono real; sonido; memoria de GPU.

## Ciclo 11 · cierre

Medición con la GPU libre a 1440: el perfil alto caía a 53 FPS en la vista general; con el DOF en calidad normal
(sin diferencia visible) sostiene 60,1 FPS, p99 16,8 ms. QA final sobre `464af35`: tests 98/98, interacción 32/32,
teclado 15/15. Paquete §14 en `CANDIDATE.md`.

## Ciclo 12 (2026-10-06) — pulido de primeros planos

- La «vereda dentada y sobreexpuesta» de los acercamientos era el borde pixelado de la sombra del sol y un brillo
  especular del césped (gloss 0,25 con el sol bajo de frente). Ahora la sombra cubre 48 unidades en vez de 190 al
  acercarse (texeles ~4× más finos) y pasto, tierra, terreno y setos son mates. Setos con 13 segmentos y normales
  suaves en lugar de prismas de 7 caras. Antes/después: `evidence/c08/bitland-respuesta.jpg` →
  `evidence/c12/bitland-respuesta.jpg`; vista general sin regresión `evidence/c12/explorar-10-tarde-1440.jpg`.
- QA: tests 98/98; interacción 32/32; teclado 15/15. Medición 390: GPU ocupada por tres agentes, sin medir.

## Ciclo 13 (2026-10-06) — verificación breve, sin cambios

- Revisados los interiores de Física, Programación y Matemática con la cámara real (`output/home/c13/`, no versionado).
  El triángulo claro sobre el muro norte es la luz del sol sobre su cara interior, recortada por la sombra del muro
  vecino (no hay geometría por encima de los muros: verificado en la página). No es un defecto.
- Sin datos externos nuevos (redes `url:null`, 0 novedades reales). GPU ocupada por Physica, Arithmos y el checkout
  principal: medición 390 no realizada.
- Estado: **CANDIDATO_PARA_REVISION**, con pendientes que dependen de terceros (BLOQUEADO_EXTERNO para lo que falta).

## Ciclo 14 (2026-10-06) — Trofeos y Anfiteatro visibles (pedido del usuario)

- Estaban en las esquinas traseras: la cámara principal veía el Anfiteatro a través de Programación y la fachada de
  Trofeos tras Electrónica. Ahora flanquean la Dirección en la fila norte, de frente al patio: Anfiteatro al oeste
  (bajo, se ve entero; 4 gradas), Sala de Trofeos al este (alta, separada de la Dirección). Salas, trofeos y luces
  derivan de `BUILDINGS`/`AMPHI`. Pines de los talleres en el medallón del hastial sur (la cara que ve la cámara).
- Prueba nueva con techos a dos aguas y la distancia real de cámara: antes Trofeos 10/15 y Anfiteatro 3/6 puntos
  visibles; ahora 12/15 y 5/6. Antes/después en `evidence/c14/`.

## Siguiente acción exacta

1. Regenerar los pósters del primer pintado (muestran la disposición vieja): `home-shots.mjs poster@{0,5,10}/{manana,tarde,noche}`.
2. Revisar móvil 390 y el modo portada con la nueva fila norte; correr `home-keys.mjs`.
