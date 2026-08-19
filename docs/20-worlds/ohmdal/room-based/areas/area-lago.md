# Macroárea `area-lago` — Lago y Acueducto

> ⚠ **`ADR-002` (2026-08-18):** las secciones "World position" / `x0/y0` /
> "Continuidad con vecinos" de esta ficha son **contexto esquemático**. El
> runtime es **room-based**: esta área vive en coordenadas **locales**
> `[0, width) × [0, height)` y sus conexiones son aristas del room graph
> (`SPATIAL_CONTRACT.md`). No se reposicionan rooms por el tamaño de otras.

> **Estado:** `CANON` (ratificado por `ADR-001`).
> **Generado:** 2026-08-17.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `ohmdal-arc-01_v1.md` (Cap 4).

---

## Identidad

| Campo | Valor |
|---|---|
| ID | `area-lago` |
| Nombre | Lago y Acueducto |
| RegionId | `faro` |
| Capítulo(s) | Cap 4 (entrada) |
| Sala(s) original(es) absorbida(s) | (extensión sur de `terraces_aqueduct` + nuevo sector del lago) |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `GREYBOX` (sin plan de arte dedicado en H8; se queda greybox a menos que se produzca específicamente) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 2400 px (≈ 2.5 viewports) |
| `height` | 1620 px (3 viewports) |
| `floor` | 0 |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -1500 |
| `y0` | 2700 |
| Centro de área | (-300, 3510) |
| Region bbox | `faro` ⊂ `[-1500, 2280] × [2700, 4860]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `terraces-aqueduct-mouth` | (480, 2500) | boca del acueducto, al N (entrada desde Terrazas) |
| `lake-dock` | (480, 3800) | muelle del Lago, al SE |
| `archive-pavilion` | (-630, 3588) | pabellón del Archivo, al NO |
| `lighthouse-tower` | (1860, 3780) | torre del Faro, visible al E |

## Propósito

- **Anunciar el Faro**: cuando el jugador entra al Lago, el Faro
  aparece por primera vez como destino (cinemática
  `cinema.faro-reveal`).
- **Resolver la Chispa almacenada** (puzzle `storedspark`).
- **Resolver el Río durmiente** (puzzle `sleepingriver`).
- **Ancla narrativa de Nereo** (el Farero).

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-terrazas` (N) | `walk` (acueducto) | descender por el acueducto | `valleyRestored` |
| → `area-terrazas` (N) | `walk` (acueducto) | volver a las Terrazas | siempre |
| → `area-faro` (E) | `walk` (cinemático ligero) | caminar por la costa hasta el promontorio del Faro | `solvedLighthouse` (parcial) |
| ← `area-faro` (E) | `walk` (cinemático ligero) | volver al Lago | siempre |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport.
- **Encuadre autoral**: al entrar, la cámara encuadra el Lago
  completo (zoom out 10%). Cuando el jugador camina al E, la
  torre del Faro aparece a la vista. La cinemática
  `cinema.faro-reveal` ocurre cuando el jugador se acerca al
  promontorio del Faro por primera vez.
- **Bounds**: `[x0, y0, width, height]`.

## Walkable

- **Costa** (perímetro): walkable alrededor del Lago.
- **Muelle** (SE): walkable amplio, donde Nereo espera.
- **Archivo** (NO): walkable alrededor del pabellón.

## Blockers (colisiones)

- El agua del Lago (no se puede caminar sobre el agua).
- La torre del Faro (no se entra por acá, se entra por el Faro).
- El pabellón del Archivo (sólo se interactúa con él).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `farero` | (480, 3760) | desde `metFarero` | después de `lighthouseRestored` |
| Habitantes de fondo (2 NPCs) | rondan la costa | desde Cap 4 | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `lake-dock` | (480, 3800) | (decorativo, muelle) | baked |
| `archive-pavilion` | (-630, 3588) | (pabellón del Archivo, decorativo) | baked |
| `state-lighthouse-dock` | (480, 3800) | (runtime: ferry al Faro) | state |
| `state-lighthouse-boat` | (480, 3800) | (runtime: barco del Lago) | state |

## Estados (de la región `faro`)

| Estado de región | Lectura observable |
|---|---|
| `DETERIORATED` | Lago quieto, Faro apagado, Nereo en silencio |
| `INTERVENTION` | Lago empieza a tener caudal, Faro en proceso |
| `UNDERSTOOD` | `lighthouseRestored`; Lago con agua en movimiento, Faro iluminado, ferry disponible |

## Cinematic hooks

| Hook | Trigger | Contenido placeholder |
|---|---|---|
| `cinema.faro-reveal` | primera vez que se cruza al E del Lago, post-`solvedLighthouse` (parcial) | pan E→O mostrando la torre del Faro emergiendo del horizonte + audio |

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `lago-orilla-n` | 1200×810 | la orilla norte (cerca del acueducto) |
| `lago-orilla-s` | 1200×810 | la orilla sur (cerca del muelle) |
| `lago-agua` | (decorativo) | el agua del Lago, no transitable |

## Arte requerido

- Fondo 2400×1620 (escenario icónico cuando exista arte).
- Props: muelle, pabellón del Archivo, torre del Faro al fondo,
  agua.
- Variante PAINTED: agua quieta vs. agua en movimiento (dos
  frames del agua).

## Foreground

- Reflejos del Faro en el agua (en `UNDERSTORED` y `UNDERSTOOD`).
- Niebla en `DETERIORATED`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-terrazas` (N) | acueducto al N |
| `area-faro` (E) | costa al E + cinemática |

## Validación

- Tests: puzzles `storedspark` y `sleepingriver` deben seguir
  pasando.
- Gameplay QA: la transición `area-terrazas → area-lago →
  area-faro` debe incluir la cinemática `cinema.faro-reveal` la
  primera vez.
