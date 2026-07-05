# Ohmdal — Vertical slice «El Despertar de la Primera Chispa» (Arco 1)

RPG top-down tile-based estilo GBA. Mundo medieval/mágico cuya "magia" es electrónica: la
Bitácora revela el nombre técnico DESPUÉS de que el jugador vive cada fenómeno.

Es un módulo **autocontenido** (no depende del shell de la escuela). El greybox procedural
anterior sigue intacto en `src/jugar/` (congelado, no se rompió).

## Cómo correr

```bash
npm install        # una vez
npm run dev        # servidor de desarrollo (Vite)
```

Abrir **http://localhost:5173/ohmdal/** (redirige a `/src/ohmdal/`).
Producción: `npm run build` → `npm run preview` → `/src/ohmdal/index.html`.

Controles: **flechas o WASD** para caminar · **E** interactuar · **B** Bitácora.

## Regenerar assets / auditar

```bash
node scripts/generate-ohmdal-assets.mjs   # → assets/ohmdal/generated/*.png
node scripts/audit-assets.mjs             # → data/asset_manifest.json + docs/asset_audit.md
```

## Estructura

```
src/ohmdal/
  main.ts            arranque Phaser + pantalla de título
  config.ts          constantes (tile 16px, zoom 3, tiles sólidos, colores)
  types.ts           MapDef, ObjDef, SliceFlags, SliceState
  save.ts            guardado localStorage ('ohmdal-slice-v1') + flags
  dialog.ts          caja de diálogo DOM + retratos reales del proyecto
  journal.ts         Bitácora (JSON) + modal + desbloqueo por conocimiento
  quests.ts          objetivo actual (HUD)
  hud.ts             HUD: objetivo, botón Bitácora, prompt de interacción
  content.ts         puente datos JSON ↔ diálogo
  puzzles.ts         lógica de los 4 puzzles en-mundo (circuito, conductor, serie, resistencia)
  data/
    maps.ts          los 6 mapas (declarativos: suelo + objetos por tile)
    dialogues.json   guiones
    journal.json     4 entradas (capa vivencial + "nombre verdadero" técnico)
    quests.json      textos de objetivos
  scenes/
    BootScene.ts     preload de assets + animaciones del héroe
    WorldScene.ts    mundo: tiles, jugador, colisión, cámara, interacción, warps, puzzles
```

## Contenido del Arco 1

6 mapas conectados por warps con gating por conocimiento:

1. **Arboleda del Portal** — llegada, movimiento; **Puzzle 1 · circuito cerrado** (encajar el
   conducto de vuelta + bajar la llave) → enciende la lámpara, abre el paso a la plaza.
2. **Plaza de Ohmdal** — Edda presenta el problema (la ciudad sin luz); rutas a taller y camino.
3. **Taller de Maese Lumen** — entrega la Sonda de Continuidad (llave para el camino).
4. **Camino de los Conductores** — **Puzzle 2 · conductor vs aislante** (el cobre cruza, la
   placa oscura no) → enciende el puente, abre la ruina.
5. **Ruina de la Corriente Dormida** — **Puzzle 3 · nodos en serie** (los tres o ninguno) →
   abre la sala final.
6. **Sala de la Primera Chispa** — **Puzzle 4 · resistencia** (encajar la runa de freno) →
   estabiliza el núcleo, la plaza recupera la luz, Ohm despierta (gancho al Arco 2).

Bitácora: `j_closed_circuit`, `j_conductors`, `j_continuity`, `j_resistance`.

## Tests

`node --experimental-strip-types tests/oh-slice.test.ts` valida integridad de datos (6 mapas,
warps con destino y spawn válidos, diálogos/objetivos/entradas referenciados existen).

## Limitaciones conocidas (próxima iteración)

- Sin controles táctiles: hoy solo teclado (falta joystick/d-pad mobile).
- Arte procedural placeholder (paleta teal/cobre coherente); ver `docs/gpt_asset_prompts.md`
  para upgrades opcionales.
- NPCs con un solo frame idle; sin rutina de caminata.
- La fuente de la plaza y el reloj/Ohm del final son sprites simples, no piezas héroe.
