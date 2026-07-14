import { readFileSync } from 'node:fs';
import { register } from 'node:module';

register('./helpers/ts-relative-resolver.mjs', import.meta.url);
if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k), clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null, get length() { return store.size; },
  } as Storage;
}

const { ROOMS } = await import('../src/jugar/rooms.ts');
const { ROOM_SCENES } = await import('../src/jugar/roomScenesData.ts');

if (ROOMS.plaza.doors.some((candidate) => candidate.to === 'aula')) {
  throw new Error('el portal no puede ser una puerta automática hacia el aula procedural');
}
const entry = ROOM_SCENES.plaza.entries?.aula;
if (!entry || entry.x !== 180 || entry.y !== 382) throw new Error('la llegada desde el aula no queda centrada dentro del portal');
const portal = ROOMS.plaza.things.find((thing) => thing.id === 'portal-aula');
if (!portal || portal.interactive === false || portal.solid !== false || portal.prompt !== 'Salir de Ohmdal') {
  throw new Error('el portal debe ser una acción explícita, no bloqueante y rotulada como salida');
}
if (!ROOM_SCENES.plaza.bakedThings?.includes('portal-aula')) throw new Error('el portal debe estar integrado al arte de la Plaza');
const terraces = ROOM_SCENES.plaza.doors?.terraces_top;
if (!terraces || !(portal.x + portal.w / 2 < terraces.x || terraces.x + terraces.w < portal.x - portal.w / 2)) {
  throw new Error('el portal al aula no puede solaparse con la salida a Terrazas');
}
for (const id of ['campana', 'portal-aula']) {
  if (!ROOM_SCENES.plaza.bakedThings?.includes(id)) throw new Error(`${id} debe estar integrado al arte de la Plaza`);
}
const partialLamps = ROOM_SCENES.plaza.effects?.filter((effect) => effect.flag === 'puertaDone' && effect.kind === 'glow').length ?? 0;
const finalLamps = ROOM_SCENES.plaza.effects?.filter((effect) => effect.flag === 'finished' && effect.kind === 'glow').length ?? 0;
if (partialLamps !== 2 || finalLamps !== 4) throw new Error('la Plaza debe progresar de 0 a 2 y luego a 6 faroles');

for (const id of ['banco', 'estantes', 'estantes-derecha', 'generador-taller']) {
  if (!ROOM_SCENES.taller.bakedThings?.includes(id)) throw new Error(`${id} debe estar integrado al arte del Taller`);
  if (!ROOMS.taller.things.some((thing) => thing.id === id)) throw new Error(`falta la interacción ${id} en el Taller`);
}

const gameHtml = readFileSync(new URL('../src/jugar/index.html', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const explorationSource = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
const roomScenesSource = readFileSync(new URL('../src/jugar/roomScenes.ts', import.meta.url), 'utf8');
if (!gameHtml.includes('id="boot-curtain"')) throw new Error('falta la cortina de arranque contra FOUC');
if (!mainSource.includes("'roxana:game-ready'")) throw new Error('la cortina debe esperar al primer render del juego');
if (!explorationSource.includes("'ohmdal-ohm-atlas'")) throw new Error('Ohm debe usar su atlas direccional propio');
if (!ROOM_SCENES.plaza.backgroundWhen?.some((variant) => variant.flag === 'solvedBellPaths' && variant.key === 'room-plaza-castle-open')) {
  throw new Error('la Plaza necesita la variante visual de la reja oeste abierta al liberar el Castillo');
}
if (!roomScenesSource.includes("'room-plaza-castle-open'")) throw new Error('la variante de reja abierta debe cargar un fondo real');
const castleViewpoint = ROOMS.plaza.things.find((thing) => thing.id === 'castillo-encendido');
if (!castleViewpoint?.baked) throw new Error('el punto de vista del Castillo no debe dibujarse como bloque procedural en la Plaza');

console.log('W6 llegada aula → Plaza: OK');
