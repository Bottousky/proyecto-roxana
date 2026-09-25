# Ohmdal · Continuidad y tiempo entre cuadros

## Diagnóstico

El cruce mantenía la posición y la cámara, pero eso no demostraba fluidez.
`scheduleNeighbours()` destruía el sector que quedaba atrás y construía el nuevo
vecino 80 ms después. Cada constructor seguía siendo una tarea síncrona, con
geometría, materiales y colisiones. Además, el primer uso gráfico podía cargar
buffers y compilar programas. Un temporizador desplazaba la pausa; no la eliminaba.

En el recorrido de referencia de 14 cruces se registraron 12 construcciones de
37–188 ms, 29 intervalos de cuadro superiores a 50 ms y un máximo de 1.317 ms.
Los desplazamientos de posición y cámara seguían dando cero.

## Decisión de diseño y motor

El Arco I es finito: ocho exteriores y un interior. Se preparan sus nueve
sectores al abrir el viaje y se conservan hasta liberar el mundo. Solo se dibuja
el sector actual y sus vecinos; conservarlos no significa dibujar todo el reino.

La preparación incluye `compileAsync` y un render fuera de pantalla que anticipa
el primer uso de buffers y materiales, incluso de piezas fuera del encuadre.
Se restablecen cámara, escena activa y render target al finalizar. La pantalla
inicial muestra progreso. Los cruces no construyen ni destruyen sectores.

Las rooms siguen siendo unidades de autoría, reglas y colisiones. Para el jugador
son tramos de una geografía continua. No se agregó un fundido ni una cinemática
para disimular las pausas: caminar debe conservar control y ritmo.

El costo es una preparación inicial más larga y mayor memoria residente: la
primera medición del nuevo camino de carga fue de 14,7 s y 441 geometrías GPU,
frente a unas 100–150 con el caché anterior. El conteo de geometrías no mide bytes.
Esto debe revisarse en dispositivos de menor memoria antes de ampliar el mundo.
Para arcos mucho mayores, conviene dividir la construcción en tareas pequeñas o
producir datos en workers, con precarga por distancia y un presupuesto de memoria;
simplemente volver a agregar un `setTimeout` no resolvería el problema.

## Medición

`scripts/qa-journey.html` registra intervalos reales de requestAnimationFrame,
máximo, p99, cantidad por encima de 50 ms y construcciones durante el recorrido.
Los datos no incluyen la preparación inicial. La prueba no modifica partidas.

| Recorrido | Máximo | p99 | Cuadros >50 ms | Construcciones |
| --- | ---: | ---: | ---: | ---: |
| Antes, 14 cruces | 1.317 ms | 17 ms | 29 | 12 |
| Después, primera pasada | 83 ms | 33 ms | 1 | 0 |
| Después, segunda pasada sin pruebas de Node simultáneas | 34 ms | 17 ms | 0 | 0 |

La primera pasada corregida coincidió parcialmente con pruebas de Node. Son
mediciones de este equipo y navegador, no una garantía de rendimiento universal.
La preparación y retención tienen pruebas de idempotencia, restauración de
cámara y recuperación tras un fallo de preparación GPU.
Los tres recorridos completaron los 14 cruces con posición y cámara continuas
y suelo seguro. Las 257 pruebas de Node y la compilación Vite pasaron.

## Fuentes técnicas

- [Three.js: WebGLRenderer, compileAsync e inicialización de recursos](https://threejs.org/docs/pages/WebGLRenderer.html).
- [web.dev: dividir tareas largas para liberar el hilo principal](https://web.dev/articles/optimize-long-tasks).

La decisión de mantener residente este arco es una aplicación al tamaño y al
recorrido de Ohmdal, no una recomendación universal atribuida a esas fuentes.

## Portada

`public/assets/cover-ohm-canonical.png` reemplaza al compañero humanoide por el
Ohm esférico actual. Se conserva la composición y la portada anterior como fuente.
Edición con la herramienta integrada ImageGen; prompt exacto y referencias en
`cover-ohm-prompt.json`.
