# Revisión 02 — Ohmdal HD-2D preproducción v1

**Estado:** CONDITIONAL

**Evaluador:** EVAL-001, mismo y único Evaluador

**Commit integrado corregido:** `fd38f292ef93e9fc0f891e1cf1eedec6ecc35afc`

**Fecha:** 2026-08-02

**Ronda:** 2/2, última ronda automática

## Veredicto final

**`avanzar`**. Los cuatro P1 de la ronda 1 están cerrados en navegador real automatizado y no
queda una corrección automática autorizada. El hito H1+H2 puede cerrarse como evidencia favorable
para que el Director proponga H3, sin autorizar H3 por sí mismo.

El estado global permanece **CONDITIONAL**, no PASS absoluto, porque Android físico medio de 2022
no fue probado. Esa condición externa no justifica una tercera ronda de código: debe incorporarse
al contrato de validación del siguiente hito antes de afirmar el piso de 30 fps en dispositivo.

Pipeline único confirmado:

- cámara **casi ortográfica**;
- estudiante **4 direcciones**;
- Ohm **sprite**.

Los tres selectores aparecen deshabilitados con una sola opción y el runtime ya no carga el atlas
de 8 direcciones ni la variante procedural de Ohm.

## Reauditoría de los cuatro P1

| P1 de ronda 1 | Veredicto | Evidencia reproducida en ronda 2 |
|---|---|---|
| C3 ocultaba al estudiante con `blockedIds=[]` | PASS | En 1440×900 y 390×844 el estudiante termina separado de ambos pilares; manantial y marcador siguen visibles. `blockedIds=[]` ahora describe correctamente una línea de vista libre. |
| Portal/Taller/Puerta compartían silueta genérica | PASS | Portal usa ruina asimétrica y dintel transversal; Taller reduce masa de techos y conserva sawtooth/fade; Puerta adopta brazo técnico longitudinal y pilares escalonados. Las tres capturas se distinguen sin textura final. |
| Diagnóstico avanzaba en Portal y faltaba presencia espacial | PASS | En Portal el botón está disabled, `diagnosisUnlocked=false` y un `click()` forzado no cambia el estado. Al entrar al Taller se habilita; Lumen, Ohm y marcador coexisten, y nueve acciones completan `verified=true`, `documented=true`. |
| Ohm no tenía contacto y seguían dos pipelines | PASS | La sombra elíptica de Ohm es visible junto a la del estudiante. UI y snapshot fijan casi ortográfica + 4 + sprite; sólo se observan las texturas seleccionadas. |

## Gates

| Criterio | Nota | Veredicto | Severidad | Evidencia y resultado |
|---|---:|---|---|---|
| Educación V2 | 5/5 | PASS | — | Suite H1 completa PASS. Flujo en Taller llega a `energized_locked`, `verified=true`, `documented=true`; el botón queda disabled al finalizar. |
| Composición y cámara | 4/5 | PASS | — | C1, C2 y C3 conservan encuadres autorales. C3 desktop/mobile mantiene estudiante, marcador y manantial legibles sin fade espurio. |
| Escala humana | 4/5 | PASS | — | Metros, maniquí 1,72 m, pivotes de suelo y navegación plana continúan cubiertos por tests y recorrido real. |
| Silueta arquitectónica | 4/5 | PASS | — | Portal asimétrico, Taller sawtooth aligerado y Puerta técnica longitudinal se reconocen como landmarks distintos dentro del blockout. |
| Legibilidad de interacción | 4/5 | PASS | — | El diagnóstico sólo se habilita tras visitar Taller; Lumen, Ohm, medida y feedback DOM coexisten en C2. La ruta nunca queda bloqueada. |
| Integración sprite/suelo/sombra | 4/5 | PASS | — | Estudiante y Ohm conservan pivote de pies/suelo y sombras de contacto; dirección y pipeline son únicos. |
| Materiales e iluminación de blockout | 3/5 | PASS | — | Familias y tarde/crepúsculo se conservan, con una sola luz con sombra y sin sumar postprocesado. |
| Rendimiento mobile medido | 3/5 | CONDITIONAL | Condición de release | Mobile emulado 390×844, DPR renderer 1,5: 18 llamadas, 388 triángulos, 28 geometrías, 3 texturas; 120 frames a 16,6683 ms de media. Android físico sigue `null`. |
| Rendimiento desktop medido | 4/5 | PASS | — | Taller con diagnóstico documentado: 17 llamadas, 412 triángulos, 28 geometrías, 3 texturas; 120 frames a 16,6667 ms de media; consola 0/0. |
| Estabilidad y disposal | 4/5 | PASS | — | Build, suite completa, manifests y diff-check PASS; tests nuevos cubren composición, sockets protegidos y bloqueo del diagnóstico; reload y recorridos sin consola. |

No persiste ningún P0 ni P1 de implementación. La única condición de aprobación total es la prueba
externa en Android físico; no se abre una tercera ronda automática.

## Hechos

- `render_game_to_text()` en Portal antes y después de un click programático devuelve
  `diagnosisUnlocked=false`, `configured=false`.
- En Taller devuelve `diagnosisUnlocked=true`; el techo bajo alcanza opacidad 0,18 cuando protege
  jugador/Lumen/Ohm/medida y restaura 1 fuera del set.
- En C3 final desktop: 13 llamadas, 186 triángulos, 28 geometrías y 3 texturas;
  `blockedIds=[]` con el estudiante completamente visible.
- En C3 final mobile: 13 llamadas, 222 triángulos, 28 geometrías y 3 texturas;
  `blockedIds=[]` con el estudiante completamente visible.
- Touch activo de 700 ms movió al estudiante de `x=-18` a `x=-16,5336`; consola limpia.
- `prefers-reduced-motion: reduce` produjo `reducedMotion=true` y la ruta completa.
- Chromium desktop y mobile informaron 0 errores y 0 warnings en sesiones limpias.

## Inferencias y deuda no bloqueante

- La corrección es estructural: cambió encuadre, masa y protección de sujetos; no depende de
  agregar textura o efectos para ocultar la oclusión.
- El lenguaje todavía es blockout y no alcanza arte final, pero sí reduce la incertidumbre que H2
  debía resolver.
- P2: el topbar mobile conserva scroll interno; al mover foco puede sacar el título fuera de vista.
  Los controles siguen accesibles y no cubren pies ni marcador, pero H3 no debería heredar esta UI
  de harness como UX final.
- La prueba de 60 fps en browser automatizado demuestra ausencia de regresión del blockout, no el
  rendimiento de un Android físico ni de una futura escena con arte de producción.

## Bloqueos y límites

- Android físico medio de 2022: no disponible; `fps`, `frameTimeMs` y `result` permanecen
  `null`, `null`, `not-run`.
- Payload de producción: no repetido. El lab no es entrada del build; `transferredBytes` permanece
  `null` y no se promueve el dato cacheado de Vite de ronda 1 al commit corregido.
- `npm run verify`: not-run. `wsl -l -q` no informó una distribución operativa; no equivale a PASS.
- Una nueva corrección o evaluación automática sería ronda 3 y requiere aprobación humana.

## Evidencia visual

Las capturas quedan fuera del repositorio para respetar ownership:

| Estado | Ruta | SHA-256 |
|---|---|---|
| Desktop Portal, diagnóstico bloqueado | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\desktop-portal-locked.png` | `C53BF067DAA88E9AC0063F3F8C54A265CD83B252B4F8E6DAAEF351DE3F4D7EDD` |
| Desktop Taller, Lumen/Ohm/sombra/medida | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\desktop-taller-lumen-ohm.png` | `DC566E479EE09A0BEB3BE57B1232590AD8000CAE4EFF2FAF86348B9B2EDC035D` |
| Desktop Taller, diagnóstico completo | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\desktop-taller-diagnosis-complete.png` | `4216ABF3B37264191FA2F10FE5CCB1C5D43251CA27B94D69D0F57CF301257D88` |
| Desktop C3 final | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\desktop-manantial-final-afternoon.png` | `98C11650C31778C02B05B1E6DE27F8257A61CB7779A7E79990756ADC5FE851CA` |
| Mobile Portal + touch | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\mobile-portal-touch.png` | `4665D63E9EA2AD513520E022659D45B94055C4EB7171476F47235A2CA7B3F7C7` |
| Mobile Taller, Lumen/Ohm | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\mobile-taller-lumen.png` | `1D5868EAD8737283AA4A42806B19DCD7620E927A6FFCA99BFBE5BDA2B1A7E433` |
| Mobile C3 final + reduced motion | `C:\Users\manue\AppData\Local\Temp\roxana-eval-001-r2\mobile-manantial-final-reduced.png` | `7781169879BE982D91D8F7836205A511FFA1A767EB229DD078EAC008E016BC76` |

## Pasos reproducibles mínimos

1. En `fd38f29`, ejecutar `npm install` y
   `npm run dev -- --host 127.0.0.1 --port 4173`.
2. Abrir `/labs/ohmdal-hd2d-preprod/` a 1440×900. Verificar selectores únicos y botón de
   diagnóstico disabled en Portal; `render_game_to_text()` debe conservar el estado tras click.
3. Iniciar el recorrido y detenerlo en Taller. Verificar Lumen, Ohm, sombra, marcador,
   `diagnosisUnlocked=true` y `workshop-roof-low.opacity=0.18` cuando corresponde.
4. Completar nueve acciones y reanudar hasta Manantial. En C3, comprobar visualmente separación de
   pilares y `blockedIds=[]`.
5. Repetir con Playwright `--mobile`, 390×844 y `reducedMotion: reduce`; mantener un touch activo
   700 ms sobre “Mover hacia arriba” y repetir el recorrido.
6. Muestrear 120 deltas `requestAnimationFrame` sólo como smoke anti-regresión; no extrapolar a
   Android físico.

## Baseline de ronda 2

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS, incluida la nueva suite de composición.
- `npm run 3d:validate-manifests`: PASS.
- `git diff --check`: PASS.
- `npm run verify`: not-run por WSL no operativo.
