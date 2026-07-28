# Pipeline 3D de la escuela

La escuela es un asset modular generado por código y editado con Blender 4.5 LTS. La fuente reproducible es `build_school.py`; el `.blend` es el archivo de trabajo y el `.glb` es el contrato con Three.js.

## Regenerar

En Windows:

```powershell
npm run school:build
```

Si Blender no está en `PATH`, define `ROXANA_BLENDER_EXE` con la ruta a `blender.exe`. El script también detecta la instalación portable usada durante este hito.

Salidas:

- `assets/school3d/instituto-roxana.blend`: escena editable.
- `assets/school3d/instituto-roxana.glb`: runtime web.
- `assets/school3d/school-preview.png`: control visual desde Blender.

## Previews por sala

Para revisar Hall y Electrónica sin reconstruir ni volver a hornear la escuela:

```powershell
blender --background assets/school3d/instituto-roxana.blend `
  --python scripts/blender/render_room_previews.py
```

Genera `hall-production-preview.png` y
`electronics-production-preview.png` dentro de `assets/school3d/`. El script
oculta las salas vecinas y usa los colores de vértice horneados que consume
Three.js.

## Contrato de nombres

- `ROOM_<id>`: raíz de una sala y metadatos glTF (`roomId`, `label`, `cameraTarget`).
- `ROOM_<id>__click_floor`: superficie de selección.
- `ANCHOR_<id>`: punto de foco y futura navegación.
- `NPC_*`: personaje animado de forma liviana por el runtime.
- `HALL__roxana_statue`: volumen de referencia y anclaje de Roxana. En runtime se reemplaza por `assets/school3d/roxana-statue.glb`, ajustando automáticamente altura, base y centro sin sacarlo del subárbol interactivo del hall.

No cambies estos prefijos manualmente sin actualizar `src/landing/school3d.ts`.

## Dirección de arte de los hero assets

La arquitectura y el mobiliario mantienen una geometría económica. Los personajes dedicados, las estatuas y los trofeos pueden concentrar más detalle, siempre respetando la escala y las formas redondeadas del diorama. La estatua final de Roxana vive en `roxana-statue.glb`; el volumen procedural del `.blend` conserva el anclaje, la escala de referencia y el contacto de iluminación.

La composición de `ROOM_hall` sigue el canon de escala y jerarquía de
`docs/biblia-estilo-instituto.md`: plataforma → monumento → escalera → nivel
superior, con el monumento entre 2,5× y 4× la altura visual de los NPCs.

## Blender MCP

Se instaló `blender-mcp` 1.6.4 y el add-on quedó habilitado en Blender 4.5. El servidor está registrado globalmente en Codex como `blender`, con telemetría desactivada. El MCP permite ejecutar Python arbitrario dentro de Blender: se debe conectar sólo con escenas y prompts de confianza. La landing no depende del MCP para funcionar ni para reconstruirse.
