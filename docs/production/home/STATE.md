# Home · Instituto Roxana — estado de producción

Estado canónico del loop de la home (brief: `ROXANA_HOME_AAA_LOOP.md`, recibido el 2026-10-05).
Estado: **EN CURSO** · ciclo 1.

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

## Siguiente acción exacta

1. `cd experiments/playcanvas && npm test` y `node node_modules/vite/bin/vite.js build`; corregir lo que rompa.
2. Recorrer con `scripts/home-shots.mjs`: `#novedades`, `#sobre`, móvil 390×844, y forzar sin WebGL
   (Chrome `--disable-webgl`) para la versión ligera.
3. Ocultar rótulos que caen bajo `.intro` (o desplazar más el campus) y subir contraste del antetítulo.
4. Siguiente salto visible: identidad exterior de cada taller (artefacto vivo visible desde el plano maestro).
