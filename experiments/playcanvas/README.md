# Ohmdal · La Luz — PlayCanvas

Arco I jugable en la rama **codex/playcanvas-slice**.

- Jugar: http://127.0.0.1:4190/
- Producción: https://bottousky.github.io/proyecto-roxana/
- Versión anterior para comparar: http://127.0.0.1:4180/
- Iniciar localmente: abrir **Jugar PlayCanvas.cmd**, o ejecutar npm run dev.
- En un checkout nuevo: npm ci antes de iniciar.

## El viaje

Portal Ω → Plaza → Taller de Lumen → Calzada y Puerta de Ohm → Manantial →
Castillo de la Red → Terrazas → Lago de las Señales → Faro.

Incluye los nueve circuitos con simulación eléctrica, mandos físicos previos a
cada banco, medición con Ohm, conversaciones y retratos, descubrimientos,
Bitácora con experimentos e hipótesis personales, mapa local y del reino,
cinemáticas de restauración, final y epílogo. Se puede seguir explorando y
volver a medir las instalaciones terminadas.

WASD/flechas para caminar, Shift para correr, clic para ir o seleccionar un
objeto, E para interactuar, Q para medir, J para la Bitácora, M para el mapa,
Escape para opciones. Hay controles táctiles, lectura instantánea, reducción
de movimiento, volumen y calidad gráfica.

El día avanza con el viaje: mañana en el Portal, tarde al Manantial y Castillo,
atardecer en las Terrazas, crepúsculo en el Lago y noche en el Faro. Volver sobre
el camino conserva la hora. El epílogo abre la mañana siguiente. No hay un
reloj que apure al jugador.

## Un mundo que responde

Los vecinos conservan pequeños recorridos y cambian de actividad con la
historia. Ohm busca caminos alrededor de obstáculos. La rueda del Manantial,
los engranajes, mandos, portón y óptica responden a sus instalaciones. El agua
vuelve a las fuentes y bancales; las luces necesitan suministro y respetan la
hora. Hay agua animada, polen, telas, barcas, resplandores y la señal giratoria
del Faro. El sonido ambiental sigue fuentes situadas en la geografía compartida.

Los exteriores ocupan coordenadas globales en un único mundo residente. Cruzar
un límite narrativo cambia contexto e interacciones, conservando cámara y
posiciones físicas. El taller mantiene su entrada y salida de interior.

## Arquitectura

PlayCanvas Engine **2.22.1**, entidades, materiales, mallas, sprites y scripts
nativos. No se ejecuta Three.js en el navegador. Las colisiones conservan el
modelo 2D de obstáculos y barrido; no se utiliza Bullet/Ammo.

- src/world.js: adaptación del mundo y presentación en PlayCanvas.
- src/game/: instantánea independiente del canon, progresión y sistemas del juego.
- src/terrain.js: reglas de terreno compartidas con las pruebas.
- src/art.ts: texturas, atlas y alineación de sprites.
- src/data/: manifiesto y geometría binaria comprimida (aproximadamente 9,5 MB).
- public/: imágenes y fuentes locales; no se necesitan servicios externos.

La conversión preserva materiales agrupados, costas con varios materiales,
pivotes de mecanismos y huellas de colisión. Las mallas se preparan al inicio;
los cambios de zona no construyen ni descargan otro escenario.

sync-game.mjs actualiza la instantánea desde el proyecto original y aplica las
adaptaciones declaradas de esta rama. export-scene.mjs utiliza los constructores
Three.js sólo fuera del juego para regenerar la geometría. Estos dos comandos
requieren el proyecto fuente; instalar, compilar y jugar esta carpeta no.

Se corrigieron en esta rama el acceso al recuerdo del Lago y la desembocadura
del canal junto al muelle. El mundo no se editó ni publicó mediante PlayCanvas
Editor: es una aplicación con la API directa del motor.

## Guardado

La partida usa **ohmdal.playcanvas.arc1.v1**, separada de la demostración anterior
y de la versión Three.js. Incluye puzzles sin terminar, notas, hora, diálogos,
cinemáticas pendientes y final. Las opciones permiten exportar/importar una
Bitácora. La demostración anterior no se convierte en una partida avanzada:
el arco empieza en el Portal.

## Verificación

GitHub Pages publica los archivos compilados desde la rama `gh-pages`,
con `node node_modules/vite/bin/vite.js build --base=/proyecto-roxana/ --outDir dist-pages`.
La rama `main` conserva el reinicio del canon. Los assets y el mapa admiten
la subruta del repositorio. Publicar el contenido de `dist-pages` con `.nojekyll`.

- npm test: pruebas del modelo eléctrico, progresión, guardado, Bitácora,
  cinemáticas, accesibilidad de objetos y correspondencia de los caminos.
- npm run check: TypeScript de los assets y sintaxis del adaptador.
- npm run build: versión de producción.
- npm run test:journey: partida automatizada usando teclado y clics, con guardado
  separado en un navegador de prueba. Requiere Chrome instalado; la ruta usada
  por el script es C:/Program Files/Google/Chrome/Application/chrome.exe.

El recorrido de prueba conserva capturas, reporte y Bitácora en
output/playcanvas-playthrough (no se incluyen en Git). La inspección interna
se usa sólo para observar y planificar entradas; las reparaciones se realizan
a través de los controles del juego.

Validado el 10 de septiembre de 2026: **64 pruebas aprobadas**, comprobación
estática y compilación correctas. La partida completa recorrió los nueve
lugares, resolvió los nueve circuitos, encontró los nueve recuerdos, encendió
el Faro, abrió el epílogo y recargó el guardado final sin errores de navegador.
La versión compilada también se comprobó importando esa Bitácora, regresando
al Lago y la Plaza, abriendo mapa y diario y revisando el diseño a 390 × 844.
Esto verifica la interfaz estrecha; no sustituye una medición en móvil real.
Para repetir esa segunda comprobación: iniciar `vite preview` en el puerto
4191 y ejecutar `node scripts/production-smoke.mjs` después de la partida
automatizada. `GAME_URL` permite usar otra dirección.

## Alcance de esta versión

El contenido del Arco I está trasladado; no es una reproducción idéntica de
cada shader de Three.js ni una medición comparativa entre motores. La navegación
y el modelo eléctrico se conservaron deliberadamente. La carga inicial todavía
prepara todo el arco, y los assets raster dominan la descarga. Antes de publicar
conviene medir móviles y optimizar texturas según los dispositivos objetivo.

Guía de referencia: https://github.com/playcanvas/skills/tree/main/skills/build-app
