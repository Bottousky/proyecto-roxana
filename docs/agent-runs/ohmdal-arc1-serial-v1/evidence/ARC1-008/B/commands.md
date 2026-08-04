# `ARC1-008-B` — reproducción exacta

Medido el 2026-08-04 sobre el árbol de trabajo de `codex/ohmdal-arc1-control-plane`, con los dos
archivos de `ARC1-008-A` modificados y **sin commitear**. Este paquete no escribe código: su diff es
vacío.

## Entorno

| Qué | Valor |
|---|---|
| Servidor | `vite dev`, puerto 5199, `http://localhost:5199/labs/ohmdal-hd2d-preprod/` |
| Driver | navegador embebido de Claude Code — `resize_window` + `javascript_exec` (`CP-027`) |
| Viewports | 1440×900 DPR 1 y 390×844 DPR 2, fijados por `resize_window` |

El DPR no se fija: lo pone el driver. Coincide con el de la medición congelada —1 en desktop, 2 en
mobile— y el digest lo confirma. `renderer.setPixelRatio` afecta la resolución, no las llamadas de
dibujo ni los triángulos, que es lo que el snapshot registra.

## Por qué no se usó el driver de `ARC1-008-A`

`lab.ts:128` decide el perfil con `window.innerWidth <= 720`, y `lab.ts:326-329` toma
`window.innerWidth`/`innerHeight` para la cámara y el renderer. Un digest sólo reproduce con la
ventana en el tamaño exacto. El CLI de Orca no tiene con qué fijarlo:

```bash
orca --help    # sección "Browser Automation": tab create/list/switch, snapshot, goto, click,
               # fill, screenshot, eval, set device, set offline, set headers, set media…
```

`set device` emula dispositivos con nombre; no acepta ancho y alto arbitrarios, y no hay `resize`.
La ventana quedó en 1191×972 durante toda la medición de `ARC1-008-A`, que es lo que ese paquete
midió y declaró. Es la misma familia de límite que `OI-015`: el driver conduce y mide, pero no
controla la ventana.

## Protocolo

```js
function fnv1a(s) {                       // FNV-1a 32 bits
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
const W = ms => new Promise(r => setTimeout(r, ms));

const run = async () => {
  await window.labControl.destroy(); await W(300);   // laboratorio limpio
  await window.labControl.start();   await W(600);
  document.getElementById('route-toggle').click();   // recorrido automático
  const raw = [];
  for (let i = 0; i < 480; i++) { window.advanceTime(50); raw.push(window.render_game_to_text()); }
  return { chars: raw.join('\n').length, hash: fnv1a(raw.join('\n')) };
};

const a = await run();   // corrida 1
const b = await run();   // corrida 2, con un ciclo destroy→start de por medio
```

Dos detalles del protocolo son load-bearing y ninguno estaba escrito en
`evidence/ARC1-007/parity.json`:

1. **Se avanza y después se muestrea.** Al revés, la primera muestra se toma sin render forzado y
   `renderer.calls` vale 0: medido, el mínimo de desktop cae de 13 a 0 y el digest cambia.
2. **Las muestras se unen con `\n`.** De corrido, la serie tiene exactamente 479 caracteres menos
   —480 muestras, 479 separadores— y el hash no reproduce. La diferencia es idéntica en los dos
   viewports, que fue la pista. Registrado como `OI-016`.

## Resultados

### 1440×900, DPR 1

```json
{"viewport":"1440x900","dpr":1,
 "run1":{"chars":605701,"hash":"db322500","drawCalls":{"min":13,"max":22},"triangles":{"min":150,"max":508},"zones":["portal_plaza","taller","puerta_manantial"],"geometries":20,"textures":2},
 "run2":{"chars":605701,"hash":"db322500","drawCalls":{"min":13,"max":22},"triangles":{"min":150,"max":508},"zones":["portal_plaza","taller","puerta_manantial"],"geometries":20,"textures":2},
 "runsIdentical":true,"frozenDesktop":{"chars":605701,"hash":"db322500"},"matchesFrozen":true}
```

### 390×844, DPR 2

```json
{"viewport":"390x844","dpr":2,
 "run1":{"chars":605891,"hash":"50543361","drawCalls":{"min":11,"max":20},"triangles":{"min":126,"max":448},"zones":["portal_plaza","taller","puerta_manantial"]},
 "run2":{"chars":605891,"hash":"50543361","drawCalls":{"min":11,"max":20},"triangles":{"min":126,"max":448},"zones":["portal_plaza","taller","puerta_manantial"]},
 "runsIdentical":true,"frozenMobile":{"chars":605891,"hash":"50543361"},"matchesFrozen":true,
 "finalStatus":{"activeRuntime":"hd2d-three","children":1,"hasCanvas":true}}
```

## Cómo se llegó al protocolo, sin retocar nada

Se deja escrito porque el camino importa: si el digest se hubiera «arreglado» tocando el
laboratorio, la evidencia no valdría.

| Intento | chars | hash | Qué se aprendió |
|---|---:|---|---|
| avanzar → muestrear, unión de corrido, desktop | 605.222 | `dae740b2` | draw calls 13–22 y triángulos 150–508 **exactos** contra lo congelado; sólo el hash no. La física ya coincidía |
| muestrear → avanzar, unión de corrido, desktop | 605.195 | `d846818a` | `drawCalls.min` cae a 0: la primera muestra no tiene render forzado. Orden descartado |
| avanzar → muestrear, unión de corrido, mobile | 605.412 | `3937e5ff` | falta **el mismo** delta de 479 caracteres que en desktop. Sistemático, no físico |
| avanzar → muestrear, unión con `\n`, mobile | 605.891 | `50543361` | **exacto**. 479 = 480 − 1 separadores |
| avanzar → muestrear, unión con `\n`, desktop | 605.701 | `db322500` | **exacto** |
| ídem + `\n` final | 605.892 | `df8cf171` | descartado: sobra un separador |

En ningún momento se modificó `src/**`. Los seis intentos son distintas formas de **leer** la misma
serie; la serie no cambió.

## Gates

El diff de este paquete es vacío, así que `npm run build`, `npm test` y `git diff --check` son los
mismos que dejó `ARC1-008-A`, los tres PASS. `npm run verify` sigue `not-run`.
