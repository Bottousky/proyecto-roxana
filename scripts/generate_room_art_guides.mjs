// Genera guías de composición desde los datos jugables reales.
// Uso: node --experimental-strip-types scripts/generate_room_art_guides.mjs [directorio]
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Canvas } from './png.mjs';
import { roomScene } from '../src/jugar/roomScenesData.ts';

const W = 960;
const H = 540;
const ROOM_IDS = [
  'plaza', 'puerta', 'manantial_ohm', 'taller',
  'castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart',
  'forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall',
  'terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct',
  'lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern',
];

const OUT = resolve(process.argv[2] ?? 'output/art-guides');
mkdirSync(OUT, { recursive: true });

const C = {
  background: [28, 30, 38, 255], grid: [55, 59, 70, 255],
  walkable: [196, 207, 191, 215], collision: [60, 45, 48, 255],
  collisionEdge: [238, 92, 88, 255], door: [48, 130, 220, 220],
  entry: [116, 210, 255, 255], thing: [232, 76, 190, 255],
  bakedThing: [241, 158, 64, 255], frame: [235, 237, 240, 255],
};

function clampRect(rect) {
  const x = Math.max(0, Math.min(W, Math.round(rect.x)));
  const y = Math.max(0, Math.min(H, Math.round(rect.y)));
  return { x, y, w: Math.max(0, Math.min(W - x, Math.round(rect.w))), h: Math.max(0, Math.min(H - y, Math.round(rect.h))) };
}

for (const id of ROOM_IDS) {
  const profile = roomScene(id);
  if (!profile) throw new Error(`Falta RoomSceneProfile para ${id}`);
  const canvas = new Canvas(W, H);
  canvas.rect(0, 0, W, H, C.background);
  for (let x = 0; x < W; x += 48) canvas.line(x, 0, x, H - 1, C.grid);
  for (let y = 0; y < H; y += 48) canvas.line(0, y, W - 1, y, C.grid);
  for (const raw of profile.walkable) { const r = clampRect(raw); canvas.rect(r.x, r.y, r.w, r.h, C.walkable); }
  for (const raw of profile.collision ?? []) { const r = clampRect(raw); canvas.rect(r.x, r.y, r.w, r.h, C.collision); canvas.frame(r.x, r.y, r.w, r.h, C.collisionEdge); }
  for (const raw of Object.values(profile.doors ?? {})) { const r = clampRect(raw); canvas.rect(r.x, r.y, r.w, r.h, C.door); canvas.frame(r.x, r.y, r.w, r.h, C.entry); }
  for (const point of Object.values(profile.entries ?? {})) canvas.disc(Math.round(point.x), Math.round(point.y), 7, C.entry);
  for (const [thingId, point] of Object.entries(profile.things ?? {})) {
    const baked = point.baked || profile.bakedThings?.includes(thingId);
    canvas.disc(Math.round(point.x), Math.round(point.y), baked ? 8 : 6, baked ? C.bakedThing : C.thing);
  }
  canvas.frame(0, 0, W, H, C.frame);
  writeFileSync(resolve(OUT, `${id}-layout.png`), canvas.toPNG());
  writeFileSync(resolve(OUT, `${id}-layout.json`), JSON.stringify({
    room: id, canvas: { width: W, height: H },
    legend: {
      lightGray: 'walkable: piso continuo y transitable', darkRed: 'collision: sólido u oclusión',
      blue: 'door: arco o umbral obligatorio', cyanDot: 'entry: apoyo del personaje',
      orangeDot: 'thing baked: pieza integrada', magentaDot: 'thing runtime: reservar para sprite/NPC',
    },
    perspective: profile.perspective ?? null, walkable: profile.walkable,
    collision: profile.collision ?? [], doors: profile.doors ?? {}, entries: profile.entries ?? {},
    things: profile.things ?? {},
  }, null, 2));
}

console.log(`Guías de ${ROOM_IDS.length} salas generadas en ${OUT}`);
