// Things that hang: moss beards on the rock and the plumb bobs of the measuring mast.
// Both are chains integrated (Verlet, with damping) in the scene's field, so they point
// along the local effective gravity: down on the Orilla, up inside the region, slack where
// the field passes through zero. They are instruments of reading, not decoration.
import * as THREE from 'three';

class Chains {
  constructor(field, { damping = 0.06, iterations = 4, bend = 0 } = {}) {
    this.field = field; this.chains = []; this.damping = damping; this.iterations = iterations; this.bend = bend; this._a = { x: 0, y: 0 };
  }
  /** root: [x,y,z]; dir: initial direction; wall: {axis:'x', value, side} keeps points off the rock. */
  add({ root, n, len, dir = [0, -1], wall = null, width = 0.05, color, sway = 0.3 }) {
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push({ x: root[0] + dir[0] * len * i, y: root[1] + dir[1] * len * i, z: root[2], px: 0, py: 0 });
    for (const p of pts) { p.px = p.x; p.py = p.y; }
    const c = { root, n, len, pts, wall, width, color: new THREE.Color(color), sway, phase: Math.random() * 6.28 };
    this.chains.push(c);
    return c;
  }
  step(dt, time, wind = 0) {
    const a = this._a, d = 1 - this.damping;
    for (const c of this.chains) {
      const ps = c.pts;
      ps[0].x = c.root[0]; ps[0].y = c.root[1];
      for (let i = 1; i < ps.length; i++) {
        const p = ps[i];
        this.field.at(p.x, p.y, a);
        const gust = wind * c.sway * Math.sin(time * 1.3 + c.phase) * i / c.n;
        const nx = p.x + (p.x - p.px) * d + (a.x + gust) * dt * dt;
        const ny = p.y + (p.y - p.py) * d + a.y * dt * dt;
        p.px = p.x; p.py = p.y; p.x = nx; p.y = ny;
      }
      for (let k = 0; k < this.iterations; k++) {
        for (let i = 0; i < ps.length - 1; i++) {
          const p = ps[i], q = ps[i + 1];
          const dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1e-6, diff = (l - c.len) / l;
          if (i === 0) { q.x -= dx * diff; q.y -= dy * diff; }
          else { p.x += dx * diff * 0.5; p.y += dy * diff * 0.5; q.x -= dx * diff * 0.5; q.y -= dy * diff * 0.5; }
        }
        // Bending stiffness: each point leans toward the continuation of the previous segment.
        if (this.bend) for (let i = 2; i < ps.length; i++) {
          const a = ps[i - 2], b = ps[i - 1], p = ps[i];
          p.x += (2 * b.x - a.x - p.x) * this.bend; p.y += (2 * b.y - a.y - p.y) * this.bend;
        }
        if (c.wall) for (let i = 1; i < ps.length; i++) {
          const p = ps[i], w = c.wall;
          if (w.side > 0 && p.x < w.value) p.x = w.value; else if (w.side < 0 && p.x > w.value) p.x = w.value;
        }
      }
    }
  }
}

/** A piece of moss: a lumpy cushion where it grips the rock and, under it, a few clumps of short
 *  curling strands in two or three lengths, each clump inked like the painted plants (a dark
 *  underlay, then the strands), alpha-tested. Strands start at staggered depths under the
 *  cushion, so a piece has no straight edge. Grey values multiply the vertex colour. */
function mossTexture() {
  if (typeof document === 'undefined') return null;
  const W = 128, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const strands = [], blobs = [];
  for (let c = 0; c < 5; c++) { // clumps
    const cu = 0.2 + 0.6 * (c / 4) + (rnd() - 0.5) * 0.12, tier = [0.4, 0.62, 0.9][Math.floor(rnd() * 3)];
    for (let i = 0; i < 16; i++) {
      const x0 = W * (cu + (rnd() - 0.5) * 0.16), y0 = H * (0.03 + rnd() * 0.1), len = H * tier * (0.6 + rnd() * 0.4);
      const curl = (rnd() - 0.5) * 26, x1 = x0 + (rnd() - 0.5) * 14;
      strands.push({ x0, y0, x1, y1: y0 + len, curl, w: 2.2 + rnd() * 1.6, shade: 150 + rnd() * 105 });
    }
  }
  for (let i = 0; i < 9; i++) blobs.push({ x: W * (0.14 + 0.72 * rnd()), y: H * (0.02 + rnd() * 0.05), r: 9 + rnd() * 10 });
  const path = st => { g.beginPath(); g.moveTo(st.x0, st.y0); g.bezierCurveTo(st.x0, st.y0 + (st.y1 - st.y0) * 0.45, st.x1 + st.curl, st.y1 - (st.y1 - st.y0) * 0.3, st.x1 + st.curl * 0.4, st.y1); };
  g.lineCap = 'round';
  // ink underlay
  g.strokeStyle = 'rgb(38,30,18)'; g.fillStyle = 'rgb(38,30,18)';
  for (const st of strands) { g.lineWidth = st.w + 2.6; path(st); g.stroke(); }
  for (const b of blobs) { g.beginPath(); g.arc(b.x, b.y, b.r + 1.6, 0, Math.PI * 2); g.fill(); }
  // strands, then the cushion over their roots
  for (const st of strands) { g.strokeStyle = `rgb(${st.shade},${st.shade},${st.shade})`; g.lineWidth = st.w; path(st); g.stroke(); }
  for (const b of blobs) { const v = 140 + rnd() * 60; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Moss beards: smooth strips through each chain's points (Catmull-Rom), tapered and frayed.
 *  The chains are the physics (they hang along the local field); the strip only draws them. */
export class Moss extends Chains {
  constructor(field) { super(field, { damping: 0.14, iterations: 5, bend: 0.12 }); this.mesh = null; this.sub = 3; }
  build() {
    const g = new THREE.BufferGeometry(), sub = this.sub;
    const verts = this.chains.reduce((s, c) => s + 2 * (c.n * sub + 1), 0);
    this.pos = new Float32Array(verts * 3);
    const col = new Float32Array(verts * 3), uv = new Float32Array(verts * 2), idx = [];
    let v = 0;
    let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (const c of this.chains) {
      const S = c.n * sub; c.flip = rnd() < 0.5; c.vScale = 0.8 + rnd() * 0.2;
      for (let k = 0; k <= S; k++) {
        // Darker at the root, lighter and warmer (ochre) toward the tips: the gradient shows which
        // way a beard points, down outside a region and up inside it.
        const t = k / S, sh = 0.85 + 0.3 * t, w = 0.45 * t;
        const r = (c.color.r * (1 - w) + 0.8 * w) * sh, gg = (c.color.g * (1 - w) + 0.66 * w) * sh, bb = (c.color.b * (1 - w) + 0.36 * w) * sh;
        for (let j = 0; j < 2; j++) {
          col.set([r, gg, bb], (v + j) * 3);
          // each piece mirrored or not, and the texture shifted along it: stacked pieces did not
          // repeat the same root lump at a steady interval (it read as a rope)
          uv.set([c.flip ? 1 - j : j, 1 - t * c.vScale], (v + j) * 2);
        }
        if (k < S) idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
        v += 2;
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    // The strips lie in the xy-plane: their normal is +z (double-sided), set once.
    const nrm = new Float32Array(verts * 3); for (let i = 0; i < verts; i++) nrm[i * 3 + 2] = 1;
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    const map = mossTexture();
    this.mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, map, alphaTest: map ? 0.5 : 0, alphaToCoverage: !!map }));
    this.mesh.frustumCulled = false;
    return this.mesh;
  }
  update(dt, time) {
    this.step(dt, time, 0.18);
    // No allocation per sample (thousands per frame): three scratch points, reused.
    const P = this.pos, sub = this.sub, pt = this._p1 ||= { x: 0, y: 0 }, pt2 = this._p2 ||= { x: 0, y: 0 }, pt3 = this._p3 ||= { x: 0, y: 0 };
    // Catmull-Rom through the chain's points (the ends repeated), sampled `sub` times per link.
    const cr = (ps, i, u, o) => {
      const a = ps[Math.max(0, i - 1)], b = ps[i], c = ps[Math.min(ps.length - 1, i + 1)], d = ps[Math.min(ps.length - 1, i + 2)];
      const u2 = u * u, u3 = u2 * u;
      o.x = 0.5 * (2 * b.x + (c.x - a.x) * u + (2 * a.x - 5 * b.x + 4 * c.x - d.x) * u2 + (3 * b.x - a.x - 3 * c.x + d.x) * u3);
      o.y = 0.5 * (2 * b.y + (c.y - a.y) * u + (2 * a.y - 5 * b.y + 4 * c.y - d.y) * u2 + (3 * b.y - a.y - 3 * c.y + d.y) * u3);
      return o;
    };
    let o = 0;
    for (const c of this.chains) {
      const ps = c.pts, S = c.n * sub;
      for (let k = 0; k <= S; k++) {
        const t = k / S, i = Math.min(c.n - 1, Math.floor(k / sub)), u = k / sub - i;
        cr(ps, i, u, pt);
        // tangent from a nearby sample
        const k2 = Math.min(S, k + 1), k1 = Math.max(0, k - 1);
        const i2 = Math.min(c.n - 1, Math.floor(k2 / sub)), i1 = Math.min(c.n - 1, Math.floor(k1 / sub));
        const pa = cr(ps, i1, k1 / sub - i1, pt3), pb = cr(ps, i2, k2 / sub - i2, pt2);
        const dx = pb.x - pa.x, dy = pb.y - pa.y, l = Math.hypot(dx, dy) || 1;
        const w = c.width * 0.5, nx = -dy / l * w, ny = dx / l * w, z = c.root[2] + 0.01 * t;
        P[o++] = pt.x + nx; P[o++] = pt.y + ny; P[o++] = z;
        P[o++] = pt.x - nx; P[o++] = pt.y - ny; P[o++] = z;
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}

/** Plumb bobs: a thread and a brass bob, one per arm of the measuring mast. */
export class Plumbs extends Chains {
  constructor(field, materials) { super(field, { damping: 0.035, iterations: 6 }); this.mat = materials; this.group = new THREE.Group(); }
  addBob(root, len = 0.36) {
    // Real threads are never perfectly plumb: a slight initial tilt lets an inverted pull
    // swing the bob over instead of balancing it on an unstable equilibrium forever.
    const c = this.add({ root, n: 1, len, dir: [0.08, -1] });
    // Large enough to read their direction at the play camera (~12 px).
    const bob = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 12), this.mat.brass);
    bob.castShadow = true;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), this.mat.brass);
    bob.add(cap); cap.position.y = -0.095; cap.scale.setScalar(1.3);
    const thread = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), this.mat.thread);
    thread.frustumCulled = false;
    this.group.add(bob, thread);
    c.bob = bob; c.thread = thread;
    return c;
  }
  update(dt, time) {
    // Instruments feel the field only: no wind, so their reading never contradicts it.
    this.step(dt, time, 0);
    for (const c of this.chains) {
      const r = c.pts[0], b = c.pts[1];
      const dx = b.x - r.x, dy = b.y - r.y, l = Math.hypot(dx, dy) || 1;
      // the cone's tip points away from the thread: along the pull that keeps it taut
      c.bob.position.set(b.x, b.y, c.root[2]);
      c.bob.rotation.set(0, 0, Math.atan2(dy, dx) - Math.PI / 2);
      const p = c.thread.geometry.attributes.position;
      p.setXYZ(0, r.x, r.y, c.root[2]); p.setXYZ(1, b.x - dx / l * 0.07, b.y - dy / l * 0.07, c.root[2]); p.needsUpdate = true;
    }
  }
}
