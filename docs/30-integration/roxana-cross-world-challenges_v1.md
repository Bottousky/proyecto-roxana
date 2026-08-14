---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes: []
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P03 verbo nuclear; P12 une-no-uniforma; P15 culminación en integración; P07 varias soluciones)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md (DL §2 recompensa tipo 1; §5 forma de la formalización; §6 feedback)
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md (§2 /30-integration como única capa que puede combinar dos o más mundos)
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md
  - docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md
  - docs/10-global/ROXANA_METAPROGRESSION_v1.md (regla anti-dilución, filtros de cruce)
  - docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md (hilo de los cruces, preguntas 6 y 7)
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md (CONECTAR)
  - docs/20-worlds/physica/vision/physica-vision_v1.md (EXPERIMENTAR)
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md (PROGRAMAR)
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md (TRANSFORMAR)
open_questions:
  - GQ-4 (transversal) — cómo se gobiernan los cruces para no diluir los verbos (regla de los tres filtros en este documento, §3)
  - CWC-Q1 — si el catálogo de los siete ejemplos del pack F se cierra en este documento o se delega a un ADR posterior
  - CWC-Q2 — si los sistemas híbridos se hospedan en el Instituto o en una región nueva del mundo destino
  - CWC-Q3 — si los proyectos integradores se juegan **antes** de cerrar los ciclos de los mundos involucrados, o sólo después
  - CWC-Q4 — qué forma tiene la "estrella de validación" cuando un desafío requiere cuatro verbos: ¿el jugador juega el desafío entero, o el sistema le ofrece un atajo si ya tiene un `TRANSFERRED` previo?
  - CWC-Q5 — si el catálogo de los cruces es abierto (los jugadores pueden sugerir) o cerrado (sólo lo que el GDD aprueba)
  - CWC-Q6 — si un sistema híbrido puede estar parcialmente restaurado y seguir activo, o si requiere los cuatro verbos en estado `APPLIED` mínimo

---

# ROXANA — CROSS-WORLD CHALLENGES · v1

Documento de autoridad nivel 3. Biblia de integración. Define
los **cuatro tipos de cruces interdisciplinarios** entre
Ohmdal, Physica, Bitland y Arithmos, los **filtros que un
cruce debe pasar** para no diluir la identidad de un verbo
nuclear, y el **catálogo mínimo** de desafíos habilitantes
(los siete ejemplos del pack F más uno de cierre —
"ascensor").

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Relación con la gobernanza.** Este documento es la
> **única** autoridad de /30-integration que combina dos o
> más mundos (DocArch §2). Cualquier nuevo cruce interdisciplinario
> debe pasar los filtros de §3 y registrar su `depends_on`
> contra este documento.

> **Regla dura.** Los cruces interdisciplinarios son
> **desafíos, no niveles compartidos** (DoD P6; pack F §9).
> El jugador **no viaja con inventario entre mundos**. Lo
> que cruza es la **comprensión** (P12, P15; ver
> `ROXANA_METAPROGRESSION_v1.md` §4).

---

## 1. Tesis

> **Un cruce interdisciplinario es un problema real del
> proyecto que sólo puede resolverse combinando dos o más
> verbos nucleares. El jugador no recibe cuatro exámenes:
> construye un sistema.**

Tres consecuencias operativas:

- **El cruce es sistémico.** No es un puzzle de cada mundo
  en secuencia; es un único sistema que el jugador debe
  hacer funcionar. La evaluación es por **condiciones de
  funcionamiento**, no por respuestas aisladas.
- **El cruce respeta la identidad.** Cada verbo nuclear
  entra con su **lectura propia**, no como mecánica
  subordinada. El cruce **suma** verbos; no los promedia.
- **El cruce produce un artefacto híbrido.** El resultado
  es un **sistema** que vive en el Instituto (o en una
  región) y que **no existía antes** del cruce. Ese
  artefacto es la prueba material de la transferencia.

---

## 2. Lo que un cruce NO es

| Idea | Por qué no entra |
|---|---|
| Nivel compartido (mapa que mezcla dos mundos) | El jugador no viaja con inventario; el cruce vive en el Instituto o en una región, no en un nivel-mixto. |
| Examen con preguntas de cada mundo | Viola P11 (la narrativa no explica lo que el sistema puede mostrar) y DL §3 (la explicación explícita es último recurso). |
| Puzzle con cuatro mini-puzzles en serie | Convierte el cruce en una **prueba sumativa**, no en un sistema. |
| Traducción de un mundo al lenguaje de otro | Implica que un mundo es "dialecto" del otro. P12 lo prohíbe. |
| Inventario compartido entre mundos | Viola P12, P01 y la decisión de cierre de GQ-5. |
| Tutorial que explica el cruce antes de jugarlo | Viola P02, P06 y la regla temporal de la Bitácora. |
| Quiz / multiple choice como cierre del cruce | Regla dura de las sesiones P2–P5; múltiple choice no es interacción principal. |

---

## 3. Regla de los tres filtros (re-implementación operativa
de P12 + GQ-4)

> **Ningún cruce interdisciplinario entra al proyecto si
> falla al menos uno de los tres filtros.**

1. **Filtro de identidad.** El cruce no reemplaza la
   mecánica nuclear de ningún mundo. Si un cruce convierte
   Ohmdal en un editor de bloques, **falla**. Si convierte
   Arithmos en un puzzle de optimización, **falla**.
2. **Filtro de funcionalidad.** El cruce exige que **cada**
   verbo nuclear **aporte una lectura indispensable**. Si un
   verbo se puede omitir sin afectar el resultado del
   sistema, el cruce no era interdisciplinario: era un
   puzzle de un solo mundo.
3. **Filtro narrativo.** El cruce tiene **una razón
   diegética** documentada en la biblia narrativa
   correspondiente. Si la razón es "queda lindo", el cruce
   no entra.

> Los tres filtros son **no negociables**. Si un cruce los
> pasa, queda registrado en `ROXANA_CONTENT_AUTHORITY_MAP_v1.md`
> §3 con su `depends_on` y su `owners` por mundo.

### 3.1. Forma del veredicto

Cada cruce se etiqueta con su composición de verbos:

- **Tipo 1 — Lectura cruzada.** Un concepto de un mundo
  **ayuda a comprender** otro. Sin puzzle nuevo. El sistema
  detecta el cruce por la Red conceptual de la Bitácora.
- **Tipo 2 — Herramienta cruzada.** Un instrumento de un
  mundo **agrega una lectura** al puzzle de otro. La
  mecánica nuclear del destino se mantiene intacta.
- **Tipo 3 — Sistema híbrido.** Un problema **real** del
  proyecto requiere **dos mundos**. El jugador debe hacer
  funcionar el sistema.
- **Tipo 4 — Proyecto integrador.** El problema requiere
  **tres o cuatro mundos** y produce un artefacto
  permanente en el Instituto o en una región.

> **Jerarquía.** Tipo 1 < Tipo 2 < Tipo 3 < Tipo 4. El
> paso de un tipo al siguiente no es automático: requiere
> que el Tipo anterior esté disponible en al menos un
> jugador. Ver `ROXANA_METAPROGRESSION_v1.md` §6.

---

## 4. Catálogo mínimo (los siete del pack F + ascensor
desarrollado)

El pack F enumera siete ejemplos: **ascensor, robot,
estación meteorológica, puente automatizado, invernadero,
vehículo, red de iluminación adaptativa**. De esos siete,
este documento desarrolla **uno a modo de referencia** (el
ascensor, ejemplo canónico del pack F §10) y deja los otros
seis como **borrador de catálogo** sujeto a ADR.

> El catálogo completo **no** se publica en este
> documento. Se publica como **ADR posterior** (ver
> `CWC-Q1` en frontmatter), firmado por Manuel, con su
> filtro de los tres aplicado caso por caso.

### 4.1. Ascensor (Tipo 4 — desarrollado)

**Razón diegética.** El Instituto tiene un hueco vertical
en el hall; el ascensor existía y dejó de funcionar.
Restaurar el ascensor es **restaurar la circulación
vertical** del Instituto, no "meter un minijuego de
integración".

**Composición de verbos.**

| Mundo | Lectura que aporta al ascensor | Indispensable porque… |
|---|---|---|
| **Physica (EXPERIMENTAR)** | masa del habitáculo y la carga; fuerzas; energía; contrapeso. | Sin lectura de masa/energía/contrapeso, el ascensor no se mueve con seguridad. |
| **Ohmdal (CONECTAR)** | motor eléctrico; potencia; protección (fusible, disyuntor). | Sin circuito, el motor no recibe energía. |
| **Bitland (PROGRAMAR)** | estados (parado, subiendo, bajando, en piso); sensores de piso; control de seguridad (no cerrar puertas con carga). | Sin lógica de estados, el ascensor queda en loop o se mueve con puertas abiertas. |
| **Arithmos (TRANSFORMAR)** | relaciones entre variables (carga útil vs. masa del contrapeso); dimensionamiento; optimización (elegir un balance energéticamente aceptable). | Sin dimensionamiento, el sistema puede ser físicamente correcto pero energéticamente inviable. |

**Cómo se juega.** El jugador **no** recibe un puzzle
separado por cada mundo. El Instituto presenta un único
hueco vertical con: un motor (Ohmdal), un habitáculo con
carga (Physica), un panel lógico de control (Bitland) y
una planilla de dimensionamiento (Arithmos). El jugador
debe **armar el sistema** de modo que las cuatro lecturas
sean coherentes. La validación es por **condiciones**:

- el habitáculo se mueve entre pisos;
- el sistema no se dispara la protección;
- el balance energético es admisible;
- las puertas no cierran con carga presente;
- hay al menos un margen de seguridad documentado.

> **No hay "solución canónica".** El jugador puede elegir
> combinaciones distintas de contrapeso, potencia del
> motor, lógica de control y balance. Mientras las
> condiciones se cumplan, el sistema funciona. Esa
> multiplicidad es P07.

**Recompensa observable.**

- El ascensor funciona en el Instituto (transformación
  material, DL §2 tipo 1).
- La Bitácora marca las cuatro entradas involucradas
  como `TRANSFERRED` (Bitácora capa 4 y estado 6).
- El Instituto abre el acceso al **nivel superior** (si
  existe) o a una nueva sala que antes estaba cerrada.

### 4.2. Borrador de catálogo (los otros seis)

> El catálogo de los seis ejemplos restantes es
> **borrador**. La decisión de cierre se delega a un
> ADR posterior (ver `CWC-Q1`).

| Ejemplo | Tipo probable | Composición preliminar (a confirmar) | Estado |
|---|---|---|---|
| **Robot** | Tipo 3 (híbrido) | Physica (cuerpo), Ohmdal (actuación), Bitland (autonomía condicional), Arithmos (optimización de trayectorias) | Borrador |
| **Estación meteorológica** | Tipo 3 | Physica (sensores), Ohmdal (alimentación y señal), Bitland (logging), Arithmos (calibración y correlación) | Borrador |
| **Puente automatizado** | Tipo 3 | Physica (cargas, materiales), Ohmdal (motores, protecciones), Bitland (secuencia y seguridad), Arithmos (factorización del tráfico) | Borrador |
| **Invernadero** | Tipo 2/3 | Physica (luz, calor, humedad), Ohmdal (riego eléctrico), Bitland (automatización de horarios), Arithmos (proporciones de recursos) | Borrador |
| **Vehículo** | Tipo 4 | Physica (tracción, masa), Ohmdal (motor, protecciones), Bitland (control de velocidad, eventos), Arithmos (autonomía/rendimiento) | Borrador |
| **Red de iluminación adaptativa** | Tipo 2/3 | Physica (intensidad, espectro), Ohmdal (circuito), Bitland (eventos), Arithmos (optimización del consumo) | Borrador |

> Los seis están sujetos a los tres filtros antes de
> entrar al proyecto. Si un filtro falla, se
> reformulan o se descartan.

---

## 5. Habilitación y gating

> **No se juega un cruce interdisciplinario hasta que los
> verbos involucrados estén en `APPLIED`.**

| Tipo de cruce | Requisito mínimo |
|---|---|
| Tipo 1 — Lectura cruzada | Al menos un `OBSERVED` + un `HYPOTHESIZED` en el lado origen. Sin requisito en el destino. |
| Tipo 2 — Herramienta cruzada | Al menos un `APPLIED` en el lado origen. El destino debe estar en su primer ciclo. |
| Tipo 3 — Sistema híbrido | `APPLIED` en **ambos** lados. El desafío se habilita tras el Interludio I (ver `ROXANA_CAMPAIGN_STRUCTURE_v1.md`). |
| Tipo 4 — Proyecto integrador | `APPLIED` en **tres o cuatro** lados. Se habilita tras el Ciclo II. |

> **Bloqueo por dependencia, no por narrativa.** El
> gating es sistémico: el jugador no puede jugar el
> desafío hasta que el sistema detecte los prerrequisitos.
> No hay un NPC que diga "todavía no estás listo".

---

## 6. Forma del veredicto y de la recompensa

> El veredicto de un cruce es **siempre sistémico** y la
> recompensa es **siempre material**.

### 6.1. Veredicto

El cruce se evalúa por **condiciones de funcionamiento**.
No hay "respuesta correcta". Si el sistema cumple las
condiciones, el cruce pasa. Si no, el sistema muestra **qué
hizo** la solución, no sólo si pasó (DL §6).

### 6.2. Recompensa

La recompensa de un cruce es **cuatro veces observable**,
ninguna numérica (ver `ROXANA_METAPROGRESSION_v1.md` §5):

1. **Aparición de un mecanismo híbrido en el Instituto.**
2. **`TRANSFERRED` en la Bitácora** para las entradas
   involucradas.
3. **Apertura de un acceso** (sala, región, diálogo).
4. **Registro de la relación en la Red conceptual.**

---

## 7. Lo que este documento NO es

- No es un catálogo cerrado. El catálogo completo se
  publica por ADR.
- No prescribe puzzles concretos. Sólo define **el sistema
  de cruces**. La implementación de cada cruce vive en su
  biblia de mundo correspondiente.
- No prescribe cámara, motor ni pipeline.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
- No es canon: es `PROPOSED` hasta ratificación.
