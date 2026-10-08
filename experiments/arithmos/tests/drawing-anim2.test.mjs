import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Drawing} from '../src/engine/world.js';
import {stroke} from '../src/engine/chalk.js';
import {anim} from '../src/engine/anim.js';

// dos trazos separados: una línea y otra línea más abajo (entre ellos, la mano levanta y viaja)
const make = () => new Drawing('t', [stroke([[0, 0], [200, 0]], {seed: 3}), stroke([[0, 60], [200, 60]], {seed: 4})]);

test('con ?anim=2 el dibujo tiene una duración natural (trazos + levantada), mayor que la de sus trazos solos', () => {
  anim.level = 2;
  const d = make();
  const T = d.planDuration();
  assert.ok(T > 0.4 && T < 3, `T = ${T}`);
});

test('con ?anim=2 la punta recorre el primer trazo y después el segundo', () => {
  anim.level = 2;
  const d = make();
  d.progress = 0.05; const a = d.tip();
  d.progress = 0.3; const b = d.tip();
  d.progress = 0.95; const c = d.tip();
  assert.ok(Math.abs(a[1]) < 3 && Math.abs(b[1]) < 3, 'primero el de arriba');
  assert.ok(b[0] > a[0], 'avanza');
  assert.ok(Math.abs(c[1] - 60) < 3, 'termina en el de abajo');
});

test('con ?anim=2 el rasgueo calla durante la levantada y golpea al empezar cada trazo', () => {
  anim.level = 2;
  const d = make();
  const sec = d.planDuration();
  const env = d.soundEnvelope(sec);
  assert.equal(env.filter(e => e.tap).length, 2);
  const lv = env.filter(e => !e.tap);
  assert.ok(lv.some(e => e.v === 0 && e.t > 0.1 && e.t < sec - 0.1), 'hay silencio entre trazos');
  assert.ok(lv.filter(e => e.v > 0).length > lv.length * 0.6, 'suena casi todo el tiempo');
  assert.ok(lv.every(e => e.v <= 1));
});

test('sin la bandera, el dibujo sigue usando el progreso por largo de siempre', () => {
  anim.level = 1;
  const d = make();
  d.progress = 0.25;
  const [x, y] = d.tip();
  assert.ok(Math.abs(y) < 3 && x > 50 && x < 160, `${x}, ${y}`);
});
