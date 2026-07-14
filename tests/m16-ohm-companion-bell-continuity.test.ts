import { readFileSync } from 'node:fs';
import { register } from 'node:module';

register('./helpers/ts-relative-resolver.mjs', import.meta.url);

if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() { return store.size; },
  } as Storage;
}

const { ROOM_SCENES, rectContainsRect } = await import('../src/jugar/roomScenesData.ts');
const { state } = await import('../src/state.ts');
const { ohmGuidance } = await import('../src/ui/ohmCompanion.ts');

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

function playerBox(x: number, y: number) {
  return { x: x - 12, y: y - 12, w: 24, h: 24 };
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const plaza = ROOM_SCENES.plaza;
assert(
  plaza.collision!.some((rect) => overlaps(rect, playerBox(480, 135))),
  'la corona superior de la Campana bloquea al jugador',
);
assert(
  !plaza.collision!.some((rect) => overlaps(rect, playerBox(480, 90))),
  'queda espacio real entre la Campana y el arco norte',
);
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(480, 90))),
  'el pasillo recuperado hacia el norte admite el cuerpo completo del jugador',
);
assert(
  !plaza.collision!.some((rect) => overlaps(rect, playerBox(480, 330))),
  'la cuerda sigue siendo accesible desde abajo',
);
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(480, 330))),
  'el punto de interacción inferior sigue dentro del piso transitable',
);

const flags = { ...state.flags, ohmAwake: true, metLumen: true, frenoDone: true, puertaDone: true };
flags.salasVisitadas = ['manantial_ohm'];
const springHint = ohmGuidance(flags, 'manantial_ohm').map((line) => line.text).join(' ');
assert(springHint.includes('Campana'), 'Ohm orienta desde el Manantial hacia la Campana');

flags.finished = true;
const instituteHint = ohmGuidance(flags, 'plaza').map((line) => line.text).join(' ');
assert(instituteHint.includes('Instituto') || instituteHint.includes('aula'), 'tras sonar la Campana, Ohm orienta al Instituto');

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const bellSequence = roomsSource.slice(roomsSource.indexOf('function tocarCampana'), roomsSource.indexOf('function reproducirIntroUnidad2'));
assert(!bellSequence.includes('showEnd('), 'la Campana ya no corta la partida con el viejo final');
assert(bellSequence.includes('portalExitUrl()'), 'la Campana vuelve al aula gráfica de la web');
assert(!bellSequence.includes("hooks.goto('aula'"), 'la Campana no entra al aula procedural de Phaser');

const sceneSource = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
assert(
  sceneSource.includes("actor === 'ohm' && state.flags.ohmAwake"),
  'Ohm despierto no se duplica como actor estático por sala',
);

const html = readFileSync(new URL('../src/jugar/index.html', import.meta.url), 'utf8');
assert(html.includes('id="ohm-companion-btn"'), 'el HUD incluye el acceso persistente a Ohm');

console.log('M16 compañero Ohm + continuidad Campana: OK');
