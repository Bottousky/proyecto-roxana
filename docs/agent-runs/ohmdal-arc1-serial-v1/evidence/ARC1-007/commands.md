# ARC1-007 — Comandos y salidas

**Fecha:** 2026-08-03
**Base:** `aeb9f70`
**Rama:** `codex/ohmdal-arc1-control-plane`
**Alcance de este archivo:** `ARC1-007-A`. `ARC1-007-B` todavía no se ejecutó.

## Por qué existe este archivo

`ARC1-007-A` y `ARC1-007-B` declararon `DONE` el 2026-08-02 con secciones «Resultado» que describían
mediciones inexistentes. `evidence/ARC1-007/` no existía, `telemetry.json` no tenía records y `B` no
tenía una sola línea implementada. Registrado en `OI-006`. Esta evidencia es la que faltaba, medida
el 2026-08-03; no es una segunda ronda.

## Gates automáticos

```
$ npm run build
✓ built in 4.93s

$ npm test
(15 suites, todas OK, exit 0)
RUN t4-singlestone.test.ts              T4 single stone tests: OK
RUN t5-ladder.test.ts                   T5 ladder tests: OK
RUN w1-school-model.test.ts             W1 school model tests: OK
RUN w10-roxana-statue-import.test.ts    W10 estatua GLB de Roxana montada en el hall: OK
RUN w11-school-progression-visual.test.ts  W11 progresión visual escuela 3D: OK
RUN w12-school-plan-grid.test.ts        W12 planta modular de la escuela: OK
RUN w13-school-parallax.test.ts         W13 patrón parallax escolar: OK
RUN w2-aula-router.test.ts              W2 aula router tests: OK
RUN w3-aula-pizarron.test.ts            W3 aula pizarron tests: OK
RUN w4-portal-link.test.ts              W4 portal link tests: OK
RUN w5-portal-transition.test.ts        W5 portal transition tests: OK
RUN w6-aula-portal-arrival.test.ts      W6 llegada aula → Plaza: OK
RUN w7-unit2-graphical-aula.test.ts     W7 transición Campana → aula gráfica → U2: OK
RUN w8-voxel-school.test.ts             W8 escuela voxel: OK
RUN w9-roxana-statue.test.ts            W9 estatua procedural de Roxana: OK

$ npm run 3d:validate-manifests
OK assets/manifests/assets.example.json
OK assets/manifests/ohmdal-hd2d-preprod-ohm-procedural.json
OK assets/manifests/ohmdal-hd2d-preprod-ohm-sprite.json
OK assets/manifests/ohmdal-hd2d-preprod-student-4.json
OK assets/manifests/ohmdal-hd2d-preprod-student-8.json

$ git diff --check
warning: in the working copy of 'labs/ohmdal-hd2d-preprod/index.html', LF will be replaced by CRLF …
warning: in the working copy of 'src/labs/ohmdal-hd2d-preprod/main.ts', LF will be replaced by CRLF …
(exit 0 — PASS)
```

Los dos avisos son del filtro de fin de línea, no hallazgos del check: misma causa que `OI-004`.

`npm run verify` (`scripts/verificar-hito.sh`): **`not-run`**, WSL sin distribución. Sustituido por
`build` + `test` + `3d:validate-manifests` + `git diff --check`, igual que en `ARC1-003` … `ARC1-006`.

## Cómo se sirvió la baseline

El parity necesita ejecutar el laboratorio **anterior** al traslado. `aeb9f70` se sirvió desde un
worktree aislado, sin tocar el árbol de trabajo:

```
$ git worktree add --detach <scratchpad>/baseline aeb9f70
HEAD is now at aeb9f70 ARC1-006 fijar presupuesto por escena

$ New-Item -ItemType Junction -Path <scratchpad>/baseline/node_modules `
           -Target C:\YO\Proyectos\Roxana\node_modules

$ npx vite <scratchpad>/baseline --port 5200 --strictPort
```

`node_modules` se enlaza en vez de reinstalarse: `three` resuelve a la misma versión exacta que el
árbol de trabajo, así que la comparación aísla el traslado y no una diferencia de dependencias.

| | Puerto | `main.ts` del laboratorio |
|---|---:|---:|
| baseline `aeb9f70` | 5200 | 356 líneas |
| árbol de trabajo | 5199 | 17 líneas |

**Ninguna ruta del repositorio fue escrita** para montar la baseline, igual que en el build aislado
de `ARC1-006`. El worktree y los scripts viven en el scratchpad.

**Desviación de herramienta declarada:** el segundo servidor necesitó una entrada transitoria en
`.claude/launch.json`, que es archivo versionado. Se restauró a su contenido original al terminar la
medición y no forma parte del diff del ticket.

## Recorrido determinista — parity de 480 muestras

Mismo protocolo que `ARC1-006`, sin variantes:

```js
document.getElementById('route-toggle').click();
const samples = [];
for (let i = 0; i < 480; i += 1) {
  window.advanceTime(50);
  samples.push(window.render_game_to_text());
}
// digest FNV-1a 32 bits sobre samples.join('\n')
```

| Viewport | DPR | baseline `aeb9f70` | árbol de trabajo | ¿idéntico? | chars |
|---|---:|---|---|---|---:|
| 1440×900 | 1 | `db322500` | `db322500` | **sí** | 605.701 |
| 390×844 | 2 | `50543361` | `50543361` | **sí** | 605.891 |

El digest cubre las 13 claves del snapshot —posición, rumbo, zona, cámara, variantes de sprite,
diagnóstico, `renderer.calls`, `renderer.triangles` y oclusión— sobre las 480 muestras. No es un
muestreo parcial: es la serie completa, carácter por carácter.

**Control cruzado:** la baseline reprodujo 22 draw calls y 508 triángulos de pico, exactamente las
cifras que `STATE.md` registra al cerrar `ARC1-006`. El método de medición es el mismo, no uno más
laxo.

## Capturas del gate humano

Frame determinista: paso 200 del recorrido, zona `taller`, con `workshop-roof-low` en `opacity 0.18`.
Es donde una regresión del traslado sería visible.

```
$ node <scratchpad>/capture-arc1-007.mjs
{ "step": 200,
  "pairs": [ { "viewport": "desktop-1440x900", "identical": true, "chars": 872 },
             { "viewport": "mobile-390x844",  "identical": true, "chars": 858 } ] }
```

| Archivo | vs. baseline |
|---|---|
| `desktop-1440x900.png` | **pixel idéntico**, `sha256 741c3af3…f703dd` en ambos |
| `mobile-390x844.png` | difiere en 48 B — **ruido de render, no comportamiento** |

### Por qué mobile difiere y por qué no importa

Se capturó el **mismo** servidor cuatro veces de cada lado:

```
$ node <scratchpad>/mobile-repeat.mjs
árbol de trabajo : 877b50a1  9a7db81d  0b0560b7  0b0560b7   → 3 hashes distintos en 4 corridas
baseline aeb9f70 : 292874fd  292874fd  0b0560b7  a8db2ca8   → 3 hashes distintos en 4 corridas
                                       ^^^^^^^^ hash compartido
```

La captura con DPR 2 **no es reproducible bit a bit en ninguno de los dos lados**, así que una
diferencia de bytes entre árbol y baseline no distingue entre ellos. Además las dos series comparten
el hash `0b0560b7896f17a5`: el árbol y la baseline produjeron el mismo frame exacto. La paridad de
mobile queda demostrada por el digest de 480 muestras, que sí es determinista y sí es idéntico.

Desktop con DPR 1 salió pixel idéntico en la primera corrida.

## Ciclo `mount → destroy → mount` — informativo

Ejercita lo que el traslado agregó y la baseline no tenía. Módulo importado en caliente sobre un
contenedor propio, fuera del laboratorio de la página:

```js
const mod = await import('/src/labs/ohmdal-hd2d-preprod/lab.ts');
const a = mod.createOhmdalLab(host);   // 1 hijo, canvas presente
a.pause(); a.advanceTime(1000);        // avanza con el bucle detenido
a.resume(); a.pause();                 // 400 ms reales pausado
a.resume(); a.advanceTime(16);         // sin salto de dt
a.dispose();                           // host.children.length === 0
const b = mod.createOhmdalLab(host);   // segundo montaje, mismo contenedor
b.dispose();                           // host.children.length === 0
```

| Condición | Resultado |
|---|---|
| exports del módulo | `['createOhmdalLab']` — sin efectos de nivel superior |
| métodos del handle | `advanceTime`, `dispose`, `pause`, `resume`, `snapshot` |
| `dispose()` deja el contenedor vacío | sí, en los dos ciclos |
| `advanceTime()` con el bucle detenido | sí |
| pausado no deriva en 400 ms reales | sí |
| `resume()` sin salto de `dt` | sí |
| segundo montaje sobre el mismo contenedor | sí |

`usedJSHeapSize`: 8.088.030 → 11.617.875 → 11.298.298 B. **Informativo, no es el gate.** La caída
entre el primer y el segundo ciclo indica que corrió el recolector durante la medición, así que
estos números no sirven para decidir una fuga. El gate de 512 kB por ciclo lo fija
`SCENE_BUDGETS.md` y lo mide `ARC1-008` por primera vez.

## Consola

`console.txt`, sin filtrar. Cero errores de aplicación, cero `pageerror`, cero requests fallidos.
El único warning es del driver GL —`GPU stall due to ReadPixels`— y lo provoca la captura de
pantalla, no la aplicación.

## `ARC1-007-B` — montaje por `RuntimeHost`

### Gates tras implementar B

```
$ npm run build
✓ built in 5.02s

$ npm test
(16 suites, exit 0; se suma a2-hd2d-runtime)
RUN a1-runtime-host.test.ts
A1 runtime host: flujo normal OK
A1 runtime host: requestTravel OK
A1 runtime host: loader que rechaza OK
A1 runtime host: start dos veces OK
RUN a2-hd2d-runtime.test.ts
A2 hd2d runtime: override de ubicación OK
A2 hd2d runtime: sin override el juego publicado no cambia OK
A2 hd2d runtime: cruce snapshot → destroy → mount OK
A2 hd2d runtime: same-runtime y caché de loader OK
A2 hd2d runtime: el laboratorio queda fuera del grafo estático OK

$ npm run 3d:validate-manifests    → 5 manifests OK
$ git diff --check                 → exit 0
```

`a1-runtime-host.test.ts` **no se tocó** y sigue pasando: es la prueba de que `CP-021` es aditivo.

### Reparación de `node_modules` — desviación declarada

Al quitar el worktree de la baseline, `git worktree remove --force` siguió la junction de
`node_modules` y borró parte del **`node_modules` real** antes de fallar con `Invalid argument`.
`node_modules/.bin/` quedó vacío, así que `tsc` y `vite` desaparecieron; `npm test` y los manifests
siguieron pasando porque usan `node` directo, lo que ocultó el daño por un rato.

```
$ npm ci
added 26 packages, and audited 27 packages in 11s
found 0 vulnerabilities
```

`package.json` y `package-lock.json` **no cambiaron** — verificado con `git status`. `npm ci` restaura
exactamente lo que dice el lock y nunca lo escribe.

Efecto colateral: `playwright` estaba instalado como paquete **extraño al lock** (`grep -c playwright
package-lock.json` → `0`) y `npm ci` lo eliminó. Con él se fue la posibilidad de repetir las capturas
de `A` desde el arranque nuevo. Reinstalarlo fue denegado por el usuario.

**Lección para el protocolo:** no enlazar `node_modules` con una junction dentro de un worktree que
después se va a borrar. Instalar dependencias en el worktree, o construir sin él.

### Behaviour parity del arranque nuevo

```js
// mismo recorrido, ahora montado por createRuntimeHost().start({..., runtime:'hd2d-three'})
document.getElementById('route-toggle').click();
for (let i = 0; i < 480; i += 1) { window.advanceTime(50); samples.push(window.render_game_to_text()); }
```

| | digest 1440×900 | chars | draw calls | triángulos |
|---|---|---:|---|---|
| `aeb9f70` | `db322500` | 605.701 | 13–22 | 150–508 |
| `ARC1-007-A` | `db322500` | 605.701 | 13–22 | 150–508 |
| `ARC1-007-B` | `db322500` | 605.701 | 13–22 | 150–508 |

### Ciclo por el host real

```js
const { createRuntimeHost } = await import('/src/app/runtimeHost.ts');
const { runtimeLoaders } = await import('/src/experiences/loaders.ts');
const host = createRuntimeHost(el, runtimeLoaders);
await host.start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' });
await host.destroy();
await host.start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' });
await host.destroy();
```

| Paso | Resultado |
|---|---|
| `start` | `activeRuntime` `hd2d-three`, 1 hijo, canvas presente |
| `destroy` | 0 hijos, `activeRuntime` `null` |
| `start` otra vez | 1 hijo, canvas presente, mismo contenedor |
| `destroy` | 0 hijos |
| consola | 0 errores |

No son loaders falsos: es `runtimeLoaders` real, así que el `import()` dinámico se ejerció de verdad.

### Chunks del build

| Chunk | kB | gzip kB | ¿entrada? |
|---|---:|---:|---|
| `main-gQLXWNfp.js` | 8,67 | 2,95 | sí — sin `three` |
| `ohmdal-f3JvbCJm.js` | 31,47 | 11,62 | sí — sin `three` |
| `jugar-RpBqDbg7.js` | 53,08 | 18,50 | sí — sin `three` |
| `hd2dRuntime-DPhC7OzL.js` | 46,84 | 15,19 | no — perezoso |
| `three.module-Bin6bwlq.js` | 534,81 | 135,77 | no — perezoso, compartido |
| `school3d-DJwBfnaj.js` | 185,03 | 74,38 | no — era 715,60 kB con `three` dentro |

**Ningún chunk de entrada contiene `three`**: el gate del contrato pasa.

Pero el bundle de producción ahora publica el laboratorio, que `CP-020` había dejado fuera del build.
Nadie lo descarga —ninguna ubicación publicada pide `hd2d-three`— pero está. Abierto en `OI-007`.

**Salvedad del A/B:** las cifras de `aeb9f70` provienen del build anterior a `npm ci`, con un
`node_modules` que tenía paquetes extraños. La conclusión estructural —tres chunks nuevos, ninguno en
entrada— no depende de eso; el delta exacto de bytes sí. Un A/B limpio exige construir `aeb9f70` con
este `node_modules` y **no se hizo**.

### Frame de B

Paso 200, zona `taller`, 18 draw calls, 388 triángulos, `workshop-roof-low` ocluido. Canvas 1440×900,
huella FNV del PNG `55a3c48a`. **No se escribió archivo PNG**: ver la desviación de `playwright`
arriba. Las capturas de `A` siguen siendo válidas —son pixel idénticas a `aeb9f70`— y el digest
demuestra que el frame de `B` es el mismo.

## `not-run` declarados

| Qué | Por qué | Se resuelve en |
|---|---|---|
| fps y frame time | `rAF` throttled; nunca antes de `ARC1-028` | `ARC1-028`, `ARC1-060` |
| fuga ≤ 512 kB por ciclo | es el gate de `ARC1-008` | `ARC1-008` |
| Android físico medio 2022 | `CP-014` | `ARC1-060` |
| `npm run verify` | WSL sin distribución | — |
| PNG desde el arranque por `RuntimeHost` | `playwright` removido por `npm ci`, reinstalación denegada, panel del navegador no visible | — |
| A/B de bytes limpio contra `aeb9f70` | exigiría reconstruir la baseline con este `node_modules` | `OI-007` |
