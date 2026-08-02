# Revisión 01 — Ohmdal HD-2D preproducción v1

**Estado:** FAIL

**Evaluador:** EVAL-001, único Evaluador

**Commit integrado:** `64e0b92651d5d1d36e6156f7b91fbb8729ad0b57`

**Fecha:** 2026-08-02

**Alcance:** H1+H2; H3 continúa bloqueado

## Veredicto ejecutivo

El harness integrado es recorrible, determinista y barato de renderizar, pero no alcanza los gates
visuales obligatorios. El bloqueo principal es reproducible en desktop y mobile: al llegar a
Puerta/Manantial el pilar central oculta parcialmente al estudiante y
`render_game_to_text()` informa `blockedIds: []`. En Taller los techos también dominan el encuadre
y la protección de oclusión sólo responde al jugador; Ohm y el espacio de diagnóstico pueden
quedar tapados antes de que el techo entre en fade. Un build verde no compensa estos fallos.

Decisiones A/B para una ronda correctiva, sin mantener dos pipelines vivos:

- **Cámara:** casi ortográfica. Conserva mejor la escala aparente, ordena el diorama y, en la
  comparación controlada del Taller, mostró 15 llamadas/200 triángulos frente a
  17 llamadas/260 triángulos de perspectiva suave.
- **Estudiante:** 4 direcciones. El giro detenido a 135° fue visualmente indistinguible de la
  variante de 8 direcciones en el prototipo; no apareció moonwalk ni deslizamiento en el recorrido,
  y el atlas fuente es menor (2.995 B frente a 4.121 B). No hay beneficio demostrado que justifique
  ocho direcciones en H2.
- **Ohm:** sprite. En la misma pantalla del Taller comunica mejor visor, brazos y silueta; además
  observó 16 llamadas/248 triángulos frente a 22 llamadas/350 triángulos del procedural. El
  procedural se lee como un bloque gris y no compensa el coste adicional en este encuadre.

**Recomendación al Director:** `corregir una vez`. H3 no debe abrirse hasta cerrar oclusión,
jerarquía de interacción y composición mobile en una segunda y última ronda automática.

## Gates

| Criterio | Nota | Veredicto | Severidad | Evidencia y hecho observado | Corrección exigida |
|---|---:|---|---|---|---|
| Educación V2 | 5/5 | PASS | — | Las seis fichas y los modelos pasan `npm test`. Nueve acciones por botón llevan a `verified=true` y `documented=true` sin errores. | Ninguna en H1. |
| Composición y cámara | 3/5 | FAIL | P1 | Existen tres encuadres y ambas cámaras, pero el estudiante termina detrás del pilar en Puerta tanto en 1440×900 como en 390×844; `blockedIds=[]`. | Adoptar casi ortográfica y corregir C3/volumen de fade para mantener personaje, punto de medida y consecuencia visibles. |
| Escala humana | 4/5 | PASS | — | Mundo en metros, maniquí 1,72 m, pivotes de suelo y sprite estable en el plano; tests de arquitectura PASS. | Conservar el maniquí en las capturas de validación. |
| Silueta arquitectónica | 3/5 | FAIL | P1 | Portal y Puerta se leen como marcos muy similares; el Taller queda dominado por grandes planos de techo y suelo. No alcanza 4/5 frente a la cualidad de diorama denso de la referencia oficial. | Diferenciar siluetas de los tres sets y reducir la masa visual de techos/pilares sin agregar arte final. |
| Legibilidad de interacción | 3/5 | FAIL | P1 | El flujo protegido completa y los marcadores existen, pero el botón de diagnóstico avanza desde Portal: zona `portal_plaza` con `configured=true`. Lumen no tiene presencia espacial y la UI sustituye la jerarquía diegética. | Habilitar/explicar el diagnóstico sólo en el set correspondiente y hacer coexistir Lumen/Ohm, medida y consecuencia en C2/C3. |
| Integración sprite/suelo/sombra | 3/5 | FAIL | P1 | El estudiante conserva pivote de pies y sombra; Ohm sprite carece de una sombra de contacto equivalente. Las variantes 4/8 son casi indistinguibles incluso en el giro obligatorio a 135°. | Mantener 4 direcciones, reforzar silueta direccional y agregar contacto de suelo consistente a Ohm. |
| Materiales e iluminación de blockout | 3/5 | PASS | — | Piedra, cobre, madera, agua y vidrio se distinguen; tarde/crepúsculo cambian lectura; sólo una luz proyecta sombra. | Conservar el presupuesto; aumentar separación local del Taller sin postprocesado. |
| Rendimiento mobile medido | 3/5 | CONDITIONAL | P1 | Emulación táctil 390×844: DPR de renderer 1,5, 11 llamadas, 162 triángulos, 19 geometrías, 2 texturas; 180 frames, media 16,667 ms. No es Android físico. | Repetir en Android medio 2022; hasta entonces no afirmar piso sostenido de 30 fps. |
| Rendimiento desktop medido | 4/5 | PASS | — | Chromium 1440×900, Taller/casi ortográfica/sprite: 15 llamadas, 200 triángulos, 28 geometrías, 4 texturas; 180 frames, media 16,667 ms, consola limpia. | Ninguna para H2; repetir tras corregir oclusión. |
| Estabilidad y disposal | 4/5 | PASS | — | Build, suite completa, manifiestos y `git diff --check` pasan. Reload/navegación no emitieron errores. Los tests observan disposal idempotente de blockout, cámara, oclusores y cache del renderer. | Mantener el gate; una futura slice debe exponer diagnóstico post-unmount del `RuntimeHost`. |

Un gate obligatorio fallido no se compensa por promedio. Veredicto global: **FAIL**.

## Hechos, inferencias y bloqueos

### Hechos

- Recorrido Portal → Plaza → Taller → Puerta → Manantial completado con teclado/recorrido
  automático en desktop y con recorrido determinista en mobile.
- Entrada táctil real-emulada mediante CDP mantuvo el botón 700 ms y movió al estudiante de
  `x=-18` a `x=-16,5666`; consola limpia.
- `prefers-reduced-motion: reduce` se refleja como `reducedMotion=true` y completa el recorrido.
- Tarde y crepúsculo, ambas cámaras, 4/8 direcciones y Ohm sprite/procedural fueron renderizados.
- La consola de las sesiones limpias informó 0 errores y 0 warnings.
- Una prueba descartada con `dispatchEvent` sintético produjo `setPointerCapture NotFoundError`;
  no se cuenta como fallo del producto porque se reemplazó por un touch activo de CDP, que pasó.

### Inferencias críticas

- La cámara casi ortográfica es la opción menos riesgosa: la evidencia muestra mejor lectura y
  menor trabajo visible en los mismos sujetos, no una ventaja estética aislada.
- Cuatro direcciones son suficientes para este prototipo. Si el personaje final agrega accesorios
  asimétricos que pierden intención, esa decisión deberá reabrirse con una comparación nueva.
- El mayor salto de calidad/coste es corregir oclusión y jerarquía espacial; agregar textura,
  bloom o más geometría ahora sólo escondería el problema.

### Bloqueos y no-mediciones

- Android físico medio de 2022: no disponible; FPS/frame time/result quedan `null`/`not-run`.
- Peso transferido de producción: `null`. El laboratorio no aparece como entrada del build y el
  servidor Vite reutilizó cache; `transferSize` no es una medición de payload publicable.
- `npm run verify`: no ejecutado; `wsl -l -q` no informó una distribución operativa. Build,
  tests, manifiestos y diff-check sí se ejecutaron por separado.
- Liberación de memoria GPU después de abandonar la página no es observable desde el snapshot;
  el gate de disposal se apoya en tests idempotentes y en ausencia de errores al recargar.

## Evidencia visual

Las capturas se guardaron fuera del repositorio para respetar el ownership del Evaluador. Rutas
locales reproducibles:

| Estado | Ruta | SHA-256 |
|---|---|---|
| Desktop Portal, casi ortográfica, 4, sprite, tarde | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-portal-qortho-4-sprite-afternoon.png` | `A7D23834A7D35AD2E9AA4A101C182FAF000A7DF9025A0475336961A95CCD426E` |
| Desktop Taller, casi ortográfica, 4, sprite, tarde | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-taller-qortho-4-sprite-afternoon.png` | `A9D8C7587B46F7914E6438AAA5A5B2C1209228D6D8CDD7BC2476E24B5E54405B` |
| Desktop Puerta, casi ortográfica, 4, sprite, tarde | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-manantial-qortho-4-sprite-afternoon.png` | `85A49142950B6CB03A763B5487BBC529972F346527CE5E8EC48DDD8D435E9BB4` |
| Desktop Taller, perspectiva, 8, procedural, crepúsculo, RM | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-taller-center-persp-8-procedural-twilight-rm.png` | `209094EFB486A3E44F8E531624C30E0BB8453893DEA1818A567972F331AAA57A` |
| Desktop Taller, perspectiva, 8, sprite, crepúsculo, RM | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-taller-center-persp-8-sprite-twilight-rm.png` | `B511C06F3B34723CA54DC39D1E9C141F880308EA2ED56034CC0EFCE269A0EEF7` |
| Desktop giro 135°, 4 direcciones | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-turn135-persp-4-sprite-twilight-rm.png` | `6E07D5E48B06EBBA734EF67A5A8D96427FB748EDDE316AC8A83945AB830B422A` |
| Desktop giro 135°, 8 direcciones | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-turn135-persp-8-sprite-twilight-rm.png` | `E7D0032AD5DC00597434AC4724A335C1417A3588D8AAEEA23A4D4FA3D414A6EA` |
| Desktop diagnóstico completo | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\desktop-diagnosis-complete-qortho-8-sprite-twilight-rm.png` | `8ACDB17CA8B9A8C2689D5355775E77199BB245698FE3630EA0929FAE52D4D16D` |
| Mobile Portal 390×844 | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\mobile-portal-qortho-4-sprite-afternoon.png` | `2ED579A75425EC54CF101EC8AE6A632EC30D8AB84854F8645F02AC0FC09FDD1B` |
| Mobile Puerta 390×844, RM | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001\mobile-manantial-qortho-4-sprite-afternoon-reduced.png` | `A91CD62D54BF4E9FC6F28B088A527E6CC34C236D83693F530227A03A5519F239` |

Referencia crítica consultada: página y galería oficiales de Square Enix indicadas en
`visual-contract.md` y `assets/references/ohmdal-hd2d-preprod/official-footage-observations.md`.
La comparación se limita a cualidades de profundidad, contacto, cámara y legibilidad; no se copió
ni almacenó material protegido.

## Pasos reproducibles mínimos

1. En `64e0b92`, ejecutar `npm install` y `npm run dev -- --host 127.0.0.1 --port 4173`.
2. Abrir `http://127.0.0.1:4173/labs/ohmdal-hd2d-preprod/` con Chromium.
3. Fijar 1440×900, elegir casi ortográfica/4/sprite/tarde y pulsar `Recorrido automático`.
4. En Puerta/Manantial ejecutar `window.render_game_to_text()`: el estudiante queda detrás del
   pilar y `occlusion.blockedIds` queda vacío.
5. Recargar, pulsar `Siguiente acción segura` sin abandonar Portal y consultar el snapshot:
   `zone=portal_plaza`, pero `diagnosis.configured=true`.
6. Para mobile, abrir contexto Playwright `--mobile`, redimensionar a 390×844 y repetir. El canvas
   mide 585×1266, por lo que el DPR efectivo del renderer es 1,5.
7. Para timing, muestrear 180 deltas consecutivos de `requestAnimationFrame` en el estado indicado
   por `performance.json`; no extrapolar esa cifra a Android físico.

## Comandos de baseline

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS, incluida la suite H1+H2.
- `npm run 3d:validate-manifests`: PASS, cuatro manifests del hito más el ejemplo.
- `git diff --check`: PASS.
- `npm run verify`: not-run por bloqueo WSL; no equivale a PASS.
