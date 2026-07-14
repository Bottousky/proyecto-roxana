import { readFileSync } from 'node:fs';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const ohm = source('../src/ui/ohmCompanion.ts');
assert(ohm.includes("event.code !== 'KeyO'"), 'O activa a Ohm desde teclado');
assert(ohm.includes('touchControlsEnabled()'), 'el retrato de Ohm sólo acepta pulsación táctil');

const audio = source('../src/audio.ts');
const audioControls = audio.slice(audio.indexOf('export function initAudioButton'));
assert(audioControls.includes("ev.code === 'KeyV'"), 'V controla el sonido');
assert(!audioControls.includes("ev.code === 'KeyM'"), 'M no silencia el audio además de abrir el mapa');

const exploration = source('../src/jugar/ExplorationScene.ts');
const pointerHandler = exploration.slice(exploration.indexOf('private onPointer'), exploration.indexOf('private navigationPath'));
assert(pointerHandler.includes('if (!touchControlsEnabled()) return'), 'el canvas ignora clicks de escritorio');

const bench = source('../src/ui/bench.ts');
assert(bench.includes("'button, input, select, textarea,"), 'flechas alcanzan botones, inputs y selects del puzzle');
assert(bench.includes("ArrowUp: 'up'") && bench.includes("event.code === 'KeyE'"), 'los bancos conservan flechas/WASD y E');

const styles = source('../src/styles.css');
assert(styles.includes('body:not(.touch-device) #hud button'), 'el HUD de escritorio no recibe puntero');
assert(styles.includes('body:not(.touch-device) #bench button'), 'los puzzles de escritorio no dependen del puntero');

const html = source('../src/jugar/index.html');
for (const key of ['data-key="O"', 'data-key="V"', 'data-key="B"']) {
  assert(html.includes(key), `el HUD muestra el atajo ${key}`);
}
assert(html.includes('M mapa · V sonido'), 'la ayuda documenta mapa y sonido sin conflicto');

console.log('M17 controles keyboard-first: OK');
