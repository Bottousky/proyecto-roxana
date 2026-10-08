# ARITHMOS · Investigación de animación

Estado de cada afirmación: **[probado]** = hay experimento en este repo con evidencia; **[fuente]** = documentado por una fuente externa, sin experimento propio; **[hipótesis]** = idea nuestra sin probar.

---

## 0. Auditoría del Arithmos actual (2026-10-07, commit 2308e4b6)

Motor propio sin dependencias: Canvas 2D + un compuesto WebGL. Archivos: `experiments/arithmos/src/engine/`.

| Pieza | Cómo está hecha | Fortaleza | Limitación medida u observada |
|---|---|---|---|
| Pizarrón (`renderer.js`) | La tiza se dibuja como **presión** en un lienzo 2D (R/G/B = blanca/amarilla/celeste, composición `lighten`); un shader WebGL convierte presión en cobertura comparándola con el **diente** del pizarrón (textura de alturas ecualizada, anclada al mundo). | Excelente idea: la textura de tiza sale del pizarrón, no del trazo; el grano no "nada" con la cámara; manchas de borrado en una capa de polvo. | Ninguna grave. **Se conserva** en todas las técnicas del laboratorio. |
| Trazo (`chalk.js` `stroke/drawStroke`) | Guía → remuestreo cada 2.6 px → ruido lateral, perfil de presión (toque/levantada) y 3 "cerdas" → segmentos cortos con `lineCap round`, 5 pasadas. | Determinista (semillas), barato, cacheable. | Composición por máximo: dos pasadas **no acumulan** (un cruce o un repaso no se carga más). Textura "a cuentas": autocorrelación a 2 px = 0.85 (E01). Ancho no depende de la dirección. |
| Tiempo de dibujo (`director.draw`) | `tween(sec)` **lineal** sobre la longitud total; entre trazos una pausa fija equivalente a 14 px. | Simple. | Velocidad rectangular: arranca y para en seco (gráfico E01). Ignora curvatura, largo y distancia de la levantada. Es la diferencia más visible entre "se revela" y "alguien dibuja". |
| Texto (`chalkText`, `Label`) | Fuente Kalam/Atkinson con relleno + contorno en el lienzo de presión; "escribir" = **recorte rectangular de izquierda a derecha** (`reveal`). | Legible, rápido. | Es un **barrido**, no escritura: no hay orden de trazos, ni mano, ni ritmo por letra. No permite transformar una ecuación pieza por pieza (no hay identidad por glifo). Es el límite principal para TEST 03. |
| Figura (`figure.js`) | Esqueleto 2D de ángulos, 23 poses, mezcla con ease-in-out cuadrático, caminata senoidal, mirada exponencial, "boil" a 8 fps (trazos re-sorteados cada 0.125 s). | Poses claras y legibles; el boil da vida de dibujo animado. | Interpolación pose a pose sin anticipación, sin follow-through ni superposición (todas las articulaciones llegan juntas). Velocidad de caminata constante (sin arranque/frenada); los pies se deslizan (no hay plantado de pie). |
| Punto (`world.js` `Dot`) | Espiral de tiza; modos wander/anchor/bob; squash por velocidad con relajación exponencial; estela. | Squash ligado a velocidad: correcto en principio. | `zip`/`hop` (`acting.js`) usan ease-in-out o lineal + seno: sin anticipación ni asentamiento; el squash no conserva volumen exactamente; no hay "pensamiento" visible antes de moverse. |
| Cámara (`camera.js`) | Planos como rectángulos; viaje con interpolación **logarítmica** del tamaño (zoom perceptualmente parejo) y ease-in-out cúbico; deriva senoidal; temblor senoidal. | El zoom logarítmico es lo correcto. | Mismo ease para todo viaje (no distingue paneo de reencuadre); el temblor es una senoide pura (se percibe mecánica); no hay "lead" ni encuadre que anticipe la acción. |
| Borrado | `fade` atenúa presión; `Smear` dibuja polvo; la Marea es una franja que barre. | Hay capa de polvo con fantasma. | El borrado de un trazo es un fundido de presión: no hay borrador con forma, ni dirección, ni residuo que dependa de lo que había. |
| Director | Escenas como funciones `async` con `tween`; saltar = terminar timers. | Escenas legibles, fáciles de editar por Claude. | El tiempo es incremental (dt), no buscable: no se puede pedir "el cuadro de t = 2.35 s" para comparar versiones. |

**Diagnóstico**: la base de *render* (presión + diente WebGL) es buena y se reutiliza. Lo que impide el estándar está en **tiempo y actuación**: progreso lineal, texto por barrido, poses sin superposición, sin anticipación. Esas tres cosas son reemplazables por módulos sin rehacer escenas → apunta a **reconstrucción parcial** (decisión final en `ARITHMOS_ANIMATION_STATE.md`, sujeta a los tests 02–10).

---

## 1. Claude Code y agentes para trabajo visual

- **Harness planner / generator / evaluator** [fuente] — Anthropic, *Harness design for long-running application development*: https://www.anthropic.com/engineering/harness-design-long-running-apps . El evaluador separado usa Playwright para probar la app como un usuario; los criterios de frontend son *design quality, originality, craft, functionality*, y pesan más los dos primeros porque el modelo ya cumple *craft* y *functionality* por defecto. Es más fácil hacer escéptico a un evaluador que volver autocrítico al generador. → En Arithmos: el que anima no se autoaprueba; un revisor con contexto fresco juzga contra el quality bar.
- **Harness de larga duración** [fuente] — *Effective harnesses for long-running agents*: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents . Archivo de progreso, lista de funciones en JSON (solo se cambia `passes`), commits, script de arranque, prueba de punta a punta con navegador. Fallas típicas: declarar victoria antes de tiempo y handoffs sin documentar. → `ARITHMOS_ANIMATION_STATE.md` + capturas por ciclo en carpetas nuevas.
- **Evaluator-optimizer** [fuente] — *Building effective agents*: https://www.anthropic.com/research/building-effective-agents . Funciona "cuando hay criterios claros y el refinamiento aporta valor medible". → Por eso el quality bar está escrito en observables.
- **Best practices de Claude Code** [fuente] — https://code.claude.com/docs/en/best-practices . "Dale a Claude una forma de verificar su trabajo"; para UI: captura del resultado, comparar con el objetivo, listar diferencias, corregir.
- **Visión de Claude** [fuente] — https://platform.claude.com/docs/en/build-with-claude/vision . Las imágenes se reducen (lado largo ~1568 px en el tier estándar; ~2576 px en alta resolución para modelos recientes). → Implicación práctica [probado E01]: una captura de 1600×900 no muestra la textura de un trazo de 5 px; hacen falta **recortes a dpr 3** de zonas de 400×80 px. La captura completa sirve para composición, el recorte para textura.
- **Subagentes, hooks, headless** [fuente] — https://code.claude.com/docs/en/sub-agents , https://code.claude.com/docs/en/hooks , https://code.claude.com/docs/en/headless . Un hook `Stop` puede bloquear el cierre si una verificación falla (posible compuerta futura).
- **Animación generada por LLM (Manim)** [fuente]: Code2Video (arXiv 2510.01174, Planner/Coder/Critic con VLM y "visual anchors"), TheoremExplainAgent (2502.19400: la mayoría de los videos tienen problemas de layout), OmniManim (2605.15585: el layout es el cuello de botella; agente visual con bounding boxes), SGA (2607.18116: verificar geometría **antes** de renderizar), ManiBench (2603.13251: fallas "Visual-Logic Drift" = timing o causalidad incorrectos). → Lección: chequear geometría y tiempos numéricamente (sondas), no sólo mirar.

## 2. Trazo de tiza

- **perfect-freehand** [fuente] https://github.com/steveruizok/perfect-freehand : contorno de ancho variable con presión simulada por velocidad (`thinning`, `smoothing`, `streamline`). Útil para tinta; para tiza el ancho no cambia tanto con la presión como la **cobertura** — eso lo resuelve mejor el compuesto de diente [hipótesis, no probado].
- **rough.js** [fuente] https://github.com/rough-stuff/rough/wiki : `roughness`, `bowing`, hachurado. Estética de boceto, no de tiza; el arqueo (`bowing`) ya está en `lineGuide`.
- **Pinceles por estampa** [fuente] (Blender, *spacing* como % del radio): https://docs.blender.org/manual/es/4.3/sculpt_paint/brush/stroke.html . → Técnica B del laboratorio [probado E01].
- **Ruido en trazos con shader** [fuente] Codrops: https://tympanus.net/codrops/?p=54545 . No probado.
- **Ley de potencia de dos tercios** (Lacquaniti, Terzuolo y Viviani, 1983) y **mínimo jerk** (Flash y Hogan, 1985): la velocidad de la mano baja con la curvatura (v ∝ κ^-1/3) y los movimientos voluntarios tienen perfil de velocidad en campana. Conocimiento de control motor; aplicado en `animlab/core/motion.js` [probado E01: el perfil de B arranca, crucera y frena; A es rectangular; el ease-in-out de C pica a 1700 px/s en el medio de una línea larga, 2.8× la velocidad de crucero de B].

## 3. Escritura y transformación de ecuaciones

- **stroke-dashoffset + pathLength** [fuente] MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pathLength — la técnica web estándar de "dibujar un path". Técnica C del laboratorio [probado E01: correcto pero sin presión, grano en espacio de pantalla, perfil de velocidad de ease].
- **Fuentes de un solo trazo** (Hershey) [fuente] https://github.com/coolbutuseless/hershey : glifos como polilíneas; necesarias para escribir trazo a trazo. Arithmos necesita pocos signos (0–9, x, y, +, −, =, (, ), /, ·) → se dibujan a mano en `animlab/core/glyphs.js` [pendiente E03].
- **Manim TransformMatchingTex / TransformMatchingShapes** [fuente] https://docs.manim.community/en/stable/reference/manim.animation.transform_matching_parts.TransformMatchingTex.html : las partes con la **misma clave** se mueven a su nueva posición; las que no coinciden aparecen/desaparecen. El principio que evita el crossfade: **identidad persistente por símbolo**. → En tiza el equivalente es más rico: lo que persiste se desliza (la tiza no se mueve en un pizarrón real, así que hay que decidir una convención: ver `ARITHMOS_VISUAL_LANGUAGE.md` §Transformación).
- **Motion Canvas / Remotion / Theatre.js** [fuente] https://www.remotion.dev/docs/compare/motion-canvas : tiempo explícito y determinista (generadores o frames). Son herramientas de video, no de runtime de juego; tomamos el **principio** (tiempo buscable) y lo implementamos en el lab (`__lab.seek(t)`).

## 4. Movimiento y actuación

- **Sistemas de segundo orden** (t3ssel8r, *Giving Personality to Procedural Animations using Math*, 2022; resumen https://hackaday.com/2022/page/250 ) [fuente]: f (frecuencia), ζ (amortiguamiento), r (respuesta inicial: r<0 anticipa, r>1 sobrepasa). Implementado como `SecondOrder` en `motion.js` [no probado aún: E05].
- **Resortes exactos** (Daniel Holden, *Spring-It-On*): https://theorangeduck.com/page/spring-roll-call [fuente]. Damper exacto independiente del dt.
- **Squash and stretch conserva volumen** [fuente] https://courses.cs.washington.edu/courses/cse457/99au/handouts/lectures/animation-principles.pdf .
- **Cámara con trauma** (Squirrel Eiserloh, GDC 2016): temblor = trauma² × ruido coherente, trauma decae lineal [fuente secundaria] https://www.gamedeveloper.com/programming/video-sprucing-up-cameras-with-math .

## 5. Evaluación

- **Playwright clock** [fuente] https://playwright.dev/docs/clock — tiempo virtual. En el lab no hace falta: el tiempo es un parámetro (`seek`).
- **Video de Playwright** [fuente] https://playwright.dev/docs/videos — sin frame rate documentado: sirve como registro para humanos, no para medir.
- **pixelmatch / SSIM** [fuente] https://cdn.jsdelivr.net/npm/pixelmatch@7.1.0/README.md — útil sólo para detectar regresiones no buscadas; no mide calidad.
- **Long Animation Frames API** [fuente] https://www.w3.org/TR/long-animation-frames/ — jank en Chrome.
- En esta máquina no hay PIL, OpenCV ni ffmpeg: las métricas se calculan **en el navegador** sobre el lienzo de presión (antes del compuesto), que es más informativo que los píxeles finales [probado E01].

## Pendiente de investigar (con experimento)
- Plantado de pies e IK de dos huesos para la figura (E09).
- Borrador con forma y residuo dependiente del depósito (E07).
- Audio de tiza ligado a la velocidad real de la punta (E10).
