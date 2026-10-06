import { terracesAgreement } from './puzzle-model.js';

// El Monte Quieto, al oeste del Manantial, y al pie de su desfiladero la Casa de Compuertas: una
// central de agua antigua, callada desde antes de que naciera Vega. Arriba, en una hondonada, el
// agua está quieta detrás de una represa de piedra; de allí baja el canal viejo hasta la roca donde
// nace el acueducto del Manantial. No se visita en el Arco I: se ve, y responde a lo que el viajero
// cambia abajo. Coordenadas del reino, en metros (norte = −z).
//
// La cámara de juego mira al norte desde 66 m al sur del jugador: lo alto al sur de un lugar tapa.
// Por eso el macizo crece hacia el sudoeste, y el horneado del relieve (scripts/bake-relief.mjs)
// además limita cada punto a lo que dejan libre los rayos de la cámara hacia todo lo caminable.
export const QUIET_MOUNT = Object.freeze({
  name: 'Monte Quieto',
  house: 'Casa de Compuertas',
  peak: Object.freeze([-78, -58]),
  height: 40,
  // Where the mountain is drawn; outside it the ordinary relief of the valley takes over.
  extent: Object.freeze({ x0: -124, x1: -6, z0: -112, z1: -16 }),
  // The hollow that holds the reservoir, its water levels and the dam that closes it to the east.
  basin: Object.freeze({ x: -38, z: -86, rx: 13, rz: 8, floor: 4.4 }),
  reservoir: Object.freeze({ x0: -54, x1: -25.8, z0: -97, z1: -75, high: 8.6, low: 6.4 }),
  dam: Object.freeze({ x: -24.6, z0: -93.5, z1: -78.5, height: 9.8, thickness: 2.4 }),
  // The gorge below the dam opens east into the Manantial's west edge.
  gorge: Object.freeze({ x0: -25, x1: -6, z: -86, halfWidth: 3.6 }),
  gates: Object.freeze([-89.5, -86, -82.5]),
  // The house's door faces east, toward the Manantial: w runs north–south, d east–west.
  powerhouse: Object.freeze({ x: -16.5, z: -86, w: 6, d: 5, height: 3.6 }),
  lamp: Object.freeze([-13.62, 3.05, -84.6]),
  // The old canal leaves the powerhouse and reaches the Manantial's source rock (kingdom −5.25, −107.6).
  tailrace: Object.freeze([[-13.4, -88.2], [-10, -91.6], [-7.8, -96.6], [-6.8, -102.2], [-5.25, -107.6]]),
});

/** How the Casa de Compuertas answers the kingdom. Everything here is read from what the player did:
 * - the Manantial's water route open: the old canal carries water down to the source rock;
 * - the Manantial's pump repaired: the middle gate weeps;
 * - the Terrazas' agreement: giving the water first draws the reservoir down;
 * - the Faro lit: a light comes on in the house, steady over a full reservoir, faltering over a low one. */
export function quietMountState(state = {}) {
  const f = state.flags || {};
  const agreement = f.irrigation ? terracesAgreement(state.puzzles?.irrigation) : null;
  const low = agreement === 'riego';
  return {
    flowing: !!(f.spring_sluice || f.pump),
    weeping: !!f.pump,
    reservoir: low ? 'low' : 'high',
    lamp: f.beacon_lens ? (low ? 'flicker' : 'steady') : 'off',
    agreement,
  };
}

const smooth = (a, b, t) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };

/** The mountain's designed height at a kingdom point (metres), before the camera limit. Shared by
 * the relief bake and the tests, so the basin, the dam and the gorge always agree. */
export function quietMountHeight(x, z) {
  const m = QUIET_MOUNT, e = m.extent, b = m.basin, g = m.gorge;
  const edge = Math.min(x - e.x0, e.x1 - x, z - e.z0, e.z1 - z);
  if (edge <= 0) return 0;
  // The massif to the south-west, a shoulder that comes down toward the Manantial, ridges.
  const dx = (x - m.peak[0]) / 30, dz = (z - m.peak[1]) / 26;
  const ridge = Math.sin(x * .19 + z * .07) * .07 + Math.sin(x * .05 - z * .17) * .09 + Math.sin(x * .41 + z * .33) * .03;
  let h = m.height * Math.exp(-(dx * dx + dz * dz)) * (1 + ridge);
  h += 17 * Math.exp(-(((x + 44) / 15) ** 2 + ((z + 72) / 11) ** 2));          // southern shoulder of the basin
  h += 14 * Math.exp(-(((x + 40) / 16) ** 2 + ((z + 99.5) / 4.6) ** 2));       // northern spur
  h += 12 * Math.exp(-(((x + 58) / 7) ** 2 + ((z + 86) / 12) ** 2));           // western rim
  // The dam's abutments: rock cheeks on both sides of the gorge, high where the wall meets them.
  h += 13 * Math.exp(-(((x + 25.5) / 6.5) ** 2)) * smooth(4, 8.5, Math.abs(z + 86)) * (1 - smooth(13, 20, Math.abs(z + 86)));
  h *= smooth(0, 10, edge);
  // The hollow: a bowl down to its floor, so the water's edge is where the bowl meets the level.
  const r = Math.hypot((x - b.x) / b.rx, (z - b.z) / b.rz);
  if (r < 1.6) { const bowl = b.floor + 5.5 * r * r; h = Math.min(h, bowl + (h - bowl) * smooth(1.1, 1.6, r)); }
  // The gorge: from the dam down to the valley floor, a little wider as it opens east.
  if (x > g.x0 - 1.5) {
    const half = g.halfWidth + Math.max(0, x - g.x0) * .12, across = Math.abs(z - g.z);
    h *= smooth(half - .5, half + 3, across);
  }
  return Math.max(0, h);
}

/** Where nothing grows: under the reservoir's water, on the dam, the house, the gorge floor in front
 * of the dam and along the old canal. Shared by the flora and the tests. */
export function quietMountKeepsClear(x, z, ground = 0) {
  const m = QUIET_MOUNT, r = m.reservoir, d = m.dam, p = m.powerhouse;
  if (x > r.x0 - 1 && x < d.x && z > r.z0 - 1 && z < r.z1 + 1 && ground < r.high + .25) return true;
  if (Math.abs(x - d.x) < d.thickness / 2 + 3.2 && z > d.z0 - 1 && z < d.z1 + 1) return true;
  if (Math.abs(x - p.x) < p.d / 2 + 2 && Math.abs(z - p.z) < p.w / 2 + 2) return true;
  for (let i = 1; i < m.tailrace.length; i++) {
    const [ax, az] = m.tailrace[i - 1], [bx, bz] = m.tailrace[i], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    if (Math.hypot(x - ax - vx * t, z - az - vz * t) < 1.3) return true;
  }
  return false;
}
