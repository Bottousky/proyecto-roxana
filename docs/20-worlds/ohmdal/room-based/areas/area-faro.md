# Macroárea `area-faro` — Faro y Reloj

> ⚠ **`ADR-002` (2026-08-18):** las secciones "World position" / `x0/y0` /
> "Continuidad con vecinos" de esta ficha son **contexto esquemático**. El
> runtime es **room-based**: esta área vive en coordenadas **locales**
> `[0, width) × [0, height)` y sus conexiones son aristas del room graph
> (`SPATIAL_CONTRACT.md`). No se reposicionan rooms por el tamaño de otras.

> **Estado:** `CANON` (ratificado por `ADR-001`).
> **Generado:** 2026-08-17.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `ohmdal-arc-01_v1.md` (Cap 4 + Epílogo).

---

## Identidad

| Campo | Valor |
|---|---|
| ID | `area-faro` |
| Nombre | Faro y Reloj |
| RegionId | `faro` |
| Capítulo(s) | Cap 4 (cierre) + Epílogo |
| Sala(s) original(es) absorbida(s) | `lighthouse_hall` + `lighthouse_bench` + `clock_tower` + `lighthouse_lantern` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 2880×1620 que reusa los 4 fondos pintados existentes como paneles) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 2880 px (3 viewports de ancho) |
| `height` | 1620 px (3 viewports) |
| `floor` | 0 (base), `+1` (balcón del reloj), `+2`, `+3` (lens en la torre) |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -600 |
| `y0` | 3240 |
| Centro de área | (840, 4050) |
| Region bbox | `faro` ⊂ `[-1500, 2280] × [2700, 4860]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `lighthouse-tower` | (1860, 3780) | torre del Faro |
| `lighthouse-lens` | (1860, 3240) | lens de la linterna (en la cima de la torre) |
| `clock-tower` | (840, 3780) | torre del Reloj |
| `lighthouse-hall` | (1245, 3965) | hall del Faro (base) |
| `lighthouse-bench` | (1855, 3965) | banco del Faro (mirador) |

## Propósito

- **Calibrar el Reloj** (puzzle `clock`).
- **Calibrar el Faro** (puzzle `lighthouse`).
- **Ancla pedagógica de Cap 4**: lazos, divisores, equivalentes,
  RC.
- **Cierre del Arco I**: el Faro se enciende, la señal vuelve, la
  comunidad se reúne.
- **Epílogo**: Edda enseña a otra persona; el protagonista ya no
  es indispensable.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-lago` (O) | `walk` (cinemático ligero) | volver del Lago | siempre |
| → `area-lago` (O) | `walk` (cinemático ligero) | volver al Lago | siempre |
| → Epílogo | `cinematic` (cinema.faro-closing) | tras `lighthouseRestored` | `lighthouseRestored` |
| → `INSTITUTO` | `cinematic` (cinema.instituto-return) | tras Epílogo | epílogo completo |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport.
- **Encuadre autoral**: al entrar, la cámara encuadra el Faro
  completo (zoom out 10%). Cuando el jugador sube a la torre, la
  cámara encuadra la lens y el horizonte del Lago.
- **Bounds**: `[x0, y0, width, height]`.
- **Cinemáticas**: `cinema.faro-reveal` (en el Lago, primera vez),
  `cinema.faro-closing` (al Epílogo), `cinema.instituto-return`
  (regreso al Instituto).

## Walkable

- **Hall del Faro** (O, base): walkable amplio.
- **Mirador** (centro, base): walkable alrededor del Reloj.
- **Plataforma del Faro** (E, base): walkable alrededor de la
  torre.
- **Balcón del Reloj** (centro, +1): walkable elevado.
- **Linterna** (E, +3): walkable alrededor de la lens (cuando
  está activa).

## Blockers (colisiones)

- La torre del Faro (sólo se entra por la puerta de la base).
- La torre del Reloj (sólo se entra por la puerta de la base).
- La lens (en la cima de la torre del Faro).
- Los pedestales y las máquinas.

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `farero` | (1460, 3990) | desde `metFarero` | después de `lighthouseRestored` |
| Habitantes de fondo (3-4 NPCs) | rondan el complejo | desde Cap 4 | nunca |
| (futuro) Alumno de Edda | centro del Faro | en el Epílogo | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `lighthouse-hall` | (1245, 3965) | (entrada al Faro) | baked |
| `lighthouse-bench` | (1855, 3965) | puzzle `storedspark` (alias de `banco-chispa`) | baked |
| `clock_tower` (nota: en el runtime, el ID es `clock_tower` con underscore) | (840, 3780) | puzzle `clock` (alias de `banco-reloj`) | baked |
| `lighthouse-lantern` | (1860, 3240) | puzzle `lighthouse` (alias de `banco-faro`) | baked; prompt "Calibrar el Faro" |
| `state-lighthouse-lens-on` | (1860, 3240) | (runtime: lens encendida) | state |

## Estados (de la región `faro`)

| Estado de región | Lectura observable |
|---|---|
| `DETERIORATED` | Faro apagado, lens apagada, Nereo en silencio |
| `INTERVENTION` | Faro en proceso de calibración, Nereo trabaja |
| `UNDERSTOOD` | `lighthouseRestored`; lens encendida (efecto `sprite` con `state-lighthouse-lens-on`), haz giratorio, Lago iluminado |

## Cinematic hooks

| Hook | Trigger | Contenido placeholder |
|---|---|---|
| `cinema.faro-reveal` | primera vez que se entra al Faro | pan E→O desde el Lago |
| `cinema.faro-closing` | tras `lighthouseRestored` | Edda enseña a otra persona, el protagonista se va |
| `cinema.instituto-return` | tras Epílogo | el Instituto recuerda la partida |

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `faro-hall` | 960×810 | el hall del Faro (O, base) |
| `faro-bench` | 960×810 | el mirador (centro, base) |
| `faro-tower` | 960×810 | la torre del Faro (E, base + 1) |
| `faro-lens` | 960×540 | la lens (E, +3) |

## Arte requerido

- Fondo 2880×1620 (o 3 paneles 960×1620 lado a lado).
- Variantes: `room-lighthouse-hall`, `room-lighthouse-bench`,
  `room-clock-tower`, `room-lighthouse-lantern` (existentes en
  `assets/ohmdal/rooms/pilot-arco1/`).
- Variante PAINTED del lens: `state-lighthouse-lens-on` reemplaza
  a la lens apagada cuando `lighthouseRestored`.
- Props: la torre, el reloj, el banco, la lens, el muelle al S.

## Foreground

- Niebla en `DETERIORATED`.
- Reflejos del Faro en el Lago (vista desde el muelle).
- El haz del Faro en `UNDERSTOOD` (overlay de pantalla completa,
  no rotatorio en esta fase).

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-lago` (O) | costa al O |
| Epílogo | cinemática |

## Validación

- Tests: puzzles `clock` y `lighthouse` deben seguir pasando.
- Gameplay QA: el cierre del Arco I debe poder recorrerse
  Portal→Faro en GREYBOX.
- **Criterio de cierre**: la Bitácora abre
  `bitacora.faro-encendido` y el HUD muestra el Faro encendido.
