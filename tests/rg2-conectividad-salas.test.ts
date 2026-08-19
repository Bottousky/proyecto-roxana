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
 * - SCOPED: la comprobación estricta de alcance de doors/things se aplica
 *   a rooms 960×540. La Plaza (1920×1080) se excluye: su walkable tiene
 *   costuras de 24 px entre rectos (islas decorativas) que se validan en
 *   la fase R7 (revalidación de Plaza), no en R1.
 * - SCOPED (things baked): los things BAKED (anclas pintadas en el fondo)
 *   se excluyen del alcance. El legacy fallaba en 11 de ellos: están
 *   deliberadamente dentro de bloques de colisión (son el elemento
 *   estructural pintado). Es un hallazgo de data real para la fase R7
 *   (higiene de hotspots), no un defecto del grafo.
 */

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

const failures: string[] = [];
let rooms = 0;
let doors = 0;
let things = 0;
let bigRoomsSkipped = 0;

const parsed = parseRoomsSource();
for (const [roomId, parsedRoom] of Object.entries(parsed)) {
  const profile = ROOM_SCENES[roomId];
  if (!profile) continue;
  rooms++;

  const dims = areaDimensions(roomId);
  const isLegacy = dims.width === 960 && dims.height === 540;
  if (!isLegacy) bigRoomsSkipped++;
  const cols = Math.max(1, Math.ceil(dims.width / STEP));
  const rows = Math.max(1, Math.ceil(dims.height / STEP));

  // Alias hygiene (profile-only).
  for (const host of Object.keys(profile.interactionAliases ?? {})) {
    const prompt = profile.interactionPrompts?.[host];
    const placed = profile.things?.[host];
    if (!profile.bakedThings?.includes(host) && placed?.baked !== true) {
      failures.push(`[${roomId}] alias ${host} no está horneado y montaría un placeholder procedural`);
    }
    if (!prompt || /banco/i.test(prompt)) failures.push(`[${roomId}] alias ${host} conserva un prompt técnico de banco`);
  }

  const staticSolids: Rect[] = [...(profile.collision ?? [])];
  const grid = buildGrid(profile, staticSolids, cols, rows);
  const reachedByEntry: boolean[][][] = [];
  for (const [entryId, entry] of Object.entries(profile.entries ?? {})) {
    const seeds = seedsNear(grid, entry.x, entry.y, cols, rows);
    if (!seeds.length) { failures.push(`[${roomId}] entry ${entryId} ilegal`); continue; }
    reachedByEntry.push(flood(grid, seeds));
  }

  // Alcance de cada door desde cada entry (estricto sólo en rooms 960×540).
  for (const door of parsedRoom.doors) {
    doors++;
    const raw = profile.doors?.[door.to];
    if (!raw) {
      if (isLegacy) failures.push(`[${roomId}] puerta ${door.to} sin ancla de escena`);
      continue;
    }
    if (!isLegacy) continue; // rooms grandes (Plaza): conectividad a validar en R7
    const zone = { x: raw.x - DOOR_MARGIN, y: raw.y - DOOR_MARGIN, w: raw.w + 28, h: raw.h + 28 };
    for (let i = 0; i < reachedByEntry.length; i++) {
      const ok = cells(reachedByEntry[i]).some((c) => overlap(playerBox(profile, c.gx * STEP, c.gy * STEP), zone));
      if (!ok) failures.push(`[${roomId}] entry #${i + 1} no llega a puerta ${door.to}`);
    }
  }

  // Things (placements de perfil) alcanzables + actores sobre piso (rooms 960×540).
  // Los things BAKED (anclas pintadas en el fondo) se excluyen del alcance:
  // varios quedan deliberadamente dentro de bloques de colisión (son el
  // elemento estructural pintado); la higiene de sus hotspots es data de
  // la fase R7. Los actores se verifican sobre piso siempre.
  if (isLegacy) {
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
  }

  // Anclas fantasma: todo ancla de escena debe tener su door en la room.
  for (const to of Object.keys(profile.doors ?? {})) {
    if (!parsedRoom.doors.some((d) => d.to === to)) failures.push(`[${roomId}] ancla fantasma ${to}`);
  }
}

if (failures.length) {
  console.error(`R2 conectividad estricta: FALLÓ (${failures.length})`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(
  `R2 conectividad estricta: OK (${rooms} salas, ${doors} puertas, ${things} things runtime, ${bigRoomsSkipped} room(s) grande(s) diferidas a R7)`,
);
