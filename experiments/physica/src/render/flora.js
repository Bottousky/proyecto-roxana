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

/** Moss beards as tapered ribbons in the xy-plane. */
export class Moss extends Chains {
  constructor(field) { super(field, { damping: 0.14, iterations: 5, bend: 0.12 }); this.mesh = null; }
  build() {
    const segs = this.chains.reduce((s, c) => s + c.n, 0);
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(segs * 4 * 3);
    const col = new Float32Array(segs * 4 * 3), idx = [];
    let v = 0;
    for (const c of this.chains) for (let i = 0; i < c.n; i++) {
      const t = i / c.n, k = 0.8 + 0.35 * t;
      for (let j = 0; j < 4; j++) { col[(v + j) * 3] = c.color.r * k; col[(v + j) * 3 + 1] = c.color.g * k; col[(v + j) * 3 + 2] = c.color.b * k; }
      idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); v += 4;
    }
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    this.mesh.frustumCulled = false;
    return this.mesh;
  }
  update(dt, time) {
    this.step(dt, time, 0.18);
    let o = 0;
    for (const c of this.chains) for (let i = 0; i < c.n; i++) {
      const p = c.pts[i], q = c.pts[i + 1];
      const dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1;
      const w0 = c.width * (1 - i / c.n) * 0.5, w1 = c.width * (1 - (i + 1) / c.n) * 0.5 + 0.004;
      const nx = -dy / l, ny = dx / l;
      const P = this.pos;
      P[o++] = p.x + nx * w0; P[o++] = p.y + ny * w0; P[o++] = c.root[2];
      P[o++] = p.x - nx * w0; P[o++] = p.y - ny * w0; P[o++] = c.root[2];
      P[o++] = q.x + nx * w1; P[o++] = q.y + ny * w1; P[o++] = c.root[2] + 0.01;
      P[o++] = q.x - nx * w1; P[o++] = q.y - ny * w1; P[o++] = c.root[2] + 0.01;
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
