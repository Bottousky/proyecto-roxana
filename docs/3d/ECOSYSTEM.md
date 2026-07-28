# Ecosistema 3D

## Flujo

```text
referencia y derechos
  → roxana-3d-director
  → procedural/img2threejs | Meshy | sprite | CAD
  → manifiesto + master
  → variante desktop/mobile
  → loader Three.js existente
  → cámara real
  → Playwright + renderer.info + crítica
  → aprobación
```

## Responsabilidades

| Necesidad | Ruta primaria |
|---|---|
| Arquitectura, escaleras, arcos, barandas | procedural / `img2threejs` |
| Máquinas y puzzles con piezas móviles | procedural + modelo TypeScript puro |
| Estatua, personaje, criatura, roca hero | Meshy con referencia suficiente |
| Personaje de cámara controlada | sprite o impostor antes de asumir rig 3D |
| Terreno y repetidos | procedural + instancing |
| Reparación, bake o exportación puntual | Blender automatizado |
| Pieza física funcional | OpenSCAD/FreeCAD; Meshy sólo capa estética |

## Integración real del repositorio

- `RuntimeHost` y el registro multiruntime permanecen en `src/app` y `src/experiences`.
- Ohmdal continúa en Phaser.
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
