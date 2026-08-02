# Estado operativo — Ohmdal Arco I

**Branch:** `codex/ohmdal-arc1-control-plane`
**Workflow:** `STRICT-SERIAL`
**WIP:** 1/1
**Ejecución autorizada:** **sí** — H3 golden slice, `CP-013`, contrato en `H3_CONTRACT.md`
**Base congelada:** `b49b617`
**Ticket activo:** `ARC1-006 — READY`
**Paquete activo:** ninguno — los define `/arc-plan ARC1-006` (`CP-016`)
**Anteriores:** `ARC1-001` … `ARC1-005`, todos `DONE`
**Siguiente:** `ARC1-007 — BLOCKED`

## Estado real

- `ARC1-001` cerrado con veredicto humano: aprobar y avanzar (`CP-010`). `CAM-FIX-001` aceptado.
- `ARC1-002` cerrado: el usuario autorizó H3 con base `b49b617` (`CP-013`).
- `ARC1-003` cerrado: canon visual congelado (`CP-015`), verificado condición por condición en
  `CP-017`.
- `ARC1-004` cerrado: color script y shot deck congelados (`CP-018`). Primer ticket con la capa de
  paquetes de `CP-016`.
- `ARC1-005` cerrado: escenas, beats, duración y fichas V2 congelados (`CP-019`). Dos paquetes,
  `ARC1-005-A` y `ARC1-005-B`, ambos `DONE` en ronda 1.
- `ownership.json` v8 apunta a `ARC1-006`. La rotación es paso del cierre (`CP-017`), no del ticket
  siguiente.
- H3 cubre `ARC1-003` … `ARC1-035`: golden slice Portal → Plaza → Taller → Puerta → Manantial.
- La autorización es de **alcance, no de resultado**. Cada ticket conserva sus gates, su evidencia y
  su aprobación humana cuando el cambio sea visible.
- La unidad de producción es la **escena causal completa**. Desde `CP-019` esa lista existe: son
  **cinco escenas**, de las cuales **tres** cargan un acto causal.
- Desde `CP-016` la unidad de **ejecución** es el paquete `ARC1-NNN-X` (30–90 min, una sesión
  nueva), no el ticket. Protocolo en `PACKETS.md`; hallazgos ajenos en `OPEN_ISSUES.md`; medición
  real de rutas, modelos y duraciones en `telemetry.json`.

## Canon congelado — no se redefine dentro de un ticket de escena

| Documento | Qué fija |
|---|---|
| `GOLDEN_FRAMES.md` | GF-01 … GF-08: qué debe ser legible en cada encuadre del slice |
| `IDENTITY.md` | seis materias, tiempo tarde→crepúsculo, 10 reglas verificables |
| `LEGAL_REFERENCES.md` | qué se toma de la referencia y qué no; 10 fuentes oficiales |
| `COLOR_SCRIPT.md` | con qué luz y en qué punto del recorrido: regla de intensidad, de valor, beat map y reserva del cian |
| `SHOT_DECK.md` | dónde va cada cosa en el cuadro: 8 tomas y safe areas desktop/mobile vinculantes |
| `SCENE_INVENTORY.md` | qué escenas hay, qué beat vive en cada una y cuánto dura cada beat |
| `CONTENT_V2.md` | qué se enseña, con qué ficha V2 y qué beats no llevan ficha |

Cada golden frame tiene contrato de **lectura** (captura) y de **recorrido** (jugando). Un frame
aprobado sólo por screenshot no está aprobado. Sólo GF-01 tiene capturas, y son de blockout.

**Orden de precedencia:** si `SHOT_DECK.md` contradice un golden frame, gana `GOLDEN_FRAMES.md`. En
general gana el documento congelado antes y se abre `CP-0NN`. `SCENE_INVENTORY.md` puede **señalar**
que el beat map de `COLOR_SCRIPT.md` no cubre un beat; no puede redefinirlo.

## Las cinco escenas del slice (`CP-019`)

| Escena | Beats | Acto causal | Golden frames |
|---|---|---|---|
| E1 · Portal y Plaza | 1, 2 | — | GF-01, GF-02 |
| E2 · Activación de Ohm | 3 | sí | **ninguno** (`OI-002`) |
| E3 · Taller de Lumen | 4, 5 | sí | GF-03, GF-04, GF-05 |
| E4 · Puerta de Ohm | 6 | sí | GF-06, GF-07 |
| E5 · Manantial | 7 | — | GF-08 |

**El mapa no produce la duración.** El recorrido completo son 38,05 m y 23,53 s: entre 1,1 % y 1,6 %
del objetivo de 25–35 min. Las escenas causales cargan 24,6–34,6 min. No se agranda el mapa para
llenar el tiempo.

## Prohibiciones vigentes

`src/jugar/**`, migración de runtime o de save, Meshy, generación paga, producción masiva de assets,
dependencias npm nuevas, regiones fuera del slice, `push`/`reset`/`rebase`/reescritura de historia,
`docs/agent-runs/ohmdal-arco1/**` y copiar IP de Dragon Quest.

## `not-run` declarados — nunca se presentan como PASS

| Qué | Estado | Se resuelve en |
|---|---|---|
| Android físico medio 2022 | `not-run` (`CP-014`) | `ARC1-060` |
| `npm run verify` | `not-run`, WSL sin distribución | sustituido por build + test + manifests + diff-check |
| Safari / PWA / offline | `not-run` | `ARC1-027` y `ARC1-060` |
| Duración jugada real | `not-run` | `ARC1-030` |

Ningún ticket puede declarar PASS de rendimiento en Android físico antes de `ARC1-060`, ni PASS de
ritmo antes de `ARC1-030`.

## Preguntas abiertas, no bloqueantes

- `CP-011` — equivalencia de cámara con *DQ3 HD-2D Remake*. Se re-evalúa en `ARC1-024` y `ARC1-030`.
  Si no sostiene la referencia, se abre ticket de corrección propio; no se reabre `ARC1-001`.
- `CP-012` — layout/HUD mobile. Desde `CP-018` es incumplimiento medible: mobile 390×844 **falla**
  las safe areas de `SHOT_DECK.md` §2 con 48,0 % de franja libre contra 60,1 % de contrato. Deuda P2
  hacia `ARC1-026`. **No se corrige oportunistamente.**
- `OI-002` y `OI-003` — la escena E2, activación de Ohm, no tiene anclaje de ruta, ni golden frame,
  ni sujeto protegido de cámara, ni ficha que describa su fenómeno inicial. Ambos P2, destinos
  `ARC1-011` y `ARC1-015`. Convertirlos en ticket es decisión del Director (`CP-002`).

## Última verificación

Sobre `b49b617`, 2026-08-02, al cerrar `ARC1-005`:

- `npm run build`: PASS, `✓ built in 5.83s`.
- `npm test`: PASS, `ℹ tests 4`, `ℹ pass 4`, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- Recorrido calculado, no estimado: `evidence/ARC1-005/route-timing.json`. Hash `be242e48`,
  `validateNavigation()` sin errores.
- Fichas verificadas por ejecución: `evidence/ARC1-005/cards-audit.json`,
  `allCardsPassV2Contract: true`, 6 fichas × 30 campos.
- Solver de la Puerta idéntico al de Lumen, comprobado por igualdad.
- 88.044 órdenes de diagnóstico válidos de ≤12 acciones; mínimos 9 y 10.
- Verificación cruzada de citas: 15/15 `archivo:línea` coinciden con la fuente.
- **Desviación declarada:** las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
  misma sesión y con la misma ruta (`claude`), contra `PACKETS.md` §«Frontera de sesión». Mismo
  criterio que `CP-018`. **No hubo review independiente.**
- **Segunda desviación declarada:** la auditoría independiente V2 de las seis fichas **no se
  repitió**: se hereda del run de preproducción (`CONTENT_V2.md` §3.2).

## Verificación anterior

Sobre `b49b617`, 2026-08-02, al cerrar `ARC1-004`:

- `npm run build`: PASS, `✓ built in 6.89s`. `npm test`: PASS, `ℹ pass 4`, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests. `git diff --check`: PASS.
- Harness en vivo en `/labs/ohmdal-hd2d-preprod/`: consola 0 errores / 0 warnings.
- Medición del HUD por DOM: `evidence/ARC1-004/hud-rects.json`. Paleta calculada:
  `evidence/ARC1-004/palette.json`. 18/18 hex y 9/9 anclajes coinciden con la fuente.
