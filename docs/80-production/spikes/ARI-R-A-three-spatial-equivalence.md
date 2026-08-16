---
status: EXPERIMENTAL
authority_level: 6
version: v1
last_ratified: 2026-08-16
experiment_id: ARI-R-A
paired_with: ARI-R-B
---

# ARI-R-A — Three.js Spatial Equivalence

## Question

¿Una representación material 2.5D hace que el jugador descubra equivalencias y conservación de estructura mejor que una vista diagramática 2D?

## Fairness lock

- Pair: `ARI-R-B`.
- Mismo baseline y transformation core.
- Builder: MiniMax M3 / MiniMax Code.
- Player Agent: GPT-5.6 Luna blind-first.
- Repair: DeepSeek V4 Flash.
- Adversarial review: mismo GLM pin de B.
- Normal loops: 1–3; hard cap: 5.
- No leer/copiar implementación específica de B.
- Usar versión Three ya fijada por el baseline del spike salvo que la pregunta del experimento sea explícitamente una actualización.

## Shared transformation core

TypeScript puro, consumido también por B:

- mathematical object `12`;
- representations;
- legal grouping/recomposition transforms;
- invariants;
- undo/redo;
- validators;
- no Three/Pixi/SVG imports.

## Learning Contract

**Concepto:** equivalencia / factorización inicial como transformación conservando cantidad.

- Percibe: 12 elementos materiales antes de notación.
- Manipula: agrupación/recomposición.
- Predice: si una transformación conservará la cantidad/estructura objetivo.
- Consecuencia: forma/agrupación cambia, invariante se mantiene visible.
- Fallo: transformación inválida muestra qué propiedad rompió sin decir la respuesta.
- Transferencia: nuevo arreglo equivalente que no apareció en el tutorial/primer beat.
- Formalización: `12 = 3×4 = 6×2` sólo después de experiencia suficiente.

## Three-specific hypothesis

La profundidad compra comprensión mediante:

- objetos con presencia material;
- agrupaciones/espacios negativos;
- área/silueta/recomposición;
- continuidad visual al transformar;
- cámara casi ortográfica para minimizar distorsión.

No usar perspectiva dramática, sombras o VFX si ocultan conteo/invariantes.

## Player fixture

1. estado inicial de 12 piezas;
2. reagrupar en 3×4;
3. transformar a 6×2;
4. una variante que exige descubrir otra equivalencia;
5. una transformación inválida con feedback informativo;
6. notación sólo al final;
7. undo/redo;
8. desktop + touch.

## Acceptance criteria

- [ ] core pasa tests sin renderer.
- [ ] jugador predice conservación antes de confirmar transformación.
- [ ] puede explicar qué cambió y qué permaneció igual.
- [ ] resuelve una variante no mostrada.
- [ ] profundidad no requiere rotar cámara para entender el estado principal.
- [ ] ninguna oclusión crítica impide contar/relacionar objetos.
- [ ] touch puede seleccionar/agrupar sin precisión motriz fina.
- [ ] Player Agent sin BLOCKER/MAJOR.
- [ ] adversarial reviewer sin BLOCKER/MAJOR.

## Evidence

- baseline + Three version;
- loops/intervención humana;
- screenshots estados clave desktop/mobile;
- video/sequence de transformación si ayuda;
- Player Agent report;
- errores/ambigüedades de percepción;
- performance sólo si material;
- lista de conceptos para los que Three agregó valor y para los que agregó ruido.

## Stop

PASS, ESCALATE o hard cap 5. No convertir el spike en dirección artística completa de Arithmos.
