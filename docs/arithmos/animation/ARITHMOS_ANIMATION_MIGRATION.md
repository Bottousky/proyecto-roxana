# ARITHMOS · Plan de migración del laboratorio al juego

Estado: **diseño**, nada migrado. Condición de inicio: la vertical slice aprobada por una revisión independiente (N3 en todo, N4 en Timing/Actuación/Matemática). Sin eso, no se toca `src/`.

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
