---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - WORKFLOW.md
  - TASK_CONTRACT_TEMPLATE.md
---

# Definition of Done

Una milestone está DONE sólo si todos los puntos aplicables pasan.

## Universal

- build verde;
- tests del scope verdes;
- `npm run verify` verde;
- runtime real abierto y recorrido;
- cero error nuevo de consola relevante;
- acceptance criteria satisfechos;
- no se introdujo dependencia/engine/canon silenciosamente;
- Player Agent sin BLOCKER/MAJOR;
- adversarial reviewer sin BLOCKER/MAJOR cuando el cambio entra por PR/milestone material;
- no hay BLOCKER/MAJOR abierto del scope.

## Learning Contract

Para contenido pedagógico:

- el jugador percibe el fenómeno/estado relevante antes de formalización;
- puede manipular una variable/relación real del sistema;
- el diseño le permite formular o ejecutar una predicción;
- la consecuencia es observable;
- un fallo razonable produce información, no sólo “incorrecto”;
- la formalización aparece después de evidencia suficiente;
- existe una variante/transferencia definida y el sistema permite comprobarla;
- si sólo un playtest humano puede validar la comprensión final, esa deuda queda explícita: una IA no inventa evidencia humana.

## Gameplay

- el resultado se verifica por estado/consecuencia, no sólo por render;
- restart/reload relevante funciona;
- caminos alternativos declarados siguen funcionando;
- core pedagógico permanece puro/testeable cuando aplica;
- no se convirtió una solución particular en la única respuesta si el diseño exige varias;
- control/cámara/feedback fueron probados por Player Agent como usuario, no sólo inspeccionados desde source.

## Visual / spatial

- evaluación en cámara/runtime real;
- escala/silueta/occlusión legibles;
- colliders coinciden suficientemente con lo visible;
- landmarks/rutas/affordances contractuales son legibles;
- viewport mobile/touch incluido cuando aplica;
- golden-frame/reference review cuando el contrato lo exige;
- no se usa “AAA” como criterio sin rúbrica o referencia concreta.

## Assets

- procedencia/licencia registrada;
- escala, frente, pivote, collider y sockets correctos cuando aplican;
- variante runtime optimizada cuando aplica;
- asset revisado en el juego, no sólo en Blender/generador;
- source-first/procedural assets tienen ownership/version reproducible;
- ningún pack con provenance dudosa entra wholesale sin auditoría.

## Performance / web-mobile

Cuando el cambio toca renderer, escena, assets o densidad:

- budget contractual medido en desktop;
- touch/mobile path funcional;
- no existe una dependencia WebGPU-only accidental si el target exige fallback;
- draw calls/textures/memory se inspeccionan sólo cuando son materialmente relevantes, usando profiler/Inspector/Spector cuando corresponda.

## Human review

Es obligatoria antes de integrar cuando el cambio toca diseño, canon, engine, arquitectura, ganador de spike o decisión visual material.

DONE no significa “el agente está satisfecho”. Significa que **mechanical gates + Player Agent + adversarial review aplicable + Learning Contract + gate humano requerido** permiten cerrar el alcance.
