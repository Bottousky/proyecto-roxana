# Ohmdal · Prueba PlayCanvas

Rama: `codex/playcanvas-slice`. URL local: **http://127.0.0.1:4190/**.
La versión principal sigue en http://127.0.0.1:4180/.

Prueba acotada de Plaza → Calzada → Puerta de Ohm, con acceso al interior del
taller. PlayCanvas Engine 2.22.1 + TypeScript + Vite. Los sprites, retratos y
superficies proceden de Ohmdal actual. El navegador no ejecuta Three.js.

## Jugar

`Jugar prueba.cmd`, o `npm run dev` desde esta carpeta. Si es un checkout nuevo,
instalar primero con `npm ci`. Se incluyen lockfile y assets propios. WASD/flechas,
Shift para correr, clic para caminar, E para interactuar y Escape para pausar.
También hay controles táctiles.

Las opciones permiten cambiar día/noche, caminar al taller, recorrer Plaza ↔
Calzada automáticamente y mostrar tiempos de cuadro. La entrada del taller está
en la fachada sur; acercarse y pulsar E. Dentro se puede conversar con Lumen y
volver a la Plaza por la entrada. Recargar conserva posición, interior y luz.
Guardado aislado: `ohmdal-playcanvas-slice-v1`, además de un origen distinto.

## Qué se está comparando

- Un espacio exterior en coordenadas globales, sin carga o promoción de rooms
  al pasar de Plaza a Calzada.
- Renderizado, materiales, sombras, cámara ortográfica, entidades y componentes
  Sprite/Script de PlayCanvas. Atlas con cuatro direcciones y pose de reposo.
- Escenario estático agrupado por material, conservando entidades identificadas
  para los edificios. El taller tiene su entidad propia.
- Navegación por clic, movimiento con barrido contra obstáculos y seguimiento
  de Ohm. Se conservaron los algoritmos 2D independientes del renderer para
  comparar el mismo comportamiento; **esta prueba no evalúa Bullet/Ammo**.
- HUD ligero, diálogos breves de prueba con retratos, pausa y persistencia.

`export-scene.mjs` convierte en tiempo de desarrollo la geometría del proyecto
actual a datos. Requiere la carpeta fuente de Ohmdal para regenerarlos, pero no
para instalar, compilar ni ejecutar esta carpeta: `src/data/scene.json` ya está
incluido. No es una captura de pantalla ni un fondo: hay mallas, profundidad,
sombras y oclusión reales. La conversión no equivale a autoría con PlayCanvas
Editor; ese flujo todavía debe evaluarse por separado.

## Límites de la comparación

La prueba incluye tres lugares, no el Arco I completo. El agua utiliza un material
animado simple; no replica el shader principal ni su iluminación completa.
La vegetación se conserva en buena parte, pero algunas capas procedurales,
partículas y luces puntuales no se trasladaron. No se migraron circuitos,
Bitácora, mapa completo, narrativa, audio ni cinemáticas.

El agrupamiento de mallas es una optimización de este exportador; una mejora de
draw calls no puede atribuirse exclusivamente al cambio de motor. Tampoco sería
justo comparar su carga con la preparación de los nueve lugares del juego actual.
La geometría JSON es una representación de ensayo grande: 27,3 MB sin comprimir,
2,69 MB con gzip. El bundle JS de producción es 1,99 MB, 517 kB con gzip. Antes de
una migración conviene un formato binario/GLB y evaluar memoria y carga en móvil.

La pasada final Plaza–Calzada–Plaza registró 18 ms de máximo, p99 de 17 ms y cero
cuadros superiores a 50 ms en este equipo (WebGL2, escala 1×). Es una observación del prototipo, no un
benchmark de motores. El panel muestra el p99 de los últimos 600 cuadros y el
máximo desde la carga o el inicio del recorrido automático.

## Validación

`node --test slice.test.mjs`, `npm run check` y `npm run build`.
Las pruebas cubren los caminos contra los obstáculos exportados, las paredes y
el canal, el desvío de Ohm alrededor de la fuente y la separación del runtime.
También se verificaron en el navegador la entrada y salida del taller, el
diálogo con retrato de Lumen, el cambio de luz, la recarga dentro del taller y
el recorrido de ida y vuelta con Ohm. La iluminación nocturna es sólo una
prueba ambiental; aún faltan las luces locales del juego principal.

## Guía utilizada

- [Skill oficial build-app](https://github.com/playcanvas/skills/blob/main/skills/build-app/SKILL.md).
- [Aplicación directa](https://github.com/playcanvas/skills/blob/main/skills/build-app/references/direct-engine.md).

La instancia de Application posee el renderer, las entidades y el ciclo de vida.
Las APIs se contrastaron con los tipos instalados. No se instaló un editor ni un
servicio externo, y no se reemplazó la aplicación principal.
