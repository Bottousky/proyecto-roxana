# Home · Instituto Roxana — estado de producción

Estado canónico del loop de la home (brief: `ROXANA_HOME_AAA_LOOP.md`, recibido el 2026-10-05).
Estado: **EN CURSO** · ciclo 3 cerrado (2026-10-06). Loop de sesión: cron `04a38e45` cada minuto.

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

## Siguiente acción exacta

1. Grabar el gesto (Playwright `recordVideo` en `home-interact.mjs`) y revisar ritmo/anticipación/reposo.
2. Cartelera física de novedades en el patio (pieza 3D que abre `#novedades`), con indicador discreto.
3. Hacer más legible el chip de Bitland en el plano maestro (luz/placa visibles por encima del taller).
4. Rendimiento con `vite preview` sin otra carga de GPU; frame times, memoria, ciclos abrir/cerrar panel.
