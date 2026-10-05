// Instruments and apparatus. Brass, oiled wood and cream enamel: the Instituto's hand.
import * as THREE from 'three';
import { TRACE_MAX_MARKS } from '../sim/world.js';
const TRACE_CAP = TRACE_MAX_MARKS + 1;

export function makeMaterials() {
  return {
    brass: new THREE.MeshStandardMaterial({ color: '#c9a04a', metalness: 0.8, roughness: 0.32 }),
    brassDark: new THREE.MeshStandardMaterial({ color: '#8a6a2c', metalness: 0.7, roughness: 0.45 }),
    copper: new THREE.MeshStandardMaterial({ color: '#4f9a88', metalness: 0.45, roughness: 0.5 }),
    wood: new THREE.MeshStandardMaterial({ color: '#7a4a2c', roughness: 0.8 }),
    woodLight: new THREE.MeshStandardMaterial({ color: '#a8703f', roughness: 0.78 }),
    enamel: new THREE.MeshStandardMaterial({ color: '#f1e6cc', roughness: 0.5 }),
    ink: new THREE.MeshBasicMaterial({ color: '#2a1a12' }),
    stone: new THREE.MeshStandardMaterial({ color: '#b98a64', roughness: 0.9 }),
    sphere: new THREE.MeshStandardMaterial({ color: '#d9b45a', metalness: 0.85, roughness: 0.22 }),
    sphereBand: new THREE.MeshStandardMaterial({ color: '#3a2618', roughness: 0.6 }),
    thread: new THREE.LineBasicMaterial({ color: '#f4ead6', transparent: true, opacity: 0.85 }),
    core: new THREE.MeshBasicMaterial({ color: '#c8fff4' }),
    coreDim: new THREE.MeshBasicMaterial({ color: '#4a8f86' }),
  };
}

function cyl(r0, r1, h, m, seg = 12) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.castShadow = true; c.receiveShadow = true; return c; }
function box(w, h, d, m) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.castShadow = true; b.receiveShadow = true; return b; }

/** A test sphere: brass with a dark equator so its rotation reads. */
export function sphereMesh(r, M) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), M.sphere); s.castShadow = true;
  const band = new THREE.Mesh(new THREE.TorusGeometry(r * 1.0, r * 0.12, 6, 28), M.sphereBand);
  const band2 = band.clone(); band2.rotation.y = Math.PI / 2;
  g.add(s, band, band2);
  return g;
}

/**
 * Release support: post, cantilever arm, clamp with two jaws, reel and thread.
 * Its arm may reach back in depth (armZ) and come forward to the clamp on the play plane.
 */
export class Stand {
  constructor(spec, M) {
    this.spec = spec; this.M = M;
    const g = this.group = new THREE.Group();
    const { x, baseY, clampX, clampY } = spec;
    const z0 = spec.z ?? -0.55, zl = spec.laneZ ?? 0;
    const topY = clampY + 0.42;
    const foot = box(0.7, 0.08, 0.7, M.stone); foot.position.set(x, baseY + 0.04, z0); g.add(foot);
    const post = cyl(0.05, 0.065, topY - baseY, M.wood); post.position.set(x, baseY + (topY - baseY) / 2, z0); g.add(post);
    const collar = cyl(0.075, 0.075, 0.08, M.brass); collar.position.set(x, topY - 0.05, z0); g.add(collar);
    // Arm: from the post top, along x to the clamp's x, then forward in z to the play plane.
    const ax = clampX - x, len = Math.abs(ax);
    const arm = box(len, 0.06, 0.06, M.woodLight); arm.position.set(x + ax / 2, topY, z0); g.add(arm);
    const fwd = box(0.05, 0.05, Math.abs(z0 - zl) + 0.05, M.brass); fwd.position.set(clampX, topY, (z0 + zl) / 2); g.add(fwd);
    const drop = cyl(0.018, 0.018, 0.26, M.brass); drop.position.set(clampX, topY - 0.13, zl); g.add(drop);
    // Clamp jaws pivot open on release.
    this.jaws = [-1, 1].map(s => {
      const piv = new THREE.Group(); piv.position.set(clampX, clampY + 0.2, zl);
      const jaw = box(0.035, 0.2, 0.05, M.brassDark); jaw.position.set(s * 0.06, -0.1, 0); piv.add(jaw);
      const tipj = box(0.07, 0.03, 0.05, M.brassDark); tipj.position.set(s * 0.035, -0.2, 0); piv.add(tipj);
      g.add(piv); piv.userData.s = s; return piv;
    });
    // Reel on the post with a crank.
    this.reel = new THREE.Group(); this.reel.position.set(x + (ax > 0 ? 0.12 : -0.12), baseY + 1.05, z0 + 0.1);
    const drum = cyl(0.09, 0.09, 0.08, M.brass, 16); drum.rotation.x = Math.PI / 2; this.reel.add(drum);
    const crank = box(0.02, 0.14, 0.02, M.brassDark); crank.position.set(0, 0.06, 0.05); this.reel.add(crank);
    g.add(this.reel);
    // Thread from the reel over a pulley on the arm to the clamp/sphere.
    this.pulley = new THREE.Vector3(clampX, topY, zl);
    this.threadGeo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 18 }, () => new THREE.Vector3()));
    this.thread = new THREE.Line(this.threadGeo, M.thread); this.thread.frustumCulled = false; g.add(this.thread);
    // Height scale beside the support (graduated every 0.5 m, numbered each metre).
    if (spec.ruler) this.addRuler(spec.ruler);
    this.open = 0;
  }

  addRuler({ x, y0, y1, z = -0.25 }) {
    const M = this.M, g = this.group;
    const bar = box(0.07, y1 - y0, 0.03, M.enamel); bar.position.set(x, (y0 + y1) / 2, z); g.add(bar);
    for (let y = y0; y <= y1 + 1e-6; y += 0.25) {
      const major = Math.abs((y - y0) % 1) < 1e-6, half = Math.abs((y - y0) % 0.5) < 1e-6;
      const t = box(major ? 0.12 : half ? 0.08 : 0.05, 0.012, 0.035, M.ink); t.position.set(x - 0.03, y, z + 0.005); g.add(t);
    }
    for (let m = Math.ceil(y0); m <= y1; m++) {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64; const k = c.getContext('2d');
      k.fillStyle = '#2a1a12'; k.font = '600 44px Georgia, serif'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(`${m - y0}`, 32, 34);
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sp.position.set(x + 0.13, m, z + 0.02); g.add(sp);
    }
  }

  update(dt, st, spherePos) {
    const target = st.state === 'armed' ? 0 : 1;
    this.open += (target - this.open) * Math.min(1, dt * 14);
    for (const j of this.jaws) j.rotation.z = j.userData.s * this.open * 0.55;
    if (st.state === 'reeling') this.reel.rotation.z -= dt * 14;
    // Thread: reel → pulley → sphere, slack sagging toward the local pull when free.
    const pts = [], r = this.reel.position, P = this.pulley;
    pts.push(new THREE.Vector3(r.x, r.y + 0.09, r.z));
    pts.push(new THREE.Vector3(r.x, P.y, r.z));
    pts.push(new THREE.Vector3(P.x, P.y, P.z));
    const end = st.state === 'armed' ? new THREE.Vector3(P.x, st.clampY + 0.1, P.z) : spherePos;
    const n = 15, d = end.distanceTo(P), slack = st.state === 'free' ? Math.min(0.6, d * 0.12) : 0.0;
    for (let i = 1; i <= n; i++) {
      const t = i / n, p = new THREE.Vector3().lerpVectors(P, end, t);
      p.y -= Math.sin(t * Math.PI) * slack * Math.sign(st.sagSign ?? 1);
      pts.push(p);
    }
    const a = this.threadGeo.attributes.position;
    for (let i = 0; i < a.count; i++) { const p = pts[Math.min(i, pts.length - 1)]; a.setXYZ(i, p.x, p.y, p.z); }
    a.needsUpdate = true;
  }
}

/** Field anchor: the apparatus that sustains a region. Its core pulses with the supply. */
export function fieldAnchor(M, { x, y, z }) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 10, 28), M.brass); ring.castShadow = true;
  const inner = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), M.copper);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), M.core.clone());
  const plate = cyl(0.42, 0.46, 0.08, M.brassDark, 24); plate.rotation.x = Math.PI / 2; plate.position.z = -0.08;
  g.add(plate, ring, inner, core);
  g.userData = { inner, core };
  return g;
}

/** Brass conduit with glowing collars, from an anchor back into the rock. */
export function conduit(M, pts, { r = 0.06 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 10, false), M.brassDark); tube.castShadow = true; tube.receiveShadow = true;
  const g = new THREE.Group(); g.add(tube);
  const collars = [];
  for (let i = 1; i < 8; i++) {
    const p = curve.getPointAt(i / 8), t = curve.getTangentAt(i / 8);
    const c = new THREE.Mesh(new THREE.TorusGeometry(r * 1.5, r * 0.45, 8, 16), M.core.clone());
    c.position.copy(p); c.lookAt(p.clone().add(t)); g.add(c); collars.push({ mesh: c, u: i / 8 });
  }
  g.userData.collars = collars;
  return g;
}

/** Trace marks of experiments: equal-interval dots joined by a hairline (one draw per kind). */
export class Traces {
  constructor(scene) {
    this.scene = scene; this.items = new Map();
    this.dot = new THREE.CircleGeometry(0.045, 14);
    this.big = new THREE.RingGeometry(0.05, 0.085, 18);
    this.colors = { A: '#fff4d8', B: '#a9fff1', mano: '#ffc35a' };
    this.m4 = new THREE.Matrix4();
  }
  sync(traces, zOf = () => 0.3) {
    const alive = new Set();
    for (const tr of traces) {
      alive.add(tr.id);
      let it = this.items.get(tr.id);
      if (!it) {
        const col = new THREE.Color(this.colors[tr.source] || '#ffffff');
        it = { group: new THREE.Group(), count: 0, z: zOf(tr.body),
          mat: new THREE.MeshBasicMaterial({ color: col, transparent: true, depthWrite: false }),
          ringMat: new THREE.MeshBasicMaterial({ color: col, transparent: true, depthWrite: false }) };
        it.dots = new THREE.InstancedMesh(this.dot, it.mat, TRACE_CAP); it.dots.count = 0; it.dots.frustumCulled = false;
        it.rings = new THREE.InstancedMesh(this.big, it.ringMat, Math.ceil(TRACE_CAP / 5) + 1); it.rings.count = 0; it.rings.frustumCulled = false;
        const lg = new THREE.BufferGeometry();
        lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRACE_CAP * 3), 3)); lg.setDrawRange(0, 0);
        it.line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.5 })); it.line.frustumCulled = false;
        it.group.add(it.line, it.dots, it.rings); it.group.renderOrder = 8; this.scene.add(it.group); this.items.set(tr.id, it);
      }
      const newer = traces.filter(t => t.source === tr.source && t.id > tr.id).length;
      const fade = newer === 0 ? 1 : newer === 1 ? 0.45 : 0.22;
      it.mat.opacity = 0.95 * fade; it.ringMat.opacity = 0.9 * fade; it.line.material.opacity = 0.45 * fade;
      const n = Math.min(TRACE_CAP, tr.marks.length);
      if (it.count !== n) {
        const a = it.line.geometry.attributes.position;
        for (let i = it.count; i < n; i++) {
          const m = tr.marks[i];
          this.m4.makeTranslation(m.x, m.y, it.z + 0.01); it.dots.setMatrixAt(i, this.m4);
          if (i % 5 === 0) { this.m4.makeTranslation(m.x, m.y, it.z); it.rings.setMatrixAt(i / 5, this.m4); }
          a.setXYZ(i, m.x, m.y, it.z - 0.01);
        }
        it.dots.count = n; it.rings.count = Math.floor((n - 1) / 5) + 1;
        it.dots.instanceMatrix.needsUpdate = true; it.rings.instanceMatrix.needsUpdate = true;
        a.needsUpdate = true; it.line.geometry.setDrawRange(0, n);
        it.count = n;
      }
    }
    for (const [id, it] of this.items) if (!alive.has(id)) { this.scene.remove(it.group); it.dots.dispose(); it.rings.dispose(); it.line.geometry.dispose(); this.items.delete(id); }
  }
}
