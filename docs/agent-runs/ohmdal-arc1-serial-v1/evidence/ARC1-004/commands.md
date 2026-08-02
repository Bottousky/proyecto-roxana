# ARC1-004 — Comandos y salidas

**Fecha:** 2026-08-02
**Base:** `b49b617`
**Rama:** `codex/ohmdal-arc1-control-plane`

## Gates automáticos

```
$ npm run build
✓ built in 6.89s

$ npm test
ℹ pass 4
ℹ fail 0

$ npm run 3d:validate-manifests
OK assets/manifests/assets.example.json
OK assets/manifests/ohmdal-hd2d-preprod-ohm-procedural.json
OK assets/manifests/ohmdal-hd2d-preprod-ohm-sprite.json
OK assets/manifests/ohmdal-hd2d-preprod-student-4.json
OK assets/manifests/ohmdal-hd2d-preprod-student-8.json

$ git diff --check
(sin salida — PASS)
```

`npm run verify` (`scripts/verificar-hito.sh`): **`not-run`**. Requiere WSL y esta máquina no tiene
distribución instalada. Sustituido por `build` + `test` + `3d:validate-manifests` + `git diff --check`,
igual que en `ARC1-003`.

## Medición del HUD — `ARC1-004-B`

Servidor: `roxana-dev-alt` (vite, puerto 5199; el 5173 estaba ocupado por otro proceso).
URL: `http://localhost:5199/labs/ohmdal-hd2d-preprod/`.

Método: `getBoundingClientRect()` sobre los elementos `position: fixed|absolute` con área > 0.
**No requiere componer frames**, así que la limitación declarada en `GOLDEN_FRAMES.md` §7 no aplica
a esta medición.

### desktop 1440×900, DPR 1

| Overlay | x | y | w | h |
|---|---:|---:|---:|---:|
| `topbar` | 10 | 10 | 970 | 95 |
| `hud` | 12 | 813 | 390 | 75 |
| `diagnosis` | 1098 | 769 | 330 | 119 |

Canvas: 1440×900 en (0,0).

### mobile 390×844, DPR 2

| Overlay | x | y | w | h |
|---|---:|---:|---:|---:|
| `topbar` | 10 | 10 | 370 | 168 |
| `diagnosis` | 8 | 583 | 374 | 119 |
| `touch` (D-pad) | 244 | 702 | 134 | 134 |
| `hud` | 12 | 770 | 272 | 66 |

Canvas: 390×844 en (0,0).

### Consola

0 errores, 0 warnings. Sólo mensajes de conexión de vite (`[vite] connecting…` / `connected`).

## Cálculos deterministas

```
$ node <script> docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-004/palette.json
$ node <script> docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-004/hud-rects.json
```

Ambos scripts corrieron desde el scratchpad de sesión, **no** se agregaron al repositorio: `scripts/`
está fuera del ownership de este ticket. Su entrada son los valores literales de
`blockoutMaterials.ts`, `blockoutLighting.ts` y los rects medidos arriba; su salida son los dos JSON
de evidencia. El método está documentado dentro de cada JSON (`method`), de modo que el cálculo es
reproducible sin el script.

## Verificación cruzada de citas

```
hex citados en COLOR_SCRIPT: 18 | sin fuente: 0
anclajes citados en SHOT_DECK: 9 | sin fuente: ninguno
x por anclaje: verificados contra levelData
```

Tres citas de línea salieron corridas en el primer borrador y se corrigieron antes de cerrar:
`blockoutLighting.ts` 36-96 → **35-96**; `textureCount: 0` en `blockoutMaterials.ts` 24 → **106**;
la luz con sombra, 41 → **42** y **104**.

## Estado del árbol

```
$ git status --short
 M docs/agent-runs/ohmdal-arc1-serial-v1/ownership.json
?? docs/agent-runs/ohmdal-arc1-serial-v1/COLOR_SCRIPT.md
?? docs/agent-runs/ohmdal-arc1-serial-v1/SHOT_DECK.md
?? docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-004/
?? docs/agent-runs/ohmdal-arc1-serial-v1/packets/ARC1-004/
?? docs/agent-runs/ohmdal-arc1-serial-v1/tickets/ARC1-004.md
?? docs/agent-runs/ohmdal-arco1/
```

`docs/agent-runs/ohmdal-arco1/` es propiedad del usuario y estaba sin trackear **antes** de empezar.
No se toca ni se agrega al commit.
