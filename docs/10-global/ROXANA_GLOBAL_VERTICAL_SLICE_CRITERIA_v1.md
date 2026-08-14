---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/diseno-sintesis-v1.md (sección 11 — vertical slice del Prólogo + Unidad 1 de Ohmdal: este documento eleva la **estrategia** de vertical slice a nivel global; el detalle de la unidad 1 sigue en `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md` y `docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`)
  - docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md (insumo: los 8 beats VS01–VS08 del vertical slice de Ohmdal son **un** vertical slice de mundo; este documento define el vertical slice **global** que lo cruza con la Bitácora, el Instituto, la metaprogresión y al menos un cruce interdisciplinario)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P01, P02, P05, P08, P09, P11, P12, P13, P15)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md (las 12 preguntas críticas)
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md
  - docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md
  - docs/10-global/ROXANA_METAPROGRESSION_v1.md
  - docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md
  - docs/10-global/ROXANA_PLAYER_PROFILE_v1.md
  - docs/10-global/ROXANA_GLOBAL_UI_UX_v1.md
  - docs/10-global/ROXANA_CAMPAIGN_STRUCTURE_v1.md
  - docs/30-integration/roxana-cross-world-challenges_v1.md
  - docs/30-integration/roxana-content-authority-map_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/physica/vision/physica-vision_v1.md
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md
open_questions:
  - VS-Q1 — si el vertical slice global puede lograrse **sin** implementar Physica/Bitland/Arithmos como campañas jugables, dejando su presencia como **lectura cruzada** (instrumentos que cruzan) en lugar de campañas
  - VS-Q2 — si la duración del vertical slice global es 25–35 min (como el legacy) o 45–60 min para incluir un mini-Proyecto Integrador
  - VS-Q3 — si el primer ciclo del vertical slice global debe jugarse en **un solo día de playtest** o en dos
  - VS-Q4 — si el vertical slice global es también un vertical slice **bilingüe** o sólo en español neutro
  - VS-Q5 — si el personaje de prueba del vertical slice global es el protagonista del Prólogo o un avatar de prueba
  - VS-Q6 — si las métricas de éxito se miden en playtest cerrado (10 personas) o abierto (métricas agregadas)

---

# ROXANA — GLOBAL VERTICAL SLICE CRITERIA · v1

Documento de autoridad nivel 2. Biblia global. Define los
**criterios** que un **vertical slice global** (es decir,
un slice que cruza el Instituto, la Bitácora, la
metaprogresión, al menos dos mundos y un cruce
interdisciplinario) debe cumplir para considerarse
**válido** y útil para ratificar las decisiones de la
sesión P6.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Tesis.** Un vertical slice que **no cruza** el
> Instituto, la Bitácora, la metaprogresión y al menos
> dos mundos **no** es un vertical slice global: es un
> vertical slice de mundo. Esta es la diferencia que
> justifica la existencia de este documento.

> **Relación con vertical slices de mundo.** Cada mundo
> tiene su propio vertical slice (ver
> `docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`
> y los archivos análogos en physica/bitland/arithmos).
> Esos slices prueban el **verbo nuclear** del mundo. El
> vertical slice **global** prueba la **integración**:
> el Instituto, la Bitácora, la metaprogresión, los
> cruces y la estructura de campañas.

---

## 1. Lo que el vertical slice global debe demostrar

Un vertical slice global **válido** debe demostrar, como
mínimo, **siete** capacidades observables. Si una sola
falta, el slice **no** cuenta como global: cuenta como
un slice de mundo.

| # | Capacidad | Cómo se demuestra | Criterio de éxito |
|---|---|---|---|
| 1 | **El Instituto es un espacio jugable** | El jugador camina por el hall, abre el aula de Electrónica, lee el pizarrón, vuelve al hall, encuentra una sala transformada. | El jugador distingue el Instituto de un menú en menos de 3 minutos de juego. |
| 2 | **La Bitácora es un sistema, no un codex** | El jugador genera al menos una entrada de Bitácora que pasa por los estados `OBSERVED` → `HYPOTHESIZED` → `FORMALIZED`. | El jugador **no** ve el nombre técnico de la Ley de Ohm antes de haber interactuado con la Puerta (P02, P06). |
| 3 | **La metaprogresión no es XP** | El jugador completa el primer ciclo de al menos un mundo. El Instituto muestra una transformación observable (sala, mecanismo, pizarrón). La Bitácora muestra entradas con sus seis estados. | El jugador **no** encuentra un contador numérico de progreso en ningún punto. |
| 4 | **Cruce interdisciplinario es un desafío, no un nivel compartido** | El jugador resuelve un desafío Tipo 2 o Tipo 3 (ver `roxana-cross-world-challenges_v1.md` §3.1). El desafío produce un mecanismo híbrido en el Instituto. | El jugador **no** viaja con inventario entre mundos; lo que cruza es la lectura. |
| 5 | **La estructura de campaña permite alternar** | El jugador, tras cerrar el primer arco de un mundo, puede elegir entrar a otro mundo sin cerrar el primero. | El sistema **no** fuerza un orden lineal entre campañas. |
| 6 | **La pregunta global se sostiene** | El jugador encuentra al menos un indicio del hilo del Instituto y al menos un indicio de la pregunta 4 (creó / descubrió / modificó). | El jugador **no** recibe una respuesta cerrada a las preguntas globales. |
| 7 | **El slice pasa el `ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`** | Las 12 preguntas críticas reciben respuesta "Sí" o "No aplica", y **cero** "No" en bloqueantes. | El slice puede pasar a playtest abierto. |

> **Ochoava capacidad opcional.** Si el vertical slice
> global incluye el Prólogo completo + dos ciclos cortos
> + un Proyecto Integrador mínimo, también valida la
> **curva de interludio** (ver
> `ROXANA_CAMPAIGN_STRUCTURE_v1.md` §4). Esta capacidad
> no es obligatoria, pero eleva la confianza del slice.

---

## 2. Lo que el vertical slice global NO necesita incluir

Para que el vertical slice global no se convierta en un
proyecto entero, este documento **limita** su alcance.
El slice global **no** necesita:

- Implementar las cinco campañas por completo.
- Incluir los cuatro mundos como campañas jugables
  (ver `VS-Q1`: el slice puede cruzar mundos como
  **lectura**, no como campaña).
- Cerrar interludios.
- Lograr un Proyecto Integrador Tipo 4 (eso es
  producto final, no slice).
- Demostrar exportación a PDF/web del perfil (ver
  `ROXANA_PLAYER_PROFILE_v1.md` §6 — decisión de
  producto, no de sistema).
- Validar la accesibilidad avanzada (los compromisos
  mínimos de `ROXANA_GLOBAL_UI_UX_v1.md` §2.4 sí
  deben estar).

---

## 3. Arquitectura de referencia (un ejemplo, no la receta)

> Esta sección es **una posibilidad**, no la única. El
> vertical slice global concreto se decide por Manuel
> en una decisión de producto, fuera del alcance de P6.

### 3.1. Forma mínima (~25 min de juego)

- **Prólogo.** 5 min. Instituto, primer portal.
- **Arco I de Ohmdal.** 12 min. Plaza, taller, Puerta
  de Ohm (ver `docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`).
- **Retorno al Instituto.** 2 min. Sala transformada,
  pizarrón actualizado.
- **Cruce interdisciplinario Tipo 2.** 6 min. Un
  instrumento de Ohmdal **agrega una lectura** a un
  puzzle de Physica (sólo el primer capítulo del
  vertical slice de Physica, no la campaña completa).

> Esta forma cumple las 7 capacidades de §1.

### 3.2. Forma extendida (~45 min de juego)

- **Prólogo.** 5 min.
- **Arco I de Ohmdal.** 15 min.
- **Primer capítulo de Physica.** 12 min.
- **Retorno al Instituto + interludio corto.** 3 min.
- **Cruce interdisciplinario Tipo 3.** 10 min. Sistema
  híbrido que requiere CONECTAR + EXPERIMENTAR (ejemplo:
  un motor con contrapeso, ver
  `roxana-cross-world-challenges_v1.md` §4.1).

> Esta forma añade la **octava capacidad opcional** de
> §1 (curva de interludio).

### 3.3. Lo que el slice global **no** debe hacer

- **No** debe cerrar la narrativa global. La pregunta 4
  sigue abierta.
- **No** debe promover lore de Bitland o Arithmos a CANON.
- **No** debe usar XP como motivación.
- **No** debe exigir un Proyecto Integrador Tipo 4
  (queda fuera del alcance del slice).
- **No** debe "rellenar" interludios con cinemáticas
  largas.

---

## 4. Criterios de éxito cuantitativos (referencia)

> Esta sección declara **umbrales** sugeridos. La
> decisión final de los umbrales se hace en el plan de
> playtest, fuera del alcance de P6.

| Métrica | Umbral sugerido | Fuente del umbral |
|---|---|---|
| Jugadores que completan el slice sin ayuda externa | ≥ 7 / 10 | Heredado de `diseno-sintesis-v1.md` §11 (criterio Ohmdal) |
| Jugadores que pueden enunciar la relación V-I-R con sus palabras al cierre | ≥ 7 / 10 | Heredado de `diseno-sintesis-v1.md` §11 |
| Jugadores que vuelven voluntariamente a la Bitácora tras cerrarla | ≥ 50 % | Heredado de `diseno-sintesis-v1.md` §11 |
| Jugadores que identifican el Instituto como espacio, no como menú | ≥ 8 / 10 | Nuevo para P6 |
| Jugadores que distinguen el slice como un sistema integrado, no como varios minijuegos | ≥ 7 / 10 | Nuevo para P6 |
| Jugadores que pueden nombrar **un** indicio de la pregunta 4 | ≥ 5 / 10 | Nuevo para P6 |

> El plan de playtest define la forma del reclutamiento
> y el protocolo de medición. Este documento no
> prescribe esa forma.

---

## 5. Revisión del slice antes de playtest

Antes de pasar a playtest, el slice pasa el
`ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`. Aplicación
operativa para un slice global:

- **C1.** El slice refuerza la fantasía del **proyecto
  integrado** (P15), no la de un solo mundo.
- **C2.** Cada mundo incluido en el slice refuerza su
  verbo nuclear **sin** invadir al otro.
- **C3.** El jugador **actúa** sobre el concepto en
  cada paso (no lee respuestas).
- **C4.** El feedback responde las tres preguntas de
  DL §6: qué hizo, qué cambió, qué queda disponible.
- **C5.** La formalización aparece **después** de
  evidencia suficiente.
- **C6.** La dificultad proviene del sistema, no de
  opacidad.
- **C7.** La recompensa dominante es de tipo 1–4 (DL §2).
- **C8.** El slice es deseable sin mencionar "educativo".
- **C9.** El slice respeta el canon de mayor
  `authority_level` (Pillars + Design Language + Canon
  Policy).
- **C10.** El slice es implementable y testeable como
  unidad.
- **C11.** El slice declara qué hipótesis de diseño
  valida (ver §6).
- **C12.** El slice no introduce lore innecesario.

> **Cualquier "No" en C1–C12 bloquea el playtest.**

---

## 6. Hipótesis de diseño que el slice global debe validar

> El slice **declara** las hipótesis que valida. Sin
> hipótesis nombrada, no hay forma de saber si el slice
> cumple o no (C11 de la checklist).

| # | Hipótesis | Cómo se valida |
|---|---|---|
| H1 | El Instituto se siente como **hogar** y como **espacio** cuando se transforma materialmente con el progreso. | Playtest: el jugador distingue el Instituto de un menú y vuelve a él voluntariamente. |
| H2 | La Bitácora **se siente** como registro, no como codex, cuando se respeta la regla temporal. | Playtest: el jugador no ve spoiler técnico antes de tiempo. |
| H3 | La metaprogresión **funciona** sin XP cuando se observan las 7 dimensiones. | Playtest: el jugador no busca "el contador". |
| H4 | Un cruce interdisciplinario Tipo 2 o 3 se siente como **sistema**, no como nivel compartido. | Playtest: el jugador arma el sistema completo. |
| H5 | La estructura de campañas permite alternar sin fatiga. | Playtest: el jugador pasa de un mundo a otro sin resistencia. |
| H6 | La pregunta global se sostiene sin convertirse en cliffhanger. | Playtest: el jugador sale con la pregunta viva, no con la respuesta concedida. |
| H7 | El slice pasa la `ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`. | Revisión humana. |

---

## 7. Riesgos del slice global (y mitigaciones)

| Riesgo | Mitigación |
|---|---|
| El slice global se vuelve **proyecto entero** por scope creep. | §2 limita explícitamente lo que el slice no necesita. |
| El slice global **canibaliza** la identidad de un mundo. | C2 de la checklist + los 3 filtros de `roxana-cross-world-challenges_v1.md` §3. |
| El slice global **adelanta** la Bitácora. | C5 de la checklist + la regla temporal de la Bitácora. |
| El slice global **mide** algo que el sistema no entrega. | Las hipótesis de §6 son observables, no auto-reportadas. |
| El slice global **no** incluye a Bitland/Arithmos y la integración se siente incompleta. | §3.1 admite cruce Tipo 2 sin campaña completa; la forma extendida §3.2 admite Tipo 3 con dos campañas. |

---

## 8. Lo que este documento NO es

- No es un plan de playtest. El plan de playtest se
  hace fuera del alcance de P6.
- No es un GDD del vertical slice concreto. Sólo
  define criterios.
- No prescribe motor, framework ni pipeline.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
- No es canon: es `PROPOSED` hasta ratificación.
