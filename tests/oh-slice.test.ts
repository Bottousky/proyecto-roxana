// Integridad de datos del vertical slice de Ohmdal.
// Corre con: node --experimental-strip-types tests/oh-slice.test.ts
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MAPS } from '../src/ohmdal/data/maps.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const readJson = (p: string) => JSON.parse(readFileSync(resolve(__dirname, p), 'utf8'));
const dialogues = readJson('../src/ohmdal/data/dialogues.json') as Record<string, unknown>;
const journal = readJson('../src/ohmdal/data/journal.json') as Record<string, unknown>;
const quests = readJson('../src/ohmdal/data/quests.json') as Record<string, unknown>;

const ids = Object.keys(MAPS);

// 1) exactamente los 6 mapas del Arco 1
assert.equal(ids.length, 6, 'deben existir 6 mapas');
for (const expected of [
  'MAP_OHMDAL_01_PORTAL_GLADE', 'MAP_OHMDAL_02_DIM_PLAZA', 'MAP_OHMDAL_03_LUMEN_WORKSHOP',
  'MAP_OHMDAL_04_CONDUCTOR_PATH', 'MAP_OHMDAL_05_SLEEPING_CURRENT_RUINS', 'MAP_OHMDAL_06_FIRST_SPARK_CHAMBER',
]) assert.ok(MAPS[expected], `falta el mapa ${expected}`);

const inBounds = (m: (typeof MAPS)[string], x: number, y: number) => x >= 0 && y >= 0 && x < m.w && y < m.h;

for (const m of Object.values(MAPS)) {
  let spawns = 0;
  for (const o of m.objects) {
    assert.ok(inBounds(m, o.x, o.y), `${m.id}: objeto ${'id' in o ? o.id : o.kind} fuera de límites`);
    if (o.kind === 'spawn') spawns++;
    if (o.kind === 'warp') {
      const target = MAPS[o.to];
      assert.ok(target, `${m.id}: warp apunta a mapa inexistente ${o.to}`);
      assert.ok(inBounds(target, o.spawn[0], o.spawn[1]), `${m.id}: spawn del warp fuera del mapa destino ${o.to}`);
    }
    if (o.kind === 'sign') assert.ok(dialogues[o.dialogue], `${m.id}: falta diálogo ${o.dialogue}`);
  }
  // el mapa inicial necesita un spawn; los demás llegan por warp
  if (m.id === 'MAP_OHMDAL_01_PORTAL_GLADE') assert.ok(spawns >= 1, 'el mapa inicial necesita un spawn');
}

// 2) todo diálogo que el guion referencia existe
for (const d of [
  'arrival', 'sign_glade', 'glade_lamp_off', 'glade_solved', 'edda_intro', 'edda_after_lumen',
  'edda_after_arc', 'lumen_intro', 'lumen_after', 'conductor_fizzle', 'conductor_solved',
  'ruins_solved', 'core_intro', 'core_solved',
]) assert.ok(dialogues[d], `falta diálogo ${d}`);

// cada diálogo es una lista de pares [quién, texto]
for (const [id, lines] of Object.entries(dialogues)) {
  assert.ok(Array.isArray(lines) && lines.length > 0, `diálogo ${id} vacío`);
  for (const l of lines as unknown[][]) assert.equal(l.length, 2, `diálogo ${id}: línea mal formada`);
}

// 3) las 4 entradas de Bitácora existen y tienen capa vivencial + técnica
for (const j of ['j_closed_circuit', 'j_conductors', 'j_continuity', 'j_resistance']) {
  const e = journal[j] as { lore?: string; tecnica?: string } | undefined;
  assert.ok(e, `falta entrada ${j}`);
  assert.ok(e.lore && e.tecnica, `entrada ${j} sin lore/tecnica`);
}

// 4) todos los objetivos usados existen
for (const q of [
  'obj_arrive', 'obj_light_glade', 'obj_reach_plaza', 'obj_talk_edda', 'obj_find_lumen',
  'obj_conductor_path', 'obj_ruins', 'obj_first_spark', 'obj_done',
]) assert.ok(quests[q], `falta objetivo ${q}`);

console.log('OH slice data tests: OK');
