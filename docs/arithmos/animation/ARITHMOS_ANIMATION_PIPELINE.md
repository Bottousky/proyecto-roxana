# ARITHMOS · Pipeline de animación para Claude Code

## Principio
Claude no puede "mirar" una animación en tiempo real: ve **imágenes fijas** (reducidas a ~1568 px de lado) y **números**. Por eso el pipeline convierte el movimiento en cosas que Claude sí puede inspeccionar con precisión:

1. **Tiempo buscable**: toda escena del lab es una función del tiempo; `__lab.seek(t)` dibuja exactamente el cuadro t. Dos versiones se comparan en el mismo instante.
2. **Sondas**: cada prueba expone `probe(t)` con el estado numérico (punta, velocidad, pose, cámara). El movimiento se juzga en gráficos de curvas (`animlab-plot.mjs`), no a ojo.
3. **Recortes de detalle**: la textura se juzga en recortes de ~400×80 px capturados a dpr 3 (una captura completa no muestra un trazo de 5 px).
4. **Hojas de contactos**: la continuidad y la composición se juzgan en 9–12 cuadros equiespaciados en una sola imagen.
5. **Métricas sobre la presión**: se mide el lienzo de presión (antes del compuesto), no los píxeles finales: pico, ancho, carga y autocorrelación por columna.

## Ciclo (un experimento)
```
hipótesis (escrita en EXPERIMENTS, observable)
 → implementación en animlab/ (no en src/ hasta ganar)
 → captura: node scripts/animlab-capture.mjs <test> artifacts/arithmos/animlab/cNN/<nombre> [--frames] [--crop] [--q=params]
 → gráficos: node scripts/animlab-plot.mjs <probes.json> <png> <series>
 → inspección: final.png (composición), sheet.png (continuidad), crop-*.png (textura), speed.png (timing)
 → comparación contra la carpeta anterior (misma prueba, mismo t) y contra el QUALITY_BAR
 → decisión: mejor → documentar por qué (con números); peor → revertir
 → EXPERIMENTS + STATE + commit
```
Cada corrida se guarda en **una carpeta nueva** (`cNN/<prueba><letra>`): nunca se sobrescribe la evidencia anterior.

## Roles
- **Generador** (sesión principal, Opus): diseña, implementa, captura, mide.
- **Revisor independiente** (subagente con contexto fresco, a lo sumo uno a la vez): recibe sólo el QUALITY_BAR, las imágenes y las sondas, y puntúa por dimensión con justificación. No ve el código ni la intención del autor (evita la autoaprobación; ver *harness design*, Anthropic). Se usa al cerrar un test y antes de dar un nivel ≥ 4.
- **Obreros** (Haiku): ediciones mecánicas planificadas, resúmenes de salidas largas.
- Humano: audio, dispositivo real, comprensión de jugadores (nivel 5 / [H]).

## Migración al juego
Una técnica pasa de `animlab/` a `src/engine/` sólo si:
1. ganó en su test con evidencia (EXPERIMENTS);
2. tiene una prueba equivalente con el motor actual en la misma captura (comparación A/B);
3. se puede adoptar escena por escena (API compatible o adaptador), sin reescribir capítulos de golpe.

## Herramientas
| Herramienta | Uso |
|---|---|
| `experiments/arithmos/animlab/` | Laboratorio: `index.html?test=NN&t=…` o `&play=1` |
| `scripts/animlab-capture.mjs` | Cuadros, hoja, recortes, sondas a 60 Hz, métricas, video opcional (`--video`, sólo para humanos) |
| `scripts/animlab-plot.mjs` | Curvas de sondas (velocidad, posición, ángulos) — alturas siempre como altura sobre el suelo (R1: un revisor leyó un salto como caída) |
| `scripts/animlab-stack.mjs` | Apila recortes (antes/después, instantes) en una imagen |
| `scripts/animlab-diff.mjs` | Diferencia de píxeles entre dos PNG: sólo para regresiones no buscadas (p. ej. caché) |
| `scripts/animlab-interact.mjs` | Prueba con clics reales de la escena interactiva |
| `scripts/game-shot.mjs <escena> <s> <salida.png> [--q=anim=2] [--crop=x,y,w,h] [--dpr=2] [--advance]` | Captura del juego real en un instante (A/B de la migración, recortes dpr alto) |
| `scripts/playthrough.mjs … --q=anim=2` / `scripts/film-seg.mjs … --q=anim=2` | Bot y filmación con la bandera de animación nueva |
| `scripts/cam-ab.mjs <salida.json> <escena> [s] [--q=anim=2]` | A/B de la cámara en escenas reales del juego: viajes, rapidez pico en anchos de plano/s, cambio de rapidez entre cuadros (tiempo del juego) |
| `scripts/animlab-evidence-t10.sh <cNN> <VSn>` | Evidencia completa de la slice para una revisión, en una carpeta nueva: corrida principal (sondas 240 Hz, audio), textura dpr 3, gráficos de tiza/comprensión/pies, teléfono, salteado, tira de la unión al 7, interacción real, `medidas.txt` y `timeline.md` ordenada (los tiempos de las tiras salen de los eventos de esa corrida) |
| `--audio` en la captura | Partitura → `score.wav` + `rms.json` (sincronía medible; calidad [H]) |
| Chrome del sistema vía Playwright 1.63 | Render real con GPU (`--use-angle=metal`) |

## Lecciones de las revisiones (R1–R3)
- Darle al revisor **sólo la versión vigente** y una **tabla de tiempos**: sin ella no puede juzgar Timing en imágenes fijas.
- Tiras densas (cada 0.04–0.12 s) para anticipaciones; recortes dpr 3 para textura; captura 844×390 para legibilidad.
- El revisor encuentra problemas de composición que el autor no ve (escritura tapando la cabeza, hilos que cruzan la cara): cada versión candidata pasa por uno.

## Lo que NO hace este pipeline
- No certifica audio (nadie lo escuchó).
- No sustituye una prueba con personas ni con un teléfono real.
- Pixel-similarity sólo detecta cambios no buscados: nunca se usa para decir "mejoró". Y sólo entre capturas con **las mismas opciones** (la caché de mapas de bits se arma a la escala de cámara del primer cuadro en que se dibuja cada trazo: otra cantidad de cuadros da otro remuestreo).
