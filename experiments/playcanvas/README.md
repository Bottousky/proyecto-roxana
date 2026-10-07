# Ohmdal · La Luz — PlayCanvas

Arco I jugable en la rama **codex/playcanvas-slice**.

- Jugar: http://127.0.0.1:4190/
- Producción: https://bottousky.github.io/proyecto-roxana/ (la escuela 3D; el juego está en `ohmdal.html`)
- Versión anterior para comparar: http://127.0.0.1:4180/
- Iniciar localmente: abrir **Jugar PlayCanvas.cmd**, o ejecutar npm run dev.
- En un checkout nuevo: npm ci antes de iniciar.

## Instituto Roxana (landing)

`escuela.html` es la escuela-diorama que recibe al estudiante: una isla flotante con el
Instituto que se navega con clics (sin personaje). Tocar un edificio, su rótulo o el
directorio acerca la cámara, levanta el techo, baja las paredes hacia la cámara y abre
el panel de la sala:

- **Dirección:** registro del estudiante (nombre, emblema), bitácoras (exportar,
  importar, borrar) y preferencias. Vive en este navegador (`roxana.escuela.v1`).
- **Cuatro talleres, uno por Mundo Aplicado y del mismo tamaño alrededor del patio:**
  Electrónica (Ohmdal), Física (Physica), Programación (Bitland) y Matemática (Arithmos).
  Cada uno tiene su entrada, estandartes, medallón e interior propio. Solo Ohmdal es un
  portal (lleva al juego); a Bitland se entra con un casco de realidad virtual conectado a un
  microcontrolador con una ciudad sobre el chip; Physica es un mundo subatómico en una pecera
  con su consola de leyes; Arithmos, una inmersión en un pizarrón: "Ver la entrada" muestra la tiza trazando una puerta,
  al estudiante achicándose al cruzarla y el plano infinito de ecuaciones del otro lado.
- **Sala de Trofeos:** una grada de doce lugares por mundo, bajo su estandarte.
- **Anfiteatro:** las cinemáticas filmadas del juego se proyectan en la pantalla 3D
  (subtítulos incluidos) al vivirlas, agrupadas por mundo; explicaciones de YouTube y
  animaciones se declaran en `src/escuela/videos.js`.

La escuela lee la partida de Ohmdal sin modificarla. Cada restauración cambia algo del
diorama (farol a los pies de Roxana y ventana del Taller, portón, fuente, faroles, canteros, estandartes, campana,
linterna de la torre, visitantes); el reloj de la torre sigue detenido para Bitland. Al volver, una secuencia con letterbox recorre lo
nuevo. Hora del día (mañana, tarde, noche), sonido procedural opcional y vista previa de
cualquier etapa sin tocar partidas: `escuela.html?etapa=0..10&hora=manana|tarde|noche`.

- `src/escuela/school.js`: arquitectura por código (receta aprobada: facetas, UV de mundo,
  color de vértice como multiplicador). `kit.js` fusiona piezas por parte y material.
- `public/escuela/modelos/roxana-estatua.glb`: la estatua del patio (Meshy, solo geometría);
  `src/escuela/statue.js` le da normales, UV de mundo, mármol y oclusión en los pliegues.
- `src/escuela/diorama.js`: render, cámara, recorte de salas, etapas, partículas, IBL.
- `src/escuela/progress.js`: etapa, trofeos y cinemáticas desde el guardado (con pruebas).
- `node scripts/film-cinematics.mjs` vuelve a filmar las escenas en `public/escuela/cine/`.
- `node scripts/escuela-review.mjs vista,taller,... <etapa> <hora>` captura revisiones;
  `escuela-news.mjs` y `escuela-welcome.mjs` recorren novedades, bienvenida y Portal.

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

### El reino recupera su luz

- **Lugares olvidados.** Un lugar cuya instalación no se restauró se ve con
  menos color y un tinte frío. Al ponerla en servicio el color vuelve, con una
  onda de luz, chispas y un pulso de bloom sobre el tablero.
- **El tendido.** Postes y cobre acompañan cada camino entre lugares. Un tramo
  se enciende, con pulsos que corren por el cable, cuando los dos lugares que
  une están restaurados (`src/grid.js`).
- **Escenas que viajan.** La bomba del Manantial baja hasta la fuente de la
  Plaza; al encender la lente, el haz del Faro cruza el Lago y sube a las
  Terrazas antes de que responda la campana.
- **Final.** Tras el Faro, «A la mañana siguiente» lleva a la primera clase. El
  jugador elige qué le deja a Tala y el cierre del arco lo recuerda.
- **Luz y clima.** Agua con reflejo, espuma y mar abierto (`src/water.js`);
  caminos pintados sobre el pasto y sombras de nubes (`src/ground.js`); viento en
  árboles y cultivos (`src/wind.js`); vórtice del Portal (`src/portal.js`);
  tilt-shift, bloom y gradación por momento del día; luciérnagas al anochecer.

### Comprobar, no sólo ajustar

- Ivara pone en servicio el distribuidor después de ver la enfermería encendida
  con la cocina aislada. Nereo pide medir la toma de la lente sin carga y con
  carga. Lo registrado describe las lecturas reales.
- «Volver» deja el montaje armado; ponerlo en servicio es una decisión. Una
  instalación en servicio admite práctica con una copia.
- Cierres y Bitácora sólo afirman lo que la traza del banco muestra que el
  jugador hizo; la evidencia conserva todas las mediciones.

La [iteración de territorio e instalaciones](DIRECCION-VISUAL.md) amplía los
desplazamientos este/oeste, agrega dos senderos secundarios y vincula el brillo
y movimiento de los receptores con su circuito. Para compararlos sin tocar
partidas, abrir `http://127.0.0.1:4190/scripts/qa-direction.html`.

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

GitHub Pages publica los archivos compilados desde la rama `gh-pages`. Desde el 2026-10-07
la raíz del sitio es la escuela 3D (Instituto Roxana) y el juego vive en `ohmdal.html`:

- `index.html`: campus 3D · `escuela-clasica.html`: versión sin 3D · `escuela.html`: redirige a la raíz.
- `ohmdal.html`: el juego. **No publicar el `index.html` del juego en la raíz**: pisaría la escuela.

Publicar el juego: `node node_modules/vite/bin/vite.js build --base=/proyecto-roxana/ --outDir dist-pages`,
copiar `dist-pages` sobre `gh-pages` **renombrando su `index.html` a `ohmdal.html`**.
Publicar la escuela: `node scripts/pages-home.mjs dist-pages-home` y copiar esa carpeta sobre `gh-pages`
(ya trae `index.html`, la versión clásica y la redirección; sus enlaces al juego apuntan a `ohmdal.html`).
En los dos casos, con `.nojekyll`. La partida se guarda por origen, así que mover páginas no la pierde.
La rama `main` conserva el reinicio del canon. Los assets y el mapa admiten la subruta del repositorio.

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
