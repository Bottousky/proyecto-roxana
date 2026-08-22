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

## Harness vigente

- ChatGPT web: diseño, investigación, planificación y specs.
- Codex: única autoridad técnica e integrador.
- Gemini: peer multimodal/contextual sobre el mismo repo.
- MiniMax: worker mediante `mmx` por terminal.
- PlayCanvas: skills oficiales; MCP sólo cuando el Editor vivo aporta valor.
- Blender: DCC principal; MCP oficial opcional bajo gate de seguridad.
- Meshy: acelerador opcional de hero assets cuando exista plan/API aprobados; no master DCC ni autoridad de arte.

El contrato completo vive en [`../80-production/AI_TOOLING.md`](../80-production/AI_TOOLING.md).

## Pipeline 3D común

- Metros como unidad de trabajo.
- Blender/master canónico → GLB runtime.
- Manifiesto, procedencia/licencia, calibración, budget y QA forman parte de la aprobación.
- `assets/source/` permanece ignorado sin política Git LFS/almacenamiento de binarios; no asumir que un `.blend` local quedó preservado por Git.
- Los assets históricos de la escuela conservan sus rutas actuales hasta una migración propia.

Documentos comunes:

- [`ECOSYSTEM.md`](ECOSYSTEM.md)
- [`VISUAL_BIBLE.md`](VISUAL_BIBLE.md)
- [`SCALE_BIBLE.md`](SCALE_BIBLE.md)
- [`BUDGETS.md`](BUDGETS.md)
- [`ASSET_PIPELINE.md`](ASSET_PIPELINE.md)
- [`QA_PROTOCOL.md`](QA_PROTOCOL.md)

## Estado mecánico por validar antes del art pass

La documentación y los logs estáticos no coinciden completamente sobre el último fallo de build. `AI_TOOLING.md` registra referencias a `camPos` fuera de scope en el runtime PlayCanvas; `tsc-out.txt` conserva errores anteriores de `src/jugar/ExplorationScene.ts`.

La siguiente corrida en el worktree real manda:

```bash
npm run build
npm test
npm run verify
```

Usar tests enfocados durante el arreglo y el gate normal definido por `AGENTS.md`; no declarar PASS por registros históricos. Después de obtener una corrida actual, actualizar o eliminar logs estáticos obsoletos.

## Deuda inmediata

1. Resolver el build/gate mecánico actual antes de una pasada de arte grande.
2. Medir baseline real de la ruta `/ohmdal-playcanvas` en desktop y mobile.
3. Decidir estrategia de preservación de masters 3D (`Git LFS`, storage externo/R2 u otra) antes de producir muchos `.blend`/GLB pesados.
4. Mantener la Plaza primero como prueba controlada: blockout → materiales → 3–5 hero assets → iluminación → optimización → QA.
5. No instalar routers generales ni colecciones enormes de skills. Evaluar skills externos uno por uno.

## Histórico

Las decisiones HD-2D, room-based y Three.js previas siguen en sus documentos y commits históricos para trazabilidad. **No son la dirección de esta rama** salvo que un documento de autoridad actual las cite explícitamente como baseline o evidencia.
