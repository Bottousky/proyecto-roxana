---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 18 — riesgos, sólo como insumo; sección 19 — criterio de éxito, reescrito)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../../00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ../gameplay/arithmos-transformation-system_v1.md
  - ../gameplay/arithmos-representation-system_v1.md
  - ../gameplay/arithmos-puzzle-grammar_v1.md
  - ../gameplay/arithmos-mechanics-progression_v1.md
  - ../narrative/arithmos-narrative-bible_v1.md
  - ../content/arithmos-arc-01_v1.md
  - ../content/arithmos-vertical-slice_v1.md
open_questions:
  - A-PE-Q1 — ¿La evaluación se hace con un prototipo digital, un playtest de papel, o ambos? (recomendación: ambos, en ese orden)
  - A-PE-Q2 — ¿Quién firma la promoción de PROPOSED a CANON una vez validado el prototipo? (la respuesta vive en el Canon Policy, pero el ritual concreto se delega a P6)
  - A-PE-Q3 — ¿La telemetría se anonimiza por jugador? Decisión legal/prototipo, no de diseño
  - A-PE-Q4 — ¿Cómo se mide la "diversión" sin métricas arbitrarias (DL-Q2)? Propuesta: triangulación Likert + comportamiento + entrevista corta
  - A-PE-Q5 — ¿Los playtesters ven la Bitácora desde el inicio o se destraba después del beat 8?
---

# ARITHMOS · PROTOTYPE EVALUATION · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.
> Es `authority_level` 4 (diseño de contenido). No es un plan de
> producción (eso es `authority_level` 5); es la **metodología de
> evaluación** que se aplica sobre cualquier prototipo de Arithmos.

> **Relación con el vertical slice.** El vertical slice es el
> **primer prototipo** al que se aplica esta metodología. Esta
> evaluación se reutiliza para prototipos posteriores: Arco I
> completo, Arco II, mastery, etc.

---

## 1. Qué evalúa este documento

Este documento define:

1. Las **preguntas** que un prototipo de Arithmos debe responder.
2. Los **criterios** de éxito/fracaso por pregunta.
3. La **metodología** de evaluación (qué se mide, cómo, con
   quién).
4. Las **decisiones** que un resultado habilita o bloquea.
5. La **cadena de promoción** desde `EXPERIMENTAL` (prototipo)
   hacia `PROPOSED` ratificado o `REJECTED`.

> **Regla dura.** Un prototipo **no** convierte una idea en
> `CANON`. Sólo produce evidencia para una ratificación
> posterior, registrada como ADR.

---

## 2. Preguntas que el prototipo debe responder

Las preguntas se agrupan en cuatro familias: identidad,
jugabilidad, pedagógica y de integración.

### 2.1. Identidad (P01, P03, P09)

- **I-1.** ¿El jugador *siente* que su acción es
  **transformar**, no contestar?
- **I-2.** ¿El verbo nuclear aparece reforzado por al menos
  un cambio de representación en cada beat del prototipo?
- **I-3.** Quitá toda mención a "educativo" del encuadre al
  tester. ¿El prototipo sigue siendo deseable como
  experiencia? (RC C8.)

### 2.2. Jugabilidad (P04, P05, P07, P10, P13)

- **J-1.** ¿El feedback permite al jugador aprender del
  resultado, no sólo saber si acertó? (RC C4.)
- **J-2.** ¿La dificultad proviene del sistema y no de
  opacidad? (RC C6, DL §4.)
- **J-3.** ¿Hay al menos dos secuencias legales distintas
  que llegan a la condición de éxito en cada puzzle?
  (P07, RC O4.)
- **J-4.** ¿La maestría (cuando se ofrece) es opcional y
  accesible? (P13.)
- **J-5.** ¿La restauración del mundo (P08) es observable
  y persistente?

### 2.3. Pedagógica (P01, P02, P06, P14)

- **P-1.** ¿El jugador llega al símbolo, al nombre técnico
  o a la fórmula *después* de haber generado evidencia
  suficiente? (P02, P06.)
- **P-2.** ¿La notación aparece en la Bitácora y no en el
  camino crítico?
- **P-3.** ¿Una nueva operación o variable cambia *qué
  puede hacer el jugador*, no sólo nomenclatura? (P14.)
- **P-4.** ¿Las familias A1–A12 que se introducen tienen
  sus variables de dificultad documentadas y operables?

### 2.4. De integración (P11, P12)

- **IN-1.** ¿La narrativa nunca explica lo que el sistema
  ya muestra? (P11.)
- **IN-2.** ¿El NPC reacciona al resultado, no a la
  intención? (DL §3, orden 4.)
- **IN-3.** ¿La forma del feedback respeta la voz y el
  tono definidos en la bible narrativa?

---

## 3. Criterios de éxito y fracaso

### 3.1. Criterios cualitativos (encuesta + entrevista)

| # | Criterio | Umbral |
|---|---|---|
| CE-1 | "Transformar fue la acción más disfrutada" | ≥ 80% Likert ≥ 4 |
| CE-2 | "Los números se sentían como cosas" | ≥ 80% Likert ≥ 4 |
| CE-3 | "Encontré más de una forma de resolver" | ≥ 60% Likert ≥ 4 |
| CE-4 | "El feedback me dijo *por qué* algo no funcionó" | ≥ 70% Likert ≥ 4 |
| CE-5 | "No sentí que estuviera haciendo ejercicios" | ≥ 70% Likert ≥ 4 |
| CE-6 | "Querría ver más de este mundo" | ≥ 60% Likert ≥ 4 |

### 3.2. Criterios cuantitativos (telemetría)

| # | Métrica | Umbral |
|---|---|---|
| CQ-1 | Tasa de compleción sin ayuda | ≥ 80% |
| CQ-2 | Tiempo medio de compleción (slice) | 12–22 min |
| CQ-3 | Recurrencia de undo | Mediana ≤ 1/beat |
| CQ-4 | Tasa de jugadores que prueban ≥ 2 configuraciones | ≥ 50% |
| CQ-5 | Recurrencia de "fallo geométrico entendido" | ≥ 60% |
| CQ-6 | Recurrencia de apertura de Bitácora post-beat-8 | ≥ 70% |

### 3.3. Criterios de canon (RC C1–C12)

El prototipo debe pasar la Design Review Checklist
(`../../00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`) §2
sin bloqueos. Cualquier "No" en una pregunta crítica devuelve
el prototipo a iteración.

---

## 4. Metodología de evaluación

### 4.1. Fases

1. **Playtest de papel (recomendado, A-PE-Q1).** Un mockup en
   papel o pizarra con los beats del vertical slice. Sirve
   para validar la curva pedagógica y la affordance *antes*
   de invertir en implementación.
2. **Prototipo digital 2.5D.** El vertical slice construido
   en un motor. Sirve para validar la cámara, la affordance
   visual y la respuesta del sistema.
3. **Prototipo extendido.** El Arco I completo en mockup o
   digital. Sirve para validar la curva de mecánicas y el
   cierre de ciclo.
4. **Prototipo de campaign-ready.** La v1 de la campaña,
   antes de producción. Sirve para validar el ritmo, la
   lore y la integración con el Instituto.

### 4.2. Muestra y contexto

- 8–12 testers por fase, salvo que el prototipo demande más.
- Mitad con experiencia en puzzles; mitad sin experiencia.
- Encuadre: "esto es un juego de exploración". Sin
 交待 de "esto es educativo".
- Telemetría: clicks, tiempo, undo, apertura de Bitácora.
- Encuesta Likert 1–5 al final.
- Entrevista corta de 5 minutos.

### 4.3. Lo que la metodología NO hace

- No usa grupos de control sin Arithmos. Compara entre
  fases, no contra "lo que sería un juego normal".
- No convierte métricas en *éxito comercial*. Son señales
  de diseño, no de mercado.
- No se hace sobre la versión final, con assets
  finalizados, antes de tiempo. La evaluación precede a
  la producción.

---

## 5. Decisiones habilitadas por el resultado

### 5.1. Si el prototipo pasa la checklist y los umbrales

- El prototipo se etiqueta como **EXPERIMENTAL** (estado
  del Canon Policy §1). El documento de lore o de mecánica
  asociado sigue en `PROPOSED` hasta ratificación.
- La evidencia (métricas, capturas, entrevista) se archiva
  en una carpeta `evidencia/<slug>/<YYYY-MM-DD>/` accesible
  a la revisión.
- Se abre la puerta a un ADR que proponga ascender el
  contenido asociado a `CANON`. **El ADR lo firma Manuel**,
  no el equipo de prototipo.

### 5.2. Si el prototipo falla la checklist o los umbrales

- El prototipo se etiqueta como **REJECTED** o se devuelve
  a iteración.
- El motivo del fallo se archiva (Canon Policy §4 — canon
  negativo).
- Se itera sobre las preguntas que fallaron.
- Tres devoluciones consecutivas sobre el mismo documento
  lo bajan a `PROPOSED` y exigen reprototipado (RC §4).

---

## 6. Cadena de promoción

```
[Idea] → PROPOSED (v1) → EXPERIMENTAL (prototipo) → CANON (ADR)
            │                │                       ▲
            │                └── (fracaso) → REJECTED ┘
            └── (sin prototipo) → queda PROPOSED hasta validación
```

> **Regla dura.** CANON sólo se asigna por decisión autoral
> explícita + ADR. El prototipo no convierte nada en CANON
> por sí mismo.

---

## 7. Riesgos detectados por la evaluación

Los riesgos se listan en `narrative/arithmos-narrative-bible_v1.md`
y se replican aquí con criterios específicos:

1. **Convertirse en colección de acertijos.** Criterio: si
   en entrevista corta el tester dice "esto es un puzzle
   más", se reabre la curva de operaciones.
2. **Abstracción temprana.** Criterio: si la notación
   aparece antes del beat 8, se reabre la curva pedagógica.
3. **Cuentas disfrazadas.** Criterio: si una operación
   modifica sólo un número en pantalla, se reabre la
   transformación.
4. **Lore demasiado solemne.** Criterio: si la entrevista
   reporta "se siente pesado", se reabre la voz narrativa.
5. **Demasiados subcampos.** Criterio: si la curva C1 no se
   completa en el vertical slice, se reabre la cobertura
   del Arco I.

---

## 8. Plantilla de reporte de evaluación

Cada evaluación produce un reporte con:

- **Identificación.** Nombre del prototipo, fecha, fase.
- **Pregunta(s) bajo evaluación.** Lista de las preguntas
  (§2) que el prototipo pretende responder.
- **Métricas recogidas.** Tabla con los umbrales y los
  resultados.
- **Checklist.** Resultado de la Design Review Checklist.
- **Observaciones cualitativas.** Citas literales de los
  testers.
- **Decisión.** EXPERIMENTAL → CANON (recomendado) /
  REJECTED / iteración.
- **ADR propuesto** (si la decisión es CANON).
- **Próximos pasos.** Lista de los cambios necesarios.

El reporte se anexa al documento que motiva la evaluación y
se archiva en `evidencia/`.

---

## 9. Lo que este documento NO es

- No es un plan de producción. No prescribe herramientas,
  ni pipeline, ni equipo.
- No es un protocolo de QA. El QA vive en su propio
  documento (P5/P6).
- No es una metodología universal. Es la metodología
  **de Arithmos**. Otros mundos pueden tener la suya.
- No convierte el prototipo en una fuente de verdad por
  sí mismo.
- No decide qué se canoniza. Canoniza Manuel, por ADR.

---

## 10. Cierre

La evaluación de prototipo es, junto con la Design Review
Checklist, el **único camino** por el que una idea de Arithmos
puede pasar de `PROPOSED` a `CANON`. Si el prototipo no se
hace, la idea no se canoniza. Si la checklist falla, el
prototipo se devuelve. Si el prototipo pasa, Manuel decide.

La lore de Arithmos es, además, **doblemente condicionada**:
todo lo aquí publicado es `PROPOSED` por la restricción
específica de la sesión P5. Ni siquiera un prototipo
exitoso convierte lore en CANON sin ratificación explícita
de Manuel.
