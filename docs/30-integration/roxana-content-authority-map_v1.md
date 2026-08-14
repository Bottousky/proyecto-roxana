---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes: []
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
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
  - docs/10-global/ROXANA_CAMPAIGN_STRUCTURE_v1.md
  - docs/30-integration/roxana-cross-world-challenges_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/physica/vision/physica-vision_v1.md
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md
  - docs/20-worlds/arithmos/vision/arithmos-v1_v1.md
open_questions:
  - CAM-Q1 — si el mapa debe ser un archivo vivo (re-renderizado por un agente) o un snapshot firmado
  - CAM-Q2 — cómo se manejan las dependencias de un documento con `depends_on` roto (DocArch §6)
  - CAM-Q3 — si el mapa expone rutas de archivo o sólo identificadores lógicos
  - CAM-Q4 — qué nivel de granularidad mínima tiene un feature para entrar al mapa (un sistema completo, un sub-sistema, o un contrato técnico)
  - CAM-Q5 — si un agente puede firmar una "solicitud de excepción" para escribir en un slot que no le pertenece, y bajo qué condiciones se acepta
  - CAM-Q6 — periodicidad con que se audita el árbol de autoridades (propuesta: cada vez que un ADR toca /00-governance o /10-global)

---

# ROXANA — CONTENT AUTHORITY MAP · v1

Documento de autoridad nivel 3. Biblia de integración.
Declara la **matriz de autoridad** que indica, para cada
combinación de **tipo de contenido** × **mundo o
metagame**, qué documento gobierna, a qué `authority_level`
y bajo qué política de conflicto.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Audiencia doble.** Este documento está escrito para
> **dos lectores**: (a) humanos (revisores, leads de
> diseño) que necesitan saber quién puede modificar qué;
> (b) **agentes** (Agentic Workbench y similares) que
> necesitan una **fuente única y parseable** de
> autoridad. La forma está pensada para los dos.

> **Tesis.** La autoridad sobre cada feature global es
> **explícita, registrada y revisable**. La ambigüedad es
> defecto. La precedencia por `authority_level` +
> `last_ratified` (Canon Policy §2) se aplica como
> **respaldo**, no como primera lectura.

---

## 1. Tesis

> **Si un agente tiene que decidir quién puede modificar
> un feature del proyecto, no debería tener que cargar
> los 47 documentos del GDD. Este mapa es el
> ContextPack mínimo que entrega la respuesta.**

Tres consecuencias operativas:

- **Cada feature global tiene un único `owner`.** El
  owner es un **documento**, no una persona ni un equipo.
  La persona o el equipo se identifica abriendo ese
  documento.
- **Cada feature global declara sus `consumers`.** Los
  consumers son los documentos que lo leen. Si un
  consumer cambia, el owner debe actualizarlo.
- **Cada feature global declara su `conflict_policy`.**
  Si dos consumers entran en conflicto, la policy dice
  qué pasa. La policy es **una de cinco** (§5).

---

## 2. Lo que este mapa NO es

| Idea | Por qué no entra |
|---|---|
| Lista de tareas / tickets | El mapa describe **autoridad**, no trabajo. |
| Organigrama humano | El owner es un documento, no una persona. |
| Diagrama técnico de runtime | El mapa describe **diseño**, no implementación. |
| Regla de precedencia implícita | Toda precedencia es explícita y registrada. |
| Snapshot firmado para siempre | El mapa se re-renderiza cuando un ADR toca /10-global o /30-integration. |

---

## 3. Matriz de autoridad — features globales × owners

> Esta matriz es **el corazón del documento**. Los readers
> humanos la leen como tabla; los agentes la parsean como
> JSON si necesitan.

### 3.1. Features globales del metagame

| Feature | Owner (documento) | `authority_level` | Consumers | `depends_on` | `conflict_policy` |
|---|---|---|---|---|---|
| **BITACORA_ENTRY_SCHEMA** (forma de una entrada de Bitácora, los seis estados, las seis capas) | `ROXANA_BITACORA_SYSTEM_v1.md` | 2 | Los 4 mundos; Instituto; perfil del jugador | Canon Policy; Design Language; Bitácora system (auto) | `OWNER_WINS` (la Bitácora es transversal y uniforme) |
| **BITACORA_REGLA_TEMPORAL** (la Bitácora nunca se adelanta) | `ROXANA_BITACORA_SYSTEM_v1.md` | 2 | Los 4 mundos; UI/UX | Pillar P02, P06; Design Language §5 | `OWNER_WINS` |
| **INSTITUTE_AS_SPACE** (las 8 funciones del Instituto) | `ROXANA_INSTITUTE_BIBLE_v1.md` | 2 | UI/UX; campañas; perfil; narrativa global; Bitácora (archivo) | Pillars P08, P12, P15; Design Language §2 | `OWNER_WINS` con consulta a campañas |
| **METAPROGRESSION_SEVEN_DIMS** (las 7 dimensiones observables) | `ROXANA_METAPROGRESSION_v1.md` | 2 | UI/UX; campañas; perfil | Pillars P08, P12, P15; Design Language §2 | `OWNER_WINS` |
| **METAPROGRESSION_CROSS_FILTERS** (los 3 filtros anti-dilución) | `ROXANA_METAPROGRESSION_v1.md` | 2 | Cross-world challenges; campañas; metaprogresión; UI/UX | Pillar P12; GQ-4, GQ-5, GQ-6 | `OWNER_WINS` con consulta a la biblia del mundo destino |
| **GLOBAL_NARRATIVE_THREADS** (los 4 hilos narrativos globales) | `ROXANA_GLOBAL_NARRATIVE_v1.md` | 2 | Las 4 biblias narrativas de mundo; UI/UX; campañas | Pillars P11, P12, P15 | `OWNER_WINS` con `CONSULT_WORLDS` antes de cualquier cambio |
| **GLOBAL_OPEN_QUESTIONS** (GQ-1, GQ-2, GQ-3, GQ-4, GQ-5, GQ-6) | `ROXANA_GAME_DESIGN_PILLARS_v1.md` | 0 | Todos los documentos /10-global y /30-integration | Canon Policy | `PILLAR_WINS` (los pilares tienen precedencia final sobre cualquier cierre de GQ) |
| **PLAYER_PROFILE_PERSISTENCE** (qué se persiste, qué no) | `ROXANA_PLAYER_PROFILE_v1.md` | 2 | UI/UX; campañas; metaprogresión; Bitácora | Pillar P13; Bitácora system; metaprogresión | `OWNER_WINS` |
| **UI_UX_COMMON_LAYER** (los 6 contratos comunes) | `ROXANA_GLOBAL_UI_UX_v1.md` | 2 | Las 4 biblias narrativas; campañas; Instituto; Bitácora | Pillars P12, P15; Design Language §3, §6 | `OWNER_WINS` con respeto a la UI/UX específica del destino |
| **CAMPAIGN_TREE** (el árbol de las 5 campañas y los interludios) | `ROXANA_CAMPAIGN_STRUCTURE_v1.md` | 2 | Las 4 campañas de mundo; UI/UX; metaprogresión; Instituto | Pillars P12, P13, P15 | `OWNER_WINS` con respeto a la autonomía de cada mundo |
| **CROSS_WORLD_CHALLENGE_TYPES** (los 4 tipos de cruce) | `roxana-cross-world-challenges_v1.md` | 3 | Las 4 biblias narrativas; campañas; UI/UX; metaprogresión; Bitácora | Pillar P12, P15; GQ-4 | `OWNER_WINS` con consulta a las biblias narrativas de los mundos involucrados |
| **CROSS_WORLD_CHALLENGE_CATALOG** (los 7 ejemplos del pack F + ascensor) | `roxana-cross-world-challenges_v1.md` | 3 | Las 4 biblias narrativas; campañas; UI/UX | Cross-world types; las 4 biblias | `ADR_REQUIRED` (cada entrada del catálogo requiere un ADR — ver `CWC-Q1`) |
| **CONTENT_AUTHORITY_MAP** (este documento) | `roxana-content-authority-map_v1.md` | 3 | Agentic Workbench; revisores; agentes; la matriz misma | Todos los docs de /10-global y /30-integration; Canon Policy; Document Architecture | `OWNER_WINS` con revisión humana para promoción a CANON |

### 3.2. Features de cada mundo (delegadas a su GDD)

> Esta sub-matriz es **resumen**. La autoridad plena
> sobre cada feature de mundo vive en el GDD del mundo
> (DocArch §1 nivel 3).

| Feature de mundo | Owner por defecto | `authority_level` | Consumers | `conflict_policy` |
|---|---|---|---|---|
| Forma de puzzle, ver gramática, arco I | `<mundo>/gameplay/<mundo>-puzzle-grammar_v1.md` y `content/<mundo>-arc-XX_vN.md` | 3 | `<mundo>/narrative/<mundo>-narrative-bible_v1.md`; UI/UX; campañas; Bitácora | `OWNER_WINS` con consulta a la biblia narrativa del mundo |
| NPCs y lore del mundo | `<mundo>/narrative/<mundo>-narrative-bible_v1.md` | 3 | `<mundo>/content/<mundo>-arc-XX_vN.md`; campañas; Instituto; Bitácora | `OWNER_WINS` con respeto a `PROPOSED` hasta ratificación de Manuel |
| Sistema (eléctrico, físico, programación, transformación) | `<mundo>/gameplay/<mundo>-<system>_v1.md` | 3 | `<mundo>/gameplay/<mundo>-puzzle-grammar_v1.md`; campañas; Bitácora | `OWNER_WINS` con respeto al verbo nuclear del mundo |
| Verbo nuclear | `ROXANA_GAME_DESIGN_PILLARS_v1.md` (P03) | 0 | Todos los docs del mundo; metagame | `PILLAR_WINS` |

---

## 4. ADRs candidatos propuestos por P6

> El pack F restringe a **un ADR candidato por documento**
> (10 ADRs total máximo). La tabla siguiente lista los
> ADRs que P6 propone. Su firma queda en manos de Manuel.

| # | Documento que lo propone | Tema del ADR | Cierra (GQ) |
|---|---|---|---|
| 1 | `ROXANA_BITACORA_SYSTEM_v1.md` | La Bitácora como único sistema transversal con capa delgada por mundo | GQ-1 |
| 2 | `ROXANA_METAPROGRESSION_v1.md` | Cierre conjunto de GQ-5 (los instrumentos no se transfieren físicamente) y GQ-6 (la recompensa de transferencia no es XP) | GQ-5, GQ-6 |
| 3 | `ROXANA_GLOBAL_NARRATIVE_v1.md` | Las tres formas de regreso a un mundo ya visitado | GQ-3 |
| 4 | `roxana-cross-world-challenges_v1.md` | Regla de los tres filtros y los 4 tipos de cruce | GQ-4 |
| 5 | `roxana-content-authority-map_v1.md` (este doc) | Este mapa como ContextPack mínimo para agentes | — (no cierra GQ) |
| 6–10 | (reservados para futuras sesiones) | — | — |

> **Total propuesto por P6:** 5 ADRs candidatos. Quedan
> 5 huecos disponibles para sesiones futuras o ratificaciones
> posteriores.

---

## 5. Las cinco políticas de conflicto

> Cuando dos features o dos documentos entran en
> conflicto, se aplica **una** de las cinco políticas.
> La política se declara en la columna `conflict_policy`
> de la matriz.

1. **`OWNER_WINS`.** El documento owner tiene
   precedencia. Los consumers deben ajustarse.
2. **`PILLAR_WINS`.** El conflicto se eleva a los
   pilares (`ROXANA_GAME_DESIGN_PILLARS_v1.md`).
   Aplica a features transversales de máxima autoridad.
3. **`CONSULT_WORLDS`.** El owner decide, pero
   **después** de consultar las biblias narrativas de
   los mundos afectados. Aplica a la narrativa global.
4. **`ADR_REQUIRED`.** El cambio **no** puede entrar
   sin un ADR previo firmado por Manuel. Aplica a
   catálogos y a features con múltiples lectores.
5. **`FIRST_CLAIM_WINS`.** El primer documento que
   registró el feature mantiene la autoridad, salvo
   que un ADR lo invierta. Aplica a features de baja
   rotación.

> La precedencia entre políticas es: PILLAR_WINS >
> ADR_REQUIRED > OWNER_WINS > CONSULT_WORLDS >
> FIRST_CLAIM_WINS.

---

## 6. Forma del ContextPack mínimo

> Esta sección es **esquema**, no implementación. El
> ContextPack es el producto que consume un agente
> (Agentic Workbench) para tomar decisiones de autoridad.

```yaml
context_pack:
  version: v1
  project: roxana
  pillars: docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  canon_policy: docs/00-governance/ROXANA_CANON_POLICY_v1.md
  design_language: docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  document_architecture: docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  review_checklist: docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  authority_map: docs/30-integration/roxana-content-authority-map_v1.md
  features:
    - id: BITACORA_ENTRY_SCHEMA
      owner: ROXANA_BITACORA_SYSTEM_v1.md
      authority_level: 2
      depends_on: [...]
      consumers: [4 mundos, Instituto, perfil]
      conflict_policy: OWNER_WINS
    # ... (uno por feature de la matriz §3)
```

> Un agente que tenga que decidir quién modifica el
> formato de una entrada de Bitácora consulta
> `BITACORA_ENTRY_SCHEMA.owner` y encuentra
> `ROXANA_BITACORA_SYSTEM_v1.md`. No necesita cargar
> los GDDs de los cuatro mundos para decidir.

---

## 7. Procedimiento de actualización del mapa

> El mapa se actualiza cuando **alguno** de los
> siguientes eventos ocurre:

1. Un ADR toca `/00-governance/`, `/10-global/` o
   `/30-integration/`.
2. Un nuevo feature global se crea (entra al mapa como
   fila nueva).
3. Un feature existente cambia de owner, de
   `authority_level` o de `conflict_policy`.
4. Un consumidor se agrega o se elimina de un feature.

> Cada actualización se registra con un cambio de
> `last_ratified` y, si el cambio es sustantivo, de
> `version`.

---

## 8. Lo que este documento NO es

- No es un sistema de tickets. El mapa no asigna
  trabajo.
- No es un organigrama. El owner es un documento, no
  una persona.
- No prescribe tecnología de agentes. El ContextPack es
  un **esquema**, no una implementación.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
- No es canon: es `PROPOSED` hasta ratificación.
