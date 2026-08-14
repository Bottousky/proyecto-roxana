# Sesiones de diseño — Proyecto Roxana · v1

**Orden de ejecución:** A → B → C → D → E → F
**Fase:** configuración · **Estado:** ningún chat lanzado todavía

Este índice es el **mapa de arranque** para abrir un chat de diseño dentro del proyecto.
Cada sesión produce sus propios documentos de autoridad; este archivo solo evita que un agente
reinvente las reglas básicas o que la lore se expanda sin control.

> **Regla dura:** una sesión sólo se considera terminada cuando cumple su
> *Definition of Done*. No porque el documento quedó largo, ni porque se
> escribieron más arcos. Eso evita que el modelo siga agregando lore para
> siempre.

---

## Cómo se usan estos archivos

| Si querés… | Andá a… |
|---|---|
| Entender el plan global y por qué importa el orden | `00_MASTER_PLAN.md` |
| Abrir el chat de la Constitución y empezar | `A_ROXANA_DESIGN_CONSTITUTION.md` (P1) |
| Auditar los GDD Reboot anteriores como insumo | `_reference_gdd_reboot_v1/` |

Cuando arranques un nuevo chat, el primer mensaje debe declarar **el ID de sesión**
(`P1`–`P6`) y el archivo de brief correspondiente. No mezcles sesiones en el mismo chat:
la separación existe para que cada decisión sea revisable contra un Definition of Done.

---

## Resumen de las seis sesiones

### P1 · A — Roxana Design Constitution
- **Pack:** `A_ROXANA_DESIGN_CONSTITUTION.md`
- **Rol:** Game Director / Design Governance Lead
- **Produce:** Pillars · Design Language · Canon Policy · Document Architecture · Review Checklist
- **Depende de:** nadie
- **Habilita:** todo lo demás (B–F la citan como autoridad superior)

**Definition of Done** — la sesión P1 termina sólo si:
- hay ≤15 pilares, claros y no redundantes;
- existe una jerarquía documental estable;
- CANON / PROPOSED / LEGACY / REJECTED / EXPERIMENTAL quedan definidos;
- existe una checklist utilizable por reviewers humanos/agentes;
- se registran explícitamente preguntas abiertas globales;
- no se introduce lore innecesario.

**Status:** ✅ done (2026-08-14) — v1: 5 docs en `/docs/00-governance/`: PILLARS (15), DESIGN_LANGUAGE, CANON_POLICY, DOCUMENT_ARCHITECTURE, DESIGN_REVIEW_CHECKLIST; 6 GQ registradas.

---

### P2 · B — Ohmdal Production GDD
- **Pack:** `B_OHMDAL_PRODUCTION_GDD_SESSION.md`
- **Referencia histórica:** `_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md`
- **Rol:** Lead Game Designer + Systems Designer de Ohmdal
- **Verbo nuclear:** CONECTAR
- **Produce:** Vision · Core Gameplay · Electrical System · Puzzle Grammar (12 familias) · Mechanics Progression · World Structure · Narrative Bible · Arco I · Vertical Slice · Prototype Evaluation
- **Depende de:** P1
- **Habilita:** patrón estructural para P3–P5; cruces interdisciplinarios para P6

**Definition of Done** — la sesión P2 termina cuando:
- existe un interaction model preciso;
- el sistema eléctrico abstracto está acotado (capas 0–6);
- cada familia de puzzle (P1–P12) tiene variables de dificultad;
- Arco I tiene progression coherente;
- el vertical slice tiene beats y criterios de éxito;
- se diferencia CANON de EXPERIMENTAL explícitamente;
- no se eligió tecnología como sustituto de diseño.

**Status:** ✅ done (2026-08-14) — 10 docs en `docs/20-worlds/ohmdal/`: vision, core-gameplay, electrical-system (capas 0–6), puzzle-grammar (12 familias P1–P12 con variables), mechanics-progression, world-structure, narrative-bible, arc-01, vertical-slice (8 beats VS01–VS08), prototype-evaluation. 12 open questions registradas. 7 reclasificaciones de legacy propuestas. 7 decisiones pendientes de ratificación.

---

### P3 · C — Physica Production GDD
- **Pack:** `C_PHYSICA_PRODUCTION_GDD_SESSION.md`
- **Referencia histórica:** `_reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md`
- **Rol:** Lead Game Designer + Physics Systems Designer
- **Verbo nuclear:** EXPERIMENTAR
- **Produce:** Vision · Player Movement · Physics Interaction System · Puzzle Grammar (≥8 familias) · Mechanics Progression · World Structure · Narrative Bible · Arco I · Vertical Slice · Prototype Evaluation
- **Depende de:** P1
- **Habilita:** el segundo GDD de producción; referencia para P4 y P5

**Definition of Done** — la sesión P3 termina cuando:
- locomoción está especificada como sistema (no solo controles);
- la física estilizada tiene principios claros y transferibles;
- puzzle grammar cubre al menos 8 familias (F1–F12);
- Arco I tiene una curva de mecánicas;
- reloj y lore quedan subordinados al gameplay;
- vertical slice y preguntas de prototipo están cerrados.

**Status:** ✅ done (2026-08-14) — 10 docs en `docs/20-worlds/physica/`: vision, player-movement (15 estados), physics-interaction-system (5 principios + 8 capas C0–C7), puzzle-grammar (12 familias, 10 entran en Arco I), mechanics-progression (5 arcos), world-structure (2.5D lateral, 7 escenas E2–E8), narrative-bible, arc-01 (6 capítulos), vertical-slice (10 criterios), prototype-evaluation (13 hipótesis). 14 open questions (PHYS-*). 5 reclasificaciones a LEGACY. 6 decisiones pendientes de ratificación.

---

### P4 · D — Bitland Production GDD
- **Pack:** `D_BITLAND_PRODUCTION_GDD_SESSION.md`
- **Referencia histórica:** `_reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md`
- **Rol:** Lead Game Designer + Programming Systems Designer
- **Verbo nuclear:** PROGRAMAR
- **Produce:** Vision · World Metaphor · Programming Language Gameplay · Automation System · Puzzle Grammar (≥8 familias) · Mechanics Progression · Narrative Bible · Arco I · Vertical Slice · Prototype Evaluation
- **Depende de:** P1
- **Habilita:** identidades de PROGRAMAR como mundo; cruces con Ohmdal/Physica

**⚠️ Restricción de canon:** la lore de Bitland es mayormente nueva. Todo lo que
produzca esta sesión se etiqueta **PROPOSED** salvo ratificación explícita de Manuel.
**No se promueve a CANON automáticamente.**

**Definition of Done** — la sesión P4 termina cuando:
- la metáfora de *ciudad ejecutable* está estabilizada (procesos, datos, memoria, eventos);
- el lenguaje de bloques / pseudocódigo está definido en sus 8 etapas;
- ejecución visible y debugging están diseñados como gameplay, no como herramienta externa;
- 8+ familias de puzzle (B1–B12) con variables de dificultad;
- Arco I y vertical slice especificados con criterios de éxito;
- lore sigue **PROPOSED** hasta ratificación.

**Status:** ✅ done (2026-08-14) — 10 docs en `docs/20-worlds/bitland/`: vision, world-metaphor (20 equivalencias urbanas↔sistemas), programming-language-gameplay (8 etapas), automation-system (3 clases), puzzle-grammar (12 familias B1–B12 con variables), mechanics-progression (5 arcos), narrative-bible (3 personajes: PATCH/Operadores/Procesos, 5 misterios), arc-01 (5 capítulos), vertical-slice (10 beats, 16 min), prototype-evaluation (10 hipótesis). 50 open questions (BL-*). 1 reclasificación a LEGACY. 25 ítems de lore + 10 ADRs candidatos pendientes de ratificación.

---

### P5 · E — Arithmos Production GDD
- **Pack:** `E_ARITHMOS_PRODUCTION_GDD_SESSION.md`
- **Referencia histórica:** `_reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md`
- **Rol:** Lead Game Designer + Mathematical Puzzle Designer
- **Verbo nuclear:** TRANSFORMAR
- **Produce:** Vision · World Rules · Transformation System · Representation System · Puzzle Grammar (≥8 familias) · Mechanics Progression · Narrative Bible · Arco I · Vertical Slice · Prototype Evaluation
- **Depende de:** P1
- **Habilita:** la idea más fuerte del proyecto — *cambiar de representación sin perder estructura*

**⚠️ Restricción de canon:** la lore de Arithmos es nueva. Todo lo que produzca esta
sesión se etiqueta **PROPOSED** salvo ratificación explícita de Manuel. La
identidad del mundo se construye aquí, no se importa de versiones anteriores.

**Definition of Done** — la sesión P5 termina cuando:
- la regla de transformación está formalizada (cambia representación, conserva propiedad, produce consecuencia espacial);
- el sistema de representaciones múltiples está explícito;
- 8+ familias de puzzle (A1–A12) con variables de dificultad;
- Arco I y vertical slice especificados con criterios de éxito;
- lore mínimo y coherente, todo **PROPOSED**;
- cero dependencia de cuestionarios o multiple choice.

**Status:** ✅ done (2026-08-14) — 10 docs en `docs/20-worlds/arithmos/`: vision, world-rules (3 tipos de materia, continuum de fractura), transformation-system (20 operaciones C1.1–C4.5), representation-system (11 representaciones R1–R11), puzzle-grammar (12 familias A1–A12), mechanics-progression (5 arcos), narrative-bible (10 regiones + 3 personajes PROPOSED: Tessa/Nodo/Conservadores), arc-01 (6 capítulos), vertical-slice (10 beats, 15–20 min), prototype-evaluation (15 preguntas). 60+ open questions (A-*). 15 secciones del legacy reclasificadas a LEGACY. 100% de la lore marcada PROPOSED, 3 ejemplos de la regla fundamental demostrados.

---

### P6 · F — Roxana Metagame & Cross-World Systems
- **Pack:** `F_ROXANA_METAGAME_SESSION.md`
- **Rol:** Lead Metagame Designer + Systems Integrator
- **Produce:** Institute Bible · Bitácora System · Metaprogression · Global Narrative · Cross-World Challenges · Player Profile · Global UI/UX · Campaign Structure · Content Authority Map · Global Vertical Slice Criteria
- **Depende de:** A, B, C, D, E **con identidades jugables propias**
- **Habilita:** la integración real entre mundos; campañas interdisciplinarias

> **Regla de paralelización:** se puede empezar P6 en paralelo a P4–P5 **sólo
> en lo estrictamente global** (Institute, Bitácora, UI común). Los cruces
> interdisciplinarios deben esperar a que B–E tengan identidades jugables
> propias.

**Definition of Done** — la sesión P6 termina cuando:
- el Instituto está diseñado como espacio (hogar, misterio, archivo, mapa de progreso);
- la Bitácora es un sistema, no un codex (capas, estados OBSERVED→MASTERED→TRANSFERRED, reglas temporales);
- la metaprogresión evita XP como recompensa dominante;
- los cruces entre mundos están definidos como desafíos, no como niveles compartidos;
- la estructura de campaña global puede hospedar las cinco campañas independientes;
- cada documento declara `status`, `authority_level`, `version`, `last_ratified`, `supersedes`, `depends_on`, `open_questions`.

**Status:** ✅ done (2026-08-14) — 10 docs: 8 en `docs/10-global/` (institute-bible con 8 funciones + 6 capas; bitacora-system con 6 capas + 6 estados; metaprogression con 7 dimensiones + 3 filtros; global-narrative con 7 preguntas + 4 hilos; player-profile con 8 categorías; global-ui-ux con 6 contratos; campaign-structure con 5 campañas; global-vertical-slice-criteria con 7 capacidades) + 2 en `docs/30-integration/` (cross-world-challenges con 4 tipos de cruce; content-authority-map con matriz autoridad + ContextPack). 15 open questions (GQ-1,3,4,5,6 cerradas propuestas; GQ-2 sin cerrar). 5 contradicciones detectadas y resueltas. 10 decisiones de canon pendientes de ratificación. P12 verificada en los 4 mundos.

---

## Estado agregado

| Chat | Pack | Verbo / foco | Depende de | DoD mínima | Status |
|---|---|---|---|---|---|
| P1 | A | Constitución | — | ≤15 pilares + canon policy + checklist | ✅ done (v1) |
| P2 | B | Ohmdal / CONECTAR | P1 | 12 familias + electrical system + Arco I + VS | ✅ done (v1) |
| P3 | C | Physica / EXPERIMENTAR | P1 | ≥8 familias + locomoción + Arco I + VS | ✅ done (v1) |
| P4 | D | Bitland / PROGRAMAR | P1 | ≥8 familias + ciudad ejecutable + lore PROPOSED | ✅ done (v1) |
| P5 | E | Arithmos / TRANSFORMAR | P1 | ≥8 familias + representation system + lore PROPOSED | ✅ done (v1) |
| P6 | F | Metagame / Integración | P2–P5 | Institute + Bitácora + cross-worlds | ✅ done (v1) |

**Leyenda:** ⏳ pending · 🔄 in-progress · ✅ done · 🚫 blocked · ❌ cancelled

---

## Política de canon

Cada documento nuevo debe declarar al inicio:

```yaml
status: CANON | PROPOSED | LEGACY | REJECTED | EXPERIMENTAL
authority_level: 0..7
version: v1
last_ratified: YYYY-MM-DD
supersedes: [lista de documentos que reemplaza]
depends_on: [lista de documentos de mayor autoridad]
open_questions: [preguntas abiertas relevantes]
```

- **CANON:** regla ratificada; sobrevive hasta nueva decisión explícita.
- **PROPOSED:** candidato activo; default para todo lo nuevo en P4 y P5.
- **EXPERIMENTAL:** hipótesis de prototipo; nunca elevar sin validar en juego.
- **LEGACY:** referencia histórica sin autoridad actual.
- **REJECTED:** descartado conscientemente; queda registrado para que no se redescubra.

Si dos documentos contradicen, gana el de mayor `authority_level`; dentro del mismo
nivel, gana la decisión más reciente **explícitamente ratificada**. Una
implementación existente **no** convierte una idea en canon.

---

## Cómo lanzar un chat desde este índice

1. Elegí el chat siguiente según el orden (default: P1 si no se arrancó nada).
2. Pegá al inicio del chat:
   - el ID de sesión (`P1`–`P6`);
   - el nombre de chat deseado (los que están en este índice);
   - la ruta a su pack (`A_…md` … `F_…md`).
3. Pedí que el agente produzca la **lista de documentos obligatorios** declarada
   en cada pack y cierre **exclusivamente** cuando cumple la Definition of Done.
4. No aceptar "lo dejo más completo" como motivo para extender la sesión.
5. Al cerrar, actualizar este INDEX cambiando ⏳ → ✅ en la fila correspondiente
   y dejando una nota de una línea con la versión final producida.

---

## Material de referencia (no autoridad)

- `_reference_gdd_reboot_v1/00_ROXANA_GDD_GLOBAL_REBOOT_v1.md` — GDD global reboot.
- `_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md` — entrada de Ohmdal.
- `_reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md` — entrada de Physica.
- `_reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md` — entrada de Bitland.
- `_reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md` — entrada de Arithmos.
- `_reference_gdd_reboot_v1/05_AUDITORIA_CANON_LEGACY.md` — auditoría de canon heredado.
- `_reference_gdd_reboot_v1/README.md` — índice del paquete legacy.

Estos archivos son **insumo**, no autoridad. Una sesión puede citarlos, pero no
los promueve a CANON por sí mismos.

---

## Lo que NO debe ocurrir (regla dura)

- Producir cuatro campañas completas antes de validar sus verbos.
- Dejar que el temario dicte escenas sin pasar por la gramática jugable.
- Llenar huecos de canon como si fueran hechos.
- Usar multiple choice como interacción principal.
- Convertir la Bitácora en manual previo.
- Empezar por arquitectura técnica o elección de motor.
- Confundir "más contenido" con "más diseño".
- Pedir a un modelo que "haga el juego completo" a partir de estos documentos.
- Mover un documento de `PROPOSED` a `CANON` sin decisión autoral explícita.
- Lanzar P4–P5 o P6 antes de cerrar P1, ni P6 antes de que P2–P5 tengan
  identidades jugables propias.
