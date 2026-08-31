# Pipeline de assets

## Carpetas

```text
assets/
  manifests/        contratos versionados
  references/       referencias con derechos documentados
  source/           masters locales; ignorados sin política Git LFS
  runtime/          variantes consumibles desktop/mobile
  school3d/         ruta heredada activa; no mover sin hito de migración
```

## Ciclo obligatorio

1. Definir función, cámara, distancia y presupuesto del asset.
2. Elegir ruta de producción con el `AGENTS.md` del scope y la guía 3D vigente; no depende de un skill director global.
3. Crear manifiesto y presupuesto.
4. Verificar referencias y derechos.
5. Producir blockout o preview.
6. Aprobar silueta antes de textura.
7. Aprobar master canónico en Blender o fuente equivalente.
8. Generar variantes desktop/mobile cuando aporten valor medible.
9. Corregir escala, frente, pivote, collider y sockets.
10. Validar GLB y medir.
11. Integrar en cámara real.
12. Capturar desktop/mobile y revisar consola.
13. Actualizar manifiesto, índice, coste, licencia, hashes y estado.

Para Ohmdal, ver además [`../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md).

## Estados

```text
planned
reference-ready
generating
review-required
approved-master
optimized-runtime
integrated
qa-approved
print-prototype
rejected
archived
```

## Comandos

```bash
npm run 3d:validate-manifests
npm run 3d:asset-index
npm run 3d:validate-glb -- assets/runtime/.../asset.glb
npm run 3d:optimize-glb -- --input master.glb --output runtime.glb
npm run 3d:report-budget -- --input renderer-info.json
```

`optimize-glb` es un wrapper conservador: muestra el comando fijado y sólo lo ejecuta con `--execute`. No reemplaza la comparación visual ni la validación posterior.

## Skills y generación asistida

- PlayCanvas: usar los skills oficiales específicos (`inspect-glb`, `calibrate-model`, `assemble-scene`, etc.) sólo cuando correspondan.
- Meshy: opcional para hero assets; preferir su Agent Skill/API antes de agregar otro MCP al harness y requerir aprobación antes de gastar créditos.
- MiniMax: `mmx` para referencias/medios autorizados, con staging y revisión de Codex.
- Los assets de terceros deben conservar URL, licencia y modificaciones.

## GLB existente

`src/landing/school3d.ts` ya configura `GLTFLoader` + `DRACOLoader` para la landing Three.js. Reutilizar o extraer ese loader sólo si el runtime correspondiente realmente lo comparte; **Ohmdal PlayCanvas no debe crear una dependencia artificial con el loader Three.js de la escuela**.
