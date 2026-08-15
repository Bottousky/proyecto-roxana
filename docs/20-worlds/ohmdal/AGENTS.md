# AGENTS.md — Ohmdal

> **Verbo nuclear:** **CONECTAR**.
> **Disciplina:** Electrónica (corriente continua).
> **Estado:** único mundo en **producción real**. H1 (Plaza HD-2D) hecho; H2 (Plaza de verdad) en curso; Arco I completo jugable en greybox (`/jugar`).

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Ohmdal. Cualquier
agente que trabaje sobre Ohmdal lee los dos.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3)

- [`../vision/ohmdal-vision_v1.md`](../vision/ohmdal-vision_v1.md) — North Star, fantasía, anti-pilares.
- [`../gameplay/ohmdal-core-gameplay_v1.md`](../gameplay/ohmdal-core-gameplay_v1.md) — modos, loop, feedback.
- [`../gameplay/ohmdal-electrical-system_v1.md`](../gameplay/ohmdal-electrical-system_v1.md) — modelo eléctrico.
- [`../gameplay/ohmdal-puzzle-grammar_v1.md`](../gameplay/ohmdal-puzzle-grammar_v1.md) — qué puzzles podemos construir.
- [`../gameplay/ohmdal-mechanics-progression_v1.md`](../gameplay/ohmdal-mechanics-progression_v1.md) — progresión mecánica.
- [`../world/ohmdal-world-structure_v1.md`](../world/ohmdal-world-structure_v1.md) — geografía y regiones.
- [`../narrative/ohmdal-narrative-bible_v1.md`](../narrative/ohmdal-narrative-bible_v1.md) — personajes, lore.
- [`../content/ohmdal-arc-01_v1.md`](../content/ohmdal-arc-01_v1.md) — contenido del Arco I.
- [`../content/ohmdal-vertical-slice_v1.md`](../content/ohmdal-vertical-slice_v1.md) — qué demuestra el slice.
- [`../production/ohmdal-prototype-evaluation_v1.md`](../production/ohmdal-prototype-evaluation_v1.md) — estado del prototipo.
- [`../production/direccion-ambiental-arco1.md`](../production/direccion-ambiental-arco1.md) — color script y ambientación.
- [`../production/sistema-arte-v1.md`](../production/sistema-arte-v1.md) — sistema de arte.

### Autoridad histórica (insumo)

- [`../../ohmdal-biblia/00_MASTER_INDEX.md`](../../ohmdal-biblia/00_MASTER_INDEX.md) — biblia consolidada pre-v1.
- [`../../ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md`](../../ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md) — GDD canónico histórico.
- [`../../ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md`](../../ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md) — investigación DQ III HD-2D.
- [`../../ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md`](../../ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md) — backlog serie La Luz.

### Direcciones vivas

- [`../../arco1/IDENTITY.md`](../../arco1/IDENTITY.md) — identidad visual.
- [`../../arco1/COLOR_SCRIPT.md`](../../arco1/COLOR_SCRIPT.md) — color script.
- [`../../arco1/GOLDEN_FRAMES.md`](../../arco1/GOLDEN_FRAMES.md) — encuadres canónicos.
- [`../../arco1/SHOT_DECK.md`](../../arco1/SHOT_DECK.md) — contrato de encuadres.

---

## 2. Estado de implementación

| Hito | Descripción | Estado |
|---|---|---|
| H1 | HD-2D fuera del laboratorio | ✅ hecho |
| H2 | Plaza de verdad en HD-2D | ← **acá estamos** |
| H3 | Primer puzzle en HD-2D (Reactivar a Ohm) | próximo |
| H4 | El Instituto recuerda la partida | pendiente |
| H5 | Arte real sobre el blockout | pendiente |
| H6 | Resto del Arco I (Taller, Puerta, Castillo, Forja, Terrazas, Faro) | pendiente |

**Baseline jugable:** `/jugar` (Phaser topdown, greybox). Se preserva como red de
seguridad y referencia de contenido hasta que el HD-2D lo alcance. Ver [`ROADMAP.md`](../../../ROADMAP.md).

---

## 3. Reglas locales de Ohmdal

### DO

- Electricidad = comportamiento del mundo observable (luz, calor, movimiento, sonido).
- Feedback inmediato: el jugador ve el efecto antes de ver el número.
- ≥2 soluciones por puzzle (ver [`../../guia-puzzles.md`](../../guia-puzzles.md)).
- Modelo puro en `src/puzzles/<x>Model.ts` con tests en `tests/m<X>-<x>.test.ts`.
- Vocabulario diegético: Empuje / Río / Piedra / Camino / Freno / Chispa. Lo técnico
  (`V`, `I`, `R`, `serie`, `paralelo`, `capacitor`) solo en la capa formal de la
  Bitácora, gateada por flags de formalización.
- Cámara casi ortográfica sobre dioramas 3D, sprites pixel art de 4 direcciones.

### DON'T

- Quizzes disfrazados ni "preguntar V = I·R para abrir una puerta".
- Bancos modales a pantalla completa para puzzles del slice (los bancos modales son
  deuda conocida del slice greybox; los nuevos van diegéticos).
- Combinar nombres técnicos y diegéticos en el mismo diálogo.
- "Tocar hasta que se ponga verde": todo puzzle exige predicción → observación → explicación.
- Overlays físicos permanentes sobre el sprite (rompe HD-2D).

---

## 4. Por tipo de tarea, qué sub-agent dispatchar

| Tarea | Sub-agent | Input esperado | Output esperado |
|---|---|---|---|
| Diseñar un puzzle (modelo + vista + Bitácora) | `worker-gameplay` | unidad del guion + gramática | código + tests + flag |
| Validar ≥2 soluciones de un modelo | `m3-qa` | `xModel.ts` + tests | informe de cobertura |
| Pintar/animar sprites o dioramas HD-2D | `worker-world` | brief visual + ref DQ3 | assets + manifests |
| Auditar encuadre / cámara / composición | `m3-visual` | screenshot + `SHOT_DECK.md` | veredicto + ajustes |
| Auditar puzzle contra `guia-puzzles.md` | `m3-qa` | puzzle vivo + checklist | informe priorizado |
| Investigar lore o historia del mundo | `explore` | objetivo textual | mapa de referencias |
| Implementación multi-paso no especializada | `general` | brief | código + commit propuesta |

---

## 5. Convenciones del código Ohmdal

- Runtime: `src/ohmdal/` (HD-2D con Three.js + Phaser topdown coexisten bajo `RuntimeHost`).
- Baseline jugable: `src/jugar/` (Phaser topdown greybox).
- Tests: `tests/mX-x.test.ts` con `node --experimental-strip-types`. Imports con `.ts`.
- Manifiestos: `src/experiences/manifests.ts` — `OHMDAL.runtime` cambia entre
  `topdown-phaser` (legacy `/jugar`) y `ohmdal-hd2d` (nuevo `/ohmdal`).
- Portal: `src/shared/portalLink.ts` — único interruptor de migración (`portalGateUrl()`).

---

## 6. Qué NO tocar sin ADR

- `src/jugar/rooms.ts` (23 salas U1–U5, contrato narrativo del slice).
- `src/state.ts` y `src/ui/bitacora.ts` (Bitácora, flags de formalización).
- `src/experiences/manifests.ts` campo `runtime` sin pasar por ADR.
- Cualquier doc `CANON` o nivel 0–1.
- `npm run build` debe seguir verde tras cada cambio.