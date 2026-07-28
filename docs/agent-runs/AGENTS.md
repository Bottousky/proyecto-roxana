# Contratos de corridas multiagente

- El Director/integrador es dueño de `brief.md`, `visual-contract.md`, `tasks.json`,
  `ownership.json`, `status.md` y `final-report.md`.
- Asset Forge sólo puede editar `asset-manifest.json` cuando `ownership.json` lo asigne.
- El Evaluador sólo puede editar `review-round-*.md` y `performance.json`.
- Los trabajadores no cambian retrospectivamente criterios, presupuestos ni ownership.
- Mantener JSON válido y registrar `null` cuando una métrica todavía no fue medida.
- Nunca registrar secretos, valores de credenciales ni URLs firmadas.
- Un estado `approved` requiere evidencia reproducible; `not-run` y `blocked` no equivalen a PASS.
