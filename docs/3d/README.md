# Producción 3D de Proyecto Roxana

Este directorio define el contrato operativo para producir, integrar y revisar assets 3D sin
alterar el shell, Ohmdal ni los modelos pedagógicos.

## Documentos

- [ECOSYSTEM.md](ECOSYSTEM.md): herramientas, responsabilidades y estado real del código.
- [VISUAL_BIBLE.md](VISUAL_BIBLE.md): lenguaje visual y jerarquía de detalle.
- [SCALE_BIBLE.md](SCALE_BIBLE.md): unidades, orientación y medidas guía.
- [BUDGETS.md](BUDGETS.md): objetivos web y baseline medido.
- [ASSET_PIPELINE.md](ASSET_PIPELINE.md): ciclo de vida, carpetas y comandos.
- [QA_PROTOCOL.md](QA_PROTOCOL.md): capturas, scorecard y evidencia.
- [STATE.md](STATE.md): estado técnico e histórico vigente.

El harness y las herramientas de IA comunes viven en
[`../80-production/AI_TOOLING.md`](../80-production/AI_TOOLING.md); este
directorio no mantiene otra lista de skills o MCPs.

## Contratos ejecutables

- Schema: `assets/manifests/assets.schema.json`
- Ejemplo: `assets/manifests/assets.example.json`
- Validador: `scripts/3d/validate-asset-manifests.mjs`
- GLB: `scripts/3d/validate-glb.mjs`
- Presupuesto: `scripts/3d/report-runtime-budget.mjs`

La producción artística del hall empieza en un hito posterior y requiere aprobación.
