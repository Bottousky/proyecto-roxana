---
status: PROPOSED
authority_level: 1
version: v1
last_ratified: 2026-08-14
supersedes:
  - draft "Borrador — Design Review Checklist" contenido en A_ROXANA_DESIGN_CONSTITUTION.md
depends_on:
  - ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ROXANA_DESIGN_LANGUAGE_v1.md
  - ROXANA_CANON_POLICY_v1.md
  - ROXANA_DOCUMENT_ARCHITECTURE_v1.md
open_questions:
  - RC-Q1 — cómo se maneja el resultado de la checklist en sesiones automatizadas de agente (¿pasa / falla / requiere revisión humana?)
  - RC-Q2 — ¿qué umbral de "no" obliga a devolver el documento a PROPOSED?
  - RC-Q3 — qué formato debe tener el bloque de revisión archivado (plantilla, ruta, retención)
---

# ROXANA — DESIGN REVIEW CHECKLIST · v1

Esta checklist es la herramienta operativa que aplica un reviewer
(humano o agente) sobre cualquier feature, sistema, escena, puzzle,
encuentro, asset, decisión de producción o documento antes de que sea
ratificado.

La checklist existe para evitar que un CANON se degrade por aprobación
relajada y para que un PROPOSED no salte a CANON sin pasar por la prueba
completa.

> **Estado del documento.** `PROPOSED` en v1. Es `authority_level` 1:
> deriva de los cuatro documentos de gobernanza. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Por qué level 1 y no level 0.** La checklist es la herramienta
> concreta de revisión, no un principio. Si un pilar cambia, las
> preguntas críticas de esta checklist deben poder actualizarse sin
> contradecir el resto de la constitución.

---

## 1. Cómo se usa

1. El reviewer abre el documento o feature a revisar.
2. Recorre las doce preguntas críticas. La respuesta admitida es
   **Sí**, **No** o **No aplica**.
3. Cualquier **No** en una pregunta crítica es un **bloqueo**. La
   revisión falla y se devuelve con la lista de bloqueos.
4. Cualquier **No** en una pregunta complementaria es una **observación
   registrada**, no un bloqueo. La revisión puede aprobar dejando la
   observación en el ADR.
5. El resultado de la revisión se archiva junto al ADR o al documento
   que origina la propuesta.

### Quién puede firmar

- Un reviewer humano con autoridad de design lead.
- Un agente configurado con el context pack que incluye los cinco
  documentos de gobernanza. El resultado firmado por agente requiere
  ratificación humana antes de promover un documento a CANON.

---

## 2. Preguntas críticas (bloquean si la respuesta es "No")

| # | Pregunta | Pilar / fuente |
|---|---|---|
| C1 | ¿Refuerza la fantasía del mundo al que pertenece? | P01, P09 |
| C2 | ¿Usa el verbo nuclear del mundo o justifica explícitamente por qué existe? | P03 |
| C3 | ¿El jugador actúa sobre el concepto (no sólo lo lee o lo contesta)? | P01, P02 |
| C4 | ¿El feedback permite aprender del resultado, no sólo saber si se acertó? | P05, DL-§6 |
| C5 | ¿La teoría o la formalización aparece después de evidencia suficiente? | P02, P06 |
| C6 | ¿La dificultad proviene del sistema y no de opacidad, reinicio opaco o información escondida sin inferencia posible? | P05, DL-§4 |
| C7 | ¿La recompensa principal es de los tipos 1 a 4 (transformación, capacidad, acceso, lectura)? Si es 5 o 6, ¿se está usando para reemplazar a 1? | DL-§2, P08 |
| C8 | ¿Es divertido sin explicar que es educativo? | P09 |
| C9 | ¿Respeta el canon de mayor `authority_level`? | Canon Policy §2 |
| C10 | ¿Es implementable y testeable como unidad? | (DoR global) |
| C11 | ¿Declara qué hipótesis de diseño valida? | (DoR global) |
| C12 | ¿Su promoción a CANON no introduce lore innecesario? | DoD P1 |

### Interpretación

- **C1.** Si el feature es de integración, "el mundo" es el conjunto
  integrado, no uno solo. La integración refuerza la fantasía del
  proyecto (P15), no la de un mundo específico.
- **C2.** "Justificar explícitamente" significa dejar una nota en el
  cuerpo del documento, no en la cabeza del autor.
- **C7.** Cosméticos y narrativa son legítimos; sólo se bloquean cuando
  **sustituyen** a la transformación del mundo.
- **C9.** Canon Policy §2: si contradice, no pasa.
- **C10.** "Testeable como unidad" significa que existe un criterio de
  éxito verificable en juego o en prototipo.
- **C11.** Sin hipótesis nombrada, no hay forma de saber si el feature
  cumple o no.
- **C12.** Si la promoción trae lore nuevo, primero se justifica en
  términos de pilares y luego se considera la promoción.

---

## 3. Preguntas complementarias (observaciones, no bloquean)

| # | Pregunta | Fuente |
|---|---|---|
| O1 | ¿Atraviesa al menos los escalones 1 (percibir), 2 (manipular) y 3 (predecir) de la escala de interacción? | DL-§1 |
| O2 | ¿La tutorialización se sostiene sobre affordance, espacio seguro, consecuencia o reacción de personaje, sin saltar a explicación explícita? | DL-§3 |
| O3 | ¿La fuente de dificultad usada está documentada como una de las válidas? | DL-§4 |
| O4 | ¿Si admite múltiples soluciones, la validación es por condiciones y no por solución fija? | P07 |
| O5 | ¿Si transfiere a otro mundo, respeta el verbo nuclear del mundo destino? | P12, P15 |
| O6 | ¿El frontmatter está completo y respeta el Document Architecture? | DocArch §4 |
| O7 | ¿Las `open_questions` están listadas y referenciadas a una global cuando aplica? | Pillars §4 |
| O8 | ¿La decisión declara su `depends_on` y, si corresponde, su `supersedes`? | DocArch §6 |

### Manejo de observaciones

- Una observación no falla la revisión.
- Una observación **repetida** en tres revisiones consecutivas del mismo
  documento se promueve a bloqueo hasta que se resuelva.
- Una observación **recurrente** en tres documentos distintos sobre
  el mismo pilar se eleva a un ADR de revisión de pilares.

---

## 4. Salidas posibles

| Resultado | Significado | Acción |
|---|---|---|
| **Aprobado** | Cero bloqueos. Observaciones archivadas. | Proceder con la ratificación propuesta. |
| **Aprobado con reservas** | Cero bloqueos. Observaciones materiales. | Proceder y resolver observaciones antes de la siguiente revisión mayor. |
| **Devuelto** | Uno o más bloqueos. | El reviewer anota cada bloqueo con cita a la pregunta crítica y al documento. |
| **Devuelto a PROPOSED** | Tres devoluciones consecutivas sobre el mismo documento. | El documento baja de estado y requiere reprototipado. |

### Documentación

Cada revisión produce un bloque con:

- fecha;
- revisor (humano o agente);
- resultado;
- lista de bloqueos, si los hay;
- lista de observaciones;
- ADR asociado, si lo hay.

El bloque se anexa al documento revisado o al ADR que origina la
propuesta. No se borran revisiones anteriores.

---

## 5. Cuándo NO usar la checklist

- Para un typo, una corrección tipográfica o un fix de un dato: la
  checklist no aplica. Se actualiza `last_ratified` y se sigue.
- Para un cambio de `status` puramente administrativo que no afecta
  contenido (p. ej. reclasificar a LEGACY): la checklist no aplica. Se
  justifica en una nota corta.
- Para una decisión de tooling o pipeline sin impacto en gameplay o
  narrativa: la checklist no aplica. Se documenta en su propio ADR.

En todos los casos anteriores, **la omisión de la checklist debe
declararse** en el commit o en el ADR.

---

## 6. Lo que este documento NO es

- No es un test automatizado. Su uso por un agente es válido pero no
  sustituye la revisión humana para promoción a CANON.
- No es una lista exhaustiva. Si un reviewer detecta un problema que
  ninguna pregunta cubre, lo registra como observación con propuesta de
  ampliar la checklist.
- No mide calidad artística. La calidad artística se evalúa en la
  biblia correspondiente.
- No sustituye a los pilares ni al design language. Esta checklist
  codifica cómo se aplican; no redefine qué debe ser cierto.
