import test from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, SIDE_BENCHES } from '../src/content.js';
import { inhabitantPlan } from '../src/world-inhabitants.js';

// The user: «que la gente nunca se pare en el paso». Players lost Faro and Castle steps to Edda,
// Nereo or Ivara standing on the way between two things they had to use (jugadores 29 y 30). At
// every point of the arc, nobody waits within a metre of the straight way between two of the
// player's own things in the same place (levers the player works, benches, exits, the arrival
// point), except at their own authored spot and beside optional side benches.
const ORDER = ['awaken', 'workshop_feed', 'workshop_return', 'bench_ready', 'workshop', 'road_send', 'road_return', 'bridge_ready', 'gate',
  'spring_sluice', 'spring_coupling', 'spring_drive', 'tala_lantern', 'pump', 'castle_service', 'castle_ready', 'distribution',
  'forge_limited', 'irrigation_open', 'water_routed', 'irrigation', 'lake_cable', 'lake_return', 'beacon_link', 'tower_feed', 'tower_return',
  'beacon_supply_ready', 'beacon_supply', 'tower_isolated', 'tower_motor', 'beacon_network_ready', 'beacon_network', 'tower_shutter',
  'tower_lens_free', 'beacon_lens_ready', 'beacon_lens'];
const segment = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };

test('nobody waits on the way between two things the player uses', () => {
  const blocked = new Set();
  for (let k = 0; k <= ORDER.length; k++) {
    const flags = Object.fromEntries(ORDER.slice(0, k).map(f => [f, true]));
    flags.road_bypass = !flags.bridge_ready; flags.castle_branch_closed = !flags.castle_ready;
    for (const [id, area] of Object.entries(AREAS)) {
      const own = [...area.objects.filter(o => ((o.kind === 'lever' && !o.story) || ['panel', 'beacon'].includes(o.kind)) && !SIDE_BENCHES[o.puzzle]), ...(area.exits || [])].map(o => [o.id, [o.x, o.z]]);
      if (area.spawn) own.push(['llegada', area.spawn]);
      for (const person of area.objects.filter(o => o.kind === 'npc')) {
        const plan = inhabitantPlan(id, person, { flags });
        if (!plan.present) continue;
        for (const stop of plan.stops) {
          for (const lever of area.objects.filter(o => o.kind === 'lever' && !o.story)) if (Math.hypot(stop[0] - lever.x, stop[1] - lever.z) < 2) blocked.add(`${id}: ${person.id} en ${stop} junto a ${lever.id}`);
          if (Math.hypot(stop[0] - person.x, stop[1] - person.z) < .01) continue;
          for (let i = 0; i < own.length; i++) for (let j = i + 1; j < own.length; j++) {
            const [a, pa] = own[i], [b, pb] = own[j], ends = Math.min(Math.hypot(stop[0] - pa[0], stop[1] - pa[1]), Math.hypot(stop[0] - pb[0], stop[1] - pb[1]));
            if (ends > 2.2 && segment(stop, pa, pb) < 1) blocked.add(`${id}: ${person.id} en ${stop} entre ${a} y ${b}`);
          }
        }
      }
    }
  }
  assert.deepEqual([...blocked], []);
});
