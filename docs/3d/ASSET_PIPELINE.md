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

1. Definir función, cámara y distancia.
2. Elegir ruta con `roxana-3d-director`.
3. Crear manifiesto y presupuesto.
4. Verificar referencias y derechos.
5. Producir blockout o preview.
6. Aprobar silueta antes de textura.
7. Aprobar master.
8. Generar variantes desktop/mobile.
9. Corregir escala, frente, pivote, collider y sockets.
10. Validar GLB y medir.
11. Integrar en cámara real.
12. Capturar desktop/mobile y revisar consola.
13. Actualizar manifiesto, índice, coste, licencia, hashes y estado.

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

`optimize-glb` es un wrapper conservador: muestra el comando fijado y sólo lo ejecuta con
`--execute`. No reemplaza la comparación visual ni la validación posterior.

## GLB existente

`src/landing/school3d.ts` ya configura `GLTFLoader` + `DRACOLoader` y libera el decoder al
terminar la carga. Reutilizar o extraer ese loader en un hito dedicado; no crear otro durante
el setup.
