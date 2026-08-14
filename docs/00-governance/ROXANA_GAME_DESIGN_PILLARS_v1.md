---
status: PROPOSED
authority_level: 0
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/00_ROXANA_GDD_GLOBAL_REBOOT_v1.md (sección 1 — tesis; sección 3 — qué cambia; sección 6 — regla anti-clase; sección 7 — capas de profundidad; sección 9 — progresión compartida; sección 10 — cruces entre mundos; sección 11 — estrategia narrativa)
  - _reference_gdd_reboot_v1/05_AUDITORIA_CANON_LEGACY.md (sección 1 — hallazgo general; sección 7 — regla futura sobre auto-proclamación de canon)
  - draft "Borrador — Game Design Pillars" contenido en A_ROXANA_DESIGN_CONSTITUTION.md
depends_on: []
open_questions:
  - GQ-1 — ¿La Bitácora es un único sistema transversal o cada mundo debe poder tener una capa propia sin romper la lectura común?
  - GQ-2 — ¿Qué criterios formales deciden cuándo un contenido PROPOSED de Bitland o Arithmos sube a CANON sin diluir el ritmo de validación en prototipo?
  - GQ-3 — ¿El regreso a un mundo ya visitado exige siempre una razón diegética, o se permite el retorno libre como sistema?
  - GQ-4 — ¿Cómo se gobiernan los cruces interdisciplinarios para que no erosionen la identidad de cada verbo nuclear?
  - GQ-5 — ¿Las herramientas, instrumentos o "toys" descubiertos en un mundo se transfieren físicamente a otros, o se vuelven a aprender en cada contexto?
  - GQ-6 — ¿Qué forma toma la recompensa de "transferencia" entre mundos sin convertir puntos o experiencia acumulada en motivación dominante?
---

# ROXANA — GAME DESIGN PILLARS · v1

Documento fundacional de autoridad nivel 0. Toda decisión de diseño de cualquier
mundo debe poder ser aceptada o rechazada contra estos pilares. Si un pilar
entra en conflicto con otro, el conflicto se eleva explícitamente: no se
resuelve por implementación ni por mayoría.

Este archivo **no** describe campañas, arcos, regiones, personajes ni
mecánicas concretas. Su única función es enunciar reglas operativas.

> **Estado del documento.** Este archivo se publica como `PROPOSED` en v1
> porque acaba de salir de la sesión P1 sin ratificación autoral explícita
> de Manuel. La promoción a `CANON` requiere un ADR. Véase
> `ROXANA_CANON_POLICY_v1.md` §5.

---

## 1. Los quince pilares

Cada pilar se presenta con:

- **Enunciado** — la regla.
- **Test** — pregunta que permite aceptarlo o rechazarlo.
- **Implicación** — qué tipo de decisión fuerza.

### P01 — La disciplina existe como regla del mundo

**Enunciado.** El conocimiento no se pregunta desde afuera: modifica qué puede
observarse, manipularse o construirse dentro del mundo.

**Test.** Si se eliminan todos los textos y fórmulas del mundo, ¿la mecánica
sigue representando el concepto? Si la respuesta es no, el concepto todavía no
encontró su traducción jugable.

**Implicación.** Ningún contenido puede entrar a un mundo si su único vehículo
es la palabra, el número o la fórmula. La acción del jugador debe ser, en sí
misma, aplicación del concepto.

---

### P02 — Experimentar antes de formalizar

**Enunciado.** La secuencia pedagógica base es inviolable:

> fenómeno → acción → consecuencia → hipótesis → nueva prueba → formalización → reutilización

**Test.** ¿El jugador puede llegar al símbolo, al nombre técnico o a la
fórmula después de haber generado evidencia suficiente? Si la formalización
aparece antes de la acción, se viola el pilar.

**Implicación.** La Bitácora, los NPCs y los recursos académicos pueden
**reconocer** lo que el jugador ya hizo, pero no pueden **adelantarlo**.

---

### P03 — Cada mundo tiene un verbo nuclear

**Enunciado.**

- Ohmdal: **CONECTAR**.
- Physica: **EXPERIMENTAR**.
- Bitland: **PROGRAMAR**.
- Arithmos: **TRANSFORMAR**.

**Test.** ¿El sistema, el puzzle o la escena refuerzan el verbo de su mundo,
o existen sólo porque "sería educativo"? Si no refuerzan, deben justificar
explícitamente por qué existen.

**Implicación.** Toda adición a un mundo debe poder responder: "¿qué verbo
refuerza esto?". Si la respuesta es otro verbo, pertenece a otro mundo o
debe ser reescrita.

---

### P04 — Un buen puzzle demuestra comprensión

**Enunciado.** Resolver exige leer estado, predecir consecuencias y modificar
un sistema. No basta con recordar un dato aislado.

**Test.** ¿Se puede resolver el puzzle sin haber comprendido el concepto
subyacente? Si la respuesta es sí, el puzzle se reduce a trivia.

**Implicación.** Un puzzle puede ser difícil, abierto o lento, pero nunca
puede resolverse por descarte, por azar o por aplicación mecánica de un
algoritmo memorizado sin lectura del estado.

---

### P05 — Fallar produce información

**Enunciado.** El mundo debe responder de forma observable al error, de modo
que el jugador pueda inferir por qué algo no funcionó.

**Test.** Cuando el jugador falla, ¿el sistema le muestra **qué hizo** su
solución, o sólo le dice "incorrecto"? Si muestra lo segundo, el fallo
produce frustración, no aprendizaje.

**Implicación.** Prohibido el feedback vacío. Prohibido el reinicio opaco.
Prohibido el castigo por ensayo razonable.

---

### P06 — La abstracción se gana

**Enunciado.** La representación simbólica, numérica o algorítmica aparece
después de la consecuencia observable, nunca antes.

**Test.** ¿Aparece un símbolo, un diagrama o un número antes de que el
jugador haya tocado la consecuencia que ese símbolo describe? Si la respuesta
es sí, se está enseñando teoría, no permitiendo descubrir.

**Implicación.** La notación es un mapa, no un atajo.

---

### P07 — Varias soluciones cuando la disciplina lo permita

**Enunciado.** Ingeniería, programación y matemática ganan valor cuando una
solución puede ser correcta pero distinta en costo, robustez, elegancia,
velocidad o generalidad.

**Test.** ¿El sistema de validación rechaza alternativas razonables sólo
porque no coinciden con la solución canónica? Si la respuesta es sí, el
mundo está sobre-restringiendo.

**Implicación.** La campaña principal exige funcionalidad y seguridad
básicas. La maestría premia optimización, elegancia y generalidad. La
validación se hace por **condiciones**, no por **solución fija**.

---

### P08 — El conocimiento restaura

**Enunciado.** Aprender debe dejar una marca observable en el mundo: una red
vuelve a encenderse, una estructura vuelve a moverse, una ciudad automatiza
una función, una región geométrica recupera coherencia, el Instituto revive.

**Test.** Después de superar el ciclo pedagógico, ¿el mundo cambió de forma
visible y persistente? Si el cambio es sólo narrativo, el conocimiento no
está cerrando su ciclo.

**Implicación.** Ningún concepto adquirido puede quedarse en "ya lo sé". La
restauración es la prueba de que hubo comprensión.

---

### P09 — El juego debe sobrevivir sin la etiqueta "educativo"

**Enunciado.** Una persona debería poder jugarlo por exploración, desafío,
belleza, sistemas, misterio o maestría, sin que la motivación dependa de
aprender algo.

**Test.** Quitada toda mención a "educativo", a un temario o a un objetivo
curricular, ¿el mundo sigue siendo deseable como experiencia? Si la respuesta
es no, el diseño no está maduro.

**Implicación.** El contenido académico es insumo, no eslogan. La motivación
primaria del jugador es la fantasía del mundo, no el aprendizaje.

---

### P10 — El contenido académico no manda sobre el pacing

**Enunciado.** Una secuencia curricular es insumo, no level design. El orden
final puede y debe reestructurarse para construir una curva jugable mejor.

**Test.** ¿Hay algún segmento del mundo cuya única razón de existir es
"corresponde a la unidad N del temario"? Si la respuesta es sí, ese
segmento está obedeciendo al currículo, no al juego.

**Implicación.** La autoridad sobre el orden y el ritmo la tiene el diseño
de sistemas, no la cobertura curricular.

---

### P11 — La narrativa no explica lo que el sistema puede mostrar

**Enunciado.** Los NPCs tienen cultura, intereses y conflictos. No son
presentadores de PowerPoint. Si el mundo ya muestra algo, la narración no
lo duplica.

**Test.** ¿El jugador necesita leer un diálogo para entender qué acaba de
pasar en el sistema? Si la respuesta es sí, el sistema está fallando
visualmente o sonoramente.

**Implicación.** La narración se reserva para contexto, emoción, dilema y
misterio. Nunca para sustituir lectura.

---

### P12 — El Instituto une; no uniforma

**Enunciado.** Los mundos comparten protagonista, Bitácora, metaprogresión,
misterio global, lenguaje de feedback y reglas pedagógicas. No están
obligados a compartir cámara, combate, género, ritmo ni arte exacto.

**Test.** ¿La plataforma obliga a un mundo a usar un sistema que le es
ajeno "por coherencia"? Si la respuesta es sí, se está confundiendo
identidad con uniformidad.

**Implicación.** La integración entre mundos ocurre al final, sobre
identidades jugables propias, no al inicio por convención estética o
técnica.

---

### P13 — La maestría es opcional, la comprensión no

**Enunciado.** La campaña enseña intuición y formalización suficiente. Los
retos opcionales permiten optimización y profundidad cercana a problemas
reales.

**Test.** ¿Hay contenido del mundo que un jugador sin interés en maestría
no puede completar? Si la respuesta es no, la campaña está contaminada por
contenido de posgrado.

**Implicación.** Los retos de optimización viven en una capa explícita,
accesible pero no obligatoria.

---

### P14 — Toda complejidad nueva debe comprar posibilidad jugable

**Enunciado.** Si un concepto agrega vocabulario pero no agrega una decisión
o una lectura nueva, todavía no encontró su representación correcta.

**Test.** ¿La nueva variable, componente o regla cambia qué puede hacer el
jugador, o sólo agrega nomenclatura? Si sólo agrega nomenclatura, está
sobre-teorizando.

**Implicación.** La complejidad se introduce con su mecánica asociada. No
se admite teoría suelta sin contraparte jugable.

---

### P15 — Roxana culmina en integración

**Enunciado.** Los mundos deben primero ser autosuficientes. Más tarde, los
sistemas reales deben mostrar que electrónica, física, computación y
matemática se entrelazan.

**Test.** ¿Existe un desafío del proyecto que sólo pueda resolverse
combinando dos o más mundos? Si la respuesta es no, todavía no se diseñó
la integración real.

**Implicación.** Los cruces interdisciplinarios esperan a que cada mundo
tenga identidad jugable propia. Adelantarlos diluye los verbos.

---

## 2. Conflictos entre pilares

Si dos pilares entran en tensión (por ejemplo P07 "varias soluciones" frente
a una decisión de pacing), la resolución se eleva a un ADR con tres
elementos:

1. los dos pilares en juego;
2. el coste de privilegiar uno sobre el otro;
3. la decisión y su justificación operativa.

Ningún conflicto se resuelve por implementación silenciosa.

---

## 3. Cambios permitidos

Un pilar se modifica sólo por una de dos razones:

- nueva evidencia de prototipo que demuestre que el pilar bloquea un objetivo
  aprobado del proyecto;
- decisión autoral explícita que justifique el cambio y declare el coste.

Cualquiera de las dos requiere un ADR en `/docs/00-governance/adr/` y un
cambio de `version` en este documento.

---

## 4. Global Open Questions (registro)

Estas preguntas están abiertas a nivel de proyecto y bloquean o condicionan
decisiones posteriores. Se mantienen aquí hasta su cierre o promoción a
documento de autoridad propia. Las preguntas locales de cada documento
(Design Language, Canon Policy, Document Architecture, Review Checklist)
viven en su propio frontmatter y se referencian desde aquí cuando afectan
a un pilar.

- **GQ-1.** ¿La Bitácora es un único sistema transversal o cada mundo debe
  poder tener una capa propia sin romper la lectura común?
- **GQ-2.** ¿Qué criterios formales deciden cuándo un contenido PROPOSED
  de Bitland o Arithmos sube a CANON sin diluir el ritmo de validación en
  prototipo?
- **GQ-3.** ¿El regreso a un mundo ya visitado exige siempre una razón
  diegética, o se permite el retorno libre como sistema?
- **GQ-4.** ¿Cómo se gobiernan los cruces interdisciplinarios para que no
  erosionen la identidad de cada verbo nuclear?
- **GQ-5.** ¿Las herramientas, instrumentos o "toys" descubiertos en un
  mundo se transfieren físicamente a otros, o se vuelven a aprender en cada
  contexto?
- **GQ-6.** ¿Qué forma toma la recompensa de "transferencia" entre mundos
  sin convertir puntos o experiencia acumulada en motivación dominante?

Las preguntas se cierran o se promueven a documento de autoridad en una
sesión posterior. Hasta entonces, ningún documento puede tratar estas
preguntas como resueltas.

---

## 5. Lo que este documento NO es

- No es un GDD de campaña.
- No es un manifiesto estético.
- No reemplaza los GDDs de cada mundo; los habilita.
- No describe tecnología, motor, lenguaje ni pipeline.

Cualquiera de esas inclusiones aquí es una señal de que algo se escribió en
el archivo equivocado.
