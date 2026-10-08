# ARITHMOS · Matriz de técnicas

Escala 1–5. **Cada valor cita su evidencia**; sin evidencia propia, la celda dice "—" y la técnica queda como hipótesis.
Evidencia: `E01` = `artifacts/arithmos/animlab/c01/t01*` (ver `ARITHMOS_ANIMATION_EXPERIMENTS.md`).

## Render del trazo

| Técnica | Precisión | Calidad visual | Control temporal | Control espacial | Escalab. | Rendim. | Edición por Claude | Iteración | Compat. | Complejidad | Riesgo | Uso recomendado | Ejemplo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A. Motor actual** (segmentos de presión, `lighten`, + compuesto de diente) | 4 — sigue la guía ±0.55 px de ruido | 3 — textura de tiza creíble pero "a cuentas": autocorr. 2 px = 0.85, huecos regulares en recorte dpr 3 (E01 crop-0) | 2 — sólo progreso por longitud; el tiempo lo pone `d.draw` lineal | 4 — guías arbitrarias | 4 — cacheable por bbox | 4 — barato | 5 — API simple | 4 | 5 — ya integrado | 2 | bajo | Trazos de fondo, decorados, lo que no se ve dibujar | `src/engine/chalk.js` |
| **B. Depósito por estampas** (aditivo) + compuesto de diente | 4 — idem; temblor en el tiempo sub-px | 4 — núcleo lleno con bordes ásperos, acumula en cruces, ancho según dirección de la punta; ancho más parejo que A (CV ancho 0.097 vs 0.168, E01e) | 5 — cada estampa tiene su instante: se puede dibujar hasta cualquier t con el plan de la mano | 4 | 3 — ~10× más llamadas de dibujo que A mientras se dibuja; terminado se cachea igual | 3 — medir en E02 con escenas cargadas | 4 | 4 | 4 — usa el mismo compuesto | 3 | medio (rendimiento en teléfono) | Todo lo que el jugador **ve dibujarse**: escritura, gráficos, construcción | `animlab/core/deposit.js` |
| **C. SVG dash + filtro** | 4 | 2 — grano uniforme de "arena", sin presión ni extremos; el grano no pertenece al pizarrón (E01 crop-2) | 3 — dashoffset por CSS/JS; perfil de ease, no de mano | 4 | 4 | 4 | 5 | 5 | 3 — capa aparte, no se mezcla con el diente ni con el polvo | 1 | bajo | Prototipos rápidos de layout; **no** para el producto | `animlab/tests/t01-line.js` fila C |
| D. Contorno de ancho variable (perfect-freehand) | — | — | — | — | — | — | — | — | — | — | — | hipótesis: tinta, no tiza | — |
| E. Shader de trazo (SDF de polilínea en GPU) | — | — | — | — | — | — | — | — | — | — | — | hipótesis: si B no rinde en teléfono | — |
| F. Pre-render / spritesheets / frame a frame | — | — | — | — | — | — | — | — | — | — | — | descartado de entrada para trazos: rompe la precisión matemática (cada número/gráfico es dinámico). Posible sólo para efectos (polvo). | — |

## Tiempo del trazo

| Técnica | Naturalidad | Control | Evidencia |
|---|---|---|---|
| Lineal por longitud (`d.draw`) | 1 — arranca y para en seco | 4 — duración exacta | E01 speed.png: perfil rectangular |
| Ease-in-out por trazo (CSS) | 2 — pico de 1700 px/s en el medio de una línea larga (2.8× crucero de B): se percibe como "lanzado" | 4 | E01 speed.png |
| **Plan de mano** (ley 2/3 + aceleración acotada + levantadas de Fitts) | 4 — arranque y frenada de ~0.1 s, crucero estable; marcas cortas en campana | 3 — la duración es consecuencia (se ajusta con `speed`/`accel`) | E01 speed.png, `motion.js` |

## Escritura y transformación (E03)

| Técnica | Precisión | Calidad visual | Control temporal | Edición por Claude | Riesgo | Evidencia |
|---|---|---|---|---|---|---|
| Fuente + barrido rectangular (`chalkText` + `reveal`) | 4 | 2 — tipografía, no escritura; dígitos de otra fuente | 1 — barrido lineal | 5 | bajo | E03 fila A |
| Fundido cruzado entre pasos | 3 | 1 — dos ecuaciones superpuestas (t03c, t = 5.33) | 2 | 5 | bajo | E03 fila A |
| **Glifos de un trazo + plan de mano** | 4 — legibles de 34 a 110 px | 4 — se ven escritos; bajadas más cargadas | 5 — cada trazo buscable | 4 — un glifo = una lista de puntos | medio (cobertura de signos: hoy 0–9 x y + − = ( ) / ·) | E03, E10 |
| **Identidad por símbolo** (desliza / escribe / tacha / borra; «=» pivote) | 5 | 4 | 5 | 3 — hay que declarar claves por símbolo | medio | E03 |

## Actuación (E05, E09)

| Técnica | Naturalidad | Control | Evidencia |
|---|---|---|---|
| Ease-in-out entre poses / `zip` / `hop` senoidal | 1–2 | 5 | E05 x.png, E09 hand-head.png (filas A) |
| **Segundo orden con retraso por canal** (anticipa con r < 0, sobrepasa, se asienta; mirada → cabeza → torso → brazos) | 3–4 | 3 — se ajusta con f, ζ, r | E05 x.png, E09 hand-head.png |
| **Pisadas planificadas + IK + péndulo invertido** | 4 — 0 patinaje | 4 | E09 feet.png |
| Poses del motor (`POSES`) | 2 — en perfil esconden un brazo | 5 | E09 act.png, E10 |

## Borrado (E07), cámara (E08), sonido (E10)

| Técnica | Resultado | Evidencia |
|---|---|---|
| Fundido + fantasma | todo se apaga junto, fantasma nítido | E07 fila A |
| **Borrador visible + neblina ∩ contenido** | causal, ilegible después, polvo con gravedad | E07 cmp.png |
| `Camera.go` 1.6 s ease | 3.85 pantallas/s de pico en viaje largo; se mueve mientras se dibuja | E08 pan.png |
| **van Wijk–Nuij + duración por costo + llegar antes** | 1.35 pantallas/s; quieta al empezar la acción | E08 |
| Sonido de tiza con envolvente fija (motor) | suena aunque la tiza no toque (levantadas simuladas a ritmo fijo) | `src/engine/audio.js` `chalkStart` |
| **Partitura desde la línea de tiempo** | 11× más energía con contacto; corr. 0.70 con la velocidad; [H] calidad | E10 score.wav |
