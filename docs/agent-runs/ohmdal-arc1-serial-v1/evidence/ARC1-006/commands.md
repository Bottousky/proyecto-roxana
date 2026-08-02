# ARC1-006 — Comandos y salidas

**Fecha:** 2026-08-02
**Base:** `b49b617`
**Rama:** `codex/ohmdal-arc1-control-plane`

## Gates automáticos

```
$ npm run build
✓ built in 6.91s

$ npm test
ℹ tests 4
ℹ pass 4
ℹ fail 0

$ npm run 3d:validate-manifests
OK assets/manifests/assets.example.json
OK assets/manifests/ohmdal-hd2d-preprod-ohm-procedural.json
OK assets/manifests/ohmdal-hd2d-preprod-ohm-sprite.json
OK assets/manifests/ohmdal-hd2d-preprod-student-4.json
OK assets/manifests/ohmdal-hd2d-preprod-student-8.json

$ git diff --check
warning: in the working copy of '…/DECISIONS.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '…/OPEN_ISSUES.md', LF will be replaced by CRLF …
warning: in the working copy of '…/STATE.md', LF will be replaced by CRLF …
warning: in the working copy of '…/ownership.json', LF will be replaced by CRLF …
warning: in the working copy of '…/tasks.json', LF will be replaced by CRLF …
warning: in the working copy of '…/telemetry.json', LF will be replaced by CRLF …
(exit 0 — PASS)
```

`git diff --check` **pasa**: no reporta ningún error de espacios en blanco. Lo que imprime son avisos
del filtro de fin de línea, no hallazgos del check, y son la misma causa que `OI-004`: el
repositorio normaliza a CRLF al escribir el árbol. Se transcriben en vez de resumirlos como «sin
salida» porque en los cierres anteriores no las hubo y la diferencia importa.

`npm run verify` (`scripts/verificar-hito.sh`): **`not-run`**. Requiere WSL y esta máquina no tiene
distribución instalada. Sustituido por `build` + `test` + `3d:validate-manifests` + `git diff --check`,
igual que en `ARC1-003`, `ARC1-004` y `ARC1-005`.

## Medición de JS — `ARC1-006-A`

El harness del slice **no** es una entrada de `vite.config.ts` —el build de producción del
repositorio compila `main`, `jugar` y `ohmdal`, no `labs/**`—. Para medirlo hubo que construirlo
aparte. `vite.config.ts` está prohibido en este ticket, así que el build corrió con un config propio
fuera del repositorio.

### Build aislado, chunk único

```
$ npx vite build --config <scratchpad>/vite.slice-budget.config.mjs
vite v6.4.3 building for production...
✓ 18 modules transformed.
<scratchpad>/dist-slice/labs/ohmdal-hd2d-preprod/index.html    5.56 kB │ gzip:   2.10 kB
<scratchpad>/dist-slice/assets/slice-CUyGpgIJ.js             528.54 kB │ gzip: 135.90 kB
✓ built in 1.33s
```

`root` apunta al repositorio; `outDir` al scratchpad. **Ninguna ruta del repositorio fue escrita.**

### Build aislado con atribución por origen

```
$ node <scratchpad>/measure-js.mjs
{
  "chunks": [
    { "fileName": "assets/vendor-three-*.js", "rawBytes": 487112, "gzipBytes": 122069, "brotliBytes": 100594, "moduleCount": 2 },
    { "fileName": "assets/slice-*.js",        "rawBytes":  41091, "gzipBytes":  13255, "brotliBytes":  11625, "moduleCount": 15 }
  ],
  "totals":       { "rawBytes": 528203, "gzipBytes": 135324, "brotliBytes": 112219, "moduleCount": 17 },
  "sliceOwnCode": { "moduleCount": 12, "renderedBytes": 65498, "originalBytes": 84874 }
}
--- módulos propios del slice ---
12628   main.ts
 9812   integration/spriteActors.ts
 8650   camera/cameraController.ts
 6725   architecture/blockout.ts
 6428   architecture/levelData.ts
 5651   camera/cameraConfig.ts
 3514   lighting/blockoutLighting.ts
 3083   materials/blockoutMaterials.ts
 3020   education/diagnosisModel.ts
 3006   camera/occlusion.ts
 1730   navigation/navigation.ts
 1251   integration/harnessState.ts
```

El script usa la API programática de `vite` importada por ruta absoluta desde `node_modules`,
`manualChunks` para separar `node_modules/three`, y un plugin propio que vuelca `renderedLength` por
módulo en `generateBundle`. Salida completa en `js-budget.json`.

Los 528.203 B de la versión partida y los 528.540 B de la versión de chunk único difieren en 337 B:
es el coste del `import` entre chunks. La cifra que se usa como peso de arranque es la del **chunk
único**, porque es la que se descarga.

### Atlas inlineados

```
$ node -e "cuenta los literales data: del chunk emitido"
{ "dataUriCount": 2, "dataUriBytes": [3620, 2997], "dataUriTotal": 6617,
  "bundleBytes": 528540, "shareOfBundle": "1.25%" }
spriteActors.ts source bytes: 4130
```

`spriteActors.ts` mide 4.130 B de fuente y aporta 9.812 B al bundle: la diferencia son los dos data
URI, que rollup le atribuye. SVG de origen en LF: 2.975 + 2.395 = 5.370 B → 6.617 B percent-encoded,
**+23,2 %**.

## Medición de runtime — `ARC1-006-A`

Servidor: `roxana-dev-alt` (vite, puerto 5199).
URL: `http://localhost:5199/labs/ohmdal-hd2d-preprod/`.

Método: el harness ya expone `window.advanceTime(ms)` y `window.render_game_to_text()`
(`main.ts:347-354`). `advanceTime` avanza la simulación en subpasos de 60 Hz y **fuerza un
`renderer.render` sincrónico**, así que `renderer.info.render` corresponde a ese frame.

```js
document.getElementById('route-toggle').click();          // recorrido automático
for (let i = 0; i < 500; i += 1) {
  window.advanceTime(50);
  samples.push(JSON.parse(window.render_game_to_text())); // x, z, zona, calls, triángulos…
}
```

480 muestras, 23,95 s simulados, en 1440×900 y en 390×844. Fronteras por `x` derivadas de
`SCENE_INVENTORY.md` §2. Agregados en `runtime-budget.json` §`perScene`.

**`requestAnimationFrame` está throttled en este panel.** No invalida el muestreo —`advanceTime` no
depende de rAF— pero impide medir fps. **No se midió fps y no se declara ninguno**, coherente con
`CP-014`.

### Memoria

```js
// recarga → un frame → heap base → recorrido completo → heap final
window.advanceTime(16);
const baseline = performance.memory.usedJSHeapSize;
document.getElementById('route-toggle').click();
for (let i = 0; i < 480; i += 1) window.advanceTime(50);
const afterRoute = performance.memory.usedJSHeapSize;
```

| Perfil | Heap base | Heap final | Δ |
|---|---:|---:|---:|
| desktop 1440×900, DPR 1 | 8.752.610 B | 10.265.142 B | 1.512.532 B |
| mobile 390×844, DPR 2 | 13.735.198 B | 14.312.434 B | 577.236 B |

### Coste de CPU por frame forzado

```js
const t0 = performance.now();
for (let i = 0; i < 240; i += 1) window.advanceTime(16.67);
const cpuMs = (performance.now() - t0) / 240;   // 0.264
```

**0,264 ms.** No es frame time ni fps: no incluye espera de GPU ni presentación.

## Medición de carga — `ARC1-006-A`

El build aislado servido como estático desde el scratchpad, en `http://localhost:5311`, **sin
compresión y sin latencia**.

```
navigation.responseEnd        13,1 ms
navigation.domInteractive     30,3 ms
navigation.loadEventEnd      100,4 ms
documento                  5.862 B transferidos
/assets/slice-*.js       528.840 B transferidos, responseEnd 29,9 ms
requests totales               2
```

Los atlas no generan request: viajan inlineados. Verificado leyendo
`performance.getEntriesByType('resource')` **después** de forzar un frame, que es cuando
`TextureLoader` habría pedido el archivo si no estuviera inline.

TTI sobre red real, 4G y Android físico: **`not-run`**, destino `ARC1-028` y `ARC1-060` (`CP-014`).

## Bytes en disco y convención LF/CRLF

```
student-atlas-4.svg    CRLF 2995 B   líneas 20   LF 2975 B   manifest 2975 ✓
student-atlas-4.json   CRLF  836 B   líneas 15   LF  821 B   manifest  821 ✓
ohm-sprite-atlas.svg   CRLF 2408 B   líneas 13   LF 2395 B   manifest 2395 ✓
ohm-sprite-atlas.json  CRLF  548 B   líneas 10   LF  538 B   manifest  538 ✓
```

Los manifests **no** están mal: registraron LF y el árbol de trabajo está en CRLF. La diferencia es
exactamente el número de líneas de cada archivo. Un HTTP real sirve la versión CRLF, 0,7 % más
pesada. Registrado en `OI-004`.

Audio: `find assets -name "*.mp3" -o -name "*.ogg" -o -name "*.wav"` → **cero resultados**.
