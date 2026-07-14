import { register } from 'node:module';
import type { DoorDef, ThingDef } from '../src/jugar/rooms.ts';
import type { RoomSceneProfile, SceneRect } from '../src/jugar/roomScenesData.ts';

register('./helpers/ts-relative-resolver.mjs', import.meta.url);
if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k), clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null, get length() { return store.size; },
  } as Storage;
}

const { ROOMS } = (await import('../src/jugar/rooms.ts')) as { ROOMS: Record<string, { doors: DoorDef[]; things: ThingDef[] }> };
const { ROOM_SCENES, scaleAt, rectContainsRect } = (await import('../src/jugar/roomScenesData.ts')) as {
  ROOM_SCENES: Record<string, RoomSceneProfile>;
  scaleAt: (profile: RoomSceneProfile | undefined, y: number) => number;
  rectContainsRect: (outer: SceneRect, inner: SceneRect) => boolean;
};

const STEP = 8;
const DOOR_MARGIN = 14;
const REACH = 72;
interface Rect { x: number; y: number; w: number; h: number }
interface Cell { gx: number; gy: number }
interface RuntimeThing extends ThingDef { px: number; py: number; bakedRuntime: boolean }

function overlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function playerBox(profile: RoomSceneProfile, x: number, y: number): Rect {
  const r = 12 * Math.max(0.5, scaleAt(profile, y));
  return { x: x - r, y: y - r, w: r * 2, h: r * 2 };
}
function legal(profile: RoomSceneProfile, solids: Rect[], x: number, y: number): boolean {
  const box = playerBox(profile, x, y);
  return profile.walkable.some((rect) => rectContainsRect(rect, box)) && !solids.some((rect) => overlap(box, rect));
}
function character(id: string): boolean {
  return /^(edda|lumen|pedestal$|ohm-|consejera|guardiana|forjadora|farero|ciudadano)/.test(id);
}
function runtimeThings(room: { things: ThingDef[] }, profile: RoomSceneProfile): RuntimeThing[] {
  const aliasSources = new Set(Object.values(profile.interactionAliases ?? {}));
  return room.things
    .filter((thing) => !profile.hiddenThings?.includes(thing.id) && !aliasSources.has(thing.id))
    .map((thing) => {
      const placed = profile.things?.[thing.id];
      return {
        ...thing,
        px: placed?.x ?? thing.x,
        py: placed?.y ?? thing.y,
        bakedRuntime: placed?.baked ?? thing.baked ?? !!profile.bakedThings?.includes(thing.id),
      };
    });
}
function buildGrid(profile: RoomSceneProfile, solids: Rect[]): boolean[][] {
  return Array.from({ length: 121 }, (_, gx) =>
    Array.from({ length: 68 }, (_, gy) => legal(profile, solids, gx * STEP, gy * STEP)));
}
function seedsNear(grid: boolean[][], x: number, y: number): Cell[] {
  const result: Cell[] = [];
  for (let gx = Math.max(0, Math.round(x / STEP) - 2); gx <= Math.min(120, Math.round(x / STEP) + 2); gx++) {
    for (let gy = Math.max(0, Math.round(y / STEP) - 2); gy <= Math.min(67, Math.round(y / STEP) + 2); gy++) {
      if (grid[gx][gy] && Math.hypot(gx * STEP - x, gy * STEP - y) <= 18) result.push({ gx, gy });
    }
  }
  return result;
}
function flood(grid: boolean[][], seeds: Cell[]): boolean[][] {
  const reached = grid.map((column) => column.map(() => false));
  const queue = [...seeds];
  for (const seed of seeds) reached[seed.gx][seed.gy] = true;
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    for (const n of [{ gx: c.gx - 1, gy: c.gy }, { gx: c.gx + 1, gy: c.gy }, { gx: c.gx, gy: c.gy - 1 }, { gx: c.gx, gy: c.gy + 1 }]) {
      if (n.gx < 0 || n.gx > 120 || n.gy < 0 || n.gy > 67 || reached[n.gx][n.gy] || !grid[n.gx][n.gy]) continue;
      reached[n.gx][n.gy] = true; queue.push(n);
    }
  }
  return reached;
}
function cells(reached: boolean[][]): Cell[] {
  const result: Cell[] = [];
  for (let gx = 0; gx < reached.length; gx++) for (let gy = 0; gy < reached[gx].length; gy++) if (reached[gx][gy]) result.push({ gx, gy });
  return result;
}

const failures: string[] = [];
let rooms = 0, doors = 0, things = 0;
for (const [roomId, room] of Object.entries(ROOMS)) {
  const profile = ROOM_SCENES[roomId];
  if (!profile) continue;
  rooms++;
  for (const host of Object.keys(profile.interactionAliases ?? {})) {
    const prompt = profile.interactionPrompts?.[host];
    const placed = profile.things?.[host];
    if (!profile.bakedThings?.includes(host) && placed?.baked !== true) {
      failures.push(`[${roomId}] alias ${host} no esta horneado y montaria un placeholder procedural`);
    }
    if (!prompt || /banco/i.test(prompt)) failures.push(`[${roomId}] alias ${host} conserva un prompt técnico de banco`);
  }
  const runtime = runtimeThings(room, profile);
  const staticSolids: Rect[] = [
    ...(profile.collision ?? []),
    ...runtime.filter((t) => !character(t.id) && t.solid !== false && !t.bakedRuntime)
      .map((t) => ({ x: t.px - t.w / 2, y: t.py - t.h / 2, w: t.w, h: t.h })),
  ];
  const grid = buildGrid(profile, staticSolids);
  const reachedByEntry: boolean[][][] = [];
  for (const [entryId, entry] of Object.entries(profile.entries ?? {})) {
    const seeds = seedsNear(grid, entry.x, entry.y);
    if (!seeds.length) { failures.push(`[${roomId}] entry ${entryId} ilegal`); continue; }
    reachedByEntry.push(flood(grid, seeds));
  }
  for (const door of room.doors) {
    doors++;
    const raw = profile.doors?.[door.to] ?? door;
    const zone = { x: raw.x - DOOR_MARGIN, y: raw.y - DOOR_MARGIN, w: raw.w + 28, h: raw.h + 28 };
    for (let i = 0; i < reachedByEntry.length; i++) {
      const ok = cells(reachedByEntry[i]).some((c) => overlap(playerBox(profile, c.gx * STEP, c.gy * STEP), zone));
      if (!ok) failures.push(`[${roomId}] entry #${i + 1} no llega a puerta ${door.to}`);
    }
  }
  const union = reachedByEntry.flatMap(cells);
  for (const thing of runtime) {
    things++;
    const ok = union.some((c) => Math.hypot(c.gx * STEP - thing.px, c.gy * STEP - thing.py) <= REACH + Math.max(thing.w, thing.h) / 2);
    if (!ok) failures.push(`[${roomId}] thing ${thing.id} fuera de alcance`);
    if (character(thing.id) && !profile.walkable.some((r) => rectContainsRect(r, playerBox(profile, thing.px, thing.py)))) {
      failures.push(`[${roomId}] actor ${thing.id} fuera del piso`);
    }
  }
  for (const to of Object.keys(profile.doors ?? {})) if (!room.doors.some((d) => d.to === to)) failures.push(`[${roomId}] ancla fantasma ${to}`);
}

if (failures.length) {
  console.error(`R4 conectividad estricta: FALLÓ (${failures.length})`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(`R4 conectividad estricta: OK (${rooms} salas, ${doors} puertas, ${things} things runtime)`);
