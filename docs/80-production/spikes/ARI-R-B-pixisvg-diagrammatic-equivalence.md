---
status: EXPERIMENTAL
authority_level: 6
version: v1
last_ratified: 2026-08-16
experiment_id: ARI-R-B
paired_with: ARI-R-A
---

# ARI-R-B — PixiJS/SVG Diagrammatic Equivalence

## Question

¿Una representación 2D manipulable permite descubrir la misma equivalencia con mayor precisión, menor carga visual y mejor touch que la versión material 2.5D?

## Fairness lock

- Pair: `ARI-R-A`.
- Partir del mismo baseline y transformation core, no del resultado de A.
- Integración técnica: Codex.
- Mismo protocolo de playtest blind-first y revisión para A y B.
- Normal loops: 1–3; hard cap: 5.
- No leer/copiar implementación específica de A.
- Resolver/pinnear versión PixiJS al iniciar; SVG/DOM pueden usarse donde sean claramente mejores que canvas.

## Shared transformation core

Exactamente el mismo contrato de A:

- mathematical object `12`;
- representations;
- legal grouping/recomposition transforms;
- invariants;
- undo/redo;
- validators;
- renderer-neutral.

## Learning Contract

Idéntico a A:

- Percibe: 12 elementos antes de notación.
- Manipula: agrupación/recomposición.
- Predice: conservación de cantidad/estructura.
- Consecuencia: layout/representación cambia manteniendo invariante visible.
- Fallo: muestra la propiedad rota sin entregar respuesta.
- Transferencia: descubre otra equivalencia no mostrada.
- Formalización: posterior a experiencia.

## Pixi/SVG-specific hypothesis

2D compra comprensión mediante:

- alineación precisa;
- menos oclusión/perspectiva;
- agrupaciones, contornos y relaciones explícitas;
- transiciones continuas entre representación concreta y diagramática;
- SVG cuando nitidez/semántica vectorial sea más útil;
- Pixi cuando animación, cantidad de elementos o interacción canvas sea mejor.

No convertir la vista en una worksheet con botones. El jugador debe **transformar estructura**, no completar una cuenta.

## Player fixture

El mismo de A:

1. 12 piezas;
2. 3×4;
3. 6×2;
4. variante nueva;
5. transformación inválida informativa;
6. notación final;
7. undo/redo;
8. desktop + touch.

## Acceptance criteria

- [ ] mismo core pasa tests sin renderer.
- [ ] jugador predice conservación antes de confirmar.
- [ ] explica qué cambió y qué permaneció.
- [ ] resuelve variante no mostrada.
- [ ] agrupaciones/relaciones se leen sin texto técnico previo.
- [ ] touch no exige precisión motriz fina.
- [ ] transición a notación final se siente como otra representación del mismo objeto, no una pantalla separada.
- [ ] playtest blind-first sin BLOCKER/MAJOR.
- [ ] revisión comparativa sin BLOCKER/MAJOR.

## Evidence

Registrar las mismas categorías de A:

- baseline + Pixi version;
- loops/intervención humana;
- screenshots/sequence desktop-mobile;
- informe de playtest;
- ambigüedades de percepción;
- performance si material;
- lista de conceptos para los que 2D agregó valor y para los que quedó corto.

## Interpretation rule

Este spike no necesita “matar” al Three spike. Si ambos pasan pero en dominios diferentes, el resultado correcto puede ser una frontera:

- Three → material/espacial;
- Pixi/SVG → diagramático/relacional;
- mismo transformation core.

La frontera se documenta después de ambos, nunca antes.

## Stop

PASS, ESCALATE o hard cap 5. No diseñar el juego Arithmos completo dentro del spike.
