# ARC1-004 — Evidencia de congelamiento

**Fecha:** 2026-08-02
**Base:** `b49b617`
**Tipo:** canon, sin cambio de runtime
**Paquetes:** `ARC1-004-A` (`DONE`) · `ARC1-004-B` (`DONE`)

## Entregables

| Documento | Congela |
|---|---|
| `COLOR_SCRIPT.md` | la regla de intensidad, la regla de valor, el beat map hora-por-anclaje, la reserva del cian de estado y qué no puede hacer el grading |
| `SHOT_DECK.md` | las 8 tomas parametrizadas, las safe areas desktop/mobile en % y en metros, y la conformidad medida del HUD |

## Trazabilidad — ningún número estimado

### Color script

| Dato citado | Origen | Verificado |
|---|---|---|
| 10 hex de material | `blockoutMaterials.ts:7-21` | 18/18 hex del documento existen en la fuente |
| 4 luces, colores e intensidades | `blockoutLighting.ts:35-96` | idem |
| ausencia de texturas | `blockoutMaterials.ts:106` | `textureCount: 0` |
| una sola luz con sombra | `blockoutLighting.ts:42` y `:104` | `shadowLightCount: 1` |
| HSL, luma relativa WCAG y deltas | `palette.json` | calculado, no estimado |
| anclajes R0…R9 y sus `x` | `levelData.ts:107-116` | 9/9 coinciden |
| umbral C2→C3, histéresis, duraciones | `GOLDEN_FRAMES.md` §3 | — |

### Shot deck

| Dato citado | Origen | Verificado |
|---|---|---|
| anclajes, `x`, `z` | `levelData.ts:107-116` | 9/9 anclajes existen; `x` coincide en los 9 |
| landmarks por zona | `levelData.ts:85-104` | `portal-arch`, `workshop-roof-high`, `ohm-door-frame` |
| giro de 135° en `R2` | `navigation.ts:38-47` | `CANONICAL_ROUTE_ACTIONS` |
| altos visibles C1/C2/C3 | `GOLDEN_FRAMES.md` §3 | 13,5/20 · 9/14,5 · 12/18 |
| sujetos protegidos de oclusión | `GOLDEN_FRAMES.md` GF-05 | los mismos seis, sin inventar otra lista |
| view offset lateral 0,24 | `GOLDEN_FRAMES.md` GF-06 | — |
| rects del HUD y conformidad | `hud-rects.json` | medido por DOM |

## Los tres hallazgos del cálculo

El paquete A no se limitó a transcribir la paleta: el cálculo **confirmó** el patrón que la Biblia
declaraba en prosa y aportó dos reglas que no estaban escritas en ningún lado.

| # | Hallazgo | Número |
|---|---|---|
| 1 | La luz natural cede y **sólo** sube la motivada por el sistema | principal −29,8 %, fill −28,7 %, linterna 0,0 %, conducto **+51,6 %** |
| 2 | **El vidrio no cede valor al crepúsculo** — el instrumento no se oscurece con el ambiente | glass +0,6 % contra ≈ −31 % del resto; agua −17,4 %, la mitad que la piedra |
| 3 | **El contraste se ensancha, no se apaga** | rango de luma entre familias 0,267 → 0,291 |

También quedó registrado un **artefacto que no es regla**: la madera figura girando a 330,0° de
tono, pero a saturación 0,047 el tono es numéricamente inestable y no significa nada. Se anota para
que ningún ticket futuro lo lea como decisión de diseño.

## La reserva del cian, verificada

Umbral congelado: saturación ≥ 0,60 queda reservada al estado del sistema.

| Color | Saturación | ¿Supera el umbral? |
|---|---:|---|
| `0x63dce8` — conducto de la Puerta | 0,743 | **sí** — y es el correcto |
| `0x55aab4` — vidrio, crepúsculo | 0,388 | no |
| `0x72a6ab` — vidrio, tarde | 0,253 | no |

Hoy **un solo** color del slice supera el umbral (`palette.json`,
`derived.saturationsAtOrAboveThreshold`). La regla no rompe nada existente y bloquea lo que viene.

## Conformidad del HUD — medida, no inferida

| Viewport | Franja libre | Contrato | Veredicto |
|---|---:|---:|---|
| desktop 1440×900 | 73,8 % · 6,64 m en C2 | 70,0 % · 6,30 m | **PASS** |
| mobile 390×844 | 48,0 % · 6,96 m en C2 | 60,1 % · 8,71 m | **FAIL** — faltan 1,75 m |

Defectos de mobile, con número: `topbar` invade 60 px la zona crítica por arriba; `diagnosis` la
invade 42 px por abajo; el D-pad se solapa con el panel de estado en 40 × 66 px.

Son exactamente los tres que `CP-012` describía en prosa. **No se corrigieron**: `ARC1-004` es un
ticket de canon y el HUD está fuera de su ownership. Destino `ARC1-026`.

## Estado de captura — declarado

| Qué | Estado |
|---|---|
| Tomas ST-01 … ST-08 | **no capturadas**. Especificadas únicamente |
| GF-01 | única con capturas, y son de blockout (`8784206`) |
| Medición del HUD por DOM | **medida**, no `not-run` |

`GOLDEN_FRAMES.md` §7 sigue vigente: ningún ticket puede inferir el resultado visual de una toma que
no capturó. Este ticket no capturó ninguna y no infiere ninguna.

## Desviación de protocolo declarada

`PACKETS.md` §«Frontera de sesión» exige una sesión nueva por fase y un reviewer con modelo distinto
del builder. **No se cumplió:** las fases `plan`, `build` y `review` de ambos paquetes corrieron en
la misma sesión y con la misma ruta (`claude`). El Director lo decidió así antes de empezar
(`ARC1-004` ficha, decisión 3).

Queda registrado en `telemetry.json` en vez de simularse. No se presenta como review independiente.

## Gates

- `npm run build`: PASS — `✓ built in 6.89s`
- `npm test`: PASS — `ℹ pass 4`, `ℹ fail 0`
- `npm run 3d:validate-manifests`: PASS — 5 manifests
- `git diff --check`: PASS
- consola del harness: 0 errores, 0 warnings
- diff dentro del ownership `v5`: sí — 6 rutas, todas declaradas
- `npm run verify`: **`not-run`** (WSL sin distribución), sustituido como en `ARC1-003`

## Gate humano

Ninguno obligatorio: no hay cambio visible. El Director puede objetar el contenido congelado en
cualquier momento; hacerlo genera una decisión `CP-0NN`, no una reapertura del ticket.
