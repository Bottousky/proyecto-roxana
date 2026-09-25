# Ohmdal · La Luz — entrega local

El arco se puede jugar desde Portal Ω hasta la restauración del Faro, con
exploración posterior. `Jugar Ohmdal.cmd` abre la compilación local en el navegador;
`scripts/play.ps1` inicia el servidor en 127.0.0.1:4180. El arte, las tipografías,
la música sintetizada y las dependencias compiladas se sirven desde este proyecto.

## Contenido integrado

- Nueve lugares con composición, personajes, maquinaria y efectos propios.
- Nueve paneles manipulables, nueve sistemas espaciales, medición junto a
  instalaciones, conductores y consecuencias persistentes.
- Simulación resistiva de corriente continua compartida: tensión, corriente,
  resistencia equivalente, continuidad, polaridad, sobrecarga y divisor cargado.
- Edda, Ohm, Lumen y el reparto local; conversaciones que cambian tras el final,
  comentarios del compañero, nueve secretos y once entradas de Bitácora.
- Tres etapas del Faro: alimentación, servicios y óptica. Propagación de energía,
  maquinaria, linterna, haz, cambio musical, reacciones y epílogo.
- Guardado automático, diálogo y experimentos reanudables, exportación e
  importación, mapa, controles de teclado/puntero/táctiles y opciones gráficas.

## Taller principal y encuentro con los muros · 9 de septiembre de 2026

El taller de Lumen es ahora la casa más ancha, profunda y alta de la Plaza:
cuerpo de 9.2 × 6.4, dos plantas, ventanales de seis paños, entrada enmarcada,
porche amplio y emblema de lámpara. Tiene explanada propia y conserva su
orientación hacia el sur. El mapa, la entrada y el retorno utilizan la nueva
posición. Las cajas y el farol dejan libre el frente. La Plaza mide 40 × 32
para separar visualmente su muro oeste del edificio ampliado.

Los muros se recortan contra la arquitectura completa: cimientos, apoyos,
porches y toldos. Sus tapas conservan una junta de 6 cm y los colliders
coinciden con los tramos visibles. La regresión incluye el taller anterior,
un porche atravesado por un muro y los edificios actuales de las nueve zonas.

`npm test`: **180 pruebas aprobadas**. `npm run build`: compilación correcta.
La auditoría de integración comprueba puerta visible, interacción, retorno
sin recolocación, paso para jugador y Ohm, pavimento y proporciones del mapa.
Se comprobó visualmente la separación del muro, el porche y los ventanales,
y se entró y salió por la puerta en el juego real mediante una partida aislada
de desarrollo. Regreso a la explanada correcto y sin errores de consola.

## Composición final de las nueve zonas · 9 de septiembre de 2026

Las diez casas conservadas comparten posición, dimensiones y opciones entre
escenario y mapa. La Panadería tiene su fachada propia junto a la calle norte;
el Taller conserva la mayor escala de la Plaza. Se corrigieron aleros, follaje,
oficios de las fachadas, canal, acueducto, rueda e integración de las torres.
El registro visual y las reproducciones están en [Revisión de composición](composition-review.md).

Validación actual: **191/191 pruebas**, compilación correcta y ningún fallo en
el auditor de composición. La entrada y el regreso del Taller se probaron en
la interfaz real con una partida aislada, y el mapa refleja la Plaza revisada.

## Primera pasada del mundo y sus mapas · 9 de septiembre de 2026

Las nueve zonas tienen caminos y patios propios que enlazan mecanismos,
puntos de observación y las once puertas de las casas, incluidas las no
interactivas. La calle de Plaza llega al porche de Lumen; las filas de Terrazas
dejan accesos a ambas casas y corredores entre bancales. Los bordes jugables
son muros visibles con aperturas en los pasos reales. El pavimento termina
dentro de esos límites y respeta edificios, agua y objetos sólidos.
La revisión visual corrigió además la altura del pavimento en Lago y Faro:
ahora queda por encima del remate de tierra que ocultaba los caminos.

El mapa local utiliza las mismas coordenadas, caminos, huellas y orilla que
el escenario; incluye posición del jugador, accesos y muelle. El mapa del reino
se deriva de las conexiones reales entre zonas y distingue pasos abiertos o
pendientes. Los secretos sin descubrir y las torres distantes no aparecen como
destinos accesibles. Las tuberías de las ventanas del Faro quedaron ancladas
a cada torre, eliminando la pieza aislada que aparecía junto a la fuente de Plaza.

Las pruebas del mundo real comprueban los accesos desde llegadas y retornos,
las once puertas, el pavimento dentro de límites y las huellas de edificios y
bancales. Las pruebas del mapa comprueban conexiones, orilla, muelle y contenido
descubierto; las de hitos verifican el anclaje de las tuberías del Faro.
Contrato, organización de cada zona y ajustes en
[Trazado de Ohmdal](world-layout.md).

Validación final: `npm test` completó **176 pruebas, todas aprobadas** y
`npm run build` terminó correctamente. Se revisaron visualmente las nueve zonas
en `scripts/qa-collisions.html`, además del mapa en la interfaz real mediante
`scripts/qa-map.html`: escritorio, marco móvil de 390 px, ampliación del plano,
viaje al taller y retorno por su puerta al nuevo empedrado. No se observaron
errores de consola. Son escenarios preparados en desarrollo, separados de la
partida de 4180; no se repitió el arco completo en esta pasada.
La compilación `index-Cwtf895d.js` se verificó en 4180, reanudando la partida
existente en Plaza con el mismo objetivo hacia la Calzada. El mapa mostró sólo
los cuatro lugares visitados de esa partida y se cerró dejando la exploración
lista para continuar; no se observaron errores de consola.

## Cinemáticas del Arco I · 9 de septiembre de 2026

- Seis escenas dentro del mundo, tras dejar en servicio Ohm, el taller, la bomba,
  el riego, la corona y la linterna del Faro. Duraciones de 5,2–5,8 segundos;
  el Faro dura 12. Todas incluyen retorno a la cámara recta y conversación posterior.
  Planos y comportamiento documentados en [cinematics.md](cinematics.md).
- Botón de salto y teclado, controles de exploración suspendidos, movimiento
  reducido sin recorrido de cámara y reloj detenido en pestañas ocultas.
- Guardado de escena pendiente y continuación narrativa: recargar no pierde
  el mecanismo reparado, el diálogo final ni la tarjeta del cierre. Los guardados
  anteriores conservan su progreso sin repetir escenas por banderas ya cumplidas.
- Corona, freno óptico y haz tienen estados visuales independientes. Dos líneas
  se ajustaron para coincidir con el mecanismo y el brillo anterior a calibrarlo.
- `npm test`: **102 pruebas aprobadas**. Incluyen las seis secuencias, regreso,
  salto, movimiento bloqueado, fases del Faro, guardados, compatibilidad y la
  carrera de importación mientras el audio todavía se está habilitando y la
  orientación frontal de Ohm al despertar sin desplazarlo.
- `npm run build` completado; permanece el aviso de tamaño del módulo Three.js.
- Revisión mediante CUA en el juego real dentro de `scripts/qa-cinematics.html`:
  encuadres de Ohm, taller, bomba, bancales y corona; óptica, torre completa,
  haz y botón de salto en un marco de 390 píxeles; salto con Escape y con botón,
  movimiento reducido sin recorrido, recarga durante el despertar,
  reanudación de la conversación del Faro desde la misma línea y recuperación
  de la tarjeta final. Escape devuelve el control y cierra su estado pendiente.
  También se resolvió el banco de Ohm por sus bornes y se lo dejó funcionando:
  la escena se disparó al cerrar y mostró el ojo aun llegando por un costado.
  Son escenarios preparados de desarrollo; no se repitió el recorrido del arco.
- La compilación final se abrió en 127.0.0.1:4180 y reanudó la partida existente
  en Plaza de Ohm, junto a las marcas de la campana, con el mismo objetivo hacia
  la Calzada y sin errores de consola observados. No repitió las escenas del
  Portal ni del taller ya completados.

## Revisión de dirección y reposo · 9 de septiembre de 2026

- Nueve atlas humanos individuales, con frente, derecha, espalda e izquierda.
  Cada dirección tiene una pose de reposo propia y cuatro cuadros de caminata.
  El motor conserva escala y apoyo entre cuadros y selecciona la dirección
  según el desplazamiento real, incluido el recorrido por clic y el deslizamiento
  junto a paredes. Al detenerse conserva la orientación y usa el cuadro de reposo.
- Marín y Tala alternan trayectos cortos a 1,4 unidades/s con pausas de reposo,
  dentro de su radio habitual y comprobando obstáculos. Pausar o inspeccionar
  conserva su recorrido sin saltos al reanudar. Ohm conserva su arte y animación.
- `npm test`: **75 pruebas aprobadas**, incluidas dirección, reposo, colisiones,
  rutas, pausas, movimiento reducido, paseos y carga de los 15 PNG críticos.
  `npm run build` completado; permanece el aviso de tamaño del módulo Three.js.
- Revisión con CUA del motor real mediante `scripts/qa-actors.html`: perfiles,
  reposo orientado, espalda de Lumen al pausar y dirección al caminar por clic.
  El visor no lee ni escribe partidas y no se incluye en la compilación.
- La versión compilada se recargó en 127.0.0.1:4180: viajero y Lumen en reposo,
  taller encendido y objetivo «El otro lado de la puerta» conservados; sin errores
  de consola observados. No se repitió el recorrido completo de los nueve lugares.
- Los PNG y prompts completos están registrados en [assets.md](assets.md).

## Revisión de aprendizaje y personajes · 9 de septiembre de 2026

- Ohm usa un atlas original de cuatro direcciones y un retrato nuevo; cuerpo
  ovoide, ojo incrustado y apoyos anchos. La figura imprimible queda para una fase
  posterior, documentada en `ohm-design.md`.
- Los bancos empiezan por una acción y una respuesta física. Los instrumentos
  aparecen por etapas y las cifras se solicitan aparte. La Bitácora reserva la
  explicación formal para «Entender un poco más», accesible también con teclado.
- Edda formula hipótesis; Lumen conserva oficio y rituales; Ohm registra sin
  resolver por el jugador. Objetivos, escenas obligatorias y reparto posterior
  mantienen sus IDs y estados guardados.
- Cámara alineada con el mapa, pedestal sólido, alturas de los escalones del
  Portal y seguimiento transitable de Ohm. Un guardado dentro del pedestal se
  recoloca en un punto cercano sin perder progreso.
- `npm test`: **62 pruebas aprobadas**. Incluyen contenido, electrónica,
  observaciones cualitativas, ocho imágenes críticas, guardados y navegación.
- `npm run build` completado. La compilación se abrió en 127.0.0.1:4180 y
  reanudó la partida existente en la conversación del taller con el nuevo
  diálogo, retrato y compañero; el avance de la lámpara quedó conservado.
- Revisión visual mediante CUA en un origen local independiente: despertar de
  Ohm en una partida nueva, retratos y movimiento, taller resuelto sin abrir
  cifras, banco de Calzada y Faro III en un marco móvil de 390 píxeles,
  lectura fija del instrumento y explicación opcional por Tab/Enter.
  El banco tiene fondo opaco para evitar que el mundo compita con las piezas.
- `scripts/qa-novice.html` es un visor aislado servido sólo por Vite para revisar
  bancos; no lee ni escribe partidas y no se incluye en la compilación.

## Comprobación de la entrega anterior

Las pruebas se ejecutaron en Windows y Chrome instalado con WebGL2. La compilación
de producción también se abrió desde el servidor que utiliza el lanzador.

| Comprobación | Resultado y alcance |
| --- | --- |
| Pruebas automáticas de lógica | 52 aprobadas: circuitos, rangos de operación, protección, medición espacial, contenido, navegación, guardados y recuperación de arte ausente. |
| Recorrido completo por entradas reales | Nueve zonas, nueve paneles puestos en servicio y nueve secretos; final, epílogo, Bitácora completa y recarga del navegador. Sin asignar progreso ni teletransportar. |
| Experimentación y regreso | Medición Q/E en vivo; panel final reabierto y medido, controles asegurados y final sin repetirse. |
| Interfaz | 1280×720 y 390×844; Enter/Tab/Escape, foco, pausa, lectura, mapa, persistencia de opciones y diálogo; exportación e importación reales y recuperación ante archivo inválido. |
| Paneles | Medición, cables, reguladores y puesta en servicio a ambos tamaños; se conserva el desplazamiento. Alternativa táctil con controles de 44 px. |
| Audio | Señal ambiental y final finitas, silencio efectivo al silenciar y liberación de voces al cerrar. |
| Versión compilada | Inicio, conversación, exploración, pausa, Bitácora y recarga; recursos locales; sin superficie de inspección de desarrollo. |

El informe detallado del recorrido está en
`output/playwright/playthrough-report.json`, con capturas `playthrough-*.png`.
La duración del recorrido automatizado usa lectura instantánea y soluciones
conocidas; no representa la duración de una primera partida.

## Iteraciones de calidad

Las pasadas visuales reemplazaron materiales y personajes provisionales por siete
atlases originales, corrigieron la salida de color, añadieron relieve e iluminación
local, vegetación y maquinaria diferenciada. El Faro recibió galerías de servicio,
una revelación de torre completa y un haz con bordes suaves. Se redujeron niebla y
grano en interiores y se apartaron banderas que ocultaban personajes.

Las partidas detectaron navegación que necesitaba rodear obstáculos, conversaciones
que debían esperar su turno y una cámara de final que demoraba en liberar el
control. Esos casos se corrigieron y se volvieron a jugar. La fuente seca depende
de la bomba; agua, rueda y acople del generador conservan estados distintos.

La última revisión añadió nombres accesibles a los diálogos de interfaz y un
anuncio completo por línea narrativa, independiente del efecto de escritura.
Los controles nativos conservan Enter, Tab y Escape, y el foco vuelve al juego.

Una revisión posterior en la pestaña real detectó el servidor local apagado: el
código en caché seguía funcionando con sprites de respaldo y retratos vacíos.
El inicio ahora comprueba los seis atlases necesarios, incluidos ambos de
retratos, muestra un mensaje si falta alguno y permite reintentar. Los recursos
ya cargados se conservan. Se verificó el fallo y la recuperación en el navegador
integrado mediante `scripts/qa-asset-server.mjs`, sin alterar la partida del usuario.

## Rendimiento observado

A 1440×900, escala de píxel 1 y GeForce GTX 1660 Ti, Plaza y Faro sostuvieron
aproximadamente 60 cuadros/s en Alto y Ligero, quieto y caminando. El percentil 95
del tiempo de cuadro fue 16,9 ms; se observó una pausa aislada de 116,5 ms.
Diez viajes por mapa terminaron con geometrías, materiales y programas estables;
el heap después de recolección pasó de 19,05 a 19,40 MB. Son medidas de este equipo,
no una garantía para cualquier dispositivo.

Esta auditoría usó una partida preparada e importada para comparar escenas; está
separada del recorrido completo que se jugó mediante entradas reales. Sus datos
están en `output/playwright/performance-report.json`.

## Repetir comprobaciones

```sh
npm test
npm run build
npm start
node tests/production-smoke.mjs
```

Con `npm run dev` abierto en otro terminal:

```sh
npm run test:journey
npm run test:ui
npm run test:workbenches
```

Los scripts de navegador utilizan Chrome de Windows y contextos independientes,
sin modificar la partida del navegador habitual. El visor temporal de escenarios
se eliminó de las fuentes y la API de inspección sólo existe durante desarrollo.

Las referencias del encargo no se incorporan como assets. Las especificaciones y
procedencia del arte están en [assets.md](assets.md); las licencias de tipografías
y Three.js están incluidas en `public/licenses/`.
