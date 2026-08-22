# Ecosistema 3D

## Flujo

```text
referencia y derechos
  → blockout aprobado
  → Blender modular/procedural | Meshy opcional para hero assets
  → manifiesto + master canónico
  → variante desktop/mobile
  → GLB en el runtime correspondiente
  → cámara real
  → browser QA + métricas del renderer + crítica visual
  → aprobación
```

MiniMax (`mmx`) y GPT/Gemini pueden producir referencias 2D, análisis o material auxiliar; no sustituyen la validación del asset 3D en cámara real.

## Responsabilidades

| Necesidad | Ruta primaria |
|---|---|
| Arquitectura, escaleras, arcos, barandas | Blender modular/procedural |
| Máquinas y puzzles con piezas móviles | Blender + modelo TypeScript puro |
| Estatua, personaje, criatura, máquina hero | Concept aprobado → Blender; Meshy opcional como acelerador |
| Personaje de cámara controlada | GLB calibrado + rig/animaciones; simplificar si no compra legibilidad |
| Terreno y repetidos | Blender/procedural + instancing |
| Reparación, bake o exportación puntual | Blender UI/CLI |
| Pieza física funcional | OpenSCAD/FreeCAD; Blender para presentación |
| Figura/prop imprimible no mecánico | Master Blender/Meshy → variante print STL/3MF |

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
- Meshy, si se contrata, es worker para piezas propias y no autoridad de arte ni integración.
- MiniMax se usa por `mmx`, no por un MCP local.

Recursos y flujo específico para la Plaza de Ohmdal:
[`../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md).

## Principio de estabilidad

Un asset nuevo no autoriza a modificar progreso, diálogo, puzzles o viajes. Primero debe pasar por blockout/laboratorio visual, validación de licencia, manifiesto y cámara real; la integración narrativa o de gameplay se revisa después.
