---
status: PROPOSED
authority_level: 1
version: v1
last_ratified: 2026-08-14
supersedes:
  - draft "Borrador — Arquitectura documental" contenido en A_ROXANA_DESIGN_CONSTITUTION.md
  - _reference_gdd_reboot_v1/05_AUDITORIA_CANON_LEGACY.md (sección 6 — recomendación de migración; sólo la estructura sugerida, no la operación)
depends_on:
  - ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ROXANA_CANON_POLICY_v1.md
open_questions:
  - GQ-3 (transversal) — periodicidad y formato del regreso a un mundo ya visitado
  - DA-Q1 — cómo se migra físicamente la masa de archivos legacy sin perder trazabilidad
  - DA-Q2 — política de retención de documentos REJECTED (¿se purgan tras N años?)
  - DA-Q3 — si un mismo documento contiene contenido de dos niveles, ¿se divide o se le asigna el nivel del contenido más alto y se declara el conflicto?
---

# ROXANA — DOCUMENT ARCHITECTURE · v1

Este documento define la jerarquía documental del proyecto, los niveles de
autoridad, la convención de nombres, el frontmatter obligatorio y el
protocolo de supersedes / depends_on. No decide qué se escribe. Define cómo
se escribe y dónde se ubica lo escrito.

> **Estado del documento.** `PROPOSED` en v1. Es `authority_level` 1:
> deriva de los pilares (nivel 0) y de la política de canon (nivel 0).
> La promoción a `CANON` requiere un ADR firmado por Manuel.

> **Por qué level 1 y no level 0.** La arquitectura documental es una
> herramienta procedimental. Su contenido puede ser invalidado por un
> cambio en pilares o política; por tanto, no puede pesar más que
> ellos.

> **Nota sobre la auto-referencia.** Este documento se describe a sí
> mismo como level 1. Se permite porque su contenido es
> procedimental y no contradictorio con su propia pertenencia: la
> política de canon (§2) reconoce que un documento puede incluir la
> declaración de su propio nivel.

---

## 1. Jerarquía de autoridad

La autoridad de un documento se mide con un entero `authority_level` entre
`0` y `7`. Un número menor significa mayor autoridad. Una autoridad `0`
gobierna sobre `1`, que gobierna sobre `2`, y así sucesivamente.

| Nivel | Tipo de documento | Ejemplos |
|---|---|---|
| **0** | Constitución fundacional | Game Design Pillars, Canon Policy. |
| **1** | Constitución operativa | Design Language, Document Architecture, Design Review Checklist. |
| **2** | Biblia global | Instituto, Bitácora como sistema, metaprogresión, narrativa global. |
| **3** | Biblia de mundo y sistemas | Vision de Ohmdal / Physica / Bitland / Arithmos, sistema eléctrico de Ohmdal, simulación física de Physica, lenguaje de programación de Bitland, sistema de transformaciones de Arithmos, puzzle grammar. |
| **4** | Diseño de contenido | Arcos, mapas, beats de vertical slice, puzzles específicos, encounters. |
| **5** | Producción | Pipelines de assets, presupuestos, runtimes, integración cinematográfica, QA. |
| **6** | Especificación de tarea | Specs de hito, tickets de implementación, contratos agente-tarea. |
| **7** | Evidencia de implementación | Resultados de tests, capturas de prototipo, bitácoras de sprint, reportes de bug. |

### Justificación de la división nivel 0 / nivel 1

- **Nivel 0 (fundacional).** Enuncia reglas que ningún otro documento
  puede contradecir. Los pilares son el *test* de aceptación/rechazo
  del contenido; la política de canon es el *mecanismo legal* que
  decide cuándo un documento se vuelve obligatorio.
- **Nivel 1 (operativo).** Traduce los niveles 0 en procedimientos.
  Cambian con más frecuencia y se invalidan ante un cambio en nivel 0.

Si una idea future exige tratar Design Language, Document Architecture o
Design Review Checklist como fundacionales, debe hacerse por ADR que
explícitamente eleve su nivel y registre el coste.

### Reglas

- Un documento no puede contradecir a uno de nivel inferior. Si lo hace,
  se eleva un ADR.
- Un documento no puede declararse de un nivel distinto al que su
  contenido implica. Si una "biblia de mundo" incluye reglas que tocan
  autoridad `0`, su nivel real es mixto y debe declarar el conflicto.
- El sistema de niveles **no** clasifica por importancia estética o
  narrativa. Clasifica por capacidad de invalidar otras decisiones.

---

## 2. Estructura de carpetas

El árbol de `/docs` se organiza por nivel de autoridad y por alcance.
La estructura vigente es la siguiente:

```text
/docs
  /00-governance
    ROXANA_GAME_DESIGN_PILLARS_v1.md
    ROXANA_DESIGN_LANGUAGE_v1.md
    ROXANA_CANON_POLICY_v1.md
    ROXANA_DOCUMENT_ARCHITECTURE_v1.md
    ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
    /rejected
      REJECTED_<slug>_<YYYY-MM-DD>.md
    /adr
      ADR-<NNNN>-<slug>.md

  /10-global
    institute-bible.md
    bitacora-system.md
    global-narrative.md
    metaprogression.md
    cross-world-systems.md

  /20-worlds
    /ohmdal
      /vision
      /gameplay
      /world
      /narrative
      /content
      /production
    /physica
    /bitland
    /arithmos

  /30-integration
    cross-world-challenges.md
    content-authority-map.md

  /80-production
    /content-db
    /roadmaps
    /qa
    /asset-manifests

  /90-legacy
    ...
```

### Notas

- Las carpetas `00..90` son fijas. Una nueva capa requiere ADR.
- `90-legacy` contiene sólo archivos **explícitamente reclasificados** a
  LEGACY. No es un cajón de sastre.
- `20-worlds/<mundo>/` contiene **exclusivamente** documentos cuyo
  alcance es ese mundo. Documentos transversales viven en `10-global`.
- `30-integration` es la única capa que puede combinar dos o más mundos
  en un mismo documento. Su `authority_level` mínimo es `3` y debe
  declarar `depends_on` con los documentos de los mundos cruzados.
- `00-governance/rejected/` y `00-governance/adr/` son los únicos
  subdirectorios de gobernanza. Cualquier otro subdirectorio en
  `00-governance` requiere ADR.

### Migración

La masa de archivos legacy fuera de `90-legacy` se migra en tres
pasos, y sólo después de que un ADR apruebe cada uno:

1. **Etiquetado.** Cada archivo recibe frontmatter con `status`,
   `authority_level`, `supersedes` y `depends_on` si los tiene.
2. **Reclasificación.** Los archivos vigentes pasan a su nueva carpeta.
   Los no vigentes se mueven a `90-legacy` o `00-governance/rejected/`.
3. **Limpieza.** Sólo se borran archivos que ya tienen copia legible en
   su nueva ubicación y cuyo `status` es REJECTED.

No se borra ni se mueve nada automáticamente sin ADR.

---

## 3. Convención de nombres

### Documentos de autoridad (`/00-governance` y `/10-global`)

```
ROXANA_<TOPIC>_v<N>.md
```

- `TOPIC` en MAYÚSCULAS con guiones bajos.
- `N` es el entero de versión. La primera versión ratificada es `v1`.
- Saltos de versión (v1 → v3) requieren un ADR que justifique el salto.

### Documentos de mundo (`/20-worlds/<mundo>/...`)

```
<topic>-<subtopic>_v<N>.md
```

- En minúsculas con guiones.
- Si el documento no pertenece a un solo mundo, no vive en `20-worlds`.

### Documentos de producción (`/80-production/...`)

Mismo patrón que los de mundo, sin prefijo `ROXANA_`.

### ADR

```
ADR-<NNNN>-<slug>.md
```

- `NNNN` es el correlativo de cuatro dígitos.
- `slug` resume el conflicto o la decisión.

### REJECTED

```
REJECTED_<slug>_<YYYY-MM-DD>.md
```

- `slug` identifica la idea descartada.
- La fecha corresponde al descarte.

---

## 4. Frontmatter obligatorio

Todo documento de autoridad en `/00-governance` y `/10-global` debe iniciar
con el siguiente frontmatter YAML. Los documentos de `/20-worlds` y
`/80-production` lo adoptan por analogía.

```yaml
---
status: CANON | PROPOSED | LEGACY | REJECTED | EXPERIMENTAL
authority_level: 0..7
version: vN
last_ratified: YYYY-MM-DD
supersedes:
  - ruta/al/documento-reemplazado.md
depends_on:
  - ruta/al/documento-de-mayor-autoridad.md
open_questions:
  - GQ-X (referencia a pregunta global) o LOCAL-Q — pregunta abierta
---
```

### Reglas de frontmatter

- `status` debe ser uno de los cinco definidos en
  `ROXANA_CANON_POLICY_v1.md` §1.
- `authority_level` debe ser un entero `0..7`.
- `version` se incrementa con cada ratificación que cambia contenido
  sustantivo. Una corrección tipográfica no cambia la versión pero sí
  actualiza `last_ratified`.
- `supersedes` se llena sólo si el documento reemplaza a otro. Si no
  reemplaza a nadie, la lista puede quedar vacía o ser `[]`.
- `depends_on` lista los documentos de mayor autoridad que el presente
  necesita. Si no depende de nadie (caso típico de un documento `0` que
  es fundación), la lista puede quedar vacía.
- `open_questions` lista las preguntas abiertas que el documento
  declara. Las preguntas globales se referencian con el prefijo `GQ-`
  acordado en `ROXANA_GAME_DESIGN_PILLARS_v1.md` §4.

---

## 5. Reglas de ratificación y versionado

- Una ratificación se registra actualizando `last_ratified` y, si hay
  cambio sustantivo, `version` y la lista de `supersedes`.
- Un cambio sustantivo es todo cambio que afecta a una decisión
  operativa, no una corrección de redacción.
- Un ADR precede a toda ratificación que degrade un CANON o invierta
  la precedencia entre dos documentos.
- Los cambios de `status` se justifican en el cuerpo del documento o en
  el ADR asociado.

---

## 6. Reglas de supersedes y depends_on

- `supersedes` es una **lista explícita**. Si un documento absorbe parte
  del contenido de otro, debe declararlo. La omisión es ambigüedad y se
  trata como no-superseded.
- `depends_on` no es transitivo en cuanto a obligación de citar: un
  documento puede depender de una constitución sin citarla en cada
  sección. La cita es obligatoria cuando se invoca la autoridad
  explícitamente.
- Si `depends_on` lista un documento que ya no existe, el documento
  dependiente queda con un vínculo roto. Esto se considera defecto y se
  resuelve en la siguiente ratificación.
- Si un documento queda sin `depends_on` porque sus dependencias
  cambiaron, debe declararlo. La lista vacía es válida sólo para
  documentos fundación.
- Las cadenas `depends_on` deben ser acíclicas. Un ciclo entre
  documentos de governance indica un error de diseño y debe romperse
  por ADR antes de cualquier promoción a CANON.

---

## 7. Procedimiento de revisión

Toda revisión de un documento de autoridad debe:

1. Pasar el `ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`.
2. Registrar el resultado en un ADR si el cambio toca pilares, lenguaje
   de diseño, canon policy o la propia arquitectura.
3. Actualizar `last_ratified` y, si corresponde, `version`.
4. Notificar a los documentos que `depends_on` este.

---

## 8. Lo que este documento NO es

- No prescribe herramientas de edición, ni plantillas, ni themes.
- No decide quién escribe qué. Eso es responsabilidad del plan de
  producción.
- No reemplaza al `ROXANA_CANON_POLICY_v1.md`. Define estructura;
  `Canon Policy` define autoridad.
- No decide qué ideas entran o no al proyecto. Eso lo deciden los
  pilares y, en última instancia, la ratificación autoral.
