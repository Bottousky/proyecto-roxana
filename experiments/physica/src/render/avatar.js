// The explorer: a student of the Instituto shrunk into Physica, built to match the character
// sheet (art-source/physica/explorer-sheet-v1.png): a big round head (three heads tall) with
// messy dark hair and a curl on top, brass goggles with dark lenses resting on the hair, a
// deep teal coat open below the belt, a long saffron scarf with two tails, the Bitácora
// satchel on a cross-body strap, the brass wrist instrument on the left wrist, cream
// trousers and big brown boots. Pose and expression are derived from the simulated state
// (support, velocity, local field); the scarf tails and the curl are chains in the same field,
// so they stream upward inside the region. Representation only: nothing here moves the
// simulated body.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const C = {
  coat: '#2c5a68', cuff: '#376b7b', skin: '#f2c29c', blush: '#ec8f73', hair: '#5a3824',
  scarf: '#f0a628', trousers: '#ece2cc', boots: '#6e4024', bootsDark: '#4a2a18',
  brass: '#d9b05a', leather: '#86512f', leatherDark: '#5e371f', iris: '#3f2414', glass: '#4d4743',
  glow: '#9ff3e6', enamel: '#f4ead2', ink: '#2a160e',
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** Painted strands for the hair: streaks from the crown down (the sphere's v runs from the
 *  crown), lighter and darker than the base, with a soft sheen band. Tileable around. */
function hairTexture() {
  if (typeof document === 'undefined') return null;
  const W = 512, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = C.hair; g.fillRect(0, 0, W, H);
  const sheen = g.createLinearGradient(0, 0, 0, H);
  sheen.addColorStop(0.12, 'rgba(150,104,70,0)'); sheen.addColorStop(0.28, 'rgba(150,104,70,0.35)'); sheen.addColorStop(0.42, 'rgba(150,104,70,0)');
  g.fillStyle = sheen; g.fillRect(0, 0, W, H);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W, w = 1 + rnd() * 3, y0 = rnd() * 24, y1 = 50 + rnd() * 78, light = rnd() < 0.45;
    g.strokeStyle = light ? `rgba(140,96,62,${0.25 + rnd() * 0.3})` : `rgba(40,22,13,${0.25 + rnd() * 0.35})`; g.lineWidth = w;
    for (const dx of [0, -W, W]) { g.beginPath(); g.moveTo(x + dx, y0); g.quadraticCurveTo(x + dx + (rnd() - 0.5) * 18, (y0 + y1) / 2, x + dx + (rnd() - 0.5) * 10, y1); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

/** The scarf tails: saffron knit with darker edges and a frayed, notched tip (alpha-tested).
 *  The sphere-free ribbon cannot take the outline, so the edge is painted. */
function scarfTexture() {
  if (typeof document === 'undefined') return null;
  const W = 64, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = C.scarf; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(160,90,20,0.55)'; g.fillRect(0, 0, 7, H); g.fillRect(W - 7, 0, 7, H);
  g.fillStyle = 'rgba(255,220,140,0.25)'; for (let x = 12; x < W - 10; x += 9) g.fillRect(x, 0, 2, H);
  // the tip (v = 1 is the canvas top): notched fringe
  g.clearRect(0, 0, W, 14);
  for (let x = 0; x < W; x += 8) { g.fillStyle = C.scarf; g.beginPath(); g.moveTo(x + 1, 14); g.lineTo(x + 4, 2 + (x * 7) % 9); g.lineTo(x + 7, 14); g.fill(); }
  scarfTexture.ok = true;
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function mat(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o }); }

// Ink outline: the back faces pushed out along their normals, so the line stays even on
// non-centred parts (a scaled hull would drift on anything off its origin). The push is the
// larger of a fixed width and ~1.4 px at the camera's distance: at play scale the line still
// separates the coat from the teal water behind it.
const inkCache = new Map();
function inkMaterial(w) {
  if (inkCache.has(w)) return inkCache.get(w);
  const m = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
      `vec4 inkView = modelViewMatrix * vec4(position, 1.0);
       vec3 transformed = position + normal * max(${w.toFixed(4)}, -inkView.z * 0.0011);`);
  };
  m.customProgramCacheKey = () => 'ink' + w;
  inkCache.set(w, m); return m;
}
function outline(mesh, w = 0.007) {
  const o = new THREE.Mesh(mesh.geometry, inkMaterial(w)); o.userData.ink = true; mesh.add(o); return o;
}

/** Bake a transform into a geometry. */
function bake(g, { p, r, s } = {}) {
  if (s) g.scale(...(typeof s === 'number' ? [s, s, s] : s));
  if (r) { const e = new THREE.Euler(...r); g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(e)); }
  if (p) g.translate(...p);
  return g;
}
/** Merge geometries that may mix indexed and non-indexed builds. */
function merge(list) {
  const mixed = !list.every(g => g.index);
  const gs = list.map(g => {
    const h = mixed && g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(h.attributes)) if (!['position', 'normal', 'uv'].includes(k)) h.deleteAttribute(k);
    return h;
  });
  return mergeGeometries(gs);
}
/** Basis whose +y is `dir` and whose +x leans toward `hint`. */
function basis(dir, hint) {
  const Y = dir.clone().normalize();
  const X = hint.clone().addScaledVector(Y, -hint.dot(Y));
  if (X.lengthSq() < 1e-6) X.set(1, 0, 0).addScaledVector(Y, -Y.x);
  X.normalize();
  return new THREE.Matrix4().makeBasis(X, Y, new THREE.Vector3().crossVectors(X, Y));
}
function place(g, dir, pos, hint = V(0, 1, 0)) { const m = basis(dir, hint); m.setPosition(pos); return g.applyMatrix4(m); }
/** The curl on top: a short tuft, thick at the root and tapering to a point as it turns
 *  over toward the face (+x). */
function curlGeo() {
  const segs = 20, rad = 7;
  const c = new THREE.CatmullRomCurve3([V(0, -0.02, 0), V(0.006, 0.04, 0), V(0.024, 0.08, 0), V(0.05, 0.088, 0), V(0.062, 0.068, 0)]);
  const g = new THREE.TubeGeometry(c, segs, 0.016, rad, false), p = g.attributes.position;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, ctr = c.getPointAt(t), k = 1 - 0.85 * t ** 0.9;
    for (let j = 0; j <= rad; j++) { const v = i * (rad + 1) + j; p.setXYZ(v, ctr.x + (p.getX(v) - ctr.x) * k, ctr.y + (p.getY(v) - ctr.y) * k, ctr.z + (p.getZ(v) - ctr.z) * k); }
  }
  g.computeVertexNormals(); return g;
}
/** A flat band (a strap) laid along a curve, its width turned around the body's vertical axis. */
function bandAlong(curve, width, segs) {
  const pos = [], idx = [], uv = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, p = curve.getPointAt(t), tg = curve.getTangentAt(t);
    const out = V(p.x, 0, p.z).normalize(), w = new THREE.Vector3().crossVectors(tg, out).normalize().multiplyScalar(width / 2);
    pos.push(p.x + w.x, p.y + w.y, p.z + w.z, p.x - w.x, p.y - w.y, p.z - w.z); uv.push(0, t, 1, t);
    if (i < segs) { const v = i * 2; idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

// Head frame: centre at the origin, face toward +x, the explorer's right toward +z.
const SKULL = { r: 0.165, sx: 0.95, sz: 1.05 };
const HAIR = { r: 0.186, c: V(-0.012, 0.012, 0), s: V(0.98, 1.03, 1.06) };
const GOGGLES = { a: 0.44, e: 0.52 }; // resting on the forehead, just above the fringe
// The curl's springiness toward its rest shape (straight up). Weak enough
// that the field shows on it: it droops forward under normal gravity and stands up in a region.
const CURL = { lean: 0, k: 0.05 };
// Direction at azimuth a (0 = face, +π/2 = right) and elevation e.
const dirAE = (a, e) => V(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
const downAE = (a, e) => V(Math.sin(e) * Math.cos(a), -Math.cos(e), Math.sin(e) * Math.sin(a)); // tangent, down the meridian
const smooth01 = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
const tri = u => 1 - Math.abs(2 * (u - Math.floor(u)) - 1); // 0 at integers, 1 halfway
// Fringe locks: [azimuth, half width, depth (× π)]. The +z side is the explorer's right.
const FRINGE = [[-0.98, 0.2, 0.05], [-0.62, 0.26, 0.085], [-0.1, 0.2, 0.165], [0.26, 0.2, 0.07], [0.62, 0.3, 0.095], [0.98, 0.16, 0.05]];
// Flicks: azimuths where the ends of the hair kick out of the outline.
const FLICKS = [[1.75, 0.22], [2.35, 0.2], [2.9, 0.18], [-1.8, 0.2], [-2.45, 0.22], [-3.0, 0.16], [0.95, 0.16], [-1.05, 0.18]];
/** Polar angle (from the crown) where the hair ends, by azimuth: high on the forehead with five
 *  points of fringe, a sideburn in front of each ear, above the ears, low and ragged at the nape. */
function hairline(a) {
  const A = Math.abs(a), P = Math.PI;
  // Locks: pointed tips and rounded gaps (tri^1.6), each a little different.
  const lockAt = (u, amps) => amps[Math.min(amps.length - 1, Math.floor(u))] * tri(u) ** 1.6;
  if (A < 1.1) { // the fringe: uneven locks, the longest one between the eyes, a little off centre
    let d = 0;
    for (const [c, hw, depth] of FRINGE) d = Math.max(d, depth * Math.max(0, 1 - Math.abs(a - c) / hw) ** 1.5);
    return 0.36 * P + d * P;
  }
  let t = A < 1.75 ? THREE.MathUtils.lerp(0.36 * P, 0.47 * P, smooth01((A - 1.1) / 0.65)) : THREE.MathUtils.lerp(0.47 * P, 0.65 * P, smooth01((A - 1.75) / 0.9));
  t += 0.13 * P * Math.max(0, 1 - Math.abs(A - 1.32) / 0.24); // sideburn, wide enough not to vanish into its outline
  if (A > 1.75) t += 0.09 * P * lockAt((A - 1.75) / (P - 1.75) * 3.5, a > 0 ? [0.8, 1.1, 0.7, 1.0] : [1.0, 0.75, 1.1, 0.9]);
  return t;
}
/** Radius of the hair surface (× HAIR.r) at azimuth a and polar angle th. */
function hairR(a, th) {
  const A = Math.abs(a), rim = smooth01((th - (hairline(a) - 0.7)) / 0.7), front = 1 - smooth01((A - 0.9) / 0.5);
  const L = 0.5 + 0.5 * Math.sin(6 * a + 4 * th + 0.3) * Math.cos(5 * a - 3 * th + 0.7); // clumps
  const crown = 1 - smooth01((th - 0.3) / 0.6); // the top of the head
  let r = 1.02 + 0.02 * L + (0.12 + 0.06 * crown) * L ** 3;
  let flick = 0; for (const [c, hw] of FLICKS) flick = Math.max(flick, Math.max(0, 1 - Math.abs(a - c) / hw));
  r += rim * ((0.06 + 0.14 * flick ** 1.5) * (1 - front) - 0.04 * front); // the ends kick out, except over the face
  r += 0.08 * Math.exp(-(((A - 1.95) / 0.55) ** 2)) * Math.exp(-(((th - 1.45) / 0.45) ** 2));
  return r;
}
function hairPoint(a, e, extra = 0) {
  const th = Math.min(Math.PI / 2 - e, hairline(a)), d = dirAE(a, Math.PI / 2 - th), r = HAIR.r * (hairR(a, th) + extra);
  return V(d.x * HAIR.s.x * r, d.y * HAIR.s.y * r, d.z * HAIR.s.z * r).add(HAIR.c);
}
function hairGeo() {
  const g = new THREE.SphereGeometry(1, 80, 44, 0, Math.PI * 2, 0, Math.PI * 0.84), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
    const th = Math.min(Math.acos(THREE.MathUtils.clamp(y, -1, 1)), hairline(a)); // below the hairline the rows fold onto it
    const q = hairPoint(a, Math.PI / 2 - th);
    p.setXYZ(i, q.x, q.y, q.z);
  }
  g.computeVertexNormals(); return g;
}
/** The goggles' strap: a band laid on the hair, through the cups at the front and down around
 *  the back of the head. */
function gogglesStrap() {
  const pos = [], idx = [], uv = [], n = 72;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI + 2 * Math.PI * i / n, eMin = Math.PI / 2 - hairline(a) + 0.04;
    const e = Math.max(GOGGLES.e * (0.5 + 0.5 * Math.cos(a)), eMin + 0.06);
    for (const de of [0.06, -0.06]) pos.push(...hairPoint(a, e + de, 0.025).toArray());
    uv.push(0, i / n, 1, i / n);
    if (i < n) { const v = i * 2; idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
/** A blush patch laid on the skin around (y, z), so it never stands off the far cheek. */
function onCheek(yc, zc, r) {
  const g = new THREE.CircleGeometry(r, 16), p = g.attributes.position;
  // z = zc − x′ keeps the winding facing out of the head (z = zc + x′ faced in and was culled)
  for (let i = 0; i < p.count; i++) { const y = yc + p.getY(i), z = zc - p.getX(i); p.setXYZ(i, onSkin(y, z).x + 0.0015, y, z); }
  g.computeVertexNormals(); return g;
}
/** A point on the skin with the azimuth that faces its surface normal. */
function onSkin(y, z) {
  const x = SKULL.sx * Math.sqrt(Math.max(0, SKULL.r ** 2 - y * y - (z / SKULL.sz) ** 2));
  return { x, yaw: Math.atan2(z / SKULL.sz ** 2, x / SKULL.sx ** 2) };
}

// Body silhouette (height above the feet → coat radius), shared by the coat and the collision of
// the scarf tails against it.
const COAT_UP = [[0.152, 0.50], [0.157, 0.56], [0.153, 0.62], [0.138, 0.67], [0.105, 0.705], [0.06, 0.725], [0.0, 0.73]];
const COAT_SKIRT = [[0.196, 0.265], [0.192, 0.285], [0.178, 0.36], [0.164, 0.45], [0.154, 0.53]];
const COAT_X = 0.86; // the body is narrower front to back than side to side
const HEAD_Y = 0.865;
function bodyRadius(h) {
  if (h < 0.26) return 0;
  if (h > 0.73) { const d = h - HEAD_Y; return d * d < 0.2 * 0.2 ? Math.sqrt(0.2 * 0.2 - d * d) : 0; }
  const prof = [...COAT_SKIRT.slice(0, 4), ...COAT_UP.slice(1)].map(([r, y]) => [y, r]);
  for (let i = 0; i < prof.length - 1; i++) if (h <= prof[i + 1][0]) {
    const [y0, r0] = prof[i], [y1, r1] = prof[i + 1], t = (h - y0) / (y1 - y0);
    return r0 + (r1 - r0) * t;
  }
  return 0.06;
}

export class Explorer {
  constructor(field) {
    this.field = field;
    this.root = new THREE.Group();
    this.body = new THREE.Group(); this.root.add(this.body);
    const m = {
      coat: mat(C.coat, { side: THREE.DoubleSide }), cuff: mat(C.cuff), skin: mat(C.skin, { roughness: 0.6 }), hair: (() => { const map = hairTexture(); return mat(map ? '#ffffff' : C.hair, { roughness: 0.8, map }); })(),
      trousers: mat(C.trousers, { roughness: 0.9 }), boots: mat(C.boots, { roughness: 0.55 }), bootsDark: mat(C.bootsDark, { roughness: 0.6 }),
      brass: mat(C.brass, { metalness: 0.35, roughness: 0.38 }), leather: mat(C.leather, { roughness: 0.6 }), leatherDark: mat(C.leatherDark, { roughness: 0.65, side: THREE.DoubleSide }),
      iris: new THREE.MeshBasicMaterial({ color: C.iris }), white: new THREE.MeshBasicMaterial({ color: '#fffaf0' }),
      glass: mat(C.glass, { roughness: 0.38, metalness: 0.05 }), glint: new THREE.MeshBasicMaterial({ color: '#fff3dc', transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }),
      enamel: mat(C.enamel, { roughness: 0.4 }), glow: new THREE.MeshBasicMaterial({ color: C.glow }),
      blush: new THREE.MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.5, depthWrite: false }),
      scarf: new THREE.MeshStandardMaterial({ color: C.scarf, roughness: 0.85, side: THREE.DoubleSide }),
    };
    this.m = m;
    const add = (parent, geo, material, ink = 0) => {
      const mesh = new THREE.Mesh(geo, material); parent.add(mesh); if (ink) outline(mesh, ink); return mesh;
    };

    // ---- legs: baggy cream trousers tucked into big boots; they pivot at the hips ----
    const trouserProf = [[0.0, -0.215], [0.062, -0.21], [0.083, -0.165], [0.088, -0.1], [0.075, -0.02], [0.06, 0.02], [0.0, 0.03]].map(([r, y]) => new THREE.Vector2(r, y));
    this.legs = [-1, 1].map(s => {
      const hip = new THREE.Group(); hip.position.set(0, 0.36, s * 0.085);
      add(hip, new THREE.LatheGeometry(trouserProf, 14), m.trousers, 0.006);
      const knee = new THREE.Group(); knee.position.y = -0.2; hip.add(knee);
      add(knee, merge([
        bake(new THREE.CylinderGeometry(0.062, 0.056, 0.14, 14), { p: [0, -0.065, 0] }),
        bake(new THREE.SphereGeometry(0.056, 14, 10), { s: [1.5, 0.72, 1.0], p: [0.03, -0.122, 0] }),
      ]), m.boots, 0.006);
      add(knee, bake(new THREE.TorusGeometry(0.062, 0.013, 8, 16), { r: [Math.PI / 2, 0, 0], p: [0, 0.002, 0] }), m.bootsDark);
      add(knee, merge([ // sole and heel
        bake(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 16), { s: [1.45, 1, 1.0], p: [0.03, -0.152, 0] }),
        bake(new THREE.BoxGeometry(0.05, 0.028, 0.085), { p: [-0.032, -0.146, 0] }),
      ]), m.bootsDark);
      add(knee, bake(new THREE.TorusGeometry(0.058, 0.0055, 6, 16), { r: [Math.PI / 2, 0, 0], p: [0, -0.062, 0] }), m.leatherDark);
      add(knee, bake(new THREE.BoxGeometry(0.02, 0.022, 0.008), { p: [0, -0.062, s * 0.062] }), m.brass);
      this.body.add(hip); return { hip, knee };
    });

    // ---- coat: closed above the belt, open in an inverted V below it ----
    const up = new THREE.LatheGeometry(COAT_UP.map(([r, y]) => new THREE.Vector2(r, y)), 26);
    const skirt = new THREE.LatheGeometry(COAT_SKIRT.map(([r, y]) => new THREE.Vector2(r, y)), 26, Math.PI / 2 + 0.05, Math.PI * 2 - 0.1);
    { // widen the front opening toward the hem: remap each vertex's angle from the front
      const p = skirt.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z);
        let a = Math.atan2(x, z) - Math.PI / 2; a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); // 0 = front
        const g0 = 0.05, g = THREE.MathUtils.lerp(0.05, 0.42, THREE.MathUtils.clamp((0.53 - y) / 0.265, 0, 1));
        const a2 = g + (a - g0) * (2 * Math.PI - 2 * g) / (2 * Math.PI - 2 * g0) + Math.PI / 2;
        p.setXYZ(i, r * Math.sin(a2), y, r * Math.cos(a2));
      }
      skirt.computeVertexNormals();
    }
    // No standing collar: the head sits on the scarf with no neck (it reads better at play
    // scale), so any collar above the scarf covers the jaw from the front and the side.
    const coatGeo = merge([bake(up, { s: [COAT_X, 1, 1] }), bake(skirt, { s: [COAT_X, 1, 1] })]);
    add(this.body, coatGeo, m.coat, 0.007);
    // The belt sits at the body's centre of mass (0.55 m): its brass buckle is the explorer's
    // reference point, the same one the chain's numbers and the chalk marks use.
    add(this.body, bake(new THREE.CylinderGeometry(0.163, 0.161, 0.042, 28, 1, true), { s: [COAT_X, 1, 1], p: [0, 0.55, 0] }), m.leatherDark);
    const brassBody = [
      bake(new THREE.TorusGeometry(0.027, 0.0068, 4, 4), { r: [0, Math.PI / 2, Math.PI / 4], p: [0.143, 0.55, 0] }),
      bake(new THREE.BoxGeometry(0.006, 0.006, 0.03), { p: [0.145, 0.55, 0.004] }),
      ...[0.6, 0.645].map(y => bake(new THREE.SphereGeometry(0.014, 10, 8), { s: [0.5, 1, 1], p: [bodyRadius(y) * COAT_X + 0.002, y, 0] })),
      bake(new THREE.SphereGeometry(0.014, 10, 8), { s: [0.5, 1, 1], p: [0.134, 0.5, -0.04] }),
    ];
    // Satchel with the Bitácora on the right hip; its strap crosses the chest to the left shoulder.
    const sat = { p: [0.08, 0.37, 0.2], r: [0, 0.6, 0] };
    add(this.body, bake(new RoundedBoxGeometry(0.15, 0.13, 0.065, 2, 0.022), sat), m.leather, 0.006);
    add(this.body, bake(bake(new RoundedBoxGeometry(0.156, 0.068, 0.072, 2, 0.02), { p: [0, 0.034, 0.004] }), sat), m.leatherDark);
    brassBody.push(bake(bake(new THREE.BoxGeometry(0.024, 0.03, 0.01), { p: [0, 0.006, 0.041] }), sat));
    const strap = new THREE.CatmullRomCurve3([
      V(0.115, 0.43, 0.165), V(0.15, 0.5, 0.1), V(0.142, 0.58, 0.035), V(0.118, 0.655, -0.07), V(0.05, 0.708, -0.13),
      V(-0.05, 0.708, -0.13), V(-0.118, 0.655, -0.07), V(-0.142, 0.58, 0.04), V(-0.12, 0.5, 0.14), V(-0.02, 0.43, 0.215)]);
    add(this.body, bandAlong(strap, 0.024, 70), m.leatherDark);
    add(this.body, merge(brassBody), m.brass);

    // ---- scarf: a thick wrap with a fold hanging in front; the two tails are chains ----
    add(this.body, merge([
      bake(new THREE.TorusGeometry(0.1, 0.05, 10, 22), { r: [Math.PI / 2, 0, 0], s: [0.92, 1, 1], p: [0, 0.715, 0] }),
      bake(bake(new THREE.TorusGeometry(0.088, 0.036, 10, 20), { r: [Math.PI / 2, 0, 0] }), { r: [0, 0, 0.12], p: [0, 0.752, 0] }),
      bake(new THREE.CapsuleGeometry(0.03, 0.085, 4, 8), { s: [0.42, 1, 1.35], r: [0.08, 0, 0.12], p: [0.118, 0.64, -0.058] }),
    ]), m.scarf, 0.006);

    // ---- head ----
    this.neck = new THREE.Group(); this.neck.position.y = 0.70; this.body.add(this.neck);
    this.head = new THREE.Group(); this.head.position.y = HEAD_Y - 0.70; this.neck.add(this.head);
    add(this.head, merge([
      bake(new THREE.SphereGeometry(SKULL.r, 28, 20), { s: [SKULL.sx, 1, SKULL.sz] }),
      ...[-1, 1].map(s => bake(new THREE.SphereGeometry(0.034, 12, 10), { s: [0.55, 1, 0.45], p: [-0.005, -0.03, s * 0.172] })),
    ]), m.skin, 0.007);
    add(this.head, bake(new THREE.SphereGeometry(0.0085, 8, 6), { p: [onSkin(-0.04, 0).x - 0.003, -0.04, 0] }), m.skin);
    // Hair: one mass with one outline. Its rim is cut into points (the fringe under the
    // goggles, a sideburn in front of each ear, a ragged nape) and its surface is lumpy and
    // flares over the ears, so the outline is messy without inked locks reading as scales.
    add(this.head, hairGeo(), m.hair, 0.007);
    // Goggles resting on the hair: brass cups with dark glass, a bridge, and a leather strap
    // that runs down around the back of the head, laid on the same hair surface.
    const gBrass = [], gGlass = [], gGlint = [];
    for (const s of [-1, 1]) {
      const a = s * GOGGLES.a, e = GOGGLES.e, p = hairPoint(a, e, -0.015), d = dirAE(a, e).add(V(0.15, 0.1, 0)).normalize();
      gBrass.push(place(bake(new THREE.CylinderGeometry(0.058, 0.064, 0.042, 22), { p: [0, 0.021, 0] }), d, p));
      gBrass.push(place(bake(new THREE.TorusGeometry(0.06, 0.013, 8, 24), { r: [Math.PI / 2, 0, 0], p: [0, 0.042, 0] }), d, p));
      gGlass.push(place(bake(new THREE.SphereGeometry(0.057, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.32), { s: [1, 0.55, 1], p: [0, 0.0232, 0] }), d, p));
      // a soft band of reflection across the upper glass (a dot would make them read as eyes)
      gGlint.push(place(bake(new THREE.RingGeometry(0.016, 0.026, 16, 1, Math.PI * 0.15, Math.PI * 0.5), { r: [-Math.PI / 2, 0, 0], p: [0, 0.053, 0] }), d, p));
    }
    gBrass.push(bake(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 8), { r: [Math.PI / 2, 0, 0], p: hairPoint(0, GOGGLES.e, 0.035).toArray() }));
    add(this.head, merge(gBrass), m.brass, 0.005);
    add(this.head, merge(gGlass), m.glass);
    add(this.head, merge(gGlint), m.glint).userData.noShadow = true;
    add(this.head, gogglesStrap(), m.leatherDark);
    // Face: big brown eyes with two highlights, a small smile (an «o» when surprised), blush.
    this.eyes = []; this.glints = [];
    for (const s of [-1, 1]) {
      const y = -0.012, z = s * 0.056, sk = onSkin(y, z);
      const e = add(this.head, new THREE.SphereGeometry(0.03, 16, 12), m.iris);
      e.position.set(sk.x - 0.006, y, z); e.rotation.y = -sk.yaw; e.scale.set(0.42, 1.35, 1);
      this.eyes.push(e);
      for (const [r, dy, dz] of [[0.009, 0.017, s * 0.006], [0.0045, -0.016, -s * 0.007]]) {
        const g = add(this.head, new THREE.SphereGeometry(r, 8, 6), m.white); g.position.set(sk.x + 0.004, y + dy, z + dz); g.userData.noShadow = true; this.glints.push(g);
      }
      add(this.head, onCheek(-0.05, s * 0.084, 0.022), m.blush).userData.noShadow = true;
    }
    this.mouth = new THREE.Group(); this.mouth.position.set(onSkin(-0.072, 0).x + 0.002, -0.058, 0); this.mouth.rotation.y = Math.PI / 2; this.head.add(this.mouth);
    this.smile = add(this.mouth, bake(new THREE.TorusGeometry(0.02, 0.005, 6, 14, Math.PI * 0.75), { r: [0, 0, -Math.PI * 0.875] }), m.iris);
    this.oMouth = add(this.mouth, bake(new THREE.TorusGeometry(0.015, 0.0055, 6, 14), { p: [0, -0.014, 0] }), m.iris);
    this.oMouth.visible = false;

    // ---- arms: rolled sleeves, mitten hands; the left wrist carries the instrument ----
    this.arms = [-1, 1].map(s => {
      const sh = new THREE.Group(); sh.position.set(0, 0.675, s * 0.165);
      add(sh, bake(new THREE.CapsuleGeometry(0.044, 0.11, 4, 10), { p: [0, -0.085, 0] }), m.coat, 0.006);
      add(sh, bake(new THREE.CylinderGeometry(0.054, 0.05, 0.05, 14), { p: [0, -0.15, 0] }), m.cuff, 0.006);
      add(sh, bake(new THREE.SphereGeometry(0.04, 12, 10), { s: [0.85, 1.1, 0.75], p: [0, -0.222, 0] }), m.skin, 0.005);
      if (s < 0) { // wrist instrument: the Instituto's clock, a brass bezel around a glowing dial
        add(sh, bake(new THREE.CylinderGeometry(0.047, 0.047, 0.018, 14, 1, true), { p: [0, -0.19, 0] }), m.leatherDark);
        const dev = new THREE.Group(); dev.position.y = -0.19; dev.rotation.y = -0.95; sh.add(dev); // on the outside of the wrist, turned toward the front
        add(dev, bake(new THREE.TorusGeometry(0.036, 0.009, 8, 20), { p: [0, 0, -0.047] }), m.brass, 0.004);
        add(dev, bake(new THREE.CircleGeometry(0.036, 20), { r: [0, Math.PI, 0], p: [0, 0, -0.049] }), m.enamel);
        this.device = add(dev, bake(new THREE.RingGeometry(0.014, 0.024, 20), { r: [0, Math.PI, 0], p: [0, 0, -0.051] }), m.glow);
        this.device.material = m.glow.clone();
      }
      this.body.add(sh); return sh;
    });

    // ---- chains in the field: two scarf tails from the back of the neck, the curl on top ----
    // Both tails fall behind the right shoulder, as on the sheet, one longer than the other: at
    // three-quarter facing right they show past the body, and in a region they rise beside the
    // head's outline rather than straight behind it.
    const tailMat = new THREE.MeshStandardMaterial({ map: scarfTexture(), color: scarfTexture.ok ? '#ffffff' : C.scarf, roughness: 0.85, side: THREE.DoubleSide, alphaTest: 0.5 });
    this.tails = [[0.13, 11], [0.06, 9]].map(([z, n]) => {
      const geo = new THREE.BufferGeometry(), pos = new Float32Array((n + 1) * 2 * 3), uv = [], idx = [];
      for (let i = 0; i <= n; i++) uv.push(0, i / n, 1, i / n);
      for (let i = 0; i < n; i++) { const v = i * 2; idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, tailMat); mesh.frustumCulled = false;
      return { anchor: V(-0.06, 0.725, z), c: { n, len: 0.047, pts: [] }, geo, pos, mesh };
    });
    this.tuft = { n: 2, len: 0.07, pts: [] };
    this.tuftMesh = new THREE.Mesh(curlGeo(), m.hair);

    this.state = { yaw: -0.6, walk: 0, squash: 0, surprise: 0, land: 0, blink: 0, nextBlink: 2, poseT: 0, dustT: 0, sweatT: 0,
      land: 0, landHold: 0, release: 0,
      j: { hip: [0, 0], knee: [0, 0], arm: [0.05, 0.05], out: [0.13, 0.13], lean: 0, look: 0, drop: 0, turn: 0 } };
    this.poseState = 'de-pie'; this.poseLog = {};
    // Water: every material of the explorer is clipped by one plane (inactive out of the water).
    this.clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6);
    const clipped = new Set();
    this.root.traverse(o => { if (o.isMesh) for (const m of [].concat(o.material)) clipped.add(m); });
    for (const t of this.tails) clipped.add(t.mesh.material);
    for (const m of clipped) m.clippingPlanes = [this.clip];
    this.ring = new THREE.Mesh(bake(new THREE.RingGeometry(0.2, 0.26, 32), { r: [-Math.PI / 2, 0, 0] }),
      new THREE.MeshBasicMaterial({ color: '#eafcff', transparent: true, opacity: 0.55, depthWrite: false }));
    this.ring.visible = false; this.ring.renderOrder = 5;
    this.fx = new ExplorerFX(field);
    this._a = { x: 0, y: 0 };
  }

  addTo(scene) {
    scene.add(this.root, this.tuftMesh, ...this.tails.map(t => t.mesh), this.fx.group, this.ring);
    for (const o of [this.root, this.tuftMesh, ...this.tails.map(t => t.mesh)]) o.traverse(q => { if (q.isMesh) q.castShadow = !q.userData.ink && !q.userData.noShadow; });
  }

  onEvent(e, avatarId) {
    if (e.body !== avatarId) return;
    const st = this.state;
    if (e.type === 'enter') { st.surprise = 1; this.fx.startle(this.head.localToWorld(V(0, 0.26, 0))); }
    if (e.type === 'letgo') st.release = 1;
    if (e.type === 'mantle' || e.type === 'step-up') st.squash = 0.12;
    if (e.type === 'impact' && e.speed > 1.0) {
      st.squash = Math.min(0.28, e.speed * 0.05);
      // A landing is a contact whose normal opposes the local field (a floor for that field);
      // bumping a wall only squashes.
      const g = this.field.at(e.x, e.y, { x: 0, y: 0 }), gl = Math.hypot(g.x, g.y) || 1;
      if (-((e.nx ?? 0) * g.x + (e.ny ?? 0) * g.y) / gl > 0.6) {
        st.land = Math.max(0.5, Math.min(1, e.speed / 4)); st.landHold = 0.15; // a crouch that soaks the landing
        this.fx.dust(this.root.position.x, this.root.position.y, 4, 0.25 + e.speed * 0.1);
      }
    }
  }

  /** The pose the body should tell, read from the simulated state (never the other way round). */
  classify(s, ctx, gUp) {
    const air = !s.grounded, speed = Math.hypot(s.vx, s.vz ?? 0), c = s.control ?? 0;
    if (ctx.onChain) return gUp && ctx.inputY < -0.2 ? 'cadena-esfuerzo' : 'cadena';
    if (ctx.mantling) return 'trepar';
    if (ctx.inWater) return 'agua';
    if (ctx.holding) return 'cargar';
    if (ctx.pushing) return 'empujar';
    if (!air) {
      if (c * s.vx < 0 && Math.abs(c) > 6 && (speed > 0.9 || (this.poseState === 'frenar' && speed > 0.3))) return 'frenar';
      return speed > 0.25 ? 'caminar' : 'de-pie';
    }
    if (gUp) return 'suspendido';
    return s.vy < -1.2 ? 'caer' : 'en-el-aire';
  }

  /** p: interpolated position (centre of the sim box); s: sim avatar state. */
  update(dt, time, p, s, ctx) {
    const st = this.state, feetY = p.y - s.hh;
    this.root.position.set(p.x, feetY, p.z ?? 0);
    // The field where the body is: read here, because the simulation does not refresh the body's
    // own field while something holds it (the chain).
    const g = this.field.at(p.x, p.y, { x: 0, y: 0 }), gUp = g.y > 0.8;
    // Facing: three-quarter toward the camera. rotation.y = θ sends the face (+x local) to
    // (cos θ, 0, −sin θ): θ = −0.6 looks right and a little toward the camera (+z);
    // θ = −(π − 0.6) looks left the same way. Turning passes through facing the camera.
    const pose = this.classify(s, ctx, gUp);
    // While the feet skid the body keeps facing the way it is still moving, and turns after.
    const face = pose === 'frenar' ? Math.sign(s.vx) : s.facing;
    // In depth the explorer faces where it walks (away from the camera, toward it, sideways).
    const inDepth = (p.z ?? 0) < -0.05, sp2 = Math.hypot(s.vx, s.vz ?? 0);
    if (inDepth && sp2 > 0.3) st.depthYaw = Math.atan2(-(s.vz ?? 0), s.vx);
    // Carrying or pushing, the body turns toward profile: the sphere is straight ahead in the
    // simulation, and at three-quarters it would sit off to one side of the hands.
    // On the chain, the same, so the grip shows in front of the body. Suspended in a region, the
    // body turns toward the camera: the trailing V of the arms then lies in the picture plane.
    const turn = pose === 'cargar' || pose === 'empujar' || pose.startsWith('cadena') ? 0.25 : pose === 'suspendido' ? 1.15 : 0.6;
    let yawT = face > 0 ? -turn : -(Math.PI - turn);
    if (inDepth && st.depthYaw !== undefined) {
      yawT = st.depthYaw; // the shortest way round from the current yaw
      while (yawT - st.yaw > Math.PI) yawT -= 2 * Math.PI;
      while (yawT - st.yaw < -Math.PI) yawT += 2 * Math.PI;
    }
    st.yaw += (yawT - st.yaw) * Math.min(1, dt * 10);
    if (this.yawOverride != null) { st.yaw = this.yawOverride; st.nextBlink = 1; st.blink = 0; } // development turnaround only
    this.body.rotation.y = st.yaw;

    if (pose !== this.poseState) { this.poseState = pose; st.poseT = 0; } else st.poseT += dt;
    this.poseOverlay = (st.surprise > 0.15 ? ' +sobresalto' : '') + (st.land > 0.15 ? ' +aterrizaje' : '');
    this.poseLog[pose] = (this.poseLog[pose] || 0) + dt;
    const speed = Math.hypot(s.vx, s.vz ?? 0), air = !s.grounded;
    if (!air) st.walk += speed * dt * 5.4;
    const stride = air ? 0 : Math.min(1, speed / 2.6), sw = Math.sin(st.walk);
    st.squash *= Math.exp(-dt * 9);
    st.surprise = Math.max(0, st.surprise - dt * 1.25);
    if ((st.landHold -= dt) <= 0) st.land = Math.max(0, st.land - dt * 4);
    st.release = Math.max(0, st.release - dt * 2);

    // Targets per pose: hip (+ swings the leg forward), knee (− bends it), arm (0 hanging,
    // π/2 forward, π overhead), out (splay), lean (+ toward the face), look (+ up), drop (m).
    const T = { hip: [0, 0], knee: [0, 0], arm: [0.05, 0.05], out: [0.13, 0.13], lean: 0, look: ctx.lookAt ?? 0, drop: 0, k: 10 };
    const legsWalk = (amp = 1) => { for (const i of [0, 1]) { const ph = i ? sw : -sw; T.hip[i] = ph * 0.65 * stride * amp; T.knee[i] = -Math.max(0, -ph) * 0.7 * stride * amp; } };
    const armsSwing = () => { for (const i of [0, 1]) T.arm[i] = (i ? -sw : sw) * 0.55 * stride; };
    const both = (key, f) => { T[key][0] = f(0); T[key][1] = f(1); };
    const fx = this.fx;
    switch (pose) {
      case 'caminar': legsWalk(); armsSwing(); T.lean = 0.07 * stride; break;
      case 'frenar': // the feet skid: leaning back, the front leg braced, arms out for balance
        T.lean = -0.32; T.hip = [0.55, -0.25]; T.knee = [-0.05, -0.7]; both('arm', () => 0.95); both('out', () => 0.7); T.look = -0.08; T.k = 14;
        if ((st.dustT -= dt) < 0) { st.dustT = 0.07; fx.dust(p.x + Math.sign(s.vx) * 0.14, feetY, 1, 0.5); }
        break;
      case 'empujar': // effort: crouched behind the hands, which press on the sphere's upper back
        legsWalk(0.6); T.hip[0] -= 0.2; T.hip[1] -= 0.2; both('arm', () => 0.2); both('out', () => -0.05); T.lean = 0.4; T.drop = -0.08; T.look = -0.05; T.k = 16; break;
      case 'cargar': // the hands round the sphere; a shorter stride, knees a little bent under the weight
        legsWalk(0.6); both('arm', () => 1.5); both('out', () => -0.05); T.lean = 0.1; T.drop = -0.025; break;
      case 'agua': // treading water: arms sculling at the sides, slow kicks
        // The water is not footing: drawn sunk to the chest and cut at the surface (the simulated
        // box rests on the surface), knees tucked, arms sculling at the waterline.
        both('arm', i => 1.45 + 0.35 * Math.sin(time * 5 + i * Math.PI)); both('out', () => 0.9);
        both('hip', i => 0.6 + 0.25 * Math.sin(time * 4 + i * Math.PI)); both('knee', () => -1.3); T.look = 0.15; T.drop = -0.32 + 0.025 * Math.sin(time * 3); break;
      case 'cadena': case 'cadena-esfuerzo': {
        const effort = pose === 'cadena-esfuerzo', climb = ctx.climbing ? Math.sin(time * (effort ? 11 : 9)) * 0.3 : 0;
        if (gUp) { // pulled upward the body hangs above its grip: arms reach down to the chain,
          // legs float up; pulling down against it, hand over hand, the legs kick and the body heaves
          T.arm = [0.75 + climb, 0.75 - climb]; both('out', () => 0.05);
          both('hip', i => 0.8 + (effort ? 0.35 * Math.sin(time * 9 + i * Math.PI) : 0)); both('knee', () => effort ? -1.0 : -1.15);
          T.lean = 0.12; T.look = 0.05; T.drop = effort ? 0.06 * Math.sin(time * 9) : 0;
        } else { // the familiar way: hands above the head, the body hangs below them
          T.arm = [2.85 + climb, 2.85 - climb]; both('out', () => 0.22);
          both('hip', i => 0.12 + 0.05 * i); both('knee', () => -0.25); T.lean = 0.1; T.look = 0.1;
        }
        if (effort && (st.sweatT -= dt) < 0) { st.sweatT = 0.35; fx.drop(this.head.localToWorld(V(-0.05, 0.14, 0.12))); }
        break;
      }
      case 'trepar': both('arm', () => 2.4); both('out', () => 0.3); both('hip', () => 0.9); both('knee', () => -1.4); T.lean = 0.35; T.k = 16; break;
      case 'caer': // falling in the familiar field: arms trailing up and flailing wide (clear of the
        // face), legs bicycling, a glance down
        both('arm', i => 2.4 + 0.4 * Math.sin(time * 11 + i * 2)); both('out', () => 0.95);
        both('hip', i => 0.4 + 0.5 * Math.sin(time * 10 + i * Math.PI)); both('knee', () => -0.9); T.lean = -0.05; T.look = -0.15; break;
      case 'en-el-aire':
        both('arm', () => 2.1); both('out', () => 0.45); T.hip = [0.3, 0.1]; T.knee = [-0.5, -0.3];
        T.look = Math.atan2(s.vy, Math.max(0.5, speed)) * 0.35; break;
      case 'suspendido': { // falling upward: the mirror of 'caer'. Limbs trail the motion: rising,
        // the arms trail down and wide and the legs pull up; sinking (slowing), the arms trail up.
        const up = THREE.MathUtils.clamp(s.vy / 1.5, -1, 1), rise = (up + 1) / 2;
        both('arm', i => THREE.MathUtils.lerp(2.3, 0.6, rise) + 0.3 * Math.sin(time * 9 + i * 2)); both('out', () => THREE.MathUtils.lerp(0.8, 1.15, rise));
        both('hip', i => THREE.MathUtils.lerp(-0.1, 0.9, rise) + 0.25 * Math.sin(time * 6 + i * Math.PI)); both('knee', () => THREE.MathUtils.lerp(-0.3, -1.45, rise));
        T.lean = 0; T.look = 0.2 * up; T.k = 7; break;
      }
      default: break; // 'de-pie'
    }
    // Transients on top: the startle on entering a region, the crouch that soaks a landing.
    const sp = st.surprise ** 0.7;
    both('arm', i => T.arm[i] + 0.6 * sp); both('out', i => T.out[i] + 0.9 * sp);
    if (st.release > 0) { const r = Math.min(1, st.release * 1.4); both('arm', i => T.arm[i] * (1 - r) + 1.7 * r); both('out', i => T.out[i] + 1.35 * r); }
    T.look = THREE.MathUtils.clamp(T.look, -0.2, 0.22); // the face stays readable
    if (st.land > 0) { both('hip', i => T.hip[i] + 0.8 * st.land); both('knee', i => T.knee[i] - 1.3 * st.land); both('out', i => T.out[i] + 0.5 * st.land); T.drop -= 0.075 * st.land; }

    const J = st.j, k = Math.min(1, dt * T.k), kf = Math.min(1, dt * 16);
    for (const key of ['hip', 'knee', 'arm', 'out']) for (const i of [0, 1]) J[key][i] += (T[key][i] - J[key][i]) * (key === 'hip' || key === 'knee' ? (stride > 0.05 ? kf : k) : k);
    J.lean += (T.lean - J.lean) * k; J.look += (T.look - J.look) * Math.min(1, dt * 6); J.drop += (T.drop - J.drop) * kf;
    // In alarm (the startle, falling) the head turns toward the camera so the face can be read.
    const alarmT = Math.max(st.surprise, pose === 'caer' ? 0.7 : 0);
    J.turn += ((-Math.PI / 2 - st.yaw) * 0.6 * alarmT - J.turn) * Math.min(1, dt * 10);

    const bob = Math.abs(Math.cos(st.walk)) * 0.035 * stride, breathe = Math.sin(time * 2.1) * 0.008;
    this.body.position.y = bob + breathe * (1 - stride) + J.drop;
    // The startle: a quick squash, then a stretch that settles.
    const pop = st.surprise > 0.88 ? -0.1 : 0.15 * (st.surprise / 0.88) ** 0.7;
    this.body.scale.set(1 + st.squash * 0.6 - pop * 0.4, 1 - st.squash + pop, 1 + st.squash * 0.6 - pop * 0.4);
    // Euler XYZ applies z in the body's own frame, whose forward is +x: lean toward the face.
    this.body.rotation.z = -J.lean;
    this.legs.forEach((l, i) => { l.hip.rotation.z = J.hip[i]; l.knee.rotation.z = J.knee[i]; });
    this.arms.forEach((a, i) => {
      const side = i ? 1 : -1, F = J.arm[i], o = J.out[i];
      // Splay outward whatever the arm's swing: about x when it hangs or is raised, about y
      // when it points forward.
      a.rotation.set(-side * o * Math.cos(F), -side * o * Math.sin(F) * 0.8, F);
    });
    this.head.rotation.set(0, J.turn, J.look);
    st.nextBlink -= dt;
    if (st.nextBlink < 0) { st.blink = 0.14; st.nextBlink = 2.5 + Math.random() * 3; }
    st.blink = Math.max(0, st.blink - dt);
    const alarm = Math.max(st.surprise, pose === 'caer' ? 0.6 : 0, pose === 'cadena-esfuerzo' ? 0.3 : 0);
    const eyeY = st.blink > 0 ? 0.12 : 1.35 + alarm * 0.4;
    for (const e of this.eyes) e.scale.set(0.42, eyeY, 1 + alarm * 0.25);
    for (const gl of this.glints) gl.visible = st.blink <= 0;
    this.smile.visible = alarm < 0.25; this.oMouth.visible = !this.smile.visible;
    this.oMouth.scale.setScalar(0.7 + alarm * 0.8);
    if (this.device) this.device.material.color.setHSL(0.47, 0.8, 0.55 + 0.2 * Math.sin(time * 3));

    // In the water the body is cut at the surface (the simulated feet rest on it), with a ring.
    const inWater = pose === 'agua';
    this.clip.constant = inWater ? -(feetY - 0.005) : 1e6;
    this.ring.visible = inWater;
    if (inWater) { this.ring.position.set(p.x, feetY + 0.004, 0); const r = 1 + 0.08 * Math.sin(time * 3); this.ring.scale.set(r, r, r); }

    this.updateChains(dt, feetY, g);
    fx.update(dt);
  }

  updateChains(dt, feetY, g) {
    this.root.updateMatrixWorld(true);
    const yaw = this.state.yaw, c = Math.cos(yaw), sn = Math.sin(yaw);
    const right = V(sn, 0, c); // the explorer's right side, in the world
    // The scarf tails hang from the back of the neck and drape over the coat, not through it.
    const collide = q => {
      const h = q.y - feetY, r = bodyRadius(h); if (r <= 0) return;
      const wx = q.x - this.root.position.x, wz = q.z - this.root.position.z;
      const lx = wx * c - wz * sn, lz = wx * sn + wz * c; // world → body frame (inverse yaw)
      const rx = (r + 0.022) * (h > 0.73 ? SKULL.sx : COAT_X), rz = r + 0.022;
      // Pushed out along the body's front–back axis only (a radial push would slide the tails
      // around to the flanks, over the arms, a little every frame), and always to the back: the
      // tails hang from the back of the neck, so when the body turns through them they stay behind.
      const w2 = 1 - (lz / rz) ** 2; if (w2 <= 0) return;
      const bx = rx * Math.sqrt(w2); if (lx <= -bx || lx >= bx) return;
      const nx = -bx, x = this.root.position.x + nx * c + lz * sn;
      q.px += x - q.x; q.x = x; q.z = this.root.position.z - nx * sn + lz * c;
    };
    for (const t of this.tails) {
      const anchor = this.body.localToWorld(t.anchor.clone());
      // Light damping: heavier damping acts like a strong wind and streams the tails out flat
      // at walking speed.
      this.chain(t.c, anchor, dt, g, 0.02, false, collide);
      const P = t.pos, pts = t.c.pts, n = t.c.n;
      let o = 0;
      for (let i = 0; i <= n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], q = pts[i], w = 0.026 + 0.036 * (i / n) ** 0.8; // narrow at the knot, wider toward the frayed tip
        // Width: across the tail in the picture plane, turned a little with the body so the
        // ribbon keeps its breadth on screen.
        const ddx = b.x - a.x, ddy = b.y - a.y, l = Math.hypot(ddx, ddy) || 1;
        const wx = -ddy / l * 0.8 + right.x * 0.6, wy = ddx / l * 0.8, wz = right.z * 0.6, wl = Math.hypot(wx, wy, wz);
        P[o++] = q.x + wx / wl * w; P[o++] = q.y + wy / wl * w; P[o++] = q.z + wz / wl * w;
        P[o++] = q.x - wx / wl * w; P[o++] = q.y - wy / wl * w; P[o++] = q.z - wz / wl * w;
      }
      t.geo.attributes.position.needsUpdate = true;
      t.geo.computeVertexNormals();
    }
    // The curl on top: a short stiff chain, drawn as a bent lock that curls toward the face.
    const tip = this.head.localToWorld(hairPoint(Math.PI, Math.PI / 2, 0.06)); // rooted on top of the hair, so its droop shows
    this.chain(this.tuft, tip, dt, g, 0.12, true);
    const q = this.tuft.pts, dx = q[2].x - q[0].x, dy = q[2].y - q[0].y;
    this.tuftMesh.position.set(q[0].x, q[0].y, tip.z);
    this.tuftMesh.rotation.set(0, 0, Math.atan2(dy, dx) - Math.PI / 2);
    this.tuftMesh.scale.x = c >= 0 ? 1 : -1;
  }

  chain(ch, root, dt, g, damping, stiff = false, collide = null) {
    // A jump of the anchor (R back to firm footing, a reset) restarts the chain hanging from it;
    // otherwise the links would stretch across the screen for several frames.
    if (ch.pts.length && Math.hypot(root.x - ch.pts[0].x, root.y - ch.pts[0].y) > 0.4) ch.pts.length = 0;
    if (!ch.pts.length) for (let i = 0; i <= ch.n; i++) ch.pts.push({ x: root.x, y: root.y - ch.len * i, z: root.z, px: root.x, py: root.y - ch.len * i });
    const ps = ch.pts; ps[0].x = root.x; ps[0].y = root.y; ps[0].z = root.z;
    const h = Math.min(dt, 1 / 30), d = 1 - damping;
    for (let i = 1; i < ps.length; i++) {
      const q = ps[i];
      this.field.at(q.x, q.y, this._a);
      const nx = q.x + (q.x - q.px) * d + this._a.x * h * h, ny = q.y + (q.y - q.py) * d + this._a.y * h * h;
      q.px = q.x; q.py = q.y; q.x = nx; q.y = ny; // depth follows only the links and the body
    }
    for (let k = 0; k < 4; k++) {
      for (let i = 0; i < ps.length - 1; i++) {
        const a = ps[i], b = ps[i + 1], dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, l = Math.hypot(dx, dy, dz) || 1e-6, df = (l - ch.len) / l;
        if (i === 0) { b.x -= dx * df; b.y -= dy * df; b.z -= dz * df; } else { a.x += dx * df / 2; a.y += dy * df / 2; a.z += dz * df / 2; b.x -= dx * df / 2; b.y -= dy * df / 2; b.z -= dz * df / 2; }
      }
      if (collide) for (let i = 1; i < ps.length; i++) collide(ps[i]);
    }
    if (stiff) { // hair keeps some shape: pull the tip toward the head's up axis
      const up = this.head.localToWorld(V(CURL.lean, 0.34, 0)), t = ps[ps.length - 1];
      t.x += (up.x - t.x) * CURL.k; t.y += (up.y - t.y) * CURL.k;
    }
  }
}

/** Small cues around the explorer: dust where the feet skid or land, a startle mark when
 *  entering a region, drops of effort. The drops are free points in the same field, so in the
 *  cascade's region they fall upward like everything else. Representation only. */
class ExplorerFX {
  constructor(field) {
    this.field = field; this.group = new THREE.Group(); this._a = { x: 0, y: 0 };
    const tex = (() => {
      if (typeof document === 'undefined') return null;
      const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(cv); return t;
    })();
    // Marks and drops: a cream capsule with a dark ink edge, so they read over rock and sky.
    const markTex = (() => {
      if (typeof document === 'undefined') return null;
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 64; const g = cv.getContext('2d');
      g.fillStyle = '#2a160e'; g.beginPath(); g.roundRect(4, 4, 24, 56, 12); g.fill();
      g.fillStyle = '#fff6d8'; g.beginPath(); g.roundRect(9, 9, 14, 46, 7); g.fill();
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    this.tex = { soft: tex, mark: markTex };
    const geo = new THREE.PlaneGeometry(1, 1);
    this.pool = Array.from({ length: 28 }, () => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
      m.visible = false; m.renderOrder = 6; this.group.add(m);
      return { m, life: 0, age: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, s0: 0, s1: 0, a0: 0, kind: '', field: false, rot: 0, stretch: 1 };
    });
  }
  spawn(o) {
    const q = this.pool.find(q => q.life <= 0) || this.pool.reduce((a, b) => (a.age / a.life > b.age / b.life ? a : b));
    Object.assign(q, { age: 0, rot: 0, stretch: 1, field: false, z: 0.25, tex: 'soft' }, o);
    q.m.visible = true; q.m.material.color.set(o.color); q.m.material.map = this.tex[q.tex]; q.m.material.needsUpdate = true; return q;
  }
  dust(x, y, n, v) {
    for (let i = 0; i < n; i++) {
      const a = (i / Math.max(1, n - 1) - 0.5) * 2.4;
      this.spawn({ kind: 'dust', x: x + Math.sin(a) * 0.08, y: y + 0.03, vx: Math.sin(a) * v, vy: 0.15 + Math.cos(a) * v * 0.3, life: 0.6, s0: 0.07, s1: 0.24, a0: 0.55, color: '#dcc6a2' });
    }
  }
  startle(at) {
    for (const a of [-0.8, -0.27, 0.27, 0.8]) this.spawn({ kind: 'mark', tex: 'mark', x: at.x + Math.sin(a) * 0.14, y: at.y + Math.cos(a) * 0.14, z: at.z + 0.1, vx: Math.sin(a) * 0.6, vy: Math.cos(a) * 0.6, life: 0.6, s0: 0.07, s1: 0.08, a0: 1, color: '#ffffff', rot: -a, stretch: 2.6 });
  }
  drop(at) {
    this.spawn({ kind: 'drop', tex: 'mark', x: at.x, y: at.y, z: at.z, vx: (Math.random() - 0.5) * 0.8, vy: 0.9, life: 0.8, s0: 0.06, s1: 0.05, a0: 1, color: '#ffffff', field: true, stretch: 1.4 });
  }
  update(dt) {
    for (const q of this.pool) {
      if (q.life <= 0) continue;
      q.age += dt; if (q.age >= q.life) { q.life = 0; q.m.visible = false; continue; }
      if (q.field) { this.field.at(q.x, q.y, this._a); q.vx += this._a.x * dt; q.vy += this._a.y * dt; } else { q.vx *= Math.exp(-dt * 4); q.vy *= Math.exp(-dt * 4); }
      q.x += q.vx * dt; q.y += q.vy * dt;
      const t = q.age / q.life, sc = q.s0 + (q.s1 - q.s0) * t;
      q.m.position.set(q.x, q.y, q.z); q.m.rotation.z = q.rot; q.m.scale.set(sc, sc * q.stretch, 1);
      q.m.material.opacity = q.a0 * (q.kind === 'mark' ? 1 - t * t : 1 - t);
    }
  }
}
