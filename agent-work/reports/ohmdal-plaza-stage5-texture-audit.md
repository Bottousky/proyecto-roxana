# Ohmdal Plaza — Stage 5 texture audit

Fecha de auditoría: 2026-08-23
Scope: únicamente los cuatro normal maps señalados por el review de Stage 5. Auditoría read-only; no se modificaron assets, manifests, código ni state.

## Archivos inspeccionados

Todos son PNG de 1024×1024, 8 bits por canal, RGB (`color type 2`), y cada archivo tiene un SHA-256 distinto.

| Material | Ruta runtime | Bytes | SHA-256 | Procedencia registrada |
|---|---|---:|---|---|
| `stone-aged` | `assets/runtime/ohmdal/plaza/materials/stone-aged/normal-1k.png` | 2,398,199 | `9e208434ef63cb9c1030ee908f19dadce56113499fed5300b85db47bc87371fc` | Poly Haven `stone_wall_05`, CC0-1.0 |
| `plaza-cobble-base` | `assets/runtime/ohmdal/plaza/materials/plaza-cobble-base/normal-1k.png` | 2,106,791 | `a55ffa8e68bf7abb302950a0f40b4170af6862802f9d0f34e36763ed3281c40b` | Poly Haven `cobblestone_floor_001`, CC0-1.0 |
| `wood-workshop` | `assets/runtime/ohmdal/plaza/materials/wood-workshop/normal-1k.png` | 1,946,774 | `00911108ec3d40301a69135e23b10c7e332276f3d8b4bc31df8e5b0d85590f20` | Poly Haven `medieval_wood`, CC0-1.0 |
| `plaster-worn` | `assets/runtime/ohmdal/plaza/materials/plaster-worn/normal-1k.png` | 1,912,612 | `49bad93ed8275f725bc575041ba0a2528399dc86875656df0d2b9fea136883b4` | Poly Haven `medieval_wall_01`, CC0-1.0 |

Total on disk: **8,364,376 bytes** (7.9769 MiB; 8.3644 MB decimal).

## Referencias runtime

- Cada `provenance.json` registra el `normal-1k.png` correspondiente, con las mismas dimensiones, bytes y hash observados.
- `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts` construye las rutas mediante `runtimeMaterialUrl(set, file)`, siempre con `normal-1k.png` desde `textureSet`, y las asigna mediante `applyTextureSet` a `material.normalMap`.
- `plaza-cobble-base` se carga en la variante húmeda y luego su `normalMap` se comparte explícitamente con la variante seca (`matPaving`).
- `wood-workshop` se aplica a `matWood` y `matWoodDark` con el mismo archivo runtime; no existen dos copias del archivo en disco.
- La búsqueda de rutas exactas encontró las cuatro declaraciones de archivo en sus respectivos `provenance.json`; el código usa el loader dinámico descrito arriba. `assets/manifests/ohmdal-plaza-stage1-materials.json` enumera los sets runtime, pero no añade otra copia de estos cuatro archivos.

## Duplicación y transferencia

No hay duplicados exactos entre los cuatro archivos: los cuatro SHA-256 son diferentes. Compartir resolución, formato y nombre (`normal-1k.png`) no permite una deduplicación lossless.

El `capture-manifest.json` de Stage 5 Iteration 1 BEFORE registra **21.76505184173584 MB** transferidos (reportado como **21.77 MB**), por debajo del presupuesto de **30 MB**. Los cuatro normal maps aparecen entre los assets más grandes; sus tamaños transferidos suman aproximadamente 7.978 MiB en esa captura.

## Decisión de esta auditoría

**SKIP — consolidación/dedupe en Stage 5.** No existe deduplicación lossless aplicable entre estos cuatro mapas ahora. No se cambió compresión, formato, resolución, manifest, loader ni material para evitar una dependencia/pipeline nuevo o una variación visual sin evidencia; el presupuesto de transferencia ya pasa (`21.77 MB < 30 MB`).
