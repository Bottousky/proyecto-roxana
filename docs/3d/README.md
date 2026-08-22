# Producción 3D de Proyecto Roxana

Este directorio define el contrato operativo común para producir, integrar y revisar assets 3D sin alterar incidentalmente gameplay, canon o modelos pedagógicos.

## Documentos

- [ECOSYSTEM.md](ECOSYSTEM.md): herramientas, responsabilidades y estado real de integración.
- [VISUAL_BIBLE.md](VISUAL_BIBLE.md): lenguaje visual y jerarquía de detalle.
- [SCALE_BIBLE.md](SCALE_BIBLE.md): unidades, orientación y medidas guía.
- [BUDGETS.md](BUDGETS.md): objetivos web y baseline medido.
- [ASSET_PIPELINE.md](ASSET_PIPELINE.md): ciclo de vida, carpetas y comandos.
- [QA_PROTOCOL.md](QA_PROTOCOL.md): capturas, scorecard y evidencia.
- [STATE.md](STATE.md): dirección y deuda técnica vigente.

El harness y las herramientas de IA comunes viven en [`../80-production/AI_TOOLING.md`](../80-production/AI_TOOLING.md); este directorio no mantiene otra lista de skills o MCPs.

Para la prueba 3D actual de Ohmdal, sus fuentes gratuitas, Meshy opcional, skills candidatos y art pass de la Plaza viven en [`../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md).

## Contratos ejecutables

- Schema: `assets/manifests/assets.schema.json`
- Ejemplo: `assets/manifests/assets.example.json`
- Validador: `scripts/3d/validate-asset-manifests.mjs`
- GLB: `scripts/3d/validate-glb.mjs`
- Presupuesto: `scripts/3d/report-runtime-budget.mjs`

La producción visual siempre empieza por un blockout verificable y requiere aprobación en cámara real antes de convertirse en asset/runtime canonical.
