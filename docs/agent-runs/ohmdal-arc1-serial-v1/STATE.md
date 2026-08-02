# Estado operativo — Ohmdal Arco I

**Branch:** `codex/ohmdal-arc1-control-plane`
**Workflow:** `STRICT-SERIAL`
**WIP:** 1/1
**Ejecución autorizada:** **sí** — H3 golden slice, `CP-013`, contrato en `H3_CONTRACT.md`
**Base congelada:** `b49b617`
**Ticket activo:** `ARC1-004 — READY`
**Anteriores:** `ARC1-001 — DONE`, `ARC1-002 — DONE`, `ARC1-003 — DONE`
**Siguiente:** `ARC1-005 — BLOCKED`

## Estado real

- `ARC1-001` cerrado con veredicto humano: aprobar y avanzar (`CP-010`). `CAM-FIX-001` aceptado.
- `ARC1-002` cerrado: el usuario autorizó H3 con base `b49b617` (`CP-013`).
- `ARC1-003` cerrado: canon visual congelado (`CP-015`).
- H3 cubre `ARC1-003` … `ARC1-035`: golden slice Portal → Plaza → Taller → Puerta → Manantial.
- La autorización es de **alcance, no de resultado**. Cada ticket conserva sus gates, su evidencia y
  su aprobación humana cuando el cambio sea visible.
- La unidad de producción es la **escena causal completa**, no la región ni el lote de assets.

## Canon congelado — no se redefine dentro de un ticket de escena

| Documento | Qué fija |
|---|---|
| `GOLDEN_FRAMES.md` | GF-01 … GF-08: qué debe ser legible en cada encuadre del slice |
| `IDENTITY.md` | seis materias, tiempo tarde→crepúsculo, 10 reglas verificables |
| `LEGAL_REFERENCES.md` | qué se toma de la referencia y qué no; 10 fuentes oficiales |

Cada golden frame tiene contrato de **lectura** (captura) y de **recorrido** (jugando). Un frame
aprobado sólo por screenshot no está aprobado. Sólo GF-01 tiene capturas, y son de blockout.

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

Ningún ticket puede declarar PASS de rendimiento en Android físico antes de `ARC1-060`.

## Preguntas abiertas, no bloqueantes

- `CP-011` — equivalencia de cámara con *DQ3 HD-2D Remake*. Se re-evalúa en `ARC1-024` (con
  materiales, luz, DOF y VFX) y `ARC1-030` (playtest). Si no sostiene la referencia, se abre ticket
  de corrección propio; no se reabre `ARC1-001`.
- `CP-012` — layout/HUD mobile: el panel superior recorta «Recorrido automático», la franja jugable
  queda comprimida y el D-pad pisa el estado. Deuda P2 hacia `ARC1-026`.

## Última verificación

Sobre `b49b617`, 2026-08-02:

- `npm run build`: PASS, `✓ built in 7.48s`.
- `npm test`: PASS, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- Harness en vivo en `/labs/ohmdal-hd2d-preprod/`: consola 0 errores/0 warnings.
- Medición determinista de cámara: `evidence/ARC1-001/metrics.json`.
- `tasks.json`, `ownership.json` y `asset-manifest.json`: JSON válido.
- Backlog machine-readable: 62 keys exactas, cadena serial completa.
