---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 10 — vertical slice reboot, en lo que define criterios; sección 11 — diseño de dificultad; sección 16 — riesgos; sección 17 — criterio de éxito)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ../gameplay/physica-player-movement_v1.md
  - ../gameplay/physica-physics-interaction-system_v1.md
  - ../gameplay/physica-puzzle-grammar_v1.md
  - ../gameplay/physica-mechanics-progression_v1.md
  - ../world/physica-world-structure_v1.md
  - ../narrative/physica-narrative-bible_v1.md
  - ../content/physica-arc-01_v1.md
  - ../content/physica-vertical-slice_v1.md
open_questions:
  - PHYS-PE-1 — ¿El "número mínimo de probadores" del vs. (5) es suficiente para cerrar la DoD, o se necesita un panel más amplio? Decisión de método.
  - PHYS-PE-2 — ¿Las métricas observables del vs. se almacenan en el sistema de telemetría existente del proyecto (Roxana) o se montan ad-hoc para el vs. de Physica? Implicación de scope.
  - PHYS-PE-3 — ¿La promoción del vs. de PROPOSED a EXPERIMENTAL (Canon Policy §1) ocurre **antes** de probarlo (estado de origen) o **después** de validarlo? Esta sesión recomienda **antes**, con el vs. como prototipo nombrado.
  - PHYS-PE-4 — ¿Los criterios de optimización del Modo Maestría se incluyen en la evaluación del vs. o se reservan a una segunda ronda? Implicación de tiempo de prototipado.
  - PHYS-PE-5 — ¿El vs. mide también **accesibilidad** (PHYS-PM §12) o se reserva a una evaluación posterior? Implicación de alcance.
---

# PHYSICA — PROTOTYPE EVALUATION · v1

Este documento define **qué se mide**, **cómo se mide** y **qué se
decide** a partir de las mediciones cuando se valida el Vertical
Slice de Physica. Es la frontera entre el diseño de contenido
(autoridad 4) y la producción (autoridad 5): aquí se cierra la DoD
de P3 con evidencia.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Alcance.** Cubre la **evaluación del vs.** de Physica, no del
> mundo completo. Los criterios de éxito del producto final (más
> allá del vs.) son responsabilidad de P6 y de futuras sesiones.

---

## 1. Tesis

> **La DoD de P3 se cierra con evidencia de prototipo, no con
> declaraciones de diseño.**

Un documento `PROPOSED` no se promueve a `CANON` por ratificación
interna. Se promueve cuando un prototipo demuestra que la decisión
funciona, según `ROXANA_CANON_POLICY_v1.md` §5. Este documento
define **qué es "funciona"** para Physica en el alcance del vs.

---

## 2. Lo que el prototipo es

El **Vertical Slice** (`content/physica-vertical-slice_v1.md`) es
el **prototipo nombrado** que valida las hipótesis de Physica. Su
estado de canon es `EXPERIMENTAL` mientras corre la prueba, y
asciende (o no) según los resultados.

> **Decisión de v1.** El vs. se publica como `EXPERIMENTAL`
> (Canon Policy §1) **antes** de la prueba externa, con el vs.
> como prototipo nombrado. Los documentos de autoridad 3 y 4
> (vision, gameplay, world, narrative, arc-01, vertical-slice)
> **no** ascienden hasta que el prototipo **demuestre** que
> respaldan la hipótesis.

---

## 3. Hipótesis de diseño (qué valida el vs.)

Estas hipótesis son las que el vs. **debe** cerrar. Si alguna
queda abierta, el vs. no aprueba.

| # | Hipótesis | Pilar que valida | Criterio observable |
|---|---|---|---|
| H1 | El movimiento del avatar es divertido **sin puzzles**. | P09 | Tiempo de exploración libre ≥ 2 min sin objetivo. |
| H2 | La física estilizada es **consistente y transferible** dentro del vs. | P05, P14 | Cero glitches físicos reportados; el jugador reusa observaciones sin re-explicación. |
| H3 | El fallo **produce información**. | P05 | El jugador modifica el siguiente intento a partir del fallo. |
| H4 | El jugador **experimenta espontáneamente**. | P02 | Al menos 1 variable modificada sin instrucción, por jugador. |
| H5 | Los **instrumentos potencian**, no resuelven. | P04, P14 | El vs. se completa sin reloj. El reloj nunca entrega la respuesta. |
| H6 | La **formalización llega en el momento correcto**. | P02, P06 | Términos técnicos (masa, vector) **no** aparecen antes de beat 10. |
| H7 | Hay **≥2 soluciones** en el puzzle integrador. | P07 | Sistema valida por condición; ambas rutas son físicamente razonables. |
| H8 | La consecuencia no deseada **abre** el siguiente arco. | P08 | El jugador termina con curiosidad, no con frustración. |
| H9 | La locomoción es **excelente** como sistema (no como controles). | P09, P14 | `physica-player-movement_v1.md` se valida como sistema, no como mapping. |
| H10 | El reloj-dispositivo **crece como instrumento**, no como menú. | P08, P14 | El reloj entra en beat 6 (cronómetro), no antes. |
| H11 | El INSTRUMENTO **reacciona al estado, no a la intención** (P11). | P11 | El INSTRUMENTO no dice "lo estás haciendo mal" en ningún beat. |
| H12 | El vocabulario técnico **no aparece** en la voz del mundo (P02). | P02 | Cero términos técnicos en los diálogos del INSTRUMENTO. |
| H13 | La física **no compite con la pedagogía**. | P14 | El jugador no necesita "saber física" para jugar; necesita **observar**. |

> **Regla.** Para que el vs. apruebe, **todas** las hipótesis
> H1–H13 deben estar **cerradas** en al menos 4 de 5 probadores.
> Una hipótesis con **un solo probador** en contra no es
> bloqueo, pero **una hipótesis con dos o más** en contra es
> bloqueo y obliga a iterar el diseño.

---

## 4. Métricas observables

Cada hipótesis se conecta a una o más **métricas observables** que
se pueden medir en el vs. Las métricas se dividen en **tres
clases**:

### 4.1 Métricas automáticas (telemetría)

Si la build del vs. puede emitir telemetría:

| Métrica | Fuente | Qué mide | Hipótesis relacionada |
|---|---|---|---|
| `t_exploracion_libre` | Tiempo entre "Entrar" y primer puzzle. | Si el jugador se mueve sin objetivo. | H1, H4 |
| `n_variables_modificadas` | Cuenta de cambios de variable espontáneos. | Si el jugador experimenta. | H4 |
| `n_resets` | Cuenta de resets por beat. | Si el fallo produce información o castigo. | H3 |
| `t_beat_N` | Tiempo por beat. | Ritmo del vs. (rango 20–30 min). | (VS-9) |
| `n_trayectorias_distintas` | Cuenta de trayectorias distintas en puzzle integrador. | Si hay ≥2 soluciones. | H7 |
| `t_primera_solucion` | Tiempo hasta la primera condición cumplida. | Curva de aprendizaje. | H3, H4 |
| `n_activaciones_reloj` | Activaciones del reloj por beat. | Si el reloj se vuelve necesario. | H5 |
| `n_terminos_tecnicos_antes_beat10` | Cuenta de términos técnicos en logs de diálogo. | Si la formalización se anticipa. | H6, H12 |
| `n_glitches_fisicos` | Eventos físicos inconsistentes detectados. | Consistencia de la física. | H2 |
| `n_glitches_voz` | Fragmentos del INSTRUMENTO fuera del guion. | Fidelidad de la voz. | H11, H12 |

### 4.2 Métricas observacionales (humano)

Un observador (no el implementador) registra durante la prueba:

| Métrica | Qué mide | Hipótesis relacionada |
|---|---|---|
| Momentos en que el jugador **se detiene a observar** sin input. | H1, H4. | |
| Verbalizaciones espontáneas (no respuestas a pregunta). | H3, H4, H8. | |
| Cambios de **expresión facial** ante el fallo. | H3, H8. | |
| Tiempo hasta el **primer experimento** (no puzzle, no objetivo). | H4. | |
| Uso del **reloj** (cuándo, por qué). | H5, H10. | |
| Lectura o no de la **Bitácora formal** (beat 10). | H6. | |

### 4.3 Métricas declarativas (post-vs.)

Cuestionario **abierto** (no multiple choice) después del vs.:

- "¿Cómo describirías este juego a un amigo?"
- "¿Qué fue lo más confuso? ¿Por qué?"
- "¿Qué fue lo más satisfactorio? ¿Por qué?"
- "¿En qué momento sentiste que el juego te estaba enseñando algo?"
- "¿Volverías a jugar?"

> **Prohibido.** Cuestionario con multiple choice. El pack P3
> explícitamente prohíbe multiple choice como interacción principal
> de cualquier puzzle; por extensión, las preguntas del estudio
> tampoco deben ser multiple choice.

---

## 5. Procedimiento de prueba

### 5.1 Probadores

- **Mínimo 5 probadores externos** al equipo de desarrollo.
- Mezcla recomendada: 2 con experiencia en juegos de puzzles, 2
  con experiencia general en juegos, 1 con poca experiencia en
  juegos. Decisión abierta en `PHYS-PE-1`.
- Ningún probador con conocimiento del guion v0.2 antes de la
  prueba (para evitar contaminación de expectativa).

### 5.2 Briefing

- Una hoja de una página: "Estás en un lugar extraño. No hay
  instrucciones. Cuando termines, hablaremos."
- **Sin** objetivo, sin tip, sin "este juego es de física".

### 5.3 Duración

- 20–30 min de juego.
- 5 min de debriefing.
- Tiempo de setup no incluido.

### 5.4 Telemetría

- Activada por defecto durante la prueba.
- Desactivable por el probador si lo pide.

---

## 6. Decisiones condicionales

A partir de los resultados, el vs. puede terminar en uno de cuatro
estados. Cada estado tiene un **siguiente paso** explícito.

### 6.1 Estado A — VS aprobado

- **Resultado.** ≥4 de 5 probadores aprueban VS-1 a VS-10. H1–H13
  cerradas. Glitches físicos < 1 por beat.
- **Siguiente paso.** Los documentos `PROPOSED` de autoridad 3–4
  se mantienen como `PROPOSED` hasta que se valide el **Arco I
  completo** (no sólo el vs.). Se inicia la spec del Arco I.

### 6.2 Estado B — VS con reservas

- **Resultado.** 3 de 5 probadores aprueban. 1–2 hipótesis quedan
  abiertas pero **sin bloqueo mayor**.
- **Siguiente paso.** Iterar el vs. (1–2 semanas) y volver a
  probar. **No** se inicia la spec del Arco I completo.

### 6.3 Estado C — VS devuelto

- **Resultado.** 2 o más probadores reprueban. **Una o más
  hipótesis críticas** (H1, H2, H5, H6, H7) queda abierta.
- **Siguiente paso.** Re-prototipado. Se reabre el documento de
  autoridad correspondiente por ADR. **No** se itera el vs. sin
  cambiar el diseño.

### 6.4 Estado D — VS cancelado

- **Resultado.** La identidad de Physica **no funciona como
  aventura física** con los criterios del proyecto. La hipótesis
  H1 falla sistemáticamente.
- **Siguiente paso.** Replantear Physica. Sesión de diseño
  dedicada. **No** se promueve ningún documento a `CANON`.

---

## 7. Riesgos de prototipo

| # | Riesgo | Mitigación | Hipótesis afectada |
|---|---|---|---|
| PE-R1 | Los probadores externos **no entienden** la anomalía (cascada) sin instrucción. | El vs. mide tiempo hasta el primer "experimento" (H4). Si >60% no experimenta, el vs. falla. | H1, H4 |
| PE-R2 | El reloj **se vuelve necesario** porque el jugador no puede predecir sin él. | El vs. mide el número de beats en los que el reloj es **obligatorio** para avanzar. Si ≥1 beat requiere reloj, se rediseña. | H5, H10 |
| PE-R3 | La formalización del beat 10 se siente como **lección**. | El vs. mide si el jugador lee la Bitácora formal (≥30 segundos). | H6 |
| PE-R4 | La consecuencia no deseada (roca flotante) se siente como **bug**. | El vs. mide la reacción del jugador. Si ≥2 de 5 dicen "el juego se rompió", se rediseña. | H8 |
| PE-R5 | La física es **inconsistente** (un beat viola la regla del bioma). | Telemetría cuenta glitches físicos. Cualquier glitch > 0 en un beat pedagógico es bloqueo. | H2 |
| PE-R6 | El puzzle integrador **no admite 2 soluciones legibles**. | Si 4 de 5 probadores eligen la misma ruta, el puzzle se rediseña. | H7 |
| PE-R7 | El vs. se alarga a >35 min. | Telemetría mide `t_beat_N`. Si el vs. pasa de 35 min, se acorta un beat. | (VS-9) |
| PE-R8 | El jugador **no experimenta** porque el sistema le da la respuesta. | Si ningún probador varía una variable, el vs. falla. | H4 |
| PE-R9 | El INSTRUMENTO **anticipa** la solución. | Telemetría mide `n_terminos_tecnicos_antes_beat10`. Cualquier > 0 es bloqueo. | H11, H12 |
| PE-R10 | La locomoción se siente **pesada**. | Si ≥2 de 5 probadores reportan "el personaje se siente lento", se reabre `physica-player-movement_v1.md`. | H1, H9 |

---

## 8. Conexión con el canon

### 8.1 Promoción de los documentos

Los documentos producidos en P3 son `PROPOSED` en v1. La promoción
a `CANON` sigue el flujo de `ROXANA_CANON_POLICY_v1.md` §5:

1. **Validación.** El vs. aprueba (estado A).
2. **Coherencia.** Ningún documento contradice un CANON de mayor
   `authority_level` (Pillars, Design Language, Canon Policy,
   Document Architecture, Design Review Checklist). Verificación
   por checklist.
3. **Aprobación.** Decisión autoral explícita de Manuel
   registrada en un ADR.
4. **Frontmatter actualizado.** Se modifican `status`,
   `last_ratified`, `version` y se cierran las `open_questions`
   pertinentes.

### 8.2 Promoción del vs. mismo

El vs. en sí mismo se reclasifica a `CANON` **sólo cuando**:
- el vs. aprueba;
- el Arco I completo también aprueba (en una segunda ronda de
  prototipo).

Antes de eso, el vs. vive como `EXPERIMENTAL` con el propio vs.
como prototipo nombrado.

### 8.3 Reclasificación de legacy

Cualquier reclasificación de documentos legacy a `LEGACY` o
`REJECTED` producto de esta sesión (ver resumen al final del
informe de P3) **se ejecuta por ADR separado** según
`ROXANA_DOCUMENT_ARCHITECTURE_v1.md` §2 (Migración). Esta sesión
**no** mueve archivos.

---

## 9. Decisiones que requieren ratificación explícita de Manuel

Antes de promover cualquier documento de P3 a `CANON`, Manuel debe
ratificar **explícitamente** las siguientes decisiones (ADR
requerido):

1. **Alcance del primer producto.** ¿El primer Physica entrega
   sólo el Arco I, o incluye también arcos futuros? (Ver
   `gameplay/physica-mechanics-progression_v1.md` `PHYS-MP-1` y
   `PHYS-MP-2`.)
2. **Metrópoli.** ¿E8 entra en el primer producto, queda como
   epílogo opcional, o se reserva a un arco dedicado? (Ver
   `world/physica-world-structure_v1.md` `PHYS-WS-1` y
   `vision/physica-vision_v1.md` `PHYS-VQ-1`.)
3. **Voz del docente.** ¿La línea 14 del guion v0.2 pertenece al
   INSTRUMENTO, a un NPC, a un recuerdo del avatar, o a un
   registro? (Ver `narrative/physica-narrative-bible_v1.md`
   `PHYS-NB-1`.)
4. **Eje del juego.** ¿La cámara lateral 2.5D admite eje curado
   adicional para E8 o se mantiene estrictamente lateral? (Ver
   `world/physica-world-structure_v1.md` `PHYS-WS-3`.)
5. **Masa aparente del avatar.** ¿`mA` varía dentro del Arco I
   o se reserva al Arco II? (Ver
   `gameplay/physica-player-movement_v1.md` `PHYS-PM-1`.)
6. **Reclasificaciones a LEGACY.** Las reclasificaciones del
   legacy enumeradas en `vision/physica-vision_v1.md` §7 y en el
   informe de cierre de P3 deben ratificarse antes de mover
   archivos.

> **Bloqueador.** Hasta que cada una de estas seis decisiones
> sea ratificada, los documentos producidos en P3 **no se
> promueven** a `CANON`.

---

## 10. Lo que este documento NO es

- No es un **plan de QA** del producto final. El QA vive en P6.
- No es un **plan de marketing** ni de **comunicación externa**.
- No prescribe **herramientas de telemetría** específicas. Sólo
  define **qué se mide**.
- No prescribe **cómo se reclasifica** legacy a `LEGACY` (ver
  §8.3 y `ROXANA_DOCUMENT_ARCHITECTURE_v1.md` §2).

---

## 11. Conexión con el resto de Physica

- Los **criterios VS-1 a VS-10** se enumeran en
  `content/physica-vertical-slice_v1.md` §3.
- Las **hipótesis H1–H13** se trazan a pilares específicos y a
  los documentos de autoridad 3.
- Las **decisiones que requieren ratificación** se referencian
  en los documentos donde se originan (con prefijo `PHYS-*-Q-N`).
