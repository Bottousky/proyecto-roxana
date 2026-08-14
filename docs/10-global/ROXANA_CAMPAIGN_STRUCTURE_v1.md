---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/ohmdal-ruta-contenidos.md (insumo: la "ruta completa del mundo Ohmdal U1–U9 + Arco de los Autómatas" sobrevive como ruta interna de la Campaña 2; este documento no la reescribe, sólo la sitúa dentro de la estructura global)
  - docs/plan-plataforma-cinco-juegos.md (insumo histórico: la idea de "cinco juegos" se reformula como "cinco campañas independientes" en una sola plataforma; la decisión de producto se difiere a Manuel)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P08, P12, P13, P15)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md
  - docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md
  - docs/10-global/ROXANA_METAPROGRESSION_v1.md
  - docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md
  - docs/10-global/ROXANA_PLAYER_PROFILE_v1.md
  - docs/10-global/ROXANA_GLOBAL_UI_UX_v1.md
  - docs/30-integration/roxana-cross-world-challenges_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/physica/vision/physica-vision_v1.md
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md
open_questions:
  - CS-Q1 — si el Prólogo cuenta como "campaña 1" del five-pack o como pre-campaña común a las cinco
  - CS-Q2 — si el orden del primer arco de cada mundo (Ciclo I) es **fijo** o **flexible parcialmente controlado** (decisión final de Manuel, este doc propone flexible en §3.2)
  - CS-Q3 — si un jugador que se saltea el Prólogo puede empezar por el primer arco de un mundo (decisión de UX, no de este doc)
  - CS-Q4 — si los Proyectos Integradores son **uno por interludio** o se acumulan
  - CS-Q5 — si el cierre del proyecto (último proyecto integrador) ocurre **dentro** de la campaña principal o **después** como epílogo
  - CS-Q6 — si los "retornos al Instituto" dentro de un arco del mundo (no entre arcos) están regulados por este documento o por el GDD de cada mundo
  - CS-Q7 — periodicidad y formato del regreso a un mundo ya visitado (GQ-3; propuesta en `ROXANA_GLOBAL_NARRATIVE_v1.md` §4)

---

# ROXANA — CAMPAIGN STRUCTURE · v1

Documento de autoridad nivel 2. Biblia global. Define la
**estructura de campaña global** que hospeda las **cinco
campañas independientes** (Prólogo + Ohmdal + Physica +
Bitland + Arithmos) y los **elementos transversales**
(interludios, proyectos integradores, ciclos
posteriores).

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Tesis central.** La estructura global **no** es una
> campaña lineal. Es un **árbol con interludios
> transversales** que respeta la autonomía de cada mundo
> y la alternancia del jugador para evitar fatiga de
> género.

> **Las cinco campañas.** El proyecto puede hospedar
> **cinco campañas independientes**: Prólogo, Ohmdal,
> Physica, Bitland, Arithmos. Cada campaña es jugable
> por separado **dentro** de la plataforma; el jugador
> las activa desde el Instituto. La activación de cada
> campaña es **progresiva**: el Prólogo es la entrada; los
> cuatro mundos se desbloquean a medida que el Instituto
> habilita sus aulas.

---

## 1. Tesis

> **La estructura de Roxana es un árbol de campañas con
> interludios. Las cinco campañas son autosuficientes; los
> interludios las conectan sin absorberlas. La
> integración se gana al final, no se impone al inicio.**

Cuatro consecuencias operativas:

- **Las campañas son independientes, no secuenciales.**
  Cada mundo se sostiene solo (P12, P15).
- **Los interludios son transversales.** El Instituto y la
  Bitácora viven en los interludios, no "en paralelo" a
  las campañas.
- **El jugador alterna para evitar fatiga de género.**
  Puede pasar de Ohmdal a Bitland, de Bitland a
  Arithmos, sin esperar a cerrar el ciclo de Ohmdal.
- **La integración se gana, no se fuerza.** Los Proyectos
  Integradores llegan cuando el sistema detecta los
  prerrequisitos (ver
  `roxana-cross-world-challenges_v1.md` §5).

---

## 2. El árbol de campañas

```
         ┌────────────────────────────┐
         │   Prólogo (campaña 1)      │
         │   Instituto · Bitácora ·   │
         │   primer portal            │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Ciclo I — primer arco    │
         │   de cada mundo            │
         │   (orden flexible)         │
         │                            │
         │   ┌─ Ohmdal Arco I         │
         │   ├─ Physica Arco I        │
         │   ├─ Bitland Arco I        │
         │   └─ Arithmos Arco I       │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Interludio I             │
         │   Instituto cambia;        │
         │   Red conceptual crece;    │
         │   primeras conexiones.     │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Ciclo II — segundos      │
         │   arcos; instrumentos más  │
         │   profundos                │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Proyecto Integrador I    │
         │   (Tipo 3 — sistema        │
         │   híbrido)                 │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Ciclos posteriores       │
         │   (crece complejidad       │
         │   e integración)           │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Proyecto Integrador      │
         │   final (Tipo 4)           │
         └────────────────────────────┘
```

> Este árbol es **único** para el proyecto entero. Las
> cinco campañas no son cinco árboles paralelos: son
> **ramas** del mismo árbol.

---

## 3. Las cinco campañas

### 3.1. Campaña 1 — Prólogo (Instituto)

- **Función.** Introducir el Instituto, la Bitácora, el
  primer portal y el primer mundo.
- **Cuándo.** Antes que cualquier otra campaña. Sin
  Prólogo, las cinco campañas **no** se desbloquean.
- **Cómo termina.** El jugador cruza el primer portal y
  despierta en un mundo (hoy: Ohmdal Plaza). El Instituto
  reconoce el primer retorno con una sala transformada.
- **Bitácora del Prólogo.** El Prólogo **siembra** las
  primeras entradas de Bitácora. Las entradas son
  triviales: una página, un registro, una pregunta. Sirven
  para **enseñar el sistema**, no para evaluar.

### 3.2. Campañas 2–5 — los cuatro mundos

Cada mundo es una campaña independiente. La estructura
**interna** de cada campaña vive en su GDD de contenido
(`content/<mundo>-arc-01_v1.md` y siguientes). Lo que
este documento define es la **articulación entre
campañas**, no la estructura interna de cada una.

> **Orden del Ciclo I.** El pack F §11 declara
> "orden flexible parcialmente controlado". Este
> documento propone:

- **El Prólogo dirige al jugador a Ohmdal primero.**
  Ohmdal es el mundo de origen histórico del proyecto
  (ver `docs/diseno-sintesis-v1.md` §1, §11; ver también
  `docs/ohmdal-biblia/`). El portal físico del Prólogo
  es el aula de Electrónica, no otra aula.
- **Tras el primer arco de Ohmdal, el jugador elige.**
  El Instituto abre las cuatro aulas. El jugador puede
  entrar a Physica, Bitland o Arithmos **sin cerrar**
  Ohmdal.
- **El sistema no obliga a un orden.** El jugador puede
  incluso **no** jugar un mundo durante mucho tiempo, sin
  que el Instituto lo penalice. El gating se aplica
  sólo a los Proyectos Integradores (ver
  `roxana-cross-world-challenges_v1.md` §5).

> La decisión de **orden por defecto** del Ciclo I (¿el
> jugador va primero a Physica, Bitland o Arithmos
> después de Ohmdal?) es **decisión de Manuel**. Este
> documento propone: el **sistema** no fija un orden;
  deja al jugador elegir. **El Prólogo fija a Ohmdal
  como el primer mundo tocado**, no como el único
  primero.

### 3.3. Cuándo una campaña se considera "completa"

Una campaña se considera **completa** cuando el
**último arco de su plan de contenido** (decidido por
su GDD de contenido) se cerró. Esa decisión es
**interna al mundo** y no se define aquí. Lo que este
documento define es **qué pasa en la estructura
global** cuando una campaña se completa:

- El Instituto reconoce la campaña como restaurada
  (ver `ROXANA_INSTITUTE_BIBLE_v1.md` §3.5).
- La Bitácora del jugador entra en **consolidación**:
  las entradas de esa campaña pasan al archivo del
  Instituto con su marca de campaña.
- Se habilitan los Proyectos Integradores que la
  requieren como prerequisito (ver
  `roxana-cross-world-challenges_v1.md` §5).

---

## 4. Interludios (transversales)

Los interludios son **momentos del Instituto**. No son
campañas, no son arcos de un mundo: son **tiempos del
hogar** donde el Instituto y la Bitácora se consolidan.

### 4.1. Interludio I

- **Cuándo.** Cuando el jugador cerró el primer arco de
  **al menos un mundo** y volvió al Instituto. No se
  exige haber cerrado los cuatro.
- **Qué pasa.** El Instituto abre nuevas salas (un
  taller, una sala de estar, un primer mecanismo). La
  Red conceptual de la Bitácora empieza a mostrar
  conexiones entre entradas de distintos mundos. La
  pregunta 4 de `ROXANA_GLOBAL_NARRATIVE_v1.md` se
  sostiene.

### 4.2. Interludios II, III, …

- **Cuándo.** Tras cada cierre de arco importante.
- **Qué pasa.** El Instituto sigue transformándose. La
  Red conceptual se expande. Los Proyectos Integradores
  de Tipo 3 empiezan a estar disponibles.

> Los interludios **no** son cinemáticas largas. Son
> **transformaciones observables** del Instituto, en el
> espíritu de P08.

---

## 5. Proyectos Integradores (transversales)

Los Proyectos Integradores son **desafíos
interdisciplinarios** de Tipo 3 o Tipo 4 (ver
`roxana-cross-world-challenges_v1.md` §3.1). No son
"exámenes finales": son sistemas que el jugador
**construye**.

- **Proyecto Integrador I** (Tipo 3). Primer sistema
  híbrido. Aparece tras el Interludio I. Ejemplo:
  ascensor (ver `roxana-cross-world-challenges_v1.md`
  §4.1).
- **Proyectos Integradores II, III, …** (Tipo 3 o 4).
  Crecen en complejidad y en número de verbos.
- **Proyecto Integrador final** (Tipo 4). El proyecto
  requiere los cuatro verbos. **No** es el cierre
  narrativo del proyecto: es un **hito material** dentro
  de la campaña. La pregunta 7 de la narrativa global
  queda abierta.

> **Regla.** Un Proyecto Integrador **no** se juega
> hasta que el sistema detecta los prerrequisitos
> (`roxana-cross-world-challenges_v1.md` §5). El gating
> es sistémico, no narrativo.

---

## 6. Ciclos posteriores (más allá del Proyecto Integrador
final)

Tras el Proyecto Integrador final, el proyecto sigue
abierto. La estructura puede crecer en dos direcciones
(definidas en ADRs posteriores, no en este documento):

- **Ciclos verticales.** Nuevos arcos de los cuatro
  mundos, más profundos, con instrumentos ganados.
- **Ciclos transversales.** Nuevos Proyectos Integradores
  con combinaciones nuevas, o tipos de cruce
  intermedios.

> **No** se cierra la campaña. La estructura se
> mantiene como árbol abierto.

---

## 7. Regla de alternancia (anti-fatiga de género)

> **El jugador puede alternar entre campañas durante
> cualquier ciclo. El sistema no penaliza la
> alternancia, no obliga a cerrar un mundo para entrar a
> otro, y no acumula bonos por velocidad.**

### 7.1. Lo que la alternancia permite

- Entrar y salir de un mundo sin penalización.
- Cambiar de mundo en cualquier interludio.
- Tener entradas de Bitácora en varios mundos en estado
  `OBSERVED` simultáneamente.
- Retomar un mundo meses después.

### 7.2. Lo que la alternancia NO permite

- Jugar un Proyecto Integrador sin los prerrequisitos.
- Usar el inventario de un mundo en otro.
- Adelantar la Bitácora: la regla temporal (P02, P06)
  sigue aplicando.

---

## 8. Compatibilidad con la implementación actual

> Esta sección es **referencia**, no autoridad. La
> estructura global no obliga al runtime a cambiar
> nada.

Estado actual de la implementación:

- El **Prólogo** se juega hoy en el hub 2D de
  `EscuelaHubScene.ts` (greybox) y en el hub 3D de
  `src/landing/school3d.ts`.
- El **primer arco de Ohmdal** está implementado y es
  jugable: ver `src/jugar/` y el GDD de Ohmdal en
  `docs/20-worlds/ohmdal/`.
- El **primer hito de Physica** está en desarrollo (ver
  `docs/physica/spec-vertical-slice.md`). El resto de
  Physica, Bitland y Arithmos no tiene aún
  implementación de campaña; viven como GDD.

> La estructura de cinco campañas es **compatible** con
> la implementación actual: el Prólogo y la Campaña 2
> (Ohmdal) son jugables hoy; las campañas 3–5
> (Physica, Bitland, Arithmos) entran cuando sus
> respectivos vertical slices estén listos.

---

## 9. Lo que este documento NO es

- No es un GDD de campañas individuales. La estructura
  interna de cada campaña vive en su `content/<mundo>-arc-XX_vN.md`.
- No es un plan de producción. La calendarización de
  arcos y Proyectos Integradores se hace en el
  `ROADMAP.md` y en el plan de producción
  correspondiente, fuera del alcance de P6.
- No prescribe cámara, motor ni pipeline.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
- No es canon: es `PROPOSED` hasta ratificación.
