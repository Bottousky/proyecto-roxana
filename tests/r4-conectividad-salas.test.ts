import { register } from 'node:module';
import type { DoorDef, ThingDef } from '../src/jugar/rooms.ts';
import type { RoomSceneProfile, SceneRect } from '../src/jugar/roomScenesData.ts';

// rooms.ts importa media docena de módulos hermanos sin extensión
// (`from '../state'`, `from '../puzzles/despertar'`, etc.), al estilo
// Vite/bundler. Node ESM no resuelve eso solo, así que registramos un hook
// de resolución SOLO para este test (no toca ningún archivo de src/) antes
// de importar el módulo real con un `import()` dinámico.
register('./helpers/ts-relative-resolver.mjs', import.meta.url);

// rooms.ts arrastra src/audio.ts, que lee `localStorage` en la inicialización
// de módulo (nivel top, no dentro de una función) para recordar el volumen.
// Node no tiene `localStorage`; se rellena un shim mínimo en memoria SOLO
// para este test, sin tocar audio.ts.
if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  } as Storage;
}

const { ROOMS } = (await import('../src/jugar/rooms.ts')) as { ROOMS: Record<string, { doors: DoorDef[]; things: ThingDef[] }> };
const { ROOM_SCENES, scaleAt, rectContainsRect } = (await import('../src/jugar/roomScenesData.ts')) as {
  ROOM_SCENES: Record<string, RoomSceneProfile>;
  scaleAt: (profile: RoomSceneProfile | undefined, y: number) => number;
  rectContainsRect: (outer: SceneRect, inner: SceneRect) => boolean;
};

/**
 * R4 — Conectividad real de salas pintadas.
 *
 * Replica el modelo de colisión del motor (ExplorationScene.collides) sobre
 * una grilla de muestreo, para detectar puertas o things inalcanzables que
 * ningún test de texto anterior podía ver (necesitan geometría, no strings).
 *
 * Modelo (idéntico al de la spec del hito R4):
 *   - jugador = caja cuadrada de radio r = 12 * max(0.5, scaleAt(perfil, y))
 *   - posición legal <=> la caja cabe COMPLETA dentro de algún rect de
 *     `walkable` y no solapa ningún rect de `collision`
 *   - flood-fill de 4 direcciones sobre una grilla de 8px, sembrado desde
 *     `entries`
 */

const STEP = 8;
const CANVAS_W = 960;
const CANVAS_H = 540;
const DOOR_MARGIN = 14;
const THING_BASE_REACH = 72;
const ENTRY_TOLERANCE = 16;

interface Rect { x: number; y: number; w: number; h: number }
interface Cell { gx: number; gy: number }

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerRadiusAt(profile: RoomSceneProfile, y: number): number {
  return 12 * Math.max(0.5, scaleAt(profile, y));
}

function playerBoxAt(profile: RoomSceneProfile, x: number, y: number): Rect {
  const r = playerRadiusAt(profile, y);
  return { x: x - r, y: y - r, w: r * 2, h: r * 2 };
}

function isLegal(profile: RoomSceneProfile, x: number, y: number): boolean {
  const box = playerBoxAt(profile, x, y);
  const fitsWalkable = profile.walkable.some((rect: SceneRect) => rectContainsRect(rect, box));
  if (!fitsWalkable) return false;
  const hitsCollision = (profile.collision ?? []).some((rect: SceneRect) => rectsOverlap(box, rect));
  return !hitsCollision;
}

function gridPoint(cell: Cell): { x: number; y: number } {
  return { x: cell.gx * STEP, y: cell.gy * STEP };
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

/** Construye la grilla de legalidad de una sala (true = celda transitable). */
function buildLegalGrid(profile: RoomSceneProfile): boolean[][] {
  const cols = Math.floor(CANVAS_W / STEP);
  const rows = Math.floor(CANVAS_H / STEP);
  const grid: boolean[][] = [];
  for (let gx = 0; gx < cols; gx++) {
    const col: boolean[] = [];
    for (let gy = 0; gy < rows; gy++) {
      col.push(isLegal(profile, gx * STEP, gy * STEP));
    }
    grid.push(col);
  }
  return grid;
}

/** Celdas legales dentro de ENTRY_TOLERANCE px de un punto dado (para sembrar el flood-fill). */
function legalCellsNear(grid: boolean[][], x: number, y: number): Cell[] {
  const cols = grid.length;
  const rows = grid[0]?.length ?? 0;
  const found: Cell[] = [];
  const spread = Math.ceil(ENTRY_TOLERANCE / STEP) + 1;
  const cgx = Math.round(x / STEP);
  const cgy = Math.round(y / STEP);
  for (let gx = cgx - spread; gx <= cgx + spread; gx++) {
    if (gx < 0 || gx >= cols) continue;
    for (let gy = cgy - spread; gy <= cgy + spread; gy++) {
      if (gy < 0 || gy >= rows) continue;
      if (!grid[gx][gy]) continue;
      const p = gridPoint({ gx, gy });
      if (dist(p.x, p.y, x, y) <= ENTRY_TOLERANCE) found.push({ gx, gy });
    }
  }
  return found;
}

/** Flood-fill de 4 direcciones sobre la grilla legal, sembrado en `seeds`. */
function floodFill(grid: boolean[][], seeds: Cell[]): boolean[][] {
  const cols = grid.length;
  const rows = grid[0]?.length ?? 0;
  const reached: boolean[][] = grid.map((col) => col.map(() => false));
  const queue: Cell[] = [];
  for (const s of seeds) {
    if (!reached[s.gx][s.gy]) {
      reached[s.gx][s.gy] = true;
      queue.push(s);
    }
  }
  while (queue.length) {
    const { gx, gy } = queue.pop()!;
    const neighbors: Cell[] = [
      { gx: gx - 1, gy }, { gx: gx + 1, gy },
      { gx, gy: gy - 1 }, { gx, gy: gy + 1 },
    ];
    for (const n of neighbors) {
      if (n.gx < 0 || n.gx >= cols || n.gy < 0 || n.gy >= rows) continue;
      if (reached[n.gx][n.gy] || !grid[n.gx][n.gy]) continue;
      reached[n.gx][n.gy] = true;
      queue.push(n);
    }
  }
  return reached;
}

// Excepciones conocidas (vacío = el assert 4c rige estricto para todo).
// Si un cambio de datos vuelve inalcanzable un thing, la corrección va en
// roomScenesData.ts (reubicar el thing o ampliar walkable), no acá.
const KNOWN_UNREACHABLE_THINGS = new Set<string>([]);

interface Failure { room: string; kind: string; detail: string }
const failures: Failure[] = [];
const knownIssues: Failure[] = [];

let roomsTested = 0;
let doorsTested = 0;
let thingsTested = 0;

for (const roomId of Object.keys(ROOMS)) {
  const profile = ROOM_SCENES[roomId];
  if (!profile) continue; // solo salas con fondo pintado (perfil) entran al modelo
  roomsTested++;
  const room = ROOMS[roomId];

  const legalGrid = buildLegalGrid(profile);

  // --- 4a: cada entry es legal (o tiene una celda legal a <=16px) ---
  const entries = profile.entries ?? {};
  const allSeeds: Cell[] = [];
  for (const [entryId, pos] of Object.entries(entries)) {
    const near = legalCellsNear(legalGrid, pos.x, pos.y);
    if (near.length === 0) {
      failures.push({
        room: roomId,
        kind: 'entry',
        detail: `entry '${entryId}' en (${pos.x},${pos.y}) no tiene ninguna celda legal a <=${ENTRY_TOLERANCE}px`,
      });
      continue;
    }
    allSeeds.push(...near);
  }

  const reached = floodFill(legalGrid, allSeeds);
  const reachedCells: Cell[] = [];
  for (let gx = 0; gx < reached.length; gx++) {
    for (let gy = 0; gy < reached[gx].length; gy++) {
      if (reached[gx][gy]) reachedCells.push({ gx, gy });
    }
  }

  // --- 4b: cada puerta de ROOMS[sala].doors es alcanzable ---
  for (const door of room.doors as DoorDef[]) {
    doorsTested++;
    const anchor = profile.doors?.[door.to];
    const zoneRaw: Rect = anchor ?? { x: door.x, y: door.y, w: door.w, h: door.h };
    const zone: Rect = {
      x: zoneRaw.x - DOOR_MARGIN,
      y: zoneRaw.y - DOOR_MARGIN,
      w: zoneRaw.w + DOOR_MARGIN * 2,
      h: zoneRaw.h + DOOR_MARGIN * 2,
    };
    const ok = reachedCells.some((c) => {
      const p = gridPoint(c);
      const box = playerBoxAt(profile, p.x, p.y);
      return rectsOverlap(box, zone);
    });
    if (!ok) {
      failures.push({
        room: roomId,
        kind: 'puerta',
        detail: `puerta hacia '${door.to}' (zona efectiva x${zone.x},y${zone.y},w${zone.w},h${zone.h}) inalcanzable desde las entries`,
      });
    }
  }

  // --- 4c: cada thing de ROOMS[sala].things es alcanzable ---
  for (const thing of room.things as ThingDef[]) {
    thingsTested++;
    const override = profile.things?.[thing.id];
    const center = override ?? { x: thing.x, y: thing.y };
    const reach = THING_BASE_REACH + Math.max(thing.w, thing.h) / 2;
    const ok = reachedCells.some((c) => {
      const p = gridPoint(c);
      return dist(p.x, p.y, center.x, center.y) <= reach;
    });
    if (!ok) {
      const issue: Failure = {
        room: roomId,
        kind: 'thing',
        detail: `thing '${thing.id}' en (${center.x},${center.y}) fuera de alcance ${reach}px de toda celda alcanzada`,
      };
      // TODO(auditoría): ver nota junto a KNOWN_UNREACHABLE_THINGS más arriba.
      if (KNOWN_UNREACHABLE_THINGS.has(`${roomId}:${thing.id}`)) knownIssues.push(issue);
      else failures.push(issue);
    }
  }

  // --- 4d: higiene de datos ---
  for (const to of Object.keys(profile.doors ?? {})) {
    const matches = room.doors.some((d) => d.to === to);
    if (!matches) {
      failures.push({
        room: roomId,
        kind: 'higiene-doors',
        detail: `ROOM_SCENES.${roomId}.doors tiene clave '${to}' sin puerta correspondiente en ROOMS.${roomId}.doors`,
      });
    }
  }
  for (const entryId of Object.keys(entries)) {
    if (!(entryId in ROOMS) && entryId !== 'aula') {
      failures.push({
        room: roomId,
        kind: 'higiene-entries',
        detail: `ROOM_SCENES.${roomId}.entries tiene clave '${entryId}' que no es una sala existente en ROOMS`,
      });
    }
  }
}

if (failures.length > 0) {
  console.error(`R4 conectividad salas: FALLÓ (${failures.length} problema/s)`);
  for (const f of failures) {
    console.error(`  [${f.room}] (${f.kind}) ${f.detail}`);
  }
  process.exit(1);
}

if (knownIssues.length > 0) {
  console.log(`R4 conectividad salas: ${knownIssues.length} excepción/es conocida/s (TODO(auditoría), ver comentario arriba):`);
  for (const k of knownIssues) console.log(`  [${k.room}] (${k.kind}) ${k.detail}`);
}

console.log(`R4 conectividad salas: OK (${roomsTested} salas, ${doorsTested} puertas, ${thingsTested} things)`);
