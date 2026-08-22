# Estado del ecosistema 3D

**Actualizado:** 2026-08-22  
**Rama exploratoria activa para Ohmdal 3D:** `explore/ohmdal-3D`

## Dirección vigente

- Ohmdal explora un **mundo 3D continuo, denso y guiado por curiosidad**, con conocimiento como progresión.
- Target técnico del spike: **PlayCanvas Engine v2 + TypeScript + Vite + glTF/GLB**.
- `src/experiences/ohmdal-playcanvas/` es evidencia jugable EXPERIMENTAL/PROPOSED; no constituye todavía una migración definitiva de todos los runtimes de Ohmdal.
- `src/experiences/ohmdal-plaza/` conserva modelos/sistemas puros reutilizados por el spike.
- Phaser, Three.js y las iteraciones HD-2D/room-based permanecen como baselines, historial o evidencia mientras no exista una migración explícita que los retire.
- El slice de referencia continúa concentrado en Portal → Plaza → Taller/Lumen → Puerta Ω → Manantial.

Visión específica: [`../20-worlds/ohmdal/OHMDAL_OUTER_WILDS_VISION_v1.md`](../20-worlds/ohmdal/OHMDAL_OUTER_WILDS_VISION_v1.md).  
Producción Plaza/recursos: [`../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md).  
Stack agentic/proveedores: [`../20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md`](../20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md).  
Art pass ejecutable: [`../20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md`](../20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md).

## Harness vigente

- ChatGPT web: diseño, investigación, planificación y specs.
- Codex: única autoridad técnica e integrador.
- Gemini: peer multimodal/contextual sobre el mismo repo.
- MiniMax: worker mediante `mmx` por terminal.
- PlayCanvas: skills oficiales; MCP sólo cuando el Editor vivo aporta valor.
- Blender: DCC principal; MCP oficial opcional bajo gate de seguridad.
- Meshy: proveedor primario opcional para hero assets si existe plan/API aprobados; usar rutas oficiales MCP/skill/API, no wrappers propios.
- Tripo: A/B/fallback por CLI/API cuando segmentación, batch, low-poly o calidad lo justifiquen; no dependencia base.
- Three.js: cantera de técnicas/QA/authoring; no runtime de Ohmdal.

El contrato completo vive en [`../80-production/AI_TOOLING.md`](../80-production/AI_TOOLING.md).

## Pipeline 3D común

- Metros como unidad de trabajo.
- Blender/master canónico → GLB runtime.
- Manifiesto, procedencia/licencia, calibración, budget y QA forman parte de la aprobación.
- `assets/source/` permanece ignorado sin política Git LFS/almacenamiento de binarios; no asumir que un `.blend` local quedó preservado por Git.
- Los assets históricos de la escuela conservan sus rutas actuales hasta una migración propia.
- Todo proveedor generativo debe terminar en asset portable; PlayCanvas no conoce Meshy/Tripo.

Documentos comunes:

- [`ECOSYSTEM.md`](ECOSYSTEM.md)
- [`VISUAL_BIBLE.md`](VISUAL_BIBLE.md)
- [`SCALE_BIBLE.md`](SCALE_BIBLE.md)
- [`BUDGETS.md`](BUDGETS.md)
- [`ASSET_PIPELINE.md`](ASSET_PIPELINE.md)
- [`QA_PROTOCOL.md`](QA_PROTOCOL.md)
- [`VISUAL_HARNESS.md`](VISUAL_HARNESS.md)

## Gate mecánico

**PASS.** El fallo de `camPos` fuera de scope en `playcanvasRuntime.ts` fue corregido y la rama fue validada en GitHub Actions con el gate normal (`npm ci`, `npm run verify`, build/tests y validación de manifests 3D). Logs estáticos viejos se retiraron para no competir con evidencia reproducible.

La corrida actual de CI/worktree manda sobre cualquier texto histórico. Si una regresión aparece, volver a rojo y corregirla antes de un art pass grande.

## Deuda inmediata

1. Implementar/terminar el **Visual Harness** reproducible para `/ohmdal-playcanvas`: hooks, vistas canónicas, desktop/mobile, diagnostics y detección de software renderer.
2. Ejecutar `OHMDAL_PLAZA_ART_PASS_01.md`: baseline → assets genéricos → gramática propia → 3 hero assets → lighting → scorecard.
3. Decidir estrategia de preservación de masters 3D (`Git LFS`, storage externo/R2 u otra) antes de producir muchos `.blend`/GLB pesados.
4. Mantener la Plaza primero como prueba controlada. No producir Castillo/Faro en 3D premium antes de demostrar el loop de producción.
5. No instalar routers generales ni colecciones enormes de skills. Three.js/skills externos son referencias on-demand.

## Histórico

Las decisiones HD-2D, room-based y Three.js previas siguen en sus documentos y commits históricos para trazabilidad. **No son la dirección de esta rama** salvo que un documento de autoridad actual las cite explícitamente como baseline o evidencia.