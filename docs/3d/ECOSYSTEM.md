# Ecosistema 3D

## Flujo

```text
referencia y derechos
  → blockout aprobado
  → Blender/procedural/CAD | mmx para referencias 2D
  → manifiesto + master
  → variante desktop/mobile
  → GLB en el runtime correspondiente
  → cámara real
  → browser QA + métricas del renderer + crítica
  → aprobación
```

## Responsabilidades

| Necesidad | Ruta primaria |
|---|---|
| Arquitectura, escaleras, arcos, barandas | Blender modular/procedural |
| Máquinas y puzzles con piezas móviles | Blender + modelo TypeScript puro |
| Estatua, personaje, criatura, roca hero | Blender con referencia aprobada |
| Personaje de cámara controlada | GLB calibrado; simplificar si el rig no compra legibilidad |
| Terreno y repetidos | Blender/procedural + instancing |
| Reparación, bake o exportación puntual | Blender UI/CLI |
| Pieza física funcional | OpenSCAD/FreeCAD; Blender para presentación |

## Integración real del repositorio

- `RuntimeHost` y el registro multiruntime permanecen en `src/app` y `src/experiences`.
- Ohmdal apunta a PlayCanvas Engine v2; Phaser y Three.js permanecen como
  baselines durante la transición.
- La experiencia escolar 3D preservada en `feature/school-voxel` vive hoy en la landing:
  `src/landing/school3d.ts`.
- Esa landing ya reutiliza `GLTFLoader`, `DRACOLoader`, carga lazy mediante Vite y expone
  métricas en `window.__roxanaSchool3D`.
- Los GLB actuales siguen en `assets/school3d/` porque los imports estables los referencian.
  La nueva estructura `assets/source|references|runtime` es aditiva; la migración será un hito
  separado con pruebas.
- `src/experiences/instituto` contiene runtimes previos de hub/parallax, pero el manifiesto
  activo todavía declara `topdown-phaser`.

## Diferencia respecto de la guía

La guía de setup describe un spike Three.js dentro del runtime y gateado por `?school3d=1`.
El trabajo preservado antes de este setup convirtió la landing 3D en vista predeterminada y usa
`?view=classic` para volver a la portada anterior. Este setup no cambia ese comportamiento:
lo registra como decisión pendiente de ADR y riesgo de integración.

## Principio de estabilidad

Un asset nuevo no autoriza a modificar progreso, diálogo, puzzles o viajes. Primero debe pasar
por el laboratorio visual o la landing aislada; la integración al runtime se revisa después.
