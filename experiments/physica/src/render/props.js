// Instruments and apparatus. Brass, oiled wood and cream enamel: the Instituto's hand.
import * as THREE from 'three';
import { TRACE_MAX_MARKS } from '../sim/world.js';
const TRACE_CAP = TRACE_MAX_MARKS + 1;
// Everything numeric — the rails' and chains' scales, the chalk, the bell and Mirador lines —
// is drawn on one plane just in front of the explorer's lane, so equal heights line up on screen
// from any camera height (instruments at other depths would show parallax).
export const MEASURE_Z = 0.08;
const SCALE_Z = MEASURE_Z;

export function makeMaterials() {
  return {
    brass: new THREE.MeshStandardMaterial({ color: '#c9a04a', metalness: 0.8, roughness: 0.32 }),
    brassDark: new THREE.MeshStandardMaterial({ color: '#8a6a2c', metalness: 0.7, roughness: 0.45 }),
    iron: new THREE.MeshStandardMaterial({ color: '#4a4440', metalness: 0.7, roughness: 0.5 }),
    copper: new THREE.MeshStandardMaterial({ color: '#4f9a88', metalness: 0.45, roughness: 0.5 }),
    wood: new THREE.MeshStandardMaterial({ color: '#7a4a2c', roughness: 0.8 }),
    woodLight: new THREE.MeshStandardMaterial({ color: '#a8703f', roughness: 0.78 }),
    enamel: new THREE.MeshStandardMaterial({ color: '#f1e6cc', roughness: 0.5 }),
    ink: new THREE.MeshBasicMaterial({ color: '#2a1a12' }),
    stone: new THREE.MeshStandardMaterial({ color: '#b98a64', roughness: 0.9 }),
    sphere: new THREE.MeshStandardMaterial({ color: '#d9b45a', metalness: 0.85, roughness: 0.22 }),
    // Cream enamel band: the test spheres read against dark terracotta.
    sphereBand: new THREE.MeshStandardMaterial({ color: '#f4ead2', roughness: 0.45, emissive: '#3a3020' }),
    thread: new THREE.LineBasicMaterial({ color: '#f4ead6', transparent: true, opacity: 0.85 }),
    core: new THREE.MeshBasicMaterial({ color: '#c8fff4' }),
    coreDim: new THREE.MeshBasicMaterial({ color: '#4a8f86' }),
  };
}

function cyl(r0, r1, h, m, seg = 12) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.castShadow = true; c.receiveShadow = true; return c; }
function box(w, h, d, m) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.castShadow = true; b.receiveShadow = true; return b; }

/** A small painted number on an enamel tag, facing the camera. */
export function label(text, M, size = 0.17) {
  const c = document.createElement('canvas'), k = c.getContext('2d'), font = '700 40px Georgia, serif';
  k.font = font; const w = Math.max(96, Math.ceil(k.measureText(text).width) + 28);
  c.width = w; c.height = 64;
  k.fillStyle = '#f1e6cc'; k.beginPath(); k.roundRect(4, 6, w - 8, 52, 10); k.fill();
  k.fillStyle = '#2a1a12'; k.font = font; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(text, w / 2, 34);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(size * 1.5 * w / 96, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
}

/** The descent chain: taut from a bracket on the lip to the chasm floor, numbered every metre. */
export function chainProp(ch, M) {
  const g = new THREE.Group();
  const top = ch.lipY + 0.35, bottom = ch.floorY, n = Math.round((top - bottom) / 0.075);
  const linkGeo = new THREE.TorusGeometry(0.035, 0.011, 6, 10);
  const links = new THREE.InstancedMesh(linkGeo, M.iron || M.brassDark, n);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    e.set(0, i % 2 ? Math.PI / 2 : 0, Math.PI / 2); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(ch.x, top - i * 0.075, 0.02), q, new THREE.Vector3(1, 1, 1)); links.setMatrixAt(i, m4);
  }
  links.castShadow = true; g.add(links);
  // Davit on the lip and an anchor ring on the floor.
  const davit = box(ch.x - ch.lipX + 0.2, 0.07, 0.09, M.brassDark); davit.position.set((ch.x + ch.lipX - 0.2) / 2, top + 0.03, 0.02); g.add(davit);
  const post = box(0.09, 0.45, 0.09, M.brassDark); post.position.set(ch.lipX - 0.2, ch.lipY + 0.22, 0.02); g.add(post);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), M.brassDark); ring.rotation.x = Math.PI / 2; ring.position.set(ch.x, bottom + 0.03, 0.02); g.add(ring);
  const collar = cyl(0.07, 0.07, 0.06, M.brass); collar.position.set(ch.x, ch.stopY + 0.25, 0.02); g.add(collar);
  // Numbered every half metre, between the wall and the chain, where the explorer's body does not cover them.
  for (let y = Math.ceil(ch.stopY * 2) / 2; y <= ch.lipY + 1e-6; y += 0.5) {
    const whole = Math.abs(y - Math.round(y)) < 1e-6;
    const txt = `${y < 0 ? '−' : ''}${whole ? Math.abs(Math.round(y)) : Math.abs(y).toFixed(1).replace('.', ',')}`;
    const t = label(txt, M, whole ? 0.25 : 0.2); t.position.set(ch.lipX + 0.2, y, SCALE_Z); g.add(t);
    const tick = box(whole ? 0.12 : 0.08, 0.02, 0.02, M.brass); tick.position.set(ch.x - 0.06, y, 0.04); g.add(tick);
  }
  // Where a region's floor crosses the chain: a brass collar and a seam across the shaft, the
  // apparatus's own mark (the plumbs and drips show the same thing by behaviour).
  if (ch.regionFloor != null) {
    const c2 = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 18), M.copper); c2.rotation.x = Math.PI / 2; c2.position.set(ch.x, ch.regionFloor, 0.02); g.add(c2);
    const seam = box(1.5, 0.025, 0.02, M.copper); seam.position.set(ch.lipX + 0.8, ch.regionFloor, SCALE_Z - 0.01); g.add(seam);
  }
  // The ring the explorer holds slides with its buckle; at rest it waits at the lip.
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 8, 18), M.brass); ringM.position.set(ch.x, ch.lipY + 0.55, 0.02); g.add(ringM);
  const pointer = box(Math.max(0.1, ch.x - ch.lipX - 0.38), 0.018, 0.02, M.brass); pointer.position.set((ch.x + ch.lipX + 0.38) / 2, ch.lipY + 0.55, SCALE_Z + 0.02); g.add(pointer);
  g.userData.ring = ringM; g.userData.pointer = pointer; g.userData.restY = ch.lipY + 0.55;
  return g;
}

/** A bell hung from a gallows on the Terraza, at the Terraza's height above B's rail. */
export class Bell {
  constructor(bl, groundY, M, postX) {
    const g = this.group = new THREE.Group(), terraceY = groundY;
    const armY = Math.max(terraceY + 1.25, bl.y + 0.9);
    const post = cyl(0.05, 0.06, armY - terraceY, M.wood); post.position.set(postX, (terraceY + armY) / 2, -0.5); g.add(post);
    const arm = box(postX - bl.x + 0.1, 0.06, 0.06, M.woodLight); arm.position.set((postX + bl.x) / 2, armY, -0.5); g.add(arm);
    this.pivot = new THREE.Group(); this.pivot.position.set(bl.x, armY, -0.5); g.add(this.pivot);
    const cord = cyl(0.01, 0.01, armY - bl.y - 0.12, M.brassDark); cord.position.y = -(armY - bl.y - 0.12) / 2; this.pivot.add(cord);
    const prof = [[0.0, 0.16], [0.05, 0.16], [0.07, 0.12], [0.08, 0.04], [0.11, -0.04], [0.12, -0.07], [0.0, -0.07]].map(p => new THREE.Vector2(p[0], p[1]));
    const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), M.brass); bell.position.y = -(armY - bl.y); bell.scale.setScalar(1.7); bell.castShadow = true; this.pivot.add(bell);
    this.swing = 0; this.phase = 0;
  }
  ring(speed) { this.swing = Math.min(0.6, 0.2 + speed * 0.12); this.phase = 0; }
  update(dt) { this.phase += dt * 7; this.swing *= Math.exp(-dt * 1.4); this.pivot.rotation.z = Math.sin(this.phase) * this.swing; }
}

/**
 * Chalk on the Terraza's face: one mark per attempt at the height the explorer's buckle
 * reached, labelled with where it started, kept until the crossing. A painted line marks the
 * bell's height, the line a centre must reach.
 */
export class ApexMarks {
  constructor(scene, M, { bellLine, x0 = 3.95, x1 = 4.45, z = MEASURE_Z }) {
    this.scene = scene; this.M = M; this.items = []; this.x0 = x0; this.x1 = x1; this.z = z;
    if (bellLine != null) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 + 0.2, 0.035), new THREE.MeshBasicMaterial({ color: '#d9b45a' }));
      line.position.set((x0 + x1) / 2 - 0.1, bellLine, z - 0.01); line.renderOrder = 9; scene.add(line);
      const dec = Math.abs(bellLine * 10 - Math.round(bellLine * 10)) > 1e-6 ? 2 : 1;
      const tag = label(bellLine.toFixed(dec).replace('.', ','), M, 0.17); tag.position.set(x0 - 0.3, bellLine, z - 0.01); tag.renderOrder = 9; scene.add(tag);
    }
  }
  add(y, from) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(this.x1 - this.x0, 0.05), new THREE.MeshBasicMaterial({ color: '#fff7e0', transparent: true, depthWrite: false }));
    m.position.set((this.x0 + this.x1) / 2, y, this.z); m.renderOrder = 9; g.add(m);
    // Labelled on the open side, where neither the rock nor the water covers it.
    const t = label(from == null ? 'borde' : `${from < 0 ? '−' : ''}${Math.abs(from).toFixed(1).replace('.', ',')}`, this.M, 0.14);
    t.position.set(this.x0 - 0.3, y, this.z); t.renderOrder = 9; g.add(t);
    this.scene.add(g); this.items.push(g);
    if (this.items.length > 6) this.scene.remove(this.items.shift());
  }
  clear() { for (const g of this.items) this.scene.remove(g); this.items = []; }
  update() {}
}

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
    const { x, baseY, clampX, clampY, rail } = spec;
    const z0 = spec.z ?? -0.55, zl = spec.laneZ ?? 0;
    const topY = (rail ? rail.max : clampY) + 0.42;
    this.zl = zl;
    const foot = box(0.7, 0.08, 0.7, M.stone); foot.position.set(x, baseY + 0.04, z0); g.add(foot);
    const post = cyl(0.05, 0.065, topY - baseY, M.wood); post.position.set(x, baseY + (topY - baseY) / 2, z0); g.add(post);
    const collar = cyl(0.075, 0.075, 0.08, M.brass); collar.position.set(x, topY - 0.05, z0); g.add(collar);
    // Arm: from the post top, along x to the clamp's x, then forward in z to the play plane.
    const ax = clampX - x, len = Math.abs(ax);
    // The arm and the clamp's link get their own materials, so the active support can light them.
    this.lit = [M.woodLight.clone(), M.brass.clone()];
    const arm = box(len, 0.06, 0.06, this.lit[0]); arm.position.set(x + ax / 2, topY, z0); g.add(arm);
    const fwd = box(0.05, 0.05, Math.abs(z0 - zl) + 0.05, this.lit[1]); fwd.position.set(clampX, topY, (z0 + zl) / 2); g.add(fwd);
    if (rail) {
      // A rail hangs from the arm into the chasm; the clamp rides it on a carriage.
      const zr = zl - 0.22, bottom = rail.min - 0.35;
      const rod = cyl(0.022, 0.022, topY - bottom, M.brassDark); rod.position.set(clampX, (topY + bottom) / 2, zr); g.add(rod);
      const link = box(0.05, 0.05, 0.27, M.brass); link.position.set(clampX, topY, (z0 + zr) / 2); g.add(link);
      for (let y = rail.min; y <= rail.max + 1e-6; y += rail.step) {
        const major = Math.abs(y - Math.round(y)) < 1e-6;
        const t = box(major ? 0.16 : 0.1, 0.014, 0.03, M.ink); t.position.set(clampX + 0.06, y, zr + 0.02); g.add(t);
        if (major) { const l = label(`${y < 0 ? '−' : ''}${Math.abs(Math.round(y))}`, M, 0.22); l.position.set(clampX + 0.3, y, SCALE_Z); g.add(l); }
      }
    } else {
      const drop = cyl(0.018, 0.018, 0.26, this.lit[1]); drop.position.set(clampX, topY - 0.13, zl); g.add(drop);
    }
    // Clamp jaws pivot open on release; they ride a carriage at the clamp's height.
    this.carriage = new THREE.Group(); this.carriage.position.set(clampX, clampY, zl); g.add(this.carriage);
    if (rail) { const cb = box(0.12, 0.1, 0.26, M.brass); cb.position.set(0, 0.26, -0.11); this.carriage.add(cb); }
    this.jaws = [-1, 1].map(s => {
      const piv = new THREE.Group(); piv.position.set(0, 0.2, 0);
      const jaw = box(0.035, 0.2, 0.05, M.brassDark); jaw.position.set(s * 0.06, -0.1, 0); piv.add(jaw);
      const tipj = box(0.07, 0.03, 0.05, M.brassDark); tipj.position.set(s * 0.035, -0.2, 0); piv.add(tipj);
      this.carriage.add(piv); piv.userData.s = s; return piv;
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

  setActive(on) { this.active = on; if (!on) for (const m of this.lit) m.emissive.setRGB(0, 0, 0); }
  pulse(time) {
    if (!this.active) return;
    const k = 0.32 + 0.18 * Math.sin(time * 5);
    for (const m of this.lit) m.emissive.setRGB(k, k * 0.85, k * 0.55);
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
    this.carriage.position.y += (st.clampY - this.carriage.position.y) * Math.min(1, dt * 18);
    // Thread: reel → pulley → (down the rail) → clamp → sphere, slack when free.
    const pts = [], r = this.reel.position, P = this.spec.rail ? new THREE.Vector3(this.pulley.x, this.carriage.position.y + 0.3, this.zl) : this.pulley;
    pts.push(new THREE.Vector3(r.x, r.y + 0.09, r.z));
    pts.push(new THREE.Vector3(r.x, this.pulley.y, r.z));
    pts.push(new THREE.Vector3(this.pulley.x, this.pulley.y, this.pulley.z));
    const end = st.state === 'armed' ? new THREE.Vector3(P.x, this.carriage.position.y + 0.1, P.z) : spherePos;
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
