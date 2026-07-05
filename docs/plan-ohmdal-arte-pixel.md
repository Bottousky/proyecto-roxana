# Plan — Ohmdal Arco I al 100% con arte pixel (rama `ohmdal-arco-1`)

**Versión:** 0.1 (2026-07-04)
**Decisión del Director:** pixel art es canon **solo para Ohmdal** (otros mundos deciden después).
El mundo se rehace desde `assets/ohmdal/ohmdal-complete-map.png`: la navegación/salas se
rediseñan contra ese mapa; los puzzles, flags y Bitácora existentes **se portan tal cual**.
**Relación con otros planes:** `plan-arco-1-hubs.md` sigue vigente para Bitácora 2.0/hub;
este plan cubre la brecha G6 (arte) + G1 (mundo) para Ohmdal con pixel art en vez de
`visuals.ts` procedural. La Fase E (E1–E5) de aquel plan queda reemplazada por este documento.

---

## 1. Qué ya existe (no se rehace)

- 23 salas U1–U5 jugables, 17 puzzles con modelo puro + tests, Bitácora v1, audio por zona.
- Mundo continuo por chunks 960×540 (`world.ts`): ohmdal (7 salas), forge (4), terraces (4), lighthouse (4).
- **Sprites pixel ya en escena:** héroe walk/idle 64×96 (4 dir), atlas NPC núcleo (Edda, Lumen,
  Consejera, Forjadora), 12 retratos 192×171 cableados en `dialog.ts` con `portraitKey()`.
- Mapa pergamino (`world-map-panel-1024.png`) usado por la tecla M.
- Mapa isla completo (`ohmdal-complete-map.png`, 1600×900): **fuente de verdad geográfica**
  del Arco I + siembra visual del Arco II (esclusas, balanza, compuertas, corazón) y del
  Empalme (islote robot).

## 2. Lectura canónica del mapa isla

| Icono del mapa | Lugar | Unidad |
|---|---|---|
| Campana (centro) | Plaza de Ohmdal | U1 |
| Castillo (NO, cota alta) | El Castillo | U2 |
| Fragua (O) | La Forja | U3 |
| Escalera verde (SO) | Las Terrazas | U4 |
| Faro+reloj (S, orilla del lago) | Faro y Reloj | U5 |
| Puerta bajo la campana | Puerta de Ohm | U1 |
| Barca con línea punteada | ferry U5→plaza (cierre nocturno) | U5 |
| Corazón (N), balanza (E), compuerta (SE), casa (E) | Arco II — sembrados, sellados | — |
| Islote robot (NE) | El Empalme — visible, inalcanzable | — |

La red de cobre que une los iconos en el mapa es la MISMA red que el jugador camina:
los canales de cobre en el suelo de cada zona siguen las direcciones del mapa.

## 3. Decisiones técnicas (Orquestador)

1. **Tiles como data, no Tiled.** Nuevo módulo puro `src/jugar/decorData.ts`: por sala,
   capas de grillas ASCII de **20×11 celdas de 48 px** + leyenda char→frame de atlas
   (los 12 px sobrantes de los 540 quedan bajo el borde de muralla B=26). La escena las
   renderiza genéricamente debajo de things/rigs. Sala sin decor → sigue el pase procedural
   actual (placeholder automático, cero pantallas rotas durante la migración).
2. **Tile base 48 px** (el pack Medieval Village es de 48 y su README prohíbe escalar hacia
   abajo). Assets de 16 px se escalan ×3 nearest (filtro NEAREST solo en atlas de tiles,
   no global — no degradar las texturas procedurales). Personajes 64×96 no cambian.
3. **Tilesets elegidos** (curados de `assets/ohmdal/`, se copian a `assets/ohmdal/tilesets/`):
   - `MedievalVillageExteriorv1.0/RawAssets/` (48 px, Hypnobius) — suelo, muros, techos, props.
   - `trees_and_bushes_pack` (16 px ×3) — vegetación.
   - `town_rpg_pack/graphics/tiles-map.png` (16 px ×3) — props urbanos de apoyo.
   - `S Frisk - Fantasy Interior Tileset` — interiores (taller, castillo, faro).
   El resto (magecity 32 px, dirt-tiles, crawl/Utumno, colony…) queda como cantera; nada
   se importa "por si acaso".
4. **Piezas héroe** (Puerta de Ohm, pedestal, campana, portal, fachadas, faro, reloj) NO salen
   de packs: se generan con GPT (ver `docs/assets-faltantes-ohmdal.md`). Mientras falten,
   el prop procedural actual actúa de placeholder.
5. **Red de cobre:** tileset propio generado con GPT (no existe en ningún pack). Par
   ida/retorno en una sola pieza, estados apagado/encendido como overlay — igual que pide
   `mapa-ohmdal-greybox.md`.
6. Reglas de arte de `mapa-ohmdal-greybox.md` §"Reglas de arte que protegen el gameplay"
   auditan cada hito de zona.

## 4. Hitos

| # | Hito | Ejecutor | Estado |
|---|---|---|---|
| M0 | Curaduría: `assets/ohmdal/tilesets/` + `licencias.md` + registro de atlas en código | codex/haiku | pendiente |
| M1 | Motor: `decor` en RoomDef + render genérico de capas de tiles + pixelArt (Delicado) | sonnet | pendiente |
| M2 | U1 vestida: plaza + puerta + manantial (canales de cobre, adoquín, piezas héroe/placeholder) | codex | pendiente |
| M3 | Castillo vestido (gate, galería, ramales, corazón) | codex | pendiente |
| M4 | Forja vestida (patio, enfermería, canal largo, nave) | codex | pendiente |
| M5 | Terrazas vestidas (4 niveles descendentes + agua) | codex | pendiente |
| M6 | Faro + Reloj vestidos (espiral vertical, destello) | codex | pendiente |
| M7 | Mapa isla como pantalla de viaje entre regiones (plaza↔forja↔terrazas↔faro, barca U5) + iconos Arco II sellados | sonnet | pendiente |
| M8 | Interiores: taller de Lumen + salas de banco (solo marco de sala; el arte de puzzles NO se toca) | codex | pendiente |
| M9 | Auditoría diálogos: retratos en preview escena por escena + coherencia narrativa/técnica de puzzles contra `auditoria-puzzles-global.md` | Orquestador | pendiente |
| M10 | Cierre nocturno: gran restauración visible (mapa isla encendido de noche) + playtest completo | sonnet + Director | pendiente |

Orden: M0 → M1 → M2 → (M3–M6 secuenciales, nunca dos zonas a la vez) → M7 → M8 → M9 → M10.
Cada hito: spec del Orquestador, `bash scripts/verificar-hito.sh`, verificación jugada en
preview, commit propuesto al Director.

## 5. Criterio de "100%"

1. Ninguna sala del Arco I muestra greybox/procedural (salvo placeholders héroe anotados).
2. Todo diálogo muestra retrato correcto; auditoría M9 firmada.
3. Mapa isla = navegación real entre regiones; pergamino M sigue para el detalle de zona.
4. Puzzles intactos (mismos modelos y tests verdes) y coherentes con la historia.
5. Partida completa de cero jugada por el Director.
