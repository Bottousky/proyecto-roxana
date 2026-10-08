# ARITHMOS · Plan de migración del laboratorio al juego

Estado: **en curso**. La condición de inicio se cumplió el 2026-10-08 (R16 aprobó la slice: N3 en todo, N4 en Timing/Actuación/Matemática; benchmark `c26/vs15b`).

| Paso | Estado | Evidencia |
|---|---|---|
| 1. Cámara (`Camera.go` → van Wijk–Nuij + mínimo jerk, `dur` como tope) | **hecho detrás de `?anim=2`** | `tests/camera.test.mjs` (5 pruebas), `c27/cam2-*.json` (A/B en c1.ronda, c1.vuelven, c1.marea), bot del capítulo 1 con y sin bandera (`c27/bot-c1-{A,B}.out`) |
| 2. `Drawing` + `d.draw` → depósito con plan de mano | **hecho detrás de `?anim=2`**, con rasgueo que suena sólo mientras la tiza toca (nivel por velocidad de la punta, golpe al empezar cada trazo; `tests/drawing-anim2.test.mjs`) | `c28/puerta-{A,B}` (hojas), `c28/puerta-door-AB2.png` (recorte dpr 2), bot del capítulo 1 sin errores (`c28/bot-c1-B.out`); corrida en tiempo real en curso |
| 3. `Label` → glifos | — | — |
| 4. Punto (`Dot`, `zip`/`hop`) | — | — |
| 5. Figura → actor incremental | — | — |

## Escala (conteo en `experiments/arithmos/src`, 2026-10-07)
| API del motor | Usos | Qué la reemplaza | Estrategia |
|---|---|---|---|
| `d.draw(obj, sec)` | 165 | plan de mano (`motion.js`) | **adaptador**: `d.draw` pasa a avanzar el tiempo local del trazo; `sec` deja de ser la duración y pasa a ser un tope (si el plan dura más, se acelera el crucero para respetarlo; si dura menos, se respeta el plan). Cero cambios en escenas. |
| `new Drawing(id, strokes)` | 162 | `deposit.js` + caché (`drawDepositCached`) | **adaptador**: `stroke()` del motor sigue armando guías; `Drawing` construye trazos de depósito desde esas guías en el constructor. Trazos terminados → bitmap (como hoy). Medir costo total en el capítulo piloto. |
| `new Label(id, text)` | 306 | glifos de un trazo (E03 + alfabeto E13b/c) | todos los signos de los `Label` literales tienen glifo; `Label.reveal` pasa a escritura con plan de mano. La capa de lectura limpia (accesibilidad) sigue usando la fuente. |
| `zip` / `hop` (Punto) | 174 | `blob.js` (segundo orden, área constante) | **adaptador**: misma firma; internamente objetivo + `SecondOrder` y salto con agachada/vuelo/aterrizaje. `Dot` cambia su render por `fillPressure` con gradiente. |
| `fig.setPose(name)` | 119 | `actor.js` + `poses.js` | **adaptador**: `setPose` cambia el objetivo de los canales; el `Figure` del motor delega `skeleton()` en un actor incremental (los canales de segundo orden se integran con dt, no hace falta buscar en el tiempo dentro del juego). Las 23 poses viejas siguen existiendo; las nuevas se agregan con su `face`. |
| `d.walk(fig, x)` | (en escenas) | pisadas planificadas | dentro del adaptador del actor. |
| `Figure.render` | (todas las figuras) | `actor.drawFigureDeposit` (E15) | el trazo de la figura pasa a depósito para que la textura coincida con lo escrito; mismo hervor de 8 cuadros/s. |
| `d.shot(rect, sec)` | 241 | `camera2.js` | **adaptador**: `Camera.go` usa `zoomPath`; `sec` pasa a tope (la duración sale del costo perceptual). Revisar las escenas donde la cámara se mueve mientras se escribe (regla "llegar antes"). |
| `fadeTo` de tiza / `Smear` | (borrados) | `eraser.js` | caso por caso: los borrados de la Marea y de escenas quedan como están en la primera migración; el borrador visible entra en el capítulo piloto. |
| `audio.chalkStart(sec)` | (en `d.draw`) | partitura desde el plan | el adaptador de `d.draw` dispara el rasgueo con la envolvente de velocidad del trazo (en vivo, no fuera de línea). |

## Orden
1. Adaptadores detrás de una bandera (`?anim=2`), sin borrar el camino viejo.
2. Capítulo piloto: **el 1** (es el que introduce a Punto y la Ronda, igual que la slice). Corrida del bot completa con la bandera, capturas A/B de las mismas escenas, revisión independiente.
3. Si el piloto pasa: activar por defecto capítulo por capítulo, con corrida del bot por capítulo.

## Riesgos
- **Rendimiento en teléfono**: depósito = ~10× llamadas de dibujo mientras se dibuja; mitigado con caché (E12), sin medir en dispositivo [H].
- **Palabras**: resuelto en el laboratorio (E13b/c); falta revisión independiente de la hoja del alfabeto.
- **Tiempos de escena**: si los trazos duran distinto, cambian los tiempos de las escenas que esperan a `d.draw`; el bot de partida completa lo detecta (timeouts) — usar `sec` como tope evita la mayoría.

## Mapa del motor (lectura, 2026-10-08; rutas bajo `experiments/arithmos/src`)
- **Reloj**: un solo bucle (`main.js:85-117`): `dt = min(0.05, …)`, 0 en pausa → `director.update(dt)`, `camera.update(dt)`, `world.update(dt)`, `render()`. Escenas = `async play(d, g)` con `await` sobre primitivas que son promesas resueltas por timers de `dt` acumulado. Abortar por `epoch` (`director.js:34-45`); **saltar** (`director.js:47-61`) completa timers, cámara, `arriveNow`/`finishPose` y audio. Todo adaptador debe respetar `d.skipping` y `epoch`.
- **`d.draw(obj, sec, {sound, key})`** (`director.js:119-128`): tween 0..1 sobre `obj[key]` + `audio.chalkStart(sec)`. Adaptador: con `?anim=2`, si `obj` es un `Drawing` de depósito, `obj[key]` pasa a ser **tiempo local del plan normalizado** y el tween usa `min(sec, plan.T)` (el tope del plan); el rasgueo se reemplaza por la envolvente de velocidad del plan.
- **`Drawing`** (`world.js:74-124`): `drawStrokes` con `progress`; caché sólo con `progress ≥ 1` y en `lighten`. `stroke()` (`chalk.js:22-65`) devuelve guía + presión: el adaptador construye `depositStroke` desde `pts` (x, y) y conserva `w`, `ch`, `seed`.
- **`Label`** (`world.js:167-204`): `reveal` es una propiedad 0..1 (no hay método) que `chalkText` usa como barrido (`chalk.js:305-340`); se anima con `d.draw(label, s, {key: 'reveal'})` o tweens. Adaptador: `Label` con glifos de un trazo cuyo `reveal` mapea al tiempo del plan; `renderClean` (accesibilidad) sin cambios.
- **Punto**: `Dot` (`world.js:213-327`), modos wander/anchor/bob; `zip`/`hop` globales en `acting.js:5-19`, **y copias locales en `ch1/scenes.js:16-35`** (el capítulo 1 no importa las de `acting.js`; difieren en el final del salto). El adaptador debe cubrir ambas o unificar primero las de ch1 (cambio de escena, revisable aparte).
- **Figura**: `figure.js` — `setPose(name, dur)` (`:83-92`), `walkTo` (`:109-115`), `update(dt)` (`:133-168`), `skeleton()` (`:171-221`), `render(ctx, view, boil)` (`:246-271`), 23 `POSES` + 6 de `ch1/common.js:255-263`. `actor.js` del laboratorio es buscable en el tiempo (simula todo el guion): el adaptador necesita una **variante incremental** (canales `SecondOrder` integrados con `dt`, plantas de pie decididas en línea).
- **Cámara**: `d.shot(rect, sec)` (`director.js:105-110`, respeta `reducedMotion` y saltar) → `Camera.go` (`camera.js:21-61`, interpolación log de w/h). Adaptador directo a `zoomPath` con `sec` como tope.
- **URL**: hoy sólo `?seg=` (`main.js:401-408`); `?anim=2` se lee ahí.
- **Capítulo 1** (`ch1/scenes.js`, `ch1/common.js`, por grep): `d.draw` 17, `d.walk` 13, `d.shot` 36, `setPose` 48, `zip` ~55, `hop` 15, `new Drawing` 17, `new Label` 6, `chalkStart` directo 1.

### Orden propuesto de adaptadores (de menor a mayor riesgo)
1. Cámara (`Camera.go` → `zoomPath`): aislado, sin estado compartido.
2. `Drawing` + `d.draw` → depósito con plan de mano (+ caché, + envolvente de sonido).
3. `Label` → glifos.
4. Punto (`Dot`, `zip`/`hop`) → `SecondOrder` + salto con agachada.
5. Figura → actor incremental + `drawFigureDeposit` (el más grande: requiere reescribir `actor.js` como integrador en línea).
Cada paso: captura A/B de las mismas escenas del capítulo 1 con y sin bandera, corrida del bot completa con la bandera, y revisión.
