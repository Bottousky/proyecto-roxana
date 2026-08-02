# Estado operativo — Ohmdal Arco I

**Branch:** `codex/ohmdal-arc1-control-plane`
**Workflow:** `STRICT-SERIAL`
**WIP:** 1/1
**Ejecución autorizada:** **sí** — H3 golden slice, `CP-013`, contrato en `H3_CONTRACT.md`
**Base congelada:** `b49b617`
**Ticket activo:** `ARC1-005 — READY`
**Paquete activo:** ninguno — los define `/arc-plan ARC1-005` (`CP-016`)
**Anteriores:** `ARC1-001 — DONE`, `ARC1-002 — DONE`, `ARC1-003 — DONE`, `ARC1-004 — DONE`
**Siguiente:** `ARC1-006 — BLOCKED`

## Estado real

- `ARC1-001` cerrado con veredicto humano: aprobar y avanzar (`CP-010`). `CAM-FIX-001` aceptado.
- `ARC1-002` cerrado: el usuario autorizó H3 con base `b49b617` (`CP-013`).
- `ARC1-003` cerrado: canon visual congelado (`CP-015`). Verificado condición por condición en
  `CP-017` antes de rotar el ownership; sus artefactos ya son `protected`.
- `ARC1-004` cerrado: color script y shot deck congelados (`CP-018`). Primer ticket ejecutado con la
  capa de paquetes de `CP-016`: `ARC1-004-A` y `ARC1-004-B`, ambos `DONE` en ronda 1.
- `ownership.json` v6 apunta a `ARC1-005`. La rotación es paso del cierre (`CP-017`), no del ticket
  siguiente.
- H3 cubre `ARC1-003` … `ARC1-035`: golden slice Portal → Plaza → Taller → Puerta → Manantial.
- La autorización es de **alcance, no de resultado**. Cada ticket conserva sus gates, su evidencia y
  su aprobación humana cuando el cambio sea visible.
- La unidad de producción es la **escena causal completa**, no la región ni el lote de assets.
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

Cada golden frame tiene contrato de **lectura** (captura) y de **recorrido** (jugando). Un frame
aprobado sólo por screenshot no está aprobado. Sólo GF-01 tiene capturas, y son de blockout.

**Orden de precedencia:** si `SHOT_DECK.md` contradice un golden frame, gana `GOLDEN_FRAMES.md` y se
abre `CP-0NN`. El shot deck agrega precisión de encuadre; no reabre qué debe leerse.

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
- `CP-012` — layout/HUD mobile. Desde `CP-018` ya no es cualitativo: mobile 390×844 **falla** las
  safe areas de `SHOT_DECK.md` §2 con 48,0 % de franja libre contra 60,1 % de contrato —1,75 m menos
  en C2—, `topbar` invade 60 px, `diagnosis` 42 px y el D-pad se solapa con el estado en 40 × 66 px.
  Desktop 1440×900 **pasa** con 73,8 %. Sigue siendo deuda P2 hacia `ARC1-026`, que ahora tiene
  criterio de cierre medible. **No se corrige oportunistamente:** el HUD está fuera del ownership de
  cualquier ticket que no sea `ARC1-026`.

## Última verificación

Sobre `b49b617`, 2026-08-02, al cerrar `ARC1-004`:

- `npm run build`: PASS, `✓ built in 6.89s`.
- `npm test`: PASS, `ℹ pass 4`, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- Harness en vivo en `/labs/ohmdal-hd2d-preprod/`: consola 0 errores / 0 warnings.
- Medición del HUD por DOM: `evidence/ARC1-004/hud-rects.json`.
- Paleta calculada, no estimada: `evidence/ARC1-004/palette.json`.
- Verificación cruzada de citas: 18/18 hex y 9/9 anclajes coinciden con la fuente.
- **Desviación declarada:** las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
  misma sesión y con la misma ruta (`claude`), contra `PACKETS.md` §«Frontera de sesión». Decidido
  por el Director antes de empezar y registrado en `telemetry.json`. **No hubo review independiente.**

## Verificación anterior

Sobre `b49b617`, 2026-08-02, al cerrar `ARC1-003`:

- `npm run build`: PASS, `✓ built in 7.48s`.
- `npm test`: PASS, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- Harness en vivo en `/labs/ohmdal-hd2d-preprod/`: consola 0 errores/0 warnings.
- Medición determinista de cámara: `evidence/ARC1-001/metrics.json`.
- `tasks.json`, `ownership.json` y `asset-manifest.json`: JSON válido.
- Backlog machine-readable: 62 keys exactas, cadena serial completa.
