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
