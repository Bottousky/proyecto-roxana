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
const { state } = await import('../src/state.ts');

const units = {
  U1: ['plaza', 'taller', 'puerta', 'manantial_ohm'],
  U2: ['castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart'],
  U3: ['forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall'],
  U4: ['terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct'],
  U5: ['lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern'],
};

function visibleGraph(): Map<string, string[]> {
  return new Map(Object.entries(ROOMS).map(([id, room]) => [
    id,
    room.doors.filter((door) => door.visible?.() !== false).map((door) => door.to),
  ]));
}

function canReach(graph: Map<string, string[]>, from: string, to: string): boolean {
  const queue = [from];
  const seen = new Set(queue);
  for (let i = 0; i < queue.length; i++) {
    for (const next of graph.get(queue[i]) ?? []) {
      if (next === to) return true;
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return from === to;
}

function stage(name: string, flags: Record<string, boolean>, expected: string[]): void {
  for (const key of Object.keys(state.flags)) if (typeof (state.flags as any)[key] === 'boolean') (state.flags as any)[key] = false;
  Object.assign(state.flags, flags);
  const graph = visibleGraph();
  for (const room of expected) {
    if (!canReach(graph, 'plaza', room)) throw new Error(`${name}: plaza no llega a ${room}`);
    if (!canReach(graph, room, 'plaza')) throw new Error(`${name}: ${room} no tiene regreso a plaza`);
  }
}

stage('U1 restaurada', { plazaSeen: true, ohmAwake: true, metLumen: true, frenoDone: true, puertaDone: true }, units.U1);
stage('U2 activa', { puertaDone: true, playedUnit2Intro: true, metConsejera: true, enteredCastle: true }, ['plaza', ...units.U2]);
stage('U3 activa', { puertaDone: true, unit2Completed: true, playedUnit3Intro: true, metForjadora: true }, ['plaza', ...units.U3]);
stage('U4 activa', { puertaDone: true, unit2Completed: true, unit3Completed: true, playedUnit4Intro: true, metGuardiana: true }, ['plaza', ...units.U4]);
stage('U5 activa', { puertaDone: true, unit2Completed: true, unit3Completed: true, unit4Completed: true, playedUnit5Intro: true, metFarero: true }, ['plaza', ...units.U5]);
stage('Arco I restaurado', { puertaDone: true, unit2Completed: true, unit3Completed: true, unit4Completed: true, lighthouseRestored: true }, ['plaza', ...units.U5]);

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
for (const gate of ['metForjadora', 'metGuardiana', 'metFarero']) {
  if (!roomsSource.includes(`!f().${gate}`)) throw new Error(`falta bloqueo narrativo previo: ${gate}`);
}
if (!roomsSource.includes("salasVisitadas.includes('manantial_ohm')")) {
  throw new Error('el cierre de U1 (campana) no exige la visita al Manantial');
}
for (const required of ['!fl.finished', '!fl.unit2Completed', '!fl.unit3Completed', '!fl.unit4Completed', '!fl.lighthouseRestored', '!fl.learnedCapacitor']) {
  if (!roomsSource.includes(required)) throw new Error(`el cierre del Arco I no exige ${required}`);
}
const storedSparkWrite = roomsSource.indexOf("setFlag('sawStoredSpark')");
if (storedSparkWrite < 0 || !roomsSource.slice(storedSparkWrite, storedSparkWrite + 260).includes('checkUnit2Complete();')) {
  throw new Error('la chispa guardada no reevalúa el cierre de U2');
}

console.log('R8 progresión Arco I: OK (5 unidades + cierre, ida y regreso)');
