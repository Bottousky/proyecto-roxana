# Ohmdal Arco I — authored pass

## A0 — baseline y captura

**Estado:** `PASS` — iteración 0. Sol aceptó el plumbing mecánico de Luna después
de revisar el contrato, el manifest y los tests enfocados.

### Baseline

- `dec2d75`, `b8bb412` y `74abaad` son ancestros de la rama activa
  `explore/ohmdal-3D`.
- `npm run loop:ohmdal-arco1:validate`: PASS, greybox `complete`.
- `npm run loop:ohmdal-arco1-authored:validate`: PASS.
- `npm run agent:gemini:check`: PASS, `gemini-3.7-flash-high` disponible.
- `npm run agent:minimax:gmi:check`: PASS, `MiniMaxAI/MiniMax-M3` disponible.
- `npm run playtest:ohmdal-golden-path`: PASS, 22 checkpoints, incluyendo
  desktop/mobile y `arc1-complete`.

### Contrato de captura

- `FAST local GPU`: `npm run visual:ohmdal-plaza:fast -- --stage <stage>
  --shots <ids> --out <dir>`. Prefiere Chrome, luego Edge y finalmente Chromium;
  solicita aceleración física, nunca fuerza SwiftShader y registra renderer y
  `softwareRendered`. Omite deliberadamente mobile, no-post y touch smoke.
- `FULL deterministic`: `npm run visual:ohmdal-plaza`. Conserva las ocho vistas,
  contexto mobile frío, no-post, touch smoke y la semántica de lanzamiento
  reproducible existente. SwiftShader continúa permitido sólo como fallback
  funcional; su FPS no es benchmark de GPU.

Evidencia FAST verificada por Sol:
`output/playwright/ohmdal-arco1-authored/a0-fast-sol-verify/capture-manifest.json`.
Chrome 151 usó Intel UHD Graphics por D3D11, `softwareRendered=false`, produjo
5/5 capturas y cero errores de consola/página. Los números de frame quedan como
diagnóstico local, no como presupuesto aceptado.

### Shots canónicos registrados

1. `portal-arrival`
2. `plaza-wide`
3. `ohm-landmark`
4. `workshop-exterior`
5. `workshop-interior-tools`
6. `galvanoscope-first-person`
7. `manantial-approach`
8. `hydro-central-wide`
9. `sluice-gate-interaction`
10. `generator-platform`
11. `restored-manantial`
12. `restored-plaza-wide`
13. `bell-activation`
14. `castle-gate-open`
15. `castle-distribution-hall`
16. `forge-core`
17. `terraces-irrigation`
18. `forge-terraces-overview`
19. `lighthouse-approach`
20. `lighthouse-lake-wide`
21. `final-return-plaza`
22. `arc1-final-pedestal`

El set mobile obligatorio sigue siendo el definido por
`ARCO1_CANONICAL_SHOTS.md`; FAST no lo reemplaza.

### Deuda y límites

- El FULL local intentado durante A0 agotó el timeout al bootstrap mobile; el
  código no se cambió para ocultarlo ni se debilitó el gate. El contrato queda
  cubierto por tests y por la evidencia full aceptada del greybox; se volverá a
  ejecutar en A8.
- No hubo cambios de gameplay, Plaza, engine, dependencias, canon ni guion.
- No se usaron proveedores 3D ni gasto pago.

## A1 — referencias y contratos visuales

**Estado:** `PASS` — iteración 1. Sol aceptó el pack después del test mecánico
de Luna y de una revisión independiente read-only de Gemini 3.7 Flash High.

### Pack aceptado

- `assets/references/region-packs/manifest.json` declara las ocho regiones,
  briefs existentes y autoridad espacial/visual explícita.
- La unión de sus rutas cubre exactamente los 22 shots canónicos. Los únicos
  dos cruces intencionales son `forge-terraces-overview` y
  `final-return-plaza`.
- Plaza permanece bloqueada como baseline aceptado; A2 se limita al Taller y a
  sus seams funcionales. No se demostró ninguna regresión de Plaza.
- Gemini marcó las ocho regiones `READY_FOR_SUPPORT_AUTHORING` y no encontró
  blockers player-facing. Su dictamen persistido está en
  `agent-work/reports/gemini/ohmdal-arco1-authored-a1-reference-review.md`.

### Heroes

Gemini clasificó los cuatro candidatos como `adapt`: turbine-generator
assembly, central distribution bus landmark, primary load/protection assembly y
lighthouse calibration mechanism. Sol acepta esa clasificación sólo para crear
sus Hero Reference Packs. El manifest conserva `autoApproveDesign=false` y
`finalModelingBlockedUntilHeroPack=true`; ningún modelado final comienza antes
de un JSON machine-readable que pase `npm run 3d:validate-hero-ref`.

No hay HUMAN_GATE activo: la evidencia local alcanza para `adapt`, el pipeline
es Blender determinista y no se autorizó Meshy/Tripo ni gasto pago. La deuda de
los cuatro packs es asset-local y no bloquea environment/support authoring.

### Evidencia

- `node --experimental-strip-types tests/ohmdal-region-packs.test.ts`: PASS,
  3/3.
- `npm run 3d:validate-manifests`: PASS.
- `npm run loop:ohmdal-arco1-authored:validate`: PASS durante A1.
- Gemini inspeccionó en plan+sandbox sólo los authority docs, ocho briefs, siete
  imágenes históricas acotadas y ocho capturas Golden Path permitidas. El
  wrapper repo-native devolvió metadata sin cuerpo y fue descartado; la
  continuación oficial `agy` de la misma conversación produjo el dictamen
  auditable, sin escrituras.

### Correcciones load-bearing para producción

1. La paleta nocturna/húmeda 2D no sustituye la tarde cálida y piedra pálida del
   material bible.
2. A2 debe resolver el Taller actualmente oscuro con fill/prácticas sin sombras
   y jerarquía legible de banco/herramientas.
3. Faro conserva verdad DC; ningún efecto debe sugerir RC/transitorios.
4. Los cuatro heroes usan Hero Reference Pack → Blender → GLB → inspect/validate.
5. A8 asigna `arc1-final-pedestal` a `final-return` para evitar doble captura.
