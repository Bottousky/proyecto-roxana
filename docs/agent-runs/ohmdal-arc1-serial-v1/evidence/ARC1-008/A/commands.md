# `ARC1-008-A` — reproducción exacta

Todo lo de acá se corrió el 2026-08-04 sobre el árbol de trabajo de
`codex/ohmdal-arc1-control-plane`, con los dos archivos del paquete ya modificados y **sin
commitear**. Nada está estimado: cada número de `lifecycle.json` y `lifecycle-leak.json` sale de una
de estas invocaciones.

## Entorno medido

| Qué | Valor |
|---|---|
| Servidor | `vite dev`, puerto 5199, `http://localhost:5199/labs/ohmdal-hd2d-preprod/` |
| Navegador | Chrome/150.0.7871.47 embebido en Orca — `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36` |
| Viewport | `innerWidth` 1191, `innerHeight` 972, `devicePixelRatio` 1 |
| Driver | `orca eval --expression <js>` (`CP-026`) |
| `window.gc` | `undefined` — el navegador no corre con `--expose-gc` |

Playwright **no** se instaló ni se usó: el usuario rechazó su reinstalación al cerrar `ARC1-007` y
`CP-026` mantiene esa exclusión. No se usó un segundo driver en ningún paso.

## 0 — levantar el servidor, si no está corriendo

```bash
npm run dev -- --port 5199 --strictPort
```

Comprobación de que la página montó y las sondas responden:

```bash
orca eval --expression "JSON.stringify({app: !!document.getElementById('app'), children: document.getElementById('app') && document.getElementById('app').children.length, canvas: document.querySelectorAll('canvas').length, probes: typeof window.render_game_to_text, labControl: typeof window.labControl, heap: performance.memory && performance.memory.usedJSHeapSize, url: location.href})"
```

Antes del build del paquete devolvía `"labControl":"undefined"`. Después:

```json
{"labControl":"object","keys":["start","pause","resume","destroy","status"],"status":{"activeRuntime":"hd2d-three","children":1,"hasCanvas":true}}
```

## 1 — `pause` detiene el tiempo simulado y `resume` lo continúa sin salto de `dt`

El observable es la posición del alumno: el bucle la avanza sólo mientras corre. Por eso el primer
paso enciende el recorrido automático (`#route-toggle`); sin él el alumno está quieto y `pause` no
tendría nada que detener.

```bash
orca eval --expression "(function(){var S=function(){var s=JSON.parse(window.render_game_to_text());return {p:s.player,zone:s.zone,t:performance.now()};};var W=function(ms){return new Promise(function(r){setTimeout(r,ms);});};var D=function(a,b){return Math.round(Math.hypot(b.p.x-a.p.x,b.p.z-a.p.z)*1e6)/1e6;};var out={};document.getElementById('route-toggle').click();var p0=S();return W(1000).then(function(){var p1=S();out.running_1000ms={dist:D(p0,p1),elapsedMs:Math.round(p1.t-p0.t),from:p0.p,to:p1.p};window.labControl.pause();var p2=S();return W(1500).then(function(){var p3=S();out.paused_1500ms={dist:D(p2,p3),elapsedMs:Math.round(p3.t-p2.t),from:p2.p,to:p3.p};window.labControl.resume();var p4=S();return W(150).then(function(){var p5=S();out.resume_first_150ms={dist:D(p4,p5),elapsedMs:Math.round(p5.t-p4.t),from:p4.p,to:p5.p};return W(1000).then(function(){var p6=S();out.resume_next_1000ms={dist:D(p5,p6),elapsedMs:Math.round(p6.t-p5.t),from:p5.p,to:p6.p};return JSON.stringify(out);});});});});})()"
```

Salida literal:

```json
{"running_1000ms":{"dist":2.0148,"elapsedMs":1003,"from":{"x":-18,"y":0,"z":0,"headingDegrees":90},"to":{"x":-15.985199999999914,"y":0,"z":0,"headingDegrees":90}},"paused_1500ms":{"dist":0,"elapsedMs":1508,"from":{"x":-15.985199999999914,"y":0,"z":0,"headingDegrees":90},"to":{"x":-15.985199999999914,"y":0,"z":0,"headingDegrees":90}},"resume_first_150ms":{"dist":0.3164,"elapsedMs":154,"from":{"x":-15.985199999999914,"y":0,"z":0,"headingDegrees":90},"to":{"x":-15.668799999999894,"y":0,"z":0,"headingDegrees":90}},"resume_next_1000ms":{"dist":1.963675,"elapsedMs":1008,"from":{"x":-15.668799999999894,"y":0,"z":0,"headingDegrees":90},"to":{"x":-13.705124551463156,"y":0,"z":0,"headingDegrees":90}}}
```

Cómo se lee, en `lifecycle.json` → `pauseResume`.

## 2 — las cinco transiciones del ciclo

```bash
orca eval --expression "(function(){var W=function(ms){return new Promise(function(r){setTimeout(r,ms);});};var app=document.getElementById('app');var st=function(l){var s=window.labControl.status();return {step:l,activeRuntime:s.activeRuntime,children:s.children,hasCanvas:s.hasCanvas,innerHTMLLen:app.innerHTML.length,probeRender:typeof window.render_game_to_text};};var out=[];out.push(st('inicial (montado)'));window.labControl.pause();out.push(st('tras pause'));window.labControl.resume();out.push(st('tras resume'));return window.labControl.destroy().then(function(){out.push(st('tras destroy'));return W(300);}).then(function(){return window.labControl.start();}).then(function(){return W(600);}).then(function(){out.push(st('tras segundo mount'));return JSON.stringify(out);}).catch(function(e){out.push({error:String(e&&e.stack||e)});return JSON.stringify(out);});})()"
```

Salida literal en `lifecycle.json` → `transitions`. El `.catch` está para que un fallo se registre
como dato y no como silencio; no se disparó.

## 3 — el gate de fugas: 1 ciclo de warmup + 16 medidos

Un ciclo por invocación, para que el fallo de una no contamine a las demás y para no depender de un
único `eval` largo. Las muestras se acumulan además en `window.__arc1008.samples`.

```bash
for L in warmup c1 c2 c3 c4 c5 c6 c7 c8 c9 c10 c11 c12 c13 c14 c15 c16; do
orca eval --expression "(function(){var W=function(ms){return new Promise(function(r){setTimeout(r,ms);});};window.__arc1008=window.__arc1008||{samples:[]};var s={label:'$L'};return window.labControl.destroy().then(function(){return W(2000);}).then(function(){s.heapAfterDestroy=performance.memory.usedJSHeapSize;s.totalHeap=performance.memory.totalJSHeapSize;s.tsIso=new Date().toISOString();window.__arc1008.samples.push(s);return window.labControl.start();}).then(function(){return W(900);}).then(function(){s.heapAfterMount=performance.memory.usedJSHeapSize;s.status=window.labControl.status();return JSON.stringify(s);});})()"
done
```

Cada línea de salida es una fila de `lifecycle-leak.json` → `samples`, copiada sin editar. El punto
de fase del gate es `heapAfterDestroy`: tras `destroy` y 2 s de pausa, siempre el mismo punto.

El paquete pedía N ≥ 5. Se corrieron 16 porque las primeras 5 muestras mostraron un rango de
±2 MB entre ciclos consecutivos: con esa varianza, cinco puntos no distinguen una fuga de 512 kB del
calendario del recolector. La decisión de subir N no cambia el gate ni el protocolo; sólo el tamaño
de muestra.

### Análisis

Los tres estimadores de `lifecycle-leak.json` → `analysis.estimators` salen de esta rutina, corrida
sobre la columna `heapAfterDestroy` de `c1`…`c16`:

```js
// pendiente OLS sobre (ciclo, heap), con r² para saber cuánta varianza explica
const n = ys.length, xs = ys.map((_, i) => i + 1);
const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
let num = 0, den = 0;
for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
const slope = num / den;                                    // 25.769 B/ciclo
// extremo a extremo
const endToEnd = (ys.at(-1) - ys[0]) / (n - 1);             // −81.213 B/ciclo
// suelo: los 5 mínimos aproximan el conjunto vivo tras un GC mayor
const lo = ys.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).slice(0, 5).sort((a, b) => a[1] - b[1]);
const floor = (lo.at(-1)[0] - lo[0][0]) / (lo.at(-1)[1] - lo[0][1]);  // 8.451 B/ciclo
```

Veredicto: **PASS**. El estimador más fiable —el suelo— da **8.451 B/ciclo**, el 1,65 % del techo de
512.000 B. El más pesimista —OLS— da **25.769 B/ciclo**, el 5,03 %, con r² 0,0113: la tendencia
explica el 1,1 % de la varianza y el resto es diente de sierra del recolector.

## 4 — consola

```bash
orca console --limit 400 --json
```

8 entradas, las 8 `debug` del cliente de HMR de vite. **0 errores, 0 warnings.** Volcado en
`console.txt`.

## 5 — captura: `not-run`

```bash
orca screenshot --format png --json
```

```json
{"ok": false, "error": {"code": "browser_error", "message": "CDP error (Page.captureScreenshot): Screenshot timed out — the browser tab may not be visible or the window may not have focus."}}
```

Tres intentos, el mismo error. **`final-state.png` se declara `not-run`**, no se sustituye por una
captura de otro driver y no se presenta como PASS. El gate humano de este paquete es explícitamente
no visual, así que no bloquea; el estado final del contenedor queda como dato en `lifecycle.json` →
`finalState`. Queda registrado como `OI-015`, porque sí bloquearía a cualquier paquete con gate
visual de `ARC1-011` en adelante.

## 6 — gates mecánicos

```bash
npm test          # exit 0
npm run build     # tsc && vite build → ✓ built
git diff --check  # exit 0
```

`npm test` corre `tests/a1-runtime-host.test.ts` **sin modificar**: sus cuatro casos
—flujo normal, `requestTravel`, loader que rechaza, `start` dos veces— siguen en OK con
`pause()`/`resume()` agregados al host.

`npm run verify` se declara `not-run` (WSL sin distribución, `STATE.md`).
