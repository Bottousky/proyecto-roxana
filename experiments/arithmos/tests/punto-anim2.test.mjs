import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hopShape, settleShape} from '../src/engine/punto.js';

test('salto: se agacha sin avanzar, después avanza sin retroceder y termina en el destino', () => {
  const dur = 0.4, h = 40;
  let prev = 0;
  for (let t = 0; t <= dur + 1e-9; t += 1 / 240) {
    const s = hopShape(t, dur, h);
    if (t < 0.12) { assert.equal(s.u, 0); assert.ok(s.sl <= 1 && s.sl >= 0.78 - 1e-9); }
    assert.ok(s.u >= prev - 1e-9, `avanza (t = ${t})`);
    prev = s.u;
  }
  assert.ok(Math.abs(hopShape(dur, dur, h).u - 1) < 1e-9);
});

test('salto: sin saltos de velocidad horizontal mayores al 35 % del pico por cuadro de 60 Hz', () => {
  for (const dur of [0.26, 0.36, 0.5]) {
    const v = [];
    // sólo cuadros completos: al tocar, la velocidad que queda (55 %) la sigue el aterrizaje en el dibujo
    for (let t = 0; t + 1 / 60 <= dur + 1e-9; t += 1 / 60) v.push(hopShape(t + 1 / 60, dur, 30).u - hopShape(t, dur, 30).u);
    const pk = Math.max(...v);
    for (let i = 1; i < v.length; i++) assert.ok(Math.abs(v[i] - v[i - 1]) <= 0.35 * pk + 1e-9, `dur ${dur}, cuadro ${i}`);
  }
});

test('salto: el estiramiento se libera en el impulso (sin escalón al despegar)', () => {
  const dur = 0.4;
  for (let t = 0; t < dur; t += 1 / 240) assert.ok(Math.abs(hopShape(t + 1 / 240, dur, 40).sl - hopShape(t, dur, 40).sl) < 0.08, `t = ${t}`);
});

test('aterrizaje: sigue de largo ≤ 8 % del salto, se aplasta y termina exacto a los 0.3 s', () => {
  const st = {t: 0, vx: 400, vy: 300, dist: 120};
  let maxOx = 0;
  for (let tau = 0; tau < 0.3; tau += 1 / 240) { const [ox] = settleShape(st, tau, 10); maxOx = Math.max(maxOx, ox); }
  assert.ok(maxOx <= 0.08 * st.dist + 1e-6, `sobrepaso ${maxOx}`);
  assert.equal(settleShape(st, 0.3, 10), null);
  const [ox0, oy0, sl0] = settleShape(st, 0, 10);
  assert.ok(Math.abs(ox0) < 1e-9 && Math.abs(oy0) < 1e-9 && Math.abs(sl0 - 1) < 1e-9, 'empieza continuo');
});
