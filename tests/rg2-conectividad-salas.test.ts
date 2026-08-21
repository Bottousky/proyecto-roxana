/**
 * rg2-conectividad-salas.test.ts — restaurado/adaptado desde
 * `_legacy_r4-conectividad-salas` (R1 / RoomGraph, ADR-002).
 *
 * Invariante room-local: en cada room, toda puerta es alcanzable desde
 * CADA entry de llegada (flood sobre walkable menos colisiones), todo
 * entry es legal y no hay anclas fantasma. Es el invariante de
 * conectividad interna por room del `SPATIAL_CONTRACT` (TEST_TAXONOMY:
 * "cada door de una room es alcanzable desde su propio walkable").
 *
 * Adaptación vs. el original:
 * - NO importa `rooms.ts` (ese módulo no es importable en Node: arrastra
 *   UI/DOM y `?url`). Usa `parseRoomsSource()` (helper) + `ROOM_SCENES`.
 * - SURVIVE: alias/baked/prompt hygiene, legalidad de entries,
 *   alcance de cada door desde cada entry, anclas fantasma, alcance de
 *   things no-baked y actores sobre piso.
 * - REMOVED: sólidos de props no horneados y radio por tamaño de thing
 *   (requieren el ThingDef completo de rooms.ts). El flood queda más
 *   permisivo: cualquier fallo reportado aquí también lo sería con los
 *   sólidos originales.
 * - R7: la comprobación estricta incluye la Plaza 1920×1080 con el mismo
 *   cuerpo y flood room-local que el resto de las salas.
 * - SCOPED (things baked): los things BAKED (anclas pintadas en el fondo)
 *   se excluyen del alcance. El legacy fallaba en 11 de ellos: están
 *   deliberadamente dentro de bloques de colisión (son el elemento
 *   estructural pintado). Es un hallazgo de data real para la fase R7
 *   (higiene de hotspots), no un defecto del grafo.
 */

import { readFileSync } from 'node:fs';
import {
  ROOM_SCENES,
  areaDimensions,
  rectContainsRect,
  scaleAt,
  type RoomSceneProfile,
  type SceneRect,
} from '../src/jugar/roomScenesData.ts';
import { parseRoomsSource } from './helpers/roomsSource.ts';

const STEP = 8;
const DOOR_MARGIN = 14;
const REACH = 72;

interface Rect { x: number; y: number; w: number; h: number }
interface Cell { gx: number; gy: number }
interface RequiredThing extends Rect { id: string }

function overlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerBox(profile: RoomSceneProfile, x: number, y: number): Rect {
  const r = 12 * Math.max(0.5, scaleAt(profile, y));
  return { x: x - r, y: y - r, w: r * 2, h: r * 2 };
}

function legal(profile: RoomSceneProfile, solids: Rect[], x: number, y: number): boolean {
  const box = playerBox(profile, x, y);
  return profile.walkable.some((r) => rectContainsRect(r, box)) && !solids.some((s) => overlap(box, s));
}

function character(id: string): boolean {
  return /^(edda|lumen|pedestal$|ohm-|consejera|guardiana|forjadora|farero|ciudadano)/.test(id);
}

function buildGrid(profile: RoomSceneProfile, solids: Rect[], cols: number, rows: number): boolean[][] {
  return Array.from({ length: cols }, (_, gx) =>
    Array.from({ length: rows }, (_, gy) => legal(profile, solids, gx * STEP, gy * STEP)));
}

function seedsNear(grid: boolean[][], x: number, y: number, cols: number, rows: number): Cell[] {
  const result: Cell[] = [];
  for (let gx = Math.max(0, Math.round(x / STEP) - 2); gx <= Math.min(cols - 1, Math.round(x / STEP) + 2); gx++) {
    for (let gy = Math.max(0, Math.round(y / STEP) - 2); gy <= Math.min(rows - 1, Math.round(y / STEP) + 2); gy++) {
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
    for (const n of [
      { gx: c.gx - 1, gy: c.gy }, { gx: c.gx + 1, gy: c.gy },
      { gx: c.gx, gy: c.gy - 1 }, { gx: c.gx, gy: c.gy + 1 },
    ]) {
      if (n.gx < 0 || n.gx >= grid.length || n.gy < 0 || n.gy >= grid[0].length || reached[n.gx][n.gy] || !grid[n.gx][n.gy]) continue;
      reached[n.gx][n.gy] = true;
      queue.push(n);
    }
  }
  return reached;
}

function cells(reached: boolean[][]): Cell[] {
  const result: Cell[] = [];
  for (let gx = 0; gx < reached.length; gx++) {
    for (let gy = 0; gy < reached[gx].length; gy++) if (reached[gx][gy]) result.push({ gx, gy });
  }
  return result;
}

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function requiredPlazaThings(): RequiredThing[] {
  const roomsBody = roomsSource.slice(roomsSource.indexOf('export const ROOMS'));
  const plazaStart = roomsBody.indexOf("  plaza: {");
  const plazaEnd = roomsBody.indexOf("\n  taller: {", plazaStart);
  if (plazaStart < 0 || plazaEnd < 0) throw new Error('no se pudo aislar ROOMS.plaza');
  const plazaBody = roomsBody.slice(plazaStart, plazaEnd);
  return ['pedestal', 'edda', 'lumen-plaza'].map((id) => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = plazaBody.match(new RegExp(`id: '${escapedId}', x: (\\d+), y: (\\d+), w: (\\d+), h: (\\d+)`));
    if (!match) throw new Error(`no se pudo leer ThingDef plaza.${id}`);
    const [, x, y, w, h] = match;
    return { id, x: Number(x) - Number(w) / 2, y: Number(y) - Number(h) / 2, w: Number(w), h: Number(h) };
  });
}

function distanceToRect(x: number, y: number, rect: Rect): number {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.w));
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}

const failures: string[] = [];
let rooms = 0;
let doors = 0;
let things = 0;

const parsed = parseRoomsSource();
for (const [roomId, parsedRoom] of Object.entries(parsed)) {
  const profile = ROOM_SCENES[roomId];
  if (!profile) continue;
  rooms++;

  const dims = areaDimensions(roomId);
  const cols = Math.max(1, Math.ceil(dims.width / STEP));
  const rows = Math.max(1, Math.ceil(dims.height / STEP));
  const plazaThings = roomId === 'plaza' ? requiredPlazaThings() : [];

  // Alias hygiene (profile-only).
  for (const host of Object.keys(profile.interactionAliases ?? {})) {
    const prompt = profile.interactionPrompts?.[host];
    const placed = profile.things?.[host];
    if (!profile.bakedThings?.includes(host) && placed?.baked !== true) {
      failures.push(`[${roomId}] alias ${host} no está horneado y montaría un placeholder procedural`);
    }
    if (!prompt || /banco/i.test(prompt)) failures.push(`[${roomId}] alias ${host} conserva un prompt técnico de banco`);
  }

  const staticSolids: Rect[] = [
    ...(profile.collision ?? []),
    ...plazaThings.map((thing) => thing.id === 'pedestal'
      ? thing
      : { x: thing.x + thing.w / 2 - 8, y: thing.y + thing.h / 2 - 5, w: 16, h: 10 }),
  ];
  const grid = buildGrid(profile, staticSolids, cols, rows);
  const reachedByEntry: boolean[][][] = [];
  for (const [entryId, entry] of Object.entries(profile.entries ?? {})) {
    const seeds = seedsNear(grid, entry.x, entry.y, cols, rows);
    if (!seeds.length) { failures.push(`[${roomId}] entry ${entryId} ilegal`); continue; }
    reachedByEntry.push(flood(grid, seeds));
  }

  // Alcance de cada door desde cada entry, incluida Plaza 1920×1080.
  for (const door of parsedRoom.doors) {
    doors++;
    const raw = profile.doors?.[door.to];
    if (!raw) {
      failures.push(`[${roomId}] puerta ${door.to} sin ancla de escena`);
      continue;
    }
    const zone = { x: raw.x - DOOR_MARGIN, y: raw.y - DOOR_MARGIN, w: raw.w + 28, h: raw.h + 28 };
    for (let i = 0; i < reachedByEntry.length; i++) {
      const ok = cells(reachedByEntry[i]).some((c) => overlap(playerBox(profile, c.gx * STEP, c.gy * STEP), zone));
      if (!ok) failures.push(`[${roomId}] entry #${i + 1} no llega a puerta ${door.to}`);
    }
  }

  // Things (placements de perfil) alcanzables + actores sobre piso.
  // Los things BAKED (anclas pintadas en el fondo) se excluyen del alcance:
  // varios quedan deliberadamente dentro de bloques de colisión (son el
  // elemento estructural pintado); la higiene de sus hotspots es data de
  // la fase R7. Los actores se verifican sobre piso siempre.
  const union = reachedByEntry.flatMap(cells);
  for (const [thingId, placed] of Object.entries(profile.things ?? {})) {
    const baked = (profile.bakedThings ?? []).includes(thingId) || placed.baked === true;
    if (character(thingId) && !profile.walkable.some((r) => rectContainsRect(r, playerBox(profile, placed.x, placed.y)))) {
      failures.push(`[${roomId}] actor ${thingId} fuera del piso`);
    }
    if (baked) continue;
    things++;
    const ok = union.some((c) => Math.hypot(c.gx * STEP - placed.x, c.gy * STEP - placed.y) <= REACH);
    if (!ok) failures.push(`[${roomId}] thing ${thingId} fuera de alcance`);
  }

  if (roomId === 'plaza') {
    for (const thing of plazaThings) {
      if (profile.things?.[thing.id]) failures.push(`[plaza] ${thing.id} conserva override de escena`);
      if ((profile.collision ?? []).some((solid) => overlap(thing, solid))) {
        failures.push(`[plaza] ThingDef ${thing.id} está dentro de colisión de perfil`);
      }
      for (let i = 0; i < reachedByEntry.length; i++) {
        const approachable = cells(reachedByEntry[i]).some((cell) =>
          distanceToRect(cell.gx * STEP, cell.gy * STEP, thing) < REACH);
        if (!approachable) failures.push(`[plaza] entry #${i + 1} no puede aproximarse a ${thing.id}`);
      }
    }
    const pedestal = plazaThings.find((thing) => thing.id === 'pedestal')!;
    const pedestalCenter = { x: pedestal.x + pedestal.w / 2, y: pedestal.y + pedestal.h / 2 };
    const pedestalPulses = (profile.effects ?? []).filter((effect) =>
      effect.kind === 'pulse' && effect.x === pedestalCenter.x && effect.y === pedestalCenter.y);
    if (pedestalPulses.length < 2) failures.push('[plaza] efectos del pedestal no siguen el anchor ThingDef');
  }

  // Anclas fantasma: todo ancla de escena debe tener su door en la room.
  for (const to of Object.keys(profile.doors ?? {})) {
    if (!parsedRoom.doors.some((d) => d.to === to)) failures.push(`[${roomId}] ancla fantasma ${to}`);
  }
}

const awakeningBody = roomsSource.slice(
  roomsSource.indexOf('function despertarOhm'),
  roomsSource.indexOf('interface PhaserSceneLike'),
);
if (!awakeningBody.includes("const pedestal = requireThing('plaza', 'pedestal');")) {
  failures.push('[plaza] despertarOhm no deriva el anchor desde ThingDef pedestal');
}
if (!awakeningBody.includes('playAwakening(scene as unknown as Phaser.Scene, pedestal.x, pedestal.y)')) {
  failures.push('[plaza] playAwakening no consume el anchor derivado del pedestal');
}
if (/\b480\b|\b342\b/.test(awakeningBody)) failures.push('[plaza] despertarOhm conserva coordenadas stale hardcodeadas');

if (failures.length) {
  console.error(`R2 conectividad estricta: FALLÓ (${failures.length})`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(
  `R7 conectividad estricta: OK (${rooms} salas, ${doors} puertas, ${things} things runtime; Plaza 1920×1080 incluida)`,
);
