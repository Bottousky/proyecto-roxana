---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 10 — Vertical slice reboot, en lo que redefine el vs. de 15-20 min a 20-30 min y reorganiza la secuencia)
  - docs/physica/spec-vertical-slice.md (en lo que se eleva a autoridad 4; el contenido de la spec se preserva como contrato de voz y como guía técnica)
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
  - ./physica-arc-01_v1.md
open_questions:
  - PHYS-VS-1 — ¿El vs. cierra dentro de E2-E5 (sin E7), o llega hasta la Estación cinética del cap. 5? Implicación de tiempo de juego (20-30 min) y de scope.
  - PHYS-VS-2 — ¿El vs. incluye el INSTRUMENTO desde el cap. 3, o se prueba primero sin INSTRUMENTO y se añade en una segunda iteración?
  - PHYS-VS-3 — ¿El vs. mide "el jugador experimenta espontáneamente" (pregunta 4 del pack) con telemetría, con observación humana, o con entrevista? Decisión de método.
  - PHYS-VS-4 — ¿El vs. se prueba con jugadores que ya conocen Ohmdal (contexto cruzado) o con jugadores nuevos? Implicación sobre el efecto Instituto.
  - PHYS-VS-5 — ¿La cascada ascendente del Hito 1 entra **tal cual** en el vs., o se rehace con la frontera visible de espuma-remolino de PIS §4.1?
---

# PHYSICA — VERTICAL SLICE · v1

Este documento define el **Vertical Slice** (vs.) de Physica: el
subconjunto jugable de 20–30 minutos que se usa para **validar la
identidad del mundo** y para **cerrar preguntas de prototipo** antes
de ampliar el alcance. No es un nivel demo: es una **prueba de
premisa** (Pack P3 §14).

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Alcance.** Cubre el vs. del **Arco I**, no de Physica completa.
> El vs. **no** es un nivel demo: es un experimento controlado
> con criterios de éxito explícitos.

---

## 1. Objetivo del vs.

> **Validar que un jugador puede divertirse, anticipar, fallar con
> información y aprender a usar el cuerpo como instrumento de
> lectura, sin que aparezca ningún símbolo, número o fórmula antes
> de tiempo.**

El vs. **demuestra** que la identidad de Physica es jugable. Si el
vs. falla, el diseño del mundo falla y debe revisarse **antes** de
ampliar el alcance.

---

## 2. Duración y secuencia

### 2.1 Duración

- **20–30 minutos** de juego continuo, con uno o dos descansos
  opcionales.
- Tiempo de setup no incluido (instalación, calibración, briefing
  inicial).
- Tiempo de debriefing sí incluido (entrevista corta, ~5 min).

### 2.2 Secuencia de beats

La secuencia del pack P3 §14 reorganiza los 10 beats en una
**escalera de revelaciones**, donde cada beat demuestra una
pregunta diferente.

| Beat | Minuto aprox. | Qué pasa | Pregunta que valida |
|---|---|---|---|
| 1 | 0–2 | Llegada a la cornisa. Cascada ascendente visible. Avatar puede caminar, saltar, caer. | ¿La locomoción es excelente **sin** puzzles? (P09) |
| 2 | 2–4 | Movimiento libre. El jugador experimenta caminar por la cornisa, saltar, ver la escala. | ¿La escala monumental se lee? |
| 3 | 4–6 | Primer obstáculo: una **plataforma móvil** que se aleja del avatar. Solución: timing, no fórmula. | ¿El timing se siente como **predicción**, no como arcade? |
| 4 | 6–8 | **Objeto interactivo**: piedra. El jugador la recoge y la tira. La piedra cae con `gA` normal; el agua sigue subiendo. | ¿La anomalía se ve antes de leerse? |
| 5 | 8–11 | **Primer experimento A/B**: dos piedras con la misma velocidad inicial pero desde dos puntos. Las trayectorias son distintas. | ¿El jugador **compara** espontáneamente, o necesita que se lo pidan? |
| 6 | 11–13 | **Reloj gana una medición simple**: cronómetro. El jugador mide el tiempo entre dos piedras. | ¿El instrumento **gana** valor o **resuelve** el puzzle? |
| 7 | 13–16 | **Puzzle que requiere predicción**: una pieza frágil debe cruzar una grieta. El jugador predice la trayectoria antes de lanzar. | ¿La predicción se siente como **compresión del asombro**? |
| 8 | 16–20 | **Puzzle integrador con dos soluciones**: la pieza frágil debe llegar a una cornisa. Solución A: rampa + contrapeso. Solución B: anclar plataforma + transportar. | ¿Ambas soluciones se sienten **válidas y razonables**? (P07) |
| 9 | 20–24 | **Restauración parcial del lugar**: la cascada se estabiliza (delimitación), pero una nueva roca comienza a flotar. | ¿La consecuencia no deseada **abre** el siguiente arco sin frustrar? (P08) |
| 10 | 24–28 | **Bitácora formaliza**: aparece la **capa formal** de la Bitácora con terminología técnica (masa, fuerza, fricción, vector). | ¿La formalización **llega en el momento correcto**? (P02) |

> **Nota.** El beat 1 y el beat 4 reusan el Hito 1 (Escena 2). El
> vs. **no** rehace la cascada; la **extiende** con frontera
> visible y con el módulo de observación del reloj.

### 2.3 Lo que el vs. **no** incluye

- E3–E7 completas (sólo el subconjunto equivalente en beats 3, 7
  y 8).
- E8 Metrópoli.
- Los arcos II–V.
- NPCs del Instituto presenciales.
- El Aula de Física como punto de entrada (la integración es de
  P6).

---

## 3. Criterios de éxito

El vs. se considera **aprobado** cuando **se cumplen todas** las
siguientes condiciones (sí / no). Cualquier "no" es un **bloqueo**
que obliga a revisar el diseño antes de seguir.

| # | Criterio | Métrica observable |
|---|---|---|
| VS-1 | La locomoción es **divertida sin puzzles**. | El jugador camina, salta, cae durante al menos 1 min sin dirección de puzzle. |
| VS-2 | La física es **consistente**. | La piedra cae con `gA` normal **siempre**; el agua sube con `gLocal` **siempre**; no hay glitches observables. |
| VS-3 | El fallo **produce información**. | Cuando el jugador falla, el sistema muestra **qué hizo**, no "incorrecto". El jugador puede reintentar **sin castigo** (P05). |
| VS-4 | El jugador **experimenta espontáneamente**. | Sin instrucción, el jugador varía al menos una variable (masa, ángulo, punto de partida) y observa el resultado. |
| VS-5 | Los instrumentos **potencian, no resuelven**. | El reloj nunca entrega la respuesta; **muestra** datos. El jugador decide. |
| VS-6 | La formalización **llega en el momento correcto**. | Los términos técnicos (masa, fuerza, vector) **no** aparecen antes de beat 10. |
| VS-7 | Hay **≥2 soluciones** en el puzzle integrador. | El sistema valida por **condición**, no por ruta. Ambas soluciones son físicamente razonables. |
| VS-8 | La consecuencia no deseada **abre** el siguiente arco. | El jugador no se frustra con la roca que flota; siente curiosidad. |
| VS-9 | La duración está en el rango 20–30 min. | Tiempo medido desde "Entrar" hasta el cierre del beat 10. |
| VS-10 | El vs. es jugable por un jugador **sin contexto educativo**. | El jugador describe el vs. como "juego de física", no como "lección de física". |

> **Regla.** Si **dos o más** criterios fallan, el vs. **no
> aprueba** y se vuelve a prototipo. Si **uno** falla, se
> discute caso a caso y se decide por ADR.

---

## 4. Preguntas de prototipo (cerradas)

Estas preguntas son las que el vs. **debe** cerrar. Si alguna
queda abierta tras el vs., el vs. **no aprueba** (Pack P3 §14).

### Q1 — ¿Moverse es divertido?
- **Cierre.** El jugador pasa tiempo caminando sin objetivo. El
  beat 1 (movimiento libre 2–4 min) cierra esta pregunta.
- **Indicador positivo.** El jugador se mueve lateralmente
  incluso cuando no hay plataforma que alcanzar.
- **Indicador negativo.** El jugador se queda quieto o busca un
  objetivo inmediato.

### Q2 — ¿La física es consistente?
- **Cierre.** El jugador **no** reporta glitches. La piedra cae
  siempre con `gA`; el agua sube siempre con `gLocal`.
- **Indicador positivo.** El jugador reusa las observaciones en
  puzzles siguientes sin pedir re-explicación.
- **Indicador negativo.** El jugador se sorprende por un
  comportamiento físico no anticipado.

### Q3 — ¿El fallo enseña?
- **Cierre.** El jugador modifica su siguiente intento a partir
  del fallo anterior.
- **Indicador positivo.** El jugador dice "entonces, si…" o
  cambia un parámetro (masa, ángulo) tras fallar.
- **Indicador negativo.** El jugador repite el mismo intento
  idéntico, o reinicia sin diagnóstico.

### Q4 — ¿El jugador experimenta espontáneamente?
- **Cierre.** El jugador varía al menos una variable sin
  instrucción.
- **Indicador positivo.** El jugador lanza piedras con ángulos
  distintos, prueba distintos puntos de partida, o cambia la
  masa del cuerpo.
- **Indicador negativo.** El jugador espera un menú de
  instrucciones o un diálogo.

### Q5 — ¿Los instrumentos potencian en vez de resolver?
- **Cierre.** El reloj es **opcional**; el jugador puede jugar
  el vs. sin él. El reloj **no** muestra la solución.
- **Indicador positivo.** El jugador activa el reloj cuando
  quiere **verificar**, no cuando lo necesita para avanzar.
- **Indicador negativo.** El reloj se vuelve **necesario** para
  resolver un puzzle del vs.

### Q6 — ¿La formalización llega en el momento correcto?
- **Cierre.** Los términos técnicos **no** aparecen antes del
  beat 10.
- **Indicador positivo.** El jugador ve la Bitácora formal como
  **registro**, no como "lección".
- **Indicador negativo.** El jugador siente que la Bitácora
  formal "le está enseñando".

### Q7 — ¿La consecuencia no deseada abre el siguiente arco?
- **Cierre.** El jugador termina el vs. con **curiosidad**, no
  con frustración.
- **Indicador positivo.** El jugador pregunta "¿qué pasó con
  esa roca?".
- **Indicador negativo.** El jugador siente que "el juego se
  rompió".

---

## 5. Riesgos del vs. (los que pueden invalidarlo)

| # | Riesgo | Mitigación |
|---|---|---|
| R-1 | La locomoción se siente pesada y los jugadores caminan poco. | Pruebas internas tempranas (smoke test de movimiento) **antes** de la prueba externa. |
| R-2 | La cascada ascendente **domina** la atención y los jugadores no exploran. | El vs. mide exploración; si >80% de los jugadores no exploran, se rediseña el encuadre de cámara. |
| R-3 | El reloj se vuelve **necesario** y rompe la autonomía. | Si el reloj es necesario en algún beat, ese beat se rediseña (PIS §7.2). |
| R-4 | La formalización del beat 10 **se siente** como lección. | La capa formal se entrega como **entrada de Bitácora**, no como popup. |
| R-5 | El puzzle integrador no admite dos soluciones **legibles**. | Si sólo una solución pasa la validación, se reabre el puzzle y se fuerza la segunda (P07). |
| R-6 | El jugador nuevo no entiende qué hacer. | El vs. **no** requiere un tutorial. Si requiere uno, el diseño falla P09 y debe re-abrirse. |

---

## 6. Materiales del vs.

- **Build jugable.** Una build de Babylon.js con el subconjunto
  especificado. Los assets existentes del Hito 1 (cascada, lago,
  piedras) entran sin reescritura.
- **Briefing del probador.** Una hoja de una página con: "Estás
  en un lugar extraño. No hay instrucciones. Cuando termines,
  hablaremos."
- **Cuestionario post-vs.** Preguntas abiertas, no multiple
  choice. "¿Cómo describirías este juego a un amigo?" / "¿Qué
  fue lo más confuso?" / "¿Qué fue lo más satisfactorio?".
- **Telemetría opcional.** Si el equipo tiene capacidad, registrar
  trayectorias, tiempos, número de resets, número de cambios de
  variable espontáneos. La telemetría **no** sustituye a la
  observación humana.

---

## 7. Decisiones de v1 que el vs. valida o revierte

| Decisión | Lo que el vs. valida | Si falla |
|---|---|---|
| Eje lateral 2.5D curado. | El jugador se mueve con naturalidad. | Cambiar a cenital o 3D libre. |
| Cascada ascendente como anomalía de apertura. | El jugador **ve** la anomalía antes del primer puzzle. | Cambiar la anomalía de apertura. |
| INSTRUMENTO entra en el cap. 3, **no** antes. | El jugador no se siente "explicado" antes de tiempo. | Mover la entrada o cambiar el rol del INSTRUMENTO. |
| Reloj entra como **observación pasiva** en el cap. 0. | El instrumento no se vuelve necesario. | Cambiar el módulo a uno más pasivo o retrasarlo. |
| Cap. 5 entrega Bitácora **formal**. | El jugador siente la formalización como **registro**, no como lección. | Cambiar la entrega (moverla a un arco posterior, dividirla). |
| F8 sin variación de `mA` del avatar (masa aparente fija). | El jugador lee la masa por **comparación** con cuerpos externos. | Habilitar variación de `mA` ya en el Arco I. |

---

## 8. Lo que el vs. **no** demuestra

> **Importante.** El vs. **no** demuestra todo. Demuestra lo
> que la **DoD de P3** exige, y nada más. Las siguientes
> preguntas **no** se cierran con el vs. y se reservan a
> arcos futuros:

- La mecánica de **resonancia** (F11, capa C6). No entra en el
  Arco I.
- La mecánica de **óptica** (F12, capa C7). No entra en el
  Arco I.
- La integración con el **Instituto** (Aula de Física, portal,
  metagame). Es de P6.
- La curva de los **arcos II–V**. Esta sesión no la compromete.
- La **Metrópoli** jugable. Está reservada a un arco o
  expansión futura.

> **Cerrar estas preguntas con el vs. sería expandir el alcance
> y romper la DoD** (Pack P3 §15: "Si una idea de la legacy
> contradice un pilar de Roxana, reclasifícala a LEGACY en el
> supersedes").

---

## 9. Cierre del vs.

El vs. se considera **cerrado** cuando:

1. Se ha jugado con **al menos 5 probadores** externos (no
   equipo).
2. **≥4 de 5** aprueban todos los criterios VS-1 a VS-10.
3. Las preguntas Q1–Q7 están **todas cerradas**.
4. El ADR de promoción del vs. (a `EXPERIMENTAL` con prototipo
   nombrado) está **registrado** según
   `ROXANA_CANON_POLICY_v1.md` §1.
5. El siguiente paso (continuar a la spec del Arco I completo
   o iterar) está **explícitamente decidido** por Manuel.

---

## 10. Lo que este documento NO es

- No es un **nivel demo público**. Es una prueba interna
  controlada.
- No es un **plan de QA**. El QA vive en P6 y en
  `production/`.
- No prescribe **qué motor, framework ni pipeline** se usa.
- No prescribe **qué assets** se producen. Eso vive en spec
  de hito.

---

## 11. Conexión con el resto de Physica

- Los **beats** derivan de los **capítulos del Arco I** en
  `content/physica-arc-01_v1.md`.
- Las **preguntas** se conectan con la **evaluación de
  prototipo** en
  `production/physica-prototype-evaluation_v1.md`.
- El **texto del juego** del vs. (INSTRUMENTO, Voz Docente,
  Bitácora) sigue siendo el contrato del **guion v0.2**.
