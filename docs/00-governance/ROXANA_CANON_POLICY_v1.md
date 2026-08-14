---
status: PROPOSED
authority_level: 0
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/00_ROXANA_GDD_GLOBAL_REBOOT_v1.md (sección 12 — regla de canon)
  - _reference_gdd_reboot_v1/05_AUDITORIA_CANON_LEGACY.md (sección 7 — regla futura)
  - draft "Borrador — Canon Policy" contenido en A_ROXANA_DESIGN_CONSTITUTION.md
depends_on: []
open_questions:
  - GQ-2 (transversal) — criterios formales para ascender PROPOSED a CANON
  - CP-Q1 — ¿qué constituye ratificación autoral: una nota en este documento, un ADR firmado, una decisión verbal registrada?
  - CP-Q2 — periodicidad con que se audita el árbol de REJECTED para evitar documentación zombie
  - CP-Q3 — qué tipo de evidencia de prototipo es exigible para promover un PROPOSED a CANON (capturas, métricas, test unitario, testimonio de jugador)
---

# ROXANA — CANON POLICY · v1

Este documento fija cómo se decide qué es autoridad vigente en Proyecto
Roxana, cómo se resuelve un conflicto entre documentos y cómo se registra
una decisión descartada para que no se redescubra.

> **Estado del documento.** `PROPOSED` en v1. Es `authority_level` 0: es
> fundación junto con los pilares, no deriva de ellos. La promoción a
> `CANON` requiere un ADR firmado por Manuel.

> **Por qué level 0 y no level 1.** La política de canon es el
> mecanismo legal del proyecto. Regula cómo se acepta, degrada y descarta
> cualquier otro documento, incluidos los pilares. Si fuera level 1, un
> ADR de pilares podría reescribirla sin que la política pueda objetar.

---

## 1. Estados de canon

Todo documento de autoridad debe declarar **uno** de los siguientes
estados. No se admite estado implícito.

| Estado | Significado | Quién puede ratificarlo | Quién puede degradarlo |
|---|---|---|---|
| **CANON** | Regla o hecho ratificado. Sobrevive hasta nueva decisión explícita. | Decisión autoral explícita + ADR. | Decisión autoral explícita + ADR. |
| **PROPOSED** | Candidato activo. Default para todo lo nuevo. | n/a — es el estado de origen. | Decisión editorial. |
| **LEGACY** | Referencia histórica sin autoridad actual. | n/a — viene de una reclasificación. | Promovido a CANON, descartado o mantenido. |
| **REJECTED** | Descartado conscientemente. Permanece registrado para no ser redescubierto. | n/a — es el estado de cierre. | No se reactiva: se crea un nuevo documento. |
| **EXPERIMENTAL** | Hipótesis atada a un prototipo concreto. No se eleva a CANON hasta validación en juego. | n/a — es el estado de origen. | Validación en juego → CANON. Fracaso → REJECTED o LEGACY. |

### Reglas por estado

- **CANON** sólo se asigna por decisión autoral explícita. Un documento no
  se autoproclama CANON.
- **PROPOSED** es el estado por defecto. Todo documento nuevo de cualquier
  sesión de diseño (incluyendo P4 Bitland y P5 Arithmos) nace en este
  estado.
- **LEGACY** se asigna cuando un documento histórico se conserva por su
  valor de referencia pero ya no gobierna decisiones presentes. La
  promoción a LEGACY no requiere modificación de contenido.
- **REJECTED** exige un motivo registrado en el cuerpo del documento o en
  un ADR. No se admite "rejected" sin razón.
- **EXPERIMENTAL** está atado a un prototipo. El documento debe nombrar
  qué prototipo valida la hipótesis. Sin prototipo nombrado, el estado es
  inválido.

---

## 2. Regla de precedencia

Si dos documentos contradicen, se aplica el siguiente orden. Los criterios
son acumulativos: el primero que decide, decide.

1. **Mayor `authority_level`.** El documento de nivel superior gana. Los
   niveles válidos son `0..7` y se definen en
   `ROXANA_DOCUMENT_ARCHITECTURE_v1.md` §1.
2. **Mismo nivel → ratificación más reciente.** Dentro del mismo nivel,
   gana el documento con `last_ratified` más reciente, siempre que esa
   ratificación haya sido **explícita**.
3. **Implementación no es canon.** Una pieza de código, de runtime o de
   pipeline que contradiga un documento **no** convierte la idea en
   canon. La implementación se corrige o el documento se eleva por ADR.
4. **Silencio no es ratificación.** Que un documento no haya sido
   cuestionado durante meses no lo asciende de estado. Sólo una
   ratificación explícita lo hace.

### Conflictos entre estados

- **CANON vs. CANON:** se resuelve por `authority_level` y `last_ratified`.
- **CANON vs. PROPOSED:** gana CANON, salvo ratificación explícita que
  invierta la relación.
- **CANON vs. LEGACY:** gana CANON. LEGACY se conserva como referencia
  pero no tiene autoridad presente.
- **CANON vs. REJECTED:** gana CANON. REJECTED documenta la decisión
  inversa y debe ser citada si vuelve a aparecer.
- **CANON vs. EXPERIMENTAL:** gana CANON, salvo que el EXPERIMENTAL
  declare explícitamente que **suspende** el CANON durante la prueba.
  Esa suspensión se limita al prototipo y termina con él.

---

## 3. Canon mínimo

> No fijar detalles si no afectan consistencia, producción o identidad.

Si un detalle no cambia una decisión presente de consistencia, producción
o identidad, no se canoniza. Tres preguntas filtro:

1. ¿Cambia qué se puede hacer en el juego?
2. ¿Cambia cómo se produce un asset, un puzzle, una escena?
3. ¿Cambia cómo se identifica el proyecto desde fuera?

Si las tres son "no", el detalle queda en el GDD de mundo o en un ADR
pero no se promueve a CANON.

---

## 4. Canon negativo

Toda decisión descartada de forma consciente debe registrarse. El registro
cumple dos funciones:

- evita que un agente futuro proponga de nuevo la misma idea;
- deja huella del razonamiento que llevó a descartarla.

### Formato de un canon negativo

Un REJECTED debe contener, como mínimo:

- **Idea.** Qué se propuso.
- **Origen.** Quién o qué la propuso (sesión, documento, ADR).
- **Motivo.** Por qué se descartó, con referencia a pilares o
  restricciones de producción.
- **Consecuencia.** Qué decisión se tomó en su lugar, si corresponde.
- **Fecha.** `YYYY-MM-DD`.

### Ubicación

Los REJECTED se archivan en `/docs/00-governance/rejected/` con nombre
`REJECTED_<slug>_<YYYY-MM-DD>.md`. La puerta de entrada es este documento.

---

## 5. Cómo se promueve un PROPOSED a CANON

Un documento PROPOSED se promueve a CANON cuando se cumplen **todas** las
siguientes condiciones:

1. **Validación.** Un prototipo o una pieza de producción demuestra que
   la decisión funciona.
2. **Coherencia.** El documento no contradice ningún CANON de mayor
   `authority_level`.
3. **Aprobación.** Decisión autoral explícita registrada en un ADR.
4. **Frontmatter actualizado.** Se modifican `status`, `last_ratified`,
   `version` (si corresponde) y se cierra la entrada en `open_questions`.

Si falta cualquiera de las cuatro, el documento **no** se promueve.

> **Caso especial de v1.** Los cinco documentos de gobernanza producidos
> por la sesión P1 nacen como `PROPOSED` aunque su contenido haya sido
> debatido en sesión. CANON requiere una ratificación autoral explícita
> posterior, registrada como ADR.

---

## 6. Cómo se degrada un CANON

Un CANON se degrada por una sola vía:

1. ADR que justifica el cambio.
2. Decisión autoral explícita.
3. Actualización de `status`, `last_ratified` y, si corresponde,
   `version`.

Si el CANON reemplazado sigue siendo útil como referencia, pasa a
LEGACY. Si su contenido ya no aporta, pasa a REJECTED. No se borra: la
traza permanece.

---

## 7. Lo que este documento NO es

- No es una guía de estilo. La guía de estilo vive en la biblia
  artística.
- No decide qué contenido entra a producción. Eso lo decide el plan de
  producción correspondiente.
- No sustituye la revisión del checklist. Una decisión de canon sin
  pasar la checklist puede ser válida pero está incompleta.
- No sustituye a los pilares. Los pilares enuncian *qué* debe ser
  cierto; esta política define *cómo* se ratifica, degrada y registra
  lo que se vuelve cierto.
