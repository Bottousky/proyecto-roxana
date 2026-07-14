import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const bench = readFileSync(new URL('../src/ui/bench.ts', import.meta.url), 'utf8');
const brake = readFileSync(new URL('../src/puzzles/freno.ts', import.meta.url), 'utf8');

assert(
  bench.includes("window.addEventListener('keydown', onKeydown, true)"),
  'el banco conserva la navegacion aunque el foco caiga temporalmente fuera del panel',
);
assert(
  bench.includes("window.removeEventListener('keydown', onKeydown, true)"),
  'el listener global del banco se retira al cerrarlo',
);
assert(
  brake.includes("requestAnimationFrame(() => actions['Bajar la palanca'].focus())"),
  'engastar una piedra transfiere el foco al siguiente paso del puzzle',
);

console.log('M10 bench focus tests: OK');
