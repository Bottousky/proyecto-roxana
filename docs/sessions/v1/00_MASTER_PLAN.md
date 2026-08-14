# PROYECTO ROXANA — PLAN DE SESIONES DE DISEÑO
## De GDD conceptual a documentación de producción · v1.0

**Estado:** operativo / listo para ejecutar en sesiones separadas del Proyecto Roxana.  
**Objetivo:** convertir los GDD Reboot actuales en una documentación suficientemente precisa para guiar prototipado, producción y orquestación de agentes sin que cada ejecución reinvente el diseño.

---

# 1. Principio de trabajo

Los documentos `GDD Reboot v1` existentes son la **constitución conceptual**. Las próximas sesiones no deben reemplazarlos de manera accidental: deben bajar de nivel de abstracción.

La cadena de autoridad propuesta es:

1. **Roxana Design Constitution**
2. **World Vision / World Bible**
3. **Gameplay & Systems**
4. **Puzzle Grammar / Level Design Rules**
5. **Narrative & Content**
6. **Vertical Slice**
7. **Production specs / tasks / assets**
8. **Implementation evidence**

Una decisión técnica nunca puede cambiar una decisión de diseño de nivel superior sin elevar explícitamente un conflicto.

---

# 2. Las seis sesiones

## SESIÓN A — Roxana Design Constitution
Cierra pilares, lenguaje de diseño, jerarquía documental, canon y reglas de autoridad.

## SESIÓN B — Ohmdal Production GDD
Convierte `CONECTAR` en un juego producible: controles, instrumentos, sistema eléctrico, puzzle grammar, progresión, Arco I y vertical slice.

## SESIÓN C — Physica Production GDD
Convierte `EXPERIMENTAR` en un puzzle-platformer físico producible: locomoción, manipulación, simulación legible, familias de puzzles, progresión y vertical slice.

## SESIÓN D — Bitland Foundation + Production GDD
Diseña desde una hoja mucho más limpia el mundo `PROGRAMAR`: lenguaje jugable, ciudad ejecutable, robots/procesos, automatización, debugging y progresión.

## SESIÓN E — Arithmos Foundation + Production GDD
Diseña `TRANSFORMAR`: matemática como sustancia del mundo, equivalencias, representación, geometría y manipulación espacial sin convertirlo en una colección de ejercicios.

## SESIÓN F — Roxana Metagame & Cross-World Systems
Diseña Instituto, Bitácora, perfil, metaprogresión, cruces interdisciplinarios, estructura global de campaña y reglas de integración.

---

# 3. Qué NO debe ocurrir

- No producir cuatro campañas completas antes de validar sus verbos.
- No dejar que el temario dicte escenas sin pasar por la gramática jugable.
- No llenar huecos de canon como si fueran hechos.
- No usar multiple choice como interacción principal.
- No convertir la Bitácora en manual previo.
- No empezar por arquitectura técnica o elección de motor.
- No confundir “más contenido” con “más diseño”.
- No pedir a un modelo que “haga el juego completo” a partir de estos documentos.
- No mover un documento de `PROPOSED` a `CANON` sin decisión autoral.

---

# 4. Definition of Ready para producción

Un mundo está listo para prototipado serio cuando tiene:

- fantasía del jugador inequívoca;
- verbo nuclear;
- core loop;
- 5–8 sistemas primarios definidos;
- interaction model;
- feedback model;
- failure model;
- puzzle grammar;
- difficulty grammar;
- mechanics progression;
- un slice de 15–30 minutos especificado escena por escena;
- criterios para saber si ese slice funciona;
- lista de preguntas que el prototipo debe responder.

No hace falta tener toda la campaña escrita.

---

# 5. Definition of Ready para campaña

Después del vertical slice validado:

- world structure;
- actos/regiones;
- progression map;
- character arcs;
- content taxonomy;
- level design rules;
- difficulty curve;
- optional mastery;
- accessibility;
- art/audio/UI bibles;
- educational mapping;
- content database;
- production roadmap.

---

# 6. Política para agentes

Todo agente que trabaje sobre Roxana debería recibir:

1. objetivo de tarea;
2. documentos de autoridad mínimos;
3. estado de canon de cada fuente;
4. output contract;
5. decisiones que NO puede modificar;
6. preguntas abiertas relevantes;
7. criterio de aceptación;
8. presupuesto / tiempo / modelo según la tarea.

El `Studio Director` decide WHAT y arma el ContextPack.  
Los equipos especializados diseñan HOW dentro de su nivel de autoridad.  
Los revisores comparan contra los documentos, no contra una idea improvisada.

---

# 7. Orden recomendado de ejecución

A → B → C → D → E → F.

Se puede empezar F en paralelo solo en lo que sea estrictamente global, pero **los cruces interdisciplinarios deberían esperar a que B–E tengan identidades jugables propias**.

---

# 8. Resultado esperado

Al terminar estas seis sesiones, Proyecto Roxana debería tener:

- una constitución global de diseño;
- cuatro GDDs de producción coherentes entre sí;
- cuatro vertical slices conceptualmente especificados;
- una Bitácora diseñada como sistema real;
- metaprogresión e Instituto definidos;
- un mapa de campaña global;
- contratos claros para Level Design, Narrative, Art, Audio, UI, Tech y QA;
- contexto utilizable por Agentic Workbench sin alimentar todos los documentos a todos los agentes.
