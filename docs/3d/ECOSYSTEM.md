# Ecosistema 3D

## Flujo

```text
referencia y derechos
  → blockout aprobado
  → CC0 / Blender / proveedor generativo aprobado
  → manifiesto + master canónico
  → variante desktop/mobile
  → GLB en el runtime correspondiente
  → cámara real
  → visual harness + browser QA + métricas
  → crítica / corrección
  → aprobación
```

MiniMax (`mmx`) y GPT/Gemini pueden producir referencias 2D, análisis o material auxiliar; no sustituyen la validación del asset 3D en cámara real.

## Responsabilidades

| Necesidad | Ruta primaria |
|---|---|
| Material/prop/arquitectura genérica | CC0 curado → adaptar |
| Arquitectura, escaleras, arcos, barandas propias | Blender modular/procedural |
| Máquinas y puzzles con piezas móviles | Blender + modelo TypeScript puro |
| Estatua, personaje, criatura, máquina hero | Concept aprobado → Meshy/Blender; Tripo A/B si aporta valor |
| Personaje de cámara controlada | GLB calibrado + rig/animaciones; simplificar si no compra legibilidad |
| Terreno y repetidos | Blender/procedural + instancing |
| Reparación, bake o exportación puntual | Blender UI/CLI |
| Pieza física funcional | OpenSCAD/FreeCAD; Blender para presentación |
| Figura/prop imprimible no mecánico | Master Blender/Meshy/Tripo → variante print STL/3MF |
| Técnica gráfica sofisticada | consultar Three.js/skills como referencia; traducir/bakear, no forzar engine |
| QA visual agentic | `VISUAL_HARNESS.md` + instrumentation del runtime |

## Portabilidad del authoring

El engine y el proveedor son decisiones distintas.

```text
Meshy / Tripo / Blender / Three procedural / pack CC0
                     ↓
                GLB + manifest
                     ↓
        PlayCanvas / Three / Babylon / otro
```

Un asset no debe obligar a un mundo a adoptar el runtime con el que se generó. La frontera estable es GLB/glTF, manifiesto, procedencia, escala y QA.

## Proveedores generativos

### Meshy

Proveedor primario opcional cuando exista plan/crédito aprobado. Tiene rutas oficiales REST, MCP y Agent Skill; puede resolver text/image/multi-image→3D, remesh/retexture, rig/animation y workflows de impresión. No crear wrappers propios.

### Tripo

A/B/fallback. Su CLI/API son especialmente interesantes para multiview, batch, segmentación, low-poly/decimate y rigging. Webapp/API tienen billing separado: no adoptar por inercia ni duplicar suscripción sin benchmark.

### Three.js ecosystem

No es un proveedor y no obliga al runtime. Usar como cantera de algoritmos y disciplina de producción: materiales, agua, vegetación, arquitectura procedural, shaders, technical art, visual harness y scorecards. Evitar instalar routers/directores Three.js en el harness global.

### Customuse

Observación futura para volumen multi-provider. No entra al baseline actual mientras proveedores directos + Blender cubran el flujo y API/custom integrations impliquen otra capa/costo.

## Integración real del repositorio

- `RuntimeHost` y el registro multiruntime permanecen en `src/app` y `src/experiences`.
- **Ohmdal apunta a PlayCanvas Engine v2 + TypeScript** en la exploración `explore/ohmdal-3D`; Phaser/Three.js/HD-2D permanecen como baselines o evidencia histórica hasta una migración explícita.
- El spike actual de Ohmdal vive en `src/experiences/ohmdal-playcanvas/` y reutiliza sistemas puros de `src/experiences/ohmdal-plaza/`.
- La experiencia escolar 3D preservada vive en la landing `src/landing/school3d.ts` y sigue usando Three.js. No obliga a que Ohmdal use el mismo engine.
- Los GLB históricos de la escuela siguen en `assets/school3d/` porque imports estables los referencian.
- `assets/source|references|runtime` continúa siendo el contrato general de producción; cualquier migración de binarios existentes es un hito separado.

## Agentic workflow

- Codex es el único integrador técnico.
- PlayCanvas skills oficiales se cargan por operación concreta.
- PlayCanvas MCP se usa sólo si el estado vivo del Editor aporta valor.
- Blender MCP oficial es opcional y gated por seguridad; Blender UI/CLI sigue siendo válido.
- Meshy usa sólo integraciones oficiales y gasto aprobado.
- Tripo prefiere CLI/API para tareas reproducibles; MCP sólo si demuestra valor.
- MiniMax se usa por `mmx`, no por un MCP local.
- `docs/3d/VISUAL_HARNESS.md` estandariza evidencia visual entre engines.

Recursos y flujo específico para la Plaza de Ohmdal:
[`../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md).

Política detallada de proveedores para el spike:
[`../20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md`](../20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md).

## Principio de estabilidad

Un asset nuevo no autoriza a modificar progreso, diálogo, puzzles o viajes. Primero debe pasar por blockout/laboratorio visual, validación de licencia, manifiesto y cámara real; la integración narrativa o de gameplay se revisa después.