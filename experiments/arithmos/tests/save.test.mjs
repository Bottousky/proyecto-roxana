import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newState, saveState, loadState, validState, loadSettings, saveSettings, DEFAULT_SETTINGS, SAVE_KEY} from '../src/engine/save.js';

function memoryStore() {
  const m = new Map();
  return {getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m};
}

test('una partida nueva es válida y se recupera igual', () => {
  const store = memoryStore();
  const s = newState();
  s.segment = 'c1.vuelven';
  s.scratch['c1.vuelven'] = {links: [['mark0', 'r0']]};
  s.evidence.push({kind: 'pair'});
  assert.ok(validState(s));
  assert.ok(saveState(s, store));
  const back = loadState(store);
  assert.equal(back.segment, 'c1.vuelven');
  assert.deepEqual(back.scratch['c1.vuelven'].links, [['mark0', 'r0']]);
});

test('un guardado corrupto o de otra versión se ignora', () => {
  const store = memoryStore();
  store.setItem(SAVE_KEY, '{no es json');
  assert.equal(loadState(store), null);
  store.setItem(SAVE_KEY, JSON.stringify({version: 99}));
  assert.equal(loadState(store), null);
});

test('sin almacenamiento disponible no falla', () => {
  assert.equal(loadState(null), null);
  assert.equal(saveState(newState(), null), false);
});

test('el historial y la evidencia se recortan para no crecer sin límite', () => {
  const store = memoryStore();
  const s = newState();
  for (let i = 0; i < 500; i++) s.log.push({who: null, text: String(i)});
  saveState(s, store);
  assert.equal(loadState(store).log.length, 300);
  assert.equal(loadState(store).log.at(-1).text, '499');
});

test('las opciones completan valores por defecto', () => {
  const store = memoryStore();
  saveSettings({textScale: 1.4}, store);
  const o = loadSettings(store);
  assert.equal(o.textScale, 1.4);
  assert.equal(o.textSpeed, DEFAULT_SETTINGS.textSpeed);
});
