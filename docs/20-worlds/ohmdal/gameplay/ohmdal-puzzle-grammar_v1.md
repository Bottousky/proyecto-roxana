---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 8 — gramática de puzzles)
  - draft "Borrador — Puzzle Grammar" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §9
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-electrical-system_v1.md
  - docs/ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md
  - docs/ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md
open_questions:
  - PG-Q1 — cuántas familias se exigen en el camino crítico del Arco I sin saturar la curva (referencia: cuatro familias firmes; ver arc-01)
  - PG-Q2 — si P12 (Sistema abierto) admite evaluaciones automáticas de "elegancia" sin caer en métricas arbitrarias
  - PG-Q3 — si la P11 (Optimización) entra como contenido obligatorio del camino crítico o queda como capa de maestría opcional
  - PG-Q4 — cómo se representa la "múltiples soluciones" en puzzles físicos sin convertir el inventario en un caos de piezas
  - PG-Q5 — si un puzzle puede combinar más de dos familias o si esa combinación se trata como un sistema abierto
---

# Ohmdal — Puzzle Grammar · v1

Declara las **doce familias de puzzle (P1–P12)** que agotan el vocabulario jugable del mundo, con sus **variables de dificultad** y su lugar en el sistema eléctrico. No describe puzzles específicos (eso vive en `arc-01_v1.md` y en las fichas V0–V4 de cada puzzle).

> **Estado.** `PROPOSED`. Deriva de la visión, del core gameplay y del sistema eléctrico. Hereda y refina la gramática de ocho familias del reboot legacy (`01_OHMDAL_GDD_REBOOT_v1.md` §8) y la expande a doce para coincidir con la lista canónica del pack P2 §9.

---

## 1. Principios comunes a las doce familias

Toda familia de puzzle cumple:

1. **Fenómeno legible.** Hay un cambio perceptible antes de cualquier texto o número.
2. **Pregunta auténtica.** Se explica o corrige el fenómeno; no se adivina la respuesta del diseñador (P04).
3. **Hipótesis del jugador.** Antes de intervenir, el jugador puede (y debe) anticipar qué debería pasar.
4. **Intervención operable.** El jugador manipula el sistema, no selecciona una opción de un menú (P11, regla P2 "no multiple choice").
5. **Múltiples soluciones cuando el modelo lo permita.** Validación por condición, no por solución fija (P07, `mechanics-progression_v1.md`).
6. **Falla informativa.** El error produce observación, no castigo (P05, DL-§6).
7. **Transferencia.** El mismo tipo de razonamiento vuelve a aparecer en una topología o escala distinta.
8. **Restauración observable.** Resolver cambia el mundo, no sólo el contador (P08).

## 2. Las doce familias

### P1 — Continuidad

- **Concepto:** encontrar o cerrar un camino completo entre fuente y carga.
- **Capa del sistema eléctrico:** 0 (estado).
- **Acción típica:** tender un cable, cerrar un interruptor, designar dos nodos y verificar continuidad.
- **Decisión nueva:** "hay camino / no hay camino" antes de cualquier magnitud.
- **Aparece en:** Prólogo y Calzada, primer puzzle del slice.

### P2 — Diagnóstico

- **Concepto:** el sistema debería funcionar y no funciona. Aislar la causa.
- **Capa:** 0–1.
- **Acción típica:** medir tensión, corriente, continuidad; aislar tramos; comparar con estado esperado.
- **Decisión nueva:** "qué cambió, dónde y por qué" sin reiniciar el sistema.
- **Aparece en:** Calzada y Castillo; puzzle principal de Lumen en el slice.

### P3 — Distribución

- **Concepto:** varias cargas necesitan energía con restricciones distintas (prioridad, horario, continuidad).
- **Capa:** 2 (topología) y 3 (potencia).
- **Acción típica:** reorganizar la red, agregar o quitar una rama, priorizar servicio, definir horarios diegéticos.
- **Decisión nueva:** "qué carga se queda sin servicio" o "qué se sacrifica" cuando la fuente es limitada.
- **Aparece en:** Castillo, Forja, Terrazas.

### P4 — Topología

- **Concepto:** reconfigurar serie/paralelo para cambiar comportamiento.
- **Capa:** 2.
- **Acción típica:** abrir/cerrar un puente, mover un interruptor de barra, sustituir un nodo.
- **Decisión nueva:** "qué magnitudes se conservan y cuáles cambian".
- **Aparece en:** Castillo de la Red; prueba integradora del Capítulo 2.

### P5 — Dimensionamiento

- **Concepto:** elegir el componente, fuente o protección adecuada para una carga.
- **Capa:** 3.
- **Acción típica:** seleccionar entre un menú contextual de piezas disponibles; cambiar un fusible por otro; elegir un cable más grueso.
- **Decisión nueva:** "esto no es un problema de conexión, es un problema de límite".
- **Aparece en:** Forja; cierre de Capítulo 3.

### P6 — Energía útil

- **Concepto:** convertir energía eléctrica en luz, calor o movimiento con un objetivo de servicio o producción.
- **Capa:** 3.
- **Acción típica:** elegir cuántos consumidores se mantienen, calibrar tiempo de uso, registrar el coste.
- **Decisión nueva:** "más no siempre es mejor" — producir, mantener y descartar tienen coste explícito.
- **Aparece en:** Forja y Terrazas.

### P7 — Tiempo

- **Concepto:** cargar, descargar, retardar o sincronizar.
- **Capa:** 4.
- **Acción típica:** sustituir o agregar un capacitor, esperar un tiempo, sincronizar dos eventos.
- **Decisión nueva:** "el sistema tiene memoria — lo que pasó antes importa".
- **Aparece en:** Faro (si la ficha RC alcanza V2; en caso contrario, se sustituye por una culminación DC validada).

### P8 — Dirección

- **Concepto:** controlar por dónde y cuándo puede circular la corriente.
- **Capa:** 5.
- **Acción típica:** insertar un diodo, invertir polaridad, conmutar entre dos rutas.
- **Decisión nueva:** "el sentido importa" — la polaridad deja de ser accesorio.
- **Aparece en:** La Marea y La Señal.

### P9 — Control

- **Concepto:** una señal pequeña gobierna una acción mayor.
- **Capa:** 5–6.
- **Acción típica:** sustituir un interruptor manual por un transistor, agregar una resistencia de base, leer una señal.
- **Decisión nueva:** "separar lo que manda de lo que ejecuta" — el sistema se vuelve modular.
- **Aparece en:** La Señal y La Decisión.

### P10 — Automatización

- **Concepto:** sensores + lógica + actuadores.
- **Capa:** 6.
- **Acción típica:** conectar un sensor a un actuador a través de una compuerta o bloque lógico.
- **Decisión nueva:** "el sistema decide por sí solo bajo reglas que puedo leer".
- **Aparece en:** La Decisión; cruza con Bitland en El Empalme.

### P11 — Optimización

- **Concepto:** funciona, pero usa demasiado, calienta, es frágil, desperdicia, no escala o no se mantiene.
- **Capa:** 3–6.
- **Acción típica:** sustituir componentes, reorganizar topología, agregar protección, documentar el procedimiento.
- **Decisión nueva:** "no basta con que funcione: debe funcionar mejor y poder sostenerse".
- **Aparece en:** Retos opcionales en cada arco; nunca obligatoria en el camino crítico (P13 — la maestría es opcional).

### P12 — Sistema abierto

- **Concepto:** un objetivo funcional con varias arquitecturas válidas.
- **Capa:** 3–6 (combinación).
- **Acción típica:** diseñar una instalación desde cero, documentar la elección, defenderla ante un NPC.
- **Decisión nueva:** "el problema admite varias soluciones defendibles; debo poder justificar la mía".
- **Aparece en:** Cierre de capítulo y cierre de arco. La prueba integradora del Arco I es un P12 acotado.

## 3. Variables de dificultad (por familia)

Las variables se aplican a todas las familias. La columna "qué aumenta" indica qué tipo de dificultad se incrementa (DL-§4, Checklist C6).

| Variable | Aplica a todas | Aplica preferentemente a | Qué aumenta |
|---|---|---|---|
| Cantidad de elementos | sí | P1, P2, P3 | simultaneidad |
| Cantidad de interrupciones | sí | P1, P2, P4 | distancia causa–efecto |
| Rutas alternativas | sí | P1, P3, P12 | necesidad de anticipación |
| Retornos ocultos | sí | P2, P4 | información incompleta inferible |
| Interruptores o conmutadores | sí | P1, P3, P4 | anticipación |
| Estados posibles por nodo | sí | P2, P3, P4 | cantidad de variables |
| Restricciones explícitas (componentes, energía, tiempo) | sí | P5, P6, P11 | restricciones |
| Ruido de fondo o perturbación | sí | P7, P10, P12 | perturbaciones |
| Cantidad de magnitudes a leer | sí | P2, P4, P11 | cantidad de variables |
| Rango incorrecto como trampa | sí | P2, P5 | inferencia (no castigo) |
| Componentes con tolerancia | capas 3–6 | P5, P11 | optimización |
| Combinación de familias | sí | P11, P12 | combinación de conceptos |
| Cantidad de soluciones válidas | sí | P3, P4, P11, P12 | optimización |
| Distancia temporal entre causa y efecto | capas 4–6 | P7, P10, P12 | distancia causa–efecto |
| Necesidad de predecir antes de energizar | capas 3–6 | P5, P6, P10, P12 | necesidad de anticipación |

Aplicación de la regla "no introducir cinco componentes nuevos a la vez" (pack P2 §10): un puzzle introduce **una variable nueva** como máximo respecto del puzzle anterior de su arco. Si dos variables se incrementan, una debe ser combinatoria (cantidad de elementos) y la otra, restricción explícita.

## 4. Variables de dificultad por familia — detalle obligatorio

Cada familia declara, además de las variables generales, **al menos una variable propia** que no se comparte con las demás. Esta variable es la que da identidad a la familia.

| Familia | Variable propia |
|---|---|
| P1 — Continuidad | **Cantidad de retornos:** el sistema puede tener varios caminos de vuelta, y el jugador debe elegir uno (continuidad ≠ buen camino). |
| P2 — Diagnóstico | **Aislamiento por tramos:** seccionamiento real (un tramo a la vez) vs. sección simbólica (un nodo de prueba). |
| P3 — Distribución | **Política de prioridad:** un servicio puede declararse esencial, secundario o sacrificado; el sistema lo respeta. |
| P4 — Topología | **Equivalencia observable:** dos topologías distintas pueden entregar el mismo resultado; el jugador debe decidir cuál deja mejor mantenibilidad. |
| P5 — Dimensionamiento | **Tolerancia explícita:** el componente puede fallar fuera de margen, y la falla aporta evidencia. |
| P6 — Energía útil | **Coste social:** producir más tiene coste humano (mantenimiento, seguridad, descarte). El mundo lo hace visible. |
| P7 — Tiempo | **Constante de tiempo observable:** se ve cuánto tarda en alcanzar un porcentaje del valor final antes de cualquier fórmula. |
| P8 — Dirección | **Caída directa:** un diodo tiene caída; el jugador ve que la tensión "baja" después de él. |
| P9 — Control | **Punto Q:** un transistor tiene un umbral; el sistema lo modela como una curva, no como un switch. |
| P10 — Automatización | **Latencia y rebote:** la respuesta del sensor y del actuador no es instantánea; el mundo lo muestra. |
| P11 — Optimización | **Mérito explícito:** la solución debe declarar en qué mejora (consumo, calor, robustez, mantenibilidad, escala). |
| P12 — Sistema abierto | **Defensa ante un crítico:** un NPC o el sistema exige al jugador justificar la arquitectura. |

## 5. Combinaciones permitidas y prohibidas

- **Permitido:** combinar dos familias cuando una es la primaria (introduce la decisión) y la otra es soporte (varía una condición). Ejemplo: P1 + P5 — el camino se cierra con un componente dimensionado.
- **Permitido:** combinar P11 o P12 con cualquier otra familia, como capa de optimización posterior.
- **Prohibido:** combinar P1 con P12 en el mismo puzzle del camino crítico. Un P1 no admite "sistema abierto" sin P5 o P4 detrás.
- **Prohibido:** una familia como sub-puzzle obligatorio de otra. P7 y P10 son contenido, no decoración.

## 6. Puzzle de un puzzle — la ficha mínima

Cada puzzle concreto del mundo se documenta con la ficha de la biblia educativa (30 campos, `02_EDUCATIONAL_CONTENT_BIBLE.md` §"Ficha obligatoria por contenido"). A los efectos de esta gramática, los campos operativos son:

1. **Familia** (P1–P12) y, si combina, familia secundaria.
2. **Capa del sistema eléctrico** (0–6).
3. **Fenómeno inicial** observable.
4. **Pregunta de investigación** que el jugador termina respondiendo.
5. **Hipótesis esperables** (al menos dos, una plausible y una ingenua).
6. **Intervenciones válidas** (al menos dos cuando el modelo lo permita).
7. **Errores productivos** y qué información aporta cada uno.
8. **Puntos de medición** e instrumentos.
9. **Pistas:** Pista 1 por observación, Pista 2 por comparación, Pista 3 explícita opcional.
10. **Transferencia** a qué otra escena o puzzle.
11. **Entrada de Bitácora** que se desbloquea.
12. **Variables de dificultad activas** (ver §3 y §4).
13. **Tests deterministas** del modelo.

## 7. Anti-patrones de puzzle

Heredados de la guía de puzzles canónica y de los pilares:

- **No multiple choice** como interacción principal. La elección ocurre sobre el sistema.
- **No trivia memorística.** El puzzle no se resuelve por recordar un dato aislado (P04).
- **No fórmula como contraseña.** El sistema no exige tipear `V=IR` para abrir una puerta.
- **No inventario mágico.** Un puzzle no se resuelve con un ítem único que sólo existe para ese puzzle.
- **No banco modal aislado.** El puzzle se resuelve sobre la escena, no en una pantalla desconectada.
- **No solución única cuando el modelo admite varias.** Si el sistema acepta una sola respuesta, la pregunta está sobre-restringida (P07).
- **No ensayo ciego hasta coincidir.** El sistema no tiene una secuencia oculta que se acierte por descarte.
- **No camino crítico con dependencia de lectura obligatoria.** El puzzle debe poder resolverse sin leer un diálogo (P11).

## 8. Lo que este documento NO es

- No es un catálogo de puzzles. Los puzzles viven en `arc-01_v1.md` y en los archivos de contenido.
- No prescribe presentación visual. Cómo se ve un nodo, un instrumento o un cable vive en la dirección visual.
- No prescribe tecnología. La validación determinista se implementa en el modelo puro (`src/puzzles/*Model.ts`).
- No redefine el sistema eléctrico. La coherencia con `electrical-system_v1.md` es requisito de paso.
