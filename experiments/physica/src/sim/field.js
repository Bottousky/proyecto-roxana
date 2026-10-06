// Effective gravity in Physica belongs to space, not to bodies. Outside every region the
// familiar condition holds; a region imposes its own acceleration on whatever is inside it.
// The same field acts on water, test spheres, plants, plumb bobs and the explorer.
//
// Transition: each region has a band of width `band` centred on its boundary. Across the
// band the region's weight goes 0 → 1 along a smoothstep of the signed distance to the
// boundary, so the acceleration changes continuously in space (no pixel-wide activation).
// Overlap: regions are applied in ascending `priority`; each one blends the acceleration
// accumulated so far toward its own by its weight. A region of higher priority therefore
// wins where both are fully present, and the result stays continuous across both bands.
// A region switched off (`active:false`) contributes nothing; `power` scales its weight so
// the apparatus that sustains it can ramp it up or down over time instead of instantly.
// Depth: a region may declare z0/z1 (its extent in depth, with the same band); without them it
// extends through all depth, as on the 2.5D path where everything lives at z = 0.

export const G_FAMILIAR = 9.8;

export function smoothstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** Signed distance from (x,y) to the edge of an axis-aligned region: >0 inside, <0 outside. */
export function insideDistance(z, x, y) {
  return Math.min(x - z.x0, z.x1 - x, y - z.y0, z.y1 - y);
}

export class Field {
  constructor({ exterior = { x: 0, y: -G_FAMILIAR }, zones = [] } = {}) {
    this.exterior = { ...exterior };
    this.zones = zones.map(z => ({ band: 0.6, priority: 0, active: true, power: 1, ...z, g: { ...z.g } }))
      .sort((a, b) => a.priority - b.priority);
  }

  zone(id) { return this.zones.find(z => z.id === id); }

  /** Weight in [0,1] with which region `z` governs the point (x, y, depth). */
  weight(z, x, y, d = 0) {
    if (!z.active || z.power <= 0) return 0;
    const h = z.band / 2;
    let w = smoothstep(-h, h, insideDistance(z, x, y));
    if (z.z0 !== undefined && w > 0) w *= smoothstep(-h, h, Math.min(d - z.z0, z.z1 - d));
    return w * Math.min(1, z.power);
  }

  /** Effective acceleration at a point, in m/s² (depth d, 0 on the 2.5D path). */
  at(x, y, out = { x: 0, y: 0 }, d = 0) {
    let ax = this.exterior.x, ay = this.exterior.y;
    for (const z of this.zones) {
      const w = this.weight(z, x, y, d);
      if (w > 0) { ax += (z.g.x - ax) * w; ay += (z.g.y - ay) * w; }
    }
    out.x = ax; out.y = ay;
    return out;
  }

  /**
   * Acceleration on an extended body: the mean over its centre and the centres of its four
   * quadrants. A body partially inside a region feels the corresponding fraction of it.
   */
  onBody(cx, cy, hw, hh, out = { x: 0, y: 0 }, d = 0) {
    const qx = hw / 2, qy = hh / 2;
    let sx = 0, sy = 0;
    const p = this._p || (this._p = { x: 0, y: 0 });
    const pts = [[0, 0], [-qx, -qy], [qx, -qy], [-qx, qy], [qx, qy]];
    for (const [dx, dy] of pts) { this.at(cx + dx, cy + dy, p, d); sx += p.x; sy += p.y; }
    out.x = sx / 5; out.y = sy / 5;
    return out;
  }

  /** Ids of regions with any weight at the point — what an instrument there would register. */
  regionsAt(x, y, d = 0) { return this.zones.filter(z => this.weight(z, x, y, d) > 0).map(z => z.id); }
}
